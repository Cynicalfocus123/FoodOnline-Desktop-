<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\InventoryMovement;
use App\Models\InventoryReservation;
use App\Models\Order;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\User;
use App\Models\UserApiToken;
use App\Models\VariantInventory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class TransactionalCommerceTest extends TestCase
{
    use CreatesAdminTokens, RefreshDatabase;

    public function test_guest_cart_quote_and_idempotent_cod_order_preserve_snapshots(): void
    {
        Queue::fake();
        [$product, $variant] = $this->stockedProduct(5);
        [$guestToken, $cartItem, $quote] = $this->guestQuote($variant->uuid);
        $key = 'checkout-test-'.str_repeat('a', 24);

        $created = $this->withHeaders(['X-Guest-Cart-Token' => $guestToken, 'Idempotency-Key' => $key])
            ->postJson('/api/v1/orders', ['quote_uuid' => $quote])->assertCreated()
            ->assertJsonPath('order.payment_status', 'pending')->assertJsonPath('order.fulfillment_status', 'reserved')
            ->assertJsonPath('order.items.0.product_name', $product->name)->assertJsonPath('order.items.0.variant_uuid', $variant->uuid);
        $orderUuid = $created->json('order.uuid');
        $this->assertDatabaseHas('orders', ['uuid' => $orderUuid, 'payment_method_code' => 'cod']);
        $this->assertDatabaseHas('inventory_reservations', ['product_variant_id' => $variant->id, 'quantity' => 2, 'status' => 'active']);
        $this->assertDatabaseMissing('cart_items', ['uuid' => $cartItem]);
        $this->assertSame(2, VariantInventory::query()->where('product_variant_id', $variant->id)->value('quantity_reserved'));

        $this->withHeaders(['X-Guest-Cart-Token' => $guestToken, 'Idempotency-Key' => $key])
            ->postJson('/api/v1/orders', ['quote_uuid' => $quote])->assertOk()
            ->assertJsonPath('idempotent_replay', true)->assertJsonPath('order.uuid', $orderUuid);
        $this->assertSame(1, Order::query()->count());
        $this->assertSame(1, InventoryReservation::query()->count());
    }

    public function test_cart_requires_exact_active_variant_and_merges_guest_quantity(): void
    {
        [, $variant] = $this->stockedProduct(10);
        $guest = $this->getJson('/api/v1/cart')->assertOk()->json('guest_token');
        $this->withHeaders(['X-Guest-Cart-Token' => $guest])->postJson('/api/v1/cart/items', ['variant_uuid' => $variant->uuid, 'quantity' => 2])->assertCreated();
        [$user, $token] = $this->userToken();
        $this->withToken($token)->postJson('/api/v1/cart/items', ['variant_uuid' => $variant->uuid, 'quantity' => 1])->assertCreated();
        $this->withToken($token)->postJson('/api/v1/cart/merge', ['guest_token' => $guest])->assertOk()->assertJsonPath('cart.lines.0.quantity', 3);
        $this->assertSame(1, Cart::query()->where('user_id', $user->id)->firstOrFail()->items()->count());
    }

    public function test_percentage_promotion_is_server_calculated_and_redeemed_atomically(): void
    {
        Queue::fake();
        [, $variant] = $this->stockedProduct(10);
        Promotion::query()->create(['code' => 'SAVE10', 'name' => 'Save ten percent', 'discount_type' => 'percentage', 'discount_value' => 1000,
            'minimum_subtotal_minor' => 1000, 'maximum_discount_minor' => 500, 'active' => true, 'applies_to' => 'all', 'total_usage_limit' => 1, 'per_user_usage_limit' => 1]);
        [$guestToken, , $quote] = $this->guestQuote($variant->uuid, 'SAVE10');
        $this->assertDatabaseHas('checkout_quotes', ['uuid' => $quote, 'promo_discount_minor' => 200]);
        $this->withHeaders(['X-Guest-Cart-Token' => $guestToken, 'Idempotency-Key' => 'promo-order-'.str_repeat('b', 20)])
            ->postJson('/api/v1/orders', ['quote_uuid' => $quote])->assertCreated()->assertJsonPath('order.promo_discount.minor', 200);
        $this->assertDatabaseHas('promotions', ['code' => 'SAVE10', 'usage_count' => 1]);
        $this->assertDatabaseCount('promotion_redemptions', 1);
    }

    public function test_insufficient_inventory_rejects_order_without_partial_records(): void
    {
        [, $variant] = $this->stockedProduct(1);
        $guest = $this->getJson('/api/v1/cart')->json('guest_token');
        $this->withHeaders(['X-Guest-Cart-Token' => $guest])->postJson('/api/v1/cart/items', ['variant_uuid' => $variant->uuid, 'quantity' => 2])->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('inventory_reservations', 0);
        $this->assertSame(0, VariantInventory::query()->firstOrFail()->quantity_reserved);
    }

    public function test_customer_order_authorization_and_cancellation_release_inventory(): void
    {
        Queue::fake();
        [, $variant] = $this->stockedProduct(5);
        [$user, $token] = $this->userToken();
        $cart = $this->withToken($token)->postJson('/api/v1/cart/items', ['variant_uuid' => $variant->uuid, 'quantity' => 1])->assertCreated()->json('cart');
        $quote = $this->withToken($token)->postJson('/api/v1/checkout/quote', $this->quotePayload($cart['lines'][0]['id']))->assertCreated()->json('quote.uuid');
        $order = $this->withToken($token)->withHeader('Idempotency-Key', 'customer-order-'.str_repeat('c', 20))->postJson('/api/v1/orders', ['quote_uuid' => $quote])->assertCreated()->json('order.uuid');
        [, $otherToken] = $this->userToken();
        $this->withToken($otherToken)->getJson('/api/v1/account/orders/'.$order)->assertNotFound();
        $this->withToken($token)->postJson('/api/v1/account/orders/'.$order.'/cancel')->assertOk()->assertJsonPath('order.order_status', 'cancelled');
        $this->assertDatabaseHas('inventory_reservations', ['order_id' => Order::query()->where('uuid', $order)->value('id'), 'status' => 'released']);
        $this->assertSame(0, VariantInventory::query()->where('product_variant_id', $variant->id)->value('quantity_reserved'));
    }

    public function test_admin_inventory_promotion_and_cod_actions_are_audited(): void
    {
        [$admin, $token] = $this->adminToken();
        [, $variant] = $this->stockedProduct(5);
        $this->withToken($token)->postJson('/api/v1/admin/inventory/'.$variant->uuid.'/adjust', ['quantity_delta' => 2, 'reason' => 'Receiving count'])->assertOk()->assertJsonPath('inventory.quantity_on_hand', 7);
        $promo = $this->withToken($token)->postJson('/api/v1/admin/promo-codes', ['code' => 'ADMIN10', 'name' => 'Admin ten', 'discount_type' => 'percentage', 'discount_value' => 1000, 'active' => true, 'applies_to' => 'all'])->assertCreated()->json('promotion.uuid');
        $this->assertNotEmpty($promo);
        $this->assertDatabaseHas('admin_audit_logs', ['admin_user_id' => $admin->id, 'action' => 'inventory.adjusted']);
        $this->assertDatabaseHas('admin_audit_logs', ['admin_user_id' => $admin->id, 'action' => 'promotion.created']);
        $this->assertDatabaseHas('inventory_movements', ['product_variant_id' => $variant->id, 'movement_type' => 'adjustment']);
    }

    public function test_only_cod_is_enabled_and_raw_card_metadata_is_rejected(): void
    {
        $methods = $this->getJson('/api/v1/checkout/payment-methods')->assertOk()->json('payment_methods');
        $this->assertTrue(collect($methods)->firstWhere('code', 'cod')['enabled']);
        $this->assertFalse(collect($methods)->firstWhere('code', 'card')['enabled']);
        [, $token] = $this->userToken();
        $this->withToken($token)->postJson('/api/v1/account/payment-methods', ['brand' => 'Visa', 'last4' => '4242', 'expiry_month' => 12, 'expiry_year' => 2030])->assertStatus(409);
    }

    public function test_guest_order_access_requires_the_one_time_guest_token(): void
    {
        Queue::fake();
        [, $variant] = $this->stockedProduct(5);
        [$guestToken, , $quote] = $this->guestQuote($variant->uuid);
        $response = $this->withHeaders(['X-Guest-Cart-Token' => $guestToken, 'Idempotency-Key' => 'guest-access-'.str_repeat('d', 20)])
            ->postJson('/api/v1/orders', ['quote_uuid' => $quote])->assertCreated();
        $order = $response->json('order.uuid');
        $access = $response->json('guest_access_token');

        $this->getJson('/api/v1/orders/'.$order.'/guest?access_token=wrong-token')->assertNotFound();
        $this->getJson('/api/v1/orders/'.$order.'/guest?access_token='.$access)->assertOk()->assertJsonPath('order.uuid', $order);
    }

    public function test_cart_item_cannot_be_changed_by_another_guest(): void
    {
        [, $variant] = $this->stockedProduct(5);
        $ownerToken = $this->getJson('/api/v1/cart')->json('guest_token');
        $item = $this->withHeaders(['X-Guest-Cart-Token' => $ownerToken])->postJson('/api/v1/cart/items', ['variant_uuid' => $variant->uuid, 'quantity' => 1])->assertCreated()->json('cart.lines.0.id');
        $otherToken = $this->getJson('/api/v1/cart')->json('guest_token');

        $this->withHeaders(['X-Guest-Cart-Token' => $otherToken])->deleteJson('/api/v1/cart/items/'.$item)->assertNotFound();
        $this->assertDatabaseHas('cart_items', ['uuid' => $item, 'quantity' => 1]);
    }

    public function test_cod_reservation_has_no_expiry_and_is_not_released_by_expiry_command(): void
    {
        Queue::fake();
        [, $variant] = $this->stockedProduct(5);
        [$guestToken, , $quote] = $this->guestQuote($variant->uuid);
        $orderResponse = $this->withHeaders(['X-Guest-Cart-Token' => $guestToken, 'Idempotency-Key' => 'reservation-cod-'.str_repeat('e', 20)])
            ->postJson('/api/v1/orders', ['quote_uuid' => $quote])->assertCreated();
        $orderId = Order::query()->where('uuid', $orderResponse->json('order.uuid'))->value('id');

        $reservation = InventoryReservation::query()->where('order_id', $orderId)->firstOrFail();
        $this->assertNull($reservation->expires_at);
        $this->artisan('inventory:expire-reservations')->assertExitCode(0);
        $this->assertDatabaseHas('inventory_reservations', ['id' => $reservation->id, 'status' => 'active']);
        $this->assertSame(2, VariantInventory::query()->where('product_variant_id', $variant->id)->value('quantity_reserved'));
    }

    public function test_admin_order_transition_and_duplicate_cod_collection_are_safe(): void
    {
        Queue::fake();
        [, $variant] = $this->stockedProduct(5);
        [$guestToken, , $quote] = $this->guestQuote($variant->uuid);
        $order = $this->withHeaders(['X-Guest-Cart-Token' => $guestToken, 'Idempotency-Key' => 'admin-flow-'.str_repeat('f', 20)])
            ->postJson('/api/v1/orders', ['quote_uuid' => $quote])->assertCreated()->json('order.uuid');
        [, $adminToken] = $this->adminToken();

        $this->withToken($adminToken)->postJson('/api/v1/admin/orders/'.$order.'/actions', ['action' => 'confirm'])->assertOk()->assertJsonPath('order.order_status', 'confirmed');
        $this->withToken($adminToken)->postJson('/api/v1/admin/orders/'.$order.'/actions', ['action' => 'processing'])->assertOk()->assertJsonPath('order.fulfillment_status', 'processing');
        $this->withToken($adminToken)->postJson('/api/v1/admin/orders/'.$order.'/actions', ['action' => 'ship', 'carrier_name' => 'FoodOnlines', 'tracking_number' => 'FO-123'])->assertOk()->assertJsonPath('order.fulfillment_status', 'shipped');
        $this->withToken($adminToken)->postJson('/api/v1/admin/orders/'.$order.'/actions', ['action' => 'collect_cod'])->assertOk()->assertJsonPath('order.payment_status', 'paid');
        $this->withToken($adminToken)->postJson('/api/v1/admin/orders/'.$order.'/actions', ['action' => 'collect_cod'])->assertOk()->assertJsonPath('order.payment_status', 'paid');
        $this->assertDatabaseHas('admin_audit_logs', ['action' => 'order.collect_cod']);
    }

    private function stockedProduct(int $quantity): array
    {
        $product = Product::factory()->publishedReady()->create();
        $variant = $product->defaultVariant()->firstOrFail();
        $variant->update(['price_amount' => '10.00', 'compare_at_price_amount' => '12.00']);
        VariantInventory::query()->create(['product_variant_id' => $variant->id, 'quantity_on_hand' => $quantity, 'quantity_reserved' => 0, 'low_stock_threshold' => 2, 'tracking_enabled' => true, 'allow_backorder' => false]);
        return [$product, $variant->fresh()];
    }

    private function guestQuote(string $variantUuid, ?string $promo = null): array
    {
        $guest = $this->getJson('/api/v1/cart')->assertOk()->json('guest_token');
        $line = $this->withHeaders(['X-Guest-Cart-Token' => $guest])->postJson('/api/v1/cart/items', ['variant_uuid' => $variantUuid, 'quantity' => 2])->assertCreated()->json('cart.lines.0.id');
        $quote = $this->withHeaders(['X-Guest-Cart-Token' => $guest])->postJson('/api/v1/checkout/quote', [...$this->quotePayload($line), 'promo_code' => $promo])->assertCreated()->json('quote.uuid');
        return [$guest, $line, $quote];
    }

    private function quotePayload(string $cartItemId): array
    {
        return ['cart_item_ids' => [$cartItemId], 'guest_email' => 'guest@example.com', 'payment_method_code' => 'cod', 'billing_same_as_shipping' => true,
            'shipping_address' => ['full_name' => 'Test Shopper', 'phone_number' => '+15555550123', 'country_key' => 'thailand',
                'address_values' => ['fullName' => 'Test Shopper', 'phoneNumber' => '+15555550123', 'houseBuilding' => '10', 'province' => 'Bangkok', 'subdistrict' => 'Central', 'postalCode' => '10100'],
                'summary' => '10 Central, Bangkok 10100']];
    }

    private function userToken(): array
    {
        $user = User::factory()->create(['account_type' => 'customer', 'role' => 'customer', 'status' => 'active']);
        $plain = 'commerce-user-'.bin2hex(random_bytes(18));
        UserApiToken::query()->create(['user_id' => $user->id, 'name' => 'commerce-tests', 'token_hash' => hash('sha256', $plain), 'expires_at' => now()->addHour()]);
        return [$user, $plain];
    }
}
