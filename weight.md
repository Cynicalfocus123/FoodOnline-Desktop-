# FoodOnlines Site Weight

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

- Git result: recorded after commit/push below in the final task handoff.
- Hostinger result: blocked. This session has no Hostinger File Manager credentials or deployment connector, so no live upload can be evidenced.
- Git/live synchronization: not confirmed. A generated `dist` folder is deployment-ready but is not equivalent to a live Hostinger upload.
