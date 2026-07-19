import type { ReactNode } from "react";

export type BulkAction = { label: string; tone?: "default" | "danger"; onClick: () => void; disabled?: boolean };

export function AdminListPage({
  title,
  count,
  description,
  createLabel,
  onCreate,
  search,
  onSearch,
  onSubmitSearch,
  filters,
  sort,
  sortOptions = [],
  onSort,
  selectedCount = 0,
  bulkActions = [],
  onExport,
  children,
  page = 1,
  pageSize = 20,
  total = count,
  onPage,
}: {
  title: string;
  count: number;
  description?: string;
  createLabel?: string;
  onCreate?: () => void;
  search: string;
  onSearch: (value: string) => void;
  onSubmitSearch?: () => void;
  filters?: ReactNode;
  sort?: string;
  sortOptions?: Array<{ value: string; label: string }>;
  onSort?: (value: string) => void;
  selectedCount?: number;
  bulkActions?: BulkAction[];
  onExport: () => void;
  children: ReactNode;
  page?: number;
  pageSize?: number;
  total?: number;
  onPage?: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <section className="min-w-0">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-citrus-500">Content management</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-black text-ink sm:text-4xl">{title}</h2>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-neutral-600 shadow-sm">{count.toLocaleString()} records</span>
          </div>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">{description}</p> : null}
        </div>
        {onCreate && createLabel ? <button className="min-h-12 shrink-0 rounded-2xl bg-citrus-500 px-5 text-sm font-black text-white shadow-sm transition hover:bg-citrus-600" onClick={onCreate} type="button">{createLabel}</button> : null}
      </div>

      <div className="mt-6 rounded-[28px] border border-neutral-200 bg-white p-4 shadow-soft sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <form className="flex min-w-0 flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); onSubmitSearch?.(); }}>
            <input aria-label={`Search ${title}`} className="min-h-12 min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-white px-4 text-base font-semibold outline-none transition focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/15" onChange={(event) => onSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}`} value={search} />
            <button className="min-h-12 rounded-2xl bg-[#112017] px-5 text-sm font-black text-white" type="submit">Search</button>
          </form>
          {onSort && sortOptions.length ? <select aria-label={`Sort ${title}`} className="min-h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-700" onChange={(event) => onSort(event.target.value)} value={sort}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : null}
          <button className="min-h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-700" onClick={onExport} type="button">Export</button>
        </div>
        {filters ? <div className="mt-4 border-t border-neutral-100 pt-4"><p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Advanced filters</p>{filters}</div> : null}
        <div className="mt-4 flex min-h-12 flex-wrap items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-2">
          <span className="mr-1 text-sm font-bold text-neutral-600">{selectedCount ? `${selectedCount} selected` : "Select records for bulk actions"}</span>
          {bulkActions.map((action) => <button className={`rounded-full border px-3 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-40 ${action.tone === "danger" ? "border-rose-200 bg-white text-rose-700" : "border-neutral-200 bg-white text-neutral-700"}`} disabled={action.disabled ?? selectedCount === 0} key={action.label} onClick={action.onClick} type="button">{action.label}</button>)}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-soft">
        <div className="overflow-x-auto">{children}</div>
        <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-neutral-500">Page {Math.min(page, pages)} of {pages} · {total.toLocaleString()} records</p>
          <div className="flex gap-2">
            <button className="min-h-10 rounded-xl border border-neutral-200 px-4 text-sm font-black disabled:opacity-40" disabled={page <= 1} onClick={() => onPage?.(page - 1)} type="button">Previous</button>
            <button className="min-h-10 rounded-xl border border-neutral-200 px-4 text-sm font-black disabled:opacity-40" disabled={page >= pages} onClick={() => onPage?.(page + 1)} type="button">Next</button>
          </div>
        </div>
      </div>
    </section>
  );
}
export function exportCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [columns.map(escape).join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\r\n");
  const href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 10_000);
}
