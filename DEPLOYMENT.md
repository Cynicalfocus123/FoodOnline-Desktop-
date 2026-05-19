# FoodOnlines Laravel Backend Deployment

This package is organized for TMDHosting / cPanel shared hosting.

## Folder placement

1. Upload `foodonlines-backend/` outside `public_html`.
2. Upload contents of `public_html/` into your domain `public_html`.
3. Keep `vendor/` excluded from upload if not bundled. Install it on server with Composer.

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
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## API

- `POST /api/v1/auth/register`

## Security

- SQL injection protection: Eloquent ORM + prepared statements.
- XSS protection: request sanitization + Blade escaping.
- CSRF protection: Laravel session/web middleware for web routes.
- Validation and sanitization: `RegisterUserRequest`.
- Password hashing: Laravel `Hash::make`.
- Rate limiting: auth API route uses throttle middleware.
- Secrets: use `.env` only. Do not hardcode credentials.

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
- `public_html/index.php` is preconfigured to load backend from sibling folder `../foodonlines-backend` and set Laravel public path to actual `public_html`.
