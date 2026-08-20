<?php

namespace App\Services\Security;

use App\Models\MediaUpload;
use App\Models\User;
use Illuminate\Http\Request;

final class AdminPermissionCatalog
{
    public const SUPER_ADMIN = 'super_admin';

    /** @return array<string, string> */
    public static function definitions(): array
    {
        return [
            'dashboard.view' => 'View dashboard',
            'dashboard.manage' => 'Manage dashboard operations',
            'users.view' => 'View managed users',
            'users.manage' => 'Manage managed users',
            'categories.view' => 'View categories',
            'categories.manage' => 'Manage categories',
            'brands.view' => 'View brands',
            'brands.manage' => 'Manage brands',
            'products.view' => 'View products',
            'products.manage' => 'Manage products and variants',
            'product_media.manage' => 'Manage product media',
            'orders.view' => 'View orders',
            'orders.manage' => 'Manage orders',
            'inventory.view' => 'View inventory',
            'inventory.manage' => 'Manage inventory',
            'promotions.view' => 'View promotions',
            'promotions.manage' => 'Manage promotions',
            'referrals.view' => 'View referrals',
            'referrals.manage' => 'Manage referrals',
            'audit.view' => 'View audit logs',
            'returns.view' => 'View returns',
            'returns.manage' => 'Manage returns',
            'reviews.view' => 'View reviews',
            'reviews.moderate' => 'Moderate reviews',
            'support.view' => 'View support',
            'support.manage' => 'Manage support',
            'reports.view' => 'View reports',
            'reports.export' => 'Export reports',
            'staff.view' => 'View staff administration',
            'staff.manage' => 'Manage staff administration',
            'operations.view' => 'View operations',
            'operations.manage' => 'Manage operations',
            'commerce_settings.view' => 'View commerce settings',
            'commerce_settings.manage' => 'Manage commerce settings',
            'own_profile.manage' => 'Manage own profile',
            'own_mfa.manage' => 'Manage own MFA',
        ];
    }

    /** @return array<string, array<int, string>> */
    public static function roleDefaults(): array
    {
        return [
            self::SUPER_ADMIN => array_keys(self::definitions()),
            'catalog_manager' => [
                'brands.view', 'brands.manage',
                'products.view', 'products.manage', 'product_media.manage', 'own_profile.manage', 'own_mfa.manage',
            ],
            'product_manager' => [
                'products.view', 'products.manage', 'product_media.manage', 'own_profile.manage', 'own_mfa.manage',
            ],
            'order_manager' => [
                'orders.view', 'orders.manage', 'inventory.view', 'inventory.manage',
                'returns.view', 'returns.manage', 'own_profile.manage', 'own_mfa.manage',
            ],
            'inventory_manager' => ['inventory.view', 'inventory.manage', 'own_profile.manage', 'own_mfa.manage'],
            'customer_support' => [
                'users.view', 'support.view', 'support.manage', 'returns.view',
                'reviews.view', 'reviews.moderate', 'own_profile.manage', 'own_mfa.manage',
            ],
            'marketing_manager' => [
                'promotions.view', 'promotions.manage', 'referrals.view',
                'referrals.manage', 'reports.view', 'reports.export', 'own_profile.manage', 'own_mfa.manage',
            ],
            'read_only' => [
                'dashboard.view', 'users.view', 'categories.view', 'brands.view',
                'products.view', 'orders.view', 'inventory.view', 'promotions.view',
                'referrals.view', 'audit.view', 'returns.view', 'reviews.view',
                'support.view', 'reports.view', 'operations.view', 'own_profile.manage', 'own_mfa.manage',
            ],
        ];
    }

    /** @return array<int, string> */
    public static function roles(): array
    {
        return array_keys(self::roleDefaults());
    }

    /** @return array<int, string> */
    public static function all(): array
    {
        return array_keys(self::definitions());
    }

    public static function isSuperAdmin(?User $user): bool
    {
        return $user?->role === 'admin'
            && ($user->staff_role === null || $user->staff_role === self::SUPER_ADMIN);
    }

    /** @return array<int, string> */
    public static function effectivePermissions(?User $user): array
    {
        if (! $user || $user->role !== 'admin') {
            return [];
        }

        if (self::isSuperAdmin($user)) {
            return self::all();
        }

        $grants = is_array($user->staff_permissions)
            ? $user->staff_permissions
            : (self::roleDefaults()[$user->staff_role] ?? []);

        return array_values(array_intersect(self::all(), array_values(array_unique($grants))));
    }

