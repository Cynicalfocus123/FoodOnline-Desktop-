# FoodOnlines Laravel Backend Deployment

> Documentation review (2026-07-13): this TMDHosting workflow is historical. Current backend preparation uses the verified `backend-live/` mirror on `main`; external hosting actions require separate evidence. All tracked Markdown files are reviewed at each task completion.

Use this file as source for packaged `foodonlines-backend/DEPLOYMENT.md`.

## Summary

- Backend folder goes outside `public_html`.
- Public entry files now ship in `foodonlines-public-entry/` so ZIP cannot collide with another domain's `public_html`.
- Use `.env.example` only. Never package real `.env`.
- Run Composer and Artisan commands on server after upload.
