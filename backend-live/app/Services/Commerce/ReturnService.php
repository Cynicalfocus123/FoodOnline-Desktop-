<?php

namespace App\Services\Commerce;

use App\Models\AdminAuditLog;
use App\Models\Order;
use App\Models\PaymentRefund;
use App\Models\ReturnRequest;
use App\Models\ReturnRequestItem;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Notifications\CommerceNotification;

class ReturnService
{
    public function create(User $user, array $data): ReturnRequest
    {
        return DB::transaction(function () use ($user, $data): ReturnRequest {
            $order = Order::query()->with('items')->where('uuid', $data['order_uuid'])->where('user_id', $user->id)->lockForUpdate()->first();
            if (! $order) { throw (new ModelNotFoundException)->setModel(Order::class); }
            $this->assertEligible($order, $user);
            if ($order->returns()->whereNotIn('status', ['rejected', 'cancelled', 'closed'])->exists()) {
                throw ValidationException::withMessages(['order_uuid' => ['This order already has an active return request.']]);
            }

            $request = ReturnRequest::query()->create([
                'uuid' => (string) Str::uuid(), 'return_number' => $this->number(), 'order_id' => $order->id, 'user_id' => $user->id,
                'status' => 'requested', 'requested_resolution' => $data['requested_resolution'], 'reason_code' => $data['reason_code'],
                'customer_explanation' => $data['customer_explanation'] ?? null, 'refund_status' => 'not_requested',
                'currency_code' => $order->currency_code, 'requested_at' => now(),
            ]);
            foreach ($data['items'] as $line) {
                $item = $order->items->firstWhere('uuid', $line['order_item_uuid']);
                if (! $item) { throw ValidationException::withMessages(['items' => ['One selected order item does not belong to this order.']]); }
                $already = ReturnRequestItem::query()->where('order_item_id', $item->id)->whereHas('request', fn ($q) => $q->whereNotIn('status', ['rejected', 'cancelled']))->sum('quantity_approved');
                if ((int) $line['quantity'] < 1 || (int) $line['quantity'] > $item->quantity - $already) {
                    throw ValidationException::withMessages(['items' => ["The requested quantity for {$item->product_name} is not eligible."]]);
                }
                $request->items()->create(['order_item_id' => $item->id, 'quantity_requested' => (int) $line['quantity'], 'resolution' => 'pending']);
            }
            return $request->fresh(['items.orderItem', 'order']);
        }, 3);
    }

    public function assertEligible(Order $order, User $user): void
    {
        if ($order->user_id !== $user->id) { throw (new ModelNotFoundException)->setModel(Order::class); }
        if (! in_array($order->fulfillment_status, ['delivered'], true) || ! $order->delivered_at) {
            throw ValidationException::withMessages(['order_uuid' => ['This order is not eligible for a return yet.']]);
        }
        $window = max(0, (int) config('foodonlines.commerce.return_window_days', 14));
        if ($window > 0 && $order->delivered_at->lt(now()->subDays($window))) {
            throw ValidationException::withMessages(['order_uuid' => ['The return window for this order has expired.']]);
        }
        if ($order->order_status === 'cancelled') { throw ValidationException::withMessages(['order_uuid' => ['Cancelled orders cannot be returned.']]); }
    }

