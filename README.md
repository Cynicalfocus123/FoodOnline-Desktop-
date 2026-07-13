# FoodOnline-Desktop-

## Current repository delivery state

The Laravel foundation and category-management backend are on `main`. The repository backend deployment mirror is `backend-live/` and must be regenerated with `node scripts/sync-backend-live.mjs` for every backend change. Every completed task reviews and updates all tracked Markdown documentation; external Hostinger deployment is never implied by the repository mirror.

Backend changes use one combined pass: edit Laravel source, validate, generate `backend-live/`, verify parity, commit source/docs/mirror together, and push `main`. Do not hand-edit the generated mirror or create a backend ZIP.

FoodOnlines desktop homepage built with React, TypeScript, Zustand, and Tailwind CSS.

```
