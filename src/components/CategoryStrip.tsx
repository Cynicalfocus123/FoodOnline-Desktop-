import { categories, promoBanner } from "../data/home";
import { MockIcon } from "./MockIcon";

export function CategoryStrip() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16" id="categories">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-citrus-500">Browse all categories</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-3xl font-bold tracking-[-0.03em] text-neutral-950 sm:text-4xl">
              Grocery-first aisles for every daily cart
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-neutral-500 sm:text-right">
              Rounded category tiles, soft image cards, and clear labels keep desktop browsing quick while mobile stays
              swipe-friendly.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <a
              className="group rounded-[26px] border border-neutral-200 bg-white p-4 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              href="#best-deals"
              id={category.sectionId}
              key={category.name}
            >
              <div className="rounded-[24px] bg-[#f7f7f4] p-4">
                <div className="relative overflow-hidden rounded-[22px] bg-white p-3 shadow-inner shadow-neutral-950/5">
                  <img
                    alt={category.name}
                    className="aspect-square w-full rounded-[18px] object-cover"
                    loading="lazy"
                    src={category.image}
                  />
                  <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-neutral-700 shadow-sm">
                    <MockIcon className="h-5 w-5" name={category.icon} />
                  </span>
                </div>
              </div>
              <p className="mt-4 text-[13px] font-medium leading-5 text-neutral-900 sm:text-sm">{category.name}</p>
            </a>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-[30px] bg-[linear-gradient(90deg,#ffd65a_0%,#ffb347_52%,#ff9a28_100%)] px-5 py-6 shadow-[0_20px_60px_rgba(245,158,11,0.25)] sm:px-7 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-end gap-3 sm:gap-4">
              {promoBanner.products.map((product, index) => (
                <div
                  className={`overflow-hidden rounded-[22px] bg-white/70 p-2 shadow-lg shadow-orange-950/10 ${
                    index === 1 ? "mb-4" : ""
                  }`}
                  key={product.name}
                >
                  <img
                    alt={product.name}
                    className="h-24 w-24 rounded-[18px] object-cover sm:h-28 sm:w-28"
                    loading="lazy"
                    src={product.image}
                  />
                </div>
              ))}
            </div>

            <div className="flex-1 text-left lg:px-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-900/70">{promoBanner.title}</p>
              <h3 className="mt-2 text-3xl font-black leading-none tracking-[-0.04em] text-[#d62828] sm:text-5xl">
                {promoBanner.saleText}
              </h3>
              <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-neutral-900/70 sm:text-base">
                Stock up on pantry hits, snack bundles, and quick-delivery favorites with mock launch pricing.
              </p>
            </div>

            <div className="lg:self-center">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-neutral-950 px-6 text-sm font-bold text-white transition hover:bg-neutral-800"
                href={promoBanner.href}
              >
                {promoBanner.ctaLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
