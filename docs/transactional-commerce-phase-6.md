# Transactional Commerce — Phase 6

## Scope

Phase 6 adds the transactional layer beneath the existing FoodOnlines storefront and admin portal: backend carts, guest carts and merge, server checkout quotes, minor-unit money, single-location inventory, reservations, promotions, real COD orders, customer order history, guest order access, and admin ecommerce operations.

The public catalog remains Laravel-backed from Phase 5. Existing storefront, account, checkout, cart, catalog-admin, R2, route, and responsive presentation contracts remain in place.

## Cart architecture

Each authenticated user has an active cart. Guests receive a random token once; only its SHA-256 hash is stored in `carts.guest_token_hash`. Cart lines are keyed by exact `product_variant_id`, so two variants of one product remain separate. Add and update operations validate publication, active variant state, positive quantity, current availability, and the 99-line quantity cap. Hydration returns current product/media/variant price and availability while retaining unavailable lines for removal or later recovery.

After a real Laravel-token login, the guest cart is merged into the authenticated cart. The documented rule is `min(99, authenticated quantity + guest quantity)`, then clamping tracked non-backorder inventory. The frontend clears the guest token only after a successful merge and preserves unresolved Phase 5 lines visibly rather than matching by product name or silently substituting a variant.

## Inventory and reservations

`variant_inventories` is intentionally single-location. Available stock is `quantity_on_hand - quantity_reserved` when tracking is enabled; backorder and tracking-disabled variants bypass the tracked-stock rejection. Reservations and adjustments lock rows in deterministic variant order. Reservation creation, release, expiration, shipment consumption, and admin adjustments write append-only inventory movements. COD reservations have no expiry; other payment reservations are released by the scheduled expiration command.

## Promotions and quotes

Admin promo codes support percentage basis points (`1000` = 10%) and fixed minor units, explicit currency, dates, total/per-actor usage limits, minimum subtotal, maximum discount, and product/category restrictions. Codes are normalized for case-insensitive lookup. Quote evaluation and order-time revalidation return safe customer validation errors; usage is rechecked while the promotion row is locked and redeemed with an immutable order snapshot.

Quotes are short-lived UUID records owned by the cart and actor. They store selected item, shipping/billing address, promotion, calculation hash, and server-calculated subtotal, shipping, tax, COD fee, discount, and total. Quotes never reserve inventory. Order creation rechecks publication, exact variant, price, quantity, stock, currency, promotion, shipping, tax, settings, payment method, and expiration.

All authoritative transactional money is integer minor units with explicit currency. APIs also return formatted decimal strings for presentation; browser totals, prices, discounts, shipping, and tax are not trusted.

## Orders, status, and idempotency

Order creation is one database transaction. It writes an order, exact item snapshots, shipping and billing address snapshots, payment record, promotion redemption/snapshot, status history, inventory reservations, and purchased-line cart deletion. It dispatches confirmation mail after commit. The actor plus idempotency key is unique: a valid replay returns the original order, while reuse with a different quote is rejected.

Order status, payment status, fulfillment status, reservation status, and promotion status are separate. Legal admin transitions include confirmation, processing, shipment with carrier/tracking, delivery, cancellation where eligible, COD collection, and manual refund recording. COD stays pending until collection; duplicate collection is safe and audited.

## Payment boundary

The gateway interface is provider-neutral. COD is operational by default. Card, bank transfer, PromptPay, PayPal, Google Pay, Alipay, and Cash App remain visible in checkout but are disabled by backend availability with clear reasons. No merchant SDK is installed, no fake gateway reports production success, and no raw PAN or CVV reaches Laravel. Legacy saved-card metadata is explicitly unverified and non-chargeable. Phase 7 can add an approved hosted/tokenized provider adapter, sessions, webhooks, refunds, reconciliation, and provider-backed saved methods without rewriting commerce core.

## Customer and admin operations

Authenticated customers can list, inspect, and cancel their own eligible orders. Guests can inspect an order only with the one-time access token returned at creation. Admin Orders provides list/search/filter, complete customer/address/item/financial/promo/payment/fulfillment/history details, status actions, tracking, COD collection, refunds, and notes/audit context. Admin Inventory provides searchable variant stock, thresholds, tracking/backorder settings, adjustments, and movements. Admin Promo Codes provides CRUD, validation, limits, dates, restrictions, activation, and archive. Commerce settings stay inside the existing Admin Settings screen; admin actions are written to server audit logs.

## Queues, scheduler, and deployment

Order confirmation is a queued after-commit job. Reservation expiration runs every five minutes; media cleanup remains hourly. `.env.example` keeps the default queue in a safe synchronous mode until a supervised worker is configured.

Laravel source is authoritative. Run `node scripts/sync-backend-live.mjs` after final backend validation; verify missing, stale, checksum, secret, frontend, and ZIP findings are all zero. Run the frontend build, production audit, and `node scripts/sync-hostinger-mirror.mjs`; verify `dist/` and `frontend-upload/` parity. This session has not externally updated Hostinger, production migrations, SMTP, workers, cron, R2, DNS, or a merchant provider.

## Validation and smoke tests

The available Node 24.18.0 validation currently passes `npm.cmd run build` with 104 modules transformed. PHP, Composer, Laravel migrations/tests/cache checks, and genuine MySQL row-locking tests remain unrun because this shell has no PHP or Composer executable. The focused backend test file covers guest/authenticated carts, exact variants, merge, quotes, COD idempotency, snapshots, ownership, promotions, reservation behavior, admin actions, audit records, and disabled payment methods; counts are recorded only after a real PHP run.

After authorized deployment, smoke-test catalog continuity, exact-variant cart persistence and merge, quote totals/promo errors, COD order creation and duplicate-click idempotency, guest/customer order access, admin status/tracking/shipment/collection/refund flows, reservation consumption/release, inventory adjustments/history, promo snapshots, mobile/tablet/desktop layout, and disabled provider behavior.
