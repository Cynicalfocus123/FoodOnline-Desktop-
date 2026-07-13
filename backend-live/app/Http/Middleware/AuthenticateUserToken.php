<?php

namespace App\Http\Middleware;

use App\Models\UserApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateUserToken
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $plainToken = $request->bearerToken();

        if (! is_string($plainToken) || trim($plainToken) === '') {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $token = UserApiToken::query()
            ->with('user')
            ->where('token_hash', hash('sha256', $plainToken))
            ->whereNull('revoked_at')
            ->where(function ($query): void {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();

        $supportedAccountTypes = config('foodonlines.supported_account_types', ['customer', 'supplier', 'partner']);
        $accountType = $token?->user?->account_type ?: $token?->user?->role;

        if (! $token || ! $token->user || ! in_array($accountType, $supportedAccountTypes, true) || $token->user->status !== 'active') {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $token->forceFill(['last_used_at' => now()])->save();

        $request->attributes->set('user_api_token', $token);
        $request->setUserResolver(fn () => $token->user);

        return $next($request);
    }
}
