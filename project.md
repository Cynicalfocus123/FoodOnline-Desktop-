# FoodOnlines Project State

## Priority paired Hostinger archive contract

Every production-delivery task creates and verifies both clean Hostinger archives from the current frontend and backend mirrors. The paired ZIP contract in `AGENTS.md` and `DEPLOYMENT.md` supersedes every historical delivery note below that says not to create a ZIP, requests a single ZIP, or leaves either archive unchanged.

## Administrator customer-detail data contract

The administrator Customer edit route reads one canonical `/api/v1/admin/users/{id}` detail response. It contains selected-customer-only structured addresses plus active saved payment methods limited to masked brand/last-four/expiry/default/status metadata. React versions requests and validates the returned customer ID before rendering; direct routes, loading, empty, retryable error, unavailable, and stale-response states are explicit. Existing Laravel tables and relationships remain authoritative; no migration is involved.

## Enterprise CMS workflow (2026-07-18)

- Admin modules now use dedicated list, create, and edit URLs while preserving the existing sidebar and FoodOnlines visual language.
- Categories, Brands, Products, Customers, Suppliers, Partners, Promo Codes, Orders, Returns, Reviews, and Support have scalable list workspaces with search/filter/sort/export/bulk/pagination controls; editors and operational details occupy separate full-width routes.
- Product variants remain inside Product Edit. Category/brand/product images continue working before first save. Existing records, category restoration, managed media, and storefront data contracts are preserved.
- Managed public users now support protected admin create/edit/archive without hard deletion. Operational records keep their existing customer/commerce creation sources.
- Production ZIPs are generated only with `npm run release:zips`; the release gate enforces Linux-safe `/` entry paths, root-level payload layout, exact file/size parity, forbidden-path checks, and successful extraction before an archive is published.
- Verification passes 40 Node tests and 79 Laravel tests / 636 assertions, TypeScript, a 125-module production build, and the 27-route audit. Final frontend output contains 1,033 files / 91,808,185 bytes with zero missing references or placeholder links.
- Requested release archives are verified at 274 backend files (268,701 bytes) and 1,033 frontend files (90,945,935 bytes), with portable `/` entries, exact source/archive path and size parity, no forbidden paths, and successful full extraction tests.

## Complete brand countries (2026-07-18)

- Admin Brands now presents all 249 assigned ISO 3166-1 countries and territories as unique alphabetically sorted names in a searchable, keyboard-accessible selector.
- Existing `country_code` values automatically resolve to names for editing and list display. Saving still sends the unchanged uppercase ISO alpha-2 code, so existing records and the database contract remain compatible.
- This is a frontend-only CMS correction: no API route, backend validation, schema, authentication, brand data, theme, or storefront design changed.
- Verification passed 38 Node tests, 2 Laravel brand tests / 19 assertions, TypeScript, a 119-module production build, the 27-route audit, and exact 1,033-file `dist/` / `frontend-upload/` SHA-256 parity.

## Current CMS restoration (2026-07-18)

- Frontend design, theme, API routes, authentication, database schema, and product data remain unchanged.
- Category deletion uses a standard Cancel/Delete confirmation modal. No typed name, slug, or keyword is accepted or required; archive, child-category, and assigned-product safeguards remain enforced by Laravel.
- Category, brand, and product images may be selected before initial save. Files remain in browser memory with previews, may be replaced or removed, and upload automatically after the parent record is created through the existing API. Existing media records and immediate upload/replace/remove behavior are preserved.
- Category repair restores soft-deleted database rows in place before inserting only missing original categories. IDs and existing category data are preserved. Published public categories with homepage placement feed the existing homepage query immediately after save/cache invalidation.
- Verification baseline: 36 Node tests; 77 Laravel tests / 619 assertions; TypeScript; PHP syntax; config/route/view cache compilation; repeatable isolated backfill; 119-module production build; 27-route audit; 1,033 production files / 91,774,202 bytes; 273 backend source files plus a clean manifest.

## Delivery contract

Historical task-specific contract: use `backend-live/` and `frontend-upload/` while preserving the live `.env`, `vendor/`, database, storage/media, permissions, and `public_html/api`. The current priority rule additionally requires both clean Hostinger ZIPs for every production-delivery pass. After backend deployment run migrations, `catalog:backfill-categories`, and cache rebuilds from `DEPLOYMENT.md`, then smoke-test Admin Categories, homepage categories, deletion, and media lifecycle.
