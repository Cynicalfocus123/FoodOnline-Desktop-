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

export type AccountSection = "overview" | "orders" | "saved" | "refer" | "coupon" | "settings" | "language";
export type SiteView =
  | "home"
  | "signup"
  | "login"
  | "product"
  | "category"
  | "cart"
  | "checkout"
  | "search"
  | "account"
  | "aboutUs"
  | "contactUs"
  | "becomeVendor"
  | "becomePartner"
  | "becomeSponsor"
  | "wholesaler"
  | "affiliate"
  | "drivers";
export type SignupStep = "role" | "form" | "complete";

function readAuthReturnRoute(
  state: Pick<HomeState, "siteView" | "selectedProductId" | "selectedCategorySlug" | "searchQuery" | "accountSection" | "authReturnRoute">,
) {
  if (state.authReturnRoute) {
    return state.authReturnRoute;
  }

  switch (state.siteView) {
    case "product":
      return state.selectedProductId ? `product/${state.selectedProductId}` : null;
    case "category":
      return state.selectedCategorySlug ? `category/${state.selectedCategorySlug}` : null;
    case "search":
      return state.searchQuery ? `search/${encodeURIComponent(state.searchQuery)}` : null;
    case "cart":
      return "cart";
    case "checkout":
      return "checkout";
    case "account":
      return state.accountSection === "overview" ? "account" : `account/${state.accountSection}`;
    case "aboutUs":
      return "about-us";
    case "contactUs":
      return "contact-us";
    case "becomeVendor":
      return "become-vendor";
    case "becomePartner":
      return "become-partner";
    case "becomeSponsor":
      return "become-a-sponsor";
    case "wholesaler":
      return "wholesaler";
    case "affiliate":
      return "affiliate";
    case "drivers":
      return "company/drivers";
    default:
      return null;
  }
}

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

function isSignupHash(hash: string) {
  return /^#signup(?:[/?#].*)?$/i.test(hash);
}

function isLoginHash(hash: string) {
  return /^#login(?:[/?#].*)?$/i.test(hash);
}

function writeAuthRouteHash(route: "signup" | "login") {
  if (typeof window === "undefined") {
    return;
  }

  window.history.pushState(null, "", `${import.meta.env.BASE_URL}#${route}`);
}

