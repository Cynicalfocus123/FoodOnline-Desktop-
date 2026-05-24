import { create } from "zustand";
import { ApiError, apiRequest, toRegisterPayload } from "../lib/apiClient";
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

export type SiteView = "home" | "signup" | "login" | "product";
export type SignupStep = "role" | "form" | "complete";

function readProductIdFromHash(hash: string) {
  const match = hash.match(/^#product\/([^/?#]+)/i);
  return match?.[1] ?? null;
}

function writeProductHash(productId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (productId) {
    window.location.hash = `product/${productId}`;
    return;
  }

  if (window.location.hash.startsWith("#product/")) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#home`);
  }
}

type HomeState = {
  siteView: SiteView;
  signupStep: SignupStep;
  selectedRole: SignupRoleKey | null;
  selectedProductId: string | null;
  cartQuantities: Record<string, number>;
  favoriteProductIds: string[];
  selectedZipCode: string;
  formValues: SignupFormValues;
  fieldErrors: SignupFieldErrors;
  completedSubmission: ReturnType<typeof createSignupSubmission> | null;
  submissionError: string | null;
  isSubmittingSignup: boolean;
  openSignup: () => void;
  openLogin: () => void;
  backToHome: () => void;
  openProduct: (productId: string) => void;
  syncRouteFromHash: (hash: string) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  addToCart: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  setSelectedZipCode: (zipCode: string) => void;
  selectRole: (role: string) => void;
  continueToForm: () => void;
  setFormValue: <K extends keyof SignupFormValues>(field: K, value: SignupFormValues[K]) => void;
  finishSignup: () => Promise<void>;
};

export const signupRoleOptions = signupRoles;

async function submitSignupToBackend(selectedRole: SignupRoleKey, formValues: SignupFormValues) {
  await apiRequest("/auth/register", {
    method: "POST",
    body: toRegisterPayload(selectedRole, formValues),
  });
}

function mapRegisterFieldErrors(error: ApiError): SignupFieldErrors {
  return {
    selectedRole: error.fieldErrors.account_type?.[0] ?? error.fieldErrors.role?.[0],
    emailAddress: error.fieldErrors.email?.[0],
    firstName: error.fieldErrors.first_name?.[0],
    lastName: error.fieldErrors.last_name?.[0],
    contactNumber: error.fieldErrors.contact_number?.[0],
    lineId: error.fieldErrors.line_id?.[0],
    companyName: error.fieldErrors.company_name?.[0],
    password: error.fieldErrors.password?.[0],
  };
}

export const useHomeStore = create<HomeState>((set, get) => ({
  siteView: "home",
  signupStep: "role",
  selectedRole: null,
  selectedProductId: null,
  cartQuantities: {},
  favoriteProductIds: [],
  selectedZipCode: "91789",
  ...getBlankSignupState(),
  completedSubmission: null,
  submissionError: null,
  isSubmittingSignup: false,
  openSignup: () =>
    set(() => {
      writeProductHash(null);
      return {
        siteView: "signup",
        signupStep: "role",
        selectedRole: null,
        selectedProductId: null,
        ...getBlankSignupState(),
        completedSubmission: null,
        submissionError: null,
        isSubmittingSignup: false,
      };
    }),
  openLogin: () =>
    set(() => {
      writeProductHash(null);
      return {
        siteView: "login",
        selectedProductId: null,
        submissionError: null,
        completedSubmission: null,
      };
    }),
  backToHome: () =>
    set(() => {
      writeProductHash(null);
      return {
        siteView: "home",
        signupStep: "role",
        selectedRole: null,
        selectedProductId: null,
        ...getBlankSignupState(),
        completedSubmission: null,
        submissionError: null,
        isSubmittingSignup: false,
      };
    }),
  openProduct: (productId) =>
    set(() => {
      writeProductHash(productId);
      return {
        siteView: "product",
        selectedProductId: productId,
        submissionError: null,
      };
    }),
  syncRouteFromHash: (hash) =>
    set((state) => {
      const productId = readProductIdFromHash(hash);
      if (productId) {
        return {
          siteView: "product",
          selectedProductId: productId,
        };
      }

      if (state.siteView === "product") {
        return {
          siteView: "home",
          selectedProductId: null,
        };
      }

      return state;
    }),
  setCartQuantity: (productId, quantity) =>
    set((state) => {
      const nextQuantity = Math.max(0, quantity);
      const nextCart = { ...state.cartQuantities };

      if (nextQuantity <= 0) {
        delete nextCart[productId];
      } else {
        nextCart[productId] = nextQuantity;
      }

      return {
        cartQuantities: nextCart,
      };
    }),
  addToCart: (productId) =>
    set((state) => ({
      cartQuantities: {
        ...state.cartQuantities,
        [productId]: (state.cartQuantities[productId] ?? 0) + 1,
      },
    })),
  toggleFavorite: (productId) =>
    set((state) => ({
      favoriteProductIds: state.favoriteProductIds.includes(productId)
        ? state.favoriteProductIds.filter((id) => id !== productId)
        : [...state.favoriteProductIds, productId],
    })),
  setSelectedZipCode: (zipCode) =>
    set({
      selectedZipCode: zipCode,
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
      const nextError = validateSignupField(field, cleanedValue, false, nextFormValues);
      const confirmPasswordError =
        field === "password" || field === "confirmPassword"
          ? validateSignupField("confirmPassword", nextFormValues.confirmPassword, false, nextFormValues)
          : state.fieldErrors.confirmPassword;

      return {
        formValues: nextFormValues,
        fieldErrors: {
          ...state.fieldErrors,
          [field]: nextError,
          confirmPassword: confirmPasswordError,
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
      await submitSignupToBackend(selectedRole, cleanedValues);
    } catch (error) {
      const backendFieldErrors = error instanceof ApiError ? mapRegisterFieldErrors(error) : {};
      const hasBackendFieldErrors = Object.values(backendFieldErrors).some(Boolean);
      const firstBackendFieldError = Object.values(backendFieldErrors).find(Boolean);
      const backendErrorMessage =
        error instanceof ApiError
          ? hasBackendFieldErrors
            ? (firstBackendFieldError ?? "Please fix the highlighted fields and submit again.")
            : error.message
          : "Unable to submit registration. Please try again.";

      set({
        formValues: {
          ...cleanedValues,
          password: "",
          confirmPassword: "",
        },
        fieldErrors: {
          ...backendFieldErrors,
        },
        isSubmittingSignup: false,
        submissionError: backendErrorMessage,
      });
      return;
    }

    set({
      formValues: getBlankSignupState().formValues,
      fieldErrors: {},
      signupStep: "complete",
      completedSubmission: payload,
      isSubmittingSignup: false,
      submissionError: null,
    });
  },
}));
