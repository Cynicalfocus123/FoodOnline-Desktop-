import type { Category } from "../../types/catalog";
import { mergeAuthoritativeCategories } from "./catalogMerge.ts";

export type CategoryPlacementKind = "all" | "navigation" | "homepage";

export function categoryMatchesPlacement(category: Category, kind: CategoryPlacementKind) {
  if (category.status && category.status !== "published") return false;
  if (category.visibility && category.visibility !== "public") return false;
  if (kind === "navigation") return category.showInNavigation !== false;
  if (kind === "homepage") return category.showOnHomepage !== false;
  return true;
}

export function resolveCategoryAuthority(options: {
  kind: CategoryPlacementKind;
  local: Category[];
  api: Category[];
  apiSucceeded: boolean;
  remembered?: Category[];
}) {
  if (options.apiSucceeded) {
    return mergeAuthoritativeCategories(options.local, options.api)
      .filter((category) => categoryMatchesPlacement(category, options.kind));
  }
  if (options.remembered !== undefined) return options.remembered;
  return options.local.filter((category) => categoryMatchesPlacement(category, options.kind));
}
