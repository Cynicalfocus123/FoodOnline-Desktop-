import {
  categories,
  getAvailableDeliveryTypes,
  getAvailableFilterBrands,
  getAvailableMadeInOptions,
  getAvailableProductTypes,
  getCategoryBySlug,
  getCategoryListingProducts,
  getProductById,
  getRelatedProducts,
  productCarouselSections,
  productCatalog,
  searchProducts,
} from "../../data/home";
import type { CatalogQuery, Product } from "../../types/catalog";
import type { CatalogRepository } from "./catalogRepository";

export const localCatalogRepository: CatalogRepository = {
  getHomepageCatalog: async () => productCarouselSections,
  getCategories: async () => categories,
  getCategoryBySlug: async (slug) => getCategoryBySlug(slug),
  getCategoryProducts: async (slug) => getCategoryListingProducts(slug),
  getProductById: async (id) => getProductById(id),
  getRelatedProducts: async (product, limit) => getRelatedProducts(product, limit),
  searchProducts: async (query) => searchProducts(query),
  getAvailableFilterBrands: async () => getAvailableFilterBrands(),
  getAvailableDeliveryTypes: async () => getAvailableDeliveryTypes(),
  getAvailableProductTypes: async () => getAvailableProductTypes(),
  getAvailableMadeInOptions: async () => getAvailableMadeInOptions(),
  async getProducts(query: CatalogQuery = {}) {
    let products: Product[] = query.search
      ? searchProducts(query.search)
      : query.categorySlug
        ? getCategoryListingProducts(query.categorySlug)
        : productCatalog;

    if (query.sort === "best-selling") {
      products = [...products].sort((left, right) => right.soldCount - left.soldCount);
    } else if (query.sort === "price-low") {
      products = [...products].sort((left, right) => left.price - right.price);
    } else if (query.sort === "price-high") {
      products = [...products].sort((left, right) => right.price - left.price);
    }

    const pageSize = Math.max(1, query.pageSize ?? (products.length || 1));
    const page = Math.max(1, query.page ?? 1);
    const start = (page - 1) * pageSize;

    return {
      items: products.slice(start, start + pageSize),
      page,
      pageSize,
      total: products.length,
    };
  },
};
