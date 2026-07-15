<?php

namespace App\Services\Commerce;

use App\Models\AdminAuditLog;
use App\Models\InventoryMovement;
use App\Models\InventoryReservation;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\ReturnRequest;
use App\Models\ReturnRequestItem;
use App\Models\User;
use App\Models\VariantInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    public function reserve(Order $order, array $items): void
    {
        $variantIds = collect($items)->pluck('product_variant_id')->sort()->values();
        $this->ensureRows($variantIds->all());
        $inventories = VariantInventory::query()->whereIn('product_variant_id', $variantIds)->orderBy('product_variant_id')->lockForUpdate()->get()->keyBy('product_variant_id');

        foreach ($items as $item) {
            $inventory = $inventories->get($item['product_variant_id']);
            $beforeQuantity = $inventory->quantity_on_hand;
            $beforeReserved = $inventory->quantity_reserved;
            if ($inventory->tracking_enabled && ! $inventory->allow_backorder && $inventory->availableQuantity() < $item['quantity']) {
                throw ValidationException::withMessages(['inventory' => ["{$item['product_name']} ({$item['variant_title']}) no longer has enough stock."]]);
            }
            $reservation = InventoryReservation::query()->create([
                'cart_id' => $order->cart_id, 'order_id' => $order->id, 'product_variant_id' => $item['product_variant_id'],
                'quantity' => $item['quantity'], 'status' => 'active',
                'expires_at' => $order->payment_method_code === 'cod' ? null : now()->addMinutes((int) config('foodonlines.commerce.reservation_minutes', 30)),
            ]);
            if ($inventory->tracking_enabled) {
                $inventory->increment('quantity_reserved', $item['quantity']);
                $inventory->refresh();
            }
            $this->movement($inventory, 'reservation_created', 0, $beforeQuantity, $beforeReserved, 'Inventory reserved for order.', $order, $reservation);
        }
    }

    public function releaseOrder(Order $order, string $reason, string $status = 'released'): void
    {
        $reservations = $order->reservations()->where('status', 'active')->orderBy('product_variant_id')->get();
        $variantIds = $reservations->pluck('product_variant_id')->unique()->sort()->values();
        if ($variantIds->isEmpty()) {
            return;
        }
        $inventories = VariantInventory::query()->whereIn('product_variant_id', $variantIds)->orderBy('product_variant_id')->lockForUpdate()->get()->keyBy('product_variant_id');
        foreach ($order->reservations()->where('status', 'active')->whereIn('product_variant_id', $variantIds)->orderBy('product_variant_id')->lockForUpdate()->get() as $reservation) {
            $inventory = $inventories->get($reservation->product_variant_id);
            if (! $inventory) {
                throw ValidationException::withMessages(['inventory' => ['The reservation has no inventory row.']]);
            }
            $beforeQuantity = $inventory->quantity_on_hand;
            $beforeReserved = $inventory->quantity_reserved;
            if ($inventory->tracking_enabled) {
                $inventory->quantity_reserved = max(0, $inventory->quantity_reserved - $reservation->quantity);
                $inventory->save();
            }
            $reservation->update(['status' => $status, 'released_at' => now(), 'release_reason' => $reason]);
            $this->movement($inventory, $status === 'expired' ? 'reservation_released' : 'order_cancelled', 0, $beforeQuantity, $beforeReserved, $reason, $order, $reservation);
        }
    }

    public function consumeOrder(Order $order): void
    {
        $reservations = $order->reservations()->where('status', 'active')->orderBy('product_variant_id')->get();
        $variantIds = $reservations->pluck('product_variant_id')->unique()->sort()->values();
        if ($variantIds->isEmpty()) {
            return;
        }
        $inventories = VariantInventory::query()->whereIn('product_variant_id', $variantIds)->orderBy('product_variant_id')->lockForUpdate()->get()->keyBy('product_variant_id');
        foreach ($order->reservations()->where('status', 'active')->whereIn('product_variant_id', $variantIds)->orderBy('product_variant_id')->lockForUpdate()->get() as $reservation) {
            $inventory = $inventories->get($reservation->product_variant_id);
            if (! $inventory) {
                throw ValidationException::withMessages(['inventory' => ['The reservation has no inventory row.']]);
            }
            $beforeQuantity = $inventory->quantity_on_hand;
            $beforeReserved = $inventory->quantity_reserved;
            if ($inventory->tracking_enabled) {
                if ($inventory->quantity_on_hand < $reservation->quantity || $inventory->quantity_reserved < $reservation->quantity) {
                    throw ValidationException::withMessages(['inventory' => ['Reserved inventory is inconsistent and cannot be shipped.']]);
                }
                $inventory->quantity_on_hand -= $reservation->quantity;
                $inventory->quantity_reserved -= $reservation->quantity;
                $inventory->save();
            }
            $reservation->update(['status' => 'consumed', 'consumed_at' => now(), 'expires_at' => null]);
            $this->movement($inventory, 'reservation_consumed', -$reservation->quantity, $beforeQuantity, $beforeReserved, 'Inventory consumed when order shipped.', $order, $reservation);
        }
    }

    public function adjust(ProductVariant $variant, array $values, User $admin, Request $request): VariantInventory
    {
        return DB::transaction(function () use ($variant, $values, $admin, $request): VariantInventory {
            $this->ensureRows([$variant->id]);
            $inventory = VariantInventory::query()->where('product_variant_id', $variant->id)->firstOrFail();
            $inventory = VariantInventory::query()->lockForUpdate()->findOrFail($inventory->id);
            $before = $inventory->toArray();
            $beforeQuantity = $inventory->quantity_on_hand;
            $beforeReserved = $inventory->quantity_reserved;
            $delta = (int) ($values['quantity_delta'] ?? 0);
            $next = $inventory->quantity_on_hand + $delta;
            if ($next < 0 || (! ($values['allow_backorder'] ?? $inventory->allow_backorder) && $next < $inventory->quantity_reserved)) {
                throw ValidationException::withMessages(['quantity_delta' => ['The adjustment would make inventory negative or lower than reserved stock.']]);
            }
            $inventory->fill([
                'quantity_on_hand' => $next, 'low_stock_threshold' => $values['low_stock_threshold'] ?? $inventory->low_stock_threshold,
                'tracking_enabled' => $values['tracking_enabled'] ?? $inventory->tracking_enabled,
                'allow_backorder' => $values['allow_backorder'] ?? $inventory->allow_backorder, 'updated_by' => $admin->id,
            ])->save();
            $this->movement($inventory, $delta === 0 ? 'correction' : 'adjustment', $delta, $beforeQuantity, $beforeReserved, $values['reason'], null, null, $admin);
            AdminAuditLog::query()->create(['admin_user_id' => $admin->id, 'action' => 'inventory.adjusted', 'subject_type' => VariantInventory::class,
                'subject_id' => $inventory->id, 'before_payload' => $before, 'after_payload' => $inventory->fresh()->toArray(),
                'ip_address' => $request->ip(), 'user_agent' => substr((string) $request->userAgent(), 0, 1000)]);

            return $inventory->fresh(['variant.product']);
        }, 3);
    }

    public function restockReturn(ReturnRequest $return, ReturnRequestItem $item, int $quantity, User $admin): VariantInventory
    {
        if ($quantity < 0 || $quantity > $item->quantity_received) {
            throw ValidationException::withMessages(['restock_quantity' => ['Restock quantity cannot exceed the received quantity.']]);
        }
        $variant = $item->orderItem()->with('variant')->firstOrFail()->variant;
        if (! $variant) {
            throw ValidationException::withMessages(['inventory' => ['The returned variant no longer exists.']]);
        }

        $this->ensureRows([$variant->id]);
        $inventory = VariantInventory::query()->where('product_variant_id', $variant->id)->lockForUpdate()->firstOrFail();
        $beforeQuantity = $inventory->quantity_on_hand;
        $beforeReserved = $inventory->quantity_reserved;
        if ($quantity > 0) {
            $inventory->increment('quantity_on_hand', $quantity);
            $inventory->refresh();
            $this->movement($inventory, 'return_restock', $quantity, $beforeQuantity, $beforeReserved, 'Returned item restocked.', $return->order, null, $admin, $return);
        }
        return $inventory;
    }

    private function movement(VariantInventory $inventory, string $type, int $delta, int $quantityBefore, int $reservedBefore, string $reason, ?Order $order = null, ?InventoryReservation $reservation = null, ?User $admin = null, ?ReturnRequest $return = null): void
    {
        InventoryMovement::query()->create([
            'product_variant_id' => $inventory->product_variant_id, 'admin_user_id' => $admin?->id, 'order_id' => $order?->id,
            'reservation_id' => $reservation?->id, 'return_request_id' => $return?->id, 'movement_type' => $type, 'quantity_delta' => $delta,
            'quantity_before' => $quantityBefore, 'quantity_after' => $inventory->quantity_on_hand,
            'reserved_before' => $reservedBefore, 'reserved_after' => $inventory->quantity_reserved, 'reason' => $reason,
        ]);
    }

    /**
     * Insert missing rows without a read-then-insert race. The unique variant
     * key makes insertOrIgnore safe on both the supported MySQL and SQLite
     * test databases; callers lock the rows immediately after this step.
     *
     * @param array<int, int> $variantIds
     */
    private function ensureRows(array $variantIds): void
    {
        $now = now();
        $rows = collect($variantIds)->unique()->map(fn (int $variantId): array => [
            'uuid' => (string) Str::uuid(), 'product_variant_id' => $variantId,
            'quantity_on_hand' => 0, 'quantity_reserved' => 0, 'low_stock_threshold' => 5,
            'tracking_enabled' => false, 'allow_backorder' => false, 'created_at' => $now, 'updated_at' => $now,
        ])->values()->all();
        if ($rows) {
            DB::table('variant_inventories')->insertOrIgnore($rows);
        }
    }
}
