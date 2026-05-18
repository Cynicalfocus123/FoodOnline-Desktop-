import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  AdminAuditEntry,
  AdminRequestStatus,
  AdminSidebarKey,
  AdminUserAction,
  AdminUserRecord,
  adminSeedUsers,
} from "../data/admin";
import { SignupSubmission, SignupRoleKey } from "../lib/registerSchema";
import {
  createClientId,
  createSalt,
  hashSecret,
  normalizeAdminEmail,
  sanitizeAdminPasswordInput,
  sanitizeFreeText,
  validateAdminEmail,
  validateAdminPassword,
} from "../lib/security";

type AdminScreen = "login" | "dashboard";

type AdminStore = {
  screen: AdminScreen;
  isAuthenticated: boolean;
  activeSidebarKey: AdminSidebarKey;
  activeUsersTab: SignupRoleKey;
  authError: string | null;
  securityMessage: string | null;
  settingsMessage: string | null;
  adminEmail: string;
  sessionAdminLabel: string | null;
  passwordHash: string | null;
  passwordSalt: string | null;
  users: AdminUserRecord[];
  auditLog: AdminAuditEntry[];
  lastLoginAt: string | null;
  logoutAdmin: () => void;
  setActiveSidebarKey: (key: AdminSidebarKey) => void;
  setActiveUsersTab: (tab: SignupRoleKey) => void;
  loginAdmin: (adminIdentity: string, password: string) => Promise<boolean>;
  applyUserAction: (userId: string, action: AdminUserAction) => void;
  updateAdminCredentials: (
    currentPassword: string,
    nextEmail: string,
    nextPassword: string,
    confirmPassword: string,
  ) => Promise<boolean>;
  ingestSignupSubmission: (submission: SignupSubmission) => void;
};

const defaultAdminEmail = "ops@foodonline.local";
const mockLoginMessage =
  "Mock admin access active. Enter any admin name and any password to open dashboard UI.";

function createAuditEntry(action: string, detail: string): AdminAuditEntry {
  return {
    id: createClientId("audit"),
    action,
    detail,
    createdTimestamp: new Date().toISOString(),
  };
}

function getNextReviewTime(status: AdminRequestStatus) {
  return new Date().toISOString();
}

