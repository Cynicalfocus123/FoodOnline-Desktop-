# FoodOnline-Desktop-

> Category administration release (2026-07-18): Laravel is authoritative for public category existence and placement; admin lifecycle work is R2-independent and original categories use a safe missing-only backfill. Manual deployment uses `backend-live/` and `frontend-upload/` with `DEPLOYMENT.md`.

> Frontend production API visibility fix (2026-07-17): the centralized frontend host is `https://api.foodonlines.com/api/v1`, hybrid catalog mode remains active, and production customer/admin UI must not display API, backend, infrastructure, or raw technical error details. See `AGENT.md` and `DESIGNER.md`.

> Current catalog compatibility (2026-07-15): production uses explicit hybrid mode so the complete approved local storefront remains visible while matching/new Laravel catalog records overlay and append automatically. Strict API-only and isolated local modes remain available. See `docs/hybrid-catalog-compatibility.md`.

> Phase 7 current state (2026-07-15): operational commerce is implemented in the Laravel source and mirrored `backend-live/`, while the production frontend build and `frontend-upload/` mirror include persistent favorites/saved data, real reviews, Buy Again, notifications, receipts, SEO, and admin operations. Local Node validation is evidence-based; PHP/MySQL and external Hostinger/R2/SMTP/queue state are not claimed. See `docs/operational-commerce-phase-7.md`.

> Phase 6 current state (2026-07-14): the existing storefront now has a transactional Laravel commerce boundary for backend/guest/authenticated carts, server checkout quotes, inventory reservations, admin promotions, real COD orders, customer order history, and admin ecommerce operations. COD is the only operational payment method; no merchant provider or raw card flow is configured. See `docs/transactional-commerce-phase-6.md`.

> Phase 4 current state (2026-07-13): the existing standalone admin dashboard manages categories, aliases, brands, products, variants, media, nutrition, and publication readiness. Laravel provides secure browser-to-R2 authorization/completion plus cleanup, but external Hostinger and Cloudflare configuration remain separate and were not performed. See `docs/admin-catalog-and-r2.md`.

> Phase 3 current state (2026-07-13): Laravel brands, grocery products, sellable variants, and product media APIs are implemented on `main`; see `docs/backend-product-catalog.md`. No frontend catalog switch or external Hostinger deployment is implied.

## Current repository delivery state

The Laravel foundation and category-management backend are on `main`. The repository backend deployment mirror is `backend-live/` and must be regenerated with `node scripts/sync-backend-live.mjs` for every backend change. Every completed task reviews and updates all tracked Markdown documentation; external Hostinger deployment is never implied by the repository mirror.

Backend changes use one combined pass: edit Laravel source, validate, generate `backend-live/`, verify parity, commit source/docs/mirror together, and push `main`. Do not hand-edit the generated mirror or create a backend ZIP.

FoodOnlines desktop homepage built with React, TypeScript, Zustand, and Tailwind CSS.

```
