<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnRequestItem extends Model
{
    protected $fillable = ['return_request_id', 'order_item_id', 'quantity_requested', 'quantity_approved', 'quantity_received', 'condition_code', 'inspection_notes', 'restock_quantity', 'non_restock_reason', 'resolution'];
    protected function casts(): array { return ['quantity_requested' => 'integer', 'quantity_approved' => 'integer', 'quantity_received' => 'integer', 'restock_quantity' => 'integer']; }
    public function request(): BelongsTo { return $this->belongsTo(ReturnRequest::class, 'return_request_id'); }
    public function orderItem(): BelongsTo { return $this->belongsTo(OrderItem::class); }
}
