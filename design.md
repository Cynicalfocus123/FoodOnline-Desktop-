# FoodOnlines Desktop Home Design

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

- React + TypeScript + Vite.
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
- The grid contains eight empty white rounded boxes with light borders and subtle shadow, matching the sample card structure without adding any names, roles, images, or placeholder text.
- Desktop uses 4 boxes per row for 2 rows total; tablet uses 2 columns; small mobile stacks to 1 column so the boxes stay usable on Android, iOS, and narrow browser widths.

## Guardrails

- Keep this file as single design source of truth for both public site and backend/admin mockup.
- Always update this design notes file whenever dashboard UI/UX, frontend layout, brand styling, deployment-facing frontend output, or admin flow changes. Pair updates with `AGENT.md` before commit/push.
- Preserve green/orange FoodOnlines brand contrast.
- Keep cards to small radius and avoid nested card layouts.
- Keep homepage usable as first screen, not a marketing-only landing page.
- Preserve public/admin separation: public stays on `index.html` / `src/main.tsx`, admin stays on `admin.html` / `src/admin-main.tsx`, and no admin entry buttons return to the public site.
- Avoid new dependencies unless feature need is clear.
