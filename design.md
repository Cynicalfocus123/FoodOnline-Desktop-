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
- Public auth now stays inside the same visual system: homepage remains the first screen, Register opens the existing split signup layout, Login uses a matching split layout, and Continue as Guest keeps users on the public storefront.
- Category strip for common food paths.
- Best deals grid with product cards, discount tags, prices, and add-to-cart buttons.
- Footer has two compact stacked link groups: Privacy/Terms/FAQ/Company News/Our Mission/Contact Us, then Seller/Recipe/Partners.

## Implementation Notes

- React + TypeScript + Vite.
- Zustand stores shared signup form state for hero and splash email forms.
- Tailwind CSS owns responsive layout, colors, spacing, shadows, and buttons.
- Public behavior now uses live Laravel API auth. Registration posts to `POST /api/v1/auth/register`, login posts to `POST /api/v1/auth/login`, session restore uses `GET /api/v1/auth/me`, and logout posts to `POST /api/v1/auth/logout`.
- Public API base config lives in `src/lib/runtimeConfig.ts` and defaults to `https://foodonlines.com/api/v1`.
- Signup form fields should allow natural spacing while typing words, with final cleaned values still validated and normalized before completion.
- Signup now includes password and confirm password with minimal design change so newly registered public users can log in immediately.
- Logged-in users stay on the public homepage design and see a compact account summary block plus Logout state. Guests still see Login/Register entry points.
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
- Public cPanel output is the `frontend-upload/` folder plus ZIP `foodonlines-main-live-frontend-upload.zip`, containing only `index.html`, `assets/`, `.htaccess`, and `DEPLOYMENT-INSTRUCTIONS.txt`.

## Guardrails

- Keep this file as single design source of truth for both public site and backend/admin mockup.
- Always update this design notes file whenever dashboard UI/UX, frontend layout, brand styling, deployment-facing frontend output, or admin flow changes. Pair updates with `AGENT.md` before commit/push.
- Preserve green/orange FoodOnlines brand contrast.
- Keep cards to small radius and avoid nested card layouts.
- Keep homepage usable as first screen, not a marketing-only landing page.
- Preserve public/admin separation: public stays on `index.html` / `src/main.tsx`, admin stays on `admin.html` / `src/admin-main.tsx`, and no admin entry buttons return to the public site.
- Avoid new dependencies unless feature need is clear.
