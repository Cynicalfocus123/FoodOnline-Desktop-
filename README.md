# FoodOnline-Desktop-

> Phase 4 current state (2026-07-13): the existing standalone admin dashboard manages categories, aliases, brands, products, variants, media, nutrition, and publication readiness. Laravel provides secure browser-to-R2 authorization/completion plus cleanup, but external Hostinger and Cloudflare configuration remain separate and were not performed. See `docs/admin-catalog-and-r2.md`.

> Phase 3 current state (2026-07-13): Laravel brands, grocery products, sellable variants, and product media APIs are implemented on `main`; see `docs/backend-product-catalog.md`. No frontend catalog switch or external Hostinger deployment is implied.

## Current repository delivery state

The Laravel foundation and category-management backend are on `main`. The repository backend deployment mirror is `backend-live/` and must be regenerated with `node scripts/sync-backend-live.mjs` for every backend change. Every completed task reviews and updates all tracked Markdown documentation; external Hostinger deployment is never implied by the repository mirror.

Backend changes use one combined pass: edit Laravel source, validate, generate `backend-live/`, verify parity, commit source/docs/mirror together, and push `main`. Do not hand-edit the generated mirror or create a backend ZIP.

FoodOnlines desktop homepage built with React, TypeScript, Zustand, and Tailwind CSS.

```
