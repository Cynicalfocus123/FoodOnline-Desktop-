<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Commerce\OrderManagementService;
use App\Support\OrderPresenter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $values = $request->validate(['search' => ['nullable', 'string', 'max:100'], 'order_status' => ['nullable', Rule::in(['pending', 'confirmed', 'processing', 'completed', 'cancelled'])],
            'payment_status' => ['nullable', 'string', 'max:24'], 'fulfillment_status' => ['nullable', 'string', 'max:24'], 'payment_method' => ['nullable', 'string', 'max:40'],
            'from' => ['nullable', 'date'], 'to' => ['nullable', 'date'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        $query = Order::query()->with(['user', 'items'])->latest('placed_at');
        if ($search = $values['search'] ?? null) { $query->where(fn (Builder $q) => $q->where('order_number', 'like', "%{$search}%")->orWhere('guest_email', 'like', "%{$search}%")->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%{$search}%"))->orWhereHas('items', fn ($i) => $i->where('sku', 'like', "%{$search}%"))); }
        foreach (['order_status', 'payment_status', 'fulfillment_status'] as $field) { if (isset($values[$field])) { $query->where($field, $values[$field]); } }
        if (isset($values['payment_method'])) { $query->where('payment_method_code', $values['payment_method']); }
        if (isset($values['from'])) { $query->whereDate('placed_at', '>=', $values['from']); }
        if (isset($values['to'])) { $query->whereDate('placed_at', '<=', $values['to']); }
        $page = $query->paginate($values['per_page'] ?? 25);
        return response()->json(['data' => $page->getCollection()->map(fn ($order) => OrderPresenter::make($order, true)),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()]]);
    }

    public function show(Order $order): JsonResponse { return response()->json(['order' => OrderPresenter::make($order->load(['user', 'items', 'addresses', 'payment.refunds', 'history', 'reservations']), true)]); }

    public function action(Request $request, Order $order, OrderManagementService $service): JsonResponse
    {
        $values = $request->validate(['action' => ['required', Rule::in(['confirm', 'processing', 'ship', 'deliver', 'cancel', 'collect_cod', 'refund'])],
            'carrier_name' => ['nullable', 'string', 'max:255'], 'tracking_number' => ['nullable', 'string', 'max:255'],
            'reason' => ['nullable', 'string', 'max:1000'], 'amount_minor' => ['nullable', 'integer', 'min:1']]);
        return response()->json(['order' => OrderPresenter::make($service->adminAction($order, $values['action'], $values, $request->user(), $request), true)]);
    }
}
