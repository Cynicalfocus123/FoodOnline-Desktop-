# FoodOnlines Desktop Home Design

## Admin Catalog Portal Design — Phase 4 (2026-07-13)

- The existing dark-green sidebar, citrus active state, rounded white workspaces, typography, spacing, login, users, deletion requests, and settings remain intact. Categories, Brands, and Products are added to that same standalone admin entry; no second admin shell or public storefront redesign exists.
- Category management uses a hierarchy-aware list and full-width editor for identity, parent, status, visibility, order, merchandising flags, SEO, managed tile/icon/desktop/mobile media, aliases, archive, and restore. Brand management follows the same list/editor rhythm with complete searchable ISO country data, active state, order, and managed logo upload.
- Product management uses filterable list/detail composition. The editor is separated into Basics, Variants, Media, Nutrition, and Publication tabs. Variants expose SKU, GTIN, size/net content, pack/package, price/previous price, currency, availability, active/default state, and order. Media cards expose preview, upload/replace, progress, alt text, contain/cover, primary, accessible move controls, and protected deletion.
- Publication readiness is textual, not color-only: every backend readiness error is listed beside current status and publish/archive/restore actions. Forms display safe Laravel validation messages, prevent destructive actions without confirmation, retain saved target state during failed replacement, and disable upload interaction when R2 status is unavailable.
- Responsive behavior uses one-column editors and scroll-safe lists on narrow screens, touch-sized controls, 16px inputs to avoid mobile zoom, no page-level horizontal overflow, and horizontally safe tab/list regions. Reordering always has button controls and is never drag-only. The public storefront layout and behavior remain unchanged.

## Backend Grocery Catalog Architecture — Phase 3 (2026-07-13)

- `Product` is the shared customer-facing grocery identity and belongs to one current `Category` plus an optional reusable `Brand`. It owns descriptive, origin, storage, ingredient, allergen, featured, and publication fields—not SKU, package size, or price.
- `ProductVariant` is the sellable package. It owns normalized unique SKU, optional string GTIN, size/net-content/pack/package fields, FoodOnlines direct-store price and compare-at price, configured currency, availability, active state, and order. One transactional service makes the first active variant default, clears sibling defaults, and promotes another active variant when possible.
- `ProductMedia` stores image metadata only: safe local/HTTPS/R2 metadata path, alt text, `contain`/`cover`, primary state, and order. The first image becomes primary, selecting another clears the previous primary, and deleting the primary promotes the next ordered image. Uploading, byte processing, thumbnails, and R2 credentials remain deferred.
- Public list compatibility fields (`price`, `old_price`, `currency_code`, `in_stock`, `availability_status`, `size`, and `sku`) derive from the active default variant. `primary_image`, `image_urls`, and `image_fit` derive from ordered media. Detail adds food fields, active variants, ordered media, and category/brand summaries without exposing audits, inactive variants, or internal state.
- Current prices deliberately represent the FoodOnlines direct-store retail price. A later supplier-marketplace phase may separate seller offers, seller-specific prices, inventory, and fulfillment without moving shared grocery identity into offer records.
- No dynamic attributes, category-specific custom-field engine, fake catalog import, frontend API switch, or visual design change was made. Existing React catalog behavior and all approved visual surfaces remain unchanged.

## Permanent Documentation and Backend Delivery Contract (2026-07-13)

- Every task reviews and updates all tracked Markdown documentation, with `AGENT.md`, `design.md`, and `weight.md` always reflecting the newest state above historical snapshots.
- Backend delivery is complete only when final source and deterministic `backend-live/` are together on `main`, verified, and pushed. Feature branches are staging areas, not the final Git/live-folder state.
- Backend delivery is one atomic workflow: authoritative Laravel edit → tests/validation → generated mirror sync and stale cleanup → parity verification → one combined commit → automatic `main` push. Generated mirror files are never hand-edited or rebuilt by another agent.

## Backend Category Architecture — Step 2 (2026-07-13)

- Categories are an adjacency list (`parent_id`) with synchronized `depth` and slug-based `path` metadata. Four levels are supported. Centralized transactional validation rejects self-parenting, cycles, descendant moves, and moves that would make any subtree too deep.
- Public catalog responses use string IDs, UUIDs, stable names/slugs/descriptions, normalized media URLs, feature/navigation/homepage flags, default sort, and children. Lists expose published public categories only; `catalog_only` records remain directly addressable, while hidden/draft/archived/deleted records and audit fields stay private.
- Admin category management uses the existing bearer-admin trust boundary and includes filtered pagination, hierarchy moves, exact sibling ordering, archive/restore, confirmed permanent deletion, aliases, publication/visibility state, image/icon/desktop/mobile banner paths, SEO metadata, and timestamps.
- Category aliases are explicit records for legacy or renamed slugs. A published canonical slug change automatically preserves the prior slug as an active 301 alias; JSON lookup returns canonical data and alias-resolution metadata.
- The current 16 frontend categories remain roots so existing route expectations do not gain an invisible parent. Products and category-specific attributes are future relationships for Step 3; no product table, frontend API switch, media upload, R2, inventory, order, payment, or visual-design change is part of Step 2.
- `backend-live/` is the repository deployment mirror for backend work. It is deterministically regenerated from whitelisted Laravel runtime source plus `deployment/hostinger/backend-public/`; its public entry is isolated from the frontend `public/.htaccess` and its SHA-256 manifest must verify before commit.

## Backend Foundation Architecture — Step 1 (2026-07-13)

- The repository root is the single Laravel 12 application root. The backend is a versioned JSON API whose production contract begins at `https://www.api.foodonlines.com/api/v1`; public and standalone-admin frontends remain API clients and were not redesigned.
- `/api/v1/auth` owns public registration, login, session restoration, and logout for `customer`, `supplier`, and `partner` accounts. `/api/v1/account` owns the existing authenticated address book, notification preferences, masked payment metadata, password, and deletion-request flows.
- `/api/v1/admin` is a separate trust boundary with a distinct token table, middleware, shorter token lifetime, login throttle, and admin-role/status checks. Public tokens cannot authorize admin routes, and admin tokens cannot authorize public account routes.
- Bearer tokens are returned once to the client and stored server-side only as SHA-256 digests. New public tokens default to 30 days; new admin tokens default to 8 hours. Logout revokes the current digest, password rotation revokes other active sessions, and legacy null-expiry tokens remain readable during migration.
- API errors remain JSON under `/api/*`; unknown endpoints/resources return a safe generic 404. Exact production CORS origins are `https://foodonlines.com` and `https://www.foodonlines.com`. Named throttles protect the whole API plus stricter registration/public-login/admin-login boundaries.
- `GET /api/v1/health` is a dependency-light liveness response. Database queue tables exist as foundation, while `.env.example` keeps `QUEUE_CONNECTION=sync` until a persistent Hostinger worker is deliberately configured.
- `/api/v1/catalog` is reserved and intentionally empty. Step 2 may add catalog read models and routes inside that boundary only after the Step 1 code is deployed, production migrations run, and live auth/admin smoke tests pass.
- This backend foundation changes no visual layout, responsive behavior, public navigation, or admin presentation.

## Production Routing and Deployment Safety (2026-07-12)

- The active Hostinger site is a domain-root deployment. Production entry files, lazy chunks, CSS, and runtime media therefore use root-based `/assets/` and `/images/` URLs so clean nested routes and trailing-slash reloads cannot change where browser requests land.
- Clean public URLs are the primary navigation contract for auth, account, catalog, product, search, cart, checkout, company, support, partner, Driver, Wholesaler, legal, and informational pages. Legacy hash routes remain readable for compatibility, while in-page anchors are reserved for real sections that exist in the document.
- Apache serves `index.html` only for application routes, serves `admin.html` for `/admin`, and never rewrites missing static files to HTML. This keeps module MIME failures from turning into blank screens and avoids caching HTML under stale chunk names.
- Lazy-route loading now has a visible loading state and a user-facing reload recovery state. These states preserve the existing shared header/footer and do not redesign any approved page.
- Footer and header destinations use real routes. Recipes, Company News, Our Mission, Accessibility, and Sitemap share one restrained warm-background information-page design with the normal FoodOnlines header/footer rhythm.
- Driver and Wholesaler artwork, proportions, crops, and responsive layouts remain unchanged. Only delivery paths, route safety, and missing-reference enforcement changed.

## Source Direction

- Visual reference: clean grocery commerce layout with white space, green/orange accents, product cards, category tiles, and promotional hero blocks.
- Brand mark: `public/assets/food-online-long-text-cutout.png`, used top-left in fixed header without text, badge, or container.
- Main slider background video: `public/assets/food-horizontal.mp4` on desktop and the YouTube embed `https://www.youtube.com/embed/x-ZFmik0geY` on mobile.
- Splash signup video: `https://cdn.dribbble.com/userupload/37155242/file/original-dfa8adc9e11296c13069bce9286cb596.mp4`.

## Page Structure

- Fixed modern white header with larger long transparent FoodOnlines logo, desktop navigation, and signup shortcut.
- Shared header search keeps the current two-row layout, rounded border, search icon, and search CTA, but no longer shows the small camera icon.
- Shared header search now works across all public pages and routes to hash-safe `#search/:query` results without changing the existing product-detail `#product/:productId` route behavior.
- Full-viewport home hero with background food video, dark overlay, centered offer copy, and one primary Join Us Now CTA.
- Signup opens into a multi-step app flow: role selection, split brand-and-form layout, then registration complete state.
- Public auth now stays inside the same visual system: homepage remains the first screen, Register opens the existing split signup layout, and Login uses a matching split layout. Register/Login are the main entry flow.
- Category strip for common food paths.
- Best deals grid with product cards, discount tags, prices, and add-to-cart buttons.
- Footer has two compact stacked link groups: Privacy/Terms/FAQ/Company News/Our Mission/Contact Us, then Seller/Recipe/Partners.

## Implementation Notes

