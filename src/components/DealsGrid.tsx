import { getHomepageCatalog } from "../services/catalog";
import { ProductCarousel } from "./ProductCarousel";

export function DealsGrid() {
  const productCarouselSections = getHomepageCatalog();
  return (
    <div className="bg-white pb-16" id="best-deals">
      {productCarouselSections.map((section) => (
        <ProductCarousel key={section.sectionId} section={section} />
      ))}
    </div>
  );
}
