import { FormEvent, useMemo, useState } from "react";
import { formatPrice, getProductById } from "../data/home";
import {
  normalizeUserEmail,
  sanitizeUserPasswordInput,
  validateUserEmail,
  validateUserLoginPassword,
} from "../lib/security";
import { useHomeStore } from "../store/homeStore";
import { usePublicAuthStore } from "../store/publicAuthStore";

const FREE_SHIPPING_THRESHOLD = 49;
const ESTIMATED_SHIPPING = 5.99;

type CartLineItem = {
  productId: string;
  quantity: number;
  selected: boolean;
};

function logoDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const paymentLogos = [
  {
    name: "Google Pay",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="92" height="30" viewBox="0 0 92 30"><rect fill="transparent" width="92" height="30"/><text x="2" y="21" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#4285F4">G</text><text x="18" y="21" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#202124">Pay</text><circle cx="10" cy="10" r="4" fill="#EA4335"/><circle cx="14" cy="7" r="3" fill="#FBBC05"/><circle cx="14" cy="13" r="3" fill="#34A853"/></svg>`),
  },
  {
    name: "Apple Pay",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="88" height="30" viewBox="0 0 88 30"><text x="2" y="21" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#111">Apple Pay</text></svg>`),
  },
  {
    name: "PayPal",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="86" height="30" viewBox="0 0 86 30"><text x="2" y="21" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#0070ba">Pay</text><text x="31" y="21" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#003087">Pal</text></svg>`),
  },
  {
    name: "Visa",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="30" viewBox="0 0 64 30"><text x="2" y="21" font-family="Arial,sans-serif" font-size="18" font-weight="800" fill="#1a1f71">VISA</text></svg>`),
  },
  {
    name: "Mastercard",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="76" height="30" viewBox="0 0 76 30"><circle cx="28" cy="15" r="8" fill="#eb001b"/><circle cx="40" cy="15" r="8" fill="#f79e1b" fill-opacity="0.88"/></svg>`),
  },
  {
    name: "Discover",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="30" viewBox="0 0 96 30"><text x="2" y="21" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#111">DISC</text><text x="39" y="21" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#f97316">OVER</text></svg>`),
  },
  {
    name: "American Express",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="108" height="30" viewBox="0 0 108 30"><text x="2" y="14" font-family="Arial,sans-serif" font-size="9" font-weight="800" fill="#2563eb">AMERICAN</text><text x="2" y="24" font-family="Arial,sans-serif" font-size="9" font-weight="800" fill="#2563eb">EXPRESS</text></svg>`),
  },
  {
    name: "UnionPay",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="82" height="30" viewBox="0 0 82 30"><rect x="2" y="6" width="20" height="18" rx="5" fill="#e11d48"/><rect x="18" y="6" width="20" height="18" rx="5" fill="#2563eb"/><rect x="34" y="6" width="20" height="18" rx="5" fill="#16a34a"/><text x="59" y="21" font-family="Arial,sans-serif" font-size="8" font-weight="700" fill="#111">UnionPay</text></svg>`),
  },
  {
    name: "JCB",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="58" height="30" viewBox="0 0 58 30"><rect x="2" y="5" width="16" height="20" rx="4" fill="#1d4ed8"/><rect x="14" y="5" width="16" height="20" rx="4" fill="#dc2626"/><rect x="26" y="5" width="16" height="20" rx="4" fill="#16a34a"/><text x="9" y="20" font-family="Arial,sans-serif" font-size="9" font-weight="800" fill="#fff">JCB</text></svg>`),
  },
  {
    name: "Diners Club",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="72" height="30" viewBox="0 0 72 30"><circle cx="16" cy="15" r="10" fill="none" stroke="#2563eb" stroke-width="3"/><path d="M16 6v18" stroke="#2563eb" stroke-width="3"/></svg>`),
  },
  {
    name: "Alipay",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="66" height="30" viewBox="0 0 66 30"><text x="2" y="21" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#0284c7">支付宝</text></svg>`),
  },
  {
    name: "Cash App",
    src: logoDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="72" height="30" viewBox="0 0 72 30"><rect x="2" y="4" width="22" height="22" rx="6" fill="#22c55e"/><text x="9" y="20" font-family="Arial,sans-serif" font-size="14" font-weight="800" fill="#fff">$</text><text x="31" y="20" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#111">Cash App</text></svg>`),
  },
];

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
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      {paymentLogos.map((logo) => (
        <img
          alt={logo.name}
          className="h-6 w-auto object-contain"
          key={logo.name}
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
    <div className="grid gap-3 rounded-[22px] border border-neutral-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <p className="text-sm font-semibold text-neutral-900">
            {hasFreeShipping ? "You've got FREE Shipping" : `Add ${formatPrice(remaining)} for FREE Shipping`}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 sm:min-w-[280px]">
            <div
              className={`h-full rounded-full transition-all ${hasFreeShipping ? "bg-leaf-600" : "bg-leaf-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-neutral-950 px-4 text-sm font-bold text-white transition hover:bg-neutral-800"
          onClick={onAddMore}
          type="button"
        >
          Add More
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
  password,
  step,
  isPasswordVisible,
  onClose,
  onIdentifierChange,
  onPasswordChange,
  onContinue,
  onBack,
  onTogglePassword,
}: {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  identifier: string;
  password: string;
  step: "identifier" | "password";
  isPasswordVisible: boolean;
  onClose: () => void;
  onIdentifierChange: (value: string) => void;
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
              : "Enter your password to continue to checkout."}
          </p>
        </div>

        <form className="mt-8 grid gap-4" onSubmit={onContinue}>
          {step === "identifier" ? (
            <label className="grid gap-2" htmlFor="checkout-login-identifier">
              <span className="text-sm font-bold text-neutral-700">Email or phone number</span>
              <input
                autoFocus
                className="min-h-14 rounded-2xl border border-neutral-300 px-4 text-base font-semibold text-neutral-900 outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/15"
                id="checkout-login-identifier"
                inputMode="email"
                onChange={(event) => onIdentifierChange(event.target.value)}
                placeholder="name@email.com or 917-555-1234"
                type="text"
                value={identifier}
              />
            </label>
          ) : (
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
          )}

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          <button
            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-leaf-600 px-6 text-base font-black text-white transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            disabled={isSubmitting}
            type="submit"
          >
            {step === "identifier" ? "Continue" : isSubmitting ? "Signing In..." : "Continue to Checkout"}
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
  checkoutDisabled,
  checkoutLabel,
  onCheckout,
}: {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  couponCode: string;
  onCouponChange: (value: string) => void;
  onApplyCoupon: () => void;
  checkoutDisabled: boolean;
  checkoutLabel: string;
  onCheckout: () => void;
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

      <div className="grid gap-4 rounded-[22px] border border-neutral-100 bg-neutral-50 p-4">
        <div className="grid gap-2">
          <h3 className="text-lg font-black text-neutral-950">Service Guarantee</h3>
          <p className="text-sm leading-6 text-neutral-500">Secure payments with encryption and trusted partners.</p>
        </div>
        <PaymentProviderLogos />
        <GuaranteeList />
      </div>

      <button
        className="inline-flex min-h-14 items-center justify-center rounded-[22px] bg-leaf-600 px-6 text-base font-black text-white transition hover:bg-leaf-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
        disabled={checkoutDisabled}
        onClick={onCheckout}
        type="button"
      >
        {checkoutLabel}
      </button>
    </div>
  );
}

export function CartPage() {
  const cartQuantities = useHomeStore((state) => state.cartQuantities);
  const selectedCartIds = useHomeStore((state) => state.selectedCartIds);
  const savedForLaterIds = useHomeStore((state) => state.savedForLaterIds);
  const backToHome = useHomeStore((state) => state.backToHome);
  const openCheckout = useHomeStore((state) => state.openCheckout);
  const setCartQuantity = useHomeStore((state) => state.setCartQuantity);
  const removeFromCart = useHomeStore((state) => state.removeFromCart);
  const saveForLater = useHomeStore((state) => state.saveForLater);
  const moveSavedToCart = useHomeStore((state) => state.moveSavedToCart);
  const toggleCartSelection = useHomeStore((state) => state.toggleCartSelection);
  const setAllCartSelections = useHomeStore((state) => state.setAllCartSelections);
  const currentUser = usePublicAuthStore((state) => state.currentUser);
  const checkoutLoginWithIdentifier = usePublicAuthStore((state) => state.checkoutLoginWithIdentifier);
  const isSubmittingLogin = usePublicAuthStore((state) => state.isSubmittingLogin);

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isCheckoutAuthOpen, setIsCheckoutAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState<"identifier" | "password">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const activeItems = useMemo<CartLineItem[]>(
    () =>
      Object.entries(cartQuantities).map(([productId, quantity]) => ({
        productId,
        quantity,
        selected: selectedCartIds.includes(productId),
      })),
    [cartQuantities, selectedCartIds],
  );

  const savedProducts = useMemo(
    () => savedForLaterIds.map((productId) => getProductById(productId)),
    [savedForLaterIds],
  );

  const selectedItems = activeItems.filter((item) => item.selected);
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + getProductById(item.productId).price * item.quantity, 0);
  const selectedItemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = selectedSubtotal > 0 && selectedSubtotal < FREE_SHIPPING_THRESHOLD ? ESTIMATED_SHIPPING : 0;
  const estimatedTotal = selectedSubtotal + shippingCost;
  const allSelected = activeItems.length > 0 && activeItems.every((item) => item.selected);
  const hasActiveItems = activeItems.length > 0;

  function resetAuthModal() {
    setAuthStep("identifier");
    setIdentifier("");
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
    return validateUserEmail(normalizeUserEmail(value)) || value.replace(/\D/g, "").length >= 7;
  }

  async function handleCheckoutAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (authStep === "identifier") {
      if (!isValidIdentifier(identifier.trim())) {
        setAuthError("Enter a valid email address or phone number.");
        return;
      }

      setAuthError(null);
      setAuthStep("password");
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
    setCouponMessage("Coupons are not connected yet. Checkout totals stay frontend-only for now.");
  }

  return (
    <>
      <section className="bg-[#fcfcfd] px-4 pb-24 pt-[132px] sm:px-6 sm:pt-[146px] lg:pb-16 lg:pt-[154px]">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-6 flex flex-col gap-3">
            <h1 className="text-3xl font-black tracking-[-0.03em] text-neutral-950 sm:text-4xl">Your Cart</h1>
            <p className="text-sm leading-6 text-neutral-500">FoodOnlines.com cart, secure checkout, and account-ready saved items.</p>
          </div>

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
                    {savedProducts.map((product) => (
                      <div className="grid gap-3 rounded-[22px] border border-neutral-200 p-4" key={product.id}>
                        <div className="flex items-center gap-3">
                          <img alt={product.name} className="h-16 w-16 rounded-2xl bg-neutral-50 object-contain" src={product.image} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 line-clamp-2">{product.name}</p>
                            <p className="mt-1 text-sm font-black text-neutral-950">{formatPrice(product.price)}</p>
                          </div>
                        </div>
                        <button
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-leaf-500 px-4 text-sm font-black text-leaf-600 transition hover:bg-leaf-50"
                          onClick={() => moveSavedToCart(product.id)}
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
                <div className="grid gap-4 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Checkbox
                      checked={allSelected}
                      label={`All (${selectedItemCount} items selected)`}
                      onChange={() => setAllCartSelections(activeItems.map((item) => item.productId), !allSelected)}
                    />
                    <p className="text-sm font-medium text-neutral-500">Fulfilled by FoodOnline</p>
                  </div>

                  <FreeShippingBar onAddMore={backToHome} subtotal={selectedSubtotal} />
                </div>

                <div className="grid gap-4 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-6">
                  {activeItems.map((item, index) => {
                    const product = getProductById(item.productId);

                    return (
                      <div
                        className={`grid gap-4 ${index < activeItems.length - 1 ? "border-b border-neutral-200 pb-5" : ""} lg:grid-cols-[24px_110px_minmax(0,1fr)_96px_120px] lg:items-start`}
                        key={item.productId}
                      >
                        <div className="pt-1">
                          <input
                            checked={item.selected}
                            className="h-5 w-5 rounded border-neutral-300 accent-neutral-950"
                            onChange={() => toggleCartSelection(item.productId)}
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
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-700">
                            <button className="underline underline-offset-4" onClick={() => removeFromCart(item.productId)} type="button">
                              Remove
                            </button>
                            <button className="underline underline-offset-4" onClick={() => saveForLater(item.productId)} type="button">
                              Save for later
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <label className="sr-only" htmlFor={`quantity-${item.productId}`}>
                            Quantity
                          </label>
                          <select
                            className="min-h-11 rounded-full border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-900 outline-none"
                            id={`quantity-${item.productId}`}
                            onChange={(event) => setCartQuantity(item.productId, Number(event.target.value))}
                            value={item.quantity}
                          >
                            {Array.from({ length: 10 }, (_, optionIndex) => optionIndex + 1).map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
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
                      {savedProducts.map((product) => (
                        <div className="grid gap-3 rounded-[22px] border border-neutral-200 p-4" key={product.id}>
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
                              onClick={() => moveSavedToCart(product.id)}
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
                checkoutDisabled={!selectedItems.length}
                checkoutLabel={selectedItems.length ? "Proceed to Checkout" : "Select items to checkout"}
                couponCode={couponCode}
                itemCount={selectedItemCount}
                onApplyCoupon={handleApplyCoupon}
                onCheckout={openCheckoutFlow}
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
        <div className="fixed inset-x-0 bottom-0 z-[1100] border-t border-neutral-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 shadow-[0_-12px_36px_rgba(15,23,42,0.12)] backdrop-blur-sm xl:hidden">
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
        onBack={() => {
          setAuthStep("identifier");
          setPassword("");
          setAuthError(null);
        }}
        onClose={closeCheckoutModal}
        onContinue={handleCheckoutAuthSubmit}
        onIdentifierChange={(value) => {
          setIdentifier(value);
          setAuthError(null);
        }}
        onPasswordChange={(value) => {
          setPassword(value);
          setAuthError(null);
        }}
        onTogglePassword={() => setIsPasswordVisible((current) => !current)}
        password={password}
        step={authStep}
      />
    </>
  );
}
