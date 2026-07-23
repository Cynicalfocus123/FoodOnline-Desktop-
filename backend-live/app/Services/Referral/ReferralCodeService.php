<?php

namespace App\Services\Referral;

use App\Models\ReferralCode;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class ReferralCodeService
{
    private const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    public const ELIGIBLE_ACCOUNT_TYPES = ['customer', 'supplier', 'partner'];

    public function isEligible(User $user): bool
    {
        return $this->accountType($user) !== null && $user->role !== 'admin' && ! $user->staff_role && $user->status === 'active';
    }

    public function accountType(User $user): ?string
    {
        $accountType = strtolower((string) ($user->account_type ?: $user->role));

        return in_array($accountType, self::ELIGIBLE_ACCOUNT_TYPES, true) ? $accountType : null;
    }

    public function normalize(?string $code): string
    {
        return strtoupper(preg_replace('/[^A-Z2-9]/', '', strtoupper(trim((string) $code))) ?? '');
    }

    public function candidate(string $prefix = 'FOL', int $length = 6): string
    {
        $value = '';
        for ($index = 0; $index < $length; $index++) {
            $value .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
        }
        return $prefix.$value;
    }

    public function __construct(private readonly ReferralSchema $schema) {}

    public function ensure(User $user): ?ReferralCode
    {
        if (! $this->schema->isReady()) {
            return null;
        }

        $existing = ReferralCode::query()->where('user_id', $user->id)->first();
        if ($existing || ! $this->isEligible($user)) return $existing;

        for ($attempt = 0; $attempt < 12; $attempt++) {
            try {
                return ReferralCode::query()->create(['user_id' => $user->id, 'code' => $this->candidate(), 'status' => 'active', 'generated_at' => now()]);
            } catch (QueryException) {
                $existing = ReferralCode::query()->where('user_id', $user->id)->first();
                if ($existing) return $existing;
                continue;
            }
        }
        throw ValidationException::withMessages(['referral_code' => ['A referral code could not be created. Please try again.']]);
    }

    public function findActive(?string $code): ?ReferralCode
    {
        if (! $this->schema->isReady()) {
            return null;
        }

        $normalized = $this->normalize($code);
        if ($normalized === '') return null;
        return ReferralCode::query()->with('user')->whereRaw('UPPER(code) = ?', [$normalized])->where('status', 'active')->first();
    }

    public function disable(ReferralCode $code): void
    {
        if ($code->status !== 'disabled') $code->update(['status' => 'disabled', 'disabled_at' => now()]);
    }

    public function isReady(): bool
    {
        return $this->schema->isReady();
    }
}
