import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  basisPointsToPercentage,
  minorToMoney,
  moneyToMinor,
  percentageToBasisPoints,
  validatePercentage,
} from "../src/components/admin/promoDiscount.ts";

test("promo percentage values convert between human percentages and basis points", () => {
  assert.equal(percentageToBasisPoints("1"), 100);
  assert.equal(percentageToBasisPoints("5.5"), 550);
  assert.equal(percentageToBasisPoints("30"), 3000);
  assert.equal(basisPointsToPercentage(3000), "30");
});

test("promo percentage validation rejects ambiguous or out-of-range values", () => {
  for (const value of ["", "0", "-1", "100.01", "30%", "1.234"]) assert.match(validatePercentage(value), /0\.01% to 100%/);
});

test("promo money values retain minor-unit conversion without percentage conversion", () => {
  assert.equal(moneyToMinor("12.50"), 1250);
  assert.equal(minorToMoney(1250), "12.50");
  assert.equal(moneyToMinor(""), null);
});

test("signup and create flows use the requested shared success feedback", () => {
  const signup = readFileSync("src/components/SignupFlow.tsx", "utf8");
  const adminNotice = readFileSync("src/components/admin/AdminSubmissionNotice.tsx", "utf8");
  const product = readFileSync("src/components/admin/ProductAdminPanel.tsx", "utf8");
  const brand = readFileSync("src/components/admin/BrandAdminPanel.tsx", "utf8");
  const category = readFileSync("src/components/admin/CategoryAdminPanel.tsx", "utf8");
  const promo = readFileSync("src/components/admin/EnterprisePromotionsAdminPanel.tsx", "utf8");
  const successScreen = signup.slice(signup.indexOf('if (signupStep === "complete"'), signup.indexOf('if (signupStep === "form"'));
  assert.match(successScreen, /Thank you for registering\./);
  assert.match(successScreen, /Go to Home/);
  assert.match(successScreen, /onClick=\{backToHome\}/);
  assert.doesNotMatch(successScreen, /Go to Login|Registration Complete|FoodOnlines account system/);
  assert.match(adminNotice, /role="status"/);
  for (const [source, message] of [[product, "Product created successfully."], [brand, "Brand created successfully."], [category, "Category created successfully."], [promo, "Promo code created successfully."]] as const) assert.match(source, new RegExp(message.replaceAll(".", "\\.")));
  assert.match(promo, /<option value="percentage">Percentage<\/option>/);
  assert.match(promo, /suffix=\{discountType === "percentage" \? "%" : currency\}/);
});
