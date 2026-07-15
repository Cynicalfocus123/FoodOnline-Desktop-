# FoodOnlines Category Backend

## Phase 7 compatibility note (2026-07-15)

Category SEO metadata and sitemap output remain additive to the Phase 2 hierarchy contract. Phase 7 operational commerce and deployment verification are documented in `docs/operational-commerce-phase-7.md`; no category identity or hierarchy behavior is replaced.

> Phase 4 extension (2026-07-13): the existing category fields and alias APIs now have an admin UI and managed R2 upload purposes for tile, icon, desktop banner, and mobile banner. See `admin-catalog-and-r2.md`; the Phase 2 hierarchy contract remains unchanged.

## Current status and documentation rule

Step 2 source and the matching `backend-live/` mirror were introduced together by `396b2ae` and remain current on `main`. Phase 3 now adds the restrictive `Category::products()` relationship and complete product catalog described in `docs/backend-product-catalog.md` without redesigning category behavior. Category administration supports creation, partial name/metadata edits, archive/restore, guarded permanent deletion, reordering, and aliases. Every task reviews and updates all tracked Markdown documents; older Step 1 statements elsewhere are historical snapshots.

All future category/backend changes follow one pass: authoritative Laravel edit, tests, `sync-backend-live.mjs`, parity verification, combined source/docs/mirror commit, and automatic `main` push. Generated mirror files are not edited manually and no backend ZIP is produced.

## Existing-code audit

| Existing file/area | Purpose and status | Conflict risk | Action |
| --- | --- | --- | --- |
| `routes/api.php` catalog group | Empty Step 2 reservation from the completed foundation | Low | Reused for public category routes; preserved every Step 1 route and middleware |
| Backend migrations/models/controllers | No category, taxonomy, alias, or category foreign-key implementation existed | None | Added new timestamped schema and classes; no duplicate was created |
| `src/data/home.ts` and catalog contracts | Authoritative frontend-only category names, order, images, slugs, and `baby-care` alias | Medium if frontend were changed | Read as seed input only; frontend remains unchanged |
| Admin token middleware and API errors | Verified Step 1 admin boundary and Laravel `{message, errors}` validation | High if replaced | Reused unchanged for every category write route |

## Scope and schema

Step 2 adds category taxonomy only. `categories` uses the existing integer key convention plus a unique public UUID. It stores a nullable self-referencing `parent_id`, unique canonical slug, name/description, publication status, visibility, deterministic sibling order, depth/path metadata, four media paths, homepage/navigation/feature flags, default product sort, SEO fields, publication time, nullable creator/updater IDs, timestamps, and soft deletion. `category_aliases` stores a unique alias slug, category, 301/302 code, active flag, nullable creator, and timestamps.

Products, attributes, brands, inventory, R2 uploads, orders, and payments do not exist in this step. The future product relationship should reference `categories.id`; category-specific attribute assignments belong to Step 3.

## Hierarchy, states, and deletion

Visible frontend categories remain roots to preserve current slugs. The adjacency list is authoritative; `depth` (`0..3`) and materialized slug `path` are synchronized transactionally for efficient administration. Moves rebuild descendant metadata. A single hierarchy service rejects self-parenting, direct/indirect cycles, moving below a descendant, and any subtree exceeding four levels.

Statuses are `draft`, `published`, and `archived`. Visibilities are `public`, `hidden`, and `catalog_only`. Public lists/tree contain only published, non-deleted, public records. `catalog_only` is available by direct canonical or alias lookup; hidden records are admin-only.

Normal removal archives a category and clears publication/navigation/homepage exposure. Restore returns it to `draft`, never directly to published. Permanent deletion requires an archived category, exact `confirm_slug`, and no active or soft-deleted children; aliases are deleted in the same transaction. Future product/navigation foreign keys must retain restrictive deletion behavior.

## Media, SEO, aliases, and cache

`image_path`, `icon_path`, `desktop_banner_path`, and `mobile_banner_path` accept safe local runtime paths, absolute HTTPS URLs, or explicitly marked `r2://` keys. Windows paths, traversal, script schemes, executable files, and `file://` are rejected. HTTPS URLs pass through unchanged; local paths are prefixed with `APP_URL`; unresolved R2 keys return a null public URL until R2 is implemented.

