import type {
  Category,
  CategoryFilterBrand,
  DeliveryTypeOption,
  MadeInOption,
  Product,
  ProductTypeOption,
} from "../../types/catalog";

export type CategoryListingFilters = {
  brands: CategoryFilterBrand[];
  delivery: DeliveryTypeOption[];
  madeIn: MadeInOption[];
  productType: ProductTypeOption[];
};

export type CategoryListingSnapshot = {
  category: Category | null;
  filters: CategoryListingFilters;
  products: Product[];
};

type CategoryListingDataSource = {
  getFilters: () => Promise<CategoryListingFilters>;
  getLocalSnapshot: (slug: string | null) => Promise<Pick<CategoryListingSnapshot, "category" | "products">>;
  getResolvedSnapshot: (slug: string | null) => Promise<CategoryListingSnapshot>;
};

export function createCategoryListingLoader(source: CategoryListingDataSource) {
  return async function loadCategoryListing(
    slug: string | null,
    onKnownProducts: (snapshot: Pick<CategoryListingSnapshot, "category" | "products">) => void,
  ) {
    const local = await source.getLocalSnapshot(slug);
    if (local.category && local.products.length) onKnownProducts(local);
    return source.getResolvedSnapshot(slug);
  };
}

export function createCategoryListingRequestGuard() {
  let activeRequest = 0;
  return {
    begin() {
      activeRequest += 1;
      return activeRequest;
    },
    isCurrent(request: number) {
      return request === activeRequest;
    },
  };
}
