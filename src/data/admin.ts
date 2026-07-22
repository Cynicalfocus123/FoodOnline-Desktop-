import { SignupRoleKey, getSignupRoleMeta, signupRoles } from "../lib/registerSchema";

export const adminSidebarItems = [
  {
    key: "overview",
    label: "Overview",
    description: "Security posture and platform health",
  },
  {
    key: "users",
    label: "Users",
    description: "Review signup requests and account intake",
  },
  {
    key: "categories",
    label: "Categories",
    description: "Hierarchy, visibility, media, and aliases",
  },
  {
    key: "brands",
    label: "Brands",
    description: "Brand records, countries, and logos",
  },
  {
    key: "products",
    label: "Products",
    description: "Products, variants, images, and nutrition",
  },
  { key: "orders", label: "Orders", description: "Orders, payments, fulfillment, and history" },
  { key: "inventory", label: "Inventory", description: "Variant stock, reservations, and movements" },
  { key: "promotions", label: "Promo Codes", description: "Discount rules, limits, and redemption" },
  { key: "referrals", label: "Referrals", description: "Referral programs, rewards, and review workflow" },
  { key: "audit", label: "Audit Logs", description: "Recorded commerce admin actions" },
  { key: "returns", label: "Returns", description: "Review requests, inspections, restocking, and refunds" },
  { key: "reviews", label: "Reviews", description: "Moderate customer reviews and reports" },
  { key: "support", label: "Support", description: "Order-linked customer support tickets" },
  { key: "reports", label: "Reports", description: "Operational metrics and protected exports" },
  { key: "staff", label: "Staff & MFA", description: "Permissions, sessions, and administrator MFA" },
  { key: "operations", label: "Operations", description: "Service readiness and task recovery" },
  {
    key: "settings",
    label: "Admin Settings",
    description: "Rotate admin profile and password",
  },
  {
    key: "deleteAccount",
    label: "Delete Account",
    description: "Review account deletion requests",
  },
] as const;

export type AdminSidebarKey = (typeof adminSidebarItems)[number]["key"];

export const adminRoleTabs = signupRoles.map((role) => ({
  key: role.key,
  label: role.adminLabel,
  description: role.description,
}));

export type AdminRequestStatus = "approved" | "in_review" | "disabled";

export type AdminUserRecord = {
  id: string;
  selectedRole: SignupRoleKey;
  emailAddress: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  lineId: string;
  companyName: string;
  requestStatus: AdminRequestStatus;
  sourceLabel: string;
  createdTimestamp: string;
  reviewedAt: string | null;
  notes: string;
};

export type AdminAuditEntry = {
  id: string;
  action: string;
  detail: string;
  createdTimestamp: string;
};

export const adminRequestStatusMeta: Record<
  AdminRequestStatus,
  {
    label: string;
    classes: string;
  }
> = {
  in_review: {
    label: "In Review",
    classes: "border-sky-200 bg-sky-50 text-sky-700",
  },
  approved: {
    label: "Approved",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  disabled: {
    label: "Archived",
    classes: "border-neutral-200 bg-neutral-100 text-neutral-700",
  },
};

export const adminTableColumns = [
  "Email",
  "First Name",
  "Last Name",
  "Contact Number",
  "Line ID",
  "Company Name",
  "Status",
  "Source",
  "Created",
  "Reviewed",
  "Actions",
] as const;

export const adminSecurityChecklist = [
  "Administrator access requires a valid authorized account.",
  "Passwords are never shown or compared in the interface.",
  "Signing out ends the active administrator session.",
  "Profile changes require the current password.",
  "Repeated sign-in attempts are limited for account protection.",
  "User-submitted fields are displayed as plain text.",
];

export function getAdminSummaryLabel(roleKey: SignupRoleKey) {
  return getSignupRoleMeta(roleKey).adminLabel;
}
