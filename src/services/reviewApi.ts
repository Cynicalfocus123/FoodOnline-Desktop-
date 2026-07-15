import { apiRequest } from "../lib/apiClient";
import type { ProductReview, RatingBreakdown } from "../types/catalog";

type ApiReview = { uuid: string; customer_name: string; rating: number; body: string | null; verified_purchase: boolean; images?: Array<{ url?: string | null }> };
type Response = { data: ApiReview[]; summary: { average_rating: number; review_count: number; breakdown: Record<string, number> }; meta?: { current_page: number; last_page: number } };

function mapReview(review: ApiReview): ProductReview { return { id: review.uuid, customerName: review.customer_name, rating: review.rating, text: review.body ?? "", date: new Date().toLocaleDateString(), verifiedPurchase: review.verified_purchase, isPurchased: review.verified_purchase, images: (review.images ?? []).map((image) => image.url).filter((url): url is string => Boolean(url)), tags: [] }; }
export async function loadProductReviews(productId: string, options: { verified?: boolean; photos?: boolean; sort?: string } = {}) {
  const params = new URLSearchParams(); if (options.verified) params.set("verified", "1"); if (options.photos) params.set("photos", "1"); if (options.sort) params.set("sort", options.sort);
  const response = await apiRequest<Response>(`/catalog/products/${encodeURIComponent(productId)}/reviews?${params.toString()}`);
  return { reviews: response.data.map(mapReview), summary: response.summary };
}
export const reviewSummary = (summary: Response["summary"]): { averageRating: number; reviewCount: number; ratingBreakdown: RatingBreakdown } => ({ averageRating: summary.average_rating, reviewCount: summary.review_count, ratingBreakdown: { 1: summary.breakdown["1"] ?? 0, 2: summary.breakdown["2"] ?? 0, 3: summary.breakdown["3"] ?? 0, 4: summary.breakdown["4"] ?? 0, 5: summary.breakdown["5"] ?? 0 } });
