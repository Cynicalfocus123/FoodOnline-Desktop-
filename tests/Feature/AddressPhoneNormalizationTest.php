<?php

namespace Tests\Feature;

use App\Models\AdminApiToken;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\UserApiToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AddressPhoneNormalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_each_supported_account_role_saves_one_normalized_international_phone(): void
    {
        foreach (['customer', 'supplier', 'partner'] as $role) {
            [, $token] = $this->userToken($role);
            $response = $this->withToken($token)->postJson('/api/v1/account/addresses', $this->addressPayload('+66 81 392 5429'));

            $response->assertCreated()->assertJsonPath('address.address_values.phoneNumber', '+66813925429');
        }
    }

    public function test_address_update_normalizes_format_without_changing_country_specific_fields_or_default_state(): void
    {
        [$user, $token] = $this->userToken('customer');
        $created = $this->withToken($token)->postJson('/api/v1/account/addresses', $this->addressPayload('+65 8123 4567'))->assertCreated();
        $addressId = (int) $created->json('address.id');

        $this->withToken($token)->putJson('/api/v1/account/addresses/'.$addressId, $this->addressPayload('+66 81 392 5429'))
            ->assertOk()
            ->assertJsonPath('address.address_values.phoneNumber', '+66813925429')
            ->assertJsonPath('address.address_values.province', 'Bangkok')
            ->assertJsonPath('address.is_default', true);

        $this->assertDatabaseHas('user_addresses', ['id' => $addressId, 'user_id' => $user->id, 'is_default' => true]);
    }

    public function test_legacy_local_phone_remains_readable_and_other_users_cannot_change_an_address(): void
    {
        [$owner, $ownerToken] = $this->userToken('customer');
        [, $otherToken] = $this->userToken('supplier');
        $address = UserAddress::query()->create([
            'user_id' => $owner->id,
            'country_key' => 'thailand',
            'address_values' => ['fullName' => 'Legacy Customer', 'phoneNumber' => '0813925429', 'province' => 'Bangkok'],
            'summary' => 'Legacy address',
            'is_default' => true,
        ]);

        $this->withToken($ownerToken)->getJson('/api/v1/account/addresses')
            ->assertOk()
            ->assertJsonPath('addresses.0.address_values.phoneNumber', '0813925429');
        $this->withToken($otherToken)->putJson('/api/v1/account/addresses/'.$address->id, $this->addressPayload('+66813925429'))
            ->assertNotFound();
    }

    public function test_admin_details_return_full_normalized_phone_for_customer_supplier_and_partner(): void
    {
        $admin = User::factory()->admin()->create(['email' => 'phone-admin@example.test']);
        $plainAdminToken = 'admin-phone-'.bin2hex(random_bytes(16));
        AdminApiToken::query()->create(['user_id' => $admin->id, 'name' => 'address-phone-admin', 'token_hash' => hash('sha256', $plainAdminToken), 'expires_at' => now()->addHour()]);

        foreach (['customer', 'supplier', 'partner'] as $role) {
            [$user] = $this->userToken($role);
            UserAddress::query()->create([
                'user_id' => $user->id,
                'country_key' => 'thailand',
                'address_values' => ['fullName' => ucfirst($role), 'phoneNumber' => '+66813925429', 'province' => 'Bangkok'],
                'summary' => 'Phone address',
                'is_default' => true,
            ]);

            $this->withToken($plainAdminToken)->getJson('/api/v1/admin/users/'.$user->id)
                ->assertOk()
                ->assertJsonPath('user.addresses.0.address_values.phoneNumber', '+66813925429');
        }
    }

    /** @return array{0: User, 1: string} */
    private function userToken(string $role): array
    {
        $user = User::factory()->create(['role' => $role, 'status' => 'active']);
        $plainToken = 'address-phone-'.bin2hex(random_bytes(16));
        UserApiToken::query()->create(['user_id' => $user->id, 'name' => 'address-phone-tests', 'token_hash' => hash('sha256', $plainToken), 'expires_at' => now()->addHour()]);

        return [$user, $plainToken];
    }

    /** @return array<string, mixed> */
    private function addressPayload(string $phone): array
    {
        return [
            'country_key' => 'thailand',
            'address_values' => ['fullName' => 'Phone Customer', 'phoneNumber' => $phone, 'houseBuilding' => '10', 'province' => 'Bangkok', 'subdistrict' => 'Central', 'postalCode' => '10100'],
            'summary' => 'Phone address',
            'is_default' => true,
        ];
    }
}
