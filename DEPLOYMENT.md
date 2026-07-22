# FoodOnlines Laravel Backend Deployment

## Priority paired-archive release rule

Every completed production release must create both `FoodOnlines_Frontend_Hostinger_Clean.zip` and `FoodOnlines_Backend_Hostinger_Clean.zip` as one release pair, including frontend-only, backend-only, migration, configuration, and content changes. Generate both from freshly validated authoritative source and synchronized mirrors using `npm run release:hostinger-clean`; the command replaces both clean staging folders from current `dist/` and `backend-live/` before packaging. Never reuse old archives, extracted releases, or stale staging content. Only a direct instruction from the user for the current release may waive either ZIP.

Both archives must retain the verified Hostinger-safe format: root-level regular files, standard Deflate ZIP32, no wrapper or explicit directory entries, and no unsafe paths, ZIP64, encryption, secrets, symlinks, frontend/backend cross-contamination, or runtime media. Do not mark a release complete until both archives pass CRC/listing, Windows and PHP extraction with SHA-256 parity, required-file checks, and backend `SHA256SUMS` verification. Record both archive paths, file counts, sizes, and SHA-256 hashes in the release handoff.

This rule supersedes older historical sections in this document that say `no ZIP`, permit only one archive, or leave the other archive unchanged.

## Administrator customer-detail release (2026-07-22)

Deploy the synchronized frontend and backend from the same commit. The frontend adds the selected-customer Saved addresses and masked Payment methods presentation; the backend extends the existing administrator user-detail response with the selected customer's structured address records and an allowlisted masked payment-method collection. The route remains inside the existing administrator-token boundary. No migration, table, credential, payment-provider configuration, or public account route changes are required.

Preserve `public_html/api`, `public_html/api/backend-path.php`, the live `.env`, `vendor/`, database, complete storage/media and upload trees, writable permissions, queues, sessions, and runtime data. After replacing application source, clear and rebuild application caches using the established commands below. Local archive generation and tests are not evidence of an external Hostinger deployment.

## Clean Hostinger frontend and backend rebuild (2026-07-22)

The current clean deployment staging roots are `D:\Codex projects\FoodOnlines-Live-Releases\FoodOnlines-Frontend-Clean` and `D:\Codex projects\FoodOnlines-Live-Releases\FoodOnlines-Backend-Clean`. They are created only from a fresh audited `dist/` build and a newly synchronized `backend-live/` mirror, respectively; no old archive, release extraction, or existing staging content is a source.

The clean archives are `FoodOnlines_Frontend_Hostinger_Clean.zip` and `FoodOnlines_Backend_Hostinger_Clean.zip`. They use PHP `ZipArchive` standard Deflate file entries at the ZIP root, with no explicit directory records, ZIP64, passwords, encryption, split parts, symbolic links, NTFS metadata, or backslash paths. The prior custom backend writer is not used. The historical .NET writer has no recorded successful Hostinger extraction, and 7-Zip is not installed in this workspace, so PHP `ZipArchive` is the available standard writer for this clean rebuild.

Each archive is independently listed and CRC-tested by Python `zipfile`, extracted and SHA-256-compared by Windows `Expand-Archive` and PHP `ZipArchive`, and listed by Windows `tar`; the complete package ledger, including final filenames, sizes, hashes, clean-folder counts, manifest result, and superseded archive hashes, is recorded in the non-packaged root release notes. This guide is included in the backend payload, so embedding the backend ZIP's own final SHA-256 here would alter that archive and invalidate the recorded fingerprint.

Extract the frontend contents only into `public_html` while preserving the complete `public_html/api` directory. Extract backend source only into the private Laravel root while preserving the real `.env`, `vendor/`, database, complete `storage/` and media tree, writable permissions, queue/session/runtime state, and `public_html/api/backend-path.php`. Local validation is not evidence that Hostinger File Manager has extracted either clean archive successfully.

## Hostinger File Manager ZIP32 staging workflow (2026-07-22)

Hostinger File Manager returned a 500 while extracting a prior backend archive that passed local extraction. The current backend ZIP is therefore a conservative ZIP32 payload: standard Deflate level 6, no ZIP64, encryption, password, split data, symlink, hard-link, POSIX/NTFS metadata, Unicode/extended extra fields, or explicit empty-directory entries. It contains every verified regular file from `backend-live/` at archive root; it does not contain runtime data or rely on ZIP directory records.

