<?php

namespace App\Services\Commerce;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\UserFavorite;
use App\Models\UserSavedItem;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SavedDataService
{
    public function favorite(User $user, string $productUuid, bool $remove = false): void
    {
        $product = Product::query()->where('uuid', $productUuid)->first();
        if (! $product) { throw (new ModelNotFoundException)->setModel(Product::class); }
        if ($remove) { $user->favorites()->where('product_id', $product->id)->delete(); return; }
        UserFavorite::query()->firstOrCreate(['user_id' => $user->id, 'product_id' => $product->id]);
    }

    public function saved(User $user, string $variantUuid, int $quantity = 1, bool $remove = false): void
    {
        $variant = ProductVariant::query()->where('uuid', $variantUuid)->first();
        if (! $variant) { throw (new ModelNotFoundException)->setModel(ProductVariant::class); }
        if ($remove) { $user->savedItems()->where('product_variant_id', $variant->id)->delete(); return; }
        UserSavedItem::query()->updateOrCreate(['user_id' => $user->id, 'product_variant_id' => $variant->id], ['quantity' => min(99, max(1, $quantity))]);
    }

    public function merge(User $user, array $productUuids, array $variantUuids): array
    {
        return DB::transaction(function () use ($user, $productUuids, $variantUuids): array {
            $added = 0; $skipped = [];
            foreach (array_slice(array_unique($productUuids), 0, 100) as $uuid) {
                $product = Product::query()->where('uuid', $uuid)->first();
                if ($product) { UserFavorite::query()->firstOrCreate(['user_id' => $user->id, 'product_id' => $product->id]); $added++; } else { $skipped[] = $uuid; }
            }
            foreach (array_slice(array_unique($variantUuids), 0, 100) as $uuid) {
                $variant = ProductVariant::query()->where('uuid', $uuid)->first();
                if ($variant) { UserSavedItem::query()->updateOrCreate(['user_id' => $user->id, 'product_variant_id' => $variant->id], ['quantity' => 1]); $added++; } else { $skipped[] = $uuid; }
            }
            return ['merged' => $added, 'skipped' => $skipped];
        });
    }

    public function moveToCart(User $user, string $variantUuid, CartService $cartService): array
    {
        $saved = $user->savedItems()->whereHas('variant', fn ($q) => $q->where('uuid', $variantUuid))->with('variant')->first();
        if (! $saved || ! $saved->variant) { throw (new ModelNotFoundException)->setModel(ProductVariant::class); }
        [$cart] = $cartService->resolve($user, null);
        try { $cartService->add($cart, $saved->variant->uuid, $saved->quantity); $saved->delete(); return ['status' => 'added']; }
        catch (ValidationException $exception) { return ['status' => 'unavailable', 'message' => $exception->getMessage()]; }
    }
}
