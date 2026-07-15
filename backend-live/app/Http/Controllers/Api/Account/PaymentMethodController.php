<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\UserPaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $methods = UserPaymentMethod::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->orderByDesc('is_default')
            ->orderByDesc('id')
            ->get()
            ->map(fn (UserPaymentMethod $method): array => $this->toPayload($method))
            ->values();

        return response()->json([
            'payment_methods' => $methods,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Adding cards is unavailable until a secure merchant payment provider is configured. Raw card details are not accepted.',
        ], 409);
    }

    public function destroy(Request $request, int $methodId): JsonResponse
    {
        $user = $request->user();
        $method = UserPaymentMethod::query()
            ->where('user_id', $user->id)
            ->whereKey($methodId)
            ->firstOrFail();

        $wasDefault = (bool) $method->is_default;
        $method->forceFill(['status' => 'removed', 'is_default' => false])->save();

        if ($wasDefault) {
            $fallback = UserPaymentMethod::query()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->orderByDesc('id')
                ->first();

            if ($fallback) {
                $fallback->forceFill(['is_default' => true])->save();
            }
        }

        return response()->json([
            'message' => 'Payment method removed.',
        ]);
    }

    public function makeDefault(Request $request, int $methodId): JsonResponse
    {
        return response()->json([
            'message' => 'Legacy saved-card metadata is unverified and cannot be selected for payment.',
        ], 409);
    }

    /**
     * @return array<string, mixed>
     */
    private function toPayload(UserPaymentMethod $method): array
    {
        return [
            'id' => $method->id,
            'provider' => $method->provider,
            'brand' => $method->brand,
            'last4' => $method->last4,
            'expiry_month' => $method->expiry_month,
            'expiry_year' => $method->expiry_year,
            'is_default' => (bool) $method->is_default,
            'status' => $method->status,
            'usable_for_payment' => false,
            'verification_status' => 'legacy_unverified',
            'unavailable_reason' => 'Payment provider is not configured.',
        ];
    }
}