function normalizeStoredUsers(users: AdminUserRecord[] | undefined) {
  if (!users) {
    return adminSeedUsers;
  }

  return users
    .flatMap((user) => {
      if (user.requestStatus === "approved" || user.requestStatus === "in_review") {
        return [user];
      }

      if ((user.requestStatus as string) === "archived") {
        return [];
      }

      if ((user.requestStatus as string) === "needs_follow_up") {
        return [
          {
            ...user,
            requestStatus: "in_review" as const,
            reviewedAt: user.reviewedAt ?? new Date().toISOString(),
          },
        ];
      }

      return [
        {
          ...user,
          requestStatus: "approved" as const,
          reviewedAt: user.reviewedAt ?? user.createdTimestamp,
        },
      ];
    });
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      screen: "login",
      isAuthenticated: false,
      activeSidebarKey: "overview",
      activeUsersTab: "customer",
      authError: null,
      securityMessage: mockLoginMessage,
      settingsMessage: null,
      adminEmail: defaultAdminEmail,
      sessionAdminLabel: null,
      passwordHash: null,
      passwordSalt: null,
      users: adminSeedUsers,
      auditLog: [
        createAuditEntry("system.bootstrap", "Standalone admin mockup initialized for Laravel + MySQL planning."),
      ],
      lastLoginAt: null,
      logoutAdmin: () =>
        set((state) => ({
          screen: "login",
          isAuthenticated: false,
          authError: null,
          settingsMessage: "Admin session ended.",
          sessionAdminLabel: null,
          auditLog: [createAuditEntry("auth.logout", "Admin signed out from standalone dashboard."), ...state.auditLog].slice(
            0,
            12,
          ),
        })),
      setActiveSidebarKey: (key) =>
        set({
          activeSidebarKey: key,
          authError: null,
          settingsMessage: null,
        }),
      setActiveUsersTab: (tab) =>
        set({
          activeSidebarKey: "users",
          activeUsersTab: tab,
          authError: null,
        }),
      loginAdmin: async (adminIdentity, password) => {
        const cleanedAdminIdentity = sanitizeFreeText(adminIdentity, true).slice(0, 120);
        const sanitizedPassword = sanitizeAdminPasswordInput(password);

        if (!cleanedAdminIdentity || !sanitizedPassword) {
          set({
            authError: "Enter admin name and password.",
          });
          return false;
        }

        set((currentState) => ({
          screen: "dashboard",
          isAuthenticated: true,
          activeSidebarKey: "overview",
          authError: null,
          settingsMessage: null,
          sessionAdminLabel: cleanedAdminIdentity,
          lastLoginAt: new Date().toISOString(),
          auditLog: [
            createAuditEntry("auth.success", `Mock admin access opened for ${cleanedAdminIdentity}.`),
            ...currentState.auditLog,
          ].slice(0, 12),
        }));
        return true;
      },
      applyUserAction: (userId, action) =>
        set((state) => ({
          users:
            action === "delete"
              ? state.users.filter((user) => user.id !== userId)
              : state.users.map((user) =>
                  user.id === userId
                    ? {
                        ...user,
                        requestStatus: "in_review",
                        reviewedAt: getNextReviewTime("in_review"),
                      }
                    : user,
                ),
          auditLog: [
            createAuditEntry(
              "signup.action",
              action === "delete"
                ? `Signup record ${userId} deleted from mock dashboard.`
                : `Signup record ${userId} moved to in_review.`,
            ),
            ...state.auditLog,
          ].slice(0, 12),
        })),
      updateAdminCredentials: async (currentPassword, nextEmail, nextPassword, confirmPassword) => {
        const state = get();
        const sanitizedCurrentPassword = sanitizeAdminPasswordInput(currentPassword);
        const sanitizedNextPassword = sanitizeAdminPasswordInput(nextPassword);
        const sanitizedConfirmPassword = sanitizeAdminPasswordInput(confirmPassword);
        const normalizedEmail = normalizeAdminEmail(nextEmail);

        const canCheckCurrentPassword =
          !state.passwordHash ||
          !state.passwordSalt ||
          (validateAdminPassword(sanitizedCurrentPassword) &&
            (await hashSecret(sanitizedCurrentPassword, state.passwordSalt)) === state.passwordHash);

        const isEmailValid = validateAdminEmail(normalizedEmail);
        const isPasswordValid = validateAdminPassword(sanitizedNextPassword);
        const passwordsMatch = sanitizedNextPassword === sanitizedConfirmPassword;

        if (!canCheckCurrentPassword || !isEmailValid || !isPasswordValid || !passwordsMatch) {
          set({
            settingsMessage:
              "Security update blocked. Check current password, email format, and new password confirmation.",
          });
          return false;
        }

        const salt = createSalt();
        const passwordHash = await hashSecret(sanitizedNextPassword, salt);

        set((currentState) => ({
          adminEmail: normalizedEmail,
          passwordSalt: salt,
          passwordHash,
          securityMessage: mockLoginMessage,
          settingsMessage: "Admin email and password updated in mock secure store.",
          auditLog: [
            createAuditEntry("settings.credentials", "Admin rotated email and password placeholder."),
            ...currentState.auditLog,
          ].slice(0, 12),
        }));
        return true;
      },
      ingestSignupSubmission: (submission) =>
        set((state) => ({
          users: [
            {
              id: createClientId("signup"),
              selectedRole: submission.selectedRole,
              emailAddress: submission.emailAddress,
              firstName: submission.firstName,
              lastName: submission.lastName,
              contactNumber: submission.contactNumber,
              lineId: submission.lineId,
              companyName: submission.companyName,
              requestStatus: "approved",
              sourceLabel: "Frontend signup",
              createdTimestamp: submission.createdTimestamp,
              reviewedAt: submission.createdTimestamp,
              notes: "Captured from public signup flow and approved instantly.",
            },
            ...state.users,
          ],
          auditLog: [
            createAuditEntry(
              "signup.capture",
              `New ${submission.selectedRole} signup captured from public frontend into admin queue.`,
            ),
            ...state.auditLog,
          ].slice(0, 12),
        })),
    }),
    {
      name: "foodonline-admin-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminEmail: state.adminEmail,
        passwordHash: state.passwordHash,
        passwordSalt: state.passwordSalt,
        users: state.users,
        auditLog: state.auditLog,
        lastLoginAt: state.lastLoginAt,
        securityMessage: state.securityMessage,
      }),
      merge: (persistedState, currentState) => {
        const mergedState = {
          ...currentState,
          ...(persistedState as Partial<AdminStore>),
        };

        return {
          ...mergedState,
          users: normalizeStoredUsers(mergedState.users),
          screen: "login",
          isAuthenticated: false,
          activeSidebarKey: "overview",
          activeUsersTab: "customer",
          authError: null,
          settingsMessage: null,
          sessionAdminLabel: null,
        };
      },
    },
  ),
);
