# Agent Notes

- Repo was empty when cloned from `https://github.com/Cynicalfocus123/FoodOnline-Desktop-.git`; scaffolded first React desktop site in place.
- Use caveman full responses unless user says normal mode.
- Keep command output capped. Prefer small `Select-Object -First ...` / `Out-String -Width ...` on PowerShell.
- User wants commit and push after each completed change set without asking.
- Single documentation rule: keep one source of truth only. Use `AGENT.md` for repo + backend/admin implementation notes, and `design.md` for repo + backend/admin design notes.
- Permanent documentation rule: after every meaningful code, deployment, admin, backend, frontend, or design change, update `AGENT.md` and the design notes file before committing. Current design notes file is `design.md`; if a future `designer.md` file is added, update it too.
- Start every session by following this workflow rule: do not run localhost, browser preview, HTTP local server checks, `npm run dev`, `npm start`, `vite preview`, `next dev`, or any long-running server. Only run safe checks such as `npm run build`, `npm run lint`, `npm test`, or `npx tsc --noEmit`; after safe checks pass, commit and push to the current branch.
- Permanent Git rule: never ask user to push, never stop with manual push instructions, always run `git status`, `git add .`, `git commit -m "Clear summary of completed change"`, detect branch with `git branch --show-current`, then push automatically with `git push -u origin CURRENT_BRANCH`. If push fails, inspect real git error, fix normal non-destructive issues automatically, retry push, stop only for real merge conflicts or authentication requirements.
- Global product search update on 2026-05-26: public header search is now one shared Zustand-driven search entry across all public views with hash-safe `#search/:query` routing. Search submits from the existing header on home, category, product detail, cart, checkout, login, and signup, then opens a dedicated public results page that reuses `ProductCard` and the shared cart/favorite/detail behavior.
- Search matching behavior: matching is case-insensitive and tolerant of spaces, hyphens, punctuation, and combined words. It searches `src/data/home.ts` product data across name, category, brand/provider, tags, badges, size/unit, and origin fields so partial text like `t`, `tea`, `coffee`, `tea coffee`, or `teaandcoffee` can still surface relevant products.
- Header search UI follow-up: removed the camera icon from the shared search bar without changing the overall header layout. Mobile search input now keeps a minimum 16px font size, stable line-height, and no layout-expanding focus treatment so iOS Safari, Android/Chrome, and in-app mobile browsers do not auto-zoom or break header spacing when the field is focused.
- Promo modal viewport-fit fix on 2026-05-27: the welcome-offer popup now uses viewport-safe max heights and scrollable overlay containers so the modal no longer gets cropped on desktop, desktop-mobile browser widths, Chrome, iOS Safari, or other short-height screens when opened from the sticky `Copy Code` promo bar.
- Hero splash media update on 2026-05-27: homepage hero now uses the supplied YouTube embed `https://www.youtube.com/embed/siItG3lu1To` with muted autoplay, loop, inline playback, hidden controls, and cover-style iframe sizing so desktop, desktop-mobile browser widths, Chrome, and iOS use the same splash source without relying on the large local MP4 autoplay path.
- Promo modal overlay fix on 2026-05-27: welcome-offer popup overlay now sits above the fixed header and zip/filter/cart modal layers at `z-[1600]`, with safe-area-aware vertical padding and scroll containment so the promo box is not cropped by the header on desktop, desktop-mobile browser widths, Chrome, iOS Safari, or short-height screens.
- Masala image override on 2026-05-26: `Masala, Oil & More` now uses a dedicated 60-image real-asset set on both the homepage carousel and the category listing page, following the same unique no-repeat override pipeline already used by bakery, rice, and tea. One source asset was `webp`, so the public mockup folder preserves that format at slot `31` while the rest stay `avif`.
- Stack selected for desktop website: Vite React + TypeScript, Zustand, Tailwind CSS.
- Dynamic checkout page update on 2026-05-31: replaced the placeholder checkout with a production-ready frontend checkout surface that keeps the existing `#checkout` route, shared cart selection state, public auth session state, header/footer layout, and FoodOnlines visual language intact.
- Dynamic checkout files changed: `src/components/CheckoutPage.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Dynamic checkout behavior: `#checkout` now renders delivery address, add-new-address flow, country-specific address fields for Thailand, Japan, Singapore, Taiwan, China, Philippines, Malaysia, Indonesia, and Hong Kong, selected cart item details, payment method cards, card entry fields, coupon UI, pricing summary, final green Place Order CTA, empty-checkout state, and mobile safe-area sticky order total.
- Dynamic address behavior: country switching preserves typed values only for field keys that still exist in the next country config, resets irrelevant fields/errors, keeps normal spaces while typing, validates required fields with friendly messages, uses mobile-safe input types/autocomplete tokens, and leaves delivery note optional.
- Payment safety behavior: card number auto-spaces, expiry formats as `MM/YY`, CVV accepts numeric masked input, card data remains component state only, and no raw payment data is stored in localStorage or sent to an API. Real order creation, coupon validation, and payment tokenization remain backend/payment-provider TODOs.
- Responsive checkout behavior: desktop uses a two-column checkout with sticky pricing/coupon summary, tablet and mobile stack sections, and mobile uses a safe-area-aware sticky bottom total/Place Order bar so iOS Safari and Android Chrome bottom UI do not cover the CTA.
- Checkout payment visual refinement on 2026-05-31: payment methods now render as compact aligned radio rows with small icon/logo tiles, inline card brand marks for credit/debit card, and simple dividers instead of large bordered method cards. The selected credit card method expands the card form below the row list.
- Checkout billing address update on 2026-06-01: the selected Credit / Debit Card row now expands the Add a New Card form directly under that payment row. Billing address fields remain hidden while `Same as shipping address` is checked; unchecking it reveals a billing country dropdown plus the same country-specific address field sets used by shipping, with shared-key preservation on country change and required-field validation.
- Phone country-code selector update on 2026-06-01: added shared `src/components/PhoneNumberInput.tsx` for login/register phone entry. It uses a compact left-side selector that shows only short country code plus dial code in the closed field, such as `US +1` or `JP +81`; the native dropdown options include country name for United States, United Kingdom, Turkey, Thailand, Japan, Singapore, Taiwan, China, Philippines, Malaysia, Indonesia, and Hong Kong. Public login and checkout-login now expose Email/Phone modes so email entry is not polluted by phone prefixes, while register contact number stores the selected dial code plus local number.
- Checkout/header validation follow-up on 2026-06-01: desktop/mobile header nav no longer hardcodes green text on `Home` and `Wholesale Products`; only the current mapped page label is highlighted. `Add new address` now always opens a clean blank form for the current country, clears selected saved-address state, and resets validation/touched state. Country required rules were narrowed so only the requested fields block save, and the public login flow now preserves a return route so successful email sign-in can return to product/category/search/cart/checkout instead of always jumping home.
- Mock phone OTP update on 2026-06-01: public login, public signup, and cart-to-checkout auth now treat phone auth as a two-step mock OTP flow instead of asking for a password. Submitting a valid phone number opens an SMS-code step with `Resend code`; any non-empty code completes a mock phone session and returns the user to the prior route or continues checkout. Email login/register remains on the live Laravel API flow, while phone auth is intentionally frontend-mock-only until real backend SMS endpoints exist.
- Mock phone OTP files changed: `src/components/LoginFlow.tsx`, `src/components/SignupFlow.tsx`, `src/components/CartPage.tsx`, `src/store/publicAuthStore.ts`, `AGENT.md`, `design.md`, and `design.json`.
- Mock phone OTP implementation note: `src/store/publicAuthStore.ts` now exposes `completeMockPhoneOtpLogin(...)` so the UI can wait for the OTP screen before creating the mock phone session. Phone signup can carry selected role, company, first name, last name, and Line ID into that temporary session shape.
- Mock phone OTP deployment note: this is intentionally temporary frontend-only behavior. Replacing it later should mean swapping the OTP-step submits/resend actions to real `/auth/phone/request-code`, `/auth/phone/verify-code`, and optional `/auth/phone/resend-code` backend endpoints while keeping the same UI flow and return-route behavior.
- Mock phone OTP checks on 2026-06-01: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and `git diff --check`.
- Become-vendor auth navigation fix on 2026-06-04: vendor-page signup/login overlay buttons now push explicit `#signup` and `#login` history entries instead of replacing `/become-vendor` with `#home`. `src/store/homeStore.ts` now recognizes auth hashes and includes `about-us`, `become-vendor`, and `company/drivers` as auth return routes, so browser Back returns from auth to the originating vendor page and Forward restores auth.
- Become-vendor hardcoded page rebuild on 2026-06-04: `src/components/BecomeVendorPage.tsx` no longer renders the six full banner images as page content. It now uses responsive React sections with real editable HTML text, real CTA buttons, hardcoded stat/card/step copy, SVG/CSS illustration icons with hardcoded labels such as `WWW.` and `Certificate`, and existing local product/logo assets only as decorative visuals. Footer `Become a Vendor` continues to open the same rebuilt route, while `GET STARTED`, `Sign up`, and `Log in` reuse existing `openSignup` / `openLogin` auth routing with no seller-route TODO needed.
- Become-vendor visual refinement on 2026-06-04: the hero art now reuses the original vendor hero image inside the two original-style blue/yellow circle fields instead of separate rounded product-image circles. The stats section no longer shows the FoodOnlines logo. The page forces a Poppins-first font stack, uses semibold instead of black/bold weights for emphasized copy, scales down the simple-steps heading block, and enlarges the step description text for desktop/mobile Safari and Chrome readability.
- Become-vendor responsive typography and image-fit follow-up on 2026-06-04: reduced the oversized heading, stat, card, step, paragraph, and CTA font clamps across desktop, tablet, mobile, and desktop-mobile browser widths without changing any visible copy. Hero circle art now uses responsive percentage background sizing/positioning so the supplied vendor hero image no longer drifts upward or over-zooms inside the blue/yellow ovals. The selling/globe section now crops the original `vendor-selling.png` globe artwork instead of the code-drawn SVG globe, and the stats grid uses compact two-column mobile spacing with orange numbers and grey supporting text.
- Become-vendor globe/hero food art update on 2026-06-04: the `Who's Selling on Globally?` section now uses the supplied square food-globe artwork as `public/images/become-vendor/vendor-food-globe.png`. The top hero art now uses separate tomato and leafy vegetable cutout assets layered over the blue/yellow circles with visible overflow so the food appears to come out of each circle; page copy and CTA behavior were unchanged.
- Become-vendor art correction on 2026-06-04: replaced the prior square globe with the transparent supplied globe asset at `public/images/become-vendor/vendor-food-globe-transparent.png` so the current light-green page background shows through. Replaced the top hero crop assets with two separate transparent SVG images, `vendor-hero-vegetable.svg` for the blue circle and `vendor-hero-tomato.svg` for the yellow circle, scaled smaller so each image belongs to its own circle while slightly protruding past that circle's edge.
- Become-vendor FAQ accordion cross-device update on 2026-06-05: added a hardcoded `VendorFaqAccordion` below the three onboarding step cards in `src/components/BecomeVendorPage.tsx`. All FAQ rows are closed by default, use real button semantics with `aria-expanded` / `aria-controls`, toggle on click or keyboard Enter/Space through native button behavior, and keep one item open at a time.
- Become-vendor FAQ responsive behavior: the FAQ shares the current `#c4dfb8` light-green page background, uses Poppins typography, subtle divider lines, rotating right-side chevrons, fluid `clamp()` heading/question/body sizing, flexible full-width rows, 44px-plus touch targets, break-safe answer text, and overflow guards for Chrome desktop, Safari desktop, iOS Safari, Android Chrome/browser views, tablets, and wide desktops.
- Become Partner page added on 2026-06-05: created hardcoded `src/components/BecomePartnerPage.tsx`, added `becomePartner` routing in `src/store/homeStore.ts`, rendered it from `src/App.tsx`, and linked it through the footer. The page recreates the provided partner banner layouts without using full banner images as content sections; all copy is real React/HTML text positioned to visually match the samples.
- Become Partner footer update: Corporate footer text `Our Suppliers` was replaced with `Become a Partner` and linked to `/become-partner` / `#become-partner` route handling. The existing `Become a Vendor` footer link and route were left intact.
- Become Partner asset mapping: separate provided assets were copied to `public/images/become-partner/` as `partner-food-table.png`, `partner-team.png`, `partner-fruit-plate.png`, `partner-leaves.png`, `partner-icon-globe.png`, `partner-icon-megaphone.png`, and `partner-icon-growth.png`. Full 1650px reference banners remain source references only and are not rendered as page sections.
- Become Partner responsive behavior: the page uses one continuous soft pink background near `#f8e9ee`, Poppins-first typography, fluid `clamp()` sizing, flexible image/card layouts, mobile stacking, no fixed content widths that force horizontal scroll, and a real `mailto:info@foodonlines.com` final CTA with accessible label and focus styling.
- Become Partner visual tune on 2026-06-05: enlarged the three value-card icons, moved the section headline above the staggered card layer, brought the leaf decoration closer to the fruit dish, and widened the teamwork image column by roughly 60% while keeping the responsive stacked layout intact.
- Become Partner card/leaf follow-up on 2026-06-05: fixed clipped card bottoms by giving the partner value-card band more vertical room and visible overflow, enlarged the three card icons again to roughly 180% of the prior tuned size, and increased the hero leaf decoration by about 40% while positioning it closer to the fruit dish.
- Become Partner mobile image/icon sizing follow-up on 2026-06-07: the hero food-table and teamwork images now render as large crop-forward image surfaces with no extra shadow/box panel behind them, using taller responsive heights for phone, tablet, desktop-mobile, and desktop widths. The three value-card icons are inline scalable SVGs centered in reserved top icon areas so each icon stays very large inside its card across mobile, tablet, and desktop breakpoints.
- Become Partner teamwork image enlargement follow-up on 2026-06-07: the hero teamwork image is enlarged again as the primary requested visual, with a much taller phone/mobile image surface, a wider desktop/tablet grid column, and a taller desktop image height so the partner hands photo reads roughly 200% larger on desktop and about 250% larger on mobile without adding a background card or shadow panel.
- Become Partner hero proportion correction on 2026-06-07: reduced the oversized food banner/teamwork treatment back to a balanced side-by-side desktop/tablet layout, restored the teamwork photo to its earlier responsive image-card size, and made the fruit dish plus leaf visible on mobile-desktop widths above the teamwork image with spacing so they do not overlap the photo too closely.
- Become Partner mobile-desktop hero/icon follow-up on 2026-06-07: restored the original PNG line-icon assets in the three value cards and reduced their rendered size sharply for desktop, Chrome, Safari, and mobile-desktop widths. The teamwork hero image is about 40% larger again without moving the food-table image, and the fruit dish plus leaf are now positioned inside the teamwork image wrapper so mobile-desktop layouts keep those decorations next to/above the hand banner instead of drifting from section-level absolute coordinates.
- Become Partner dish/leaf proximity follow-up on 2026-06-07: tightened the teamwork image wrapper's top decoration space so the fruit dish and leaf sit closer to the hand banner on desktop and mobile-desktop widths while remaining attached to that wrapper for stable Chrome/Safari responsive scaling.
- Become Partner mobile side-by-side follow-up on 2026-06-07: the hero food-table and teamwork images now use a two-column layout starting at mobile widths instead of stacking, with smaller mobile image heights and reduced hero/card-section spacing so `Partner with the World's Largest Online Supermarket` comes up directly below the hero media. The three value-card PNG icons were enlarged from the tiny pass to a 60%-large treatment while keeping the original icon image assets.
- Become Partner desktop/mobile cleanup on 2026-06-07: removed the decorative fruit dish and leaf from the hero entirely, tightened only the mobile-desktop gap between the two hero images, preserved wider desktop/tablet image spacing, increased desktop hero vertical breathing room between copy and media, and set the original PNG value-card icons to a large but normal responsive size across desktop, tablet, iOS Safari, Chrome, and mobile-desktop widths.
- Become Partner redo on 2026-06-07: enlarged the original PNG card icons again by increasing both the rendered image size and the reserved icon area, so the visible line drawings read large across mobile, tablet, Chrome, Safari, and desktop. Reworked the hero media breakpoints so mobile-desktop/tablet widths use a wide food-table column plus narrower hand-image column with a tight gap like the supplied reference, while `lg` desktop keeps separate roomier spacing and more vertical distance between copy and the media band.
- Become Partner icon asset and mobile-desktop image fix on 2026-06-07: cropped the blank 1000px canvases from `partner-icon-globe.png`, `partner-icon-megaphone.png`, and `partner-icon-growth.png` so the original line-art icons fill their rendered area and appear large in all three cards. Increased the pre-`lg` teamwork/hand image column ratio and responsive height so the hand image is bigger on mobile-desktop while leaving the `lg` desktop hero layout rules unchanged.
- Become Partner mobile card whitespace fix on 2026-06-07: removed the forced tall mobile card minimum height, tightened the icon/title/body vertical spacing, and kept the cropped PNG icons large enough to read clearly without leaving long empty white space inside the three value cards.
- Context7 note for this Become Partner change: Context7 discovery was attempted through `tool_search`, but no `resolve-library-id` or `query-docs` Context7 tools were exposed in this session, so implementation followed existing local React/Vite/TypeScript/Tailwind project patterns.
- Checkout address cancel update on 2026-06-01: the add/edit shipping-address form now includes a `Cancel` button beside `Use this address`. Cancel closes the form and restores the prior selected shipping address card when one existed; otherwise it collapses the form without selecting a new address. Files changed: `src/components/CheckoutPage.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Checkout saved-address dedupe update on 2026-06-01: the active delivery address now renders only once. When a saved address is selected, or when saved addresses exist and no explicit selection has been made yet, the first available saved address becomes the default active delivery card and is hidden from the lower `Saved addresses` list so it does not duplicate visually.
- Context7 note for this change: Context7 MCP discovery was attempted with `tool_search`, but no Context7 resolve/query tools were exposed in this session. Current official React, Vite, TypeScript, Tailwind, MDN form/autofill/safe-area, and Zustand docs were checked as fallback before implementation.
- Build/test commands for this dynamic checkout update: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Deployment note for this dynamic checkout update: no backend routes, Laravel files, auth endpoints, cart store contracts, or cPanel packaging scripts were changed. Live charging still requires a PCI-compliant payment provider/tokenization endpoint and backend order creation before enabling real card payments.
- Local assets copied into `public/assets`: FoodOnlines logo and Blue Apron hero video.
- Home page requirements implemented: logo top-left, video-backed main slider, centered splash signup form over Dribbble video, category/deal sections, footer with mission/news/contact.
- `.gitignore` excludes generated folders: `node_modules/`, `dist/`, `.logs/`, `.vite/`.
- `README.md` added with run/build commands for the GitHub repo bootstrap.
- Main hero video now uses `public/assets/food-horizontal.mp4` copied from `site video and content/food (Horizontal).mp4`.
- GitHub Pages deployment workflow added at `.github/workflows/deploy-pages.yml`; demo URL is `https://cynicalfocus123.github.io/FoodOnline-Desktop-/`.
- Hero quick-pick panel, prep stat, and green CTA removed; centered hero email registration form added using existing Zustand signup state.
- Header now uses the transparent logo asset with no text or logo container; standalone splash signup section removed because hero contains signup. Footer now uses three compact link rows.
- Header now uses the long transparent logo asset at larger size, hero eyebrow/body copy is reduced, and footer link groups are tuned for stacked mobile spacing and touch-safe sizing.
- Signup now runs as an in-app multi-step flow: hero CTA -> role selection -> split signup form -> completion state, with structured registration payload ready for backend submission later.
- Signup input handling preserves safe spaces while users type names, contact numbers, and company words, then trims and normalizes cleaned values on final submission.
- Logo source file `food-online-long-text-transparent.png` contains opaque white pixels despite its name. Use generated `public/assets/food-online-long-text-cutout.png` for real transparent header rendering.
- Frontend and admin are now fully separated at entry level: public site stays on `index.html` / `src/main.tsx`, while admin uses standalone `admin.html` / `src/admin-main.tsx`. Do not re-add admin buttons, admin route toggles, or mixed admin state into public site UI.
- Communication rule: after every completed fix + commit + push, always include backend/admin link in final response: `https://cynicalfocus123.github.io/FoodOnline-Desktop-/admin.html`
- Main public frontend now uses live Laravel API auth instead of mock-only signup completion. Public registration posts to `POST /api/v1/auth/register`, public login posts to `POST /api/v1/auth/login`, session restore uses `GET /api/v1/auth/me`, and logout posts to `POST /api/v1/auth/logout`.
- Email auth production fix on 2026-05-31: email registration now returns the same bearer-token session shape as email login, using shared backend token creation through `app/Services/Auth/UserAuthTokenService.php`, and the public frontend persists the returned token/user immediately after successful registration.
- Email auth live diagnosis on 2026-05-31: `POST https://www.api.foodonlines.com/api/v1/auth/register` reached the live Laravel API and created a real database user, while `POST /auth/login` and `GET /auth/me` returned `404`. That means the deployed backend package or Laravel route cache is stale/missing login/session routes; deploy the updated backend files, run the `user_api_tokens` migration if needed, and clear/rebuild Laravel caches.
- Email auth files changed on 2026-05-31: `app/Services/Auth/UserAuthTokenService.php`, `app/Http/Controllers/Api/Auth/LoginUserController.php`, `app/Http/Controllers/Api/Auth/RegisterUserController.php`, `app/Http/Requests/Auth/LoginUserRequest.php`, `app/Http/Requests/Auth/RegisterUserRequest.php`, `src/store/publicAuthStore.ts`, `src/store/homeStore.ts`, `src/components/LoginFlow.tsx`, `src/lib/security.ts`, `deployment/tmdhosting/README.md`, and `deployment/tmdhosting/UPLOAD-INSTRUCTIONS.md`.
- Email auth behavior: email values are trimmed/lowercased by the backend request, duplicate email registration is rejected by the existing unique rule, passwords continue to use Laravel hashing/comparison, login/register share the same token persistence path, and existing phone-style checkout fallback behavior was left unchanged.
- Email auth deployment note: the live API must expose `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, and `POST /api/v1/auth/logout` in addition to register. If those routes return `404`, run `php artisan optimize:clear`, `php artisan migrate --force`, `php artisan config:cache`, and `php artisan route:cache` on the deployed Laravel app after uploading the backend files.
- Email auth checks on 2026-05-31: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and live API smoke checks. Live duplicate email registration returned `422`; live login and me still returned `404` until the updated backend routes are deployed/cache-cleared. Local PHP/Laravel artisan commands could not be run because `php` is not installed in this Windows workspace.
- Frontend API config source is `src/lib/runtimeConfig.ts`. Default production API base URL is `https://www.api.foodonlines.com/api/v1`. Production build now uses relative Vite asset paths for safe cPanel subfolder upload.
- Public signup keeps the latest homepage/header/hero/category/deals/footer design, but now adds minimal live auth UI only: register password fields, login page, guest path, persisted account state, and logout.
- Public registration source label now sends `registered_from=main_public_frontend` so new records can be identified in backend/admin tables.
- Public frontend upload output now lives in `frontend-upload/`. Latest TMDHosting cPanel ZIP artifact is `D:\Foodonline desktop version\foodonlines-tmdhosting-cpanel-upload.zip`.
- Latest cPanel package contents: `index.html` public frontend, `admin.html` admin app, `favicon.svg`, `assets/`, `.htaccess`, and `DEPLOYMENT-INSTRUCTIONS.txt`. `assets/` includes the built JS/CSS bundles plus all referenced logos, videos, payment icons, category images, home banners, and product mockup folders used by homepage rails, category pages, product detail, cart, login/register, and admin.
- TMDHosting packaging refresh on 2026-05-26: rebuilt `frontend-upload/` directly from the latest `dist/` output, replaced stale hashed entry files, kept split public/admin entries, preserved live Laravel API auth/admin endpoints, and generated root-level upload ZIP `foodonlines-tmdhosting-cpanel-upload.zip` with no nested `frontend-upload/` folder inside the archive.
- TMDHosting packaging build commands used on 2026-05-26: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- TMDHosting packaging auth endpoints preserved: `POST https://www.api.foodonlines.com/api/v1/auth/register`, `POST https://www.api.foodonlines.com/api/v1/auth/login`, `GET https://www.api.foodonlines.com/api/v1/auth/me`, `POST https://www.api.foodonlines.com/api/v1/auth/logout`, `POST https://www.api.foodonlines.com/api/v1/admin/login`, and `GET https://www.api.foodonlines.com/api/v1/admin/users?account_type=...`.
- TMDHosting packaging target paths: upload/extract into `/home/USERNAME/public_html/` or `/home/USERNAME/foodonlines.com/`. If deploying into `/public_html/app/`, add `RewriteBase /app/` inside `frontend-upload/.htaccess` before upload.
- TMDHosting packaging test URLs: `https://foodonlines.com/`, `https://foodonlines.com/admin`, `https://foodonlines.com/admin.html`, `https://foodonlines.com/#login`, `https://foodonlines.com/#signup`, and `https://www.api.foodonlines.com/api/v1/auth/me`.
- TMDHosting packaging warnings on 2026-05-26: no EPERM build issue occurred in this packaging pass. Existing unrelated deleted files under `deployment/tmdhosting/frontend-public/` and the old `foodonlines-admin-fix.zip` were left untouched and were not part of the refreshed cPanel package.
- Safe checks run for this change set: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Production packaging fix on 2026-05-19: verified `dist/index.html` loads `./assets/main-B2NKpiM4.js` with title `FoodOnlines | Fresh Food Delivery`, while `dist/admin.html` loads `./assets/admin-BMUjBCaR.js` with title `FoodOnlines Admin Dashboard`. `.htaccess` now routes `admin` to `admin.html` and all other SPA paths to public `index.html`.
- Admin API connection fix on 2026-05-19: admin login now calls `https://www.api.foodonlines.com/api/v1/admin/login` through shared API base `https://www.api.foodonlines.com/api/v1`, using JSON payload `{ email, password }`. No visual design changes made. If an API call receives `text/html`, frontend shows `API URL is pointing to frontend, not Laravel backend. Check API_BASE_URL.`
- Admin API fix upload ZIP name: `foodonlines-admin-fix.zip`. Build command used: `cmd /c npm run build`. Files changed for this fix: `src/lib/runtimeConfig.ts`, `src/lib/apiClient.ts`, `frontend-upload/.htaccess`, `frontend-upload/DEPLOYMENT-INSTRUCTIONS.txt`, rebuilt `frontend-upload/index.html`, `frontend-upload/admin.html`, and rebuilt `frontend-upload/assets/`.
- Frontend auth fix on 2026-05-19: removed public `Continue as Guest` controls and old guest-only navigation, kept Register/Login as main entry flow, added password eye toggles to login/signup password fields, improved Laravel validation display for signup, and made signup banner image sizing match login banner behavior. No backend/database/Laravel route changes made.
- Signup API for public frontend remains `POST https://www.api.foodonlines.com/api/v1/auth/register` with JSON payload keys `account_type`, `email`, `first_name`, `last_name`, `contact_number`, `line_id`, `company_name`, `password`, and `registered_from`. Upload ZIP for this fix is `foodonlines-frontend-auth-fix.zip`. Build command used: `cmd /c npm run build`.
- Mobile signup fix on 2026-05-19: public registration now sends Laravel-compatible JSON with `password_confirmation` from the confirm password field, maps `password_confirmation` validation errors back to the confirm password input, and sets mobile-safe `autoCapitalize="none"` / `autoCorrect="off"` on email, Line ID, password, and confirm password fields. Signup still uses the same responsive `SignupFlow` component and shared `finishSignup` store handler for desktop and mobile. No backend/database/admin code changes made. Upload ZIP for this fix is `foodonlines-mobile-signup-fix.zip`.
- Signup API for mobile/public frontend remains `POST https://www.api.foodonlines.com/api/v1/auth/register` with JSON payload keys `account_type`, `email`, `first_name`, `last_name`, `contact_number`, `line_id`, `company_name`, `password`, `password_confirmation`, and `registered_from`. Build command used: `cmd /c npm run build`. Direct Laravel smoke test returned `201 Registration completed successfully`; duplicate email returned `422` with `The email has already been taken.`.
- Signup regression fix on 2026-05-20: restored the last known working public registration payload by removing `password_confirmation` from the request body while keeping the shared desktop/mobile `finishSignup` flow, mobile autocapitalization/autocorrection guards, password eye toggles, and no-guest flow. API error handling now reads text/HTML responses and shows `Request failed (status): message` instead of masking server failures with the generic registration error. Current live curl to `POST https://www.api.foodonlines.com/api/v1/auth/register` returns backend `500` with `Composer dependencies require a PHP version ">= 8.2.0"`, so frontend build is ready but signup success depends on API host PHP/runtime. Upload ZIP for this fix is `foodonlines-signup-regression-fix.zip`.
- Signup API for restored public frontend is `POST https://www.api.foodonlines.com/api/v1/auth/register` with JSON payload keys `account_type`, `email`, `first_name`, `last_name`, `contact_number`, `line_id`, `company_name`, `password`, and `registered_from`. Build command used: `cmd /c npm run build`.
- Page navigation scroll fix on 2026-05-20: public app now scrolls to the top whenever the SPA `siteView` changes between home, signup, and login, so users do not land mid-page after navigating from a scrolled page. No backend/admin/database changes made. Upload ZIP for this fix is `foodonlines-scroll-top-fix.zip`.
- White page deployment fix on 2026-05-20: live `/app/` loaded `index.html`, but `/app/assets/*` requests returned `index.html` as `text/html`, proving the deployed `assets/` folder was missing or not extracted. The frontend `.htaccess` is now scoped to `RewriteBase /app/` and leaves `assets/` requests alone so missing assets are not masked by SPA fallback. Upload ZIP for this fix is `foodonlines-white-page-fix.zip` and must be extracted so `/public_html/app/assets/main-*.js` exists.
- Homepage grocery UI redesign on 2026-05-23: kept existing public routes and auth flows, but rebuilt homepage/frontpage to feel closer to Yamibuy/Blinkit grocery ecommerce. New desktop-first home flow is fixed two-row header with ZIP selector + language dropdown, shortcut icon row under header, refreshed hero, redesigned category image grid, Memorial Day promo banner, and reusable multi-section product carousel system across 19 grocery categories.
- Homepage files changed for 2026-05-23 redesign: `src/App.tsx`, `src/components/Header.tsx`, `src/components/HeroSlider.tsx`, `src/components/ShortcutRow.tsx`, `src/components/CategoryStrip.tsx`, `src/components/DealsGrid.tsx`, `src/components/ProductCard.tsx`, `src/components/ProductCarousel.tsx`, `src/components/MockIcon.tsx`, `src/data/home.ts`, `src/styles.css`, `index.html`, `admin.html`, and `public/favicon.svg`.
- ZIP slide panel behavior: header left location chip shows current mock ZIP, opens right-side slide-in panel with dimmed backdrop, closes on X or outside click, locks body scroll while open, and saves frontend-only ZIP value with no backend validation.
- Language dropdown behavior: header right globe trigger opens compact card with radio-style options for English, Thai, Chinese, Russian, Ukrainian, Arabic, Japanese, and Korean; selected option updates visible header label; outside click closes dropdown; Arabic option renders with RTL direction.
- Icon shortcut row changes: new horizontally scrollable ecommerce icon row sits below fixed header and above hero, uses small centered labels, thin divider, and anchor links into category/product sections.
- Category grid changes: `Browse all categories` now uses rounded square image tiles with soft backgrounds, centered labels, and 20 grocery categories including Paan Corner, Dairy/Bread/Eggs, Fruits/Vegetables, and Pet Care.
- Promotional banner changes: added responsive yellow/orange Memorial Day banner below categories with three mock product visuals, centered sale messaging, and black `Shop Now` CTA.
- Product carousel system: replaced old featured deals grid with reusable Blinkit-style horizontal carousel sections for 19 homepage categories, each with 15 mock items, delivery badge, name, size, price, green outlined `ADD` button, and desktop arrow controls.
- Typography updates: homepage product cards and shortcut/category labels now use tighter ecommerce sizing with `Inter`, `Nunito Sans`, `Poppins`, and system fallbacks; product titles clamp to two lines; category shortcut labels stay around 13px to 14px with medium weight.
- Reusable components created for 2026-05-23: `ProductCard`, `ProductCarousel`, `ShortcutRow`, and `MockIcon`. Homepage mock data source and placeholder art generation now live in `src/data/home.ts` so backend API data can replace it later.
- Favicon update: added lightweight temporary `public/favicon.svg` and linked it in both `index.html` and `admin.html`.
- Build/test commands used for 2026-05-23 redesign: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 homepage redesign: `59eae19`
- Next recommended improvements after 2026-05-23 redesign: wire ZIP and language state into real API/session storage, lazy-fetch carousel data from backend endpoints, replace SVG mock product art with optimized WebP catalog assets, and add keyboard focus trapping inside slide panel for stronger accessibility.
- Header/menu spacing fix on 2026-05-23: homepage header layout was tightened to match reference ordering without redesigning product rows or backend flows. Desktop header now places logo first, delivery ZIP pill second, then menu links `Home`, `Recipe`, `Coupon`, `Products`, `Healthy Product`, `Wholesale Products`, and `Deal-of-the-week`; right side now places `Register / Sign in`, language, then cart.
- Header files changed for 2026-05-23 spacing fix: `src/components/Header.tsx`, `src/data/home.ts`, `src/components/ShortcutRow.tsx`, and `src/App.tsx`.
- Header menu links updated: removed previous `Categories / Best deals / Company` desktop order and replaced it with `Home / Recipe / Coupon / Products / Healthy Product / Wholesale Products / Deal-of-the-week`, including a small products chevron and green emphasis on `Home` and `Wholesale Products`.
- Location button placement update: delivery ZIP pill stays inside main header row beside FoodOnlines logo and before `Home`, using compact rounded white pill styling, light gray border, pin icon, `DELIVER TO` label, and ZIP `91789`.
- Language button placement update: language selector moved into desktop right-side control group after `Register / Sign in` and before cart, preserving existing dropdown selection behavior.
- Cart button added: new rounded white pill cart button with basket icon now sits to the right of language in the desktop header and inside the mobile menu action row.
- Category row spacing fix: increased homepage top padding and added extra top/bottom spacing around `ShortcutRow` so shortcut/category strip no longer overlaps fixed header and now sits with clearer separation from hero/banner area across desktop, tablet, and mobile.
- Build/test commands used for 2026-05-23 header/menu fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 header/menu fix: `dfa2322`
- Footer redesign on 2026-05-23: homepage footer now matches reference-style column layout with larger FoodOnlines logo block on left, delivery tagline, Bangkok office/contact rows, and full text link columns.
- Footer files changed for 2026-05-23 redesign: `src/components/Footer.tsx` and `src/data/home.ts`.
- Footer content update: replaced old compact two-row footer links with structured footer data for `Become Our Distributor`, `Apply Credit`, `Privacy Policy`, `Terms & Conditions`, `About Us`, `Contact Us`, `Complaint`, `Careers`, `Sitmap`, `Sign In`, `View Cart`, `My Wishlist`, `Track My Order`, `Help Ticket`, `Shipping Details`, `Compare products`, `Become a Vendor`, `Affiliate Program`, `Farm Business`, `Farm Careers`, `Our Suppliers`, `Accessibility`, and `Promotions`.
- Footer contact block update: added left-side description `We bring Grocery to your door for less` plus icon rows for Bangkok office, phone, email, and business hours as shown in reference.
- Build/test commands used for 2026-05-23 footer redesign: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 footer redesign: `5154615`
- Header/category spacing tune on 2026-05-23: tightened vertical spacing only around fixed header, shortcut/category icon row, and splash hero so those three bands sit closer together without overlap on desktop, tablet, or mobile.
- Files changed for 2026-05-23 spacing/cart fix: `src/App.tsx`, `src/components/Header.tsx`, `src/components/ShortcutRow.tsx`, and `src/components/HeroSlider.tsx`.
- Header/category spacing fix details: reduced homepage top offset below fixed header, reduced `ShortcutRow` top/bottom padding, trimmed hero top/bottom content padding, and pulled hero copy slightly upward so blank space between header, category icon row, and splash video is smaller while keeping clean separation.
- Cart icon change on 2026-05-23: replaced previous basket icon with real shopping cart icon with wheels in desktop cart pill and mobile cart action button.
- Build/test commands used for 2026-05-23 spacing/cart fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 spacing/cart fix: `c831e6c`
- Promotional coupon UI added on 2026-05-23: homepage now includes reusable sticky bottom-center promo bar plus responsive promo modal flow modeled after Yamibuy-style coupon UX. Promo stays visible while scrolling until dismissed.
- Promo files changed for 2026-05-23: `src/App.tsx`, `src/components/PromoExperience.tsx`, `src/components/PromoStickyBar.tsx`, `src/components/PromoModalDesktop.tsx`, `src/components/PromoModalMobile.tsx`, and `src/lib/promoStorage.ts`.
- Promo bar component added: floating bottom-center sticky promo CTA shows `Use code: WELCOME for 10% off!` with coupon visual block and `Copy Code` prompt. Bar uses semi-transparent dark surface, blur, strong shadow, and fixed z-index above homepage content.
- Desktop promo modal behavior: clicking sticky promo bar opens centered overlay modal with dimmed backdrop, pink hero art area, `10% Off` focus, `WELCOME` code messaging, benefits list, copy CTA, and close `X`. Backdrop click closes modal only; `X` performs full dismissal.
- Mobile promo modal behavior: on mobile the same click opens bottom-sheet style promo card with stacked content, dimmed overlay, mobile CTA buttons `Copy Code` and `Later`, plus close `X` for full dismissal.
- Dismiss/localStorage behavior: closing promo with `X` sets persistent frontend dismissal key in localStorage via `src/lib/promoStorage.ts`, hides sticky bar + modal immediately, and keeps promo hidden after refresh until storage key is cleared manually.
- Build/test commands used for 2026-05-23 promo UI: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 promo UI: `9f786a4`
- Promo modal centering tune on 2026-05-23: desktop promo popup was reduced in size and centered more precisely after feedback that it was too large, too high, and too far left.
- Promo centering files changed for 2026-05-23: `src/components/PromoExperience.tsx` and `src/components/PromoModalDesktop.tsx`.
- Promo centering fix details: desktop modal max width reduced from the first version, desktop hero art and copy spacing tightened, and overlay wrapper now forces horizontal center alignment so popup opens visually centered in viewport.
- Build/test commands used for 2026-05-23 promo centering tune: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 promo centering tune: `9360f17`
- Promo bar contrast tune on 2026-05-23: sticky bottom promo bar surface was darkened further so text stays readable over white homepage sections during scroll.
- Promo bar contrast files changed for 2026-05-23: `src/components/PromoStickyBar.tsx`.
- Promo bar contrast fix details: increased dark background opacity, switched to darker neutral gradient, strengthened shadow/border, and slightly raised supporting label/copy underline contrast.
- Build/test commands used for 2026-05-23 promo bar contrast tune: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 promo bar contrast tune: `95a8f71`
- Promo modal size/CTA simplification on 2026-05-23: popup was reduced again, centered on all device sizes, and changed to one main `Copy Code` CTA button only.
- Promo resize files changed for 2026-05-23: `src/components/PromoModalDesktop.tsx`, `src/components/PromoModalMobile.tsx`, and `src/components/PromoExperience.tsx`.
- Promo resize fix details: desktop modal width reduced further, mobile modal converted to smaller centered card, overlay now centers modal on desktop/tablet/mobile, and extra secondary buttons were removed so only one copy CTA remains in each modal.
- Build/test commands used for 2026-05-23 promo resize/CTA fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 promo resize/CTA fix: `90ad5e4`
- Header/hero/category cleanup on 2026-05-24: top header location pill was simplified visually, `Register / Sign in` was reduced to text-style action with icon and no filled button shell, extra hero marketing copy was removed, and home category tiles were resized into a tighter 5-across mobile-first layout inspired by Yami-style compact browsing.
- Files changed for 2026-05-24 cleanup: `src/components/Header.tsx`, `src/components/HeroSlider.tsx`, and `src/components/CategoryStrip.tsx`.
- Header cleanup details: kept location control as icon + text pill, removed extra shadow weight, and changed `Register / Sign in` visible header treatment from pill button to plain text-with-icon action.
- Hero cleanup details: removed `Grocery storefront mockup` label and removed public-facing subtitle `Blinkit-style rows, Yamibuy-inspired shortcuts, and clean desktop-first browsing made ready for API wiring later.` while preserving signed-in state text and CTA buttons.
- Category grid cleanup details: `Browse all categories` cards now render as compact 5-column layout on small/mobile widths with smaller inner cards, smaller labels, and reduced icon tile sizing so more boxes fit per row like Yami mobile browsing.
- Build/test commands used for 2026-05-24 cleanup: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-24 cleanup: `5670d48`
- Location text-style tweak on 2026-05-24: top header location control was simplified again from stacked pill copy to cleaner icon + single-line ZIP text treatment closer to the latest reference.
- Location tweak files changed for 2026-05-24: `src/components/Header.tsx`.
- Location tweak details: removed `DELIVER TO` stacked label from visible header control, removed pill shell treatment from visible desktop/mobile trigger, and kept the ZIP change modal behavior intact behind the simpler clickable icon/text row.
- Build/test commands used for 2026-05-24 location tweak: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-24 location tweak: `b7048db`
- Header/search layout update on 2026-05-24: homepage header now uses a modern two-row ecommerce layout with top logo/location/navigation/account/language/cart controls and a large centered search bar underneath.
- Header/search files changed for 2026-05-24: `src/components/Header.tsx`, `src/components/ShortcutRow.tsx`, and `src/App.tsx`.
- Desktop search bar added: row two contains a wide rounded search form with search icon, placeholder `Search groceries, snacks, drinks and more`, no camera icon, and dark search button. Submit now routes into the shared public product search results view and does not call backend API.
- Mobile search bar added: mobile keeps top row controls visible and places the large rounded search form directly below, with icon submit treatment for small widths.
- Location/logo/menu placement update: logo and ZIP button stay in the top header area, desktop nav remains in the top row with compact spacing, and search owns the second row.
- Mobile hamburger placement update: mobile top row order is logo, ZIP, optional language on wider mobile/tablet, cart, then hamburger; ZIP and cart stay outside hamburger.
- Cart icon confirmation: desktop and mobile cart controls keep the wheeled shopping cart icon.
- Category row spacing update: main homepage top padding and shortcut row vertical padding were retuned so the category row sits below the new fixed header/search without overlap or excess gap before hero.
- Build/test commands used for 2026-05-24 header/search layout: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-24 header/search layout: `54e1d5a`
- Header hamburger/login update on 2026-05-24: removed `Register / Sign in` and orange register actions from the mobile hamburger menu so the hamburger only contains nav links plus small-screen language controls.
- Header login CTA files changed for 2026-05-24: `src/components/Header.tsx`.
- Login/register CTA update: visible guest auth action now says `Login / Register`, uses the existing `#login` public login view through `openLogin`, and remains styled as the orange CTA on desktop plus wider mobile/tablet when space allows.
- Build/test commands used for 2026-05-24 header login CTA update: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-24 header login CTA update: `cc57408`
- Splash hero Join Now CTA update on 2026-05-24: replaced the separate hero `Register` and `Login` buttons with one centered orange `Join Now` button anchored in the lower area of the splash hero while staying inside the hero section.
- Splash hero Join Now files changed: `src/components/HeroSlider.tsx`.
- Join Now behavior: button uses the existing public login flow through `openLogin`; no new route, backend auth logic, or signup flow changes were added.
- Build/test commands used for 2026-05-24 splash Join Now update: `cmd /c npx tsc --noEmit` and `cmd /c npx vite build --emptyOutDir false`. Full `cmd /c npm run build` reached Vite but Windows returned `EPERM` while emptying existing `dist/assets`.
- Header auth correction on 2026-05-24: reversed the prior orange CTA header treatment so guest `Login / Register` is plain text in the visible header and also appears as a normal text item inside the mobile hamburger menu.
- Header auth correction files changed: `src/components/Header.tsx`.
- Header auth correction behavior: both visible header and hamburger `Login / Register` links use existing `#login` / `openLogin`; no new route or backend auth logic was added. ZIP/location and cart remain outside hamburger.
- Build/test commands used for 2026-05-24 header auth correction: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-24 header auth correction: `092b335`
- Documentation follow-up on 2026-05-24: confirmed there is no `designer.md` file in this repo; `design.md` remains the active design notes source per repo rules. Header auth correction is documented in both `AGENT.md` and `design.md`.
- Chrome/in-app header scroll fix on 2026-05-24: changed the public header from translucent fixed/backdrop-blur positioning to solid white sticky positioning so it remains visible while scrolling in Chrome, Telegram/in-app browsers, and other Chromium surfaces.
- Header scroll fix files changed: `src/App.tsx`, `src/components/Header.tsx`, `src/components/LoginFlow.tsx`, `src/components/SignupFlow.tsx`, and `src/styles.css`.
- Header scroll fix behavior: removed the manual homepage top spacer because sticky header now participates in layout, reduced signup/login top padding that only existed for the old fixed header, raised header/language/ZIP panel z-index layers, and added horizontal overflow guards on `html` and `body`.
- Build/test commands used for 2026-05-24 Chrome/in-app header scroll fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Cross-browser fixed header follow-up on 2026-05-24: final requirement is that Chrome, Safari, iOS, Android, Telegram/in-app browsers, and other browser surfaces show the same always-visible header and search bar while scrolling.
- Cross-browser header behavior: header/search is solid white fixed positioning again, but without translucent backdrop blur; homepage, login, and signup content now reserve explicit top space, and anchor/scroll targets use `scroll-padding-top` plus `scroll-margin-top` so sections do not clip behind the fixed header/search.
- Build/test commands used for 2026-05-24 cross-browser fixed header follow-up: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Footer product row removal on 2026-05-24: removed the `Popular` footer column and its product links (`Milk & Flavoured Milk`, `Butter and Margarine`, `Eggs Substitutes`, `Marmalades`, `Sour Cream and Dips`, `Tea & Kombucha`, `Cheese`) from the public footer.
- Footer product row removal files changed: `src/data/home.ts` and `src/components/Footer.tsx`; desktop footer grid now uses logo/contact plus `Company`, `Account`, and `Corporate` columns.
- Homepage category real-image update on 2026-05-24: replaced generated placeholder letter category images with real optimized category assets sourced from `D:\Foodonline desktop version\site video and content\category image`.
- Category image update files changed: `src/data/home.ts`, `src/components/CategoryStrip.tsx`, and optimized files in `public/assets/categories/*.jpg`.
- Category image matching decisions: Paan Corner -> `counteres.png` closest available; Dairy/Bread/Eggs -> `bread.png`; Fruits/Vegetables -> `Fruits and vegetable.png`; Cold Drinks/Juices -> `cold drinks and juice.png`; Snacks/Munchies -> `bakery and biscuit.png` closest available fallback; Breakfast/Instant Food -> `breakfast food.png`; Sweet Tooth -> `sweet tooth.png`; Bakery/Biscuits -> `bakery and biscuit.png`; Tea/Coffee/Milk Drinks -> `tea, coffee and milk drinks.png`; Atta/Rice/Dal -> `rice.png`; Masala/Oil/More -> `masala.png`; Sauces/Spreads -> `sauces.png`; Chicken/Meat/Fish -> `chicken meat and fish.png`; Organic/Healthy Living -> `Organic healhty living.png`; Vegan Foods -> `Organic healhty living.png` reused because no dedicated vegan category source image existed in the current optimized set; Pharma/Wellness -> `pharma.png`; Cleaning Essentials -> `cleaning.png`; Home/Office -> `home and office.png`; Personal Care -> `personal care.png`; Pet Care -> `pet care.png`.
- Category image optimization method: PowerShell/.NET `System.Drawing` resized each source image into 360x360 JPEG at quality 82 with contain-style scaling on a soft `#f7f7f4` background; output files are about 12-19 KB each. Production code references only `assets/categories/*.jpg`, never local `D:\` paths.
- Category responsive image behavior: category tile images use explicit `width`/`height`, lazy loading, square aspect ratio, and `object-contain` so desktop/tablet/mobile cards keep labels centered and avoid stretched, cropped, or clipped images.
- Build/test commands used for 2026-05-24 category image update: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-24 category image code/assets update: `15b5e7b`.
- Sauces/Spreads real product mockup update on 2026-05-26: `Sauces & Spreads` now uses a dedicated 60-image source set from `public/assets/sauces-spreads-mockups`, with the first 15 images used on the homepage rail and all 60 used on the category page without repeats.
- Sauces/Spreads mockup update files changed: `src/data/home.ts`, `design.md`, `design.json`, `AGENT.md`, and `public/assets/sauces-spreads-mockups/*`.
- Chicken/Meat/Fish real product mockup update on 2026-05-26: `Chicken, Meat & Fish` now uses a dedicated 60-image source set from `public/assets/chicken-meat-fish-mockups`, with the first 15 images used on the homepage rail and all 60 used on the category page without repeats.
- Chicken/Meat/Fish mockup update files changed: `src/data/home.ts`, `design.md`, `design.json`, `AGENT.md`, and `public/assets/chicken-meat-fish-mockups/*`.
- Organic/Healthy real product mockup update on 2026-05-26: `Organic & Healthy Living` now uses a dedicated 60-image source set from `public/assets/organic-healthy-living-mockups`, with the first 15 images used on the homepage rail and all 60 used on the category page without repeats.
- Organic/Healthy mockup update files changed: `src/data/home.ts`, `design.md`, `design.json`, `AGENT.md`, and `public/assets/organic-healthy-living-mockups/*`.
- Vegan Foods rename on 2026-05-26: replaced `Baby Care` with `Vegan Foods` across homepage/category shared data, swapped the category products to vegan grocery items, reused the organic category tile art, and preserved `#category/baby-care` as a route alias so older public links still open the renamed category page.
- Vegan Foods real product mockup update on 2026-05-26: `Vegan Foods` now uses a dedicated 60-image source set from `public/assets/vegan-foods-mockups`, with the first 15 images used on the homepage rail and all 60 used on the category page without repeats. Category tile art still reuses the organic optimized image because no separate vegan category tile source was added in this pass.
- Vegan Foods update files changed: `src/data/home.ts`, `design.md`, `design.json`, `AGENT.md`, and `public/assets/vegan-foods-mockups/*`.
- Frozen real product mockup update on 2026-05-26: `Frozen` now uses a dedicated 60-image source set from `public/assets/frozen-mockups`, with the first 15 images used on the homepage rail and all 60 used on the category page without repeats.
- Frozen mockup update files changed: `src/data/home.ts`, `design.md`, `design.json`, `AGENT.md`, and `public/assets/frozen-mockups/*`.
- ProductCard mockup rendering follow-up on 2026-05-26: replaced the old hardcoded expanded-image allowlist with a generic `/assets/*-mockups/` path check so newly added real product categories keep visible packshot sizing on listing grids without extra per-category UI patches.
- ProductCard mockup rendering follow-up files changed: `src/components/ProductCard.tsx`, `design.md`, and `AGENT.md`.
- Category double-box cleanup on 2026-05-24: removed nested inner image wrappers from homepage category tiles so each category uses one main rounded card with the real optimized image and label only. No header, product carousel, promo, footer, backend, or category names changed.
- Category double-box cleanup files changed: `src/components/CategoryStrip.tsx`.
- Desktop header nav clipping fix on 2026-05-24: widened desktop header inner container from `max-w-7xl` to `max-w-[1480px]`, tightened desktop nav/control gaps, and made nav links `shrink-0` so labels such as `Wholesale Products` do not truncate on desktop. Header/search behavior and mobile order remain unchanged.
- Desktop header nav clipping fix files changed: `src/components/Header.tsx`.
- Desktop product detail build on 2026-05-24: added backend-ready product detail experience to public site using hash-safe route `#product/:productId`, so GitHub Pages refreshes do not break. Desktop top area is two columns with gallery left and sticky purchase/shipping panel right; tablet narrows cleanly; mobile stacks gallery, product info, shipping, tabs, similar items, and reviews.
- Product detail files changed for 2026-05-24: `src/App.tsx`, `src/components/Header.tsx`, `src/components/ProductCard.tsx`, `src/components/ProductDetailPage.tsx`, `src/components/CartQuantityControl.tsx`, `src/data/home.ts`, `src/store/homeStore.ts`, `AGENT.md`, `design.md`, and new root `design.json`.
- Product routing behavior: homepage and similar-item product cards now open shared detail page through `useHomeStore.openProduct(productId)`, app syncs the current view from `window.location.hash` on load/hashchange, and detail refreshes stay safe through `#product/<id>` instead of history-path routing.
- Product data/model behavior: `src/data/home.ts` now stores backend-ready catalog fields including `imageUrls`, numeric `price`, `oldPrice`, `discountPercent`, `unitPrice`, `soldCount`, `categoryId`, `tags`, `badges`, `provider`, `country`, `countryOfOrigin`, `brandOrigin`, `netContent`, `ingredients`, `storageInstructions`, `sku`, `recipeSuggestions`, `nutritionFacts`, `returnPolicy`, `reviews`, `reviewTags`, `ratingBreakdown`, and `variants`. Helpers are `getProductById()` and `getRelatedProducts()`.
- Cart/favorite/location state behavior: `src/store/homeStore.ts` now owns `selectedProductId`, `cartQuantities`, `favoriteProductIds`, and shared `selectedZipCode`. Reusable quantity control lives in `src/components/CartQuantityControl.tsx`, changing from `Add to cart` into trash/minus-count-plus after quantity becomes positive. Header ZIP modal now writes to shared store so header and product shipping card stay aligned.
- Product detail UI behavior: `src/components/ProductDetailPage.tsx` includes responsive image carousel with arrows, thumbnails, and mobile dots; title/price/old price/discount/unit price/sold count/provider; variant selector; save heart; share action; shipping/address card; horizontal detail tabs for Product Details, Recipe, Nutrition Facts, and Return Policy; category-aware Similar Items row; review summary; and responsive See All reviews modal/bottom-sheet with All/Purchased/Photos filters plus toggleable Most Recent sort.
- Responsive behavior: desktop uses wide top grid with sticky right panel, desktop-mobile browser widths collapse without clipping, tablet keeps two columns when room allows and otherwise stacks, and mobile uses touch-sized vertical flow with wrapped text and no horizontal overflow. Product gallery images use `object-contain`; review and price rows wrap instead of truncating.
- Desktop design memory file: root `design.json` did not exist before this task. It is now used as lightweight desktop UI structure memory for product-detail routes, components, responsive rules, and data bindings.
- Build/test commands for this product-detail task: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this product-detail task: `b411971`
- Product detail/cart polish on 2026-05-24: updated product media, cart badge, and quantity-control styling to match latest Yamibuy-style references without changing backend, product sections, or routing.
- Product detail/cart polish files changed: `src/components/ProductDetailPage.tsx`, `src/components/CartQuantityControl.tsx`, `src/components/ProductCard.tsx`, `src/components/Header.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Product detail image layout update: removed boxed gallery-card framing from detail page media column. Product media now uses open full-width scroll-snap image area with large centered `object-contain` product art, no left/right arrows, and pagination dots across desktop, desktop-mobile browser width, tablet, and mobile.
- Add to Cart and quantity behavior update: product detail `Add to cart` CTA is now green, stays full-width, and switches to green quantity control with left trash at quantity 1, left minus above 1, centered count, and right plus. Compact homepage quantity controls use the same shared store logic and icon order.
- Cart badge count behavior: header cart icons on desktop and mobile now show live total cart quantity badge from existing `cartQuantities` store state. Badge is red with white text, stays aligned over the cart button, updates on add/remove, and hides when cart is empty.
- Homepage product card CSS fix: compact card `Add to cart` / quantity controls now use fixed responsive pill sizing, no text wrap, proper icon centering, and stay inside product cards without overlapping image/title/price in desktop, desktop-mobile browser width, tablet, or mobile.
- Build/test commands for this product-detail/cart polish task: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this product-detail/cart polish task: `0526f37`
- Homepage product-card alignment fix on 2026-05-24: normalized carousel card width, minimum height, and internal row heights so cards align evenly across each homepage product rail.
- Product-card alignment files changed: `src/components/ProductCard.tsx`, `src/components/ProductCarousel.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Product-card width/height rules: homepage cards now use one responsive fixed-width pattern per breakpoint and one shared minimum card height, with `self-stretch` cards inside an `items-stretch` carousel row so all cards in same rail share one baseline.
- Internal alignment rules: badge row, brand row, title row, size row, unit-price row, old-price slot, and button area now reserve consistent heights. Long names are clamped, image areas stay consistent, and footer price/cart block stays pinned to the bottom.
- Add to Cart / quantity alignment behavior: compact green button and active quantity control keep same reserved bottom action zone, so switching cart states does not change card height or push price/button alignment out of line.
- Responsive behavior for this alignment fix: desktop, desktop-mobile browser width, tablet, and mobile all keep smooth horizontal carousel scroll, even card heights per row, no clipped controls, and no overflow from title or cart controls.
- Build/test commands for this product-card alignment task: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this product-card alignment task: `acf0fc5`
- Homepage product-card height trim on 2026-05-24: reduced the reserved vertical space inside carousel cards after feedback that the aligned cards became too tall. Kept equal-width/equal-baseline behavior, but tightened badge, brand, title, size, unit-price, and footer row budgets.
- Product-card height trim files changed: `src/components/ProductCard.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Product-card height rules update: card minimum heights are now shorter across breakpoints, title block is back to 2-line clamp, and bottom action zone remains aligned without excess empty space.
- Build/test commands for this product-card height trim task: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this product-card height trim task: `4547e8f`
- Desktop-mobile cart-button placement fix on 2026-05-24: fixed narrow iOS/Chrome browser layout where homepage compact `Add to cart` and quantity controls could drift sideways beside price text. Compact product cards now use a stable full-width action row below the price block.
- Desktop-mobile cart-button placement files changed: `src/components/ProductCard.tsx`, `src/components/CartQuantityControl.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Compact cart-action rules update: homepage `Add to cart` and active quantity control now both occupy full card width inside the reserved bottom action row, so clicking cart never changes horizontal placement or causes overlap in desktop-mobile browser widths.
- Build/test commands for this desktop-mobile cart-button placement task: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this desktop-mobile cart-button placement task: `2cccb7d`
- Category listing pages on 2026-05-24: added hash-safe category routes for every homepage category using `#category/:categorySlug`, with homepage `see all` links and homepage category tiles routing into dedicated listing pages instead of generic homepage anchors.
- Category listing files changed for 2026-05-24: `src/App.tsx`, `src/components/CategoryListingPage.tsx`, `src/components/CategoryStrip.tsx`, `src/components/ProductCard.tsx`, `src/components/ProductCarousel.tsx`, `src/data/home.ts`, `src/store/homeStore.ts`, `src/styles.css`, `AGENT.md`, `design.md`, and `design.json`.
- Category route behavior: `useHomeStore` now tracks `selectedCategorySlug`, syncs `#category/<slug>` on load/hashchange, and keeps GitHub Pages refresh safe through hash routing. Category tiles below splash and carousel `see all` links call shared `openCategory(categorySlug)`.
- Category grid/list behavior: each category page renders 60 frontend-safe products (12 rows x 5 columns on desktop) by reusing category catalog products first and then cloning backend-ready variants with unique ids and slightly varied price/size/sold-count/filter metadata.
- Sorting behavior: category listing dropdown options are `Featured (default)`, `Best Selling`, `Price: Low to High`, and `Price: High to Low`. Sorting is frontend-only and updates visible grid immediately.
- Filter behavior: desktop uses left sidebar; mobile and narrow desktop-mobile browser widths use right-side drawer. Sections are collapsible and ordered as `Delivery type`, `Product type`, `Made in`, `Price`, `Price Range`, `Brand`.
- Filter values added to product data: `deliveryType`, `productType`, `madeIn`, `brand`, `categorySlug`, and price-compatible listing clones. Brand options are `NestFood`, `Stouffer`, `StarKist`, `Aldi`, `Adidas`, `Costco`, `Harris`, `ISnack`, and `Burbe`.
- Price filtering behavior: price radio options are `All`, `Under $5`, `$5 - $10`, `$10 - $15`, `$15 - $25`, and `$25+`. Dual-handle price range slider spans `0` to `500`, combines with radio filtering using stricter result, and Reset restores full range.
- Responsive behavior for category pages: desktop uses `290px` filter sidebar plus 5-column product grid; tablet uses 3-column grid; mobile uses 2-column grid with filter drawer. Product cards reuse homepage design, stay equal height, keep cart controls working, and still route to product detail page.
- Build/test commands for this category-listing task: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this category-listing task: `e81ec93`
- Category listing card tightening on 2026-05-24: category-page grid cards were shortened and visually tightened after feedback that listing boxes felt too long. This change is grid-only and does not change homepage carousel card height.
- Compact listing-card behavior: category grid uses shorter card min-height, square image block, tighter brand/title/size spacing, inline price row, and floating listing cart control over the image. Quantity state stays compact in the same overlay footprint to avoid adding extra card height.
- Git commit hash for this category-listing card tightening task: `8a9869c`
- Category listing sort/filter control resize on 2026-05-24: narrow desktop-mobile and mobile category pages no longer use large stacked bordered `Filters` and sort controls. They now use smaller inline text-button controls with icons, closer to Yami-style compact browsing.
- Git commit hash for this category-listing control resize task: `d9b0d6f`
- Cart and checkout pages on 2026-05-24: added hash-safe `#cart` and `#checkout` storefront routes, with header cart buttons routing into the cart page instead of scrolling to homepage sections.
- Cart/checkout files changed for 2026-05-24: `src/App.tsx`, `src/components/AccountSummary.tsx`, `src/components/CartPage.tsx`, `src/components/CheckoutPage.tsx`, `src/components/Header.tsx`, `src/store/homeStore.ts`, `src/store/publicAuthStore.ts`, `AGENT.md`, `design.md`, and `design.json`.
- Cart state behavior: `useHomeStore` now tracks `savedForLaterIds` and `selectedCartIds` alongside `cartQuantities`. Adding to cart auto-selects active items, remove deletes active quantity and selection, save-for-later moves item out of active cart into saved list, and move-back restores saved items into active cart.
- Cart page behavior: active cart items render in responsive left-column list with item checkbox, select-all checkbox, product image/name/specification, current price, old price, quantity selector, remove action, save-for-later action, gifting row, and free-shipping progress card. Empty cart shows `Start Shopping`; saved items can still be moved back from the saved section.
- Free-shipping behavior: frontend threshold is `$49`. Progress bar uses selected cart subtotal only. Before threshold message is `Add $X.XX for FREE Shipping`; at threshold message is `You've got FREE Shipping` and shipping summary becomes `FREE`. `Add More` routes back to homepage browsing.
- Checkout summary behavior: summary panel uses selected items only for subtotal, item count, shipping, and estimated total. If no items are selected, checkout CTA is disabled and instructs the user to select items first.
- Payment and guarantee behavior: Service Guarantee area now uses standalone payment provider logos with no bordered tiles and green guarantee list items `Global & Secure Payments`, `Privacy Protection`, `FoodOnlines.com Purchase Protection`, and `Speedy Delivery`. No Yami/Yamibuy wording remains in cart guarantee copy.
- Checkout auth behavior: green `Proceed to Checkout` button opens centered responsive checkout sign-in modal when user is logged out. Modal collects email or phone first, then password. Email uses existing live login store path; phone number uses safe frontend mock session fallback, then routes user to `#checkout`.
- Account behavior update: the earlier homepage `AccountSummary` panel has since been removed; signed-in identity now belongs only in the header account control and the dedicated `#account` page.
- Checkout page placeholder behavior: `#checkout` shows responsive shipping-address placeholder, payment-method placeholder, and selected cart summary. It is frontend-only and safe for later API/payment integration.
- Responsive behavior for cart task: desktop uses two-column cart + sticky summary, desktop-mobile and tablet collapse summary under items cleanly, mobile keeps vertical items and sticky bottom checkout bar, payment logos wrap cleanly, and modal fits without horizontal overflow.
- Build/test commands for this cart/checkout task: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this cart/checkout task: `cb28715`
- Cart visual polish on 2026-05-24: replaced missing/weak payment marks with visible branded payment logo tiles, changed cart row quantity selector from native dropdown to compact green plus/minus pill, and compressed the desktop free-shipping strip into a slimmer single-row treatment with no nested progress box.
- Git commit hash for this cart visual polish task: `14620aa`
- Category listing sort fix on 2026-05-24: category sort now always applies after filtering and reorders the visible grid correctly for `Featured (default)`, `Best Selling`, `Price: Low to High`, and `Price: High to Low` on desktop, desktop-mobile browser widths, tablet, and mobile.
- Category listing sort fix files changed: `src/components/CategoryListingPage.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Category listing sort behavior update: product count and product grid now both read from the same sorted result set, and the grid remount key follows category/sort/filter state so price-order changes are visible immediately across all category pages.
- Build/test commands for this category listing sort fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this category listing sort fix: `18477a6`
- Cart payment-logo size trim on 2026-05-24: reduced Service Guarantee payment logo tile height, width, logo font scale, and inter-logo spacing so the payment row uses less space on desktop, desktop-mobile browser widths, tablet, mobile, iOS, and Chrome.
- Cart payment-logo size trim files changed: `src/components/CartPage.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Cart payment-logo responsive behavior: logos now keep a smaller shared footprint with tight wrapping and no stretched marks across all breakpoints while preserving the current branded icon set.
- Build/test commands for this cart payment-logo trim: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this cart payment-logo trim: `23699a1`
- Category listing badge cleanup on 2026-05-24: removed only the green delivery-time banner from category product-grid cards across all category pages. The red percentage-off badge stays in the same badge row position on desktop, desktop-mobile browser widths, tablet, mobile, iOS, and Chrome.
- Category listing badge cleanup files changed: `src/components/ProductCard.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Build/test commands for this category listing badge cleanup: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this category listing badge cleanup: `3e286c4`
- Product-card badge cleanup follow-up on 2026-05-24: removed the green delivery-time badge from homepage product rails too, so product-card time banners are now gone site-wide while the red discount badge stays in place.
- Product-card badge cleanup follow-up files changed: `src/components/ProductCard.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Build/test commands for this site-wide product-card badge cleanup: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this site-wide product-card badge cleanup: `5b6dbbe`
- Product detail desktop gallery update on 2026-05-24: added desktop-only boxed thumbnail selector under the main product image for all product detail pages. Clicking any thumbnail switches the main product image. Tablet and mobile keep the lighter dot-based gallery flow.
- Product detail desktop gallery files changed: `src/components/ProductDetailPage.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Build/test commands for this desktop gallery update: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this desktop gallery update: `14fe685`
- Cart sticky-footer clipping fix on 2026-05-24: increased bottom page reserve space for the cart route whenever the mobile/desktop-mobile sticky checkout footer is active, preventing Chrome and similar browsers from covering order-summary/footer content.
- Cart sticky-footer clipping fix files changed: `src/components/CartPage.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Build/test commands for this cart sticky-footer clipping fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this cart sticky-footer clipping fix: `f3d3c78`
- Payment icon asset swap on 2026-05-25: replaced hand-built cart payment marks with real PNG payment logos copied from `D:\Foodonline desktop version\site video and content\payment icon` into `public/assets/payment-icons`.
- Payment icon asset swap files changed: `src/components/CartPage.tsx`, `public/assets/payment-icons/*.png`, `AGENT.md`, `design.md`, and `design.json`.
- Payment icon behavior: cart Service Guarantee now renders small real logos for Google Pay, PayPal, Visa, Mastercard, Discover, American Express, UnionPay, JCB, Diners Club, Secure Pay, Alipay, and Cash App. Logos are image-based, small, and responsive.
- Build/test commands for this payment icon asset swap: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this payment icon asset swap: `97ad00a`
- Dairy/bread product image assignment on 2026-05-25: copied bread mockup assets from `D:\Foodonline desktop version\site video and content\food mockup\bread` into `public/assets/dairy-bread-mockups` using stable numbered names.
- Dairy/bread image assignment files changed: `src/data/home.ts`, `public/assets/dairy-bread-mockups/*`, `AGENT.md`, `design.md`, and `design.json`.
- Dairy/bread image behavior: homepage `Dairy, Bread & Eggs` rail now uses the first 12 sorted bread-folder images for the first 12 product cards only. The dairy category listing page uses the same first 12 images, then continues with the remaining sorted folder images for later listing cards. Once the copied image pool runs out, cards fall back to the current placeholder/mock image behavior.
- Build/test commands for this dairy/bread image assignment: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this dairy/bread image assignment: `4adfeaa`
- Dairy/bread homepage image extension on 2026-05-25: extended homepage `Dairy, Bread & Eggs` rail from 12 unique bread images to 15 unique bread images, using the next 3 unused images from the same copied asset set and avoiding duplicates.
- Dairy/bread homepage image extension files changed: `src/data/home.ts`, `AGENT.md`, `design.md`, and `design.json`.
- Build/test commands for this dairy/bread homepage image extension: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this dairy/bread homepage image extension: `e101ab4`
- Category listing sort selection fix on 2026-05-25: repaired the sort dropdown click path across desktop, desktop-mobile browser view, tablet, iOS, and Chrome by removing the shared sort ref bug that was misrouting option clicks against the wrong hidden wrapper.
- Category listing sort selection fix files changed: `src/components/CategoryListingPage.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Sort behavior: `Featured (default)`, `Best Selling`, `Price: Low to High`, and `Price: High to Low` now use a shared `handleSortSelect` path and correctly update the rendered category grid after option click on every responsive sort control.
- Build/test commands for this category listing sort selection fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this category listing sort selection fix: `d95c4a6`
- Homepage category intro copy removal on 2026-05-25: removed the two descriptive helper lines above the homepage category grid, leaving only the `Browse all categories` eyebrow and the existing category tiles/promo layout.
- Homepage category intro copy removal files changed: `src/components/CategoryStrip.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Build/test commands for this homepage category intro copy removal: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this homepage category intro copy removal: `97d2a89`
- Footer account-link correction on 2026-05-25: replaced the footer `Compare products` account link text with `Recipe` to match the requested header/footer wording swap.
- Footer account-link correction files changed: `src/data/home.ts`, `AGENT.md`, `design.md`, and `design.json`.
- Build/test commands for this footer account-link correction: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this footer account-link correction: `96ffc26`
- Homepage category promo banner update on 2026-05-25: replaced the generated orange promo block beneath the homepage category grid with the supplied local banner image from `D:\Foodonline desktop version\site video and content\ChatGPT Image May 25, 2026, 01_41_59 PM.png`, copied into frontend assets for GitHub Pages.
- Homepage category promo banner update files changed: `src/components/CategoryStrip.tsx`, `src/data/home.ts`, `public/assets/home-banners/memorial-day-sale-banner.png`, `AGENT.md`, `design.md`, and `design.json`.
- Banner behavior: the homepage section now renders the provided promo banner image as one clickable rounded banner linked to the existing promo destination, while keeping the category grid and surrounding homepage layout unchanged.
- Build/test commands for this homepage category promo banner update: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this homepage category promo banner update: `1b08eef`
- Fruits & Vegetables mockup image assignment on 2026-05-25: copied 46 real product images from `D:\Foodonline desktop version\site video and content\food mockup\Fruit and vegetable` into `public/assets/fruits-vegetables-mockups`, skipping the `Screenshot_*` files and renaming the kept assets into stable numbered filenames for frontend use.
- Fruits & Vegetables image assignment files changed: `src/data/home.ts`, `public/assets/fruits-vegetables-mockups/*`, `AGENT.md`, `design.md`, and `design.json`.
- Fruits & Vegetables image behavior: homepage `Fruits & Vegetables` rail now uses the first 15 copied real images. The fruits category listing page uses those same images first and then continues through the remaining copied image pool until it runs out; any remaining listing cards keep the current placeholder/mock image behavior.
- Build/test commands for this Fruits & Vegetables image assignment: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this Fruits & Vegetables image assignment: `b3ced52`
- Dairy and Fruits & Vegetables image fill tuning on 2026-05-25: updated shared product-card media rendering so real dairy/bread and fruits/vegetables mockup assets fill their product boxes much better on homepage rails and category pages.
- Dairy and Fruits & Vegetables image fill tuning files changed: `src/components/ProductCard.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Image-fit behavior: product cards now detect real assets from `public/assets/dairy-bread-mockups` and `public/assets/fruits-vegetables-mockups` and render them with a larger `object-cover` treatment inside a clipped white media frame. Other categories keep the normal `object-contain` behavior. This change is intended to stay stable across desktop, desktop-mobile browser widths, tablet, Safari, Chrome, and mobile.
- Build/test commands for this image fill tuning: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this image fill tuning: `3dd965b`
- Cold Drinks & Juices mockup image assignment on 2026-05-25: copied 60 drink and beverage images from `D:\Foodonline desktop version\site video and content\food mockup\drinks and beverage` into `public/assets/drinks-beverage-mockups` with stable numbered filenames.
- Cold Drinks & Juices image assignment files changed: `src/data/home.ts`, `src/components/ProductCard.tsx`, `public/assets/drinks-beverage-mockups/*`, `AGENT.md`, `design.md`, and `design.json`.
- Cold Drinks & Juices image behavior: homepage `Cold Drinks & Juices` rail now uses the first 15 copied real beverage images. The `#category/cold-drinks-juices` listing uses those same images first and then continues through the copied beverage image pool until it runs out; any remaining listing cards keep the current placeholder/mock image behavior.
- Image-fit behavior update: product cards now also detect `public/assets/drinks-beverage-mockups` images and use the same expanded cover-style media treatment as the dairy/bread and fruits/vegetables real-image categories.
- Duplicate real-image cleanup on 2026-05-25: removed the exact duplicate `public/assets/fruits-vegetables-mockups/fruits-vegetables-14.avif` and updated real-image category listing overflow so Dairy/Bread/Eggs, Fruits/Vegetables, and Cold Drinks/Juices do not repeat real photos after their copied asset pools run out.
- Duplicate cleanup behavior: homepage real-image rails use unique real images only, category pages consume each copied real image once, and any extra listing boxes fall back to generated unique mock art instead of recycling dairy, fruit, or beverage images.
- Beverage image fill follow-up on 2026-05-25: rebuilt `public/assets/drinks-beverage-mockups` from the full sorted source folder after finding six PNG beverage screenshots were not copied in the first pass. The `#category/cold-drinks-juices` listing now has 60 real beverage images for 60 boxes with no exact duplicate hashes.
- Fruits & Vegetables image fill follow-up on 2026-05-25: rebuilt `public/assets/fruits-vegetables-mockups` from the newest 60 unique images in `D:\Foodonline desktop version\site video and content\food mockup\Fruit and vegetable` so `#category/fruits-vegetables` fills all 60 listing boxes with real images.
- Fruits & Vegetables follow-up behavior: the fruit/vegetable category page now references 60 deployable images with no exact duplicate hashes; homepage still uses the first 15 real images from the same updated pool.
- Snacks & Munchies mockup image assignment on 2026-05-25: copied 26 unique snack images from `D:\Foodonline desktop version\site video and content\food mockup\Snack and munchies` into `public/assets/snacks-munchies-mockups` with stable numbered filenames.
- Snacks & Munchies image behavior: homepage `Snacks & Munchies` rail now uses the first 15 copied real snack images. The `#category/snacks-munchies` listing uses all 26 copied real snack images once, then falls back to generated unique mock art for remaining listing boxes.
- Image-fit behavior update: product cards now also detect `public/assets/snacks-munchies-mockups` images and use the expanded cover-style media treatment used by other real-image categories.
- Snacks & Munchies fill follow-up on 2026-05-25: rebuilt `public/assets/snacks-munchies-mockups` from the latest 60 unique images in `D:\Foodonline desktop version\site video and content\food mockup\Snack and munchies` so `#category/snacks-munchies` fills all 60 boxes with real images.
- Homepage shortcut-strip removal on 2026-05-25: removed the icon shortcut row (`Categories`, `Snack`, `Grocery`, `Beverage`, `Beauty`, `Personal Care`, `Home`, `Electronics`, `Baby & Mom`, `Health`) from the public homepage on all devices. Home layout now starts with the splash hero directly under the fixed header, with reduced top spacing for desktop, desktop-mobile browser widths, tablet, iOS, Chrome, and mobile.
- Breakfast & Instant Food mockup image assignment on 2026-05-25: copied 60 unique images from `D:\Foodonline desktop version\site video and content\food mockup\instant food & breakfast` into `public/assets/breakfast-instant-food-mockups` with stable numbered filenames.
- Breakfast & Instant Food image behavior: homepage `Breakfast & Instant Food` rail now uses the first 15 copied real images. The `#category/breakfast-instant-food` listing uses all 60 copied real images for its 60 boxes with no fallback needed.
- Image-fit behavior update: product cards now also detect `public/assets/breakfast-instant-food-mockups` images and use the expanded cover-style media treatment used by other real-image categories.
- Sweet Tooth mockup image assignment on 2026-05-25: copied 60 unique candy images from `D:\Foodonline desktop version\site video and content\food mockup\candy` into `public/assets/sweet-tooth-mockups` with stable numbered filenames.
- Sweet Tooth image behavior: homepage `Sweet Tooth` rail now uses the first 15 copied real candy images. The `#category/sweet-tooth` listing uses all 60 copied real images for its 60 boxes with no fallback needed.
- Image-fit behavior update: product cards now also detect `public/assets/sweet-tooth-mockups` images and use the expanded cover-style media treatment used by other real-image categories.
- Sweet Tooth ordering fix on 2026-05-25: rebuilt `public/assets/sweet-tooth-mockups` so the 26 non-screenshot candy packshots appear before screenshot captures. This removes the repeated-looking candy screenshots from the homepage rail and the top of the category listing.

## Backend/Admin Notes

- Real backend target is Laravel PHP + MySQL only. Do not plan Node/NestJS/PostgreSQL/Mongo/Prisma work unless user explicitly reopens stack choice.
- Phase 1 backend foundation lives as standalone admin page entry inside current repo: `admin.html` + `src/admin-main.tsx`, with simplified mock login screen, protected dashboard shell, `Users` sidebar tab with `Customers`, `Suppliers`, and `Partners`, admin settings credential rotation screen, overview blueprint for Laravel controllers/routes/middleware/migrations/models, and mock signup request management actions.
- Admin mock security rules live in shared frontend helpers: email normalization, strict signup sanitization, generic admin login failures, suspicious password rejection, local salted hash placeholder for rotated admin password, safe React text rendering only, and no `dangerouslySetInnerHTML` / `eval`.
- Public signup submissions flow into admin mock queue through shared schema/state so new registrations appear in admin Users tables without backend network calls.
- Admin is not linked from frontend UI anymore. Access it through direct standalone URL like `/admin.html` so backend/admin stays isolated from public site UX.
- Current admin login is intentionally permissive for mock testing: any non-empty `Admin` value plus any non-empty password opens dashboard UI. This is temporary mock behavior only and must be replaced by real Laravel auth later.
- Current admin signup/user flow is instant approval. New frontend signups should enter admin list already approved, with no manual approve step.
- Admin users table now uses one dropdown action control instead of stacked buttons. Manual actions are reduced to `Move to Review` and `Delete User`.
- Laravel backend TODO for later real phase: implement server-side auth guard, `Hash::make` / `Hash::check`, CSRF-protected session routes, throttle middleware, audit logs, login logs, Eloquent models, migrations, soft deletes, and MySQL indexes for admin and signup request tables.
- Laravel backend scaffold now started in repo root with `app/Http`, `app/Models`, `app/Services`, `config/foodonlines.php`, `database/migrations`, `routes/api.php`, `.env.example`, and `deployment/tmdhosting/*`. Current machine still lacks `php`, `composer`, `artisan`, and full Laravel skeleton, so treat these files as organized module code ready to move into real Laravel project root for TMDHosting/cPanel deployment.
- First real backend endpoint target: `POST /api/v1/auth/register` with snake_case payload fields `account_type`, `email`, `first_name`, `last_name`, `contact_number`, `line_id`, `company_name`, optional `password`, optional `registered_from`.
- Backend touched for this live-auth pass: `routes/api.php`, `bootstrap/app.php`, `app/Services/Auth/RegisterUserService.php`, `app/Models/User.php`, `app/Http/Resources/Auth/RegisteredUserResource.php`, `app/Http/Resources/Admin/AdminManagedUserResource.php`, `app/Http/Controllers/Api/Admin/AdminUsersController.php`, `app/Http/Controllers/Api/Admin/AdminDashboardController.php`, plus new public auth files for login/me/logout token auth and migration `database/migrations/2026_05_19_210000_create_user_api_tokens_table.php`.
- Admin users table now reads live backend records by `GET /api/v1/admin/users?account_type=customer|supplier|partner`. Admin dashboard stats also count live backend records through the same account-type mapping.
- cPanel public frontend first-test upload target is `public_html/app/`. Use the generated `frontend-upload/.htaccess` there and do not overwrite existing backend or backend public `.htaccess`.
- Latest frontend cPanel package on 2026-05-26 is generated locally at `D:\Foodonline desktop version\foodonlines-tmdhosting-cpanel-upload.zip` from `D:\Foodonline desktop version\frontend-upload\`. Package root contents are `index.html`, `admin.html`, `favicon.svg`, `.htaccess`, `DEPLOYMENT-INSTRUCTIONS.txt`, and `assets/`.
- Packaging/build commands used for the latest cPanel package: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Public/live auth endpoints preserved in this package: `POST https://www.api.foodonlines.com/api/v1/auth/register`, `POST https://www.api.foodonlines.com/api/v1/auth/login`, `GET https://www.api.foodonlines.com/api/v1/auth/me`, `POST https://www.api.foodonlines.com/api/v1/auth/logout`, `POST https://www.api.foodonlines.com/api/v1/admin/login`, and `GET https://www.api.foodonlines.com/api/v1/admin/users?account_type=...`.
- Shared runtime API base source remains `src/lib/runtimeConfig.ts` with production default `https://www.api.foodonlines.com/api/v1`. Do not point frontend auth to the public frontend domain or localhost.
- TMDHosting upload target for the package is the live domain folder such as `/home/USERNAME/public_html/` or `/home/USERNAME/foodonlines.com/`. If deploying under `/public_html/app/`, add `RewriteBase /app/` in `.htaccess`.
- Package test URLs: `https://foodonlines.com/`, `https://foodonlines.com/admin`, `https://foodonlines.com/admin.html`, `https://foodonlines.com/#login`, `https://foodonlines.com/#signup`, and `https://www.api.foodonlines.com/api/v1/auth/me`.
- Packaging warning: the generated ZIP is intentionally kept as a local upload artifact and not pushed into Git history because `foodonlines-tmdhosting-cpanel-upload.zip` is about 216 MB, which exceeds normal GitHub single-file push limits. Keep the ZIP on disk for cPanel upload and use the committed `frontend-upload/` folder plus docs as the reproducible source.

## Account/Settings Build (2026-06-01)

- Implemented logged-in account platform flow with desktop dropdown + mobile full account route behavior.
- Files changed (frontend):
  - `src/components/AccountPage.tsx` (new full account/profile page + settings modals)
  - `src/components/Header.tsx` (desktop logged-in dropdown, mobile account routing)
  - `src/App.tsx` (new `account` view rendering)
  - `src/store/homeStore.ts` (hash-safe `#account[/section]` routing and account sections)
  - `src/components/CheckoutPage.tsx` (logged-in address sync from `/account/addresses`)
  - `src/store/adminStore.ts`, `src/components/AdminPortal.tsx`, `src/data/admin.ts` (admin delete-account request tab)
  - `src/lib/apiClient.ts` (`DELETE` method support)
  - `src/lib/addressSchema.ts` (shared dynamic country address schema + validation helpers)
- Files changed (backend):
  - `routes/api.php` (new account + admin deletion routes)
  - `app/Http/Controllers/Api/Account/AddressBookController.php`
  - `app/Http/Controllers/Api/Account/NotificationPreferenceController.php`
  - `app/Http/Controllers/Api/Account/PaymentMethodController.php`
  - `app/Http/Controllers/Api/Account/PasswordController.php` (new)
  - `app/Http/Controllers/Api/Account/AccountDeletionRequestController.php` (new)
  - `app/Http/Controllers/Api/Admin/AdminAccountDeletionRequestsController.php` (new)
  - `app/Models/User.php` plus new models:
    - `app/Models/UserAddress.php`
    - `app/Models/UserNotificationPreference.php`
    - `app/Models/UserPaymentMethod.php`
    - `app/Models/UserAccountDeletionRequest.php`
  - New migrations:
    - `database/migrations/2026_06_01_010000_create_user_addresses_table.php`
    - `database/migrations/2026_06_01_010100_create_user_notification_preferences_table.php`
    - `database/migrations/2026_06_01_010200_create_user_payment_methods_table.php`
    - `database/migrations/2026_06_01_010300_create_user_account_deletion_requests_table.php`
- Checkout/address behavior covered in this pass:
  - Logged-in checkout now pulls saved addresses from `/account/addresses`.
  - Saved account addresses can be selected in checkout after refresh/load.
  - New checkout addresses can be persisted to account when `Save this address for future orders` is enabled.
- Security direction:
  - Payment-method storage is masked metadata only (`brand`, `last4`, expiry, token reference placeholder), never raw card number/CVV.
  - Delete account uses request workflow (`pending` statuses) instead of hard deletion.
- Commands run:
  - `npm.cmd run build` (success)
  - `php -v` (failed: PHP CLI not installed on this machine)
- Deployment notes:
  - Laravel migrations + cache refresh must run on live server terminal:
    - `php artisan migrate --force`
    - `php artisan optimize:clear`
    - `php artisan config:cache`
    - `php artisan route:cache`

## Account Menu + Address Book UX Follow-up (2026-06-01)

- Context7 note for this pass: attempted to discover Context7 tools first, but this session only exposed `multi_agent_v1` tools. Continued with local codebase implementation.
- Files changed:
  - `src/components/Header.tsx`
  - `src/components/AccountPage.tsx`
  - `src/lib/addressSchema.ts`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Desktop header/account behavior updates:
  - Logged-in account trigger now shows avatar initial + username + rotating chevron.
  - Dropdown now keeps open during button-to-menu mouse movement, supports hover + click open, and closes on outside click or `Escape`.
  - Dropdown menu now includes `My orders`, `Saved items`, `Address book`, `Refer a friend`, `Coupons`, and `Settings`, each with aligned left icon and right chevron.
  - Earlier dropdown/mobile duplicate sign-out controls were later removed; current logout lives only at the bottom of the main account page.
- Mobile account behavior updates:
  - Logged-in mobile header now has a dedicated account icon button that opens full `#account` route (not a tiny dropdown).
  - Mobile menu includes `My Account` only for logged-in users; logout is kept on the main account page.
- Account page and modal UX updates:
  - Overview now uses larger touch-friendly card rows and status shortcuts with icon circles.
  - Added `Buy again`, `Address book`, and `Payment methods` rows in overview flow.
  - Modals now use higher z-index layering, overlay click close, `Escape` close, `aria-modal` dialog semantics, focus trapping, and body scroll lock while open.
  - Mobile sticky Cart/Checkout footer is now hidden whenever any account modal is open to avoid overlap.
- Address book save reliability updates:
  - Address CRUD still uses live account API when available.
  - Added localStorage fallback (`foodonlines-account-addresses-v1`) for add/edit/delete/default so address data persists after refresh even if account address API is temporarily unavailable.
  - `Add new address` remains blank-form only and keeps dynamic country field rendering/validation behavior.
- Address schema updates:
  - Added `United States` and `United Kingdom` to shared `addressSchema` country list for account/address-book forms.
- Dirty/untracked cleanup:
  - Removed stray untracked image files from `site video and content` to keep working tree and package weight clean.
- Checks run:
  - `cmd /c npx tsc --noEmit`
  - `cmd /c npm run build`

- Notifications toggle UX follow-up on 2026-06-01:
  - Updated `src/components/AccountPage.tsx` notification rows so each entire row is now a tappable `role="switch"` control.
  - Users can toggle each notification section on/off by tapping anywhere on that row, not just the small knob.
  - Existing backend persistence endpoint (`PUT /account/notification-preferences`) remains unchanged.
  - Checks rerun: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`.

## Account Mobile UX + Modal Scrolling Fix (2026-06-01)

- Context7 note for this pass: tool discovery was attempted for Context7, but no Context7 resolve/query MCP tools were exposed in this session; only unrelated multi-agent tools were returned. Continued using the existing React/Tailwind codebase patterns.
- Files changed:
  - `src/components/AccountPage.tsx`
  - `src/components/Header.tsx`
  - `src/store/homeStore.ts`
  - `index.html`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Account sign-out placement:
  - Removed duplicate `Sign out` actions from the header dropdown, mobile hamburger account submenu, and top account profile card.
  - Main `#account` overview now shows the only account logout action as a centered `Log out` row near the bottom.
- Account navigation:
  - Added Back headers for account subpages and modal-detail flows so users can return to the main account dashboard without title/back overlap.
  - Added hash-safe account section for `Language`, preserving existing `orders`, `saved`, `refer`, `coupon`, and `settings` sections.
- Order shortcut UI:
  - Reworked the account order shortcut row into five compact status controls with equal circular outline icons and labels below: Pending, Unshipped, Shipped, To Review, and Returns.
- Modal/mobile form fixes:
  - Address Book, Payment Methods, Notifications, Change Password, and Delete Account modals now use viewport-safe width, `dvh` max-height, internal scrolling, safe-area bottom padding, and sticky form action rows where long forms need reachable Save/Cancel controls.
  - My Account form inputs, selects, textareas, toggle rows, and primary modal buttons now use 16px-or-larger text sizing to avoid iOS/Android browser input zoom.
  - `index.html` viewport meta now includes `maximum-scale=1` per the requested mobile zoom behavior.
- Notifications persistence:
  - Notification toggles still use the live account preferences API when available.
  - Added localStorage fallback key `foodonlines-notification-preferences-v1` so each independent toggle immediately updates, persists after closing/reopening the modal, and survives refresh if the backend endpoint is unavailable.
- Checks for this pass:
  - `cmd /c npx tsc --noEmit`

## Header Account Dropdown My Account Link (2026-06-01)

- Files changed:
  - `src/components/Header.tsx`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Logged-in desktop account dropdown now shows `My Account` as the first row before `My orders`.
- Clicking `My Account` opens the account overview route at `#account`, matching `https://cynicalfocus123.github.io/FoodOnline-Desktop-/#account`.

## Account Scroll Position Fix (2026-06-02)

- Files changed:
  - `src/components/AccountPage.tsx`
  - `AGENT.md`
  - `design.md`
- Removed the `foodonlines.com` pill under the main account `Log out` action.
- Account section changes now scroll the account panel back into view so mobile/desktop users do not land at the bottom of the page after opening My Account, Settings, Orders, Saved items, Coupons, Refer, About, or Language.

## Homepage Account Summary Removal (2026-06-02)

- Files changed:
  - `src/App.tsx`
  - removed `src/components/AccountSummary.tsx`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Removed the signed-in account summary block from the homepage. Logged-in users now remain on the normal storefront homepage, with account identity shown only in the header account control/dropdown.
- Removed the extra homepage logout button that lived inside the old account summary panel.

## Promo Modal Viewport Centering Fix (2026-06-02)

- Files changed:
  - `src/components/PromoExperience.tsx`
  - `src/components/PromoModalDesktop.tsx`
  - `src/components/PromoModalMobile.tsx`
  - `src/components/PromoStickyBar.tsx`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Welcome promo overlay now uses `z-[1800]` so the fixed header/search cannot cover or crop the modal on desktop, desktop-mobile, iOS Safari, Android Chrome, or tablet.
- Promo overlay now has its own vertical scroll container with safe-area top/bottom padding and centers the modal inside the available viewport.
- Desktop and mobile promo cards now use viewport-safe `max-height` plus internal scrolling so the top art, code copy, benefits, and Copy Code button stay reachable on short screens.
- Sticky promo bar bottom offset now includes `env(safe-area-inset-bottom)` so mobile browser chrome does not cut it off.

## Account Menu Row Removal + Scroll Centering (2026-06-02)

- Files changed:
  - `src/components/AccountPage.tsx`
  - `src/store/homeStore.ts`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Removed `About FoodOnlines` and account `ID` rows from the main My Account page.
- Removed the hidden `about` account route from the account section type/hash parser so users cannot land on an unused account subpage.
- Account page row clicks now route through a shared helper that scrolls the account panel into the center of the viewport after section changes, covering Orders, Saved items, Buy again, Coupons, Refer a friend, Settings, Language, and Back navigation on mobile, desktop-mobile, tablet, Safari, Chrome, iOS, and Android.

## Account Logout + Checkout CTA Scroll Fix (2026-06-02)

- Files changed:
  - `src/components/AccountPage.tsx`
  - `src/components/CheckoutPage.tsx`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Main My Account `Log out` now signs out and opens the centered login/register flow instead of leaving the user at the bottom of the account page.
- Checkout address save now restores the delivery-address section into view after `Use this address`, so users remain near the address area they were editing instead of being dropped near the totals.
- Removed the duplicate static pricing-summary Place Order button. Checkout now keeps a single fixed safe-area-aware bottom order-total/Place Order bar across desktop, tablet, desktop-mobile, iOS Safari, Android Chrome, and narrow responsive views.
- Checks run: `cmd /c npx tsc --noEmit`, `git diff --check`, and `cmd /c npm run build`.
- Deployment note: no backend routes, database migrations, auth endpoints, or payment provider code changed in this pass.

## Cart Static Checkout Button Removal (2026-06-02)

- Files changed:
  - `src/components/CartPage.tsx`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Removed the static `Proceed to Checkout` button from the cart order-summary/service-guarantee card.
- Cart now uses only the fixed bottom footer checkout bar while scrolling, across desktop, tablet, desktop-mobile, iOS Safari, Android Chrome, Safari desktop, and Chrome desktop.

## Driver Landing Page (2026-06-02)

- Context7 note for this pass: Context7 MCP discovery was attempted with `tool_search`, but no Context7 resolve/query tools were exposed in this session. Continued with local React/Vite/Tailwind patterns and the provided driver-page design files as the source of truth.
- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `src/data/driverLanding.ts`
  - `src/store/homeStore.ts`
  - `src/App.tsx`
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Added the FoodOnlines driver recruitment landing page at `/company/drivers`, with hash fallback `#company/drivers` for SPA-safe navigation.
- Driver page follows `pages/driver page/foodonlines-drivers-design.md` and `.json`: FoodOnlines orange/green branding, hero, driver path cards, value/stat section, Flex section, How Flex Works section, success cards, grouped-delivery timeline, eligibility accordion, apply CTA, Fleet section, more-info accordion, and final positions CTA.
- Motion implemented with CSS and IntersectionObserver: hero fade-up, scroll reveal, button hover motion, accordion open/close with chevron rotation, count-up stats, timeline progress, active timeline steps, crossfading timeline images, and reduced-motion support.
- Driver images resolve from `/images/drivers/`; if owned image files are missing, the UI renders FoodOnlines orange/green placeholder blocks instead of broken images.
- Existing site header and footer were left unchanged per latest instruction; the driver-specific navigation and CTAs live inside the driver page body only.

## Driver Footer Link Correction (2026-06-02)

- Files changed:
  - `src/components/Footer.tsx`
  - `src/data/home.ts`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Updated the existing shared footer item from `Farm Business` to `Become Our Drivers`.
- The new footer item opens the existing driver landing page route at `/company/drivers` without changing the rest of the footer or header layout.

## Driver Page Body Visual Simplification (2026-06-02)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Removed the driver-page-only sticky header/subnav strip (`Company`, `Delivery`, `Partners`, `Jobs`, `Earn`, `Shop now`, `Apply to drive`) so the existing FoodOnlines site header remains the only page header.
- Converted the driver hero into a full-bleed image header with dark overlay and text/CTA content placed on top of the image, matching the requested sample direction without copying external brand assets.
- Flattened box-heavy driver text sections into open rows, divider lists, circular image treatments, and lightweight columns for Fleet/Flex, driver value, Flex benefits, success points, timeline steps, accordions, apply CTA, and positions CTA.
- Cleaned old driver card/floating-card CSS rules that no longer apply to the simplified page body.

## Driver Page Copy Update (2026-06-02)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `AGENT.md`
  - `design.md`
- Updated the driver hero and income section copy per request: hero now includes "Be Your Own Boss / Work on Your Terms", the intro paragraph focuses on schedule freedom, and the Fleet/Flex intro now uses the "Maximize Your Income Potential / Unmatched Earning Opportunities" wording.

## Driver Page Program Copy + Section Removal (2026-06-02)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Removed the Fleet/Flex driver path row section from the driver page body.
- Replaced the driver value section copy with `Efficient Routes / Reliable Daily Schedule` and updated the paragraph to focus on organized routes and consistent daily deliveries.
- Replaced the Flex program explanation with the FoodOnline Driver Program copy and expanded the three checklist rows into title/subtitle/supporting text blocks for schedule control, no minimum hour requirements, and flexible work supported by customer demand.

## Driver Hero Image + Flex Section Removal (2026-06-02)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `src/data/driverLanding.ts`
  - `public/images/drivers/foodonlines-driver-hero.png`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Added the provided FoodOnlines driver/van image to the public driver image folder and set it as the driver page hero background.
- Increased the `Drivers` hero label size, changed `Be Your Own Boss / Work on Your Terms.` into an H4 without numbering, and tightened spacing between that H4 and the hero support copy.
- Promoted `Efficient Routes` to a large H2 and `Reliable Daily Schedule` to an H1-style heading, with the numeric prefix removed.
- Removed the large `FoodOnlines Flex` section from the driver page body.

## Driver Earnings/Support Image Blocks (2026-06-02)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `src/data/driverLanding.ts`
  - `public/images/drivers/foodonlines-driver-hero.png`
  - `public/images/drivers/foodonlines-driver-earnings.png`
  - `public/images/drivers/foodonlines-driver-support.png`
  - `public/images/drivers/foodonlines-driver-community.png`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Replaced the driver hero image with the provided doorway delivery image.
- Reworked the success/earning section so `How Much Can You Earn?` is the main section heading with the parcel-rate support copy and image below it.
- Updated the support and community blocks to the requested `Dedicated Support Around the Clock` and `Drive Together. Grow Together.` copy, each with its own supplied image below the text.

## Driver GitHub Pages Route/Image Fix (2026-06-02)

- Files changed:
  - `.github/workflows/deploy-pages.yml`
  - `vite.config.ts`
  - `public/404.html`
  - `src/components/DriverLandingPage.tsx`
  - `src/data/driverLanding.ts`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Fixed deployed image 404s by using a production base path of `/FoodOnline-Desktop-/` for GitHub Pages builds, with `VITE_BASE_PATH` still available for other hosts.
- GitHub Pages workflow now passes `VITE_BASE_PATH=/FoodOnline-Desktop-/` during `npm run build`.
- Added a GitHub Pages `404.html` SPA fallback so hard refresh / Ctrl+F5 on `/FoodOnline-Desktop-/company/drivers` redirects to `/#company/drivers` and loads the React app instead of GitHub's file-not-found page.
- Reworked the earning/support/community area into a compact three-column image layout with the section heading above, individual headings above each image, and explanatory text below each image.

## Driver Image Swap + Brand Colors (2026-06-02)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `src/data/driverLanding.ts`
  - `public/images/drivers/foodonlines-driver-hero.png`
  - `public/images/drivers/foodonlines-driver-earnings.png`
  - `public/images/drivers/foodonlines-driver-support.png`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Swapped the main driver hero image to the FoodOnlines van/box loading image.
- Swapped the `How Much Can You Earn?` image to the doorway delivery driver image.
- Swapped the `Dedicated Support Around the Clock` image to the two-driver van loading image.
- Recolored the compact earning/support/community section to FoodOnlines green and orange with a light orange-to-green background.

## Driver Readability + Grouped Delivery Update (2026-06-02)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `src/data/driverLanding.ts`
  - `public/images/drivers/driver-schedule-calendar.png`
  - `public/images/drivers/driver-route-delivery.png`
  - `public/images/drivers/driver-payout-phone.png`
  - `AGENT.md`
  - `design.md`
- Driver hero text is bolder, the background image is dimmed, and the hero image uses contain-style sizing so the supplied header image remains visible without harsh cropping across desktop, tablet, mobile, Safari, and Chrome.
- The compact earning/support/community boxes now use matching vertical alignment with centered images and stronger body text.
- Grouped deliveries now uses `Enjoy Greater Schedule Stability.`, keeps `Grouped deliveries` as an H3, adds the requested pre-planned assignment copy, and updates all three step titles, bodies, and images.

## Driver Section Removal + Eligibility Copy Update (2026-06-02)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `src/data/driverLanding.ts`
  - `AGENT.md`
  - `design.md`
- Grouped delivery step images now sit directly under each step's own text instead of using one sticky side image.
- Driver hero image positioning now centers the supplied banner and shifts the image lower so the driver's face is visible while keeping text readable.
- Removed the compact earning/support/community section, the Fleet full-time opportunities section, and the More information accordion from the driver page.
- Updated eligibility accordion copy for vehicle requirements, age, license/work authorization/insurance, background screening, and other experience/GPS/lifting/customer-service requirements.

## Driver Three-Card Restore + Image Alignment (2026-06-02)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `AGENT.md`
  - `design.md`
- Restored the three-card earning/support/community section below the FoodOnline Driver Program section.
- The FoodOnline Driver Program image column now uses a constrained right-side image box on wide screens and stacks cleanly on narrower widths so it does not overlap text.
- Grouped delivery step images now use equal fixed-height boxes at desktop/tablet/mobile breakpoints so the three boxes align consistently.

## Driver Apply Image + Final CTA Removal (2026-06-02)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `src/data/driverLanding.ts`
  - `public/images/drivers/driver-apply-team.png`
  - `AGENT.md`
  - `design.md`
- Removed the final `Check our open positions` CTA section from the driver page.
- Added the provided FoodOnlines driver team/truck image to the `Apply here to start driving` section.
- Tuned the `How Much Can You Earn?` image crop so the driver's face remains visible.
- Grouped delivery step cards now use equal row structure so their image boxes stay aligned even when text lengths differ.

## Driver Value Collage Square Layout (2026-06-02)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `AGENT.md`
  - `design.md`
- Replaced the circular image collage in the `Efficient Routes / Reliable Daily Schedule` section with square and rectangular image boxes.
- The collage uses a responsive two-column CSS grid with mixed box sizes, small gaps, light shadows, and no circular clipping so it stacks cleanly across desktop, tablet, mobile, Safari, and Chrome.

## Driver Value Collage Uploaded Images (2026-06-03)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `src/data/driverLanding.ts`
  - `public/images/drivers/driver-value-loading.png`
  - `public/images/drivers/driver-value-cab.png`
  - `public/images/drivers/driver-value-team.png`
  - `public/images/drivers/driver-value-pair.png`
  - `AGENT.md`
  - `design.md`
- Added the four supplied FoodOnlines driver images to the value collage boxes.
- The collage now explicitly places the lower small box under the right-side tall box, with centered object-fit images and stable two-column grid sizing for desktop, mobile, iOS Safari, Android Chrome, Safari, and Chrome.

## Driver Three-Card Desktop Image Alignment (2026-06-03)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `AGENT.md`
  - `design.md`
- The `How Much Can You Earn?` three-card section now reserves equal desktop title/subtitle space above each image so all three image boxes start on the same row.
- All three images use the same centered crop behavior and fixed responsive image-box heights; this aligns boxes without individually shifting images up or down.

## Driver Highlight Text Color Update (2026-06-03)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `AGENT.md`
  - `design.md`
- Updated the driver grouped-delivery and earning/support/community sections so bold highlight headings/subtitles use black instead of green/orange.
- Normal supporting paragraph copy in those sections now uses grey, matching the FoodOnline Driver Program paragraph styling direction, without changing any text content.

## Driver Benefit Card Structure Alignment Fix (2026-06-03)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `src/data/driverLanding.ts`
  - `AGENT.md`
  - `design.md`
- Fixed the root alignment issue in the earning/support/community section by removing the separate standalone section heading and rendering all three titles/subtitles inside identical card header slots.
- Removed the `2.` and `3.` prefixes from the second and third card titles.
- All three desktop cards now share the same title/subtitle header height, image-box height, centered image fitting, and body-copy start position.

## Driver Typography Weight Update (2026-06-03)

- Files changed:
  - `src/components/DriverLandingPage.tsx`
  - `AGENT.md`
  - `design.md`
- Driver page H1 elements now use `font-bold` instead of overly heavy or light weights, matching the Poppins Bold direction.
- Driver page paragraph/body copy now uses regular or medium weight classes, with normal copy in grey and bold heading/subtitle text kept black.

## Driver Program Van + Earnings Person Crop (2026-06-03)

- Files changed:
  - `src/data/driverLanding.ts`
  - `public/images/drivers/driver-earnings-person-crop.png`
  - `public/images/drivers/driver-program-van.png`
  - `AGENT.md`
  - `design.md`
- Added a dedicated cropped person image for the first earning card so the driver's face stays visible inside the existing aligned image box.
- Replaced the missing/placeholder Driver Program image source with the supplied branded van image.
- No driver page copy was changed in this pass.

## Driver Payout Card Image Update (2026-06-03)

- Files changed:
  - `public/images/drivers/driver-payout-phone.png`
  - `AGENT.md`
  - `design.md`
- Replaced only the `Get Paid for Every Delivery` card image with the supplied payment-received phone screenshot.
- No CSS, copy, component code, or other image assets were changed.

## About Us Page Launch (2026-06-03)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `src/App.tsx`
  - `src/store/homeStore.ts`
  - `src/components/Footer.tsx`
  - `src/data/home.ts`
  - `public/images/about/about-hero.png`
  - `public/images/about/about-mission.png`
  - `public/images/about/about-delivery-scale.png`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Added the FoodOnlines About Us page at `/about-us`, with `#about-us` support for the existing SPA fallback routing.
- The page uses the three supplied About Us images exactly as static assets, with responsive contained image rendering, no text cropping, and lazy loading on the middle and bottom sections.
- Updated the existing footer `About Us` link to open the new About Us page while preserving the current footer styling, header, and footer structure.

## Footer Logo Size Reduction (2026-06-03)

- Files changed:
  - `src/components/Footer.tsx`
  - `AGENT.md`
  - `design.md`
- Reduced the shared footer FoodOnlines logo from the oversized `h-24 sm:h-28` treatment to `h-10 sm:h-12`, making the footer logo much smaller across all pages.
- No footer links, header logo, page routing, or other imagery changed.

## About Us Timeline Section (2026-06-04)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Added a horizontally scrollable company timeline directly below the About Us banner and before the mission/delivery image sections.
- Timeline uses FoodOnlines green for the connecting line, year pills, active node treatment, and active pagination dot; inactive dots are light gray.
- Timeline cards use large circular placeholder image areas with shadows, native snap scrolling, touch-friendly horizontal swipe, smooth dot navigation, and accessible dot labels.

## About Us Timeline Open Layout + Drag Update (2026-06-04)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `AGENT.md`
  - `design.md`
- Removed the boxed background/shadow treatment from each timeline milestone so the year, circle, text, and green line sit directly on the shared light timeline background.
- Added desktop mouse drag support so users can click, hold, and drag the horizontal timeline left or right while keeping native swipe behavior on touch devices.

## About Us Timeline Image Assignment (2026-06-04)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `public/images/about/timeline/timeline-1999.png`
  - `public/images/about/timeline/timeline-2005.png`
  - `public/images/about/timeline/timeline-2007.png`
  - `public/images/about/timeline/timeline-2015.png`
  - `public/images/about/timeline/timeline-2019.png`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Added the supplied real images to the 1999, 2005, 2007, 2015, and 2019 timeline circles; Today keeps the abstract placeholder until a real image is provided.
- Moved each green year pill closer to its circle by grouping the badge directly above the circular visual.

## About Us Today Timeline Image (2026-06-04)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `public/images/about/timeline/timeline-today.png`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Added the supplied FoodOnlines warehouse image to the Today timeline circle, replacing the abstract placeholder for that milestone.

## About Us Timeline Scroll Handling Fix (2026-06-04)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Updated timeline wheel/touch handling so normal vertical scrolling continues down or up the About Us page when the pointer is over the horizontal timeline.
- Horizontal timeline movement remains available through desktop drag, horizontal trackpad movement, Shift+wheel, touch swipe, and dot navigation.
- Removed the timeline tagline `A FoodOnlines timeline built for global grocery access` and made `Our Story` the larger primary timeline heading.
- Changed the timeline from mandatory snapping to proximity snapping and added vertical touch-intent detection that temporarily disables snapping during up/down swipes on mobile Chrome/Safari.
- Follow-up fix: restored the non-sticky open timeline layout so full milestone images remain visible instead of being cropped by a scroll-driven sticky viewport.
- The timeline now follows a Yami-style controlled carousel pattern: vertical page scrolling passes through normally, visible Previous/Next buttons plus dots move the timeline, and touch users can swipe left/right directly on the timeline with a custom fast horizontal drag handler that does not require tap/focus or untap.

## About Us Vertical Timeline Update (2026-06-04)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Converted the About Us timeline from a horizontal carousel into a vertical story path so users can scroll downward through all milestones to Today.
- Preserved the green brand connector, year pills, circular nodes, and real milestone images while changing layout to a left-side vertical path on mobile and alternating center-line columns on wider screens.
- Removed horizontal drag/touch/wheel carousel handlers, Previous/Next controls, pagination dots, and the old `.about-timeline-scroller` CSS because vertical native page scrolling is now the only timeline interaction.
- Follow-up scroll fix: timeline containers now use horizontal-only overflow guarding plus explicit vertical pan behavior so users do not need to tap/focus the timeline area before continuing down the page.
- Static-scroll follow-up: removed `overflow-x-hidden` and touch-action overrides from the About page wrapper and timeline section so no nested scroll container can form; the timeline is now plain static page content with body/document scrolling only.

## About Us Pre-Timeline Story Images (2026-06-04)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `public/images/about/about-global-foods.png`
  - `public/images/about/about-authentic-flavors.png`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Added the supplied `Connecting People around the World with the Foods They Love Most` image above the timeline, followed immediately by the supplied `Bringing the world's authentic flavors to every table` image.
- Both images use the existing About page responsive image component with full-width contain rendering, lazy loading, no crop, and normal static page scroll behavior for desktop, desktop-mobile browser widths, tablet, Android, and iOS.
- Follow-up spacing fix: removed the second pre-timeline image section's top padding so the two supplied story images sit close and seamless together.

## About Us Leadership Placeholder Grid (2026-06-04)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `public/images/about/leadership/jakapun-viwatkurkul.webp`
  - `public/images/about/leadership/paul-pongpichan.webp`
  - `public/images/about/leadership/pasit-viwatkurkul.webp`
  - `public/images/about/leadership/natalie.png`
  - `public/images/about/leadership/lucas-huber.png`
  - `public/images/about/leadership/anna-goldstein.png`
  - `public/images/about/leadership/janet-weiler.png`
  - `public/images/about/leadership/ahmet-yilmaz.png`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Added an empty leadership placeholder grid directly below the truck/delivery-scale banner image.
- Added a large bold green `Our leadership` H2 above the first card row, matching the sample heading placement while using FoodOnlines green.
- Grid keeps eight rounded white card slots and all eight are now filled.
- Layout is 4 columns x 2 rows on desktop, 2 columns on tablet, and 1 column on small mobile so the cards remain clean across desktop, desktop-mobile widths, Android, and iOS.
- Leadership content update: filled cards 1-5 with supplied headshots and roles for Jakapun Viwatkurkul (President and Founder), Paul Pongpichan (CSCO), Pasit Viwatkurkul (CTO), Natalie (CFO), and Lucas Huber (COO).
- Follow-up content update: filled cards 6-7 with Anna Goldstein (Chief Marketing Officer / CMO) and Janet Weiler (Chief Commercial Officer / CCO).
- Follow-up styling update: softened names to semibold, roles to normal weight, and set every filled card to use the same fixed-height lower portrait frame with `object-contain object-bottom` so images align evenly.
- Latest content update: filled card 8 with Ahmet Yılmaz (Chief Customer & Experience Officer / CXO), replaced Anna and Janet with the newer white-background images, and scaled Lucas/Ahmet slightly larger within the same fixed portrait frame.
- Gray-backdrop fix: whitened the connected light gray studio backdrop in Anna, Janet, and Ahmet public image assets, then changed Ahmet to a top-weighted object-cover crop so lower source artifacts do not show in the leadership card.

## About Us Lucas Leadership Image Fix (2026-06-04)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `public/images/about/leadership/lucas-huber.png`
  - `AGENT.md`
  - `design.md`
- Restored Lucas Huber's leadership image to the shared `object-contain object-bottom` portrait fitting while keeping the slight scale-up, preventing mobile browser widths from squeezing the image inside the fixed portrait frame.
- Cleaned the connected pale gray studio backdrop in the Lucas asset to read as a white card background without changing the card layout or other leadership portraits.

## About Us Leadership Row One Zoom Update (2026-06-04)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `AGENT.md`
  - `design.md`
- Increased the zoom for the first-row leadership portraits, including the fourth Natalie card, by applying the same contained bottom-aligned scale treatment across Jakapun, Paul, Pasit, and Natalie.
- The row-one portraits now visually match the closer second-row portrait sizing while preserving the existing white card boxes, fixed image frame heights, and responsive one/two/four-column grid behavior across desktop, tablet, mobile, iOS Safari, Android Chrome, Safari, and Chrome.

## About Us Hardcoded Section Rebuild (2026-06-05)

- Files changed:
  - `src/components/AboutUsPage.tsx`
  - `AGENT.md`
  - `design.md`
- Rebuilt the About Us page from banner-image content into five responsive hardcoded React sections: food connection hero, brand mission intro, authentic flavors, affordable groceries mission, and fulfillment/delivery scale, while preserving the original leadership/team section below the delivery section.
- All major About Us story text is now real selectable HTML/React content using Poppins-first typography instead of text embedded inside full-width images.
- The previous story banner images are no longer rendered as page content; decorative image areas now use named placeholder divs and visible circle layouts ready for future asset replacement, without dashed placeholder boxes or label boxes inside the image areas.
- The existing `/about-us` route and footer About Us link behavior remain unchanged.
- Follow-up mobile typography update: the mission headline and orange global-serving statement use smaller mobile-only line layouts and font clamps for iOS/Android/desktop-mobile readability while preserving larger desktop sizing.
- Follow-up leadership/logo update: Janet Weiler's leadership portrait now uses an exact copied public asset from the supplied `pages/about us page/4f8fea1f-e350-45d7-ab02-5bd999df95a3.jfif` file at `public/images/about/leadership/janet-weiler.jfif`, rendered with contained bottom fitting and a slight CSS scale-down so the original image is preserved while matching the other team portrait sizing. The in-page FoodOnlines logos above the `ASIAN GROCERIES...` and `OUR MISSION...` About sections were removed while leaving the shared site header/footer logos unchanged.
- Follow-up Janet cutout and hero update: Janet Weiler's displayed leadership asset now uses a transparent-background PNG cutout generated from the supplied `.jfif` source so the portrait blends into the white card; the source `.jfif` remains in public assets for reference. The desktop hero headline no longer forces a break between `CONNECTING PEOPLE AROUND THE WORLD` and `WITH THE FOODS THEY LOVE MOST`, and the hero support paragraph now sits below the headline on desktop instead of in a right column.
- Follow-up circle art update: the two accessible/affordable circles, four flavor circles, mission cart/plate circles, and delivery truck/dish composition now use transparent PNG assets from `public/images/about/circle-assets/` instead of placeholder divs. Source black backgrounds were removed with border-connected alpha processing so the cutouts sit over the existing colored circles/backgrounds, with responsive `object-contain`, lazy loading, and slight overflow beyond each circle across desktop, Chrome/Safari, Android, iPhone, mobile, and desktop-mobile browser widths.
- Follow-up mission circle spacing update: the mission shopping-cart cutout is positioned farther up/right from the peach circle while the spicy rice-cake plate is enlarged and shifted down/left so it fills more of the large green circle and creates clearer spacing between the two images on desktop, tablet, and mobile widths.
- Follow-up hero/table and mobile-circle update: the top hero image box now uses the supplied table-sharing image at `public/images/about/about-food-table.png` with full-cover rounded rendering. The four authentic-flavor circles now use smaller responsive widths below desktop so desktop-mobile/tablet pairs fit cleanly without oversized circle/image overlap.
- Follow-up truck cutoff fix: `public/images/about/circle-assets/delivery-truck.png` now uses the original transparent full `9.Our teams fulfill and deliver more than 100,000 orders every day (1).png` file directly with no background removal or crop processing. The page CSS caps the full canvas width while using negative bottom offsets to place the visible vehicle without cutting off any part of the truck.
- Follow-up image-background cleanup: the top table image now renders as the image only, with no wrapper box, background fill, or forced min-height behind it. The delivery dishes were cropped to tight transparent alpha bounds and their CSS drop shadows were removed so no square/white background appears around the dish cutouts. The delivery truck is moved higher on mobile so the visible vehicle sits inside the green circle instead of below it.
- About Us circle art checks on 2026-06-05: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.

## Become Vendor Page Launch (2026-06-04)

- Files changed:
  - `src/components/BecomeVendorPage.tsx`
  - `src/App.tsx`
  - `src/store/homeStore.ts`
  - `src/components/Footer.tsx`
  - `src/data/home.ts`
  - `public/images/become-vendor/vendor-hero.png`
  - `public/images/become-vendor/vendor-stats.png`
  - `public/images/become-vendor/vendor-selling.png`
  - `public/images/become-vendor/vendor-scale.png`
  - `public/images/become-vendor/vendor-steps.png`
  - `public/images/become-vendor/vendor-final-cta.png`
  - `AGENT.md`
  - `design.md`
- Added the `/become-vendor` public page with `#become-vendor` fallback support. It originally launched from supplied Sell Globally banner images, then was rebuilt on 2026-06-04 as responsive hardcoded React sections so all visible text and CTA labels can be edited and resized in code.
- Page metadata now sets `Become a Vendor | FoodOnlines`, and the page background uses the matching light green `#c4dfb8` so the rebuilt sections read as one continuous landing page.
- Vendor CTA buttons are real accessible buttons. Hero `GET STARTED` and final `Sign up` call the existing `openSignup` flow, and final `Log in` calls the existing `openLogin` flow.
- Updated the shared footer `Become a Vendor` item to point to `/become-vendor` and open the new page through the existing SPA navigation pattern.

## Become a Sponsor Page Launch (2026-06-07)

- Files changed:
  - `src/components/BecomeSponsorPage.tsx`
  - `src/App.tsx`
  - `src/store/homeStore.ts`
  - `src/components/Footer.tsx`
  - `src/data/home.ts`
  - `public/images/become-sponsor/`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Added the hardcoded FoodOnlines `Become a Sponsor` advertising landing page at `/become-a-sponsor`, with `#become-a-sponsor` fallback support through the existing Zustand route store.
- The page keeps the shared FoodOnlines public header/footer and renders hardcoded real HTML text for the hero cards, reach stats, sponsored product overview, CTA box, search results advertising, deals/bestsellers/new arrivals, category pages, featured homepage, homepage brand takeover, and product detail page sections.
- CTA controls are real clickable buttons. `Get Started` and `CONTACT US` route to `mailto:info@foodonlines.com`; `ADS LOGIN` routes to `#ads-login`.
- Sponsor images were copied from `D:/Foodonline desktop version/pages/sponsor page` into `public/images/become-sponsor/` and used as section visuals: `18.Sponsor with us.png`, `19.EXPAND YOUR REACH.png`, `20.SPONSORED PRODUCTS.png`, `21.Advertise on the World's #1 Grocery App.png`, `8.Search Results Advertising.png`, `9.Deals, Bestsellers & New Arrivals.png`, `10.Category Pages.png`, `11.Featured on the Homepage.png`, `11.Featured on the Homepage (2).png`, and `12.Product Detail Pages.png`.
- Filename fallback note: the requested exact files `11.Featured on the Homepage (1).png` and `12.Product Detail Pages (3).png` were not present, so the page uses the closest available matching sponsor assets, `11.Featured on the Homepage.png` and `12.Product Detail Pages.png`. The extra Homepage Brand Takeover section uses `11.Featured on the Homepage (2).png`.
- Footer update: the Corporate footer item formerly labeled `Promotions` is now `Become a Sponsor` and opens `/become-a-sponsor` through the same SPA navigation pattern as the vendor, partner, and driver links.
- Responsive behavior: desktop uses wide banner-like sections and two-column product layouts; tablet/mobile stack text and visuals with max-width guarded images, no intentional horizontal overflow, real tap targets, and lazy loading for below-the-fold image assets.
- Checks on 2026-06-07: initial PowerShell `npm run build` was blocked by Windows script policy, so `cmd /c npm run build` was used. The first build attempt hit Vite `ENOTEMPTY` while clearing generated `dist/assets`; after verifying and clearing only `D:/Foodonline desktop version/dist/assets`, `cmd /c npm run build` passed. No separate `lint` or `typecheck` scripts are defined in `package.json`; `npm run build` includes `tsc -b`.

## Become a Sponsor Button and Heading Follow-Up (2026-06-07)

- Files changed:
  - `src/components/BecomeSponsorPage.tsx`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Removed the `Get Started` button from the Search Results Advertising, Deals/Bestsellers/New Arrivals, Category Pages, Featured on the Homepage, and Homepage Brand Takeover sections.
- Kept the Product Detail Pages `Get Started` button because that section was not included in the removal list.
- Reduced the primary bold sponsor page heading scale by roughly 40% for desktop and desktop-mobile sizing, including the top hero headline, `EXPAND YOUR REACH`, `SPONSORED PRODUCTS`, Weekly Deals, final CTA headline, and sponsored ad-section titles.

## Become a Sponsor Stats Centering Follow-Up (2026-06-07)

- Files changed:
  - `src/components/BecomeSponsorPage.tsx`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Removed the empty `Join industry leaders` column from the Expand Your Reach stats section.
- Centered the remaining `Advertise on the World's #1 Grocery App` stats block in a single max-width panel with centered heading text, responsive two-column stat cells on tablet/desktop, stacked-safe spacing on narrow mobile, break-safe stat text, and no intentional horizontal overflow across desktop, desktop-mobile, tablet, iOS Safari, and Android Chrome widths.

## Become a Sponsor Image Scaling and Section Asset Fix (2026-06-07)

- Files changed:
  - `src/components/BecomeSponsorPage.tsx`
  - `src/styles.css`
  - `public/images/become-sponsor/`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Updated sponsor page image mapping to use the newer source assets from `D:/Foodonline desktop version/pages/sponsor page`: `20.SPONSORED PRODUCTS (1).png`, `20.SPONSORED PRODUCTS (2).png`, `8.Search Results Advertising (2).png`, `8.Over 30 Million Downloads.png`, `9.Deals, Bestsellers & New Arrivals (1).png`, `9.Deals, Bestsellers & New Arrivals (2).png`, `10.Category Pages (2).png`, `10.Category Pages (3).png`, `11.Featured on the Homepage (2).png`, `12.Product Detail Pages (1).png`, and `12.Product Detail Pages (2).png`.
- `image(357).png` was checked in the sponsor page source folder and was not present; it was not needed because the extra Homepage Brand Takeover section was removed and Featured on the Homepage now uses `11.Featured on the Homepage (2).png`.
- Removed the extra `Homepage Brand Takeover` section completely. Product Detail Pages now appears directly after Featured on the Homepage.
- Fixed Weekly Deals paragraph wrapping to one natural sentence: `Increase exposure, attract more customers, and accelerate sales with featured weekly promotions amplified through our marketing channels.`
- Added sponsor-specific CSS image wrappers in `src/styles.css`: `.sponsor-visual`, `.sponsor-visual__img`, `.sponsor-visual--phone`, `.sponsor-visual--floating`, `.sponsor-visual--pair`, `.sponsor-visual--weekly`, and `.sponsor-visual--detail`.
- The sponsor visual wrappers use centered `object-fit: contain`, max-width guarded image sizing, responsive pair layouts, and controlled transforms so transparent PNG phone/product subjects fill their placeholder areas without distortion, tiny-image presentation, important cropping, or horizontal overflow across desktop Chrome/Safari, tablet, Android Chrome, and iPhone Safari.

## Become a Sponsor Medium Visual Sizing Follow-Up (2026-06-07)

- Files changed:
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Increased paired sponsor visuals to medium size for Deals/Bestsellers/New Arrivals, Category Pages, and Product Detail Pages by widening `.sponsor-visual--pair`, increasing its responsive min-height, and scaling each transparent PNG subject larger.
- Updated Product Detail Pages so both phone mockups lean the same direction while staying medium-sized and contained in the section.
- Increased the single Search Results Advertising phone/product visual through `.sponsor-visual--phone` so the Daring ready-meal image reads as medium-sized instead of tiny.

## Become a Sponsor Large Visual Sizing Follow-Up (2026-06-08)

- Files changed:
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
  - `design.json`
- Enlarged the Featured on the Homepage visual baseline and applied the same larger scale system to sponsor visuals across all formats.
- Increased `.sponsor-visual`, `.sponsor-visual--phone`, `.sponsor-visual--floating`, `.sponsor-visual--pair`, `.sponsor-visual--weekly`, and `.sponsor-visual--detail` sizing so Featured on the Homepage, Search Results Advertising, Deals/Bestsellers/New Arrivals, Category Pages, Weekly Deals, and Product Detail Pages read much larger while preserving `object-fit: contain`, no stretching, and horizontal overflow guards.
- Product Detail Pages continues to keep both phone images leaning the same direction at the larger size.

## Become a Sponsor Search Results Layering Follow-Up (2026-06-08)

- Files changed:
  - `src/components/BecomeSponsorPage.tsx`
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
- Search Results Advertising now renders the category-phone screen from `over-30-million-downloads.png` as the back layer and the Daring ready-meal card from `search-results-advertising-phone.png` as the front layer, grouped as one right-side visual unit with relative positioning, z-index layering, PNG transparency, contained image fitting, and no intentional horizontal overflow.
- Deals/Bestsellers/New Arrivals and Category Pages keep only two phone images per section and use larger right-side side-by-side phone wrappers so the visuals feel closer to the Featured on the Homepage scale while keeping the left text layout unchanged.
- Product Detail Pages now uses a clipped orange hero treatment: the hero remains `position: relative` with `overflow: hidden`, the two phone images are absolutely positioned on the right at the bottom with oversized responsive `clamp()` sizing, and their lower tails are intentionally cropped inside the orange section without bleeding into the following white/footer area.

## Become a Sponsor Dominant Visual Alignment Follow-Up (2026-06-08)

- Files changed:
  - `src/components/BecomeSponsorPage.tsx`
  - `src/styles.css`
  - `public/images/become-sponsor/category-pages-1.png`
  - `public/images/become-sponsor/category-pages-2.png`
  - `public/images/become-sponsor/deals-bestsellers-new-arrivals-1.png`
  - `public/images/become-sponsor/deals-bestsellers-new-arrivals-2.png`
  - `public/images/become-sponsor/featured-homepage-visual.png`
  - `public/images/become-sponsor/product-detail-pages-1.png`
  - `public/images/become-sponsor/product-detail-pages-2.png`
  - `AGENT.md`
  - `design.md`
- Cropped excess transparent canvas from the Deals/Bestsellers/New Arrivals, Category Pages, Featured on the Homepage, and Product Detail Pages PNG mockups while preserving alpha transparency, so responsive CSS widths now scale the visible phone/banner subjects instead of empty 1000px canvases.
- Reworked ad product sections around a consistent `.sponsor-section` layout with `42% / 58%` desktop columns, `.sponsor-copy` above decorative layers, and a right-side flex `.sponsor-visual` area aligned center/end so Category Pages, Deals/Bestsellers/New Arrivals, and Featured on the Homepage read as large vertically centered right-column visuals.
- Product Detail Pages keeps the orange section clipped with `overflow: hidden`; its two phone mockups are absolutely positioned on the right with `bottom: -120px`, larger `clamp()` sizing, and mobile/tablet overrides that keep the phone pair large without allowing bleed into the next white/footer section.

## Become a Sponsor Responsive Visual Stack Follow-Up (2026-06-08)

- Files changed:
  - `src/components/BecomeSponsorPage.tsx`
  - `src/styles.css`
  - `public/images/become-sponsor/over-30-million-downloads.png`
  - `public/images/become-sponsor/search-results-advertising-phone.png`
  - `AGENT.md`
  - `design.md`
- Search Results Advertising now assigns explicit `search-results-phone` and `search-results-banner` classes to the layered visual assets. Desktop keeps the phone behind/top-right and the Daring horizontal banner centered in front; the `max-width: 1024px` breakpoint stacks the entire visual block below the copy so it cannot overlap the heading or paragraph.
- Cropped excess transparent canvas from the Search Results category-phone and Daring banner PNGs while preserving alpha, allowing the banner card to render as a large horizontal product ad instead of a small subject inside a square canvas.
- Tablet, mobile-desktop, and phone layouts now force sponsor ad sections into copy-first single-column flow. Floating, search-layered, and product-detail visuals reset to normal relative positioning below the text, while Product Detail keeps a large below-copy phone pair with bottom translation clipped inside the orange section.

## Become a Sponsor Search Composition and Stats Alignment Follow-Up (2026-06-08)

- Files changed:
  - `src/components/BecomeSponsorPage.tsx`
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
- Search Results Advertising now renders through a dedicated `SearchResultsVisual` component instead of the generic sponsor image loop. The visual has one parent wrapper, a lower-z-index phone image, and a foreground `search-results-card-group` containing the Daring sponsored product card so the phone/card treatment behaves as one composed hero visual on desktop, tablet, mobile-desktop, and mobile.
- The Expand Your Reach metrics now use a shared `sponsor-stat` structure with separate `sponsor-stat__value` and `sponsor-stat__label` elements. `20 MILLION+` now treats `MONTHLY VISITS` as supporting copy, and `90%` treats `YOY growth` as its supporting label, matching the hierarchy used by `30 MILLION+` and `ZERO`.

## Become a Sponsor Weekly Deals Phone Backdrop Follow-Up (2026-06-08)

- Files changed:
  - `src/components/BecomeSponsorPage.tsx`
  - `src/styles.css`
  - `public/images/become-sponsor/sponsored-products-phone-bg.png`
  - `AGENT.md`
  - `design.md`
- Added the supplied `20.SPONSORED PRODUCTS (3).png` phone image as `sponsored-products-phone-bg.png`, cropped to transparent bounds while preserving alpha so it can scale behind the first Sponsored Products / Weekly Deals visual.
- Rebuilt the Weekly Deals right-side image treatment as a layered composition: the phone is an absolute back layer and the two food deal boxes live together inside `sponsor-weekly-card-group` as one foreground group, keeping them visually connected instead of separate floating cards across desktop, tablet, mobile-desktop, and mobile.

## Become a Sponsor Responsive Overlay Composition Fix (2026-06-08)

- Files changed:
  - `src/components/BecomeSponsorPage.tsx`
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
- Search Results Advertising now uses the category-phone mockup as the back layer and the two small food/product promo cards as absolute foreground overlays inside `search-results-card-group`, so the mobile-desktop and tablet layouts keep the cards on top of the phone instead of stacking them below it.
- Weekly Deals keeps the phone and two promo cards inside one relative wrapper with an absolute phone layer and an absolute foreground card group across desktop, tablet, mobile-desktop, and phone breakpoints. The section no longer uses relative flow margins for the cards, preventing them from separating from or dropping below the phone.

## Become a Sponsor Search Results Desktop Revert (2026-06-08)

- Files changed:
  - `src/components/BecomeSponsorPage.tsx`
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
- Restored the Search Results Advertising desktop visual to the prior correct composition: the category-phone mockup remains the back anchor and the Daring sponsored product banner is the foreground card layered over the lower-middle phone area.
- Tablet, mobile-desktop, and phone breakpoints now reuse that same desktop composition logic by keeping the phone absolutely centered behind the foreground `search-results-card-group`, avoiding the earlier mobile flow where the card could sit below or separate from the phone.

## Become a Sponsor Weekly Deals Card Scale Fix (2026-06-08)

- Files changed:
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
- Enlarged the two Weekly Deals foreground promo boxes and moved them closer over the phone body so the section reads as one premium layered mockup: large phone behind, upper-left/mid-left card in front, and lower-right/mid-right card in front.
- Tablet, mobile-desktop, and phone breakpoints preserve the same phone-behind/card-front composition with larger responsive card sizing instead of shrinking the boxes into tiny separated stickers.

## Become a Sponsor Weekly Deals Asset Crop and Stronger Overlay Fix (2026-06-08)

- Files changed:
  - `src/styles.css`
  - `public/images/become-sponsor/sponsored-products-weekly-1.png`
  - `public/images/become-sponsor/sponsored-products-weekly-2.png`
  - `AGENT.md`
  - `design.md`
- Cropped excess transparent canvas from both Weekly Deals foreground card PNGs. The first card went from a 1000x1000 canvas to 332x317 visible bounds, and the second went from a 1000x1000 canvas to 273x270 visible bounds, preserving alpha transparency so CSS sizing now scales the actual card art instead of empty padding.
- Reworked the Weekly Deals layered CSS to use the phone as a relative back anchor and the two food boxes as larger absolute foreground overlays. Desktop uses `clamp(220px, 22vw, 320px)` card sizing with the first card at upper-left/mid-left and the second at lower-right/mid-right; tablet and mobile keep larger responsive card sizing without max-width caps that shrink the cards into stickers.

## Affiliate Hero Section Launch (2026-06-08)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `src/App.tsx`
  - `src/store/homeStore.ts`
  - `AGENT.md`
  - `design.md`
- Added a new affiliate page body at `/affiliate` with `#affiliate` fallback support. The page renders only a peach/orange affiliate hero section between the existing shared FoodOnlines header and footer; `src/components/Header.tsx` and `src/components/Footer.tsx` were not changed.
- The hero uses Montserrat-first typography, real selectable text for `Turn Your Audience Into Income`, `Earn Up to ฿75,000 Per Month`, the affiliate paragraph, and a black `Join & Earn` pill CTA linking to `#affiliate-apply`.
- Added three responsive product cards using local CSS placeholder packshot shapes instead of generated/external product images. Desktop, tablet, and mobile-landscape widths keep tall vertical cards in a row where space allows; narrow mobile switches each card to a wide horizontal row with image left, details middle, and plus button right.

## Affiliate Footer Link Fix (2026-06-08)

- Files changed:
  - `src/data/home.ts`
  - `src/components/Footer.tsx`
  - `AGENT.md`
  - `design.md`
- Connected the existing Corporate footer `Affiliate Program` item to the new affiliate page by changing it from plain footer text to `{ label: "Affiliate Program", href: "/affiliate" }`.
- Added footer SPA click handling for `/affiliate` through `openAffiliate()`, matching the existing Vendor, Partner, Sponsor, and Drivers footer navigation pattern.

## Affiliate Hero Stats Section Follow-Up (2026-06-08)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `AGENT.md`
  - `design.md`
- Added the compact four-item affiliate stats row directly below the affiliate hero content, inside the same `#ffb28f` peach/orange section with no separate darker banner or extra full-width panel.
- Desktop, tablet, and mobile-landscape layouts keep the stats in a compact four-column row with thin vertical white dividers. Mobile portrait stacks the stats into compact rows with the number on the left, description on the right, and thin horizontal dividers.
- Kept the existing neutral CSS placeholder packshot logic for product images and corrected the affiliate headline to use the real `฿75,000` Baht symbol. Header and footer component files were not edited in this follow-up.

## Affiliate Rewards Cards Section Follow-Up (2026-06-08)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `AGENT.md`
  - `design.md`
- Added the hardcoded Affiliate Rewards / Referral Cards section directly under the current affiliate hero + stats area. Header, footer, affiliate routing, and the existing hero/stat content were not edited.
- The new rewards section starts on a clean white `#ffffff` background with top breathing room after the peach/orange hero. The peach/orange background remains limited to the hero + stats area, and there is no dark orange banner behind the new cards.
- Added local `affiliateRewardCards` data, `AffiliateRewardCard`, `AffiliateRewardIcon`, and `AffiliateRewardsSection` helpers in `src/components/AffiliateHeroSection.tsx`.
- Desktop uses one row composition: the first pastel gradient card under `Share your link`, and the two coral/red-orange cards grouped under `Refer friends & keep earning`. Tablet and mobile-landscape keep compressed row layouts where space allows.
- Mobile portrait stacks the three rewards cards as compact square-like cards with hidden card buttons, visible lower-right white SVG icons, guarded text sizing, no intentional horizontal overflow, and subtle card shadows suited to the white section background.

## Affiliate Rewards Card Responsiveness Fix (2026-06-08)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `AGENT.md`
  - `design.md`
- Fixed only the Affiliate Rewards / Referral Cards section. Header, footer, routing, and the Affiliate Hero + Stats section above were not edited.
- Card 2 and Card 3 now share the corrected coral/red-orange `#f75b43` background with white text and a light border.
- Card 3 text was reset to `Receive ฿100` with body copy `for every successful referral who signs up`, avoiding the corrupted `Ã Â¸Â¿100` display.
- Tablet and mobile-desktop widths now treat coral cards as shorter banner-like cards with larger text, compact black pill buttons, and right-side white icons close to the copy instead of bottom-heavy tall panels.
- Mobile landscape keeps the coral cards compact with hidden buttons and right-side icons. Mobile portrait keeps stacked compact square-like cards with hidden buttons and lower-right icons.
- Checks on 2026-06-08: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and `git diff --check`.

## Affiliate Rewards Baht Symbol Fix (2026-06-08)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `AGENT.md`
  - `design.md`
- Fixed the Affiliate Rewards / Referral Cards section Card 3 title to render the actual Thai baht currency symbol as `Receive ฿100` instead of the mojibake text `Receive à¸¿100`.
- Header, footer, affiliate hero, and affiliate stats content were not edited.

## Affiliate How It Works Section Launch (2026-06-08)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `AGENT.md`
  - `design.md`
- Added the hardcoded `How does it work?` / `Getting started is easy` section directly below the Affiliate Rewards / Referral Cards section. Header, footer, Affiliate Hero + Stats, and existing Rewards section content were not edited.
- Added local `howItWorksSteps` data, `HowItWorksVisual`, `HowItWorksStepCard`, and `AffiliateHowItWorksSection` helpers in `src/components/AffiliateHeroSection.tsx`.
- The section uses a warm soft cream `#fff3e8` background, coral/orange labels and step titles, black heading/body copy, white rounded number badges, a white top-right `Join & earn` pill, and coral/salmon illustration panels recreated with code-native HTML/SVG shapes.
- Desktop/tablet layouts use three columns with subtle dashed vertical separators between steps. Mobile landscape keeps the cards compressed in a row where space allows with guarded image panels and no intentional horizontal overflow.
- Mobile portrait renders the heading first, then Step 1 as an expanded feature block with text, a large visual panel below the text, and a black `Join and earn` CTA below the visual. Steps 2 and 3 stack below as compact cards with text left and illustration panels right.
- Checks on 2026-06-08: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and `git diff --check`.

## Affiliate Rewards Typography Fix (2026-06-08)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `AGENT.md`
  - `design.md`
- Updated only the Affiliate Rewards / Referral Cards section typography. Header, footer, Affiliate Hero + Stats, and the How It Works section were not edited.
- Increased rewards group labels, card eyebrow text, titles, body copy, and optional supporting copy with responsive `clamp()` sizing so tablet and mobile-desktop views are much easier to read.
- Mobile portrait keeps compact square-like cards while using larger readable text; the optional Card 1 extra line is hidden on portrait to preserve card height.
- Kept reward icons visible and pulled the coral-card tablet/mobile-desktop icon grid closer to the text by slightly tightening the right icon column and gap.
- Card 3 rewards body copy now ends with a period: `for every successful referral who signs up.`
- Checks on 2026-06-08: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and `git diff --check`.

## Affiliate Rewards Desktop Typography Reset (2026-06-08)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
- Added scoped class hooks for the Affiliate Rewards / Referral Cards label, card wrapper, eyebrow, and optional extra text, then added a desktop-only `@media (min-width: 1025px)` reset in `src/styles.css`.
- Reduced only desktop reward label, eyebrow, title, body, and extra text sizing so desktop card copy no longer overflows or clips. Tablet, mobile-desktop, mobile portrait, header, footer, Affiliate Hero + Stats, and How It Works styling were left untouched.
- Checks on 2026-06-08: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and `git diff --check`.

## Affiliate Rewards Desktop Icon Placement Fix (2026-06-09)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
- Added scoped reward card variant, content, icon, and button class hooks, then extended the existing desktop-only `@media (min-width: 1025px)` rewards rule.
- Desktop reward icons are now slightly smaller, pinned farther into the bottom-right corner, non-interactive, and kept behind the text/button layer. Desktop content gets a reserved right-side safe area so the decorative SVG icons no longer overlap copy or CTAs. Header, footer, Affiliate Hero + Stats, tablet/mobile-desktop text sizing, and mobile portrait layout were not changed.
- Checks on 2026-06-09: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and `git diff --check`.

## Affiliate How It Works Image Update (2026-06-11)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `public/images/affiliate/how-it-works/create-account.png`
  - `public/images/affiliate/how-it-works/share.png`
  - `public/images/affiliate/how-it-works/get-started.png`
  - `AGENT.md`
  - `design.md`
- Updated only the Affiliate How It Works / Getting Started Is Easy section. Header, footer, Affiliate Hero + Stats, and Affiliate Rewards / Referral Cards were not edited.
- Step copy now uses the requested titles and bodies: `Create Your Account`, `Share`, and `Get Started`.
- Replaced the old code-native illustration panels with the three supplied PNG assets under `public/images/affiliate/how-it-works/`. Each image is lazy-loaded with useful alt text, centered, max-width guarded, and rendered with `object-fit: contain` so the uploaded card artwork scales without stretching.
- Responsive behavior: desktop keeps the three-column step layout and dashed dividers; tablet and mobile-desktop keep the same layout while reducing visual height; mobile portrait keeps Step 1 as the larger stacked block with the image below text and the black `Join and earn` CTA below the image, while Steps 2 and 3 remain compact text-left/image-right cards with a controlled 42% image column.
- Checks on 2026-06-11: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and `git diff --check`.
- Feature commit hash: `6f26a4a`.

## Contact Us Page Launch (2026-06-12)

- Files changed:
  - `src/components/ContactUsPage.tsx`
  - `src/App.tsx`
  - `src/store/homeStore.ts`
  - `src/components/Footer.tsx`
  - `src/data/home.ts`
  - `public/images/contact-us/`
  - `AGENT.md`
  - `design.md`
- Added a new public Contact Us page at `/contact-us` with `#contact-us` fallback support, rendered between the existing shared FoodOnlines header and footer without changing header styling or footer layout.
- Connected the existing Company footer `Contact Us` item to the new page through the same Zustand route/store pattern used by About Us, Vendor, Partner, Sponsor, Affiliate, and Drivers pages. The link now works from home, product, category, cart, checkout, login/register, account, and public landing pages.
- Copied the supplied contact page assets from `D:/Foodonline desktop version/pages/contact us` into `public/images/contact-us/`. The large grocery/fruit art is used in the left contact panel; inline SVG fallbacks provide crisp visible icons for all contact cards while the supplied icon PNGs remain in the clean public asset folder for future replacement/tuning.
- Built the page as a desktop two-column layout with a pale blue-gray left visual panel, `Let's talk` / `Contact us` copy, help-center link, and large grocery art near the bottom. The right side uses Settings-style rounded white cards with subtle borders, icon circles, blue links, dividers, and responsive grids for Get in touch, Partners, and We're hiring sections.
- Contact behavior: email rows use `mailto:` links, and `Go to your account` links to `#account/settings`.
- Responsive behavior: desktop keeps the left panel sticky/full-height below the fixed header and right content scrolls naturally; tablet/mobile-desktop stack only when needed; mobile portrait stacks the hero panel above single-column cards with no intentional horizontal overflow.
- Checks on 2026-06-12: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and `git diff --check`.

## Contact Us Learn More Removal (2026-06-12)

- Files changed:
  - `src/components/ContactUsPage.tsx`
  - `AGENT.md`
  - `design.md`
- Removed every `Learn more` row/button from the Contact Us page cards so Contact Us stays visually focused on direct email/account links and no longer appends partner/vendor/sponsor hashes such as `#become-partner` to the `/contact-us` URL.
- Contact card heights were tightened after removing the divider/action row. Footer Contact Us route text and footer design remain unchanged.

## Contact Us Hero Image Positioning Fix (2026-06-12)

- Files changed:
  - `src/components/ContactUsPage.tsx`
  - `AGENT.md`
  - `design.md`
- Adjusted only the left Contact Us hero grocery/vegetable image positioning. Header, footer, card content, card grid, contact text, links, icons, and sections were not changed.
- Desktop now anchors the image closer to the pale blue panel's bottom-left edge with a wider left-bottom object position and a smaller intentional left offset. Mobile/tablet now keep the image closer below the hero copy with reduced top gap, slight left bleed, no added background box, and no unnecessary extra hero height.

## Contact Us Hero Background Color Update (2026-06-12)

- Files changed:
  - `src/components/ContactUsPage.tsx`
  - `AGENT.md`
  - `design.md`
- Updated only the Contact Us left hero panel background color from pale blue-gray `#eef3fb` to soft light orange/peach `#f8e1cf`. Header, footer, layout, card content, card grid, icons, text colors, food image, and approved image positioning were not changed.

## Contact Us Flush Hero Image Edge Fix (2026-06-12)

- Files changed:
  - `src/components/ContactUsPage.tsx`
  - `AGENT.md`
  - `design.md`
- Adjusted only the Contact Us left hero food image placement again so the art can sit flush against the orange panel edges. Header, footer, right-side cards, text content, icons, links, grid layout, page structure, and background color were not changed.
- Moved panel padding from the whole left hero container onto the text block only. The food image now lives directly inside the edge-to-edge hero panel with no bottom/side padding around it, uses `object-position: left bottom`, and remains large with intentional edge bleed on desktop, tablet, and mobile portrait.

## Contact Us Hero Image Bottom Edge Fix (2026-06-12)

- Files changed:
  - `src/components/ContactUsPage.tsx`
  - `AGENT.md`
  - `design.md`
- Adjusted only the left Contact Us hero image area to remove the visible orange gap below the food art. Header, footer, right-side cards, text content, routing, page structure, background color, and image asset were not changed.
- The source PNG has transparent pixels below the visible food, so the image now sits inside a no-padding, `line-height: 0`, overflow-hidden art layer and is shifted down slightly. This clips the transparent bottom edge so the visible food meets the panel bottom on desktop, tablet, and mobile while staying flush toward the left edge.

## Wholesaler Page Savings Section Responsive Card (2026-06-12)

- Files changed:
  - `src/components/WholesalerPage.tsx`
  - `src/App.tsx`
  - `src/store/homeStore.ts`
  - `src/components/Header.tsx`
  - `src/data/home.ts`
  - `src/styles.css`
  - `public/images/wholesaler/`
  - `AGENT.md`
  - `design.md`
- Added the new public Wholesaler page route at `/wholesaler` with `#wholesaler` fallback, and connected the existing header `Wholesale Products` navigation item to that route through the shared Zustand routing pattern.
- The supplied Wholesaler section artwork from `pages/wholesaler` was copied into `public/images/wholesaler/` for browser-safe asset URLs. The first hero and third brands sections render the supplied artwork without redesigning those sections.
- Rebuilt only the second `More Savings, More Convenience` / savings offer section as code-native responsive HTML/CSS. Desktop keeps the existing lavender, centered heading, three-column benefit, and bottom-product composition, while tablet/mobile switch to one centered white rounded card on the lavender background.
- Mobile/tablet savings card copy is hardcoded as requested: `Save 10% on every order`, `Flexible delivery and free unloading`, and three stacked benefit rows including the `฿3,000` threshold text.
- The entire savings section uses Montserrat with black text. Headings/labels use 800/900 weights, body and benefit copy use normal 400 weight, dividers stay light lavender/gray, and icon containers use pale orange.
- No separate savings/delivery/package icon files existed in `pages/wholesaler`; the section therefore uses scoped inline SVG fallback icons only for those three row icons. The bottom product collage uses the supplied transparent product cutouts from the Wholesaler asset folder and keeps them anchored inside the card bottom with no colored box behind them.

## Wholesaler Footer Link Fix (2026-06-12)

- Files changed:
  - `src/data/home.ts`
  - `src/components/Footer.tsx`
  - `AGENT.md`
  - `design.md`
- Renamed the Corporate footer item from `Farm Careers` to `Wholesale`.
- Converted that footer item from a plain `#company` string link into a real `/wholesaler` route link and wired Footer to call `openWholesaler()`, matching the existing shared route pattern used by Vendor, Partner, Sponsor, Affiliate, Contact Us, and Drivers links.

## Wholesaler Image Layout Fix (2026-06-12)

- Files changed:
  - `src/components/WholesalerPage.tsx`
  - `src/styles.css`
  - `public/images/wholesaler/`
  - `AGENT.md`
  - `design.md`
- Fixed only Wholesaler page image layout issues in section 2 and section 3. Header, footer, and the hero section were not edited.
- Section 2 product collage now raises all product cutouts above the bottom wave and places the wave on a lower decorative layer, so the product packaging remains visibly above the green base instead of sinking behind it. Mobile/tablet offsets and wave heights are tightened separately to avoid awkward clipping and horizontal overflow.
- Section 3 no longer renders one oversized full-section screenshot. It now renders four real responsive cards using the supplied Wholesaler card images copied from `pages/wholesaler` into `public/images/wholesaler/`: retail, corporate, restaurant/bakery, and food service/hospitality.
- Section 3 card images use fixed aspect-ratio media boxes with overflow hidden and `object-fit: cover`, while titles and body text stay outside the image area so text remains visible on desktop, tablet, and mobile.

## Wholesaler Savings Wave Overlap Tune (2026-06-12)

- Files changed:
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
- Adjusted only the second Wholesaler savings section product collage/wave layering. Header, footer, hero, third section, copy, typography, and asset usage were not changed.

## Wholesaler FAQ Accordion (2026-06-12)

- Added a five-item hardcoded FAQ accordion directly below the `Source products from leading brands` section in `src/components/WholesalerPage.tsx`.
- All items start closed and use accessible button controls with `aria-expanded`, `aria-controls`, labelled answer regions, keyboard-native toggling, and rotating SVG chevrons.
- FAQ styling in `src/styles.css` uses Montserrat, black text, thin row dividers, touch-safe responsive sizing, and the same `#fbf4ff` background as the adjacent brands section. No header, footer, product-card, or image-asset changes were made.

## Footer Return Policy Page (2026-06-12)

- Added a responsive public Return Policy page at `/return-policy`, wired through the shared Zustand SPA route handling and rendered by `src/components/ReturnPolicyPage.tsx`.
- The Company footer column now places `Return Policy` directly below `Privacy Policy`. Clicking it opens the full supplied policy content with Foodonlines.com branding, contact details, general return rules, RMA instructions, disclaimers, and six special-category policies.
- Replaced Yami/Yami.com branding and email references in the supplied source text with Foodonlines.com and `info@foodonlines.com`. Updated files: `src/App.tsx`, `src/components/Footer.tsx`, `src/components/ReturnPolicyPage.tsx`, `src/data/home.ts`, `src/store/homeStore.ts`, `src/styles.css`, `AGENT.md`, and `design.md`.
- Return Policy surface follow-up: removed the white rounded document card, border, shadow, and boxed category backgrounds. Policy content now sits directly on the page's warm neutral background while preserving the centered reading width, section dividers, and responsive spacing.
- The product cutouts now sit behind the green wave again, and the wave is the foreground decorative base. Product bottom offsets and wave heights were tuned so the wave touches and slightly covers the bottom of the packages without burying them or leaving an empty gap.

## Affiliate How It Works Broken Image Fix (2026-06-11)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `AGENT.md`
  - `design.md`
- Fixed the broken How It Works step images by resolving their `src` values through `import.meta.env.BASE_URL`, matching the repo's existing Vite asset pattern for production paths such as `/FoodOnline-Desktop-/`.
- Confirmed the deployed public image files are byte-for-byte copies of the requested source assets in `D:/Foodonline desktop version/pages/affillate page`: `create you acc.png`, `share.png`, and `Earn 5% Commission on Every Referral Purchase (4).png`.
- Header, footer, Affiliate Hero + Stats, and Affiliate Rewards / Referral Cards were not edited.
- Checks on 2026-06-11: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and `git diff --check -- AGENT.md design.md src\\components\\AffiliateHeroSection.tsx`.

## Affiliate Three-Step Image Card Layout Fix (2026-06-11)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `public/images/affiliate/how-it-works/create-account-visual.png`
  - `public/images/affiliate/how-it-works/share-visual.png`
  - `public/images/affiliate/how-it-works/get-started-visual.png`
  - `AGENT.md`
  - `design.md`
- Updated only the Affiliate How It Works / Getting Started Is Easy three-step image/card section. Header, footer, Affiliate Hero + Stats, and Affiliate Rewards / Referral Cards were not edited.
- Added visual-only crops sourced from `D:/Foodonline desktop version/pages/affillate page` so the image cards no longer duplicate the external step number, heading, or paragraph inside the card artwork.
- Normalized all three image boxes to the same shared visual-card structure, dimensions, border radius, border, gradient background, padding, shadow, and responsive sizing. Box 2 and Box 3 now match Box 1 instead of using the old compact mobile/right-side sizing.
- Removed the mobile-only white outer article panels behind the cards so the image card itself is the main visible box. The external number/title/body remain outside the image card for each step.
- Checks on 2026-06-11: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and `git diff --check`.

## Affiliate Three-Step Image Transparency Fix (2026-06-11)

- Files changed:
  - `public/images/affiliate/how-it-works/create-account-visual.png`
  - `public/images/affiliate/how-it-works/share-visual.png`
  - `public/images/affiliate/how-it-works/get-started-visual.png`
  - `AGENT.md`
  - `design.md`
- Updated only the three current How It Works image assets. No card/container CSS, layout, spacing, sizing, border radius, typography, header, footer, Affiliate Hero + Stats, or Affiliate Rewards / Referral Cards code was changed.
- Removed the baked peach/brown background from the current visual PNGs so the existing card background shows through naturally. Step 1 now uses a rounded alpha mask around the signup preview, while Step 2 and Step 3 use transparent background-connected pixels around the social/share and money-bag visuals.
- Card 2 `share-visual.png` preserves the supplied `3Share.png`, `Share (3).png`, and `Share (2).png` Facebook, Instagram, and LINE assets together with the share-network visual; only the old embedded card background was removed.
- Verified the assets have alpha transparency and composited them on a bright test background to confirm the old rectangular fill is removed from the image files.
- Checks on 2026-06-11: `cmd /c npx tsc --noEmit`, `cmd /c npm run build`, and `git diff --check`.

## Affiliate Dashboard / Start Earning Today Section (2026-06-11)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `src/styles.css`
  - `public/images/affiliate/affiliate-dashboard.png`
  - `AGENT.md`
  - `design.md`
- Added `AffiliateDashboardSection` directly below `AffiliateRewardsSection` and above the existing How It Works section. Header, footer, Affiliate Hero + Stats, and Affiliate Rewards / Referral Cards markup were not changed.
- Copied the supplied dashboard source image from `D:/Foodonline desktop version/pages/affillate page/23.Start Earning Today.png` to `public/images/affiliate/affiliate-dashboard.png` and render it with the existing `affiliateImagePath(...)` Vite base-path helper.
- The section uses a soft peach/orange `#ffb28f` background, Montserrat-first scoped typography, a wide white rounded dashboard card, black compact pill `Get Started` CTA with a white circular SVG arrow icon, and the requested alt text `Affiliate dashboard analytics illustration`.
- Responsive behavior: desktop/tablet keep a two-column white card with copy left and dashboard image right where space allows; mobile landscape keeps the card compact; mobile portrait stacks the uploaded dashboard image above centered copy and CTA with no intended horizontal overflow.

## Affiliate FAQ Accordion Section (2026-06-11)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `src/styles.css`
  - `AGENT.md`
  - `design.md`
- Added `AffiliateFaqSection` directly under the current `Getting started is easy` / How It Works section. Header, footer, Affiliate Hero + Stats, Affiliate Rewards / Referral Cards, Affiliate Dashboard, and the existing How It Works section content were not changed.
- Added local `affiliateFaqs` data plus `AffiliateFaqAccordion` with all five requested questions and answers. The product-assortment answer renders the requested three points as a real list.
- Accordion behavior: all items are closed by default, clicking the native button opens/closes an item, only one item is open at a time, `aria-expanded` / `aria-controls` / region labels are wired, and Enter/Space work through native button semantics.
- Design behavior: the section uses a pale blush `#ffe7ea` background, Montserrat-first scoped typography, desktop two-column heading/list layout, subtle divider lines, rotating plus icon state, animated expand/collapse, full-width tablet/mobile stacking, and touch-friendly mobile row heights with no intended horizontal overflow.

## Affiliate Signup CTA Banner (2026-06-11)

- Files changed:
  - `src/components/AffiliateHeroSection.tsx`
  - `src/styles.css`
  - `public/images/affiliate/affiliate-signup-banner.png`
  - `AGENT.md`
  - `design.md`
- Added `AffiliateSignupBannerSection` directly under the Affiliate FAQ accordion. Header, footer, Affiliate Hero + Stats, Rewards, Dashboard, How It Works, and FAQ behavior/content were not changed.
- Copied the uploaded woman-with-box banner image from `D:/Temp/codex-clipboard-0236cdf5-3bd1-4d3d-9665-81cfd58a388f.png` to `public/images/affiliate/affiliate-signup-banner.png`. The first uploaded image was used only as the text/button layout reference.
- The banner uses a full-width cover background image with a semi-transparent warm orange overlay, large white Montserrat headline text `Join our` / `affiliate program`, supporting text `Contact us at info@foodonlines.com`, and a large black pill `Sign up` CTA linking to `#affiliate-apply`.
- Responsive behavior: desktop uses a long banner with copy left and button right while keeping the woman visible on the right; tablet/mobile-desktop scale down spacing/type/button; mobile portrait stacks copy and button over the image with `background-position` biased toward the woman's face and no intended horizontal overflow.
