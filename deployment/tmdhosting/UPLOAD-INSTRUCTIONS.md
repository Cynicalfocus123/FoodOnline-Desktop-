# Upload Instructions

> Documentation review (2026-07-13): this legacy TMDHosting upload note is not the current backend workflow. Repository backend delivery uses `backend-live/` on `main`, without a backend ZIP, and every task reviews all tracked Markdown files.

> Current backend workflow is one pass from Laravel source through tests, generated mirror, parity verification, combined commit, and automatic `main` push. Generated mirror files are never hand-edited or delegated.

## Upload order

1. Upload and extract `foodonlines-backend-cpanel-fixed.zip` in `/home/CPANEL_USERNAME`.
2. Keep `foodonlines-backend/` outside any public web folder.
3. In cPanel, open `Domains` and find real document root for FoodOnlines domain.
4. Copy the CONTENTS of `foodonlines-public-entry/` into that FoodOnlines document root.
5. Do NOT copy whole `foodonlines-public-entry/` folder itself.
6. Do NOT overwrite another domain's WordPress `public_html`.
7. ZIP no longer uses folder named `public_html` inside package.
8. In cPanel, create MySQL database and database user.
9. In backend folder, copy `.env.example` to `.env`.
10. Fill `.env` with:
   - `APP_URL`
   - `FRONTEND_URL`
   - `DB_HOST`
   - `DB_PORT`
   - `DB_DATABASE`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `MAIL_HOST`
   - `MAIL_PORT`
   - `MAIL_USERNAME`
   - `MAIL_PASSWORD`
   - `MAIL_ENCRYPTION`
   - `MAIL_FROM_ADDRESS`
11. Use SMTP credentials from cPanel email account only.
12. In `index.php`, replace `CPANEL_USERNAME` with your real cPanel username, for example `mstarhol`.
13. Run inside backend folder:

```bash
composer install --optimize-autoloader --no-dev
php artisan key:generate
php artisan migrate --force
php artisan db:seed --class=AdminSeeder
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## First admin

Set these in `/home/CPANEL_USERNAME/foodonlines-backend/.env` before seeding:

- `ADMIN_NAME="FoodOnlines Admin"`
- `ADMIN_EMAIL="your real admin email"`
- `ADMIN_PASSWORD="your real strong password"`

Never commit real admin password.

## Cache reset commands

Run these after config or route changes:

```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan optimize:clear
```

## Public path

- Packaged files live in `foodonlines-public-entry/`, not `public_html/`.
- Copy only file contents from `foodonlines-public-entry/` into FoodOnlines domain document root.
- `index.php` points to `/home/CPANEL_USERNAME/foodonlines-backend`.
- Replace `CPANEL_USERNAME` with your real cPanel username before going live.

## Included public auth flow

- API routes:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
  - `POST /api/v1/auth/logout`
- Registration success email: enabled
- Template: responsive HTML with FoodOnlines branding
- Public email registration and login require the `user_api_tokens` table migration.
- After uploading route/controller changes, always clear and rebuild route/config cache. A live `404` on `/api/v1/auth/login` means the deployed backend code or route cache is stale.

## Auth verification commands

Run after deploy from `/home/CPANEL_USERNAME/foodonlines-backend`:

```bash
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan route:list --path=api/v1/auth
```

Expected route list must include `auth/register`, `auth/login`, `auth/me`, and `auth/logout`.

## Exclusions

- No real `.env`
- No git metadata
- No `node_modules`
- No local logs or cache
- No `public_html` folder inside ZIP
- No ZIP tracked in git
