<?php

namespace Tests\Feature;

use App\Models\AdminApiToken;
use App\Models\AdminAuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('api:ip:127.0.0.1');
        for ($id = 1; $id <= 10; $id++) RateLimiter::clear('api:user:'.$id);
    }

    protected function tearDown(): void
    {
        RateLimiter::clear('api:ip:127.0.0.1');
        for ($id = 1; $id <= 10; $id++) RateLimiter::clear('api:user:'.$id);
        parent::tearDown();
    }

    public function test_super_admin_can_create_staff_and_login_returns_effective_permissions(): void
    {
        [$super, $token] = $this->adminToken(['email' => 'super@example.test']);

        $created = $this->withToken($token)->postJson('/api/v1/admin/staff', [
            'name' => 'Category Editor',
            'email' => 'category@example.test',
            'password' => 'CategoryPass123',
            'password_confirmation' => 'CategoryPass123',
            'staff_role' => 'read_only',
            'status' => 'active',
            'staff_permissions' => ['categories.view', 'categories.manage'],
        ])->assertCreated()
            ->assertJsonPath('staff.staff_role', 'read_only')
            ->assertJsonPath('staff.permissions.0', 'categories.view');

        $adminId = (int) $created->json('staff.id');
        $this->assertDatabaseHas('admin_audit_logs', ['action' => 'staff.created', 'subject_id' => $adminId]);

        $this->postJson('/api/v1/admin/login', ['email' => 'category@example.test', 'password' => 'CategoryPass123'])
            ->assertOk()
            ->assertJsonPath('admin.staff_role', 'read_only')
            ->assertJsonPath('admin.permissions.0', 'categories.view')
            ->assertJsonMissingPath('admin.password');

        $staff = User::query()->findOrFail($adminId);
        $staffToken = $this->tokenFor($staff);
        $this->withToken($staffToken)->getJson('/api/v1/admin/me')
            ->assertOk()
            ->assertJsonPath('admin.permissions.1', 'categories.manage');

        $this->assertTrue(Hash::check('CategoryPass123', $staff->password));
        $this->assertNotSame('CategoryPass123', $staff->password);
    }

    public function test_category_only_admin_can_manage_categories_and_category_media_but_not_other_modules(): void
    {
        [$admin, $token] = $this->adminToken([
            'staff_role' => 'read_only',
            'staff_permissions' => ['categories.view', 'categories.manage'],
        ]);

        $this->withToken($token)->getJson('/api/v1/admin/categories')->assertOk();
        $created = $this->withToken($token)->postJson('/api/v1/admin/categories', [
            'name' => 'Category-only test', 'slug' => 'category-only-test',
        ])->assertCreated();
        $id = (int) $created->json('data.id');
        $this->withToken($token)->patchJson('/api/v1/admin/categories/'.$id, ['name' => 'Category-only updated'])->assertOk();

        $this->withToken($token)->getJson('/api/v1/admin/media-storage/status')->assertOk();
        $this->withToken($token)->postJson('/api/v1/admin/media-uploads', [
            'purpose' => 'category_image', 'target_uuid' => $created->json('data.uuid'),
            'original_filename' => 'category.png', 'mime_type' => 'image/png', 'size_bytes' => 100,
        ])->assertCreated();
        $this->withToken($token)->postJson('/api/v1/admin/media-uploads', [
            'purpose' => 'product_image', 'target_uuid' => $created->json('data.uuid'),
            'original_filename' => 'product.png', 'mime_type' => 'image/png', 'size_bytes' => 100,
        ])->assertForbidden();

        foreach ([
            'dashboard', 'brands', 'products', 'orders', 'inventory', 'promo-codes', 'users?account_type=customer',
            'delete-account-requests', 'audit-logs', 'referrals', 'returns', 'reviews', 'support-tickets',
            'reports/summary', 'staff', 'operations', 'commerce-settings',
        ] as $path) {
            $this->withToken($token)->getJson('/api/v1/admin/'.$path)->assertForbidden();
        }

        $this->assertSame('active', $admin->fresh()->status);
    }

    public function test_manage_grants_include_required_read_access_for_feature_admins(): void
    {
        [, $token] = $this->adminToken([
            'staff_role' => 'custom',
            'staff_permissions' => ['categories.manage', 'products.manage'],
        ]);

        $this->withToken($token)->getJson('/api/v1/admin/categories')->assertOk();
        $this->withToken($token)->getJson('/api/v1/admin/products')->assertOk();
    }

    public function test_non_super_admin_cannot_manage_staff_or_escalate_permissions(): void
    {
        [$restricted, $restrictedToken] = $this->adminToken([
            'staff_role' => 'read_only', 'staff_permissions' => ['categories.view'],
        ]);
        $target = User::factory()->admin()->create(['email' => 'target@example.test', 'staff_role' => 'read_only', 'staff_permissions' => ['categories.view']]);

        $this->withToken($restrictedToken)->postJson('/api/v1/admin/staff', [
            'name' => 'Blocked', 'email' => 'blocked@example.test', 'password' => 'BlockedPass123',
            'password_confirmation' => 'BlockedPass123', 'staff_role' => 'super_admin', 'status' => 'active',
        ])->assertForbidden();
        $this->withToken($restrictedToken)->patchJson('/api/v1/admin/staff/'.$target->id, [
            'staff_role' => 'super_admin', 'staff_permissions' => ['dashboard.view'],
        ])->assertForbidden();
        $this->withToken($restrictedToken)->getJson('/api/v1/admin/staff')->assertForbidden();
        $this->withToken($restrictedToken)->getJson('/api/v1/admin/staff/sessions')->assertForbidden();
        $this->assertSame(['categories.view'], $target->fresh()->staff_permissions);
        $this->assertNotSame($restricted->id, $target->id);
    }

    public function test_disabling_admin_revokes_tokens_and_disabled_admin_cannot_login(): void
    {
        [$super, $superToken] = $this->adminToken(['email' => 'super-disable@example.test']);
        $target = User::factory()->admin()->create([
            'email' => 'disable-me@example.test', 'password' => 'DisablePass123',
            'staff_role' => 'read_only', 'staff_permissions' => ['categories.view'],
        ]);
        $targetToken = $this->tokenFor($target);

        $this->withToken($superToken)->patchJson('/api/v1/admin/staff/'.$target->id, ['status' => 'disabled'])->assertOk();
        $this->assertNotNull(AdminApiToken::query()->where('token_hash', hash('sha256', $targetToken))->firstOrFail()->revoked_at);
        $this->withToken($targetToken)->getJson('/api/v1/admin/me')->assertUnauthorized();
        $this->postJson('/api/v1/admin/login', ['email' => $target->email, 'password' => 'DisablePass123'])->assertUnauthorized();
        $this->assertDatabaseHas('admin_audit_logs', ['action' => 'staff.status_changed', 'subject_id' => $target->id]);
        $this->assertSame($super->id, User::query()->where('email', 'super-disable@example.test')->value('id'));
    }

    public function test_final_active_super_admin_cannot_be_demoted_or_disabled(): void
    {
        [$super, $token] = $this->adminToken(['staff_role' => 'super_admin']);

        $this->withToken($token)->patchJson('/api/v1/admin/staff/'.$super->id, ['staff_role' => 'read_only'])->assertStatus(422);
        $this->withToken($token)->patchJson('/api/v1/admin/staff/'.$super->id, ['status' => 'disabled'])->assertStatus(422);
        $this->assertSame('active', $super->fresh()->status);
        $this->assertSame('super_admin', $super->fresh()->staff_role);
    }

    /** @param array<string, mixed> $attributes @return array{0: User, 1: string} */
    private function adminToken(array $attributes = []): array
    {
        $admin = User::factory()->admin()->create($attributes);
        return [$admin, $this->tokenFor($admin)];
    }

    private function tokenFor(User $admin): string
    {
        $plain = 'admin-test-'.bin2hex(random_bytes(12));
        AdminApiToken::query()->create([
            'user_id' => $admin->id, 'name' => 'test-session',
            'token_hash' => hash('sha256', $plain), 'expires_at' => now()->addHour(),
        ]);
        return $plain;
    }
}
