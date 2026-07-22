# FoodOnlines Design Guide

Last reviewed: 2026-07-22. This is the single root-level design source of truth; implementation and release rules live in `AGENT.md`, and production measurements live in `weight.md`.

## Brand and layout foundation

Preserve FoodOnlines’ established visual language: a clear, grocery-first public storefront; dark-green administrative navigation; orange active and primary actions; white rounded content cards; readable typography; and purposeful spacing. Do not introduce a competing brand system, duplicate application shell, or page-level horizontal scrolling.

Public pages must remain responsive across desktop, tablet, iOS Safari, and Android Chrome. Keep stable image frames, sensible loading behavior, touch-safe controls, and visible keyboard focus. Product media should use the established fit behavior and safe generic fallbacks rather than broken-image chrome.

## Public experience

Keep catalog browsing, product details, search, cart, checkout, authentication, account, favorites/saved items, addresses, and referral flows within the existing route and component structure. Loading, filtered-empty, confirmed-empty, unavailable, and error states must be distinct; never show an empty-state claim while compatible catalog data is still resolving.

The signed-in account menu includes one clear logout action, and public logout clears account-owned state before late network responses can repopulate it. Address Book and checkout show persisted addresses only when the Laravel-authoritative record exists.

## Administration

The existing sidebar labels, ordering, dark-green surface, and orange active state are the navigation foundation. Content modules use dedicated list workspaces with search, filters, sort, selection, bulk actions where supported, export, responsive tables, and pagination. Create and edit operations use full-width routes, not forms beside record lists. Product variants remain within Product Edit.

Category, brand, and product editors use the shared managed-media control. A user may select, replace, remove, and preview media before the first save; upload follows a successful parent save. Do not expose storage providers, buckets, paths, temporary-upload mechanics, or save-first warnings. Image failure is informational and retryable, not a reason to block an otherwise valid save.

Administrator customer detail presents responsive, read-only Saved addresses and Payment methods sections. Address fields stay structured and country-aware. Payment copy is limited to safe, masked metadata such as brand, last four digits, expiry, default, status, and created time.

## Privacy and error presentation

Never render API URLs, hostnames, endpoint paths, server folders, environment names, database details, credentials, tokens, provider names, raw JSON, framework errors, stack traces, or technical diagnostics in the public or administrator UI. Route failures through the shared error-normalization layer with concise, actionable language. Production UI must not contain debugging banners or configuration panels.

## Design quality gate

For interface work, verify the affected desktop, tablet, and mobile states; keyboard interaction where applicable; loading/empty/error behavior; no page-level horizontal overflow; and production-safe copy. Follow the matched release workflow in `AGENT.md`; a release governance change must not itself alter approved visual output.
