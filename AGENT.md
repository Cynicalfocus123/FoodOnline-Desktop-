# FoodOnlines Agent Guide

Last reviewed: 2026-07-22.

## Current production-repair contract

Public registration and administrator Customer/Supplier/Partner detail must remain available even when the newly introduced referral schema is not yet present. Referral attribution and referral summaries are optional enhancements: guard them behind schema-readiness checks and never let them turn core authentication or the managed-user editor into HTTP 500 responses.

Registration and login share one exact root-level `message`, `token_type`, `token`, and `user` envelope. The frontend may show registration success only after validating and persisting a non-empty bearer token and canonical user whose role matches the requested account type. The administrator editor derives its role synchronously from the URL, compares normalized IDs, retains the original account fields, and loads profile, saved addresses, and masked payment methods as independent states.

The user-address acceptance gate is mandatory. `npm run test:address-acceptance` must register a real temporary customer, save a default Thailand address and non-default United States address through `/account/addresses`, prove both database rows share that `users.id`, prove Admin detail returns only those rows twice, and use headless Chrome against a compiled production frontend to verify two separate cards before and after direct-route refresh. The final archive gate must repeat controller/resource/model/relationship/route and compiled-address marker checks inside both Windows and PHP ZIP extractions.

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

Customer addresses and payment methods remain Laravel-authoritative. Administrator views show only the selected customer’s approved address fields and an explicit allowlist of masked payment metadata. Never serialize or display payment tokens, provider references, CVV, or raw card data.

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

The 2026-07-22 urgent repair candidate passed 85 Node tests, TypeScript no-emit, changed-PHP syntax checks, and the mandatory real user-address acceptance command. That acceptance recorded HTTP 201 for registration and both saves, two authoritative rows under one `users.id`, HTTP 200 for initial/refreshed Admin detail, and two compiled headless-Chrome cards on both direct-route loads with Thailand as the only default. The focused address suites passed 8 tests / 163 assertions. The earlier full Laravel run reached 105 tests: 69 passed and 36 unrelated legacy cases failed, predominantly because a shared test-cache API throttle carried across cases; one pre-existing local-media URL expectation also remained. The production build transformed 141 modules, and the 28-route audit found no missing local references or placeholder links. `dist/` and `frontend-upload/` matched exactly at 1,036 files / 91,856,095 bytes; `backend-live/` contained 289 source files plus `SHA256SUMS` (290 files / 977,941 bytes), with zero missing, stale, checksum, secret, frontend, or ZIP findings. External Hostinger deployment remains unperformed and unverified.

## Ongoing maintenance

Keep these three documents concise and current; replace obsolete text instead of appending historical logs. Update the relevant canonical document before committing a meaningful change. Record only verified measurements and results. Do not modify unrelated user work in a dirty working tree.
