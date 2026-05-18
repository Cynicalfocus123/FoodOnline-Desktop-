# Agent Notes

- Repo was empty when cloned from `https://github.com/Cynicalfocus123/FoodOnline-Desktop-.git`; scaffolded first React desktop site in place.
- Use caveman full responses unless user says normal mode.
- Keep command output capped. Prefer small `Select-Object -First ...` / `Out-String -Width ...` on PowerShell.
- User wants commit and push after each completed change set without asking.
- Stack selected for desktop website: Vite React + TypeScript, Zustand, Tailwind CSS. Backend/API/PostgreSQL/storage are documented as target architecture, not implemented in this frontend-only scaffold.
- Local assets copied into `public/assets`: FoodOnlines logo and Blue Apron hero video.
- Home page requirements implemented: logo top-left, video-backed main slider, centered splash signup form over Dribbble video, category/deal sections, footer with mission/news/contact.
- `.gitignore` excludes generated folders: `node_modules/`, `dist/`, `.logs/`, `.vite/`.
- `README.md` added with run/build commands for the GitHub repo bootstrap.
- Main hero video now uses `public/assets/food-horizontal.mp4` copied from `site video and content/food (Horizontal).mp4`.
- GitHub Pages deployment workflow added at `.github/workflows/deploy-pages.yml`; demo URL is `https://cynicalfocus123.github.io/FoodOnline-Desktop-/`.
- Hero quick-pick panel, prep stat, and green CTA removed; centered hero email registration form added using existing Zustand signup state.
