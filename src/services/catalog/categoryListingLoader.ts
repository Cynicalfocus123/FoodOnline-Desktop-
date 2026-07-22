import { catalogSource } from "../../lib/runtimeConfig";
import { catalogRepository } from "./repository";
import { localCatalogRepository } from "./localCatalogRepository";
import {
  createCategoryListingLoader,
  type CategoryListingFilters,
  type CategoryListingSnapshot,
} from "./categoryListingLoadLogic";

export { createCategoryListingRequestGuard } from "./categoryListingLoadLogic";
export type { CategoryListingFilters, CategoryListingSnapshot } from "./categoryListingLoadLogic";

async function getFilters() {
  const [delivery, productType, madeIn, brands] = await Promise.all([
    catalogRepository.getAvailableDeliveryTypes(),
    catalogRepository.getAvailableProductTypes(),
    catalogRepository.getAvailableMadeInOptions(),
    catalogRepository.getAvailableFilterBrands(),
  ]);
  return { delivery, productType, madeIn, brands };
}

const categoryListingLoader = createCategoryListingLoader({
  async getLocalSnapshot(slug) {
    if (catalogSource === "api") return { category: null, products: [] };
    const category = await localCatalogRepository.getCategoryBySlug(slug);
    return {
      category,
      products: category ? await localCatalogRepository.getCategoryProducts(category.categorySlug) : [],
    };
  },
  getFilters,
  async getResolvedSnapshot(slug) {
    const [category, products, filters] = await Promise.all([
      catalogRepository.getCategoryBySlug(slug),
      catalogRepository.getCategoryProducts(slug),
      getFilters(),
    ]);
    return { category, products, filters };
  },
});

export function loadCategoryListing(
  slug: string | null,
  onKnownProducts: (snapshot: Pick<CategoryListingSnapshot, "category" | "products">) => void,
) {
  return categoryListingLoader(slug, onKnownProducts);
}
