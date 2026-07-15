<?php

namespace App\Http\Controllers\Api\Commerce;

use App\Http\Controllers\Controller;
use App\Services\Commerce\CartService;
use App\Services\Commerce\CheckoutQuoteService;
use App\Services\Commerce\PaymentMethodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function paymentMethods(PaymentMethodService $service): JsonResponse { return response()->json(['payment_methods' => $service->methods()]); }

    public function quote(Request $request, CartService $carts, CheckoutQuoteService $quotes): JsonResponse
    {
        $values = $request->validate([
            'cart_uuid' => ['nullable', 'uuid'], 'cart_item_ids' => ['nullable', 'array'], 'cart_item_ids.*' => ['uuid'],
            'guest_email' => ['nullable', 'email:rfc', 'max:254'], 'shipping_address' => ['required', 'array'],
            'billing_address' => ['nullable', 'array'], 'billing_same_as_shipping' => ['nullable', 'boolean'],
            'promo_code' => ['nullable', 'string', 'max:64'],
            'payment_method_code' => ['required', Rule::in(['cod', 'card', 'bank_transfer', 'promptpay', 'paypal', 'google_pay', 'alipay', 'cash_app'])],
        ]);
        if (! $request->user() && empty($values['guest_email'])) {
            throw ValidationException::withMessages(['guest_email' => ['Email is required for guest checkout.']]);
        }
        [$cart] = $carts->resolve($request->user(), $request->header('X-Guest-Cart-Token'));
        if (! empty($values['cart_uuid']) && $values['cart_uuid'] !== $cart->uuid) { abort(404); }
        $quote = $quotes->create($cart, $request->user(), $values);
        return response()->json($quotes->payload($quote), 201);
    }
}
