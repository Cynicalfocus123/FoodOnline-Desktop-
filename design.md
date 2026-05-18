# FoodOnlines Desktop Home Design

## Source Direction

- Visual reference: clean grocery commerce layout with white space, green/orange accents, product cards, category tiles, and promotional hero blocks.
- Brand mark: `public/assets/app-install-icon.png`, used top-left in fixed header.
- Main slider background video: `public/assets/blue-apron-any-night.mp4`.
- Splash signup video: `https://cdn.dribbble.com/userupload/37155242/file/original-dfa8adc9e11296c13069bce9286cb596.mp4`.

## Page Structure

- Fixed header with FoodOnlines logo, desktop navigation, signup shortcut, and shop button.
- Full-viewport home slider with background food video, dark overlay, three manual slide states, offer copy, CTA, and quick pick buttons.
- Center splash section with video backdrop and signup email form in middle.
- Category strip for common food paths.
- Best deals grid with product cards, discount tags, prices, and add-to-cart buttons.
- Footer sections: Our mission, Company news, Contact us.

## Implementation Notes

- React + TypeScript + Vite.
- Zustand stores active slide and signup form state.
- Tailwind CSS owns responsive layout, colors, spacing, shadows, and buttons.
- Public behavior is front-end only. Signup stores session UI state; no network submission yet.
- Target backend architecture remains: REST or GraphQL API, Node/NestJS or Laravel, PostgreSQL, Cloudflare R2 or AWS S3 for media.
- Generated build, dependency, and dev-log folders stay untracked via `.gitignore`.
- README documents local install, dev, and build commands.

## Guardrails

- Preserve green/orange FoodOnlines brand contrast.
- Keep cards to small radius and avoid nested card layouts.
- Keep homepage usable as first screen, not a marketing-only landing page.
- Avoid new dependencies unless feature need is clear.
