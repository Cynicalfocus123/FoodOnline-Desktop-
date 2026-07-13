<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
use App\Http\Resources\Admin\AdminUserResource;
use App\Models\AdminApiToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminAuthController extends Controller
{
    public function login(AdminLoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $user = User::query()
            ->where('email', strtolower((string) $credentials['email']))
            ->where('role', 'admin')
            ->where('status', 'active')
            ->first();

        if (! $user || ! is_string($user->password) || ! Hash::check((string) $credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid admin credentials.'], 401);
        }

        $plainToken = Str::random(80);

        AdminApiToken::query()->create([
            'user_id' => $user->id,
            'name' => 'admin-dashboard',
            'token_hash' => hash('sha256', $plainToken),
            'last_used_at' => now(),
            'expires_at' => now()->addMinutes(max(1, (int) config('foodonlines.tokens.admin_ttl_minutes', 480))),
        ]);

        return response()->json([
            'message' => 'Login successful.',
            'token_type' => 'Bearer',
            'token' => $plainToken,
            'admin' => new AdminUserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->attributes->get('admin_api_token');

        if ($token instanceof AdminApiToken) {
            $token->forceFill(['revoked_at' => now()])->save();
        }

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'admin' => new AdminUserResource($request->user()),
        ]);
    }
}
