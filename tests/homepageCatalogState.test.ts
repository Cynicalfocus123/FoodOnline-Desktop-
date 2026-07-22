import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createHomepageCatalogController, type HomepageCatalogData } from "../src/services/catalog/homepageCatalogState.ts";
import { mergeCategories, mergeHomepageSections, mergeProducts } from "../src/services/catalog/catalogMerge.ts";
import type { Category, Product } from "../src/types/catalog.ts";

const category = (slug: string): Category => ({
  name: slug,
  icon: "grocery",
  image: `/images/${slug}.webp`,
  sectionId: `category-${slug}`,
  categorySlug: slug,
  href: `/category/${slug}`,
});

const product = (slug: string, overrides: Partial<Product> = {}): Product => ({
  id: slug,
  slug,
  brand: "Local brand",
  name: slug,
  categorySlug: "pantry",
  size: "1 pack",
  price: 10,
  deliveryTime: "Today",
  image: `/images/${slug}.webp`,
  imageUrls: [`/images/${slug}.webp`],
  unitPrice: "$10/pack",
  soldCount: 10,
  categoryId: "pantry",
  categoryName: "Pantry",
  deliveryType: "Local Delivery",
  productType: "Deals",
  madeIn: "USA",
  tags: [],
  badges: [],
  provider: "FoodOnlines",
  country: "USA",
  countryOfOrigin: "USA",
  brandOrigin: "USA",
  netContent: "1 pack",
  quantity: "1 pack",
  description: "Description",
  sku: slug,
  recipeSuggestions: [],
  nutritionFacts: { servingSize: "1", calories: 1, totalFat: "0g", sodium: "0mg", carbohydrates: "0g", sugar: "0g", protein: "0g" },
  returnPolicy: "Return policy",
  reviews: [],
  reviewTags: [],
  averageRating: 0,
  ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  reviewCount: 0,
  variants: [{ id: `${slug}-default`, label: "Default", packSize: "1 pack", price: 10, unitPrice: "$10/pack" }],
  ...overrides,
});

function snapshot(): HomepageCatalogData {
  return {
    categories: [category("pantry")],
    sections: [{ title: "Pantry", sectionId: "pantry", seeAllHref: "/category/pantry", items: [product("local")] }],
  };
}

test("homepage starts from its local snapshot and shares one background refresh", async () => {
  let resolve!: (data: HomepageCatalogData) => void;
  let requests = 0;
  const controller = createHomepageCatalogController({
    initial: snapshot(),
    load: () => {
      requests += 1;
      return new Promise((done) => { resolve = done; });
    },
  });

  assert.equal(controller.getSnapshot().phase, "ready");
  assert.equal(controller.getSnapshot().categories.length, 1);
  assert.equal(controller.getSnapshot().sections[0].items.length, 1);

  const first = controller.refresh();
  const duplicateConsumer = controller.refresh();
  assert.equal(first, duplicateConsumer);
  assert.equal(requests, 1);
  assert.equal(controller.getSnapshot().phase, "refreshing");
  assert.equal(controller.getSnapshot().categories[0].categorySlug, "pantry");
  assert.equal(controller.getSnapshot().sections[0].items[0].id, "local");

  resolve(snapshot());
  await first;
  assert.equal(controller.getSnapshot().phase, "resolved");
});

test("failed synchronization retains the last usable homepage categories and rails", async () => {
  const controller = createHomepageCatalogController({ initial: snapshot(), load: async () => { throw new Error("offline"); } });
  await controller.refresh();
  assert.equal(controller.getSnapshot().phase, "ready");
  assert.equal(controller.getSnapshot().error, null);
  assert.equal(controller.getSnapshot().categories.length, 1);
  assert.equal(controller.getSnapshot().sections.length, 1);
});

test("a homepage with no local snapshot uses loading and safe error states", async () => {
  const controller = createHomepageCatalogController({
    initial: { categories: [], sections: [] },
    load: async () => { throw new Error("offline"); },
  });
  assert.equal(controller.getSnapshot().phase, "loading");
  await controller.refresh();
  assert.equal(controller.getSnapshot().phase, "error");
  assert.equal(controller.getSnapshot().error, "Catalog sections are temporarily unavailable.");
});

test("homepage API overlays and API-only records append without category, rail, or product duplicates", () => {
  const localCategory = category("pantry");
  const apiCategory = { ...category("pantry"), uuid: "api-pantry", name: "Pantry API" };
  const mergedCategories = mergeCategories([localCategory], [apiCategory, apiCategory]);
  assert.equal(mergedCategories.length, 1);

  const localProduct = product("local");
  const apiProduct = product("local", { id: "api-local", uuid: "api-local", price: 12, apiBacked: true, catalogOrigin: "api" });
  const apiOnlyProduct = product("api-only", { id: "api-only", uuid: "api-only", apiBacked: true, catalogOrigin: "api" });
  assert.equal(mergeProducts([localProduct], [apiProduct, apiOnlyProduct]).length, 2);
  const sections = mergeHomepageSections(
    [{ title: "Pantry", sectionId: "pantry", seeAllHref: "/category/pantry", items: [localProduct] }],
    [{ title: "Pantry API", sectionId: "pantry", seeAllHref: "/category/pantry", items: [apiProduct, apiOnlyProduct] }],
  );
  assert.equal(sections.length, 1);
  assert.equal(sections[0].items.length, 2);
});

test("homepage components consume the shared synchronous catalog snapshot and reserve only true no-data loading space", () => {
  const categories = readFileSync("src/components/CategoryStrip.tsx", "utf8");
  const deals = readFileSync("src/components/DealsGrid.tsx", "utf8");
  assert.match(categories, /useHomepageCatalog\(\)/);
  assert.match(deals, /useHomepageCatalog\(\)/);
  assert.match(categories, /categories\.length === 0 && phase === "loading"/);
  assert.match(deals, /productCarouselSections\.length === 0 && phase === "loading"/);
  assert.doesNotMatch(categories, /useState<.*>\(\[\]\)/);
  assert.doesNotMatch(deals, /useState<ProductCarouselSection\[\]>\(\[\]\)/);
});

test("the API homepage catalog uses combined paginated products rather than one request per rail", () => {
  const api = readFileSync("src/services/catalog/apiCatalogRepository.ts", "utf8");
  const homepageMethod = api.slice(api.indexOf("async getHomepageCatalog"));
  assert.match(api, /async function listAllHomepageProducts/);
  assert.match(homepageMethod, /Promise\.all\(\[categoryPromise, listAllHomepageProducts\(\)\]\)/);
  assert.doesNotMatch(homepageMethod, /this\.getCategoryProducts/);
});

test("product cards reserve their image frame and render card structure independently of image completion", () => {
  const card = readFileSync("src/components/ProductCard.tsx", "utf8");
  assert.match(card, /aspect-\[4\/3\]/);
  assert.match(card, /loading="lazy"/);
  assert.match(card, /onError=/);
  assert.ok(card.indexOf("<article") < card.indexOf("<img"));
});
