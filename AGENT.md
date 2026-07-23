# FoodOnlines Agent Guide

Last reviewed: 2026-07-22.

## Current production-repair contract

Public registration and administrator Customer/Supplier/Partner detail must remain available even when the newly introduced referral schema is not yet present. Referral attribution and referral summaries are optional enhancements: guard them behind schema-readiness checks and never let them turn core authentication or the managed-user editor into HTTP 500 responses.

Registration and login share one exact root-level `message`, `token_type`, `token`, and `user` envelope. The frontend may show registration success only after validating and persisting a non-empty bearer token and canonical user whose role matches the requested account type. Admin login and `/admin/me` also return `expires_at`. The administrator shell must wait for persisted-session hydration before choosing Login, retain a stored token for retry on network, throttle, or server failures, and clear it only after the current token receives an exact HTTP 401. The administrator editor derives its role synchronously from the URL, compares normalized IDs, retains the original account fields, and loads profile, saved addresses, and masked payment methods as independent states.

The user-address acceptance gate is mandatory. `npm run test:address-acceptance` must register a real temporary customer, save a default Thailand address and non-default United States address through `/account/addresses`, prove both database rows share that `users.id`, prove Admin detail returns only those rows twice, and use headless Chrome against a compiled production frontend to verify two separate cards before and after direct-route refresh. `npm run test:managed-user-address-acceptance` repeats the same proof for Customer, Supplier, and Partner and proves cross-role control addresses never appear. The final archive gate must repeat controller/resource/model/relationship/route and compiled-address marker checks inside both Windows and PHP ZIP extractions.

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

Customer, Supplier, and Partner addresses remain Laravel-authoritative. Administrator views show only the selected managed user’s approved address fields; masked payment metadata is Customer-only and explicitly allowlisted. Never serialize or display payment tokens, provider references, CVV, or raw card data.

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

The 2026-07-22 urgent repair candidate passed 89 Node tests, TypeScript no-emit, changed-PHP syntax checks, and focused Laravel coverage with 272 assertions and no failures (only non-failing legacy file-read warnings). Real compiled-browser acceptance passed separately for Customer, Supplier, and Partner: each recorded HTTP 201 registration and both saves, two authoritative rows under one `users.id`, HTTP 200 for initial/refreshed Admin detail, and two role-correct cards on both direct-route loads, while cross-role control addresses remained absent. The production build transformed 141 modules, and the 28-route audit found no missing local references or placeholder links. External Hostinger deployment remains unperformed and unverified.

## Ongoing maintenance

Keep these three documents concise and current; replace obsolete text instead of appending historical logs. Update the relevant canonical document before committing a meaningful change. Record only verified measurements and results. Do not modify unrelated user work in a dirty working tree.
