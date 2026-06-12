import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ProductReview,
  RatingBreakdown,
  formatPrice,
  getProductById,
  getRelatedProducts,
} from "../data/home";
import { useHomeStore } from "../store/homeStore";
import { CartQuantityControl } from "./CartQuantityControl";
import { ProductCard } from "./ProductCard";

type DetailTabKey = "details" | "recipe" | "nutrition" | "returns";
type ReviewFilter = "all" | "purchased" | "photos";

const detailTabs: Array<{ key: DetailTabKey; label: string }> = [
  { key: "details", label: "Product Details" },
  { key: "recipe", label: "Recipe" },
  { key: "nutrition", label: "Nutrition Facts" },
  { key: "returns", label: "Return Policy" },
];

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-5 w-5 ${filled ? "fill-[#ef4444] text-[#ef4444]" : "fill-none text-neutral-700"}`}
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

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.9 7.4-4.2" />
      <path d="m8.2 13.1 7.4 4.2" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-5 w-5 ${direction === "right" ? "" : "rotate-180"}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-leaf-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 7.5h11.5v7H3z" />
      <path d="M14.5 10.5h3.8l2.2 2.2v2.8h-6z" />
      <circle cx="7.3" cy="18" r="1.8" />
      <circle cx="17.3" cy="18" r="1.8" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-leaf-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-leaf-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 3.6 5 6v5.7c0 4.3 2.8 7.9 7 9.3 4.2-1.4 7-5 7-9.3V6z" />
      <path d="m9.5 11.8 1.8 1.8 3.4-3.7" />
    </svg>
  );
}

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" className={`h-4 w-4 ${active ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}`} viewBox="0 0 20 20">
      <path d="m10 1.8 2.5 5 5.5.8-4 3.9.9 5.5L10 14.4 5.1 17l.9-5.5-4-3.9 5.5-.8z" />
    </svg>
  );
}

function RatingStars({ value }: { value: number }) {
  const filled = Math.round(value);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon active={index < filled} key={index} />
      ))}
    </div>
  );
}

function reviewDateValue(date: string) {
  const [month = "1", day = "1", year = "1970"] = date.split("/");
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
}

function DetailMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">{label}</span>
      <span className="text-sm font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <article className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-neutral-950">{review.customerName}</h4>
            {review.verifiedPurchase ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                Verified purchase
              </span>
            ) : null}
          </div>
          <RatingStars value={review.rating} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">{review.date}</span>
      </div>
      <p className="mt-4 text-sm leading-7 text-neutral-600">{review.text}</p>
      {review.tags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {review.images.length ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {review.images.map((image, index) => (
            <img
              alt={`${review.customerName} review ${index + 1}`}
              className="h-20 w-20 shrink-0 rounded-2xl border border-neutral-200 object-cover"
              key={`${review.id}-${index}`}
              loading="lazy"
              src={image}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function RatingBreakdownRows({
  breakdown,
  totalReviews,
}: {
  breakdown: RatingBreakdown;
  totalReviews: number;
}) {
  return (
    <div className="grid gap-2.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = breakdown[star as 1 | 2 | 3 | 4 | 5] ?? 0;
        const percentage = totalReviews ? Math.round((count / totalReviews) * 100) : 0;

        return (
          <div className="grid grid-cols-[42px_minmax(0,1fr)_42px] items-center gap-3" key={star}>
            <span className="text-sm font-semibold text-neutral-700">{star} star</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${percentage}%` }} />
            </div>
            <span className="text-right text-sm font-semibold text-neutral-500">{percentage}%</span>
          </div>
        );
      })}
    </div>
  );
}

function SectionShell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-6">
      {children}
    </div>
  );
}

