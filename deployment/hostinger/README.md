# Hostinger File Manager Deployment

## Classic ZIP32 staging extraction (2026-07-22)

The backend archive uses regular Deflate ZIP32 file records only and omits explicit empty directories for hosting-panel compatibility. Upload and extract it first in an empty private staging folder, verify the Laravel root files/directories, then copy source into the live private root while preserving `.env`, `vendor/`, complete `storage/`, `storage/app/public/media/`, permissions, runtime state, and `public_html/api/backend-path.php`. Create missing writable runtime folders manually or with safe `mkdir -p` commands only for a new installation; do not extract directly over a populated Laravel root.

## Split `public_html/api` entry requirement (2026-07-22)

The current backend ZIP deploys the Laravel application to its private root. After extraction, copy `public/index.php` and `public/.htaccess` from that private root into the existing `public_html/api/` directory. Copy `public/backend-path.php.example` to `public_html/api/backend-path.php` and set its returned string to the real absolute private Laravel root, for example `/home/ACCOUNT_USERNAME/FoodOnlines-backend`. Keep `backend-path.php` server-only and preserve it across future updates.

The API entry returns a safe configuration error instead of a PHP fatal when the root cannot be found. A remaining 500 means inspect `storage/logs/laravel.log` and Hostinger's PHP error log; confirm PHP 8.2+, PDO MySQL, and the preserved `vendor/` directory. Do not extract the backend ZIP into `public_html` and never replace live `.env`, vendor, database, storage, or media.

## Frontend Hostinger 500 prevention (2026-07-22)

The current frontend ZIP has a minimal `.htaccess` with an explicit `/api` bypass. Extract its contents directly into `public_html`, preserving the complete `public_html/api` directory. It intentionally avoids `Options` and header directives that can produce a shared-hosting 500 when the host restricts overrides.

> Enterprise CMS release (2026-07-18): nested `/admin/...` routes require the current frontend `.htaccess` and hashed assets. Deploy the regenerated backend/frontend mirrors together, preserve `.env`, `vendor`, database, storage/media, permissions, and `public_html/api`, then run the root `DEPLOYMENT.md` migration/backfill/cache sequence. Explicitly requested ZIPs mirror those folders at archive root.

> Local managed-media release (2026-07-18): Hostinger Laravel storage is the current production provider. Set `MEDIA_DISK=local`, `MEDIA_UPLOADS_ENABLED=true`, and `MEDIA_PUBLIC_URL=https://api.foodonlines.com/api/media`. Back up and preserve the private application's complete `storage/app/public/media/` directory across every update; it is intentionally absent from `backend-live/`.

The built-in `/api/media` route is recommended for a split `public_html/api` entry and needs no symlink. If the API domain maps directly to Laravel `public/`, `php artisan storage:link` with `MEDIA_PUBLIC_URL=https://api.foodonlines.com/storage` is also supported. File Manager deployments must upload private code in place while skipping the live `.env`, `vendor/`, and `storage/` directories. SSH deployments should run `php artisan media:diagnose` and `php artisan media:cleanup --limit=100` after migration/cache commands. Existing `local://media/...` files remain required even if `MEDIA_DISK=r2` is selected later.

> Category administration release (2026-07-18): deploy the verified `backend-live/` and `frontend-upload/` folders separately. Preserve the live `.env`, `vendor/` when Composer is unavailable, storage/uploads, and the existing `public_html/api` entry. Run `php artisan migrate --force`, `php artisan catalog:backfill-categories`, then the cache commands in the root `DEPLOYMENT.md`. No external Hostinger action is claimed by this repository.

> Phase 7 review (2026-07-15): use the synchronized `backend-live/` and `frontend-upload/` repository mirrors for the current operational commerce source. This guide still does not prove an external Hostinger upload or external R2 activation.

> Phase 4 current state (2026-07-13): `backend-live/` includes the admin catalog, R2-compatible runtime, upload cleanup command, and nutrition migrations. `frontend-upload/` includes the rebuilt admin entry. Neither mirror proves an external Hostinger upload; follow `docs/admin-catalog-and-r2.md` before enabling media uploads.

> Phase 3 current state (2026-07-13): the generated mirror now includes the real relative-path API `public/index.php`, catalog runtime, `.env.example`, deployment guide, and writable-directory placeholders. External Hostinger remains unchanged without separate evidence.

## Current backend rule

Backend deployment preparation comes from the verified `backend-live/` folder on `main`, not from a backend ZIP and not from the frontend `public/.htaccess`. Every task also reviews and updates all tracked Markdown documentation. Actual Hostinger upload must be reported separately with evidence.

The mirror is generated during the same backend implementation pass, before the single combined commit and automatic `main` push. It is never hand-edited or rebuilt as a later task; the generator removes stale renamed/deleted files.

FoodOnlines live frontend hosting is currently managed through Hostinger File Manager.

## Backend separation

The Laravel application stays in its private directory and is not part of frontend `dist/` or `frontend-upload/`. Follow the repository-root `DEPLOYMENT.md`, expose only the existing `public_html/api` entry, and never delete or blindly replace that entry during a frontend upload.

## Production Output

Run the normal project build:

```bash
npm run build
```

The upload-ready frontend output is the verified `frontend-upload/` mirror generated from `dist/`.

## Upload Target

Use the active Hostinger domain document root for FoodOnlines. Upload the contents of `dist/` into that document root, preserving folder structure:

- `index.html`
- `admin.html`
- `favicon.svg`
- `404.html`
- `assets/`
- `images/`

Do not upload the `dist/` folder itself as a nested folder unless the Hostinger domain is intentionally configured to serve from that nested path.

## Notes

- Do not use old TMDHosting/cPanel package paths for the current live site unless the user explicitly changes hosting again.
- Do not create a ZIP unless the user asks for a File Manager archive package.
- Preserve the existing API configuration and route behavior.
- After upload, verify the live site uses the new generated asset filenames from the current `dist/index.html` and `dist/admin.html`.
