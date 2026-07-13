<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressBookController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $addresses = UserAddress::query()
            ->where('user_id', $user->id)
            ->orderByDesc('is_default')
            ->orderByDesc('id')
            ->get()
            ->map(fn (UserAddress $address): array => $this->toPayload($address))
            ->values();

        return response()->json([
            'addresses' => $addresses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'country_key' => ['required', 'string', 'in:thailand,japan,singapore,taiwan,china,philippines,malaysia,indonesia,hongKong'],
            'address_values' => ['required', 'array'],
            'summary' => ['nullable', 'string', 'max:255'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $shouldBeDefault = (bool) ($validated['is_default'] ?? false) || ! UserAddress::query()->where('user_id', $user->id)->exists();

        if ($shouldBeDefault) {
            UserAddress::query()->where('user_id', $user->id)->update(['is_default' => false]);
        }

        $address = UserAddress::query()->create([
            'user_id' => $user->id,
            'country_key' => (string) $validated['country_key'],
            'address_values' => $validated['address_values'],
            'summary' => (string) ($validated['summary'] ?? ''),
            'is_default' => $shouldBeDefault,
        ]);

        return response()->json([
            'message' => 'Address saved.',
            'address' => $this->toPayload($address),
        ], 201);
    }

    public function update(Request $request, int $addressId): JsonResponse
    {
        $user = $request->user();
        $address = UserAddress::query()
            ->where('user_id', $user->id)
            ->whereKey($addressId)
            ->firstOrFail();

        $validated = $request->validate([
            'country_key' => ['required', 'string', 'in:thailand,japan,singapore,taiwan,china,philippines,malaysia,indonesia,hongKong'],
            'address_values' => ['required', 'array'],
            'summary' => ['nullable', 'string', 'max:255'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $shouldBeDefault = (bool) ($validated['is_default'] ?? false);

        if ($shouldBeDefault) {
            UserAddress::query()
                ->where('user_id', $user->id)
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }

        $address->forceFill([
            'country_key' => (string) $validated['country_key'],
            'address_values' => $validated['address_values'],
            'summary' => (string) ($validated['summary'] ?? ''),
            'is_default' => $shouldBeDefault ? true : (bool) $address->is_default,
        ])->save();

        return response()->json([
            'message' => 'Address updated.',
            'address' => $this->toPayload($address),
        ]);
    }

    public function destroy(Request $request, int $addressId): JsonResponse
    {
        $user = $request->user();
        $address = UserAddress::query()
            ->where('user_id', $user->id)
            ->whereKey($addressId)
            ->firstOrFail();

        $wasDefault = (bool) $address->is_default;
        $address->delete();

        if ($wasDefault) {
            $fallback = UserAddress::query()
                ->where('user_id', $user->id)
                ->orderByDesc('id')
                ->first();

            if ($fallback) {
                $fallback->forceFill(['is_default' => true])->save();
            }
        }

        return response()->json([
            'message' => 'Address removed.',
        ]);
    }

    public function makeDefault(Request $request, int $addressId): JsonResponse
    {
        $user = $request->user();
        $address = UserAddress::query()
            ->where('user_id', $user->id)
            ->whereKey($addressId)
            ->firstOrFail();

        UserAddress::query()->where('user_id', $user->id)->update(['is_default' => false]);
        $address->forceFill(['is_default' => true])->save();

        return response()->json([
            'message' => 'Default address updated.',
            'address' => $this->toPayload($address),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function toPayload(UserAddress $address): array
    {
        return [
            'id' => $address->id,
            'country_key' => $address->country_key,
            'address_values' => is_array($address->address_values) ? $address->address_values : [],
            'summary' => $address->summary,
            'is_default' => (bool) $address->is_default,
            'created_at' => optional($address->created_at)->toISOString(),
            'updated_at' => optional($address->updated_at)->toISOString(),
        ];
    }
}
