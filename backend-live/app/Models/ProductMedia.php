<?php

namespace App\Models;

use Database\Factories\ProductMediaFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductMedia extends Model
{
    /** @use HasFactory<ProductMediaFactory> */
    use HasFactory;

    public const IMAGE_FITS = ['contain', 'cover'];

    protected $table = 'product_media';
    protected $fillable = ['product_id', 'path', 'alt_text', 'image_fit', 'is_primary', 'sort_order'];

    protected function casts(): array
    {
        return ['is_primary' => 'boolean', 'sort_order' => 'integer'];
    }

    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
    public function scopePrimary(Builder $query): Builder { return $query->where('is_primary', true); }
    public function scopeOrdered(Builder $query): Builder { return $query->orderByDesc('is_primary')->orderBy('sort_order')->orderBy('id'); }
}
