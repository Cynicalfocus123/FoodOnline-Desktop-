import { type FormEvent, useEffect, useState } from "react";
import { toUserFacingErrorMessage } from "../../lib/userFacingError";
import { adminCommerceApi, type Promotion } from "../../services/admin/commerceApi";
import { AdminListPage, exportCsv } from "./AdminListPage";
import {
  AdminSubmissionNotice,
  queueAdminSubmissionNotice,
  takeAdminSubmissionNotice,
  type AdminSubmissionNotice as AdminSubmissionNoticeState,
} from "./AdminSubmissionNotice";
import {
  basisPointsToPercentage,
  minorToMoney,
  moneyToMinor,
  percentageToBasisPoints,
  percentageValidationMessage,
  type PromoDiscountType,
  validatePercentage,
} from "./promoDiscount";

const messageOf = (error: unknown) => toUserFacingErrorMessage(error, "The request could not be completed.");
const money = (minor: number, currency = "USD") => `${currency} ${(minor / 100).toFixed(2)}`;

function AmountInput({
  ariaDescribedBy,
  error,
  onChange,
  suffix,
  value,
}: {
  ariaDescribedBy?: string;
  error?: boolean;
  onChange: (value: string) => void;
  suffix: string;
  value: string;
}) {
  return (
    <div className="relative">
      <input
        aria-describedby={ariaDescribedBy}
        aria-invalid={error || undefined}
        className="min-h-12 w-full rounded-xl border px-4 pr-16"
        inputMode="decimal"
        min="0"
        onChange={(event) => onChange(event.target.value)}
        step="0.01"
        type="number"
        value={value}
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-black text-neutral-600">
        {suffix}
      </span>
    </div>
  );
}

