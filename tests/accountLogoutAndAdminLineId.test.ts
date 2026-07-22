import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync("src/components/Header.tsx", "utf8");
const authStore = readFileSync("src/store/publicAuthStore.ts", "utf8");
const homeStore = readFileSync("src/store/homeStore.ts", "utf8");
const usersPanel = readFileSync("src/components/admin/EnterpriseUsersAdminPanel.tsx", "utf8");

test("signed-in header menus provide one accessible logout action at every breakpoint", () => {
  assert.match(header, /function LogoutIcon/);
  assert.equal((header.match(/aria-label="Log out of your account"/g) ?? []).length, 2);
  assert.match(header, /disabled=\{isLoggingOut \|\| isAuthLoggingOut\}/);
  assert.match(header, /max-h-\[calc\(100vh-6rem\)\].*overflow-y-auto/);
  assert.match(header, /safe-area-inset-bottom/);
  assert.match(header, /await logoutPublicSession\(\);[\s\S]*openLogin\(\);/);
});

test("logout clears the public session before revocation and invalidates private storefront state", () => {
  assert.match(authStore, /currentUser: null,[\s\S]*token: null,[\s\S]*isLoggingOut: true,[\s\S]*await apiRequest\("\/auth\/logout"/);
  assert.match(homeStore, /clearAuthenticatedData: \(\) => \{[\s\S]*authenticatedSessionVersion \+= 1/);
  assert.match(homeStore, /favoriteRecords: \{\}/);
  assert.match(homeStore, /isActiveAuthenticatedSession\(token, sessionVersion\)/);
});

test("administrator lists show supplied LINE IDs directly under contact numbers", () => {
  assert.match(usersPanel, /<p>\{user\.contactNumber \|\| "—"\}<\/p>\{user\.lineId \? <p/);
  assert.doesNotMatch(usersPanel, /No Line ID/);
  assert.match(usersPanel, /line_id: user\.lineId \|\| undefined/);
});
