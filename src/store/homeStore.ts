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
import { ApiAuthenticatedUser, usePublicAuthStore } from "./publicAuthStore";

export type SiteView = "home" | "signup" | "login" | "product" | "category" | "cart" | "checkout" | "search";
export type SignupStep = "role" | "form" | "complete";

function safeDecodeRouteSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function readProductIdFromHash(hash: string) {
  const match = hash.match(/^#product\/([^/?#]+)/i);
  return match?.[1] ?? null;
}

function readCategorySlugFromHash(hash: string) {
  const match = hash.match(/^#category\/([^/?#]+)/i);
  return match?.[1] ?? null;
}

function readSearchQueryFromHash(hash: string) {
  const match = hash.match(/^#search\/([^?#]+)/i);
  return match?.[1] ? safeDecodeRouteSegment(match[1]) : null;
}

function isCartHash(hash: string) {
  return /^#cart(?:[/?#].*)?$/i.test(hash);
}

function isCheckoutHash(hash: string) {
  return /^#checkout(?:[/?#].*)?$/i.test(hash);
}

function writeRouteHash(route: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (route) {
    window.location.hash = route;
    return;
  }

  if (
    window.location.hash.startsWith("#product/") ||
    window.location.hash.startsWith("#category/") ||
    window.location.hash.startsWith("#search/") ||
    window.location.hash.startsWith("#cart") ||
    window.location.hash.startsWith("#checkout")
  ) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#home`);
  }
}

type HomeState = {
  siteView: SiteView;
  signupStep: SignupStep;
  selectedRole: SignupRoleKey | null;
  selectedProductId: string | null;
  selectedCategorySlug: string | null;
  cartQuantities: Record<string, number>;
  savedForLaterIds: string[];
  selectedCartIds: string[];
  favoriteProductIds: string[];
  selectedZipCode: string;
  searchInputValue: string;
  searchQuery: string;
  formValues: SignupFormValues;
  fieldErrors: SignupFieldErrors;
  completedSubmission: ReturnType<typeof createSignupSubmission> | null;
  submissionError: string | null;
  isSubmittingSignup: boolean;
  openSignup: () => void;
  openLogin: () => void;
  backToHome: () => void;
  openCategory: (categorySlug: string) => void;
  openCart: () => void;
  openCheckout: () => void;
  openProduct: (productId: string) => void;
  openSearchResults: (query: string) => void;
  syncRouteFromHash: (hash: string) => void;
  setSearchInputValue: (value: string) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  saveForLater: (productId: string) => void;
  moveSavedToCart: (productId: string) => void;
  toggleCartSelection: (productId: string) => void;
  setAllCartSelections: (productIds: string[], isSelected: boolean) => void;
  toggleFavorite: (productId: string) => void;
  setSelectedZipCode: (zipCode: string) => void;
  selectRole: (role: string) => void;
  continueToForm: () => void;
  setFormValue: <K extends keyof SignupFormValues>(field: K, value: SignupFormValues[K]) => void;
  finishSignup: () => Promise<void>;
};

export const signupRoleOptions = signupRoles;

type RegisterResponse = {
  token?: string;
  user?: ApiAuthenticatedUser;
  data?: {
    token?: string;
    user?: ApiAuthenticatedUser;
  };
};

async function submitSignupToBackend(selectedRole: SignupRoleKey, formValues: SignupFormValues) {
  return apiRequest<RegisterResponse>("/auth/register", {
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
  selectedCategorySlug: null,
  cartQuantities: {},
  savedForLaterIds: [],
  selectedCartIds: [],
  favoriteProductIds: [],
  selectedZipCode: "91789",
  searchInputValue: "",
  searchQuery: "",
  ...getBlankSignupState(),
  completedSubmission: null,
  submissionError: null,
  isSubmittingSignup: false,
  openSignup: () =>
    set(() => {
      writeRouteHash(null);
      return {
        siteView: "signup",
        signupStep: "role",
        selectedRole: null,
        selectedProductId: null,
        selectedCategorySlug: null,
        ...getBlankSignupState(),
        completedSubmission: null,
        submissionError: null,
        isSubmittingSignup: false,
      };
    }),
  openLogin: () =>
    set(() => {
      writeRouteHash(null);
      return {
        siteView: "login",
        selectedProductId: null,
        selectedCategorySlug: null,
        submissionError: null,
        completedSubmission: null,
      };
    }),
  backToHome: () =>
    set(() => {
      writeRouteHash(null);
      return {
        siteView: "home",
        signupStep: "role",
        selectedRole: null,
        selectedProductId: null,
        selectedCategorySlug: null,
        ...getBlankSignupState(),
        completedSubmission: null,
        submissionError: null,
        isSubmittingSignup: false,
      };
    }),
  openCategory: (categorySlug) =>
    set(() => {
      writeRouteHash(`category/${categorySlug}`);
      return {
        siteView: "category",
        selectedCategorySlug: categorySlug,
        selectedProductId: null,
        submissionError: null,
      };
    }),
  openCart: () =>
    set(() => {
      writeRouteHash("cart");
      return {
        siteView: "cart",
        selectedProductId: null,
        selectedCategorySlug: null,
        submissionError: null,
      };
    }),
  openCheckout: () =>
    set(() => {
      writeRouteHash("checkout");
      return {
        siteView: "checkout",
        selectedProductId: null,
        selectedCategorySlug: null,
        submissionError: null,
      };
    }),
  openProduct: (productId) =>
    set(() => {
      writeRouteHash(`product/${productId}`);
      return {
        siteView: "product",
        selectedProductId: productId,
        submissionError: null,
      };
    }),
  openSearchResults: (query) =>
    set((state) => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery) {
        return state;
      }

      writeRouteHash(`search/${encodeURIComponent(trimmedQuery)}`);

      return {
        siteView: "search",
        searchInputValue: trimmedQuery,
        searchQuery: trimmedQuery,
        selectedProductId: null,
        selectedCategorySlug: null,
        submissionError: null,
      };
    }),
  syncRouteFromHash: (hash) =>
    set((state) => {
      const productId = readProductIdFromHash(hash);
      const categorySlug = readCategorySlugFromHash(hash);
      const searchQuery = readSearchQueryFromHash(hash);

      if (productId) {
        return {
          siteView: "product",
          selectedProductId: productId,
          selectedCategorySlug: state.selectedCategorySlug,
        };
      }

      if (categorySlug) {
        return {
          siteView: "category",
          selectedCategorySlug: categorySlug,
          selectedProductId: null,
        };
      }

      if (searchQuery) {
        return {
          siteView: "search",
          searchInputValue: searchQuery,
          searchQuery,
          selectedCategorySlug: null,
          selectedProductId: null,
        };
      }

      if (isCheckoutHash(hash)) {
        return {
          siteView: "checkout",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isCartHash(hash)) {
        return {
          siteView: "cart",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (
        state.siteView === "product" ||
        state.siteView === "category" ||
        state.siteView === "search" ||
        state.siteView === "cart" ||
        state.siteView === "checkout"
      ) {
        return {
          siteView: "home",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      return state;
    }),
  setSearchInputValue: (value) =>
    set({
      searchInputValue: value,
    }),
  setCartQuantity: (productId, quantity) =>
    set((state) => {
      const nextQuantity = Math.max(0, quantity);
      const nextCart = { ...state.cartQuantities };
      const nextSelectedCartIds = state.selectedCartIds.filter((id) => id !== productId);

      if (nextQuantity <= 0) {
        delete nextCart[productId];
      } else {
        nextCart[productId] = nextQuantity;
        nextSelectedCartIds.push(productId);
      }

      return {
        cartQuantities: nextCart,
        selectedCartIds: nextSelectedCartIds,
      };
    }),
  addToCart: (productId) =>
    set((state) => ({
      cartQuantities: {
        ...state.cartQuantities,
        [productId]: (state.cartQuantities[productId] ?? 0) + 1,
      },
      selectedCartIds: state.selectedCartIds.includes(productId) ? state.selectedCartIds : [...state.selectedCartIds, productId],
      savedForLaterIds: state.savedForLaterIds.filter((id) => id !== productId),
    })),
  removeFromCart: (productId) =>
    set((state) => {
      const nextCart = { ...state.cartQuantities };
      delete nextCart[productId];

      return {
        cartQuantities: nextCart,
        selectedCartIds: state.selectedCartIds.filter((id) => id !== productId),
      };
    }),
  saveForLater: (productId) =>
    set((state) => {
      const nextCart = { ...state.cartQuantities };
      delete nextCart[productId];

      return {
        cartQuantities: nextCart,
        selectedCartIds: state.selectedCartIds.filter((id) => id !== productId),
        savedForLaterIds: state.savedForLaterIds.includes(productId)
          ? state.savedForLaterIds
          : [...state.savedForLaterIds, productId],
      };
    }),
  moveSavedToCart: (productId) =>
    set((state) => ({
      cartQuantities: {
        ...state.cartQuantities,
        [productId]: state.cartQuantities[productId] ?? 1,
      },
      selectedCartIds: state.selectedCartIds.includes(productId) ? state.selectedCartIds : [...state.selectedCartIds, productId],
      savedForLaterIds: state.savedForLaterIds.filter((id) => id !== productId),
    })),
  toggleCartSelection: (productId) =>
    set((state) => ({
      selectedCartIds: state.selectedCartIds.includes(productId)
        ? state.selectedCartIds.filter((id) => id !== productId)
        : [...state.selectedCartIds, productId],
    })),
  setAllCartSelections: (productIds, isSelected) =>
    set((state) => ({
      selectedCartIds: isSelected
        ? Array.from(new Set([...state.selectedCartIds.filter((id) => !productIds.includes(id)), ...productIds]))
        : state.selectedCartIds.filter((id) => !productIds.includes(id)),
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
      const response = await submitSignupToBackend(selectedRole, cleanedValues);
      const token = response.token ?? response.data?.token ?? null;
      const user = response.user ?? response.data?.user;

      if (user && token) {
        usePublicAuthStore.getState().setAuthenticatedSession(user, token);
      }
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
