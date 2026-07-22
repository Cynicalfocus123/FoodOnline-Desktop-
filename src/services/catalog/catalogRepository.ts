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
  getHomepageCatalog(preloadedCategories?: Category[] | Promise<Category[]>): Promise<ProductCarouselSection[]>;
  getCategories(): Promise<Category[]>;
  getAllPublicCategories(): Promise<Category[]>;
  getNavigationCategories(): Promise<Category[]>;
  getHomepageCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string | null): Promise<Category | null>;
  getProducts(query?: CatalogQuery): Promise<PaginatedProductResult>;
  getCategoryProducts(slug: string | null): Promise<Product[]>;
  getProductById(id: string | null): Promise<Product | null>;
  getRelatedProducts(product: Product, limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getAvailableFilterBrands(): Promise<CategoryFilterBrand[]>;
  getAvailableDeliveryTypes(): Promise<DeliveryTypeOption[]>;
  getAvailableProductTypes(): Promise<ProductTypeOption[]>;
  getAvailableMadeInOptions(): Promise<MadeInOption[]>;
}
