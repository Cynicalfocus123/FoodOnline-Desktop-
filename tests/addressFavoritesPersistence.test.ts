import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const account = readFileSync("src/components/AccountPage.tsx", "utf8");
const checkout = readFileSync("src/components/CheckoutPage.tsx", "utf8");
const favorites = readFileSync("src/store/homeStore.ts", "utf8");
const adminUsers = readFileSync("src/components/admin/EnterpriseUsersAdminPanel.tsx", "utf8");

test("authenticated addresses do not fall back to browser-only success", () => {
  assert.doesNotMatch(account, /Address saved locally\.|Address used locally/);
  assert.match(account, /Address saved successfully\./);
  assert.match(account, /We could not save this address\. Please try again\./);
  assert.match(account, /addressRequestVersion/);
});

test("checkout and administrator support all account address countries and fields", () => {
  for (const country of ["usa", "uk", "thailand", "japan", "singapore", "taiwan", "china", "philippines", "malaysia", "indonesia", "hongKong"]) {
    assert.match(checkout, new RegExp(`"${country}"`));
  }
  assert.match(checkout, /await apiRequest<\{/);
  assert.match(adminUsers, /Object\.entries\(address\.address_values\)/);
});

test("favorites retain explicit lifecycle and canonical UUID safeguards", () => {
  assert.match(favorites, /"auth-pending" \| "loading" \| "ready" \| "saving" \| "error"/);
  assert.match(favorites, /isCanonicalProductUuid/);
  assert.match(favorites, /favoriteMergeToken/);
  assert.match(favorites, /favoriteMutationVersions/);
  assert.match(favorites, /"unresolved"/);
});
