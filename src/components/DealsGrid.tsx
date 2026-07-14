import { useEffect, useState } from "react";
import { getHomepageCatalog, type ProductCarouselSection } from "../services/catalog";
import { ProductCarousel } from "./ProductCarousel";

export function DealsGrid() {
  const [productCarouselSections, setProductCarouselSections] = useState<ProductCarouselSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    void getHomepageCatalog().then((items) => mounted && setProductCarouselSections(items)).catch(() => mounted && setError("Catalog sections are temporarily unavailable."));
    return () => { mounted = false; };
  }, []);
  return (
    <div className="bg-white pb-16" id="best-deals">
      {error ? <p className="mx-auto max-w-7xl px-4 py-8 text-sm font-semibold text-amber-800">{error}</p> : null}
      {productCarouselSections.map((section) => (
        <ProductCarousel key={section.sectionId} section={section} />
      ))}
    </div>
  );
}
