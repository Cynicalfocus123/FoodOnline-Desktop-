import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canAdminPermission, sidebarHasAccess } from "../src/lib/adminAccess.ts";

test("category-only admins receive one enabled sidebar module", () => {
  const permissions = ["categories.view", "categories.manage"];
  assert.equal(sidebarHasAccess("categories", "read_only", permissions), true);
  for (const key of ["overview", "users", "brands", "products", "orders", "reports", "settings", "staff", "operations"] as const) {
    assert.equal(sidebarHasAccess(key, "read_only", permissions), false, key);
  }
  assert.equal(canAdminPermission("products.view", "read_only", permissions), false);
});

test("admin shell keeps denied navigation visible but non-interactive and guards direct routes", () => {
  const portal = readFileSync("src/components/AdminPortal.tsx", "utf8");
  assert.match(portal, /aria-disabled=\{!hasAccess\}/);
  assert.match(portal, /disabled=\{!hasAccess\}/);
  assert.match(portal, /tabIndex=\{hasAccess \? 0 : -1\}/);
  assert.match(portal, /<AdminAccessDenied \/>/);
  assert.match(portal, /sidebarHasAccess\(activeSidebarKey/);
});

test("staff workspace uses dedicated staff endpoints and exposes no secrets", () => {
  const api = readFileSync("src/services/admin/operationsApi.ts", "utf8");
  const panel = readFileSync("src/components/admin/OperationalAdminPanels.tsx", "utf8");
  assert.match(api, /createStaff[\s\S]*\/admin\/staff/);
  assert.match(api, /\/admin\/staff\/\$\{id\}\/password/);
  assert.match(api, /\/admin\/staff\/sessions/);
  assert.match(panel, /Staff & MFA administration/);
  assert.match(panel, /Passwords and security secrets are never displayed/);
  assert.match(panel, /<table/);
});

test("super admin staff management is available inside Admin Settings", () => {
  const portal = readFileSync("src/components/AdminPortal.tsx", "utf8");
  assert.match(portal, /activeSidebarKey === "settings"[\s\S]*isSuperAdminRole\(staffRole\)[\s\S]*StaffAdminPanel/);
});
