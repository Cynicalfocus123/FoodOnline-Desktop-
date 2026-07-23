<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserAddress;
use App\Models\UserApiToken;
use App\Models\UserPaymentMethod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminCustomerDetailTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ThrottleRequests::class);
    }

    public function test_registered_customer_two_account_addresses_round_trip_to_admin_detail_and_refresh(): void
    {
        Mail::fake();
        $registration = $this->postJson('/api/v1/auth/register', [
            'account_type' => 'customer',
            'email' => 'two-address-customer@example.test',
            'first_name' => 'Acceptance',
            'last_name' => 'Customer',
            'contact_number' => '+66 81 555 7788',
            'line_id' => 'acceptance.customer',
            'company_name' => null,
            'password' => 'Strongpass123',
            'registered_from' => 'automated_address_acceptance',
        ])->assertCreated();
        $customer = User::query()->where('email', 'two-address-customer@example.test')->firstOrFail();
        $customerToken = (string) $registration->json('token');

        $thailand = $this->withToken($customerToken)->postJson('/api/v1/account/addresses', [
            'country_key' => 'thailand',
            'address_values' => [
                'fullName' => 'Acceptance Customer Thailand',
                'phoneNumber' => '+66 81 234 5678',
                'houseBuilding' => '88 FoodOnlines Tower',
                'unitFloorRoom' => 'Unit 12A',
                'villageSoiRoad' => 'Soi Sukhumvit 21',
                'province' => 'Bangkok',
                'district' => 'Watthana',
                'subdistrict' => 'Khlong Toei Nuea',
                'postalCode' => '10110',
                'deliveryNote' => 'Leave with the lobby concierge',
            ],
            'summary' => '88 FoodOnlines Tower, Bangkok 10110',
            'is_default' => true,
        ])->assertCreated()->assertJsonPath('address.is_default', true);

        $usa = $this->withToken($customerToken)->postJson('/api/v1/account/addresses', [
            'country_key' => 'usa',
            'address_values' => [
                'fullName' => 'Acceptance Customer USA',
                'phoneNumber' => '+1 213 555 0142',
                'streetAddress' => '400 South Hope Street',
                'unitFloorRoom' => 'Suite 900',
                'city' => 'Los Angeles',
                'state' => 'California',
                'postalCode' => '90071',
                'deliveryNote' => 'Call from the loading entrance',
            ],
            'summary' => '400 South Hope Street, Los Angeles, CA 90071',
            'is_default' => false,
        ])->assertCreated()->assertJsonPath('address.is_default', false);

        $otherCustomer = User::factory()->create(['role' => 'customer', 'status' => 'active']);
        $otherPlainToken = 'other-address-'.bin2hex(random_bytes(18));
        UserApiToken::query()->create([
            'user_id' => $otherCustomer->id,
            'name' => 'other-address-owner',
            'token_hash' => hash('sha256', $otherPlainToken),
            'expires_at' => now()->addHour(),
        ]);
        $other = $this->withToken($otherPlainToken)->postJson('/api/v1/account/addresses', [
            'country_key' => 'japan',
            'address_values' => [
                'fullName' => 'Other Customer',
                'phoneNumber' => '+81 90 1111 2222',
                'prefecture' => 'Tokyo',
                'deliveryNote' => 'OTHER USER ADDRESS MUST NEVER RENDER',
            ],
            'summary' => 'OTHER USER ADDRESS MUST NEVER RENDER',
            'is_default' => true,
        ])->assertCreated();

        $this->assertSame(2, UserAddress::query()->where('user_id', $customer->id)->count());
        $this->assertSame(1, UserAddress::query()->where('user_id', $customer->id)->where('is_default', true)->count());
        $this->assertDatabaseHas('user_addresses', ['id' => $thailand->json('address.id'), 'user_id' => $customer->id, 'country_key' => 'thailand']);
        $this->assertDatabaseHas('user_addresses', ['id' => $usa->json('address.id'), 'user_id' => $customer->id, 'country_key' => 'usa']);

        $adminToken = $this->adminToken();
        foreach (['initial direct route', 'direct route refresh'] as $phase) {
            $detail = $this->withToken($adminToken)->getJson('/api/v1/admin/users/'.$customer->id)
                ->assertOk()
                ->assertJsonPath('user.id', (string) $customer->id)
                ->assertJsonPath('user.email', 'two-address-customer@example.test')
                ->assertJsonPath('user.first_name', 'Acceptance')
                ->assertJsonPath('user.last_name', 'Customer')
                ->assertJsonPath('user.contact_number', '+66 81 555 7788')
                ->assertJsonPath('user.line_id', 'acceptance.customer')
                ->assertJsonCount(2, 'user.addresses')
                ->assertJsonPath('user.addresses.0.id', $thailand->json('address.id'))
                ->assertJsonPath('user.addresses.0.user_id', (string) $customer->id)
                ->assertJsonPath('user.addresses.0.country_key', 'thailand')
                ->assertJsonPath('user.addresses.0.is_default', true)
                ->assertJsonPath('user.addresses.0.address_values.phoneNumber', '+66 81 234 5678')
                ->assertJsonPath('user.addresses.0.address_values.subdistrict', 'Khlong Toei Nuea')
                ->assertJsonPath('user.addresses.0.address_values.deliveryNote', 'Leave with the lobby concierge')
                ->assertJsonPath('user.addresses.1.id', $usa->json('address.id'))
                ->assertJsonPath('user.addresses.1.user_id', (string) $customer->id)
                ->assertJsonPath('user.addresses.1.country_key', 'usa')
                ->assertJsonPath('user.addresses.1.is_default', false)
                ->assertJsonPath('user.addresses.1.address_values.phoneNumber', '+1 213 555 0142')
                ->assertJsonPath('user.addresses.1.address_values.state', 'California')
                ->assertJsonPath('user.addresses.1.address_values.deliveryNote', 'Call from the loading entrance');

            $addressIds = array_column($detail->json('user.addresses'), 'id');
            $this->assertNotContains($other->json('address.id'), $addressIds, $phase.' leaked another user address.');
        }
    }

    public function test_admin_customer_detail_returns_only_selected_customer_addresses_and_masked_payment_methods(): void
    {
        $customer = User::factory()->create(['role' => 'customer', 'email' => 'selected-customer@example.test']);
        $otherCustomer = User::factory()->create(['role' => 'customer', 'email' => 'other-customer@example.test']);

        $thailand = UserAddress::query()->create([
            'user_id' => $customer->id,
            'country_key' => 'thailand',
            'address_values' => [
                'fullName' => 'Mike',
                'phoneNumber' => '+66 81 234 5678',
                'streetAddress' => '15 Sukhumvit Road',
                'subdistrict' => 'Khlong Toei Nuea',
                'district' => 'Watthana',
                'province' => 'Bangkok',
                'postalCode' => '10110',
            ],
            'summary' => '15 Sukhumvit Road, Bangkok 10110',
            'is_default' => true,
        ]);
        $usa = UserAddress::query()->create([
            'user_id' => $customer->id,
            'country_key' => 'usa',
            'address_values' => [
                'fullName' => 'Pasit',
                'phoneNumber' => '+1 213 555 0142',
                'streetAddress' => '400 South Hope Street',
                'city' => 'Los Angeles',
                'state' => 'California',
                'zipCode' => '90071',
            ],
            'summary' => '400 South Hope Street, Los Angeles, CA 90071',
            'is_default' => false,
        ]);
        $otherAddress = UserAddress::query()->create([
            'user_id' => $otherCustomer->id,
            'country_key' => 'japan',
            'address_values' => ['fullName' => 'Other Customer', 'prefecture' => 'Tokyo'],
            'summary' => 'Other customer address',
            'is_default' => true,
        ]);

        $paymentMethod = UserPaymentMethod::query()->create([
            'user_id' => $customer->id,
            'provider' => 'merchant-vault',
            'brand' => 'Visa',
            'last4' => '4242',
            'expiry_month' => 8,
            'expiry_year' => 2028,
            'token_reference' => 'provider-secret-token-must-never-leave-laravel',
            'is_default' => true,
            'status' => 'active',
        ]);
        $otherPaymentMethod = UserPaymentMethod::query()->create([
            'user_id' => $otherCustomer->id,
            'provider' => 'other-vault',
            'brand' => 'Mastercard',
            'last4' => '9999',
            'expiry_month' => 12,
            'expiry_year' => 2031,
            'token_reference' => 'other-customer-secret',
            'is_default' => true,
            'status' => 'active',
        ]);

        $response = $this->withToken($this->adminToken())->getJson('/api/v1/admin/users/'.$customer->id)
            ->assertOk()
            ->assertJsonCount(2, 'user.addresses')
            ->assertJsonCount(1, 'user.payment_methods')
            ->assertJsonPath('user.addresses.0.id', $thailand->id)
            ->assertJsonPath('user.addresses.0.user_id', (string) $customer->id)
            ->assertJsonPath('user.addresses.0.is_default', true)
            ->assertJsonPath('user.addresses.0.address_values.subdistrict', 'Khlong Toei Nuea')
            ->assertJsonPath('user.addresses.1.id', $usa->id)
            ->assertJsonPath('user.addresses.1.is_default', false)
            ->assertJsonPath('user.addresses.1.address_values.state', 'California')
            ->assertJsonPath('user.payment_methods.0.id', $paymentMethod->id)
            ->assertJsonPath('user.payment_methods.0.user_id', (string) $customer->id)
            ->assertJsonPath('user.payment_methods.0.brand', 'Visa')
            ->assertJsonPath('user.payment_methods.0.last4', '4242')
            ->assertJsonPath('user.payment_methods.0.expiry_month', 8)
            ->assertJsonPath('user.payment_methods.0.expiry_year', 2028)
            ->assertJsonPath('user.payment_methods.0.is_default', true);

        $detail = $response->json('user');
        $this->assertIsArray($detail);
        $this->assertNotContains($otherAddress->id, array_column($detail['addresses'], 'id'));
        $this->assertNotContains($otherPaymentMethod->id, array_column($detail['payment_methods'], 'id'));
        $encoded = json_encode($detail, JSON_THROW_ON_ERROR);
        $this->assertStringNotContainsString('token_reference', $encoded);
        $this->assertStringNotContainsString('provider-secret-token', $encoded);
        $this->assertStringNotContainsString('merchant-vault', $encoded);
        $this->assertStringNotContainsString('card_number', $encoded);
        $this->assertStringNotContainsString('cvv', strtolower($encoded));

        $this->withToken($this->adminToken())
            ->patchJson('/api/v1/admin/users/'.$customer->id, ['status' => 'active'])
            ->assertOk()
            ->assertJsonCount(2, 'user.addresses')
            ->assertJsonCount(1, 'user.payment_methods')
            ->assertJsonPath('user.addresses.0.id', $thailand->id)
            ->assertJsonPath('user.payment_methods.0.last4', '4242');
    }

    public function test_public_authentication_cannot_read_admin_customer_detail(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $plainToken = 'public-customer-'.bin2hex(random_bytes(18));
        UserApiToken::query()->create([
            'user_id' => $customer->id,
            'name' => 'public-customer-token',
            'token_hash' => hash('sha256', $plainToken),
            'expires_at' => now()->addHour(),
        ]);

        $this->withToken($plainToken)
            ->getJson('/api/v1/admin/users/'.$customer->id)
            ->assertUnauthorized();
    }

    public function test_missing_customer_is_404_and_customer_without_detail_records_returns_empty_arrays(): void
    {
        $adminToken = $this->adminToken();
        $customer = User::factory()->create(['role' => 'customer']);

        $this->withToken($adminToken)
            ->getJson('/api/v1/admin/users/'.$customer->id)
            ->assertOk()
            ->assertJsonPath('user.id', (string) $customer->id)
            ->assertJsonCount(0, 'user.addresses')
            ->assertJsonCount(0, 'user.payment_methods');

        $this->withToken($adminToken)
            ->getJson('/api/v1/admin/users/999999999')
            ->assertNotFound();
    }

    private function adminToken(): string
    {
        $admin = User::factory()->admin()->create([
            'email' => 'customer-detail-admin-'.bin2hex(random_bytes(5)).'@example.test',
            'password' => 'Adminpass123',
        ]);

        return (string) $this->postJson('/api/v1/admin/login', [
            'email' => $admin->email,
            'password' => 'Adminpass123',
        ])->assertOk()->json('token');
    }
}
