import { FormEvent } from "react";
import { assets, slides } from "../data/home";
import { useHomeStore } from "../store/homeStore";

export function HeroSlider() {
  const email = useHomeStore((state) => state.email);
  const signupStatus = useHomeStore((state) => state.signupStatus);
  const setEmail = useHomeStore((state) => state.setEmail);
  const submitSignup = useHomeStore((state) => state.submitSignup);
  const slide = slides[0];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitSignup();
  }

  return (
    <section id="home" className="relative min-h-[760px] overflow-hidden pt-24 text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={assets.heroVideo}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.18),rgba(10,13,16,0.45)_34%,rgba(10,13,16,0.86)_100%)]" />

      <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            {slide.title}
          </h1>

          <div className="mx-auto mt-10 max-w-3xl sm:mt-12">
            <p className="mb-4 text-lg font-black leading-7 text-white sm:text-2xl sm:leading-8">
              Register now and join the future of wholesale food
            </p>
            <form
              className="mx-auto flex max-w-3xl flex-col gap-3 rounded-md bg-white p-2 shadow-2xl shadow-black/25 sm:flex-row"
              onSubmit={handleSubmit}
            >
              <label className="sr-only" htmlFor="hero-signup-email">
                Email address
              </label>
              <input
                id="hero-signup-email"
                className="min-h-14 w-full flex-1 rounded-md px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:ring-leaf-500 sm:px-5"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                type="email"
                value={email}
                required
              />
              <button
                className="min-h-14 shrink-0 rounded-md bg-citrus-500 px-8 text-sm font-black text-white transition hover:bg-citrus-600"
                type="submit"
              >
                Register
              </button>
            </form>
            {signupStatus === "saved" ? (
              <p className="mt-4 text-sm font-bold text-leaf-100">Registration saved for this session.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
