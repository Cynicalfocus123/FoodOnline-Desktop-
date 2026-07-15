<?php

namespace App\Console\Commands;

use App\Models\InventoryReservation;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Services\Commerce\InventoryService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpireInventoryReservations extends Command
{
    protected $signature = 'inventory:expire-reservations {--limit=100}';
    protected $description = 'Release expired active inventory reservations safely.';

    public function handle(InventoryService $inventory): int
    {
        $orderIds = InventoryReservation::query()->where('status', 'active')->whereNotNull('expires_at')->where('expires_at', '<=', now())
            ->whereNotNull('order_id')->limit(max(1, (int) $this->option('limit')))->pluck('order_id')->unique();
        foreach ($orderIds as $orderId) {
            DB::transaction(function () use ($orderId, $inventory): void {
                $order = Order::query()->lockForUpdate()->find($orderId);
                if (! $order || $order->order_status === 'cancelled') { return; }
                $inventory->releaseOrder($order, 'Payment reservation expired.', 'expired');
                $order->update(['order_status' => 'cancelled', 'payment_status' => 'failed', 'fulfillment_status' => 'cancelled', 'cancelled_at' => now()]);
                OrderStatusHistory::query()->create(['order_id' => $order->id, 'actor_type' => 'system', 'event_type' => 'reservation.expired',
                    'new_order_status' => 'cancelled', 'new_payment_status' => 'failed', 'new_fulfillment_status' => 'cancelled',
                    'customer_visible_message' => 'The payment reservation expired and the order was cancelled.']);
            }, 3);
        }
        $this->info("Expired reservations processed for {$orderIds->count()} order(s).");
        return self::SUCCESS;
    }
}