export function ProductDetailPage() {
  const selectedProductId = useHomeStore((state) => state.selectedProductId);
  const selectedZipCode = useHomeStore((state) => state.selectedZipCode);
  const favoriteProductIds = useHomeStore((state) => state.favoriteProductIds);
  const toggleFavorite = useHomeStore((state) => state.toggleFavorite);
  const backToProducts = useHomeStore((state) => state.backToProducts);
  const product = getProductById(selectedProductId);
  const relatedProducts = useMemo(() => getRelatedProducts(product, 10), [product]);
  const isFavorite = favoriteProductIds.includes(product.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTabKey>("details");
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [isMostRecent, setIsMostRecent] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const galleryScrollRef = useRef<HTMLDivElement | null>(null);
  const relatedScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveImageIndex(0);
    setActiveTab("details");
    setSelectedVariantId(product.variants[0]?.id ?? "");
    setIsReviewsOpen(false);
    setReviewFilter("all");
    setIsMostRecent(false);
    setShareNotice(null);
  }, [product.id]);

  useEffect(() => {
    if (!isReviewsOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isReviewsOpen]);

  useEffect(() => {
    const galleryElement = galleryScrollRef.current;

    if (!galleryElement) {
      return;
    }

    galleryElement.scrollTo({ left: 0, behavior: "auto" });
  }, [product.id]);

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
  const selectedPrice = selectedVariant?.price ?? product.price;
  const selectedOldPrice =
    product.oldPrice && product.price > 0 ? Number((product.oldPrice * (selectedPrice / product.price)).toFixed(2)) : product.oldPrice;
  const selectedUnitPrice = selectedVariant?.unitPrice ?? product.unitPrice;
  const selectedPackSize = selectedVariant?.packSize ?? product.quantity;
  const previewReviews = product.reviews.slice(0, 3);
  const filteredReviews = useMemo(() => {
    const baseReviews = product.reviews.filter((review) => {
      if (reviewFilter === "purchased") {
        return review.isPurchased || review.verifiedPurchase;
      }

      if (reviewFilter === "photos") {
        return review.images.length > 0;
      }

      return true;
    });

    if (!isMostRecent) {
      return baseReviews;
    }

    return [...baseReviews].sort((left, right) => reviewDateValue(right.date) - reviewDateValue(left.date));
  }, [isMostRecent, product.reviews, reviewFilter]);

  function scrollRelated(direction: "left" | "right") {
    relatedScrollRef.current?.scrollBy({
      left: direction === "left" ? -340 : 340,
      behavior: "smooth",
    });
  }

  function scrollGalleryTo(index: number) {
    const galleryElement = galleryScrollRef.current;

    if (!galleryElement) {
      return;
    }

    galleryElement.scrollTo({
      left: galleryElement.clientWidth * index,
      behavior: "smooth",
    });
    setActiveImageIndex(index);
  }

  function handleGalleryScroll() {
    const galleryElement = galleryScrollRef.current;

    if (!galleryElement) {
      return;
    }

    const nextIndex = Math.round(galleryElement.scrollLeft / Math.max(galleryElement.clientWidth, 1));
    setActiveImageIndex(Math.min(product.imageUrls.length - 1, Math.max(0, nextIndex)));
  }

  async function handleShare() {
    const productUrl = `${window.location.origin}${window.location.pathname}#product/${product.id}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.name, url: productUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(productUrl);
      }

      setShareNotice("Share link ready");
      window.setTimeout(() => setShareNotice(null), 1800);
    } catch {
      setShareNotice("Share cancelled");
      window.setTimeout(() => setShareNotice(null), 1800);
    }
  }

  return (
    <div className="bg-[#fcfcfd] pb-16 pt-[136px] sm:pt-[150px] lg:pt-[168px]" id="product-root">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:gap-10">
        <button
          className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
          onClick={() => backToProducts(product.categorySlug)}
          type="button"
        >
          <ArrowIcon direction="left" />
          <span>Back to products</span>
        </button>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
          <div className="grid gap-4 lg:pr-4">
            <div
              className="overflow-x-auto overscroll-x-contain scrollbar-none snap-x snap-mandatory"
              onScroll={handleGalleryScroll}
              ref={galleryScrollRef}
            >
              <div className="flex">
                {product.imageUrls.map((image, index) => (
                  <div className="w-full shrink-0 snap-center" key={`${product.id}-image-${index}`}>
                    <div className="flex min-h-[360px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#f9fcf8_0%,_#ffffff_58%,_#ffffff_100%)] sm:min-h-[460px] lg:min-h-[620px]">
                      <img
                        alt={`${product.name} image ${index + 1}`}
                        className="h-full max-h-[620px] w-full object-contain"
                        draggable={false}
                        src={image}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {product.imageUrls.length > 1 ? (
              <div className="flex justify-center gap-2 lg:hidden">
                {product.imageUrls.map((_, index) => (
                  <button
                    aria-label={`Show image ${index + 1}`}
                    className={`h-2.5 rounded-full transition ${index === activeImageIndex ? "w-8 bg-neutral-900" : "w-2.5 bg-neutral-300"}`}
                    key={`${product.id}-dot-${index}`}
                    onClick={() => scrollGalleryTo(index)}
                    type="button"
                  />
                ))}
              </div>
            ) : null}

            {product.imageUrls.length > 1 ? (
              <div className="hidden rounded-[26px] border border-neutral-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] lg:block">
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {product.imageUrls.map((image, index) => (
                    <button
                      aria-label={`Show desktop image ${index + 1}`}
                      className={`shrink-0 overflow-hidden rounded-[18px] border-2 bg-neutral-50 transition ${
                        index === activeImageIndex
                          ? "border-leaf-500 shadow-[0_10px_22px_rgba(34,197,94,0.16)]"
                          : "border-transparent hover:border-neutral-300"
                      }`}
                      key={`${product.id}-desktop-thumb-${index}`}
                      onClick={() => scrollGalleryTo(index)}
                      type="button"
                    >
                      <img
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="h-24 w-24 object-cover"
                        draggable={false}
                        loading="lazy"
                        src={image}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-5 lg:sticky lg:top-[182px]">
            <SectionShell>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="grid gap-3">
                  <div className="flex flex-wrap gap-2">
                    {product.badges.map((badge) => (
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-600" key={badge}>
                        {badge}
                      </span>
                    ))}
                  </div>
                  <h1 className="max-w-3xl text-3xl font-black tracking-[-0.03em] text-neutral-950 sm:text-[2.35rem]">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-neutral-500">
                    <span>{selectedPackSize}</span>
                    <span>{selectedUnitPrice}</span>
                    <span>{product.soldCount}+ sold</span>
                    <span>{product.provider}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <IconButton label={isFavorite ? "Remove from favorites" : "Save item"} onClick={() => toggleFavorite(product.id)}>
                    <HeartIcon filled={isFavorite} />
                  </IconButton>
                  <IconButton label="Share product" onClick={handleShare}>
                    <ShareIcon />
                  </IconButton>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-3">
                <span className="text-[2.2rem] font-black tracking-[-0.04em] text-neutral-950">{formatPrice(selectedPrice)}</span>
                {selectedOldPrice ? (
                  <span className="pb-1 text-lg font-semibold text-neutral-400 line-through">{formatPrice(selectedOldPrice)}</span>
                ) : null}
                {product.discountPercent ? (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-600">
                    Save {product.discountPercent}%
                  </span>
                ) : null}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                <RatingStars value={product.averageRating} />
                <span className="font-semibold text-neutral-700">{product.averageRating.toFixed(1)}</span>
                <span>{product.reviewCount} reviews</span>
                {shareNotice ? <span className="font-semibold text-leaf-600">{shareNotice}</span> : null}
              </div>

              <div className="mt-6 grid gap-3">
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        variant.id === selectedVariantId
                          ? "border-leaf-500 bg-emerald-50 text-leaf-700 shadow-[0_8px_18px_rgba(34,197,94,0.12)]"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      type="button"
                    >
                      <span className="block text-sm font-bold">{variant.label}</span>
                      <span className="mt-1 block text-xs font-semibold text-neutral-500">{variant.packSize}</span>
                    </button>
                  ))}
                </div>
                <CartQuantityControl productId={product.id} variant="detail" />
              </div>
            </SectionShell>

            <SectionShell>
              <div className="flex items-start gap-3">
                <PinIcon />
                <div className="grid gap-1">
                  <h2 className="text-base font-black text-neutral-950">Ships to your selected address</h2>
                  <p className="text-sm text-neutral-600">
                    ZIP {selectedZipCode || "91789"} - inventory and local delivery timing update from your chosen location.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <TruckIcon />
                    <span className="text-sm font-bold text-neutral-900">Delivery speed</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">{product.deliveryTime} delivery window for most nearby orders.</p>
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <TruckIcon />
                    <span className="text-sm font-bold text-neutral-900">Free shipping</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">Free shipping over $35 on eligible grocery baskets.</p>
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ShieldIcon />
                    <span className="text-sm font-bold text-neutral-900">Easy returns</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">Damaged or missing items can be reported quickly with photo support.</p>
                </div>
              </div>
            </SectionShell>
          </div>
        </section>

        <section className="grid gap-6">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {detailTabs.map((tab) => (
              <button
                className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-bold transition ${
                  tab.key === activeTab
                    ? "border-leaf-500 bg-leaf-600 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "details" ? (
            <SectionShell>
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="grid gap-4">
                  <div>
                    <h2 className="text-xl font-black text-neutral-950">Product Details</h2>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">{product.description}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailMetaRow label="Quantity / Net Content" value={`${product.quantity} / ${product.netContent}`} />
                    <DetailMetaRow label="Brand" value={product.brand} />
                    <DetailMetaRow label="Brand Origin" value={product.brandOrigin} />
                    <DetailMetaRow label="Country of Origin" value={product.countryOfOrigin} />
                    <DetailMetaRow label="Provider / Seller" value={product.provider} />
                    <DetailMetaRow label="Category" value={product.categoryName} />
                    <DetailMetaRow label="Storage" value={product.storageInstructions ?? "Store as labeled on pack."} />
                    <DetailMetaRow label="SKU" value={product.sku} />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[24px] border border-neutral-100 bg-neutral-50 p-5">
                    <h3 className="text-sm font-black uppercase tracking-[0.16em] text-neutral-500">Ingredients</h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">
                      {product.ingredients ?? "Ingredients will be supplied from backend catalog data when available."}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-neutral-100 bg-neutral-50 p-5">
                    <h3 className="text-sm font-black uppercase tracking-[0.16em] text-neutral-500">Tags</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SectionShell>
          ) : null}

          {activeTab === "recipe" ? (
            <SectionShell>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-neutral-950">Recipe ideas</h2>
                  <p className="mt-2 text-sm text-neutral-600">Demo recipe cards stay backend-ready and can swap to live content later.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {product.recipeSuggestions.map((recipe) => (
                  <article className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-5" key={recipe.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-black text-neutral-950">{recipe.title}</h3>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                        {recipe.prepTime}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">{recipe.description}</p>
                    <p className="mt-3 text-sm font-semibold text-neutral-700">{recipe.usage}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {recipe.ingredients.map((ingredient) => (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm" key={ingredient}>
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </SectionShell>
          ) : null}

          {activeTab === "nutrition" ? (
            <SectionShell>
              <h2 className="text-xl font-black text-neutral-950">Nutrition Facts</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Values below are sample demo nutrition data and should be replaced by provider-fed catalog values when available.
              </p>
              <div className="mt-5 hidden overflow-hidden rounded-[24px] border border-neutral-200 sm:block">
                <table className="w-full border-collapse">
                  <tbody>
                    {[
                      ["Serving size", product.nutritionFacts.servingSize],
                      ["Calories", String(product.nutritionFacts.calories)],
                      ["Total fat", product.nutritionFacts.totalFat],
                      ["Sodium", product.nutritionFacts.sodium],
                      ["Carbohydrates", product.nutritionFacts.carbohydrates],
                      ["Sugar", product.nutritionFacts.sugar],
                      ["Protein", product.nutritionFacts.protein],
                    ].map(([label, value]) => (
                      <tr className="border-b border-neutral-200 last:border-b-0" key={label}>
                        <th className="bg-neutral-50 px-5 py-4 text-left text-sm font-bold text-neutral-700">{label}</th>
                        <td className="px-5 py-4 text-sm font-semibold text-neutral-900">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 grid gap-3 sm:hidden">
                {[
                  ["Serving size", product.nutritionFacts.servingSize],
                  ["Calories", String(product.nutritionFacts.calories)],
                  ["Total fat", product.nutritionFacts.totalFat],
                  ["Sodium", product.nutritionFacts.sodium],
                  ["Carbohydrates", product.nutritionFacts.carbohydrates],
                  ["Sugar", product.nutritionFacts.sugar],
                  ["Protein", product.nutritionFacts.protein],
                ].map(([label, value]) => (
                  <DetailMetaRow key={label} label={label} value={value} />
                ))}
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                <div className="rounded-[24px] border border-neutral-100 bg-neutral-50 p-5">
                  <h3 className="text-sm font-black uppercase tracking-[0.16em] text-neutral-500">Ingredients note</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{product.nutritionFacts.ingredientsNote}</p>
                </div>
                <div className="rounded-[24px] border border-neutral-100 bg-neutral-50 p-5">
                  <h3 className="text-sm font-black uppercase tracking-[0.16em] text-neutral-500">Allergen note</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{product.nutritionFacts.allergenNote}</p>
                </div>
              </div>
            </SectionShell>
          ) : null}

          {activeTab === "returns" ? (
            <SectionShell>
              <h2 className="text-xl font-black text-neutral-950">Return Policy</h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-neutral-100 bg-neutral-50 p-5">
                  <h3 className="text-sm font-black uppercase tracking-[0.16em] text-neutral-500">Policy overview</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{product.returnPolicy}</p>
                </div>
                <div className="grid gap-3">
                  <DetailMetaRow label="Return eligibility" value="Unopened, unused items within 7 days of delivery." />
                  <DetailMetaRow label="Damaged or missing" value="Report with photos and item details for quick support." />
                  <DetailMetaRow label="Time window" value="Support review starts as soon as issue is submitted." />
                  <DetailMetaRow label="Contact support" value="Use the existing help flow or order support channel." />
                </div>
              </div>
            </SectionShell>
          ) : null}
        </section>

        <section className="grid gap-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-neutral-950">Similar Items</h2>
              <p className="mt-2 text-sm text-neutral-600">First fill comes from same category, then broad catalog fallback.</p>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <IconButton label="Scroll similar items left" onClick={() => scrollRelated("left")}>
                <ArrowIcon direction="left" />
              </IconButton>
              <IconButton label="Scroll similar items right" onClick={() => scrollRelated("right")}>
                <ArrowIcon direction="right" />
              </IconButton>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory" ref={relatedScrollRef}>
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 pb-4">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionShell>
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-neutral-500">Customer Reviews</p>
                  <div className="mt-3 flex items-end gap-4">
                    <span className="text-[3rem] font-black leading-none text-neutral-950">{product.averageRating.toFixed(1)}</span>
                    <div className="grid gap-1 pb-1">
                      <RatingStars value={product.averageRating} />
                      <span className="text-sm font-semibold text-neutral-500">{product.reviewCount} total reviews</span>
                    </div>
                  </div>
                </div>
                <RatingBreakdownRows breakdown={product.ratingBreakdown} totalReviews={product.reviewCount} />
                <div className="flex flex-wrap gap-2">
                  {product.reviewTags.map((tag) => (
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-neutral-200 px-5 text-sm font-bold text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
                  onClick={() => setIsReviewsOpen(true)}
                  type="button"
                >
                  See all reviews
                </button>
              </div>
            </SectionShell>

            <div className="grid gap-4">
              {previewReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {isReviewsOpen ? (
        <div
          className="fixed inset-0 z-[1400] flex items-end justify-center bg-neutral-950/45 p-0 sm:items-center sm:p-6"
          onClick={() => setIsReviewsOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)] sm:max-w-5xl sm:rounded-[32px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-5 sm:px-7">
              <div>
                <h3 className="text-2xl font-black text-neutral-950">All reviews</h3>
                <p className="mt-2 text-sm text-neutral-600">Filter, sort, and scan all customer feedback for this product.</p>
              </div>
              <button
                aria-label="Close reviews"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                onClick={() => setIsReviewsOpen(false)}
                type="button"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 6 18 18" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-7">
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="grid gap-5">
                  <SectionShell>
                    <div className="grid gap-5">
                      <div className="flex items-end gap-4">
                        <span className="text-[3.2rem] font-black leading-none text-neutral-950">{product.averageRating.toFixed(1)}</span>
                        <div className="grid gap-1 pb-1">
                          <RatingStars value={product.averageRating} />
                          <span className="text-sm font-semibold text-neutral-500">{product.reviewCount} reviews</span>
                        </div>
                      </div>
                      <RatingBreakdownRows breakdown={product.ratingBreakdown} totalReviews={product.reviewCount} />
                      <button
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-neutral-200 px-4 text-sm font-bold text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-50"
                        type="button"
                      >
                        Write a Review
                      </button>
                    </div>
                  </SectionShell>
                </div>

                <div className="grid gap-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "all", label: "All" },
                      { key: "purchased", label: "Purchased" },
                      { key: "photos", label: "Photos" },
                    ].map((filter) => (
                      <button
                        className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                          reviewFilter === filter.key
                            ? "border-leaf-500 bg-leaf-600 text-white"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                        }`}
                        key={filter.key}
                        onClick={() => setReviewFilter(filter.key as ReviewFilter)}
                        type="button"
                      >
                        {filter.label}
                      </button>
                    ))}
                    <button
                      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                        isMostRecent
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                      onClick={() => setIsMostRecent((current) => !current)}
                      type="button"
                    >
                      Most Recent
                    </button>
                  </div>

                  {filteredReviews.length ? (
                    <div className="grid gap-4">
                      {filteredReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  ) : (
                    <SectionShell>
                      <div className="grid gap-2">
                        <h4 className="text-lg font-black text-neutral-950">No reviews in this filter yet</h4>
                        <p className="text-sm leading-7 text-neutral-600">
                          Try another review filter or turn off Most Recent to see more customer feedback.
                        </p>
                      </div>
                    </SectionShell>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
