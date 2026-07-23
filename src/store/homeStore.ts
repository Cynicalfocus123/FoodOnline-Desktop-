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
import { getPublicRouteHref } from "../lib/routes";
import { commerceApi, type CommerceCart, type FavoriteRecord } from "../services/commerceApi";
import { catalogRepository } from "../services/catalog/repository";
import type { Product } from "../types/catalog";
import { toUserFacingErrorMessage } from "../lib/userFacingError";

export type AccountSection = "overview" | "orders" | "saved" | "refer" | "coupon" | "settings" | "language";
export type SiteView =
  | "home"
  | "signup"
  | "invite"
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
  | "drivers"
  | "returnPolicy"
  | "termsOfUse"
  | "privacyPolicy"
  | "faq"
  | "recipes"
  | "companyNews"
  | "ourMission"
  | "accessibility"
  | "sitemap";
export type SignupStep = "role" | "form" | "complete";
export type CommerceLineStatus = { available: boolean; availableQuantity: number | null; unavailableReason: string | null };
export type CatalogLineSource = "api" | "local";
export type FavoriteSource = "anonymous" | "persisted" | "unresolved";
export type FavoriteSyncStatus = "auth-pending" | "loading" | "ready" | "saving" | "error";

function readProductReturnRoute(
  state: Pick<HomeState, "siteView" | "selectedCategorySlug" | "searchQuery" | "productReturnRoute">,
) {
  if (state.siteView === "category" && state.selectedCategorySlug) {
    return `category/${state.selectedCategorySlug}`;
  }

  if (state.siteView === "search" && state.searchQuery) {
    return `search/${encodeURIComponent(state.searchQuery)}`;
  }

  if (state.siteView === "product") {
    return state.productReturnRoute;
  }

  return null;
}

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
    case "returnPolicy":
      return "return-policy";
    case "termsOfUse":
      return "terms-and-conditions";
    case "privacyPolicy":
      return "privacy-policy";
    case "faq":
      return "faq";
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

