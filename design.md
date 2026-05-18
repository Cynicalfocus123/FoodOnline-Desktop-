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
- Generated build, dependency, and dev-log folders stay untracked via `.gitignore`.
- README documents local install, dev, and build commands.
- GitHub Pages production build uses `/FoodOnline-Desktop-/` base path for deployed assets.
- Public site must not include admin entry buttons or inline admin routing. Standalone admin lives on separate page entry `admin.html`.

## Backend/Admin Design

- Admin phase 1 mockup uses standalone one-card login screen with only `Admin` and `Password` fields.
- After login, admin shows dark sidebar dashboard with `Overview`, `Users`, and `Admin Settings`.
- `Users` includes role tabs for `Customers`, `Suppliers`, and `Partners`.
- Signup users appear approved instantly by default. No separate approval queue UI remains.
- Action column now uses one styled dropdown control instead of multiple stacked buttons, with only `Move to Review` and `Delete User`.
- Table design shows all frontend signup fields plus request-management metadata so later Laravel + MySQL backend can map one-to-one into real migrations and admin screens.
- Security presentation should stay visible in admin design: generic login errors where needed, safe text rendering, archive-not-delete actions, and Laravel handoff notes for CSRF, rate limiting, hashing, and audit logs.

## Guardrails

- Keep this file as single design source of truth for both public site and backend/admin mockup.
- Preserve green/orange FoodOnlines brand contrast.
- Keep cards to small radius and avoid nested card layouts.
- Keep homepage usable as first screen, not a marketing-only landing page.
- Avoid new dependencies unless feature need is clear.
