import { categories, productCatalogById } from "../../data/home";
import { ApiError } from "../../lib/apiClient";
import type {
  CatalogQuery,
  Category,
  CategoryFilterBrand,
  DeliveryTypeOption,
  MadeInOption,
  PaginatedProductResult,
  Product,
  ProductTypeOption,
} from "../../types/catalog";
import { apiCatalogRepository } from "./apiCatalogRepository";
import type { CatalogRepository } from "./catalogRepository";
import { categoriesRepresentSameIdentity, normalizeCatalogSlug, productsExcludeSameIdentity, productsRepresentSameIdentity } from "./catalogIdentity";
import { mergeAuthoritativeHomepageSections, mergeCategory, mergeProduct, mergeProducts, mergeStringOptions } from "./catalogMerge";
import { localCatalogRepository } from "./localCatalogRepository";
import { resolveCategoryAuthority, type CategoryPlacementKind } from "./catalogCategoryAuthority";

export type CatalogSynchronizationWarning = {
  code: "catalog_api_unavailable";
  message: string;
  occurredAt: string;
};

export interface HybridCatalogRepository extends CatalogRepository {
  getSynchronizationWarning(): CatalogSynchronizationWarning | null;
}

type HybridOptions = { apiTimeoutMs?: number };
type PlacementSnapshot = { version: 1; all?: Category[]; navigation?: Category[]; homepage?: Category[] };

const placementSnapshotKey = "foodonlines:catalog-category-placement:v1";

function readPlacementSnapshot(): PlacementSnapshot {
  try {
    const value = globalThis.localStorage?.getItem(placementSnapshotKey);
    if (!value) return { version: 1 };
    const parsed = JSON.parse(value) as PlacementSnapshot;
    return parsed?.version === 1 ? parsed : { version: 1 };
  } catch {
    return { version: 1 };
  }
}

function writePlacementSnapshot(snapshot: PlacementSnapshot) {
  try {
    globalThis.localStorage?.setItem(placementSnapshotKey, JSON.stringify(snapshot));
  } catch {
    // Storage is optional; the in-memory snapshot remains authoritative for this session.
  }
}

const localProducts = [...productCatalogById.values()];
const localProductsById = new Map(localProducts.map((product) => [product.id, product]));
const localProductsBySlug = new Map<string, Product>();
for (const product of localProducts) {
  const slug = normalizeCatalogSlug(product.slug);
  if (slug && !localProductsBySlug.has(slug)) localProductsBySlug.set(slug, product);
}

const categoryAliases: Record<string, string> = { "baby-care": "vegan-foods" };

function exactLocalCategory(slug: string | null) {
  const normalized = normalizeCatalogSlug(slug);
  if (!normalized) return null;
  const resolved = categoryAliases[normalized] ?? normalized;
  return categories.find((category) => normalizeCatalogSlug(category.categorySlug) === resolved) ?? null;
}

function exactLocalProduct(identifier: string | null) {
  if (!identifier) return null;
  return localProductsById.get(identifier) ?? localProductsBySlug.get(normalizeCatalogSlug(identifier)) ?? null;
}

