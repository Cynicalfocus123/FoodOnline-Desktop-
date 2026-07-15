<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryReservation extends Model
{
    use HasPublicUuid;

    protected $fillable = ['uuid', 'cart_id', 'order_id', 'product_variant_id', 'quantity', 'status', 'expires_at', 'consumed_at', 'released_at', 'release_reason'];
    protected function casts(): array { return ['quantity' => 'integer', 'expires_at' => 'datetime', 'consumed_at' => 'datetime', 'released_at' => 'datetime']; }
    public function cart(): BelongsTo { return $this->belongsTo(Cart::class); }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function variant(): BelongsTo { return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
}
