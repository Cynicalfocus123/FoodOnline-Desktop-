import { FormEvent, useMemo, useState } from "react";
import signupBannerImage from "../../site video and content/shop  and order banner.webp";
import { SignupFormValues, getSignupRoleMeta, signupFieldLimits } from "../lib/registerSchema";
import { signupRoleOptions, useHomeStore } from "../store/homeStore";
import { PublicSessionUser, usePublicAuthStore } from "../store/publicAuthStore";
import { PhoneNumberInput } from "./PhoneNumberInput";

const emailFormFields: Array<{
  field: keyof SignupFormValues;
  label: string;
  type: string;
  optional?: boolean;
}> = [
  { field: "emailAddress", label: "Email address", type: "email" },
  { field: "firstName", label: "First name", type: "text" },
  { field: "lastName", label: "Last name", type: "text" },
  { field: "contactNumber", label: "Contact number", type: "tel" },
  { field: "lineId", label: "LINE ID (optional)", type: "text", optional: true },
  { field: "companyName", label: "Company name (optional)", type: "text", optional: true },
  { field: "password", label: "Password", type: "password" },
  { field: "confirmPassword", label: "Confirm password", type: "password" },
];

const phoneFormFields: Array<{
  field: keyof SignupFormValues;
  label: string;
  type: string;
  optional?: boolean;
}> = [
  { field: "firstName", label: "First name", type: "text" },
  { field: "lastName", label: "Last name", type: "text" },
  { field: "contactNumber", label: "Contact number", type: "tel" },
  { field: "lineId", label: "LINE ID (optional)", type: "text", optional: true },
  { field: "companyName", label: "Company name (optional)", type: "text", optional: true },
];

type SignupMethod = "email" | "phone";
type PhoneSignupStep = "form" | "otp";
type PhoneSignupField = "firstName" | "lastName" | "contactNumber" | "lineId" | "companyName";
type PhoneSignupFieldErrors = Partial<Record<PhoneSignupField, string>>;

