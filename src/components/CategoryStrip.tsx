import { assets, promoBanner } from "../data/home";
import { useHomepageCatalog } from "../services/catalog/useHomepageCatalog";
import { useHomeStore } from "../store/homeStore";
import { CategoryArtwork } from "./CategoryArtwork";

export function CategoryStrip() {
  const { categories, error, phase } = useHomepageCatalog();
  const openCategory = useHomeStore((state) => state.openCategory);

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16" id="categories">
      <div className="mx-auto max-w-7xl">
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-citrus-500">Browse all categories</p>
        </div>

        {error ? <p className="mt-8 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{error}</p> : null}
        <div className="mt-8 grid min-h-[220px] grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4 xl:grid-cols-6">
          {categories.length === 0 && phase === "loading" ? Array.from({ length: 12 }, (_, index) => (
            <div aria-hidden="true" className="animate-pulse rounded-[20px] border border-neutral-100 bg-neutral-50 p-3 sm:rounded-[22px] lg:rounded-[26px] lg:p-5" key={`category-skeleton-${index}`}>
              <div className="aspect-square rounded-[16px] bg-neutral-100 sm:rounded-[18px] lg:rounded-[22px]" />
              <div className="mx-auto mt-3 h-4 w-3/5 rounded bg-neutral-100" />
            </div>
          )) : null}
          {categories.map((category) => (
            <a
              className="group rounded-[20px] border border-neutral-200 bg-white p-2 text-center shadow-[0_8px_20px_rgba(15,23,42,0.03)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 focus-visible:ring-offset-2 sm:rounded-[22px] sm:p-3 lg:rounded-[26px] lg:p-5"
              href={category.href}
              id={category.sectionId}
              key={category.uuid ?? category.categorySlug}
              onClick={(event) => {
                event.preventDefault();
                openCategory(category.categorySlug);
              }}
            >
              <CategoryArtwork category={category} className="rounded-[16px] sm:rounded-[18px] lg:rounded-[22px]" />
              <p className="mt-2 break-words text-xs font-semibold leading-5 text-neutral-900 lg:mt-4 lg:text-sm">
                {category.name}
              </p>
            </a>
          ))}
        </div>

        <a
          className="mt-10 block overflow-hidden rounded-[30px] shadow-[0_20px_60px_rgba(245,158,11,0.2)] transition hover:shadow-[0_24px_70px_rgba(245,158,11,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 focus-visible:ring-offset-2"
          href={promoBanner.href}
        >
          <img
            alt={`${promoBanner.title} banner`}
            className="w-full object-cover"
            height={546}
            loading="lazy"
            src={assets.homeCategoryPromoBanner}
            width={2048}
          />
        </a>
      </div>
    </section>
  );
}
