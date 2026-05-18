# Agent Notes

- Repo was empty when cloned from `https://github.com/Cynicalfocus123/FoodOnline-Desktop-.git`; scaffolded first React desktop site in place.
- Use caveman full responses unless user says normal mode.
- Keep command output capped. Prefer small `Select-Object -First ...` / `Out-String -Width ...` on PowerShell.
- User wants commit and push after each completed change set without asking.
- Single documentation rule: keep one source of truth only. Use `AGENT.md` for repo + backend/admin implementation notes, and `design.md` for repo + backend/admin design notes.
- Start every session by following this workflow rule: do not run localhost, browser preview, HTTP local server checks, `npm run dev`, `npm start`, `vite preview`, `next dev`, or any long-running server. Only run safe checks such as `npm run build`, `npm run lint`, `npm test`, or `npx tsc --noEmit`; after safe checks pass, commit and push to the current branch.
- Permanent Git rule: never ask user to push, never stop with manual push instructions, always run `git status`, `git add .`, `git commit -m "Clear summary of completed change"`, detect branch with `git branch --show-current`, then push automatically with `git push -u origin CURRENT_BRANCH`. If push fails, inspect real git error, fix normal non-destructive issues automatically, retry push, stop only for real merge conflicts or authentication requirements.
- Stack selected for desktop website: Vite React + TypeScript, Zustand, Tailwind CSS.
- Local assets copied into `public/assets`: FoodOnlines logo and Blue Apron hero video.
- Home page requirements implemented: logo top-left, video-backed main slider, centered splash signup form over Dribbble video, category/deal sections, footer with mission/news/contact.
- `.gitignore` excludes generated folders: `node_modules/`, `dist/`, `.logs/`, `.vite/`.
- `README.md` added with run/build commands for the GitHub repo bootstrap.
- Main hero video now uses `public/assets/food-horizontal.mp4` copied from `site video and content/food (Horizontal).mp4`.
- GitHub Pages deployment workflow added at `.github/workflows/deploy-pages.yml`; demo URL is `https://cynicalfocus123.github.io/FoodOnline-Desktop-/`.
- Hero quick-pick panel, prep stat, and green CTA removed; centered hero email registration form added using existing Zustand signup state.
- Header now uses the transparent logo asset with no text or logo container; standalone splash signup section removed because hero contains signup. Footer now uses three compact link rows.
- Header now uses the long transparent logo asset at larger size, hero eyebrow/body copy is reduced, and footer link groups are tuned for stacked mobile spacing and touch-safe sizing.
- Signup now runs as an in-app multi-step flow: hero CTA -> role selection -> split signup form -> completion state, with structured registration payload ready for backend submission later.
- Signup input handling preserves safe spaces while users type names, contact numbers, and company words, then trims and normalizes cleaned values on final submission.
- Logo source file `food-online-long-text-transparent.png` contains opaque white pixels despite its name. Use generated `public/assets/food-online-long-text-cutout.png` for real transparent header rendering.
- Frontend and admin are now fully separated at entry level: public site stays on `index.html` / `src/main.tsx`, while admin uses standalone `admin.html` / `src/admin-main.tsx`. Do not re-add admin buttons, admin route toggles, or mixed admin state into public site UI.
- Communication rule: after every completed fix + commit + push, always include backend/admin link in final response: `https://cynicalfocus123.github.io/FoodOnline-Desktop-/admin.html`

## Backend/Admin Notes

- Real backend target is Laravel PHP + MySQL only. Do not plan Node/NestJS/PostgreSQL/Mongo/Prisma work unless user explicitly reopens stack choice.
- Phase 1 backend foundation lives as standalone admin page entry inside current repo: `admin.html` + `src/admin-main.tsx`, with simplified mock login screen, protected dashboard shell, `Users` sidebar tab with `Customers`, `Suppliers`, and `Partners`, admin settings credential rotation screen, overview blueprint for Laravel controllers/routes/middleware/migrations/models, and mock signup request management actions.
- Admin mock security rules live in shared frontend helpers: email normalization, strict signup sanitization, generic admin login failures, suspicious password rejection, local salted hash placeholder for rotated admin password, safe React text rendering only, and no `dangerouslySetInnerHTML` / `eval`.
- Public signup submissions flow into admin mock queue through shared schema/state so new registrations appear in admin Users tables without backend network calls.
- Admin is not linked from frontend UI anymore. Access it through direct standalone URL like `/admin.html` so backend/admin stays isolated from public site UX.
- Current admin login is intentionally permissive for mock testing: any non-empty `Admin` value plus any non-empty password opens dashboard UI. This is temporary mock behavior only and must be replaced by real Laravel auth later.
- Current admin signup/user flow is instant approval. New frontend signups should enter admin list already approved, with no manual approve step.
- Admin users table now uses one dropdown action control instead of stacked buttons. Manual actions are reduced to `Move to Review` and `Delete User`.
- Laravel backend TODO for later real phase: implement server-side auth guard, `Hash::make` / `Hash::check`, CSRF-protected session routes, throttle middleware, audit logs, login logs, Eloquent models, migrations, soft deletes, and MySQL indexes for admin and signup request tables.
