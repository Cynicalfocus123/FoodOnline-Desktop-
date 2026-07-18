import { useEffect, useState, type ReactNode } from "react";
import { toUserFacingErrorMessage } from "../../lib/userFacingError";
import { operationsApi } from "../../services/admin/operationsApi";

const errorOf = (error: unknown) => toUserFacingErrorMessage(error, "The request could not be completed.");

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-citrus-500">Operations</p>
      <h2 className="mt-3 text-3xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function MediaPreviewList({ media }: { media: unknown }) {
  const items = Array.isArray(media) ? media as Array<Record<string, unknown>> : [];
  if (!items.length) return null;
  return <div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <SafeMediaPreview key={String(item.uuid ?? item.id)} label={String(item.alt_text ?? "Attached image")} url={typeof item.url === "string" ? item.url : null} />)}</div>;
}

function SafeMediaPreview({ url, label }: { url: string | null; label: string }) {
  const [failed, setFailed] = useState(false);
  return !url || failed
    ? <div className="grid h-20 w-20 place-items-center rounded-xl bg-neutral-100 px-2 text-center text-xs font-semibold text-neutral-500">Image unavailable</div>
    : <img alt={label} className="h-20 w-20 rounded-xl border border-neutral-200 object-cover" onError={() => setFailed(true)} src={url} />;
}

export function ReturnsAdminPanel({ token }: { token: string }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [message, setMessage] = useState("Loading returns...");
  const load = () => operationsApi.returns(token).then((result) => {
    setRows(result.data);
    setMessage(result.data.length ? "" : "No return requests.");
  }).catch((error) => setMessage(errorOf(error)));
  useEffect(() => { void load(); }, [token]);
  return <Shell title="Returns management"><p className="mt-3 text-sm text-neutral-600">Inspect returned grocery items and choose restock quantities explicitly. Cash on Delivery refunds are recorded manually.</p>{message && <p className="mt-4 rounded-2xl bg-neutral-50 p-3 text-sm">{message}</p>}<div className="mt-6 grid gap-3">{rows.map((row) => <div className="rounded-2xl border p-4" key={String(row.uuid)}><div className="flex flex-wrap justify-between gap-3"><p className="font-black">{String(row.return_number)} · {String(row.status)}</p><div className="flex gap-2">{["approve", "received", "refund", "close"].map((action) => <button className="rounded-full border px-3 py-1 text-xs font-black" key={action} onClick={() => void operationsApi.returnAction(token, String(row.uuid), { action, amount_minor: action === "refund" ? Number(window.prompt("Manual refund minor units") ?? 0) : undefined }).then(load).catch((error) => setMessage(errorOf(error)))} type="button">{action}</button>)}</div></div><p className="mt-2 text-sm text-neutral-600">Order: {String((row.order as Record<string, unknown> | undefined)?.order_number ?? "—")}</p><MediaPreviewList media={row.media} /></div>)}</div></Shell>;
}

export function ReviewsAdminPanel({ token }: { token: string }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [message, setMessage] = useState("Loading reviews...");
  const load = () => operationsApi.reviews(token).then((result) => {
    setRows(result.data);
    setMessage(result.data.length ? "" : "No reviews awaiting moderation.");
  }).catch((error) => setMessage(errorOf(error)));
  useEffect(() => { void load(); }, [token]);
  return <Shell title="Review moderation"><p className="mt-3 text-sm text-neutral-600">Product ratings use approved reviews only. Reported content remains visible to administrators until moderated.</p>{message && <p className="mt-4 rounded-2xl bg-neutral-50 p-3 text-sm">{message}</p>}<div className="mt-6 grid gap-3">{rows.map((row) => <article className="rounded-2xl border p-4" key={String(row.uuid)}><div className="flex justify-between gap-3"><p className="font-black">{"★".repeat(Number(row.rating ?? 0))} · {String(row.status)}</p><div className="flex gap-2">{["approve", "reject", "hide", "restore"].map((action) => <button className="rounded-full border px-3 py-1 text-xs font-black" key={action} onClick={() => void operationsApi.reviewAction(token, String(row.uuid), { action }).then(load).catch((error) => setMessage(errorOf(error)))} type="button">{action}</button>)}</div></div><p className="mt-2 text-sm">{String(row.body ?? "")}</p><p className="mt-2 text-xs text-neutral-500">{String((row.user as Record<string, unknown> | undefined)?.email ?? "Customer")} · Verified: {row.verified_purchase ? "Yes" : "No"}</p><MediaPreviewList media={row.media} /></article>)}</div></Shell>;
}

export function SupportAdminPanel({ token }: { token: string }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [message, setMessage] = useState("Loading support tickets...");
  useEffect(() => { void operationsApi.support(token).then((result) => { setRows(result.data); setMessage(result.data.length ? "" : "No support tickets."); }).catch((error) => setMessage(errorOf(error))); }, [token]);
  return <Shell title="Customer support"><p className="mt-3 text-sm text-neutral-600">Private notes remain visible to staff only; customer replies appear in the customer’s support history.</p>{message && <p className="mt-4 rounded-2xl bg-neutral-50 p-3 text-sm">{message}</p>}<div className="mt-6 grid gap-3">{rows.map((row) => <div className="rounded-2xl border p-4" key={String(row.uuid)}><p className="font-black">{String(row.ticket_number)} · {String(row.status)}</p><p className="mt-2 text-sm">{String(row.subject)}</p><MediaPreviewList media={row.media} /><button className="mt-3 rounded-full bg-leaf-600 px-4 py-2 text-xs font-black text-white" onClick={() => { const body = window.prompt("Reply"); if (body) void operationsApi.supportMessage(token, String(row.uuid), { body, customer_visible: true }).catch((error) => setMessage(errorOf(error))); }} type="button">Reply</button></div>)}</div></Shell>;
}

