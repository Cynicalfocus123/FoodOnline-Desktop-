import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  callingCodeCountries,
  callingCodeCountryForAddressCountry,
  formatInternationalPhone,
  normalizeInternationalPhone,
  replacePhoneCallingCode,
  splitPhoneNumber,
} from "../src/lib/phoneNumber.ts";

test("Address Book and registration share the one calling-code dataset", () => {
  const account = readFileSync("src/components/AccountPage.tsx", "utf8");
  const signup = readFileSync("src/components/SignupFlow.tsx", "utf8");
  const input = readFileSync("src/components/PhoneNumberInput.tsx", "utf8");
  assert.match(account, /<PhoneNumberInput/);
  assert.match(signup, /<PhoneNumberInput/);
  assert.match(input, /callingCodeCountries/);
  assert.deepEqual(callingCodeCountries.map((country) => country.iso), ["US", "UK", "TR", "TH", "JP", "SG", "TW", "CN", "PH", "MY", "ID", "HK"]);
});

test("address countries choose their matching calling code", () => {
  assert.equal(callingCodeCountryForAddressCountry("usa").dialCode, "+1");
  assert.equal(callingCodeCountryForAddressCountry("thailand").dialCode, "+66");
  assert.equal(callingCodeCountryForAddressCountry("singapore").dialCode, "+65");
  assert.equal(callingCodeCountryForAddressCountry("hongKong").dialCode, "+852");
});

test("country changes preserve local digits without duplicating a calling code", () => {
  const thailand = callingCodeCountryForAddressCountry("thailand");
  const singapore = callingCodeCountryForAddressCountry("singapore");
  assert.equal(replacePhoneCallingCode("+66813925429", singapore), "+65813925429");
  assert.equal(normalizeInternationalPhone(thailand, "+66 +66 81 392 5429"), "+66813925429");
  assert.equal(normalizeInternationalPhone(thailand, "66813925429"), "+66813925429");
  assert.equal(normalizeInternationalPhone(thailand, "+66 81 392 5429"), "+66813925429");
});

test("international paste and legacy phone editing split safely", () => {
  const pasted = splitPhoneNumber("+65 8123 4567", callingCodeCountryForAddressCountry("thailand"));
  assert.equal(pasted.country.iso, "SG");
  assert.equal(pasted.localNumber, "81234567");
  const legacy = splitPhoneNumber("081 392 5429", callingCodeCountryForAddressCountry("thailand"));
  assert.equal(legacy.country.iso, "TH");
  assert.equal(legacy.localNumber, "0813925429");
  assert.equal(formatInternationalPhone("+66813925429"), "+66 81 392 5429");
});

test("Address Book phone control remains compact and accessible", () => {
  const input = readFileSync("src/components/PhoneNumberInput.tsx", "utf8");
  assert.match(input, /aria-label="Country calling code"/);
  assert.match(input, /placeholder="Phone number"/);
  assert.match(input, /min-w-0/);
  assert.match(input, /text-base/);
});
