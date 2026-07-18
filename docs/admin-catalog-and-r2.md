# Admin Catalog Portal and Cloudflare R2 Media

## Current provider-neutral media architecture (2026-07-18)

The filename records the original Phase 4 implementation; it no longer means R2 is required. Hostinger local Laravel storage is the current production provider, and the existing direct-upload provider is an optional future selection.

`MEDIA_DISK=local` maps managed writes to Laravel's `public` filesystem under `storage/app/public/media/`. New database references are stable `local://media/{purpose-directory}/{entity-uuid}/{purpose}-{media-uuid}.{jpg|png|webp}` values. `MEDIA_PUBLIC_URL` maps them to the public Laravel media route without exposing physical Hostinger paths. Existing `r2://`, HTTPS, and safe relative paths remain supported by the single `MediaStorageManager`/`CategoryMediaUrl` resolver.

The generic capability response contains only `uploads_available`, `strategy` (`multipart` or `direct`), accepted types, and purpose limits. It does not expose a provider name, filesystem disk, bucket, endpoint, credential state, server directory, or signed URL. Administrator screens render checking, available, temporarily unavailable, uploading, uploaded, removal, and safe failure states without blocking parent CRUD.

Local mode uses authenticated multipart routes:

```text
POST /api/v1/admin/media-uploads/local
POST /api/v1/account/media-uploads/local
GET  /api/media/{managed-path}
```

Laravel resolves the authenticated entity and purpose, enforces ownership and the product-media binding, generates the UUID key, reads the actual bytes, checks purpose-specific size, verifies the file signature with `finfo`, decodes dimensions, rejects non-JPEG/PNG/WebP content and dimensions above 8000×8000, writes through the filesystem abstraction, verifies the stored object again, and transactionally installs the managed reference. Original filenames and client paths never control storage placement.

Catalog purposes are `brand_logo`, `category_image`, `category_icon`, `category_desktop_banner`, `category_mobile_banner`, and `product_image`. Customer-owned purposes are `review_image`, `return_evidence`, and `support_attachment`. No variant image, nutrition image, user-avatar, vendor-logo, or promotional-media database field currently exists, so no unsupported parallel storage model was invented.

Brand and category replacement updates the database first and deletes the old unreferenced object after commit. Product galleries retain a 12-image limit, immutable replacement, order, primary selection, next-image promotion, and a valid zero-image state. Review, return, and support media are customer-owned, persisted in their existing tables, returned with safe public URLs, and individually removable by the upload owner; administrator operational panels can also append and remove these attachments under the existing backend limits. Publication never requires optional catalog media.

`ManagedMediaDeletionService` understands both `local://` and `r2://`, allows only approved UUID media keys, checks every reference table, never touches compatibility HTTPS/relative paths, and records `cleanup_pending` after a redacted deletion failure. `media:cleanup` handles abandoned/retryable objects for either provider and is idempotent. Runtime local files are excluded from Git and deployment mirrors and must be backed up and preserved separately.

The shared React `ManagedMediaControl` is used for brand/category preview, upload, replacement, removal, capability, progress, and broken-image fallback. Product galleries reuse the same provider-neutral upload client while retaining their specialized alt text, fit, reorder, primary, replacement, and deletion controls. Operational review/return/support panels render persisted attachment URLs without displaying storage details.

The older direct-upload sequence below remains backward-compatible documentation for `MEDIA_DISK=r2`; it is not the current Hostinger requirement.

## Optional-media category workflow (2026-07-18)

Category, brand, and draft-product database work is independent from media-storage status. The admin UI distinguishes checking, available, unavailable, and actual upload-failure states; unavailable storage uses neutral guidance and never disables Save. Category Images and SEO & Redirects are collapsed optional sections, aliases are available only after the first save, and a second Save action remains near the form bottom. Product publication no longer requires an image and the storefront uses its generic fallback while sellability requirements remain enforced.

## Phase 7 compatibility note (2026-07-15)

