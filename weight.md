# FoodOnlines Production Weight

Last reviewed: 2026-07-23. This is the single root-level record for current production-weight evidence and its maintenance rules.

## Current verified baseline

The active shared Customer/Supplier/Partner referral repair was rebuilt from authoritative source on 2026-07-23. It adds the additive existing-installation schema upgrade, private readiness diagnostic, responsive Admin filters, and a latest-fix archive gate. Archive measurements and hashes are recorded in the paired release handoff because they are rebuild-sensitive:

| Item | Verified result |
| --- | --- |
| Production build | 143 transformed modules |
| Production audit | 28 routes; 1,016 files / 90,368,849 bytes; zero missing local references or placeholder links |
| `dist/` | 1,016 files / 90,368,849 bytes |
| `frontend-upload/` | 1,016 files; exact SHA-256 parity with `dist/` |
| `backend-live/` | 358 source files plus `SHA256SUMS`, including staff authorization tests; manifest/safety clean |
| Live archives | Generated only after the candidate commit is pushed and remote equality is proven; exact counts, sizes, and hashes belong in the release handoff |

The final `FoodOnlines_Frontend_Live.zip` and `FoodOnlines_Backend_Live.zip` must use standard Deflate ZIP32 entries at archive root and pass CRC/listing, Windows extraction parity, PHP extraction parity, address and referral repair-content checks inside both extractions, path/metadata safety, forbidden-content checks, and backend-manifest verification. No external Hostinger deployment was performed or verified.

## Weight rules

- Build from authoritative source; never package from old archives, extraction folders, or stale deployment mirrors.
- Avoid duplicate raster media, unused videos, duplicate bundles, source maps, runtime uploads, private environment files, and backend payload in the frontend archive.
- Keep runtime media purposeful. Use the existing image-fit and lazy-loading conventions before adding variants or new heavy assets.
- Treat `frontend-upload/` as a byte-for-byte mirror of `dist/`; generate `backend-live/` only with the official synchronization script and retain a complete, valid `SHA256SUMS` manifest.
- Regenerate and verify both Live archives after every completed change. The release directory must contain only the two canonical Live ZIPs once verification finishes.

## Required verification

Run the relevant tests, TypeScript check, production build, and production audit; then verify frontend mirror parity, backend manifest/safety, and full archive extraction parity. Update the table above with exact, command-derived measurements only after a successful paired release. Report each release command’s exact archive hashes with its release handoff rather than treating a rebuild-sensitive hash as a permanent documentation value. See `AGENT.md` for the mandatory sequence and deployment safety limits.
