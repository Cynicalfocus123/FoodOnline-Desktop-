import type { ReactNode } from "react";
import { countries } from "../../data/countries";

export const inputClass =
  "min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-base font-semibold text-ink outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/15";
export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold text-neutral-700">{label}</span>
      {children}
      {error ? (
        <span className="text-sm font-semibold text-rose-700">{error}</span>
      ) : null}
    </label>
  );
}
export function TextField({
  label,
  value,
  onChange,
  error,
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <Field label={label} error={error}>
      {multiline ? (
        <textarea
          className={`${inputClass} min-h-28 py-3`}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      ) : (
        <input
          className={inputClass}
          onChange={(event) => onChange(event.target.value)}
          type={type}
          value={value}
        />
      )}
    </Field>
  );
}
export function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-bold text-neutral-700">
      <input
        checked={checked}
        className="h-5 w-5 accent-[#6fbf12]"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}
export function CountryField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label="Country">
      <input
        className={inputClass}
        list="admin-country-list"
        maxLength={2}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        placeholder="Search or enter ISO code"
        value={value}
      />
      <datalist id="admin-country-list">
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </datalist>
    </Field>
  );
}
export function PanelHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-citrus-500">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black text-ink sm:text-3xl">
          {title}
        </h2>
      </div>
      {actions}
    </div>
  );
}
export function Notice({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "error" | "success";
  children: ReactNode;
}) {
  const colors =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-neutral-200 bg-neutral-50 text-neutral-700";
  return (
    <p
      className={`rounded-xl border px-4 py-3 text-sm font-semibold ${colors}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
export function ActionButton({
  children,
  onClick,
  disabled = false,
  tone = "primary",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
}) {
  const colors =
    tone === "primary"
      ? "bg-citrus-500 text-white hover:bg-citrus-600"
      : tone === "danger"
        ? "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
        : "border border-neutral-200 bg-white text-neutral-700 hover:border-leaf-500";
  return (
    <button
      className={`min-h-11 rounded-xl px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${colors}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
