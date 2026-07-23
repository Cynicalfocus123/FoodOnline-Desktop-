import { addressConfigs, type CountryKey } from "../../lib/addressSchema.ts";
import { formatInternationalPhone } from "../../lib/phoneNumber.ts";
import type {
  ManagedUserAddress,
  ManagedUserPaymentMethod,
} from "../../services/admin/usersApi.ts";

export type CustomerDetailPhase =
  | "loading"
  | "loaded"
  | "error"
  | "unavailable";

export type CustomerDetailSectionState =
  | "loading"
  | "ready"
  | "empty"
  | "error"
  | "unavailable";

const knownCountryKeys = new Set(Object.keys(addressConfigs));

export function customerDetailSectionState(
  phase: CustomerDetailPhase,
  itemCount: number,
): CustomerDetailSectionState {
  if (phase !== "loaded") return phase;
  return itemCount > 0 ? "ready" : "empty";
}

export function shouldAcceptCustomerDetail(
  requestedId: string,
  returnedId: string | number,
  requestVersion: number,
  currentVersion: number,
) {
  return (
    requestVersion === currentVersion &&
    String(requestedId).trim() === String(returnedId).trim()
  );
}

export function customerAddressCountry(address: ManagedUserAddress) {
  const explicit = valueOf(address.address_values, "country", "countryName");
  if (explicit) return explicit;
  if (knownCountryKeys.has(address.country_key)) {
    return addressConfigs[address.country_key as CountryKey].label;
  }
  return address.country_key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (value) => value.toUpperCase());
}

export function customerAddressRecipient(address: ManagedUserAddress) {
  return (
    valueOf(
      address.address_values,
      "fullName",
      "recipientName",
      "addressName",
      "name",
    ) || "Saved address"
  );
}

export function customerAddressPhone(address: ManagedUserAddress) {
  return formatInternationalPhone(valueOf(address.address_values, "phoneNumber", "phone", "telephone"));
}

export function customerAddressFields(address: ManagedUserAddress) {
  const config = knownCountryKeys.has(address.country_key)
    ? addressConfigs[address.country_key as CountryKey]
    : null;
  const labelByKey = new Map(
    config?.fields.map((field) => [field.key, field.label]) ?? [],
  );
  const hidden = new Set([
    "fullName",
    "recipientName",
    "addressName",
    "name",
    "phoneNumber",
    "phone",
    "telephone",
    "country",
    "countryName",
  ]);

  return Object.entries(address.address_values)
    .filter(
      ([field, value]) =>
        !hidden.has(field) && typeof value === "string" && value.trim() !== "",
    )
    .map(([field, value]) => ({
      field,
      label: labelByKey.get(field) ?? humanizeField(field),
      value: value!.trim(),
    }));
}

export function maskedPaymentMethodLabel(method: ManagedUserPaymentMethod) {
  const brand = method.brand.trim() || "Card";
  const last4 = method.last4.replace(/\D/g, "").slice(-4);
  return `${brand} ending in ${last4 || "••••"}`;
}

export function maskedPaymentMethodExpiry(method: ManagedUserPaymentMethod) {
  const month = String(method.expiry_month).padStart(2, "0");
  const year = String(method.expiry_year).slice(-2).padStart(2, "0");
  return `Expires ${month}/${year}`;
}

function valueOf(values: Record<string, string | null>, ...keys: string[]) {
  for (const key of keys) {
    const value = values[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function humanizeField(field: string) {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (value) => value.toUpperCase());
}
