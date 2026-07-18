import assert from "node:assert/strict";
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