    public static function allows(?User $user, string $permission): bool
    {
        return in_array($permission, self::effectivePermissions($user), true);
    }

    public static function permissionForRequest(Request $request, ?string $explicit = null): ?string
    {
        if ($explicit !== null && $explicit !== '') {
            return $explicit;
        }

        $name = (string) $request->route()?->getName();
        $method = strtoupper($request->method());
        $read = in_array($method, ['GET', 'HEAD'], true);

        if (in_array($name, ['api.v1.admin.me', 'api.v1.admin.logout'], true)) {
            return null;
        }
        if ($name === 'api.v1.admin.settings') return 'own_profile.manage';
        if (str_contains($name, 'mfa.')) return 'own_mfa.manage';
        if (str_contains($name, 'staff.sessions')) return 'staff.manage';
        if (str_contains($name, 'staff.')) return $read ? 'staff.view' : 'staff.manage';
        if (str_contains($name, 'dashboard')) return 'dashboard.view';
        if (str_contains($name, 'delete-account-requests')) return $read ? 'users.view' : 'users.manage';
        if (str_contains($name, 'users')) return $read ? 'users.view' : 'users.manage';
        if (str_contains($name, 'categories')) return $read ? 'categories.view' : 'categories.manage';
        if (str_contains($name, 'category-aliases')) return 'categories.manage';
        if (str_contains($name, 'brands')) return $read ? 'brands.view' : 'brands.manage';
        if (str_contains($name, 'product-media')) return 'product_media.manage';
        if (str_contains($name, 'products.media')) return 'product_media.manage';
        if (str_contains($name, 'products.nutrition')) return $read ? 'products.view' : 'products.manage';
        if (str_contains($name, 'products.variants') || str_contains($name, 'product-variants')) return $read ? 'products.view' : 'products.manage';
        if (str_contains($name, 'products')) return $read ? 'products.view' : 'products.manage';
        if (str_contains($name, 'media-storage')) return 'media.storage.view';
        if (str_contains($name, 'media-uploads')) {
            return self::mediaPermission($request);
        }
        if (str_contains($name, 'orders')) return $read ? 'orders.view' : 'orders.manage';
        if (str_contains($name, 'inventory')) return $read ? 'inventory.view' : 'inventory.manage';
        if (str_contains($name, 'promotions')) return $read ? 'promotions.view' : 'promotions.manage';
        if (str_contains($name, 'commerce-settings')) return $read ? 'commerce_settings.view' : 'commerce_settings.manage';
        if (str_contains($name, 'audit-logs')) return 'audit.view';
        if (str_contains($name, 'referrals') || str_contains($name, 'referral-settings')) return $read ? 'referrals.view' : 'referrals.manage';
        if (str_contains($name, 'returns')) return $read ? 'returns.view' : 'returns.manage';
        if (str_contains($name, 'reviews')) return $read ? 'reviews.view' : 'reviews.moderate';
        if (str_contains($name, 'support')) return $read ? 'support.view' : 'support.manage';
        if (str_contains($name, 'reports')) return $name === 'api.v1.admin.reports.orders' ? 'reports.export' : 'reports.view';
        if (str_contains($name, 'operations') || str_contains($name, 'failed-jobs')) return $read ? 'operations.view' : 'operations.manage';

        return '__unmapped_admin_route__';
    }

    public static function staffRouteAllowed(?User $user): bool
    {
        return self::isSuperAdmin($user);
    }

    private static function mediaPermission(Request $request): string
    {
        $purpose = (string) $request->input('purpose', '');
        if ($purpose === '') {
            $upload = $request->route('mediaUpload');
            $purpose = $upload instanceof MediaUpload ? (string) $upload->purpose : '';
        }

        return match ($purpose) {
            'category_image', 'category_icon', 'category_desktop_banner', 'category_mobile_banner' => 'categories.manage',
            'brand_logo' => 'brands.manage',
            'product_image' => 'product_media.manage',
            'review_image' => 'reviews.moderate',
            'return_evidence' => 'returns.manage',
            'support_attachment' => 'support.manage',
            default => 'product_media.manage',
        };
    }
}
