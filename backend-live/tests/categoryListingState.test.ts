import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { categorySlugForSection } from "../src/components/categoryNavigation.ts";
import { categoryProductCountLabel, getCategoryListingViewState } from "../src/components/categoryListingState.ts";
import { createCategoryListingLoader, createCategoryListingRequestGuard } from "../src/services/catalog/categoryListingLoadLogic.ts";
import type { Category, Product } from "../src/types/catalog.ts";

const category = { categorySlug: "pantry" } as Category;
const product = { id: "pantry-product", categorySlug: "pantry" } as Product;

test("category loading never derives a confirmed empty state or a zero-product label", () => {
  const viewState = getCategoryListingViewState({ resolution: "loading", totalProducts: 0, visibleProducts: 0 });
  assert.equal(viewState, "loading");
  assert.equal(categoryProductCountLabel(viewState, 0), "Loading products…");
});

test("category resolution separates loaded, filtered-empty, confirmed-empty, and failed states", () => {
  assert.equal(getCategoryListingViewState({ resolution: "loaded", totalProducts: 2, visibleProducts: 2 }), "loaded");
  assert.equal(getCategoryListingViewState({ resolution: "loaded", totalProducts: 2, visibleProducts: 0 }), "filtered-empty");
  assert.equal(getCategoryListingViewState({ resolution: "loaded", totalProducts: 0, visibleProducts: 0 }), "confirmed-empty");
  assert.equal(getCategoryListingViewState({ resolution: "error", totalProducts: 0, visibleProducts: 0 }), "error");
});

test("known local products arrive before the final hybrid snapshot", async () => {
  let finish!: () => void;
  const loader = createCategoryListingLoader({
    getFilters: async () => ({ brands: [], delivery: [], madeIn: [], productType: [] }),
    getLocalSnapshot: async () => ({ category, products: [product] }),
    getResolvedSnapshot: () => new Promise((resolve) => { finish = () => resolve({ category, filters: { brands: [], delivery: [], madeIn: [], productType: [] }, products: [product] }); }),
  });
  const received: Product[][] = [];
  const pending = loader("pantry", (snapshot) => received.push(snapshot.products));
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(received, [[product]]);
  finish();
  assert.equal((await pending).products.length, 1);
});

test("a request guard rejects a late result from a previous category route", () => {
  const guard = createCategoryListingRequestGuard();
  const pantryRequest = guard.begin();
  const frozenRequest = guard.begin();
  assert.equal(guard.isCurrent(pantryRequest), false);
  assert.equal(guard.isCurrent(frozenRequest), true);
});

test("homepage See All uses the canonical category slug encoded in its route", () => {
  assert.equal(categorySlugForSection({ sectionId: "display-name", seeAllHref: "/category/pantry", items: [], title: "Pantry" }), "pantry");
  assert.equal(categorySlugForSection({ sectionId: "category-frozen", seeAllHref: "#category/frozen", items: [], title: "Frozen" }), "frozen");
});

test("category page source renders separate loading, filter, empty, error, and retry branches", () => {
  const source = readFileSync("src/components/CategoryListingPage.tsx", "utf8");
  assert.match(source, /viewState === "loading"/);
  assert.match(source, /No products match your current filters\./);
  assert.match(source, /Products are coming soon/);
  assert.match(source, /viewState === "error"/);
  assert.match(source, /createCategoryListingRequestGuard/);
  assert.doesNotMatch(source, /setProducts\(\[\]\)/);
});

test("category tiles and desktop/mobile navigation keep using stable category slugs", () => {
  const categoryStrip = readFileSync("src/components/CategoryStrip.tsx", "utf8");
  const header = readFileSync("src/components/Header.tsx", "utf8");
  assert.match(categoryStrip, /openCategory\(category\.categorySlug\)/);
  assert.match(header, /openCategory\(category\.categorySlug\)/);
});