- 2026-07-12 Hostinger packaging direction: the default production build uses domain-root `/` frontend/media paths so clean nested routes resolve entry modules, lazy chunks, and media from `public_html`. Explicit GitHub Pages and `VITE_BASE_PATH` deployments keep their existing overrides; visual and runtime behavior is unchanged.
- React + TypeScript + Vite.
- 2026-07-12 performance direction: production builds now use an explicit public-asset manifest copy after Vite build instead of shipping the whole `public/` tree. Runtime-visible media remains visually equivalent, while unused reference/source assets stay out of `dist`.
- 2026-07-12 media delivery direction: the homepage hero video remains the same muted looping decorative MP4 experience, but the hosted file is FFmpeg-compressed H.264/yuv420p fast-start at 1600x682 with no audio. Footer-linked page media for Wholesaler, Driver, About, Contact Us, Become Vendor, Become Partner, and Affiliate now references optimized WebP variants where raster PNG weight was excessive.
- 2026-07-12 loading direction: non-home route components are code-split with React lazy loading. The homepage shell, hero, categories, product rows, footer, and promo behavior stay eager so the first screen does not go blank, while footer-linked pages, account, auth, legal, cart, checkout, search, category, and product-detail chunks load on demand.
- 2026-07-12 live deployment note: current live hosting is Hostinger File Manager. GitHub Pages still has an automated workflow for `main`, but Hostinger File Manager upload requires access outside this local session.
- Zustand stores shared signup form state for hero and splash email forms.
- Zustand now also stores the shared public search input and submitted search query so one header search bar can be reused across home, category, product detail, cart, checkout, login, and signup.
- Tailwind CSS owns responsive layout, colors, spacing, shadows, and buttons.
- Search matching is case-insensitive and tolerant of spaces, hyphens, punctuation, and compact combined words. It checks product name, category, brand/provider, tags, badges, size/unit, and origin fields from `src/data/home.ts`.
- Public search results use the existing `ProductCard` component in a responsive grid and keep the same open-product, add-to-cart, quantity, and favorite behavior as other public product surfaces.
- Mobile search input keeps a minimum 16px font size and stable line-height so iOS Safari, Android Chrome, and in-app mobile browsers do not auto-zoom or distort the fixed header when the field is focused.
- Promo overlay now fits inside the viewport on desktop, desktop-mobile browser widths, tablet, iOS, and Chrome. The welcome-offer modal uses max-height guards plus vertical scrolling instead of letting the popup art/body overflow and get visibly cropped on shorter screens.
- Homepage splash hero uses the supplied YouTube embed `https://www.youtube.com/embed/siItG3lu1To` as a cover-style background iframe with muted autoplay, loop, inline playback, and hidden controls. The hero headline now reads `Global food and groceries delivered fast to your door`.
- Promo overlay now renders above the fixed header and uses safe-area-aware viewport padding plus scroll containment, preventing the welcome-offer popup from being clipped by the header on desktop, desktop-mobile browser widths, tablet, iOS, Chrome, and short-height screens.
- `Masala, Oil & More` now uses a dedicated 60-image real product set from `public/assets/masala-oil-more-mockups`, with the first 15 images reserved for the homepage rail and all 60 used across the category grid without repeats.
- `Sauces & Spreads` now uses a dedicated 60-image real product set from `public/assets/sauces-spreads-mockups`, with the first 15 images reserved for the homepage rail and all 60 used across the category grid without repeats.
- `Chicken, Meat & Fish` now uses a dedicated 60-image real product set from `public/assets/chicken-meat-fish-mockups`, with the first 15 images reserved for the homepage rail and all 60 used across the category grid without repeats.
- `Organic & Healthy Living` now uses a dedicated 60-image real product set from `public/assets/organic-healthy-living-mockups`, with the first 15 images reserved for the homepage rail and all 60 used across the category grid without repeats.
- `Vegan Foods` replaces `Baby Care` on the homepage and category listing surfaces, now uses a dedicated 60-image real product set from `public/assets/vegan-foods-mockups`, still reuses the organic food-forward category tile art, and keeps `#category/baby-care` as a hash-safe alias so older shared links still open the renamed category page.
- `Frozen` now uses a dedicated 60-image real product set from `public/assets/frozen-mockups`, with the first 15 images reserved for the homepage rail and all 60 used across the category grid without repeats.
- Product cards now treat any real image loaded from a `public/assets/*-mockups/` folder as an expanded category packshot, so newer categories such as `Frozen`, `Vegan Foods`, `Organic & Healthy Living`, and `Chicken, Meat & Fish` render visibly on category grids without needing per-category UI allowlists.
- Public behavior now uses live Laravel API auth. Registration posts to `POST /api/v1/auth/register`, login posts to `POST /api/v1/auth/login`, session restore uses `GET /api/v1/auth/me`, and logout posts to `POST /api/v1/auth/logout`.
- Email auth behavior update on 2026-05-31 keeps the existing login/register layouts, but improves production behavior behind them: email register now receives a real bearer token/user session response, stores that session through the same public auth store as login, and shows clearer required/invalid email/password messages. Phone-based checkout fallback behavior is unchanged.
- Public/admin API base config lives in `src/lib/runtimeConfig.ts` and defaults to `https://www.api.foodonlines.com/api/v1`.
- Signup form fields should allow natural spacing while typing words, with final cleaned values still validated and normalized before completion.
- Signup now includes password and confirm password with minimal design change so newly registered public users can log in immediately.
- Signup and login password fields include compact eye toggles, preserving the current form layout.
- Phone-number entry now uses a compact left-side country-code selector on register contact number, public phone login, and checkout phone login. The closed selector shows only short country code plus dial code, such as `US +1` or `JP +81`, while the native dropdown keeps country names available for selection. It uses native mobile/desktop dropdown behavior for iOS Safari, Android Chrome, desktop Safari/Chrome, tablet, and narrow desktop-mobile browsers.
- Login forms keep email and phone as separate modes so the phone dial code selector appears only for number login and never prefixes email values.
- Signup is one responsive flow for desktop and mobile. The shared registration submit path posts JSON to the live Laravel endpoint with the same payload used by the last known working desktop signup.
- Mobile signup inputs disable autocapitalization/autocorrection for email, Line ID, password, and confirm password to prevent mobile keyboard mutation without changing layout.
- Logged-in users stay on the public homepage storefront design and see account identity only in the header account control/dropdown. The homepage must not render a separate signed-in account summary block or extra logout panel.
- Public page switches reset scroll position to the top for home, signup, and login so navigation never inherits the previous page's scroll depth.
- Become-a-vendor signup/login CTAs preserve browser history. Clicking the image-overlay buttons routes to explicit `#signup` or `#login` entries while leaving `/become-vendor` behind them, so browser Back returns to the vendor page and Forward restores the auth screen. Successful auth can also return to `become-vendor`, `about-us`, or `company/drivers` through the shared auth return-route logic.
- Become Vendor page design update on 2026-06-04: the page is now a continuous responsive light-green landing page (`#c4dfb8`-style background) built from real React/HTML sections instead of full text-banner images. It preserves the original black bold headline style, orange outline CTA buttons, green brand accents, stats row, selling/globe section, white scale cards, colorful three-step cards, and final signup/login CTA while keeping all text editable and readable on desktop, tablet, and mobile. Banner images are no longer used as full text sections because the embedded text was too small on mobile; local logo/product assets and code-drawn decorative icons/illustrations are used only as visuals.
- Become Vendor typography/hero refinement on 2026-06-04: the top hero visual uses the original banner crop inside the two original-style circles, with no extra product-image circles. Stats no longer includes the FoodOnlines logo. The page uses a Poppins-first type stack with semibold emphasized text, regular supporting text, a smaller simple-steps heading, and larger step-card body copy for mobile and desktop readability.
- Become Vendor responsive typography and image-fit follow-up on 2026-06-04: all existing vendor-page text remains unchanged, but heading, stat, card, step, paragraph, and CTA type scales are reduced so desktop, tablet, mobile, and desktop-mobile browser widths read closer to the supplied samples. The hero blue/yellow oval image crops now use responsive percentage sizing/positioning so the original vendor hero art stays visible without drifting upward or zooming too far. The `Who's Selling on Globally?` globe visual now crops from the original `vendor-selling.png` artwork instead of using a code-drawn globe, and the stats row uses compact two-column mobile spacing with orange metric numbers and grey supporting copy.
- Become Vendor globe/hero food art update on 2026-06-04: the selling/globe section uses the supplied food-surrounded green globe image directly, stored at `public/images/become-vendor/vendor-food-globe.png`. The top hero visual now uses two plain colored circles with separate transparent tomato and leafy vegetable cutouts layered above them, allowing the food to protrude outside the circle edges like the provided reference while preserving the existing text layout and CTA words.
- Become Vendor art correction on 2026-06-04: the globe visual now uses the transparent supplied `vendor-food-globe-transparent.png` file with no background panel behind it, allowing the vendor page's light-green background to remain visible. The hero now uses two separate transparent image assets, a leafy vegetable for the blue circle and tomatoes for the yellow circle, each scaled smaller and positioned within its own circle while protruding only slightly beyond the circle edge.
- Become Vendor FAQ accordion update on 2026-06-05: the page now includes a sample-inspired `Have any questions?` FAQ section directly below the onboarding/three-step content. It stays on the same light-green page background, uses the page's Poppins-first typography, subtle horizontal dividers, semibold question rows, normal blue-gray answer copy, and right-aligned rotating chevrons.
- Become Vendor FAQ responsive direction: FAQ items are closed by default and expand on click through accessible button rows. The layout uses fluid `clamp()` sizing, full-width flexible rows, minimum touch-safe row height, stable chevron sizing, wrap-safe answer text, and no horizontal overflow across mobile Safari/iPhone widths, Android Chrome/browser views, tablet portrait/landscape, Chrome/Safari desktop, and wide desktop screens.
- Become Partner page design on 2026-06-05: added a new continuous soft light-pink landing page for `/become-partner`, matching the provided banner samples with real hardcoded React text instead of rendering full banner images as content. The background stays near `#f8e9ee` across hero, value cards, and final CTA so the page reads as one smooth scroll.
- Become Partner typography and layout direction: the page uses Poppins-first typography, bold large titles/card titles, normal paragraph copy, black main text, and the sample's pink accent for the final `Let's Talk` CTA. Text line breaks, left/top placement, centered card-section heading, staggered card arrangement, and final left-copy/right-button layout are recreated with responsive HTML/CSS rather than embedded image text.
- Become Partner image direction: separate provided assets are used for the food table, teamwork image, fruit plate circle, leaves, and three line icons. Full partner banner images are not used as page sections because mobile readability and responsive scaling require selectable text and independent image placement.
- Become Partner responsive behavior: desktop aims to match the 1650px reference compositions, while mobile/tablet stack hero media, cards, and final CTA cleanly with `clamp()` sizing, max-width guards, object-fit image handling, large tap targets, keyboard focus styling, and no horizontal overflow across phone, tablet, desktop, and wide desktop breakpoints.
- Become Partner visual tune on 2026-06-05: value-card line icons are larger and more legible, the `Partner with the World's Largest Online Supermarket` heading sits visually above the cards instead of behind them, the leaf accent is closer to the fruit plate, and the teamwork image area is widened to better match the requested scale.
- Become Partner card/leaf follow-up on 2026-06-05: card bottoms now have enough section space and visible overflow so rounded lower corners are not cut off, card icons are scaled much larger for emphasis, and the leaf decoration is about 40% larger and placed nearer the fruit dish.
- Become Partner mobile image/icon sizing follow-up on 2026-06-07: the hero food table and teamwork visuals are no longer treated like small contained images inside large pale boxes. They now use large responsive object-cover image surfaces with no extra card shadow behind them, while the three value-card icons are oversized inline SVGs centered inside each white card with reserved icon space for phone, tablet, desktop-mobile, and desktop readability.
- Become Partner teamwork image enlargement follow-up on 2026-06-07: the teamwork hero image is the emphasized visual and now uses a taller mobile surface, larger desktop/tablet height, and a wider desktop/tablet column so it appears roughly 200% larger on desktop and about 250% larger on mobile. The page still avoids a separate background box or shadow panel behind that image.
- Become Partner hero proportion correction on 2026-06-07: the hero image band returns to a balanced side-by-side composition with the teamwork image back at its prior responsive side size and the food banner no longer oversized. The fruit dish and leaf are visible on mobile-desktop/tablet widths, positioned above the hand image with enough vertical space to avoid cramped overlap.
- Become Partner mobile-desktop hero/icon follow-up on 2026-06-07: value cards use the original uploaded PNG icon images again at a much smaller rendered size for desktop, mobile-desktop, Chrome, and Safari. The hand/teamwork image is enlarged by about 40% while the food-table image keeps its existing placement, and the fruit dish/leaf are anchored to the hand-image wrapper so they sit next to/above that banner on mobile-desktop layouts and scale with it.
- Become Partner dish/leaf proximity follow-up on 2026-06-07: the fruit dish and leaf now sit closer to the hand/teamwork banner on desktop and mobile-desktop layouts by reducing the wrapper's top decoration space and lowering the decoration offsets while preserving stable wrapper-based positioning.
- Become Partner mobile side-by-side follow-up on 2026-06-07: mobile widths now keep the food-table and hand/teamwork images side by side instead of stacking. Hero minimum heights, image heights, and card-section top spacing were reduced so the value-card heading follows the hero media closely, and the original PNG card icons now render at a larger 60%-style scale.
- Become Partner desktop/mobile cleanup on 2026-06-07: the hero no longer renders the decorative fruit dish or leaf images. Mobile-desktop widths keep the two hero images close together with a small gap, while tablet/desktop keep roomier spacing and desktop gets more vertical separation between the copy and image band. The three value-card PNG icons use a large normal responsive size across Chrome, Safari, tablet, iOS, and mobile-desktop breakpoints.
- Become Partner redo on 2026-06-07: the original PNG value-card icons are enlarged again with larger rendered dimensions and matching reserved icon slots so the visible line art is large on all supported breakpoints. The hero image band now uses a mobile-desktop/tablet-specific wide-left/narrow-right two-column layout with a tight gap, matching the supplied food-banner-plus-hand-photo reference, while `lg` desktop preserves its own larger spacing and extra vertical separation below the intro copy.
- Become Partner icon asset and mobile-desktop image fix on 2026-06-07: the three uploaded PNG card icons were cropped from their oversized blank canvases so the visible black line art appears large inside each white card. The pre-`lg` hero media layout now gives the hand/teamwork image a larger right column and taller responsive image height for mobile-desktop while preserving the separate desktop breakpoint behavior.
- Become Partner mobile card whitespace fix on 2026-06-07: mobile value cards no longer force a tall minimum height. The card icon area, title margin, and body margin are tightened so the large cropped PNG icon sits close to the text and the cards shrink to content instead of showing long empty white panels.
- Footer design update for Become Partner: the Corporate footer link formerly labeled `Our Suppliers` is now `Become a Partner` and routes to the new partner page while the existing `Become a Vendor` link remains unchanged.
- Generated build, dependency, and dev-log folders stay untracked via `.gitignore`.
- README documents local install, dev, and build commands.
- Production build now uses relative asset paths so the frontend can be uploaded safely into `public_html/app/` on cPanel without breaking asset URLs.
- Public site must not include admin entry buttons or inline admin routing. Standalone admin lives on separate page entry `admin.html`.

## Backend/Admin Design

