import assert from "node:assert/strict";
import test from "node:test";
import {
  safeApiStatusMessage,
  sanitizeApiFieldErrors,
  sanitizeUserFacingMessage,
  toUserFacingErrorMessage,
} from "../src/lib/userFacingError.ts";

test("safe validation messages remain useful", () => {
  assert.equal(sanitizeUserFacingMessage("The email field is required.", "Fallback"), "The email field is required.");
  assert.deepEqual(sanitizeApiFieldErrors({ email: ["The email field is required."] }), {
    email: ["The email field is required."],
  });
});

test("URLs endpoint paths and infrastructure errors are hidden", () => {
  const fallback = "Something went wrong. Please try again.";
  assert.equal(sanitizeUserFacingMessage("Unable to call https://api.foodonlines.com/api/v1/admin/login", fallback), fallback);
  assert.equal(sanitizeUserFacingMessage("401 Unauthorized from /api/v1/admin/me", fallback), fallback);
  assert.equal(sanitizeUserFacingMessage("SQLSTATE connection error", fallback), fallback);
  assert.equal(sanitizeUserFacingMessage("Laravel exception at /home/account/app.php", fallback), fallback);
});

test("raw HTML JSON and stack content are hidden", () => {
  const fallback = "The service is temporarily unavailable. Please try again shortly.";
  assert.equal(sanitizeUserFacingMessage("<html><body>PHP Error</body></html>", fallback), fallback);
  assert.equal(sanitizeUserFacingMessage('{"message":"database failed"}', fallback), fallback);
  assert.equal(sanitizeUserFacingMessage("Exception: failure stack trace", fallback), fallback);
});

test("status messages are safe and predictable", () => {
  assert.equal(safeApiStatusMessage(0, null, {}), "Unable to connect right now. Please check your connection and try again.");
  assert.equal(safeApiStatusMessage(401, "Unauthorized", {}), "Your session has expired. Please sign in again.");
  assert.equal(safeApiStatusMessage(500, "SQLSTATE failure", {}), "The service is temporarily unavailable. Please try again shortly.");
  assert.equal(
    safeApiStatusMessage(422, "The given data was invalid.", { email: ["The email field is required."] }),
    "The given data was invalid.",
  );
});

test("unknown Error messages are sanitized before UI use", () => {
  assert.equal(
    toUserFacingErrorMessage(new Error("Request failed at https://api.foodonlines.com/api/v1"), "Unable to continue."),
    "Unable to continue.",
  );
  assert.equal(toUserFacingErrorMessage(new Error("This item is no longer available."), "Unable to continue."), "This item is no longer available.");
});
