# FoodOnlines Site Weight

Generated on 2026-07-12 from the current workspace at commit `975b81a` (`Restore product detail return navigation`, committed 2026-06-13).

## Measurement Scope

- Read source notes: `AGENT.md` and `design.md`.
- Latest documented site change: Product Detail `Back to products` return navigation from 2026-06-13.
- Recent documented page work also included Footer FAQ, footer legal pages, footer contact cleanup, Wholesaler, Contact Us, Affiliate, Become Partner, Become Vendor, Sponsor, Driver, About Us, account/settings, checkout, login/signup, and product/category/search behavior.
- Production bundle was refreshed with `npm run build`.
- No local server, preview server, or browser session was started.

## Current Production Build Weight

| Area | Files | Size |
| --- | ---: | ---: |
| `dist` total | 1,049 | 323.02 MB |
| `dist/assets` | - | 206.97 MB |
| `dist/images` | - | 116.04 MB |
| `dist/index.html` | 1 | 0.72 KB |
| `dist/admin.html` | 1 | 0.68 KB |

Vite reported these primary app assets:

| File | Raw | Gzip |
| --- | ---: | ---: |
| `dist/assets/main-CIi795Pr.js` | 466.50 KB | 115.04 KB |
| `dist/assets/styles-BWJKngoE.js` | 201.30 KB | 64.00 KB |
| `dist/assets/admin-CX12gb8F.js` | 26.55 KB | 6.70 KB |
| `dist/assets/styles-C-Ll7M8o.css` | 174.52 KB | 30.23 KB |
| `dist/assets/shop  and order banner-CFkICX1r.png` | 2.43 MB | not compressed by Vite |

## Source Tree Weight

| Path | Files | Size |
| --- | ---: | ---: |
| `public` | 1,042 | 319.87 MB |
| `src` | 53 | 799.42 KB |
| `app` | 38 | 56.56 KB |
| `database` | 11 | 14.25 KB |
| `resources` | 1 | 8.78 KB |
| `config` | 12 | 6.96 KB |
| `routes` | 3 | 5.36 KB |

Tracked top-level source weight, excluding generated upload bundles:

| Path | Files | Size |
| --- | ---: | ---: |
| `public` | 1,042 | 319.87 MB |
| `site video and content` | 4 | 40.28 MB |
| `src` | 53 | 799.42 KB |
| `AGENT.md` | 1 | 185.11 KB |
| `design.md` | 1 | 146.05 KB |
| `package-lock.json` | 1 | 91.06 KB |
| `app` | 38 | 56.56 KB |

## Source Code Weight By Type

| Extension | Files | Size |
| --- | ---: | ---: |
| `.tsx` | 39 | 608.54 KB |
| `.ts` | 13 | 149.39 KB |
| `.css` | 1 | 41.49 KB |

Largest source files:

| File | Size |
| --- | ---: |
| `src/components/CheckoutPage.tsx` | 75.94 KB |
| `src/components/AccountPage.tsx` | 68.36 KB |
| `src/data/home.ts` | 50.32 KB |
| `src/styles.css` | 41.49 KB |
| `src/components/CartPage.tsx` | 39.32 KB |
| `src/components/ProductDetailPage.tsx` | 38.94 KB |
| `src/store/homeStore.ts` | 34.92 KB |
| `src/components/AffiliateHeroSection.tsx` | 34.19 KB |
| `src/components/Header.tsx` | 34.04 KB |
| `src/components/CategoryListingPage.tsx` | 28.60 KB |

## Heaviest Public Assets

| Asset | Size |
| --- | ---: |
| `public/assets/food-horizontal.mp4` | 36.66 MB |
| `public/images/wholesaler/brands-section.png` | 9.32 MB |
| `public/images/wholesaler/brands-retail.png` | 9.32 MB |
| `public/images/wholesaler/brands-restaurant.png` | 7.78 MB |
| `public/images/wholesaler/brands-hospitality.png` | 7.38 MB |
| `public/images/wholesaler/brands-corporate.png` | 5.38 MB |
| `public/assets/blue-apron-any-night.mp4` | 4.35 MB |
| `public/images/contact-us/contact-hero-groceries.png` | 3.77 MB |
| `public/images/about/leadership/ahmet-yilmaz.png` | 3.72 MB |
| `public/images/wholesaler/savings-bibigo-bag.png` | 2.93 MB |

## Current Worktree Note

The active tracked application source files are clean against `HEAD`. `git status --short` currently shows unrelated workspace noise:

- 956 deleted files, mostly old generated upload bundles such as `frontend-upload` and `FRONTEND-ADMIN-UPLOAD`.
- 20 untracked files/folders, including `.serena`, `pages`, and additional `site video and content` media.

Those dirty-state items are not included as current active site source weight unless they are later restored, tracked, or intentionally promoted into the build.

## Weight Read

The site is asset-heavy, not code-heavy. The production output is about 323 MB, while TypeScript/React/CSS source is under 1 MB. Most weight comes from public media copied into `dist`, especially videos and large PNG page artwork. The first optimization targets should be the 36.66 MB hero video and the 5-9 MB Wholesaler PNG assets.