- Admin phase 1 mockup uses standalone one-card login screen with only `Admin` and `Password` fields.
- After login, admin shows dark sidebar dashboard with `Overview`, `Users`, and `Admin Settings`.
- `Users` includes role tabs for `Customers`, `Suppliers`, and `Partners`.
- Admin users table now fetches live backend/database records through `GET /api/v1/admin/users?account_type=...` and keeps the role tabs for `Customers`, `Suppliers`, and `Partners`.
- Signup users appear approved instantly by default when backend status is active. No separate approval queue UI remains.
- Action column uses one styled dropdown control again, with `Move to Review` and `Delete User` preserved visually for the existing admin design.
- Table design shows all frontend signup fields plus backend metadata so live Laravel + MySQL records map into the admin screens without redesign.
- Security presentation should stay visible in admin design: generic login errors where needed, safe text rendering, archive-not-delete actions, and Laravel handoff notes for CSRF, rate limiting, hashing, and audit logs.
- Backend scaffold now targets Laravel API auth paths `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, and `GET /api/v1/auth/me`, with admin live users on `GET /api/v1/admin/users?account_type=...`.
- TMDHosting/cPanel deployment design should keep Laravel app outside `public_html`, expose only backend `public/`, and use `.env` for MySQL, mail, app URL, and `FRONTEND_URL`.
- Public cPanel output is the `frontend-upload/` folder plus ZIP `foodonlines-tmdhosting-cpanel-upload.zip`, containing `index.html` for public, `admin.html` for admin, `favicon.svg`, shared `assets/`, `.htaccess`, and `DEPLOYMENT-INSTRUCTIONS.txt`.
- Deployment routing must preserve split entries: `index.html` must always load the public `main-*.js` bundle, `admin.html` must always load the admin `admin-*.js` bundle, and `.htaccess` must rewrite `/admin` to `admin.html` while all other SPA paths fall back to public `index.html`.
- Latest cPanel packaging keeps root-relative deployment safe: built HTML entries reference `./assets/...`, uploaded ZIP extracts files at the archive root instead of nesting under `frontend-upload/`, and `.htaccess` leaves real `assets/` requests alone so missing asset mistakes do not get masked by SPA fallback.
- No visual design changes in admin API connection fix. Admin page now calls correct Laravel API host behind the scenes.
- Frontend auth fix made no redesign changes. Only guest controls were removed, password eye toggles added, signup validation messaging improved, and signup banner sizing aligned with login.
- Mobile signup fix made no visual design changes. It aligned mobile signup with the same shared Laravel registration submit logic, added `password_confirmation`, preserved password eye toggles, and generated cPanel ZIP `foodonlines-mobile-signup-fix.zip`.
- Signup regression fix made no visual design changes. It restored the previous working signup payload keys, kept the shared desktop/mobile flow, preserved password eye toggles and banner sizing, improved server error display, and generated cPanel ZIP `foodonlines-signup-regression-fix.zip`.
- Page navigation scroll fix made no visual design changes. It resets scroll to top when switching public SPA pages and generated cPanel ZIP `foodonlines-scroll-top-fix.zip`.
- White page deployment fix made no UI changes. It keeps the `/app/` cPanel deployment scoped correctly and prevents missing `assets/` files from being rewritten to `index.html`, so asset upload/extraction mistakes show as missing assets instead of blank module-load failures.
- Homepage/frontpage redesign on 2026-05-23 now follows grocery ecommerce reference closer to Yamibuy/Blinkit while preserving existing route structure, signup/login/account flows, and light production build behavior.
- Files changed for 2026-05-23 redesign: `src/App.tsx`, `src/components/Header.tsx`, `src/components/HeroSlider.tsx`, `src/components/ShortcutRow.tsx`, `src/components/CategoryStrip.tsx`, `src/components/DealsGrid.tsx`, `src/components/ProductCard.tsx`, `src/components/ProductCarousel.tsx`, `src/components/MockIcon.tsx`, `src/data/home.ts`, `src/styles.css`, `index.html`, `admin.html`, and `public/favicon.svg`.
- Header design now uses two fixed rows: top utility row with delivery ZIP selector left and language dropdown right, then main row with FoodOnlines logo, public nav, and auth buttons.
- ZIP panel design: clicking header location chip opens large right-side slide panel with dim backdrop, red save CTA, large X close button, and outside-click close. This is mock frontend only with no backend validation yet.
- Language dropdown design: globe trigger opens compact white card with radio-style language options; current language text updates in header immediately; Arabic row uses RTL direction for correct visual alignment.
- New icon shortcut row sits directly below header and above hero. Desktop shows evenly spaced icons with centered 13px to 14px labels; mobile keeps horizontal scroll and thin bottom divider.
- Browse All Categories section now uses rounded image cards with soft neutral framing and centered labels for 20 categories: Paan Corner, Dairy/Bread/Eggs, Fruits/Vegetables, Cold Drinks/Juices, Snacks/Munchies, Breakfast/Instant Food, Sweet Tooth, Bakery/Biscuits, Tea/Coffee/Milk Drinks, Atta/Rice/Dal, Masala/Oil/More, Sauces/Spreads, Chicken/Meat/Fish, Organic/Healthy Living, Vegan Foods, Pharma/Wellness, Cleaning Essentials, Home/Office, Personal Care, and Pet Care.
- Promotional banner added below categories: yellow/orange gradient, stacked mock product art on left, `Memorial Day Sale` headline, large red `UP TO 80% OFF` message, and black `Shop Now` button.
- Product system now uses reusable `ProductCard` + `ProductCarousel` components. Homepage renders 19 category sections, each with 15 mock products from `src/data/home.ts`, horizontal scroll, desktop arrow controls, delivery badges, compact two-line product titles, muted size text, bold price, and green outlined `ADD` button.
- Mock homepage data file location is `src/data/home.ts`. It now stores language options, shortcut rows, category definitions, promo banner content, and generated placeholder product/category art so later API integration can swap data without redesigning components.
- Typography update: product card titles use compact ecommerce weight/line-height with two-line clamp; category and shortcut labels use small centered medium-weight copy; global font fallback stack now prefers `Inter`, `Nunito Sans`, `Poppins`, then system sans.
- Lightweight asset direction: temporary favicon is `public/favicon.svg`; category/product visuals use generated SVG placeholder art to avoid heavy image payloads while design iteration is in progress.
- Build/test commands used for this redesign: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 homepage redesign: `59eae19`
- Next recommended improvements: persist ZIP/language preferences, connect carousel/category content to backend catalog API, swap mock art for optimized WebP/SVG content images, and optionally add skeleton loading for API-backed rows.
- Header/menu reference alignment fix on 2026-05-23 updates only homepage header/menu structure and spacing, leaving product carousels, product cards, backend, and other homepage sections unchanged.
- Header files changed for this fix: `src/components/Header.tsx`, `src/data/home.ts`, `src/components/ShortcutRow.tsx`, and `src/App.tsx`.
- Header menu now reads `Home`, `Recipe`, `Coupon`, `Products`, `Healthy Product`, `Wholesale Products`, and `Deal-of-the-week` in that order on desktop, with `Products` showing a small dropdown chevron and `Home` / `Wholesale Products` using green accent similar to reference.
- Location button placement now sits directly beside logo and before `Home` inside same header row. Pill style uses white background, light gray border, small location pin icon, optional `DELIVER TO` label, and ZIP `91789`.
- Right-side desktop control order is now `Register / Sign in`, language button, then cart button. Language keeps globe icon + selected text + chevron; cart uses rounded white pill with basket icon.
- Category/shortcut row spacing fix: homepage top offset increased in `src/App.tsx`, and `ShortcutRow` now adds extra top/bottom spacing so fixed header, shortcut row, and hero/banner no longer collide on desktop, tablet, or mobile.
- Build/test commands used for this header fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 header/menu fix: `dfa2322`
- Footer redesign on 2026-05-23 updates only footer presentation/content. Current footer uses a four-column desktop layout: large logo/contact block at left and three link columns titled `Company`, `Account`, and `Corporate`.
- Footer files changed for this redesign: `src/components/Footer.tsx` and `src/data/home.ts`.
- Footer content now mirrors reference with left description `We bring Grocery to your door for less`, Bangkok office address, phone, email, hours, and full text link lists for distributor/account/corporate sections.
- Footer styling direction: white background, generous column spacing, dark blue-gray headings/body links, larger logo block, green contact icons, and responsive stacked behavior for smaller screens.
- Build/test commands used for this footer redesign: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 footer redesign: `5154615`
- Header/category spacing tune on 2026-05-23 changes only spacing between fixed header, shortcut/category icon row, and hero/splash video. Goal is tighter ecommerce spacing with no overlap.
- Files changed for this spacing/cart update: `src/App.tsx`, `src/components/Header.tsx`, `src/components/ShortcutRow.tsx`, and `src/components/HeroSlider.tsx`.
- Spacing direction: reduced main top padding under header, reduced shortcut row vertical padding, and reduced hero inner top spacing so header, icon row, and splash video sit closer together but remain separated and readable on desktop, tablet, and mobile.
- Cart icon direction: desktop and mobile cart controls now use wheeled shopping cart icon instead of basket icon, while keeping same rounded pill button shape.
- Build/test commands used for this spacing/cart update: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 spacing/cart fix: `c831e6c`
- Promotional coupon UI added on 2026-05-23 as homepage-only floating experience. Feature includes sticky bottom-center promo bar, desktop centered promo modal, and mobile bottom-sheet promo modal.
- Promo files changed for this feature: `src/App.tsx`, `src/components/PromoExperience.tsx`, `src/components/PromoStickyBar.tsx`, `src/components/PromoModalDesktop.tsx`, `src/components/PromoModalMobile.tsx`, and `src/lib/promoStorage.ts`.
- Sticky promo bar direction: compact floating pill-like strip centered at viewport bottom with dark translucent background, coupon/ticket visual on left, `Use code: WELCOME for 10% off!` text, and clickable `Copy Code` cue.
- Desktop promo behavior: clicking sticky bar opens centered modal overlay above homepage with dim backdrop, pink promotional art header, 10% offer card, benefits list, copy CTA, and close `X`.
- Mobile promo behavior: clicking sticky bar opens mobile-friendly stacked bottom sheet with readable spacing, close `X`, `Copy Code`, and `Later` actions.
- Dismiss behavior: only explicit dismiss via `X` permanently hides promo and sticky bar by saving localStorage flag in `src/lib/promoStorage.ts`; normal close actions such as backdrop click or `Later` only close the modal.
- Build/test commands used for this promo feature: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 promo UI: `9f786a4`
- Promo modal centering tune on 2026-05-23 adjusts desktop popup only. Modal is now smaller and better centered in viewport instead of reading oversized and offset left/high.
- Promo centering files changed for this follow-up: `src/components/PromoExperience.tsx` and `src/components/PromoModalDesktop.tsx`.
- Desktop promo tuning: reduced modal width, tightened top art block and body spacing, and forced overlay content wrapper to justify modal in exact horizontal center.
- Build/test commands used for this promo centering tune: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 promo centering tune: `9360f17`
- Promo bar contrast tune on 2026-05-23 updates sticky promo bar only. Floating bar now uses darker translucent neutral surface so white text remains readable over pale/white content backgrounds.
- Promo bar contrast files changed for this follow-up: `src/components/PromoStickyBar.tsx`.
- Visual tuning: darker neutral gradient, stronger shadow, slightly stronger border, and brighter secondary text/underline treatment while keeping floating translucent feel.
- Build/test commands used for this promo bar contrast tune: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 promo bar contrast tune: `95a8f71`
- Promo modal size/CTA simplification on 2026-05-23 tunes popup footprint and actions only. Promo now uses one main copy button and smaller centered card sizing across desktop, tablet, and mobile.
- Promo resize files changed for this follow-up: `src/components/PromoModalDesktop.tsx`, `src/components/PromoModalMobile.tsx`, and `src/components/PromoExperience.tsx`.
- Responsive tuning: desktop modal max width reduced, mobile modal changed from larger sheet feel to smaller centered card, overlay centers modal on all breakpoints, and duplicate/secondary CTA buttons were removed.
- Build/test commands used for this promo resize/CTA fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-23 promo resize/CTA fix: `90ad5e4`
- Header/hero/category cleanup on 2026-05-24 updates only presentation of header controls, hero copy, and category tile density.
- Files changed for this cleanup: `src/components/Header.tsx`, `src/components/HeroSlider.tsx`, and `src/components/CategoryStrip.tsx`.
- Header direction: location stays as icon + text pill; `Register / Sign in` now behaves like plain text navigation with icon instead of bordered pill button.
- Hero direction: removed small top badge and removed public descriptive paragraph so splash area feels cleaner and less text-heavy.
- Category direction: home `Browse all categories` grid now uses compact 5-column small-screen layout with smaller cards, smaller icon chips, and smaller type to better match dense Yami-style mobile browsing.
- Build/test commands used for this cleanup: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-24 cleanup: `5670d48`
- Location text-style tweak on 2026-05-24 adjusts only the visible location trigger in header.
- Location tweak files changed for this follow-up: `src/components/Header.tsx`.
- Header location direction: visible control now presents as simple icon + text instead of stacked `DELIVER TO` pill, matching the cleaner reference while still opening the existing ZIP modal.
- Build/test commands used for this location tweak: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-24 location tweak: `b7048db`
- Header/search layout update on 2026-05-24 changes only homepage header, search, navigation controls, and spacing around the shortcut/category row.
- Files changed for this header/search update: `src/components/Header.tsx`, `src/components/ShortcutRow.tsx`, and `src/App.tsx`.
- Header layout direction: desktop header now has two rows. Row one keeps FoodOnlines logo, ZIP/location pill, nav links, `Register / Sign in`, language, and cart aligned high in the header. Row two adds the main centered search experience.
- Desktop search bar direction: large rounded search form uses strong dark border, soft neutral fill, search icon, placeholder `Search groceries, snacks, drinks and more`, no camera icon, and dark search button.
- Mobile search direction: mobile top row keeps logo, ZIP/location, optional language, cart, and hamburger visible, with cart before hamburger and ZIP/cart outside the hamburger. Large rounded search sits below that row.
- Mobile hamburger direction: hamburger remains only for nav/account extras, while ZIP/location and cart stay available as top-level touch controls.
- Cart icon direction: cart remains a real wheeled shopping cart icon, not basket/bag/trash.
- Category spacing direction: homepage top offset and shortcut row padding were adjusted for the taller fixed header/search so shortcut row, search header, and hero stay compact and non-overlapping.
- Build/test commands used for this header/search update: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-24 header/search update: `54e1d5a`
- Header hamburger/login update on 2026-05-24 changes only header auth placement and copy.
- Files changed for this login CTA update: `src/components/Header.tsx`.
- Hamburger direction: mobile hamburger menu now contains navigation links and small-screen language controls only; no plain `Register / Sign in`, no `Register`, and no duplicate login/register CTA inside the menu.
- Login CTA direction: guest-facing visible header auth button now reads `Login / Register`, links to the existing public login state with `#login` / `openLogin`, and keeps orange CTA styling on desktop plus wider mobile/tablet when space allows.
- Build/test commands used for this login CTA update: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-24 header login CTA update: `cc57408`
- Splash hero Join Now CTA update on 2026-05-24 changes only the splash hero auth button area.
- Files changed for this Join Now update: `src/components/HeroSlider.tsx`.
- Hero CTA direction: remove separate `Register` and `Login` hero buttons and use one orange `Join Now` button matching the existing register styling. Place it centered near the bottom of the splash hero, inside the hero bounds, with enough bottom/title spacing to avoid overlapping important video or text content on desktop, tablet, and mobile.
- Join Now behavior: use the existing public login flow via `openLogin`; do not introduce a new login route or backend auth behavior.
- Build/test commands used for this Join Now update: `cmd /c npx tsc --noEmit` and `cmd /c npx vite build --emptyOutDir false`. Full `cmd /c npm run build` reached Vite but Windows returned `EPERM` while emptying existing `dist/assets`.
- Header auth correction on 2026-05-24 changes only header login/register placement and styling.
- Files changed for this header auth correction: `src/components/Header.tsx`.
- Login/Register direction: visible guest auth control is plain text, not orange pill/button, and it still opens the existing public login flow via `#login` / `openLogin`.
- Hamburger direction: mobile hamburger menu includes a normal text `Login / Register` item while ZIP/location and cart stay visible outside the hamburger.
- Build/test commands used for this header auth correction: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for 2026-05-24 header auth correction: `092b335`
- Documentation follow-up on 2026-05-24: no separate `designer.md` file exists in the workspace, so this `design.md` file remains the single design source of truth. The header auth correction is also recorded in `AGENT.md`.
- Chrome/in-app header scroll fix on 2026-05-24 changes the public header positioning and spacing only. Header is now solid white and sticky instead of translucent fixed/backdrop-blurred, which avoids Chromium and embedded-browser scroll rendering bugs where the header could disappear or let content slide through it.
- Files changed for this header scroll fix: `src/App.tsx`, `src/components/Header.tsx`, `src/components/LoginFlow.tsx`, `src/components/SignupFlow.tsx`, and `src/styles.css`.
- Layout direction: because the header now stays in normal page flow, homepage no longer uses hardcoded top padding, signup/login screens use smaller top spacing, and header overlay layers are explicitly above promo/content while the ZIP modal remains above the header. ZIP/location, cart, hamburger, plain-text `Login / Register`, and hamburger `Login / Register` behavior remain unchanged.
- Build/test commands used for this Chrome/in-app header scroll fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Cross-browser fixed header follow-up on 2026-05-24 supersedes the sticky header experiment for the final browser/device requirement. Chrome, Safari, iOS, Android, Telegram/in-app browsers, and other browser surfaces should all keep the full header and search bar visible while scrolling.
- Final layout direction: header/search is solid white fixed positioning with GPU-safe transform hints and no backdrop blur. Homepage, login, and signup screens reserve enough top space for the fixed header, and anchor/section scroll behavior uses `scroll-padding-top` and `scroll-margin-top` so content does not clip underneath the header/search.
- Build/test commands used for this cross-browser fixed header follow-up: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Footer product row removal on 2026-05-24 removes the `Popular` product-link column from the public footer. Footer now displays the logo/contact block plus `Company`, `Account`, and `Corporate` link columns only.
- Files changed for this footer update: `src/data/home.ts` and `src/components/Footer.tsx`.
- Homepage category real-image update on 2026-05-24 replaces category placeholder/letter graphics with optimized real category images from `D:\Foodonline desktop version\site video and content\category image`.
- Files changed for this category image update: `src/data/home.ts`, `src/components/CategoryStrip.tsx`, and `public/assets/categories/*.jpg`.
- Image matching direction: exact or close filename matches were used for each category. Closest-match fallbacks are `counteres.png` for Paan Corner and `bakery and biscuit.png` for Snacks & Munchies; Bakery & Biscuits also uses `bakery and biscuit.png` because no separate snack image exists.
- Image optimization direction: source PNGs were resized into 360x360 optimized JPEG assets at quality 82, centered with contain-style scaling on a soft neutral background. Category cards keep existing rounded ecommerce tile styling, explicit image dimensions, lazy loading, square aspect ratio, and `object-contain` for desktop/tablet/mobile consistency.
- Build/test commands used for this category image update: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this category image code/assets update: `15b5e7b`.
- Category double-box cleanup on 2026-05-24 removes the nested inner image shells from `Browse all categories`. Each category now renders as one main rounded card containing the optimized image and label, preserving responsive sizing and the original grid.
- Files changed for this cleanup: `src/components/CategoryStrip.tsx`.
- Desktop header nav clipping fix on 2026-05-24 preserves the current header/search design while widening the desktop header content area, tightening horizontal gaps, and preventing nav link text from shrinking. Desktop labels, including `Wholesale Products`, should render fully without clipping.
- Files changed for this header fix: `src/components/Header.tsx`.
- Desktop product detail design on 2026-05-24 adds a responsive ecommerce detail page to public website while keeping current homepage/header/search system intact.
- Files changed for this product-detail design: `src/App.tsx`, `src/components/Header.tsx`, `src/components/ProductCard.tsx`, `src/components/ProductDetailPage.tsx`, `src/components/CartQuantityControl.tsx`, `src/data/home.ts`, `src/store/homeStore.ts`, and new root `design.json`.
- Route direction: use hash-safe desktop route `#product/:productId` instead of history-path routing so GitHub Pages refreshes keep working. Product cards and similar items open same detail surface through shared store state.
- Top layout direction: desktop uses a clean two-column product area with large gallery left and sticky product info/purchase panel right. Tablet keeps two columns when space allows and otherwise stacks; mobile always stacks image, product info, shipping, tabs, similar items, and reviews vertically.
- Gallery direction: main product image is large, centered, and `object-contain`; desktop adds left/right arrows and thumbnail strip; mobile adds pagination dots. Images stay inside one clean rounded surface with no stretching or overflow.
- Price/cart direction: product header shows title, price, old price, discount badge, unit price, sold count, provider, favorite heart, share button, and pack/variant selector. Add to cart uses shared animated quantity control that becomes trash/minus-count-plus after quantity is positive.
- Shipping card direction: under price/cart, show `Ships to your selected address`, current ZIP/location from shared header state, delivery speed, free shipping threshold, and easy returns notes with small icons.
- Detail section direction: use horizontal tab buttons for `Product Details`, `Recipe`, `Nutrition Facts`, and `Return Policy`. Product Details shows backend-ready description/meta fields; Recipe uses clean recipe cards; Nutrition Facts uses desktop table plus mobile stacked cards; Return Policy uses short ecommerce-friendly copy cards.
- Similar Items direction: show horizontal related-products rail under detail sections with desktop arrow controls and mobile/tablet swipe scroll. Related fill uses same-category products first, then fallback catalog products.
- Reviews direction: product page includes summary card with average rating, stars, review count, rating breakdown, review tags, preview review cards, and `See all reviews`. Full reviews open in centered desktop modal and mobile bottom-sheet style, with All/Purchased/Photos filters, toggleable Most Recent sort, rating dashboard, write-review button shell, and friendly empty states.
- Responsive optimization direction: buttons stay large enough for click/tap, price rows and review headers wrap instead of clipping, no horizontal overflow is allowed, and narrow desktop-browser widths collapse cleanly without breaking header spacing or product body layout.
- Data-binding direction: catalog structure now supports `imageUrls`, `price`, `oldPrice`, `discountPercent`, `unitPrice`, `soldCount`, `categoryId`, `tags`, `badges`, `provider`, `countryOfOrigin`, `brandOrigin`, `netContent`, `ingredients`, `storageInstructions`, `sku`, `recipeSuggestions`, `nutritionFacts`, `returnPolicy`, `reviews`, `reviewTags`, `ratingBreakdown`, and `variants` so backend API swap can happen later without redesign.
- Desktop design memory: root `design.json` now exists as lightweight desktop structure memory for product-detail route, components, responsive rules, and backend-ready fields. No desktop `designer.md` exists in this repo, so `design.md` remains design source of truth here.
- Build/test commands used for this product-detail design: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this product-detail design: `b411971`
- Product detail/cart polish on 2026-05-24 updates only product detail media treatment, green cart CTA/quantity behavior, header cart badge, and homepage product-card cart control CSS.
- Files changed for this product-detail/cart polish: `src/components/ProductDetailPage.tsx`, `src/components/CartQuantityControl.tsx`, `src/components/ProductCard.tsx`, `src/components/Header.tsx`, and design memory files `AGENT.md`, `design.md`, `design.json`.
- Product media direction: remove boxed/bordered gallery-card feel from detail page. Media section should feel open and large like Yamibuy mobile/desktop-mobile, keep centered `object-contain` pack shots, avoid clipping under header, and use drag/scroll-friendly horizontal image track with pagination dots only. No left/right gallery arrows.
- Product detail cart direction: detail CTA is green, full-width, rounded, and touch-friendly. After add, it becomes green quantity control with trash at quantity 1, minus above 1, centered count, and plus on right.
- Cart badge direction: desktop and mobile header cart icons show red circular live item-count badge from shared cart store state, positioned over icon without shifting layout. Badge hides when cart total is zero.
- Homepage product-card cart direction: compact `Add to cart` and active quantity controls use stable pill sizing, centered icons/count, no wrapped button text, and stay inside product-card width across desktop, desktop-mobile, tablet, and mobile.
- Responsive direction for this polish: product media keeps strong visual priority on mobile/narrow browser widths, pagination dots stay visible below media, green cart controls scale without clipping, and product-card controls do not overlap price or title.
- Build/test commands used for this product-detail/cart polish: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this product-detail/cart polish: `0526f37`
- Homepage product-card alignment fix on 2026-05-24 updates carousel-card sizing and row alignment only.
- Files changed for this product-card alignment fix: `src/components/ProductCard.tsx`, `src/components/ProductCarousel.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Card sizing direction: every homepage product card now follows one fixed responsive width pattern and one shared minimum card height per breakpoint. Cards in carousel rows stretch to same vertical size instead of floating at different heights.
- Internal row direction: image area, badge band, vendor label, title block, size text, unit-price text, price/old-price slot, and button zone now reserve predictable heights so titles and badges cannot pull bottom controls out of alignment.
- Add to Cart direction: compact button and active quantity pill stay in same bottom action footprint, so cart-state changes keep width/height stable and preserve bottom alignment across the row.
- Responsive direction for this alignment fix: desktop, desktop-mobile browser width, tablet, and mobile keep smooth horizontal scroll, even product-card baselines, controlled text clamping, and no card/button overflow.
- Build/test commands used for this product-card alignment fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this product-card alignment fix: `acf0fc5`
- Homepage product-card height trim on 2026-05-24 shortens the aligned carousel cards without undoing equal sizing.
- Files changed for this product-card height trim: `src/components/ProductCard.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Height direction: reduce shared card min-heights, shrink badge/brand/title/size/unit-price reserved rows, return title clamp to 2 lines, and keep footer price/cart block bottom-aligned in the same action zone.
- Build/test commands used for this product-card height trim: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this product-card height trim: `4547e8f`
- Desktop-mobile cart-button placement fix on 2026-05-24 adjusts compact homepage cart controls only.
- Files changed for this desktop-mobile cart-button placement fix: `src/components/ProductCard.tsx`, `src/components/CartQuantityControl.tsx`, `AGENT.md`, `design.md`, and `design.json`.
- Placement direction: in narrow desktop-mobile browser widths, compact price stays above and the cart action becomes one full-width bottom row. `Add to cart` and active quantity control share the same footprint, so click state does not jump left/right or overlap price text.
- Build/test commands used for this desktop-mobile cart-button placement fix: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this desktop-mobile cart-button placement fix: `2cccb7d`
- Category listing pages on 2026-05-24 add dedicated hash-safe pages for all homepage categories while keeping homepage layout and product-card design intact.
- Files changed for this category-listing update: `src/App.tsx`, `src/components/CategoryListingPage.tsx`, `src/components/CategoryStrip.tsx`, `src/components/ProductCard.tsx`, `src/components/ProductCarousel.tsx`, `src/data/home.ts`, `src/store/homeStore.ts`, `src/styles.css`, `AGENT.md`, `design.md`, and `design.json`.
- Route direction: use `#category/:categorySlug` for category pages so GitHub Pages refreshes stay safe. Homepage carousel `see all` links and homepage category tiles below splash now route to matching category listing pages by shared `openCategory(categorySlug)` behavior.
- Listing layout direction: desktop category pages use two-column ecommerce layout with left filter sidebar and right content area. Right column shows category title, live product count, sorting dropdown, and responsive product grid. Desktop grid is 5 columns and initial dataset is 60 products per category (12 rows). Tablet grid is 3 columns; mobile and desktop-mobile browser widths use 2 columns.
- Product-card reuse direction: category pages intentionally reuse homepage product-card design and cart interactions. Cards stay equal-height in grid, keep existing image/price/discount/cart behavior, and product image/title clicks still open shared product detail route.
- Sorting direction: dropdown matches latest reference with bordered trigger and checkmarked menu options. Supported options are `Featured (default)`, `Best Selling`, `Price: Low to High`, and `Price: High to Low`.
- Filter sidebar direction: sidebar sections are collapsible, ordered `Delivery type`, `Product type`, `Made in`, `Price`, `Price Range`, `Brand`, and include top Reset control. On mobile and narrow desktop-mobile browser widths, same filter UI opens inside right-side drawer/modal.
- Filter data direction: category listing data now includes backend-ready `categorySlug`, `deliveryType`, `productType`, `madeIn`, and rotating filterable `brand` values. Price Range uses dual-handle 0-500 slider with live min/max readout and combines with Price radio filter for stricter result. Brand options are `NestFood`, `Stouffer`, `StarKist`, `Aldi`, `Adidas`, `Costco`, `Harris`, `ISnack`, and `Burbe`.
- Responsive direction for this category-listing update: no history-path routing, no horizontal overflow, filter drawer is touch-friendly, sort trigger stays accessible, and homepage category tiles keep same visual design while gaining clickable hover/focus/tap behavior to their routes.
- Build/test commands used for this category-listing update: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this category-listing update: `e81ec93`
- Category listing card tightening on 2026-05-24 refines only the product-card presentation inside category listing grids.
- Grid-card direction: listing cards are intentionally shorter than homepage carousel cards, with tighter vertical spacing, square image priority, inline price row, and floating compact cart/quantity control over the image area to match the denser sample style. Homepage rail cards keep their existing layout.
- Git commit hash for this category-listing card tightening task: `8a9869c`
- Category listing control resize on 2026-05-24 refines only the mobile and desktop-mobile filter/sort row.
- Control direction: on narrow breakpoints, `Filter` and `Sort` now render as small inline icon+text controls instead of large full-width bordered buttons. Sort menu remains dropdown-based, but trigger presentation matches the lighter sample style more closely.
- Git commit hash for this category-listing control resize task: `d9b0d6f`
- Cart and checkout design on 2026-05-24 adds dedicated storefront cart and checkout placeholder routes while keeping FoodOnlines header/search/home/product/category systems intact.
- Files changed for this cart/checkout design: `src/App.tsx`, `src/components/AccountSummary.tsx`, `src/components/CartPage.tsx`, `src/components/CheckoutPage.tsx`, `src/components/Header.tsx`, `src/store/homeStore.ts`, `src/store/publicAuthStore.ts`, `AGENT.md`, `design.md`, and `design.json`.
- Route direction: use hash-safe `#cart` and `#checkout` so GitHub Pages refreshes stay safe. Header cart buttons on desktop and mobile now open `#cart`.
- Cart state direction: active cart quantity still uses shared `cartQuantities`; cart adds now also preserve selected active items. New shared state handles `selectedCartIds` and `savedForLaterIds`, enabling select-all, per-item selection, remove, save-for-later, and move-back-to-cart flows without separate duplicate cart logic.
- Desktop cart layout direction: left column shows title, select-all row, free-shipping progress card, seller fulfillment label, item rows, and gifting note. Right column is sticky order summary with coupons, subtotal, shipping/tax/total, standalone payment logos, green service-guarantee list, and green checkout CTA.
- Mobile cart layout direction: cart rows stack vertically, order summary moves below items, payment logos and guarantee list wrap cleanly, and a sticky bottom green checkout bar keeps selected total visible and tappable without horizontal overflow.
- Free-shipping direction: threshold is `$49`, progress uses selected subtotal only, and message switches from `Add $X.XX for FREE Shipping` to `You've got FREE Shipping` when threshold is reached. The bar fills fully green at threshold and `Add More` routes back to homepage shopping.
- Service Guarantee direction: payment provider logos are standalone images with no bordered boxes or rounded tiles. Guarantee list uses green icons and FoodOnlines wording only, including `FoodOnlines.com Purchase Protection`.
- Checkout auth direction: logged-out checkout attempts open centered responsive modal. Step one collects email or phone number; step two collects password. Email path uses existing live auth store login; phone path uses safe mock session fallback so checkout flow can continue frontend-only when needed.
- Checkout placeholder direction: `#checkout` shows shipping-address placeholder, payment-method placeholder, and selected order summary. No real payment processing or shipping API was added.
- Account direction: signed-in account summary now surfaces saved-for-later items from the cart state so saved items appear under the user account during the active session.
- Build/test commands used for this cart/checkout design: `cmd /c npx tsc --noEmit` and `cmd /c npm run build`.
- Git commit hash for this cart/checkout design: `cb28715`
- Cart visual polish on 2026-05-24 refines only the cart page presentation.
- Visual direction: payment provider area now uses visible compact branded logo tiles, cart row quantity control is a compact green stepper pill instead of native select dropdown, and desktop fulfillment/free-shipping area is reduced into one slimmer row without the extra nested box around the progress bar.
- Git commit hash for this cart visual polish task: `14620aa`
- Category listing sort fix on 2026-05-24 updates only the listing-page sort behavior.
- Sort direction: category pages now always filter first, then sort the resulting product set for `Featured (default)`, `Best Selling`, `Price: Low to High`, and `Price: High to Low`. Visible price order and best-selling order must change immediately on desktop, desktop-mobile browser widths, tablet, and mobile.
- Grid update direction: product count and rendered grid both consume the same sorted result list, and the listing grid remounts on category/sort/filter state changes so reordered cards visibly move instead of appearing stuck in prior order.
- Git commit hash for this category listing sort fix: `18477a6`
- Cart payment-logo size trim on 2026-05-24 updates only the Service Guarantee payment icon row.
- Payment-logo direction: payment logo tiles are now smaller and tighter across desktop, desktop-mobile browser widths, tablet, and mobile. Height, minimum width, inner logo scaling, and row gaps are reduced so the icon area uses less space without losing clarity.
- Git commit hash for this cart payment-logo trim: `23699a1`
- Category listing badge cleanup on 2026-05-24 updates only category-grid badge rows.
- Badge direction: category listing product cards no longer show the green delivery-time banner. The discount percentage badge remains in the same badge row and left-side position so category cards stay compact without changing the rest of the product-card layout.
- Git commit hash for this category listing badge cleanup: `3e286c4`
- Product-card badge cleanup follow-up on 2026-05-24 broadens the same badge rule to homepage product rails.
- Badge direction: delivery-time badges are now removed from both category-grid cards and homepage carousel cards. Discount percentage badges stay visible in the same badge row position across the site.
- Git commit hash for this site-wide product-card badge cleanup: `5b6dbbe`
- Product detail desktop gallery update on 2026-05-24 changes only large-screen product media controls.
- Gallery direction: desktop product pages now show a boxed thumbnail strip below the main product image so users can switch among multiple product images directly. Tablet and mobile keep the existing open gallery with pagination dots and no desktop thumbnail box.
- Git commit hash for this desktop gallery update: `14fe685`
- Cart sticky-footer clipping fix on 2026-05-24 updates only cart page spacing around the sticky checkout footer.
- Footer-spacing direction: when the sticky checkout footer is present on mobile, tablet, and desktop-mobile browser widths, the cart page now reserves extra bottom space so summary content and lower sections cannot clip behind the fixed footer in Chrome and similar browsers.
- Git commit hash for this cart sticky-footer clipping fix: `f3d3c78`
- Payment icon asset swap on 2026-05-25 updates only the cart payment logo presentation.
- Payment-logo direction: cart payment logos now use real PNG assets copied from the local payment-icon folder, rendered as small responsive images instead of text-drawn mock tiles. Layout stays compact and wraps cleanly on desktop, desktop-mobile browser widths, tablet, mobile, iOS, and Chrome.
- Git commit hash for this payment icon asset swap: `97ad00a`
- Dairy/bread product image assignment on 2026-05-25 updates only `Dairy, Bread & Eggs` product-card imagery.
- Image direction: homepage dairy/bread carousel uses the first 12 sorted bread mockup assets as real product images. The dairy/bread category listing page starts with those same 12 images and then continues through the rest of the copied bread-image set. Remaining cards keep the existing placeholder/mock treatment once no more copied images are available.
- Git commit hash for this dairy/bread image assignment: `4adfeaa`
- Dairy/bread homepage image extension on 2026-05-25 updates only the homepage dairy/bread rail.
- Image direction: homepage `Dairy, Bread & Eggs` now uses 15 unique bread mockup images before any placeholder fallback. The extra 3 images come from the next unused files in the copied bread-image set, with no duplicates of the first 12.
- Git commit hash for this dairy/bread homepage image extension: `e101ab4`
- Category listing sort selection fix on 2026-05-25 updates only the category sort dropdown behavior.
- Sort direction: each responsive sort trigger now owns its own DOM ref, so outside-click close logic no longer hijacks desktop/tablet/mobile option taps. `Featured (default)`, `Best Selling`, `Price: Low to High`, and `Price: High to Low` all route through one shared selection handler and immediately reorder the visible grid.
- Git commit hash for this category listing sort selection fix: `d95c4a6`
- Homepage category intro copy removal on 2026-05-25 updates only the top text block of the homepage category section.
- Copy direction: removed `Grocery-first aisles for every daily cart` and `Rounded category tiles, soft image cards, and clear labels keep desktop browsing quick while mobile stays swipe-friendly.` The section now goes straight from the eyebrow label into the category grid to keep the homepage lighter.
- Git commit hash for this homepage category intro copy removal: `97d2a89`
- Footer account-link correction on 2026-05-25 updates only the footer account column text.
- Copy direction: replaced `Compare products` with `Recipe` in the footer account links so footer wording matches the requested navigation terminology.
- Git commit hash for this footer account-link correction: `96ffc26`
- Homepage category promo banner update on 2026-05-25 updates only the banner block beneath the homepage category grid.
- Banner direction: removed the generated orange promo composition and replaced it with the provided local sale banner image, copied into `public/assets/home-banners` and rendered as a full-width clickable rounded image banner. Existing category tiles, section spacing, and promo click target remain intact.
- Git commit hash for this homepage category promo banner update: `1b08eef`
- Fruits & Vegetables mockup image assignment on 2026-05-25 updates only fruits imagery in homepage/category product cards.
- Image direction: homepage `Fruits & Vegetables` carousel now uses the first 15 copied real fruit/vegetable product images. The `#category/fruits-vegetables` listing uses the same copied image pool from the start and keeps assigning the remaining real images until the pool runs out, then falls back to the existing placeholder imagery for any leftover cards.
- Source direction: copied 46 non-screenshot assets from `D:\Foodonline desktop version\site video and content\food mockup\Fruit and vegetable` into `public/assets/fruits-vegetables-mockups` with stable numbered names.
- Git commit hash for this Fruits & Vegetables image assignment: `b3ced52`
- Dairy and Fruits & Vegetables image fill tuning on 2026-05-25 updates only shared product-card media behavior for those two real-image sections.
- Image-fit direction: cards that use `dairy-bread-mockups` or `fruits-vegetables-mockups` now switch from the generic contained image treatment to a clipped cover-style presentation with slightly enlarged scale, so real product photos visually fill the square media box better on homepage rails and category grids across desktop, desktop-mobile browser widths, tablet, mobile, Safari, and Chrome.
- Git commit hash for this image fill tuning: `3dd965b`
- Cold Drinks & Juices mockup image assignment on 2026-05-25 updates only beverage imagery in homepage/category product cards.
- Image direction: homepage `Cold Drinks & Juices` carousel now uses the first 15 copied real drink and beverage product images. The `#category/cold-drinks-juices` listing now uses 60 copied real beverage images for its 60 product boxes.
- Source direction: copied 60 assets from `D:\Foodonline desktop version\site video and content\food mockup\drinks and beverage` into `public/assets/drinks-beverage-mockups` with stable numbered names.
- Image-fit direction: cards that use `drinks-beverage-mockups` now share the expanded cover-style media treatment used by the other real-image product categories.
- Duplicate real-image cleanup on 2026-05-25 keeps Dairy/Bread/Eggs, Fruits/Vegetables, and Cold Drinks/Juices from showing duplicate real photos in homepage rails or category listing overflow.
- Duplicate cleanup direction: removed the exact duplicate fruits/vegetables asset and changed category overflow cards to generated unique mock art once a real-image pool is exhausted, instead of recycling copied product photos.
- Beverage image fill follow-up on 2026-05-25 rebuilt the beverage mockup asset sequence from the full sorted source folder so the six previously missing PNG screenshots now fill the remaining beverage category boxes. The beverage category image pool now hash-checks with no exact duplicates.
- Fruits & Vegetables image fill follow-up on 2026-05-25 rebuilt the fruits/vegetables mockup asset sequence from the newest 60 unique source images so the `#category/fruits-vegetables` page has a real image in every product box.
- Fruits & Vegetables direction: homepage uses the first 15 images from the updated real-image pool, while the category listing consumes all 60 real images before any fallback would be needed.
- Snacks & Munchies mockup image assignment on 2026-05-25 updates only snack imagery in homepage/category product cards.
- Snacks & Munchies direction: homepage uses the first 15 real snack screenshots from `public/assets/snacks-munchies-mockups`; the category listing consumes all 26 copied real snack images once, then uses generated unique mock art for remaining boxes.
- Image-fit direction: cards that use `snacks-munchies-mockups` now share the expanded cover-style media treatment used by the other real-image product categories.
- Snacks & Munchies fill follow-up on 2026-05-25 rebuilds the snack mockup asset pool from the latest 60 unique source images so `#category/snacks-munchies` has a real image in every product box.
- Homepage shortcut-strip removal on 2026-05-25 removes the icon row above the hero on all devices. The splash hero now begins directly under the fixed header, and the home top spacing is tightened for desktop, desktop-mobile browser widths, tablet, iOS, Chrome, and mobile.
- Breakfast & Instant Food mockup image assignment on 2026-05-25 updates only breakfast/instant-food imagery in homepage/category product cards.
- Breakfast & Instant Food direction: homepage uses the first 15 real images from `public/assets/breakfast-instant-food-mockups`; the category listing consumes all 60 copied real images so every product box on `#category/breakfast-instant-food` has a real image.
- Image-fit direction: cards that use `breakfast-instant-food-mockups` now share the expanded cover-style media treatment used by the other real-image product categories.
- Sweet Tooth mockup image assignment on 2026-05-25 updates only candy imagery in homepage/category product cards.
- Sweet Tooth direction: homepage uses the first 15 real candy images from `public/assets/sweet-tooth-mockups`; the category listing consumes all 60 copied real images so every product box on `#category/sweet-tooth` has a real image.
- Image-fit direction: cards that use `sweet-tooth-mockups` now share the expanded cover-style media treatment used by the other real-image product categories.
- Sweet Tooth ordering fix on 2026-05-25 reorders the candy asset pool so non-screenshot candy packshots come first and screenshot captures come later. This keeps the home rail and the top of the category page from showing repeated-looking screenshot images.

