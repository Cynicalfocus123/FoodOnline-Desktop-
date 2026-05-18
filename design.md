# FoodOnlines Desktop Home Design

## Source Direction

- Visual reference: clean grocery commerce layout with white space, green/orange accents, product cards, category tiles, and promotional hero blocks.
- Brand mark: `public/assets/food-online-long-text-cutout.png`, used top-left in fixed header without text, badge, or container.
- Main slider background video: `public/assets/food-horizontal.mp4`.
- Splash signup video: `https://cdn.dribbble.com/userupload/37155242/file/original-dfa8adc9e11296c13069bce9286cb596.mp4`.

## Page Structure

- Fixed modern white header with larger long transparent FoodOnlines logo, desktop navigation, signup shortcut, and shop button.
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
- Target backend architecture remains: REST or GraphQL API, Node/NestJS or Laravel, PostgreSQL, Cloudflare R2 or AWS S3 for media.
- Generated build, dependency, and dev-log folders stay untracked via `.gitignore`.
- README documents local install, dev, and build commands.
- GitHub Pages production build uses `/FoodOnline-Desktop-/` base path for deployed assets.

## Guardrails

- Preserve green/orange FoodOnlines brand contrast.
- Keep cards to small radius and avoid nested card layouts.
- Keep homepage usable as first screen, not a marketing-only landing page.
- Avoid new dependencies unless feature need is clear.