function readInviteCodeFromHash(hash: string) {
  const match = hash.match(/^#invite\/([^/?#]+)/i);
  return match?.[1] ? safeDecodeRouteSegment(match[1]).toUpperCase() : null;
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

  window.history.pushState(null, "", getPublicRouteHref(route));
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

function isReturnPolicyRoute(hash: string) {
  if (/^#return-policy(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/return-policy\/?$/i.test(window.location.pathname);
}

function isTermsOfUseRoute(hash: string) {
  if (/^#terms-and-conditions(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/terms-and-conditions\/?$/i.test(window.location.pathname);
}

function isPrivacyPolicyRoute(hash: string) {
  if (/^#privacy-policy(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/privacy-policy\/?$/i.test(window.location.pathname);
}

function isFaqRoute(hash: string) {
  if (/^#faq(?:[/?#].*)?$/i.test(hash)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return /\/faq\/?$/i.test(window.location.pathname);
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
    window.history.pushState(null, "", getPublicRouteHref(route));
    return;
  }

  window.history.replaceState(null, "", getPublicRouteHref());
}

type HomeState = {
  siteView: SiteView;
  signupStep: SignupStep;
  selectedRole: SignupRoleKey | null;
  selectedProductId: string | null;
  selectedCategorySlug: string | null;
  cartQuantities: Record<string, number>;
  cartLineProductIds: Record<string, string>;
  cartItemIds: Record<string, string>;
  cartLineStatuses: Record<string, CommerceLineStatus>;
  cartLineSources: Record<string, CatalogLineSource>;
  cartVariantAliases: Record<string, string>;
  cartSyncStatus: "idle" | "loading" | "ready" | "error";
  cartSyncMessage: string | null;
  savedForLaterIds: string[];
  savedLineProductIds: Record<string, string>;
  savedLineSources: Record<string, CatalogLineSource>;
  selectedCartIds: string[];
  favoriteProductIds: string[];
  favoriteProductSources: Record<string, FavoriteSource>;
  favoriteRecords: Record<string, FavoriteRecord>;
  favoriteSyncStatus: FavoriteSyncStatus;
  favoriteSyncMessage: string | null;
  favoriteMutationVersions: Record<string, number>;
  selectedZipCode: string;
  searchInputValue: string;
  searchQuery: string;
  accountSection: AccountSection;
  pendingReferralCode: string | null;
  authReturnRoute: string | null;
  productReturnRoute: string | null;
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
  openReturnPolicy: () => void;
  openTermsOfUse: () => void;
  openPrivacyPolicy: () => void;
  openFaq: () => void;
  openBecomeVendor: () => void;
  openBecomePartner: () => void;
  openBecomeSponsor: () => void;
  openWholesaler: () => void;
  openAffiliate: () => void;
  openDrivers: () => void;
  openProduct: (productId: string) => void;
  backToProducts: (fallbackCategorySlug: string) => void;
  openSearchResults: (query: string) => void;
  openAccount: (section?: AccountSection) => void;
  setPendingReferralCode: (code: string | null) => void;
  returnAfterAuth: () => void;
  syncRouteFromHash: (hash: string) => void;
  setSearchInputValue: (value: string) => void;
  clearAuthenticatedData: () => void;
  setCartQuantity: (lineId: string, quantity: number) => void;
  hydrateCommerceCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  hydrateSavedData: () => Promise<void>;
  retryFavorites: () => Promise<void>;
  addToCart: (productId: string, variantId?: string, apiBacked?: boolean, apiVariantIdentityReady?: boolean) => void;
  removeFromCart: (lineId: string) => void;
  saveForLater: (lineId: string) => void;
  moveSavedToCart: (lineId: string) => void;
  toggleCartSelection: (lineId: string) => void;
  setAllCartSelections: (lineIds: string[], isSelected: boolean) => void;
  toggleFavorite: (product: Product) => void;
  removeFavorite: (favoriteId: string) => void;
  migrateCatalogIdentity: (product: Product) => void;
  setSelectedZipCode: (zipCode: string) => void;
  selectRole: (role: string) => void;
  continueToForm: () => void;
  setFormValue: <K extends keyof SignupFormValues>(field: K, value: SignupFormValues[K]) => void;
  finishSignup: () => Promise<void>;
};

export const signupRoleOptions = signupRoles;

type RegisterResponse = {
  token: string;
  user: ApiAuthenticatedUser;
};

async function submitSignupToBackend(selectedRole: SignupRoleKey, formValues: SignupFormValues, referralCode: string | null) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: toRegisterPayload(selectedRole, formValues, referralCode),
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

function cartState(cart: CommerceCart, state: Pick<HomeState, "cartQuantities" | "cartLineProductIds" | "cartLineSources" | "cartVariantAliases" | "selectedCartIds">) {
  const remoteLineIds = cart.lines.map((line) => line.variant_uuid);
  const localLineIds = Object.keys(state.cartQuantities).filter((lineId) => state.cartLineSources[lineId] === "local");
  const lineIds = [...remoteLineIds, ...localLineIds];
  const localQuantities = Object.fromEntries(localLineIds.map((lineId) => [lineId, state.cartQuantities[lineId]]));
  const localProducts = Object.fromEntries(localLineIds.map((lineId) => [lineId, state.cartLineProductIds[lineId] ?? lineId]));
  return {
    cartQuantities: { ...Object.fromEntries(cart.lines.map((line) => [line.variant_uuid, line.quantity])), ...localQuantities },
    cartLineProductIds: { ...Object.fromEntries(cart.lines.map((line) => [line.variant_uuid, line.product_uuid])), ...localProducts },
    cartItemIds: Object.fromEntries(cart.lines.map((line) => [line.variant_uuid, line.id])),
    cartLineStatuses: Object.fromEntries(cart.lines.map((line) => [line.variant_uuid, {
      available: line.available,
      availableQuantity: line.available_quantity,
      unavailableReason: line.unavailable_reason,
    }])),
    cartLineSources: { ...Object.fromEntries(remoteLineIds.map((lineId) => [lineId, "api" as const])), ...Object.fromEntries(localLineIds.map((lineId) => [lineId, "local" as const])) },
    cartVariantAliases: state.cartVariantAliases,
    selectedCartIds: state.selectedCartIds.length ? state.selectedCartIds.filter((id) => lineIds.includes(id)) : lineIds,
  };
}

let cartMutationQueue: Promise<void> = Promise.resolve();
let favoriteMutationQueue: Promise<void> = Promise.resolve();
let favoriteMergeToken: string | null = null;
let favoriteHydrationVersion = 0;
let authenticatedSessionVersion = 0;

function isActiveAuthenticatedSession(token: string | null, sessionVersion: number) {
  return authenticatedSessionVersion === sessionVersion && usePublicAuthStore.getState().token === token;
}

function enqueueCartMutation<T>(work: () => Promise<T>): Promise<T> {
  const next = cartMutationQueue.then(work, work);
  cartMutationQueue = next.then(() => undefined, () => undefined);
  return next;
}

function enqueueFavoriteMutation<T>(work: () => Promise<T>): Promise<T> {
  const next = favoriteMutationQueue.then(work, work);
  favoriteMutationQueue = next.then(() => undefined, () => undefined);
  return next;
}

function isCanonicalProductUuid(value: string | null | undefined) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function favoriteIdsForProduct(product: Product) {
  return [...new Set([
    product.uuid,
    product.id,
    ...(product.compatibility?.localProductIds ?? []),
  ].filter((value): value is string => Boolean(value)))];
}

function favoriteRecordMap(records: FavoriteRecord[]) {
  return Object.fromEntries(records.filter((record) => isCanonicalProductUuid(record.product_uuid)).map((record) => [record.product_uuid, record]));
}

export const useHomeStore = create<HomeState>((set, get) => ({
  siteView: "home",
  signupStep: "role",
  selectedRole: null,
  selectedProductId: null,
  selectedCategorySlug: null,
  cartQuantities: {},
  cartLineProductIds: {},
  cartItemIds: {},
  cartLineStatuses: {},
  cartLineSources: {},
  cartVariantAliases: {},
  cartSyncStatus: "idle",
  cartSyncMessage: null,
  savedForLaterIds: [],
  savedLineProductIds: {},
  savedLineSources: {},
  selectedCartIds: [],
  favoriteProductIds: [],
  favoriteProductSources: {},
  favoriteRecords: {},
  favoriteSyncStatus: "auth-pending",
  favoriteSyncMessage: null,
  favoriteMutationVersions: {},
  selectedZipCode: "91789",
  searchInputValue: "",
  searchQuery: "",
  accountSection: "overview",
  pendingReferralCode: null,
  authReturnRoute: null,
  productReturnRoute: null,
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
        window.history.pushState(null, "", getPublicRouteHref("about-us"));
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
        window.history.pushState(null, "", getPublicRouteHref("contact-us"));
      }

      return {
        siteView: "contactUs",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openReturnPolicy: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", getPublicRouteHref("return-policy"));
      }

      return {
        siteView: "returnPolicy",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openTermsOfUse: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", getPublicRouteHref("terms-and-conditions"));
      }

      return {
        siteView: "termsOfUse",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openPrivacyPolicy: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", getPublicRouteHref("privacy-policy"));
      }

      return {
        siteView: "privacyPolicy",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openFaq: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", getPublicRouteHref("faq"));
      }

      return {
        siteView: "faq",
        selectedProductId: null,
        selectedCategorySlug: null,
        accountSection: "overview",
        submissionError: null,
      };
    }),
  openBecomeVendor: () =>
    set(() => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", getPublicRouteHref("become-vendor"));
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
        window.history.pushState(null, "", getPublicRouteHref("become-partner"));
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
        window.history.pushState(null, "", getPublicRouteHref("become-a-sponsor"));
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
        window.history.pushState(null, "", getPublicRouteHref("wholesaler"));
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
        window.history.pushState(null, "", getPublicRouteHref("affiliate"));
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
        window.history.pushState(null, "", getPublicRouteHref("company/drivers"));
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
    set((state) => {
      writeRouteHash(`product/${productId}`);
      return {
        siteView: "product",
        selectedProductId: productId,
        productReturnRoute: readProductReturnRoute(state),
        accountSection: "overview",
        submissionError: null,
      };
    }),
  backToProducts: (fallbackCategorySlug) =>
    set((state) => {
      const returnRoute = state.productReturnRoute;

      if (returnRoute?.startsWith("category/")) {
        const categorySlug = returnRoute.slice("category/".length);
        writeRouteHash(returnRoute);
        return {
          siteView: "category",
          selectedCategorySlug: categorySlug,
          selectedProductId: null,
        };
      }

      if (returnRoute?.startsWith("search/")) {
        const encodedQuery = returnRoute.slice("search/".length);
        const query = safeDecodeRouteSegment(encodedQuery);
        writeRouteHash(returnRoute);
        return {
          siteView: "search",
          searchInputValue: query,
          searchQuery: query,
          selectedCategorySlug: null,
          selectedProductId: null,
        };
      }

      const categoryRoute = `category/${fallbackCategorySlug}`;
      writeRouteHash(categoryRoute);
      return {
        siteView: "category",
        selectedCategorySlug: fallbackCategorySlug,
        selectedProductId: null,
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
  setPendingReferralCode: (code) => set({ pendingReferralCode: code?.replace(/[^A-Z2-9]/gi, "").toUpperCase() || null }),
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
      const inviteCode = readInviteCodeFromHash(hash);
      const accountSection = readAccountSectionFromHash(hash);

      if (inviteCode) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "invite",
          pendingReferralCode: inviteCode,
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

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

      if (isReturnPolicyRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "returnPolicy",
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isTermsOfUseRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "termsOfUse",
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isPrivacyPolicyRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "privacyPolicy",
          accountSection: "overview",
          selectedProductId: null,
          selectedCategorySlug: null,
        };
      }

      if (isFaqRoute(hash)) {
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: "faq",
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

      const informationRoute = hash.match(/^#(recipes|company-news|our-mission|accessibility|sitemap)(?:[/?#].*)?$/i)?.[1]?.toLowerCase();
      if (informationRoute) {
        const informationViews = {
          recipes: "recipes",
          "company-news": "companyNews",
          "our-mission": "ourMission",
          accessibility: "accessibility",
          sitemap: "sitemap",
        } as const;
        return {
          authReturnRoute: state.authReturnRoute,
          siteView: informationViews[informationRoute as keyof typeof informationViews],
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
        state.siteView === "returnPolicy" ||
        state.siteView === "termsOfUse" ||
        state.siteView === "privacyPolicy" ||
        state.siteView === "faq" ||
        state.siteView === "becomeVendor" ||
        state.siteView === "becomePartner" ||
        state.siteView === "becomeSponsor" ||
        state.siteView === "affiliate" ||
        state.siteView === "drivers" ||
        state.siteView === "recipes" ||
        state.siteView === "companyNews" ||
        state.siteView === "ourMission" ||
        state.siteView === "accessibility" ||
        state.siteView === "sitemap"
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
  clearAuthenticatedData: () => {
    authenticatedSessionVersion += 1;
    favoriteHydrationVersion += 1;
    favoriteMergeToken = null;
    cartMutationQueue = Promise.resolve();
    favoriteMutationQueue = Promise.resolve();
    set((state) => {
      const localCartIds = Object.keys(state.cartQuantities).filter((id) => state.cartLineSources[id] === "local");
      const localSavedIds = state.savedForLaterIds.filter((id) => state.savedLineSources[id] === "local");
      const anonymousFavoriteIds = state.favoriteProductIds.filter((id) => state.favoriteProductSources[id] !== "persisted");

      return {
        cartQuantities: Object.fromEntries(localCartIds.map((id) => [id, state.cartQuantities[id]])),
        cartLineProductIds: Object.fromEntries(localCartIds.map((id) => [id, state.cartLineProductIds[id] ?? id])),
        cartItemIds: {},
        cartLineStatuses: {},
        cartLineSources: Object.fromEntries(localCartIds.map((id) => [id, "local" as const])),
        cartVariantAliases: {},
        cartSyncStatus: "idle",
        cartSyncMessage: null,
        savedForLaterIds: localSavedIds,
        savedLineProductIds: Object.fromEntries(localSavedIds.map((id) => [id, state.savedLineProductIds[id] ?? id])),
        savedLineSources: Object.fromEntries(localSavedIds.map((id) => [id, "local" as const])),
        selectedCartIds: state.selectedCartIds.filter((id) => localCartIds.includes(id)),
        favoriteProductIds: anonymousFavoriteIds,
        favoriteProductSources: Object.fromEntries(anonymousFavoriteIds.map((id) => [id, state.favoriteProductSources[id]])),
        favoriteRecords: {},
        favoriteSyncStatus: "auth-pending",
        favoriteSyncMessage: null,
        favoriteMutationVersions: {},
      };
    });
  },
  hydrateCommerceCart: async () => {
    if (get().cartSyncStatus === "loading") return;
    const token = usePublicAuthStore.getState().token;
    const sessionVersion = authenticatedSessionVersion;
    const localLines = Object.entries(get().cartQuantities).filter(([lineId]) => get().cartLineSources[lineId] !== "local");
    set({ cartSyncStatus: "loading", cartSyncMessage: null });
    try {
      let cart = await commerceApi.getCart(token);
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      const remoteVariants = new Set(cart.lines.map((line) => line.variant_uuid));
      for (const [variantUuid, quantity] of localLines) {
        if (!remoteVariants.has(variantUuid) && quantity > 0) cart = await commerceApi.addItem(variantUuid, quantity, token);
        if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      }
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      set((state) => ({ ...cartState(cart, state), cartSyncStatus: "ready", cartSyncMessage: null }));
    } catch (error) {
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      const message = error instanceof ApiError && error.status === 422
        ? "Some saved cart items could not be restored because their exact variants are no longer available. They remain visible until you remove them."
        : toUserFacingErrorMessage(error, "Unable to sync cart.");
      set({ cartSyncStatus: "error", cartSyncMessage: message });
    }
  },
  mergeGuestCart: async () => {
    const token = usePublicAuthStore.getState().token;
    const sessionVersion = authenticatedSessionVersion;
    if (!token) { await get().hydrateCommerceCart(); return; }
    set({ cartSyncStatus: "loading", cartSyncMessage: null });
    try {
      const cart = await commerceApi.mergeGuestCart(token);
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      set((state) => ({ ...cartState(cart, state), cartSyncStatus: "ready", cartSyncMessage: null }));
    } catch (error) {
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      set({ cartSyncStatus: "error", cartSyncMessage: toUserFacingErrorMessage(error, "Unable to merge cart.") });
    }
  },
  hydrateSavedData: async () => {
    const token = usePublicAuthStore.getState().token;
    const hydrationVersion = ++favoriteHydrationVersion;
    const sessionVersion = authenticatedSessionVersion;
    if (!token) {
      favoriteMergeToken = null;
      set((state) => {
        const retainedIds = state.favoriteProductIds.filter((id) => state.favoriteProductSources[id] !== "persisted");
        return {
          favoriteProductIds: retainedIds,
          favoriteProductSources: Object.fromEntries(retainedIds.map((id) => [id, state.favoriteProductSources[id]])),
          favoriteRecords: {},
          favoriteSyncStatus: "ready",
          favoriteSyncMessage: null,
        };
      });
      return;
    }
    const localFavorites = get().favoriteProductIds.filter((id) => get().favoriteProductSources[id] === "anonymous" && isCanonicalProductUuid(id));
    const localSaved = get().savedForLaterIds.filter((id) => get().savedLineSources[id] !== "local");
    const compatibilitySaved = get().savedForLaterIds.filter((id) => get().savedLineSources[id] === "local");
    set({ favoriteSyncStatus: "loading", favoriteSyncMessage: null });
    try {
      const shouldMerge = favoriteMergeToken !== token;
      const mergeResult = shouldMerge
        ? await commerceApi.mergeSavedData(localFavorites, localSaved, token)
        : { merged: 0, skipped: [] as string[] };
      if (shouldMerge) favoriteMergeToken = token;
      const [favorites, saved] = await Promise.all([commerceApi.favorites(token), commerceApi.savedItems(token)]);
      if (hydrationVersion !== favoriteHydrationVersion || !isActiveAuthenticatedSession(token, sessionVersion)) return;
      const remoteRecords = favoriteRecordMap(favorites.data);
      const remoteIds = new Set(Object.keys(remoteRecords));
      const skipped = new Set(mergeResult.skipped);
      set((state) => ({
        favoriteProductIds: [...new Set([
          ...remoteIds,
          ...state.favoriteProductIds.filter((id) => {
            const source = state.favoriteProductSources[id];
            if (source === "persisted" || remoteIds.has(id)) return false;
            return !(shouldMerge && source === "anonymous" && localFavorites.includes(id) && !skipped.has(id));
          }),
        ])],
        favoriteProductSources: {
          ...Object.fromEntries([...remoteIds].map((id) => [id, "persisted" as const])),
          ...Object.fromEntries(state.favoriteProductIds
            .filter((id) => !remoteIds.has(id) && !(shouldMerge && state.favoriteProductSources[id] === "anonymous" && localFavorites.includes(id) && !skipped.has(id)))
            .map((id) => [id, skipped.has(id) ? "unresolved" as const : state.favoriteProductSources[id]])),
        },
        favoriteRecords: remoteRecords,
        favoriteSyncStatus: "ready",
        favoriteSyncMessage: null,
        savedForLaterIds: [...new Set([...saved.data.map((item) => item.variant_uuid), ...compatibilitySaved])],
        savedLineProductIds: { ...Object.fromEntries(saved.data.filter((item) => item.product_uuid).map((item) => [item.variant_uuid, item.product_uuid!])), ...Object.fromEntries(compatibilitySaved.map((id) => [id, state.savedLineProductIds[id] ?? id])) },
        savedLineSources: { ...Object.fromEntries(saved.data.map((item) => [item.variant_uuid, "api" as const])), ...Object.fromEntries(compatibilitySaved.map((id) => [id, "local" as const])) },
      }));
    } catch (error) {
      if (hydrationVersion !== favoriteHydrationVersion || !isActiveAuthenticatedSession(token, sessionVersion)) return;
      set({ favoriteSyncStatus: "error", favoriteSyncMessage: toUserFacingErrorMessage(error, "Unable to restore saved items.") });
    }
  },
  retryFavorites: async () => {
    favoriteMergeToken = null;
    await get().hydrateSavedData();
  },
  setCartQuantity: (lineId, quantity) => {
    const isLocalLine = get().cartLineSources[lineId] === "local";
    set((state) => {
      const nextQuantity = Math.max(0, quantity);
      const nextCart = { ...state.cartQuantities };
      const nextSelectedCartIds = state.selectedCartIds.filter((id) => id !== lineId);

      if (nextQuantity <= 0) {
        delete nextCart[lineId];
        const nextSources = { ...state.cartLineSources };
        delete nextSources[lineId];
        return {
          cartQuantities: nextCart,
          cartLineSources: nextSources,
          selectedCartIds: nextSelectedCartIds,
        };
      } else {
        nextCart[lineId] = nextQuantity;
        nextSelectedCartIds.push(lineId);
      }

      return {
        cartQuantities: nextCart,
        selectedCartIds: nextSelectedCartIds,
      };
    });
    if (isLocalLine) {
      set({ cartSyncStatus: "ready", cartSyncMessage: "This item is still being synchronized with our catalog and cannot be ordered yet." });
      return;
    }
    const token = usePublicAuthStore.getState().token;
    const sessionVersion = authenticatedSessionVersion;
    const request = enqueueCartMutation(() => {
      const itemUuid = get().cartItemIds[lineId];
      return quantity <= 0 && itemUuid ? commerceApi.removeItem(itemUuid, token) : itemUuid
        ? commerceApi.updateItem(itemUuid, Math.max(1, quantity), token)
        : commerceApi.addItem(lineId, Math.max(1, quantity), token);
    });
    void request.then((cart) => {
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      set((state) => ({ ...cartState(cart, state), cartSyncStatus: "ready", cartSyncMessage: null }));
    }).catch((error) => {
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      set({ cartSyncStatus: "error", cartSyncMessage: toUserFacingErrorMessage(error, "Cart update failed.") });
      void get().hydrateCommerceCart();
    });
  },
  addToCart: (productId, variantId = productId, apiBacked = true, apiVariantIdentityReady = true) => {
    if (apiBacked && !apiVariantIdentityReady) {
      set({ cartSyncStatus: "loading", cartSyncMessage: "Confirming the exact catalog variant..." });
      void catalogRepository.getProductById(productId).then((product) => {
        const exactVariant = product?.variants.find((variant) => variant.uuid) ?? product?.variants[0];
        if (!product || !exactVariant?.uuid) throw new Error("This product variant is still being synchronized and cannot be ordered yet.");
        set((state) => ({ cartVariantAliases: { ...state.cartVariantAliases, [variantId]: exactVariant.uuid! } }));
        get().addToCart(product.id, exactVariant.uuid, true, true);
      }).catch((error) => set({ cartSyncStatus: "error", cartSyncMessage: toUserFacingErrorMessage(error, "Unable to confirm this item." ) }));
      return;
    }
    set((state) => ({
      cartQuantities: {
        ...state.cartQuantities,
        [variantId]: (state.cartQuantities[variantId] ?? 0) + 1,
      },
      cartLineProductIds: { ...state.cartLineProductIds, [variantId]: productId },
      cartLineSources: { ...state.cartLineSources, [variantId]: apiBacked ? "api" : "local" },
      selectedCartIds: state.selectedCartIds.includes(variantId) ? state.selectedCartIds : [...state.selectedCartIds, variantId],
      savedForLaterIds: state.savedForLaterIds.filter((id) => id !== variantId),
      savedLineProductIds: Object.fromEntries(Object.entries(state.savedLineProductIds).filter(([id]) => id !== variantId)),
    }));
    if (!apiBacked) {
      set({ cartSyncStatus: "ready", cartSyncMessage: "This item is still being synchronized with our catalog and cannot be ordered yet." });
      return;
    }
    const token = usePublicAuthStore.getState().token;
    const sessionVersion = authenticatedSessionVersion;
    void commerceApi.addItem(variantId, 1, token).then((cart) => {
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      set((state) => ({ ...cartState(cart, state), cartSyncStatus: "ready", cartSyncMessage: null }));
    }).catch((error) => {
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      set({ cartSyncStatus: "error", cartSyncMessage: toUserFacingErrorMessage(error, "Unable to add this item.") });
      void get().hydrateCommerceCart();
    });
  },
  removeFromCart: (lineId) => {
    const itemUuid = get().cartItemIds[lineId];
    const token = usePublicAuthStore.getState().token;
    const sessionVersion = authenticatedSessionVersion;
    set((state) => {
      const nextCart = { ...state.cartQuantities };
      const nextProducts = { ...state.cartLineProductIds };
      const nextSources = { ...state.cartLineSources };
      delete nextCart[lineId];
      delete nextProducts[lineId];
      delete nextSources[lineId];

      return {
        cartQuantities: nextCart,
        cartLineProductIds: nextProducts,
        cartLineSources: nextSources,
        selectedCartIds: state.selectedCartIds.filter((id) => id !== lineId),
      };
    });
    if (itemUuid) void commerceApi.removeItem(itemUuid, token).then((cart) => {
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      set((state) => ({ ...cartState(cart, state) }));
    }).catch(() => {
      if (isActiveAuthenticatedSession(token, sessionVersion)) void get().hydrateCommerceCart();
    });
  },
  saveForLater: (lineId) => {
    const itemUuid = get().cartItemIds[lineId];
    const savedQuantity = get().cartQuantities[lineId] ?? 1;
    const token = usePublicAuthStore.getState().token;
    const sessionVersion = authenticatedSessionVersion;
    set((state) => {
      const nextCart = { ...state.cartQuantities };
      delete nextCart[lineId];

      return {
        cartQuantities: nextCart,
        selectedCartIds: state.selectedCartIds.filter((id) => id !== lineId),
        savedForLaterIds: state.savedForLaterIds.includes(lineId)
          ? state.savedForLaterIds
          : [...state.savedForLaterIds, lineId],
        savedLineProductIds: { ...state.savedLineProductIds, [lineId]: state.cartLineProductIds[lineId] ?? lineId },
        savedLineSources: { ...state.savedLineSources, [lineId]: state.cartLineSources[lineId] ?? "api" },
      };
    });
    if (itemUuid) void commerceApi.removeItem(itemUuid, token).then((cart) => {
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      if (token) void commerceApi.saveItem(lineId, savedQuantity, token);
      set((state) => ({ ...cartState(cart, state) }));
    }).catch(() => {
      if (isActiveAuthenticatedSession(token, sessionVersion)) void get().hydrateCommerceCart();
    });
  },
  moveSavedToCart: (lineId) => {
    const token = usePublicAuthStore.getState().token;
    const sessionVersion = authenticatedSessionVersion;
    set((state) => ({
      cartQuantities: {
        ...state.cartQuantities,
        [lineId]: state.cartQuantities[lineId] ?? 1,
      },
      cartLineProductIds: { ...state.cartLineProductIds, [lineId]: state.savedLineProductIds[lineId] ?? lineId },
      cartLineSources: { ...state.cartLineSources, [lineId]: state.savedLineSources[lineId] ?? "api" },
      selectedCartIds: state.selectedCartIds.includes(lineId) ? state.selectedCartIds : [...state.selectedCartIds, lineId],
      savedForLaterIds: state.savedForLaterIds.filter((id) => id !== lineId),
      savedLineProductIds: Object.fromEntries(Object.entries(state.savedLineProductIds).filter(([id]) => id !== lineId)),
      savedLineSources: Object.fromEntries(Object.entries(state.savedLineSources).filter(([id]) => id !== lineId)),
    }));
    if (get().cartLineSources[lineId] === "local") {
      set({ cartSyncStatus: "ready", cartSyncMessage: "This item is still being synchronized with our catalog and cannot be ordered yet." });
      return;
    }
    if (token) void commerceApi.moveSavedItemToCart(lineId, token).then(() => commerceApi.getCart(token)).then((cart) => {
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      set((state) => ({ ...cartState(cart, state) }));
    }).catch(() => {
      if (isActiveAuthenticatedSession(token, sessionVersion)) void get().hydrateCommerceCart();
    });
    else void commerceApi.addItem(lineId, 1, token).then((cart) => {
      if (!isActiveAuthenticatedSession(token, sessionVersion)) return;
      set((state) => ({ ...cartState(cart, state) }));
    }).catch(() => {
      if (isActiveAuthenticatedSession(token, sessionVersion)) void get().hydrateCommerceCart();
    });
  },
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
  toggleFavorite: (product) => {
    const token = usePublicAuthStore.getState().token;
    const canonicalId = product.apiBacked && isCanonicalProductUuid(product.uuid) ? product.uuid : null;
    const productIds = favoriteIdsForProduct(product);
    const existingId = productIds.find((id) => get().favoriteProductIds.includes(id));
    const favoriteId = canonicalId ?? existingId ?? product.id;
    const removing = Boolean(existingId);
    const mutationVersion = (get().favoriteMutationVersions[favoriteId] ?? 0) + 1;

    set((state) => ({
      favoriteProductIds: removing
        ? state.favoriteProductIds.filter((id) => !productIds.includes(id))
        : [...new Set([...state.favoriteProductIds.filter((id) => !productIds.includes(id)), favoriteId])],
      favoriteProductSources: removing
        ? Object.fromEntries(Object.entries(state.favoriteProductSources).filter(([id]) => !productIds.includes(id)))
        : { ...Object.fromEntries(Object.entries(state.favoriteProductSources).filter(([id]) => !productIds.includes(id))), [favoriteId]: canonicalId ? "anonymous" : "unresolved" },
      favoriteRecords: removing
        ? Object.fromEntries(Object.entries(state.favoriteRecords).filter(([id]) => !productIds.includes(id)))
        : state.favoriteRecords,
      favoriteMutationVersions: { ...state.favoriteMutationVersions, [favoriteId]: mutationVersion },
    }));
    if (!token || !canonicalId) {
      set({ favoriteSyncStatus: "ready", favoriteSyncMessage: canonicalId ? null : "This item will be saved after its exact catalog record is available." });
      return;
    }

    set({ favoriteSyncStatus: "saving", favoriteSyncMessage: null });
    void enqueueFavoriteMutation(() => removing ? commerceApi.removeFavorite(canonicalId, token) : commerceApi.saveFavorite(canonicalId, token))
      .then(() => {
        if (get().favoriteMutationVersions[canonicalId] !== mutationVersion) return;
        set((state) => ({
          favoriteProductSources: removing ? state.favoriteProductSources : { ...state.favoriteProductSources, [canonicalId]: "persisted" },
          favoriteSyncStatus: "ready",
          favoriteSyncMessage: null,
        }));
      })
      .catch((error) => {
        if (get().favoriteMutationVersions[canonicalId] !== mutationVersion) return;
        set((state) => ({
          favoriteProductIds: removing ? [...new Set([...state.favoriteProductIds, canonicalId])] : state.favoriteProductIds.filter((id) => id !== canonicalId),
          favoriteProductSources: removing ? { ...state.favoriteProductSources, [canonicalId]: "persisted" } : Object.fromEntries(Object.entries(state.favoriteProductSources).filter(([id]) => id !== canonicalId)),
          favoriteSyncStatus: "error",
          favoriteSyncMessage: toUserFacingErrorMessage(error, "Unable to update saved items."),
        }));
      });
  },
  removeFavorite: (favoriteId) => {
    const token = usePublicAuthStore.getState().token;
    const source = get().favoriteProductSources[favoriteId];
    const mutationVersion = (get().favoriteMutationVersions[favoriteId] ?? 0) + 1;
    set((state) => ({
      favoriteProductIds: state.favoriteProductIds.filter((id) => id !== favoriteId),
      favoriteProductSources: Object.fromEntries(Object.entries(state.favoriteProductSources).filter(([id]) => id !== favoriteId)),
      favoriteRecords: Object.fromEntries(Object.entries(state.favoriteRecords).filter(([id]) => id !== favoriteId)),
      favoriteMutationVersions: { ...state.favoriteMutationVersions, [favoriteId]: mutationVersion },
    }));
    if (!token || source !== "persisted" || !isCanonicalProductUuid(favoriteId)) return;
    set({ favoriteSyncStatus: "saving", favoriteSyncMessage: null });
    void enqueueFavoriteMutation(() => commerceApi.removeFavorite(favoriteId, token)).then(() => {
      if (get().favoriteMutationVersions[favoriteId] === mutationVersion) set({ favoriteSyncStatus: "ready", favoriteSyncMessage: null });
    }).catch((error) => {
      if (get().favoriteMutationVersions[favoriteId] !== mutationVersion) return;
      set((state) => ({
        favoriteProductIds: [...new Set([...state.favoriteProductIds, favoriteId])],
        favoriteProductSources: { ...state.favoriteProductSources, [favoriteId]: "persisted" },
        favoriteSyncStatus: "error",
        favoriteSyncMessage: toUserFacingErrorMessage(error, "Unable to update saved items."),
      }));
    });
  },
  migrateCatalogIdentity: (product) => {
    const compatibility = product.compatibility;
    if (!product.apiBacked || !compatibility?.localProductIds.length) return;
    let migrated = false;
    const resolvedFavoriteIds: string[] = [];
    set((state) => {
      const next = {
        cartQuantities: { ...state.cartQuantities }, cartLineProductIds: { ...state.cartLineProductIds }, cartLineSources: { ...state.cartLineSources },
        selectedCartIds: [...state.selectedCartIds], savedForLaterIds: [...state.savedForLaterIds], savedLineProductIds: { ...state.savedLineProductIds }, savedLineSources: { ...state.savedLineSources },
        favoriteProductIds: [...state.favoriteProductIds], favoriteProductSources: { ...state.favoriteProductSources }, cartVariantAliases: { ...state.cartVariantAliases },
      };
      for (const [localVariantId, apiVariantId] of Object.entries(compatibility.localVariantToApiVariant)) {
        if (next.cartQuantities[localVariantId] != null && compatibility.localProductIds.includes(next.cartLineProductIds[localVariantId])) {
          next.cartQuantities[apiVariantId] = (next.cartQuantities[apiVariantId] ?? 0) + next.cartQuantities[localVariantId];
          next.cartLineProductIds[apiVariantId] = product.id; next.cartLineSources[apiVariantId] = "api"; next.cartVariantAliases[localVariantId] = apiVariantId;
          delete next.cartQuantities[localVariantId]; delete next.cartLineProductIds[localVariantId]; delete next.cartLineSources[localVariantId];
          next.selectedCartIds = [...new Set(next.selectedCartIds.map((id) => id === localVariantId ? apiVariantId : id))]; migrated = true;
        }
        if (next.savedForLaterIds.includes(localVariantId)) {
          next.savedForLaterIds = [...new Set(next.savedForLaterIds.map((id) => id === localVariantId ? apiVariantId : id))];
          next.savedLineProductIds[apiVariantId] = product.id; next.savedLineSources[apiVariantId] = "api";
          delete next.savedLineProductIds[localVariantId]; delete next.savedLineSources[localVariantId]; migrated = true;
        }
      }
      for (const localProductId of compatibility.localProductIds) {
        if (next.favoriteProductIds.includes(localProductId)) {
          next.favoriteProductIds = [...new Set(next.favoriteProductIds.map((id) => id === localProductId ? product.id : id))];
          next.favoriteProductSources[product.id] = next.favoriteProductSources[localProductId] === "persisted" ? "persisted" : "anonymous";
          delete next.favoriteProductSources[localProductId];
          resolvedFavoriteIds.push(product.id);
          migrated = true;
        }
      }
      return next;
    });
    if (migrated) {
      void get().hydrateCommerceCart();
      const token = usePublicAuthStore.getState().token;
      if (token && isCanonicalProductUuid(product.uuid)) {
        for (const favoriteId of resolvedFavoriteIds) {
          if (favoriteId !== product.uuid) continue;
          void enqueueFavoriteMutation(() => commerceApi.saveFavorite(product.uuid!, token))
            .then(() => set((state) => ({ favoriteProductSources: { ...state.favoriteProductSources, [product.uuid!]: "persisted" } })))
            .catch(() => set((state) => ({ favoriteProductSources: { ...state.favoriteProductSources, [product.uuid!]: "unresolved" } })));
        }
      }
      void get().hydrateSavedData();
    }
  },
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
    const { selectedRole, formValues, pendingReferralCode } = get();
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
      const response = await submitSignupToBackend(selectedRole, cleanedValues, pendingReferralCode);
      if (!usePublicAuthStore.getState().setAuthenticatedSession(response.user, response.token, selectedRole)) {
        throw new ApiError("Registration could not be completed.", 502);
      }
    } catch (error) {
      const backendFieldErrors = error instanceof ApiError ? mapRegisterFieldErrors(error) : {};
      const hasBackendFieldErrors = Object.values(backendFieldErrors).some(Boolean);
      const firstBackendFieldError = Object.values(backendFieldErrors).find(Boolean);
      const backendErrorMessage =
        error instanceof ApiError
          ? hasBackendFieldErrors
            ? (firstBackendFieldError ?? "Please fix the highlighted fields and submit again.")
            : toUserFacingErrorMessage(error, "Registration could not be completed.")
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
      pendingReferralCode: null,
    });
  },
}));
