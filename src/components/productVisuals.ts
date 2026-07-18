export function productFallbackArtwork(name: string): string {
  const initial = name.trim().charAt(0).toLocaleUpperCase() || "F";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="#f3f4f6"/><circle cx="300" cy="270" r="110" fill="#dfe8d7"/><text x="300" y="310" text-anchor="middle" font-family="Arial,sans-serif" font-size="120" font-weight="700" fill="#46652f">${initial.replace(/[<>&"']/g, "")}</text><text x="300" y="445" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="600" fill="#6b7280">Product image coming soon</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
