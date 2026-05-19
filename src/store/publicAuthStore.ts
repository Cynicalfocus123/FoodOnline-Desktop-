import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ApiError, apiRequest } from "../lib/apiClient";
import { SignupRoleKey } from "../lib/registerSchema";
import { genericUserAuthError, normalizeUserEmail, sanitizeUserPasswordInput } from "../lib/security";

type ApiAuthenticatedUser = {
  id: number | string;
  account_type?: SignupRoleKey;
  company_name: string | null;
  contact_number: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  line_id: string | null;
  registered_at: string | null;
  role?: SignupRoleKey;
  status: string;
};

export type PublicSessionUser = {
  id: string;
  accountType: SignupRoleKey;
  companyName: string;
  contactNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  lineId: string;
  registeredAt: string | null;
  status: string;
};

type PublicAuthState = {
  authError: string | null;
  currentUser: PublicSessionUser | null;
  hasHydratedSession: boolean;
  isSubmittingLogin: boolean;
  isValidatingSession: boolean;
  token: string | null;
  clearAuthError: () => void;
  hydrateSession: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
};

function toPublicSessionUser(user: ApiAuthenticatedUser): PublicSessionUser {
  return {
    id: String(user.id),
    accountType: user.account_type ?? user.role ?? "customer",
    companyName: user.company_name ?? "",
    contactNumber: user.contact_number ?? "",
    email: user.email,
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
    lineId: user.line_id ?? "",
    registeredAt: user.registered_at,
    status: user.status,
  };
}

function getUserAuthError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return genericUserAuthError;
    }

    return error.message || "Unable to sign in right now.";
  }

  return "Unable to sign in right now.";
}

export const usePublicAuthStore = create<PublicAuthState>()(
  persist(
    (set, get) => ({
      authError: null,
      currentUser: null,
      hasHydratedSession: false,
      isSubmittingLogin: false,
      isValidatingSession: false,
      token: null,
      clearAuthError: () => set({ authError: null }),
      hydrateSession: async () => {
        const token = get().token;

        if (!token) {
          set({
            authError: null,
            currentUser: null,
            hasHydratedSession: true,
            isValidatingSession: false,
          });
          return;
        }

        set({ isValidatingSession: true });

        try {
          const response = await apiRequest<{ user: ApiAuthenticatedUser }>("/auth/me", { token });
          set({
            authError: null,
            currentUser: toPublicSessionUser(response.user),
            hasHydratedSession: true,
            isValidatingSession: false,
          });
        } catch {
          set({
            authError: null,
            currentUser: null,
            hasHydratedSession: true,
            isValidatingSession: false,
            token: null,
          });
        }
      },
      loginUser: async (email, password) => {
        set({ authError: null, isSubmittingLogin: true });

        try {
          const response = await apiRequest<{ token: string; user: ApiAuthenticatedUser }>("/auth/login", {
            method: "POST",
            body: {
              email: normalizeUserEmail(email),
              password: sanitizeUserPasswordInput(password, true),
            },
          });

          set({
            authError: null,
            currentUser: toPublicSessionUser(response.user),
            hasHydratedSession: true,
            isSubmittingLogin: false,
            token: response.token,
          });
          return true;
        } catch (error) {
          set({
            authError: getUserAuthError(error),
            isSubmittingLogin: false,
          });
          return false;
        }
      },
      logoutUser: async () => {
        const token = get().token;

        if (token) {
          await apiRequest("/auth/logout", { method: "POST", token }).catch(() => undefined);
        }

        set({
          authError: null,
          currentUser: null,
          hasHydratedSession: true,
          isSubmittingLogin: false,
          isValidatingSession: false,
          token: null,
        });
      },
    }),
    {
      name: "foodonline-public-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<PublicAuthState>),
        authError: null,
        hasHydratedSession: false,
        isSubmittingLogin: false,
        isValidatingSession: false,
      }),
    },
  ),
);