    public function transition(ReturnRequest $request, string $action, array $data, User $admin, Request $httpRequest): ReturnRequest
    {
        return DB::transaction(function () use ($request, $action, $data, $admin, $httpRequest): ReturnRequest {
            $return = ReturnRequest::query()->with(['items.orderItem.variant', 'order.payment'])->lockForUpdate()->findOrFail($request->id);
            $message = (string) ($data['reason'] ?? $data['notes'] ?? 'Return request updated.');
            $before = $return->status;
            switch ($action) {
                case 'approve':
                    $this->requireStatus($return, ['requested', 'under_review', 'information_required']);
                    $return->status = 'approved'; $return->reviewed_at = now(); $return->approved_at = now();
                    foreach ($return->items as $item) { $item->update(['quantity_approved' => $item->quantity_requested, 'resolution' => 'approved']); }
                    break;
                case 'reject':
                    $this->requireStatus($return, ['requested', 'under_review', 'information_required']);
                    $return->status = 'rejected'; $return->reviewed_at = now(); $return->rejected_at = now(); $return->admin_decision_reason = $message;
                    break;
                case 'request_information':
                    $this->requireStatus($return, ['requested', 'under_review']); $return->status = 'information_required'; $return->admin_decision_reason = $message; $return->reviewed_at = now(); break;
                case 'received':
                    $this->requireStatus($return, ['approved', 'awaiting_item']); $return->status = 'inspection'; $return->received_at = now();
                    foreach ($return->items as $item) { $item->update(['quantity_received' => $item->quantity_approved, 'resolution' => 'received']); }
                    break;
                case 'inspect':
                    $this->requireStatus($return, ['inspection', 'received']);
                    foreach ($return->items as $item) {
                        $quantity = (int) ($data['items'][(string) $item->id]['restock_quantity'] ?? $item->quantity_received);
                        if ($quantity < 0 || $quantity > $item->quantity_received) { throw ValidationException::withMessages(['items' => ['Restock quantity is outside the received quantity.']]); }
                        $item->update(['restock_quantity' => $quantity, 'condition_code' => $data['items'][(string) $item->id]['condition_code'] ?? 'unknown', 'inspection_notes' => $data['items'][(string) $item->id]['inspection_notes'] ?? null, 'non_restock_reason' => $quantity < $item->quantity_received ? ($data['items'][(string) $item->id]['non_restock_reason'] ?? 'Not approved for restock.') : null, 'resolution' => $quantity === $item->quantity_received ? 'restock' : 'do_not_restock']);
                    }
                    $return->status = 'refund_pending';
                    break;
                case 'refund':
                    $this->requireStatus($return, ['refund_pending', 'inspection']);
                    $amount = (int) ($data['amount_minor'] ?? 0);
                    if ($amount < 1 || $amount > $return->order->paid_minor - $return->order->refunded_minor) { throw ValidationException::withMessages(['amount_minor' => ['Refund amount is outside the remaining paid amount.']]); }
                    PaymentRefund::query()->create(['order_payment_id' => $return->order->payment?->id, 'amount_minor' => $amount, 'currency_code' => $return->currency_code, 'status' => 'completed', 'reason' => $message, 'requested_by' => $admin->id, 'requested_at' => now(), 'completed_at' => now(), 'metadata' => ['manual_cod_record' => true, 'return_request_uuid' => $return->uuid]]);
                    $return->order->increment('refunded_minor', $amount); $return->order->payment?->increment('refunded_minor', $amount); $return->order->refresh(); $return->order->forceFill(['payment_status' => $return->order->refunded_minor >= $return->order->paid_minor ? 'refunded' : 'partially_refunded'])->save();
                    $return->refund_amount_minor = $amount; $return->refund_status = 'completed'; $return->status = 'refunded';
                    break;
                case 'close':
                    $this->requireStatus($return, ['refunded', 'rejected']); $return->status = 'closed'; $return->closed_at = now(); break;
                default: throw ValidationException::withMessages(['action' => ['Unsupported return action.']]);
            }
            $return->save();
            if ($action === 'inspect') {
                foreach ($return->items as $item) { app(InventoryService::class)->restockReturn($return, $item->fresh(), (int) $item->restock_quantity, $admin); }
            }
            AdminAuditLog::query()->create(['admin_user_id' => $admin->id, 'action' => 'return.'.$action, 'subject_type' => ReturnRequest::class, 'subject_id' => $return->id, 'before_payload' => ['status' => $before], 'after_payload' => ['status' => $return->status], 'metadata' => ['reason' => $message], 'ip_address' => $httpRequest->ip(), 'user_agent' => substr((string) $httpRequest->userAgent(), 0, 1000)]);
            DB::afterCommit(function () use ($return, $action): void { if ($return->user_id && $return->user) { $return->user->notify(new CommerceNotification('return_'.$action, 'Return update', 'Return '.$return->return_number.' was updated.', ['type' => 'return', 'uuid' => $return->uuid])); } });
            return $return->fresh(['items.orderItem', 'order', 'user']);
        }, 3);
    }

    private function requireStatus(ReturnRequest $request, array $allowed): void { if (! in_array($request->status, $allowed, true)) { throw ValidationException::withMessages(['status' => ['This return action is not valid in the current state.']]); } }
    private function number(): string { return 'RET-'.now()->format('ymd').'-'.strtoupper(Str::random(6)); }
}
