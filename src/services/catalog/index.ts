import { catalogRepository } from "./repository";

export type { CatalogRepository } from "./catalogRepository";
export type { ApiProductDto } from "./apiProductMapper";
export { mapApiProduct } from "./apiProductMapper";
export { mapApiCategory } from "./apiCategoryMapper";
export { useCatalogProducts } from "./useCatalogProducts";
export type * from "../../types/catalog";

export const getHomepageCatalog = () => catalogRepository.getHomepageCatalog();
export const getCategories = () => catalogRepository.getCategories();
export const getCategoryBySlug = (slug: string | null) => catalogRepository.getCategoryBySlug(slug);
export const getProducts = (query = {}) => catalogRepository.getProducts(query);
export const getCategoryListingProducts = (slug: string | null) => catalogRepository.getCategoryProducts(slug);
export const getProductById = (id: string | null) => catalogRepository.getProductById(id);
export const getRelatedProducts = (product: import("../../types/catalog").Product, limit?: number) =>
  catalogRepository.getRelatedProducts(product, limit);
export const searchProducts = (query: string) => catalogRepository.searchProducts(query);
export const getAvailableFilterBrands = () => catalogRepository.getAvailableFilterBrands();
export const getAvailableDeliveryTypes = () => catalogRepository.getAvailableDeliveryTypes();
export const getAvailableProductTypes = () => catalogRepository.getAvailableProductTypes();
export const getAvailableMadeInOptions = () => catalogRepository.getAvailableMadeInOptions();

export { formatPrice } from "../../data/home";
