<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\UserApiToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AddressAndFavoritesPersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_address_creation_returns_a_real_id_and_is_scoped_to_its_customer(): void
    {
        [$customer, $token] = $this->customerToken('address-owner@example.test');
        [, $otherToken] = $this->customerToken('address-other@example.test');

        $created = $this->withToken($token)->postJson('/api/v1/account/addresses', $this->addressPayload('usa'))
            ->assertCreated()
            ->assertJsonPath('address.country_key', 'usa')
            ->assertJsonPath('address.is_default', true);
        $addressId = (int) $created->json('address.id');

        $this->assertGreaterThan(0, $addressId);
        $this->assertDatabaseHas('user_addresses', ['id' => $addressId, 'user_id' => $customer->id, 'country_key' => 'usa']);
        $this->withToken($token)->getJson('/api/v1/account/addresses')->assertOk()->assertJsonPath('addresses.0.id', $addressId);
        $this->withToken($otherToken)->putJson('/api/v1/account/addresses/'.$addressId, $this->addressPayload())->assertNotFound();
        $this->withToken($otherToken)->deleteJson('/api/v1/account/addresses/'.$addressId)->assertNotFound();
    }

    public function test_every_frontend_address_country_key_is_accepted_and_preserves_its_country_specific_values(): void
    {
        [, $token] = $this->customerToken('all-countries@example.test');
        $countries = ['usa', 'uk', 'thailand', 'japan', 'singapore', 'taiwan', 'china', 'philippines', 'malaysia', 'indonesia', 'hongKong'];

        foreach ($countries as $index => $country) {
            $values = ['fullName' => 'Country Customer', 'phoneNumber' => '+1 555 123 4567', 'countrySpecificField' => $country.' district'];
            $this->withToken($token)->postJson('/api/v1/account/addresses', [
                'country_key' => $country,
                'address_values' => $values,
                'summary' => 'Address for '.$country,
                'is_default' => $index === 0,
            ])->assertCreated()
                ->assertJsonPath('address.country_key', $country)
                ->assertJsonPath('address.address_values.countrySpecificField', $values['countrySpecificField']);
        }

        $this->withToken($token)->getJson('/api/v1/account/addresses')->assertOk()->assertJsonCount(count($countries), 'addresses');
    }

    public function test_address_default_changes_leave_exactly_one_default_and_admin_sees_only_selected_customer_addresses(): void
    {
        [$customerA, $tokenA] = $this->customerToken('address-a@example.test');
        [$customerB, $tokenB] = $this->customerToken('address-b@example.test');
        $first = (int) $this->withToken($tokenA)->postJson('/api/v1/account/addresses', $this->addressPayload())->assertCreated()->json('address.id');
        $second = (int) $this->withToken($tokenA)->postJson('/api/v1/account/addresses', $this->addressPayload('uk', false))->assertCreated()->json('address.id');
        $this->withToken($tokenB)->postJson('/api/v1/account/addresses', $this->addressPayload('japan'))->assertCreated();

        $this->withToken($tokenA)->putJson('/api/v1/account/addresses/'.$second.'/default')->assertOk();
        $this->assertSame(1, UserAddress::query()->where('user_id', $customerA->id)->where('is_default', true)->count());
        $this->assertDatabaseHas('user_addresses', ['id' => $first, 'is_default' => false]);
        $this->assertDatabaseHas('user_addresses', ['id' => $second, 'is_default' => true]);

        User::factory()->admin()->create(['email' => 'address-admin@example.test', 'password' => 'Adminpass123']);
        $adminToken = (string) $this->postJson('/api/v1/admin/login', ['email' => 'address-admin@example.test', 'password' => 'Adminpass123'])->assertOk()->json('token');
        $this->withToken($adminToken)->getJson('/api/v1/admin/users/'.$customerA->id)
            ->assertOk()
            ->assertJsonCount(2, 'user.addresses')
            ->assertJsonPath('user.addresses.0.id', $second);
        $this->withToken($adminToken)->getJson('/api/v1/admin/users/'.$customerB->id)
            ->assertOk()
            ->assertJsonCount(1, 'user.addresses')
            ->assertJsonMissing(['id' => $second]);
    }

    public function test_favorites_are_idempotent_and_are_never_visible_to_another_customer(): void
    {
        [$customerA, $tokenA] = $this->customerToken('favorite-a@example.test');
        [, $tokenB] = $this->customerToken('favorite-b@example.test');
        $product = Product::factory()->publishedReady()->create();

        $this->withToken($tokenA)->postJson('/api/v1/account/favorites', ['product_uuid' => $product->uuid])->assertCreated();
        $this->withToken($tokenA)->postJson('/api/v1/account/favorites', ['product_uuid' => $product->uuid])->assertCreated();
        $this->assertSame(1, $customerA->favorites()->count());
        $this->withToken($tokenA)->getJson('/api/v1/account/favorites')->assertOk()->assertJsonPath('data.0.product_uuid', $product->uuid);
        $this->withToken($tokenB)->getJson('/api/v1/account/favorites')->assertOk()->assertJsonCount(0, 'data');
        $this->withToken($tokenA)->deleteJson('/api/v1/account/favorites/'.$product->uuid)->assertOk();
        $this->assertSame(0, $customerA->favorites()->count());
    }

    /** @return array{0: User, 1: string} */
    private function customerToken(string $email): array
    {
        $user = User::factory()->create(['email' => $email, 'role' => 'customer', 'status' => 'active']);
        $plain = 'address-favorite-'.bin2hex(random_bytes(18));
        UserApiToken::query()->create(['user_id' => $user->id, 'name' => 'address-favorite-tests', 'token_hash' => hash('sha256', $plain), 'expires_at' => now()->addHour()]);

        return [$user, $plain];
    }

    /** @return array<string, mixed> */
    private function addressPayload(string $country = 'thailand', bool $default = true): array
    {
        return [
            'country_key' => $country,
            'address_values' => ['fullName' => 'Jamie Customer', 'phoneNumber' => '+1 555 123 4567', 'streetAddress' => '10 Market Street'],
            'summary' => 'Test address',
            'is_default' => $default,
        ];
    }
}
