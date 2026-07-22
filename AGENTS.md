# FoodOnlines Repository Rules

## Priority 1: always produce both clean Hostinger ZIPs

Every completed production-delivery task must generate **both** current deployment archives as one inseparable release pair:

- `FoodOnlines_Frontend_Hostinger_Clean.zip`
- `FoodOnlines_Backend_Hostinger_Clean.zip`

The external release directory must contain **only** these two current ZIP files—no staging folders or other visible release artifacts. On every successful packaging run, delete every other root-level `.zip` and remove both temporary clean staging folders from that dedicated release directory so obsolete, alternate, timestamped, legacy, or intermediate items cannot be mistaken for the current release. The two canonical filenames are replaced by the newly generated pair; never retain older ZIP copies alongside them.

This applies to frontend-only, backend-only, migration, configuration, content, and mixed releases. Never leave one archive unchanged, never publish only one archive, and never treat ZIP generation as optional. The only exception is a direct instruction from the user in the current task not to create one or both archives.

Build from current authoritative source only: run the frontend validation/production build and synchronize `frontend-upload/` from `dist/`; synchronize `backend-live/` from Laravel source and verify `SHA256SUMS`; then run `npm run release:hostinger-clean`, which recreates both clean staging folders outside Git before writing either archive. Never package an old ZIP, an extracted release, a stale staging folder, or live runtime data.

Both ZIPs must use the established Hostinger-safe format: payload files at archive root, standard Deflate ZIP32, no wrapper or explicit directory entries, and no ZIP64, encryption, secrets, symlinks, unsafe/duplicate/backslash paths, frontend/backend cross-contamination, or runtime media. Completion requires CRC/listing validation, Windows and PHP extraction with full SHA-256 parity, backend manifest verification, and reporting both final paths, file counts, sizes, and SHA-256 hashes.

This priority rule supersedes every older repository note that says “no ZIP,” allows a single archive, keeps the other archive unchanged, or makes archive creation conditional.
