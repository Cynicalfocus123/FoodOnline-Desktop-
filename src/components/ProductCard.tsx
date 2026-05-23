import { ProductItem } from "../data/home";

type ProductCardProps = {
  product: ProductItem;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="flex h-full w-[176px] shrink-0 snap-start flex-col rounded-[22px] border border-neutral-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:w-[188px]">
      <div className="rounded-[18px] bg-neutral-50 p-3">
        <img
          alt={product.name}
          className="aspect-[4/3] w-full rounded-2xl object-cover"
          loading="lazy"
          src={product.image}
        />
      </div>
      <span className="mt-3 inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold tracking-[0.14em] text-emerald-700">
        {product.deliveryTime}
      </span>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{product.brand}</p>
      <h3 className="mt-1 text-[15px] font-semibold leading-5 text-neutral-900 line-clamp-2 sm:text-base">
        {product.name}
      </h3>
      <p className="mt-2 text-sm font-medium text-neutral-500">{product.size}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <span className="text-lg font-bold text-neutral-950">{product.price}</span>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-leaf-500 px-4 text-sm font-bold text-leaf-600 transition hover:bg-leaf-500 hover:text-white"
          type="button"
        >
          ADD
        </button>
      </div>
    </article>
  );
}