## Checkout Design Update

- Dynamic checkout page on 2026-05-31 replaces the placeholder `#checkout` view with a full grocery ecommerce checkout while preserving existing public header/search/footer, cart selection, auth session, and hash-safe route behavior.
- Checkout structure now uses FoodOnlines rounded white card styling with green primary actions, orange section eyebrow labels, neutral borders, and dense grocery-commerce spacing. Desktop uses a main checkout column plus sticky right coupon/pricing summary; tablet and mobile stack cards in reading order.
- Delivery address section includes `Use ZIP`, `Add new address`, selected-address preview, optional saved-address selection for signed-in sessions, and a dynamic country selector. Supported country forms are Thailand, Japan, Singapore, Taiwan, China, Philippines, Malaysia, Indonesia, and Hong Kong.
- Dynamic address form behavior: clicking `Add new address` always opens a blank form for the current country, clears old values, deselects the previously selected saved address, and resets touched/error state. Country switching keeps values only when the same field key exists in both countries, clears irrelevant fields and errors, preserves natural spaces while typing, uses `tel`, text, postal-code-friendly input modes, shipping autocomplete tokens, accessible labels, required markers, and friendly field-level errors. Delivery note is always optional.
- Shipping-address form actions now include `Cancel` and `Use this address`. Cancel closes the add/edit form and restores the previous selected address card when one already existed, so users can back out of a new-address attempt without losing the active delivery box.
- Address-card presentation now avoids duplication: the active/default delivery address is shown in the top selected-address box only, and the lower `Saved addresses` list excludes that same address. If saved addresses exist but no explicit selection has been made yet, the first saved address is used as the default active delivery card.
- Required address fields are intentionally limited per country. Only the requested full name, phone, postal code, house/building number, province/state/prefecture/city-level region, and local delivery area fields block save; optional unit, road, district, building-name, and note fields do not block save.
- Cart item details section renders selected real cart items from shared cart state with product image, name, size/quantity metadata, quantity, unit price, line total, and sale badge when product discount data exists. Empty checkout keeps a friendly return-to-cart/continue-shopping state.
- Payment section now uses compact aligned radio rows instead of large payment boxes. Credit / Debit Card shows inline card-brand marks, wallet rows use small logo tiles, and each row keeps concise text aligned beside the selector. Credit card selection reveals the Add a New Card form directly under the credit-card row, including cardholder, auto-spaced card number, `MM/YY` expiry, masked numeric CVV, and billing-same-as-shipping checkbox.
- Billing address behavior: when `Same as shipping address` is checked, no billing fields are shown. When unchecked, billing expands under the credit-card form with its own country dropdown and the same Thailand, Japan, Singapore, Taiwan, China, Philippines, Malaysia, Indonesia, and Hong Kong dynamic field sets as shipping. Billing country switching preserves typed values only for shared field keys and resets irrelevant fields/errors.
- Payment safety direction: card data remains transient React component state only, is never persisted, and is not sent anywhere. Real charging must be enabled later through backend order creation plus PCI-compliant payment tokenization.
- Coupon and pricing summary live together before the final buy action. Coupon UI supports apply/remove/success/error/loading states with a frontend-ready `WELCOME` placeholder, while pricing shows retail items, product discount, subtotal, coupon discount, delivery fee, taxes/VAT fallback, and final total.
- Mobile checkout reserves bottom safe-area space and shows a sticky order total plus green Place Order button. This keeps the total and CTA visible on iOS Safari, Android Chrome, desktop-mobile browser widths, tablets, and small phones without covering lower content.
- Public auth now preserves the pre-login route so email sign-in can return to product/category/search/cart/checkout context instead of always dropping back at home.
- Phone auth UX on 2026-06-01 now uses a temporary mock OTP flow. In public login, public signup, and cart checkout auth, phone mode never asks for a password. A valid phone number advances to an SMS-code step with `Enter the code sent to your phone`, `Code is required`, and `Resend code`. Any non-empty code verifies into a mock user session for now, then returns the user to their prior route or continues checkout. Email login/register remains the real live API path.
- Phone signup design keeps the existing registration layout and role step, but swaps email/password fields for a phone-first path when the phone tab is selected. The phone registration form keeps first name, last name, contact number, optional Line ID, and company name, then shows the OTP step before access is granted.
- Production-readiness notes: no new dependencies, no global CSS changes, no backend route changes, no cart/auth rewiring. Backend TODOs remain for real coupon validation, order creation, delivery-rate calculation, saved-address persistence, and payment provider tokenization.

