<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryMovement extends Model
{
    use HasPublicUuid;
    public const UPDATED_AT = null;

    protected $fillable = ['uuid', 'product_variant_id', 'admin_user_id', 'order_id', 'reservation_id', 'return_request_id', 'movement_type', 'quantity_delta', 'quantity_before', 'quantity_after', 'reserved_before', 'reserved_after', 'reason', 'metadata'];
    protected function casts(): array { return ['metadata' => 'array', 'quantity_delta' => 'integer']; }
    public function variant(): BelongsTo { return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
    public function reservation(): BelongsTo { return $this->belongsTo(InventoryReservation::class, 'reservation_id'); }
    public function returnRequest(): BelongsTo { return $this->belongsTo(ReturnRequest::class, 'return_request_id'); }
}
