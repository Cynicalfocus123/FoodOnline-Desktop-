# Frontend Admin Upload Instructions

> Documentation review (2026-07-13): this is a legacy frontend/TMDHosting note and does not govern backend delivery. Backend source and `backend-live/` must be synchronized on `main`; all tracked Markdown files are reviewed at each task completion.

## Target

- Upload admin dashboard frontend into: `/home/mstarhol/foodonlines.com`
- Final URL: `https://foodonlines.com/admin.html`
- Backend stays separate at: `/home/mstarhol/foodonlines-backend/foodonlines-backend`

## Files to upload

Copy these from `deployment/tmdhosting/frontend-public/`:

- `admin.html`
- `assets/` folder

## Copy steps

1. Open cPanel File Manager.
2. Go to `/home/mstarhol/foodonlines.com`.
3. Upload `admin.html`.
4. Upload `assets/` folder contents.
5. If cPanel asks about merging `assets/`, merge carefully and replace only matching admin build files you intend to update.

## Important

- Do not upload to `public_html` unless `foodonlines.com` domain document root is actually there.
- Do not overwrite Laravel backend files.
- Do not overwrite website `index.php`.
- Do not use localhost.
- Admin bundle is already built to target API base: `https://foodonlines.com/api/v1`
- Login uses real Laravel endpoint: `POST /api/v1/admin/login`
- Users table uses real Laravel endpoint: `GET /api/v1/admin/users`

## Result

After upload, open:

- `https://foodonlines.com/admin.html`