## Account/Profile + Settings Update (2026-06-01)

- Added full logged-in account route flow:
  - Desktop logged-in users now get an Account dropdown from header with:
    - `My orders`
    - `Saved items`
    - `Refer a friend`
    - `Coupon`
    - `Settings`
  - Mobile (and mobile-width responsive desktop) account entry now opens the full Account page route (`#account`) instead of a small dropdown.
- New account route behavior:
  - Hash-safe sections: `#account`, `#account/orders`, `#account/saved`, `#account/refer`, `#account/coupon`, `#account/settings`.
  - Overview page follows the requested clean ecommerce row/tap structure with:
    - top `My orders` row,
    - status shortcuts row (`Pending`, `Unshipped`, `Shipped`, `To Review`, `Returns`),
    - account menu rows for required actions.
- Settings page behavior:
  - Added settings cards for:
    - Address book
    - Payment methods
    - Notifications
    - Change password
    - Delete account
  - Desktop uses grid cards; mobile stacks in single column.
- Notifications behavior:
  - Toggle rows for:
    - Order updates
    - Delivery updates
    - Promotions and coupons
    - Back-in-stock alerts
    - Saved item price drops
    - Email notifications
    - SMS notifications
    - Push notifications
  - Toggles persist via real backend API (`PUT /account/notification-preferences`).
- Address book behavior:
  - Addresses load from live account API (`GET /account/addresses`).
  - Add/edit/delete/default operations are wired to backend.
  - `Add new address` always opens a blank form, resets touched/error state, and does not copy old values.
  - Country switch preserves only same-key fields; irrelevant fields reset.
  - Required/optional rules follow current checkout schema across supported countries.
- Payment methods behavior:
  - Methods load from backend (`GET /account/payment-methods`).
  - Add/remove/default wired to backend.
  - Card UI includes cardholder, card number auto-spacing, expiry `MM/YY`, CVV, and billing same-as-shipping toggle.
  - No raw PAN/CVV persistence. Backend stores masked metadata only.
  - Tokenization is still TODO; UI is production-ready for provider integration.
- Change password behavior:
  - `Current password`, `New password`, `Retype new password` with backend verification and secure save (`PUT /account/password`).
- Delete account behavior:
  - Scrollable modal body with required reason selection and `Other` textarea requirement.
  - Submits delete request to backend (`POST /account/delete-request`) and uses pending-review flow.
- Admin behavior:
  - Added admin delete-account queue panel with status updates:
    - `Pending`
    - `Reviewed`
    - `Completed`
    - `Cancelled`
  - Backed by:
    - `GET /admin/delete-account-requests`
    - `PUT /admin/delete-account-requests/{requestId}`
- Checkout sync:
  - Logged-in checkout now pulls saved addresses from account API so account and checkout share address data source.

### Account UI/UX Follow-up (2026-06-01)

- Desktop My Account trigger now matches requested interaction style:
  - avatar initial + username text + small chevron indicator.
  - chevron rotates when dropdown opens/closes.
  - dropdown remains open while moving pointer from trigger into menu.
  - closes on outside click, outside hover leave, or `Escape`.
- Desktop account dropdown item list now includes:
  - My orders
  - Saved items
  - Address book
  - Refer a friend
  - Coupons
  - Settings
  - Current logout is intentionally not in the dropdown; it appears only as the centered bottom action on the main account page.
- Mobile account behavior refinement:
  - logged-in mobile header now exposes a direct account icon button that opens full account page route.
  - account access is full-page/tap-friendly, not a compact hover-style dropdown.
- Account page touch UX refinement:
  - overview rows now use larger white rounded cards, clearer typography hierarchy, icon+label row alignment, and large tap targets.
  - order status shortcuts now use icon circles with equal-height buttons and no text clipping.
- Modal behavior refinement for Address Book, Payment Methods, Notifications, Change Password, and Delete Account:
  - higher overlay z-index so modals always sit above sticky elements.
  - gray overlay + rounded white panel style.
  - outside click and `Escape` close behavior.
  - focus trap and keyboard-tab cycling within modal.
  - page background scroll lock while modal is open.
  - modal content remains scrollable for long content on small screens.
- Mobile overlap fix:
  - account-page sticky cart/checkout footer hides while any account modal is open to prevent overlap.
- Address book save resilience:
  - primary path uses live account API.
  - fallback path persists addresses to localStorage if account address API is temporarily unavailable, including add/edit/delete/default updates and refresh persistence.
- Shared address-country coverage update:
  - account address schema now also includes United States and United Kingdom in addition to Thailand, Japan, Singapore, Taiwan, China, Philippines, Malaysia, Indonesia, and Hong Kong.
- Notifications interaction update:
  - each notification section row is now directly tappable/clickable and toggles independently on/off.
  - switch controls use accessible `role="switch"` + `aria-checked` behavior and large tap target spacing for mobile.

### Account Mobile UX + Modal Scrolling Fix (2026-06-01)

- Main account dashboard direction:
  - top profile card shows avatar initial, account name, and email/phone only.
  - no sign-out action appears in the profile card, header account dropdown, mobile hamburger submenu, or account subpages.
  - one centered `Log out` action appears near the bottom of the main account page.
- Account menu direction:
  - overview rows now include Language (English), Address book, Payment methods, Coupons, Refer a friend, and Settings.
  - detail sections use a sticky Back/header row with left Back control and centered page title.
- Order shortcut direction:
  - My orders keeps five shortcuts: Pending, Unshipped, Shipped, To Review, and Returns.
  - each shortcut uses a compact circular outline icon with the label below, avoiding stretched card-like buttons on mobile.
- Modal direction:
  - account modals use a gray overlay, rounded white panel, Back and close controls, viewport-safe width, internal vertical scrolling, and safe-area bottom padding.
  - Address Book and add-card forms keep Save/Cancel reachable with sticky bottom action rows inside the scrollable modal body.
  - Change Password inputs reserve right padding for the Show/Hide button so labels and input text do not clip on mobile.
- Mobile input direction:
  - account forms use 16px-or-larger input/select/textarea/button text sizing to prevent iOS Safari and Android Chrome field zoom.
  - public viewport meta includes `maximum-scale=1` for the requested no-zoom account-form behavior.
- Notifications direction:
  - each notification toggle is independent, whole-row tappable, blue when on, gray when off, and persists through close/reopen/refresh.
  - live API persistence is preferred; localStorage fallback keeps `foodonlines-notification-preferences-v1` ready for users when the backend preferences endpoint is unavailable.

### Header Account Dropdown Link Update (2026-06-01)

- Logged-in desktop account dropdown now starts with `My Account` before `My orders`.
- `My Account` routes to the account overview hash `#account`, so the public URL resolves to `https://cynicalfocus123.github.io/FoodOnline-Desktop-/#account`.

### Account Scroll Position Fix (2026-06-02)

- The decorative `foodonlines.com` pill under logout was removed from the main account page.
- Account section navigation now resets the account panel into view when switching pages, preventing mobile and narrow desktop layouts from staying at the bottom after tapping My Account, Settings, or other account rows.

### Homepage Account Summary Removal (2026-06-02)

- Removed the old signed-in homepage account panel. After login, the home page continues to show hero, categories, and product sections only.
- User account presence is represented by the existing header account button/dropdown, with no duplicate account card or logout button in the page body.

### Promo Modal Viewport Centering Fix (2026-06-02)

- The welcome promo modal now renders above the fixed header/search layer so the header cannot cut off the coupon art or title.
- Promo overlay layout uses safe-area-aware vertical padding and an internal scroll container, keeping the card centered when it fits and scrollable when the device/browser height is short.
- Desktop and mobile promo cards have viewport-safe max heights with internal scrolling so the Copy Code button remains reachable on desktop, desktop-mobile, iOS Safari, Android Chrome, Safari desktop, Chrome desktop, tablet, and narrow responsive views.
- Sticky promo bar uses safe-area bottom offset to avoid being clipped by phone browser navigation controls.

### Account Menu Row Removal + Scroll Centering (2026-06-02)

- Removed `About FoodOnlines` and `Account ID` from the main My Account list.
- Account detail navigation now scrolls the account panel into the center of the viewport after changing sections, so taps on Coupons, Refer a friend, Buy again, Saved items, Orders, Settings, Language, or Back do not leave the user at the page bottom.
- The hidden `about` account route was removed from the account route model to avoid unused account pages.

### Account Logout + Checkout CTA Scroll Fix (2026-06-02)

- Main My Account logout now routes to the login/register experience after the session is cleared, keeping the user at the top login flow instead of the bottom of the account page.
- Checkout address save keeps the delivery-address card in view after an address is completed, preserving the user's context on mobile, desktop-mobile, tablet, iOS Safari, Android Chrome, Safari desktop, and Chrome desktop.
- Checkout has one order action surface: the fixed safe-area-aware bottom order-total/Place Order bar. The extra static pricing-summary button was removed so duplicate payment actions do not appear.

### Cart Static Checkout Button Removal (2026-06-02)

- The cart order-summary/service-guarantee card no longer contains a static `Proceed to Checkout` button.
- Cart checkout action now lives only in the fixed safe-area-aware bottom footer bar while users scroll up and down, keeping one clear checkout entry point on desktop, tablet, desktop-mobile, iOS Safari, Android Chrome, Safari desktop, and Chrome desktop.

## Driver Landing Page Design (2026-06-02)

- Added `Drive with FoodOnlines` at `/company/drivers` with `#company/drivers` as a SPA-safe fallback route.
- The page follows the driver-page design spec with FoodOnlines-owned orange and green styling, existing public header/footer, a full-bleed image hero, value statement, stats, How Flex Works, success points, grouped deliveries, eligibility, Apply, Fleet, more information, and open positions.
- Motion direction: hero text fades up, sections reveal on scroll, buttons lift/scale with shadow, accordions animate open/closed with rotating chevrons, stats count up once, grouped-delivery timeline progress fills on scroll, active steps highlight green, and step images crossfade.
- Reduced-motion direction: driver transforms and looping motion are disabled under `prefers-reduced-motion`, with opacity-only reveal preserved where appropriate.
- Driver images load from `/images/drivers/` using the filenames in `pages/driver page/foodonlines-drivers-design.json`; missing files show orange/green FoodOnlines fallback placeholders so the page does not ship broken image boxes.
- Existing site header and footer remain unchanged. Driver-specific Company/Delivery/Partners/Jobs/Earn navigation plus Shop now/Apply to drive CTAs live inside the driver page body.

### Driver Footer Link Correction (2026-06-02)

- The shared footer data now renames `Farm Business` to `Become Our Drivers`.
- Clicking `Become Our Drivers` opens the driver landing page route at `/company/drivers`; all other footer links and header behavior remain unchanged.

### Driver Page Body Visual Simplification (2026-06-02)

- The driver page no longer has its own sticky page header/subnav. The normal FoodOnlines header remains the only header, and the driver body starts directly with the hero.
- Driver hero direction is now a full-bleed image header with a dark overlay and white text/CTA content on top of the image, following the uploaded sample style while using FoodOnlines-owned driver imagery or the existing FoodOnlines fallback.
- Driver body text should not sit inside repeated card boxes. Fleet/Flex choice, value statement, Flex benefits, success points, timeline steps, accordions, apply CTA, Fleet content, and open positions use open rows, section dividers, circular image treatments, and simple columns instead.
- Keep FoodOnlines orange/green brand accents for buttons, icons, active timeline state, and links. Avoid reintroducing the old boxed driver-card presentation unless a future design explicitly asks for cards.

### Driver Page Copy Update (2026-06-02)

- Hero headline keeps `Start earning. Drive with us.` and adds `Be Your Own Boss / Work on Your Terms.`
- Hero support copy now emphasizes choosing a schedule, controlling time, and freedom to live and work the way the driver wants.
- The Fleet/Flex intro heading now reads `Maximize Your Income Potential / Unmatched Earning Opportunities`, with support copy focused on compensation that rewards ambition, performance, and results.

### Driver Page Program Copy + Section Removal (2026-06-02)

- The Fleet/Flex driver path row section was removed from the driver page body.
- The driver value section now reads `Efficient Routes / Reliable Daily Schedule`, with support copy about organized routes and consistent daily deliveries.
- The program explanation section now uses `How Does the FoodOnline Driver Program Work?` and explains local grocery delivery earning, onboarding, accepting opportunities, and full-time or part-time flexibility.
- The three program rows now include longer supporting copy for independent contractor scheduling, no minimum hour requirements, and flexible work supported by customer demand.

### Driver Hero Image + Flex Section Removal (2026-06-02)

- Driver hero background uses `public/images/drivers/foodonlines-driver-hero.png`, the provided FoodOnlines doorway delivery image.
- Hero typography direction: `Drivers` is a large label above the hero H1, `Be Your Own Boss / Work on Your Terms.` is an H4 without numbering, and its spacing sits close to the schedule-freedom support copy.
- Driver value typography direction: `Efficient Routes` appears as a large H2 without numbering, and `Reliable Daily Schedule` appears as the main large heading for that section.
- The large `FoodOnlines Flex` promotional section with three columns is removed from the page body.

### Driver Earnings/Support Image Blocks (2026-06-02)

