export type CategoryPlacementForm = {
  status: string;
  visibility: string;
  show_in_navigation: boolean;
  show_on_homepage: boolean;
};

export function slugifyCategoryName(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function updateCategoryPlacement<T extends CategoryPlacementForm, K extends keyof T>(form: T, key: K, value: T[K]): T {
  const next = { ...form, [key]: value };
  if ((key === "show_in_navigation" || key === "show_on_homepage") && Boolean(value)) {
    next.status = "published";
    next.visibility = "public";
  }
  if ((key === "status" && value !== "published") || (key === "visibility" && value !== "public")) {
    next.show_in_navigation = false;
    next.show_on_homepage = false;
  }
  return next;
}
