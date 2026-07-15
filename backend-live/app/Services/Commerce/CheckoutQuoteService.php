<?php

namespace App\Services\Commerce;

use App\Models\Cart;
use App\Models\CheckoutQuote;
use App\Models\User;
use App\Services\Catalog\CategoryMediaUrl;
use App\Support\Money;
use Illuminate\Validation\ValidationException;

class CheckoutQuoteService
{
    public function __construct(
        private readonly PromotionService $promotions,
        private readonly ShippingService $shipping,
        private readonly PaymentMethodService $paymentMethods,
        private readonly CommerceSettingsService $settings,
        private readonly CategoryMediaUrl $mediaUrl,
    ) {}

    public function create(Cart $cart, ?User $user, array $input): CheckoutQuote
    {
        $settings = $this->settings->all();
        if (! $user && ! ($settings['guest_checkout_enabled'] ?? true)) {
            throw ValidationException::withMessages(['checkout' => ['Guest checkout is currently unavailable.']]);
        }
        $cart->load(['items.product.category', 'items.product.primaryMedia', 'items.variant.inventory']);
        $selected = collect($input['cart_item_ids'] ?? [])->filter()->values();
        $items = $cart->items->when($selected->isNotEmpty(), fn ($lines) => $lines->whereIn('uuid', $selected))->values();
        if ($items->isEmpty()) {
            throw ValidationException::withMessages(['cart' => ['Select at least one available cart item.']]);
        }

        $currency = strtoupper($cart->currency_code);
        $snapshots = [];
        $subtotal = 0;
        $retailSubtotal = 0;
        foreach ($items as $item) {
            $variant = $item->variant;
            $product = $item->product;
            $inventory = $variant?->inventory;
            $available = $product?->status === 'published' && $product?->published_at && $variant?->is_active && $variant?->availability_status !== 'out_of_stock';
            if ($inventory?->tracking_enabled && ! $inventory->allow_backorder && $inventory->availableQuantity() < $item->quantity) { $available = false; }
            if (! $available || strtoupper((string) $variant?->currency_code) !== $currency) {
                throw ValidationException::withMessages(['cart' => ['One or more selected items are no longer available.']]);
            }
            $unit = Money::fromDecimal((string) $variant->price_amount);
            $old = $variant->compare_at_price_amount ? Money::fromDecimal((string) $variant->compare_at_price_amount) : $unit;
            $line = $unit * $item->quantity;
            $subtotal += $line;
            $retailSubtotal += max($unit, $old) * $item->quantity;
            $snapshots[] = [
                'cart_item_uuid' => $item->uuid, 'product_id' => $product->id, 'product_uuid' => $product->uuid,
                'product_slug' => $product->slug, 'product_name' => $product->name, 'category_id' => $product->category_id,
                'product_image_url' => $this->mediaUrl->make($product->primaryMedia?->path),
                'product_variant_id' => $variant->id, 'variant_uuid' => $variant->uuid, 'variant_title' => $variant->title,
                'sku' => $variant->sku, 'gtin' => $variant->gtin, 'package_size' => $variant->displaySize(), 'quantity' => $item->quantity,
                'unit_price_minor' => $unit, 'old_unit_price_minor' => $old, 'line_subtotal_minor' => $line,
                'inventory_updated_at' => $inventory?->updated_at?->toIso8601String(),
            ];
        }

        $address = $this->validateAddress($input['shipping_address'] ?? []);
        $shipping = $this->shipping->calculate($address, $subtotal);
        $promotionResult = $this->promotions->evaluate($input['promo_code'] ?? null, $snapshots, $subtotal, $currency, $user, $input['guest_email'] ?? null);
        $codFee = ($input['payment_method_code'] ?? '') === 'cod' ? (int) ($settings['cod_fee_minor'] ?? 0) : 0;
        $taxable = max(0, $subtotal - $promotionResult['discount_minor'] + $shipping['amount_minor'] + $codFee);
        $tax = ($settings['tax_mode'] ?? 'disabled') === 'flat_rate' ? intdiv(($taxable * (int) ($settings['flat_tax_basis_points'] ?? 0)) + 5000, 10000) : 0;
        $total = max(0, $taxable + $tax);
        $this->paymentMethods->requireEnabled($input['payment_method_code'], $address['country_key'], $total);

        $hashPayload = ['cart' => $cart->uuid, 'items' => $snapshots, 'address' => $address, 'billing' => $input['billing_address'] ?? null,
            'promo' => $promotionResult['snapshot'], 'payment' => $input['payment_method_code'], 'shipping' => $shipping, 'tax' => $tax, 'total' => $total];

        return CheckoutQuote::query()->create([
            'cart_id' => $cart->id, 'user_id' => $user?->id, 'guest_email' => $user ? null : strtolower((string) ($input['guest_email'] ?? '')),
            'currency_code' => $currency, 'retail_subtotal_minor' => $retailSubtotal, 'subtotal_minor' => $subtotal,
            'product_discount_minor' => max(0, $retailSubtotal - $subtotal), 'promo_discount_minor' => $promotionResult['discount_minor'],
            'shipping_minor' => $shipping['amount_minor'], 'cod_fee_minor' => $codFee, 'tax_minor' => $tax, 'total_minor' => $total,
            'promo_code' => $promotionResult['promotion']?->code, 'promotion_id' => $promotionResult['promotion']?->id,
            'payment_method_code' => $input['payment_method_code'], 'shipping_address_payload' => $address,
            'billing_address_payload' => ($input['billing_same_as_shipping'] ?? true) ? $address : $this->validateAddress($input['billing_address'] ?? []),
            'item_snapshot' => $snapshots, 'calculation_hash' => hash('sha256', json_encode($hashPayload, JSON_UNESCAPED_SLASHES)),
            'expires_at' => now()->addMinutes((int) ($settings['quote_minutes'] ?? 15)),
        ]);
    }

