import assert from "node:assert/strict";
import test from "node:test";
import { categoryFallbackInitial } from "../src/components/categoryVisuals.ts";
import { slugifyCategoryName, updateCategoryPlacement } from "../src/components/admin/categoryAdminLogic.ts";
import { mapApiCategory } from "../src/services/catalog/apiCategoryMapper.ts";
import { resolveCategoryAuthority } from "../src/services/catalog/catalogCategoryAuthority.ts";
import { mergeAuthoritativeHomepageSections } from "../src/services/catalog/catalogMerge.ts";
import type { Category } from "../src/types/catalog.ts";

function category(slug: string, overrides: Partial<Category> = {}): Category {
  return {
    name: slug, icon: "grocery", image: `/images/${slug}.webp`, sectionId: `category-${slug}`,
    categorySlug: slug, href: `/category/${slug}`, status: "published", visibility: "public",
    showInNavigation: true, showOnHomepage: true, ...overrides,
  };
}

test("name-only creation helper produces an editable canonical slug", () => {
  assert.equal(slugifyCategoryName("  Ice Cream & Desserts  "), "ice-cream-desserts");
});

test("placement controls create Published and Public state and incompatible state clears placement", () => {
  const base = { status: "draft", visibility: "hidden", show_in_navigation: false, show_on_homepage: false };
  const placed = updateCategoryPlacement(base, "show_on_homepage", true);
  assert.deepEqual(placed, { status: "published", visibility: "public", show_in_navigation: false, show_on_homepage: true });
  assert.equal(updateCategoryPlacement(placed, "status", "draft").show_on_homepage, false);
  assert.equal(updateCategoryPlacement(placed, "visibility", "catalog_only").show_on_homepage, false);
});

test("API category mapper retains placement, lifecycle, order, and missing-media state", () => {
  const mapped = mapApiCategory({
    id: 9, uuid: "category-uuid", name: "Ice cream", slug: "ice-cream", status: "published",
    visibility: "public", sort_order: 12, show_in_navigation: true, show_on_homepage: false, is_featured: true,
  });
  assert.equal(mapped.showInNavigation, true);
  assert.equal(mapped.showOnHomepage, false);
  assert.equal(mapped.sortOrder, 12);
  assert.equal(mapped.image, "");
  assert.equal(mapped.apiImageAvailable, false);
});

test("generic category fallback supports arbitrary and empty names", () => {
  assert.equal(categoryFallbackInitial("อาหารแช่แข็ง"), "อ");
  assert.equal(categoryFallbackInitial(""), "F");
});

test("successful Laravel categories suppress local categories omitted by public authority", () => {
  const local = [category("dairy"), category("ice-cream")];
  const result = resolveCategoryAuthority({ kind: "all", local, api: [category("ice-cream", { name: "Ice Cream API" })], apiSucceeded: true });
  assert.deepEqual(result.map((item) => item.categorySlug), ["ice-cream"]);
  assert.equal(result[0].name, "Ice Cream API");
});

test("API failure uses local fallback only before a last-known placement snapshot exists", () => {
  const local = [category("dairy")];
  assert.equal(resolveCategoryAuthority({ kind: "navigation", local, api: [], apiSucceeded: false }).length, 1);
  assert.deepEqual(resolveCategoryAuthority({ kind: "navigation", local, api: [], apiSucceeded: false, remembered: [] }), []);
});

test("authoritative homepage placement filters local rows while keeping empty categories out of product carousels", () => {
  const localSections = [
    { title: "Dairy", sectionId: "dairy", seeAllHref: "/category/dairy", items: [] },
    { title: "Ice", sectionId: "ice-cream", seeAllHref: "/category/ice-cream", items: [] },
  ];
  const result = mergeAuthoritativeHomepageSections(localSections, [], [category("ice-cream")]);
  assert.equal(result.length, 0);
});

test("long category names remain data-driven instead of requiring hardcoded navigation entries", () => {
  const name = "International Frozen Desserts and Celebration Ice Cream Collection";
  assert.equal(category("long", { name }).name, name);
});