export function createHybridCatalogRepository(
  localRepository: CatalogRepository,
  apiRepository: CatalogRepository,
  options: HybridOptions = {},
): HybridCatalogRepository {
  let warning: CatalogSynchronizationWarning | null = null;
  const inFlight = new Map<string, Promise<unknown>>();
  const timeoutMs = options.apiTimeoutMs ?? 5000;
  const placementSnapshot = readPlacementSnapshot();

  function apiValue<T>(key: string, request: () => Promise<T>, fallback: T): Promise<T> {
    const existing = inFlight.get(key) as Promise<T> | undefined;
    if (existing) return existing;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<T>((resolve) => {
      timer = setTimeout(() => resolve(fallback), timeoutMs);
    });
    const work = Promise.race([request(), timeout])
      .then((value) => {
        if (value !== fallback) warning = null;
        else warning = { code: "catalog_api_unavailable", message: "Some newer catalog updates may still be synchronizing.", occurredAt: new Date().toISOString() };
        return value;
      })
      .catch(() => {
        warning = { code: "catalog_api_unavailable", message: "Some newer catalog updates may still be synchronizing.", occurredAt: new Date().toISOString() };
        return fallback;
      })
      .finally(() => {
        if (timer) clearTimeout(timer);
        inFlight.delete(key);
      });
    inFlight.set(key, work);
    return work;
  }

  function apiOutcome<T>(key: string, request: () => Promise<T>, fallback: T): Promise<{ success: boolean; value: T; notFound?: boolean }> {
    const existing = inFlight.get(key) as Promise<{ success: boolean; value: T; notFound?: boolean }> | undefined;
    if (existing) return existing;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<{ success: boolean; value: T }>((resolve) => {
      timer = setTimeout(() => resolve({ success: false, value: fallback }), timeoutMs);
    });
    const work = Promise.race([
      request().then((value) => ({ success: true, value })),
      timeout,
    ])
      .then((result) => {
        warning = result.success
          ? null
          : { code: "catalog_api_unavailable", message: "Some newer catalog updates may still be synchronizing.", occurredAt: new Date().toISOString() };
        return result;
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) return { success: false, value: fallback, notFound: true };
        warning = { code: "catalog_api_unavailable", message: "Some newer catalog updates may still be synchronizing.", occurredAt: new Date().toISOString() };
        return { success: false, value: fallback };
      })
      .finally(() => {
        if (timer) clearTimeout(timer);
        inFlight.delete(key);
      });
    inFlight.set(key, work);
    return work;
  }

  async function authoritativeCategories(
    kind: CategoryPlacementKind,
    local: Category[],
    request: () => Promise<Category[]>,
  ) {
    const result = await apiOutcome(`placement:${kind}`, request, [] as Category[]);
    if (result.success) {
      const merged = resolveCategoryAuthority({ kind, local, api: result.value, apiSucceeded: true });
      placementSnapshot[kind] = merged;
      writePlacementSnapshot(placementSnapshot);
      return merged;
    }
    return resolveCategoryAuthority({ kind, local, api: [], apiSucceeded: false, remembered: placementSnapshot[kind] });
  }

  async function filterByPublicCategoryAuthority<T extends Product>(products: T[]) {
    const localCategories = await localRepository.getAllPublicCategories();
    const publicCategories = await authoritativeCategories("all", localCategories, () => apiRepository.getAllPublicCategories());
    const allowed = new Set(publicCategories.map((category) => normalizeCatalogSlug(category.categorySlug)));
    return products.filter((product) => allowed.has(normalizeCatalogSlug(product.categorySlug)));
  }

  return {
    getSynchronizationWarning: () => warning,
    async getCategories() {
      const local = await localRepository.getCategories();
      return authoritativeCategories("all", local, () => apiRepository.getAllPublicCategories());
    },
    async getAllPublicCategories() {
      const local = await localRepository.getAllPublicCategories();
      return authoritativeCategories("all", local, () => apiRepository.getAllPublicCategories());
    },
    async getNavigationCategories() {
      const local = await localRepository.getNavigationCategories();
      return authoritativeCategories("navigation", local, () => apiRepository.getNavigationCategories());
    },
    async getHomepageCategories() {
      const local = await localRepository.getHomepageCategories();
      return authoritativeCategories("homepage", local, () => apiRepository.getHomepageCategories());
    },
    async getHomepageCatalog() {
      const [local, localCategories] = await Promise.all([
        localRepository.getHomepageCatalog(),
        localRepository.getHomepageCategories(),
      ]);
      const homepageCategories = await authoritativeCategories("homepage", localCategories, () => apiRepository.getHomepageCategories());
      const api = await apiValue("homepage-sections", () => apiRepository.getHomepageCatalog(), []);
      return mergeAuthoritativeHomepageSections(local, api, homepageCategories);
    },
    async getCategoryBySlug(slug) {
      if (!slug) return null;
      const local = localRepository === localCatalogRepository ? exactLocalCategory(slug) : await localRepository.getCategoryBySlug(slug);
      const result = await apiOutcome(`category:${slug}`, () => apiRepository.getCategoryBySlug(slug), null);
      if (result.notFound) return null;
      const api = result.value;
      if (local && api && categoriesRepresentSameIdentity(local, api)) return mergeCategory(local, api);
      return api ?? local;
    },
    async getCategoryProducts(slug) {
      if (!slug) return [];
      const resolvedCategory = await this.getCategoryBySlug(slug);
      if (!resolvedCategory) return [];
      const localCategory = localRepository === localCatalogRepository ? exactLocalCategory(slug) : await localRepository.getCategoryBySlug(slug);
      const [local, api] = await Promise.all([
        localCategory ? localRepository.getCategoryProducts(slug) : Promise.resolve([]),
        apiValue(`category-products:${slug}`, () => apiRepository.getCategoryProducts(slug), []),
      ]);
      return mergeProducts(local, api);
    },
    async getProducts(query: CatalogQuery = {}) {
      const [local, api] = await Promise.all([
        localRepository.getProducts(query),
        apiValue(`products:${JSON.stringify(query)}`, () => apiRepository.getProducts(query), { items: [], page: query.page ?? 1, pageSize: query.pageSize ?? 60, total: 0 } satisfies PaginatedProductResult),
      ]);
      const permittedLocal = await filterByPublicCategoryAuthority(local.items);
      const items = mergeProducts(permittedLocal, api.items);
      return { items, page: query.page ?? 1, pageSize: query.pageSize ?? Math.max(items.length, 1), total: items.length };
    },
    async getProductById(id) {
      if (!id) return null;
      const local = localRepository === localCatalogRepository ? exactLocalProduct(id) : await localRepository.getProductById(id);
      const api = await apiValue(`product:${id}`, () => apiRepository.getProductById(id), null);
      if (api) {
        const matchingLocal = local && productsRepresentSameIdentity(local, api)
          ? local
          : localProducts.find((candidate) => productsRepresentSameIdentity(candidate, api));
        return matchingLocal ? mergeProduct(matchingLocal, api) : api;
      }
      return local ? mergeProducts([local], [])[0] : null;
    },
    async getRelatedProducts(product, limit = 8) {
      const [local, api] = await Promise.all([
        localRepository.getRelatedProducts(product, Math.max(limit, 8)),
        apiValue(`related:${product.uuid ?? product.slug}:${limit}`, () => apiRepository.getRelatedProducts(product, Math.max(limit, 8)), []),
      ]);
      const permittedLocal = await filterByPublicCategoryAuthority(local);
      return mergeProducts(permittedLocal, api).filter((candidate) => !productsExcludeSameIdentity(candidate, product)).slice(0, limit);
    },
    async searchProducts(query) {
      const [local, api] = await Promise.all([
        localRepository.searchProducts(query),
        apiValue(`search:${query}`, () => apiRepository.searchProducts(query), []),
      ]);
      return mergeProducts(await filterByPublicCategoryAuthority(local), api);
    },
    async getAvailableFilterBrands() {
      const [local, api] = await Promise.all([
        localRepository.getAvailableFilterBrands(),
        apiValue("filter:brands", () => apiRepository.getAvailableFilterBrands(), []),
      ]);
      return mergeStringOptions(local, api) as CategoryFilterBrand[];
    },
    async getAvailableDeliveryTypes() {
      const [local, api] = await Promise.all([
        localRepository.getAvailableDeliveryTypes(),
        apiValue("filter:delivery", () => apiRepository.getAvailableDeliveryTypes(), []),
      ]);
      return mergeStringOptions(local, api) as DeliveryTypeOption[];
    },
    async getAvailableProductTypes() {
      const [local, api] = await Promise.all([
        localRepository.getAvailableProductTypes(),
        apiValue("filter:product-types", () => apiRepository.getAvailableProductTypes(), []),
      ]);
      return mergeStringOptions(local, api) as ProductTypeOption[];
    },
    async getAvailableMadeInOptions() {
      const [local, api] = await Promise.all([
        localRepository.getAvailableMadeInOptions(),
        apiValue("filter:made-in", () => apiRepository.getAvailableMadeInOptions(), []),
      ]);
      return mergeStringOptions(local, api) as MadeInOption[];
    },
  };
}

export const hybridCatalogRepository = createHybridCatalogRepository(localCatalogRepository, apiCatalogRepository);