type ReportSummary = {
  orders?: { count?: number; gross_minor?: number; paid_minor?: number; cod_outstanding_minor?: number; cancelled_minor?: number };
  returns?: { count?: number; refunded_minor?: number };
  top_products?: Array<{ product_name?: string; units?: number; value_minor?: number }>;
};

const reportMoney = (minor = 0) => `USD ${(minor / 100).toFixed(2)}`;

export function ReportsAdminPanel({ token }: { token: string }) {
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [message, setMessage] = useState("Loading reports...");
  useEffect(() => { void operationsApi.reports(token).then((result) => { setReport(result as ReportSummary); setMessage(""); }).catch((error) => setMessage(errorOf(error))); }, [token]);
  const metrics = report ? [
    ["Orders", String(report.orders?.count ?? 0)],
    ["Order value", reportMoney(report.orders?.gross_minor)],
    ["Collected", reportMoney(report.orders?.paid_minor)],
    ["COD outstanding", reportMoney(report.orders?.cod_outstanding_minor)],
    ["Cancelled", reportMoney(report.orders?.cancelled_minor)],
    ["Returns", String(report.returns?.count ?? 0)],
    ["Refunded", reportMoney(report.returns?.refunded_minor)],
  ] : [];
  return <Shell title="Reports and exports"><p className="mt-3 text-sm text-neutral-600">Collected and outstanding Cash on Delivery totals are shown separately. Export access follows staff permissions.</p>{message && !report && <p className="mt-4 rounded-2xl bg-neutral-50 p-3 text-sm">{message}</p>}{report ? <><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <div className="rounded-2xl border bg-neutral-50 p-4" key={label}><p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>)}</div><div className="mt-6 rounded-2xl border p-4"><p className="font-black">Top products</p>{report.top_products?.length ? report.top_products.map((product) => <div className="mt-3 flex justify-between gap-3 border-t pt-3 text-sm" key={product.product_name}><span>{product.product_name ?? "Product"} · {product.units ?? 0} units</span><strong>{reportMoney(product.value_minor)}</strong></div>) : <p className="mt-2 text-sm text-neutral-500">No product activity for this period.</p>}</div></> : null}<button className="mt-5 inline-flex rounded-full bg-neutral-900 px-5 py-3 text-sm font-black text-white" onClick={() => void operationsApi.downloadOrdersCsv(token).catch((error) => setMessage(errorOf(error)))} type="button">Export order CSV</button></Shell>;
}

export function StaffAdminPanel({ token }: { token: string }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => { void operationsApi.staff(token).then((result) => setRows(result.data)).catch(() => setRows([])); }, [token]);
  return <Shell title="Staff permissions and MFA"><p className="mt-3 text-sm text-neutral-600">Staff access follows assigned permissions. Existing administrators keep full access until a narrower role is selected.</p><div className="mt-6 grid gap-3">{rows.map((row) => <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4" key={String(row.id)}><span><strong>{String(row.name)}</strong> · {String(row.email)}<small className="ml-2 text-neutral-500">{String(row.role)} · MFA {row.mfa_enabled ? "on" : "off"}</small></span><select className="rounded-full border px-3 py-2 text-xs font-black" defaultValue={String(row.role)} onChange={(event) => void operationsApi.updateStaff(token, Number(row.id), { staff_role: event.target.value }).catch(() => undefined)}><option>super_admin</option><option>order_manager</option><option>inventory_manager</option><option>catalog_manager</option><option>customer_support</option><option>marketing_manager</option><option>read_only</option></select></div>)}</div></Shell>;
}

export function OperationsAdminPanel({ token }: { token: string }) {
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const [jobs, setJobs] = useState<Array<{ uuid: string; failed_at: string }>>([]);
  const [message, setMessage] = useState("");
  const loadJobs = () => operationsApi.failedJobs(token).then((result) => setJobs(result.data.map((job) => ({ uuid: job.uuid, failed_at: job.failed_at })))).catch((error) => setMessage(errorOf(error)));
  useEffect(() => { void operationsApi.operations(token).then(() => setIsReady(true)).catch(() => setIsReady(false)); void loadJobs(); }, [token]);
  return <Shell title="System health"><p className="mt-3 text-sm text-neutral-600">Review service readiness and retry background tasks that need attention.</p><div className={`mt-6 rounded-2xl border p-5 ${isReady === false ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}><p className="font-black">{isReady === null ? "Checking services..." : isReady ? "Services are responding" : "Some services need attention"}</p><p className="mt-2 text-sm text-neutral-600">{isReady === false ? "Try again shortly or contact an authorized site administrator." : "Operational checks completed without exposing private configuration."}</p></div><div className="mt-6 rounded-2xl border border-neutral-200 p-4"><p className="font-black">Tasks needing attention ({jobs.length})</p>{message ? <p className="mt-2 text-sm text-red-700">{message}</p> : null}{jobs.length ? jobs.map((job) => <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3" key={job.uuid}><span className="text-xs"><strong>Background task</strong> · {new Date(job.failed_at).toLocaleString()}</span><button className="rounded-full border border-leaf-500 px-3 py-2 text-xs font-black text-leaf-700" onClick={() => void operationsApi.retryFailedJob(token, job.uuid).then(loadJobs).catch((error) => setMessage(errorOf(error)))} type="button">Retry</button></div>) : <p className="mt-2 text-sm text-neutral-500">No tasks need attention.</p>}</div></Shell>;
}
