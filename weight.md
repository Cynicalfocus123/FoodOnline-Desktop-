# FoodOnlines Site Weight

## Backend Product Catalog Complexity and Live-Mirror Parity — Phase 3 (2026-07-13)

- Added 4 migrations/tables (`brands`, `products`, `product_variants`, `product_media`), 4 models, 4 factories, 3 transactional services, 5 controllers, focused form requests/resources, 24 protected admin routes, and 3 public catalog routes. No production product or brand seeder was added.
- Added 7 focused product/brand test files. Final validation is **42 tests / 272 assertions**. The deployable runtime/public-entry payload is **154 files**; generated `backend-live/` is **154 payload files plus `SHA256SUMS` (155 total)**.
- The mirror generator now includes `.env.example`, `DEPLOYMENT.md`, a real relative-path `public/index.php`, API `.htaccess`, and required empty storage/cache placeholders. It excludes tests, frontend code/media, secrets, databases, runtime data, dependencies, and archives.
- Final mirror verification: **0 missing files, 0 stale extras, 0 checksum mismatches, 0 secret files, 0 frontend files, and 0 ZIP files**. External Hostinger backend remains not updated; frontend production weight is unchanged.

## Permanent Completion Accounting (2026-07-13)

- Every task updates all tracked Markdown records, including this file, and records validation plus source/deployment-mirror parity where applicable.
- Backend completion requires matching source and `backend-live/` on pushed `main`; feature-branch-only work is incomplete. Historical readiness scores below describe their dated phases, not the current state.
- Backend accounting treats implementation, validation, generated-mirror synchronization, combined commit, and `main` push as one pass. Record zero missing/stale/checksum findings; never record a manual mirror edit, deferred live-folder phase, or backend ZIP.

## Backend Category Complexity and Live-Mirror Parity — Step 2 (2026-07-13)

- Added 2 migrations, 2 models, 1 factory, 1 idempotent seeder, category validation/rules, 3 catalog resources, 2 admin resources, 3 controllers, 3 catalog routes, 11 protected admin routes, and 4 category test files plus a shared test helper.
- Local seed contract: 16 root categories and 1 active legacy alias. Hierarchy metadata adds bounded traversal and a four-level maximum; versioned file-cache keys provide conservative public tree/lookup caching and whole-category invalidation after every write.
- Eligible backend runtime/public-entry payload: 101 files. Generated `backend-live/`: 101 matching payload files plus `SHA256SUMS` (102 total). Verification: 0 missing, 0 stale extras, 0 checksum mismatches, 0 secrets, 0 frontend files, and 0 ZIP files. Runtime cache/session/log directories are deliberately absent; deployment creates writable runtime directories outside the committed mirror.
- Technical debt: the current user table has only the verified `admin` role rather than the future `super_admin`/`catalog_manager`/read-only permission matrix; R2 media resolution, products, attributes, production MySQL execution, and external Hostinger deployment remain future or externally gated work.
- Validation passed: 14 category tests with 98 assertions, 25 full-suite tests with 158 assertions, migration apply/rollback/reapply, config cache, route cache, Composer validation/audit, PHP syntax, and mirror parity. Source and the 102-file `backend-live/` tree were introduced together by `396b2ae` and remain current on `main`; Step 3 is code-ready. No frontend production weight changed.

## Backend Foundation Complexity — Step 1 (2026-07-13)

- Backend root: repository root; one Laravel installation, no nested duplicate.
- Locked runtime: Laravel 12.63.0 on PHP `^8.2`; validated locally with PHP 8.3.32 and Composer 2.10.2.
- Foundation weight: 80 application/config/route/migration/test/deployment-entry PHP files (3,640 lines), 27 versioned API routes, 11 migrations, 11 tests, and 60 passing assertions. No new binary or frontend production media was added.
- Technical debt reduced: missing HTTP entry point, missing test harness, missing dependency lock, absent health route, anonymous numeric throttles, unlimited token lifetime for new sessions, incomplete queue schema, permissive CORS origin sourcing, and sensitive email/error detail in mail-failure logs.
- Remaining debt: the live Hostinger backend and MySQL migration state could not be inspected; two legacy schema-compatibility migrations intentionally have non-destructive no-op rollback paths; production queue processing remains disabled until a supervised worker exists; no standalone public profile-update contract currently exists; and the API hostname did not resolve from this session.
- Step 2 readiness: **85/100 (code-ready, deployment-gated)**. Required final 15 points are production PHP/Composer verification, MySQL migration/status confirmation, DNS/TLS reachability, live CORS/auth/admin/health smoke tests, and proof that the Git commit is deployed. Catalog work must not begin before those gates pass.

## Production Deployment Audit Result (2026-07-12)

- Final `dist`: 91,637,157 bytes (87.39 MB) across 1,032 files.
- JavaScript: 26 files, including the public entry, standalone admin entry, shared runtime, and all audited lazy route chunks.
- Driver runtime media: 14 files in `dist/images/drivers`; Wholesaler runtime media: 10 files in `dist/images/wholesaler`.
- Deployment-only files (`.htaccess`, `404.html`, Hostinger instructions, and stale-asset guidance) now live inside the same audited production tree, so `dist`, `frontend-upload`, and the extracted ZIP can be byte-for-byte compared.
- Final ZIP: 90,900,400 bytes (86.69 MB), 1,032 readable files, zero SHA-256 mismatches after extraction, and zero backslash entry names.
- The routing repair added no new raster or video media and did not change approved media quality. The small size delta comes from error recovery, clean-route support, information-route code, validation metadata, and deployment files.

