<?php

namespace App\Services\Referral;

use App\Models\Referral;
use App\Models\ReferralProgram;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReferralAttributionService
{
    public function __construct(
        private readonly ReferralCodeService $codes,
        private readonly ReferralRewardService $rewards,
    ) {}

    public function attributeRegisteredCustomer(User $referred, ?string $incomingCode): ?Referral
    {
        if (! $this->codes->isReady()) {
            return null;
        }
        if (! $this->codes->isEligible($referred) || ! $incomingCode) {
            return null;
        }
        $program = ReferralProgram::active();
        if (! $program || ! $program->isAvailable()) {
            throw ValidationException::withMessages(['referral_code' => ['This referral code is not available.']]);
        }
        $code = $this->codes->findActive($incomingCode);
        if (! $code || ! $code->user || ! $this->codes->isEligible($code->user)) {
            throw ValidationException::withMessages(['referral_code' => ['This referral code is not available.']]);
        }
        if ($code->user_id === $referred->id) {
            throw ValidationException::withMessages(['referral_code' => ['You cannot use your own referral code.']]);
        }

        $existing = Referral::query()->where('referred_user_id', $referred->id)->first();
        if ($existing) return $existing;
        if ($program->maximum_successful_referrals_per_user !== null && Referral::query()->where('referrer_user_id', $code->user_id)->whereIn('status', ['registered', 'active', 'completed'])->count() >= $program->maximum_successful_referrals_per_user) {
            throw ValidationException::withMessages(['referral_code' => ['This referral code is not available.']]);
        }

        $referral = Referral::query()->create([
            'referral_program_id' => $program->id,
            'referral_code_id' => $code->id,
            'referrer_user_id' => $code->user_id,
            'referred_user_id' => $referred->id,
            'status' => 'registered',
            'registered_at' => now(),
            'review_status' => 'clear',
            'program_snapshot' => $this->snapshot($program),
        ]);
        $this->rewards->issueFriendEntitlements($referral, $program);
        DB::afterCommit(function () use ($code, $referred): void {
            $code->user?->notify(new \App\Notifications\CommerceNotification('referral_registered', 'A friend registered', 'Your referral is waiting for a qualifying order.', ['type' => 'referral']));
            $referred->notify(new \App\Notifications\CommerceNotification('referral_coupon_issued', 'Referral coupons available', 'Your new-customer referral coupons are available in your account.', ['type' => 'referral']));
        });
        return $referral;
    }

    /** @return array<string, mixed> */
    public function snapshot(ReferralProgram $program): array
    {
        return [
            'name' => $program->name, 'currency_code' => $program->currency_code,
            'referrer_first_reward_minor' => $program->referrer_first_reward_minor, 'referrer_second_reward_minor' => $program->referrer_second_reward_minor,
            'referee_first_discount_minor' => $program->referee_first_discount_minor, 'referee_second_discount_minor' => $program->referee_second_discount_minor,
            'minimum_order_subtotal_minor' => $program->minimum_order_subtotal_minor,
            'first_order_deadline_days' => $program->first_order_deadline_days, 'second_order_deadline_days' => $program->second_order_deadline_days,
            'reward_expiration_days' => $program->reward_expiration_days, 'terms_content' => $program->terms_content,
        ];
    }
}
