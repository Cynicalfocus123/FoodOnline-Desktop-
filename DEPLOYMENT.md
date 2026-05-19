# FoodOnlines Laravel Backend Deployment

This package is organized for TMDHosting / cPanel shared hosting.

## Folder placement

1. Upload `foodonlines-backend/` outside `public_html`.
2. Open cPanel `Domains` and find FoodOnlines domain document root.
3. Upload contents of `foodonlines-public-entry/` into that FoodOnlines document root.
4. Do not upload or extract a `public_html/` folder from this package. Package uses `foodonlines-public-entry/` to avoid collisions with other domains or WordPress installs.
5. Keep `vendor/` excluded from upload if not bundled. Install it on server with Composer.

## Required cPanel setup

1. Create MySQL database in cPanel.
2. Create MySQL user in cPanel.
3. Assign user to database with full privileges.
4. Create cPanel email account for SMTP, for example `no-reply@foodonlines.com`.

## Environment setup

1. Copy `.env.example` to `.env`.
2. Set:
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://your-domain.com`
   - `FRONTEND_URL=https://your-domain.com`
   - `DB_DATABASE`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `MAIL_HOST`
   - `MAIL_PORT`
   - `MAIL_USERNAME`
   - `MAIL_PASSWORD`
   - `MAIL_FROM_ADDRESS`
3. Never upload real secrets into git.

## Server commands

Run these inside backend folder:

```bash
composer install --optimize-autoloader --no-dev
php artisan key:generate
php artisan migrate --force
php artisan db:seed --class=AdminSeeder
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## API

- `POST /api/v1/auth/register`
- `POST /api/v1/admin/login`
- `POST /api/v1/admin/logout`
- `GET /api/v1/admin/me`
- `GET /api/v1/admin/users`
- `PUT /api/v1/admin/settings`
- `GET /api/v1/admin/dashboard-stats`

## Security

- SQL injection protection: Eloquent ORM + prepared statements.
- XSS protection: request sanitization + Blade escaping.
- CSRF protection: Laravel session/web middleware for web routes.
- Validation and sanitization: `RegisterUserRequest`.
- Password hashing: Laravel `Hash::make`.
- Password verification: Laravel `Hash::check`.
- Rate limiting: auth and admin login API routes use throttle middleware.
- Admin protection: hashed bearer tokens in `admin_api_tokens` plus `admin.token` middleware.
- Secrets: use `.env` only. Do not hardcode credentials.

## First admin

Set these in `.env` before seeding:

```bash
ADMIN_NAME="FoodOnlines Admin"
ADMIN_EMAIL="your-admin-email@example.com"
ADMIN_PASSWORD="your-real-strong-password"
```

Then run:

```bash
php artisan db:seed --class=AdminSeeder
```

## Email system

- Sends registration confirmation email after signup.
- Uses `RegistrationSuccessMail`.
- Uses `resources/views/emails/registration-success.blade.php`.
- Uses FoodOnlines logo from `public_html/assets/`.
- CTA button text: `1000s of Food Supplies to Start Here`.
- Footer unsubscribe text: `You can unsubscribe to opt out.`
- SMTP uses `MAIL_*` environment variables only.

## Notes

- `composer.lock` is not bundled in this package because this workspace has no Composer runtime to generate a valid lock file. Run Composer on server to resolve production dependencies from `composer.json`.
- `foodonlines-public-entry/index.php` is preconfigured to load backend from `/home/CPANEL_USERNAME/foodonlines-backend`.
- Replace `CPANEL_USERNAME` with your real cPanel username, for example `mstarhol`.
