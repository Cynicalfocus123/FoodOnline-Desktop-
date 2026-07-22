# FoodOnline-Desktop-

> **Priority release rule:** every completed production-delivery task generates and verifies both `FoodOnlines_Frontend_Hostinger_Clean.zip` and `FoodOnlines_Backend_Hostinger_Clean.zip` together from fresh authoritative source. This applies even when only one side changed and supersedes older `no ZIP` or single-archive notes. After success, the external release directory keeps only this latest canonical pair and deletes every other root-level ZIP plus both temporary clean staging folders. Only a direct user instruction for the current task can waive an archive. See `AGENTS.md` and `DEPLOYMENT.md` for the required ZIP32 root layout and verification gates.

> Administrator customer detail (2026-07-22): direct/refreshed Customer edit routes now load the selected Laravel customer with every real saved address and active masked payment method. The UI distinguishes loading, confirmed-empty, safe failure/retry, and unavailable states and rejects stale/wrong-customer responses. Payment output excludes provider tokens and raw credentials. No migration or parallel storage was added.

> Account-menu logout and administrator LINE ID (2026-07-21): signed-in desktop/tablet and mobile account navigation now expose one accessible Log out action that clears account-owned frontend state before revoking the existing public token. Admin Customer, Supplier, and Partner lists show any supplied LINE ID directly below the primary contact number. No schema migration is required; the verified release contains a 1,035-file frontend mirror and 288-file backend archive. External Hostinger deployment remains a separate manual action.

> Account persistence (2026-07-21): authenticated addresses are Laravel-authoritative and shared by Address Book and checkout. Administrator customer detail is strictly customer-scoped. Product hearts use canonical UUID favorites, and Saved Items is the shared persisted-favorites view.

> Enterprise CMS workflow (2026-07-18): the unchanged admin sidebar now opens dedicated scalable list pages and full-width create/edit routes for content and user modules. Product variants remain inside Product Edit, nested admin routes refresh through `admin.html`, and requested production ZIPs are generated from the final backend/frontend mirrors. See `AGENT.md`, `DESIGNER.md`, `design.md`, and `DEPLOYMENT.md`.

> Brand country selector update (2026-07-18): Admin Brands now uses a searchable, keyboard-accessible list of all 249 assigned ISO 3166-1 alpha-2 entries, displays country names for existing records, and continues storing the unchanged two-letter code. No backend, schema, route, theme, or brand-data migration is involved.

> Hostinger local media release (2026-07-18): Laravel-managed Hostinger storage is now the default upload provider for catalog and customer-operational media. New uploads use stable `local://media/...` references and the public `/api/media` resolver; administrator Reviews, Returns, and Support panels can append/remove persisted attachments; optional direct upload and existing references remain compatible. See `DEPLOYMENT.md` and `docs/admin-catalog-and-r2.md`.

> CMS restoration release (2026-07-18): soft-deleted categories are restored in place before missing originals are appended, deletion uses a no-typing Cancel/Delete modal, and category/brand/product images can be selected before initial save. Manual non-ZIP deployment uses `backend-live/` and `frontend-upload/` with `DEPLOYMENT.md`.

> Frontend production API visibility fix (2026-07-17): the centralized frontend host is `https://api.foodonlines.com/api/v1`, hybrid catalog mode remains active, and production customer/admin UI must not display API, backend, infrastructure, or raw technical error details. See `AGENT.md` and `DESIGNER.md`.

> Current catalog compatibility (2026-07-15): production uses explicit hybrid mode so the complete approved local storefront remains visible while matching/new Laravel catalog records overlay and append automatically. Strict API-only and isolated local modes remain available. See `docs/hybrid-catalog-compatibility.md`.

> Phase 7 current state (2026-07-15): operational commerce is implemented in the Laravel source and mirrored `backend-live/`, while the production frontend build and `frontend-upload/` mirror include persistent favorites/saved data, real reviews, Buy Again, notifications, receipts, SEO, and admin operations. Local Node validation is evidence-based; PHP/MySQL and external Hostinger/R2/SMTP/queue state are not claimed. See `docs/operational-commerce-phase-7.md`.

> Phase 6 current state (2026-07-14): the existing storefront now has a transactional Laravel commerce boundary for backend/guest/authenticated carts, server checkout quotes, inventory reservations, admin promotions, real COD orders, customer order history, and admin ecommerce operations. COD is the only operational payment method; no merchant provider or raw card flow is configured. See `docs/transactional-commerce-phase-6.md`.

> Phase 4 current state (2026-07-13): the existing standalone admin dashboard manages categories, aliases, brands, products, variants, media, nutrition, and publication readiness. Laravel provides secure browser-to-R2 authorization/completion plus cleanup, but external Hostinger and Cloudflare configuration remain separate and were not performed. See `docs/admin-catalog-and-r2.md`.

> Phase 3 current state (2026-07-13): Laravel brands, grocery products, sellable variants, and product media APIs are implemented on `main`; see `docs/backend-product-catalog.md`. No frontend catalog switch or external Hostinger deployment is implied.

## Current repository delivery state

The Laravel foundation and category-management backend are on `main`. The repository backend deployment mirror is `backend-live/` and must be regenerated with `node scripts/sync-backend-live.mjs` for every backend change. Every completed task reviews and updates all tracked Markdown documentation; external Hostinger deployment is never implied by the repository mirror.

Backend changes use one combined pass: edit Laravel source, validate, generate `backend-live/`, verify parity, commit source/docs/mirror together, and push `main`. Do not hand-edit the generated mirror. Every production-delivery pass packages both verified frontend and backend mirrors as the clean Hostinger archive pair at ZIP root and keeps the archives outside Git.

FoodOnlines desktop homepage built with React, TypeScript, Zustand, and Tailwind CSS.

```
