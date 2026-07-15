<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReturnRequest extends Model
{
    use HasPublicUuid;

    public const STATUSES = ['requested', 'under_review', 'information_required', 'approved', 'rejected', 'awaiting_item', 'received', 'inspection', 'refund_pending', 'refunded', 'closed', 'cancelled'];
    public const REASONS = ['damaged', 'incorrect_item', 'missing_item', 'expired', 'quality_issue', 'not_as_described', 'changed_mind', 'other'];

    protected $fillable = ['uuid', 'return_number', 'order_id', 'user_id', 'guest_access_token_hash', 'status', 'requested_resolution', 'reason_code', 'customer_explanation', 'admin_decision_reason', 'refund_status', 'refund_amount_minor', 'currency_code', 'requested_at', 'reviewed_at', 'approved_at', 'rejected_at', 'received_at', 'closed_at', 'cancelled_at'];
    protected $hidden = ['guest_access_token_hash'];
    protected function casts(): array { return ['refund_amount_minor' => 'integer', 'requested_at' => 'datetime', 'reviewed_at' => 'datetime', 'approved_at' => 'datetime', 'rejected_at' => 'datetime', 'received_at' => 'datetime', 'closed_at' => 'datetime', 'cancelled_at' => 'datetime']; }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function items(): HasMany { return $this->hasMany(ReturnRequestItem::class); }
    public function media(): HasMany { return $this->hasMany(ReturnMedia::class); }
}
