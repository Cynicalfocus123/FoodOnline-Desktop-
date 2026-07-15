<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VariantInventory extends Model
{
    use HasPublicUuid;

    protected $fillable = ['uuid', 'product_variant_id', 'quantity_on_hand', 'quantity_reserved', 'low_stock_threshold', 'tracking_enabled', 'allow_backorder', 'updated_by'];
    protected function casts(): array { return ['quantity_on_hand' => 'integer', 'quantity_reserved' => 'integer', 'low_stock_threshold' => 'integer', 'tracking_enabled' => 'boolean', 'allow_backorder' => 'boolean']; }
    public function variant(): BelongsTo { return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
    public function updater(): BelongsTo { return $this->belongsTo(User::class, 'updated_by'); }
    public function availableQuantity(): int { return max(0, $this->quantity_on_hand - $this->quantity_reserved); }
}
