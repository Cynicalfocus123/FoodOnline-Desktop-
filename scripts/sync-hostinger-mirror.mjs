import { cpSync, existsSync, rmSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, "dist");
const target = resolve(root, "frontend-upload");

if (!existsSync(source) || basename(target) !== "frontend-upload" || !target.startsWith(resolve(root))) {
  throw new Error("Refusing to synchronize an unexpected deployment path.");
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log(`Synchronized ${join(root, "frontend-upload")} from dist.`);
