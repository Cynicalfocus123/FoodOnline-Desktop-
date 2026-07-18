import { FormEvent, type ReactNode, useMemo, useState } from "react";
import { formatPrice, useCatalogProducts } from "../services/catalog";
import { isBackendOrderableProduct } from "../services/catalog/catalogCompatibility";
import {
  normalizeUserEmail,
  sanitizeUserPasswordInput,
  validateUserEmail,
  validateUserLoginPassword,
} from "../lib/security";
import { useHomeStore } from "../store/homeStore";
import { usePublicAuthStore } from "../store/publicAuthStore";
import { PhoneNumberInput } from "./PhoneNumberInput";

const FREE_SHIPPING_THRESHOLD = 49;
const ESTIMATED_SHIPPING = 5.99;
const paymentIconAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const paymentLogos = [
  { label: "Google Pay", src: paymentIconAsset("assets/payment-icons/google-pay.png"), widthClass: "w-[52px] sm:w-[58px]" },
  { label: "PayPal", src: paymentIconAsset("assets/payment-icons/paypal.png"), widthClass: "w-[52px] sm:w-[58px]" },
  { label: "Visa", src: paymentIconAsset("assets/payment-icons/visa.png"), widthClass: "w-[52px] sm:w-[58px]" },
  { label: "Mastercard", src: paymentIconAsset("assets/payment-icons/mastercard.png"), widthClass: "w-[30px] sm:w-[34px]" },
  { label: "Discover", src: paymentIconAsset("assets/payment-icons/discover.png"), widthClass: "w-[52px] sm:w-[58px]" },
  { label: "American Express", src: paymentIconAsset("assets/payment-icons/american-express.png"), widthClass: "w-[64px] sm:w-[72px]" },
  { label: "UnionPay", src: paymentIconAsset("assets/payment-icons/unionpay.png"), widthClass: "w-[42px] sm:w-[48px]" },
  { label: "JCB", src: paymentIconAsset("assets/payment-icons/jcb.png"), widthClass: "w-[30px] sm:w-[34px]" },
  { label: "Diners Club", src: paymentIconAsset("assets/payment-icons/diners-club.png"), widthClass: "w-[28px] sm:w-[30px]" },
  { label: "Secure Pay", src: paymentIconAsset("assets/payment-icons/secure-pay.png"), widthClass: "w-[28px] sm:w-[30px]" },
  { label: "Alipay", src: paymentIconAsset("assets/payment-icons/alipay.png"), widthClass: "w-[28px] sm:w-[30px]" },
  { label: "Cash App", src: paymentIconAsset("assets/payment-icons/cash-app.png"), widthClass: "w-[28px] sm:w-[30px]" },
] as const;

type CartLineItem = {
  lineId: string;
  productId: string;
  quantity: number;
  selected: boolean;
  available: boolean;
};

type CheckoutIdentifierMode = "email" | "phone";
type CheckoutAuthStep = "identifier" | "password" | "otp";

function Checkbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex items-center gap-3 text-sm font-medium text-neutral-800">
      <input
        checked={checked}
        className="h-5 w-5 rounded border-neutral-300 accent-neutral-950"
        onChange={onChange}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  );
}

function MinusIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="m9 7 .6-2h4.8l.6 2" />
      <path d="M8 7v10.3A1.7 1.7 0 0 0 9.7 19h4.6A1.7 1.7 0 0 0 16 17.3V7" />
      <path d="M10 11v4" />
      <path d="M14 11v4" />
    </svg>
  );
}

function ShieldDollarIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-leaf-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      <path d="M12 3 5.5 5.5v6.1c0 4.1 2.7 7.8 6.5 9.4 3.8-1.6 6.5-5.3 6.5-9.4V5.5Z" />
      <path d="M12 8.2v7.2" />
      <path d="M14.6 10.1c0-.8-.7-1.5-1.7-1.5h-1.8c-1 0-1.7.7-1.7 1.5s.6 1.3 1.5 1.5l2.3.5c.9.2 1.5.8 1.5 1.5 0 .8-.7 1.5-1.7 1.5h-1.8c-1 0-1.7-.7-1.7-1.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-leaf-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" />
      <path d="M8.5 10.5V8.3a3.5 3.5 0 0 1 7 0v2.2" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-leaf-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      <path d="M12 3 5.5 5.5v6.1c0 4.1 2.7 7.8 6.5 9.4 3.8-1.6 6.5-5.3 6.5-9.4V5.5Z" />
      <path d="m9.4 12.2 1.9 1.9 3.7-4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-leaf-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      <path d="M3 7.5h11.5v7H3z" />
      <path d="M14.5 10.5h3.9l2.1 2.2v2.8h-6z" />
      <circle cx="7.3" cy="18" r="1.7" />
      <circle cx="17.3" cy="18" r="1.7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function PasswordEyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 4 10 8a11.8 11.8 0 0 1-3 4.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.6 6.6A12.3 12.3 0 0 0 2 12c1 4 5 8 10 8 1.6 0 3.1-.4 4.4-1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function GuaranteeList() {
  const items = [
    { icon: <ShieldDollarIcon />, label: "Global & Secure Payments" },
    { icon: <LockIcon />, label: "Privacy Protection" },
    { icon: <ShieldCheckIcon />, label: "FoodOnlines.com Purchase Protection" },
    { icon: <TruckIcon />, label: "Speedy Delivery" },
  ];

  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li className="flex items-center gap-3 text-sm font-medium text-neutral-900" key={item.label}>
          {item.icon}
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

function PaymentProviderLogos() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-2.5">
      {paymentLogos.map((logo) => (
        <img
          alt={logo.label}
          className={`${logo.widthClass} h-auto object-contain`}
          key={logo.label}
          loading="lazy"
          src={logo.src}
        />
      ))}
    </div>
  );
}

