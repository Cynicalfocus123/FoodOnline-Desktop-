<?php

namespace App\Http\Middleware;

use App\Models\UserApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateOptionalUserToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $plainToken = $request->bearerToken();
        if (! $plainToken) {
            return $next($request);
        }

        $token = UserApiToken::query()->with('user')->where('token_hash', hash('sha256', $plainToken))
            ->whereNull('revoked_at')->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))->first();
        $accountType = $token?->user?->account_type ?: $token?->user?->role;
        if (! $token || ! $token->user || $token->user->status !== 'active' || ! in_array($accountType, config('foodonlines.supported_account_types', []), true)) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $token->forceFill(['last_used_at' => now()])->save();
        $request->setUserResolver(fn () => $token->user);

        return $next($request);
    }
}
