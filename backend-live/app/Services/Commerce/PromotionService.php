<?php

namespace App\Services\Commerce;

use App\Models\Promotion;
use App\Models\PromotionRedemption;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class PromotionService
{
    public function evaluate(?string $code, array $items, int $subtotalMinor, string $currency, ?User $user, ?string $guestEmail, bool $lock = false): array
    {
        if (! $code) {
            return ['promotion' => null, 'discount_minor' => 0, 'snapshot' => null];
        }

        $query = Promotion::query()->with(['products:id', 'categories:id'])->whereRaw('UPPER(code) = ?', [strtoupper(trim($code))]);
        if ($lock) { $query->lockForUpdate(); }
        $promotion = $query->first();
        $message = 'This promo code is not available for the selected items.';
        if (! $promotion || ! $promotion->active || $promotion->archived_at || ($promotion->starts_at && $promotion->starts_at->isFuture()) || ($promotion->ends_at && $promotion->ends_at->isPast())) {
            throw ValidationException::withMessages(['promo_code' => [$message]]);
        }
        if ($promotion->discount_type === 'percentage' && $promotion->discount_value > 10000) {
            throw ValidationException::withMessages(['promo_code' => [$message]]);
        }
        if ($promotion->total_usage_limit !== null && $promotion->usage_count >= $promotion->total_usage_limit) {
            throw ValidationException::withMessages(['promo_code' => ['This promo code has reached its usage limit.']]);
        }
        if ($promotion->minimum_subtotal_minor !== null && $subtotalMinor < $promotion->minimum_subtotal_minor) {
            throw ValidationException::withMessages(['promo_code' => ['The cart subtotal does not meet this promo code minimum.']]);
        }
        if ($promotion->currency_code !== null && strtoupper((string) $promotion->currency_code) !== strtoupper($currency)) {
            throw ValidationException::withMessages(['promo_code' => [$message]]);
        }

        $redemptions = PromotionRedemption::query()->where('promotion_id', $promotion->id);
        if ($promotion->per_user_usage_limit !== null) {
            $used = $user ? (clone $redemptions)->where('user_id', $user->id)->count() : (clone $redemptions)->whereRaw('LOWER(guest_email) = ?', [strtolower((string) $guestEmail)])->count();
            if ($used >= $promotion->per_user_usage_limit) {
                throw ValidationException::withMessages(['promo_code' => ['You have already used this promo code the maximum number of times.']]);
            }
        }

        $productIds = $promotion->products->pluck('id')->all();
        $categoryIds = $promotion->categories->pluck('id')->all();
        $eligibleSubtotal = collect($items)->filter(function (array $item) use ($promotion, $productIds, $categoryIds): bool {
            return match ($promotion->applies_to) {
                'products' => in_array($item['product_id'], $productIds, true),
                'categories' => in_array($item['category_id'], $categoryIds, true),
                default => true,
            };
        })->sum('line_subtotal_minor');
        if ($eligibleSubtotal <= 0) {
            throw ValidationException::withMessages(['promo_code' => [$message]]);
        }

        $discount = $promotion->discount_type === 'percentage'
            ? intdiv(($eligibleSubtotal * $promotion->discount_value) + 5000, 10000)
            : min($eligibleSubtotal, $promotion->discount_value);
        if ($promotion->maximum_discount_minor !== null) { $discount = min($discount, $promotion->maximum_discount_minor); }
        $discount = min($subtotalMinor, max(0, $discount));
        $snapshot = ['uuid' => $promotion->uuid, 'code' => $promotion->code, 'name' => $promotion->code,
            'discount_type' => $promotion->discount_type, 'discount_value' => $promotion->discount_value,
            'discount_applied_minor' => $discount, 'currency_code' => $currency, 'applies_to' => $promotion->applies_to];

        return ['promotion' => $promotion, 'discount_minor' => $discount, 'snapshot' => $snapshot];
    }
}
