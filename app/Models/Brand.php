<?php

namespace App\Models;

use Database\Factories\BrandFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Brand extends Model
{
    /** @use HasFactory<BrandFactory> */
    use HasFactory;

    protected $fillable = ['uuid', 'name', 'slug', 'logo_path', 'country_code', 'is_active', 'sort_order', 'created_by', 'updated_by'];

    protected static function booted(): void
    {
        static::creating(function (Brand $brand): void {
            $brand->uuid ??= (string) Str::uuid();
        });
    }

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'sort_order' => 'integer'];
    }

    public function getRouteKeyName(): string { return 'uuid'; }
    public function products(): HasMany { return $this->hasMany(Product::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function updater(): BelongsTo { return $this->belongsTo(User::class, 'updated_by'); }
    public function scopeActive(Builder $query): Builder { return $query->where('is_active', true); }
    public function scopeOrdered(Builder $query): Builder { return $query->orderBy('sort_order')->orderBy('name')->orderBy('id'); }
}
