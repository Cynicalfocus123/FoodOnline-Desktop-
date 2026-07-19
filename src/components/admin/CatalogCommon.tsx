import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { countries, countryNameFromCode, type Country } from "../../data/countries";

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
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const inputId = useId();
  const listboxId = useId();
  const container = useRef<HTMLDivElement>(null);
  const selectedName = countryNameFromCode(value);
  const [query, setQuery] = useState(selectedName);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const matches = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("en");
    if (!search || (value && query === selectedName)) return countries;
    return countries.filter((country) => country.name.toLocaleLowerCase("en").includes(search));
  }, [query, selectedName, value]);

  useEffect(() => {
    setQuery(selectedName);
  }, [selectedName]);

  useEffect(() => {
    if (!open || !matches[activeIndex]) return;
    document.getElementById(`${listboxId}-${matches[activeIndex].code}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxId, matches, open]);

  function choose(country: Country) {
    onChange(country.code);
    setQuery(country.name);
    setOpen(false);
    setActiveIndex(0);
  }

  return (
    <div className="grid gap-1.5" ref={container}>
      <label className="text-sm font-bold text-neutral-700" htmlFor={inputId}>Country</label>
      <div className="relative">
        <input
          aria-activedescendant={open && matches[activeIndex] ? `${listboxId}-${matches[activeIndex].code}` : undefined}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={open}
          autoComplete="off"
          className={inputClass}
          id={inputId}
          onBlur={(event) => {
            if (container.current?.contains(event.relatedTarget)) return;
            setOpen(false);
            setQuery(selectedName);
          }}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setOpen(true);
            setActiveIndex(0);
            if (!next) onChange("");
          }}
          onFocus={(event) => {
            event.currentTarget.select();
            setActiveIndex(Math.max(0, countries.findIndex((country) => country.code === value.toUpperCase())));
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => matches.length ? (current + 1) % matches.length : 0);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => matches.length ? (current - 1 + matches.length) % matches.length : 0);
            } else if (event.key === "Enter" && open && matches[activeIndex]) {
              event.preventDefault();
              choose(matches[activeIndex]);
            } else if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              setQuery(selectedName);
            }
          }}
          placeholder="Search countries"
          role="combobox"
          spellCheck={false}
          value={query}
        />
        {open ? (
          <ul
            className="absolute z-40 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl"
            id={listboxId}
            role="listbox"
          >
            {matches.length ? matches.map((country, index) => (
              <li key={country.code} role="presentation">
                <button
                  aria-selected={country.code === value}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold ${index === activeIndex ? "bg-leaf-50 text-leaf-800" : "text-neutral-700 hover:bg-neutral-50"}`}
                  id={`${listboxId}-${country.code}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(country)}
                  role="option"
                  tabIndex={-1}
                  type="button"
                >
                  {country.name}
                </button>
              </li>
            )) : <li className="px-3 py-3 text-sm font-semibold text-neutral-500">No countries found.</li>}
          </ul>
        ) : null}
      </div>
      {error ? <span className="text-sm font-semibold text-rose-700">{error}</span> : null}
    </div>
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

export function ConfirmationModal({
  open,
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      aria-labelledby="delete-confirmation-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
      role="dialog"
    >
      <div className="w-full max-w-md rounded-[28px] border border-neutral-200 bg-white p-6 shadow-2xl sm:p-7">
        <h2 className="text-xl font-black text-ink" id="delete-confirmation-title">
          Delete item
        </h2>
        <p className="mt-3 text-sm leading-7 text-neutral-600">
          Are you sure you want to permanently delete this item?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <ActionButton disabled={busy} onClick={onCancel} tone="secondary">
            Cancel
          </ActionButton>
          <ActionButton disabled={busy} onClick={onConfirm} tone="danger">
            {busy ? "Deleting…" : "Delete"}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
