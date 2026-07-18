# FoodOnlines Core Grocery Product Catalog

> 2026-07-18 category compatibility: permanent deletion rejects assigned products. Product publication remains variant/SKU/price/category/currency dependent but no longer requires media; public resources permit the storefront fallback image.

## Phase 7 compatibility note (2026-07-15)

Products and variants now expose SEO fields, review aggregates, and real order-data Best Selling without changing publication or exact variant identity. Review media uses the existing R2-compatible media workflow; see `docs/operational-commerce-phase-7.md`.

> Phase 4 extension (2026-07-13): the Phase 3 models and invariants are now exposed in the existing admin portal, product media supports verified managed R2 objects, and product detail can return nullable nutrition facts. See `admin-catalog-and-r2.md`; seller offers/inventory remain out of scope.

## Phase 3 scope

Phase 3 implements backend-only brands, products, sellable variants, and product image metadata. It preserves the Laravel 12.63.0 authentication/category contracts, keeps the frontend on its local synchronous catalog adapter, seeds no fake catalog, and does not introduce attributes, seller offers, inventory, uploads, orders, or payments.

## Architecture and tables

`brands` stores an integer key, public UUID, unique name/slug identity, safe optional logo path, optional two-letter country code, active/order state, nullable admin audits, and timestamps. Inactive brands remain attached to existing products but cannot be newly assigned and are absent from the normal public filter list.

`products` stores an integer key, public UUID, restrictive category and optional brand foreign keys, unique stable slug, customer description, two-letter origin, `ambient|refrigerated|frozen` storage, ingredient/allergen/storage text, `draft|published|archived` state, featured flag, publication time, nullable audits, and timestamps. A product has one category, optional brand, many variants/media, one active default variant, and one primary image.

`product_variants` stores a public UUID, product, label, globally unique uppercase SKU, optional unique string GTIN (8/12/13/14 digits), optional display size, paired positive decimal net content and unit (`mg|g|kg|ml|l|fl_oz|oz|lb|ct`), positive pack count, package type (`bag|box|bottle|can|jar|pouch|carton|tray|tub|pack|other`), decimal(12,2) price/compare-at price, configured three-letter currency, availability (`in_stock|out_of_stock|preorder|backorder`), active/default flags, order, and timestamps. Compare-at price must exceed current price.

`product_media` stores product, unique-per-product safe path, optional alt text, `contain|cover` fit, primary flag, order, and timestamps. Phase 3 accepts metadata only and caps products at 12 images.

## Invariants and publication

Variant changes lock the product and sibling rows in a transaction. The first active variant becomes default; making another default clears siblings. An inactive variant cannot be default. Deactivating a default promotes the next active variant or fails if a published product would lose its final active default.

Media changes use the equivalent transaction/locking rule. The first image becomes primary; choosing another clears siblings; deleting primary promotes the next ordered image. A published product cannot lose its final image.

Publication requires a published, non-deleted category whose visibility is `public` or `catalog_only`, at least one active variant, exactly one active default with non-empty SKU/positive price/configured currency, at least one image, and exactly one primary image. Publish sets `published_at`; archive clears it and hides the product; restore returns archived to draft without publishing.

Public list visibility additionally requires a `public` category. Direct detail permits `catalog_only`; hidden, draft, archived, incomplete, and deleted-category products return a safe 404.

## API routes

All admin routes use `/api/v1/admin`, `admin.token`, and `throttle:api`.

```text
GET|POST /brands
GET|PATCH|DELETE /brands/{brand:uuid}
GET|POST /products
GET|PATCH|DELETE /products/{product:uuid}
POST /products/{product:uuid}/publish
POST /products/{product:uuid}/restore
GET|POST /products/{product:uuid}/variants
POST /products/{product:uuid}/variants/reorder
PATCH|DELETE /product-variants/{variant:uuid}
POST /product-variants/{variant:uuid}/make-default
GET|POST /products/{product:uuid}/media
POST /products/{product:uuid}/media/reorder
PATCH|DELETE /product-media/{media}
POST /product-media/{media}/make-primary
```

Public, rate-limited routes are:

```text
GET /api/v1/catalog/products
GET /api/v1/catalog/products/{slug}
GET /api/v1/catalog/brands
```

Product filters are `search`, `category` (canonical or active alias), `brand`, `country_of_origin`, `storage_type`, `availability`, `featured`, `min_price`, and `max_price`; sorts are `featured`, `newest`, `price_asc`, `price_desc`, `name_asc`, and `name_desc`. Pagination defaults to 24 and caps at 100. Search covers product/brand name and active variant SKU/GTIN. Brand lists support search/country/sort/pagination and return only active brands with visible products.

## Request and response examples

```json
{"category_id":4,"brand_id":2,"name":"Kewpie Mayonnaise","slug":"kewpie-mayonnaise","country_of_origin_code":"JP","storage_type":"ambient"}
```

```json
{"title":"500 ml Bottle","sku":"KEW-MAYO-500","gtin":"00123456789012","net_content_value":500,"net_content_unit":"ml","package_type":"bottle","price_amount":8.99,"compare_at_price_amount":10.99,"currency_code":"USD","availability_status":"in_stock"}
```

Public list/detail responses expose mapper-compatible top-level `price`, `old_price`, `currency_code`, `in_stock`, `availability_status`, `size`, `sku`, `primary_image`, `image_urls`, and `image_fit`. They are derived from the active default variant and primary/ordered media; no duplicate price columns exist on products. Detail adds category/brand summaries, food fields, active variants, ordered images, and publication time.

Validation errors retain Laravel's `{ "message": "The given data was invalid.", "errors": { ... } }` shape. Unsafe paths, duplicate identifiers, deleted categories, newly assigned inactive brands, published slug changes, invalid controlled values, incomplete net-content pairs, non-positive/invalid prices, ownership mismatches, and invariant-breaking actions are rejected.

## Migration and delivery workflow

Use a verified non-production database:

```bash
php artisan migrate:status
php artisan migrate
php artisan migrate:rollback --step=4
php artisan migrate
```

Review rollback impact before any production rollback; never use `migrate:fresh`, `db:wipe`, or destructive database resets against production.

After tests/cache/route checks pass, run `node scripts/sync-backend-live.mjs` exactly once from final authoritative source. Commit the source, documentation, generated mirror, and `SHA256SUMS` together on `main`, then push. `backend-live/` is a repository mirror, not proof of external Hostinger deployment, and no backend ZIP is part of this workflow.

## Phase 4 handoff

Phase 4 must inspect real operational requirements and this completed catalog before choosing supplier offers, seller prices, inventory/warehouses, fulfillment, imports, or R2 uploads. Shared product identity and variant package identifiers should remain stable; seller-specific commerce data belongs in later offer/inventory structures rather than these Phase 3 tables.
