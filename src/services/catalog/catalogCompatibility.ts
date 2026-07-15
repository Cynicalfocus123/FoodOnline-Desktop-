import type { Product } from "../../types/catalog";

export function isBackendOrderableProduct(product: Product | null | undefined) {
  return Boolean(product?.apiBacked && !product.compatibilityOnly);
}

export function findExactLocalProduct(products: Product[], identifier: string | null) {
  if (!identifier) return null;
  return products.find((product) => product.id === identifier)
    ?? products.find((product) => product.slug.trim().toLowerCase() === identifier.trim().toLowerCase())
    ?? null;
}
