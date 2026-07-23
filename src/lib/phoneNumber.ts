export type CallingCodeCountry = {
  id: string;
  iso: string;
  name: string;
  dialCode: string;
  displayGroups?: number[];
};

export const callingCodeCountries: CallingCodeCountry[] = [
  { id: "us", iso: "US", name: "United States", dialCode: "+1", displayGroups: [3, 3, 4] },
  { id: "gb", iso: "UK", name: "United Kingdom", dialCode: "+44", displayGroups: [4, 3, 4] },
  { id: "tr", iso: "TR", name: "Turkey", dialCode: "+90" },
  { id: "th", iso: "TH", name: "Thailand", dialCode: "+66", displayGroups: [2, 3, 4] },
  { id: "jp", iso: "JP", name: "Japan", dialCode: "+81", displayGroups: [2, 4, 4] },
  { id: "sg", iso: "SG", name: "Singapore", dialCode: "+65", displayGroups: [4, 4] },
  { id: "tw", iso: "TW", name: "Taiwan", dialCode: "+886", displayGroups: [3, 3, 3] },
  { id: "cn", iso: "CN", name: "China", dialCode: "+86", displayGroups: [3, 4, 4] },
  { id: "ph", iso: "PH", name: "Philippines", dialCode: "+63", displayGroups: [3, 3, 4] },
  { id: "my", iso: "MY", name: "Malaysia", dialCode: "+60", displayGroups: [2, 3, 4] },
  { id: "id", iso: "ID", name: "Indonesia", dialCode: "+62", displayGroups: [3, 4, 4] },
  { id: "hk", iso: "HK", name: "Hong Kong", dialCode: "+852", displayGroups: [4, 4] },
];

const callingCodeByAddressCountry: Record<string, string> = {
  usa: "us", uk: "gb", thailand: "th", japan: "jp", singapore: "sg", taiwan: "tw", china: "cn",
  philippines: "ph", malaysia: "my", indonesia: "id", hongKong: "hk",
};

const defaultCallingCodeCountry = callingCodeCountries[0];

export function callingCodeCountryForAddressCountry(countryKey?: string): CallingCodeCountry {
  const id = countryKey ? callingCodeByAddressCountry[countryKey] : undefined;
  return callingCodeCountries.find((country) => country.id === id) ?? defaultCallingCodeCountry;
}

export function callingCodeCountryForId(id?: string): CallingCodeCountry {
  return callingCodeCountries.find((country) => country.id === id) ?? defaultCallingCodeCountry;
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function countryFromInternationalPhone(value: string): CallingCodeCountry | null {
  if (!value.trimStart().startsWith("+")) return null;
  const digits = phoneDigits(value);
  return [...callingCodeCountries]
    .sort((left, right) => right.dialCode.length - left.dialCode.length)
    .find((country) => digits.startsWith(phoneDigits(country.dialCode))) ?? null;
}

export function splitPhoneNumber(value: string, fallbackCountry = defaultCallingCodeCountry) {
  const country = countryFromInternationalPhone(value) ?? fallbackCountry;
  const digits = phoneDigits(value);
  const codeDigits = phoneDigits(country.dialCode);
  const localNumber = countryFromInternationalPhone(value) ? digits.slice(codeDigits.length) : digits;
  return { country, localNumber };
}

export function normalizeInternationalPhone(country: CallingCodeCountry, localValue: string): string {
  const pastedCountry = countryFromInternationalPhone(localValue);
  const selectedCountry = pastedCountry ?? country;
  const codeDigits = phoneDigits(selectedCountry.dialCode);
  const raw = localValue.trim();
  let localNumber = splitPhoneNumber(localValue, selectedCountry).localNumber;

  if (raw.split("+").length > 2 && localNumber.startsWith(codeDigits)) {
    localNumber = localNumber.slice(codeDigits.length);
  } else if (!raw.startsWith("+") && localNumber.startsWith(codeDigits) && localNumber.length - codeDigits.length >= 7) {
    localNumber = localNumber.slice(codeDigits.length);
  }

  return localNumber ? `${selectedCountry.dialCode}${localNumber}` : "";
}

export function replacePhoneCallingCode(value: string, country: CallingCodeCountry): string {
  return normalizeInternationalPhone(country, splitPhoneNumber(value, country).localNumber);
}

export function formatInternationalPhone(value: string): string {
  const country = countryFromInternationalPhone(value);
  if (!country) return value.trim();
  let remainder = splitPhoneNumber(value, country).localNumber;
  const groups: string[] = [];
  for (const size of country.displayGroups ?? []) {
    if (!remainder) break;
    groups.push(remainder.slice(0, size));
    remainder = remainder.slice(size);
  }
  while (remainder) {
    groups.push(remainder.slice(0, 3));
    remainder = remainder.slice(3);
  }
  return [country.dialCode, ...groups].join(" ");
}

export function phoneNumberError(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Phone number is required.";
  if (!/^\+[0-9]{7,15}$/.test(trimmed)) return "Choose a country calling code and enter a valid phone number.";
  return "";
}
