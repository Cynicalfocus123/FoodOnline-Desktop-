import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { adminPath, readAdminRoute } from "../src/lib/adminRouting.ts";

test("admin CMS routes separate list, create, and edit workspaces", () => {
  assert.deepEqual(readAdminRoute("/admin/categories"), { sidebarKey: "categories", module: "categories", mode: "list", recordId: null });
  assert.deepEqual(readAdminRoute("/admin/categories/create"), { sidebarKey: "categories", module: "categories", mode: "create", recordId: null });
  assert.deepEqual(readAdminRoute("/admin/products/product-uuid/edit"), { sidebarKey: "products", module: "products", mode: "edit", recordId: "product-uuid" });
  assert.deepEqual(readAdminRoute("/admin/customers/42/edit"), { sidebarKey: "users", module: "customers", mode: "edit", recordId: "42" });
  assert.equal(adminPath("brands"), "/admin/brands");
});
test("production rewrite serves every nested admin route from admin.html", () => {
  const rules = readFileSync("public/.htaccess", "utf8");
  assert.match(rules, /RewriteRule \^admin\(\?:\/\.\*\)\?\$ admin\.html \[L\]/);
});
