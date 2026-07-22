<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Referral extends Model
{
    use HasPublicUuid;

    protected $guarded = [];
    protected function casts(): array { return ['registered_at' => 'datetime', 'first_qualified_at' => 'datetime', 'second_qualified_at' => 'datetime', 'completed_at' => 'datetime', 'disqualified_at' => 'datetime', 'reviewed_at' => 'datetime', 'program_snapshot' => 'array']; }
    public function program(): BelongsTo { return $this->belongsTo(ReferralProgram::class, 'referral_program_id'); }
    public function code(): BelongsTo { return $this->belongsTo(ReferralCode::class, 'referral_code_id'); }
    public function referrer(): BelongsTo { return $this->belongsTo(User::class, 'referrer_user_id'); }
    public function referred(): BelongsTo { return $this->belongsTo(User::class, 'referred_user_id'); }
    public function firstQualifyingOrder(): BelongsTo { return $this->belongsTo(Order::class, 'first_qualifying_order_id'); }
    public function secondQualifyingOrder(): BelongsTo { return $this->belongsTo(Order::class, 'second_qualifying_order_id'); }
    public function rewards(): HasMany { return $this->hasMany(ReferralReward::class); }
}
