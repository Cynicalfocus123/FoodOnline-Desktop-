# FoodOnlines Agent Guide

Last reviewed: 2026-07-22.

## Post-upload Artisan rule

For every future release, assess whether post-upload Artisan work is required. Mention it in the user handoff only when it is required: provide the exact copyable commands, their order, the private Laravel root, and the reason (migration, one-time data repair, or necessary Laravel cache rebuild). If no Artisan work is required, omit it entirely from the handoff. ZIP extraction updates files only and never runs database migrations, data repairs, or cache commands; never expose Artisan through a public URL.

## Current production-repair contract

Public registration and administrator Customer/Supplier/Partner detail must remain available even when the referral migration has not yet reached an environment. Referral routes use the central `ReferralSchema` guard: when the required tables or columns are absent, return only the safe HTTP 503 referral-unavailable message, log diagnostic detail privately, and do not simulate referral data. Registration skips optional attribution in that condition; Admin user detail skips optional referral relations; order qualification/refund hooks exit safely. Never let optional referral work turn authentication, ordering, or the managed-user editor into HTTP 500 responses.

Refer & Earn is Laravel-authoritative and shared by active Customer, Supplier, and Partner accounts. Every eligible public account receives one immutable code and personal invite link; invite resolution is read-only; any eligible account type may attribute exactly one new Customer, Supplier, or Partner account; and rewards remain account-bound. Qualification is idempotent, and a full refund revokes an unused reward or moves a redeemed reward to review. All three account types use the same dashboard, activity, and coupon states. Administrator Referral operations uses server-backed mixed-role search, filters, pagination, dedicated detail/review routes, settings, referral-scoped notifications, audit history, and safe empty states; it must never fall back to demo rows. The additive production-upgrade migration is mandatory for installations where the original referral migration is already marked complete; use `referrals:diagnose` before and after migration, then run the idempotent all-role backfill twice.

The newest verified authoritative source is the only valid release input. Rebuild `dist/`, replace (never merge) `frontend-upload/`, regenerate `backend-live/` and its manifest, then create both Live ZIPs together. The archive gate must reject the known stale Admin filter strings (`All referral statuss`, `All review statuss`, and `Search referrer or friend`) in compiled output and both extraction paths. Archive filenames, timestamps, historic reports, and old extraction folders are never evidence of current code.

Registration and login share one exact root-level `message`, `token_type`, `token`, and `user` envelope. The frontend may show registration success only after validating and persisting a non-empty bearer token and canonical user whose role matches the requested account type. Admin login and `/admin/me` also return `expires_at`. The administrator shell must wait for persisted-session hydration before choosing Login, retain a stored token for retry on network, throttle, or server failures, and clear it only after the current token receives an exact HTTP 401. The administrator editor derives its role synchronously from the URL, compares normalized IDs, retains the original account fields, and loads profile, saved addresses, and masked payment methods as independent states.

The user-address acceptance gate is mandatory. `npm run test:address-acceptance` must register a real temporary customer, save a default Thailand address and non-default United States address through `/account/addresses`, prove both database rows share that `users.id`, prove Admin detail returns only those rows twice, and use headless Chrome against a compiled production frontend to verify two separate cards before and after direct-route refresh. `npm run test:managed-user-address-acceptance` repeats the same proof for Customer, Supplier, and Partner and proves cross-role control addresses never appear. The final archive gate must repeat controller/resource/model/relationship/route and compiled-address marker checks inside both Windows and PHP ZIP extractions.

Address Book phone fields use the shared `PhoneNumberInput` and its single country-calling-code dataset. Address country changes select the matching code while retaining safe local digits; new saves store one normalized international `phoneNumber` in the existing `address_values` JSON payload. Legacy local values remain readable and editable until saved. The 2026-07-22 save regression was a frontend silent-failure path: form-mode `addressMessage` was never rendered, native constraint validation could bypass the React submit handler, and successful API results were not checked for an authoritative address ID. Address forms use `noValidate`, visible safe field/form errors, submit-time normalization, real-ID verification, and a post-save authoritative refresh. Do not create a competing country-code list, a second phone normalizer, or a migration for this visual separation.

