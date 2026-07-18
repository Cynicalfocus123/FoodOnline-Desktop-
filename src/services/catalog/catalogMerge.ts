import type { Category, Product, ProductCarouselSection, ProductVariant } from "../../types/catalog";
import {
  categoriesRepresentSameIdentity,
  normalizeCatalogSlug,
  normalizeCatalogText,
  normalizeMediaIdentity,
  productsRepresentSameIdentity,
  variantIdentity,
} from "./catalogIdentity.ts";

export function asLocalCompatibilityProduct(product: Product): Product {
  return { ...product, apiBacked: false, catalogOrigin: "local", compatibilityOnly: true };
}

export function mergeCategory(localCategory: Category, apiCategory: Category): Category {
  const slug = normalizeCatalogSlug(apiCategory.categorySlug) || localCategory.categorySlug;
  return {
    ...localCategory,
    ...apiCategory,
    icon: localCategory.icon,
    image: apiCategory.apiImageAvailable ? apiCategory.image : localCategory.image,
    categorySlug: slug,
    sectionId: localCategory.sectionId || `category-${slug}`,
    href: apiCategory.href || localCategory.href,
  };
}

export function mergeCategories(localCategories: Category[], apiCategories: Category[]) {
  const merged = [...localCategories];
  for (const apiCategory of apiCategories) {
    const index = merged.findIndex((category) => categoriesRepresentSameIdentity(category, apiCategory));
    if (index >= 0) merged[index] = mergeCategory(merged[index], apiCategory);
    else if (!merged.some((category) => categoriesRepresentSameIdentity(category, apiCategory))) merged.push(apiCategory);
  }
  return merged;
}

export function mergeAuthoritativeCategories(localCategories: Category[], apiCategories: Category[]) {
  return apiCategories.map((apiCategory) => {
    const local = localCategories.find((candidate) => categoriesRepresentSameIdentity(candidate, apiCategory));
    return local ? mergeCategory(local, apiCategory) : apiCategory;
  });
}

