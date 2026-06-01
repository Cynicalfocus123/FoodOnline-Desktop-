import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AdminAuditEntry, AdminSidebarKey, AdminUserRecord } from "../data/admin";
import { ApiError, apiRequest } from "../lib/apiClient";
import { SignupRoleKey } from "../lib/registerSchema";

type AdminScreen = "login" | "dashboard";

type ApiAdmin = {
  id: number;
  name: string;
  email: string;
  role: "admin";
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
  securityMessage: string | null;
  settingsMessage: string | null;
  adminEmail: string;
  adminName: string;
  token: string | null;
  users: AdminUserRecord[];
  auditLog: AdminAuditEntry[];
  stats: DashboardStats;
  lastLoginAt: string | null;
  isLoadingUsers: boolean;
  deleteAccountRequests: AdminDeleteAccountRequest[];
  isLoadingDeleteAccountRequests: boolean;
  fetchCurrentAdmin: () => Promise<boolean>;
  fetchUsers: (role?: SignupRoleKey) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchDeleteAccountRequests: () => Promise<void>;
  updateDeleteAccountRequestStatus: (requestId: number, status: AdminDeleteAccountRequest["status"]) => Promise<void>;
  logoutAdmin: () => Promise<void>;
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
    requestStatus: user.status === "active" ? "approved" : "in_review",
    sourceLabel: user.registered_from ?? "database",
    createdTimestamp: user.created_at ?? new Date().toISOString(),
    reviewedAt: user.updated_at,
    notes: user.business_type ? `Business type: ${user.business_type}` : "Database user record.",
  };
}

function cleanError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.status === 401 ? "Invalid email or password" : error.message;
  }

  return fallback;
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
      securityMessage: "Admin login uses Laravel database authentication.",
      settingsMessage: null,
      adminEmail: "",
      adminName: "",
      token: null,
      users: [],
      auditLog: [],
      stats: emptyStats,
      lastLoginAt: null,
      isLoadingUsers: false,
      deleteAccountRequests: [],
      isLoadingDeleteAccountRequests: false,
      fetchCurrentAdmin: async () => {
        const token = get().token;

        if (!token) {
          return false;
        }

        try {
          const response = await apiRequest<{ admin: ApiAdmin }>("/admin/me", { token });
          set({
            screen: "dashboard",
            isAuthenticated: true,
            adminEmail: response.admin.email,
            adminName: response.admin.name,
            authError: null,
          });
          return true;
        } catch {
          set({ screen: "login", isAuthenticated: false, token: null });
          return false;
        }
      },
      fetchUsers: async (role = get().activeUsersTab) => {
        const token = get().token;

        if (!token) {
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

        if (!token) {
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

        if (!token) {
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
        const token = get().token;

        if (token) {
          await apiRequest("/admin/logout", { method: "POST", token }).catch(() => undefined);
        }

        set({
          screen: "login",
          isAuthenticated: false,
          authError: null,
          settingsMessage: "Admin session ended.",
          token: null,
          adminEmail: "",
          adminName: "",
          users: [],
          stats: emptyStats,
          deleteAccountRequests: [],
        });
      },
      setActiveSidebarKey: (key) => set({ activeSidebarKey: key, authError: null, settingsMessage: null }),
      setActiveUsersTab: (tab) => {
        set({ activeSidebarKey: "users", activeUsersTab: tab, authError: null });
        void get().fetchUsers(tab);
      },
      loginAdmin: async (email, password) => {
        try {
          const response = await apiRequest<{ token: string; admin: ApiAdmin }>("/admin/login", {
            method: "POST",
            body: { email, password },
          });

          set((state) => ({
            screen: "dashboard",
            isAuthenticated: true,
            activeSidebarKey: "overview",
            authError: null,
            settingsMessage: null,
            token: response.token,
            adminEmail: response.admin.email,
            adminName: response.admin.name,
            lastLoginAt: new Date().toISOString(),
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
              createAuditEntry("settings.credentials", "Admin updated database profile settings."),
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
        securityMessage: state.securityMessage,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<AdminStore>),
        screen: "login",
        isAuthenticated: false,
        activeSidebarKey: "overview",
        activeUsersTab: "customer",
        authError: null,
        settingsMessage: null,
        users: [],
        stats: emptyStats,
        deleteAccountRequests: [],
        isLoadingDeleteAccountRequests: false,
      }),
    },
  ),
);