export function SignupFlow() {
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const [signupMethod, setSignupMethod] = useState<SignupMethod>("email");
  const [phoneSignupStep, setPhoneSignupStep] = useState<PhoneSignupStep>("form");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [phoneFieldErrors, setPhoneFieldErrors] = useState<PhoneSignupFieldErrors>({});

  const signupStep = useHomeStore((state) => state.signupStep);
  const selectedRole = useHomeStore((state) => state.selectedRole);
  const formValues = useHomeStore((state) => state.formValues);
  const fieldErrors = useHomeStore((state) => state.fieldErrors);
  const completedSubmission = useHomeStore((state) => state.completedSubmission);
  const isSubmittingSignup = useHomeStore((state) => state.isSubmittingSignup);
  const submissionError = useHomeStore((state) => state.submissionError);
  const selectRole = useHomeStore((state) => state.selectRole);
  const continueToForm = useHomeStore((state) => state.continueToForm);
  const setFormValue = useHomeStore((state) => state.setFormValue);
  const finishSignup = useHomeStore((state) => state.finishSignup);
  const backToHome = useHomeStore((state) => state.backToHome);
  const openLogin = useHomeStore((state) => state.openLogin);
  const returnAfterAuth = useHomeStore((state) => state.returnAfterAuth);
  const pendingReferralCode = useHomeStore((state) => state.pendingReferralCode);
  const setPendingReferralCode = useHomeStore((state) => state.setPendingReferralCode);
  const completeMockPhoneOtpLogin = usePublicAuthStore((state) => state.completeMockPhoneOtpLogin);
  const isSubmittingLogin = usePublicAuthStore((state) => state.isSubmittingLogin);

  const activeFormFields = useMemo(
    () => (signupMethod === "email" ? emailFormFields : phoneFormFields),
    [signupMethod],
  );

  function resetPhoneOtpState() {
    setPhoneSignupStep("form");
    setOtpCode("");
    setOtpError(null);
    setOtpMessage(null);
  }

  function setValueAndClearPhoneError<K extends keyof SignupFormValues>(field: K, value: SignupFormValues[K]) {
    setFormValue(field, value);

    if (field in phoneFieldErrors || otpError) {
      setPhoneFieldErrors((currentValue) => ({
        ...currentValue,
        [field]: undefined,
      }));
      setOtpError(null);
    }
  }

  function validatePhoneSignupForm() {
    const nextErrors: PhoneSignupFieldErrors = {};

    if (!formValues.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!formValues.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!formValues.contactNumber.trim()) {
      nextErrors.contactNumber = "Phone number is required.";
    } else if (formValues.contactNumber.replace(/\D/g, "").length < 7) {
      nextErrors.contactNumber = "Enter a valid phone number.";
    }

    setPhoneFieldErrors(nextErrors);
    return Object.values(nextErrors).some(Boolean) ? null : formValues.contactNumber.trim();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (signupMethod === "email") {
      await finishSignup();
      return;
    }

    if (phoneSignupStep === "form") {
      const cleanedPhoneNumber = validatePhoneSignupForm();
      if (!cleanedPhoneNumber) {
        return;
      }

      setOtpCode("");
      setOtpError(null);
      setOtpMessage("Enter the code sent to your phone.");
      setPhoneSignupStep("otp");
      return;
    }

    if (!otpCode.trim()) {
      setOtpError("Code is required.");
      return;
    }

    setOtpError(null);
    const success = await completeMockPhoneOtpLogin(formValues.contactNumber.trim(), {
      accountType: selectedRole ?? "customer",
      companyName: formValues.companyName.trim(),
      firstName: formValues.firstName.trim() || "FoodOnline",
      lastName: formValues.lastName.trim() || "Shopper",
      lineId: formValues.lineId.trim(),
    } satisfies Partial<
      Pick<PublicSessionUser, "accountType" | "companyName" | "firstName" | "lastName" | "lineId">
    >);

    if (success) {
      returnAfterAuth();
    }
  }

  if (signupStep === "complete" && completedSubmission) {
    return (
      <section className="bg-neutral-50 px-4 pb-16 pt-[164px] sm:px-6 sm:pt-[178px] lg:pt-[186px]">
        <div className="mx-auto max-w-lg rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm shadow-emerald-950/5 sm:p-8">
          <p className="text-base font-semibold leading-7 text-ink">Thank you for registering.</p>
          <div className="mt-6">
            <button
              className="min-h-12 rounded-md bg-citrus-500 px-6 text-sm font-black text-white transition hover:bg-citrus-600"
              onClick={backToHome}
              type="button"
            >
              Go to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (signupStep === "form") {
    return (
      <section className="bg-neutral-50 px-0 pb-16 pt-[164px] sm:px-6 sm:pt-[178px] lg:pt-[186px]">
        <div className="mx-auto grid max-w-7xl overflow-hidden border-y border-neutral-100 bg-white shadow-soft sm:rounded-[28px] sm:border lg:grid-cols-[1.02fr_0.98fr]">
          <div className="bg-white sm:hidden">
            <img
              alt="FoodOnlines shop and order banner"
              className="block h-auto w-full"
              src={signupBannerImage}
            />
          </div>
          <div className="relative hidden min-h-[360px] overflow-hidden bg-white sm:block lg:min-h-full">
            <img
              alt="FoodOnlines shop and order banner"
              className="absolute inset-0 h-full w-full object-contain object-top"
              src={signupBannerImage}
            />
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <h2 className="text-3xl font-black text-ink sm:text-4xl">Create Your Account</h2>
            <p className="mt-3 text-base leading-7 text-neutral-600">
              Finish your {selectedRole ? getSignupRoleMeta(selectedRole).signupLabel : "selected"} registration
              with the live details required for your FoodOnlines account.
            </p>

            <form className="mt-8 grid gap-4" noValidate onSubmit={handleSubmit}>
              <div className="inline-grid grid-cols-2 rounded-md bg-neutral-100 p-1 text-sm font-black text-neutral-600">
                {(["email", "phone"] as const).map((mode) => (
                  <button
                    className={`min-h-10 rounded px-4 transition ${
                      signupMethod === mode ? "bg-white text-ink shadow-sm" : "hover:text-ink"
                    }`}
                    key={mode}
                    onClick={() => {
                      setSignupMethod(mode);
                      setPhoneFieldErrors({});
                      resetPhoneOtpState();
                    }}
                    type="button"
                  >
                    {mode === "email" ? "Email" : "Phone"}
                  </button>
                ))}
              </div>

              {activeFormFields.map(({ field, label, type, optional }) => {
                const fieldError =
                  signupMethod === "phone"
                    ? phoneFieldErrors[field as PhoneSignupField] ?? fieldErrors[field]
                    : fieldErrors[field];

                if (field === "contactNumber") {
                  return (
                    <PhoneNumberInput
                      error={fieldError}
                      id={field}
                      key={field}
                      label={label}
                      onChange={(value) => setValueAndClearPhoneError(field, value)}
                      required={!optional}
                      value={formValues[field]}
                    />
                  );
                }

                return (
                  <label className="grid gap-2" htmlFor={field} key={field}>
                    <span className="text-sm font-bold text-neutral-700">{label}</span>
                    <div className="relative">
                      <input
                        aria-describedby={fieldError ? `${field}-error` : undefined}
                        aria-invalid={fieldError ? "true" : "false"}
                        autoCapitalize={
                          field === "emailAddress" ||
                          field === "lineId" ||
                          field === "password" ||
                          field === "confirmPassword"
                            ? "none"
                            : undefined
                        }
                        autoComplete={
                          field === "emailAddress"
                            ? "email"
                            : field === "firstName"
                              ? "given-name"
                              : field === "lastName"
                                ? "family-name"
                                : field === "password"
                                  ? "new-password"
                                  : field === "confirmPassword"
                                    ? "new-password"
                                    : "off"
                        }
                        autoCorrect={
                          field === "emailAddress" ||
                          field === "lineId" ||
                          field === "password" ||
                          field === "confirmPassword"
                            ? "off"
                            : undefined
                        }
                        className={`min-h-14 w-full rounded-md border px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/20 ${
                          type === "password" ? "pr-14" : ""
                        } ${fieldError ? "border-red-400 bg-red-50/40" : "border-neutral-200"}`}
                        id={field}
                        inputMode={field === "emailAddress" ? "email" : "text"}
                        maxLength={signupFieldLimits[field]}
                        onChange={(event) => setValueAndClearPhoneError(field, event.target.value)}
                        required={!optional}
                        type={
                          field === "password" || field === "confirmPassword"
                            ? visiblePasswords[field]
                              ? "text"
                              : "password"
                            : type
                        }
                        value={formValues[field]}
                      />
                      {field === "password" || field === "confirmPassword" ? (
                        <PasswordEyeButton
                          isVisible={visiblePasswords[field]}
                          label={visiblePasswords[field] ? `Hide ${label}` : `Show ${label}`}
                          onClick={() =>
                            setVisiblePasswords((currentValue) => ({
                              ...currentValue,
                              [field]: !currentValue[field],
                            }))
                          }
                        />
                      ) : null}
                    </div>
                    {fieldError ? (
                      <span className="text-sm font-semibold text-red-600" id={`${field}-error`}>
                        {fieldError}
                      </span>
                    ) : null}
                  </label>
                );
              })}

              {selectedRole ? (
                <details className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4" open={Boolean(pendingReferralCode)}>
                  <summary className="cursor-pointer text-sm font-black text-neutral-800">Have a referral code?</summary>
                  <label className="mt-3 grid gap-2" htmlFor="referral-code">
                    <span className="text-sm font-bold text-neutral-700">Referral code (optional)</span>
                    <input
                      autoCapitalize="characters"
                      className="min-h-12 rounded-md border border-neutral-200 bg-white px-4 font-semibold uppercase text-ink outline-none focus:border-leaf-500"
                      id="referral-code"
                      maxLength={16}
                      onChange={(event) => setPendingReferralCode(event.target.value)}
                      placeholder="FOLXXXXXX"
                      value={pendingReferralCode ?? ""}
                    />
                  </label>
                </details>
              ) : null}

              {signupMethod === "phone" && phoneSignupStep === "otp" ? (
                <div className="grid gap-3 rounded-[22px] border border-neutral-200 bg-neutral-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-neutral-800">Enter the code sent to your phone</p>
                      <p className="mt-1 text-sm text-neutral-500">{formValues.contactNumber}</p>
                    </div>
                    <button
                      className="text-sm font-bold text-neutral-700 underline underline-offset-4"
                      onClick={resetPhoneOtpState}
                      type="button"
                    >
                      Edit
                    </button>
                  </div>
                  <label className="grid gap-2" htmlFor="signup-otp">
                    <span className="text-sm font-bold text-neutral-700">SMS code</span>
                    <input
                      autoComplete="one-time-code"
                      className="min-h-14 rounded-md border border-neutral-200 px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/20"
                      id="signup-otp"
                      inputMode="numeric"
                      onChange={(event) => {
                        setOtpCode(event.target.value);
                        setOtpError(null);
                      }}
                      placeholder="Enter any code"
                      type="text"
                      value={otpCode}
                    />
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      className="text-sm font-bold text-neutral-700 underline underline-offset-4"
                      onClick={() => {
                        setOtpMessage("Code sent again.");
                        setOtpError(null);
                      }}
                      type="button"
                    >
                      Resend code
                    </button>
                    {otpMessage ? <p className="text-sm font-medium text-neutral-500">{otpMessage}</p> : null}
                  </div>
                </div>
              ) : null}

              <button
                className="mt-2 min-h-14 rounded-md bg-citrus-500 px-6 text-base font-black text-white transition hover:bg-citrus-600"
                disabled={signupMethod === "phone" ? isSubmittingLogin : isSubmittingSignup}
                type="submit"
              >
                {signupMethod === "phone"
                  ? phoneSignupStep === "form"
                    ? "Continue"
                    : isSubmittingLogin
                      ? "Verifying..."
                      : "Verify Code"
                  : isSubmittingSignup
                    ? "Submitting..."
                    : "Create Account"}
              </button>
              {signupMethod === "email" && submissionError ? (
                <p className="text-sm font-semibold text-red-600">{submissionError}</p>
              ) : null}
              {signupMethod === "phone" && otpError ? (
                <p className="text-sm font-semibold text-red-600">{otpError}</p>
              ) : null}
            </form>

            <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
              <button
                className="rounded-md border border-neutral-200 px-4 py-3 text-neutral-700 transition hover:border-leaf-500 hover:text-leaf-700"
                onClick={openLogin}
                type="button"
              >
                Already have an account? Login
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-neutral-50 px-4 pb-16 pt-[164px] sm:px-6 sm:pt-[178px] lg:pt-[186px]">
      <div className="mx-auto max-w-5xl rounded-[28px] border border-neutral-100 bg-white p-6 shadow-soft sm:p-8">
        <h1 className="text-3xl font-black text-ink sm:text-4xl">What&apos;s your role?</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">
          We use your role to shape a better FoodOnlines registration experience for your account.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {signupRoleOptions.map((role) => {
            const isActive = selectedRole === role.key;

            return (
              <button
                className={`flex min-h-16 items-center justify-between rounded-md border px-5 text-left text-base font-bold transition ${
                  isActive
                    ? "border-citrus-500 bg-citrus-50 text-citrus-600 shadow-sm"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-leaf-500 hover:text-leaf-700"
                }`}
                key={role.key}
                onClick={() => selectRole(role.key)}
                type="button"
              >
                <span>{role.signupLabel}</span>
                <span
                  className={`h-5 w-5 rounded-full border ${
                    isActive ? "border-citrus-500 bg-citrus-500" : "border-neutral-300"
                  }`}
                />
              </button>
            );
          })}
        </div>
        {fieldErrors.selectedRole ? (
          <p className="mt-4 text-center text-sm font-semibold text-red-600">{fieldErrors.selectedRole}</p>
        ) : null}
        <div className="mt-8 flex justify-center">
          <button
            className="min-h-14 min-w-[220px] rounded-md bg-citrus-500 px-8 text-base font-black text-white transition hover:bg-citrus-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
            disabled={!selectedRole}
            onClick={continueToForm}
            type="button"
          >
            Continue
          </button>
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
