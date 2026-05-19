<?php

namespace App\Http\Middleware;

use App\Models\AdminApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAdminToken
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

        $token = AdminApiToken::query()
            ->with('user')
            ->where('token_hash', hash('sha256', $plainToken))
            ->whereNull('revoked_at')
            ->first();

        if (! $token || ! $token->user || $token->user->role !== 'admin' || $token->user->status !== 'active') {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $token->forceFill(['last_used_at' => now()])->save();

        $request->attributes->set('admin_api_token', $token);
        $request->setUserResolver(fn () => $token->user);

        return $next($request);
    }
}
