# FoodOnlines Laravel Backend Foundation

## Current-state note

This document records Step 1 foundation behavior. Phase 3 products/brands/variants/media are now implemented on `main`; see `docs/backend-product-catalog.md`. Step 2 categories remain documented in `docs/backend-categories.md`. Every completed task reviews and updates all tracked Markdown files, and newer dated sections supersede historical readiness statements without deleting their audit history.

Backend implementation and repository live-folder delivery are one operation: validate authoritative source, generate and verify `backend-live/`, commit all source/docs/mirror changes together, and push `main`. Never hand-edit the mirror or defer it to another task/agent.

## Scope and root

Step 1 establishes the Laravel API foundation only. The repository root is the one backend root; do not create or deploy a nested Laravel application.

```text
./
├── app/                 Controllers, requests, resources, middleware, models, services
├── bootstrap/           Laravel 12 application and middleware/error registration
├── config/              Environment-driven application configuration
├── database/            Factories, migrations, and seeders
├── public/index.php     Production HTTP entry point
├── resources/           Mail views and frontend source already in the repository
├── routes/api.php       Versioned JSON API
├── routes/web.php       Development-only mail preview route
├── storage/             Framework cache/session/view/log paths
├── tests/               PHPUnit unit and feature coverage
├── artisan
├── composer.json
├── composer.lock
└── phpunit.xml
```

The backend requires PHP `^8.2`. Step 1 locked Laravel 12.63.0 and validated it with PHP 8.3.32 and Composer 2.10.2.

## API contract

Production base URL:

```text
https://www.api.foodonlines.com/api/v1
```

All application endpoints stay below `/api/v1`. `/api/v1/catalog` is reserved and intentionally has no routes until Step 2.

| Access | Method and path | Purpose |
| --- | --- | --- |
| Public | `GET /health` | Dependency-light API liveness |
| Public | `POST /auth/register` | Register customer, supplier, or partner and issue token |
| Public | `POST /auth/login` | Authenticate a public account and issue token |
| User token | `GET /auth/me` | Restore the current public session |
| User token | `POST /auth/logout` | Revoke the current public token |
| User token | `GET/POST /account/addresses` | List/create saved addresses |
| User token | `PUT/DELETE /account/addresses/{addressId}` | Update/remove owned address |
| User token | `PUT /account/addresses/{addressId}/default` | Select owned default address |
| User token | `GET/PUT /account/notification-preferences` | Read/update preferences |
| User token | `GET/POST /account/payment-methods` | Read/create masked metadata only |
| User token | `DELETE /account/payment-methods/{methodId}` | Soft-remove owned method metadata |
| User token | `PUT /account/payment-methods/{methodId}/default` | Select owned default method |
| User token | `PUT /account/password` | Verify current password and rotate password |
| User token | `POST /account/delete-request` | Submit the existing review workflow |
| Public | `POST /admin/login` | Authenticate active admin only |
| Admin token | `GET /admin/me` | Restore admin session |
| Admin token | `POST /admin/logout` | Revoke current admin token |
| Admin token | `GET /admin/dashboard` | Dashboard counts; stable alias |
| Admin token | `GET /admin/dashboard-stats` | Existing dashboard counts contract |
| Admin token | `GET /admin/users` | Customer/supplier/partner list and filter |
| Admin token | `PUT /admin/settings` | Update own admin name/email/password |
| Admin token | `GET/PUT /admin/delete-account-requests[/{requestId}]` | Review deletion requests |

Admin profile/credential updates are implemented by `PUT /admin/settings`. The audit found no standalone public profile-update endpoint and no frontend call to one; Step 1 preserves the current authenticated user resource without inventing a new API contract.

## Authentication and token handling

Public account types are exactly `customer`, `supplier`, and `partner`. Admins are users whose `role` is `admin`; an admin is never accepted by public-token middleware, and a public account is never accepted by admin-token middleware.

Registration and login normalize email addresses, validate input, and use Laravel hashing. The raw bearer token is 80 random characters, returned only in the authentication response, and represented in the database by a SHA-256 digest. Raw tokens, passwords, payment PAN/CVV, and authentication headers must never be logged.

New public tokens expire after `USER_TOKEN_TTL_MINUTES` (30 days by default). New admin tokens expire after `ADMIN_TOKEN_TTL_MINUTES` (8 hours by default). Null expiration remains valid for legacy deployed rows so the migration does not unexpectedly sign out existing users. Logout revokes the active row. Password changes revoke the account's other active sessions while keeping the current request usable.

