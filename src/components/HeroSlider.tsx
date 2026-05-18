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
    <section id="home" className="relative min-h-[760px] overflow-hidden pt-20 text-white">
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

      <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center justify-center px-6 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="mb-5 inline-flex rounded-md bg-white/14 px-4 py-2 text-sm font-black text-leaf-100 backdrop-blur">
            {slide.eyebrow}
          </p>
          <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            {slide.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/82">{slide.body}</p>

          <div className="mx-auto mt-12 max-w-3xl">
            <p className="mb-4 text-xl font-black leading-8 text-white sm:text-2xl">
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
                className="min-h-14 flex-1 rounded-md px-5 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:ring-leaf-500"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                type="email"
                value={email}
                required
              />
              <button
                className="min-h-14 rounded-md bg-citrus-500 px-8 text-sm font-black text-white transition hover:bg-citrus-600"
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