Do **not** extract this archive directly over a populated Laravel application. Use this Hostinger File Manager workflow:

1. Create an empty backend staging folder outside `public_html`.
2. Upload `FoodOnlines_Backend_Live.zip` into that staging folder.
3. Extract the ZIP there.
4. Confirm `artisan`, `app`, `bootstrap`, `config`, `database`, `resources`, and `routes` exist.
5. Back up the live private Laravel directory.
6. Copy application source from staging into the live private Laravel root.
7. Preserve the live `.env`.
8. Preserve `vendor/`.
9. Preserve the complete `storage/` directory.
10. Preserve `storage/app/public/media/`.
11. Preserve permissions and runtime state.
12. Preserve `public_html/api/backend-path.php`.
13. Update `public_html/api` controlled adapter files separately only when required.
14. Delete the staging folder only after smoke tests pass.

The ZIP intentionally omits empty writable runtime folders. Preserve them from the live application; for a newly prepared private root, create `storage/app/public`, `storage/framework/cache/data`, `storage/framework/sessions`, `storage/framework/views`, `storage/logs`, and `bootstrap/cache` through Hostinger File Manager or, when SSH is available, `mkdir -p` followed by account-owner writable permissions. Do not create or package logs, sessions, cache data, queue data, uploads, or media.

The split API adapter remains required: copy `public/backend-path.php.example` to `public_html/api/backend-path.php` only when that file does not already exist, set the real private Laravel absolute path, and preserve it on future deployments. Never package the real file or expose that path in API responses. This workspace has not yet confirmed a successful Hostinger extraction of the replacement archive.

## Hostinger 500 repair: split public API entry (2026-07-22)

The backend archive's `public/index.php` is a controlled API entry file, but in the Hostinger split layout it must be copied to the existing `public_html/api/index.php`; it must not remain only under the private application's `public/` directory. The entry now supports a non-versioned path file so it can locate the private Laravel root safely instead of assuming `public_html` itself is the application.

After extracting the backend ZIP into the private Laravel root, copy `public/backend-path.php.example` to `public_html/api/backend-path.php`, replace `ACCOUNT_USERNAME/foodonlines-backend` with the actual absolute private application path, then copy `public/index.php` and `public/.htaccess` to `public_html/api/`. Preserve `backend-path.php`, the live `.env`, `vendor/`, database, storage/media, uploads, permissions, and runtime state on future updates. The server must use PHP 8.2+ with the required Laravel/PDO MySQL extensions and an installed production `vendor/` directory; the backend ZIP intentionally does not replace dependencies.

If a 500 remains after those files are in place, inspect the private Laravel `storage/logs/laravel.log` and Hostinger PHP error log for the timestamped exception before changing source or database data. Do not extract the backend ZIP into `public_html`.

The frontend ZIP is also Hostinger-safe: its minimal `.htaccess` uses only conditional rewrite rules, has no `Options` or header directives that can be rejected by restricted shared-hosting overrides, and explicitly bypasses `public_html/api`. Extract frontend files directly into `public_html`, preserving the complete `api` directory.

## Complete current-site ZIP package (2026-07-22)

The complete current frontend and backend mirrors were rebuilt and packaged together after validating the active logout, LINE ID, all-country address, shared Saved Items, and Refer & Earn implementations. Each archive has root-level payload entries, no wrapper directory, and passed separate extraction/source SHA-256 parity. The frontend mirror has 1,035 files / 91,847,187 bytes; the backend mirror contains the complete controlled Laravel source plus `SHA256SUMS`, and its manifest passed. The exact final archive count, bytes, and SHA-256 are recorded in the root release notes after packaging, rather than inside this backend payload, because embedding a ZIP's own fingerprint would alter that ZIP.

Extract frontend contents directly into `public_html` while preserving `public_html/api`. Extract backend contents only into the private Laravel root while preserving the live `.env`, `vendor/`, database, complete storage/media, uploads, permissions, and runtime state. Because this current package includes the Refer & Earn migration, after a production database backup and backend upload run from the private root:

