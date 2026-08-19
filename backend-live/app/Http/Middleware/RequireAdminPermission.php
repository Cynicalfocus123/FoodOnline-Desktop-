<?php

namespace App\Http\Middleware;

use App\Services\Security\AdminPermissionCatalog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireAdminPermission
{
    public function handle(Request $request, Closure $next, ?string $permission = null): Response
    {
        $user = $request->user();
        $required = AdminPermissionCatalog::permissionForRequest($request, $permission);

        if ($required === null) {
            return $next($request);
        }

        $mediaStorageAllowed = $required === 'media.storage.view' && collect([
            'categories.manage', 'brands.manage', 'product_media.manage', 'reviews.moderate',
            'returns.manage', 'support.manage',
        ])->contains(fn (string $permission): bool => AdminPermissionCatalog::allows($user, $permission));
        $allowed = $required !== '__unmapped_admin_route__'
            && ($mediaStorageAllowed || AdminPermissionCatalog::allows($user, $required))
            && (! str_starts_with($required, 'staff.') || AdminPermissionCatalog::staffRouteAllowed($user));

        abort_unless($allowed, 403, 'You do not have access to this administrator area.');

        return $next($request);
    }
}