Generated on 2026-07-12 after the product-media production optimization pass. Measurements use binary MB (`1 MB = 1,048,576 bytes`).

## Production Result

| Area | Before | After | Saved |
| --- | ---: | ---: | ---: |
| `dist` total | 175.86 MB | 87.39 MB | 88.47 MB (50.3%) |
| Production image/static media | 168.22 MB | 79.74 MB | 88.48 MB (52.6%) |
| Product mockup folders | 157.05 MB | 71.97 MB | 85.08 MB (54.2%) |
| Production local video | 6.80 MB | 6.80 MB | 0 MB |
| Main public JavaScript entry | 101.47 KB | 101.74 KB | -0.27 KB |

Final `dist`: 91,630,414 bytes across 1,028 files. The under-120-MB target and under-100-MB stretch target were both reached without resizing product images.

## Product Folder Audit

All catalog-generated mockup folders were audited from `src/data/home.ts`, listing overrides, product cards, product detail galleries, search, cart, favorites, related products, and checkout use. Runtime counts reflect the distinct local files copied to production; dairy uses 49 local overrides and generated gallery fallbacks for remaining listing slots.

| Folder | Runtime files | Before | After |
| --- | ---: | ---: | ---: |
| dairy-bread-mockups | 49 | 31.08 MB | 3.66 MB |
| drinks-beverage-mockups | 60 | 25.35 MB | 4.24 MB |
| snacks-munchies-mockups | 60 | 20.23 MB | 2.27 MB |
| breakfast-instant-food-mockups | 60 | 13.06 MB | 3.09 MB |
| sweet-tooth-mockups | 60 | 11.39 MB | 3.10 MB |
| atta-rice-dal-mockups | 60 | 6.95 MB | 6.95 MB |
| frozen-mockups | 60 | 6.60 MB | 6.60 MB |
| chicken-meat-fish-mockups | 60 | 6.38 MB | 6.38 MB |
| vegan-foods-mockups | 60 | 5.96 MB | 5.96 MB |
| organic-healthy-living-mockups | 60 | 5.68 MB | 5.68 MB |
| bakery-biscuits-mockups | 60 | 5.56 MB | 5.56 MB |
| fruits-vegetables-mockups | 60 | 5.26 MB | 4.95 MB |
| masala-oil-more-mockups | 60 | 4.61 MB | 4.61 MB |
| sauces-spreads-mockups | 60 | 4.48 MB | 4.48 MB |
| tea-coffee-milk-drinks-mockups | 60 | 4.46 MB | 4.46 MB |

## Conversion Summary

- PNG product sources converted: 202.
- Product WebPs created: 202.
- Additional banner WebPs created: 2.
- AVIFs created: 0; existing compact AVIF catalog files were intentionally retained.
- Responsive variants created: 0. Existing product sources are only 263-870 px and already match card/detail needs; extra variants would add deployment complexity with limited savings.
- Product PNG sources removed from production: 202. Originals remain in `public/` for preservation.
- Other superseded PNGs removed from production: Memorial Day banner and the bundled login/signup banner.
- Exact duplicate files removed: 0. Thirteen existing AVIF duplicate pairs were retained because they occupy intentional category/product slots; remapping cross-category catalog identity was outside this low-risk delivery pass.

## Media Behavior

- `resolveMediaUrl` supports local paths, Vite relative deployment bases, full HTTP(S), protocol-relative, data, and blob URLs.
- Product mockups use explicit `imageFit: "cover"`, preserving the former path-derived crop. Other product imagery defaults to `contain`.
- Product cards use stable aspect-ratio containers, `loading="lazy"`, `decoding="async"`, and explicit dimensions. Detail images keep available source quality and add stable dimensions/async decoding.
- No unnecessary 480/800/1200 copies were generated because the existing source dimensions are already below 900 px.

## Remaining Largest Files

| File | Size |
| --- | ---: |
| `dist/assets/food-horizontal.mp4` | 6.80 MB |
| `dist/assets/food-online-long-text-cutout.png` | 0.85 MB |
| `dist/assets/vegan-foods-mockups/vegan-foods-47.avif` | 0.50 MB |
| bundled login/signup shop banner WebP | 0.38 MB |
| `dist/assets/drinks-beverage-mockups/drinks-beverage-17.avif` | 0.36 MB |

The local hero MP4 is actively rendered by `HeroSlider` and was intentionally unchanged at 6.80 MB. Existing AVIF product images were retained where re-encoding offered no justified quality/risk tradeoff. The 0.85 MB transparent logo cutout remains because it is the approved header branding asset and branding changes are prohibited.

## Validation

- `npx tsc --noEmit`: passed.
- `npm run build`: passed; 84 modules transformed and selective public copying completed.
- New WebP decode validation: 202/202 product files passed FFmpeg decoding.
- Representative alpha checks: all six PNG-bearing folders were fully opaque (`alpha min/max 255`), despite RGBA storage.
- Production mockup PNG check: 0 superseded PNG files remain in `dist`.
- Production catalog files: 889 distinct local mockup files present across all 15 folders.
- Localhost, local IP, Vite preview, and development servers were not used.

## Deployment

- Git result: optimization commit `83defef` was pushed successfully to `origin/main` on 2026-07-12.
- Repository live-deployment result: `frontend-upload/` was rebuilt from the exact optimized `dist/` output, with the required `.htaccess` and Hostinger deployment instructions added at its root.
- Git/deployment synchronization: confirmed for Git source, `dist/`, and the repository's `frontend-upload/` live-deployment mirror. No claim is made that the external Hostinger website itself was uploaded in this task.
