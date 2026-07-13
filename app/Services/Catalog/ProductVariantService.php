<?php

namespace App\Services\Catalog;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductVariantService
{
    /** @param array<string, mixed> $data */
    public function create(Product $product, array $data): ProductVariant
    {
        return DB::transaction(function () use ($product, $data): ProductVariant {
            Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();
            $siblings = ProductVariant::query()->where('product_id', $product->id)->lockForUpdate();
            $active = (bool) ($data['is_active'] ?? true);
            $makeDefault = $active && ((bool) ($data['is_default'] ?? false) || ! (clone $siblings)->where('is_active', true)->where('is_default', true)->exists());
            if ($makeDefault) { (clone $siblings)->update(['is_default' => false]); }
            $variant = $product->variants()->create([...$data, 'is_default' => $makeDefault]);
            return $variant->fresh();
        });
    }

    /** @param array<string, mixed> $data */
    public function update(ProductVariant $variant, array $data): ProductVariant
    {
        return DB::transaction(function () use ($variant, $data): ProductVariant {
            Product::query()->whereKey($variant->product_id)->lockForUpdate()->firstOrFail();
            $locked = ProductVariant::query()->whereKey($variant->id)->lockForUpdate()->firstOrFail();
            $active = array_key_exists('is_active', $data) ? (bool) $data['is_active'] : $locked->is_active;
            $makeDefault = array_key_exists('is_default', $data) ? (bool) $data['is_default'] : $locked->is_default;
            if ($makeDefault && ! $active) { throw ValidationException::withMessages(['is_default' => ['An inactive variant cannot be default.']]); }
            if ($makeDefault) {
                ProductVariant::query()->where('product_id', $locked->product_id)->whereKeyNot($locked->id)->update(['is_default' => false]);
            }
            $wasDefault = $locked->is_default;
            $locked->fill(collect($data)->except(['is_active', 'is_default'])->all());
            if (! $active && $wasDefault) { return $this->deactivateLocked($locked); }
            if (array_key_exists('is_default', $data) && ! $makeDefault && $wasDefault) {
                return $this->promoteOrReject($locked, false);
            }
            $locked->forceFill(['is_active' => $active, 'is_default' => $makeDefault])->save();
            return $locked->fresh();
        });
    }

    public function makeDefault(ProductVariant $variant): ProductVariant
    {
        if (! $variant->is_active) { throw ValidationException::withMessages(['variant' => ['An inactive variant cannot be default.']]); }
        return $this->update($variant, ['is_default' => true]);
    }

    public function deactivate(ProductVariant $variant): ProductVariant
    {
        return DB::transaction(function () use ($variant): ProductVariant {
            Product::query()->whereKey($variant->product_id)->lockForUpdate()->firstOrFail();
            $locked = ProductVariant::query()->whereKey($variant->id)->lockForUpdate()->firstOrFail();
            return $this->deactivateLocked($locked);
        });
    }

    /** @param array<int, string> $uuids */
    public function reorder(Product $product, array $uuids): void
    {
        DB::transaction(function () use ($product, $uuids): void {
            Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();
            $variants = ProductVariant::query()->where('product_id', $product->id)->lockForUpdate()->get();
            $expected = $variants->pluck('uuid')->sort()->values()->all();
            $provided = collect($uuids)->sort()->values()->all();
            if ($expected !== $provided) { throw ValidationException::withMessages(['variant_ids' => ['Provide every product variant exactly once.']]); }
            foreach ($uuids as $position => $uuid) { ProductVariant::query()->where('product_id', $product->id)->where('uuid', $uuid)->update(['sort_order' => $position]); }
        });
    }

    private function deactivateLocked(ProductVariant $variant): ProductVariant
    {
        if (! $variant->is_default) { $variant->forceFill(['is_active' => false, 'is_default' => false])->save(); return $variant->fresh(); }
        return $this->promoteOrReject($variant, true);
    }

    private function promoteOrReject(ProductVariant $variant, bool $deactivate): ProductVariant
    {
        $replacement = ProductVariant::query()->where('product_id', $variant->product_id)->whereKeyNot($variant->id)->where('is_active', true)->ordered()->lockForUpdate()->first();
        $product = Product::query()->findOrFail($variant->product_id);
        if (! $replacement && $product->status === 'published') { throw ValidationException::withMessages(['variant' => ['A published product must retain an active default variant.']]); }
        $variant->forceFill(['is_active' => $deactivate ? false : $variant->is_active, 'is_default' => false])->save();
        if ($replacement) { $replacement->forceFill(['is_default' => true])->save(); }
        return $variant->fresh();
    }
}
