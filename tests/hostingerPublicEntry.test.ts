import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const entry = readFileSync("deployment/hostinger/backend-public/index.php", "utf8");
const template = readFileSync("deployment/hostinger/backend-public/backend-path.php.example", "utf8");
const syncScript = readFileSync("scripts/sync-backend-live.mjs", "utf8");
const frontendRewrite = readFileSync("public/.htaccess", "utf8");

test("Hostinger public API entry resolves a separate private Laravel root safely", () => {
  assert.match(entry, /backend-path\.php/);
  assert.match(entry, /FOODONLINES_BACKEND_PATH/);
  assert.match(entry, /glob\(\$parent\.'.*\/bootstrap\/app\.php'\)/);
  assert.match(entry, /vendor\/autoload\.php/);
  assert.match(entry, /Service configuration is incomplete/);
  assert.doesNotMatch(entry, /echo \$backendBasePath/);
});

test("Hostinger path template is shipped with the generated backend mirror", () => {
  assert.match(template, /return '\/home\/ACCOUNT_USERNAME\/foodonlines-backend';/);
  assert.match(syncScript, /backend-path\.php\.example/);
});

test("frontend Hostinger rewrite preserves the API and avoids restricted Options directives", () => {
  assert.match(frontendRewrite, /RewriteRule \^api\(\?:\/\|\$\) - \[L\]/);
  assert.match(frontendRewrite, /RewriteRule \^admin\(\?:\/\.\*\)\?\$ admin\.html \[L\]/);
  assert.match(frontendRewrite, /RewriteRule \. index\.html \[L\]/);
  assert.doesNotMatch(frontendRewrite, /^\s*Options\s/m);
});
