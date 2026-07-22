# FoodOnlines Repository Rules

## Priority 1: permanent matched Git, mirror, and Live release pair

Every completed FoodOnlines change must synchronize authoritative source, `dist/`, `frontend-upload/`, `backend-live/`, `backend-live/SHA256SUMS`, the current Git branch/origin, documentation, and exactly two external deployment archives:

- `FoodOnlines_Frontend_Live.zip`
- `FoodOnlines_Backend_Live.zip`

These names are exclusive. Never create or retain a `Clean`, `Hotfix`, timestamped, backup, test, partial, alternate, or third ZIP. After verification, remove every other release-directory ZIP and all temporary staging/extraction folders so the directory contains only the two current Live files.

The pair is inseparable for frontend-only, backend-only, Admin, API, migration, database, content, design, configuration, documentation, security, and mixed changes. Never reuse either previous ZIP or leave one counterpart unchanged.

Required order: finish source and documentation; test and rebuild `dist/`; synchronize and SHA-256-verify `frontend-upload/`; regenerate `backend-live/` with the official script and verify its manifest/safety; commit and push all source/mirror/documentation changes; prove local HEAD equals the remote branch; only then run `npm run release:hostinger-live`. The frontend ZIP is sourced from verified `frontend-upload/`; the backend ZIP is sourced from verified `backend-live/`. Never package from old archives, extractions, stale mirrors/stages, or runtime data.

Both ZIPs use the established PHP `ZipArchive` standard Deflate ZIP32 root-file layout with no wrapper/explicit directories, ZIP64, encryption, secrets, symlinks, unsafe/duplicate/backslash paths, cross-contamination, or runtime media. Completion requires CRC/listing, Windows and PHP extraction with full SHA-256 parity, backend manifest verification, and reporting both paths/counts/sizes/hashes.

`frontend-upload/` and `backend-live/` are repository deployment mirrors prepared for manual Hostinger deployment; they are not the external server. Codex is not connected to Hostinger and must never claim an upload, production migration/cache command, database change, or live smoke test without direct external evidence. Preserve `public_html/api`, `public_html/api/backend-path.php`, live `.env`, `vendor/`, database, storage/media/uploads, permissions, writable directories, logs, sessions, queues, and runtime state during manual deployment.

This rule supersedes all older conflicting archive, packaging, partial-release, frontend-only, backend-only, unchanged-counterpart, and `Clean` ZIP instructions.
