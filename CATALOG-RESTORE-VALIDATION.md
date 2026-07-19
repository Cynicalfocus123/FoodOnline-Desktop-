# FoodOnlines Original Catalog Restore Validation

## Result

The repository contains a complete canonical catalog source suitable for missing-only restoration into the current Laravel catalog tables. The generated SQL restores database identities and relationships; it does not import the larger presentation-only listing clones.

The SQL file is 253,213 bytes with SHA-256:

`34cd8c94466decb4a180a99f28777dbd199ea6a2c66835d034fac33e99210de8`

## Verified source counts

| Source data | Verified count | Restoration decision |
|---|---:|---|
| Original categories | 16 | Restore missing slugs |
| Category aliases | 1 | Restore `baby-care` → `vegan-foods` when neither a live `baby-care` slug nor alias conflicts |
| Required product brands | 9 | Restore missing brand slugs |
| Canonical products | 240 | Restore all, 15 per category |
| Explicit canonical variants | 720 | Restore three per product |
| Category-listing records | 960 | Do not restore the 720 display clones; only the 240 canonical records are database products |
| Product media references in canonical source | 960 | 225 accepted; 735 omitted |
| Category media references | 16 | All accepted |
| Source nutrition blocks | 240 | 0 restored; all 240 explicitly identify themselves as sample/demo values |

## Expected rows inserted

Given the user-verified live state where the original catalog is missing, the first import is expected to insert:

| Table | Expected first-import rows | Second import |
|---|---:|---:|
| `categories` | 16 | 0 |
| `category_aliases` | 1 | 0 |
| `brands` | 9 | 0 |
| `products` | 240 | 0 |
| `product_variants` | 720 | 0 |
| `product_media` | 225 | 0 |
| `product_nutrition_facts` | 0 | 0 |

Existing source identities reduce the corresponding first-import count because the SQL preserves them. The resolved-source result must still report the complete source count or the pre-commit guard fails.

## Original category slugs

1. `paan-corner`
2. `dairy-bread-eggs`
3. `fruits-vegetables`
4. `cold-drinks-juices`
5. `snacks-munchies`
6. `breakfast-instant-food`
7. `sweet-tooth`
8. `bakery-biscuits`
9. `tea-coffee-milk-drinks`
10. `atta-rice-dal`
11. `masala-oil-more`
12. `sauces-spreads`
13. `chicken-meat-fish`
14. `organic-healthy-living`
15. `vegan-foods`
16. `frozen`

All are root categories with depth `0`, path equal to slug, status `published`, visibility `public`, navigation/homepage placement enabled, default sort `featured`, active soft-delete state, and deterministic sort order `0..15`. `dried-food` is not in the source set and is never inserted, updated, or deleted.

## Brands

The exact source filter-brand identities are:

`NestFood`, `Stouffer`, `StarKist`, `Aldi`, `Adidas`, `Costco`, `Harris`, `ISnack`, and `Burbe`.

Brand identity uses normalized slug. Country code and logo are left null because the source assigns inconsistent generated brand-origin presentation values and provides no verified per-brand ISO country or logo.

## Products and category mapping

`src/data/home.ts` defines 15 explicit product names in every category and creates 240 canonical products with stable slugs `{category-slug}-{1..15}`. Each product is inserted into the category identified by that source slug and the brand identified by normalized source brand slug.

The SQL preserves the source name, slug, description, source price, compare-at price for the default variant, ISO country mapping from the source `madeIn` value, and source storage instructions. Products are published with a positive USD default variant so the existing public query can return them.

Fields not backed by a trustworthy schema-compatible source remain null:

- `storage_type` — source has presentation instructions but no explicit enum-backed value.
- `ingredients_text` — source text labels itself as sample ingredients.
- `allergen_statement` — no authoritative source value.
- product SEO fields — no authoritative source values.

## Stable identity and deduplication

- Categories: canonical slug; deterministic UUID derived from `category:{slug}`.
- Alias: globally unique alias slug.
- Brands: normalized slug; deterministic UUID derived from `brand:{slug}`.
- Products: canonical product slug; deterministic UUID derived from `product:{slug}`.
- Variants: globally unique SKU; deterministic UUID derived from `variant:{sku}`.
- Product media: current unique identity `(product_id, path)`.
- Integer IDs: assigned by MySQL; relationships resolve through slugs and SKUs.

The deterministic identifiers use one fixed namespace and UUID version-5 formatting. Existing matching slugs or SKUs are preserved. A deterministic UUID mapped to another live slug, or a source SKU mapped to another live product, triggers the temporary duplicate-key safety guard before commit.

## Variant and SKU strategy

Every canonical product has the three variants explicitly defined by the source:

