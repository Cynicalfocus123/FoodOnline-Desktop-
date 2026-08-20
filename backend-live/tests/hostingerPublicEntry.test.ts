import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const entry = readFileSync("deployment/hostinger/backend-public/index.php", "utf8");
const template = readFileSync("deployment/hostinger/backend-public/backend-path.php.example", "utf8");
const syncScript = readFileSync("scripts/sync-backend-live.mjs", "utf8");
const frontendRewrite = readFileSync("public/.htaccess", "utf8");
const releaseScript = readFileSync("scripts/create-live-hostinger-zips.ps1", "utf8");
const standardBuilder = readFileSync("scripts/create-standard-hostinger-zip.php", "utf8");
const standardVerifier = readFileSync("scripts/verify-standard-hostinger-zip.py", "utf8");

test("Hostinger public API entry resolves a separate private Laravel root safely", () => {
  assert.match(entry, /backend-path\.php/);
  assert.match(entry, /FOODONLINES_BACKEND_PATH/);
  assert.match(entry, /glob\(\$parent\.'.*\/bootstrap\/app\.php'\)/);
  assert.match(entry, /vendor\/autoload\.php/);
  assert.match(entry, /Service configuration is incomplete/);
  assert.doesNotMatch(entry, /echo \$backendBasePath/);
});

test("Hostinger path template is shipped with the generated backend mirror", () => {
  assert.match(template, /return '\/home\/ACCOUNT_USERNAME\/FoodOnlines-backend';/);
  assert.match(syncScript, /backend-path\.php\.example/);
});

test("frontend Hostinger rewrite preserves the API and avoids restricted Options directives", () => {
  assert.match(frontendRewrite, /RewriteRule \^api\(\?:\/\|\$\) - \[L\]/);
  assert.match(frontendRewrite, /RewriteRule \^admin\(\?:\/\.\*\)\?\$ admin\.html \[L\]/);
  assert.match(frontendRewrite, /RewriteRule \. index\.html \[L\]/);
  assert.doesNotMatch(frontendRewrite, /^\s*Options\s/m);
});

test("paired Live release uses the verified standard ZIP32 Hostinger path", () => {
  assert.match(releaseScript, /FoodOnlines_Frontend_Live\.zip/);
  assert.match(releaseScript, /FoodOnlines_Backend_Live\.zip/);
  assert.match(releaseScript, /Expand-Archive/);
  assert.match(releaseScript, /extract-standard-hostinger-zip\.php/);
  assert.match(releaseScript, /Remove-ObsoleteReleaseArchives/);
  assert.match(releaseScript, /Assert-LiveRepairContent/);
  assert.match(releaseScript, /RegisterUserController\.php/);
  assert.match(releaseScript, /AdminUsersController\.php/);
  assert.match(releaseScript, /Registration could not be completed\./);
  assert.match(releaseScript, /No saved addresses for this customer\./);
  assert.match(releaseScript, /AddressBookController\.php/);
  assert.match(releaseScript, /AdminUserAddressResource\.php/);
  assert.match(releaseScript, /hasMany\(UserAddress::class\)/);
  assert.match(releaseScript, /managed-user-editor/);
  assert.match(releaseScript, /data-address-id/);
  assert.match(standardBuilder, /ZipArchive::CM_DEFLATE/);
  assert.match(standardBuilder, /setCompressionName/);
  assert.match(standardVerifier, /zip64/);
  assert.match(standardVerifier, /explicitDirectories/);
});
