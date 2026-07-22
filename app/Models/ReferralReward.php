<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralReward extends Model
{
    use HasPublicUuid;

    protected $guarded = [];
    protected function casts(): array { return ['amount_minor' => 'integer', 'issued_at' => 'datetime', 'expires_at' => 'datetime', 'redeemed_at' => 'datetime', 'revoked_at' => 'datetime']; }
    public function referral(): BelongsTo { return $this->belongsTo(Referral::class); }
    public function beneficiary(): BelongsTo { return $this->belongsTo(User::class, 'beneficiary_user_id'); }
    public function qualifyingOrder(): BelongsTo { return $this->belongsTo(Order::class, 'qualifying_order_id'); }
    public function promotion(): BelongsTo { return $this->belongsTo(Promotion::class); }
}