    public function payload(CheckoutQuote $quote): array
    {
        $money = fn (int $minor): array => ['minor' => $minor, 'amount' => Money::decimal($minor), 'currency_code' => $quote->currency_code];
        return ['quote' => [
            'uuid' => $quote->uuid, 'expires_at' => $quote->expires_at->toIso8601String(), 'items' => $quote->item_snapshot,
            'retail_subtotal' => $money($quote->retail_subtotal_minor), 'product_discount' => $money($quote->product_discount_minor),
            'subtotal' => $money($quote->subtotal_minor), 'promo_code' => $quote->promo_code,
            'promo_discount' => $money($quote->promo_discount_minor), 'shipping' => ['code' => 'standard', 'label' => 'Standard shipping', ...$money($quote->shipping_minor)],
            'cod_fee' => $money($quote->cod_fee_minor), 'tax' => $money($quote->tax_minor), 'total' => $money($quote->total_minor),
            'payment_method_code' => $quote->payment_method_code, 'shipping_address' => $quote->shipping_address_payload,
            'can_place_order' => ! $quote->consumed_at && $quote->expires_at->isFuture(), 'warnings' => [],
        ]];
    }

    private function validateAddress(array $address): array
    {
        $values = (array) ($address['address_values'] ?? $address['values'] ?? []);
        $fullName = trim((string) ($address['full_name'] ?? $values['fullName'] ?? ''));
        $phone = trim((string) ($address['phone_number'] ?? $values['phoneNumber'] ?? ''));
        $country = trim((string) ($address['country_key'] ?? $address['country'] ?? ''));
        $summary = trim((string) ($address['summary'] ?? implode(', ', array_filter($values, fn ($value, $key) => $value && $key !== 'deliveryNote', ARRAY_FILTER_USE_BOTH))));
        if (! $fullName || ! $phone || ! $country || ! $summary) {
            throw ValidationException::withMessages(['shipping_address' => ['Provide a complete delivery name, phone number, country, and address.']]);
        }

        return ['full_name' => $fullName, 'phone_number' => $phone, 'country_key' => $country, 'address_values' => $values,
            'summary' => $summary, 'delivery_note' => $address['delivery_note'] ?? $values['deliveryNote'] ?? null];
    }
}
