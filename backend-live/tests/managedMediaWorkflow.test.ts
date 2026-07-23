import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { mediaCapabilityMessage, mediaUploadTransport, parentSaveAllowed } from "../src/components/admin/managedMediaLogic.ts";

const checking = { phase: "checking", status: null } as const;
const unavailable = { phase: "unavailable", status: null } as const;
const localCapability = { uploads_available: true, strategy: "multipart", accepted_types: ["image/png"], maximum_size_bytes: {} } as const;
const directCapability = { uploads_available: true, strategy: "direct", accepted_types: ["image/png"], maximum_size_bytes: {} } as const;

test("parent CRUD remains enabled while upload capability loads or fails", () => {
  assert.equal(parentSaveAllowed(checking), true);
  assert.equal(parentSaveAllowed(unavailable), true);
  assert.match(mediaCapabilityMessage(checking), /still save/i);
  assert.match(mediaCapabilityMessage(unavailable), /still save/i);
});

test("shared workflow supports multipart and direct upload strategies", () => {
  assert.equal(mediaUploadTransport(localCapability), "multipart");
  assert.equal(mediaUploadTransport(directCapability), "direct");
});

test("administrator capability messages never expose provider internals", () => {
  const visible = [mediaCapabilityMessage(checking), mediaCapabilityMessage(unavailable)].join(" ");
  for (const internal of ["R2", "Cloudflare", "S3", "bucket", "disk", "endpoint", "presigned", "server path"]) {
    assert.equal(visible.toLowerCase().includes(internal.toLowerCase()), false);
  }
});

test("product, brand, and category create flows retain pre-save media until the parent save succeeds", () => {
  const product = readFileSync("src/components/admin/ProductAdminPanel.tsx", "utf8");
  const brand = readFileSync("src/components/admin/BrandAdminPanel.tsx", "utf8");
  const category = readFileSync("src/components/admin/CategoryAdminPanel.tsx", "utf8");

  assert.match(product, /if \(!productUuid\)/);
  assert.match(product, /const saved = await catalogApi\.saveProduct/);
  assert.ok(product.indexOf("const saved = await catalogApi.saveProduct") < product.indexOf("for (const pending of pendingMedia)"));
  assert.match(product, /is_primary: pending\.id === pendingMedia\[0\]\?\.id/);
  assert.match(product, /function movePending/);
  assert.match(brand, /if \(!selected\)/);
  assert.ok(brand.indexOf("const item = await catalogApi.saveBrand") < brand.indexOf("if (pendingLogo)"));
  assert.match(category, /const queued = Object\.entries\(pendingMedia\)/);
  assert.ok(category.indexOf("const result = await catalogApi.saveCategory") < category.indexOf("for (const [purpose, pending] of queued)"));
});
