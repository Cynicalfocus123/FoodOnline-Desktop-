<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentRefund extends Model
{
    use HasPublicUuid;
    protected $guarded = [];
    protected function casts(): array { return ['amount_minor' => 'integer', 'metadata' => 'array', 'requested_at' => 'datetime', 'completed_at' => 'datetime']; }
    public function payment(): BelongsTo { return $this->belongsTo(OrderPayment::class, 'order_payment_id'); }
}
