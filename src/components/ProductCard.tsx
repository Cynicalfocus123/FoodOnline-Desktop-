import { KeyboardEvent, MouseEvent } from "react";
import { ProductItem, formatPrice } from "../data/home";
import { useHomeStore } from "../store/homeStore";
import { CartQuantityControl } from "./CartQuantityControl";

type ProductCardProps = {
  product: ProductItem;
  layout?: "carousel" | "grid";
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

export function ProductCard({ product, layout = "carousel" }: ProductCardProps) {
  const openProduct = useHomeStore((state) => state.openProduct);
  const favoriteProductIds = useHomeStore((state) => state.favoriteProductIds);
  const toggleFavorite = useHomeStore((state) => state.toggleFavorite);
  const isFavorite = favoriteProductIds.includes(product.id);
  const isGrid = layout === "grid";
  const usesExpandedCategoryImage =
    (product.categorySlug === "dairy-bread-eggs" ||
      product.categorySlug === "fruits-vegetables" ||
      product.categorySlug === "cold-drinks-juices" ||
      product.categorySlug === "snacks-munchies" ||
      product.categorySlug === "breakfast-instant-food") &&
    (product.image.includes("/assets/dairy-bread-mockups/") ||
      product.image.includes("/assets/fruits-vegetables-mockups/") ||
      product.image.includes("/assets/drinks-beverage-mockups/") ||
      product.image.includes("/assets/snacks-munchies-mockups/") ||
      product.image.includes("/assets/breakfast-instant-food-mockups/"));

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
      className={`flex h-full cursor-pointer flex-col self-stretch border border-neutral-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${
        isGrid
          ? "min-h-[292px] rounded-[22px] p-2.5 sm:min-h-[306px] sm:p-3"
          : "min-h-[356px] rounded-[24px] p-3 sm:min-h-[366px] lg:min-h-[376px]"
      } ${
        layout === "carousel"
          ? "w-[184px] shrink-0 snap-start sm:w-[194px] lg:w-[204px]"
          : "w-full min-w-0"
      }`}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={`relative bg-neutral-50 ${isGrid ? "rounded-[18px] p-2" : "rounded-[18px] p-3"}`}>
        <button
          aria-label={isFavorite ? "Remove favorite" : "Save favorite"}
          className={`absolute inline-flex items-center justify-center rounded-full border border-white/80 bg-white/95 shadow-sm transition hover:bg-white ${
            isGrid ? "right-2.5 top-2.5 h-7 w-7" : "right-3 top-3 h-8 w-8"
          }`}
          onClick={(event) => {
            stopCardOpen(event);
            toggleFavorite(product.id);
          }}
          type="button"
        >
          <HeartIcon filled={isFavorite} />
        </button>
        <div className={`overflow-hidden bg-white ${isGrid ? "aspect-square rounded-[16px]" : "aspect-[4/3] rounded-2xl"}`}>
          <img
            alt={product.name}
            className={`h-full w-full ${
              usesExpandedCategoryImage
                ? "object-cover object-center scale-[1.08] transform-gpu"
                : "object-contain"
            }`}
            loading="lazy"
            src={product.image}
          />
        </div>
        {isGrid ? (
          <div
            className="absolute bottom-2.5 right-2.5"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            role="presentation"
          >
            <CartQuantityControl productId={product.id} variant="listing" />
          </div>
        ) : null}
      </div>
      <div className={`flex flex-wrap content-start items-start ${isGrid ? "mt-2 min-h-[28px] gap-1.5" : "mt-3 min-h-[40px] gap-2"}`}>
        {product.discountPercent ? (
          <span className="inline-flex w-fit rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold tracking-[0.14em] text-red-600">
            {product.discountPercent}% OFF
          </span>
        ) : null}
      </div>
      <p className={`font-semibold uppercase tracking-[0.18em] text-neutral-400 line-clamp-1 ${isGrid ? "mt-2 min-h-[12px] text-[10px]" : "mt-2 min-h-[14px] text-[11px]"}`}>
        {product.brand}
      </p>
      <h3 className={`mt-1 font-semibold text-neutral-900 line-clamp-2 ${isGrid ? "min-h-[38px] text-[14px] leading-[1.3] sm:min-h-[42px] sm:text-[15px]" : "min-h-[52px] text-[15px] leading-5 sm:min-h-[56px] sm:text-base"}`}>
        {product.name}
      </h3>
      <p className={`font-medium text-neutral-500 ${isGrid ? "mt-1 min-h-[16px] text-[13px]" : "mt-2 min-h-[18px] text-sm"}`}>{product.size}</p>
      <p className={`font-semibold text-neutral-400 ${isGrid ? "mt-0.5 min-h-[14px] text-[11px]" : "mt-1 min-h-[16px] text-xs"}`}>{product.unitPrice}</p>
      {isGrid ? (
        <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-[1.45rem] font-black leading-none text-neutral-950">{formatPrice(product.price)}</span>
          {product.oldPrice ? (
            <span className="text-sm font-semibold text-neutral-400 line-through">{formatPrice(product.oldPrice)}</span>
          ) : null}
        </div>
      ) : (
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
      )}
    </article>
  );
}
