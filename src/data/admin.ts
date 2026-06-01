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

export type AdminRequestStatus = "approved" | "in_review";

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

export const laravelMySqlBlueprint = {
  tables: [
    {
      name: "users",
      columns: [
        "id",
        "name",
        "email unique index",
        "password hashed",
        "role index: admin/customer/supplier/partner",
        "phone nullable",
        "company_name nullable",
        "business_type nullable",
        "status default active",
      ],
    },
    {
      name: "admin_api_tokens",
      columns: ["id", "user_id", "token_hash unique", "last_used_at nullable", "revoked_at nullable"],
    },
    {
      name: "user_api_tokens",
      columns: ["id", "user_id", "token_hash unique", "last_used_at nullable", "revoked_at nullable"],
    },
  ],
  routes: [
    "POST /api/v1/auth/register",
    "POST /api/v1/auth/login",
    "POST /api/v1/auth/logout",
    "GET /api/v1/auth/me",
    "POST /api/v1/admin/login",
    "POST /api/v1/admin/logout",
    "GET /api/v1/admin/me",
    "GET /api/v1/admin/users",
    "PUT /api/v1/admin/settings",
    "GET /api/v1/admin/dashboard-stats",
    "GET /api/v1/admin/delete-account-requests",
    "PUT /api/v1/admin/delete-account-requests/{requestId}",
  ],
  middleware: ["admin.token", "throttle admin login", "Laravel validation requests"],
  validation: [
    "Admin login verifies database user role and hashed password",
    "Admin settings require current password before profile or password changes",
    "Registration validates role, email, contact number, Line ID, and company details",
  ],
};

export const adminSecurityChecklist = [
  "Admin login calls Laravel API and checks MySQL users table.",
  "Public registration and login write to and read from the live backend, not mock queue state.",
  "Passwords are verified only on server; frontend never compares passwords.",
  "Bearer tokens are stored by the browser and revoked by backend logout.",
  "Admin API routes require protected admin token middleware.",
  "Registration and login routes stay rate-limited on backend.",
  "All signup fields render as plain text; React escaping stays in place.",
];

export function getAdminSummaryLabel(roleKey: SignupRoleKey) {
  return getSignupRoleMeta(roleKey).adminLabel;
}
