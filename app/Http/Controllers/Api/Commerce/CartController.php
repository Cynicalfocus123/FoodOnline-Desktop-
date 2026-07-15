<?php

namespace App\Http\Controllers\Api\Commerce;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Services\Commerce\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartService $carts) {}

    public function show(Request $request): JsonResponse { [$cart, $token] = $this->resolve($request); return response()->json($this->carts->payload($cart, $token)); }

    public function store(Request $request): JsonResponse
    {
        $values = $request->validate(['variant_uuid' => ['required', 'uuid'], 'quantity' => ['required', 'integer', 'min:1', 'max:99']]);
        [$cart, $token] = $this->resolve($request);
        $this->carts->add($cart, $values['variant_uuid'], $values['quantity']);
        return response()->json($this->carts->payload($cart, $token), 201);
    }

    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        $values = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:99']]);
        [$cart, $token] = $this->resolve($request);
        $this->carts->update($cart, $cartItem, $values['quantity']);
        return response()->json($this->carts->payload($cart, $token));
    }

    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        [$cart, $token] = $this->resolve($request);
        $this->carts->remove($cart, $cartItem);
        return response()->json($this->carts->payload($cart, $token));
    }

    public function clear(Request $request): JsonResponse { [$cart, $token] = $this->resolve($request); $this->carts->clear($cart); return response()->json($this->carts->payload($cart, $token)); }

    public function merge(Request $request): JsonResponse
    {
        $values = $request->validate(['guest_token' => ['nullable', 'string', 'min:40', 'max:200']]);
        $token = $values['guest_token'] ?? $request->header('X-Guest-Cart-Token');
        if (! $token) { return response()->json($this->carts->payload($this->carts->resolve($request->user(), null)[0])); }
        return response()->json($this->carts->payload($this->carts->merge($request->user(), $token)));
    }

    private function resolve(Request $request): array { return $this->carts->resolve($request->user(), $request->header('X-Guest-Cart-Token')); }
}