```bash
php artisan migrate --force
php artisan migrate:status
php artisan referrals:backfill-codes
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Run the idempotent referral backfill only after referral migrations exist. No Hostinger deployment, production migration/backfill, cache rebuild, or live smoke test was performed from this workspace.

## Account-menu logout and administrator LINE ID release (2026-07-21)

This no-migration release updates the public header/account build and the administrator user-list presentation. Deploy the synchronized `frontend-upload/` and `backend-live/` mirrors from the same commit, or use only the two verified root-level release ZIPs generated by `npm run release:zips`. Preserve the live `.env`, database, `vendor/`, storage/media, permissions, queues, and `public_html/api` exactly as described below.

Smoke-test a signed-in desktop account dropdown, tablet-sized viewport, and mobile hamburger navigation: each must expose one keyboard/touch-accessible Log out action, close its menu, show the logged-out header immediately, and route to the existing login page after logout. Sign in as a second disposable customer after the first logs out and confirm no address, order, notification, saved-item, favorite, or profile data from the first customer reappears. In Admin, check Customer, Supplier, and Partner lists: a supplied LINE ID appears below Contact number, while an omitted LINE ID leaves no placeholder. No Artisan migration command is needed for this release.

The verified archives use the fixed names `FoodOnlines_Frontend_Live.zip` and `FoodOnlines_Backend_Live.zip`; their final counts, bytes, and SHA-256 values are recorded in the non-packaged release notes. Both pass root-layout, source/archive/extraction parity, SHA-256, manifest, unsafe-path, duplicate, separator, secret, and forbidden-content verification. Archive creation does not upload to Hostinger.

## Account-address and favorites release (2026-07-21)

This no-migration release changes frontend and Laravel source together. Deploy synchronized `frontend-upload/` and `backend-live/` mirrors so authenticated address persistence, strict selected-customer address visibility, and UUID-backed Saved Items reach production atomically. Preserve `public_html/api`, live `.env`, vendor, database, writable storage, queues, and uploaded media. Local archive generation is not evidence of a Hostinger or Cloudflare deployment.

## Refer & Earn migration release (2026-07-21 — no ZIP)

Deploy backend-live/ and frontend-upload/ generated from the same commit. Do not run the release-zips script and do not create, upload, or extract a ZIP for this release. Preserve the live .env, vendor/, database, complete storage/media tree, writable permissions, queue/runtime state, and the existing public_html/api entry point.

After backing up the database and uploading only the synchronized source/mirror files to their existing destinations, run from the private Laravel root:

    php artisan migrate --force
    php artisan referrals:backfill-codes
    php artisan optimize:clear
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

Do not use migrate:fresh, reset, truncate, seed, or replace the production database. Smoke-test a direct invite refresh, customer registration with a valid and invalid optional code, account Refer & Earn/Coupons, checkout rejection of another account's referral coupon, delivered+paid/COD qualification, full-refund revocation, and the Referrals admin list/detail/settings. No Hostinger deployment is implied by local mirror generation.

## Production ZIP deployment guide (2026-07-20)

This no-migration release is delivered as `FoodOnlines_Frontend_Live.zip` and `FoodOnlines_Backend_Live.zip`, generated only by `npm run release:zips` from the verified `frontend-upload/` and `backend-live/` mirrors. Each ZIP extracts its own mirror contents at archive root: it has no wrapper folder. The frontend ZIP is for the FoodOnlines domain `public_html`; the backend ZIP is for the private Laravel application directory. Do not interchange those destinations.

### Frontend: `FoodOnlines_Frontend_Live.zip`

1. Back up the existing domain `public_html`, including `.htaccess` and the current hashed assets.
2. **Do not delete or overwrite the existing `public_html/api` directory when replacing frontend files.** It is the separately managed Laravel public entry point and is deliberately absent from the frontend ZIP.
3. Upload `FoodOnlines_Frontend_Live.zip` to the FoodOnlines domain's `public_html` directory and extract it directly there. Do not create `public_html/frontend-upload` or any other wrapper folder.
4. Replace only frontend files at the `public_html` root. Keep `public_html/api` entirely outside any cleanup/replacement selection.
5. Purge Hostinger cache and, when active, Cloudflare cache. Test the homepage, registration, `/admin`, a nested `/admin/...` refresh, cart, and product pages.

### Backend: `FoodOnlines_Backend_Live.zip`

1. Back up the private Laravel directory, live `.env`, production database, `vendor/`, `storage/app/public/media/`, other user uploads, writable-directory permissions, and queue/runtime state where applicable.
2. Upload `FoodOnlines_Backend_Live.zip` to the private Laravel application root. **Never extract it into the frontend `public_html` root.**
3. Extract and replace only the packaged application source. Preserve the live `.env`, existing `vendor/`, production database, `storage/app/public/media/`, all user uploads, storage permissions, writable directories, and queue/runtime state. The package's empty writable directories must never be used to empty or replace live storage.
4. Keep the existing `public_html/api` entry point unless deliberately updating only its controlled Laravel public-entry files. Retain a Hostinger-specific private-root bootstrap path when that is how the live API is configured.
5. This release has **no new migration**. Do not run `migrate`, `migrate:fresh`, reset, seed, truncate, or replace the production database for this release.
6. When the server supports Artisan, run from the private Laravel root:

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

7. Test health, administrator login, registration, promo creation, product creation with images, brand creation with an image, and category creation with images.

The release process verifies SHA-256 parity after separate temporary extraction, rejects unsafe/backslash/duplicate paths, source maps, secrets, frontend/backend cross-contamination, runtime media, and the frontend `api/` path before replacing either archive. The final archive evidence is recorded in the root release notes after packaging; no Hostinger upload is implied by local archive creation.

### Release verification record

The current archive names, counts, bytes, SHA-256 values, mirror parity, and separate-extraction results are recorded in the root release notes after each successful package run. They are deliberately not embedded in this backend payload: a ZIP cannot reliably contain the final fingerprint of itself. The portable release command rejects source maps, secrets, private environment files, runtime media, duplicate or unsafe paths, frontend/backend cross-contamination, and the frontend `api/` path before either archive replaces a prior release artifact. Backend includes only safe empty-directory entries for writable runtime structure; it contains no live `.env`, vendor, database, logs, or runtime media. No Hostinger or Cloudflare deployment is implied by local archive creation.

## Promo, registration, and pre-save media corrections (2026-07-20)

Deploy the synchronized `backend-live/` and `frontend-upload/` from the same commit. No migration is included. Preserve the live `.env`, database, `vendor/`, storage, and existing managed media. Verify the admin Promo Code form accepts blank minimum subtotal and maximum discount, customer/supplier/partner registration works with neither Company name nor LINE ID, and category/brand/product create forms can select media before the first save. Local media status is intentionally non-cacheable; configured local multipart uploads must report available without exposing provider details.

## Enterprise CMS workflow release (2026-07-18)

Deploy `backend-live/` and `frontend-upload/` from the same commit. This release adds protected managed-user CRUD routes and nested admin frontend routes but no database migration. Preserve the live `.env`, `vendor/`, database, complete `storage/` tree and managed media, permissions, and `public_html/api`.

The frontend `.htaccess` now maps `/admin`, `/admin/{module}`, `/admin/{module}/create`, and `/admin/{module}/{id}/edit` to `admin.html`. Upload it with the current hashed assets so direct entries and refreshes do not become white pages. Never extract `FoodOnlines_Frontend_Live.zip` over or delete `public_html/api`.

After backend upload and backup, run `php artisan migrate --force`, `php artisan catalog:backfill-categories`, `php artisan optimize:clear`, `php artisan config:cache`, `php artisan route:cache`, and `php artisan view:cache`. Verify all restored categories, existing media, list/create/edit routes, managed-user archive preservation, product variants inside Product Edit, and mobile/tablet/desktop admin layouts.

The explicitly requested archives are generated outside the repository from the final mirrors with `npm run release:zips` and their contents at ZIP root. Every ZIP entry must use the portable `/` separator; a `\` in any archive entry is a release-blocking failure because Linux hosting panels otherwise extract it as a literal filename. The command verifies source/archive parity and performs a real extraction test before replacing either release file. Backend excludes environment/dependency/runtime data; frontend contains no `api/` path.


## CMS regression restoration (2026-07-18)

This release changes no API route or database schema. Deploy the synchronized backend source and frontend mirror only; do not create or use a deployment ZIP. Preserve the live `.env`, `vendor/`, database, complete `storage/` tree and managed uploads, permissions, and `public_html/api`.

After the backend source is updated and the database is backed up, run from the private Laravel root:

```bash
php artisan migrate --force
php artisan catalog:backfill-categories
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

