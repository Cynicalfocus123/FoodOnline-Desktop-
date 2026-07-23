<?php

namespace App\Services\Referral;

use App\Models\Promotion;
use App\Models\Referral;
use App\Models\ReferralProgram;
use App\Models\ReferralReward;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class ReferralRewardService
{
    public function __construct(private readonly ReferralCodeService $codes) {}

    public function issueFriendEntitlements(Referral $referral, ReferralProgram $program): void
    {
        $this->issue($referral, $referral->referred_user_id, null, 'referee_first_order_discount', $program->referee_first_discount_minor, $program);
        $this->issue($referral, $referral->referred_user_id, null, 'referee_second_order_discount', $program->referee_second_discount_minor, $program);
    }

    public function issueReferrerReward(Referral $referral, int $milestone, int $orderId, ReferralProgram $program): ReferralReward
    {
        $name = $milestone === 1 ? 'referrer_first_order' : 'referrer_second_order';
        $amount = $milestone === 1 ? $program->referrer_first_reward_minor : $program->referrer_second_reward_minor;
        return $this->issue($referral, $referral->referrer_user_id, $orderId, $name, $amount, $program);
    }

    public function markRedeemed(Promotion $promotion, int $orderId): void
    {
        $reward = ReferralReward::query()->where('promotion_id', $promotion->id)->lockForUpdate()->first();
        if ($reward && $reward->status === 'issued') {
            $reward->update(['status' => 'redeemed', 'redeemed_at' => now(), 'qualifying_order_id' => $reward->qualifying_order_id ?: $orderId]);
        }
    }

    public function revokeUnusedForOrder(int $orderId, ?User $admin = null, string $reason = 'Qualifying order was fully refunded.'): void
    {
        ReferralReward::query()->where('qualifying_order_id', $orderId)->with('promotion')->lockForUpdate()->get()->each(function (ReferralReward $reward) use ($admin, $reason): void {
            if ($reward->status === 'issued') {
                $reward->update(['status' => 'revoked', 'revoked_at' => now(), 'revoked_by' => $admin?->id, 'revocation_reason' => $reason]);
                $reward->promotion?->update(['active' => false, 'archived_at' => now()]);
                DB::afterCommit(function () use ($reward): void {
                    $reward->beneficiary?->notify(new \App\Notifications\CommerceNotification('referral_reward_revoked', 'Referral coupon updated', 'A referral coupon is no longer available.', ['type' => 'referral', 'referral_id' => $reward->referral?->uuid]));
                });
            }
            if ($reward->status === 'redeemed') {
                $reward->referral()->update(['status' => 'under_review', 'review_status' => 'under_review']);
                DB::afterCommit(function () use ($reward): void {
                    $reward->beneficiary?->notify(new \App\Notifications\CommerceNotification('referral_reward_review', 'Referral reward under review', 'A referral reward needs review after an order update.', ['type' => 'referral', 'referral_id' => $reward->referral?->uuid]));
                });
            }
        });
    }

    private function issue(Referral $referral, int $beneficiaryId, ?int $orderId, string $milestone, int $amount, ReferralProgram $program): ReferralReward
    {
        $existing = ReferralReward::query()->where('referral_id', $referral->id)->where('milestone', $milestone)->first();
        if ($existing) return $existing;

        $promotion = $this->createAccountCoupon($beneficiaryId, $milestone, $amount, $program);
        try {
            return ReferralReward::query()->create([
                'referral_id' => $referral->id,
                'beneficiary_user_id' => $beneficiaryId,
                'qualifying_order_id' => $orderId,
                'milestone' => $milestone,
                'reward_type' => 'coupon',
                'amount_minor' => $amount,
                'currency_code' => $program->currency_code,
                'status' => 'issued',
                'promotion_id' => $promotion->id,
                'issued_at' => now(),
                'expires_at' => now()->addDays(max(1, (int) $program->reward_expiration_days)),
                'idempotency_key' => 'referral:'.$referral->id.':'.$milestone,
            ]);
        } catch (QueryException) {
            return ReferralReward::query()->where('referral_id', $referral->id)->where('milestone', $milestone)->firstOrFail();
        }
    }

    private function createAccountCoupon(int $beneficiaryId, string $milestone, int $amount, ReferralProgram $program): Promotion
    {
        for ($attempt = 0; $attempt < 12; $attempt++) {
            try {
                return Promotion::query()->create([
                    'code' => $this->codes->candidate('FOLR', 8),
                    'name' => 'Referral reward',
                    'description' => 'Account-bound referral coupon.',
                    'discount_type' => 'fixed',
                    'discount_value' => $amount,
                    'minimum_subtotal_minor' => $program->minimum_order_subtotal_minor,
                    'currency_code' => $program->currency_code,
                    'starts_at' => now(),
                    'ends_at' => now()->addDays(max(1, (int) $program->reward_expiration_days)),
                    'total_usage_limit' => 1,
                    'per_user_usage_limit' => 1,
                    'usage_count' => 0,
                    'active' => true,
                    'applies_to' => 'all',
                ]);
            } catch (QueryException) {
                continue;
            }
        }
        throw new \RuntimeException('Unable to create an account-bound referral coupon.');
    }
}