export function EnterprisePromotionsAdminPanel({
  token,
  mode = "list",
  recordId,
  onNavigate,
}: {
  token: string;
  mode?: "list" | "create" | "edit";
  recordId?: string | null;
  onNavigate: (path: string, replace?: boolean) => void;
}) {
  const [rows, setRows] = useState<Promotion[]>([]);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [message, setMessage] = useState("Loading promo codes...");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [discountType, setDiscountType] = useState<PromoDiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumSubtotal, setMinimumSubtotal] = useState("");
  const [maximumDiscount, setMaximumDiscount] = useState("");
  const [discountValueError, setDiscountValueError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState<AdminSubmissionNoticeState | null>(() => takeAdminSubmissionNotice());

  const load = async () => {
    const response = await adminCommerceApi.allPromotions(token);
    setRows(response.data);
    setMessage(response.data.length ? "" : "No promo codes yet.");
  };

  function hydrate(promotion: Promotion) {
    setEditing(promotion);
    setDiscountType(promotion.discount_type);
    setDiscountValue(
      promotion.discount_type === "percentage"
        ? basisPointsToPercentage(promotion.discount_value)
        : minorToMoney(promotion.discount_value),
    );
    setMinimumSubtotal(minorToMoney(promotion.minimum_subtotal_minor));
    setMaximumDiscount(minorToMoney(promotion.maximum_discount_minor));
    setDiscountValueError("");
  }

  useEffect(() => {
    void load().catch((error) => setMessage(messageOf(error)));
  }, [token]);

  useEffect(() => {
    const queuedNotice = takeAdminSubmissionNotice();
    if (queuedNotice) setSubmissionNotice(queuedNotice);
    if (mode === "create") {
      setEditing(null);
      setDiscountType("percentage");
      setDiscountValue("");
      setMinimumSubtotal("");
      setMaximumDiscount("");
      setDiscountValueError("");
      setMessage("");
      return;
    }
    if (mode === "edit" && recordId) {
      void adminCommerceApi.promotion(token, recordId).then((response) => hydrate(response.promotion)).catch((error) => setMessage(messageOf(error)));
    }
  }, [mode, recordId, token]);

  function changeDiscountType(value: PromoDiscountType) {
    setDiscountType(value);
    setDiscountValue("");
    setDiscountValueError("");
  }

  function changeDiscountValue(value: string) {
    setDiscountValue(value);
    setDiscountValueError(discountType === "percentage" ? validatePercentage(value) : "");
  }

  function optionalMinor(value: string) {
    if (!value.trim()) return { value: null, error: "" };
    const minor = moneyToMinor(value);
    return minor === null ? { value: null, error: "Enter a valid monetary amount." } : { value: minor, error: "" };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    const percentageBasisPoints = percentageToBasisPoints(discountValue);
    const fixedMinor = moneyToMinor(discountValue);
    const discountError = discountType === "percentage"
      ? percentageBasisPoints === null ? percentageValidationMessage : ""
      : fixedMinor === null || fixedMinor < 1 ? "Enter a discount amount greater than 0." : "";
    const minimum = optionalMinor(minimumSubtotal);
    const maximum = optionalMinor(maximumDiscount);
    if (discountError || minimum.error || maximum.error) {
      setDiscountValueError(discountError || minimum.error || maximum.error);
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await adminCommerceApi.savePromotion(token, editing?.uuid ?? null, {
        code: String(form.get("code") ?? ""),
        description: String(form.get("description") ?? "").trim() || null,
        discount_type: discountType,
        discount_value: discountType === "percentage" ? percentageBasisPoints! : fixedMinor!,
        minimum_subtotal_minor: minimum.value,
        maximum_discount_minor: maximum.value,
        currency_code: discountType === "fixed" ? "USD" : null,
        starts_at: null,
        ends_at: null,
        total_usage_limit: form.get("usage") ? Number(form.get("usage")) : null,
        per_user_usage_limit: 1,
        active: true,
        applies_to: "all",
      });
      const wasNew = !editing;
      hydrate(response.promotion);
      await load();
      const notice: AdminSubmissionNoticeState = {
        tone: "success",
        message: wasNew ? "Promo code created successfully." : "Promo code updated successfully.",
      };
      if (wasNew) {
        queueAdminSubmissionNotice(notice);
        onNavigate(`/admin/promotions/${response.promotion.uuid}/edit`, true);
      } else {
        setSubmissionNotice(notice);
      }
    } catch (error) {
      setMessage(messageOf(error));
    } finally {
      setSaving(false);
    }
  }

  async function archiveSelected() {
    const targets = rows.filter((row) => selectedIds.has(row.uuid));
    if (!targets.length || !window.confirm(`Archive ${targets.length} selected promo codes?`)) return;
    for (const row of targets) await adminCommerceApi.archivePromotion(token, row.uuid);
    setSelectedIds(new Set());
    await load();
  }

  async function publishSelected() {
    const targets = rows.filter((row) => selectedIds.has(row.uuid) && row.status !== "archived" && row.applies_to === "all");
    if (!targets.length) {
      setMessage("Selected archived or restricted promo codes must be reviewed individually before publication.");
      return;
    }
    if (!window.confirm(`Publish ${targets.length} selected promo codes?`)) return;
    for (const row of targets) {
      await adminCommerceApi.savePromotion(token, row.uuid, {
        code: row.code,
        description: row.description,
        discount_type: row.discount_type,
        discount_value: row.discount_value,
        minimum_subtotal_minor: row.minimum_subtotal_minor,
        maximum_discount_minor: row.maximum_discount_minor,
        currency_code: row.currency_code,
        starts_at: row.starts_at,
        ends_at: row.ends_at,
        total_usage_limit: row.total_usage_limit,
        per_user_usage_limit: row.per_user_usage_limit,
        active: true,
        applies_to: row.applies_to,
      });
    }
    setSelectedIds(new Set());
    await load();
  }

  const filtered = rows.filter((row) => row.code.toLowerCase().includes(search.toLowerCase()));
  const pageSize = 20;
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allSelected = pageItems.length > 0 && pageItems.every((row) => selectedIds.has(row.uuid));
  const currency = editing?.currency_code ?? "USD";

  if (mode === "list") {
    return (
      <AdminListPage
        bulkActions={[
          { label: "Bulk publish", onClick: () => void publishSelected() },
          { label: "Bulk archive", onClick: () => void archiveSelected() },
          { label: "Bulk delete", onClick: () => void archiveSelected(), tone: "danger" },
        ]}
        count={filtered.length}
        createLabel="Create Promo Code"
        description="Manage promotion rules, limits, publication state, and usage."
        onCreate={() => onNavigate("/admin/promotions/create")}
        onExport={() => exportCsv("promo-codes.csv", filtered.map((row) => ({ code: row.code, type: row.discount_type, value: row.discount_value, usage: row.usage_count, status: row.status, updated: row.updated_at })))}
        onPage={setPage}
        onSearch={setSearch}
        page={page}
        pageSize={pageSize}
        search={search}
        selectedCount={selectedIds.size}
        title="Promo Codes"
        total={filtered.length}
      >
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="bg-neutral-50"><tr>{["", "Code", "Type", "Value", "Usage", "Status", "Updated", ""].map((header, index) => <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.14em] text-neutral-500" key={`${header}-${index}`}>{index === 0 ? <input aria-label="Select page" checked={allSelected} onChange={() => setSelectedIds((current) => { const next = new Set(current); pageItems.forEach((row) => allSelected ? next.delete(row.uuid) : next.add(row.uuid)); return next; })} type="checkbox" /> : header}</th>)}</tr></thead>
          <tbody>{pageItems.map((row) => <tr className="border-t border-neutral-100" key={row.uuid}><td className="px-4 py-4"><input aria-label={`Select ${row.code}`} checked={selectedIds.has(row.uuid)} onChange={() => setSelectedIds((current) => { const next = new Set(current); next.has(row.uuid) ? next.delete(row.uuid) : next.add(row.uuid); return next; })} type="checkbox" /></td><td className="px-4 py-4 font-black">{row.code}</td><td className="px-4 py-4 capitalize">{row.discount_type}</td><td className="px-4 py-4">{row.discount_type === "percentage" ? `${row.discount_value / 100}%` : money(row.discount_value, row.currency_code ?? "USD")}</td><td className="px-4 py-4">{row.usage_count}/{row.total_usage_limit ?? "∞"}</td><td className="px-4 py-4 capitalize">{row.status}</td><td className="px-4 py-4">{new Date(row.updated_at).toLocaleString()}</td><td className="px-4 py-4"><button className="font-black text-leaf-700" onClick={() => onNavigate(`/admin/promotions/${row.uuid}/edit`)} type="button">Edit</button></td></tr>)}</tbody>
        </table>
      </AdminListPage>
    );
  }

  return (
    <form className="grid gap-6 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-8" onSubmit={submit}>
      <button className="w-fit text-sm font-black text-leaf-700" onClick={() => onNavigate("/admin/promotions")} type="button">← Promo Codes</button>
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-sm font-black uppercase tracking-[0.18em] text-citrus-500">{editing ? "Edit promo code" : "Create promo code"}</p><h2 className="mt-2 text-3xl font-black">{editing?.code ?? "Create promo code"}</h2></div>
        <div className="flex gap-2"><button className="rounded-2xl bg-citrus-500 px-5 py-3 text-sm font-black text-white disabled:opacity-60" disabled={saving} type="submit">{saving ? "Saving…" : "Save"}</button><button className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-black disabled:opacity-60" disabled={saving} type="submit">{saving ? "Saving…" : "Save & Continue"}</button>{editing ? <button className="rounded-2xl border border-rose-200 px-5 py-3 text-sm font-black text-rose-700" onClick={() => void adminCommerceApi.archivePromotion(token, editing.uuid).then(() => onNavigate("/admin/promotions"))} type="button">Delete</button> : null}</div>
      </div>
      <AdminSubmissionNotice notice={submissionNotice} onDismiss={() => setSubmissionNotice(null)} />
      {message ? <p className="rounded-2xl bg-neutral-50 p-3 text-sm">{message}</p> : null}
      <section className="grid gap-4 rounded-2xl border border-neutral-200 p-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">Code<input className="min-h-12 rounded-xl border px-4" defaultValue={editing?.code} key={`code-${editing?.uuid}`} name="code" required /></label>
        <label className="grid gap-2 text-sm font-bold">Discount type<select className="min-h-12 rounded-xl border px-4" name="discount_type" onChange={(event) => changeDiscountType(event.target.value as PromoDiscountType)} value={discountType}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label>
        <label className="grid gap-2 text-sm font-bold">Discount value<AmountInput ariaDescribedBy="promo-discount-help promo-discount-error" error={Boolean(discountValueError)} onChange={changeDiscountValue} suffix={discountType === "percentage" ? "%" : currency} value={discountValue} /><span className="text-xs font-medium text-neutral-600" id="promo-discount-help">{discountType === "percentage" ? "Enter a percentage from 0.01% to 100%." : `Enter a ${currency} discount amount.`}</span>{discountValueError ? <span className="text-xs font-bold text-rose-700" id="promo-discount-error" role="alert">{discountValueError}</span> : null}</label>
        <label className="grid gap-2 text-sm font-bold">Minimum subtotal (optional)<AmountInput onChange={setMinimumSubtotal} suffix={currency} value={minimumSubtotal} /></label>
        <label className="grid gap-2 text-sm font-bold">Maximum discount (optional)<AmountInput onChange={setMaximumDiscount} suffix={currency} value={maximumDiscount} /></label>
        <label className="grid gap-2 text-sm font-bold">Total use limit<input className="min-h-12 rounded-xl border px-4" defaultValue={editing?.total_usage_limit ?? ""} key={`usage-${editing?.uuid}`} min="1" name="usage" type="number" /></label>
        <label className="grid gap-2 text-sm font-bold">Description<textarea className="min-h-24 rounded-xl border p-4" defaultValue={editing?.description ?? ""} key={`description-${editing?.uuid}`} name="description" /></label>
      </section>
    </form>
  );
}
