<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralCode extends Model
{
    use HasPublicUuid;

    protected $guarded = [];
    protected function casts(): array { return ['generated_at' => 'datetime', 'disabled_at' => 'datetime']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
