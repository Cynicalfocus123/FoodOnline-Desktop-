import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  AddressField,
  AddressValues,
  CountryKey,
  addressConfigs,
  countryOrder,
  createAddressSummary,
  getAddressError,
  getBlankAddressValues,
  preserveAddressValuesForCountry,
  validateAddress,
} from "../lib/addressSchema";
import { ApiError, apiRequest } from "../lib/apiClient";
import { AccountSection, useHomeStore } from "../store/homeStore";
import { usePublicAuthStore } from "../store/publicAuthStore";

type AccountAddress = {
  id: number;
  country_key: CountryKey;
  address_values: AddressValues;
  summary: string;
  is_default: boolean;
};

type PaymentMethod = {
  id: number;
  provider: string | null;
  brand: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  status: string;
};

type NotificationPreferences = {
  order_updates: boolean;
  delivery_updates: boolean;
  promotions_and_coupons: boolean;
  back_in_stock_alerts: boolean;
  saved_item_price_drops: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
};

type SaveState = "idle" | "saving";
type DeleteReasonKey =
  | "bad_experience"
  | "too_expensive"
  | "notifications"
  | "no_longer_need_account"
  | "no_longer_support_company"
  | "prefer_not_to_say"
  | "other";

const LOCAL_ADDRESS_STORAGE_KEY = "foodonlines-account-addresses-v1";
const LOCAL_NOTIFICATION_STORAGE_KEY = "foodonlines-notification-preferences-v1";
const deleteReasons: Array<{ key: DeleteReasonKey; label: string }> = [
  { key: "bad_experience", label: "Bad experience with FoodOnlines" },
  { key: "too_expensive", label: "It's too expensive" },
  { key: "notifications", label: "Notifications" },
  { key: "no_longer_need_account", label: "No longer need account" },
  { key: "no_longer_support_company", label: "No longer support company" },
  { key: "prefer_not_to_say", label: "Prefer not to say" },
  { key: "other", label: "Other" },
];

const statusShortcuts = [
  { key: "pending", label: "Pending", icon: <ClockIcon /> },
  { key: "unshipped", label: "Unshipped", icon: <BoxIcon /> },
  { key: "shipped", label: "Shipped", icon: <TruckIcon /> },
  { key: "toReview", label: "To Review", icon: <ChatIcon /> },
  { key: "returns", label: "Returns", icon: <ReturnIcon /> },
] as const;

const defaultPreferences: NotificationPreferences = {
  order_updates: true,
  delivery_updates: true,
  promotions_and_coupons: true,
  back_in_stock_alerts: true,
  saved_item_price_drops: true,
  email_notifications: true,
  sms_notifications: false,
  push_notifications: true,
};

function readLocalAddressBook(userKey: string): AccountAddress[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_ADDRESS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, AccountAddress[]>;
    const values = parsed[userKey];
    return Array.isArray(values) ? values : [];
  } catch {
    return [];
  }
}

function writeLocalAddressBook(userKey: string, addresses: AccountAddress[]) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(LOCAL_ADDRESS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, AccountAddress[]>) : {};
    parsed[userKey] = addresses;
    window.localStorage.setItem(LOCAL_ADDRESS_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Local storage failures should not break account actions.
  }
}

function readLocalNotificationPreferences(userKey: string): NotificationPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LOCAL_NOTIFICATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, NotificationPreferences>;
    return parsed[userKey] ?? null;
  } catch {
    return null;
  }
}

function writeLocalNotificationPreferences(userKey: string, preferences: NotificationPreferences) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(LOCAL_NOTIFICATION_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, NotificationPreferences>) : {};
    parsed[userKey] = preferences;
    window.localStorage.setItem(LOCAL_NOTIFICATION_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Preference persistence should never block the account UI.
  }
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }
  return fallback;
}