The same signed S3-compatible media workflow now accepts review images, return evidence, and support attachments in addition to catalog media. Phase 7 operational commerce, frontend production mirrors, and external R2 activation status are documented in `docs/operational-commerce-phase-7.md`; this document remains the catalog/R2 foundation record.

## Scope and current status

Phase 4 extends the existing standalone React admin application and Laravel 12 API. It does not create a second admin application and does not switch or redesign the mock-backed public storefront. Git source, `backend-live/`, `dist/`, and `frontend-upload/` are synchronized. External Hostinger and Cloudflare R2 configuration were not changed.

The admin portal covers:

- Categories: name, slug, parent, description, draft/published/archived status, public/hidden/catalog-only visibility, order, featured/navigation/home flags, default sort, SEO, robots directives, tile/icon/desktop/mobile media, aliases, archive, and restore.
- Brands: name, slug, full ISO 3166-1 alpha-2 country selection, active state, order, and logo.
- Products: category, optional brand, name, slug, description, country of origin, ambient/refrigerated/frozen storage type, ingredients, allergens, storage instructions, featured state, status, and readiness.
- Variants: title, SKU, optional GTIN, size label, net content/value unit, pack count, package type, direct price, previous price, configured currency, availability, active/default state, and order.
- Product media: upload, immutable replacement, delete, complete-set reorder, primary image, alt text, and `contain`/`cover`.
- Nutrition: serving size, calories, total fat, sodium, total carbohydrate, total sugars, protein, ingredients note, and allergen note.
- Publication: readable backend readiness errors plus publish, archive, and restore actions.

## Direct-upload sequence

1. Staff saves or opens a category, brand, or product in the authenticated admin dashboard.
2. The browser requests `POST /api/v1/admin/media-uploads` with purpose, target UUID, original display filename, declared MIME type, byte size, and optional bound product-media ID.
3. Laravel validates the active admin, target/purpose match, product 12-image limit, MIME, and purpose-specific maximum size.
4. Laravel creates a pending `media_uploads` row, generates an immutable UUID key, and returns a five-minute signed PUT URL plus required `Content-Type` header.
5. The browser PUTs bytes directly to R2 with upload progress. Permanent R2 credentials never reach JavaScript.
6. The browser calls `POST /api/v1/admin/media-uploads/{uuid}/complete`.
7. Laravel checks ownership/status/expiry, downloads a bounded object through the configured disk, compares exact size and MIME signature, decodes image dimensions, and rejects malformed/disguised images or dimensions over 8000×8000.
8. Laravel transactionally creates or replaces the bound media reference and marks the upload finalized. The first product image becomes primary.
9. After commit, the old managed object is deleted only if no active database reference remains. Failed deletion records `cleanup_pending` with a safe generic error.

Presigned URLs are memory-only browser state. They, credentials, endpoint secrets, local paths, and original filenames are never stored as permanent media paths.

## Formats, limits, and object keys

Accepted and verified formats are JPEG (`image/jpeg`), PNG (`image/png`), and WebP (`image/webp`). Product images and category banners default to 8 MiB; brand logos, category icons, and category tile images default to 4 MiB. Signed upload TTL defaults to five minutes.

Permanent paths use `r2://object/key.ext`. Generated patterns are:

```text
products/{PRODUCT-UUID}/media-{MEDIA-UUID}.{jpg|png|webp}
brands/{BRAND-UUID}/logo-{MEDIA-UUID}.{jpg|png|webp}
categories/{CATEGORY-UUID}/image-{MEDIA-UUID}.{jpg|png|webp}
categories/{CATEGORY-UUID}/icon-{MEDIA-UUID}.{jpg|png|webp}
categories/{CATEGORY-UUID}/desktop-banner-{MEDIA-UUID}.{jpg|png|webp}
categories/{CATEGORY-UUID}/mobile-banner-{MEDIA-UUID}.{jpg|png|webp}
```

`CategoryMediaUrl` maps `r2://products/example.webp` to `{R2_PUBLIC_URL}/products/example.webp` and preserves safe HTTPS and legacy relative paths without double-prefixing them.

