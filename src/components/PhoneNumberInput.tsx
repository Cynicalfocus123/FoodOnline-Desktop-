import { useMemo, useState } from "react";

export type CallingCodeCountry = {
  id: string;
  flag: string;
  iso: string;
  name: string;
  dialCode: string;
};

export const callingCodeCountries: CallingCodeCountry[] = [
  { id: "us", flag: "🇺🇸", iso: "US", name: "United States", dialCode: "+1" },
  { id: "gb", flag: "🇬🇧", iso: "UK", name: "United Kingdom", dialCode: "+44" },
  { id: "tr", flag: "🇹🇷", iso: "TR", name: "Turkey", dialCode: "+90" },
  { id: "th", flag: "🇹🇭", iso: "TH", name: "Thailand", dialCode: "+66" },
  { id: "jp", flag: "🇯🇵", iso: "JP", name: "Japan", dialCode: "+81" },
  { id: "sg", flag: "🇸🇬", iso: "SG", name: "Singapore", dialCode: "+65" },
  { id: "tw", flag: "🇹🇼", iso: "TW", name: "Taiwan", dialCode: "+886" },
  { id: "cn", flag: "🇨🇳", iso: "CN", name: "China", dialCode: "+86" },
  { id: "ph", flag: "🇵🇭", iso: "PH", name: "Philippines", dialCode: "+63" },
  { id: "my", flag: "🇲🇾", iso: "MY", name: "Malaysia", dialCode: "+60" },
  { id: "id", flag: "🇮🇩", iso: "ID", name: "Indonesia", dialCode: "+62" },
  { id: "hk", flag: "🇭🇰", iso: "HK", name: "Hong Kong", dialCode: "+852" },
];

function normalizeDialCode(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function getCountryFromPhoneValue(value: string) {
  const normalizedValue = normalizeDialCode(value.trim());

  return (
    [...callingCodeCountries]
      .sort((left, right) => right.dialCode.length - left.dialCode.length)
      .find((country) => normalizedValue.startsWith(normalizeDialCode(country.dialCode))) ?? callingCodeCountries[0]
  );
}

function stripDialCode(value: string, country: CallingCodeCountry) {
  const trimmedValue = value.trimStart();

  if (!trimmedValue) {
    return "";
  }

  const escapedCode = country.dialCode.replace("+", "\\+");
  return trimmedValue.replace(new RegExp(`^${escapedCode}\\s*`), "");
}

export function PhoneNumberInput({
  autoComplete = "tel",
  error,
  id,
  label,
  onChange,
  required,
  value,
}: {
  autoComplete?: string;
  error?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  const inferredCountry = useMemo(() => getCountryFromPhoneValue(value), [value]);
  const [selectedCountryId, setSelectedCountryId] = useState(inferredCountry.id);
  const selectedCountry = callingCodeCountries.find((country) => country.id === selectedCountryId) ?? inferredCountry;
  const localNumber = stripDialCode(value, selectedCountry);
  const errorId = `${id}-error`;

  function emitPhoneValue(country: CallingCodeCountry, nextLocalNumber: string) {
    const cleanedLocalNumber = nextLocalNumber.replace(/[^0-9()\-\s]/g, "");
    onChange(cleanedLocalNumber.trim() ? `${country.dialCode} ${cleanedLocalNumber}` : "");
  }

  return (
    <div className="grid gap-2">
      <label className="text-sm font-bold text-neutral-700" htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      <div
        className={`flex min-h-14 w-full overflow-hidden rounded-md border bg-white text-base font-semibold text-ink ring-2 ring-transparent transition focus-within:border-leaf-500 focus-within:ring-leaf-500/20 ${
          error ? "border-red-400 bg-red-50/40" : "border-neutral-200"
        }`}
      >
        <label className="sr-only" htmlFor={`${id}-country`}>
          Phone country code
        </label>
        <select
          aria-label="Phone country code"
          className="min-h-14 w-[116px] shrink-0 border-0 border-r border-neutral-200 bg-white px-3 text-sm font-black text-neutral-800 outline-none sm:w-[128px]"
          id={`${id}-country`}
          onChange={(event) => {
            const nextCountry = callingCodeCountries.find((country) => country.id === event.target.value) ?? callingCodeCountries[0];
            setSelectedCountryId(nextCountry.id);
            emitPhoneValue(nextCountry, localNumber);
          }}
          value={selectedCountry.id}
        >
          {callingCodeCountries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.flag} {country.iso} {country.dialCode} - {country.name}
            </option>
          ))}
        </select>
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className="min-h-14 min-w-0 flex-1 border-0 bg-transparent px-4 text-base font-semibold text-ink outline-none placeholder:text-neutral-400"
          id={id}
          inputMode="tel"
          onChange={(event) => emitPhoneValue(selectedCountry, event.target.value)}
          placeholder="Phone number"
          required={required}
          type="tel"
          value={localNumber}
        />
      </div>
      {error ? (
        <span className="text-sm font-semibold text-red-600" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
