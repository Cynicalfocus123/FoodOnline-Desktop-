import { create } from "zustand";
import { apiRequest, toRegisterPayload } from "../lib/apiClient";
import {
  SignupFieldErrors,
  SignupFormValues,
  SignupRoleKey,
  SignupSubmission,
  signupRoles,
} from "../lib/registerSchema";
import {
  createSignupSubmission,
  getBlankSignupState,
  sanitizeAndValidateSignupFormValues,
  sanitizeSignupFieldValue,
  validateSignupField,
  validateSignupRole,
} from "../lib/security";
import { useAdminStore } from "./adminStore";

export type SignupView = "home" | "signup";
export type SignupStep = "role" | "form" | "complete";

type HomeState = {
  signupView: SignupView;
  signupStep: SignupStep;
  selectedRole: SignupRoleKey | null;
  formValues: SignupFormValues;
  fieldErrors: SignupFieldErrors;
  completedSubmission: ReturnType<typeof createSignupSubmission> | null;
  submissionError: string | null;
  isSubmittingSignup: boolean;
  openSignup: () => void;
  backToHome: () => void;
  selectRole: (role: string) => void;
  continueToForm: () => void;
  setFormValue: <K extends keyof SignupFormValues>(field: K, value: SignupFormValues[K]) => void;
  finishSignup: () => Promise<void>;
};

export const signupRoleOptions = signupRoles;

async function submitSignupToBackend(payload: SignupSubmission) {
  await apiRequest("/auth/register", {
    method: "POST",
    body: toRegisterPayload(payload),
  });
}

export const useHomeStore = create<HomeState>((set, get) => ({
  signupView: "home",
  signupStep: "role",
  selectedRole: null,
  ...getBlankSignupState(),
  completedSubmission: null,
  submissionError: null,
  isSubmittingSignup: false,
  openSignup: () =>
    set({
      signupView: "signup",
      signupStep: "role",
      selectedRole: null,
      ...getBlankSignupState(),
      completedSubmission: null,
      submissionError: null,
      isSubmittingSignup: false,
    }),
  backToHome: () =>
    set({
      signupView: "home",
      signupStep: "role",
      selectedRole: null,
      ...getBlankSignupState(),
      completedSubmission: null,
      submissionError: null,
      isSubmittingSignup: false,
    }),
  selectRole: (role) =>
    set((state) => ({
      selectedRole: signupRoles.some((option) => option.key === role)
        ? (role as SignupRoleKey)
        : state.selectedRole,
      fieldErrors: {
        ...state.fieldErrors,
        selectedRole: signupRoles.some((option) => option.key === role)
          ? undefined
          : "Select Customer, Supplier, or Partner.",
      },
    })),
  continueToForm: () => {
    const roleError = validateSignupRole(get().selectedRole);
    if (roleError) {
      set((state) => ({
        fieldErrors: {
          ...state.fieldErrors,
          selectedRole: roleError,
        },
      }));

      return;
    }

    set((state) => ({
      signupStep: "form",
      fieldErrors: {
        ...state.fieldErrors,
        selectedRole: undefined,
      },
    }));
  },
  setFormValue: (field, value) =>
    set((state) => {
      const cleanedValue = sanitizeSignupFieldValue(field, value);
      const nextFormValues = {
        ...state.formValues,
        [field]: cleanedValue,
      };
      const nextError = validateSignupField(field, cleanedValue, false);

      return {
        formValues: nextFormValues,
        fieldErrors: {
          ...state.fieldErrors,
          [field]: nextError,
        },
      };
    }),
  finishSignup: async () => {
    const { selectedRole, formValues } = get();
    const roleError = validateSignupRole(selectedRole);
    const { cleanedValues, fieldErrors } = sanitizeAndValidateSignupFormValues(formValues, true);

    if (roleError || !selectedRole || Object.values(fieldErrors).some(Boolean)) {
      set((state) => ({
        formValues: cleanedValues,
        fieldErrors: {
          ...state.fieldErrors,
          ...fieldErrors,
          selectedRole: roleError,
        },
      }));

      return;
    }

    const payload = createSignupSubmission(selectedRole, cleanedValues);
    set({ isSubmittingSignup: true, submissionError: null });

    try {
      await submitSignupToBackend(payload);
    } catch {
      set({
        formValues: cleanedValues,
        isSubmittingSignup: false,
        submissionError: "Unable to submit registration. Please try again.",
      });
      return;
    }

    set({
      formValues: cleanedValues,
      fieldErrors: {},
      signupStep: "complete",
      completedSubmission: payload,
      isSubmittingSignup: false,
      submissionError: null,
    });
  },
}));
