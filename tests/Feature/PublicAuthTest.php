<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserApiToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PublicAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // These contract tests intentionally exercise registration repeatedly.
        // Rate-limit behavior is covered separately from validation/session behavior.
        $this->withoutMiddleware(ThrottleRequests::class);
    }

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

    public function test_customer_supplier_and_partner_registration_each_return_a_restorable_session(): void
    {
        Mail::fake();

        foreach (['customer', 'supplier', 'partner'] as $role) {
            $payload = $this->registrationPayload();
            $payload['account_type'] = $role;
            $payload['email'] = $role.'@registration.example.test';
            $payload['company_name'] = null;
            $payload['line_id'] = null;

            $response = $this->postJson('/api/v1/auth/register', $payload)
                ->assertCreated()
                ->assertJsonMissingPath('data')
                ->assertJsonPath('user.account_type', $role)
                ->assertJsonStructure(['token', 'user' => ['id', 'email', 'account_type', 'status']]);

            $token = (string) $response->json('token');
            $this->assertNotSame('', $token);
            $this->withToken($token)
                ->getJson('/api/v1/auth/me')
                ->assertOk()
                ->assertJsonPath('user.email', $payload['email'])
                ->assertJsonPath('user.account_type', $role);
        }
    }

    public function test_registration_and_login_use_the_same_root_token_user_envelope(): void
    {
        Mail::fake();
        $payload = $this->registrationPayload();
        $registration = $this->postJson('/api/v1/auth/register', $payload)->assertCreated();
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $payload['email'],
            'password' => $payload['password'],
        ])->assertOk();

        $this->assertSame(['message', 'token_type', 'token', 'user'], array_keys($registration->json()));
        $this->assertSame(['message', 'token_type', 'token', 'user'], array_keys($login->json()));
        $this->assertSame(array_keys($registration->json('user')), array_keys($login->json('user')));
    }

    public function test_duplicate_invalid_role_and_weak_password_are_validation_errors_without_duplicates(): void
    {
        Mail::fake();
        $payload = $this->registrationPayload();
        $this->postJson('/api/v1/auth/register', $payload)->assertCreated();
        $this->postJson('/api/v1/auth/register', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
        $this->assertSame(1, User::query()->where('email', $payload['email'])->count());

        $invalidRole = $this->registrationPayload();
        $invalidRole['email'] = 'invalid-role@example.test';
        $invalidRole['account_type'] = 'admin';
        $this->postJson('/api/v1/auth/register', $invalidRole)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('role');

        $weakPassword = $this->registrationPayload();
        $weakPassword['email'] = 'weak-password@example.test';
        $weakPassword['password'] = 'passwordonly';
        $this->postJson('/api/v1/auth/register', $weakPassword)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    public function test_pending_referral_migration_does_not_block_core_registration_or_invite_errors(): void
    {
        Mail::fake();
        foreach (['referral_rewards', 'referrals', 'referral_codes', 'referral_programs'] as $table) {
            Schema::dropIfExists($table);
        }

        $payload = $this->registrationPayload();
        $payload['account_type'] = 'customer';
        $payload['email'] = 'migration-pending@example.test';
        $payload['company_name'] = null;
        $payload['line_id'] = null;
        unset($payload['referral_code']);

        $registration = $this->postJson('/api/v1/auth/register', $payload)
            ->assertCreated()
            ->assertJsonPath('user.account_type', 'customer');
        $this->withToken((string) $registration->json('token'))
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'migration-pending@example.test');
        $this->getJson('/api/v1/referrals/invite/FOLAAAAAA')->assertNotFound();
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
