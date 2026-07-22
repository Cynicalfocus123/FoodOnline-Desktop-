import type { ProductCarouselSection } from "../types/catalog";

export function categorySlugForSection(section: ProductCarouselSection) {
  const match = section.seeAllHref.match(/category\/([^?#/]+)/i);
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
  return section.sectionId.replace(/^category-/, "");
}
