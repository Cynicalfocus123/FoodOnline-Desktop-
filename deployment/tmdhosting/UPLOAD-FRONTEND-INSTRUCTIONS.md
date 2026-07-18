# Frontend Admin Upload Instructions

> Historical host document reviewed 2026-07-18. Current upload source is `frontend-upload/` into Hostinger `public_html` while preserving `public_html/api`; see the root `DEPLOYMENT.md`.

> Phase 7 review (2026-07-15): the repository `frontend-upload/` mirror is the current frontend delivery artifact. This historical note does not prove an external upload or configure R2.

> Phase 4 review (2026-07-13): the current admin catalog build is in `frontend-upload/`; this historical package does not configure R2, and the public storefront remains mock-backed.

> Phase 3 review (2026-07-13): this frontend upload note does not include, switch to, or deploy the new Laravel grocery catalog.

> Documentation review (2026-07-13): this is a legacy frontend/TMDHosting note and does not govern backend delivery. Backend source and `backend-live/` must be synchronized on `main`; all tracked Markdown files are reviewed at each task completion.

> Backend single-pass rule: implementation, tests, generated mirror, parity verification, combined commit, and `main` push happen together. No manual mirror edit, later mirror task, delegated rebuild, or backend ZIP is allowed.

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
