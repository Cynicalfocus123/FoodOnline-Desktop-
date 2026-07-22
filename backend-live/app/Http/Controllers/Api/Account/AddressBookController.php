<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\UpsertUserAddressRequest;
use App\Http\Resources\Account\UserAddressResource;
use App\Models\UserAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            ->map(fn (UserAddress $address): array => (new UserAddressResource($address))->resolve())
            ->values();

        return response()->json([
            'addresses' => $addresses,
        ]);
    }

    public function store(UpsertUserAddressRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $address = DB::transaction(function () use ($user, $validated): UserAddress {
            $hasAddresses = UserAddress::query()->where('user_id', $user->id)->lockForUpdate()->exists();
            $shouldBeDefault = (bool) ($validated['is_default'] ?? false) || ! $hasAddresses;

            if ($shouldBeDefault) {
                UserAddress::query()->where('user_id', $user->id)->update(['is_default' => false]);
            }

            return UserAddress::query()->create([
                'user_id' => $user->id,
                'country_key' => (string) $validated['country_key'],
                'address_values' => $validated['address_values'],
                'summary' => (string) ($validated['summary'] ?? ''),
                'is_default' => $shouldBeDefault,
            ]);
        });

        return response()->json([
            'message' => 'Address saved.',
            'address' => (new UserAddressResource($address))->resolve(),
        ], 201);
    }

    public function update(UpsertUserAddressRequest $request, int $addressId): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $address = DB::transaction(function () use ($user, $addressId, $validated): UserAddress {
            $address = UserAddress::query()
                ->where('user_id', $user->id)
                ->whereKey($addressId)
                ->lockForUpdate()
                ->firstOrFail();
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

            return $address;
        });

        return response()->json([
            'message' => 'Address updated.',
            'address' => (new UserAddressResource($address))->resolve(),
        ]);
    }

    public function destroy(Request $request, int $addressId): JsonResponse
    {
        $user = $request->user();
        DB::transaction(function () use ($user, $addressId): void {
            $address = UserAddress::query()
                ->where('user_id', $user->id)
                ->whereKey($addressId)
                ->lockForUpdate()
                ->firstOrFail();
            $wasDefault = (bool) $address->is_default;
            $address->delete();

            if ($wasDefault) {
                $fallback = UserAddress::query()
                    ->where('user_id', $user->id)
                    ->orderByDesc('id')
                    ->lockForUpdate()
                    ->first();

                if ($fallback) {
                    $fallback->forceFill(['is_default' => true])->save();
                }
            }
        });

        return response()->json([
            'message' => 'Address removed.',
        ]);
    }

    public function makeDefault(Request $request, int $addressId): JsonResponse
    {
        $user = $request->user();
        $address = DB::transaction(function () use ($user, $addressId): UserAddress {
            $address = UserAddress::query()
                ->where('user_id', $user->id)
                ->whereKey($addressId)
                ->lockForUpdate()
                ->firstOrFail();

            UserAddress::query()->where('user_id', $user->id)->update(['is_default' => false]);
            $address->forceFill(['is_default' => true])->save();

            return $address;
        });

        return response()->json([
            'message' => 'Default address updated.',
            'address' => (new UserAddressResource($address))->resolve(),
        ]);
    }
}
