export function resolveMediaUrl(path: string) {
  const trimmedPath = path.trim();

  if (/^(?:https?:)?\/\//i.test(trimmedPath) || /^(?:data|blob):/i.test(trimmedPath)) {
    return trimmedPath;
  }

  const basePath = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${basePath}${trimmedPath.replace(/^\.\//, "").replace(/^\//, "")}`;
}
