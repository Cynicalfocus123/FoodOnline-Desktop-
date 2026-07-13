# Hostinger File Manager Deployment

## Current backend rule

Backend deployment preparation comes from the verified `backend-live/` folder on `main`, not from a backend ZIP and not from the frontend `public/.htaccess`. Every task also reviews and updates all tracked Markdown documentation. Actual Hostinger upload must be reported separately with evidence.

The mirror is generated during the same backend implementation pass, before the single combined commit and automatic `main` push. It is never hand-edited or rebuilt as a later task; the generator removes stale renamed/deleted files.

FoodOnlines live frontend hosting is currently managed through Hostinger File Manager.

## Backend separation

The Laravel API is a separate deployment for `www.api.foodonlines.com`; it is not part of frontend `dist/` or `frontend-upload/`. Follow the repository-root `DEPLOYMENT.md` and `docs/backend-foundation.md`, keep the Laravel application outside the API document root, expose only `public/`, and do not create a backend ZIP for Step 1.

## Production Output

Run the normal project build:

```bash
npm run build
```

The upload-ready frontend output is the contents of `dist/`.

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
