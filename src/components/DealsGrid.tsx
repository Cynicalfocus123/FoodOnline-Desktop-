import { useHomepageCatalog } from "../services/catalog/useHomepageCatalog";
import { ProductCarousel } from "./ProductCarousel";

export function DealsGrid() {
  const { sections: productCarouselSections, error, phase } = useHomepageCatalog();
  return (
    <div className="bg-white pb-16" id="best-deals">
      {error ? <p className="mx-auto max-w-7xl px-4 py-8 text-sm font-semibold text-amber-800">{error}</p> : null}
      {productCarouselSections.length === 0 && phase === "loading" ? (
        <div aria-hidden="true" className="mx-auto grid max-w-7xl gap-5 px-4 py-7 sm:px-6">
          {Array.from({ length: 2 }, (_, index) => <div className="h-[376px] animate-pulse rounded-[24px] bg-neutral-50" key={`rail-skeleton-${index}`} />)}
        </div>
      ) : null}
      {productCarouselSections.map((section) => (
        <ProductCarousel key={section.sectionId} section={section} />
      ))}
    </div>
  );
}