- Hero image now uses the provided doorway delivery image at `public/images/drivers/foodonlines-driver-hero.png`.
- The earning section heading is `How Much Can You Earn?` with support copy about drivers earning between `฿10` and `฿20` per parcel, followed by a wide delivery image.
- The support block reads `2. Dedicated Support Around the Clock / A Better Experience for Independent Contractors` with copy about onboarding, daily operations, resources, assistance, benefits, and earning confidence, followed by its supplied image.
- The community block reads `3. Drive Together. Grow Together. / A Community That Invests in Your Success.` with copy about collaboration, support, and career opportunities, followed by its supplied team image.

### Driver GitHub Pages Route/Image Fix (2026-06-02)

- GitHub Pages production builds use `/FoodOnline-Desktop-/` as the asset base so driver images and bundled assets do not resolve relative to `/company/drivers`; the deploy workflow passes this as `VITE_BASE_PATH`.
- `public/404.html` redirects hard refreshes on project routes such as `/FoodOnline-Desktop-/company/drivers` into the hash route `/#company/drivers`, preventing GitHub Pages file-not-found errors for SPA routes.
- The earning/support/community content is compact: a large `How Much Can You Earn?` section heading, three image columns, headings above each image, and explanatory text below each image.

### Driver Image Swap + Brand Colors (2026-06-02)

- Driver hero image uses the FoodOnlines van/box loading image.
- `How Much Can You Earn? / Parcel-based earning potential` uses the doorway delivery driver image.
- `2. Dedicated Support Around the Clock / A Better Experience for Independent Contractors` uses the two-driver van loading image.
- The compact earning/support/community section uses FoodOnlines logo colors: green and orange text with a light orange-to-green background.

### Driver Readability + Grouped Delivery Update (2026-06-02)

- Driver hero readability direction: hero headline/support text use heavier weights, the image is dimmed with a stronger dark overlay, and the header image uses contain-style sizing so the full supplied image remains visible across desktop, tablet, mobile, Safari, and Chrome.
- The compact earning/support/community columns keep equal top alignment, centered images, lower image placement, and bolder green/orange copy.
- Grouped deliveries direction: eyebrow reads `Enjoy Greater Schedule Stability.`, `Grouped deliveries` is an H3, the intro explains pre-planned delivery assignments, and the three steps use the requested schedule, timely-delivery, and paid-for-every-delivery copy with the calendar, van-loading, and payout-phone images.

### Driver Section Removal + Eligibility Copy Update (2026-06-02)

- Grouped deliveries now displays each step image below that step's title/body text in a three-column layout instead of a separate sticky side image.
- Driver hero banner image is centered and shifted lower so the driver face remains visible while preserving the darker readability overlay.
- Removed the compact earning/support/community image section, the dark Fleet opportunities section, and the More information accordion from the driver page.
- Eligibility accordion copy now reflects vehicle requirements for grocery and restaurant deliveries, age over 18, Thailand work authorization and insurance, required background screening, six months of delivery driving experience, GPS comfort, 23 kg lifting capability, and customer-service/communication expectations.

### Driver Three-Card Restore + Image Alignment (2026-06-02)

- The three-card earning/support/community section is restored beneath the FoodOnline Driver Program explanation.
- The FoodOnline Driver Program image column uses a constrained image box and wide-screen grid sizing so the visual does not overlap the text column.
- Grouped delivery image boxes use consistent fixed heights across desktop, tablet, and mobile widths so the three step images align evenly below their own copy.

### Driver Apply Image + Final CTA Removal (2026-06-02)

- Removed the final `Check our open positions` CTA card from the driver page.
- The `Apply here to start driving` section now includes the FoodOnlines driver team/truck image in a rounded image panel beside the apply copy and CTA.
- The `How Much Can You Earn?` image crop is biased upward enough to keep the driver's face visible in the fixed-height card.
- Grouped delivery step cards use equal row structure so the image panels align consistently even when the copy length varies.

### Driver Value Collage Square Layout (2026-06-02)

- The `Efficient Routes / Reliable Daily Schedule` visual collage now uses square and rectangular image boxes instead of circular image crops.
- The collage layout uses a responsive two-column CSS grid with mixed small/large image boxes, compact spacing, subtle shadows, and no circular clipping so it remains stable on desktop, tablet, mobile, Safari, and Chrome.

### Driver Value Collage Uploaded Images (2026-06-03)

- The value collage now uses the four supplied FoodOnlines driver photos: truck loading, driver in cab, office team, and two drivers by truck.
- The lower right image is explicitly positioned under the right-side tall image, while all four images use centered cover fitting inside square/rectangular boxes that remain stable on desktop, mobile, iOS Safari, Android Chrome, Safari, and Chrome.

### Driver Three-Card Desktop Image Alignment (2026-06-03)

- The `How Much Can You Earn?` three-card section reserves equal desktop title/subtitle height before the image row so all three image boxes align horizontally.
- The image boxes keep matching responsive heights and centered object-fit behavior; no individual image is shifted up or down to force alignment.

### Driver Highlight Text Color Update (2026-06-03)

- In the driver grouped-delivery and earning/support/community sections, bold highlight headings and subtitles now render black rather than green/orange.
- Supporting paragraph copy in those sections now renders grey, matching the FoodOnline Driver Program body-copy treatment, with no copy changes.

### Driver Benefit Card Structure Alignment Fix (2026-06-03)

- The earning/support/community section no longer uses a separate standalone section heading for the first card; all three card titles and subtitles now live inside identical card header slots.
- The second and third card titles no longer include `2.` or `3.` prefixes.
- Desktop cards use equal title/subtitle header height, fixed matching image-box heights, centered image fitting, and aligned body-copy start positions.

### Driver Typography Weight Update (2026-06-03)

- Driver page H1 text uses Poppins-style `font-bold` weight rather than extra-heavy or light styling.
- Driver page paragraph/body copy uses regular or medium weights, with grey normal copy and black bold headings/subtitles.

### Driver Program Van + Earnings Person Crop (2026-06-03)

- The first earning card now uses a dedicated person-focused cropped image asset so the driver's face remains visible within the aligned card image box.
- The FoodOnline Driver Program image panel now uses the supplied branded van image instead of the missing placeholder route image.
- This pass changes image assets and wiring only; driver-page copy remains unchanged.

### Driver Payout Card Image Update (2026-06-03)

- The `Get Paid for Every Delivery` card now uses the supplied payment-received phone screenshot as `public/images/drivers/driver-payout-phone.png`.
- This pass changes only that card image asset plus documentation notes; no CSS, text, layout, component code, or other images were changed.

### About Us Page Launch (2026-06-03)

- Added a dedicated FoodOnlines About Us page at `/about-us`, with `#about-us` fallback support for the current SPA/GitHub Pages routing pattern.
- The page keeps the existing public header and footer, then presents three large white-background visual storytelling sections using the supplied images: `about-hero.png`, `about-mission.png`, and `about-delivery-scale.png`.
- Images render centered with contained responsive sizing, `width: 100%`, automatic height, safe max-width behavior, no horizontal overflow, and lazy loading for the middle and bottom sections.
- The footer `About Us` item now links to the new page without changing footer styling.

### Footer Logo Size Reduction (2026-06-03)

- The shared footer FoodOnlines logo is reduced to `h-10 sm:h-12` with a `max-w-[140px]` cap, making it substantially smaller on every public page that uses the common footer.
- This update affects only the footer logo size; footer links, contact copy, header logo, routing, and other images remain unchanged.

### About Us Timeline Section (2026-06-04)

- The About Us page now includes a horizontally scrollable company timeline directly below the top banner and before the mission/delivery visual sections.
- The timeline follows the sample story-path direction while replacing all red accents with FoodOnlines green: green connecting line, rounded year pills, circular nodes, and active pagination dots.
- Each milestone is a large snap-scrolling card with a light background, oversized faint year text, circular placeholder visual area for future imagery, subtle depth shadow, milestone heading, and readable body copy.
- Desktop, tablet, Android, and iOS behavior uses native horizontal overflow, `snap-x snap-mandatory`, smooth dot navigation, touch swipe support, and no page-level horizontal overflow.

### About Us Timeline Open Layout + Drag Update (2026-06-04)

- Timeline milestone boxes are removed; each milestone now appears directly on the shared light background with the green line, rounded year pill, circular placeholder visual, heading, and body copy floating in one continuous timeline field.
- Desktop users can click, hold, and drag the timeline horizontally. Touch devices keep native swipe/scroll behavior, and dot navigation remains available.

### About Us Timeline Image Assignment (2026-06-04)

- Timeline circles for 1999, 2005, 2007, 2015, and 2019 now use the supplied real images from `public/images/about/timeline/`; the Today milestone remains an abstract placeholder.
- Green year pills are positioned directly above their circles with tighter spacing so the badge feels visually attached to each milestone.

### About Us Today Timeline Image (2026-06-04)

- The Today timeline circle now uses the supplied FoodOnlines warehouse image as `public/images/about/timeline/timeline-today.png`.
- The abstract placeholder remains available in component logic for any future milestone without an assigned image.

### About Us Timeline Scroll Handling Fix (2026-06-04)

- The About Us timeline no longer traps normal vertical wheel/touch scrolling; users can continue scrolling up and down the page when passing through the timeline section.
- Horizontal movement remains supported with desktop click-drag, horizontal trackpad gestures, Shift+wheel, native touch swipe on mobile/tablet/iOS/Android, and pagination dots.
- Timeline header copy now uses a larger standalone `Our Story` heading, and the old `A FoodOnlines timeline built for global grocery access` line is removed.
- Timeline snapping should stay soft/proximity-based, with vertical touch intent disabling snap during mobile up/down swipes so Chrome and Safari do not bounce around the timeline.
- Follow-up scroll behavior: keep the About Us timeline in the original non-sticky open layout so milestone images remain fully visible across desktop and mobile desktop widths.
- Timeline interaction should follow a Yami-style controlled carousel pattern: vertical page scrolling must always pass through, finger left/right swipes on the timeline should move horizontally quickly without a tap-to-focus state, and visible Previous/Next buttons plus pagination dots should move between milestones.

### About Us Vertical Timeline Update (2026-06-04)

- The About Us timeline is now a vertical story path instead of a horizontal carousel, so users scroll down the page and pass every milestone all the way to Today.
- The green connector line now runs vertically through the section, with circular green nodes and the existing real milestone images preserved.
- Mobile uses a single left-side vertical path with content flowing downward; wider screens alternate text and image columns around the center line.
- Horizontal drag, touch-swipe, wheel interception, Previous/Next buttons, and pagination dots are removed because native vertical page scrolling is now the intended interaction.
- Follow-up scroll fix: the timeline section now only guards horizontal overflow and explicitly uses vertical pan behavior, so users do not need to tap/focus the timeline before scrolling down through it.
- Static-scroll follow-up: the About page wrapper and timeline section must not use `overflow-x-hidden`, `overflow-hidden`, sticky positioning, touch-action overrides, or any nested scroll container. Body/document scrolling should carry users normally up and down through the complete timeline.

### About Us Pre-Timeline Story Images (2026-06-04)

- Added two full-width static image sections above the vertical timeline: `public/images/about/about-global-foods.png` followed by `public/images/about/about-authentic-flavors.png`.
- The images keep the shared About page responsive image treatment: max-width `1648px`, `width: 100%`, `height: auto`, `object-contain`, no crop, lazy loading, and normal body/document scrolling across desktop, desktop-mobile browser widths, tablet, Android, and iOS.
- The two pre-timeline story images should sit flush together with no added section gap between them, so the second image uses `pt-0`.
- Timeline placement now starts after these two story images, then continues into the existing mission and delivery-scale image sections.

### About Us Leadership Placeholder Grid (2026-06-04)

- Added a blank leadership grid directly below the truck/delivery-scale banner image.
- Added a large bold green `Our leadership` H2 above the first row, matching the sample heading structure while using the FoodOnlines green brand color.
- The grid contains eight white rounded card slots with light borders and subtle shadow, matching the sample card structure.
- Desktop uses 4 boxes per row for 2 rows total; tablet uses 2 columns; small mobile stacks to 1 column so the boxes stay usable on Android, iOS, and narrow browser widths.
- Leadership content update: all eight cards now show supplied headshots plus name/role for Jakapun Viwatkurkul, Paul Pongpichan, Pasit Viwatkurkul, Natalie, Lucas Huber, Anna Goldstein, Janet Weiler, and Ahmet Yılmaz.
- Leadership card typography uses semibold names and normal-weight role text so it matches the sample more closely and does not appear too bold.
- Leadership card image behavior: images sit in a same-height lower portrait frame with `object-contain object-bottom` so portraits align evenly without cropping across desktop, tablet, Android, iOS, and narrow browser widths.
- Follow-up image sizing: Lucas and Ahmet are slightly scaled up inside the same portrait frame, while the newer Anna/Janet white-background images replace the earlier gray-background female portraits and use object-cover positioning to keep the card image areas visually consistent.
- Gray-backdrop fix: Anna, Janet, and Ahmet leadership assets have their connected light gray studio backdrop whitened so the portraits sit on the white card background; Ahmet uses a top-weighted object-cover crop to avoid lower source artifacts.

### About Us Lucas Leadership Image Fix (2026-06-04)

- Lucas Huber's leadership portrait now uses the same `object-contain object-bottom` image fitting as the other contained leadership portraits, with the existing slight scale-up preserved so the image no longer squeezes on mobile.
- The Lucas source asset has its connected pale gray studio backdrop cleaned to white so it sits inside the existing white bordered card like the surrounding leadership images.

### About Us Leadership Row One Zoom Update (2026-06-04)

- The first-row leadership portraits for Jakapun, Paul, Pasit, and Natalie now use a shared closer contained scale so their image size matches the second-row leadership cards more closely.
- Card dimensions, white boxed backgrounds, bottom alignment, and the responsive 4/2/1-column grid remain unchanged across desktop, tablet, mobile, iOS Safari, Android Chrome, Safari, and Chrome.

### About Us Hardcoded Responsive Rebuild (2026-06-05)

- The About Us page is rebuilt as responsive hardcoded React sections instead of full banner images with embedded text, because the banner text became too small on mobile.
- Typography is Poppins-first across the About Us page: bold Poppins-style headings, normal Poppins-style paragraph text, readable `clamp()` sizing, and no negative letter spacing.
- Brand color usage follows FoodOnlines green `#64bd00` and orange `#ff6b1a`, with black body/headline text and mostly white or warm off-white section backgrounds.
- The visual structure keeps the original story rhythm: large hero text plus rounded image area, centered logo/mission copy, four flavor circles, left mission copy with right decorative shapes, a delivery truck composition, and the original leadership/team card grid with its images.
- The top hero food image uses the supplied table-sharing image at `public/images/about/about-food-table.png`, rendered as the image itself with rounded corners only. Do not add a wrapper box, background fill, shadow panel, forced min-height, or placeholder surface behind this image.
- Responsive behavior stacks or reduces decorative compositions across tablet and 430px/390px/360px mobile widths so text remains selectable, readable, and free of horizontal scroll.
- Mission-section mobile typography uses smaller mobile-only line groups for the green mission headline and orange global-serving statement so iOS, Android, and desktop-mobile browser widths stay readable without clipping; desktop keeps the larger original-style scale.
- Janet Weiler's leadership portrait uses the exact supplied `.jfif` headshot copied into the public leadership assets and is rendered with contained bottom alignment plus a small CSS scale-down so the original image stays intact while fitting closer to the other leadership cards.
- The standalone FoodOnlines logo marks that previously sat above the `ASIAN GROCERIES...` intro and `OUR MISSION...` sections are removed; the page should rely on the persistent site header/footer branding instead.
- Janet Weiler's displayed card image should use a transparent-background PNG cutout generated from the supplied `.jfif` so the portrait blends into the white leadership card; keep the source `.jfif` available in public assets for reference.
- Desktop hero heading copy should read as one continuous phrase, `CONNECTING PEOPLE AROUND THE WORLD WITH THE FOODS THEY LOVE MOST`, without a forced line break between clauses; the support paragraph belongs directly below the headline on desktop.
- Circle art follow-up: the accessible/affordable intro now places dragon fruit on the left green circle and a grocery bag on the right orange circle, each as transparent cutouts that protrude slightly past the circle edge. The authentic-flavors row uses burger, ice cream, fruit drinks, and chips cutouts left-to-right across the four colored circles. The mission visual places a grocery cart over the peach circle and a spicy rice-cake plate over the large green circle. The fulfillment visual places the FoodOnlines truck over the large green circle with three transparent dish cutouts around it.
- The About Us circle assets live in `public/images/about/circle-assets/` as transparent PNGs. Most food assets are cropped cutouts, but the delivery truck must use the original transparent full file copied directly from `9.Our teams fulfill and deliver more than 100,000 orders every day (1).png` so no part of the vehicle is cut off. Images should stay `object-contain`, lazy-loaded, non-stretching, and sized with responsive Tailwind classes so desktop, Chrome, Safari, Android, iPhone, mobile, and desktop-mobile browser widths keep the cutouts overstepping the circles without creating horizontal page overflow.
- Authentic-flavor circle sizing should be smaller below desktop: single-column mobile stays around 260px max, desktop-mobile/tablet two-column layouts stay around 220-285px max per circle, and only large desktop grows toward 330px. The images scale with the circle so burger, ice cream, drinks, and chips do not overwhelm the viewport.
- Mission circle spacing follow-up: keep the grocery cart visually separated from the plate by anchoring it higher and farther right on the peach circle. The spicy rice-cake plate should be larger than the original pass and sit deeper into the large green circle so the green circle feels intentionally filled while still preserving transparent image edges.
- Delivery composition cleanup: the visible truck should sit inside the green circle on mobile and desktop-mobile widths. The surrounding dish PNGs should be tight transparent cutouts with no background boxes and no CSS drop shadows that create a square panel; only the dish pixels should show over the page/circle.

