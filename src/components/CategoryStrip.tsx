import { useEffect, useState } from "react";
import { assets, promoBanner } from "../data/home";
import { getCategories } from "../services/catalog";
import { useHomeStore } from "../store/homeStore";

export function CategoryStrip() {
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);
  const [error, setError] = useState<string | null>(null);
  const openCategory = useHomeStore((state) => state.openCategory);

  useEffect(() => {
    let mounted = true;
    setError(null);
    void getCategories().then((items) => mounted && setCategories(items)).catch(() => mounted && setError("Categories are temporarily unavailable."));
    return () => { mounted = false; };
  }, []);

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16" id="categories">
      <div className="mx-auto max-w-7xl">
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-citrus-500">Browse all categories</p>
        </div>

        {error ? <p className="mt-8 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{error}</p> : null}
        <div className="mt-8 grid min-h-24 grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          {categories.map((category) => (
            <a
              className="group rounded-[20px] border border-neutral-200 bg-white p-2 text-center shadow-[0_8px_20px_rgba(15,23,42,0.03)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400 focus-visible:ring-offset-2 sm:rounded-[22px] sm:p-3 lg:rounded-[26px] lg:p-5"
              href={category.href}
              id={category.sectionId}
              key={category.name}
              onClick={(event) => {
                event.preventDefault();
                openCategory(category.categorySlug);
              }}
            >
              <img
                alt={category.name}
                className="aspect-square w-full rounded-[16px] object-contain sm:rounded-[18px] lg:rounded-[22px]"
                height={360}
                loading="lazy"
                src={category.image}
                width={360}
              />
              <p className="mt-2 text-[10px] font-medium leading-4 text-neutral-900 sm:text-[11px] lg:mt-4 lg:text-sm lg:leading-5">
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
