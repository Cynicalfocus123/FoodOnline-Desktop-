<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    public const AVAILABILITY_STATUSES = ['in_stock', 'out_of_stock', 'preorder', 'backorder'];
    public const NET_CONTENT_UNITS = ['mg', 'g', 'kg', 'ml', 'l', 'fl_oz', 'oz', 'lb', 'ct'];
    public const PACKAGE_TYPES = ['bag', 'box', 'bottle', 'can', 'jar', 'pouch', 'carton', 'tray', 'tub', 'pack', 'other'];

    protected $fillable = [
        'uuid', 'product_id', 'title', 'sku', 'gtin', 'size_label', 'net_content_value', 'net_content_unit',
        'pack_count', 'package_type', 'price_amount', 'compare_at_price_amount', 'currency_code',
        'availability_status', 'is_default', 'is_active', 'sort_order',
    ];

    protected static function booted(): void
    {
        static::creating(function (ProductVariant $variant): void {
            $variant->uuid ??= (string) Str::uuid();
            $variant->sku = strtoupper(trim((string) $variant->sku));
        });
        static::updating(function (ProductVariant $variant): void {
            if ($variant->isDirty('sku')) { $variant->sku = strtoupper(trim((string) $variant->sku)); }
        });
    }

    protected function casts(): array
    {
        return [
            'net_content_value' => 'decimal:3', 'price_amount' => 'decimal:2', 'compare_at_price_amount' => 'decimal:2',
            'pack_count' => 'integer', 'is_default' => 'boolean', 'is_active' => 'boolean', 'sort_order' => 'integer',
        ];
    }

    public function getRouteKeyName(): string { return 'uuid'; }
    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
    public function inventory(): HasOne { return $this->hasOne(VariantInventory::class); }
    public function cartItems(): HasMany { return $this->hasMany(CartItem::class, 'product_variant_id'); }
    public function reservations(): HasMany { return $this->hasMany(InventoryReservation::class, 'product_variant_id'); }
    public function inventoryMovements(): HasMany { return $this->hasMany(InventoryMovement::class, 'product_variant_id'); }
    public function savedItems(): HasMany { return $this->hasMany(UserSavedItem::class, 'product_variant_id'); }
    public function reviews(): HasMany { return $this->hasMany(ProductReview::class, 'product_variant_id'); }
    public function scopeActive(Builder $query): Builder { return $query->where('is_active', true); }
    public function scopeAvailable(Builder $query): Builder { return $query->active()->whereIn('availability_status', ['in_stock', 'preorder', 'backorder']); }
    public function scopeOrdered(Builder $query): Builder { return $query->orderByDesc('is_default')->orderBy('sort_order')->orderBy('id'); }

    public function displaySize(): ?string
    {
        if ($this->size_label) { return $this->size_label; }
        if ($this->net_content_value === null || $this->net_content_unit === null) { return null; }
        $value = rtrim(rtrim(number_format((float) $this->net_content_value, 3, '.', ''), '0'), '.');
        return ($this->pack_count > 1 ? $this->pack_count.' x ' : '').$value.' '.str_replace('_', ' ', $this->net_content_unit);
    }
}
