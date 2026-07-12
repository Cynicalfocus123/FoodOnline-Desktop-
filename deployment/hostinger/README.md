# Hostinger File Manager Deployment

FoodOnlines live frontend hosting is currently managed through Hostinger File Manager.

## Production Output

Run the normal project build:

```bash
npm run build
```

The upload-ready frontend output is the contents of `dist/`.

## Upload Target

Use the active Hostinger domain document root for FoodOnlines. Upload the contents of `dist/` into that document root, preserving folder structure:

- `index.html`
- `admin.html`
- `favicon.svg`
- `404.html`
- `assets/`
- `images/`

Do not upload the `dist/` folder itself as a nested folder unless the Hostinger domain is intentionally configured to serve from that nested path.

## Notes

- Do not use old TMDHosting/cPanel package paths for the current live site unless the user explicitly changes hosting again.
- Do not create a ZIP unless the user asks for a File Manager archive package.
- Preserve the existing API configuration and route behavior.
- After upload, verify the live site uses the new generated asset filenames from the current `dist/index.html` and `dist/admin.html`.
