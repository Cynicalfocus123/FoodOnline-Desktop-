# FoodOnlines Laravel Backend Deployment

> Historical host document reviewed 2026-07-18. Current production delivery is Hostinger-only through `backend-live/` and `frontend-upload/`; use the root `DEPLOYMENT.md` and preserve `public_html/api`.

> Phase 7 review (2026-07-15): this remains a historical TMDHosting workflow. Current Phase 7 source and deployment preparation use the root Laravel source plus generated `backend-live/`; external hosting and R2 are not claimed.

> Phase 4 review (2026-07-13): this historical TMDHosting workflow is not the current deployment source for the admin catalog/R2 workflow; use `backend-live/`, root `DEPLOYMENT.md`, and `docs/admin-catalog-and-r2.md`.

> Phase 3 review (2026-07-13): grocery brands/products/variants/media now live in the current Hostinger-oriented `backend-live/` mirror; this historical TMDHosting package is not catalog deployment truth.

> Documentation review (2026-07-13): this TMDHosting workflow is historical. Current backend preparation uses the verified `backend-live/` mirror on `main`; external hosting actions require separate evidence. All tracked Markdown files are reviewed at each task completion.

> Current single-pass rule: backend source, validation, generated `backend-live/`, combined commit, and `main` push happen together; no manual mirror edits, later mirror phase, delegated rebuild, or backend ZIP.

Use this file as source for packaged `foodonlines-backend/DEPLOYMENT.md`.

## Summary

- Backend folder goes outside `public_html`.
- Public entry files now ship in `foodonlines-public-entry/` so ZIP cannot collide with another domain's `public_html`.
- Use `.env.example` only. Never package real `.env`.
- Run Composer and Artisan commands on server after upload.
