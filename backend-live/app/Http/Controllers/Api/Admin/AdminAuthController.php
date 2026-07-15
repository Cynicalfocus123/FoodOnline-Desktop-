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
use App\Services\Security\TotpService;

class AdminAuthController extends Controller
{
    public function login(AdminLoginRequest $request, TotpService $totp): JsonResponse
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
        if ($user->mfa_enabled_at) {
            $code = (string) ($credentials['mfa_code'] ?? '');
            $valid = $totp->verify($totp->secretFor($user) ?? '', $code) || $totp->verifyRecovery($user, $code);
            if (! $valid) { return response()->json(['message' => 'A valid MFA code is required.', 'mfa_required' => true], 422); }
        }

        $plainToken = Str::random(80);

        AdminApiToken::query()->create([
            'user_id' => $user->id,
            'name' => 'admin-dashboard',
            'token_hash' => hash('sha256', $plainToken),
            'last_used_at' => now(),
            'expires_at' => now()->addMinutes(max(1, (int) config('foodonlines.tokens.admin_ttl_minutes', 480))), 'ip_address' => $request->ip(), 'user_agent' => substr((string) $request->userAgent(), 0, 1000),
        ]);
        $user->forceFill(['last_login_at' => now()])->save();

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
