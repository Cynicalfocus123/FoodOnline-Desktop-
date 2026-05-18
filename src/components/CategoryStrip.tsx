import { categories } from "../data/home";

export function CategoryStrip() {
  return (
    <section id="categories" className="bg-neutral-50 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-citrus-500">Browse all categories</p>
          <h2 className="mt-3 text-4xl font-black tracking-normal text-ink">Fast paths for daily food orders</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((category) => (
            <a
              className={`flex min-h-36 flex-col items-center justify-center rounded-md p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-soft ${category.accent}`}
              href="#best-deals"
              key={category.name}
            >
              <span className="text-lg font-black">{category.name}</span>
              <span className="mt-2 text-sm font-semibold opacity-75">{category.items}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