function detectBrand(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  return "Card";
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiryDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

function routeTitle(section: AccountSection) {
  if (section === "orders") return "My orders";
  if (section === "saved") return "Saved items";
  if (section === "refer") return "Refer a friend";
  if (section === "coupon") return "Coupons";
  if (section === "settings") return "Settings";
  if (section === "language") return "Language";
  return "My account";
}

export function AccountPage() {
  const accountSection = useHomeStore((state) => state.accountSection);
  const openAccount = useHomeStore((state) => state.openAccount);
  const openCheckout = useHomeStore((state) => state.openCheckout);
  const openCart = useHomeStore((state) => state.openCart);
  const openLogin = useHomeStore((state) => state.openLogin);
  const backToHome = useHomeStore((state) => state.backToHome);

  const currentUser = usePublicAuthStore((state) => state.currentUser);
  const token = usePublicAuthStore((state) => state.token);
  const logoutUser = usePublicAuthStore((state) => state.logoutUser);

  const [statusFilter, setStatusFilter] = useState<(typeof statusShortcuts)[number]["key"]>("pending");
  const [couponCount] = useState(1);

  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressMode, setAddressMode] = useState<"list" | "form">("list");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressCountry, setAddressCountry] = useState<CountryKey>("thailand");
  const [addressValues, setAddressValues] = useState<AddressValues>(getBlankAddressValues("thailand"));
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [addressTouched, setAddressTouched] = useState<Record<string, boolean>>({});
  const [addressSaveAsDefault, setAddressSaveAsDefault] = useState(false);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);
  const [addressState, setAddressState] = useState<SaveState>("idle");
  const [addressMessage, setAddressMessage] = useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingCountry, setBillingCountry] = useState<CountryKey>("thailand");
  const [billingValues, setBillingValues] = useState<AddressValues>(getBlankAddressValues("thailand"));
  const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<SaveState>("idle");

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [notificationState, setNotificationState] = useState<SaveState>("idle");
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordState, setPasswordState] = useState<SaveState>("idle");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState<DeleteReasonKey | "">("");
  const [deleteOtherReason, setDeleteOtherReason] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteState, setDeleteState] = useState<SaveState>("idle");

  const activeAddressConfig = useMemo(() => addressConfigs[addressCountry], [addressCountry]);
  const activeBillingConfig = useMemo(() => addressConfigs[billingCountry], [billingCountry]);
  const accountName = useMemo(() => {
    if (!currentUser) return "";
    const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
    return fullName || currentUser.email;
  }, [currentUser]);
  const userAddressCacheKey = useMemo(() => {
    if (!currentUser) return "anonymous";
    return String(currentUser.id);
  }, [currentUser]);
  const hasAnyModalOpen =
    isAddressModalOpen || isPaymentModalOpen || isNotificationsOpen || isPasswordOpen || isDeleteOpen;
  const accountPanelReference = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!currentUser || !token) return;
    void loadAddresses(token);
    void loadPaymentMethods(token);
    void loadPreferences(token);
  }, [currentUser, token]);

  useEffect(() => {
    if (!hasAnyModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [hasAnyModalOpen]);

  function scrollAccountPanelIntoView() {
    const panel = accountPanelReference.current;
    if (!panel) return;

    window.requestAnimationFrame(() => {
      panel.scrollIntoView({ behavior: "auto", block: "center" });
    });
  }

  useEffect(() => {
    scrollAccountPanelIntoView();
  }, [accountSection]);

  function openAccountSection(section: AccountSection) {
    openAccount(section);
    window.setTimeout(scrollAccountPanelIntoView, 0);
  }

  async function handleAccountLogout() {
    await logoutUser();
    openLogin();
    window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, 0);
  }

  if (!currentUser) {
    return (
      <section className="bg-neutral-50 px-4 pb-16 pt-[140px] sm:px-6 sm:pt-[154px] lg:pt-[162px]">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
          <h1 className="text-3xl font-black text-neutral-950">Account</h1>
          <p className="mt-3 text-sm leading-7 text-neutral-600">Please sign in to view your account details.</p>
          <button
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-leaf-600 px-6 text-sm font-black text-white transition hover:bg-leaf-700"
            onClick={openLogin}
            type="button"
          >
            Login / Register
          </button>
        </div>
      </section>
    );
  }

  async function loadAddresses(nextToken: string) {
    try {
      const response = await apiRequest<{ addresses: AccountAddress[] }>("/account/addresses", { token: nextToken });
      const next = response.addresses ?? [];
      setAddresses(next);
      writeLocalAddressBook(userAddressCacheKey, next);
    } catch {
      setAddresses(readLocalAddressBook(userAddressCacheKey));
    }
  }

  async function loadPaymentMethods(nextToken: string) {
    try {
      const response = await apiRequest<{ payment_methods: PaymentMethod[] }>("/account/payment-methods", {
        token: nextToken,
      });
      setPaymentMethods(response.payment_methods ?? []);
    } catch {
      setPaymentMethods([]);
    }
  }

  async function loadPreferences(nextToken: string) {
    try {
      const response = await apiRequest<{ preferences: NotificationPreferences }>("/account/notification-preferences", {
        token: nextToken,
      });
      const nextPreferences = response.preferences ?? defaultPreferences;
      setPreferences(nextPreferences);
      writeLocalNotificationPreferences(userAddressCacheKey, nextPreferences);
    } catch {
      setPreferences(readLocalNotificationPreferences(userAddressCacheKey) ?? defaultPreferences);
    }
  }

  function openAddAddressForm() {
    setAddressMode("form");
    setEditingAddressId(null);
    setAddressValues(getBlankAddressValues(addressCountry));
    setAddressErrors({});
    setAddressTouched({});
    setAddressSaveAsDefault(addresses.length === 0);
    setSaveAddressForFuture(true);
    setAddressMessage(null);
  }

  function openEditAddressForm(address: AccountAddress) {
    setAddressMode("form");
    setEditingAddressId(address.id);
    setAddressCountry(address.country_key);
    setAddressValues({ ...address.address_values });
    setAddressErrors({});
    setAddressTouched({});
    setAddressSaveAsDefault(address.is_default);
    setSaveAddressForFuture(true);
    setAddressMessage(null);
  }

  function handleAddressCountryChange(nextCountry: CountryKey) {
    setAddressCountry(nextCountry);
    setAddressValues((current) => preserveAddressValuesForCountry(current, nextCountry));
    setAddressErrors({});
    setAddressTouched({});
  }

  function handleAddressValueChange(field: AddressField, value: string) {
    setAddressValues((current) => ({ ...current, [field.key]: value }));

    if (addressTouched[field.key] || addressErrors[field.key]) {
      const error = getAddressError(field, value);
      setAddressErrors((current) => {
        const next = { ...current };
        if (error) next[field.key] = error;
        else delete next[field.key];
        return next;
      });
    }
  }

  function validateAddressForm() {
    const nextErrors = validateAddress(addressValues, activeAddressConfig);
    const nextTouched = activeAddressConfig.fields.reduce<Record<string, boolean>>((state, field) => {
      state[field.key] = true;
      return state;
    }, {});
    setAddressErrors(nextErrors);
    setAddressTouched(nextTouched);
    return Object.keys(nextErrors).length === 0;
  }

  function withLocalDefaultState(nextAddresses: AccountAddress[]) {
    if (!nextAddresses.some((address) => address.is_default) && nextAddresses.length > 0) {
      const [first, ...rest] = nextAddresses;
      return [{ ...first, is_default: true }, ...rest];
    }
    return nextAddresses;
  }

  function updateLocalAddresses(nextAddresses: AccountAddress[]) {
    const normalized = withLocalDefaultState(nextAddresses);
    setAddresses(normalized);
    writeLocalAddressBook(userAddressCacheKey, normalized);
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateAddressForm()) return;

    const payload = {
      country_key: addressCountry,
      address_values: addressValues,
      summary: createAddressSummary(addressCountry, addressValues),
      is_default: addressSaveAsDefault,
    };

    setAddressState("saving");
    setAddressMessage(null);

    try {
      if (token) {
        if (editingAddressId) {
          await apiRequest(`/account/addresses/${editingAddressId}`, { method: "PUT", token, body: payload });
        } else {
          await apiRequest("/account/addresses", { method: "POST", token, body: payload });
        }
        await loadAddresses(token);
      } else {
        throw new Error("no-token");
      }

      setAddressMode("list");
      setAddressMessage("Address saved.");
    } catch {
      const base = addresses.length ? [...addresses] : [...readLocalAddressBook(userAddressCacheKey)];
      if (editingAddressId) {
        const next = base.map((address) =>
          address.id === editingAddressId
            ? { ...address, country_key: addressCountry, address_values: { ...addressValues }, summary: payload.summary, is_default: addressSaveAsDefault }
            : addressSaveAsDefault
              ? { ...address, is_default: false }
              : address,
        );
        updateLocalAddresses(next);
      } else {
        const localId = Date.now();
        const nextAddress: AccountAddress = {
          id: localId,
          country_key: addressCountry,
          address_values: { ...addressValues },
          summary: payload.summary,
          is_default: addressSaveAsDefault || base.length === 0,
        };
        const next = [nextAddress, ...base.map((address) => (nextAddress.is_default ? { ...address, is_default: false } : address))];
        updateLocalAddresses(next);
      }

      setAddressMode("list");
      setAddressMessage(saveAddressForFuture ? "Address saved locally." : "Address used locally and can be saved later.");
    } finally {
      setAddressState("idle");
    }
  }

  async function removeAddress(addressId: number) {
    if (!token) {
      updateLocalAddresses(addresses.filter((address) => address.id !== addressId));
      return;
    }

    try {
      await apiRequest(`/account/addresses/${addressId}`, { method: "DELETE", token });
      await loadAddresses(token);
    } catch {
      updateLocalAddresses(addresses.filter((address) => address.id !== addressId));
      setAddressMessage("Address removed locally.");
    }
  }

  async function makeDefaultAddress(addressId: number) {
    if (!token) {
      updateLocalAddresses(addresses.map((address) => ({ ...address, is_default: address.id === addressId })));
      return;
    }

    try {
      await apiRequest(`/account/addresses/${addressId}/default`, { method: "PUT", token });
      await loadAddresses(token);
    } catch {
      updateLocalAddresses(addresses.map((address) => ({ ...address, is_default: address.id === addressId })));
      setAddressMessage("Default address updated locally.");
    }
  }

  function validateCardForm() {
    const errors: Record<string, string> = {};
    const cardDigits = cardNumber.replace(/\D/g, "");
    const expiryDigits = expiryDate.replace(/\D/g, "");
    const month = Number(expiryDigits.slice(0, 2));

    if (!cardholderName.trim()) errors.cardholderName = "Cardholder name is required.";
    if (cardDigits.length < 12 || cardDigits.length > 19) errors.cardNumber = "Enter a valid card number.";
    if (expiryDigits.length !== 4 || month < 1 || month > 12) errors.expiryDate = "Enter a valid expiry date.";
    if (!/^\d{3,4}$/.test(cvv)) errors.cvv = "Enter a valid CVV.";
    if (!billingSameAsShipping) Object.assign(errors, validateAddress(billingValues, activeBillingConfig));

    setBillingErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function saveCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !validateCardForm()) return;

    setPaymentState("saving");
    setPaymentMessage(null);
    try {
      const digits = cardNumber.replace(/\D/g, "");
      const expiryDigits = expiryDate.replace(/\D/g, "");

      await apiRequest("/account/payment-methods", {
        method: "POST",
        token,
        body: {
          provider: null,
          brand: detectBrand(cardNumber),
          last4: digits.slice(-4),
          expiry_month: Number(expiryDigits.slice(0, 2)),
          expiry_year: Number(`20${expiryDigits.slice(2, 4)}`),
          token_reference: null, // TODO: swap to real provider token.
          is_default: paymentMethods.length === 0,
        },
      });

      setCardholderName("");
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setBillingSameAsShipping(true);
      setBillingErrors({});
      setIsAddCardOpen(false);
      await loadPaymentMethods(token);
      setPaymentMessage("Payment method saved.");
    } catch (error) {
      setPaymentMessage(toErrorMessage(error, "Unable to save payment method."));
    } finally {
      setPaymentState("idle");
    }
  }

  async function removePaymentMethod(methodId: number) {
    if (!token) return;
    try {
      await apiRequest(`/account/payment-methods/${methodId}`, { method: "DELETE", token });
      await loadPaymentMethods(token);
    } catch {
      setPaymentMessage("Unable to remove payment method.");
    }
  }

  async function setDefaultPaymentMethod(methodId: number) {
    if (!token) return;
    try {
      await apiRequest(`/account/payment-methods/${methodId}/default`, { method: "PUT", token });
      await loadPaymentMethods(token);
    } catch {
      setPaymentMessage("Unable to set default payment method.");
    }
  }

  async function updatePreference<K extends keyof NotificationPreferences>(key: K, value: boolean) {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    writeLocalNotificationPreferences(userAddressCacheKey, next);
    setNotificationState("saving");
    setNotificationMessage(null);

    try {
      if (!token) throw new Error("no-token");
      await apiRequest("/account/notification-preferences", { method: "PUT", token, body: next });
      setNotificationMessage("Notification preferences saved.");
    } catch (error) {
      setNotificationMessage(
        error instanceof ApiError
          ? toErrorMessage(error, "Notification preferences saved locally.")
          : "Notification preferences saved locally.",
      );
    } finally {
      setNotificationState("idle");
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setPasswordError(null);
    setPasswordMessage(null);
    if (!currentPassword.trim()) return setPasswordError("Current password is required.");
    if (!newPassword.trim()) return setPasswordError("New password is required.");
    if (!confirmPassword.trim()) return setPasswordError("Retype new password is required.");
    if (newPassword !== confirmPassword) return setPasswordError("New password and retype password must match.");

    setPasswordState("saving");
    try {
      await apiRequest("/account/password", {
        method: "PUT",
        token,
        body: {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        },
      });
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(toErrorMessage(error, "Unable to update password."));
    } finally {
      setPasswordState("idle");
    }
  }

  async function submitDeleteRequest() {
    if (!token) return;
    setDeleteError(null);
    setDeleteMessage(null);

    if (!deleteReason) {
      setDeleteError("Please select a reason.");
      return;
    }

    if (deleteReason === "other" && !deleteOtherReason.trim()) {
      setDeleteError("Tell us your reason...");
      return;
    }

    setDeleteState("saving");
    try {
      const response = await apiRequest<{ message: string }>("/account/delete-request", {
        method: "POST",
        token,
        body: { reason: deleteReason, other_reason: deleteReason === "other" ? deleteOtherReason.trim() : null },
      });
      setDeleteMessage(response.message || "Your account deletion request has been submitted.");
      await logoutUser();
      backToHome();
    } catch (error) {
      setDeleteError(toErrorMessage(error, "Unable to submit delete request."));
    } finally {
      setDeleteState("idle");
    }
  }

  return (
    <>
      <section className="bg-neutral-50 px-4 pb-[calc(32px+env(safe-area-inset-bottom))] pt-[132px] sm:px-6 sm:pt-[146px] lg:pt-[154px]">
        <div className="mx-auto max-w-[1080px]" ref={accountPanelReference}>
          <div className="rounded-[24px] border border-neutral-200 bg-white p-4 sm:p-6">
            {accountSection !== "overview" ? (
              <AccountSubpageHeader title={routeTitle(accountSection)} onBack={() => openAccountSection("overview")} />
            ) : null}

            {accountSection === "overview" ? (
              <div className="flex min-w-0 items-center gap-3 rounded-[24px] border border-neutral-200 bg-white p-4 sm:p-5">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-black text-neutral-900">
                  {(accountName.charAt(0) || "A").toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-neutral-950">{accountName}</p>
                  <p className="truncate text-base text-neutral-500">{currentUser.email || currentUser.contactNumber || "FoodOnlines account"}</p>
                </div>
              </div>
            ) : null}

            {accountSection === "overview" ? (
              <h1 className="mt-5 text-[2rem] font-black leading-none text-neutral-950">{routeTitle(accountSection)}</h1>
            ) : null}

            {accountSection === "overview" ? (
              <div className="mt-6 grid gap-4">
                <button
                  className="flex w-full items-center justify-between rounded-3xl border border-neutral-200 bg-white px-5 py-5 text-left transition hover:bg-neutral-50"
                  onClick={() => openAccountSection("orders")}
                  type="button"
                >
                  <span className="flex items-center gap-3 text-xl font-black text-neutral-950">
                    <OrdersRowIcon />
                    My orders
                  </span>
                  <ChevronRight />
                </button>

                <div className="grid grid-cols-5 gap-1.5 overflow-x-auto pb-1 scrollbar-none sm:gap-4">
                  {statusShortcuts.map((item) => (
                    <button
                      className="flex min-w-0 flex-col items-center gap-2 rounded-2xl px-1 py-2 text-center text-neutral-700 transition hover:bg-neutral-50"
                      key={item.key}
                      onClick={() => {
                        setStatusFilter(item.key);
                        openAccountSection("orders");
                      }}
                      type="button"
                    >
                      <span
                        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-neutral-950 sm:h-14 sm:w-14 ${
                          statusFilter === item.key ? "border-leaf-500 bg-emerald-50" : "border-neutral-200 bg-white"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-[11px] font-bold leading-4 text-neutral-500 sm:text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MenuRow icon={<SavedIcon />} label="Saved items" onClick={() => openAccountSection("saved")} />
                  <MenuRow icon={<BuyAgainIcon />} label="Buy again" onClick={() => openAccountSection("orders")} />
                </div>

                <div className="grid gap-3">
                  <MenuRow icon={<LanguageRowIcon />} label="Language (English)" onClick={() => openAccountSection("language")} />
                  <MenuRow icon={<AddressBookIcon />} label="Address book" onClick={() => setIsAddressModalOpen(true)} />
                  <MenuRow icon={<CardRowIcon />} label="Payment methods" onClick={() => setIsPaymentModalOpen(true)} />
                  <MenuRow badge={couponCount > 0 ? String(couponCount) : undefined} icon={<CouponIcon />} label="Coupons" onClick={() => openAccountSection("coupon")} />
                  <MenuRow icon={<GiftRowIcon />} label="Refer a friend" onClick={() => openAccountSection("refer")} />
                  <MenuRow icon={<SettingsRowIcon />} label="Settings" onClick={() => openAccountSection("settings")} />
                </div>

                <button
                  className="mx-auto mt-4 inline-flex min-h-12 items-center justify-center rounded-full px-8 text-lg font-semibold text-neutral-950 transition hover:bg-neutral-100"
                  onClick={() => void handleAccountLogout()}
                  type="button"
                >
                  Log out
                </button>
              </div>
            ) : null}

            {accountSection === "orders" ? (
              <SimplePanel
                title="My orders"
                subtitle={`Order status shortcut selected: ${statusShortcuts.find((item) => item.key === statusFilter)?.label ?? "Pending"}.`}
              />
            ) : null}

            {accountSection === "saved" ? (
              <SimplePanel title="Saved items" subtitle="Saved-item integration is ready for your existing wishlist endpoint." />
            ) : null}

            {accountSection === "refer" ? (
              <SimplePanel title="Refer a friend" subtitle="Referral route is ready for your existing referral program endpoint." />
            ) : null}

            {accountSection === "coupon" ? (
              <SimplePanel title="Coupons" subtitle="Coupon view is ready for coupon-list endpoint and redemption history." />
            ) : null}

            {accountSection === "language" ? (
              <SimplePanel title="Language" subtitle="Language preferences are ready for the existing localization settings endpoint." />
            ) : null}

            {accountSection === "settings" ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <SettingsCard description="Manage your saved shipping addresses and defaults." icon={<AddressBookIcon />} title="Address book" onClick={() => setIsAddressModalOpen(true)} />
                <SettingsCard description="Manage saved cards and default payment method." icon={<CardRowIcon />} title="Payment methods" onClick={() => setIsPaymentModalOpen(true)} />
                <SettingsCard description="Choose email, SMS, push, and order update preferences." icon={<BellIcon />} title="Notifications" onClick={() => setIsNotificationsOpen(true)} />
                <SettingsCard description="Update your account password securely." icon={<LockIcon />} title="Change password" onClick={() => setIsPasswordOpen(true)} />
                <SettingsCard description="Submit an account deletion request with a reason." icon={<DeleteIcon />} title="Delete account" onClick={() => setIsDeleteOpen(true)} />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <ModalShell isOpen={isAddressModalOpen} title="Address book" onClose={() => setIsAddressModalOpen(false)}>
        {addressMode === "list" ? (
          <div className="grid gap-4">
            {addresses.length ? (
              <div className="grid gap-3">
                {addresses.map((address) => (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4" key={address.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-black text-neutral-950">{address.address_values.fullName || "Saved address"}</p>
                        <p className="mt-1 text-sm text-neutral-600">{address.summary}</p>
                        {address.address_values.phoneNumber ? (
                          <p className="mt-1 text-sm text-neutral-500">{address.address_values.phoneNumber}</p>
                        ) : null}
                      </div>
                      {address.is_default ? (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-leaf-700">Default</span>
                      ) : null}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-full border border-neutral-200 px-3 py-2 text-xs font-black text-neutral-700" onClick={() => openEditAddressForm(address)} type="button">
                        Edit
                      </button>
                      <button className="rounded-full border border-neutral-200 px-3 py-2 text-xs font-black text-neutral-700" onClick={() => void removeAddress(address.id)} type="button">
                        Delete
                      </button>
                      {!address.is_default ? (
                        <button className="rounded-full border border-leaf-500 px-3 py-2 text-xs font-black text-leaf-700" onClick={() => void makeDefaultAddress(address.id)} type="button">
                          Set default
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-600">No saved addresses yet.</p>
            )}
            {addressMessage ? <p className="text-sm font-semibold text-neutral-700">{addressMessage}</p> : null}
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-leaf-500 px-5 text-sm font-black text-leaf-700"
              onClick={openAddAddressForm}
              type="button"
            >
              Add new address
            </button>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={saveAddress}>
            <label className="grid gap-1.5" htmlFor="account-address-country">
              <span className="text-sm font-bold text-neutral-700">
                Country <span className="text-red-500">*</span>
              </span>
              <select
                className="min-h-12 rounded-2xl border border-neutral-200 px-4 text-base font-semibold outline-none ring-2 ring-transparent focus:border-leaf-500 focus:ring-leaf-500/15"
                id="account-address-country"
                onChange={(event) => handleAddressCountryChange(event.target.value as CountryKey)}
                value={addressCountry}
              >
                {countryOrder.map((country) => (
                  <option key={country} value={country}>
                    {addressConfigs[country].label}
                  </option>
                ))}
              </select>
            </label>

            <p className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-neutral-700">
              {activeAddressConfig.deliveryHint}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {activeAddressConfig.fields.map((field) => {
                const error = addressTouched[field.key] || addressErrors[field.key] ? addressErrors[field.key] : "";
                return (
                  <label className={field.fullWidth ? "grid gap-1.5 sm:col-span-2" : "grid gap-1.5"} key={field.key}>
                    <span className="text-sm font-bold text-neutral-700">
                      {field.label}
                      {field.required ? <span className="text-red-500"> *</span> : null}
                    </span>
                    {field.type === "textarea" ? (
                      <textarea
                        autoComplete={field.autoComplete}
                        className="min-h-[110px] rounded-2xl border border-neutral-200 px-3 py-3 text-base font-semibold outline-none ring-2 ring-transparent focus:border-leaf-500 focus:ring-leaf-500/15"
                        onBlur={() => {
                          setAddressTouched((current) => ({ ...current, [field.key]: true }));
                          setAddressErrors((current) => ({ ...current, [field.key]: getAddressError(field, addressValues[field.key] ?? "") }));
                        }}
                        onChange={(event) => handleAddressValueChange(field, event.target.value)}
                        value={addressValues[field.key] ?? ""}
                      />
                    ) : (
                      <input
                        autoComplete={field.autoComplete}
                        className="min-h-12 rounded-2xl border border-neutral-200 px-3 text-base font-semibold outline-none ring-2 ring-transparent focus:border-leaf-500 focus:ring-leaf-500/15"
                        inputMode={field.type === "postal" ? "numeric" : field.inputMode}
                        onBlur={() => {
                          setAddressTouched((current) => ({ ...current, [field.key]: true }));
                          setAddressErrors((current) => ({ ...current, [field.key]: getAddressError(field, addressValues[field.key] ?? "") }));
                        }}
                        onChange={(event) => handleAddressValueChange(field, event.target.value)}
                        type={field.type === "tel" ? "tel" : "text"}
                        value={addressValues[field.key] ?? ""}
                      />
                    )}
                    {error ? <span className="text-xs font-semibold text-red-600">{error}</span> : null}
                  </label>
                );
              })}
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <input
                checked={saveAddressForFuture}
                className="h-4 w-4 accent-leaf-600"
                onChange={(event) => setSaveAddressForFuture(event.target.checked)}
                type="checkbox"
              />
              Save this address for future orders
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <input
                checked={addressSaveAsDefault}
                className="h-4 w-4 accent-leaf-600"
                onChange={(event) => setAddressSaveAsDefault(event.target.checked)}
                type="checkbox"
              />
              Set as default address
            </label>

            <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-end gap-2 border-t border-neutral-100 bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:-mx-5 sm:px-5">
              <button
                className="min-h-12 rounded-full bg-slate-100 px-6 text-base font-black text-neutral-700 transition hover:bg-slate-200"
                onClick={() => setAddressMode("list")}
                type="button"
              >
                Cancel
              </button>
              <button
                className="min-h-12 rounded-full bg-leaf-600 px-7 text-base font-black text-white transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
                disabled={addressState === "saving"}
                type="submit"
              >
                {addressState === "saving" ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </ModalShell>

      <ModalShell isOpen={isPaymentModalOpen} title="Payment methods" onClose={() => setIsPaymentModalOpen(false)}>
        <div className="grid gap-4">
          {paymentMethods.length ? (
            <div className="grid gap-3">
              {paymentMethods.map((method) => (
                <div className="rounded-2xl border border-neutral-200 p-4" key={method.id}>
                  <p className="text-sm font-black text-neutral-950">
                    {method.brand} ending in {method.last4}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    Expires {String(method.expiry_month).padStart(2, "0")}/{method.expiry_year}
                  </p>
                  <div className="mt-3 flex gap-2">
                    {!method.is_default ? (
                      <button
                        className="rounded-full border border-leaf-500 px-3 py-2 text-xs font-black text-leaf-700"
                        onClick={() => void setDefaultPaymentMethod(method.id)}
                        type="button"
                      >
                        Set default
                      </button>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-leaf-700">Default</span>
                    )}
                    <button
                      className="rounded-full border border-neutral-200 px-3 py-2 text-xs font-black text-neutral-700"
                      onClick={() => void removePaymentMethod(method.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-600">No saved payment methods.</p>
          )}

          {paymentMessage ? <p className="text-sm font-semibold text-neutral-700">{paymentMessage}</p> : null}

          {!isAddCardOpen ? (
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-leaf-500 px-5 text-sm font-black text-leaf-700"
              onClick={() => setIsAddCardOpen(true)}
              type="button"
            >
              Add new card
            </button>
          ) : (
            <form className="grid gap-3 rounded-2xl border border-neutral-200 p-4" onSubmit={saveCard}>
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-neutral-700">Cardholder name</span>
                <input
                  className="min-h-12 rounded-2xl border border-neutral-200 px-3 text-base font-semibold outline-none focus:border-leaf-500"
                  onChange={(event) => setCardholderName(event.target.value)}
                  value={cardholderName}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-neutral-700">Card number</span>
                <input
                  className="min-h-12 rounded-2xl border border-neutral-200 px-3 text-base font-semibold outline-none focus:border-leaf-500"
                  inputMode="numeric"
                  onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                  value={cardNumber}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-neutral-700">Expiration date</span>
                  <input
                    className="min-h-12 rounded-2xl border border-neutral-200 px-3 text-base font-semibold outline-none focus:border-leaf-500"
                    inputMode="numeric"
                    onChange={(event) => setExpiryDate(formatExpiryDate(event.target.value))}
                    placeholder="MM/YY"
                    value={expiryDate}
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-neutral-700">CVV</span>
                  <input
                    className="min-h-12 rounded-2xl border border-neutral-200 px-3 text-base font-semibold outline-none focus:border-leaf-500"
                    inputMode="numeric"
                    onChange={(event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    type="password"
                    value={cvv}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <input
                  checked={billingSameAsShipping}
                  className="h-4 w-4 accent-leaf-600"
                  onChange={(event) => setBillingSameAsShipping(event.target.checked)}
                  type="checkbox"
                />
                Billing address same as shipping address
              </label>

              {!billingSameAsShipping ? (
                <div className="grid gap-3 rounded-2xl border border-neutral-200 p-3">
                  <label className="grid gap-1.5" htmlFor="account-billing-country">
                    <span className="text-sm font-bold text-neutral-700">
                      Country <span className="text-red-500">*</span>
                    </span>
                    <select
                      className="min-h-12 rounded-xl border border-neutral-200 px-3 text-base font-semibold outline-none focus:border-leaf-500"
                      id="account-billing-country"
                      onChange={(event) => {
                        const nextCountry = event.target.value as CountryKey;
                        setBillingCountry(nextCountry);
                        setBillingValues((current) => preserveAddressValuesForCountry(current, nextCountry));
                        setBillingErrors({});
                      }}
                      value={billingCountry}
                    >
                      {countryOrder.map((country) => (
                        <option key={country} value={country}>
                          {addressConfigs[country].label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeBillingConfig.fields.map((field) => (
                      <label className={field.fullWidth ? "grid gap-1.5 sm:col-span-2" : "grid gap-1.5"} key={field.key}>
                        <span className="text-xs font-bold text-neutral-700">
                          {field.label}
                          {field.required ? <span className="text-red-500"> *</span> : null}
                        </span>
                        {field.type === "textarea" ? (
                          <textarea
                            className="min-h-[84px] rounded-xl border border-neutral-200 px-3 py-2 text-base font-semibold outline-none focus:border-leaf-500"
                            onChange={(event) =>
                              setBillingValues((current) => ({ ...current, [field.key]: event.target.value }))
                            }
                            value={billingValues[field.key] ?? ""}
                          />
                        ) : (
                          <input
                            className="min-h-12 rounded-xl border border-neutral-200 px-3 text-base font-semibold outline-none focus:border-leaf-500"
                            inputMode={field.type === "postal" ? "numeric" : field.inputMode}
                            onChange={(event) =>
                              setBillingValues((current) => ({ ...current, [field.key]: event.target.value }))
                            }
                            type={field.type === "tel" ? "tel" : "text"}
                            value={billingValues[field.key] ?? ""}
                          />
                        )}
                        {billingErrors[field.key] ? (
                          <span className="text-xs font-semibold text-red-600">{billingErrors[field.key]}</span>
                        ) : null}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-end gap-2 border-t border-neutral-100 bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                <button
                  className="min-h-12 rounded-full bg-slate-100 px-6 py-2 text-base font-black text-neutral-700"
                  onClick={() => setIsAddCardOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="min-h-12 rounded-full bg-leaf-600 px-7 py-2 text-base font-black text-white disabled:bg-neutral-300"
                  disabled={paymentState === "saving"}
                  type="submit"
                >
                  {paymentState === "saving" ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          )}
        </div>
      </ModalShell>

      <ModalShell isOpen={isNotificationsOpen} title="Notifications" onClose={() => setIsNotificationsOpen(false)}>
        <div className="grid gap-4">
          <ToggleRow label="Order updates" value={preferences.order_updates} onChange={(value) => void updatePreference("order_updates", value)} />
          <ToggleRow label="Delivery updates" value={preferences.delivery_updates} onChange={(value) => void updatePreference("delivery_updates", value)} />
          <ToggleRow label="Promotions and coupons" value={preferences.promotions_and_coupons} onChange={(value) => void updatePreference("promotions_and_coupons", value)} />
          <ToggleRow label="Back-in-stock alerts" value={preferences.back_in_stock_alerts} onChange={(value) => void updatePreference("back_in_stock_alerts", value)} />
          <ToggleRow label="Saved item price drops" value={preferences.saved_item_price_drops} onChange={(value) => void updatePreference("saved_item_price_drops", value)} />
          <ToggleRow label="Email notifications" value={preferences.email_notifications} onChange={(value) => void updatePreference("email_notifications", value)} />
          <ToggleRow label="SMS notifications" value={preferences.sms_notifications} onChange={(value) => void updatePreference("sms_notifications", value)} />
          <ToggleRow label="Push notifications" value={preferences.push_notifications} onChange={(value) => void updatePreference("push_notifications", value)} />
          {notificationMessage ? <p className="text-sm font-semibold text-neutral-700">{notificationMessage}</p> : null}
          {notificationState === "saving" ? <p className="text-xs font-semibold text-neutral-500">Saving...</p> : null}
        </div>
      </ModalShell>

      <ModalShell isOpen={isPasswordOpen} title="Change password" onClose={() => setIsPasswordOpen(false)}>
        <form className="grid gap-4" onSubmit={submitPassword}>
          <PasswordField label="Current password" onChange={setCurrentPassword} value={currentPassword} />
          <PasswordField label="New password" onChange={setNewPassword} value={newPassword} />
          <PasswordField label="Retype new password" onChange={setConfirmPassword} value={confirmPassword} />
          {passwordError ? <p className="text-sm font-semibold text-red-600">{passwordError}</p> : null}
          {passwordMessage ? <p className="text-sm font-semibold text-leaf-700">{passwordMessage}</p> : null}
          <button
            className="min-h-12 rounded-full bg-leaf-600 px-4 text-base font-black text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
            disabled={passwordState === "saving"}
            type="submit"
          >
            {passwordState === "saving" ? "Saving..." : "Save"}
          </button>
        </form>
      </ModalShell>

      <ModalShell isOpen={isDeleteOpen} title="Request to delete Your account?" onClose={() => setIsDeleteOpen(false)}>
        <div className="grid max-h-[70vh] grid-rows-[minmax(0,1fr)_auto] gap-4 overflow-hidden">
          <div className="overflow-y-auto pr-1">
            <p className="text-sm leading-6 text-neutral-700">
              You'll permanently delete your account and will no longer be able to login. Once your request is processed,
              your personal data will be deleted in accordance with applicable law.
            </p>
            <p className="mt-5 text-sm font-black text-neutral-900">Why are you deleting your account? (*Required)</p>
            <div className="mt-3 grid gap-2">
              {deleteReasons.map((reason) => (
                <label className="flex items-start gap-2 text-sm font-semibold text-neutral-700" key={reason.key}>
                  <input
                    checked={deleteReason === reason.key}
                    className="mt-0.5 h-4 w-4 accent-leaf-600"
                    name="delete-reason"
                    onChange={() => setDeleteReason(reason.key)}
                    type="radio"
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>
            {deleteReason === "other" ? (
              <label className="mt-4 grid gap-1.5">
                <span className="text-sm font-bold text-neutral-700">Tell us your reason...</span>
                <textarea
                  className="min-h-[110px] rounded-xl border border-neutral-200 px-3 py-2 text-base font-semibold outline-none focus:border-leaf-500"
                  onChange={(event) => setDeleteOtherReason(event.target.value)}
                  value={deleteOtherReason}
                />
              </label>
            ) : null}
            {deleteError ? <p className="mt-3 text-sm font-semibold text-red-600">{deleteError}</p> : null}
            {deleteMessage ? <p className="mt-3 text-sm font-semibold text-leaf-700">{deleteMessage}</p> : null}
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-100 pt-3">
            <button
              className="rounded-full bg-slate-100 px-5 py-2 text-sm font-black text-neutral-700"
              onClick={() => setIsDeleteOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-black text-white disabled:bg-neutral-300"
              disabled={deleteState === "saving"}
              onClick={() => void submitDeleteRequest()}
              type="button"
            >
              {deleteState === "saving" ? "Submitting..." : "Delete account"}
            </button>
          </div>
        </div>
      </ModalShell>

      {!hasAnyModalOpen ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto flex max-w-[1080px] items-center gap-2">
            <button
              className="min-h-11 flex-1 rounded-full border border-neutral-200 text-sm font-black text-neutral-700"
              onClick={openCart}
              type="button"
            >
              Cart
            </button>
            <button className="min-h-11 flex-1 rounded-full bg-leaf-600 text-sm font-black text-white" onClick={openCheckout} type="button">
              Checkout
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function MenuRow({
  badge,
  icon,
  label,
  onClick,
}: {
  badge?: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left transition hover:bg-neutral-50"
      onClick={onClick}
      type="button"
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
        {icon}
      </span>
      <span className="flex-1 text-base font-semibold text-neutral-900">{label}</span>
      {badge ? (
        <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">
          {badge}
        </span>
      ) : null}
      <ChevronRight />
    </button>
  );
}

function AccountSubpageHeader({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-[132px] z-10 -mx-4 mb-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-neutral-100 bg-white px-4 py-3 sm:-mx-6 sm:px-6 lg:top-[154px]">
      <button
        className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-base font-semibold text-slate-500 transition hover:bg-neutral-50 hover:text-neutral-950"
        onClick={onBack}
        type="button"
      >
        <BackArrowIcon />
        <span>Back</span>
      </button>
      <h1 className="min-w-0 truncate text-center text-xl font-black text-neutral-950 sm:text-2xl">{title}</h1>
      <span aria-hidden="true" className="h-11 w-[72px]" />
    </div>
  );
}

function SettingsCard({
  description,
  icon,
  onClick,
  title,
}: {
  description: string;
  icon: ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      className="grid w-full gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-left transition hover:bg-neutral-50"
      onClick={onClick}
      type="button"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
        {icon}
      </span>
      <span className="text-lg font-black text-neutral-900">{title}</span>
      <span className="text-sm leading-6 text-neutral-600">{description}</span>
      <span className="text-sm font-black text-leaf-700">More</span>
    </button>
  );
}

function SimplePanel({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <h2 className="text-lg font-black text-neutral-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{subtitle}</p>
    </div>
  );
}

function ToggleRow({ label, onChange, value }: { label: string; onChange: (value: boolean) => void; value: boolean }) {
  return (
    <button
      aria-label={`${label}: ${value ? "on" : "off"}`}
      aria-checked={value}
      className="flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border border-neutral-200 px-4 py-3 text-left transition hover:bg-neutral-50"
      onClick={() => onChange(!value)}
      role="switch"
      type="button"
    >
      <span className="text-base font-semibold text-neutral-800">{label}</span>
      <span className={`relative h-8 w-14 rounded-full transition ${value ? "bg-sky-300" : "bg-neutral-300"}`}>
        <span
          className={`absolute top-1 h-6 w-6 rounded-full transition ${value ? "left-7 bg-sky-500" : "left-1 bg-white"}`}
        />
      </span>
    </button>
  );
}

function PasswordField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="grid gap-1.5">
      <span className="text-base font-bold text-neutral-700">{label}</span>
      <div className="relative">
        <input
          className="min-h-12 w-full rounded-2xl border border-neutral-200 px-4 pr-24 text-base font-semibold outline-none focus:border-leaf-500"
          onChange={(event) => onChange(event.target.value)}
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 min-h-10 -translate-y-1/2 rounded-md px-2 text-base font-bold text-neutral-500"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}

function ModalShell({
  children,
  isOpen,
  onClose,
  title,
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}) {
  const panelReference = useRef<HTMLDivElement | null>(null);
  const firstFocusableReference = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    firstFocusableReference.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelReference.current;
      if (!panel) return;
      const focusableElements = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2200] flex items-end justify-center bg-neutral-950/45 p-3 sm:items-center sm:p-4">
      <button
        aria-label={`Close ${title}`}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        aria-modal="true"
        className="relative max-h-[calc(100dvh-24px)] w-[calc(100vw-24px)] max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)] sm:max-h-[90vh]"
        ref={panelReference}
        role="dialog"
      >
        <div className="sticky top-0 z-10 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-neutral-100 bg-white px-4 py-4 sm:px-5">
          <button
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-base font-semibold text-slate-500 transition hover:bg-neutral-50 hover:text-neutral-950"
            onClick={onClose}
            type="button"
          >
            <BackArrowIcon />
            <span>Back</span>
          </button>
          <h2 className="min-w-0 truncate text-center text-2xl font-black leading-none text-neutral-950 sm:text-[2rem]">{title}</h2>
          <button
            aria-label={`Close ${title}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-2xl text-neutral-600 transition hover:bg-neutral-200"
            onClick={onClose}
            ref={firstFocusableReference}
            type="button"
          >
            X
          </button>
        </div>
        <div className="max-h-[calc(100dvh-112px)] overflow-y-auto px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:max-h-[calc(90vh-84px)] sm:px-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="m3 8 9-5 9 5-9 5-9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="17" r="1.6" />
      <circle cx="17" cy="17" r="1.6" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M5 6h14v9H8l-3 3z" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M8 7 4 11l4 4" />
      <path d="M4 11h9a5 5 0 0 1 5 5v1" />
    </svg>
  );
}

function OrdersRowIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M7 4h10l1 15H6L7 4Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </svg>
  );
}

function SavedIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M6 4h12v16l-6-3-6 3z" />
    </svg>
  );
}

function BuyAgainIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

function AddressBookIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function CouponIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M21 12a2.8 2.8 0 0 1-2.8 2.8H5.8V9.2h12.4A2.8 2.8 0 0 1 21 12Z" />
      <path d="M3 9.2h2.8V14.8H3a2.8 2.8 0 0 0 0-5.6Z" />
      <path d="M12 9.2v5.6" />
    </svg>
  );
}

function GiftRowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 8h16v12H4z" />
      <path d="M2 8h20v4H2z" />
      <path d="M12 8v12" />
    </svg>
  );
}

function CardRowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect height="14" rx="2.5" width="20" x="2" y="5" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  );
}

function SettingsRowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="m19 12 1.6 1-1.6 2.8-1.9-.7a6.8 6.8 0 0 1-1.6.9l-.3 2h-3.2l-.3-2a6.8 6.8 0 0 1-1.6-.9l-1.9.7L3.4 13 5 12l-1.6-1 1.6-2.8 1.9.7c.5-.4 1-.7 1.6-.9l.3-2h3.2l.3 2c.6.2 1.1.5 1.6.9l1.9-.7L20.6 11 19 12Z" />
    </svg>
  );
}

function LanguageRowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M6 9a6 6 0 1 1 12 0v4l1.5 2.2H4.5L6 13V9Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect height="10" rx="2" width="14" x="5" y="10" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M7 7l1 12h8l1-12" />
    </svg>
  );
}