Replacement always uploads and verifies a new immutable key before changing the database reference. A failed upload leaves the old reference unchanged. Physical deletion applies only to approved `products/`, `brands/`, or `categories/` keys after commit and after a cross-table reference check. HTTPS and legacy local paths are never physically deleted. Product publication rules continue protecting the final image and promoting the next image when a primary is removed.

## API routes

All admin routes require `admin.token` and `throttle:api`:

```text
GET    /api/v1/admin/media-storage/status
POST   /api/v1/admin/media-uploads
POST   /api/v1/admin/media-uploads/{mediaUpload:uuid}/complete
DELETE /api/v1/admin/media-uploads/{mediaUpload:uuid}
GET    /api/v1/admin/products/{product:uuid}/nutrition-facts
PUT    /api/v1/admin/products/{product:uuid}/nutrition-facts
DELETE /api/v1/admin/products/{product:uuid}/nutrition-facts
```

The status response exposes only enabled/configured booleans, disk name, direct-upload support, public base URL, allowed MIME types, purpose limits, and TTL. It never returns access keys, secret keys, bucket credentials, endpoints, or sample signed URLs.

Public product detail adds nullable `nutrition_facts`. Numeric values are formatted with units (`g` or `mg`); missing nutrition returns `null`.

## Environment and R2 setup

Server-only values:

```dotenv
MEDIA_DISK=r2
MEDIA_UPLOADS_ENABLED=true
R2_ACCESS_KEY_ID=server-only-access-key
R2_SECRET_ACCESS_KEY=server-only-secret
R2_BUCKET=foodonlines-media
R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
R2_REGION=auto
R2_PUBLIC_URL=https://media.foodonlines.com
R2_PATH_STYLE_ENDPOINT=false
R2_UPLOAD_URL_TTL_MINUTES=5
```

Create a private R2 bucket, create least-privilege object credentials for that bucket, connect and verify the `media.foodonlines.com` custom domain, then configure production environment values. Do not put any `R2_*` secret in Vite variables or frontend hosting configuration.

Required browser-upload CORS example:

```json
[
  {
    "AllowedOrigins": [
      "https://foodonlines.com",
      "https://www.foodonlines.com"
    ],
    "AllowedMethods": ["PUT", "HEAD", "GET"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Do not use wildcard production origins. `/admin` is a path on those origins, not a separate origin. This repository documents the configuration only; it does not prove the bucket, custom domain, DNS, CORS, or credentials were externally configured.

## Cleanup, scheduling, and rollback

Run cleanup manually with:

```bash
php artisan media:cleanup --limit=100
```

Laravel registers the same bounded command hourly with overlap protection. On shared hosting, invoke the scheduler from cron once per minute:

```cron
* * * * * cd /path/to/foodonlines-backend && php artisan schedule:run >> /dev/null 2>&1
```

Cleanup expires abandoned pending uploads, removes safe unreferenced objects, retries `cleanup_pending`, retains finalized/referenced objects, and is idempotent. Output contains counts only.

Deployment order is backup, pull the integrated main commit, `composer install --no-dev --optimize-autoloader`, configure environment, `php artisan migrate --force`, cache rebuild, frontend upload, and authenticated smoke tests. The two Phase 4 migrations roll back cleanly in reverse order; rolling back nutrition removes nutrition rows, while rolling back upload tracking removes audit/cleanup state but does not implicitly delete bucket objects. Disable uploads before rollback. Database and bucket recovery are separate operations.

## Frontend structure and validation

Catalog types live in `src/types/adminCatalog.ts`; typed calls and direct-upload orchestration live in `src/services/admin/catalogApi.ts`; complete ISO country data lives in `src/data/countries.ts`; focused components live below `src/components/admin/`. Authentication remains in the existing Zustand admin store, and signed URLs/form contents are not persisted.

Validation completed with 52 backend tests / 351 assertions, including eight Phase 4 test files. Composer validation/audit, PHP syntax, SQLite migration apply/rollback/reapply, config/route caches, TypeScript, Vite production build, production reference audit, backend-live checksums, and frontend mirror synchronization passed. No localhost server or real R2 credentials were required.