function mergeGallery(apiProduct: Product, localProduct: Product) {
  const values = apiProduct.apiMediaAvailable
    ? [...apiProduct.imageUrls, ...localProduct.imageUrls]
    : [...localProduct.imageUrls];
  const seen = new Set<string>();
  return values.filter((url) => {
    const identity = normalizeMediaIdentity(url);
    if (!identity || seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function exactVariantMigration(localVariants: ProductVariant[], apiVariants: ProductVariant[]) {
  const mapping: Record<string, string> = {};
  for (const localVariant of localVariants) {
    const match = apiVariants.find((apiVariant) => {
      const localSku = normalizeCatalogText(localVariant.sku);
      const apiSku = normalizeCatalogText(apiVariant.sku);
      if (localSku && apiSku) return localSku === apiSku;
      return normalizeCatalogText(localVariant.label) === normalizeCatalogText(apiVariant.label)
        && normalizeCatalogText(localVariant.packSize) === normalizeCatalogText(apiVariant.packSize);
    });
    if (match?.uuid) mapping[localVariant.id] = match.uuid;
  }
  return mapping;
}

export function mergeProduct(localProduct: Product, apiProduct: Product): Product {
  const gallery = mergeGallery(apiProduct, localProduct);
  const useApiMedia = Boolean(apiProduct.apiMediaAvailable && gallery.length);
  const variants = apiProduct.apiVariantsAvailable ? apiProduct.variants : localProduct.variants;
  return {
    ...localProduct,
    ...apiProduct,
    image: useApiMedia ? apiProduct.image : localProduct.image,
    imageUrls: gallery.length ? gallery : [useApiMedia ? apiProduct.image : localProduct.image],
    imageFit: useApiMedia ? apiProduct.imageFit : localProduct.imageFit,
    description: apiProduct.description === "Product details are provided by the FoodOnlines catalog."
      ? localProduct.description
      : apiProduct.description,
    ingredients: apiProduct.ingredients || localProduct.ingredients,
    storageInstructions: apiProduct.storageInstructions || localProduct.storageInstructions,
    variants,
    recipeSuggestions: apiProduct.recipeSuggestions.length ? apiProduct.recipeSuggestions : localProduct.recipeSuggestions,
    returnPolicy: apiProduct.returnPolicy === "See our return policy." ? localProduct.returnPolicy : apiProduct.returnPolicy,
    tags: apiProduct.tags.length ? apiProduct.tags : localProduct.tags,
    badges: apiProduct.badges.length ? apiProduct.badges : localProduct.badges,
    provider: apiProduct.provider === "FoodOnlines" ? localProduct.provider : apiProduct.provider,
    country: apiProduct.country === "Unknown" ? localProduct.country : apiProduct.country,
    countryOfOrigin: apiProduct.countryOfOrigin === "Unknown" ? localProduct.countryOfOrigin : apiProduct.countryOfOrigin,
    brandOrigin: apiProduct.brandOrigin === "Unknown" ? localProduct.brandOrigin : apiProduct.brandOrigin,
    nutritionFacts: apiProduct.apiNutritionDataAvailable ? apiProduct.nutritionFacts : localProduct.nutritionFacts,
    reviews: apiProduct.apiReviewDataAvailable ? apiProduct.reviews : localProduct.reviews,
    reviewTags: apiProduct.apiReviewDataAvailable ? apiProduct.reviewTags : localProduct.reviewTags,
    averageRating: apiProduct.apiReviewDataAvailable ? apiProduct.averageRating : localProduct.averageRating,
    ratingBreakdown: apiProduct.apiReviewDataAvailable ? apiProduct.ratingBreakdown : localProduct.ratingBreakdown,
    reviewCount: apiProduct.apiReviewDataAvailable ? apiProduct.reviewCount : localProduct.reviewCount,
    soldCount: apiProduct.apiSoldCountAvailable ? apiProduct.soldCount : localProduct.soldCount,
    apiBacked: true,
    catalogOrigin: "hybrid",
    compatibilityOnly: false,
    compatibility: {
      localProductIds: [localProduct.id],
      localVariantToApiVariant: exactVariantMigration(localProduct.variants, variants),
    },
  };
}

export function mergeProducts(localProducts: Product[], apiProducts: Product[]) {
  const merged = localProducts.map(asLocalCompatibilityProduct);
  for (const apiProduct of apiProducts) {
    const index = merged.findIndex((product) => productsRepresentSameIdentity(product, apiProduct));
    if (index >= 0) merged[index] = mergeProduct(merged[index], apiProduct);
    else if (!merged.some((product) => productsRepresentSameIdentity(product, apiProduct))) merged.push(apiProduct);
  }
  return merged;
}

function sectionSlug(section: ProductCarouselSection) {
  return normalizeCatalogSlug(section.sectionId || section.seeAllHref.split("category/").pop() || section.title);
}

export function mergeHomepageSections(localSections: ProductCarouselSection[], apiSections: ProductCarouselSection[]) {
  const merged = localSections.map((section) => ({ ...section, items: section.items.map(asLocalCompatibilityProduct) }));
  for (const apiSection of apiSections) {
    const identity = sectionSlug(apiSection);
    const index = merged.findIndex((section) => sectionSlug(section) === identity);
    if (index >= 0) {
      merged[index] = { ...merged[index], items: mergeProducts(merged[index].items, apiSection.items) };
    } else if (apiSection.items.length) {
      merged.push({ ...apiSection, items: mergeProducts([], apiSection.items) });
    }
  }
  return merged;
}

export function mergeAuthoritativeHomepageSections(
  localSections: ProductCarouselSection[],
  apiSections: ProductCarouselSection[],
  homepageCategories: Category[],
) {
  const allowed = new Set(homepageCategories.map((category) => normalizeCatalogSlug(category.categorySlug)));
  return mergeHomepageSections(
    localSections.filter((section) => allowed.has(sectionSlug(section))),
    apiSections.filter((section) => allowed.has(sectionSlug(section))),
  ).filter((section) => section.items.length > 0);
}

export function mergeStringOptions(localOptions: string[], apiOptions: string[]) {
  const seen = new Set<string>();
  return [...localOptions, ...apiOptions].filter((option) => {
    const identity = normalizeCatalogText(option);
    if (!identity || seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

export function deduplicateVariants(variants: ProductVariant[]) {
  const seen = new Set<string>();
  return variants.filter((variant) => {
    const identity = variantIdentity(variant);
    if (!identity || seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}
