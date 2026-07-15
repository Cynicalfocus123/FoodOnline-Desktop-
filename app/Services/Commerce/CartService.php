<?php

namespace App\Services\Commerce;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\Catalog\CategoryMediaUrl;
use App\Support\Money;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function __construct(private readonly CategoryMediaUrl $mediaUrl) {}

    public function resolve(?User $user, ?string $guestToken): array
    {
        if ($user) {
            $cart = Cart::query()->firstOrCreate(
                ['user_id' => $user->id, 'status' => 'active'],
                ['currency_code' => config('foodonlines.commerce.store_currency', 'USD'), 'last_activity_at' => now()]
            );

            return [$cart, null];
        }

        if ($guestToken) {
            $cart = Cart::query()->where('guest_token_hash', hash('sha256', $guestToken))->where('status', 'active')
                ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))->first();
            if ($cart) {
                return [$cart, null];
            }
        }

        $rawToken = Str::random(80);
        $cart = Cart::query()->create([
            'guest_token_hash' => hash('sha256', $rawToken), 'status' => 'active',
            'currency_code' => config('foodonlines.commerce.store_currency', 'USD'),
            'expires_at' => now()->addDays(30), 'last_activity_at' => now(),
        ]);

        return [$cart, $rawToken];
    }

    public function add(Cart $cart, string $variantUuid, int $quantity): Cart
    {
        $variant = ProductVariant::query()->with(['product.category', 'product.primaryMedia'])->where('uuid', $variantUuid)->first();
        if (! $variant || ! $variant->is_active || $variant->product?->status !== 'published' || ! $variant->product?->published_at) {
            throw ValidationException::withMessages(['variant_uuid' => ['This product variant is not available.']]);
        }
        if ($variant->availability_status === 'out_of_stock') {
            throw ValidationException::withMessages(['variant_uuid' => ['This product variant is out of stock.']]);
        }

        $inventory = $variant->inventory;
        $existing = $cart->items()->where('product_variant_id', $variant->id)->first();
        $nextQuantity = ($existing?->quantity ?? 0) + $quantity;
        if ($nextQuantity > 99 || ($inventory?->tracking_enabled && ! $inventory->allow_backorder && $nextQuantity > $inventory->availableQuantity())) {
            throw ValidationException::withMessages(['quantity' => ['The requested quantity is not available.']]);
        }

        $cart->items()->updateOrCreate(
            ['product_variant_id' => $variant->id],
            ['product_id' => $variant->product_id, 'quantity' => $nextQuantity]
        );
        $this->touch($cart);

        return $cart;
    }

    public function update(Cart $cart, CartItem $item, int $quantity): Cart
    {
        $this->assertOwns($cart, $item);
        $item->loadMissing('variant.inventory');
        $inventory = $item->variant?->inventory;
        if ($quantity > 99 || ($inventory?->tracking_enabled && ! $inventory->allow_backorder && $quantity > $inventory->availableQuantity())) {
            throw ValidationException::withMessages(['quantity' => ['The requested quantity is not available.']]);
        }
        $item->update(['quantity' => $quantity]);
        $this->touch($cart);

        return $cart;
    }

    public function remove(Cart $cart, CartItem $item): Cart
    {
        $this->assertOwns($cart, $item);
        $item->delete();
        $this->touch($cart);

        return $cart;
    }

    public function clear(Cart $cart): Cart
    {
        $cart->items()->delete();
        $this->touch($cart);

        return $cart;
    }

    public function merge(User $user, string $guestToken): Cart
    {
        return DB::transaction(function () use ($user, $guestToken): Cart {
            $guest = Cart::query()->where('guest_token_hash', hash('sha256', $guestToken))->where('status', 'active')->lockForUpdate()->first();
            [$target] = $this->resolve($user, null);
            $target = Cart::query()->lockForUpdate()->findOrFail($target->id);
            if (! $guest || $guest->id === $target->id) {
                return $target;
            }

            $guest->load('items.variant.inventory');
            foreach ($guest->items as $guestItem) {
                $existing = $target->items()->where('product_variant_id', $guestItem->product_variant_id)->first();
                $quantity = min(99, ($existing?->quantity ?? 0) + $guestItem->quantity);
                $inventory = $guestItem->variant?->inventory;
                if ($inventory?->tracking_enabled && ! $inventory->allow_backorder) {
                    $quantity = min($quantity, $inventory->availableQuantity());
                }
                if ($quantity > 0) {
                    $target->items()->updateOrCreate(['product_variant_id' => $guestItem->product_variant_id], ['product_id' => $guestItem->product_id, 'quantity' => $quantity]);
                }
            }
            $guest->update(['status' => 'converted', 'guest_token_hash' => null, 'last_activity_at' => now()]);
            $guest->items()->delete();
            $this->touch($target);

            return $target;
        }, 3);
    }

    public function payload(Cart $cart, ?string $newGuestToken = null): array
    {
        $cart->load(['items.product.primaryMedia', 'items.variant.inventory']);
        $subtotal = 0;
        $lines = $cart->items->map(function (CartItem $item) use (&$subtotal): array {
            $variant = $item->variant;
            $product = $item->product;
            $unit = Money::fromDecimal((string) ($variant?->price_amount ?? 0));
            $old = $variant?->compare_at_price_amount ? Money::fromDecimal((string) $variant->compare_at_price_amount) : null;
            $lineSubtotal = $unit * $item->quantity;
            $subtotal += $lineSubtotal;
            $inventory = $variant?->inventory;
            $published = $product?->status === 'published' && $product?->published_at;
            $available = (bool) ($published && $variant?->is_active && $variant?->availability_status !== 'out_of_stock');
            if ($inventory?->tracking_enabled && ! $inventory->allow_backorder && $inventory->availableQuantity() < $item->quantity) {
                $available = false;
            }

            return [
                'id' => $item->uuid, 'product_uuid' => $product?->uuid, 'product_slug' => $product?->slug,
                'product_name' => $product?->name, 'product_image_url' => $this->mediaUrl->make($product?->primaryMedia?->path),
                'variant_uuid' => $variant?->uuid, 'variant_title' => $variant?->title, 'sku' => $variant?->sku,
                'package_size' => $variant?->displaySize(), 'quantity' => $item->quantity,
                'unit_price_minor' => $unit, 'unit_price' => Money::decimal($unit),
                'old_unit_price_minor' => $old, 'old_unit_price' => $old === null ? null : Money::decimal($old),
                'line_subtotal_minor' => $lineSubtotal, 'line_subtotal' => Money::decimal($lineSubtotal),
                'available' => $available, 'available_quantity' => $inventory?->tracking_enabled ? $inventory->availableQuantity() : null,
                'unavailable_reason' => $available ? null : 'This line is currently unavailable. Remove it or reduce the quantity.',
            ];
        })->values()->all();

        return [
            'cart' => ['uuid' => $cart->uuid, 'status' => $cart->status, 'currency_code' => $cart->currency_code,
                'lines' => $lines, 'item_count' => array_sum(array_column($lines, 'quantity')),
                'display_subtotal_minor' => $subtotal, 'display_subtotal' => Money::decimal($subtotal),
                'updated_at' => $cart->updated_at?->toIso8601String()],
            'guest_token' => $newGuestToken,
        ];
    }

    private function assertOwns(Cart $cart, CartItem $item): void
    {
        if ($item->cart_id !== $cart->id) {
            throw (new ModelNotFoundException)->setModel(CartItem::class);
        }
    }

    private function touch(Cart $cart): void
    {
        $cart->forceFill(['last_activity_at' => now()])->touch();
    }
}
