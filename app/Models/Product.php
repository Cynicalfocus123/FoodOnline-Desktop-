<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    public const STATUSES = ['draft', 'published', 'archived'];
    public const STORAGE_TYPES = ['ambient', 'refrigerated', 'frozen'];

    protected $fillable = [
        'uuid', 'category_id', 'brand_id', 'name', 'slug', 'description', 'country_of_origin_code',
        'storage_type', 'ingredients_text', 'allergen_statement', 'storage_instructions', 'status',
        'is_featured', 'published_at', 'created_by', 'updated_by',
    ];

    protected static function booted(): void
    {
        static::creating(function (Product $product): void {
            $product->uuid ??= (string) Str::uuid();
        });
    }

    protected function casts(): array
    {
        return ['is_featured' => 'boolean', 'published_at' => 'datetime'];
    }

    public function getRouteKeyName(): string { return 'uuid'; }
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function brand(): BelongsTo { return $this->belongsTo(Brand::class); }
    public function variants(): HasMany { return $this->hasMany(ProductVariant::class); }
    public function activeVariants(): HasMany { return $this->variants()->active()->ordered(); }
    public function defaultVariant(): HasOne { return $this->hasOne(ProductVariant::class)->where('is_active', true)->where('is_default', true); }
    public function media(): HasMany { return $this->hasMany(ProductMedia::class); }
    public function primaryMedia(): HasOne { return $this->hasOne(ProductMedia::class)->where('is_primary', true); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function updater(): BelongsTo { return $this->belongsTo(User::class, 'updated_by'); }
    public function scopePublished(Builder $query): Builder { return $query->where('status', 'published')->whereNotNull('published_at'); }
    public function scopeDrafts(Builder $query): Builder { return $query->where('status', 'draft'); }
    public function scopeArchived(Builder $query): Builder { return $query->where('status', 'archived'); }
    public function scopeFeatured(Builder $query): Builder { return $query->where('is_featured', true); }
    public function scopeOrdered(Builder $query): Builder { return $query->orderByDesc('is_featured')->orderByDesc('published_at')->orderBy('name')->orderBy('id'); }
    public function scopeInCategory(Builder $query, int $categoryId): Builder { return $query->where('category_id', $categoryId); }
    public function scopeForBrand(Builder $query, int $brandId): Builder { return $query->where('brand_id', $brandId); }
}