### Become Vendor Page Launch (2026-06-04)

- Added the FoodOnlines `Become a Vendor` / `Sell Globally` page at `/become-vendor`, with `#become-vendor` SPA fallback support.
- The page now uses six hardcoded responsive React sections in this order: hero, stats, who's selling, scale business, three simple steps, and final start-selling CTA.
- Sections use the matching light green `#c4dfb8` background as one continuous scroll, with real editable text instead of full banner-image text.
- Real accessible CTA buttons preserve the orange outline/circle-arrow visual style while making hero `GET STARTED`, bottom `Sign up`, and bottom `Log in` functional.
- Vendor signup buttons open the existing public signup/register flow, and the login button opens the existing public login flow. The footer `Become a Vendor` link opens the rebuilt page.
- Responsive behavior uses code-native layout, readable `clamp()` type, stacked mobile cards, and resized decorative assets with no intended horizontal overflow across desktop, tablet, mobile, iOS Safari, Android Chrome, Safari, and Chrome.

### Become a Sponsor Page Launch (2026-06-07)

- Added the FoodOnlines `Become a Sponsor` advertising page at `/become-a-sponsor`, with `#become-a-sponsor` fallback support and the shared public header/footer.
- The page uses a Montserrat-first font stack, strong black advertising typography, wide letter-spaced labels, large pill CTAs, soft cream/white/light-green page background, FoodOnlines green/orange hero cards, thin orange stat dividers, light blue rounded sponsored-product panel, and colored product-ad bands.
- Section order is: hero intro cards, Expand Your Reach stats, Sponsored Products weekly deals overview, final Advertise on the World's #1 Grocery App CTA box, Search Results Advertising, Deals/Bestsellers/New Arrivals, Category Pages, Featured on the Homepage, Homepage Brand Takeover, and Product Detail Pages.
- All visible page copy is hardcoded as real React/HTML text, and the CTAs are real clickable buttons rather than image-only controls. `Get Started` and `CONTACT US` use `mailto:info@foodonlines.com`; `ADS LOGIN` uses `#ads-login`.
- Sponsor imagery lives in `public/images/become-sponsor/`, copied from `D:/Foodonline desktop version/pages/sponsor page`. The page uses `sponsor-with-us.png`, `expand-your-reach.png`, `sponsored-products.png`, `advertise-grocery-app.png`, `search-results-advertising.png`, `deals-bestsellers-new-arrivals.png`, `category-pages.png`, `featured-homepage.png`, `homepage-brand-takeover.png`, and `product-detail-pages.png`.
- Image mapping follows the supplied sponsor folder. Because `11.Featured on the Homepage (1).png` and `12.Product Detail Pages (3).png` were absent, the page uses the closest available matching files: `11.Featured on the Homepage.png` for Featured on the Homepage, `11.Featured on the Homepage (2).png` for Homepage Brand Takeover, and `12.Product Detail Pages.png` for Product Detail Pages.
- Responsive behavior: desktop sections aim for the supplied 1650px banner proportions with generous padding and two-column visual layouts. Tablet stacks when columns become cramped. Mobile keeps text first, then image, with `max-width: 100%`, automatic image height, lazy loading below the top content, large tap targets, and no intentional horizontal scrolling.
- Footer design update: Corporate footer text formerly labeled `Promotions` is now `Become a Sponsor`, linked to `/become-a-sponsor`, and opened through the same SPA route handler pattern as Become a Vendor, Become a Partner, and Become Our Drivers.
- Follow-up on 2026-06-07: Search Results Advertising, Deals/Bestsellers/New Arrivals, Category Pages, Featured on the Homepage, and Homepage Brand Takeover no longer show a `Get Started` button. Product Detail Pages keeps its `Get Started` button.
- Follow-up typography direction: primary bold sponsor headings are reduced by roughly 40% on desktop and desktop-mobile breakpoints, including the top hero headline, stats/overview headings, final CTA headline, and sponsored product section titles.
- Follow-up stats layout direction: the empty `Join industry leaders` area is removed from the Expand Your Reach section. The `Advertise on the World's #1 Grocery App` stats group is centered in one max-width panel with centered heading text, responsive two-column stat cells on wider screens, stacked-safe mobile spacing, and break-safe large stat copy so desktop, desktop-mobile, tablet, iOS Safari, and Android Chrome do not clip or horizontally scroll.
- Follow-up image scaling and section order update: Homepage Brand Takeover is removed completely, so Product Detail Pages follows directly after Featured on the Homepage. Current sponsor section order is hero intro, centered Expand Your Reach stats, Weekly Deals sponsored products overview, final CTA box, Search Results Advertising, Deals/Bestsellers/New Arrivals, Category Pages, Featured on the Homepage, and Product Detail Pages.
- Updated sponsor image mapping: Weekly Deals uses `20.SPONSORED PRODUCTS (1).png` plus `20.SPONSORED PRODUCTS (2).png`; Search Results Advertising uses `8.Search Results Advertising (2).png`; Deals/Bestsellers/New Arrivals uses `9.Deals, Bestsellers & New Arrivals (1).png` and `(2).png`; Category Pages uses `10.Category Pages (2).png` and `(3).png`; Featured on the Homepage uses `11.Featured on the Homepage (2).png`; Product Detail Pages uses `12.Product Detail Pages (1).png` and `(2).png`. `image(357).png` was checked and absent, but it is not required after removing Homepage Brand Takeover.
- Sponsor images use page-specific visual wrapper classes in `src/styles.css` so transparent PNG subjects are centered, `object-fit: contain`, max-width guarded, pair-scaled, and transformed only enough to fill the intended visual area without stretching, important cropping, or horizontal overflow. The Weekly Deals paragraph is a natural single readable sentence instead of forced short-line breaks.
- Follow-up medium visual sizing: Deals/Bestsellers/New Arrivals, Category Pages, Product Detail Pages, and the single Search Results Advertising Daring ready-meal visual should render at medium size rather than tiny. Product Detail Pages should keep both phone images leaning in the same direction while remaining contained and responsive.
- Follow-up large visual sizing on 2026-06-08: Featured on the Homepage is the visual scale baseline and sponsor visuals are enlarged significantly across all formats. `.sponsor-visual--floating`, `.sponsor-visual--phone`, `.sponsor-visual--pair`, `.sponsor-visual--weekly`, and `.sponsor-visual--detail` should keep images much larger while preserving contain fitting, no distortion, no important cropping, and no horizontal page scroll.
- Search Results Advertising layering follow-up on 2026-06-08: the right visual should be one grouped layered unit using the category phone screen behind the Daring ready-meal ad card. The phone is the back z-index layer, the Daring card overlaps the lower-middle/front, both images preserve PNG transparency with `max-width: 100%`, `height: auto`, and `object-fit: contain`, and the layout must avoid horizontal scroll across desktop, tablet, Android Chrome, iPhone Safari, Chrome, and Safari.
- Deals/Bestsellers/New Arrivals and Category Pages follow-up on 2026-06-08: each section uses only two large right-side phone images, side-by-side with slight overlap/angle where useful, scaled close to the Featured on the Homepage visual baseline. Mobile and tablet keep both phones visible and large, shrinking only enough to prevent overflow.
- Product Detail Pages follow-up on 2026-06-08: the orange hero clips oversized right-side decorative phone mockups inside the section. The hero stays `position: relative; overflow: hidden;`, the phone wrapper is absolutely positioned near `right: 6%; bottom: -120px;`, phone sizes use responsive `clamp()` values, and the phone tails are intentionally cropped at the orange section bottom without bleeding into the next white/footer area.
- Dominant visual alignment follow-up on 2026-06-08: sponsor ad sections now use a consistent `.sponsor-section` structure with `42% / 58%` desktop columns, `.sponsor-copy` at a higher z-index, and `.sponsor-visual` as a right-aligned flex visual field. Category Pages and Deals/Bestsellers/New Arrivals should feel full on the right side with two large close-together phone mockups, while Featured on the Homepage should stay large and vertically centered in its right column.
- Asset sizing note: the paired phone/detail/homepage mockup PNGs had oversized transparent 1000px canvases, so their transparent bounds were cropped in `public/images/become-sponsor/` while preserving PNG alpha. This keeps `object-fit: contain`, no distortion, and makes responsive `clamp()` widths scale the visible app mockup rather than empty padding.
- Product Detail responsive direction: the orange section remains the only clipped sponsor ad section. Desktop uses absolute right/bottom phone placement with `bottom: -120px`; tablet and mobile stack text first, keep the phone pair oversized below it, and clip the bottom within the orange section so the next white/footer area starts cleanly.
- Responsive stack follow-up on 2026-06-08: at `max-width: 1024px`, sponsor ad sections switch to copy-first single-column layout with the visual block below the text. `.sponsor-copy` stays above decorative layers with `z-index: 3`, while `.sponsor-visual`, `.sponsor-visual--floating`, and `.sponsor-visual--detail` reset to relative positioning so no tablet or mobile-desktop image can sit behind or overlap the copy.
- Search Results Advertising composition follow-up: the visual uses explicit `search-results-phone` and `search-results-banner` classes. Desktop places the phone behind/top-right and centers the large Daring horizontal banner in front; tablet/mobile places the phone first and overlaps the banner upward inside the visual block only. The Search Results phone and Daring banner PNGs are cropped to transparent bounds so the visible mockups scale large without distortion.
- Product Detail mobile follow-up: tablet/mobile layouts keep Product Detail text and button first, add spacing, then show the large phone pair below. The phones remain relative to the visual block on those breakpoints, with only downward translation for clipped tails inside the orange section and no image placement behind the text.
- Search composition follow-up on 2026-06-08: Search Results Advertising should use a dedicated `SearchResultsVisual` component with a single composed parent wrapper. The phone remains the back layer, and the Daring product card lives inside a foreground `search-results-card-group`, so the foreground card treatment never separates from the visual composition or overlaps the text area.
- Stats alignment follow-up on 2026-06-08: all four Expand Your Reach metrics use the same `sponsor-stat` layout, with a large `sponsor-stat__value` and a consistent supporting `sponsor-stat__label`. `20 MILLION+` / `MONTHLY VISITS` and `90%` / `YOY growth` should align with the `30 MILLION+` and `ZERO` hierarchy rather than using embedded line breaks inside the value text.
- Weekly Deals phone-backdrop follow-up on 2026-06-08: the first Sponsored Products / Weekly Deals visual uses the supplied `20.SPONSORED PRODUCTS (3).png` as a cropped transparent phone back layer (`sponsored-products-phone-bg.png`). The two food deal boxes sit together in `sponsor-weekly-card-group` as a connected foreground composition over the phone, preserving large responsive scaling without separating into floating cards.
- Responsive overlay composition fix on 2026-06-08: Search Results Advertising and Weekly Deals should both preserve one grouped visual block at desktop, tablet, mobile-desktop, and phone widths. Each block uses a relative wrapper, an absolute phone back layer, and an absolute foreground card group, with the small cards overlapping the phone body rather than participating in normal flow below it. Text stays copy-first on stacked layouts, then the composed visual follows as one unit with no horizontal overflow.
- Search Results desktop revert on 2026-06-08: the Search Results Advertising visual should keep the previous desktop composition as the source of truth: category-phone back layer plus the Daring sponsored search-result banner layered in front. Responsive breakpoints should scale and center that same grouped composition below the copy, not replace it with different card assets or let the foreground banner drop below the phone.
- Weekly Deals card scale fix on 2026-06-08: the Weekly Deals visual should emphasize two larger foreground food/promo boxes over the phone body, not small sticker-like cards. The first card sits around the upper-left/middle-left of the phone area and the second sits around the lower-right/middle-right, both overlapping the phone clearly across desktop, tablet, mobile-desktop, and phone layouts.
- Weekly Deals asset crop and stronger overlay fix on 2026-06-08: the two foreground card PNGs should stay tightly cropped to their visible transparent bounds so CSS width applies to the actual food boxes. The phone is the relative back anchor, and the card group remains absolute on top with larger desktop sizing and larger responsive tablet/mobile sizing, no max-width cap that makes the cards tiny, and no placement below the phone.

### Affiliate Hero Section (2026-06-08)

- Added the Affiliate Program page body at `/affiliate` and `#affiliate`, rendered between the existing shared header and footer without changing the header or footer component files.
- The section is a full-width soft peach/orange hero (`#ffb28f`) with no extra wrapper panel behind the copy, using Montserrat-first typography, bold black headline text, normal paragraph text, and a black rounded `Join & Earn` CTA with a white circular arrow icon.
- Hero copy is real HTML text: `Turn Your Audience Into Income`, `Earn Up to ฿75,000 Per Month`, and the Foodonlines.com affiliate paragraph. The CTA points to `#affiliate-apply` until a real application flow exists.
- Product cards use white rounded card surfaces with soft shadows, neutral CSS placeholder packshot shapes, red discount pills, uppercase gray brand labels, black product names, gray size/unit details, bold black prices, crossed-out old prices, and green outlined plus controls.
- Responsive behavior: desktop uses a two-column layout with text left and three tall product cards right; tablet stacks or compresses safely while keeping all three tall cards visible; mobile-landscape widths keep text and long vertical cards side by side when space allows; narrow mobile portrait converts product cards into wide horizontal rows with image left, copy middle, plus button right, safe padding, and no intended page-level horizontal overflow.
- Footer link follow-up on 2026-06-08: the existing Corporate footer `Affiliate Program` item now links to `/affiliate` and uses the same SPA click-routing behavior as Become a Vendor, Become a Partner, Become a Sponsor, and Become Our Drivers.
- Compact stats follow-up on 2026-06-08: the affiliate hero now includes four compact stat items under the product-card hero content on the same peach/orange background, with no darker stats banner. Desktop/tablet/mobile-landscape use a four-column row with thin vertical dividers, while mobile portrait stacks stats into short horizontal rows with number left, description right, and thin horizontal dividers. The headline uses the real `฿75,000` symbol, and product imagery remains neutral placeholder shapes ready for future packshots.

