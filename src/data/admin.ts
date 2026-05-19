import { SignupRoleKey, getSignupRoleMeta, signupRoles } from "../lib/registerSchema";

export const adminSidebarItems = [
  {
    key: "overview",
    label: "Overview",
    description: "Security and database status",
  },
  {
    key: "users",
    label: "Users",
    description: "Customers, suppliers, and partners",
  },
  {
    key: "settings",
    label: "Admin Settings",
    description: "Update admin profile and password",
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
    label: "Inactive",
    classes: "border-sky-200 bg-sky-50 text-sky-700",
  },
  approved: {
    label: "Active",
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
  "Updated",
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
  ],
  routes: [
    "POST /api/v1/admin/login",
    "POST /api/v1/admin/logout",
    "GET /api/v1/admin/me",
    "GET /api/v1/admin/users",
    "PUT /api/v1/admin/settings",
    "GET /api/v1/admin/dashboard-stats",
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
  "Passwords are hashed and verified only on server.",
  "Bearer tokens are stored hashed in database and revoked on logout.",
  "Admin API routes require admin token middleware.",
  "Registration and login routes are rate-limited.",
  "React renders database text safely as plain text.",
];

export function getAdminSummaryLabel(roleKey: SignupRoleKey) {
  return getSignupRoleMeta(roleKey).adminLabel;
}
