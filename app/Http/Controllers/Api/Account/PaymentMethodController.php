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
        $user = $request->user();
        $validated = $request->validate([
            'provider' => ['nullable', 'string', 'max:40'],
            'brand' => ['required', 'string', 'max:40'],
            'last4' => ['required', 'string', 'size:4'],
            'expiry_month' => ['required', 'integer', 'between:1,12'],
            'expiry_year' => ['required', 'integer', 'min:2024', 'max:2099'],
            'token_reference' => ['nullable', 'string', 'max:191'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $shouldBeDefault = (bool) ($validated['is_default'] ?? false) || ! UserPaymentMethod::query()->where('user_id', $user->id)->exists();

        if ($shouldBeDefault) {
            UserPaymentMethod::query()->where('user_id', $user->id)->update(['is_default' => false]);
        }

        $method = UserPaymentMethod::query()->create([
            'user_id' => $user->id,
            'provider' => $validated['provider'] ?? null,
            'brand' => $validated['brand'],
            'last4' => $validated['last4'],
            'expiry_month' => (int) $validated['expiry_month'],
            'expiry_year' => (int) $validated['expiry_year'],
            'token_reference' => $validated['token_reference'] ?? null,
            'is_default' => $shouldBeDefault,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Payment method saved.',
            'payment_method' => $this->toPayload($method),
        ], 201);
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
        $user = $request->user();
        $method = UserPaymentMethod::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->whereKey($methodId)
            ->firstOrFail();

        UserPaymentMethod::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->update(['is_default' => false]);

        $method->forceFill(['is_default' => true])->save();

        return response()->json([
            'message' => 'Default payment method updated.',
            'payment_method' => $this->toPayload($method),
        ]);
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
        ];
    }
}
