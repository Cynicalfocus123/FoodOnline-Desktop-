<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminManagedUserCrudTest extends TestCase
{
    use RefreshDatabase;

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
            'company_name' => 'Suda Foods',
            'status' => 'active',
            'password' => 'Strongpass123',
        ])->assertCreated()
            ->assertJsonPath('user.account_type', 'supplier')
            ->assertJsonPath('user.company_name', 'Suda Foods');

        $id = (string) $created->json('user.id');
        $this->withToken($token)->getJson('/api/v1/admin/users/'.$id)
            ->assertOk()
            ->assertJsonPath('user.email', 'supplier@example.com');

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
}
