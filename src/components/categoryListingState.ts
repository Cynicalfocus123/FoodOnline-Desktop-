export type CategoryListingResolution = "loading" | "loaded" | "error";
export type CategoryListingViewState = "loading" | "loaded" | "filtered-empty" | "confirmed-empty" | "error";

export function getCategoryListingViewState({
  resolution,
  totalProducts,
  visibleProducts,
}: {
  resolution: CategoryListingResolution;
  totalProducts: number;
  visibleProducts: number;
}): CategoryListingViewState {
  if (resolution === "loading") return "loading";
  if (resolution === "error") return "error";
  if (totalProducts === 0) return "confirmed-empty";
  if (visibleProducts === 0) return "filtered-empty";
  return "loaded";
}

export function categoryProductCountLabel(viewState: CategoryListingViewState, visibleProducts: number) {
  if (viewState === "loading") return "Loading products…";
  if (viewState === "error") return "Catalog is temporarily unavailable.";
  return `${visibleProducts} products shown`;
}
