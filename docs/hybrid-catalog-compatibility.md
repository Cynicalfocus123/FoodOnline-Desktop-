# Hybrid Catalog Compatibility

## Purpose and root cause

Phase 5 correctly connected the public storefront to Laravel, but production selected the API repository exclusively. The category strip therefore received only API homepage categories. Homepage sections were created only from those categories, and empty API sections were removed. Laravel is not yet populated with every approved frontend category, product, image, gallery, and detail record, even though the complete original data and media remain in the repository. The result was an incomplete-looking storefront.

Hybrid mode is a temporary migration bridge. It restores the original storefront as presentation compatibility while keeping Laravel connected and authoritative for matching records and automatically showing newly published backend records.

## Source modes and production configuration

- `VITE_CATALOG_SOURCE=local` uses only the original local catalog for isolated development/demo work.
- `VITE_CATALOG_SOURCE=api` uses only Laravel and preserves strict API errors. It never silently falls back.
- `VITE_CATALOG_SOURCE=hybrid` loads local data, requests Laravel data, and merges both. API failure or timeout leaves the local storefront usable and records a safe non-blocking synchronization warning.

Current production values are committed in `.env.production`:

```text
VITE_API_BASE_URL=https://www.api.foodonlines.com/api/v1
VITE_CATALOG_SOURCE=hybrid
VITE_BASE_PATH=/
```

These are public build-time settings and contain no secrets. Admin, authentication, cart, checkout, and order APIs continue using the same production API base.

## Identity and authority

Category identity is a shared UUID when both records expose one, otherwise the normalized canonical slug. Similar names never merge. Local order is retained; matching API categories stay in the same position; new API categories append in API order. API UUID, canonical slug, published name, SEO, and usable media win. Local icon, section identity, route, and image remain when the API does not provide usable media.

Product identity is a shared UUID, then canonical slug, then stable product SKU only when an exact variant identity also matches. Display name is never identity. Listing clones are protected from collapsing even when they intentionally share the canonical product slug. Variants use API UUID, SKU, then stable source ID; different pack sizes are not mapped.

For a matched product, Laravel owns UUID, canonical slug, product/category/brand identity, price, compare-at price, currency, availability, stock, exact variants, SKU/GTIN, valid media, supplied ingredients/storage/nutrition, real reviews, and real sold counts. Local data fills omitted presentation fields such as existing image/gallery, description, recipes, return copy, badges, tags, provider/origin display, filter presentation, and review presentation only when real API review data is absent.

## Media and galleries

Usable API media is first. Original local primary/gallery media follows, normalized URLs are deduplicated, and source order is retained. If API media is absent, empty, or represented only by mapper fallback state, the original local image and `contain`/`cover` behavior remain. Local AVIF, WebP, JPEG/JPG, PNG, and required JFIF files stay in the production asset copy.

## Repository behavior

The hybrid repository implements homepage, categories, category detail/listings, paginated products, product detail, related products, search, brands, delivery types, product types, and Made In options.

- Homepage: all original sections remain in approved order. Matching API products overlay local records, API-only products append to the matched section, and non-empty API-only categories append as new sections.
- Category pages: exact local/API category resolution occurs before products merge. Existing 60-item local grids remain, API matches overlay, and API-only records append.
- Product detail: exact local ID, listing-clone ID, local/API slug, and API UUID are supported. Unknown identifiers return `null`; they never return the first product.
- Search: tolerant local ranking remains first, API results merge, matching records appear once, and API-only records append.
- Related products: local/API same-category results merge, current identity is excluded by UUID/slug/ID, and the requested limit is preserved.
- Filters: local options remain, compatible API options append, and normalized text deduplicates values.

Requests are shared while in flight and bounded by a five-second hybrid fallback. A failed/timed-out request does not clear local arrays, throw raw API details into the UI, retry forever, or alter strict API mode.

## Cart, Favorites, and Saved for Later

API-backed cart lines preserve the completed Phase 6/7 backend behavior. API listing records that do not include exact variant UUIDs hydrate product detail only when Add to Cart is requested; Laravel receives the exact backend variant UUID, never a fabricated UUID.

Local-only products remain visible with image, name, variant label, quantity, selection, remove, and Save for Later behavior. They are marked compatibility-only and display: “This item is still being synchronized with our catalog and cannot be ordered yet.” They are excluded from backend cart hydration, checkout selection, quote payloads, and order submission. They are never silently dropped, substituted, or submitted under a fake product/variant identity.

When a local product later matches Laravel unambiguously, the product identity can migrate to the backend UUID. Cart and Saved for Later variants migrate only when exact SKU or exact label plus pack size identifies a real API variant UUID. Quantity and selected state remain and duplicate IDs collapse. Favorites migrate after unambiguous product identity. Unmatched sizes remain local compatibility state.

## Removal gate and strict API cutover

Switch production to `VITE_CATALOG_SOURCE=api` and delete local compatibility data only after all 16 approved categories, aliases, 240 base products, every approved listing/detail identity, exact variant UUID/SKU/pack size, primary image/gallery, description, nutrition, recipe/return presentation requirement, search/filter field, publication flag, price/availability, and cart/favorite/saved identity are present in Laravel; all R2 URLs resolve; category/home/search/detail/related/cart/checkout smoke tests pass; and API failure behavior is intentionally accepted as strict production behavior.

This repair does not modify Laravel, `backend-live/`, database migrations, API contracts, visual layout, route names, or external Hostinger state.
