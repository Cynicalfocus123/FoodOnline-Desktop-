# Operational Commerce and Production Readiness — Phase 7

> 2026-07-18 managed-media update: review images, return evidence, and support attachments now use the shared provider-neutral workflow. Hostinger local Laravel storage is the production default, authenticated multipart upload is available without R2, persisted media includes safe public URLs, and customer ownership/removal is enforced. The older activation wording below is historical; optional direct upload remains backward compatible.

## Scope

Phase 7 extends the Phase 6 transactional Laravel boundary without replacing the public storefront, account shell, checkout, catalog admin, R2 workflow, or admin shell. It adds operational customer and staff workflows while keeping COD as the only operational payment method. No merchant provider, card charging, wallet processing, provider webhook, provider refund, or provider-backed saved card is enabled.

## Phase 6 baseline and verification

Phase 6 remains the source of truth for guest/authenticated carts, exact variants, cart merge, server quotes, inventory reservations, promotions, idempotent COD orders, customer order history, guest order access, and admin order operations. Phase 7 verification is environment-bounded: Node frontend checks are run locally; PHP, Composer, MySQL, external SMTP, queue workers, cron, Hostinger, R2, and production migrations are not claimed without direct evidence. No localhost/preview server or Serena session is used.

## Historical direct-upload activation and current media purposes

The same database purposes and after-commit deletion workflow support local and optional direct uploads. New purposes are `review_image`, `return_evidence`, and `support_attachment`, alongside product, brand, and category media. `media:diagnose` reports only safe capability/link readiness. Current production activation uses `MEDIA_DISK=local`, `MEDIA_UPLOADS_ENABLED=true`, and `MEDIA_PUBLIC_URL=https://api.foodonlines.com/api/media`; optional direct upload later requires its server-only credentials and policy.

## Customer commerce

- Returns are authenticated, ownership-checked, delivered-order/window/quantity eligible, and stored with an explicit status timeline. Admin actions cover approval, information requests, receipt, inspection, refund recording, close, and cancellation. Restocking is an explicit selected quantity and creates an inventory movement linked to the return. COD refunds are recorded as manual operational records, not provider refunds.
- Reviews are real backend records with one review per customer/product, moderation states, helpful votes, reports, media references, rating aggregates, and backend-calculated Verified Purchase based on a delivered qualifying order item. Fake reviews are not imported.
- Best Selling is calculated from order item quantities, excludes cancelled orders, and subtracts quantities in returned/refund workflows. Historical prices are never reused by Buy Again; the current active variant price and availability are rechecked.
- Favorites persist by product UUID. Saved for Later persists the exact product variant UUID and quantity. Anonymous local state merges after token login and unavailable variants are not silently substituted.
- Database notifications are created for order and return activity and exposed through the customer notification center. Receipts are authenticated, no-index HTML receipts with current order snapshots. Support tickets, customer-visible staff replies, internal replies, order association, and R2-compatible attachments are available.

## Staff, reports, and operations

Admin Returns, Reviews, Support, Reports, Staff, MFA, and Operations panels reuse the existing admin shell. Report summaries separate paid COD, unpaid COD, cancelled orders, returned amounts, and top products; CSV export is bearer-authenticated and permission-protected. Audit Logs accept action, subject, admin, and date filters. Staff roles and explicit permission middleware protect mutations, the final super administrator cannot be removed accidentally, TOTP MFA has one-time hashed recovery codes, admin sessions can be revoked, and sensitive reauthentication records are available.

Operations exposes queue connection, failed-job count and safe inspection/retry, scheduler and cleanup heartbeats, media/R2 readiness, and SMTP configuration presence without secrets. Scheduled maintenance bounds guest-cart, quote, notification, failed-job, and media-upload retention. Backups and restore remain a deployment responsibility: take a database and object-storage backup before migrations, verify a staging restore, then apply production migrations with a rollback plan.

## Password recovery and email verification

Password recovery tokens are hashed, expire after two hours, revoke active customer sessions on reset, and dispatch a queued security link without revealing account existence. Email verification tokens are hashed, expire after 24 hours, are single-use, and dispatch a queued verification link. SMTP delivery remains externally unverified until production credentials and a worker are configured.

## SEO, performance, accessibility, and responsive behavior

Products and categories expose title, description, canonical, and robots metadata. Product detail emits authoritative Product JSON-LD from API price, availability, SKU, brand, and images; compatibility ratings are excluded from structured data. Product/category sitemap endpoints exist and sensitive receipt/account routes are no-index. The existing lazy route structure, production asset audit, stable image loading, keyboard-sized controls, error/empty/loading states, and desktop/tablet/mobile layouts remain in use.

## Deployment and smoke tests

The authoritative Laravel source is synchronized to `backend-live/` by `node scripts/sync-backend-live.mjs`; the final frontend build is synchronized to `frontend-upload/` by `npm.cmd run sync:hostinger`. Verify parity, `SHA256SUMS`, no secrets, no frontend files in `backend-live`, and no ZIP files before commit. External Hostinger frontend/backend and external R2 are not updated by this repository task.

Production smoke tests should cover the Phase 6 cart/quote/COD/order/inventory flow, R2 signed upload/completion/deletion, return request/evidence/approval/inspection/restock/manual refund, review verification/moderation/aggregate/report, anonymous-to-authenticated favorites and exact saved variant merge, Buy Again, notifications, receipt ownership, support visibility, staff permissions/MFA/recovery/session revocation, reports/CSV authorization, SEO/sitemap/no-index, and responsive/accessibility behavior. Do not mark these external checks passed without live evidence.

## Phase 8 payment-provider handoff

Phase 8 may select one approved merchant provider and add hosted or tokenized payment sessions, 3-D Secure, signed webhooks, deduplication, reconciliation, provider refunds, and approved saved methods. It must preserve the Phase 6 cart, quote, order, inventory, promotion, customer-history, and admin-order contracts.

2026-07-18 review: review, return, and support uploads remain optional attachments to database workflows. Category CRUD and placement never depend on media-storage status. The current live-folder deployment sequence is in `DEPLOYMENT.md`.
