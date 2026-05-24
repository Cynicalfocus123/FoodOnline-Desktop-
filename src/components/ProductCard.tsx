import { KeyboardEvent, MouseEvent } from "react";
import { ProductItem, formatPrice } from "../data/home";
import { useHomeStore } from "../store/homeStore";
import { CartQuantityControl } from "./CartQuantityControl";

type ProductCardProps = {
  product: ProductItem;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-[18px] w-[18px] ${filled ? "fill-[#ef4444] text-[#ef4444]" : "fill-none text-neutral-500"}`}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M12 20.4 4.9 13.3a4.7 4.7 0 0 1 6.6-6.6L12 7.2l.5-.5a4.7 4.7 0 0 1 6.6 6.6Z" />
    </svg>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const openProduct = useHomeStore((state) => state.openProduct);
  const favoriteProductIds = useHomeStore((state) => state.favoriteProductIds);
  const toggleFavorite = useHomeStore((state) => state.toggleFavorite);
  const isFavorite = favoriteProductIds.includes(product.id);

  function handleOpen() {
    openProduct(product.id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  }

  function stopCardOpen(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  return (
    <article
      className="flex h-full min-h-[356px] w-[184px] shrink-0 snap-start cursor-pointer flex-col self-stretch rounded-[24px] border border-neutral-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:min-h-[366px] sm:w-[194px] lg:min-h-[376px] lg:w-[204px]"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="relative rounded-[18px] bg-neutral-50 p-3">
        <button
          aria-label={isFavorite ? "Remove favorite" : "Save favorite"}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/95 shadow-sm transition hover:bg-white"
          onClick={(event) => {
            stopCardOpen(event);
            toggleFavorite(product.id);
          }}
          type="button"
        >
          <HeartIcon filled={isFavorite} />
        </button>
        <img
          alt={product.name}
          className="aspect-[4/3] w-full rounded-2xl object-contain"
          loading="lazy"
          src={product.image}
        />
      </div>
      <div className="mt-3 flex min-h-[40px] flex-wrap content-start items-start gap-2">
        <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold tracking-[0.14em] text-emerald-700">
          {product.deliveryTime}
        </span>
        {product.discountPercent ? (
          <span className="inline-flex w-fit rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold tracking-[0.14em] text-red-600">
            {product.discountPercent}% OFF
          </span>
        ) : null}
      </div>
      <p className="mt-2 min-h-[14px] text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400 line-clamp-1">
        {product.brand}
      </p>
      <h3 className="mt-1 min-h-[52px] text-[15px] font-semibold leading-5 text-neutral-900 line-clamp-2 sm:min-h-[56px] sm:text-base">
        {product.name}
      </h3>
      <p className="mt-2 min-h-[18px] text-sm font-medium text-neutral-500">{product.size}</p>
      <p className="mt-1 min-h-[16px] text-xs font-semibold text-neutral-400">{product.unitPrice}</p>
      <div className="mt-auto grid min-h-[96px] grid-rows-[auto_auto] gap-3 pt-3">
        <div className="grid min-w-0 gap-1">
          <span className="text-lg font-bold text-neutral-950">{formatPrice(product.price)}</span>
          {product.oldPrice ? (
            <span className="min-h-[18px] text-xs font-semibold text-neutral-400 line-through">{formatPrice(product.oldPrice)}</span>
          ) : (
            <span className="min-h-[18px]" aria-hidden="true" />
          )}
        </div>
        <div
          className="flex min-h-[44px] w-full items-end"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          role="presentation"
        >
          <CartQuantityControl productId={product.id} />
        </div>
      </div>
    </article>
  );
}
