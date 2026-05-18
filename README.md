# FoodOnline-Desktop-

FoodOnlines desktop homepage built with React, TypeScript, Zustand, and Tailwind CSS.

## Demo

[GitHub Pages demo](https://cynicalfocus123.github.io/FoodOnline-Desktop-/)

Standalone admin mockup link:

- Public site: [https://cynicalfocus123.github.io/FoodOnline-Desktop-/](https://cynicalfocus123.github.io/FoodOnline-Desktop-/)
- Admin dashboard: [https://cynicalfocus123.github.io/FoodOnline-Desktop-/admin.html](https://cynicalfocus123.github.io/FoodOnline-Desktop-/admin.html)

Admin dashboard is now fully separate from frontend UI. Public pages do not include admin buttons or admin routing hooks.
Current mock admin login accepts any non-empty `Admin` value and any non-empty password so the dashboard UI can be tested quickly.

Documentation split:

- `AGENT.md` = single implementation notes file
- `design.md` = single design notes file

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
