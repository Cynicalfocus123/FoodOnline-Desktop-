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
- Category strip for common food paths.
- Best deals grid with product cards, discount tags, prices, and add-to-cart buttons.
- Footer has two compact stacked link groups: Privacy/Terms/FAQ/Company News/Our Mission/Contact Us, then Seller/Recipe/Partners.

## Implementation Notes

- React + TypeScript + Vite.
- Zustand stores shared signup form state for hero and splash email forms.
- Tailwind CSS owns responsive layout, colors, spacing, shadows, and buttons.
- Public behavior is front-end only. Signup stores session UI state; no network submission yet.
- Signup form fields should allow natural spacing while typing words, with final cleaned values still validated and normalized before completion.
- Target backend architecture is now fixed for future real backend phase: Laravel PHP + MySQL, with secure session auth and Eloquent-backed persistence.
- Generated build, dependency, and dev-log folders stay untracked via `.gitignore`.
- README documents local install, dev, and build commands.
- GitHub Pages production build uses `/FoodOnline-Desktop-/` base path for deployed assets.

## Admin Mockup Direction

- Phase 1 admin deliverable now lives inside current frontend repo as mock-only UI foundation, not real server logic yet.
- Public header includes admin entry point that opens separate admin login experience without breaking home/signup flow.
- Admin entry wording is now explicit: `Test Admin Dashboard`, with matching footer test link and note so users understand it is feature-testing path.
- Admin login screen uses production-style split layout with Laravel/MySQL backend blueprint messaging and security posture callouts.
- Admin dashboard uses dark sidebar shell with three navigation sections: Overview, Users, and Admin Settings.
- `Users` section contains three internal role tabs exactly for `Customers`, `Suppliers`, and `Partners`.
- Each Users table shows all current frontend signup fields: email, first name, last name, contact number, Line ID, company name, plus request status, source, timestamps, and safe action controls.
- Admin Settings screen allows mock credential rotation for admin email and password using local salted hash placeholder logic until Laravel backend replaces it.
- Overview section documents future Laravel tables, routes, middleware, and validation structure so UI maps cleanly into real backend work later.

## Security Guardrails

- Admin login keeps error messaging generic and never reveals whether email or password failed.
- Email input is trimmed, normalized, and lowercased before mock auth checks.
- Suspicious password patterns, tag-like input, and malformed email attempts are rejected before mock processing.
- Signup and admin text fields render through normal React escaping only. No raw HTML rendering path exists.
- Signup request status actions use archive/follow-up flow rather than destructive delete patterns.
- Phase 1 security TODO for Laravel: move auth to server, use `Hash`, session cookies, CSRF, throttle middleware, audit logs, login logs, and Eloquent-safe queries only.

## Guardrails

- Every completed change or fix must include a matching update to both `AGENT.md` and this `design.md` file so project rules and design intent stay current.
- Preserve green/orange FoodOnlines brand contrast.
- Keep cards to small radius and avoid nested card layouts.
- Keep homepage usable as first screen, not a marketing-only landing page.
- Avoid new dependencies unless feature need is clear.
