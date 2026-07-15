<?php

namespace App\Services\Commerce;

use App\Jobs\SendOrderConfirmation;
use App\Models\CheckoutQuote;
use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\OrderStatusHistory;
use App\Models\PromotionRedemption;
use App\Models\User;
use App\Notifications\CommerceNotification;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly PromotionService $promotions,
        private readonly ShippingService $shipping,
        private readonly PaymentMethodService $paymentMethods,
        private readonly CommerceSettingsService $settings,
    ) {}

    public function create(CheckoutQuote $quote, ?User $user, string $idempotencyKey, ?string $customerNote = null): array
    {
        $actorKey = $user ? 'user:'.$user->id : 'cart:'.$quote->cart_id;
        $existing = Order::query()->where('actor_key', $actorKey)->where('idempotency_key', $idempotencyKey)->first();
        if ($existing) {
            if ($existing->checkout_quote_id !== $quote->id) { throw ValidationException::withMessages(['idempotency_key' => ['This idempotency key was already used for a different checkout request.']]); }
            return [$existing->load($this->relations()), null, true];
        }

        try {
        [$order, $guestToken] = DB::transaction(function () use ($quote, $user, $idempotencyKey, $actorKey, $customerNote): array {
            $quote = CheckoutQuote::query()->lockForUpdate()->findOrFail($quote->id);
            $existing = Order::query()->where('actor_key', $actorKey)->where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                if ($existing->checkout_quote_id !== $quote->id) { throw ValidationException::withMessages(['idempotency_key' => ['This idempotency key was already used for a different checkout request.']]); }
                return [$existing, null];
            }
            if ($quote->consumed_at || $quote->expires_at->isPast() || $quote->user_id !== $user?->id) {
                throw ValidationException::withMessages(['quote_uuid' => ['This checkout quote has expired or is no longer available. Refresh checkout and try again.']]);
            }

            $cart = $quote->cart()->with(['items.variant.product', 'items.variant.inventory', 'items.product'])->lockForUpdate()->firstOrFail();
            $quote->setRelation('cart', $cart);
            $items = $this->revalidate($quote, $user);
            $guestToken = $user ? null : Str::random(80);
            $order = Order::query()->create([
                'order_number' => 'FO-'.now()->format('Ymd').'-'.Str::upper(Str::random(8)), 'user_id' => $user?->id,
                'guest_email' => $user ? null : $quote->guest_email, 'guest_phone' => $user ? null : ($quote->shipping_address_payload['phone_number'] ?? null),
                'guest_access_token_hash' => $guestToken ? hash('sha256', $guestToken) : null, 'checkout_quote_id' => $quote->id,
                'cart_id' => $quote->cart_id, 'actor_key' => $actorKey, 'idempotency_key' => $idempotencyKey,
                'order_status' => 'pending', 'payment_status' => 'pending', 'fulfillment_status' => 'reserved',
                'currency_code' => $quote->currency_code, 'retail_subtotal_minor' => $quote->retail_subtotal_minor,
                'product_discount_minor' => $quote->product_discount_minor, 'subtotal_minor' => $quote->subtotal_minor,
                'promo_discount_minor' => $quote->promo_discount_minor, 'shipping_minor' => $quote->shipping_minor,
                'cod_fee_minor' => $quote->cod_fee_minor, 'tax_minor' => $quote->tax_minor, 'total_minor' => $quote->total_minor,
                'paid_minor' => 0, 'refunded_minor' => 0, 'payment_method_code' => $quote->payment_method_code,
                'shipping_method_code' => 'standard', 'promotion_code_snapshot' => $quote->promo_code,
                'promotion_snapshot' => $items['promotion']['snapshot'], 'customer_note' => $customerNote, 'placed_at' => now(),
            ]);

            $this->inventory->reserve($order, $items['lines']);
            $this->createItems($order, $items['lines'], $quote->promo_discount_minor);
            $this->createAddress($order, 'shipping', $quote->shipping_address_payload);
            $this->createAddress($order, 'billing', $quote->billing_address_payload ?? $quote->shipping_address_payload);
            OrderPayment::query()->create(['order_id' => $order->id, 'method_code' => $quote->payment_method_code, 'provider' => null,
                'status' => 'pending', 'amount_minor' => $quote->total_minor, 'currency_code' => $quote->currency_code, 'refunded_minor' => 0,
                'metadata' => ['cod_collected' => false]]);
            OrderStatusHistory::query()->create(['order_id' => $order->id, 'actor_type' => $user ? 'user' : 'guest', 'actor_id' => $user?->id,
                'event_type' => 'order.placed', 'new_order_status' => 'pending', 'new_payment_status' => 'pending',
                'new_fulfillment_status' => 'reserved', 'customer_visible_message' => 'Your order was placed and inventory is reserved.']);

            if ($items['promotion']['promotion']) {
                $promotion = $items['promotion']['promotion'];
                $promotion->increment('usage_count');
                PromotionRedemption::query()->create(['promotion_id' => $promotion->id, 'order_id' => $order->id, 'user_id' => $user?->id,
                    'guest_email' => $user ? null : $quote->guest_email, 'code_snapshot' => $promotion->code,
                    'discount_type_snapshot' => $promotion->discount_type, 'discount_value_snapshot' => $promotion->discount_value,
                    'discount_applied_minor' => $quote->promo_discount_minor, 'currency_code' => $quote->currency_code, 'redeemed_at' => now()]);
            }

            $quote->update(['consumed_at' => now()]);
            $purchasedIds = collect($quote->item_snapshot)->pluck('cart_item_uuid');
            $quote->cart->items()->whereIn('uuid', $purchasedIds)->delete();
            if (! $quote->cart->items()->exists()) {
                $quote->cart->update(['status' => 'converted', 'converted_order_id' => $order->id]);
            } else {
                $quote->cart->update(['last_activity_at' => now()]);
            }

            SendOrderConfirmation::dispatch($order->id)->afterCommit();
            DB::afterCommit(function () use ($order): void {
                if ($order->user_id && $order->user) { $order->user->notify(new CommerceNotification('order_placed', 'Order received', 'Your order '.$order->order_number.' was received.', ['type' => 'order', 'uuid' => $order->uuid])); }
                User::query()->where('role', 'admin')->where('status', 'active')->get()->each(fn (User $admin) => $admin->notify(new CommerceNotification('new_order', 'New order', 'Order '.$order->order_number.' is awaiting processing.', ['type' => 'order', 'uuid' => $order->uuid])));
            });

            return [$order, $guestToken];
        }, 3);
        } catch (QueryException $exception) {
            $existing = Order::query()->where('actor_key', $actorKey)->where('idempotency_key', $idempotencyKey)->first();
            if (! $existing || $existing->checkout_quote_id !== $quote->id) { throw $exception; }
            return [$existing->load($this->relations()), null, true];
        }

        return [$order->load($this->relations()), $guestToken, false];
    }

    private function revalidate(CheckoutQuote $quote, ?User $user): array
    {
        $cartItems = $quote->cart->items->keyBy('uuid');
        $currentSubtotal = 0;
        $currentRetailSubtotal = 0;
        $promotionLines = [];
        foreach ($quote->item_snapshot as $snapshot) {
            $item = $cartItems->get($snapshot['cart_item_uuid']);
            $variant = $item?->variant;
            $product = $variant?->product ?? $item?->product;
            $published = $product?->status === 'published' && $product?->published_at;
            $available = $published && $variant?->is_active && $variant?->availability_status !== 'out_of_stock';
            if (! $item || ! $variant || ! $product || ! $available || $item->quantity !== $snapshot['quantity']
                || $variant->id !== $snapshot['product_variant_id'] || $product->id !== $snapshot['product_id']) {
                throw ValidationException::withMessages(['quote_uuid' => ['Cart contents or prices changed. Refresh checkout before placing the order.']]);
            }
            $unit = Money::fromDecimal((string) $variant->price_amount);
            $old = $variant->compare_at_price_amount ? Money::fromDecimal((string) $variant->compare_at_price_amount) : $unit;
            $lineSubtotal = $unit * $item->quantity;
            if ($unit !== $snapshot['unit_price_minor'] || $lineSubtotal !== $snapshot['line_subtotal_minor'] || strtoupper((string) $variant->currency_code) !== strtoupper($quote->currency_code)) {
                throw ValidationException::withMessages(['quote_uuid' => ['Cart contents or prices changed. Refresh checkout before placing the order.']]);
            }
            if ($variant->inventory?->tracking_enabled && ! $variant->inventory->allow_backorder && $variant->inventory->availableQuantity() < $item->quantity) {
                throw ValidationException::withMessages(['quote_uuid' => ['One or more selected items no longer have enough stock. Refresh checkout before placing the order.']]);
            }
            $currentSubtotal += $lineSubtotal;
            $currentRetailSubtotal += max($unit, $old) * $item->quantity;
            $promotionLines[] = [...$snapshot, 'product_id' => $product->id, 'category_id' => $product->category_id, 'line_subtotal_minor' => $lineSubtotal, 'unit_price_minor' => $unit];
        }
        if ($currentSubtotal !== $quote->subtotal_minor || $currentRetailSubtotal !== $quote->retail_subtotal_minor || max(0, $currentRetailSubtotal - $currentSubtotal) !== $quote->product_discount_minor) {
            throw ValidationException::withMessages(['quote_uuid' => ['Cart pricing changed. Refresh checkout before placing the order.']]);
        }
        $promotion = $this->promotions->evaluate($quote->promo_code, $promotionLines, $currentSubtotal, $quote->currency_code, $user, $quote->guest_email, true);
        if ($promotion['discount_minor'] !== $quote->promo_discount_minor) {
            throw ValidationException::withMessages(['quote_uuid' => ['Promotion eligibility changed. Refresh checkout before placing the order.']]);
        }
        $shipping = $this->shipping->calculate($quote->shipping_address_payload, $currentSubtotal);
        $settings = $this->settings->all();
        $codFee = $quote->payment_method_code === 'cod' ? (int) ($settings['cod_fee_minor'] ?? 0) : 0;
        $taxable = max(0, $currentSubtotal - $quote->promo_discount_minor + $shipping['amount_minor'] + $codFee);
        $tax = ($settings['tax_mode'] ?? 'disabled') === 'flat_rate' ? intdiv(($taxable * (int) ($settings['flat_tax_basis_points'] ?? 0)) + 5000, 10000) : 0;
        $total = $taxable + $tax;
        if ($shipping['amount_minor'] !== $quote->shipping_minor || $codFee !== $quote->cod_fee_minor || $tax !== $quote->tax_minor || $total !== $quote->total_minor) {
            throw ValidationException::withMessages(['quote_uuid' => ['Shipping, tax, or order totals changed. Refresh checkout before placing the order.']]);
        }
        $this->paymentMethods->requireEnabled($quote->payment_method_code, $quote->shipping_address_payload['country_key'] ?? null, $total);

        return ['lines' => $quote->item_snapshot, 'promotion' => $promotion];
    }

    private function createItems(Order $order, array $lines, int $promoDiscount): void
    {
        $remaining = $promoDiscount;
        $subtotal = max(1, array_sum(array_column($lines, 'line_subtotal_minor')));
        foreach ($lines as $index => $line) {
            $linePromo = $index === array_key_last($lines) ? $remaining : min($remaining, intdiv($promoDiscount * $line['line_subtotal_minor'], $subtotal));
            $remaining -= $linePromo;
            OrderItem::query()->create(['order_id' => $order->id, 'product_id' => $line['product_id'], 'product_uuid' => $line['product_uuid'],
                'product_slug' => $line['product_slug'], 'product_name' => $line['product_name'], 'product_image_url' => $line['product_image_url'],
                'product_variant_id' => $line['product_variant_id'], 'variant_uuid' => $line['variant_uuid'], 'variant_title' => $line['variant_title'],
                'sku' => $line['sku'], 'gtin' => $line['gtin'], 'package_size' => $line['package_size'], 'quantity' => $line['quantity'],
                'unit_price_minor' => $line['unit_price_minor'],
                'old_unit_price_minor' => $line['old_unit_price_minor'] === $line['unit_price_minor'] ? null : $line['old_unit_price_minor'],
                'product_discount_minor' => max(0, (($line['old_unit_price_minor'] ?? $line['unit_price_minor']) - $line['unit_price_minor']) * $line['quantity']),
                'promo_discount_minor' => $linePromo, 'line_subtotal_minor' => $line['line_subtotal_minor'],
                'line_total_minor' => max(0, $line['line_subtotal_minor'] - $linePromo),
                'currency_code' => $order->currency_code]);
        }
    }

    private function createAddress(Order $order, string $type, array $address): void
    {
        OrderAddress::query()->create(['order_id' => $order->id, 'address_type' => $type, 'full_name' => $address['full_name'],
            'phone_number' => $address['phone_number'], 'country_key' => $address['country_key'], 'address_values' => $address['address_values'],
            'summary' => $address['summary'], 'delivery_note' => $address['delivery_note'] ?? null]);
    }

    public function relations(): array { return ['items', 'addresses', 'payment.refunds', 'history', 'reservations']; }
}
