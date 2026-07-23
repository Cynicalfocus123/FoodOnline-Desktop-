<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserAddress;
use App\Models\UserApiToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Tests\TestCase;

class ManagedUserAddressRolesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ThrottleRequests::class);
    }

    public function test_each_public_account_type_can_create_update_default_and_delete_its_own_addresses(): void
    {
        foreach (['customer', 'supplier', 'partner'] as $role) {
            [$user, $token] = $this->publicToken($role);
            $first = (int) $this->withToken($token)->postJson('/api/v1/account/addresses', $this->addressPayload('thailand', true, $role))
                ->assertCreated()
                ->json('address.id');
            $second = (int) $this->withToken($token)->postJson('/api/v1/account/addresses', $this->addressPayload('singapore', false, $role))
                ->assertCreated()
                ->assertJsonPath('address.is_default', false)
                ->json('address.id');

            $this->withToken($token)->putJson('/api/v1/account/addresses/'.$second, $this->addressPayload('usa', false, $role.' Updated'))
                ->assertOk()
                ->assertJsonPath('address.country_key', 'usa')
                ->assertJsonPath('address.address_values.deliveryNote', $role.' updated delivery note');
            $this->withToken($token)->putJson('/api/v1/account/addresses/'.$second.'/default')
                ->assertOk()
                ->assertJsonPath('address.is_default', true);

            $this->assertSame(1, UserAddress::query()->where('user_id', $user->id)->where('is_default', true)->count(), $role.' must have one default address.');
            $this->assertDatabaseHas('user_addresses', ['id' => $first, 'user_id' => $user->id, 'is_default' => false]);
            $this->withToken($token)->getJson('/api/v1/account/addresses')
                ->assertOk()
                ->assertJsonCount(2, 'addresses')
                ->assertJsonPath('addresses.0.id', $second);
            $this->withToken($token)->deleteJson('/api/v1/account/addresses/'.$first)->assertOk();
            $this->assertDatabaseMissing('user_addresses', ['id' => $first]);
        }
    }

    public function test_public_accounts_cannot_read_or_mutate_another_accounts_addresses(): void
    {
        [$customer, $customerToken] = $this->publicToken('customer');
        [$supplier, $supplierToken] = $this->publicToken('supplier');
        [$partner, $partnerToken] = $this->publicToken('partner');
        $customerAddress = (int) $this->withToken($customerToken)->postJson('/api/v1/account/addresses', $this->addressPayload('usa', true, 'Customer'))
            ->assertCreated()
            ->json('address.id');
        $supplierAddress = (int) $this->withToken($supplierToken)->postJson('/api/v1/account/addresses', $this->addressPayload('thailand', true, 'Supplier'))
            ->assertCreated()
            ->json('address.id');
        $partnerAddress = (int) $this->withToken($partnerToken)->postJson('/api/v1/account/addresses', $this->addressPayload('singapore', true, 'Partner'))
            ->assertCreated()
            ->json('address.id');

        $this->withToken($supplierToken)->putJson('/api/v1/account/addresses/'.$customerAddress, $this->addressPayload())->assertNotFound();
        $this->withToken($partnerToken)->deleteJson('/api/v1/account/addresses/'.$customerAddress)->assertNotFound();
        $this->withToken($customerToken)->putJson('/api/v1/account/addresses/'.$supplierAddress.'/default')->assertNotFound();
        $this->withToken($customerToken)->getJson('/api/v1/account/addresses')
            ->assertOk()
            ->assertJsonCount(1, 'addresses')
            ->assertJsonPath('addresses.0.id', $customerAddress);
        $this->withToken($supplierToken)->getJson('/api/v1/account/addresses')
            ->assertOk()
            ->assertJsonPath('addresses.0.id', $supplierAddress);
        $this->withToken($partnerToken)->getJson('/api/v1/account/addresses')
            ->assertOk()
            ->assertJsonPath('addresses.0.id', $partnerAddress);

        $this->assertSame($customer->id, UserAddress::query()->findOrFail($customerAddress)->user_id);
    }

    public function test_admin_detail_returns_only_the_selected_customer_supplier_or_partner_addresses(): void
    {
        [$customer, $customerToken] = $this->publicToken('customer');
        [$supplier, $supplierToken] = $this->publicToken('supplier');
        [$partner, $partnerToken] = $this->publicToken('partner');
        $customerAddress = (int) $this->withToken($customerToken)->postJson('/api/v1/account/addresses', $this->addressPayload('usa', true, 'Customer'))->assertCreated()->json('address.id');
        $supplierAddress = (int) $this->withToken($supplierToken)->postJson('/api/v1/account/addresses', $this->addressPayload('thailand', true, 'Supplier'))->assertCreated()->json('address.id');
        $partnerAddress = (int) $this->withToken($partnerToken)->postJson('/api/v1/account/addresses', $this->addressPayload('singapore', true, 'Partner'))->assertCreated()->json('address.id');
        $adminToken = $this->adminToken();

        foreach ([
            [$customer, 'customer', $customerAddress, [$supplierAddress, $partnerAddress]],
            [$supplier, 'supplier', $supplierAddress, [$customerAddress, $partnerAddress]],
            [$partner, 'partner', $partnerAddress, [$customerAddress, $supplierAddress]],
        ] as [$user, $role, $addressId, $forbiddenIds]) {
            $response = $this->withToken($adminToken)->getJson('/api/v1/admin/users/'.$user->id)
                ->assertOk()
                ->assertJsonPath('user.id', (string) $user->id)
                ->assertJsonPath('user.account_type', $role)
                ->assertJsonCount(1, 'user.addresses')
                ->assertJsonPath('user.addresses.0.id', $addressId)
                ->assertJsonPath('user.addresses.0.user_id', (string) $user->id)
                ->assertJsonPath('user.addresses.0.address_values.deliveryNote', $role.' delivery note');

            foreach ($forbiddenIds as $forbiddenId) {
                $this->assertNotContains($forbiddenId, array_column($response->json('user.addresses'), 'id'));
            }
        }

        $this->withToken($customerToken)->getJson('/api/v1/admin/users/'.$supplier->id)->assertUnauthorized();
        $this->withToken($adminToken)->getJson('/api/v1/account/addresses')->assertUnauthorized();
    }

    /** @return array{0: User, 1: string} */
    private function publicToken(string $role): array
    {
        $user = User::factory()->create([
            'email' => $role.'-address-'.bin2hex(random_bytes(5)).'@example.test',
            'role' => $role,
            'status' => 'active',
        ]);
        $token = 'address-role-'.bin2hex(random_bytes(18));
        UserApiToken::query()->create([
            'user_id' => $user->id,
            'name' => 'managed-user-address-role-test',
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHour(),
        ]);

        return [$user, $token];
    }

    /** @return array<string, mixed> */
    private function addressPayload(string $country = 'thailand', bool $default = true, string $name = 'Address Owner'): array
    {
        return [
            'country_key' => $country,
            'address_values' => [
                'fullName' => $name,
                'phoneNumber' => '+1 555 123 4567',
                'streetAddress' => '10 Market Street',
                'province' => 'Bangkok',
                'postalCode' => '10110',
                'deliveryNote' => strtolower($name).' delivery note',
            ],
            'summary' => $name.' address',
            'is_default' => $default,
        ];
    }

    private function adminToken(): string
    {
        $admin = User::factory()->admin()->create([
            'email' => 'managed-address-admin-'.bin2hex(random_bytes(5)).'@example.test',
            'password' => 'Adminpass123',
        ]);

        return (string) $this->postJson('/api/v1/admin/login', [
            'email' => $admin->email,
            'password' => 'Adminpass123',
        ])->assertOk()->json('token');
    }
}