function FreeShippingBar({
  subtotal,
  onAddMore,
}: {
  subtotal: number;
  onAddMore: () => void;
}) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.max(0, Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <span aria-hidden="true">🎉</span>
          <p className="truncate">
            {hasFreeShipping ? "You've got FREE Shipping" : `Add ${formatPrice(remaining)} for FREE Shipping`}
          </p>
        </div>
        <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className={`h-full rounded-full transition-all ${hasFreeShipping ? "bg-leaf-600" : "bg-leaf-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-bold text-white transition hover:bg-neutral-800"
        onClick={onAddMore}
        type="button"
      >
        Add More
      </button>
    </div>
  );
}

function CartQuantityPill({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="grid justify-items-center gap-2">
      <span className="rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-bold text-white">Min.Purchase 2</span>
      <div className="inline-flex min-h-11 min-w-[116px] items-center overflow-hidden rounded-full border border-[#dce5ff] bg-white text-leaf-700 shadow-[0_10px_24px_rgba(37,99,235,0.12)]">
        <button className="inline-flex h-11 w-10 items-center justify-center" onClick={onDecrease} type="button">
          {quantity === 1 ? <TrashIcon /> : <MinusIcon />}
        </button>
        <span className="min-w-[32px] flex-1 text-center text-[15px] font-black tabular-nums">{quantity}</span>
        <button className="inline-flex h-11 w-10 items-center justify-center" onClick={onIncrease} type="button">
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}

function CheckoutAuthModal({
  isOpen,
  isSubmitting,
  error,
  identifier,
  identifierMode,
  otpCode,
  otpMessage,
  password,
  step,
  isPasswordVisible,
  onClose,
  onIdentifierChange,
  onIdentifierModeChange,
  onOtpChange,
  onResendCode,
  onPasswordChange,
  onContinue,
  onBack,
  onTogglePassword,
}: {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  identifier: string;
  identifierMode: CheckoutIdentifierMode;
  otpCode: string;
  otpMessage: string | null;
  password: string;
  step: CheckoutAuthStep;
  isPasswordVisible: boolean;
  onClose: () => void;
  onIdentifierChange: (value: string) => void;
  onIdentifierModeChange: (mode: CheckoutIdentifierMode) => void;
  onOtpChange: (value: string) => void;
  onResendCode: () => void;
  onPasswordChange: (value: string) => void;
  onContinue: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  onTogglePassword: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-neutral-950/45 px-4 py-6">
      <div className="relative w-full max-w-[620px] rounded-[28px] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.24)] sm:p-8">
        <button
          aria-label="Close sign in popup"
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100"
          onClick={onClose}
          type="button"
        >
          <CloseIcon />
        </button>

        <div className="pr-10">
          <h2 className="text-3xl font-black tracking-[-0.03em] text-neutral-950 sm:text-4xl">
            {step === "identifier" ? "Welcome to FoodOnline" : "Welcome Back"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-neutral-600 sm:text-base">
            {step === "identifier"
              ? "Enter your email or phone number to sign in or create an account."
              : identifierMode === "phone"
                ? "Enter the code sent to your phone to continue to checkout."
                : "Enter your password to continue to checkout."}
          </p>
        </div>

        <form className="mt-8 grid gap-4" onSubmit={onContinue}>
          {step === "identifier" ? (
            <div className="grid gap-3">
              <div className="inline-grid grid-cols-2 rounded-2xl bg-neutral-100 p-1 text-sm font-black text-neutral-600">
                {(["email", "phone"] as const).map((mode) => (
                  <button
                    className={`min-h-10 rounded-xl px-4 transition ${
                      identifierMode === mode ? "bg-white text-neutral-950 shadow-sm" : "hover:text-neutral-950"
                    }`}
                    key={mode}
                    onClick={() => onIdentifierModeChange(mode)}
                    type="button"
                  >
                    {mode === "email" ? "Email" : "Phone"}
                  </button>
                ))}
              </div>

              {identifierMode === "phone" ? (
                <PhoneNumberInput
                  error={error ?? undefined}
                  id="checkout-login-identifier"
                  label="Phone number"
                  onChange={onIdentifierChange}
                  required
                  value={identifier}
                />
              ) : (
                <label className="grid gap-2" htmlFor="checkout-login-identifier">
                  <span className="text-sm font-bold text-neutral-700">Email address</span>
                  <input
                    autoFocus
                    className="min-h-14 rounded-2xl border border-neutral-300 px-4 text-base font-semibold text-neutral-900 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/15"
                    id="checkout-login-identifier"
                    inputMode="email"
                    onChange={(event) => onIdentifierChange(event.target.value)}
                    placeholder="name@email.com"
                    type="email"
                    value={identifier}
                  />
                </label>
              )}
            </div>
          ) : step === "password" ? (
            <>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Identifier</p>
                  <p className="mt-1 font-semibold text-neutral-900">{identifier}</p>
                </div>
                <button className="text-sm font-bold text-neutral-700 underline underline-offset-4" onClick={onBack} type="button">
                  Edit
                </button>
              </div>

              <label className="grid gap-2" htmlFor="checkout-login-password">
                <span className="text-sm font-bold text-neutral-700">Password</span>
                <div className="relative">
                  <input
                    autoFocus
                    className="min-h-14 w-full rounded-2xl border border-neutral-300 px-4 pr-14 text-base font-semibold text-neutral-900 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/15"
                    id="checkout-login-password"
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder="Password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                  />
                  <button
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100"
                    onClick={onTogglePassword}
                    type="button"
                  >
                    <PasswordEyeIcon visible={isPasswordVisible} />
                  </button>
                </div>
              </label>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Phone number</p>
                  <p className="mt-1 font-semibold text-neutral-900">{identifier}</p>
                </div>
                <button className="text-sm font-bold text-neutral-700 underline underline-offset-4" onClick={onBack} type="button">
                  Edit
                </button>
              </div>

              <label className="grid gap-2" htmlFor="checkout-login-otp">
                <span className="text-sm font-bold text-neutral-700">SMS code</span>
                <input
                  autoComplete="one-time-code"
                  autoFocus
                  className="min-h-14 w-full rounded-2xl border border-neutral-300 px-4 text-base font-semibold text-neutral-900 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/15"
                  id="checkout-login-otp"
                  inputMode="numeric"
                  onChange={(event) => onOtpChange(event.target.value)}
                  placeholder="Enter any code"
                  type="text"
                  value={otpCode}
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button className="text-sm font-bold text-neutral-700 underline underline-offset-4" onClick={onResendCode} type="button">
                  Resend code
                </button>
                {otpMessage ? <p className="text-sm font-medium text-neutral-500">{otpMessage}</p> : null}
              </div>
            </>
          )}

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          <button
            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-leaf-600 px-6 text-base font-black text-white transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            disabled={isSubmitting}
            type="submit"
          >
            {step === "identifier"
              ? "Continue"
              : step === "otp"
                ? isSubmitting
                  ? "Verifying..."
                  : "Verify Code"
                : isSubmitting
                  ? "Signing In..."
                  : "Continue to Checkout"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SummaryPanel({
  itemCount,
  subtotal,
  shipping,
  total,
  couponCode,
  onCouponChange,
  onApplyCoupon,
}: {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  couponCode: string;
  onCouponChange: (value: string) => void;
  onApplyCoupon: () => void;
}) {
  return (
    <div className="grid gap-5 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-6 lg:sticky lg:top-[176px]">
      <div className="grid gap-3">
        <h2 className="text-2xl font-black text-neutral-950">Coupons</h2>
        <div className="flex gap-3">
          <input
            className="min-h-12 flex-1 rounded-2xl border border-neutral-200 px-4 text-sm font-medium text-neutral-900 outline-none ring-2 ring-transparent transition focus:border-leaf-500 focus:ring-leaf-500/15"
            onChange={(event) => onCouponChange(event.target.value)}
            placeholder="Coupon code"
            type="text"
            value={couponCode}
          />
          <button className="min-h-12 shrink-0 rounded-2xl px-1 text-sm font-bold text-neutral-900 underline underline-offset-4" onClick={onApplyCoupon} type="button">
            Apply
          </button>
        </div>
        <p className="text-sm leading-6 text-neutral-500">No coupons that apply to the items in your cart.</p>
      </div>

      <div className="border-t border-neutral-200 pt-5">
        <h2 className="text-2xl font-black text-neutral-950">Order Summary</h2>
        <div className="mt-4 grid gap-3 text-sm text-neutral-700">
          <div className="flex items-center justify-between gap-3">
            <span>Subtotal</span>
            <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>{itemCount} items selected</span>
            <span className="font-semibold text-neutral-900">{itemCount ? itemCount : 0}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Estimated Shipping</span>
            <span className="font-semibold text-neutral-900">{shipping <= 0 ? "FREE" : formatPrice(shipping)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Tax</span>
            <span className="font-semibold text-neutral-900">Calculated in Checkout</span>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-900 pt-5">
        <div className="flex items-end justify-between gap-3">
          <span className="text-sm font-semibold text-neutral-700">Est. Total</span>
          <span className="text-[2.2rem] font-black leading-none tracking-[-0.04em] text-neutral-950">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="grid gap-4 border-t border-neutral-200 pt-4">
        <div className="grid gap-2">
          <h3 className="text-lg font-black text-neutral-950">Service Guarantee</h3>
          <p className="text-sm leading-6 text-neutral-500">Secure payments with encryption and trusted partners.</p>
        </div>
        <PaymentProviderLogos />
        <GuaranteeList />
      </div>

    </div>
  );
}

export function CartPage() {
  const cartQuantities = useHomeStore((state) => state.cartQuantities);
  const cartLineProductIds = useHomeStore((state) => state.cartLineProductIds);
  const cartLineStatuses = useHomeStore((state) => state.cartLineStatuses);
  const cartItemIds = useHomeStore((state) => state.cartItemIds);
  const cartSyncStatus = useHomeStore((state) => state.cartSyncStatus);
  const cartSyncMessage = useHomeStore((state) => state.cartSyncMessage);
  const selectedCartIds = useHomeStore((state) => state.selectedCartIds);
  const savedForLaterIds = useHomeStore((state) => state.savedForLaterIds);
  const savedLineProductIds = useHomeStore((state) => state.savedLineProductIds);
  const backToHome = useHomeStore((state) => state.backToHome);
  const openCheckout = useHomeStore((state) => state.openCheckout);
  const setCartQuantity = useHomeStore((state) => state.setCartQuantity);
  const removeFromCart = useHomeStore((state) => state.removeFromCart);
  const saveForLater = useHomeStore((state) => state.saveForLater);
  const moveSavedToCart = useHomeStore((state) => state.moveSavedToCart);
  const toggleCartSelection = useHomeStore((state) => state.toggleCartSelection);
  const setAllCartSelections = useHomeStore((state) => state.setAllCartSelections);
  const currentUser = usePublicAuthStore((state) => state.currentUser);
  const completeMockPhoneOtpLogin = usePublicAuthStore((state) => state.completeMockPhoneOtpLogin);
  const checkoutLoginWithIdentifier = usePublicAuthStore((state) => state.checkoutLoginWithIdentifier);
  const isSubmittingLogin = usePublicAuthStore((state) => state.isSubmittingLogin);
  const catalogIds = useMemo(() => [...Object.values(cartLineProductIds), ...Object.values(savedLineProductIds)], [cartLineProductIds, savedLineProductIds]);
  const { products: catalogProducts, isLoading: isCatalogLoading, error: catalogError } = useCatalogProducts(catalogIds);

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isCheckoutAuthOpen, setIsCheckoutAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState<CheckoutAuthStep>("identifier");
  const [identifierMode, setIdentifierMode] = useState<CheckoutIdentifierMode>("email");
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const activeItems = useMemo<CartLineItem[]>(
    () =>
      Object.entries(cartQuantities).map(([lineId, quantity]) => ({
        lineId,
        productId: cartLineProductIds[lineId] ?? lineId,
        quantity,
        selected: selectedCartIds.includes(lineId),
        available: cartLineStatuses[lineId]?.available ?? true,
      })),
    [cartLineProductIds, cartLineStatuses, cartQuantities, selectedCartIds],
  );

  const savedProducts = useMemo(
    () => savedForLaterIds.map((lineId) => ({ lineId, product: catalogProducts.get(savedLineProductIds[lineId] ?? lineId) })).filter((item): item is { lineId: string; product: NonNullable<typeof item.product> } => Boolean(item.product)),
    [catalogProducts, savedForLaterIds, savedLineProductIds],
  );

  const selectedItems = activeItems.filter((item) => {
    const product = catalogProducts.get(item.productId);
    return item.selected && item.available && isBackendOrderableProduct(product) && Boolean(cartItemIds[item.lineId]);
  });
  const compatibilityItems = activeItems.filter((item) => catalogProducts.get(item.productId)?.compatibilityOnly);
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + (catalogProducts.get(item.productId)?.price ?? 0) * item.quantity, 0);
  const selectedItemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = selectedSubtotal > 0 && selectedSubtotal < FREE_SHIPPING_THRESHOLD ? ESTIMATED_SHIPPING : 0;
  const estimatedTotal = selectedSubtotal + shippingCost;
  const selectableItems = activeItems.filter((item) => item.available && isBackendOrderableProduct(catalogProducts.get(item.productId)));
  const allSelected = selectableItems.length > 0 && selectableItems.every((item) => item.selected);
  const hasActiveItems = activeItems.length > 0;

  function resetAuthModal() {
    setAuthStep("identifier");
    setIdentifierMode("email");
    setIdentifier("");
    setOtpCode("");
    setOtpMessage(null);
    setPassword("");
    setAuthError(null);
    setIsPasswordVisible(false);
  }

  function openCheckoutFlow() {
    if (!selectedItems.length) {
      return;
    }

    if (currentUser) {
      openCheckout();
      return;
    }

    setIsCheckoutAuthOpen(true);
  }

  function closeCheckoutModal() {
    setIsCheckoutAuthOpen(false);
    resetAuthModal();
  }

  function isValidIdentifier(value: string) {
    if (identifierMode === "phone") {
      return value.replace(/\D/g, "").length >= 7;
    }

    return validateUserEmail(normalizeUserEmail(value));
  }

  async function handleCheckoutAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authStep === "identifier") {
      if (!isValidIdentifier(identifier.trim())) {
        setAuthError(identifierMode === "phone" ? "Enter a valid phone number." : "Enter a valid email address.");
        return;
      }

      setAuthError(null);
      if (identifierMode === "phone") {
        setOtpCode("");
        setOtpMessage("Enter the code sent to your phone.");
        setAuthStep("otp");
        return;
      }

      setAuthStep("password");
      return;
    }

    if (authStep === "otp") {
      if (!otpCode.trim()) {
        setAuthError("Code is required.");
        return;
      }

      setAuthError(null);
      const success = await completeMockPhoneOtpLogin(identifier.trim());
      if (success) {
        closeCheckoutModal();
        openCheckout();
        return;
      }

      setAuthError("Invalid verification code.");
      return;
    }

    const cleanedPassword = sanitizeUserPasswordInput(password, true);
    if (!validateUserLoginPassword(cleanedPassword)) {
      setAuthError("Enter your password.");
      return;
    }

    setAuthError(null);
    const success = await checkoutLoginWithIdentifier(identifier.trim(), cleanedPassword);
    if (success) {
      closeCheckoutModal();
      openCheckout();
      return;
    }

    setAuthError("Unable to sign in right now.");
  }

  function handleApplyCoupon() {
    setCouponMessage("Coupons are validated securely at checkout.");
  }

  return (
    <>
      <section className="bg-[#fcfcfd] px-4 pb-[calc(150px+env(safe-area-inset-bottom))] pt-[132px] sm:px-6 sm:pt-[146px] lg:pt-[154px]">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-6 flex flex-col gap-3">
            <h1 className="text-3xl font-black tracking-[-0.03em] text-neutral-950 sm:text-4xl">Your Cart</h1>
            <p className="text-sm leading-6 text-neutral-500">FoodOnlines.com cart, secure checkout, and account-ready saved items.</p>
          </div>

          {cartSyncStatus === "loading" || cartSyncMessage ? (
            <p className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${cartSyncStatus === "error" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-100 bg-emerald-50 text-emerald-800"}`} role="status">
              {cartSyncMessage ?? "Refreshing your cart..."}
            </p>
          ) : null}
          {compatibilityItems.length ? (
            <p className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800" role="status">
              {compatibilityItems.length === 1 ? "This item is" : "These items are"} still being synchronized with our catalog and cannot be ordered yet. You can keep, remove, or save {compatibilityItems.length === 1 ? "it" : "them"} for later.
            </p>
          ) : null}

          {!hasActiveItems ? (
            <div className="grid gap-6 rounded-[28px] border border-neutral-200 bg-white p-8 text-center shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <h2 className="text-2xl font-black text-neutral-950">Your cart is empty</h2>
              <p className="text-sm leading-7 text-neutral-500">Add groceries, snacks, drinks, and essentials to start your order.</p>
              <div className="flex justify-center">
                <button
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-leaf-600 px-6 text-sm font-black text-white transition hover:bg-leaf-700"
                  onClick={backToHome}
                  type="button"
                >
                  Start Shopping
                </button>
              </div>

              {savedProducts.length ? (
                <div className="grid gap-4 border-t border-neutral-200 pt-6 text-left">
                  <h3 className="text-xl font-black text-neutral-950">Saved for later</h3>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {savedProducts.map(({ lineId, product }) => (
                      <div className="grid gap-3 rounded-[22px] border border-neutral-200 p-4" key={lineId}>
                        <div className="flex items-center gap-3">
                          <img alt={product.name} className="h-16 w-16 rounded-2xl bg-neutral-50 object-contain" src={product.image} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 line-clamp-2">{product.name}</p>
                            <p className="mt-1 text-sm font-black text-neutral-950">{formatPrice(product.price)}</p>
                          </div>
                        </div>
                        <button
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-leaf-500 px-4 text-sm font-black text-leaf-600 transition hover:bg-leaf-50"
                          onClick={() => moveSavedToCart(lineId)}
                          type="button"
                        >
                          Move to cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid gap-5">
                <div className="grid gap-3 rounded-[22px] border border-neutral-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:px-5">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <Checkbox
                      checked={allSelected}
                      label={`All (${selectedItemCount} items selected)`}
                      onChange={() => setAllCartSelections(selectableItems.map((item) => item.lineId), !allSelected)}
                    />
                    <div className="flex flex-col gap-2 lg:min-w-[52%]">
                      <p className="text-sm font-medium text-neutral-500">Fulfilled by FoodOnline</p>
                      <FreeShippingBar onAddMore={backToHome} subtotal={selectedSubtotal} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-6">
                  {activeItems.map((item, index) => {
                    const product = catalogProducts.get(item.productId);

                    if (!product) {
                      return (
                        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-5" key={item.lineId}>
                          <p className="text-sm font-semibold text-neutral-600">This catalog item is temporarily unavailable.</p>
                          <button className="text-sm font-bold text-rose-700 underline" onClick={() => removeFromCart(item.lineId)} type="button">Remove</button>
                        </div>
                      );
                    }

                    return (
                      <div
                        className={`grid gap-4 ${index < activeItems.length - 1 ? "border-b border-neutral-200 pb-5" : ""} lg:grid-cols-[24px_110px_minmax(0,1fr)_96px_120px] lg:items-start`}
                        key={item.lineId}
                      >
                        <div className="pt-1">
                          <input
                            checked={item.selected}
                            className="h-5 w-5 rounded border-neutral-300 accent-neutral-950"
                            onChange={() => toggleCartSelection(item.lineId)}
                            type="checkbox"
                          />
                        </div>

                        <img
                          alt={product.name}
                          className="h-24 w-24 rounded-[20px] bg-neutral-50 object-contain sm:h-28 sm:w-28"
                          loading="lazy"
                          src={product.image}
                        />

                        <div className="grid gap-3">
                          <div className="grid gap-1">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">Fulfilled by FoodOnline</p>
                            <h2 className="text-base font-semibold leading-7 text-neutral-950 sm:text-lg">{product.name}</h2>
                          <p className="text-sm text-neutral-500">Specification: {product.quantity}</p>
                          {!item.available ? <p className="text-sm font-bold text-amber-700">Currently unavailable at this quantity. Remove it or reduce the quantity.</p> : null}
                          {product.compatibilityOnly ? <p className="text-sm font-bold text-amber-700">This item is still being synchronized with our catalog and cannot be ordered yet.</p> : null}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#2563eb]">
                            <button className="underline underline-offset-4" onClick={() => saveForLater(item.lineId)} type="button">
                              Save for later
                            </button>
                            <button className="underline underline-offset-4" onClick={() => removeFromCart(item.lineId)} type="button">
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <CartQuantityPill
                            onDecrease={() => setCartQuantity(item.lineId, item.quantity - 1)}
                            onIncrease={() => setCartQuantity(item.lineId, item.quantity + 1)}
                            quantity={item.quantity}
                          />
                        </div>

                        <div className="grid justify-start gap-1 text-left lg:justify-end lg:text-right">
                          {product.oldPrice ? (
                            <span className="text-sm font-semibold text-neutral-400 line-through">
                              {formatPrice(product.oldPrice * item.quantity)}
                            </span>
                          ) : null}
                          <span className="text-[1.65rem] font-black leading-none text-[#e11d48]">
                            {formatPrice(product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-3 border-t border-neutral-200 pt-4 text-sm font-medium text-neutral-700">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-lg text-emerald-600">🎁</span>
                    <span>Gifting option available</span>
                  </div>
                </div>

                {savedProducts.length ? (
                  <div className="grid gap-4 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-2xl font-black text-neutral-950">Saved for later</h2>
                      <p className="text-sm font-medium text-neutral-500">{savedProducts.length} items</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {savedProducts.map(({ lineId, product }) => (
                        <div className="grid gap-3 rounded-[22px] border border-neutral-200 p-4" key={lineId}>
                          <div className="flex items-center gap-3">
                            <img alt={product.name} className="h-20 w-20 rounded-[18px] bg-neutral-50 object-contain" src={product.image} />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-neutral-900 line-clamp-2">{product.name}</p>
                              <p className="mt-1 text-sm text-neutral-500">{product.quantity}</p>
                              <p className="mt-2 text-base font-black text-neutral-950">{formatPrice(product.price)}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-leaf-500 px-4 text-sm font-black text-leaf-600 transition hover:bg-leaf-50"
                              onClick={() => moveSavedToCart(lineId)}
                              type="button"
                            >
                              Move to cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

              </div>

              <SummaryPanel
                couponCode={couponCode}
                itemCount={selectedItemCount}
                onApplyCoupon={handleApplyCoupon}
                onCouponChange={setCouponCode}
                shipping={shippingCost}
                subtotal={selectedSubtotal}
                total={estimatedTotal}
              />
            </div>
          )}

          {couponMessage ? (
            <p className="mt-4 text-sm font-medium text-neutral-500">{couponMessage}</p>
          ) : null}
        </div>
      </section>

      {hasActiveItems ? (
        <div className="fixed inset-x-0 bottom-0 z-[1100] border-t border-neutral-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-12px_36px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1480px] items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{selectedItemCount} items selected</p>
              <p className="text-xl font-black text-neutral-950">{formatPrice(estimatedTotal)}</p>
            </div>
            <button
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-leaf-600 px-5 text-sm font-black text-white transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
              disabled={!selectedItems.length}
              onClick={openCheckoutFlow}
              type="button"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      ) : null}

      <CheckoutAuthModal
        error={authError}
        identifier={identifier}
        isOpen={isCheckoutAuthOpen}
        isPasswordVisible={isPasswordVisible}
        isSubmitting={isSubmittingLogin}
        otpCode={otpCode}
        otpMessage={otpMessage}
        onBack={() => {
          setAuthStep("identifier");
          setOtpCode("");
          setOtpMessage(null);
          setPassword("");
          setAuthError(null);
        }}
        onClose={closeCheckoutModal}
        onContinue={handleCheckoutAuthSubmit}
        onIdentifierChange={(value) => {
          setIdentifier(value);
          setAuthError(null);
        }}
        onIdentifierModeChange={(mode) => {
          setIdentifierMode(mode);
          setIdentifier("");
          setOtpCode("");
          setOtpMessage(null);
          setPassword("");
          setAuthError(null);
        }}
        onOtpChange={(value) => {
          setOtpCode(value);
          setAuthError(null);
        }}
        onResendCode={() => {
          setOtpMessage("Code sent again.");
          setAuthError(null);
        }}
        onPasswordChange={(value) => {
          setPassword(value);
          setAuthError(null);
        }}
        onTogglePassword={() => setIsPasswordVisible((current) => !current)}
        password={password}
        identifierMode={identifierMode}
        step={authStep}
      />
    </>
  );
}