- Default — source SKU, source package size, source price and compare-at price, default/active/in-stock.
- Family Size — source SKU plus `-FAM`, source `2 x` package label and price, active/in-stock.
- Bundle — source SKU plus `-BND`, source `3 x` package label and price, active/in-stock.

Size values map only to current supported units: `g`, `kg`, `ml`, `l`, and `ct`; `pcs` and `pack` map to `ct`. Currency is `USD`. GTIN and package type remain null because the source does not provide them. The post-insert guard requires exactly one active default variant for every source product.

## Media compatibility

- All 16 category image files exist in `frontend-upload` and are restored as stable `https://foodonlines.com/assets/categories/...` URLs.
- 225 canonical products have one real static primary image under the deployed `assets/*-mockups/` folders. All 225 files were confirmed present in `frontend-upload` and are accepted as HTTPS product-media references.
- 735 product gallery references are generated `data:image/svg+xml` values. The current media validator rejects `data:` values, and they are not durable production files, so they are omitted.
- The 15 Paan Corner products have only generated data images and therefore receive no product-media row. Current publication code permits products without media and supplies presentation fallback artwork.
- No Windows path, drive path, localhost URL, `file://` URL, source-only path, signed URL, or credential appears in the SQL.

## Nutrition decision

`createNutritionFacts()` generates 240 blocks containing the sentence “Sample nutrition values for demo display.” These are not verified nutrition facts. Per the restoration safety requirement, `product_nutrition_facts` receives zero rows. Admin can add verified nutrition later without conflicting with this import.

## Source files inspected

- Project rules/state: `AGENT.md`, `design.md`, `weight.md`.
- Canonical frontend source: `src/data/home.ts`, `src/types/catalog.ts`.
- Frontend catalog behavior: `src/services/catalog/localCatalogRepository.ts`, `hybridCatalogRepository.ts`, `apiCatalogRepository.ts`, `catalogMerge.ts`, `catalogIdentity.ts`, `catalogCompatibility.ts`, `catalogCategoryAuthority.ts`, `apiCategoryMapper.ts`, `apiProductMapper.ts`, and repository interfaces/exports.
- Category schema/runtime: category and alias migrations, `Category`, `CategoryAlias`, admin/public controllers, admin/public resources, category requests/services, `CategorySeeder`, and `LegacyCategoryBackfill`.
- Product schema/runtime: brand/product/variant/media/nutrition migrations; their models, requests, services, admin/public controllers, and resources.
- Deployment schema assumptions: matching migrations and catalog runtime files in `backend-live`, plus `backend-live/SHA256SUMS`.
- Media contract: `SafeMediaPath`, `MediaStorageManager`, `CategoryMediaUrl`, `public/assets`, and `frontend-upload/assets`.
- Other catalog candidates: repository-wide searches for catalog JSON, fixtures, legacy SQL, migrations, seeders, static arrays, product names, SKUs, and inserts. No second authoritative product dataset or legacy catalog SQL was found. Factories and tests contain test fixtures only and were not treated as production source.

## Validation completed

- Parsed the generated SQL's exact temporary source inserts: 16 categories, 1 alias, 9 brands, 240 products, 720 variants, and 225 media rows.
- Verified deterministic UUID uniqueness, category/product slug uniqueness, SKU uniqueness, and product/brand/category mapping.
- Confirmed all 241 accepted category/product asset files exist in the current frontend deployment mirror.
- Static SQL safety scan found zero `TRUNCATE`, permanent `DROP TABLE`, `DELETE FROM`, `UPDATE`, `ALTER TABLE`, global foreign-key disable, local-drive path, localhost URL, or `file://` URL findings.
- In-memory relational semantic validation ran a first and second import against a current-schema-shaped SQLite database with foreign keys enabled.
- First semantic import: 16 categories, 1 alias, 9 brands, 240 products, 720 variants, 225 media, 0 nutrition.
- Second semantic import: zero rows in every table.
- Existing `dried-food`, an arbitrary existing category, an arbitrary existing product/variant, users sentinel, and orders sentinel remained unchanged.
- Foreign-key violations, duplicate slugs, duplicate UUIDs, duplicate SKUs, orphan variants, orphan media, invalid statuses, invalid visibility values, and invalid availability states: all zero.
- Admin-shaped category/product queries resolved all restored records; homepage category query returned 16; every category product query returned 15 published products.
- Existing Laravel catalog/API suites passed after clearing stale generated Laravel cache: 18 tests, 125 assertions.

## Validation not available

- No MySQL/MariaDB server or client is installed in this environment, so the SQL file was not executed by a genuine MySQL engine.
- No live database connection or phpMyAdmin import was used.
- No live admin, storefront, Cloudflare cache, or Hostinger database state was modified or smoke-tested.

The SQL targets the exact inspected MySQL 8+/Laravel schema. The beginner guide requires a live backup before the phpMyAdmin import so the remaining engine/live-environment validation is recoverable.
