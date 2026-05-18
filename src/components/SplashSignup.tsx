import { FormEvent } from "react";
import { assets } from "../data/home";
import { useHomeStore } from "../store/homeStore";

export function SplashSignup() {
  const email = useHomeStore((state) => state.email);
  const signupStatus = useHomeStore((state) => state.signupStatus);
  const setEmail = useHomeStore((state) => state.setEmail);
  const submitSignup = useHomeStore((state) => state.submitSignup);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitSignup();
  }

  return (
    <section id="splash" className="bg-white px-6 py-24">
      <div className="relative mx-auto min-h-[560px] max-w-7xl overflow-hidden rounded-md bg-ink shadow-soft">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-72"
          src={assets.splashVideo}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.18),rgba(12,15,18,0.78)_58%,rgba(12,15,18,0.9))]" />

        <div className="relative flex min-h-[560px] items-center justify-center px-6 py-16 text-center">
          <div className="max-w-2xl">
            <p className="mx-auto mb-5 inline-flex rounded-md bg-white/14 px-4 py-2 text-sm font-black text-white backdrop-blur">
              Sign up now
            </p>
            <h2 className="text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              First look at weekly food drops
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/78">
              Join FoodOnlines updates for fresh produce, prepared meals, and limited grocery deals.
            </p>

            <form
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 rounded-md bg-white p-2 shadow-2xl shadow-black/25 sm:flex-row"
              onSubmit={handleSubmit}
            >
              <label className="sr-only" htmlFor="signup-email">
                Email address
              </label>
              <input
                id="signup-email"
                className="min-h-14 flex-1 rounded-md px-5 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:ring-leaf-500"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                type="email"
                value={email}
                required
              />
              <button
                className="min-h-14 rounded-md bg-citrus-500 px-7 text-sm font-black text-white transition hover:bg-citrus-600"
                type="submit"
              >
                Sign up
              </button>
            </form>
            {signupStatus === "saved" ? (
              <p className="mt-4 text-sm font-bold text-leaf-100">Signup saved for this session.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
