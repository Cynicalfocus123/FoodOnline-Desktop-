# FoodOnlines Project State

## Permanent Git, deployment-mirror, and Live-pair contract

Every completed change rebuilds and synchronizes authoritative source, `dist/`, `frontend-upload/`, `backend-live/`, its manifest, documentation, and Git before producing exactly `FoodOnlines_Frontend_Live.zip` and `FoodOnlines_Backend_Live.zip`. Both packages represent one final commit; every other ZIP/stage is removed. The mirrors and ZIPs are deployment-ready artifacts, not evidence that the external Hostinger server was changed. This contract supersedes every conflicting historical note below.

The permanent workflow adoption passed 77 Node tests, TypeScript, production build/audit, exact 1,036-file frontend mirror parity, and a 290-source-file backend manifest audit. Commit `39a81482f6707d20edd009b35599d7dfa1e3248d` was pushed and matched `origin/main` before the paired Live ZIP verification; only the two approved archives remained afterward. External Hostinger deployment was not performed.

## Admin-session and managed-address follow-up (2026-07-22)

The apparent Admin login loop was a frontend state race, not an automatic expiry timer: persisted state initialized as unauthenticated and the portal selected Login before hydration, while every failed `/admin/me` request discarded the token. Admin token responses now serialize `expires_at`; the hydrated session retains its token on retryable network, throttle, and server failures and clears it only for a matching current-token HTTP 401. Logout clears local state first and revokes remotely on a best-effort basis.

Public Address Book routes already authorized Customer, Supplier, and Partner sessions and scoped records by `user_id`. The missing Admin representation was caused by Customer-only address eager loading and Customer-only address UI state/rendering. Admin detail now returns selected-user addresses for all three supported roles, with role-correct neutral empty states; payment metadata remains Customer-only. `npm run test:managed-user-address-acceptance` executes real Customer, Supplier, and Partner registration, persistence, selected-detail, refresh, and cross-role-isolation coverage.

## Urgent authentication and managed-user repair (2026-07-22)

The referral rollout introduced mandatory referral-table reads into every registration and administrator managed-user detail request. Production evidence showed core health and request validation working while the public referral invite path returned a safe HTTP 500, identifying referral schema readiness as the shared failure boundary. The repaired services explicitly treat referral features as unavailable until all referral tables exist, so Customer/Supplier/Partner registration and Admin detail no longer fail with them.

Registration and login now return the same root token/user envelope, and the public frontend uses one strict persistence path that refuses success without a real token, canonical user, and matching role. Direct Admin Customer/Supplier/Partner routes derive their role from the URL, normalize numeric/string IDs, preserve the complete original editor, and isolate profile, address, and masked-payment states. The paired deployment still must apply `2026_07_21_600000_create_referral_program_tables.php` on Hostinger to restore referral functionality; no external migration or live repair is claimed here.

## Real user-address acceptance (2026-07-22)

`npm run test:address-acceptance` creates a temporary migrated SQLite application, registers the customer through the public API, saves Thailand and United States addresses through the same authenticated `/account/addresses` endpoint used by Address Book, and creates a control address for another customer. Direct database inspection and two Admin detail requests prove exactly two selected-customer rows and exactly one Thailand default. A temporary production frontend build is then opened at `/admin/customers/{users.id}/edit` in headless Chrome; the original editor and both country-specific address cards, phone numbers, delivery notes, and single Default badge are asserted before and after refresh, while the control address must remain absent.

The paired release script requires and scans the account address controller/request/resource, Admin controller/resources, `User`/`UserAddress` relationships, routes, and compiled Admin rendering markers at the source stage and inside Windows/PHP extractions. A stale frontend or backend archive therefore fails the whole release.

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
