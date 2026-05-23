import { productCarouselSections } from "../data/home";
import { ProductCarousel } from "./ProductCarousel";

export function DealsGrid() {
  return (
    <div className="bg-white pb-16" id="best-deals">
      {productCarouselSections.map((section) => (
        <ProductCarousel key={section.sectionId} section={section} />
      ))}
    </div>
  );
}
