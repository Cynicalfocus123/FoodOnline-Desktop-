import type { Category, Product, ProductVariant } from "../../types/catalog";

export function normalizeCatalogSlug(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeCatalogText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeMediaIdentity(value: string) {
  return value.trim().replace(/#.*$/, "").replace(/\/+$/, "").toLowerCase();
}

export function categoriesRepresentSameIdentity(left: Category, right: Category) {
  if (left.uuid && right.uuid) return left.uuid === right.uuid;
  const leftSlug = normalizeCatalogSlug(left.categorySlug);
  const rightSlug = normalizeCatalogSlug(right.categorySlug);
  return Boolean(leftSlug && rightSlug && leftSlug === rightSlug);
}

export function isListingClone(product: Product) {
  return /-listing-\d+$/i.test(product.id);
}

function variantsShareExactIdentity(left: ProductVariant[], right: ProductVariant[]) {
  return left.some((leftVariant) =>
    right.some((rightVariant) => {
      if (leftVariant.uuid && rightVariant.uuid) return leftVariant.uuid === rightVariant.uuid;
      const leftSku = normalizeCatalogText(leftVariant.sku);
      const rightSku = normalizeCatalogText(rightVariant.sku);
      return Boolean(leftSku && rightSku && leftSku === rightSku);
    }),
  );
}

export function productsRepresentSameIdentity(left: Product, right: Product) {
  if (left.uuid && right.uuid) return left.uuid === right.uuid;
  if (isListingClone(left) || isListingClone(right)) return left.id === right.id;

  const leftSlug = normalizeCatalogSlug(left.slug);
  const rightSlug = normalizeCatalogSlug(right.slug);
  if (leftSlug && rightSlug && leftSlug === rightSlug) return true;

  const leftSku = normalizeCatalogText(left.sku);
  const rightSku = normalizeCatalogText(right.sku);
  return Boolean(leftSku && rightSku && leftSku === rightSku && variantsShareExactIdentity(left.variants, right.variants));
}

export function productsExcludeSameIdentity(left: Product, right: Product) {
  if (productsRepresentSameIdentity(left, right)) return true;
  if (left.id === right.id) return true;
  if (left.uuid && (left.uuid === right.id || left.uuid === right.uuid)) return true;
  if (right.uuid && (right.uuid === left.id || right.uuid === left.uuid)) return true;
  return false;
}

export function variantIdentity(variant: ProductVariant) {
  return variant.uuid || normalizeCatalogText(variant.sku) || normalizeCatalogText(`${variant.label}|${variant.packSize}`) || variant.id;
}
