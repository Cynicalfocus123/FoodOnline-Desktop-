import { products } from "../data/home";

export function DealsGrid() {
  return (
    <section id="best-deals" className="bg-white px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-md bg-leaf-50 p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-citrus-500">Featured products</p>
          <h2 className="mt-3 text-4xl font-black tracking-normal text-ink">Best deals this week</h2>
          <p className="mt-4 leading-7 text-neutral-600">
            Grocery cards keep visible prices, discount tags, and fast product comparison for desktop shoppers.
          </p>
          <a
            className="mt-7 inline-flex rounded-md bg-leaf-500 px-6 py-3 text-sm font-black text-white transition hover:bg-leaf-600"
            href="#splash"
          >
            Join deals list
          </a>
        </aside>

        <div className="grid gap-5 md:grid-cols-3">
          {products.map((product) => (
            <article className="group overflow-hidden rounded-md border border-neutral-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft" key={product.name}>
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <img
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  src={product.image}
                  alt={product.name}
                />
                <span className="absolute left-4 top-4 rounded-md bg-citrus-500 px-3 py-1 text-xs font-black text-white">
                  {product.tag}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-black text-ink">{product.name}</h3>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xl font-black text-citrus-500">{product.price}</span>
                  <span className="text-sm font-bold text-neutral-400 line-through">{product.previousPrice}</span>
                </div>
                <button className="mt-5 w-full rounded-md border border-citrus-500 px-4 py-3 text-sm font-black text-citrus-600 transition hover:bg-citrus-500 hover:text-white" type="button">
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