The backfill first restores soft-deleted category rows in place, preserving their IDs and existing data, then inserts only missing original FoodOnlines slugs and the missing legacy alias. It does not overwrite active edited categories. The command is repeatable; review its restored/created counts. Verify all categories in Admin, published homepage-enabled categories on the storefront, the no-typing delete modal, pre-save category/brand/product image association, replacement/removal, and the existing API entry before completing deployment.

## Hostinger local managed media release (2026-07-18)

This release makes Hostinger Laravel storage the production media provider. Cloud object storage remains optional and is not required for category, brand, product, review, return, or support workflows. Codex did not connect to Hostinger or Cloudflare and did not change either service.

### Required production environment

Keep the existing server-only `.env` and add or update exactly these non-secret values:

```dotenv
MEDIA_DISK=local
MEDIA_UPLOADS_ENABLED=true
MEDIA_PUBLIC_URL=https://api.foodonlines.com/api/media
```

Do not add storage credentials for local mode. `MEDIA_PUBLIC_URL` is the built-in public, rate-limited Laravel media route and works with Hostinger's split `public_html/api` layout without exposing a physical directory. Existing `r2://`, HTTPS, and legacy relative references continue resolving; new uploads use `local://media/...` references.

### Runtime directories and preservation

Uploads are written through Laravel's `public` filesystem under `storage/app/public/media/`. The current purposes create only `brands/`, `categories/`, `products/`, `reviews/`, `returns/`, and `support/` descendants. The database never receives an absolute Hostinger path or browser blob URL.