## Rate limiting, CORS, and errors

- `api`: 120 requests/minute per authenticated user or guest IP.
- `registration`: 8/minute and 25/day per IP.
- `login`: 20/minute per IP and 5/minute per IP/email credential key.
- `admin-login`: 10/minute per IP and 5/minute per IP/email credential key.
- Rate-limit responses use JSON and HTTP 429.
- Exact production CORS origins are `https://foodonlines.com` and `https://www.foodonlines.com`.
- API validation uses Laravel's JSON `message` plus `errors` bag. Unknown API endpoints/resources return a safe generic JSON 404.

## Data and migrations

The MySQL production model currently includes users, distinct public/admin token tables, addresses, notification preferences, masked payment metadata, account deletion requests, and queue tables. Migration filenames are ordered and unique.

Two older migrations support live schemas that may predate the repository's full `users` migration. Their rollback methods are intentionally non-destructive because dropping columns that existed before those migrations could destroy live data. New Step 1 migrations for token expiration and queue tables have explicit down paths and were applied successfully on SQLite during validation. Production MySQL status still must be checked on Hostinger.

Payment-method endpoints are metadata storage only. They must receive provider/token references from a future PCI-compliant payment provider; raw PAN or CVV must never be sent to or stored by this API.

## Environment

Copy `.env.example` to a server-only `.env`. Never commit `.env` or real credentials. Required production values include:

- `APP_KEY`, `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://www.api.foodonlines.com`
- `FRONTEND_URL=https://www.foodonlines.com`
- MySQL `DB_*`
- SMTP `MAIL_*`
- strong `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the one-time admin seeder
- optional `USER_TOKEN_TTL_MINUTES` and `ADMIN_TOKEN_TTL_MINUTES`

Cache and session default to file storage. `.env.example` deliberately keeps `QUEUE_CONNECTION=sync` so registration email behavior does not depend on an absent worker. Queue tables are ready; switch to `database` only after configuring and supervising a persistent worker.

## Deployment workflow

No backend ZIP belongs to Step 1. Use Git checkout/pull or Hostinger File Manager to update the private backend application directory. This mixed repository's root `public/.htaccess` belongs to the frontend SPA and must not serve the API. Build the isolated API document root from `deployment/hostinger/backend-public/`, rename and path-adjust `index.php.example`, and expose only those public entry files. Never expose `.env`, `vendor`, `app`, `storage`, or the repository root through the web document root.

After updating production code:

```bash
composer install --no-dev --optimize-autoloader --no-interaction
php artisan about
php artisan optimize:clear
php artisan migrate --force
php artisan migrate:status
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan route:list --path=api/v1
```

Seed the first admin only after real server-only `ADMIN_*` values are configured:

```bash
php artisan db:seed --class=AdminSeeder --force
```

Then verify health, both production CORS origins, register/login/me/logout, admin login/dashboard/users/logout, and that no response exposes a stack trace or secret. See the concise server workflow in `DEPLOYMENT.md`.

## Local verification

Do not start a server. Use CLI checks only:

```bash
composer validate --strict
composer audit
php artisan about
php artisan route:list --path=api/v1 --except-vendor
php artisan migrate:status
php artisan test
```

Step 1 local result: 27 versioned routes, 11 applied migrations, 11 passing tests, and 60 assertions.

## Step 2 readiness checklist

- [x] One Laravel root and standard HTTP/test entry files
- [x] Locked compatible dependencies
- [x] Public auth contract covered by tests
- [x] Admin/public authorization separation covered by tests
- [x] Account types and existing account endpoints preserved
- [x] Token hashing, expiration for new sessions, and revocation
- [x] Named rate limits, exact CORS origins, safe JSON errors, health route
- [x] Queue schema prepared without activating an unconfigured worker
- [x] Local migrations and tests pass
- [ ] Hostinger backend code synchronized to the committed revision
- [ ] Production PHP/Composer versions verified
- [ ] Production MySQL migrations and status verified
- [ ] `www.api.foodonlines.com` DNS/TLS reachable
- [ ] Live health, CORS, public auth, and admin smoke tests pass

Step 2 must not begin until the five deployment items are complete. Step 2 is where catalog work may begin; products, inventory, orders, payments, R2, and other ecommerce modules remain out of scope until their own phases.
