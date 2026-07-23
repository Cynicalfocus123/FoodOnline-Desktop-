<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Schema;

class ReferralProgram extends Model
{
    use HasPublicUuid;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime', 'ends_at' => 'datetime',
            'manual_code_entry_enabled' => 'boolean', 'require_verified_email' => 'boolean', 'require_verified_phone' => 'boolean',
        ];
    }

    public function referrals(): HasMany { return $this->hasMany(Referral::class); }

    public function isAvailable(): bool
    {
        return $this->status === 'active' && (! $this->starts_at || ! $this->starts_at->isFuture()) && (! $this->ends_at || ! $this->ends_at->isPast());
    }

    public static function active(): ?self
    {
        if (! Schema::hasTable('referral_programs')) {
            return null;
        }

        return static::query()->where('status', 'active')->where(fn ($query) => $query->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>=', now()))->latest('id')->first();
    }
}
