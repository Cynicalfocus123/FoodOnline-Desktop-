<?php

namespace App\Services\Referral;

use App\Models\Order;
use App\Models\Referral;
use App\Models\ReferralReward;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReferralQualificationService
{
    public function __construct(private readonly ReferralRewardService $rewards) {}

    public function processOrder(Order $order): void
    {
        if (! $order->user_id) return;

        DB::transaction(function () use ($order): void {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);
            $referral = Referral::query()->with(['program', 'referrer'])->where('referred_user_id', $order->user_id)->lockForUpdate()->first();
            if (! $referral || ! $referral->program || ! $this->qualifies($referral, $order)) return;

            if (! $referral->first_qualifying_order_id) {
                $reward = $this->rewards->issueReferrerReward($referral, 1, $order->id, $referral->program);
                $referral->update(['first_qualifying_order_id' => $order->id, 'first_qualified_at' => now(), 'status' => 'active']);
                $this->notify($referral, $reward, 'Your first referral coupon is available.');
                return;
            }
            if (! $referral->second_qualifying_order_id && $referral->first_qualifying_order_id !== $order->id) {
                $reward = $this->rewards->issueReferrerReward($referral, 2, $order->id, $referral->program);
                $referral->update(['second_qualifying_order_id' => $order->id, 'second_qualified_at' => now(), 'completed_at' => now(), 'status' => 'completed']);
                $this->notify($referral, $reward, 'Your second referral coupon is available.');
            }
        }, 3);
    }

    public function handleFullRefund(Order $order, ?User $admin = null): void
    {
        if ($order->paid_minor > 0 && $order->refunded_minor >= $order->paid_minor) $this->rewards->revokeUnusedForOrder($order->id, $admin);
    }

    private function qualifies(Referral $referral, Order $order): bool
    {
        if (! in_array($referral->status, ['registered', 'active'], true) || $referral->review_status !== 'clear') return false;
        if (! $referral->program->isAvailable() || $order->order_status === 'cancelled' || $order->fulfillment_status !== 'delivered' || ! in_array($order->payment_status, ['paid', 'collected'], true)) return false;
        if ($order->refunded_minor >= $order->paid_minor || $order->subtotal_minor < $referral->program->minimum_order_subtotal_minor) return false;
        $deadlineDays = $referral->first_qualifying_order_id ? $referral->program->second_order_deadline_days : $referral->program->first_order_deadline_days;
        return ! $referral->registered_at || ! $order->placed_at || ! $order->placed_at->gt($referral->registered_at->copy()->addDays(max(1, (int) $deadlineDays)));
    }

    private function notify(Referral $referral, ReferralReward $reward, string $message): void
    {
        DB::afterCommit(function () use ($referral, $reward, $message): void {
            $referral->referrer?->notify(new \App\Notifications\CommerceNotification('referral_reward_earned', 'Referral coupon earned', $message, ['type' => 'referral']));
        });
    }
}
