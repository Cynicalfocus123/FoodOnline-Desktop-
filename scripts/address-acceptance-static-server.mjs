import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.env.ACCEPTANCE_STATIC_ROOT || "");
const port = Number(process.env.ACCEPTANCE_STATIC_PORT || 0);
if (!root || !existsSync(root) || !statSync(root).isDirectory()) {
  throw new Error("ACCEPTANCE_STATIC_ROOT must be a built frontend directory.");
}
if (!Number.isInteger(port) || port < 1) throw new Error("ACCEPTANCE_STATIC_PORT is required.");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://127.0.0.1").pathname);
  const requested = /^\/admin(?:\/|$)/.test(pathname)
    ? "admin.html"
    : pathname === "/" || /^\/(?:invite|account)(?:\/|$)/.test(pathname)
      ? "index.html"
      : pathname.replace(/^\/+/, "");
  const candidate = normalize(join(root, requested));
  if (!candidate.startsWith(root + sep) || !existsSync(candidate) || !statSync(candidate).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": contentTypes[extname(candidate)] || "application/octet-stream",
  });
  createReadStream(candidate).pipe(response);
}).listen(port, "127.0.0.1");
