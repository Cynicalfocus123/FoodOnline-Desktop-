import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { initialSignupFormValues, optionalRegistrationValue } from "../src/lib/registerSchema.ts";

test("customer, supplier, and partner signup validation keeps company name and LINE ID optional", () => {
  assert.equal(initialSignupFormValues.companyName, "");
  assert.equal(initialSignupFormValues.lineId, "");
  const source = readFileSync("src/lib/security.ts", "utf8");
  assert.match(source, /field !== "lineId" && field !== "companyName"/);
});

test("registration payload helper normalizes blank optional values to null without removing supplied values", () => {
  const base = {
    ...initialSignupFormValues,
    emailAddress: "customer@example.test",
    firstName: "Alex",
    lastName: "Tan",
    contactNumber: "+66 81 555 1234",
    password: "Strongpass123",
    confirmPassword: "Strongpass123",
  };
  assert.equal(optionalRegistrationValue(`${base.companyName} \t`), null);
  assert.equal(optionalRegistrationValue("   "), null);
  assert.equal(optionalRegistrationValue("FoodOnlines Trading"), "FoodOnlines Trading");
  const source = readFileSync("src/lib/apiClient.ts", "utf8");
  assert.match(source, /line_id: optionalRegistrationValue\(formValues\.lineId\)/);
  assert.match(source, /company_name: optionalRegistrationValue\(formValues\.companyName\)/);
});

test("email and phone registration label both fields as optional and do not require company name", () => {
  const source = readFileSync("src/components/SignupFlow.tsx", "utf8");
  assert.match(source, /Company name \(optional\)/);
  assert.match(source, /LINE ID \(optional\)/);
  assert.doesNotMatch(source, /Company name is required/);
});
