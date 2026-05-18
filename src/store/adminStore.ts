import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  AdminAuditEntry,
  AdminRequestStatus,
  AdminSidebarKey,
  AdminUserRecord,
  adminSeedUsers,
} from "../data/admin";
import { SignupSubmission, SignupRoleKey } from "../lib/registerSchema";
import {
  createClientId,
  createSalt,
  genericAdminAuthError,
  genericAdminLockoutError,
  hashSecret,
  normalizeAdminEmail,
  sanitizeAdminPasswordInput,
  validateAdminEmail,
  validateAdminPassword,
} from "../lib/security";

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

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
  passwordHash: string | null;
  passwordSalt: string | null;
  users: AdminUserRecord[];
  auditLog: AdminAuditEntry[];
  loginAttemptTimestamps: string[];
  lockoutUntil: string | null;
  lastLoginAt: string | null;
  logoutAdmin: () => void;
  setActiveSidebarKey: (key: AdminSidebarKey) => void;
  setActiveUsersTab: (tab: SignupRoleKey) => void;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  updateRequestStatus: (userId: string, status: AdminRequestStatus) => void;
  updateAdminCredentials: (
    currentPassword: string,
    nextEmail: string,
    nextPassword: string,
    confirmPassword: string,
  ) => Promise<boolean>;
  ingestSignupSubmission: (submission: SignupSubmission) => void;
};

const defaultAdminEmail = "ops@foodonline.local";
const bootstrapSecurityMessage =
  "Mock bootstrap active. First secure login accepts valid admin email plus strong password, then rotate credentials in Admin Settings.";

function pruneAttempts(timestamps: string[]) {
  const now = Date.now();
  return timestamps.filter((timestamp) => now - new Date(timestamp).getTime() <= LOGIN_WINDOW_MS);
}

function createAuditEntry(action: string, detail: string): AdminAuditEntry {
  return {
    id: createClientId("audit"),
    action,
    detail,
    createdTimestamp: new Date().toISOString(),
  };
}

function getNextReviewTime(status: AdminRequestStatus) {
  if (status === "pending" || status === "archived") {
    return null;
  }

  return new Date().toISOString();
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      screen: "login",
      isAuthenticated: false,
      activeSidebarKey: "overview",
      activeUsersTab: "customer",
      authError: null,
      securityMessage: bootstrapSecurityMessage,
      settingsMessage: null,
      adminEmail: defaultAdminEmail,
      passwordHash: null,
      passwordSalt: null,
      users: adminSeedUsers,
      auditLog: [
        createAuditEntry("system.bootstrap", "Standalone admin mockup initialized for Laravel + MySQL planning."),
      ],
      loginAttemptTimestamps: [],
      lockoutUntil: null,
      lastLoginAt: null,
      logoutAdmin: () =>
        set((state) => ({
          screen: "login",
          isAuthenticated: false,
          authError: null,
          settingsMessage: "Admin session ended.",
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
      loginAdmin: async (email, password) => {
        const normalizedEmail = normalizeAdminEmail(email);
        const sanitizedPassword = sanitizeAdminPasswordInput(password);
        const now = Date.now();
        const state = get();
        const recentAttempts = pruneAttempts(state.loginAttemptTimestamps);
        const isLocked = state.lockoutUntil ? new Date(state.lockoutUntil).getTime() > now : false;

        if (isLocked) {
          set({
            authError: genericAdminLockoutError,
            loginAttemptTimestamps: recentAttempts,
          });
          return false;
        }

        const isValidInput =
          validateAdminEmail(normalizedEmail) && validateAdminPassword(sanitizedPassword);

        let isAuthenticated = false;

        if (isValidInput && normalizedEmail === state.adminEmail) {
          if (state.passwordHash && state.passwordSalt) {
            const candidateHash = await hashSecret(sanitizedPassword, state.passwordSalt);
            isAuthenticated = candidateHash === state.passwordHash;
          } else {
            // Phase 1 mock only. Real auth must move to Laravel Hash::check on server.
            isAuthenticated = true;
          }
        }

        if (!isAuthenticated) {
          const failedAttempts = [...recentAttempts, new Date().toISOString()];
          const shouldLock = failedAttempts.length >= MAX_LOGIN_ATTEMPTS;

          set((currentState) => ({
            screen: "login",
            isAuthenticated: false,
            authError: shouldLock ? genericAdminLockoutError : genericAdminAuthError,
            loginAttemptTimestamps: failedAttempts,
            lockoutUntil: shouldLock ? new Date(now + LOGIN_WINDOW_MS).toISOString() : null,
            auditLog: [
              createAuditEntry(
                "auth.failed",
                shouldLock
                  ? "Standalone admin login placeholder hit rate-limit lockout window."
                  : "Standalone admin login placeholder rejected generic credentials.",
              ),
              ...currentState.auditLog,
            ].slice(0, 12),
          }));
          return false;
        }

        set((currentState) => ({
          screen: "dashboard",
          isAuthenticated: true,
          activeSidebarKey: "overview",
          authError: null,
          settingsMessage: null,
          loginAttemptTimestamps: [],
          lockoutUntil: null,
          lastLoginAt: new Date().toISOString(),
          auditLog: [
            createAuditEntry("auth.success", "Admin entered standalone protected dashboard."),
            ...currentState.auditLog,
          ].slice(0, 12),
        }));
        return true;
      },
      updateRequestStatus: (userId, status) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  requestStatus: status,
                  reviewedAt: getNextReviewTime(status),
                }
              : user,
          ),
          auditLog: [
            createAuditEntry("signup.status", `Signup request ${userId} moved to ${status}.`),
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
          securityMessage: "Bootstrap access removed. Standalone admin now requires hashed local credential check.",
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
              requestStatus: "pending",
              sourceLabel: "Frontend signup",
              createdTimestamp: submission.createdTimestamp,
              reviewedAt: null,
              notes: "Captured from public signup flow. Safe text rendering only.",
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
        loginAttemptTimestamps: state.loginAttemptTimestamps,
        lockoutUntil: state.lockoutUntil,
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
          screen: "login",
          isAuthenticated: false,
          activeSidebarKey: "overview",
          activeUsersTab: "customer",
          authError: null,
          settingsMessage: null,
        };
      },
    },
  ),
);
