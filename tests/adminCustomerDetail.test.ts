import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  customerAddressCountry,
  customerAddressRecipient,
  customerDetailSectionState,
  maskedPaymentMethodExpiry,
  maskedPaymentMethodLabel,
  shouldAcceptCustomerDetail,
} from "../src/components/admin/customerDetailPresentation.ts";
import { readAdminRoute } from "../src/lib/adminRouting.ts";
import { toUserFacingErrorMessage } from "../src/lib/userFacingError.ts";
import type {
  ManagedUserAddress,
  ManagedUserPaymentMethod,
} from "../src/services/admin/usersApi.ts";

const addresses: ManagedUserAddress[] = [
  {
    id: 101,
    user_id: "42",
    country_key: "thailand",
    address_values: {
      fullName: "Mike",
      phoneNumber: "+66 81 234 5678",
      province: "Bangkok",
    },
    summary: "Bangkok 10110",
    is_default: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: 102,
    user_id: "42",
    country_key: "usa",
    address_values: {
      fullName: "Pasit",
      phoneNumber: "+1 213 555 0142",
      state: "California",
    },
    summary: "Los Angeles, CA 90071",
    is_default: false,
    created_at: null,
    updated_at: null,
  },
];

test("two selected-customer addresses remain distinct and only the real default is marked", () => {
  assert.deepEqual(addresses.map(customerAddressRecipient), ["Mike", "Pasit"]);
  assert.deepEqual(
    addresses.map((address) => address.id),
    [101, 102],
  );
  assert.deepEqual(
    addresses
      .filter((address) => address.is_default)
      .map((address) => address.id),
    [101],
  );
  assert.deepEqual(addresses.map(customerAddressCountry), [
    "Thailand",
    "United States",
  ]);
});

test("detail collection states never show a confirmed empty state while loading", () => {
  assert.equal(customerDetailSectionState("loading", 0), "loading");
  assert.equal(customerDetailSectionState("loaded", 0), "empty");
  assert.equal(customerDetailSectionState("loaded", 2), "ready");
  assert.equal(customerDetailSectionState("error", 0), "error");
  assert.equal(customerDetailSectionState("unavailable", 0), "unavailable");
});

test("payment presentation contains masked brand last-four and expiry only", () => {
  const method: ManagedUserPaymentMethod = {
    id: 201,
    user_id: "42",
    brand: "Visa",
    last4: "4242",
    expiry_month: 8,
    expiry_year: 2028,
    is_default: true,
    status: "active",
    created_at: null,
  };

  assert.equal(maskedPaymentMethodLabel(method), "Visa ending in 4242");
  assert.equal(maskedPaymentMethodExpiry(method), "Expires 08/28");
  assert.equal(JSON.stringify(method).includes("cvv"), false);
  assert.equal(JSON.stringify(method).includes("token"), false);
});

test("technical failures stay hidden and stale customer responses are rejected", () => {
  assert.equal(
    toUserFacingErrorMessage(
      new Error("Laravel SQLSTATE at /api/v1/admin/users/42"),
      "Unable to load this customer. Please try again.",
    ),
    "Unable to load this customer. Please try again.",
  );
  assert.equal(shouldAcceptCustomerDetail("42", "42", 7, 7), true);
  assert.equal(shouldAcceptCustomerDetail("42", "43", 7, 7), false);
  assert.equal(shouldAcceptCustomerDetail("42", "42", 6, 7), false);
});

test("direct customer edit routing and detail UI load the canonical record", () => {
  assert.deepEqual(readAdminRoute("/admin/customers/42/edit"), {
    sidebarKey: "users",
    module: "customers",
    mode: "edit",
    recordId: "42",
  });

  const source = readFileSync(
    new URL(
      "../src/components/admin/EnterpriseUsersAdminPanel.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /usersApi\s*\.show\(token, recordId\)/);
  assert.match(source, /addresses\.map\(\(address\)/);
  assert.match(source, /address\.is_default \? <DefaultBadge \/>/);
  assert.match(source, /No saved addresses for this customer\./);
  assert.match(source, /No saved payment methods for this customer\./);
  assert.match(source, /paymentMethods\.map\(\(method\)/);
  assert.match(source, /Retry/);
});
