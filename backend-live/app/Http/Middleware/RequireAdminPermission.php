<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireAdminPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();
        $permissions = is_array($user?->staff_permissions) ? $user->staff_permissions : [];
        $allowed = $user && $user->role === 'admin' && ($user->staff_role === null || $user->staff_role === 'super_admin' || in_array($permission, $permissions, true));
        abort_unless($allowed, 403, 'You are not authorized for this action.');
        return $next($request);
    }
}
