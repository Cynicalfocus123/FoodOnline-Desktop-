# Backend Designer Notes

- This file is backend/admin-specific on purpose so admin design notes stay separate from home/public site design notes.
- Admin phase 1 mockup includes separate login screen, dark sidebar dashboard, `Users` role tabs for `Customers`, `Suppliers`, and `Partners`, and admin settings panel for credential rotation.
- Header and footer both expose `Test Admin Dashboard` wording so mock admin/testing path is obvious to repo demo users.
- Table design shows all frontend signup fields plus request-management metadata so later Laravel + MySQL backend can map one-to-one into real migrations and admin screens.
- Security presentation should stay visible in admin design: generic login errors, safe text rendering, archive-not-delete actions, and Laravel handoff notes for CSRF, rate limiting, hashing, and audit logs.
- Backend/admin UI changes should update this file and `BACKEND-AGENT.md` together.
