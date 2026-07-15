<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderItem extends Model
{
    use HasPublicUuid;
    protected $guarded = [];
    protected function casts(): array { return ['quantity' => 'integer', 'unit_price_minor' => 'integer', 'old_unit_price_minor' => 'integer', 'product_discount_minor' => 'integer', 'promo_discount_minor' => 'integer', 'line_subtotal_minor' => 'integer', 'line_total_minor' => 'integer']; }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function returns(): HasMany { return $this->hasMany(ReturnRequestItem::class); }
    public function reviews(): HasMany { return $this->hasMany(ProductReview::class, 'order_item_id'); }
}