SEO supports optional title, description, canonical HTTPS URL, and robots index/follow flags. Slug aliases cannot collide with canonical slugs or other aliases. Changing a published canonical slug creates an active 301 alias for the previous slug. Public alias lookup returns canonical data plus `resolved_from_alias` and `redirect_code` metadata.

Public tree and slug lookup use five-minute cache entries keyed by a shared category version. Create, update/move, reorder, archive, restore, delete, and alias changes increment that version, invalidating every public category view without requiring Redis or cache tags.

## Endpoints

Public, rate-limited, unauthenticated routes:

```text
GET /api/v1/catalog/categories
GET /api/v1/catalog/categories/tree
GET /api/v1/catalog/categories/{slug}
```

List filters include parent slug, root/navigation/homepage/featured flags, one-level children, safe sorting, and pagination capped at 100. Lookup returns `data`, `breadcrumbs`, and alias `meta`.

Protected admin-token routes:

```text
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
POST   /api/v1/admin/categories/reorder
GET    /api/v1/admin/categories/{category}
PATCH  /api/v1/admin/categories/{category}
DELETE /api/v1/admin/categories/{category}
POST   /api/v1/admin/categories/{category}/archive
POST   /api/v1/admin/categories/{category}/restore
GET    /api/v1/admin/categories/{category}/aliases
POST   /api/v1/admin/categories/{category}/aliases
DELETE /api/v1/admin/category-aliases/{alias}
```

Admin lists support search, status, visibility, parent/root, featured/navigation/homepage, trashed, safe sort/direction, and pagination capped at 100. The current Step 1 schema has one authorized `admin` role; a granular super-admin/catalog-manager/read-only matrix must be introduced in a later authorization phase rather than invented here.

## Request and response examples

```json
{
  "name": "Snacks & Munchies",
  "slug": "snacks-munchies",
  "parent_id": null,
  "status": "published",
  "visibility": "public",
  "show_in_navigation": true,
  "show_on_homepage": true,
  "default_sort": "popular",
  "image_path": "assets/categories/snacks-munchies.jpg"
}
```

```json
{
  "parent_id": null,
  "category_ids": [4, 2, 9, 1]
}
```

```json
{
  "alias_slug": "old-snacks",
  "redirect_code": 301,
  "is_active": true
}
```

Public resources return string `id`, UUID, name, slug, description, normalized media URLs, flags, default sort, and children. Admin resources additionally return hierarchy, status/visibility, raw media paths, SEO, aliases, publication data, and timestamps. Laravel validation errors retain the Step 1 `{message, errors}` JSON contract.

## Seeding, migration, rollback, and deployment mirror

The idempotent `CategorySeeder` uses the authoritative 16 frontend roots and the verified `baby-care -> vegan-foods` 301 alias. It is intentionally not called by `DatabaseSeeder`; production seeding requires explicit review and invocation.

```bash
php artisan migrate --force
php artisan db:seed --class=CategorySeeder --force
php artisan migrate:rollback --step=2 --force
```

Before production migration, verify a backup, Step 1 migration state, generated SQL compatibility, and the exact integrated Git commit. Never run `migrate:fresh`, `db:wipe`, or destructive reset commands on production.

The repository backend live version is rebuilt without a ZIP:

```bash
node scripts/sync-backend-live.mjs
```

It includes deployable Laravel source and the isolated backend public entry, excludes secrets/vendor/tests/frontend/runtime data, and writes `backend-live/SHA256SUMS`. After any rebase or merge, rerun all tests and this sync before committing source and mirror together.

## Verification and Step 3 handoff

```bash
composer validate --strict
php artisan route:list --path=api/v1/catalog --except-vendor
php artisan route:list --path=api/v1/admin/categories --except-vendor
php artisan migrate:status
php artisan test --filter=Category
php artisan test
php artisan config:cache
php artisan route:cache
php artisan optimize:clear
node scripts/sync-backend-live.mjs
```

External live verification, when separately authorized and available, checks health, all three public category routes, and authenticated admin access without logging credentials. Step 3 may add attributes/products only after these gates and source/mirror parity pass.
