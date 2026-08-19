import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AdminAuditEntry, AdminSidebarKey, AdminUserRecord } from "../data/admin";
import { ApiError, apiRequest } from "../lib/apiClient";
import { SignupRoleKey } from "../lib/registerSchema";
import { toUserFacingErrorMessage } from "../lib/userFacingError";
import { canAdminPermission, type AdminPermission } from "../lib/adminAccess";

type AdminScreen = "login" | "dashboard";

type ApiAdmin = {
  id: number;
  name: string;
  email: string;
  role: "admin";
  staff_role: string;
  permissions: string[];
  status: "active" | "disabled";
  mfa_enabled: boolean;
  last_login_at: string | null;
};

type ApiManagedUser = {
  account_type?: SignupRoleKey;
  id: string;
  role: SignupRoleKey;
  email: string;
  first_name: string | null;
  last_name: string | null;
  contact_number: string | null;
  line_id: string | null;
  company_name: string | null;
  business_type: string | null;
  status: string;
  registered_from: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type DashboardStats = {
  total_users: number;
  customers: number;
  suppliers: number;
  partners: number;
  active_users: number;
  total_categories: number;
  total_brands: number;
  total_products: number;
  published_products: number;
  draft_products: number;
  archived_products: number;
  out_of_stock_default_variants: number;
  orders_today: number;
  pending_orders: number;
  cod_pending_collection: number;
  revenue_minor: number;
  low_stock_variants: number;
};

type ApiAdminSession = {
  admin: ApiAdmin;
  expires_at?: string | null;
};

type ApiDeleteAccountRequest = {
  id: number;
  user_id: number;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  reason: string;
  other_reason: string | null;
  status: "pending" | "reviewed" | "completed" | "cancelled";
  requested_at: string | null;
  reviewed_at: string | null;
};

export type AdminDeleteAccountRequest = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  reason: string;
  otherReason: string;
  status: "pending" | "reviewed" | "completed" | "cancelled";
  requestedAt: string;
  reviewedAt: string;
};

type AdminStore = {
  screen: AdminScreen;
  isAuthenticated: boolean;
  activeSidebarKey: AdminSidebarKey;
  activeUsersTab: SignupRoleKey;
  authError: string | null;
  hasHydratedSession: boolean;
  isLoggingOut: boolean;
  isValidatingSession: boolean;
  securityMessage: string | null;
  settingsMessage: string | null;
  adminEmail: string;
  adminName: string;
  token: string | null;
  users: AdminUserRecord[];
  auditLog: AdminAuditEntry[];
  stats: DashboardStats;
  lastLoginAt: string | null;
  sessionExpiresAt: string | null;
  staffRole: string | null;
  permissions: string[];
  mfaEnabled: boolean;
  can: (permission: AdminPermission | string) => boolean;
  isLoadingUsers: boolean;
  deleteAccountRequests: AdminDeleteAccountRequest[];
  isLoadingDeleteAccountRequests: boolean;
  fetchCurrentAdmin: () => Promise<boolean>;
  fetchUsers: (role?: SignupRoleKey) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchDeleteAccountRequests: () => Promise<void>;
  updateDeleteAccountRequestStatus: (requestId: number, status: AdminDeleteAccountRequest["status"]) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  markSessionHydrated: () => void;
  setActiveSidebarKey: (key: AdminSidebarKey) => void;
  setActiveUsersTab: (tab: SignupRoleKey) => void;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  updateAdminCredentials: (
    currentPassword: string,
    nextName: string,
    nextEmail: string,
    nextPassword: string,
    confirmPassword: string,
  ) => Promise<boolean>;
};

const emptyStats: DashboardStats = {
  total_users: 0,
  customers: 0,
  suppliers: 0,
  partners: 0,
  active_users: 0,
  total_categories: 0,
  total_brands: 0,
  total_products: 0,
  published_products: 0,
  draft_products: 0,
  archived_products: 0,
  out_of_stock_default_variants: 0,
  orders_today: 0,
  pending_orders: 0,
  cod_pending_collection: 0,
  revenue_minor: 0,
  low_stock_variants: 0,
};

function createAuditEntry(action: string, detail: string): AdminAuditEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    action,
    detail,
    createdTimestamp: new Date().toISOString(),
  };
}

function toAdminUserRecord(user: ApiManagedUser): AdminUserRecord {
  const resolvedRole = user.account_type ?? user.role;

  return {
    id: String(user.id),
    selectedRole: resolvedRole,
    emailAddress: user.email,
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
    contactNumber: user.contact_number ?? "",
    lineId: user.line_id ?? "",
    companyName: user.company_name ?? "",
    requestStatus: user.status === "active" ? "approved" : user.status === "disabled" ? "disabled" : "in_review",
    sourceLabel: user.registered_from ? "Online signup" : "Account",
    createdTimestamp: user.created_at ?? new Date().toISOString(),
    reviewedAt: user.updated_at,
    notes: user.business_type ? `Business type: ${user.business_type}` : "Account record.",
  };
}

