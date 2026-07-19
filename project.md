# FoodOnlines Project State

## Current CMS restoration (2026-07-18)

- Frontend design, theme, API routes, authentication, database schema, and product data remain unchanged.
- Category deletion uses a standard Cancel/Delete confirmation modal. No typed name, slug, or keyword is accepted or required; archive, child-category, and assigned-product safeguards remain enforced by Laravel.
- Category, brand, and product images may be selected before initial save. Files remain in browser memory with previews, may be replaced or removed, and upload automatically after the parent record is created through the existing API. Existing media records and immediate upload/replace/remove behavior are preserved.
- Category repair restores soft-deleted database rows in place before inserting only missing original categories. IDs and existing category data are preserved. Published public categories with homepage placement feed the existing homepage query immediately after save/cache invalidation.
- Verification baseline: 36 Node tests; 77 Laravel tests / 619 assertions; TypeScript; PHP syntax; config/route/view cache compilation; repeatable isolated backfill; 119-module production build; 27-route audit; 1,033 production files / 91,774,202 bytes; 273 backend source files plus a clean manifest.

## Delivery contract

Use `backend-live/` and `frontend-upload/`; do not create a ZIP. Preserve the live `.env`, `vendor/`, database, storage/media, permissions, and `public_html/api`. After backend deployment run migrations, `catalog:backfill-categories`, and cache rebuilds from `DEPLOYMENT.md`, then smoke-test Admin Categories, homepage categories, deletion, and media lifecycle.
