<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderPayment extends Model
{
    use HasPublicUuid;
    protected $guarded = [];
    protected function casts(): array { return ['amount_minor' => 'integer', 'refunded_minor' => 'integer', 'metadata' => 'array', 'authorized_at' => 'datetime', 'paid_at' => 'datetime', 'cancelled_at' => 'datetime']; }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function refunds(): HasMany { return $this->hasMany(PaymentRefund::class); }
}
