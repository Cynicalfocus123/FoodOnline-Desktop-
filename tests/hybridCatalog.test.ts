import assert from "node:assert/strict";
import test from "node:test";
import type { Category, Product } from "../src/types/catalog.ts";
import { isBackendOrderableProduct, findExactLocalProduct } from "../src/services/catalog/catalogCompatibility.ts";
import { productsExcludeSameIdentity } from "../src/services/catalog/catalogIdentity.ts";
import { mergeCategories, mergeHomepageSections, mergeProducts } from "../src/services/catalog/catalogMerge.ts";

function category(slug: string, overrides: Partial<Category> = {}): Category {
  return {
    name: slug,
    icon: "grocery",
    image: `/images/${slug}.webp`,
    sectionId: `category-${slug}`,
    categorySlug: slug,
    href: `/category/${slug}`,
    ...overrides,
  };
}

function product(slug: string, overrides: Partial<Product> = {}): Product {
  return {
    id: slug,
    slug,
    brand: "Local Brand",
    name: slug,
    categorySlug: "grocery",
    size: "1 pack",
    price: 10,
    deliveryTime: "Today",
    image: `/images/${slug}.webp`,
    imageUrls: [`/images/${slug}.webp`, `/images/${slug}-back.webp`],
    unitPrice: "$10/pack",
    soldCount: 20,
    categoryId: "grocery",
    categoryName: "Grocery",
    deliveryType: "Local Delivery",
    productType: "Deals",
    madeIn: "USA",
    tags: ["local"],
    badges: ["Local badge"],
    provider: "Local provider",
    country: "USA",
    countryOfOrigin: "USA",
    brandOrigin: "USA",
    netContent: "1 pack",
    quantity: "1 pack",
    description: "Local description",
    sku: `LOCAL-${slug}`,
    recipeSuggestions: [],
    nutritionFacts: { servingSize: "1", calories: 100, totalFat: "1g", sodium: "1mg", carbohydrates: "1g", sugar: "1g", protein: "1g" },
    returnPolicy: "Local return policy",
    reviews: [],
    reviewTags: [],
    averageRating: 4,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 },
    reviewCount: 1,
    variants: [{ id: `${slug}-default`, label: "Default", packSize: "1 pack", price: 10, unitPrice: "$10/pack" }],
    ...overrides,
  };
}

function apiProduct(slug: string, overrides: Partial<Product> = {}) {
  return product(slug, {
    id: `api-${slug}`,
    uuid: `uuid-${slug}`,
    price: 12,
    apiBacked: true,
    catalogOrigin: "api",
    compatibilityOnly: false,
    apiMediaAvailable: false,
    apiVariantsAvailable: true,
    apiReviewDataAvailable: true,
    apiNutritionDataAvailable: true,
    apiSoldCountAvailable: true,
    ...overrides,
  });
}

test("zero API categories preserves every local category and image", () => {
  const local = [category("one"), category("two")];
  assert.deepEqual(mergeCategories(local, []), local);
});

test("one matching API category overrides authority without duplication", () => {
  const result = mergeCategories([category("one")], [category("one", { uuid: "api-one", name: "API One", apiImageAvailable: false, image: "/missing.webp" })]);
  assert.equal(result.length, 1);
  assert.equal(result[0].uuid, "api-one");
  assert.equal(result[0].name, "API One");
  assert.equal(result[0].image, "/images/one.webp");
});

test("new API category is appended once", () => {
  const result = mergeCategories([category("one")], [category("new", { uuid: "api-new" }), category("new", { uuid: "api-new" })]);
  assert.deepEqual(result.map((item) => item.categorySlug), ["one", "new"]);
});

test("matching category with valid API media uses API media", () => {
  const result = mergeCategories([category("one")], [category("one", { image: "https://media.example/one.webp", apiImageAvailable: true })]);
  assert.equal(result[0].image, "https://media.example/one.webp");
});

test("zero API products keeps local products compatibility-visible", () => {
  const result = mergeProducts([product("one"), product("two")], []);
  assert.equal(result.length, 2);
  assert.ok(result.every((item) => item.compatibilityOnly && !item.apiBacked));
});

test("matching API product overrides UUID slug price and availability once", () => {
  const result = mergeProducts([product("one", { inStock: true })], [apiProduct("one", { price: 22, inStock: false })]);
  assert.equal(result.length, 1);
  assert.equal(result[0].uuid, "uuid-one");
  assert.equal(result[0].price, 22);
  assert.equal(result[0].inStock, false);
});

