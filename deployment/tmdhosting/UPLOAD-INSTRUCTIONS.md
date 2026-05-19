# Upload Instructions

## Upload order

1. Upload `foodonlines-backend/` to your cPanel home directory, outside `public_html`.
2. Upload all files from packaged `public_html/` into your domain `public_html`.
3. In cPanel, create MySQL database and database user.
4. In backend folder, copy `.env.example` to `.env`.
5. Fill `.env` with:
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
6. Use SMTP credentials from cPanel email account only.
7. Run inside backend folder:

```bash
composer install --optimize-autoloader --no-dev
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Public path

- Packaged `public_html/index.php` already points to `../foodonlines-backend`.
- It also sets Laravel public path to actual shared hosting `public_html`.

## Included registration flow

- API route: `POST /api/v1/auth/register`
- Registration success email: enabled
- Template: responsive HTML with FoodOnlines branding

## Exclusions

- No real `.env`
- No git metadata
- No `node_modules`
- No local logs or cache
- No ZIP tracked in git
