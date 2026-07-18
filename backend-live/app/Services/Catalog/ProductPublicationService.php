<?php

namespace App\Services\Catalog;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductPublicationService
{
    /** @return array<string, array<int, string>> */
    public function readinessErrors(Product $product): array
    {
        $product->loadMissing(['category', 'variants', 'media']);
        $errors = [];
        $category = $product->category;
        $activeDefaults = $product->variants->where('is_active', true)->where('is_default', true);
        $default = $activeDefaults->first();

        if (! $category || $category->trashed() || $category->status !== 'published' || $category->published_at === null || ! in_array($category->visibility, ['public', 'catalog_only'], true)) {
            $errors['category'][] = 'The product category must be published and publicly accessible.';
        }
        if ($product->variants->where('is_active', true)->isEmpty()) { $errors['variants'][] = 'At least one active variant is required.'; }
        if ($activeDefaults->count() !== 1) { $errors['default_variant'][] = 'Exactly one active default variant is required.'; }
        if ($default && (trim((string) $default->sku) === '' || (float) $default->price_amount <= 0 || $default->currency_code !== config('foodonlines.catalog_currency'))) {
            $errors['default_variant'][] = 'The default variant must have a SKU, positive price, and configured catalog currency.';
        }
        return $errors;
    }

    public function publish(Product $product, User $admin): Product
    {
        return DB::transaction(function () use ($product, $admin): Product {
            $locked = Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();
            if (! in_array($locked->status, ['draft', 'archived'], true)) {
                throw ValidationException::withMessages(['status' => ['Only draft or archived products may be published.']]);
            }
            $errors = $this->readinessErrors($locked);
            if ($errors !== []) { throw ValidationException::withMessages($errors); }
            $locked->forceFill(['status' => 'published', 'published_at' => now(), 'updated_by' => $admin->id])->save();
            return $locked->fresh();
        });
    }

    public function archive(Product $product, User $admin): Product
    {
        return DB::transaction(function () use ($product, $admin): Product {
            $locked = Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();
            $locked->forceFill(['status' => 'archived', 'published_at' => null, 'updated_by' => $admin->id])->save();
            return $locked->fresh();
        });
    }

    public function restore(Product $product, User $admin): Product
    {
        return DB::transaction(function () use ($product, $admin): Product {
            $locked = Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();
            if ($locked->status !== 'archived') { throw ValidationException::withMessages(['status' => ['Only archived products may be restored.']]); }
            $locked->forceFill(['status' => 'draft', 'published_at' => null, 'updated_by' => $admin->id])->save();
            return $locked->fresh();
        });
    }
}
