# FoodOnlines Laravel Backend Deployment

This is the non-ZIP deployment workflow for the Laravel API at `https://www.api.foodonlines.com`. Step 1 must not create a backend deployment archive.

## Hostinger layout

Keep the complete backend outside a public document root whenever possible:

```text
/home/ACCOUNT/domains/api.foodonlines.com/
├── foodonlines-backend/       # complete Git checkout; not web-accessible
└── public_html/               # public files only
```

Because this repository also contains the frontend source, root `public/.htaccess` is the frontend SPA rewrite contract. Do not use that file for the API subdomain. Create an isolated API document root from `deployment/hostinger/backend-public/`, rename `index.php.example` to `index.php`, and replace its example private backend path. Never expose `.env`, `app/`, `bootstrap/`, `config/`, `database/`, `routes/`, `storage/`, `tests/`, or `vendor/` as static files.

The repository root is the only Laravel root. Do not create a second Laravel project on the server.

## Requirements

- PHP 8.2 or newer with required Laravel/MySQL extensions
- Composer 2
- MySQL/MariaDB database and least-privilege application user
- Writable `storage/` and `bootstrap/cache/`
- API subdomain DNS and TLS certificate for `www.api.foodonlines.com`

Confirm the server toolchain before changing the database:

```bash
php -v
composer --version
composer validate --strict
php artisan about
```

## Environment

Copy `.env.example` to server-only `.env`, generate `APP_KEY`, and fill real `DB_*`, `MAIL_*`, and `ADMIN_*` values. Required public values are:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://www.api.foodonlines.com
FRONTEND_URL=https://www.foodonlines.com
SESSION_SECURE_COOKIE=true
```

Never commit or download the real `.env`. Keep `QUEUE_CONNECTION=sync` until a persistent worker is configured and supervised. Queue tables are prepared for a later switch to `database`.

## Deploy from Git or File Manager

Synchronize the committed backend files into the private backend directory. Copy `deployment/hostinger/backend-public/.htaccess` and the adjusted `index.php.example` into the API subdomain document root. Do not upload frontend `dist/`, `frontend-upload/`, `node_modules/`, local logs, tests if production policy excludes them, or any ZIP from an older host.

Run from the backend root:

```bash
composer install --no-dev --optimize-autoloader --no-interaction
php artisan optimize:clear
php artisan migrate --force
php artisan migrate:status
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan route:list --path=api/v1
```

Seed the first admin only when a valid server-only email and strong password are configured:

```bash
php artisan db:seed --class=AdminSeeder --force
```

Do not rerun the admin seeder with placeholder credentials.

## Public entry fallback

When the document root cannot point to `<backend>/public`, the public `index.php` should use Laravel 12 request handling and an absolute private path:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$backendBasePath = '/home/ACCOUNT/domains/api.foodonlines.com/foodonlines-backend';

if (file_exists($maintenance = $backendBasePath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $backendBasePath.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $backendBasePath.'/bootstrap/app.php';
$app->usePublicPath(__DIR__);
$app->handleRequest(Request::capture());
```

Replace the example path with the actual Hostinger account path. Preserve Laravel's public `.htaccess` rules in that API document root.

## Production verification

The route list must include 27 `/api/v1` routes, including:

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/admin/login`
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/users`

Verify both allowed origins with real HTTPS requests, then smoke-test register/login/me/logout and admin login/dashboard/users/logout using disposable test accounts. Confirm passwords and raw bearer tokens never appear in logs or responses beyond the initial token response.

## Rollback

Application rollback means restoring the prior Git revision, running `composer install` for that lockfile, and clearing/rebuilding caches. Review migration downs before any production database rollback. The historical user-schema compatibility migrations intentionally avoid destructive downs; do not force-drop live user columns.

Detailed architecture, environment variables, route map, test commands, and the Step 2 gate are in `docs/backend-foundation.md`.
