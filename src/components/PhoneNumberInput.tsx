import { useEffect, useMemo, useState } from "react";
import {
  callingCodeCountries,
  callingCodeCountryForAddressCountry,
  callingCodeCountryForId,
  countryFromInternationalPhone,
  normalizeInternationalPhone,
  splitPhoneNumber,
  type CallingCodeCountry,
} from "../lib/phoneNumber";

export { callingCodeCountries, type CallingCodeCountry } from "../lib/phoneNumber";

export function PhoneNumberInput({
  autoComplete = "tel",
  countryKey,
  error,
  id,
  label,
  onBlur,
  onChange,
  required,
  value,
}: {
  autoComplete?: string;
  countryKey?: string;
  error?: string;
  id: string;
  label: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  const fallbackCountry = useMemo(() => callingCodeCountryForAddressCountry(countryKey), [countryKey]);
  const parsedValue = useMemo(() => splitPhoneNumber(value, fallbackCountry), [fallbackCountry, value]);
  const [selectedCountryId, setSelectedCountryId] = useState(parsedValue.country.id);
  const selectedCountry = callingCodeCountryForId(selectedCountryId);
  const localNumber = selectedCountry.id === parsedValue.country.id
    ? parsedValue.localNumber
    : splitPhoneNumber(value, selectedCountry).localNumber;
  const errorId = `${id}-error`;

  useEffect(() => {
    setSelectedCountryId(parsedValue.country.id);
  }, [parsedValue.country.id]);

  function emitPhoneValue(country: CallingCodeCountry, nextLocalNumber: string) {
    const pastedCountry = countryFromInternationalPhone(nextLocalNumber);
    const nextCountry = pastedCountry ?? country;
    if (pastedCountry) setSelectedCountryId(pastedCountry.id);
    onChange(normalizeInternationalPhone(nextCountry, nextLocalNumber));
  }

  return (
    <div className="grid min-w-0 gap-2">
      <label className="text-sm font-bold text-neutral-700" htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      <div className={`flex min-h-14 w-full min-w-0 overflow-hidden rounded-2xl border bg-white text-base font-semibold text-ink ring-2 ring-transparent transition focus-within:border-leaf-500 focus-within:ring-leaf-500/20 ${error ? "border-red-400 bg-red-50/40" : "border-neutral-200"}`}>
        <label className="sr-only" htmlFor={`${id}-country`}>Country calling code</label>
        <div className="relative min-h-14 w-[96px] shrink-0 border-r border-neutral-200 bg-white sm:w-[104px]">
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1 px-2 text-sm font-black text-neutral-900">
            <span>{selectedCountry.iso}</span><span>{selectedCountry.dialCode}</span>
            <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <select aria-label="Country calling code" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" id={`${id}-country`} onChange={(event) => {
            const nextCountry = callingCodeCountryForId(event.target.value);
            setSelectedCountryId(nextCountry.id);
            emitPhoneValue(nextCountry, localNumber);
          }} value={selectedCountry.id}>
            {callingCodeCountries.map((country) => <option key={country.id} value={country.id}>{country.iso} {country.dialCode} - {country.name}</option>)}
          </select>
        </div>
        <input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} autoComplete={autoComplete} className="min-h-14 min-w-0 flex-1 border-0 bg-transparent px-4 text-base font-semibold text-ink outline-none placeholder:text-neutral-400" id={id} inputMode="tel" onBlur={onBlur} onChange={(event) => emitPhoneValue(selectedCountry, event.target.value)} placeholder="Phone number" required={required} type="tel" value={localNumber} />
      </div>
      {error ? <span className="text-sm font-semibold text-red-600" id={errorId}>{error}</span> : null}
    </div>
  );
}
