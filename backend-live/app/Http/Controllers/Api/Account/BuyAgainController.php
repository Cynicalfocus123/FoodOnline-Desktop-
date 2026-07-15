<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Commerce\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BuyAgainController extends Controller
{
    public function store(Request $request, Order $order, CartService $cartService): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);
        $data = $request->validate(['order_item_uuids' => ['nullable', 'array', 'max:50'], 'order_item_uuids.*' => ['uuid']]);
        [$cart] = $cartService->resolve($request->user(), null); $added = []; $unavailable = [];
        $items = $order->items()->with('variant')->when(! empty($data['order_item_uuids']), fn ($q) => $q->whereIn('uuid', $data['order_item_uuids']))->get();
        foreach ($items as $item) { try { if (! $item->variant?->uuid) { throw new \RuntimeException('Variant unavailable.'); } $cartService->add($cart, $item->variant->uuid, $item->quantity); $added[] = ['order_item_uuid' => $item->uuid, 'variant_uuid' => $item->variant->uuid, 'status' => 'added']; } catch (\Throwable $e) { Log::info('Buy Again line unavailable', ['order_item_uuid' => $item->uuid]); $unavailable[] = ['order_item_uuid' => $item->uuid, 'status' => 'unavailable']; } }
        return response()->json(['added' => $added, 'unavailable' => $unavailable, 'cart' => app(\App\Services\Commerce\CartService::class)->payload($cart)]);
    }
}
