import { FormEvent, useState } from "react";
import signupBannerImage from "../../site video and content/shop  and order banner.png";
import { normalizeUserEmail, sanitizeUserPasswordInput, validateUserEmail, validateUserLoginPassword } from "../lib/security";
import { useHomeStore } from "../store/homeStore";
import { usePublicAuthStore } from "../store/publicAuthStore";
import { PhoneNumberInput } from "./PhoneNumberInput";

type LoginIdentifierMode = "email" | "phone";

export function LoginFlow() {
  const authError = usePublicAuthStore((state) => state.authError);
  const clearAuthError = usePublicAuthStore((state) => state.clearAuthError);
  const isSubmittingLogin = usePublicAuthStore((state) => state.isSubmittingLogin);
  const checkoutLoginWithIdentifier = usePublicAuthStore((state) => state.checkoutLoginWithIdentifier);
  const loginUser = usePublicAuthStore((state) => state.loginUser);
  const openSignup = useHomeStore((state) => state.openSignup);
  const returnAfterAuth = useHomeStore((state) => state.returnAfterAuth);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [identifierMode, setIdentifierMode] = useState<LoginIdentifierMode>("email");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedEmail = normalizeUserEmail(email);
    const cleanedPhoneNumber = phoneNumber.trim();
    const cleanedPassword = sanitizeUserPasswordInput(password, true);

    if (identifierMode === "email" && !cleanedEmail) {
      setFieldError("Email is required.");
      return;
    }

    if (identifierMode === "email" && !validateUserEmail(cleanedEmail)) {
      setFieldError("Invalid email address.");
      return;
    }

    if (identifierMode === "phone" && cleanedPhoneNumber.replace(/\D/g, "").length < 7) {
      setFieldError("Enter a valid phone number.");
      return;
    }

    if (!validateUserLoginPassword(cleanedPassword)) {
      setFieldError("Password is required.");
      return;
    }

    setFieldError(null);
    clearAuthError();

    const success =
      identifierMode === "phone"
        ? await checkoutLoginWithIdentifier(cleanedPhoneNumber, cleanedPassword)
        : await loginUser(cleanedEmail, cleanedPassword);
    if (success) {
      returnAfterAuth();
    }
  }

  return (
    <section className="bg-neutral-50 px-0 pb-16 pt-[164px] sm:px-6 sm:pt-[178px] lg:pt-[186px]">
      <div className="mx-auto grid max-w-7xl overflow-hidden border-y border-neutral-100 bg-white shadow-soft sm:rounded-[28px] sm:border lg:grid-cols-[1.02fr_0.98fr]">
        <div className="bg-white sm:hidden">
          <img alt="FoodOnlines shop and order banner" className="block h-auto w-full" src={signupBannerImage} />
        </div>
        <div className="relative hidden min-h-[360px] overflow-hidden bg-white sm:block lg:min-h-full">
          <img
            alt="FoodOnlines shop and order banner"
            className="absolute inset-0 h-full w-full object-contain object-top lg:object-cover"
            src={signupBannerImage}
          />
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <h2 className="text-3xl font-black text-ink sm:text-4xl">Welcome Back</h2>
          <p className="mt-3 text-base leading-7 text-neutral-600">
            Sign in with your live FoodOnlines account to continue with the public storefront.
          </p>

          <form className="mt-8 grid gap-4" noValidate onSubmit={handleSubmit}>
            <div className="inline-grid grid-cols-2 rounded-md bg-neutral-100 p-1 text-sm font-black text-neutral-600">
              {(["email", "phone"] as const).map((mode) => (
                <button
                  className={`min-h-10 rounded px-4 transition ${
                    identifierMode === mode ? "bg-white text-ink shadow-sm" : "hover:text-ink"
                  }`}
                  key={mode}
                  onClick={() => {
                    setIdentifierMode(mode);
                    setFieldError(null);
                    clearAuthError();
                  }}
                  type="button"
                >
                  {mode === "email" ? "Email" : "Phone"}
                </button>
              ))}
            </div>

            {identifierMode === "phone" ? (
              <PhoneNumberInput
                error={fieldError?.toLowerCase().includes("phone") ? fieldError : undefined}
                id="login-phone"
                label="Phone number"
                onChange={setPhoneNumber}
                required
                value={phoneNumber}
              />
            ) : (
              <label className="grid gap-2" htmlFor="login-email">
                <span className="text-sm font-bold text-neutral-700">Email address</span>
                <input
                  autoComplete="username"
                  className="min-h-14 rounded-md border border-neutral-200 px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/20"
                  id="login-email"
                  inputMode="email"
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  value={email}
                />
              </label>
            )}

            <label className="grid gap-2" htmlFor="login-password">
              <span className="text-sm font-bold text-neutral-700">Password</span>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="min-h-14 w-full rounded-md border border-neutral-200 px-4 pr-14 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/20"
                  id="login-password"
                  onChange={(event) => setPassword(event.target.value)}
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                />
                <PasswordEyeButton
                  isVisible={isPasswordVisible}
                  label={isPasswordVisible ? "Hide password" : "Show password"}
                  onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
                />
              </div>
            </label>

            {fieldError && (identifierMode !== "phone" || !fieldError.toLowerCase().includes("phone")) ? (
              <p className="text-sm font-semibold text-red-600">{fieldError}</p>
            ) : null}
            {authError ? <p className="text-sm font-semibold text-red-600">{authError}</p> : null}

            <button
              className="mt-2 min-h-14 rounded-md bg-citrus-500 px-6 text-base font-black text-white transition hover:bg-citrus-600"
              disabled={isSubmittingLogin}
              type="submit"
            >
              {isSubmittingLogin ? "Signing In..." : "Login"}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
            <button
              className="rounded-md border border-neutral-200 px-4 py-3 text-neutral-700 transition hover:border-citrus-500 hover:text-citrus-500"
              onClick={openSignup}
              type="button"
            >
              Need an account? Register
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PasswordEyeButton({
  isVisible,
  label,
  onClick,
}: {
  isVisible: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-leaf-700"
      onClick={onClick}
      type="button"
    >
      <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        {isVisible ? (
          <>
            <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 4 10 8a11.8 11.8 0 0 1-3 4.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.6 6.6A12.3 12.3 0 0 0 2 12c1 4 5 8 10 8 1.6 0 3.1-.4 4.4-1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    </button>
  );
}