Before every deployment, back up both the database and the complete private `storage/app/public/media/` directory. Never replace, empty, synchronize with deletion, or use the deployment package's empty `storage/` directory structure to remove anything from the production `storage/` directory. Runtime media is deliberately absent from Git, `backend-live/`, `frontend-upload/`, and ZIP files.

SSH permissions from the private Laravel root must allow the PHP account to write `storage/` and `bootstrap/cache/`. Preserve the existing Hostinger owner/group; do not use world-writable permissions. A typical account-owned installation uses:

```bash
chmod -R u+rwX storage bootstrap/cache
```

The built-in `/api/media` route is the recommended split-layout public-media configuration. A conventional document root may alternatively use:

```bash
php artisan storage:link
```

and `MEDIA_PUBLIC_URL=https://api.foodonlines.com/storage`. Do not create both approaches blindly. With File Manager only, use the built-in `/api/media` setting, preserve `storage/app/public/media`, upload the private backend files in place, and do not copy uploads into `public_html`.

### Backend upload and commands

Upload the contents of `backend-live/` into the private Laravel application while preserving the live `.env`, `vendor/`, the entire `storage/` tree, and Hostinger-specific public entry. The deployment folder and ZIP intentionally contain no `.env` or `.env.*` file. Preserve `public_html/api`; never delete or overwrite it with frontend files. From the private Laravel root run:

```bash
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan migrate:status
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan media:diagnose
php artisan media:cleanup --limit=100
```

Schedule `php artisan media:cleanup --limit=100` hourly. It retries safe managed deletion, expires abandoned local or direct uploads, protects referenced objects, and cannot delete outside approved managed-media roots.

### Media smoke test

After backend upload and cache rebuild, create a brand without a logo, then upload, refresh, replace, and remove its logo. Repeat with one category image and two product images; reorder the product images, change primary, delete primary, and delete the final image. Publish a genuinely sellable product without an image. From the administrator Reviews, Returns, and Support panels, append and remove an attachment for each record; refresh and confirm every retained attachment persists and resolves through `https://api.foodonlines.com/api/media/...`. Confirm missing media uses a generic storefront fallback and no administrator page exposes provider, credential, endpoint, disk, bucket, signed-URL, or server-path details.

### Future optional provider switch

To activate the preserved direct-upload provider later, back up the database and local runtime media, configure the existing server-only `R2_*` variables, then set `MEDIA_DISK=r2`, rebuild Laravel caches, and run `php artisan media:diagnose`. Do not mass-convert database paths. Existing `local://media/...` references continue through `MEDIA_PUBLIC_URL`, while new uploads use the selected provider. Retain `storage/app/public/media/` and its backup after switching.

### Media rollback

Restore the prior backend source and database backup only if required, but preserve the newest valid runtime media backup unless database references were also rolled back. Restore the previous `.env` media values, run `php artisan optimize:clear`, rebuild caches, and verify both old `r2://` and current `local://` references. Never roll back by deleting `storage/app/public/media`.

