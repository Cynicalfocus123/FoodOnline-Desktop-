import type { AdminSidebarKey } from "../data/admin";

export const adminPermissions = [
  "dashboard.view", "dashboard.manage", "users.view", "users.manage", "categories.view", "categories.manage",
  "brands.view", "brands.manage", "products.view", "products.manage", "product_media.manage", "orders.view",
  "orders.manage", "inventory.view", "inventory.manage", "promotions.view", "promotions.manage", "referrals.view",
  "referrals.manage", "audit.view", "returns.view", "returns.manage", "reviews.view", "reviews.moderate",
  "support.view", "support.manage", "reports.view", "reports.export", "staff.view", "staff.manage",
  "operations.view", "operations.manage", "commerce_settings.view", "commerce_settings.manage", "own_profile.manage",
  "own_mfa.manage",
] as const;

export type AdminPermission = (typeof adminPermissions)[number];

export const adminSidebarPermissions: Record<AdminSidebarKey, AdminPermission[]> = {
  overview: ["dashboard.view"],
  users: ["users.view"],
  categories: ["categories.view"],
  brands: ["brands.view"],
  products: ["products.view"],
  orders: ["orders.view"],
  inventory: ["inventory.view"],
  promotions: ["promotions.view"],
  referrals: ["referrals.view"],
  audit: ["audit.view"],
  returns: ["returns.view"],
  reviews: ["reviews.view"],
  support: ["support.view"],
  reports: ["reports.view"],
  staff: ["staff.view"],
  operations: ["operations.view"],
  settings: ["own_profile.manage", "commerce_settings.view"],
  deleteAccount: ["users.view"],
};

export function canAdminPermission(permission: string, role: string | null | undefined, permissions: readonly string[]) {
  return role === "super_admin" || role === null || permissions.includes(permission);
}

export function canAdminAny(allowed: readonly string[], role: string | null | undefined, permissions: readonly string[]) {
  return allowed.some((permission) => canAdminPermission(permission, role, permissions));
}

export function isSuperAdminRole(role: string | null | undefined) {
  // Older admin records/API responses may not have staff_role yet. The
  // backend treats that legacy value as Super Admin until it is assigned.
  return role === "super_admin" || role == null;
}

export function sidebarHasAccess(key: AdminSidebarKey, role: string | null | undefined, permissions: readonly string[]) {
  if (key === "staff") return isSuperAdminRole(role);
  return canAdminAny(adminSidebarPermissions[key], role, permissions);
}

export function routePermissionForSidebar(key: AdminSidebarKey): AdminPermission[] {
  return adminSidebarPermissions[key];
}
