export function resolveMediaUrl(path: string) {
  const trimmedPath = path.trim();

  if (/^(?:https?:)?\/\//i.test(trimmedPath) || /^(?:data|blob):/i.test(trimmedPath)) {
    return trimmedPath;
  }

  const configuredBase = import.meta.env?.BASE_URL ?? "/";
  const basePath = configuredBase.endsWith("/") ? configuredBase : `${configuredBase}/`;
  return `${basePath}${trimmedPath.replace(/^\.\//, "").replace(/^\//, "")}`;
}
