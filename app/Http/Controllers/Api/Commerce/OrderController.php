<?php

namespace App\Http\Controllers\Api\Commerce;

use App\Http\Controllers\Controller;
use App\Models\CheckoutQuote;
use App\Models\Cart;
use App\Models\Order;
use App\Services\Commerce\OrderService;
use App\Support\OrderPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function store(Request $request, OrderService $orders): JsonResponse
    {
        $values = $request->validate(['quote_uuid' => ['required', 'uuid'], 'idempotency_key' => ['nullable', 'string', 'min:16', 'max:100'], 'customer_note' => ['nullable', 'string', 'max:2000']]);
        $key = $request->header('Idempotency-Key') ?: ($values['idempotency_key'] ?? null);
        if (! $key || strlen($key) < 16) { throw ValidationException::withMessages(['idempotency_key' => ['Provide an idempotency key of at least 16 characters.']]); }
        $quote = CheckoutQuote::query()->where('uuid', $values['quote_uuid'])->firstOrFail();
        if ($request->user()) {
            if ($quote->user_id !== $request->user()->id) { abort(404); }
        } else {
            $guestToken = (string) $request->header('X-Guest-Cart-Token');
            $ownsCart = $guestToken !== '' && Cart::query()->whereKey($quote->cart_id)->where('guest_token_hash', hash('sha256', $guestToken))->exists();
            if (! $ownsCart) { abort(404); }
        }
        [$order, $guestToken, $duplicate] = $orders->create($quote, $request->user(), $key, $values['customer_note'] ?? null);
        return response()->json(['order' => OrderPresenter::make($order), 'guest_access_token' => $guestToken, 'idempotent_replay' => $duplicate], $duplicate ? 200 : 201);
    }

    public function guestShow(Request $request, Order $order, OrderService $orders): JsonResponse
    {
        $token = (string) ($request->query('access_token') ?: $request->header('X-Guest-Order-Token'));
        if (! $order->guest_access_token_hash || ! $token || ! hash_equals($order->guest_access_token_hash, hash('sha256', $token))) { abort(404); }
        return response()->json(['order' => OrderPresenter::make($order->load($orders->relations()))]);
    }
}
