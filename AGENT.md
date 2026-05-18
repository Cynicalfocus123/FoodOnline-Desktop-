# Agent Notes

- Repo was empty when cloned from `https://github.com/Cynicalfocus123/FoodOnline-Desktop-.git`; scaffolded first React desktop site in place.
- Use caveman full responses unless user says normal mode.
- Keep command output capped. Prefer small `Select-Object -First ...` / `Out-String -Width ...` on PowerShell.
- User wants commit and push after each completed change set without asking.
- Start every session by following this workflow rule: do not run localhost, browser preview, HTTP local server checks, `npm run dev`, `npm start`, `vite preview`, `next dev`, or any long-running server. Only run safe checks such as `npm run build`, `npm run lint`, `npm test`, or `npx tsc --noEmit`; after safe checks pass, commit and push to the current branch.
- Permanent Git rule: never ask user to push, never stop with manual push instructions, always run `git status`, `git add .`, `git commit -m "Clear summary of completed change"`, detect branch with `git branch --show-current`, then push automatically with `git push -u origin CURRENT_BRANCH`. If push fails, inspect real git error, fix normal non-destructive issues automatically, retry push, stop only for real merge conflicts or authentication requirements.
- Stack selected for desktop website: Vite React + TypeScript, Zustand, Tailwind CSS. Backend/API/PostgreSQL/storage are documented as target architecture, not implemented in this frontend-only scaffold.
- Local assets copied into `public/assets`: FoodOnlines logo and Blue Apron hero video.
- Home page requirements implemented: logo top-left, video-backed main slider, centered splash signup form over Dribbble video, category/deal sections, footer with mission/news/contact.
- `.gitignore` excludes generated folders: `node_modules/`, `dist/`, `.logs/`, `.vite/`.
- `README.md` added with run/build commands for the GitHub repo bootstrap.
- Main hero video now uses `public/assets/food-horizontal.mp4` copied from `site video and content/food (Horizontal).mp4`.
- GitHub Pages deployment workflow added at `.github/workflows/deploy-pages.yml`; demo URL is `https://cynicalfocus123.github.io/FoodOnline-Desktop-/`.
- Hero quick-pick panel, prep stat, and green CTA removed; centered hero email registration form added using existing Zustand signup state.
- Header now uses the transparent logo asset with no text or logo container; standalone splash signup section removed because hero contains signup. Footer now uses three compact link rows.
