import { assets, slides } from "../data/home";
import { useHomeStore } from "../store/homeStore";

export function HeroSlider() {
  const openSignup = useHomeStore((state) => state.openSignup);
  const slide = slides[0];

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
            <button
              className="min-h-14 min-w-[220px] rounded-md bg-citrus-500 px-8 text-base font-black text-white shadow-lg shadow-orange-500/25 transition hover:bg-citrus-600 sm:min-w-[260px]"
              onClick={openSignup}
              type="button"
            >
              Join Us Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
