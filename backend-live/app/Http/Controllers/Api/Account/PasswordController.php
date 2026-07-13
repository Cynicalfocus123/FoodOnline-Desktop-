<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\UserApiToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'max:128', 'confirmed'],
        ]);

        $user = $request->user();

        if (! is_string($user->password) || $user->password === '' || ! Hash::check((string) $validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make((string) $validated['new_password']),
        ])->save();

        $currentToken = $request->attributes->get('user_api_token');
        UserApiToken::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->when($currentToken instanceof UserApiToken, fn ($query) => $query->whereKeyNot($currentToken->id))
            ->update(['revoked_at' => now()]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
