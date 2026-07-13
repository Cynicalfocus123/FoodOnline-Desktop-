<?php

namespace App\Models;

use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;
    use SoftDeletes;

    public const STATUSES = ['draft', 'published', 'archived'];
    public const VISIBILITIES = ['public', 'hidden', 'catalog_only'];
    public const DEFAULT_SORTS = ['featured', 'popular', 'newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'];
    public const MAX_DEPTH = 3;

    protected $fillable = [
        'uuid', 'parent_id', 'name', 'slug', 'description', 'status', 'visibility',
        'sort_order', 'depth', 'path', 'image_path', 'icon_path', 'desktop_banner_path',
        'mobile_banner_path', 'is_featured', 'show_in_navigation', 'show_on_homepage',
        'default_sort', 'meta_title', 'meta_description', 'canonical_url', 'robots_index',
        'robots_follow', 'published_at', 'created_by', 'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'show_in_navigation' => 'boolean',
            'show_on_homepage' => 'boolean',
            'robots_index' => 'boolean',
            'robots_follow' => 'boolean',
            'published_at' => 'datetime',
            'sort_order' => 'integer',
            'depth' => 'integer',
        ];
    }

    public function parent(): BelongsTo { return $this->belongsTo(self::class, 'parent_id'); }
    public function children(): HasMany { return $this->hasMany(self::class, 'parent_id')->ordered(); }
    public function activeChildren(): HasMany { return $this->children()->published()->where('visibility', 'public'); }
    public function aliases(): HasMany { return $this->hasMany(CategoryAlias::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function updater(): BelongsTo { return $this->belongsTo(User::class, 'updated_by'); }

    public function scopePublished(Builder $query): Builder { return $query->where('status', 'published')->whereNotNull('published_at'); }
    public function scopeVisible(Builder $query): Builder { return $query->where('visibility', 'public'); }
    public function scopeNavigation(Builder $query): Builder { return $query->where('show_in_navigation', true)->visible(); }
    public function scopeHomepage(Builder $query): Builder { return $query->where('show_on_homepage', true)->visible(); }
    public function scopeRoots(Builder $query): Builder { return $query->whereNull('parent_id'); }
    public function scopeOrdered(Builder $query): Builder { return $query->orderBy('sort_order')->orderBy('name')->orderBy('id'); }
}
