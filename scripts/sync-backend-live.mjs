import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "backend-live");
const manifestName = "SHA256SUMS";
const rootFiles = ["artisan", "composer.json", "composer.lock"];
const sourceDirectories = ["app", "config", "database", "routes", "resources"];
const publicSource = path.join(root, "deployment", "hostinger", "backend-public");
const publicFiles = [".htaccess", "index.php.example"];

const normalize = (value) => value.split(path.sep).join("/");
const insideRoot = (candidate) => candidate === root || candidate.startsWith(`${root}${path.sep}`);

if (!insideRoot(output) || path.basename(output) !== "backend-live") {
  throw new Error(`Refusing to synchronize unexpected output path: ${output}`);
}

async function filesUnder(directory) {
  const absolute = path.join(root, directory);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

const bootstrapFiles = (await filesUnder("bootstrap")).filter((file) => file === path.join("bootstrap", "app.php") || file === path.join("bootstrap", "providers.php") || file.endsWith(`${path.sep}.gitignore`));
const storageFiles = (await filesUnder("storage")).filter((file) => file.endsWith(`${path.sep}.gitignore`) || path.basename(file) === ".gitignore");
const desiredSources = [
  ...rootFiles,
  ...bootstrapFiles,
  ...storageFiles,
  ...(await Promise.all(sourceDirectories.map(filesUnder))).flat(),
].sort((a, b) => normalize(a).localeCompare(normalize(b)));

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const relative of desiredSources) {
  const destination = path.join(output, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(root, relative), destination);
}

for (const file of publicFiles) {
  const source = path.join(publicSource, file);
  const destination = path.join(output, "public", file);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination);
}

async function outputFiles() {
  const walk = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    const result = [];
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) result.push(...await walk(absolute));
      else if (entry.isFile()) result.push(path.relative(output, absolute));
    }
    return result;
  };
  return walk(output);
}

const expected = [...desiredSources, ...publicFiles.map((file) => path.join("public", file))]
  .map(normalize)
  .sort((a, b) => a.localeCompare(b));
const manifestLines = [];
for (const relative of expected) {
  const content = await readFile(path.join(output, relative));
  const hash = createHash("sha256").update(content).digest("hex");
  manifestLines.push(`${hash}  ${relative}`);
}
await writeFile(path.join(output, manifestName), `${manifestLines.join("\n")}\n`, "utf8");

const actual = (await outputFiles()).map(normalize).sort((a, b) => a.localeCompare(b));
const expectedWithManifest = [...expected, manifestName].sort((a, b) => a.localeCompare(b));
const missing = expectedWithManifest.filter((file) => !actual.includes(file));
const stale = actual.filter((file) => !expectedWithManifest.includes(file));
let mismatches = 0;
for (const line of manifestLines) {
  const [hash, relative] = line.split("  ");
  const actualHash = createHash("sha256").update(await readFile(path.join(output, relative))).digest("hex");
  if (actualHash !== hash) mismatches += 1;
}

const forbiddenNames = actual.filter((file) => {
  const lower = file.toLowerCase();
  return lower === ".env" || lower.includes("/.env") || lower.endsWith(".zip") || lower.includes("vendor/")
    || lower.includes("tests/") || lower.includes("node_modules/") || lower.startsWith("src/")
    || lower === "package.json" || lower === "package-lock.json" || lower.includes("frontend-upload")
    || lower.endsWith(".sqlite") || lower.endsWith(".db") || lower.endsWith(".log")
    || /(^|\/)(sessions|cache|logs)(\/|$)/.test(lower) && !lower.endsWith("/.gitignore");
});
let secretFiles = 0;
for (const relative of actual.filter((file) => file !== manifestName)) {
  const info = await stat(path.join(output, relative));
  if (info.size > 2_000_000) continue;
  const content = await readFile(path.join(output, relative), "utf8");
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}/.test(content)) secretFiles += 1;
}
const frontendFiles = forbiddenNames.filter((file) => file.startsWith("src/") || file.includes("frontend") || file === "package.json" || file === "package-lock.json");
const zipFiles = actual.filter((file) => file.toLowerCase().endsWith(".zip"));
if (missing.length || stale.length || mismatches || secretFiles || forbiddenNames.length || frontendFiles.length || zipFiles.length) {
  throw new Error(JSON.stringify({ missing, stale, mismatches, secretFiles, forbiddenNames, frontendFiles, zipFiles }, null, 2));
}

console.log(`backend-live synchronized: ${expected.length} source files + 1 manifest`);
console.log("0 missing files; 0 stale extra files; 0 checksum mismatches");
console.log("0 secrets; 0 frontend files; 0 ZIP files");
