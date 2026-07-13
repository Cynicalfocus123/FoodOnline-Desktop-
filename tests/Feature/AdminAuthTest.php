<?php

namespace Tests\Feature;

use App\Models\AdminApiToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_is_separate_and_protects_admin_routes(): void
    {
        $admin = User::factory()->admin()->create([
            'email' => 'admin@example.com',
            'password' => 'Adminpass123',
        ]);
        User::factory()->create(['role' => 'customer']);

        $this->getJson('/api/v1/admin/dashboard')->assertUnauthorized();

        $login = $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'Adminpass123',
        ])->assertOk()->assertJsonPath('admin.id', $admin->id);

        $token = (string) $login->json('token');
        $this->assertNotNull(AdminApiToken::query()->firstOrFail()->expires_at);

        $this->withToken($token)
            ->getJson('/api/v1/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('stats.customers', 1);

        $this->withToken($token)
            ->getJson('/api/v1/admin/users?account_type=customer')
            ->assertOk()
            ->assertJsonCount(1, 'users');

        $this->withToken($token)->postJson('/api/v1/admin/logout')->assertOk();
        $this->assertNotNull(AdminApiToken::query()->firstOrFail()->revoked_at);
        $this->withToken($token)->getJson('/api/v1/admin/me')->assertUnauthorized();
    }

    public function test_public_credentials_cannot_open_admin_routes(): void
    {
        User::factory()->create([
            'email' => 'customer@example.com',
            'password' => 'Strongpass123',
            'role' => 'customer',
        ]);

        $this->postJson('/api/v1/admin/login', [
            'email' => 'customer@example.com',
            'password' => 'Strongpass123',
        ])->assertUnauthorized()->assertJsonPath('message', 'Invalid admin credentials.');
    }
}