## Category administration repair deployment (2026-07-18)

This release is prepared in two verified folders: `backend-live/` for the private Laravel application and `frontend-upload/` for the public storefront. When ZIP delivery is requested, their contents are packaged at archive root as `FoodOnlines_Backend_Live.zip` and `FoodOnlines_Frontend_Live.zip`. It has not been uploaded to Hostinger and it has not changed the production database.

### 1. Preparation

Use the commit containing this guide. Download `backend-live/` and `frontend-upload/` only; do not upload the Git repository, `node_modules`, tests, local databases, logs, `.env`, or old archives. Record the current frontend asset filenames and confirm the current API health before changing files.

### 2. Database backup

In hPanel, open Databases, select the live FoodOnlines database, and export a complete SQL backup. Download it and confirm it is not empty. Do this before migrations or the category backfill. Do not use `migrate:fresh`, `migrate:reset`, `db:wipe`, destructive reseeding, `TRUNCATE`, or database/table drop commands.

### 3. Current backend backup

Back up the current private Laravel application directory, excluding only disposable caches when space is limited. Preserve its live `.env`, `vendor/` when Composer will not be available, `storage/`, user uploads, logs, permissions, symlinks, and any Hostinger-specific PHP files. Also back up the existing `public_html/api` public entry separately.

### 4. Current frontend backup

Back up the current frontend files in `public_html`, including the current `.htaccess`. Keep `public_html/api` outside any frontend replacement or deletion selection.

### 5. Backend upload

With SSH/Terminal, synchronize the contents of `backend-live/` into the private Laravel application directory. With File Manager, upload the same folder contents in batches while preserving paths. `backend-live/` intentionally excludes `vendor/`, the live `.env`, runtime data, secrets, and production uploads.

### 6. Backend file placement

- Private Laravel application directory: upload every `backend-live/` item except `public/` and `SHA256SUMS`. This includes `app/`, `bootstrap/`, `config/`, `database/`, `resources/`, `routes/`, the empty writable `storage/` directory structure, `artisan`, Composer files, and this guide. No environment template is packaged; preserve the existing server-only `.env`.
- Public API entry: `backend-live/public/.htaccess` and `backend-live/public/index.php` are the clean Laravel public-entry reference. The live site already has `public_html/api`; do not delete or blindly replace it. If Hostinger maps `public_html/api` directly to the private application's `public/` directory, deploy these two files there. If the existing `public_html/api/index.php` contains a Hostinger-specific path to the private application, preserve that production path and file; verify it still loads the uploaded private application.
- The generated reference `index.php` expects the Laravel root to be the parent of its `public/` directory. A split Hostinger entry must retain its already-working private-root bootstrap path. Never expose the private Laravel folders below `public_html`.

### 7. Production environment preservation

Keep the current server-only `.env` in place. No environment file or template is included in the deployment folder or ZIP. Do not overwrite `APP_KEY`, database credentials, mail settings, media settings, live URLs/paths, queue settings, or Hostinger configuration. Confirm `APP_ENV=production` and `APP_DEBUG=false` without displaying these values in the web interface.

### 8. Composer or vendor handling

Preferred SSH/Terminal command from the private Laravel root:

```bash
composer install --no-dev --optimize-autoloader --no-interaction
```

`backend-live/` does not include `vendor/`. If SSH/Composer is unavailable, preserve the known-working production `vendor/` directory when the lockfile dependencies are unchanged, or install the locked dependencies in a matching PHP 8.2+ environment and upload that generated `vendor/` directory. Do not upload a development vendor tree with unreviewed platform differences.

### 9. Laravel permissions

The PHP process must retain write access to `storage/`, `storage/framework/cache/data`, `storage/framework/sessions`, `storage/framework/views`, `storage/logs`, and `bootstrap/cache`. Preserve existing storage symlinks and uploaded objects.

### 10. Migration execution

After the database backup and backend upload, run from the private Laravel root:

```bash
php artisan migrate --force
php artisan migrate:status
```

This category repair adds no schema migration; the command safely applies any outstanding forward migrations already present in the release.

### 11. Original-category backfill

Run the dedicated missing-only command:

```bash
php artisan catalog:backfill-categories
```