function cleanError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.status === 401 ? "Invalid email or password" : toUserFacingErrorMessage(error, fallback);
  }

  return fallback;
}

function isAuthoritativeAdminRejection(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

function toDeleteAccountRequest(item: ApiDeleteAccountRequest): AdminDeleteAccountRequest {
  return {
    id: item.id,
    userId: item.user_id,
    userName: item.user_name ?? "Unknown",
    userEmail: item.user_email ?? "Not provided",
    userPhone: item.user_phone ?? "Not provided",
    reason: item.reason,
    otherReason: item.other_reason ?? "",
    status: item.status,
    requestedAt: item.requested_at ?? "",
    reviewedAt: item.reviewed_at ?? "",
  };
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      screen: "login",
      isAuthenticated: false,
      activeSidebarKey: "overview",
      activeUsersTab: "customer",
      authError: null,
      hasHydratedSession: false,
      isLoggingOut: false,
      isValidatingSession: false,
      securityMessage: "Sign in with your authorized administrator account.",
      settingsMessage: null,
      adminEmail: "",
      adminName: "",
      token: null,
      users: [],
      auditLog: [],
      stats: emptyStats,
      lastLoginAt: null,
      sessionExpiresAt: null,
      staffRole: null,
      permissions: [],
      mfaEnabled: false,
      can: (permission) => canAdminPermission(permission, get().staffRole, get().permissions),
      isLoadingUsers: false,
      deleteAccountRequests: [],
      isLoadingDeleteAccountRequests: false,
      markSessionHydrated: () => set({ hasHydratedSession: true }),
      fetchCurrentAdmin: async () => {
        const token = get().token;

        if (!token) {
          set({
            hasHydratedSession: true,
            isAuthenticated: false,
            isValidatingSession: false,
          });
          return false;
        }

        set({ isValidatingSession: true });

        try {
          const response = await apiRequest<ApiAdminSession>("/admin/me", { token });
          if (get().token !== token) return false;

          set({
            screen: "dashboard",
            isAuthenticated: true,
            hasHydratedSession: true,
            isValidatingSession: false,
            adminEmail: response.admin.email,
            adminName: response.admin.name,
            staffRole: response.admin.staff_role,
            permissions: response.admin.permissions ?? [],
            mfaEnabled: response.admin.mfa_enabled,
            lastLoginAt: response.admin.last_login_at ?? get().lastLoginAt,
            authError: null,
            securityMessage: null,
            sessionExpiresAt: response.expires_at ?? get().sessionExpiresAt,
          });
          return true;
        } catch (error) {
          if (get().token !== token) return false;

          if (isAuthoritativeAdminRejection(error)) {
            set({
              screen: "login",
              isAuthenticated: false,
              hasHydratedSession: true,
              isValidatingSession: false,
              securityMessage: "Your administrator session has expired. Please sign in again.",
              token: null,
              sessionExpiresAt: null,
            });
            return false;
          }

          set({
            screen: "dashboard",
            isAuthenticated: true,
            hasHydratedSession: true,
            isValidatingSession: false,
            securityMessage: "We could not verify your administrator session right now. Please try again shortly.",
          });
          return false;
        }
      },
      fetchUsers: async (role = get().activeUsersTab) => {
        const token = get().token;

        if (!token || !get().can("users.view")) {
          return;
        }

        set({ isLoadingUsers: true });

        try {
          const response = await apiRequest<{ users: ApiManagedUser[] }>(`/admin/users?account_type=${role}`, {
            token,
          });
          set({
            users: response.users.map(toAdminUserRecord),
            isLoadingUsers: false,
            authError: null,
          });
        } catch (error) {
          set({
            isLoadingUsers: false,
            authError: cleanError(error, "Unable to load users."),
          });
        }
      },
      fetchStats: async () => {
        const token = get().token;

        if (!token || !get().can("dashboard.view")) {
          return;
        }

        try {
          const response = await apiRequest<{ stats: DashboardStats }>("/admin/dashboard-stats", { token });
          set({ stats: response.stats });
        } catch {
          set({ stats: emptyStats });
        }
      },
      fetchDeleteAccountRequests: async () => {
        const token = get().token;

        if (!token || !get().can("users.view")) {
          return;
        }

        set({ isLoadingDeleteAccountRequests: true });
        try {
          const response = await apiRequest<{ delete_account_requests: ApiDeleteAccountRequest[] }>("/admin/delete-account-requests", {
            token,
          });
          set({
            deleteAccountRequests: (response.delete_account_requests ?? []).map(toDeleteAccountRequest),
            isLoadingDeleteAccountRequests: false,
          });
        } catch {
          set({
            deleteAccountRequests: [],
            isLoadingDeleteAccountRequests: false,
          });
        }
      },
      updateDeleteAccountRequestStatus: async (requestId, status) => {
        const token = get().token;

        if (!token) {
          return;
        }

        await apiRequest(`/admin/delete-account-requests/${requestId}`, {
          method: "PUT",
          token,
          body: {
            status,
          },
        }).catch(() => undefined);
        await get().fetchDeleteAccountRequests();
      },
      logoutAdmin: async () => {
        if (get().isLoggingOut) return;
        const token = get().token;

        set({
          screen: "login",
          isAuthenticated: false,
          authError: null,
          hasHydratedSession: true,
          isLoggingOut: true,
          isValidatingSession: false,
          settingsMessage: "Admin session ended.",
          token: null,
          sessionExpiresAt: null,
          adminEmail: "",
          adminName: "",
          staffRole: null,
          permissions: [],
          mfaEnabled: false,
          users: [],
          stats: emptyStats,
          deleteAccountRequests: [],
        });

        try {
          if (token) {
            await apiRequest("/admin/logout", { method: "POST", token }).catch(() => undefined);
          }
        } finally {
          set({ isLoggingOut: false });
        }
      },
      setActiveSidebarKey: (key) => set({ activeSidebarKey: key, authError: null, settingsMessage: null }),
      setActiveUsersTab: (tab) => {
        set({ activeSidebarKey: "users", activeUsersTab: tab, authError: null });
        void get().fetchUsers(tab);
      },
      loginAdmin: async (email, password) => {
        try {
          const response = await apiRequest<ApiAdminSession & { token: string }>("/admin/login", {
            method: "POST",
            body: { email, password },
          });

          set((state) => ({
            screen: "dashboard",
            isAuthenticated: true,
            hasHydratedSession: true,
            isLoggingOut: false,
            isValidatingSession: false,
            activeSidebarKey: "overview",
            authError: null,
            settingsMessage: null,
            token: response.token,
            adminEmail: response.admin.email,
            adminName: response.admin.name,
            staffRole: response.admin.staff_role,
            permissions: response.admin.permissions ?? [],
            mfaEnabled: response.admin.mfa_enabled,
            lastLoginAt: new Date().toISOString(),
            sessionExpiresAt: response.expires_at ?? null,
            auditLog: [
              createAuditEntry("auth.success", `Admin signed in as ${response.admin.email}.`),
              ...state.auditLog,
            ].slice(0, 12),
          }));
          await get().fetchStats();
          await get().fetchUsers(get().activeUsersTab);
          await get().fetchDeleteAccountRequests();
          return true;
        } catch (error) {
          set({ authError: cleanError(error, "Unable to sign in.") });
          return false;
        }
      },
      updateAdminCredentials: async (currentPassword, nextName, nextEmail, nextPassword, confirmPassword) => {
        const token = get().token;

        if (!token) {
          set({ settingsMessage: "Admin session expired. Sign in again." });
          return false;
        }

        try {
          const response = await apiRequest<{ admin: ApiAdmin }>("/admin/settings", {
            method: "PUT",
            token,
            body: {
              name: nextName,
              email: nextEmail,
              current_password: currentPassword,
              password: nextPassword || null,
              password_confirmation: confirmPassword || null,
            },
          });

          set((state) => ({
            adminEmail: response.admin.email,
            adminName: response.admin.name,
            settingsMessage: "Admin settings updated.",
            auditLog: [
              createAuditEntry("settings.credentials", "Admin updated profile settings."),
              ...state.auditLog,
            ].slice(0, 12),
          }));
          return true;
        } catch (error) {
          set({ settingsMessage: cleanError(error, "Security update blocked. Check current password and fields.") });
          return false;
        }
      },
    }),
    {
      name: "foodonline-admin-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        adminEmail: state.adminEmail,
        adminName: state.adminName,
        lastLoginAt: state.lastLoginAt,
        sessionExpiresAt: state.sessionExpiresAt,
        staffRole: state.staffRole,
        permissions: state.permissions,
        mfaEnabled: state.mfaEnabled,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<AdminStore>),
        screen: "login",
        isAuthenticated: false,
        hasHydratedSession: false,
        isLoggingOut: false,
        isValidatingSession: false,
        staffRole: null,
        permissions: [],
        mfaEnabled: false,
        activeSidebarKey: "overview",
        activeUsersTab: "customer",
        authError: null,
        settingsMessage: null,
        securityMessage: "Sign in with your authorized administrator account.",
        users: [],
        stats: emptyStats,
        deleteAccountRequests: [],
        isLoadingDeleteAccountRequests: false,
      }),
      onRehydrateStorage: () => (state) => state?.markSessionHydrated(),
    },
  ),
);
