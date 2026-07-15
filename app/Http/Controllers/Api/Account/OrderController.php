<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Commerce\OrderManagementService;
use App\Services\Commerce\OrderService;
use App\Support\OrderPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()->where('user_id', $request->user()->id)->with('items')->latest('placed_at')->paginate(min(50, max(1, (int) $request->query('per_page', 20))));
        return response()->json(['data' => $orders->getCollection()->map(fn ($order) => OrderPresenter::make($order)),
            'meta' => ['current_page' => $orders->currentPage(), 'last_page' => $orders->lastPage(), 'total' => $orders->total()]]);
    }

    public function show(Request $request, Order $order, OrderService $orders): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) { abort(404); }
        return response()->json(['order' => OrderPresenter::make($order->load($orders->relations()))]);
    }

    public function cancel(Request $request, Order $order, OrderManagementService $service): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) { abort(404); }
        return response()->json(['order' => OrderPresenter::make($service->cancelByCustomer($order, $request->user()))]);
    }
}