It inserts only missing canonical slugs, creates `baby-care` to `vegan-foods` only when absent, and does not change existing categories, Ice cream, names, UUIDs, hierarchy, status, visibility, placement, order, media, or SEO. It is safe to repeat; a repeat should report zero new rows.

### 12. Laravel cache clearing and rebuilding

The verified route set supports caching. Run:

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 13. Frontend upload

Upload the contents of `frontend-upload/` into `public_html`; do not upload the containing folder as `public_html/frontend-upload`. The payload contains the production entry files, hashed assets, images, and SPA `.htaccess` only.

### 14. Protecting `public_html/api`

Do not delete `public_html/api`, select it during stale-frontend cleanup, or extract a frontend archive over it. `frontend-upload/` contains no `api/` directory. Compare the new `.htaccess` with the backed-up production copy before replacing it and confirm the API exclusion/public entry remains intact afterward.

### 15. Hostinger cache clearing

Clear Hostinger website/cache-manager caches after both uploads. If stale HTML still references old hashed files, clear browser cache or test in a private window before deleting any old asset files.

### 16. Cloudflare cache clearing

Purge the FoodOnlines HTML/JS/CSS cache only if Cloudflare is proxying the frontend and still serves old assets. This does not affect Hostinger local managed-media files.

### 17. Production smoke testing

Admin/backend: verify sign-in, category list and all status tabs, original categories and Ice cream, name-only creation, editable generated slug, image selection before initial save, saves without images/SEO/aliases, selection after save, upload/replace/remove, navigation/homepage placement normalization, Draft/Archived/Hidden/Catalog-only clearing placement, archive/restore, archived-only Cancel/Delete confirmation modal with no typed input, product/child deletion blocks, and safe errors with no raw framework, SQL, JSON, server path, or integration configuration.

Storefront: verify home and clean-route refreshes without a white page; desktop/tablet/mobile navigation; backend-created category appearance; archived/hidden/catalog-only/placement-disabled category removal; empty homepage-enabled tile; “Products are coming soon” category page; missing/broken-image fallback; long/multilingual names; existing product/detail/cart/account/auth/search flows; and continued `public_html/api` availability.

### 18. Rollback

Backend rollback: restore the backed-up private application files while preserving the current live `.env`, `storage/`, uploads, and permissions. Restore the database SQL backup only when the failed release changed data and restoration is necessary. Restore the prior `public_html/api` entry when it changed, then run `php artisan optimize:clear` and rebuild the caches supported by the restored revision. Confirm API health before reopening admin writes.

Frontend rollback: restore the backed-up `public_html` frontend files and prior `.htaccess` without deleting or replacing `public_html/api`. Clear Hostinger/Cloudflare caches and verify the previous storefront and API both load.

## Phase 7 operational commerce deployment note

Phase 7 adds forward migrations and APIs for returns, reviews, customer saved data, notifications, receipts, support, reports, staff permissions/MFA, recovery, SEO, operations, and provider-neutral review/return/support media. The current release supersedes its earlier direct-upload-only activation note: use Hostinger local media by default. The repository `backend-live/` mirror is updated from source, but no external Hostinger, object storage, SMTP, queue, cron, or production migration action is implied by Git.

## Phase 6 transactional commerce deployment note

Phase 6 adds four forward commerce migrations, cart/quote/order/inventory/promotion APIs, COD payment records, queued confirmation mail, and reservation-expiration scheduling. Before production use, install the locked Composer dependencies, configure the required server-only commerce values in the preserved live `.env` using the separately reviewed repository template as reference, apply migrations with `php artisan migrate --force`, rebuild config/routes, and verify a disposable COD order in an authorized environment. Keep unsupported provider methods disabled until a real approved adapter and credentials exist; do not send raw card numbers or CVV.

## Phase 4 media deployment note

Phase 4 originally introduced the media tables and direct-upload provider. The current provider-neutral implementation supersedes that activation procedure: production defaults to `MEDIA_DISK=local`, retains optional direct-upload compatibility, and uses the same cleanup command and database references. See `docs/admin-catalog-and-r2.md`.

## Repository deployment source

`backend-live/` is the required repository live-folder mirror and must be regenerated, verified, committed with its matching backend source, and pushed on `main` for every backend task. `backend-live/SHA256SUMS` is the deployment file inventory. External Hostinger remains a separate manual/integrated action and must not be claimed without evidence. All tracked Markdown files are reviewed and updated at task completion.

