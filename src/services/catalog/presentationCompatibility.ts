import { productCatalog } from "../../data/home";
import type { Product } from "../../types/catalog";

/**
 * Frontend-only merchandising and experience fields. API identity, prices,
 * media, category, brand, nutrition, and variants always win over this layer.
 */
export function applyPresentationCompatibility(product: Product): Product {
  const localMatch = productCatalog.find(
    (candidate) => candidate.sku.toLowerCase() === product.sku.toLowerCase() || candidate.name.toLowerCase() === product.name.toLowerCase(),
  );

  if (!localMatch) {
    return product;
  }

  return {
    ...product,
    deliveryTime: product.deliveryTime === "Fast delivery" ? localMatch.deliveryTime : product.deliveryTime,
    deliveryType: product.deliveryType === "Local Delivery" ? localMatch.deliveryType : product.deliveryType,
    productType: product.productType === "New Arrivals" ? localMatch.productType : product.productType,
    madeIn: product.madeIn === "USA" && product.countryOfOrigin === "Unknown" ? localMatch.madeIn : product.madeIn,
    tags: product.tags.length ? product.tags : localMatch.tags,
    badges: product.badges.length ? product.badges : localMatch.badges,
    provider: product.provider === "FoodOnlines" ? localMatch.provider : product.provider,
    country: product.country === "Unknown" ? localMatch.country : product.country,
    brandOrigin: product.brandOrigin === "Unknown" ? localMatch.brandOrigin : product.brandOrigin,
    recipeSuggestions: product.recipeSuggestions.length ? product.recipeSuggestions : localMatch.recipeSuggestions,
    returnPolicy: product.returnPolicy === "See our return policy." ? localMatch.returnPolicy : product.returnPolicy,
    reviews: product.reviews.length ? product.reviews : localMatch.reviews,
    reviewTags: product.reviewTags.length ? product.reviewTags : localMatch.reviewTags,
    averageRating: product.reviewCount ? product.averageRating : localMatch.averageRating,
    ratingBreakdown: product.reviewCount ? product.ratingBreakdown : localMatch.ratingBreakdown,
    reviewCount: product.reviewCount || localMatch.reviewCount,
    nutritionFacts: product.nutritionFacts.calories ? product.nutritionFacts : localMatch.nutritionFacts,
  };
}
