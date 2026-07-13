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

        if (isset($validated['password']) && is_string($validated['password']) && $validated['password'] !== '') {
            $admin->password = Hash::make($validated['password']);

            $currentToken = $request->attributes->get('admin_api_token');
            AdminApiToken::query()
                ->where('user_id', $admin->id)
                ->whereNull('revoked_at')
                ->when($currentToken instanceof AdminApiToken, fn ($query) => $query->whereKeyNot($currentToken->id))
                ->update(['revoked_at' => now()]);
        }

        $admin->save();

        return response()->json([
            'message' => 'Admin settings updated.',
            'admin' => new AdminUserResource($admin->fresh()),
        ]);
    }
}
