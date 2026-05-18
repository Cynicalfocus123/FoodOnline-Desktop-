# FoodOnlines Designer Notes

- Companion file for `design.md` because workflow now references `DESIGNER.md` for UI/admin updates.
- Current visual system stays green/orange FoodOnlines brand with white public commerce surfaces and dark admin console shell.
- Admin phase 1 mockup includes separate login screen, dark sidebar dashboard, `Users` role tabs for Customers/Suppliers/Partners, and admin settings panel for credential rotation.
- Header and footer both expose `Test Admin Dashboard` wording so mock admin/testing path is obvious to repo demo users.
- Table design shows all frontend signup fields plus request-management metadata so later Laravel + MySQL backend can map one-to-one into real migrations and admin screens.
- Security presentation should stay visible in admin design: generic login errors, safe text rendering, archive-not-delete actions, and Laravel handoff notes for CSRF, rate limiting, hashing, and audit logs.
- Future UI/admin changes should update both `design.md` and this file together.
