import { apiRequest } from "../../lib/apiClient";
import { getPublicRouteHref } from "../../lib/routes";
import type { CatalogQuery, Category, CategoryFilterBrand, DeliveryTypeOption, MadeInOption, PaginatedProductResult, Product, ProductCarouselSection, ProductTypeOption } from "../../types/catalog";
import { mapApiCategory, type ApiCategoryDto } from "./apiCategoryMapper";
import { mapApiProduct, type ApiProductDto } from "./apiProductMapper";
import type { CatalogRepository } from "./catalogRepository";

type ApiCollection<T> = { data: T[]; meta?: { current_page?: number; per_page?: number; total?: number } };
type ApiCategoryResponse = { data: ApiCategoryDto };

function queryString(query: CatalogQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.categorySlug) params.set("category", query.categorySlug);
  if (query.brand) params.set("brand", query.brand);
  if (query.countryOfOrigin) params.set("country_of_origin", query.countryOfOrigin);
  if (query.storageType) params.set("storage_type", query.storageType);
  if (query.availability) params.set("availability", query.availability);
  if (query.featured != null) params.set("featured", String(query.featured ? 1 : 0));
  if (query.minPrice != null) params.set("min_price", String(query.minPrice));
  if (query.maxPrice != null) params.set("max_price", String(query.maxPrice));
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("per_page", String(query.pageSize));
  params.set("sort", query.sort === "price-low" ? "price_asc" : query.sort === "price-high" ? "price_desc" : query.sort === "best-selling" ? "best_selling" : "featured");
  return params.toString();
}

async function listCategories(query = "homepage=1&per_page=100&sort=sort_order") {
  const response = await apiRequest<ApiCollection<ApiCategoryDto>>(`/catalog/categories?${query}`);
  return response.data.map(mapApiCategory);
}

async function listProducts(query: CatalogQuery = {}) {
  const response = await apiRequest<ApiCollection<ApiProductDto>>(`/catalog/products?${queryString(query)}`);
  const items = response.data.map((item) => mapApiProduct(item));
  return {
    items,
    page: response.meta?.current_page ?? query.page ?? 1,
    pageSize: response.meta?.per_page ?? query.pageSize ?? items.length,
    total: response.meta?.total ?? items.length,
  } satisfies PaginatedProductResult;
}

async function listAllHomepageProducts() {
  const first = await listProducts({ page: 1, pageSize: 100 });
  const pageSize = Math.max(1, first.pageSize || 100);
  const pageCount = Math.max(1, Math.ceil(first.total / pageSize));
  const remaining = pageCount > 1
    ? await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) => listProducts({ page: index + 2, pageSize })))
    : [];
  const seen = new Set<string>();
  return [first, ...remaining].flatMap((page) => page.items).filter((product) => {
    const identity = product.uuid ?? product.id ?? product.slug;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

export const apiCatalogRepository: CatalogRepository = {
  async getCategories() {
    return listCategories("per_page=100&sort=sort_order");
  },
  async getAllPublicCategories() {
    return listCategories("root_only=1&per_page=100&sort=sort_order");
  },
  async getNavigationCategories() {
    return listCategories("navigation=1&root_only=1&per_page=100&sort=sort_order");
  },
  async getHomepageCategories() {
    return listCategories("homepage=1&root_only=1&per_page=100&sort=sort_order");
  },
  async getCategoryBySlug(slug) {
    if (!slug) return null;
    const response = await apiRequest<ApiCategoryResponse>(`/catalog/categories/${encodeURIComponent(slug)}`);
    return mapApiCategory(response.data);
  },
  async getCategoryProducts(slug) {
    return (await listProducts({ categorySlug: slug ?? undefined, pageSize: 60 })).items;
  },
  async getProducts(query = {}) {
    return listProducts(query);
  },
  async getProductById(id) {
    if (!id) return null;
    const response = await apiRequest<{ data: ApiProductDto }>(`/catalog/products/${encodeURIComponent(id)}`);
    return mapApiProduct(response.data);
  },
  async searchProducts(query) {
    return (await listProducts({ search: query, pageSize: 60 })).items;
  },
  async getRelatedProducts(product, limit = 8) {
    return (await listProducts({ categorySlug: product.categorySlug, pageSize: limit })).items.filter((item) => item.id !== product.id).slice(0, limit);
  },
  async getHomepageCatalog(preloadedCategories) {
    const categoryPromise = preloadedCategories
      ? Promise.resolve(preloadedCategories)
      : listCategories("homepage=1&per_page=100&sort=sort_order");
    const [categories, products] = await Promise.all([categoryPromise, listAllHomepageProducts()]);
    const sections = categories.map((category) => ({
      title: category.name,
      sectionId: category.categorySlug,
      seeAllHref: getPublicRouteHref(`category/${category.categorySlug}`),
      items: products.filter((product) => product.categorySlug === category.categorySlug),
    }));
    return sections.filter((section) => section.items.length);
  },
  async getAvailableFilterBrands() {
    const response = await apiRequest<{ data: Array<{ name?: string | null }> }>("/catalog/brands");
    return response.data.map((brand) => brand.name).filter((name): name is string => Boolean(name));
  },
  async getAvailableDeliveryTypes() { return ["Local Delivery", "GLOBAL+"] as DeliveryTypeOption[]; },
  async getAvailableProductTypes() { return ["Deals", "New Arrivals", "Recently Restocked", "SNAP"] as ProductTypeOption[]; },
  async getAvailableMadeInOptions() { return ["USA", "Spain", "Russia", "China", "Korea", "Japan"] as MadeInOption[]; },
};
