import { useMemo, useState } from "react";

export type CallingCodeCountry = {
  id: string;
  iso: string;
  name: string;
  dialCode: string;
};

export const callingCodeCountries: CallingCodeCountry[] = [
  { id: "us", iso: "US", name: "United States", dialCode: "+1" },
  { id: "gb", iso: "UK", name: "United Kingdom", dialCode: "+44" },
  { id: "tr", iso: "TR", name: "Turkey", dialCode: "+90" },
  { id: "th", iso: "TH", name: "Thailand", dialCode: "+66" },
  { id: "jp", iso: "JP", name: "Japan", dialCode: "+81" },
  { id: "sg", iso: "SG", name: "Singapore", dialCode: "+65" },
  { id: "tw", iso: "TW", name: "Taiwan", dialCode: "+886" },
  { id: "cn", iso: "CN", name: "China", dialCode: "+86" },
  { id: "ph", iso: "PH", name: "Philippines", dialCode: "+63" },
  { id: "my", iso: "MY", name: "Malaysia", dialCode: "+60" },
  { id: "id", iso: "ID", name: "Indonesia", dialCode: "+62" },
  { id: "hk", iso: "HK", name: "Hong Kong", dialCode: "+852" },
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
        <div className="relative min-h-14 w-[96px] shrink-0 border-r border-neutral-200 bg-white sm:w-[104px]">
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 px-2 text-sm font-black text-neutral-900">
            <span>{selectedCountry.iso}</span>
            <span>{selectedCountry.dialCode}</span>
            <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <select
            aria-label="Phone country code"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
                {country.iso} {country.dialCode} - {country.name}
              </option>
            ))}
          </select>
        </div>
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
