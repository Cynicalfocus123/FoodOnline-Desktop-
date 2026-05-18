# Backend Designer Notes

- This file is backend/admin-specific on purpose so admin design notes stay separate from home/public site design notes.
- Admin phase 1 mockup includes standalone one-card login screen with only `Admin` and `Password` fields, dark sidebar dashboard, `Users` role tabs for `Customers`, `Suppliers`, and `Partners`, and admin settings panel for credential rotation.
- Admin UX must stay off the public site. Use dedicated standalone page `admin.html` for backend/admin testing and future secure backend handoff.
- Table design shows all frontend signup fields plus request-management metadata so later Laravel + MySQL backend can map one-to-one into real migrations and admin screens.
- Security presentation should stay visible in admin design: generic login errors, safe text rendering, archive-not-delete actions, and Laravel handoff notes for CSRF, rate limiting, hashing, and audit logs.
- Backend/admin UI changes should update this file and `BACKEND-AGENT.md` together.