function isDriversRoute(hash: string) {
  if (/^#company\/drivers(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/company\/drivers\/?$/i.test(window.location.pathname);
}

function isAboutUsRoute(hash: string) {
  if (/^#about-us(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/about-us\/?$/i.test(window.location.pathname);
}

function isContactUsRoute(hash: string) {
  if (/^#contact-us(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/contact-us\/?$/i.test(window.location.pathname);
}

function isBecomeVendorRoute(hash: string) {
  if (/^#become-vendor(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/become-vendor\/?$/i.test(window.location.pathname);
}

function isBecomePartnerRoute(hash: string) {
  if (/^#become-partner(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/become-partner\/?$/i.test(window.location.pathname);
}

function isBecomeSponsorRoute(hash: string) {
  if (/^#become-a-sponsor(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/become-a-sponsor\/?$/i.test(window.location.pathname);
}

function isWholesalerRoute(hash: string) {
  if (/^#wholesaler(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/wholesaler\/?$/i.test(window.location.pathname);
}

function isAffiliateRoute(hash: string) {
  if (/^#affiliate(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/affiliate\/?$/i.test(window.location.pathname);
}

function readAccountSectionFromHash(hash: string): AccountSection | null {
  const match = hash.match(/^#account(?:\/([^?#/]+))?/i);

  if (!match) {
    return null;
  }

  const section = (match[1] ?? "").toLowerCase();

  if (
    section === "orders" ||
    section === "saved" ||
    section === "refer" ||
    section === "coupon" ||
    section === "settings" ||
    section === "language"
  ) {
    return section;
  }

  return "overview";
}

function writeRouteHash(route: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (route) {
    if (/\/company\/drivers\/?$/i.test(window.location.pathname)) {
      window.history.pushState(null, "", `${import.meta.env.BASE_URL}#${route}`);
      return;
    }

    window.location.hash = route;
    return;
  }

  if (
    window.location.hash.startsWith("#product/") ||
    window.location.hash.startsWith("#category/") ||
    window.location.hash.startsWith("#search/") ||
    window.location.hash.startsWith("#cart") ||
    window.location.hash.startsWith("#checkout") ||
    window.location.hash.startsWith("#account") ||
    window.location.hash.startsWith("#signup") ||
    window.location.hash.startsWith("#login") ||
    window.location.hash.startsWith("#about-us") ||
    window.location.hash.startsWith("#contact-us") ||
    window.location.hash.startsWith("#become-vendor") ||
    window.location.hash.startsWith("#become-partner") ||
    window.location.hash.startsWith("#become-a-sponsor") ||
    window.location.hash.startsWith("#wholesaler") ||
    window.location.hash.startsWith("#affiliate") ||
    window.location.hash.startsWith("#company/drivers") ||
    /\/about-us\/?$/i.test(window.location.pathname) ||
    /\/contact-us\/?$/i.test(window.location.pathname) ||
    /\/become-vendor\/?$/i.test(window.location.pathname) ||
    /\/become-partner\/?$/i.test(window.location.pathname) ||
    /\/become-a-sponsor\/?$/i.test(window.location.pathname) ||
    /\/wholesaler\/?$/i.test(window.location.pathname) ||
    /\/affiliate\/?$/i.test(window.location.pathname) ||
    /\/company\/drivers\/?$/i.test(window.location.pathname)
  ) {
    window.history.replaceState(null, "", `${import.meta.env.BASE_URL}#home`);
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
  accountSection: AccountSection;
  authReturnRoute: string | null;
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
  openAboutUs: () => void;
  openContactUs: () => void;
  openBecomeVendor: () => void;
  openBecomePartner: () => void;
  openBecomeSponsor: () => void;
  openWholesaler: () => void;
  openAffiliate: () => void;
  openDrivers: () => void;
  openProduct: (productId: string) => void;
  openSearchResults: (query: string) => void;
  openAccount: (section?: AccountSection) => void;
  returnAfterAuth: () => void;
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
  accountSection: "overview",
  authReturnRoute: null,
  ...getBlankSignupState(),
  completedSubmission: null,
  submissionError: null,
  isSubmittingSignup: false,
  openSignup: () =>
    set((state) => {
      writeAuthRouteHash("signup");
      return {
        siteView: "signup",
        authReturnRoute: readAuthReturnRoute(state),
        signupStep: "role",
        selectedRole: null,
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        ...getBlankSignupState(),
        completedSubmission: null,
        submissionError: null,
        isSubmittingSignup: false,
      };
    }),
  openLogin: () =>
    set((state) => {
      writeAuthRouteHash("login");
      return {
        siteView: "login",
        authReturnRoute: readAuthReturnRoute(state),
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
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
        accountSection: "overview",
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
        accountSection: "overview",
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
        accountSection: "overview",
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
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openAboutUs: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `${import.meta.env.BASE_URL}about-us`);
      }

      return {
        siteView: "aboutUs",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openContactUs: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `${import.meta.env.BASE_URL}contact-us`);
      }

      return {
        siteView: "contactUs",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openBecomeVendor: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `${import.meta.env.BASE_URL}become-vendor`);
      }

      return {
        siteView: "becomeVendor",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openBecomePartner: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `${import.meta.env.BASE_URL}become-partner`);
      }

      return {
        siteView: "becomePartner",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openBecomeSponsor: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `${import.meta.env.BASE_URL}become-a-sponsor`);
      }

      return {
        siteView: "becomeSponsor",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openWholesaler: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `${import.meta.env.BASE_URL}wholesaler`);
      }

      return {
        siteView: "wholesaler",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openAffiliate: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `${import.meta.env.BASE_URL}affiliate`);
      }

      return {
        siteView: "affiliate",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openDrivers: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `${import.meta.env.BASE_URL}company/drivers`);
      }

      return {
        siteView: "drivers",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openProduct: (productId) =>
    set(() => {
      writeRouteHash(`product/${productId}`);
      return {
        siteView: "product",
        selectedProductId: productId,
        accountSection: "overview",
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
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openAccount: (section = "overview") =>
    set(() => {
      writeRouteHash(section === "overview" ? "account" : `account/${section}`);

      return {
        siteView: "account",
        accountSection: section,
        selectedProductId: null,
        selectedCategorySlug: null,
        submissionError: null,
      };
    }),
  returnAfterAuth: () => {
    const authReturnRoute = get().authReturnRoute;

    if (!authReturnRoute) {
      get().backToHome();
      return;
    }

    writeRouteHash(authReturnRoute);
    get().syncRouteFromHash(`#${authReturnRoute}`);
    set({ authReturnRoute: null });
  },
  syncRouteFromHash: (hash) =>
    set((state) => {
      const productId = readProductIdFromHash(hash);
      const categorySlug = readCategorySlugFromHash(hash);
      const searchQuery = readSearchQueryFromHash(hash);
      const accountSection = readAccountSectionFromHash(hash);

      if (isSignupHash(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "signup",
          signupStep: state.signupStep,
          selectedProductId: null,
          selectedCategorySlug: null,
          accountSection: "overview",
        };
      }

      if (isLoginHash(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "login",
          selectedProductId: null,
          selectedCategorySlug: null,
          accountSection: "overview",
        };
      }

      if (isAboutUsRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "aboutUs",
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isContactUsRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "contactUs",
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isBecomeVendorRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "becomeVendor",
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isBecomePartnerRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "becomePartner",
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isBecomeSponsorRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "becomeSponsor",
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isWholesalerRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "wholesaler",
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isAffiliateRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "affiliate",
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isDriversRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "drivers",
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (productId) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "product",
          selectedProductId: productId,
          selectedCategorySlug: state.selectedCategorySlug,
        };
      }

      if (categorySlug) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "category",
          selectedCategorySlug: categorySlug,
          selectedProductId: null,
        };
      }

      if (searchQuery) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "search",
          searchInputValue: searchQuery,
          searchQuery,
          selectedCategorySlug: null,
          selectedProductId: null,
        };
      }

      if (isCheckoutHash(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "checkout",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isCartHash(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "cart",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (accountSection) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "account",
          accountSection,
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (
        state.siteView === "product" ||
        state.siteView === "category" ||
        state.siteView === "search" ||
        state.siteView === "cart" ||
        state.siteView === "checkout" ||
        state.siteView === "account" ||
        state.siteView === "aboutUs" ||
        state.siteView === "contactUs" ||
        state.siteView === "becomeVendor" ||
        state.siteView === "becomePartner" ||
        state.siteView === "becomeSponsor" ||
        state.siteView === "affiliate" ||
        state.siteView === "drivers"
      ) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "home",
          accountSection: "overview",
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
