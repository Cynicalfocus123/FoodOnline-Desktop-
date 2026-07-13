<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserApiToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PublicAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_preserves_the_frontend_contract_and_creates_a_session(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/v1/auth/register', $this->registrationPayload());

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Registration completed successfully.')
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonPath('user.account_type', 'supplier')
            ->assertJsonStructure(['token', 'user' => ['id', 'email', 'account_type', 'status']]);

        $user = User::query()->where('email', 'supplier@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('Strongpass123', (string) $user->password));
        $this->assertNotSame('Strongpass123', $user->password);
        $this->assertDatabaseHas('user_api_tokens', ['user_id' => $user->id, 'revoked_at' => null]);
        $this->assertNotNull(UserApiToken::query()->firstOrFail()->expires_at);
    }

    public function test_login_me_and_logout_keep_the_existing_bearer_token_flow(): void
    {
        $user = User::factory()->create([
            'email' => 'customer@example.com',
            'password' => 'Strongpass123',
            'role' => 'customer',
            'status' => 'active',
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'customer@example.com',
            'password' => 'Strongpass123',
        ])->assertOk()->assertJsonPath('user.id', $user->id);

        $token = (string) $login->json('token');

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'customer@example.com');

        $this->withToken($token)
            ->postJson('/api/v1/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out.');

        $this->assertNotNull(UserApiToken::query()->firstOrFail()->revoked_at);
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_registration_requires_a_password(): void
    {
        $payload = $this->registrationPayload();
        unset($payload['password']);

        $this->postJson('/api/v1/auth/register', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    /** @return array<string, string|null> */
    private function registrationPayload(): array
    {
        return [
            'account_type' => 'supplier',
            'email' => 'supplier@example.com',
            'first_name' => 'Alex',
            'last_name' => 'Tan',
            'contact_number' => '+66 81 555 1234',
            'line_id' => 'alex.tan',
            'company_name' => 'FoodOnlines Supply Co',
            'password' => 'Strongpass123',
            'registered_from' => 'main_public_frontend',
        ];
    }
}
