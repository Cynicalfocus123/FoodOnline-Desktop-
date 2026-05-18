# Backend Agent Notes

- This file is backend/admin-specific on purpose. Use it for admin dashboard, Laravel, MySQL, auth, security, and backend mockup notes.
- Real backend target is Laravel PHP + MySQL only. Do not plan Node/NestJS/PostgreSQL/Mongo/Prisma work unless user explicitly reopens stack choice.
- Phase 1 backend foundation now lives as standalone admin page entry inside current repo: `admin.html` + `src/admin-main.tsx`, with simplified mock login screen, protected dashboard shell, `Users` sidebar tab with `Customers`, `Suppliers`, and `Partners`, admin settings credential rotation screen, overview blueprint for Laravel controllers/routes/middleware/migrations/models, and mock signup request management actions.
- Admin mock security rules live in shared frontend helpers: email normalization, strict signup sanitization, generic admin login failures, suspicious password rejection, rate-limit placeholder lockout, local salted hash placeholder for rotated admin password, safe React text rendering only, and no `dangerouslySetInnerHTML` / `eval`.
- Public signup submissions flow into admin mock queue through shared schema/state so new registrations appear in admin Users tables without backend network calls.
- Admin is not linked from frontend UI anymore. Access it through direct standalone URL like `/admin.html` so backend/admin stays isolated from public site UX.
- Current admin login is intentionally permissive for mock testing: any non-empty `Admin` value plus any non-empty password opens dashboard UI. This is temporary mock behavior only and must be replaced by real Laravel auth later.
- Laravel backend TODO for later real phase: implement server-side auth guard, `Hash::make` / `Hash::check`, CSRF-protected session routes, throttle middleware, audit logs, login logs, Eloquent models, migrations, soft deletes, and MySQL indexes for admin and signup request tables.
- Backend/admin changes should update this file and `BACKEND-DESIGNER.md` together.