test("missing API media preserves the local primary image and gallery", () => {
  const result = mergeProducts([product("one")], [apiProduct("one", { image: "/generic.webp", imageUrls: ["/generic.webp"], apiMediaAvailable: false })]);
  assert.equal(result[0].image, "/images/one.webp");
  assert.deepEqual(result[0].imageUrls, ["/images/one.webp", "/images/one-back.webp"]);
});

test("valid API media leads and local gallery remains deduplicated", () => {
  const local = product("one");
  const api = apiProduct("one", { image: "https://media.example/front.webp", imageUrls: ["https://media.example/front.webp", local.image], apiMediaAvailable: true });
  const [result] = mergeProducts([local], [api]);
  assert.equal(result.image, "https://media.example/front.webp");
  assert.deepEqual(result.imageUrls, ["https://media.example/front.webp", local.image, "/images/one-back.webp"]);
});

test("new API product is appended and remains backend orderable", () => {
  const result = mergeProducts([product("one")], [apiProduct("new")]);
  assert.equal(result.length, 2);
  assert.equal(result[1].id, "api-new");
  assert.equal(isBackendOrderableProduct(result[1]), true);
});

test("listing clones are not collapsed into the canonical API product", () => {
  const result = mergeProducts([product("one"), product("one", { id: "one-listing-20", name: "One family pack" })], [apiProduct("one")]);
  assert.equal(result.length, 2);
  assert.ok(result.some((item) => item.id === "one-listing-20"));
});

test("similar display names with different slugs do not merge", () => {
  const result = mergeProducts([product("local-one", { name: "Same Name" })], [apiProduct("api-one", { name: "Same Name" })]);
  assert.equal(result.length, 2);
});

test("local product lookup resolves exact ID instead of the first product", () => {
  const products = [product("first"), product("second")];
  assert.equal(findExactLocalProduct(products, "second")?.id, "second");
});

test("unknown local product identifier returns null", () => {
  assert.equal(findExactLocalProduct([product("first")], "unknown"), null);
});

test("local-only product is never backend orderable", () => {
  assert.equal(isBackendOrderableProduct(mergeProducts([product("one")], [])[0]), false);
});

test("unambiguous exact variant identity creates migration mapping", () => {
  const local = product("one");
  const api = apiProduct("one", { variants: [{ id: "api-v", uuid: "api-v", label: "Default", packSize: "1 pack", price: 12, unitPrice: "$12/pack" }] });
  assert.equal(mergeProducts([local], [api])[0].compatibility?.localVariantToApiVariant["one-default"], "api-v");
});

test("different pack sizes do not create a variant migration", () => {
  const local = product("one");
  const api = apiProduct("one", { variants: [{ id: "api-v", uuid: "api-v", label: "Default", packSize: "2 pack", price: 12, unitPrice: "$6/pack" }] });
  assert.deepEqual(mergeProducts([local], [api])[0].compatibility?.localVariantToApiVariant, {});
});

test("API failure fallback keeps every original homepage section", () => {
  const local = [{ title: "One", sectionId: "one", seeAllHref: "/category/one", items: [product("one")] }];
  assert.equal(mergeHomepageSections(local, []).length, 1);
  assert.equal(mergeHomepageSections(local, [])[0].items.length, 1);
});

test("homepage merge overlays matches and appends API-only products without duplicate sections", () => {
  const local = [{ title: "One", sectionId: "one", seeAllHref: "/category/one", items: [product("one")] }];
  const api = [{ title: "One API", sectionId: "one", seeAllHref: "/category/one", items: [apiProduct("one"), apiProduct("new")] }];
  const result = mergeHomepageSections(local, api);
  assert.equal(result.length, 1);
  assert.equal(result[0].items.length, 2);
});

test("empty API-only homepage sections are not appended", () => {
  const result = mergeHomepageSections([], [{ title: "Empty", sectionId: "empty", seeAllHref: "/category/empty", items: [] }]);
  assert.deepEqual(result, []);
});

test("related-product exclusion recognizes merged UUID and slug identity", () => {
  const local = product("one");
  const merged = mergeProducts([local], [apiProduct("one")])[0];
  assert.equal(productsExcludeSameIdentity(local, merged), true);
});
