# FoodOnlines Production Weight

Last reviewed: 2026-07-22. This is the single root-level record for current production-weight evidence and its maintenance rules.

## Current verified baseline

The 2026-07-22 paired-live verification recorded:

| Item | Verified result |
| --- | --- |
| Production build | 140 transformed modules |
| `dist/` | 1,036 files / 91,852,257 bytes |
| `frontend-upload/` | 1,036 files / 91,852,257 bytes; exact SHA-256 parity with `dist/` |
| `backend-live/` | 290 payload files plus `SHA256SUMS`; 291 files / 975,454 bytes |
| Frontend archive | `FoodOnlines_Frontend_Live.zip`: 1,036 files / 90,946,526 bytes |
| Backend archive | `FoodOnlines_Backend_Live.zip`: 291 files / 291,413 bytes |

Both `FoodOnlines_Frontend_Live.zip` and `FoodOnlines_Backend_Live.zip` use standard Deflate ZIP32 entries at archive root and passed CRC/listing, Windows extraction parity, PHP extraction parity, path/metadata safety, forbidden-content checks, and backend-manifest verification. No external Hostinger deployment was performed or verified.

## Weight rules

- Build from authoritative source; never package from old archives, extraction folders, or stale deployment mirrors.
- Avoid duplicate raster media, unused videos, duplicate bundles, source maps, runtime uploads, private environment files, and backend payload in the frontend archive.
- Keep runtime media purposeful. Use the existing image-fit and lazy-loading conventions before adding variants or new heavy assets.
- Treat `frontend-upload/` as a byte-for-byte mirror of `dist/`; generate `backend-live/` only with the official synchronization script and retain a complete, valid `SHA256SUMS` manifest.
- Regenerate and verify both Live archives after every completed change. The release directory must contain only the two canonical Live ZIPs once verification finishes.

## Required verification

Run the relevant tests, TypeScript check, production build, and production audit; then verify frontend mirror parity, backend manifest/safety, and full archive extraction parity. Update the table above with exact, command-derived measurements only after a successful paired release. Report each release command’s exact archive hashes with its release handoff rather than treating a rebuild-sensitive hash as a permanent documentation value. See `AGENT.md` for the mandatory sequence and deployment safety limits.