## Canonical root documentation

This is the single repository and delivery guide. At the repository root, keep exactly one file for each of these roles:

- `AGENT.md` — repository, implementation, security, and release rules.
- `design.md` — product and interface rules.
- `weight.md` — production-weight measurements and budget rules.

Do not create `AGENTS.md`, `DESIGNER.md`, dated copies, backups, or parallel root-level agent/design/weight files. Git history is the archive for superseded decisions. Scoped documentation remains allowed where it belongs (for example, deployment guides and page-specific design notes).

## Application boundaries

FoodOnlines has a Vite/TypeScript storefront and administrator interface plus a Laravel API. Preserve the existing public storefront, authentication, account, cart, checkout, catalog, referral, and administrator workflows unless a task explicitly changes them. Use the established data models and routes; do not create duplicate catalog, address, payment, media, or deployment systems.

The production interface must never expose API URLs, hostnames, endpoint paths, backend folders, environment names, credentials, tokens, database details, provider names, raw response bodies, stack traces, or technical errors. Use the shared error-normalization path and short, actionable customer-facing messages.

## Design and data rules

Follow `design.md` for visual and responsive decisions. Keep the existing dark-green/orange administration shell, responsive storefront behavior, and managed-media language. Category, brand, and product editors may retain local pre-save media previews, but media availability must not block a normal record save.

Customer, Supplier, and Partner addresses remain Laravel-authoritative. Address `phoneNumber` values are normalized as a single international `+` value for new saves and formatted safely in Address Book, checkout, and Administrator cards; legacy local values remain readable. Administrator views show only the selected managed user’s approved address fields; masked payment metadata is Customer-only and explicitly allowlisted. Never serialize or display payment tokens, provider references, CVV, or raw card data.

## Required release workflow

Every completed FoodOnlines change — including documentation, design, configuration, frontend, backend, database, security, and content work — uses one matched release state:

1. Finish source and the three canonical root documents.
2. Run relevant tests, rebuild `dist/`, and audit production output.
3. Synchronize and SHA-256-verify `frontend-upload/` from `dist/`.
4. Regenerate `backend-live/` with `npm run sync:backend-live` and verify `backend-live/SHA256SUMS` and safety gates.
5. Commit and push the source, mirrors, and documentation; confirm local `HEAD` equals the remote branch.
6. Run `npm run release:hostinger-live`.

The only deployment archives are:

- `FoodOnlines_Frontend_Live.zip`
- `FoodOnlines_Backend_Live.zip`

Regenerate both archives together for every change. They are created only from the verified `frontend-upload/` and `backend-live/` mirrors using the standard PHP `ZipArchive` Deflate ZIP32 root-file layout. Verification must include listing/CRC, Windows and PHP extraction with full SHA-256 parity, unsafe/duplicate/backslash-path checks, forbidden-content checks, and backend-manifest verification. Remove all other release-directory ZIPs and temporary staging or extraction folders.

`frontend-upload/` and `backend-live/` are repository deployment mirrors for manual Hostinger deployment; they are not proof of a live upload. Do not claim an external upload, production migration or cache command, database change, or smoke test without direct evidence. Manual deployment must preserve `public_html/api`, `public_html/api/backend-path.php`, live `.env`, `vendor/`, database, storage/media/uploads, writable directories, permissions, logs, sessions, queues, and runtime state.

## Current verified baseline

The earlier 2026-07-22 referral restoration is superseded by the shared-program contract above. The required acceptance now proves immutable code/backfill, invite resolution, automatic login, dashboard/activity/coupons, and all nine referrer/referred role combinations; it also proves mixed-role Admin list/detail/settings, qualification, coupon ownership, reversal, and referral-scoped audit/notification safety. The address acceptance gates remain mandatory. External Hostinger deployment, production migration, and live smoke testing remain unperformed and unverified.

## Ongoing maintenance

Keep these three documents concise and current; replace obsolete text instead of appending historical logs. Update the relevant canonical document before committing a meaningful change. Record only verified measurements and results. Do not modify unrelated user work in a dirty working tree.
