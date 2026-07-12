import type {
  CatalogQuery,
  Category,
  CategoryFilterBrand,
  DeliveryTypeOption,
  MadeInOption,
  PaginatedProductResult,
  Product,
  ProductCarouselSection,
  ProductTypeOption,
} from "../../types/catalog";

export interface CatalogRepository {
  getHomepageCatalog(): ProductCarouselSection[];
  getCategories(): Category[];
  getCategoryBySlug(slug: string | null): Category;
  getProducts(query?: CatalogQuery): PaginatedProductResult;
  getCategoryProducts(slug: string | null): Product[];
  getProductById(id: string | null): Product;
  getRelatedProducts(product: Product, limit?: number): Product[];
  searchProducts(query: string): Product[];
  getAvailableFilterBrands(): CategoryFilterBrand[];
  getAvailableDeliveryTypes(): DeliveryTypeOption[];
  getAvailableProductTypes(): ProductTypeOption[];
  getAvailableMadeInOptions(): MadeInOption[];
}
