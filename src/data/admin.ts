import { SignupRoleKey, getSignupRoleMeta, signupRoles } from "../lib/registerSchema";

export const adminSidebarItems = [
  {
    key: "overview",
    label: "Overview",
    description: "Security posture and Laravel handoff",
  },
  {
    key: "users",
    label: "Users",
    description: "Manage approved users and account intake",
  },
  {
    key: "settings",
    label: "Admin Settings",
    description: "Rotate admin email and password",
  },
] as const;

export type AdminSidebarKey = (typeof adminSidebarItems)[number]["key"];

export const adminRoleTabs = signupRoles.map((role) => ({
  key: role.key,
  label: role.adminLabel,
  description: role.description,
}));

export type AdminRequestStatus = "approved" | "in_review";
export type AdminUserAction = "in_review" | "delete";

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

export const adminSeedUsers: AdminUserRecord[] = [
  {
    id: "signup-1001",
    selectedRole: "customer",
    emailAddress: "suda.kaeo@example.com",
    firstName: "Suda",
    lastName: "Kaeo",
    contactNumber: "+66 81 456 3388",
    lineId: "sudafresh",
    companyName: "Bangkok Family Market",
    requestStatus: "approved",
    sourceLabel: "Frontend signup",
    createdTimestamp: "2026-05-16T08:10:00.000Z",
    reviewedAt: "2026-05-16T10:40:00.000Z",
    notes: "Repeat household order profile. Safe for launch pilot.",
  },
  {
    id: "signup-1002",
    selectedRole: "customer",
    emailAddress: "maya.nguyen@example.com",
    firstName: "Maya",
    lastName: "Nguyen",
    contactNumber: "+1 (415) 555-0193",
    lineId: "maya.ng",
    companyName: "Sunset Pantry Club",
    requestStatus: "approved",
    sourceLabel: "Frontend signup",
    createdTimestamp: "2026-05-17T02:22:00.000Z",
    reviewedAt: "2026-05-17T02:22:00.000Z",
    notes: "Auto-approved from frontend signup flow.",
  },
  {
    id: "signup-1003",
    selectedRole: "supplier",
    emailAddress: "ops@greencratefoods.com",
    firstName: "Narin",
    lastName: "Krit",
    contactNumber: "+66 89 200 1182",
    lineId: "greencrate.ops",
    companyName: "Green Crate Foods",
    requestStatus: "in_review",
    sourceLabel: "Frontend signup",
    createdTimestamp: "2026-05-15T04:55:00.000Z",
    reviewedAt: "2026-05-15T06:15:00.000Z",
    notes: "Need cold-chain warehouse documents in backend phase.",
  },
  {
    id: "signup-1004",
    selectedRole: "supplier",
    emailAddress: "hello@coastharvest.io",
    firstName: "Elena",
    lastName: "Santos",
    contactNumber: "+63 917 555 6021",
    lineId: "coastharvest",
    companyName: "Coast Harvest Seafoods",
    requestStatus: "in_review",
    sourceLabel: "Frontend signup",
    createdTimestamp: "2026-05-17T11:05:00.000Z",
    reviewedAt: "2026-05-17T12:10:00.000Z",
    notes: "Manual review flag for supplier onboarding details.",
  },
  {
    id: "signup-1005",
    selectedRole: "partner",
    emailAddress: "alliances@swiftmile.com",
    firstName: "Rico",
    lastName: "Tan",
    contactNumber: "+65 8123 4456",
    lineId: "swiftmile-bd",
    companyName: "SwiftMile Logistics",
    requestStatus: "approved",
    sourceLabel: "Frontend signup",
    createdTimestamp: "2026-05-14T09:30:00.000Z",
    reviewedAt: "2026-05-14T10:25:00.000Z",
    notes: "Approved for delivery integration discovery.",
  },
];

export const adminTableColumns = [
  "Email",
  "First Name",
  "Last Name",
  "Contact Number",
  "Line ID",
  "Company Name",
  "Request Status",
  "Source",
  "Created",
  "Reviewed",
  "Actions",
] as const;

export const laravelMySqlBlueprint = {
  tables: [
    {
      name: "admins",
      columns: [
        "id",
        "email unique index",
        "password_hash",
        "last_login_at nullable",
        "locked_until nullable",
        "remember_token nullable",
        "timestamps",
      ],
    },
    {
      name: "signup_requests",
      columns: [
        "id",
        "role enum(customer,supplier,partner) index",
        "email_address index",
        "first_name",
        "last_name",
        "contact_number",
        "line_id nullable",
        "company_name",
        "status enum index",
        "notes nullable",
        "reviewed_by nullable foreign key admins.id",
        "reviewed_at nullable",
        "timestamps",
        "softDeletes",
      ],
    },
    {
      name: "admin_login_logs",
      columns: [
        "id",
        "admin_id nullable",
        "email_attempted",
        "ip_address",
        "user_agent",
        "was_successful",
        "created_at",
      ],
    },
    {
      name: "admin_audit_logs",
      columns: [
        "id",
        "admin_id",
        "action",
        "target_type",
        "target_id",
        "metadata json",
        "created_at",
      ],
    },
  ],
  routes: [
    "POST /admin/login",
    "POST /admin/logout",
    "GET /admin/signup-requests",
    "PATCH /admin/signup-requests/{id}",
    "PATCH /admin/settings/credentials",
  ],
  middleware: [
    "auth admin session guard",
    "throttle admin login",
    "csrf for session routes",
    "audit logging middleware",
  ],
  validation: [
    "Request classes for login, signup request filters, and admin settings rotation",
    "Use Laravel validator rules for email format, role enum, status enum, and max lengths",
    "Use Hash::check and Hash::make for password handling only on server",
  ],
};

export const adminSecurityChecklist = [
  "Never use dangerouslySetInnerHTML or eval in admin UI.",
  "Normalize and validate email before auth; keep login failures generic.",
  "Rate-limit login and prepare Laravel throttle middleware for server phase.",
  "Render all signup fields as plain text only; React escaping stays in place.",
  "Current mock action shows delete control; real backend should still protect destructive operations carefully.",
  "Prepare CSRF, secure cookies, audit logs, and login logs in Laravel backend.",
];

export function getAdminSummaryLabel(roleKey: SignupRoleKey) {
  return getSignupRoleMeta(roleKey).adminLabel;
}
