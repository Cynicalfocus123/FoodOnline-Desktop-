<?php

namespace App\Services\Commerce;

use App\Models\AdminAuditLog;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\PaymentRefund;
use App\Models\User;
use App\Notifications\CommerceNotification;
use App\Services\Referral\ReferralQualificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderManagementService
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly ReferralQualificationService $referrals,
    ) {}

    public function adminAction(Order $order, string $action, array $input, User $admin, Request $request): Order
    {
        return DB::transaction(function () use ($order, $action, $input, $admin, $request): Order {
            $order = Order::query()->with(['payment', 'reservations'])->lockForUpdate()->findOrFail($order->id);
            $before = $order->toArray();
            $previous = ['order' => $order->order_status, 'payment' => $order->payment_status, 'fulfillment' => $order->fulfillment_status];
            $message = match ($action) {
                'confirm' => $this->confirm($order),
                'processing' => $this->processing($order),
                'ship' => $this->ship($order, $input),
                'deliver' => $this->deliver($order),
                'cancel' => $this->cancel($order, $input['reason'] ?? 'Cancelled by administrator.'),
                'collect_cod' => $this->collectCod($order),
                'refund' => $this->refund($order, $input, $admin),
                default => throw ValidationException::withMessages(['action' => ['Unsupported order action.']]),
            };
            $order->save();
            if (in_array($action, ['deliver', 'collect_cod'], true)) {
                $this->referrals->processOrder($order);
            }
            if ($action === 'refund') {
                $this->referrals->handleFullRefund($order, $admin);
            }
            OrderStatusHistory::query()->create(['order_id' => $order->id, 'actor_type' => 'admin', 'actor_id' => $admin->id,
                'event_type' => 'order.'.$action, 'previous_order_status' => $previous['order'], 'new_order_status' => $order->order_status,
                'previous_payment_status' => $previous['payment'], 'new_payment_status' => $order->payment_status,
                'previous_fulfillment_status' => $previous['fulfillment'], 'new_fulfillment_status' => $order->fulfillment_status,
                'customer_visible_message' => $message, 'internal_message' => $input['reason'] ?? null,
                'metadata' => array_filter(['carrier_name' => $order->carrier_name, 'tracking_number' => $order->tracking_number])]);
            AdminAuditLog::query()->create(['admin_user_id' => $admin->id, 'action' => 'order.'.$action, 'subject_type' => Order::class,
                'subject_id' => $order->id, 'before_payload' => $before, 'after_payload' => $order->fresh()->toArray(),
                'ip_address' => $request->ip(), 'user_agent' => substr((string) $request->userAgent(), 0, 1000)]);
            DB::afterCommit(function () use ($order, $action, $message): void {
                if ($order->user_id && $order->user) { $order->user->notify(new CommerceNotification('order_'.$action, 'Order update', $message, ['type' => 'order', 'uuid' => $order->uuid])); }
            });

            return $order->fresh()->load(['user', 'items', 'addresses', 'payment.refunds', 'history', 'reservations']);
        }, 3);
    }

    public function cancelByCustomer(Order $order, User $user): Order
    {
        return DB::transaction(function () use ($order, $user): Order {
            $order = Order::query()->lockForUpdate()->findOrFail($order->id);
            if ($order->user_id !== $user->id) { abort(404); }
            $window = (int) config('foodonlines.commerce.order_cancellation_minutes', 60);
            if ($window <= 0 || ($order->placed_at && $order->placed_at->copy()->addMinutes($window)->isPast())) {
                throw ValidationException::withMessages(['order' => ['This order is no longer eligible for cancellation.']]);
            }
            $previous = [$order->order_status, $order->fulfillment_status];
            $message = $this->cancel($order, 'Cancelled by customer.');
            $order->save();
            OrderStatusHistory::query()->create(['order_id' => $order->id, 'actor_type' => 'user', 'actor_id' => $user->id,
                'event_type' => 'order.cancelled', 'previous_order_status' => $previous[0], 'new_order_status' => 'cancelled',
                'previous_fulfillment_status' => $previous[1], 'new_fulfillment_status' => 'cancelled', 'customer_visible_message' => $message]);
            return $order->fresh()->load(['items', 'addresses', 'payment.refunds', 'history', 'reservations']);
        }, 3);
    }

    private function confirm(Order $order): string { if ($order->order_status === 'confirmed') { return 'Order was already confirmed.'; } if ($order->order_status !== 'pending') { throw ValidationException::withMessages(['action' => ['Only a pending order can be confirmed.']]); } $order->order_status = 'confirmed'; $order->confirmed_at = now(); return 'Your order was confirmed.'; }
    private function processing(Order $order): string { $this->requireNotCancelled($order); if (! in_array($order->order_status, ['confirmed', 'processing'], true)) { throw ValidationException::withMessages(['action' => ['Confirm the order before processing it.']]); } $order->order_status = 'processing'; $order->fulfillment_status = 'processing'; return 'Your order is being prepared.'; }
    private function ship(Order $order, array $input): string { $this->requireNotCancelled($order); if ($order->fulfillment_status === 'shipped') { return 'Order was already shipped.'; } if ($order->fulfillment_status !== 'processing') { throw ValidationException::withMessages(['action' => ['Mark the order as processing before shipping it.']]); } if (! ($input['carrier_name'] ?? null) || ! ($input['tracking_number'] ?? null)) { throw ValidationException::withMessages(['tracking_number' => ['Carrier and tracking number are required.']]); } $this->inventory->consumeOrder($order); $order->order_status = 'processing'; $order->fulfillment_status = 'shipped'; $order->carrier_name = $input['carrier_name']; $order->tracking_number = $input['tracking_number']; $order->shipped_at ??= now(); return 'Your order has shipped.'; }
    private function deliver(Order $order): string { $this->requireNotCancelled($order); if ($order->fulfillment_status === 'delivered') { return 'Order was already delivered.'; } if ($order->fulfillment_status !== 'shipped') { throw ValidationException::withMessages(['action' => ['Only a shipped order can be delivered.']]); } $order->fulfillment_status = 'delivered'; $order->order_status = 'completed'; $order->delivered_at ??= now(); $order->completed_at ??= now(); return 'Your order was delivered.'; }
    private function cancel(Order $order, string $reason): string { if (in_array($order->fulfillment_status, ['shipped', 'delivered'], true)) { throw ValidationException::withMessages(['action' => ['A shipped or delivered order cannot be cancelled through this action.']]); } if ($order->payment_status === 'paid') { throw ValidationException::withMessages(['action' => ['Paid orders require a refund workflow before cancellation.']]); } if ($order->order_status === 'cancelled') { return 'Order was already cancelled.'; } $this->inventory->releaseOrder($order, $reason); $order->order_status = 'cancelled'; $order->payment_status = $order->payment_status === 'pending' ? 'cancelled' : $order->payment_status; $order->fulfillment_status = 'cancelled'; $order->cancelled_at ??= now(); $order->payment?->update(['status' => $order->payment_status, 'cancelled_at' => now()]); return 'Your order was cancelled.'; }
    private function collectCod(Order $order): string { if ($order->order_status === 'cancelled') { throw ValidationException::withMessages(['action' => ['COD cannot be collected for a cancelled order.']]); } if ($order->payment_method_code !== 'cod') { throw ValidationException::withMessages(['action' => ['This is not a Cash on Delivery order.']]); } if ($order->payment_status === 'paid') { return 'Cash on Delivery was already recorded as collected.'; } if (! $order->payment) { throw ValidationException::withMessages(['action' => ['The order has no payment record.']]); } $order->payment->update(['status' => 'paid', 'paid_at' => now(), 'metadata' => [...($order->payment->metadata ?? []), 'cod_collected' => true]]); $order->payment_status = 'paid'; $order->paid_minor = $order->total_minor; return 'Cash on Delivery payment was collected.'; }
    private function refund(Order $order, array $input, User $admin): string { if (! $order->payment) { throw ValidationException::withMessages(['amount_minor' => ['The order has no payment record.']]); } $amount = (int) ($input['amount_minor'] ?? 0); if ($amount <= 0 || $amount > ($order->paid_minor - $order->refunded_minor)) { throw ValidationException::withMessages(['amount_minor' => ['Refund amount must be positive and cannot exceed the unrefunded paid amount.']]); } PaymentRefund::query()->create(['order_payment_id' => $order->payment->id, 'amount_minor' => $amount, 'currency_code' => $order->currency_code, 'status' => 'completed', 'reason' => $input['reason'] ?? 'Manual refund recorded.', 'requested_by' => $admin->id, 'requested_at' => now(), 'completed_at' => now(), 'metadata' => ['manual_record' => true]]); $order->refunded_minor += $amount; $order->payment->increment('refunded_minor', $amount); $order->payment_status = $order->refunded_minor >= $order->paid_minor ? 'refunded' : 'partially_refunded'; $order->payment->update(['status' => $order->payment_status]); return 'Refund was recorded.'; }
    private function requireNotCancelled(Order $order): void { if ($order->order_status === 'cancelled') { throw ValidationException::withMessages(['action' => ['A cancelled order cannot be updated.']]); } }
}
