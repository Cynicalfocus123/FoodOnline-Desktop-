import { FormEvent } from "react";
import signupBannerImage from "../../site video and content/shop  and order banner.png";
import { SignupFormValues, getSignupRoleMeta, signupFieldLimits } from "../lib/registerSchema";
import { signupRoleOptions, useHomeStore } from "../store/homeStore";

const formFields: Array<{
  field: keyof SignupFormValues;
  label: string;
  type: string;
  optional?: boolean;
}> = [
  { field: "emailAddress", label: "Email address", type: "email" },
  { field: "firstName", label: "First name", type: "text" },
  { field: "lastName", label: "Last name", type: "text" },
  { field: "contactNumber", label: "Contact number", type: "tel" },
  { field: "lineId", label: "Line ID optional", type: "text", optional: true },
  { field: "companyName", label: "Company name", type: "text" },
];

export function SignupFlow() {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await finishSignup();
  }

  if (signupStep === "complete" && completedSubmission) {
    return (
      <section className="bg-neutral-50 px-4 pb-16 pt-32 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm shadow-emerald-950/5 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-base font-black text-white">
              OK
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink sm:text-3xl">Registration Complete</h1>
              <p className="mt-2 max-w-xl text-base leading-7 text-neutral-600">
                Thank you for registering. Your account setup for{" "}
                {getSignupRoleMeta(completedSubmission.selectedRole).signupLabel} has been captured and is ready
                for future backend delivery.
              </p>
              <button
                className="mt-6 min-h-12 rounded-md bg-citrus-500 px-6 text-sm font-black text-white transition hover:bg-citrus-600"
                onClick={backToHome}
                type="button"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (signupStep === "form") {
    return (
      <section className="bg-neutral-50 px-0 pb-16 pt-32 sm:px-6">
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
              className="absolute inset-0 h-full w-full object-contain object-top lg:object-cover"
              src={signupBannerImage}
            />
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <h2 className="text-3xl font-black text-ink sm:text-4xl">Create Your Account</h2>
            <p className="mt-3 text-base leading-7 text-neutral-600">
              Finish your {selectedRole ? getSignupRoleMeta(selectedRole).signupLabel : "selected"} registration
              with details ready for future backend submission.
            </p>

            <form className="mt-8 grid gap-4" noValidate onSubmit={handleSubmit}>
              {formFields.map(({ field, label, type, optional }) => {
                const fieldError = fieldErrors[field];

                return (
                  <label className="grid gap-2" htmlFor={field} key={field}>
                    <span className="text-sm font-bold text-neutral-700">{label}</span>
                    <input
                      aria-describedby={fieldError ? `${field}-error` : undefined}
                      aria-invalid={fieldError ? "true" : "false"}
                      className={`min-h-14 rounded-md border px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/20 ${
                        fieldError ? "border-red-400 bg-red-50/40" : "border-neutral-200"
                      }`}
                      id={field}
                      inputMode={field === "contactNumber" ? "tel" : field === "emailAddress" ? "email" : "text"}
                      maxLength={signupFieldLimits[field]}
                      onChange={(event) => setFormValue(field, event.target.value)}
                      required={!optional}
                      type={type}
                      value={formValues[field]}
                    />
                    {fieldError ? (
                      <span className="text-sm font-semibold text-red-600" id={`${field}-error`}>
                        {fieldError}
                      </span>
                    ) : null}
                  </label>
                );
              })}
              <button
                className="mt-2 min-h-14 rounded-md bg-citrus-500 px-6 text-base font-black text-white transition hover:bg-citrus-600"
                disabled={isSubmittingSignup}
                type="submit"
              >
                {isSubmittingSignup ? "Submitting..." : "Finish"}
              </button>
              {submissionError ? <p className="text-sm font-semibold text-red-600">{submissionError}</p> : null}
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-neutral-50 px-4 pb-16 pt-32 sm:px-6">
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
