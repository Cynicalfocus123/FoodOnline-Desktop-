# TMDHosting cPanel backend deploy notes

> Documentation review (2026-07-13): TMDHosting is not the current backend deployment source. Use `backend-live/` on `main` for repository deployment preparation and report any external Hostinger action separately. All tracked Markdown files are reviewed at each task completion.

> Current single-pass rule: generate the mirror from authoritative Laravel source before the same commit and `main` push; never edit it manually, delegate it, or build a backend ZIP.

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
   - `php artisan optimize:clear`
   - `php artisan config:cache`
   - `php artisan route:cache`
   - `php artisan view:cache`
6. Copy contents of Laravel backend `public/` into `public_html/`.
7. Replace `public_html/index.php` with example in `deployment/tmdhosting/public_html/index.php.example` and update absolute app path.
8. Replace `public_html/.htaccess` with `deployment/tmdhosting/public_html/.htaccess`.
9. If using cPanel Git deployment, adapt `deployment/tmdhosting/.cpanel.yml.example` into real root `.cpanel.yml`.

## API entries

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

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
  "password": "Strongpass123",
  "registered_from": "website"
}
```

## Notes

- Registration email uses `FRONTEND_URL` for CTA target.
- Email registration requires `password`, stores a secure hash, creates a `user_api_tokens` bearer token, and returns the same session shape used by email login.
- Current frontend maps camelCase form keys into backend snake_case API keys and persists returned bearer tokens for refresh-safe email sessions.
- A live `404` from `/api/v1/auth/login` means the deployed backend code or route cache is stale. Re-upload current backend files, run migrations, and rebuild route/config cache.
- Email send failure logs warning and does not block registration response.
- Local preview route stays dev-only: `/dev/preview/emails/registration-success/{role}`.
