# Public Catalog Cutover - Phase 5

## Dynamic category placement update (2026-07-18)

Public category mapping retains placement/order information. Backend-managed navigation categories populate the Products dropdown and mobile navigation, backend-managed homepage categories populate the responsive tile grid even when empty, and one reusable broken/missing-image fallback supports every future category without a frontend rebuild.

## Phase 7 compatibility note (2026-07-15)

The API-backed storefront remains authoritative. Phase 7 adds real review loading/submission, product SEO metadata/JSON-LD, Best Selling from order data, and persistent saved-data synchronization while preserving the Phase 5 presentation compatibility layer.

## Scope

Phase 5 connects the existing public storefront and existing admin catalog editors to Laravel's public catalog contract. It preserves the current visual design and behavior while making API data authoritative. Transactional ecommerce remains deferred to Phase 6.

The zero-feature-removal rule applies: existing homepage sections, Best Selling, sorting, filters, product-card fields, detail tabs, ratings/reviews/sold-count/provider/badges/tags/recipes/recommendations, promo UI, payment UI, cart, checkout, and responsive behavior remain available.

## Catalog source and API

The frontend uses `VITE_CATALOG_SOURCE=api` by default and `VITE_API_BASE_URL` for the Laravel base URL. `VITE_CATALOG_SOURCE=local` is an explicit demo/local mode. API errors stay errors; they do not silently switch sources.

Public endpoints are:

- `GET /api/v1/catalog/categories`
- `GET /api/v1/catalog/categories/{slug}`
- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/products/{slug-or-uuid}`
- `GET /api/v1/catalog/brands`

List queries connect search, category, brand, origin, storage, availability, featured, price bounds, pagination, and API-supported sorting. Existing compatibility filters and Best Selling selection remain in the presentation layer when the backend has no equivalent ranking field yet.

## Mapping and identity

API product mapping uses the product UUID as product identity, the stable slug for public routes, R2/absolute media URLs, the default variant for card price/availability, all active variants for detail, and nutrition/grocery fields from Laravel. The presentation compatibility layer supplies only frontend-only experience fields that Laravel does not yet own; it never overrides API identity, category, brand, price, media, nutrition, or variant fields.

Categories map Laravel slugs, names, homepage/navigation flags, and resolved media into the existing category strip and route shape. Brands map name, slug, country, and logo without presenting inactive brands as active API brands.

The selected variant controls price, previous price, size, availability, and add-to-cart eligibility. Local cart lines are keyed by variant UUID, so two variants of one product coexist. Favorites use product UUID. Saved for Later stores the exact variant line and cart prices/media are rehydrated from Laravel. Unavailable lines remain removable. Checkout still only hydrates and displays frontend state; it does not create orders or charge payments.

## Preserved public experience

Homepage category tiles and product rails, category listing layout, existing sorts and filters, search, product detail gallery/tabs/reviews/recipes/nutrition/returns, related items, product-card metadata, Best Selling, promo overlays, payment method choices, cart layout, checkout address/payment UI, loading/empty/error/retry states, and mobile/tablet/desktop layouts remain in their existing presentation components.

## Admin control audit

The existing Categories editor retains homepage visibility, navigation visibility, status, public/catalog-only/hidden visibility, order, default sort, SEO, aliases, and managed media. Brands retain active state, sort order, country, slug, and logo. Products retain featured state, publication actions, category, brand, grocery information, variants, default variant, current/previous price, currency, availability, ordered/primary media, and nutrition.

Each existing Category and Product editor now includes a compact read-only Public Storefront Status panel with accurate reasons and a View on Storefront action. No duplicate publication engine, new admin sidebar section, or admin redesign was introduced.

## Deployment and smoke tests

After an authorized deployment, run the Phase 5 checklist: homepage/category/product/search/detail API loading; category R2 media; all existing sections, Best Selling, filters, sorts, card/detail fields, variant price/availability/out-of-stock behavior; variant UUID cart coexistence; product UUID favorites; saved-line preservation; admin category/brand/product persistence; status reasons; storefront links; draft non-public behavior; publication visibility; dashboard/admin login; and mobile/tablet/desktop layout checks.

This session regenerated `dist/`, `frontend-upload/`, and, for the small Laravel UUID lookup change, `backend-live/`. PHP/Laravel tests were not run because PHP is unavailable in the local shell. External Hostinger frontend/backend, production migrations, R2 configuration, DNS, and production catalog-source configuration remain unverified and unchanged.

## Phase 6 handoff

Phase 6 can add real carts, guest/user cart merge, inventory and reservation, server checkout quotes, promo codes/redemption, orders and snapshots, shipping/payment recording, order history, admin Orders/Promo Codes, fulfillment, status history, provider integration, and valid order-based Best Selling ranking. Product UUID and exact variant UUID identity are already preserved for that work.