Synchronization is not a later deployment phase. Implement once in Laravel source, test, run the generator, confirm parity/stale cleanup, then make one combined source/documentation/mirror commit and push `main`. Never edit `backend-live/` manually or delegate its generation.

The reproducible repository source remains the verified `backend-live/` folder. An explicitly requested backend archive must be generated only from that final folder, keep its contents at ZIP root, exclude runtime/environment/dependency data, and remain outside both the repository and deployment mirror.

## Hostinger layout

Keep the complete backend outside a public document root whenever possible:

```text
/home/ACCOUNT/domains/api.foodonlines.com/
├── foodonlines-backend/       # complete Git checkout; not web-accessible
└── public_html/               # public files only
```

Because this repository also contains the frontend source, root `public/.htaccess` is the frontend SPA rewrite contract. Do not use that file for the API subdomain. Use the isolated API document root from `deployment/hostinger/backend-public/`; its real `index.php` resolves the adjacent backend through `dirname(__DIR__)` and contains no account-specific path. Never expose `.env`, `app/`, `bootstrap/`, `config/`, `database/`, `routes/`, `storage/`, `tests/`, or `vendor/` as static files.

The repository root is the only Laravel root. Do not create a second Laravel project on the server.

## Requirements

- PHP 8.2 or newer with required Laravel/MySQL extensions
- Composer 2
- MySQL/MariaDB database and least-privilege application user
- Writable `storage/` and `bootstrap/cache/`
- API subdomain DNS and TLS certificate for `api.foodonlines.com`

Confirm the server toolchain before changing the database:

```bash
php -v
composer --version
composer validate --strict
php artisan about
```

## Environment

For a new installation, create the server-only `.env` outside the deployment archive, generate `APP_KEY`, and fill real `DB_*`, `MAIL_*`, and `ADMIN_*` values using the separately reviewed repository template as reference. Phase 3 uses `FOODONLINES_CATALOG_CURRENCY=USD`. Required public values are:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.foodonlines.com
FRONTEND_URL=https://www.foodonlines.com
SESSION_SECURE_COOKIE=true
```

Never commit or download the real `.env`. Keep `QUEUE_CONNECTION=sync` until a persistent worker is configured and supervised. Queue tables are prepared for a later switch to `database`.

## Deploy from Git or File Manager

Synchronize the committed backend files into the private backend directory. Copy `deployment/hostinger/backend-public/.htaccess` and `index.php` into the API subdomain document root when not deploying the complete mirror layout. Do not upload frontend `dist/`, `frontend-upload/`, `node_modules/`, local logs, tests if production policy excludes them, or any ZIP from an older host.

Run from the backend root:

```bash
composer install --no-dev --optimize-autoloader --no-interaction
php artisan optimize:clear
php artisan migrate --force
php artisan migrate:status
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan route:list --path=api/v1
```

Seed the first admin only when a valid server-only email and strong password are configured:

```bash
php artisan db:seed --class=AdminSeeder --force
```

Do not rerun the admin seeder with placeholder credentials.

## Public entry

The synchronized `backend-live/public/index.php` uses Laravel 12 request handling and the adjacent mirror root:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$backendBasePath = dirname(__DIR__);

if (file_exists($maintenance = $backendBasePath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $backendBasePath.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $backendBasePath.'/bootstrap/app.php';
$app->usePublicPath(__DIR__);
$app->handleRequest(Request::capture());
```

Preserve Laravel's isolated API `.htaccess` rules in that document root. If a hosting layout separates public and private directories, adapt deployment layout outside the tracked source rather than committing an account path or credential.

## Production verification

The route list must include 27 `/api/v1` routes, including:

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/admin/login`
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/users`

Verify both allowed origins with real HTTPS requests, then smoke-test register/login/me/logout and admin login/dashboard/users/logout using disposable test accounts. Confirm passwords and raw bearer tokens never appear in logs or responses beyond the initial token response.

## Rollback

Application rollback means restoring the prior Git revision, running `composer install` for that lockfile, and clearing/rebuilding caches. Review migration downs before any production database rollback. The historical user-schema compatibility migrations intentionally avoid destructive downs; do not force-drop live user columns.

Foundation/category details remain in `docs/backend-foundation.md` and `docs/backend-categories.md`; Phase 3 catalog architecture and routes are in `docs/backend-product-catalog.md`.
