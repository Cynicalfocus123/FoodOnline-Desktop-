# FoodOnlines Desktop Home Design

## Source Direction

- Visual reference: clean grocery commerce layout with white space, green/orange accents, product cards, category tiles, and promotional hero blocks.
- Brand mark: `public/assets/food-online-long-text-cutout.png`, used top-left in fixed header without text, badge, or container.
- Main slider background video: `public/assets/food-horizontal.mp4` on desktop and the YouTube embed `https://www.youtube.com/embed/x-ZFmik0geY` on mobile.
- Splash signup video: `https://cdn.dribbble.com/userupload/37155242/file/original-dfa8adc9e11296c13069bce9286cb596.mp4`.

## Page Structure

- Fixed modern white header with larger long transparent FoodOnlines logo, desktop navigation, and signup shortcut.
- Full-viewport home hero with background food video, dark overlay, centered offer copy, and one primary Join Us Now CTA.
- Signup opens into a multi-step app flow: role selection, split brand-and-form layout, then registration complete state.
- Public auth now stays inside the same visual system: homepage remains the first screen, Register opens the existing split signup layout, and Login uses a matching split layout. Register/Login are the main entry flow.
- Category strip for common food paths.
- Best deals grid with product cards, discount tags, prices, and add-to-cart buttons.
- Footer has two compact stacked link groups: Privacy/Terms/FAQ/Company News/Our Mission/Contact Us, then Seller/Recipe/Partners.

## Implementation Notes

- React + TypeScript + Vite.
- Zustand stores shared signup form state for hero and splash email forms.
- Tailwind CSS owns responsive layout, colors, spacing, shadows, and buttons.
- Public behavior now uses live Laravel API auth. Registration posts to `POST /api/v1/auth/register`, login posts to `POST /api/v1/auth/login`, session restore uses `GET /api/v1/auth/me`, and logout posts to `POST /api/v1/auth/logout`.
- Public/admin API base config lives in `src/lib/runtimeConfig.ts` and defaults to `https://www.api.foodonlines.com/api/v1`.
- Signup form fields should allow natural spacing while typing words, with final cleaned values still validated and normalized before completion.
- Signup now includes password and confirm password with minimal design change so newly registered public users can log in immediately.
- Signup and login password fields include compact eye toggles, preserving the current form layout.
- Signup is one responsive flow for desktop and mobile. The shared registration submit path posts JSON to the live Laravel endpoint with the same payload used by the last known working desktop signup.
- Mobile signup inputs disable autocapitalization/autocorrection for email, Line ID, password, and confirm password to prevent mobile keyboard mutation without changing layout.
- Logged-in users stay on the public homepage design and see a compact account summary block plus Logout state. Visitors see Login/Register entry points.
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
- Public cPanel output is the `frontend-upload/` folder plus ZIP `foodonlines-main-live-frontend-upload.zip`, containing `index.html` for public, `admin.html` for admin, shared `assets/`, `.htaccess`, and `DEPLOYMENT-INSTRUCTIONS.txt`.
- Deployment routing must preserve split entries: `index.html` must always load the public `main-*.js` bundle, `admin.html` must always load the admin `admin-*.js` bundle, and `.htaccess` must rewrite `/admin` to `admin.html` while all other SPA paths fall back to public `index.html`.
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
- Browse All Categories section now uses rounded image cards with soft neutral framing and centered labels for 20 categories: Paan Corner, Dairy/Bread/Eggs, Fruits/Vegetables, Cold Drinks/Juices, Snacks/Munchies, Breakfast/Instant Food, Sweet Tooth, Bakery/Biscuits, Tea/Coffee/Milk Drinks, Atta/Rice/Dal, Masala/Oil/More, Sauces/Spreads, Chicken/Meat/Fish, Organic/Healthy Living, Baby Care, Pharma/Wellness, Cleaning Essentials, Home/Office, Personal Care, and Pet Care.
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
- Footer redesign on 2026-05-23 updates only footer presentation/content. New footer uses five-column desktop layout: large logo/contact block at left and four link columns titled `Company`, `Account`, `Corporate`, and `Popular`.
- Footer files changed for this redesign: `src/components/Footer.tsx` and `src/data/home.ts`.
- Footer content now mirrors reference with left description `We bring Grocery to your door for less`, Bangkok office address, phone, email, hours, and full text link lists for distributor/account/corporate/popular sections.
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

## Guardrails

- Keep this file as single design source of truth for both public site and backend/admin mockup.
- Always update this design notes file whenever dashboard UI/UX, frontend layout, brand styling, deployment-facing frontend output, or admin flow changes. Pair updates with `AGENT.md` before commit/push.
- Preserve green/orange FoodOnlines brand contrast.
- Keep cards to small radius and avoid nested card layouts.
- Keep homepage usable as first screen, not a marketing-only landing page.
- Preserve public/admin separation: public stays on `index.html` / `src/main.tsx`, admin stays on `admin.html` / `src/admin-main.tsx`, and no admin entry buttons return to the public site.
- Avoid new dependencies unless feature need is clear.
