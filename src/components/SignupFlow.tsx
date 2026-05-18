import { FormEvent } from "react";
import { assets } from "../data/home";
import { SignupFormValues, SignupRole, useHomeStore } from "../store/homeStore";

const roleOptions: SignupRole[] = ["Customer", "Partners", "Suppliers"];
const marketingImage =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80";

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
  const completedSubmission = useHomeStore((state) => state.completedSubmission);
  const selectRole = useHomeStore((state) => state.selectRole);
  const continueToForm = useHomeStore((state) => state.continueToForm);
  const setFormValue = useHomeStore((state) => state.setFormValue);
  const finishSignup = useHomeStore((state) => state.finishSignup);
  const backToHome = useHomeStore((state) => state.backToHome);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    finishSignup();
  }

  if (signupStep === "complete" && completedSubmission) {
    return (
      <section className="bg-neutral-50 px-4 pb-16 pt-32 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm shadow-emerald-950/5 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-3xl font-black text-white">
              ✓
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink sm:text-3xl">Registration Complete</h1>
              <p className="mt-2 max-w-xl text-base leading-7 text-neutral-600">
                Thank you for registering. Your account setup for {completedSubmission.selectedRole} has
                been captured and is ready for future backend delivery.
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
      <section className="bg-neutral-50 px-4 pb-16 pt-32 sm:px-6">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[28px] border border-neutral-100 bg-white shadow-soft lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative overflow-hidden bg-[linear-gradient(180deg,#f7f9ef_0%,#eef7dc_100%)] p-6 sm:p-8 lg:p-10">
            <img
              alt="FoodOnlines brand mark"
              className="h-16 w-auto object-contain sm:h-20"
              src={assets.logo}
            />
            <h1 className="mt-8 max-w-md text-4xl font-black leading-tight text-ink sm:text-5xl">
              Smart food signup for every wholesale move.
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-neutral-600">
              Join FoodOnlines as a {selectedRole} and unlock a cleaner way to source, sell, and grow.
            </p>
            <div className="mt-8 grid gap-4 text-left sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <p className="text-sm font-black text-leaf-700">Fast supplier discovery</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  Source fresh inventory without juggling multiple channels.
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <p className="text-sm font-black text-leaf-700">Brand-ready profiles</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  Keep customer, partner, and supplier onboarding structured from day one.
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <p className="text-sm font-black text-leaf-700">Future admin delivery</p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  Registration payload is already shaped for backend and admin workflows.
                </p>
              </div>
            </div>
            <div className="mt-8 overflow-hidden rounded-[24px] bg-white/60 p-3 shadow-sm">
              <img
                alt="Fresh food assortment"
                className="aspect-[4/3] w-full rounded-[20px] object-cover"
                src={marketingImage}
              />
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <button
              className="mb-8 text-sm font-bold text-neutral-500 transition hover:text-citrus-500"
              onClick={backToHome}
              type="button"
            >
              Back to Home
            </button>
            <h2 className="text-3xl font-black text-ink sm:text-4xl">Create Your Account</h2>
            <p className="mt-3 text-base leading-7 text-neutral-600">
              Finish your {selectedRole} registration with details ready for future backend submission.
            </p>

            <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
              {formFields.map(({ field, label, type, optional }) => (
                <label className="grid gap-2" htmlFor={field} key={field}>
                  <span className="text-sm font-bold text-neutral-700">{label}</span>
                  <input
                    className="min-h-14 rounded-md border border-neutral-200 px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:border-leaf-500 focus:ring-leaf-500/20"
                    id={field}
                    onChange={(event) => setFormValue(field, event.target.value)}
                    required={!optional}
                    type={type}
                    value={formValues[field]}
                  />
                </label>
              ))}
              <button
                className="mt-2 min-h-14 rounded-md bg-citrus-500 px-6 text-base font-black text-white transition hover:bg-citrus-600"
                type="submit"
              >
                Finish
              </button>
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
          {roleOptions.map((role) => {
            const isActive = selectedRole === role;
            return (
              <button
                className={`flex min-h-16 items-center justify-between rounded-md border px-5 text-left text-base font-bold transition ${
                  isActive
                    ? "border-citrus-500 bg-citrus-50 text-citrus-600 shadow-sm"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-leaf-500 hover:text-leaf-700"
                }`}
                key={role}
                onClick={() => selectRole(role)}
                type="button"
              >
                <span>{role}</span>
                <span
                  className={`h-5 w-5 rounded-full border ${
                    isActive ? "border-citrus-500 bg-citrus-500" : "border-neutral-300"
                  }`}
                />
              </button>
            );
          })}
        </div>
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
