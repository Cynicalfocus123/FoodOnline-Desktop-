# FoodOnlines Laravel Backend Deployment

Use this file as source for packaged `foodonlines-backend/DEPLOYMENT.md`.

## Summary

- Backend folder goes outside `public_html`.
- Public entry files now ship in `foodonlines-public-entry/` so ZIP cannot collide with another domain's `public_html`.
- Use `.env.example` only. Never package real `.env`.
- Run Composer and Artisan commands on server after upload.
