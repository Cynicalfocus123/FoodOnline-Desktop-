# TMDHosting cPanel backend deploy notes

Current workspace still mixes frontend and backend scaffold. For TMDHosting, deploy backend as its own Laravel app root and keep full application **outside** `public_html`.

## Recommended server layout

```text
/home/CPANEL_USER/
  foodonlines-backend/        # full Laravel app
  public_html/                # only Laravel public files
```

## Steps

1. Create MySQL database and user in cPanel.
2. Promote backend scaffold into full Laravel project root, then upload or git-clone that app into `/home/CPANEL_USER/foodonlines-backend`.
3. Copy `.env.example` to `.env` and fill:
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://foodonlines.com`
   - `FRONTEND_URL=https://foodonlines.com`
   - `DB_*`
   - `MAIL_*`
4. Install PHP dependencies on server:
   - `composer install --no-dev --optimize-autoloader`
5. Run Laravel setup:
   - `php artisan key:generate`
   - `php artisan migrate --force`
   - `php artisan config:cache`
   - `php artisan route:cache`
   - `php artisan view:cache`
6. Copy contents of Laravel backend `public/` into `public_html/`.
7. Replace `public_html/index.php` with example in `deployment/tmdhosting/public_html/index.php.example` and update absolute app path.
8. Replace `public_html/.htaccess` with `deployment/tmdhosting/public_html/.htaccess`.
9. If using cPanel Git deployment, adapt `deployment/tmdhosting/.cpanel.yml.example` into real root `.cpanel.yml`.

## API entry

- `POST /api/v1/auth/register`

## Example JSON payload

```json
{
  "account_type": "supplier",
  "email": "hello@example.com",
  "first_name": "Alex",
  "last_name": "Tan",
  "contact_number": "+66 81 555 1234",
  "line_id": "alex.tan",
  "company_name": "FoodOnlines Supply Co",
  "registered_from": "website"
}
```

## Notes

- Registration email uses `FRONTEND_URL` for CTA target.
- Registration endpoint accepts optional `password`, but current frontend flow does not send one yet.
- Admin dashboard posts to the production Laravel API and requires database-backed admin login.
- Email send failure logs warning and does not block registration response.
- Local preview route stays dev-only: `/dev/preview/emails/registration-success/{role}`.
