<?php

namespace App\Services\Catalog;

use App\Models\Product;
use App\Models\ProductMedia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Services\Media\ManagedMediaDeletionService;

class ProductMediaService
{
    public function __construct(private readonly ManagedMediaDeletionService $deletion) {}

    /** @param array<string, mixed> $data */
    public function create(Product $product, array $data): ProductMedia
    {
        return DB::transaction(function () use ($product, $data): ProductMedia {
            Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();
            $media = ProductMedia::query()->where('product_id', $product->id)->lockForUpdate();
            if ($media->count() >= 12) { throw ValidationException::withMessages(['path' => ['A product may have at most 12 images.']]); }
            $primary = (bool) ($data['is_primary'] ?? false) || ! (clone $media)->where('is_primary', true)->exists();
            if ($primary) { (clone $media)->update(['is_primary' => false]); }
            return $product->media()->create([...$data, 'is_primary' => $primary])->fresh();
        });
    }

    /** @param array<string, mixed> $data */
    public function update(ProductMedia $media, array $data): ProductMedia
    {
        return DB::transaction(function () use ($media, $data): ProductMedia {
            Product::query()->whereKey($media->product_id)->lockForUpdate()->firstOrFail();
            $locked = ProductMedia::query()->whereKey($media->id)->lockForUpdate()->firstOrFail();
            $oldPath = $locked->path;
            if ((bool) ($data['is_primary'] ?? false)) {
                ProductMedia::query()->where('product_id', $locked->product_id)->whereKeyNot($locked->id)->update(['is_primary' => false]);
            }
            if (array_key_exists('is_primary', $data) && ! $data['is_primary'] && $locked->is_primary) {
                throw ValidationException::withMessages(['is_primary' => ['Use another image as primary before clearing the primary image.']]);
            }
            $locked->fill($data)->save();
            if ($oldPath !== $locked->path) { $this->deletion->afterCommit($oldPath); }
            return $locked->fresh();
        });
    }

    public function makePrimary(ProductMedia $media): ProductMedia { return $this->update($media, ['is_primary' => true]); }

    public function delete(ProductMedia $media): void
    {
        DB::transaction(function () use ($media): void {
            $product = Product::query()->whereKey($media->product_id)->lockForUpdate()->firstOrFail();
            $locked = ProductMedia::query()->whereKey($media->id)->lockForUpdate()->firstOrFail();
            $remaining = ProductMedia::query()->where('product_id', $product->id)->whereKeyNot($locked->id)->ordered()->lockForUpdate()->get();
            $wasPrimary = $locked->is_primary;
            $path = $locked->path;
            $locked->delete();
            if ($wasPrimary && $remaining->isNotEmpty()) { $remaining->first()->forceFill(['is_primary' => true])->save(); }
            $this->deletion->afterCommit($path);
        });
    }

    /** @param array<int, int> $ids */
    public function reorder(Product $product, array $ids): void
    {
        DB::transaction(function () use ($product, $ids): void {
            Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();
            $media = ProductMedia::query()->where('product_id', $product->id)->lockForUpdate()->get();
            if ($media->pluck('id')->sort()->values()->all() !== collect($ids)->sort()->values()->all()) {
                throw ValidationException::withMessages(['media_ids' => ['Provide every product image exactly once.']]);
            }
            foreach ($ids as $position => $id) { ProductMedia::query()->where('product_id', $product->id)->whereKey($id)->update(['sort_order' => $position]); }
        });
    }
}
