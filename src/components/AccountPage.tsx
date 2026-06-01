import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
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

const deleteReasons = [
  { key: "bad_experience", label: "Bad experience with FoodOnlines" },
  { key: "too_expensive", label: "It’s too expensive" },
  { key: "notifications", label: "Notifications" },
  { key: "no_longer_need_account", label: "No longer need account" },
  { key: "no_longer_support_company", label: "No longer support company" },
  { key: "prefer_not_to_say", label: "Prefer not to say" },
  { key: "other", label: "Other" },
] as const;

const statusShortcuts = [
  { key: "pending", label: "Pending" },
  { key: "unshipped", label: "Unshipped" },
  { key: "shipped", label: "Shipped" },
  { key: "toReview", label: "To Review" },
  { key: "returns", label: "Returns" },
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

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }
  return fallback;
}

function detectBrand(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  if (/^4/.test(digits)) {
    return "Visa";
  }
  if (/^(5[1-5]|2[2-7])/.test(digits)) {
    return "Mastercard";
  }
  if (/^3[47]/.test(digits)) {
    return "American Express";
  }
  if (/^6(?:011|5)/.test(digits)) {
    return "Discover";
  }
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
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

function routeTitle(section: AccountSection) {
  if (section === "orders") return "My orders";
  if (section === "saved") return "Saved items";
  if (section === "refer") return "Refer a friend";
  if (section === "coupon") return "Coupon";
  if (section === "settings") return "Settings";
  return "My account";
}

export function AccountPage() {
  const accountSection = useHomeStore((state) => state.accountSection);
  const openAccount = useHomeStore((state) => state.openAccount);
  const openCheckout = useHomeStore((state) => state.openCheckout);
  const openCart = useHomeStore((state) => state.openCart);
  const currentUser = usePublicAuthStore((state) => state.currentUser);
  const token = usePublicAuthStore((state) => state.token);
  const openLogin = useHomeStore((state) => state.openLogin);

  const logoutUser = usePublicAuthStore((state) => state.logoutUser);
  const backToHome = useHomeStore((state) => state.backToHome);

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
  const [deleteReason, setDeleteReason] = useState<string>("");
  const [deleteOtherReason, setDeleteOtherReason] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteState, setDeleteState] = useState<SaveState>("idle");

  const activeAddressConfig = useMemo(() => addressConfigs[addressCountry], [addressCountry]);
  const activeBillingConfig = useMemo(() => addressConfigs[billingCountry], [billingCountry]);

  useEffect(() => {
    if (!currentUser || !token) {
      return;
    }

    void loadAddresses(token);
    void loadPaymentMethods(token);
    void loadPreferences(token);
  }, [currentUser, token]);

  if (!currentUser) {
    return (
      <section className="bg-neutral-50 px-4 pb-16 pt-[140px] sm:px-6 sm:pt-[154px] lg:pt-[162px]">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
          <h1 className="text-3xl font-black text-neutral-950">Account</h1>
          <p className="mt-3 text-sm leading-7 text-neutral-600">Please sign in to view your account details.</p>
          <button
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-leaf-600 px-6 text-sm font-black text-white transition hover:bg-leaf-700"
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
      setAddresses(response.addresses ?? []);
    } catch {
      setAddresses([]);
    }
  }

  async function loadPaymentMethods(nextToken: string) {
    try {
      const response = await apiRequest<{ payment_methods: PaymentMethod[] }>("/account/payment-methods", { token: nextToken });
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
      setPreferences(response.preferences ?? defaultPreferences);
    } catch {
      setPreferences(defaultPreferences);
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
    setAddressValues((current) => ({
      ...current,
      [field.key]: value,
    }));

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

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !validateAddressForm()) {
      return;
    }

    setAddressState("saving");
    setAddressMessage(null);

    try {
      const payload = {
        country_key: addressCountry,
        address_values: addressValues,
        summary: createAddressSummary(addressCountry, addressValues),
        is_default: addressSaveAsDefault,
      };

      if (editingAddressId) {
        await apiRequest(`/account/addresses/${editingAddressId}`, {
          method: "PUT",
          token,
          body: payload,
        });
      } else if (saveAddressForFuture) {
        await apiRequest("/account/addresses", {
          method: "POST",
          token,
          body: payload,
        });
      }

      await loadAddresses(token);
      setAddressMode("list");
      setAddressMessage("Address saved.");
    } catch (error) {
      setAddressMessage(toErrorMessage(error, "Unable to save address."));
    } finally {
      setAddressState("idle");
    }
  }

  async function removeAddress(addressId: number) {
    if (!token) return;
    try {
      await apiRequest(`/account/addresses/${addressId}`, {
        method: "DELETE",
        token,
      });
      await loadAddresses(token);
    } catch {
      setAddressMessage("Unable to remove address.");
    }
  }

  async function makeDefaultAddress(addressId: number) {
    if (!token) return;
    try {
      await apiRequest(`/account/addresses/${addressId}/default`, {
        method: "PUT",
        token,
      });
      await loadAddresses(token);
    } catch {
      setAddressMessage("Unable to set default address.");
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

    if (!billingSameAsShipping) {
      Object.assign(errors, validateAddress(billingValues, activeBillingConfig));
    }

    setBillingErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function saveCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !validateCardForm()) {
      return;
    }

    setPaymentState("saving");
    setPaymentMessage(null);

    try {
      const digits = cardNumber.replace(/\D/g, "");
      const expiryDigits = expiryDate.replace(/\D/g, "");
      const month = Number(expiryDigits.slice(0, 2));
      const year = Number(`20${expiryDigits.slice(2, 4)}`);

      await apiRequest("/account/payment-methods", {
        method: "POST",
        token,
        body: {
          provider: null,
          brand: detectBrand(cardNumber),
          last4: digits.slice(-4),
          expiry_month: month,
          expiry_year: year,
          token_reference: null, // TODO: replace with real provider token when tokenization flow is connected.
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
      await apiRequest(`/account/payment-methods/${methodId}`, {
        method: "DELETE",
        token,
      });
      await loadPaymentMethods(token);
    } catch {
      setPaymentMessage("Unable to remove payment method.");
    }
  }

  async function setDefaultPaymentMethod(methodId: number) {
    if (!token) return;
    try {
      await apiRequest(`/account/payment-methods/${methodId}/default`, {
        method: "PUT",
        token,
      });
      await loadPaymentMethods(token);
    } catch {
      setPaymentMessage("Unable to set default payment method.");
    }
  }

  async function updatePreference<K extends keyof NotificationPreferences>(key: K, value: boolean) {
    if (!token) {
      return;
    }

    const next = {
      ...preferences,
      [key]: value,
    };
    setPreferences(next);
    setNotificationState("saving");
    setNotificationMessage(null);

    try {
      await apiRequest("/account/notification-preferences", {
        method: "PUT",
        token,
        body: next,
      });
      setNotificationMessage("Notification preferences saved.");
    } catch (error) {
      setNotificationMessage(toErrorMessage(error, "Unable to save notification preferences."));
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
    if (newPassword !== confirmPassword) return setPasswordError("New passwords do not match.");

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
        body: {
          reason: deleteReason,
          other_reason: deleteReason === "other" ? deleteOtherReason.trim() : null,
        },
      });
      setDeleteMessage(response.message);
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
        <div className="mx-auto max-w-[1280px]">
          <div className="rounded-[20px] border border-neutral-200 bg-white p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-500">Hello</p>
                <h1 className="text-3xl font-black text-neutral-950">{routeTitle(accountSection)}</h1>
              </div>
              <button
                className="inline-flex min-h-11 items-center rounded-xl border border-neutral-200 px-4 text-sm font-bold text-neutral-700 transition hover:border-neutral-300"
                onClick={() => void logoutUser()}
                type="button"
              >
                Logout
              </button>
            </div>

            {accountSection === "overview" ? (
              <div className="mt-6 grid gap-4">
                <button
                  className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 px-4 py-4 text-left transition hover:bg-neutral-50"
                  onClick={() => openAccount("orders")}
                  type="button"
                >
                  <span className="text-lg font-black text-neutral-950">My orders</span>
                  <span className="text-xl text-neutral-400">›</span>
                </button>

                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {statusShortcuts.map((item) => (
                    <button
                      className={`rounded-2xl border px-2 py-3 text-center text-xs font-bold transition sm:text-sm ${
                        statusFilter === item.key ? "border-leaf-500 bg-emerald-50 text-leaf-700" : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                      key={item.key}
                      onClick={() => {
                        setStatusFilter(item.key);
                        openAccount("orders");
                      }}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <MenuRow label="Saved items" onClick={() => openAccount("saved")} />
                <MenuRow label="Refer a friend" onClick={() => openAccount("refer")} />
                <MenuRow badge={couponCount > 0 ? String(couponCount) : undefined} label="Coupon" onClick={() => openAccount("coupon")} />
                <MenuRow label="Settings" onClick={() => openAccount("settings")} />
              </div>
            ) : null}

            {accountSection === "orders" ? (
              <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-black text-neutral-900">Order status: {statusShortcuts.find((item) => item.key === statusFilter)?.label ?? "Pending"}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Order filters are ready. Orders route can connect to live order history endpoint when available.
                </p>
              </div>
            ) : null}

            {accountSection === "saved" ? (
              <SimplePanel title="Saved items" subtitle="Saved-item integration is ready for your existing wishlist endpoint." />
            ) : null}

            {accountSection === "refer" ? (
              <SimplePanel title="Refer a friend" subtitle="Referral route is ready for your existing referral program endpoint." />
            ) : null}

            {accountSection === "coupon" ? (
              <SimplePanel title="Coupon" subtitle="Coupon view is ready for coupon-list endpoint and redemption history." />
            ) : null}

            {accountSection === "settings" ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <SettingsCard description="Manage your saved shipping addresses and defaults." title="Address book" onClick={() => setIsAddressModalOpen(true)} />
                <SettingsCard description="Manage saved cards and default payment method." title="Payment methods" onClick={() => setIsPaymentModalOpen(true)} />
                <SettingsCard description="Choose email, SMS, push, and order update preferences." title="Notifications" onClick={() => setIsNotificationsOpen(true)} />
                <SettingsCard description="Update your account password securely." title="Change password" onClick={() => setIsPasswordOpen(true)} />
                <SettingsCard description="Submit an account deletion request with a reason." title="Delete account" onClick={() => setIsDeleteOpen(true)} />
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
                  <div className="rounded-2xl border border-neutral-200 p-4" key={address.id}>
                    <p className="text-sm font-black text-neutral-950">{address.address_values.fullName || "Saved address"}</p>
                    <p className="mt-1 text-sm text-neutral-600">{address.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-bold" onClick={() => openEditAddressForm(address)} type="button">
                        Edit
                      </button>
                      <button className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-bold" onClick={() => void removeAddress(address.id)} type="button">
                        Delete
                      </button>
                      {!address.is_default ? (
                        <button className="rounded-xl border border-leaf-500 px-3 py-2 text-xs font-bold text-leaf-700" onClick={() => void makeDefaultAddress(address.id)} type="button">
                          Set default
                        </button>
                      ) : (
                        <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-leaf-700">Default</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-600">No saved addresses yet.</p>
            )}
            {addressMessage ? <p className="text-sm font-semibold text-neutral-700">{addressMessage}</p> : null}
            <button className="inline-flex min-h-11 items-center justify-center rounded-xl border border-leaf-500 px-4 text-sm font-black text-leaf-700" onClick={openAddAddressForm} type="button">
              Add new address
            </button>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={saveAddress}>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-neutral-700">Country</span>
              <select
                className="min-h-11 rounded-xl border border-neutral-200 px-3 text-sm font-semibold outline-none ring-2 ring-transparent focus:border-leaf-500 focus:ring-leaf-500/15"
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
                        className="min-h-[92px] rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold outline-none ring-2 ring-transparent focus:border-leaf-500 focus:ring-leaf-500/15"
                        onBlur={() => {
                          setAddressTouched((current) => ({ ...current, [field.key]: true }));
                          setAddressErrors((current) => ({ ...current, [field.key]: getAddressError(field, addressValues[field.key] ?? "") }));
                        }}
                        onChange={(event) => handleAddressValueChange(field, event.target.value)}
                        value={addressValues[field.key] ?? ""}
                      />
                    ) : (
                      <input
                        className="min-h-11 rounded-xl border border-neutral-200 px-3 text-sm font-semibold outline-none ring-2 ring-transparent focus:border-leaf-500 focus:ring-leaf-500/15"
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
              <input checked={saveAddressForFuture} className="h-4 w-4 accent-leaf-600" onChange={(event) => setSaveAddressForFuture(event.target.checked)} type="checkbox" />
              Save this address for future orders
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <input checked={addressSaveAsDefault} className="h-4 w-4 accent-leaf-600" onChange={(event) => setAddressSaveAsDefault(event.target.checked)} type="checkbox" />
              Set as default address
            </label>

            <div className="flex flex-wrap justify-end gap-2">
              <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-neutral-700" onClick={() => setAddressMode("list")} type="button">
                Cancel
              </button>
              <button className="rounded-xl bg-leaf-600 px-4 py-2 text-sm font-black text-white disabled:bg-neutral-300" disabled={addressState === "saving"} type="submit">
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
                      <button className="rounded-xl border border-leaf-500 px-3 py-2 text-xs font-bold text-leaf-700" onClick={() => void setDefaultPaymentMethod(method.id)} type="button">
                        Set default
                      </button>
                    ) : (
                      <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-leaf-700">Default</span>
                    )}
                    <button className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-bold" onClick={() => void removePaymentMethod(method.id)} type="button">
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
            <button className="inline-flex min-h-11 items-center justify-center rounded-xl border border-leaf-500 px-4 text-sm font-black text-leaf-700" onClick={() => setIsAddCardOpen(true)} type="button">
              Add new card
            </button>
          ) : (
            <form className="grid gap-3 rounded-2xl border border-neutral-200 p-4" onSubmit={saveCard}>
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-neutral-700">Cardholder name</span>
                <input className="min-h-11 rounded-xl border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-leaf-500" onChange={(event) => setCardholderName(event.target.value)} value={cardholderName} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-neutral-700">Card number</span>
                <input className="min-h-11 rounded-xl border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-leaf-500" inputMode="numeric" onChange={(event) => setCardNumber(formatCardNumber(event.target.value))} value={cardNumber} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-neutral-700">Expiration date</span>
                  <input className="min-h-11 rounded-xl border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-leaf-500" inputMode="numeric" onChange={(event) => setExpiryDate(formatExpiryDate(event.target.value))} placeholder="MM/YY" value={expiryDate} />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-bold text-neutral-700">CVV</span>
                  <input className="min-h-11 rounded-xl border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-leaf-500" inputMode="numeric" onChange={(event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))} type="password" value={cvv} />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <input checked={billingSameAsShipping} className="h-4 w-4 accent-leaf-600" onChange={(event) => setBillingSameAsShipping(event.target.checked)} type="checkbox" />
                Billing address same as shipping address
              </label>

              {!billingSameAsShipping ? (
                <div className="grid gap-3 rounded-xl border border-neutral-200 p-3">
                  <label className="grid gap-1.5">
                    <span className="text-sm font-bold text-neutral-700">Country</span>
                    <select
                      className="min-h-11 rounded-xl border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-leaf-500"
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
                        <input
                          className="min-h-10 rounded-xl border border-neutral-200 px-3 text-sm font-semibold outline-none focus:border-leaf-500"
                          inputMode={field.type === "postal" ? "numeric" : field.inputMode}
                          onChange={(event) =>
                            setBillingValues((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                          type={field.type === "tel" ? "tel" : "text"}
                          value={billingValues[field.key] ?? ""}
                        />
                        {billingErrors[field.key] ? <span className="text-xs font-semibold text-red-600">{billingErrors[field.key]}</span> : null}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-neutral-700" onClick={() => setIsAddCardOpen(false)} type="button">
                  Cancel
                </button>
                <button className="rounded-xl bg-leaf-600 px-4 py-2 text-sm font-black text-white disabled:bg-neutral-300" disabled={paymentState === "saving"} type="submit">
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
          <button className="min-h-11 rounded-xl bg-leaf-600 px-4 text-sm font-black text-white disabled:bg-neutral-300" disabled={passwordState === "saving"} type="submit">
            {passwordState === "saving" ? "Saving..." : "Save"}
          </button>
        </form>
      </ModalShell>

      <ModalShell isOpen={isDeleteOpen} title="Request to delete Your account?" onClose={() => setIsDeleteOpen(false)}>
        <div className="grid max-h-[70vh] grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
          <div className="overflow-y-auto pr-1">
            <p className="text-sm leading-6 text-neutral-700">
              You&apos;ll permanently delete your account and will no longer be able to login.
              Once your request is processed, your personal data will be deleted in accordance with applicable law.
            </p>
            <p className="mt-5 text-sm font-black text-neutral-900">Why are you deleting your account? (*Required)</p>
            <div className="mt-3 grid gap-2">
              {deleteReasons.map((reason) => (
                <label className="flex items-start gap-2 text-sm font-semibold text-neutral-700" key={reason.key}>
                  <input checked={deleteReason === reason.key} className="mt-0.5 h-4 w-4 accent-leaf-600" name="delete-reason" onChange={() => setDeleteReason(reason.key)} type="radio" />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>
            {deleteReason === "other" ? (
              <label className="mt-4 grid gap-1.5">
                <span className="text-sm font-bold text-neutral-700">Tell us your reason...</span>
                <textarea className="min-h-[110px] rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold outline-none focus:border-leaf-500" onChange={(event) => setDeleteOtherReason(event.target.value)} value={deleteOtherReason} />
              </label>
            ) : null}
            {deleteError ? <p className="mt-3 text-sm font-semibold text-red-600">{deleteError}</p> : null}
            {deleteMessage ? <p className="mt-3 text-sm font-semibold text-leaf-700">{deleteMessage}</p> : null}
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-neutral-100 pt-3">
            <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-neutral-700" onClick={() => setIsDeleteOpen(false)} type="button">
              Cancel
            </button>
            <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white disabled:bg-neutral-300" disabled={deleteState === "saving"} onClick={() => void submitDeleteRequest()} type="button">
              {deleteState === "saving" ? "Submitting..." : "Delete account"}
            </button>
          </div>
        </div>
      </ModalShell>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex max-w-[1280px] items-center gap-2">
          <button className="min-h-11 flex-1 rounded-xl border border-neutral-200 text-sm font-black text-neutral-700" onClick={openCart} type="button">
            Cart
          </button>
          <button className="min-h-11 flex-1 rounded-xl bg-leaf-600 text-sm font-black text-white" onClick={openCheckout} type="button">
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}

function MenuRow({ label, onClick, badge }: { label: string; onClick: () => void; badge?: string }) {
  return (
    <button className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 text-left transition hover:bg-neutral-50" onClick={onClick} type="button">
      <span className="text-base font-semibold text-neutral-900">{label}</span>
      <span className="flex items-center gap-3">
        {badge ? <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white">{badge}</span> : null}
        <span className="text-xl text-neutral-400">›</span>
      </span>
    </button>
  );
}

function SettingsCard({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <button className="grid w-full gap-1 rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-left transition hover:bg-neutral-50" onClick={onClick} type="button">
      <span className="text-lg font-black text-neutral-900">{title}</span>
      <span className="text-sm leading-6 text-neutral-600">{description}</span>
      <span className="mt-1 text-sm font-black text-leaf-700">More</span>
    </button>
  );
}

function SimplePanel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <h2 className="text-lg font-black text-neutral-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{subtitle}</p>
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3 py-2">
      <span className="text-sm font-semibold text-neutral-800">{label}</span>
      <button
        aria-pressed={value}
        className={`relative h-6 w-11 rounded-full transition ${value ? "bg-sky-300" : "bg-neutral-300"}`}
        onClick={(event) => {
          event.preventDefault();
          onChange(!value);
        }}
        type="button"
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-sky-500 transition ${value ? "left-[22px]" : "left-0.5 bg-white"}`} />
      </button>
    </label>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold text-neutral-700">{label}</span>
      <div className="relative">
        <input className="min-h-11 w-full rounded-xl border border-neutral-200 px-3 pr-12 text-sm font-semibold outline-none focus:border-leaf-500" onChange={(event) => onChange(event.target.value)} type={visible ? "text" : "password"} value={value} />
        <button className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 rounded-md text-neutral-500" onClick={() => setVisible((current) => !current)} type="button">
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
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-neutral-950/45 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[24px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="text-2xl font-black text-neutral-950">{title}</h2>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-600" onClick={onClose} type="button">
            ×
          </button>
        </div>
        <div className="max-h-[calc(92vh-68px)] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
