# FoodOnlines Design Guide

Last reviewed: 2026-07-22. This is the single root-level design source of truth; implementation and release rules live in `AGENT.md`, and production measurements live in `weight.md`.

## Brand and layout foundation

Preserve FoodOnlines’ established visual language: a clear, grocery-first public storefront; dark-green administrative navigation; orange active and primary actions; white rounded content cards; readable typography; and purposeful spacing. Do not introduce a competing brand system, duplicate application shell, or page-level horizontal scrolling.

Public pages must remain responsive across desktop, tablet, iOS Safari, and Android Chrome. Keep stable image frames, sensible loading behavior, touch-safe controls, and visible keyboard focus. Product media should use the established fit behavior and safe generic fallbacks rather than broken-image chrome.

## Public experience

Keep catalog browsing, product details, search, cart, checkout, authentication, account, favorites/saved items, addresses, and referral flows within the existing route and component structure. Loading, filtered-empty, confirmed-empty, unavailable, and error states must be distinct; never show an empty-state claim while compatible catalog data is still resolving.

Customer, Supplier, and Partner signup use the same authenticated-session contract as login. Success is never inferred from an HTTP response alone: it requires a valid token, canonical user ID, email, status, and matching account type. Validation errors remain field-specific, while offline/server failures use safe retry language and never expose endpoints or raw payloads.

The signed-in account menu includes one clear logout action, and public logout clears account-owned state before late network responses can repopulate it. Address Book and checkout show persisted addresses only when the Laravel-authoritative record exists for the signed-in Customer, Supplier, or Partner. Address Book reuses the registration country calling-code control: a compact text-labelled selector and a 16px local-number input remain on one readable row, synchronize with address country, preserve safe digits on country changes, and expose normal keyboard, focus, label, and error behavior. Save validation, authorization, network, and server failures stay visibly safe in the open form; the first invalid field is identified rather than silently doing nothing.

Refer & Earn is one shared Customer, Supplier, and Partner account experience. The dashboard must clearly show the server-issued invite code and direct link with exactly Share, Copy link, and Copy invite code actions; explain the program in concise safe language; and show referral activity as its own pageable state with safely masked names and account types. Dashboard, activity, and coupons use distinct loading, empty, unavailable, and retry states. Direct `/invite/{code}` routes and refreshes remain usable for codes from every public account type. Do not expose friends' private data or imply a reward is payable before the server marks it qualified.

## Administration

The existing sidebar labels, ordering, dark-green surface, and orange active state are the navigation foundation. Content modules use dedicated list workspaces with search, filters, sort, selection, bulk actions where supported, export, responsive tables, and pagination. Create and edit operations use full-width routes, not forms beside record lists. Product variants remain within Product Edit.

Category, brand, and product editors use the shared managed-media control. A user may select, replace, remove, and preview media before the first save; upload follows a successful parent save. Do not expose storage providers, buckets, paths, temporary-upload mechanics, or save-first warnings. Image failure is informational and retryable, not a reason to block an otherwise valid save.

Administrator Customer, Supplier, and Partner detail presents a responsive, read-only Saved addresses section. Customer detail also presents Payment methods. Address fields stay structured and country-aware; payment copy is limited to safe, masked metadata such as brand, last four digits, expiry, default, status, and created time.

Each saved address is one separate card tied to the selected Customer, Supplier, or Partner. Country-specific labels and populated values, stored phone number, delivery note, and summary remain visible. The Default badge appears only when `is_default` is true; loading, empty, or unrelated-user data must never substitute for returned address records, including after refreshing a direct managed-user Edit URL.

Customer, Supplier, and Partner edit routes keep one stable editor with the original identity, contact, LINE ID, company, status, source, and timestamp fields. The profile and saved-address requests have independent loading, empty, failure, and retry states; Customer payment methods follow the same rule. An optional-section failure must not replace or hide the profile editor. The URL module is authoritative for the expected role on direct navigation and refresh. Admin session restoration stays on a neutral loading screen until persisted state is hydrated; retryable `/admin/me` failures do not force the Login view.

Referral operations is a dedicated Admin workspace, not a static dashboard card. Preserve Referrer, Friend, Code, Status, and Registered columns while showing both account types, qualification/reward state, a View details action, server-driven search, status/review/account-type filters, pagination, safe zero-result copy, and a retryable failure state. The search copy is “Search by name, email, or code”; empty filters use grammatically correct explicit labels. Filters are one column on small screens, two columns on tablet, and expand only when enough width is available—controls must neither overlap nor create page-level overflow. The dedicated `/admin/referrals/{referralId}` route shows only API-authorized identity, attribution, qualification, reward/coupon, reversal/review, referral-scoped notification, and chronological audit data; its independently loaded optional sections cannot hide the core record. Program settings are an explicit route. Hide technical causes and never replace failed data with mock referrals.

## Privacy and error presentation

Never render API URLs, hostnames, endpoint paths, server folders, environment names, database details, credentials, tokens, provider names, raw JSON, framework errors, stack traces, or technical diagnostics in the public or administrator UI. Route failures through the shared error-normalization layer with concise, actionable language. Production UI must not contain debugging banners or configuration panels.

## Design quality gate

For interface work, verify the affected desktop, tablet, and mobile states; keyboard interaction where applicable; loading/empty/error behavior; no page-level horizontal overflow; and production-safe copy. Follow the matched release workflow in `AGENT.md`; a release governance change must not itself alter approved visual output.
