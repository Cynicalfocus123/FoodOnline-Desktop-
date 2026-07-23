import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ApiError, apiRequest } from "../lib/apiClient";
import { SignupRoleKey } from "../lib/registerSchema";
import {
  parsePublicAuthEnvelope,
  type ApiAuthenticatedUser,
} from "../lib/publicAuthContract";
import { genericUserAuthError, normalizeUserEmail, sanitizeUserPasswordInput } from "../lib/security";
import { toUserFacingErrorMessage } from "../lib/userFacingError";

export type { ApiAuthenticatedUser } from "../lib/publicAuthContract";

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
  isLoggingOut: boolean;
  isSubmittingLogin: boolean;
  isValidatingSession: boolean;
  token: string | null;
  clearAuthError: () => void;
  checkoutLoginWithIdentifier: (identifier: string, password: string) => Promise<boolean>;
  completeMockPhoneOtpLogin: (
    identifier: string,
    profile?: Partial<Pick<PublicSessionUser, "accountType" | "companyName" | "firstName" | "lastName" | "lineId">>,
  ) => Promise<boolean>;
  hydrateSession: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  setAuthenticatedSession: (
    user: ApiAuthenticatedUser,
    token: string,
    expectedAccountType?: SignupRoleKey,
  ) => boolean;
};

function isPhoneLikeIdentifier(value: string) {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

function toMockPhoneSession(
  identifier: string,
  profile?: Partial<Pick<PublicSessionUser, "accountType" | "companyName" | "firstName" | "lastName" | "lineId">>,
): PublicSessionUser {
  const digitsOnly = identifier.replace(/\D/g, "");

  return {
    id: `phone-${digitsOnly}`,
    accountType: profile?.accountType ?? "customer",
    companyName: profile?.companyName ?? "",
    contactNumber: identifier,
    email: `${digitsOnly}@foodonlines.local`,
    firstName: profile?.firstName ?? "FoodOnline",
    lastName: profile?.lastName ?? "Shopper",
    lineId: profile?.lineId ?? "",
    registeredAt: new Date().toISOString(),
    status: "active",
  };
}

function toPublicSessionUser(user: ApiAuthenticatedUser): PublicSessionUser {
  const accountType = user.account_type ?? user.role;
  if (!accountType) throw new Error("Invalid authenticated account type.");

  return {
    id: String(user.id),
    accountType,
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

    return toUserFacingErrorMessage(error, "Unable to sign in right now.");
  }

  return "Unable to sign in right now.";
}

export const usePublicAuthStore = create<PublicAuthState>()(
  persist(
    (set, get) => ({
      authError: null,
      currentUser: null,
      hasHydratedSession: false,
      isLoggingOut: false,
      isSubmittingLogin: false,
      isValidatingSession: false,
      token: null,
      clearAuthError: () => set({ authError: null }),
      checkoutLoginWithIdentifier: async (identifier, password) => {
        const trimmedIdentifier = identifier.trim();

        if (isPhoneLikeIdentifier(trimmedIdentifier)) {
          return get().completeMockPhoneOtpLogin(trimmedIdentifier);
        }

        return get().loginUser(trimmedIdentifier, password);
      },
      completeMockPhoneOtpLogin: async (identifier, profile) => {
        const trimmedIdentifier = identifier.trim();

        if (!isPhoneLikeIdentifier(trimmedIdentifier)) {
          set({
            authError: "Enter a valid phone number.",
            isSubmittingLogin: false,
          });
          return false;
        }

        set({ authError: null, isSubmittingLogin: true });

        set({
          authError: null,
          currentUser: toMockPhoneSession(trimmedIdentifier, profile),
          hasHydratedSession: true,
          isLoggingOut: false,
          isSubmittingLogin: false,
          token: null,
        });
        return true;
      },
      hydrateSession: async () => {
        const token = get().token;

        if (!token) {
          set({
            authError: null,
            currentUser: null,
            hasHydratedSession: true,
            isLoggingOut: false,
            isValidatingSession: false,
          });
          return;
        }

        set({ isValidatingSession: true });

        try {
          const response = await apiRequest<{ user: ApiAuthenticatedUser }>("/auth/me", { token });
          if (!get().setAuthenticatedSession(response.user, token)) throw new Error("Invalid session response.");
        } catch {
          set({
            authError: null,
            currentUser: null,
            hasHydratedSession: true,
            isLoggingOut: false,
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
          if (!get().setAuthenticatedSession(response.user, response.token)) {
            throw new ApiError("Unable to sign in right now.", 502);
          }
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
        if (get().isLoggingOut) return;
        const token = get().token;
        set({
          authError: null,
          currentUser: null,
          hasHydratedSession: true,
          isSubmittingLogin: false,
          isValidatingSession: false,
          token: null,
          isLoggingOut: true,
        });
        try {
          if (token) {
            await apiRequest("/auth/logout", { method: "POST", token }).catch(() => undefined);
          }
        } finally {
          set({ isLoggingOut: false });
        }
      },
      setAuthenticatedSession: (user, token, expectedAccountType) => {
        const session = parsePublicAuthEnvelope({ user, token }, expectedAccountType);
        if (!session) return false;

        set({
          authError: null,
          currentUser: toPublicSessionUser(session.user),
          hasHydratedSession: true,
          isLoggingOut: false,
          isSubmittingLogin: false,
          isValidatingSession: false,
          token: session.token,
        });
        return true;
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
        isLoggingOut: false,
        isSubmittingLogin: false,
        isValidatingSession: false,
      }),
    },
  ),
);
