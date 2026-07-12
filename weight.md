# FoodOnlines Site Weight

Generated on 2026-07-12 from the current workspace after the production-weight optimization pass.

## Measurement Scope

- Read source notes: `AGENT.md`, `design.md`, `design.json`.
- Read site-weight baseline: prior `weight.md`.
- Read deployment notes and corrected live-hosting context: live hosting is now Hostinger File Manager, not TMDHosting.
- Ran a fresh production build with `npm run build`.
- Did not run localhost, local IP previews, Vite preview, or any long-running server.

## Before And After

| Area | Before | After | Saved |
| --- | ---: | ---: | ---: |
| `public` source assets | 319.87 MB | 290.17 MB | 29.70 MB |
| `dist` production build | 323.02 MB | 175.86 MB | 147.16 MB |
| Production local video | 41.01 MB | 6.80 MB | 34.21 MB |
| Production image/static media | about 278 MB | 168.22 MB | about 110 MB |
| Main public JS entry | 466.50 KB | 101.47 KB | 365.03 KB |

Production build reduction: about 45.6%.

## Current Production Build Weight

| Area | Files | Size |
| --- | ---: | ---: |
| `dist` total | 1,028 | 175.86 MB |
| `dist` video | 1 | 6.80 MB |
| `dist` images/media | 998 | 168.22 MB |
| `dist` JS chunks | 25 | 0.67 MB |
| `dist` CSS | 1 | 170.43 KB |

Largest current production files:

| File | Size |
| --- | ---: |
| `dist/assets/food-horizontal.mp4` | 6.80 MB |
| `dist/assets/shop  and order banner-CFkICX1r.png` | 2.32 MB |
| `dist/assets/home-banners/memorial-day-sale-banner.png` | 1.68 MB |
| `dist/assets/dairy-bread-mockups/dairy-bread-20.png` | 1.44 MB |
| `dist/assets/drinks-beverage-mockups/drinks-beverage-45.png` | 1.36 MB |

## Optimized Assets

- `public/assets/food-horizontal.mp4`: 36.66 MB to 6.80 MB.
  - Re-encoded with FFmpeg as H.264 MP4, `yuv420p`, `+faststart`, no audio, 1600x682, 30 fps, 50.10s.
- `public/images/about/leadership/jakapun-viwatkurkul.webp`: 2.55 MB to 27 KB.
- Added optimized WebP variants for used Wholesaler, Driver, About, Contact Us, Become Vendor, Become Partner, and Affiliate media.
- Updated route components/data to reference optimized WebP files.
- Kept original supplied PNG/reference files in source where they may still be useful, but excluded unreferenced originals from production output.

## Production Assets Excluded

The build now uses `publicDir: false` plus `scripts/copy-public-assets.mjs` to copy only referenced runtime assets into `dist`.

Excluded examples:

- `public/assets/blue-apron-any-night.mp4`
- `public/assets/food-online-long-text-transparent.png`
- `public/assets/logo-transparent.png`
- `public/assets/app-install-icon.png`
- `public/images/wholesaler/brands-section.png`
- `public/images/wholesaler/savings-desktop-reference.png`
- Contact icon PNGs that are not rendered by the current Contact Us page
- About timeline/reference artwork not rendered by the current About Us route

## JavaScript And Loading

- Non-home routes are now lazy-loaded with `React.lazy` and `Suspense`.
- Homepage stays eager for header, hero, category strip, product rows, footer, and promo behavior.
- Vite now emits page chunks for checkout, account, footer-linked pages, legal pages, search, product, cart, category, login, and signup.
- Main public JS entry dropped from 466.50 KB raw to 101.47 KB raw.

## Validation

- `cmd /c npx tsc --noEmit`: passed.
- `cmd /c npm run build`: passed.
- Static built-reference check: 35 local media references, 0 missing.
- FFmpeg video decode check for optimized hero MP4: passed.
- FFmpeg image decode checks for representative optimized WebPs: passed.
- `cmd /c git diff --check -- ...`: passed; only CRLF normalization warnings were printed.
- `cmd /c npm run lint --if-present`: no lint script configured.
- `cmd /c npm test --if-present`: no test script configured.

## Live Deployment

- Current corrected hosting target: Hostinger File Manager.
- This session has no Hostinger/File Manager credentials or deploy connector, so live upload could not be completed directly.
- The Hostinger-ready production output is the refreshed `dist/` folder from the pushed source build.
- GitHub Pages deployment remains automated by `.github/workflows/deploy-pages.yml` on push to `main`, but that is not the Hostinger File Manager deployment.

## Remaining Weight Targets

- Product mockup folders are now the dominant production weight.
- Largest remaining candidates are PNG product pack images in `dairy-bread-mockups`, `drinks-beverage-mockups`, and `snacks-munchies-mockups`.
- A future pass should optimize product pack images carefully because they are generated through category data and used across homepage rails, category grids, product detail, cart, search, and favorites.
