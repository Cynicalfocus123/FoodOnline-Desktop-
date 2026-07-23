import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const store = readFileSync("src/store/adminStore.ts", "utf8");
const portal = readFileSync("src/components/AdminPortal.tsx", "utf8");

test("admin hydration holds the route while a persisted session is being verified", () => {
  assert.match(store, /hasHydratedSession: false/);
  assert.match(store, /onRehydrateStorage: \(\) => \(state\) => state\?\.markSessionHydrated\(\)/);
  assert.match(portal, /if \(!hasHydratedSession \|\| \(token && isValidatingSession\)\)/);
  assert.match(portal, /<AdminSessionLoadingScreen \/>/);
});

test("only a current admin-token 401 clears the administrator session", () => {
  assert.match(store, /function isAuthoritativeAdminRejection[\s\S]*error\.status === 401/);
  assert.match(store, /if \(get\(\)\.token !== token\) return false;/);
  assert.match(store, /if \(isAuthoritativeAdminRejection\(error\)\)/);
  assert.match(store, /securityMessage: "We could not verify your administrator session right now/);
  assert.match(store, /sessionExpiresAt: response\.expires_at/);
  assert.doesNotMatch(store, /catch \{\s*set\(\{ screen: "login", isAuthenticated: false, token: null \}\)/);
});

test("administrator session reconciliation does not share public-account storage", () => {
  assert.match(store, /name: "foodonline-admin-store"/);
  assert.doesNotMatch(store, /foodonline-public-auth/);
  assert.match(portal, /event\.key === storageKey/);
  assert.match(portal, /useAdminStore\.persist\.rehydrate\(\)/);
});
