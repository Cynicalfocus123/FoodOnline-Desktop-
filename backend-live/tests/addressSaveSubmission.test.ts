import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { callingCodeCountries, callingCodeCountryForAddressCountry, normalizeInternationalPhone } from "../src/lib/phoneNumber.ts";

const account = readFileSync("src/components/AccountPage.tsx", "utf8");

test("Address Book submit always reaches React validation instead of a silent native constraint block", () => {
  assert.match(account, /<form className="grid gap-4" noValidate onSubmit=\{saveAddress\}>/);
  assert.match(account, /Please correct the highlighted address fields and try again\./);
  assert.match(account, /role="alert"/);
  assert.match(account, /focusAddressField/);
});

test("Address Book constructs an authoritative normalized phone payload and requires a real response ID", () => {
  assert.match(account, /phoneNumber: normalizeInternationalPhone\(/);
  assert.match(account, /!response\.address \|\| !Number\.isFinite\(Number\(response\.address\.id\)\)/);
  assert.match(account, /await loadAddresses\(token\)/);
  assert.match(account, /error instanceof ApiError && error\.status === 422/);
});

test("all supported Address Book countries have a selectable calling code and a valid normalized sample", () => {
  const addressCountries = ["usa", "uk", "thailand", "japan", "singapore", "taiwan", "china", "philippines", "malaysia", "indonesia", "hongKong"];
  assert.equal(addressCountries.length, 11);
  for (const countryKey of addressCountries) {
    const country = callingCodeCountryForAddressCountry(countryKey);
    assert.ok(callingCodeCountries.includes(country));
    assert.match(normalizeInternationalPhone(country, countryKey === "thailand" ? "0813925429" : "81234567"), /^\+\d{7,15}$/);
  }
});
