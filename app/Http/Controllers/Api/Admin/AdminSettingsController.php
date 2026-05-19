<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateAdminSettingsRequest;
use App\Http\Resources\Admin\AdminUserResource;
use App\Models\AdminApiToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AdminSettingsController extends Controller
{
    public function update(UpdateAdminSettingsRequest $request): JsonResponse
    {
        $admin = $request->user();
        $validated = $request->validated();

        if (! is_string($admin->password) || ! Hash::check((string) $validated['current_password'], $admin->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $admin->name = (string) $validated['name'];
        $admin->email = strtolower((string) $validated['email']);

        $passwordChanged = isset($validated['password']) && is_string($validated['password']) && $validated['password'] !== '';

        if ($passwordChanged) {
            $admin->password = Hash::make($validated['password']);
        }

        $admin->save();

        if ($passwordChanged) {
            AdminApiToken::query()
                ->where('user_id', $admin->id)
                ->whereNull('revoked_at')
                ->update(['revoked_at' => now()]);
        }

        return response()->json([
            'message' => $passwordChanged ? 'Admin password updated. Sign in again.' : 'Admin settings updated.',
            'force_logout' => $passwordChanged,
            'admin' => new AdminUserResource($admin->fresh()),
        ]);
    }
}
