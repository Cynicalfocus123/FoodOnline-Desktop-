<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AdminManagedUserCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ThrottleRequests::class);
    }

    public function test_admin_can_create_edit_and_archive_managed_users_without_deleting_history(): void
    {
        User::factory()->admin()->create([
            'email' => 'admin@example.com',
            'password' => 'Adminpass123',
        ]);
        $token = (string) $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'Adminpass123',
        ])->assertOk()->json('token');

        $created = $this->withToken($token)->postJson('/api/v1/admin/users', [
            'account_type' => 'supplier',
            'email' => 'supplier@example.com',
            'first_name' => 'Suda',
            'last_name' => 'Foods',
            'line_id' => 'suda.foods',
            'company_name' => 'Suda Foods',
            'status' => 'active',
            'password' => 'Strongpass123',
        ])->assertCreated()
            ->assertJsonPath('user.account_type', 'supplier')
            ->assertJsonPath('user.line_id', 'suda.foods')
            ->assertJsonPath('user.company_name', 'Suda Foods');

        $id = (string) $created->json('user.id');
        $this->withToken($token)->getJson('/api/v1/admin/users/'.$id)
            ->assertOk()
            ->assertJsonPath('user.email', 'supplier@example.com');

        $this->withToken($token)->getJson('/api/v1/admin/users?account_type=supplier')
            ->assertOk()
            ->assertJsonPath('users.0.line_id', 'suda.foods');

        $this->withToken($token)->patchJson('/api/v1/admin/users/'.$id, [
            'company_name' => 'Suda Global Foods',
            'status' => 'in_review',
        ])->assertOk()
            ->assertJsonPath('user.company_name', 'Suda Global Foods')
            ->assertJsonPath('user.status', 'in_review');

        $this->withToken($token)->deleteJson('/api/v1/admin/users/'.$id)
            ->assertOk()
            ->assertJsonPath('user.status', 'disabled');

        $this->assertDatabaseHas('users', ['id' => $id, 'status' => 'disabled']);
    }

    public function test_admin_user_crud_rejects_admin_accounts_and_duplicate_email(): void
    {
        $admin = User::factory()->admin()->create([
            'email' => 'admin@example.com',
            'password' => 'Adminpass123',
        ]);
        $token = (string) $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'Adminpass123',
        ])->assertOk()->json('token');

        $this->withToken($token)->getJson('/api/v1/admin/users/'.$admin->id)->assertNotFound();
        $this->withToken($token)->postJson('/api/v1/admin/users', [
            'account_type' => 'customer',
            'email' => 'admin@example.com',
            'password' => 'Strongpass123',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_customer_supplier_and_partner_detail_keep_the_complete_managed_user_contract(): void
    {
        $token = $this->adminToken();

        foreach (['customer', 'supplier', 'partner'] as $role) {
            $user = User::factory()->create([
                'role' => $role,
                'email' => $role.'-detail@example.test',
                'first_name' => ucfirst($role),
                'last_name' => 'Account',
                'phone' => '+66 81 555 1000',
                'line_id' => $role.'.line',
                'company_name' => ucfirst($role).' Company',
                'registered_from' => 'main_public_frontend',
                'status' => 'active',
            ]);

            $this->withToken($token)
                ->getJson('/api/v1/admin/users/'.$user->id)
                ->assertOk()
                ->assertJsonPath('user.id', (string) $user->id)
                ->assertJsonPath('user.account_type', $role)
                ->assertJsonPath('user.email', $user->email)
                ->assertJsonPath('user.first_name', ucfirst($role))
                ->assertJsonPath('user.last_name', 'Account')
                ->assertJsonPath('user.contact_number', '+66 81 555 1000')
                ->assertJsonPath('user.line_id', $role.'.line')
                ->assertJsonPath('user.company_name', ucfirst($role).' Company')
                ->assertJsonPath('user.registered_from', 'main_public_frontend')
                ->assertJsonPath('user.status', 'active')
                ->assertJsonStructure(['user' => ['created_at', 'updated_at']]);
        }
    }

    public function test_pending_referral_migration_does_not_replace_managed_user_detail_with_a_server_error(): void
    {
        $token = $this->adminToken();
        $customer = User::factory()->create([
            'role' => 'customer',
            'email' => 'pending-referral-admin-detail@example.test',
        ]);
        foreach (['referral_rewards', 'referrals', 'referral_codes', 'referral_programs'] as $table) {
            Schema::dropIfExists($table);
        }

        $this->withToken($token)
            ->getJson('/api/v1/admin/users/'.$customer->id)
            ->assertOk()
            ->assertJsonPath('user.id', (string) $customer->id)
            ->assertJsonPath('user.email', 'pending-referral-admin-detail@example.test')
            ->assertJsonCount(0, 'user.addresses')
            ->assertJsonCount(0, 'user.payment_methods')
            ->assertJsonMissingPath('user.referral_summary');
    }

    private function adminToken(): string
    {
        $admin = User::factory()->admin()->create([
            'email' => 'managed-user-admin-'.bin2hex(random_bytes(5)).'@example.test',
            'password' => 'Adminpass123',
        ]);

        return (string) $this->postJson('/api/v1/admin/login', [
            'email' => $admin->email,
            'password' => 'Adminpass123',
        ])->assertOk()->json('token');
    }
}
