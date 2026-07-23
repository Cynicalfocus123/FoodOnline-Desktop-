<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class OptionalRegistrationFieldsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Data-provider coverage deliberately exceeds the public per-IP limit.
        $this->withoutMiddleware(ThrottleRequests::class);
    }

    #[DataProvider('roles')]
    public function test_every_role_can_register_with_each_optional_field_combination(string $role): void
    {
        Mail::fake();
        $cases = [
            'neither' => [],
            'company' => ['company_name' => 'FoodOnlines Trading'],
            'line' => ['line_id' => 'foodonlines.trade'],
            'both' => ['company_name' => 'FoodOnlines Trading', 'line_id' => 'foodonlines.trade'],
        ];

        foreach ($cases as $case => $optional) {
            $email = "{$role}-{$case}@example.test";
            $this->postJson('/api/v1/auth/register', [...$this->payload($role, $email), ...$optional])
                ->assertCreated()
                ->assertJsonPath('user.company_name', $optional['company_name'] ?? null)
                ->assertJsonPath('user.line_id', $optional['line_id'] ?? null);

            $this->assertDatabaseHas('users', [
                'email' => $email,
                'company_name' => $optional['company_name'] ?? null,
                'line_id' => $optional['line_id'] ?? null,
            ]);
        }
    }

    #[DataProvider('roles')]
    public function test_whitespace_only_registration_values_normalize_to_null(string $role): void
    {
        Mail::fake();

        $this->postJson('/api/v1/auth/register', [...$this->payload($role, "{$role}-spaces@example.test"), 'company_name' => " \t ", 'line_id' => '   '])
            ->assertCreated()
            ->assertJsonPath('user.company_name', null)
            ->assertJsonPath('user.line_id', null);
    }

    #[DataProvider('roles')]
    public function test_optional_registration_values_still_enforce_length_and_safe_value_rules(string $role): void
    {
        Mail::fake();

        $this->postJson('/api/v1/auth/register', [...$this->payload($role, "{$role}-company-length@example.test"), 'company_name' => str_repeat('A', 121)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('company_name');

        $this->postJson('/api/v1/auth/register', [...$this->payload($role, "{$role}-line-length@example.test"), 'line_id' => str_repeat('a', 41)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('line_id');
    }

    public function test_administrator_create_and_edit_accept_optional_values_as_null(): void
    {
        $admin = User::factory()->admin()->create(['email' => 'admin@example.test', 'password' => 'Adminpass123']);
        $token = (string) $this->postJson('/api/v1/admin/login', ['email' => $admin->email, 'password' => 'Adminpass123'])->assertOk()->json('token');

        foreach (self::roles() as $role) {
            $created = $this->withToken($token)->postJson('/api/v1/admin/users', [
                'account_type' => $role[0],
                'email' => $role[0].'-admin@example.test',
                'password' => 'Strongpass123',
                'company_name' => '   ',
                'line_id' => '   ',
            ])->assertCreated()->assertJsonPath('user.company_name', null)->assertJsonPath('user.line_id', null);

            $this->withToken($token)->patchJson('/api/v1/admin/users/'.$created->json('user.id'), [
                'company_name' => '   ',
                'line_id' => '   ',
            ])->assertOk()->assertJsonPath('user.company_name', null)->assertJsonPath('user.line_id', null);
        }
    }

    /** @return array<string, array{string}> */
    public static function roles(): array
    {
        return ['customer' => ['customer'], 'supplier' => ['supplier'], 'partner' => ['partner']];
    }

    /** @return array<string, string> */
    private function payload(string $role, string $email): array
    {
        return [
            'account_type' => $role,
            'email' => $email,
            'first_name' => 'Alex',
            'last_name' => 'Tan',
            'contact_number' => '+66 81 555 1234',
            'password' => 'Strongpass123',
        ];
    }
}
