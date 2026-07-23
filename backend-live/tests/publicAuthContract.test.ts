import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parsePublicAuthEnvelope } from "../src/lib/publicAuthContract.ts";
import { safeApiStatusMessage } from "../src/lib/userFacingError.ts";

const publicAuthStore = readFileSync("src/store/publicAuthStore.ts", "utf8");
const homeStore = readFileSync("src/store/homeStore.ts", "utf8");

for (const accountType of ["customer", "supplier", "partner"] as const) {
  test(`${accountType} registration response is accepted as one real public session`, () => {
    const parsed = parsePublicAuthEnvelope(
      {
        token: `server-token-${accountType}`,
        user: {
          id: accountType === "customer" ? 42 : `${accountType}-42`,
          account_type: accountType,
          email: `${accountType}@example.test`,
          status: "active",
        },
      },
      accountType,
    );

    assert.equal(parsed?.token, `server-token-${accountType}`);
    assert.equal(parsed?.user.account_type, accountType);
    assert.equal(parsed?.user.email, `${accountType}@example.test`);
  });
}

test("registration cannot complete without a token, user, canonical ID, or matching account type", () => {
  assert.equal(parsePublicAuthEnvelope({ user: { id: 1, account_type: "customer", email: "a@example.test", status: "active" } }), null);
  assert.equal(parsePublicAuthEnvelope({ token: "token" }), null);
  assert.equal(parsePublicAuthEnvelope({ token: "token", user: { id: "", account_type: "customer", email: "a@example.test", status: "active" } }), null);
  assert.equal(parsePublicAuthEnvelope({ token: "token", user: { id: 1, account_type: "supplier", email: "a@example.test", status: "active" } }, "partner"), null);
  assert.match(homeStore, /if \(!usePublicAuthStore\.getState\(\)\.setAuthenticatedSession/);
  assert.match(homeStore, /throw new ApiError\("Registration could not be completed\.", 502\)/);
});

test("login and registration use the same persisted public-auth session path", () => {
  assert.match(publicAuthStore, /setAuthenticatedSession: \(user, token, expectedAccountType\)/);
  assert.match(publicAuthStore, /parsePublicAuthEnvelope\(\{ user, token \}, expectedAccountType\)/);
  assert.match(publicAuthStore, /get\(\)\.setAuthenticatedSession\(response\.user, response\.token\)/);
  assert.match(homeStore, /setAuthenticatedSession\(response\.user, response\.token, selectedRole\)/);
  assert.doesNotMatch(homeStore, /response\.data\?\.token|response\.data\?\.user/);
});

test("validation and network failures stay distinct and production-safe", () => {
  assert.equal(
    safeApiStatusMessage(422, "The email has already been taken.", { email: ["Email already exists."] }),
    "The email has already been taken.",
  );
  assert.notEqual(
    safeApiStatusMessage(422, null, { email: ["Email already exists."] }),
    "The service is temporarily unavailable. Please try again shortly.",
  );
  assert.equal(
    safeApiStatusMessage(0, null, {}),
    "Unable to connect right now. Please check your connection and try again.",
  );
});
