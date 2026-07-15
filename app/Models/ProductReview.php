<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductReview extends Model
{
    use HasPublicUuid, SoftDeletes;

    public const STATUSES = ['pending', 'published', 'rejected', 'hidden'];
    public const REPORT_REASONS = ['spam', 'offensive', 'irrelevant', 'suspected_fake', 'personal_information', 'other'];
    protected $fillable = ['uuid', 'product_id', 'product_variant_id', 'user_id', 'order_id', 'order_item_id', 'rating', 'title', 'body', 'status', 'verified_purchase', 'published_at', 'edited_at'];
    protected function casts(): array { return ['rating' => 'integer', 'verified_purchase' => 'boolean', 'published_at' => 'datetime', 'edited_at' => 'datetime']; }
    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
    public function variant(): BelongsTo { return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function orderItem(): BelongsTo { return $this->belongsTo(OrderItem::class); }
    public function media(): HasMany { return $this->hasMany(ReviewMedia::class); }
    public function votes(): HasMany { return $this->hasMany(ReviewHelpfulVote::class); }
    public function reports(): HasMany { return $this->hasMany(ReviewReport::class); }
    public function scopePublished(Builder $query): Builder { return $query->where('status', 'published')->whereNotNull('published_at'); }
}
