import type { AdminSidebarKey } from "../data/admin";

export type AdminRoute = {
  sidebarKey: AdminSidebarKey;
  module: string;
  mode: "list" | "create" | "edit";
  recordId: string | null;
};

const sidebarKeys = new Set<AdminSidebarKey>([
  "overview", "users", "categories", "brands", "products", "orders", "inventory", "promotions", "audit",
  "returns", "reviews", "support", "reports", "staff", "operations", "settings", "deleteAccount",
]);

const segmentToSidebar: Record<string, AdminSidebarKey> = {
  "": "overview",
  overview: "overview",
  users: "users",
  customers: "users",
  suppliers: "users",
  partners: "users",
  categories: "categories",
  brands: "brands",
  products: "products",
  orders: "orders",
  inventory: "inventory",
  promotions: "promotions",
  "promo-codes": "promotions",
  audit: "audit",
  returns: "returns",
  reviews: "reviews",
  support: "support",
  reports: "reports",
  staff: "staff",
  operations: "operations",
  settings: "settings",
  "delete-account": "deleteAccount",
};

const sidebarToSegment: Record<AdminSidebarKey, string> = {
  overview: "",
  users: "users",
  categories: "categories",
  brands: "brands",
  products: "products",
  orders: "orders",
  inventory: "inventory",
  promotions: "promotions",
  audit: "audit",
  returns: "returns",
  reviews: "reviews",
  support: "support",
  reports: "reports",
  staff: "staff",
  operations: "operations",
  settings: "settings",
  deleteAccount: "delete-account",
};

export function readAdminRoute(pathname = window.location.pathname): AdminRoute {
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  const module = segments[0] ?? "";
  const sidebarKey = segmentToSidebar[module] ?? "overview";
  if (segments[1] === "create") return { sidebarKey, module, mode: "create", recordId: null };
  if (segments[1] && segments[2] === "edit") return { sidebarKey, module, mode: "edit", recordId: segments[1] };
  return { sidebarKey, module, mode: "list", recordId: null };
}
export function adminPath(sidebarKey: AdminSidebarKey) {
  const segment = sidebarToSegment[sidebarKey];
  return segment ? `/admin/${segment}` : "/admin";
}

export function isAdminSidebarKey(value: string): value is AdminSidebarKey {
  return sidebarKeys.has(value as AdminSidebarKey);
}