- Rewards/referral cards follow-up on 2026-06-08: the affiliate page now transitions from the peach/orange hero + stats area into a separate clean white `#ffffff` rewards section. Desktop shows three cards in one row composition with `Share your link` over the pastel gradient card and `Refer friends & keep earning` over the two coral/red-orange cards. Tablet and mobile-landscape keep the row compressed where possible, while mobile portrait stacks compact square-like cards with hidden buttons, lower-right white SVG icons, guarded text sizes, subtle shadows, and no intended horizontal overflow.
- Rewards card responsive fix on 2026-06-08: desktop remains mostly unchanged, while tablet/mobile-desktop widths make the two coral cards shorter and more banner-like with larger readable text, corrected `#f75b43` card color, compact buttons, and large white icons positioned close to the right side of the copy. Mobile landscape keeps the same compact banner behavior, and mobile portrait remains stacked with compact square-like cards, hidden buttons, lower-right icons, and the rewards section background staying white `#ffffff`.
- Rewards card copy fix on 2026-06-08: Card 3 in the white Affiliate Rewards section now displays the actual Thai baht symbol as `Receive ฿100`, not mojibake/question-mark text.
- How It Works section on 2026-06-08: added the next affiliate section below Rewards on a warm soft cream `#fff3e8` background. It uses the hardcoded eyebrow `How does it work?`, heading `Getting started is easy`, a white top-right `Join & earn` pill, and three hardcoded steps: `Sign up`, `Share`, and `Get started`.
- How It Works responsive direction: desktop/tablet use a balanced three-column layout with white number badges, coral step titles, black supporting text, coral/salmon illustration panels, and subtle dashed vertical dividers. Mobile portrait is intentionally different: Step 1 becomes the expanded feature block with the visual box coming down below the text plus a black `Join and earn` CTA, while Steps 2 and 3 stack underneath as compact text-left / visual-right cards.
- Rewards typography fix on 2026-06-08: tablet and mobile-desktop rewards cards now use larger responsive labels, eyebrows, titles, and body text while keeping the section white, the cards compact, and the coral-card icons close to the right side of the copy. Mobile portrait keeps square-like cards with larger readable text and hides only Card 1's optional extra line to avoid stretching the card.
- Rewards desktop typography reset on 2026-06-08: desktop-only `min-width: 1025px` CSS reduces the Affiliate Rewards / Referral Cards section label, card eyebrow, title, body, and extra text sizes so desktop copy fits inside the cards again. Tablet, mobile-desktop, mobile portrait, Affiliate Hero + Stats, header, footer, and How It Works styling remain unchanged.
- Rewards desktop icon placement fix on 2026-06-09: desktop-only CSS now makes the decorative reward-card SVG icons smaller, pins them farther into the lower-right corner, and reserves a right-side content safe area so icons do not overlap body copy or buttons. Tablet/mobile-desktop icon placement and mobile portrait card layout remain unchanged.
- How It Works image placement update on 2026-06-11: the three steps now use the supplied PNG card artwork from `public/images/affiliate/how-it-works/`: `create-account.png` for Step 1 / Create Your Account, `share.png` for Step 2 / Share, and `get-started.png` for Step 3 / Get Started. The images sit inside each step's visual area with `object-fit: contain`, centered positioning, lazy loading, and max-width guards so desktop, tablet, mobile-desktop, mobile landscape, Android, and iOS portrait avoid stretching, clipping, and horizontal overflow.
- How It Works responsive image behavior: desktop keeps three columns with number badge, title, body, image below, and dashed vertical dividers; tablet/mobile-desktop reduce visual height while keeping the three-step structure where space allows. Mobile portrait keeps Step 1 as the larger stacked feature block, with the Step 1 image coming down below the text and the black `Join and earn` CTA below the image; Steps 2 and 3 remain compact cards with text on the left and their images controlled on the right at a fixed percentage column.
- How It Works image URL fix on 2026-06-11: the step image `src` values now use the Vite `import.meta.env.BASE_URL` prefix so the same copied assets from `pages/affillate page` resolve correctly on local root builds and production subpath builds instead of falling back to broken-image alt text.
- Three-step image-card layout fix on 2026-06-11: the How It Works image cards now use visual-only cropped assets from `pages/affillate page` and a single shared large card frame for all three steps. The external number/title/body remain above each card only; duplicated card-internal step labels/body copy are removed. Desktop, tablet, mobile-desktop, and mobile portrait use the same card dimensions, radius, padding logic, gradient background, border, and contain-fit image behavior for Boxes 1, 2, and 3, with the prior mobile white outer wrapper panels removed.
- Three-step asset transparency fix on 2026-06-11: the current visual-only PNGs for the How It Works cards have transparent backgrounds so the existing card gradient/background is the only visible backdrop. No card CSS, sizing, radius, spacing, typography, or responsive structure changed; only the baked peach/brown pixels in the image assets were removed.
- Card 2 transparency follow-up on 2026-06-11: the transparent Share visual keeps the supplied Facebook (`3Share.png`), Instagram (`Share (3).png`), and LINE (`Share (2).png`) icon assets in the card composition alongside the share-network visual, with no embedded colored rectangle behind them.
- Affiliate Dashboard / Start Earning Today section on 2026-06-11: added a new soft peach/orange `#ffb28f` section directly below the white Affiliate Rewards / Referral Cards section and above How It Works. It uses scoped Montserrat-first typography, real text for `Start Earning Today`, the tracking-tools paragraph, `Easy-to-use Dashboards`, dashboard body copy, and a compact black `Get Started` pill CTA with a white circular SVG arrow.
- Affiliate Dashboard image and layout direction: the supplied dashboard illustration from `pages/affillate page/23.Start Earning Today.png` is copied to `public/images/affiliate/affiliate-dashboard.png` and displayed inside the white dashboard card with `object-fit: contain` and alt text `Affiliate dashboard analytics illustration`. Desktop/tablet use a wide balanced two-column white card with copy left and image right; mobile portrait stacks the uploaded dashboard image above centered copy/button while keeping the card compact and avoiding horizontal overflow.
- Affiliate FAQ accordion section on 2026-06-11: added a pale blush `#ffe7ea` FAQ section directly below the `Getting started is easy` / How It Works section. Desktop uses a two-column layout with `Have any questions?` on the left and the accordion list on the right; tablet, mobile-desktop, and mobile portrait stack the heading above a full-width accordion.
- Affiliate FAQ interaction and responsive direction: all FAQ items are closed by default and open manually through native button rows with `aria-expanded`, `aria-controls`, labeled answer regions, and a rotating plus icon. The section uses scoped Montserrat typography, bold readable questions, regular body copy, subtle dividers instead of heavy cards, animated panel expansion, larger mobile touch targets, wrapping answers, and no intended horizontal overflow.
- Affiliate Signup CTA banner on 2026-06-11: added a full-width long CTA banner directly below the Affiliate FAQ accordion. It uses the supplied woman-with-box photo copied to `public/images/affiliate/affiliate-signup-banner.png` as a cover background, with a warm semi-transparent orange overlay for readability.
- Affiliate Signup CTA responsive direction: desktop keeps the sample-inspired layout with large white Montserrat headline `Join our` / `affiliate program` on the left, `Contact us at info@foodonlines.com` below it, and a large black pill `Sign up` button with a white circular arrow on the right. Tablet/mobile-desktop scale the composition down while preserving the woman on the right; mobile portrait stacks headline, contact text, and CTA over the image with background positioning biased toward the woman's face and no intended horizontal overflow.

### Contact Us Page (2026-06-12)

- Added a new public Contact Us page at `/contact-us` with `#contact-us` fallback routing. The existing Company footer `Contact Us` link now opens this page through the shared public route store without changing footer visual design.
- The page uses a sample-inspired split composition: light orange/peach left panel (`#f8e1cf`) with pink `Let's talk` eyebrow, oversized near-black `Contact us` headline, help-center link with arrow, and the supplied grocery/herb art from `public/images/contact-us/contact-hero-groceries.png` anchored near the bottom.
- Right content uses Settings-style cards: rounded white surfaces, subtle border/shadow, compact icon circles, strong title text, readable link rows, and blue action links. Get in touch cards use light-blue icon circles; Partners cards use light-pink circles; hiring cards use light-orange circles.
- Content sections are hardcoded as `Get in touch`, `Partners`, and `We're hiring`, with email links using `mailto:`. The support email uses the existing site/footer email `sale@foodonlines.com`. `Go to your account` routes to `#account/settings`.
- Responsive direction: desktop uses roughly 36% left / 64% right columns with the left panel sticky below the fixed header. Tablet and mobile-desktop keep two columns only when space allows, then stack. Mobile portrait places the left visual panel above the right content and stacks cards one per row with touch-friendly spacing and no intended horizontal overflow.

### Contact Us Learn More Removal (2026-06-12)

- Removed the `Learn more` action rows from every Contact Us card. The card design now stops after the primary email/account link, avoiding extra divider rows and preventing Contact Us URLs from collecting unrelated hashes such as `#become-partner`.
- Card heights are slightly more compact while keeping the same rounded white Settings-style surfaces, tone-specific icon circles, and blue email/action links.

### Contact Us Hero Image Positioning Fix (2026-06-12)

- Adjusted only the grocery/herb image inside the pale blue Contact Us hero panel. The desktop image now sits closer to the bottom-left panel edge with `object-position: left bottom`, a wider image width, and a smaller intentional left bleed so it feels anchored instead of floating.
- Mobile and tablet keep the same text order and page structure, but the hero art starts closer below the help-center link, bleeds slightly toward the side edge, and avoids extra empty hero height before the `Get in touch` section.

### Contact Us Hero Background Color Update (2026-06-12)

- Updated only the Contact Us left hero panel background from pale blue-gray to soft light orange/peach `#f8e1cf`. Header, footer, layout, card content, card grid, icons, spacing, food image, and approved image positioning remain unchanged.

### Contact Us Flush Hero Image Edge Fix (2026-06-12)

- Refined only the food image placement inside the left Contact Us hero panel so the art reaches the panel's left and bottom edges instead of sitting inside the text padding.
- The left hero panel remains light orange `#f8e1cf`; text keeps its own top/side padding, while the image sits directly in the unpadded panel area with `object-position: left bottom`, large edge bleed, no wrapper background, and no extra bottom gap on desktop, tablet, or mobile portrait.

### Contact Us Hero Image Bottom Edge Fix (2026-06-12)

- Adjusted only the left hero image layer so the food artwork visually touches the bottom edge of the orange panel. The image asset remains unchanged, but it now renders inside a no-padding, line-height-zero, overflow-hidden art wrapper with a small downward translate to clip the PNG's transparent bottom pixels.
- Desktop and mobile keep the same text, background color, layout, and right-side content while removing the floating beige/orange strip below the visible food.

### Wholesaler Page Savings Section Responsive Card (2026-06-12)

- Added the public Wholesaler page at `/wholesaler` with `#wholesaler` fallback routing. The existing header `Wholesale Products` item now opens the page without changing header layout, footer layout, hero copy, or the third brands artwork.
- Wholesaler assets from `pages/wholesaler` are copied to `public/images/wholesaler/` for browser-safe URLs. The first hero and third `Source products from leading brands` areas use the supplied artwork as-is so their approved visual direction is not redesigned.
- The second `More Savings, More Convenience` section is code-native and responsive. Desktop keeps a lavender full-width composition with centered black heading text, three benefit points, and a transparent product collage at the bottom.
- Tablet and mobile portrait use the approved single centered white rounded card on the soft lavender page background. The card contains a large centered `Save 10%` / `on every order` heading, centered subtitle `Flexible delivery and free unloading`, thin lavender-gray dividers, three stacked benefit rows, and the transparent product collage anchored along the card bottom.
- All savings-section text is near-black and Montserrat-scoped. Headings, eyebrow, and emphasized text use Montserrat 800/900; body, subtitle, and benefit text use Montserrat 400. Purple text is not used in the savings section.
- Benefit rows use pale orange rounded icon boxes. No standalone discount/delivery/package icon files were present in `pages/wholesaler`, so scoped inline SVG fallback icons are used only for those three row icons; product images still come from the supplied Wholesaler asset folder.
- The bottom collage uses the supplied transparent curry box, Bibigo bag, canned chicken, sauce tub, and green wave assets, with no colored image box behind the products and no intentional horizontal overflow.

### Wholesaler Footer Link Fix (2026-06-12)

- The Corporate footer item formerly shown as `Farm Careers` is now labeled `Wholesale`.
- The footer `Wholesale` item links to the public Wholesaler page at `/wholesaler` through the same SPA route handling used by the other Corporate landing-page links.

### Wholesaler Image Layout Fix (2026-06-12)

- Refined only the Wholesaler page image layout in the second savings section and third leading-brands section.
- In the savings section, transparent product cutouts are raised higher above the bottom wave and the wave is treated as a lower decorative base. The product packaging should remain clearly visible, with only the lowest area visually grounded by the green wave, and no colored product-image boxes added.
- In the leading-brands section, the former full-section screenshot is replaced with four responsive white cards using real text and the supplied card photos. Each card has a fixed image box, visible title, and visible paragraph copy.
- Third-section card media uses a stable aspect ratio with contained overflow so images cannot grow too tall, cover text, or push body copy out of the card on desktop, tablet, or mobile.
- Typography remains Montserrat-scoped with black heading/title/body text for the Wholesaler sections.

### Wholesaler Savings Wave Overlap Tune (2026-06-12)

- Tuned only the second Wholesaler savings section bottom product collage and green wave relationship.

### Wholesaler FAQ Accordion (2026-06-12)

- The Wholesaler page now continues directly from the `Source products from leading brands` cards into a centered five-row FAQ accordion on the same `#fbf4ff` page background, with no separate lavender panel or card wrapper.
- Questions use bold black Montserrat text, answers use regular black Montserrat text, and subtle black dividers plus small rotating chevrons match the supplied clean accordion reference.
- All rows are closed by default. Responsive spacing, wrap-safe question text, fixed chevron sizing, large touch targets, and constrained answer widths prevent clipping or horizontal overflow on desktop, tablet, mobile-desktop, and mobile portrait layouts.

### Footer Return Policy Page (2026-06-12)

- Added `Return Policy` directly beneath `Privacy Policy` in the footer Company column. The link opens a dedicated responsive `/return-policy` page while preserving the existing header and footer layout.
- The policy uses a warm neutral page background with the text placed directly on that background. There is no white document card, shadow, rounded wrapper, or boxed category panel; strong black headings, readable neutral body text, subtle dividers, and a centered reading width keep the long-form document legible on mobile and desktop.
- The supplied return-policy content is presented with Foodonlines.com branding throughout, including updated Foodonlines.com customer-service references and contact links. No Yami/Yami.com branding remains on the page.

### Footer Terms of Use Page (2026-06-12)

- The footer `Terms & Conditions` link now opens a dedicated responsive `/terms-and-conditions` page containing the supplied Foodonlines.com Terms of Use copy.
- Terms text sits directly on the same warm neutral legal-page background used by Return Policy, with a centered 900-1100px reading width, bold title and section heading hierarchy, readable near-black paragraphs, and no content card or boxed background.
- The arbitration notice is visually emphasized through bold uppercase typography only; the page does not introduce a panel, border, shadow, radius, or alternate background behind it.

### Footer Privacy Policy Page (2026-06-12)

- The footer `Privacy Policy` link now opens a responsive `/privacy-policy` page using the same background-only legal-document presentation as Return Policy and Terms.
- The long supplied policy is split into clear bold section headings with readable paragraph spacing inside a centered 900-1100px wrapper. Text remains directly on the warm neutral page background with no white card, boxed sections, shadow, border, or rounded content surface.
- Foodonlines.com branding replaces every Yami/Yamibuy reference, including software, marketplace, and user-content passive-conduit language.

### Footer Contact Cleanup (2026-06-12)

- The shared site footer contact block now contains only the Foodonlines sales email row.
- Bangkok office, phone, and opening-hours rows are removed globally without changing the footer columns, logo, description, legal links, account links, or corporate links.
- The wave is now the foreground decorative base in front of the transparent product cutouts. Products are lowered toward the wave so they visually touch it, while the wave covers only a subtle lower portion of the packages rather than leaving them floating or hiding too much of them.
- Desktop, tablet, and mobile each keep separate offsets/wave heights so the collage stays balanced with no intentional horizontal overflow.

## Guardrails

- Keep this file as single design source of truth for both public site and backend/admin mockup.
- Always update this design notes file whenever dashboard UI/UX, frontend layout, brand styling, deployment-facing frontend output, or admin flow changes. Pair updates with `AGENT.md` before commit/push.
- Preserve green/orange FoodOnlines brand contrast.
- Keep cards to small radius and avoid nested card layouts.
- Keep homepage usable as first screen, not a marketing-only landing page.
- Preserve public/admin separation: public stays on `index.html` / `src/main.tsx`, admin stays on `admin.html` / `src/admin-main.tsx`, and no admin entry buttons return to the public site.
- Avoid new dependencies unless feature need is clear.
## Footer FAQ Page (2026-06-12)

- The `/faq` page follows the site's existing warm-neutral public-page background and wide responsive content rhythm beneath the fixed shared header.
- A single horizontal pill rail leads the page: active category uses solid brand blue with white type, inactive categories use light gray with near-black type, and mobile keeps the rail swipe-scrollable without a visible scrollbar.
- FAQ questions and answers render directly on the page background. Rows are separated only by thin neutral rules; questions use medium-bold near-black text, answers use regular near-black text, and right-aligned SVG chevrons rotate when expanded.
- Desktop uses the full wide content area with generous side padding. Tablet and mobile preserve readable wrapping, touch-safe row heights, aligned chevrons, comfortable answer spacing, and no intended horizontal overflow.
## Product Detail Back Button UX (2026-06-13)

- Keep the existing `Back to products` label and visual treatment unchanged.
- The action returns users to their original product context: the same category listing or search results query, rather than always sending them to a generic/home page.
- Product detail pages opened directly without a stored origin fall back to the product's own category listing, providing a stable product-browsing destination on desktop, tablet, and mobile.
# Product Media Delivery (2026-07-12)

- Product packaging keeps the approved card and detail layouts, crops, proportions, whitespace, colors, and responsive behavior. Mockup catalog entries explicitly use `imageFit: "cover"`; other product imagery defaults to `contain`.
- PNG packshots were replaced in runtime delivery by same-dimension, high-quality WebP files. No product image was AI-modified, resized, retouched, recolored, or background-removed.
- Product cards keep stable square/4:3 media containers and use browser-native lazy loading plus async decoding. Detail media retains the original available dimensions for label readability and enlargement quality.
- Shared media URL resolution accepts current local assets and future absolute CDN URLs without prefixing external URLs with Vite's base path.
- Memorial Day and login/signup banner artwork now ships as WebP with its existing copy, aspect ratio, crop, and layout unchanged.
- The active homepage hero remains the approved local MP4 experience. No visual design, route, cart, favorites, search, checkout, auth, or admin behavior changed in this pass.
# Catalog Architecture Preparation (2026-07-12)

- The storefront keeps its approved visual design and synchronous behavior while product access now flows through a catalog repository boundary backed by the existing local data.
- Shared product/category/media types preserve every current display field, explicit image fit, product IDs, pricing, variants, details, and responsive image behavior.
- Local asset and future CDN/API image URLs are normalized at the data-adapter boundary with the existing `resolveMediaUrl`; rendered URLs are not resolved a second time in components.
- Homepage rows, category grids, search, product detail, related items, cart, favorites, and checkout retain their current ordering, counts, matching, routing, and interaction contracts.
- The prepared API DTO mapper is inactive. No Laravel catalog request, Cloudflare R2 integration, loading UI, layout change, or backend migration was introduced.
