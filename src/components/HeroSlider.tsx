import { assets, slides } from "../data/home";
import { useHomeStore } from "../store/homeStore";

export function HeroSlider() {
  const activeSlide = useHomeStore((state) => state.activeSlide);
  const setActiveSlide = useHomeStore((state) => state.setActiveSlide);
  const slide = slides[activeSlide];

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
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,13,16,0.86),rgba(10,13,16,0.42),rgba(10,13,16,0.72))]" />

      <div className="relative mx-auto grid min-h-[680px] max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_390px]">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-md bg-white/14 px-4 py-2 text-sm font-black text-leaf-100 backdrop-blur">
            {slide.eyebrow}
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            {slide.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">{slide.body}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              className="rounded-md bg-leaf-500 px-7 py-4 text-sm font-black text-white shadow-lg shadow-lime-600/25 transition hover:bg-leaf-600"
              href="#best-deals"
            >
              {slide.cta}
            </a>
            <div className="rounded-md border border-white/18 bg-white/12 px-5 py-3 backdrop-blur">
              <strong className="block text-2xl">{slide.stat}</strong>
              <span className="text-sm text-white/72">{slide.statLabel}</span>
            </div>
          </div>
        </div>

        <aside className="rounded-md border border-white/14 bg-white/12 p-5 shadow-soft backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-leaf-100">Today picks</p>
          <div className="mt-5 space-y-4">
            {slides.map((item, index) => (
              <button
                className={`w-full rounded-md border p-4 text-left transition ${
                  activeSlide === index
                    ? "border-leaf-300 bg-white text-ink"
                    : "border-white/15 bg-black/20 text-white hover:border-white/45"
                }`}
                key={item.title}
                onClick={() => setActiveSlide(index)}
                type="button"
              >
                <span className="block text-xs font-black text-citrus-500">{item.eyebrow}</span>
                <span className="mt-1 block text-lg font-black">{item.title}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
