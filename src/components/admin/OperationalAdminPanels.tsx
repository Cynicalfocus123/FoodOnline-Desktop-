import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toUserFacingErrorMessage } from "../../lib/userFacingError";
import { catalogApi, uploadManagedImage } from "../../services/admin/catalogApi";
import { operationsApi } from "../../services/admin/operationsApi";
import type { MediaPurpose, MediaStorageState } from "../../types/adminCatalog";
import { ManagedMediaControl, type ManagedMediaItem } from "./ManagedMediaControl";

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

function operationalMediaItems(media: unknown, purpose: MediaPurpose, label: string): ManagedMediaItem[] {
  const attached = Array.isArray(media) ? media as Array<Record<string, unknown>> : [];
  return [
    ...attached.map((item) => ({
      id: String(item.upload_uuid ?? item.uuid ?? item.id),
      purpose,
      label,
      url: typeof item.url === "string" ? item.url : null,
    })),
    { id: "new", purpose, label: `Add ${label.toLowerCase()}`, url: null },
  ];
}

type OperationalMediaPanelProps = { token: string; storage: MediaStorageState };

function useOperationalMedia(token: string, load: () => Promise<unknown>) {
  const [progress, setProgress] = useState<number | null>(null);
  const [mediaError, setMediaError] = useState("");

  const upload = async (purpose: MediaPurpose, targetUuid: string, file: File) => {
    setMediaError("");
    setProgress(0);
    try {
      await uploadManagedImage({ token, purpose, targetUuid, file, onProgress: setProgress });
      await load();
    } catch (error) {
      setMediaError(errorOf(error));
    } finally {
      setProgress(null);
    }
  };

  const remove = async (item: ManagedMediaItem) => {
    if (item.id === "new") return;
    setMediaError("");
    try {
      await catalogApi.deleteManagedUpload(token, item.id);
      await load();
    } catch (error) {
      setMediaError(errorOf(error));
    }
  };

  return { mediaError, progress, remove, upload };
}

export function ReturnsAdminPanel({ token, storage }: OperationalMediaPanelProps) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [message, setMessage] = useState("Loading returns...");
  const load = () => operationsApi.returns(token).then((result) => {
    setRows(result.data);
    setMessage(result.data.length ? "" : "No return requests.");
  }).catch((error) => setMessage(errorOf(error)));
  const media = useOperationalMedia(token, load);
  useEffect(() => { void load(); }, [token]);

  return (
    <Shell title="Returns management">
      <p className="mt-3 text-sm text-neutral-600">Inspect returned grocery items and choose restock quantities explicitly. Cash on Delivery refunds are recorded manually.</p>
      {message && <p className="mt-4 rounded-2xl bg-neutral-50 p-3 text-sm">{message}</p>}
      <div className="mt-6 grid gap-3">
        {rows.map((row) => (
          <div className="rounded-2xl border p-4" key={String(row.uuid)}>
            <div className="flex flex-wrap justify-between gap-3">
              <p className="font-black">{String(row.return_number)} · {String(row.status)}</p>
              <div className="flex gap-2">
                {["approve", "received", "refund", "close"].map((action) => (
                  <button className="rounded-full border px-3 py-1 text-xs font-black" key={action} onClick={() => void operationsApi.returnAction(token, String(row.uuid), { action, amount_minor: action === "refund" ? Number(window.prompt("Manual refund minor units") ?? 0) : undefined }).then(load).catch((error) => setMessage(errorOf(error)))} type="button">{action}</button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-neutral-600">Order: {String((row.order as Record<string, unknown> | undefined)?.order_number ?? "—")}</p>
            <div className="mt-4">
              <ManagedMediaControl allowReplace={false} entityId={String(row.uuid)} entityType="return" error={media.mediaError} items={operationalMediaItems(row.media, "return_evidence", "Return evidence")} onRemove={(item) => void media.remove(item)} onUpload={(_purpose, file) => void media.upload("return_evidence", String(row.uuid), file)} progress={media.progress} storage={storage} />
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function ReviewsAdminPanel({ token, storage }: OperationalMediaPanelProps) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [message, setMessage] = useState("Loading reviews...");
  const load = () => operationsApi.reviews(token).then((result) => {
    setRows(result.data);
    setMessage(result.data.length ? "" : "No reviews awaiting moderation.");
  }).catch((error) => setMessage(errorOf(error)));
  const media = useOperationalMedia(token, load);
  useEffect(() => { void load(); }, [token]);

  return (
    <Shell title="Review moderation">
      <p className="mt-3 text-sm text-neutral-600">Product ratings use approved reviews only. Reported content remains visible to administrators until moderated.</p>
      {message && <p className="mt-4 rounded-2xl bg-neutral-50 p-3 text-sm">{message}</p>}
      <div className="mt-6 grid gap-3">
        {rows.map((row) => (
          <article className="rounded-2xl border p-4" key={String(row.uuid)}>
            <div className="flex justify-between gap-3">
              <p className="font-black">{"★".repeat(Number(row.rating ?? 0))} · {String(row.status)}</p>
              <div className="flex gap-2">
                {["approve", "reject", "hide", "restore"].map((action) => (
                  <button className="rounded-full border px-3 py-1 text-xs font-black" key={action} onClick={() => void operationsApi.reviewAction(token, String(row.uuid), { action }).then(load).catch((error) => setMessage(errorOf(error)))} type="button">{action}</button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm">{String(row.body ?? "")}</p>
            <p className="mt-2 text-xs text-neutral-500">{String((row.user as Record<string, unknown> | undefined)?.email ?? "Customer")} · Verified: {row.verified_purchase ? "Yes" : "No"}</p>
            <div className="mt-4">
              <ManagedMediaControl allowReplace={false} entityId={String(row.uuid)} entityType="review" error={media.mediaError} items={operationalMediaItems(row.media, "review_image", "Review image")} onRemove={(item) => void media.remove(item)} onUpload={(_purpose, file) => void media.upload("review_image", String(row.uuid), file)} progress={media.progress} storage={storage} />
            </div>
          </article>
        ))}
      </div>
    </Shell>
  );
}

export function SupportAdminPanel({ token, storage }: OperationalMediaPanelProps) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [message, setMessage] = useState("Loading support tickets...");
  const load = () => operationsApi.support(token).then((result) => {
    setRows(result.data);
    setMessage(result.data.length ? "" : "No support tickets.");
  }).catch((error) => setMessage(errorOf(error)));
  const media = useOperationalMedia(token, load);
  useEffect(() => { void load(); }, [token]);

  return (
    <Shell title="Customer support">
      <p className="mt-3 text-sm text-neutral-600">Private notes remain visible to staff only; customer replies appear in the customer’s support history.</p>
      {message && <p className="mt-4 rounded-2xl bg-neutral-50 p-3 text-sm">{message}</p>}
      <div className="mt-6 grid gap-3">
        {rows.map((row) => (
          <div className="rounded-2xl border p-4" key={String(row.uuid)}>
            <p className="font-black">{String(row.ticket_number)} · {String(row.status)}</p>
            <p className="mt-2 text-sm">{String(row.subject)}</p>
            <div className="mt-4">
              <ManagedMediaControl allowReplace={false} entityId={String(row.uuid)} entityType="support-ticket" error={media.mediaError} items={operationalMediaItems(row.media, "support_attachment", "Support attachment")} onRemove={(item) => void media.remove(item)} onUpload={(_purpose, file) => void media.upload("support_attachment", String(row.uuid), file)} progress={media.progress} storage={storage} />
            </div>
            <button className="mt-3 rounded-full bg-leaf-600 px-4 py-2 text-xs font-black text-white" onClick={() => { const body = window.prompt("Reply"); if (body) void operationsApi.supportMessage(token, String(row.uuid), { body, customer_visible: true }).then(load).catch((error) => setMessage(errorOf(error))); }} type="button">Reply</button>
          </div>
        ))}
      </div>
    </Shell>
  );
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

const staffRoles = ["super_admin", "catalog_manager", "product_manager", "order_manager", "inventory_manager", "customer_support", "marketing_manager", "read_only"] as const;
const staffPermissionOptions = [
  "dashboard.view", "dashboard.manage", "users.view", "users.manage", "categories.view", "categories.manage", "brands.view", "brands.manage",
  "products.view", "products.manage", "product_media.manage", "orders.view", "orders.manage", "inventory.view", "inventory.manage",
  "promotions.view", "promotions.manage", "referrals.view", "referrals.manage", "audit.view", "returns.view", "returns.manage",
  "reviews.view", "reviews.moderate", "support.view", "support.manage", "reports.view", "reports.export", "staff.view", "staff.manage", "operations.view", "operations.manage",
  "commerce_settings.view", "commerce_settings.manage", "own_profile.manage", "own_mfa.manage",
];
const staffRoleDefaults: Record<string, string[]> = {
  super_admin: staffPermissionOptions,
  catalog_manager: ["categories.view", "brands.view", "brands.manage", "products.view", "products.manage", "product_media.manage", "own_profile.manage", "own_mfa.manage"],
  product_manager: ["categories.view", "brands.view", "products.view", "products.manage", "product_media.manage", "own_profile.manage", "own_mfa.manage"],
  order_manager: ["orders.view", "orders.manage", "inventory.view", "inventory.manage", "returns.view", "returns.manage", "own_profile.manage", "own_mfa.manage"],
  inventory_manager: ["inventory.view", "inventory.manage", "own_profile.manage", "own_mfa.manage"],
  customer_support: ["users.view", "support.view", "support.manage", "returns.view", "reviews.view", "reviews.moderate", "own_profile.manage", "own_mfa.manage"],
  marketing_manager: ["promotions.view", "promotions.manage", "referrals.view", "referrals.manage", "reports.view", "reports.export", "own_profile.manage", "own_mfa.manage"],
  read_only: ["dashboard.view", "users.view", "categories.view", "brands.view", "products.view", "orders.view", "inventory.view", "promotions.view", "referrals.view", "audit.view", "returns.view", "reviews.view", "support.view", "reports.view", "operations.view", "own_profile.manage", "own_mfa.manage"],
};

function permissionLabel(permission: string) {
  return permission.replaceAll("_", " ").replace(".", " · ");
}

export function StaffAdminPanel({ token }: { token: string }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [sessions, setSessions] = useState<Array<Record<string, unknown>>>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [role, setRole] = useState("read_only");
  const [status, setStatus] = useState("active");
  const [permissions, setPermissions] = useState<string[]>(staffRoleDefaults.read_only);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", password_confirmation: "", staff_role: "read_only", status: "active" });
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [staff, sessionResponse] = await Promise.all([operationsApi.staff(token), operationsApi.staffSessions(token)]);
      setRows(staff.data);
      setSessions(sessionResponse.data);
    } catch (loadError) {
      setError(errorOf(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [token]);

  const choose = (row: Record<string, unknown>) => {
    setSelected(row);
    setRole(String(row.staff_role ?? "read_only"));
    setStatus(String(row.status ?? "active"));
    setPermissions(Array.isArray(row.permissions) ? row.permissions.map(String) : []);
    setResetPassword("");
    setResetConfirmation("");
    setMessage("");
    setError("");
  };

  const togglePermission = (permission: string) => {
    setPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]);
  };

  const createStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); setMessage(""); setError("");
    try {
      await operationsApi.createStaff(token, { ...createForm, staff_permissions: staffRoleDefaults[createForm.staff_role] ?? [] });
      setCreateForm({ name: "", email: "", password: "", password_confirmation: "", staff_role: "read_only", status: "active" });
      setMessage("Administrator created.");
      await load();
    } catch (createError) { setError(errorOf(createError)); }
    finally { setSaving(false); }
  };

  const saveStaff = async () => {
    if (!selected) return;
    setSaving(true); setMessage(""); setError("");
    try {
      await operationsApi.updateStaff(token, Number(selected.id), { staff_role: role, status, staff_permissions: permissions });
      setMessage("Administrator permissions updated.");
      await load();
    } catch (saveError) { setError(errorOf(saveError)); }
    finally { setSaving(false); }
  };

  const resetStaffPassword = async () => {
    if (!selected) return;
    setSaving(true); setMessage(""); setError("");
    try {
      await operationsApi.resetStaffPassword(token, Number(selected.id), { password: resetPassword, password_confirmation: resetConfirmation });
      setResetPassword(""); setResetConfirmation(""); setMessage("Administrator password reset.");
      await load();
    } catch (resetError) { setError(errorOf(resetError)); }
    finally { setSaving(false); }
  };

  return <Shell title="Staff & MFA administration">
    <p className="mt-3 text-sm leading-7 text-neutral-600">Only Super Admins can create administrators, change access, reset passwords, or revoke staff sessions. Passwords and security secrets are never displayed.</p>
    {message ? <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800" role="status">{message}</p> : null}
    {error ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800" role="alert">{error}</p> : null}
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form className="rounded-3xl border border-neutral-200 p-5" onSubmit={createStaff}>
        <h3 className="text-xl font-black">Create administrator</h3>
        <div className="mt-4 grid gap-3">
          {([["name", "Display name", "text"], ["email", "Email address", "email"], ["password", "Password", "password"], ["password_confirmation", "Confirm password", "password"]] as const).map(([key, label, type]) => <label className="grid gap-1" key={key}><span className="text-sm font-bold text-neutral-700">{label}</span><input className="min-h-11 rounded-2xl border border-neutral-200 px-3 outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-500/15" autoComplete={key === "email" ? "username" : key.startsWith("password") ? "new-password" : "name"} required type={type} value={createForm[key]} onChange={(event) => setCreateForm((current) => ({ ...current, [key]: event.target.value }))} /></label>)}
          <label className="grid gap-1"><span className="text-sm font-bold text-neutral-700">Preset role</span><select className="min-h-11 rounded-2xl border border-neutral-200 px-3" value={createForm.staff_role} onChange={(event) => setCreateForm((current) => ({ ...current, staff_role: event.target.value }))}>{staffRoles.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="grid gap-1"><span className="text-sm font-bold text-neutral-700">Status</span><select className="min-h-11 rounded-2xl border border-neutral-200 px-3" value={createForm.status} onChange={(event) => setCreateForm((current) => ({ ...current, status: event.target.value }))}><option value="active">Active</option><option value="disabled">Disabled</option></select></label>
          <button className="min-h-12 rounded-full bg-citrus-500 px-5 text-sm font-black text-white disabled:bg-neutral-300" disabled={saving} type="submit">{saving ? "Saving..." : "Create administrator"}</button>
        </div>
      </form>
      <div className="rounded-3xl border border-neutral-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-black">Administrator accounts</h3><p className="mt-1 text-sm text-neutral-500">{loading ? "Loading accounts..." : `${rows.length} administrator${rows.length === 1 ? "" : "s"}`}</p></div><button className="rounded-full border px-4 py-2 text-sm font-black" onClick={() => void load()} type="button">Refresh</button></div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-200"><table className="min-w-[900px] w-full border-collapse text-left text-sm"><thead className="bg-neutral-50"><tr><th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Administrator</th><th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Role</th><th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Status</th><th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-neutral-500">MFA</th><th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Last login</th><th className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Access</th><th className="px-4 py-3 text-right text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Action</th></tr></thead><tbody>{loading ? <tr><td className="px-4 py-6 text-neutral-500" colSpan={7}>Loading administrator accounts...</td></tr> : rows.length === 0 ? <tr><td className="px-4 py-6 text-neutral-500" colSpan={7}>No administrator accounts found.</td></tr> : rows.map((row) => <tr className={`border-t border-neutral-100 ${selected?.id === row.id ? "bg-orange-50" : "bg-white"}`} key={String(row.id)}><td className="px-4 py-3"><strong className="block">{String(row.name)}</strong><span className="block break-all text-xs text-neutral-500">{String(row.email)}</span></td><td className="px-4 py-3 font-semibold">{String(row.staff_role)}</td><td className="px-4 py-3"><span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-black">{String(row.status)}</span></td><td className="px-4 py-3">{row.mfa_enabled ? "Enabled" : "Not enabled"}</td><td className="px-4 py-3 text-neutral-600">{row.last_login_at ? String(row.last_login_at) : "Not yet"}</td><td className="px-4 py-3">{String(row.permission_count ?? 0)} permissions</td><td className="px-4 py-3 text-right"><button className="rounded-full border border-leaf-500 px-3 py-2 text-xs font-black text-leaf-700" onClick={() => choose(row)} type="button">Edit</button></td></tr>)}</tbody></table></div>
      </div>
    </div>
    {selected ? <div className="mt-6 grid gap-6 rounded-3xl border border-neutral-200 p-5 xl:grid-cols-[1fr_0.8fr]">
      <div><h3 className="text-xl font-black">Edit {String(selected.name)}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="grid gap-1"><span className="text-sm font-bold text-neutral-700">Preset role</span><select className="min-h-11 rounded-2xl border px-3" value={role} onChange={(event) => { setRole(event.target.value); setPermissions(staffRoleDefaults[event.target.value] ?? []); }}>{staffRoles.map((item) => <option key={item}>{item}</option>)}</select></label><label className="grid gap-1"><span className="text-sm font-bold text-neutral-700">Status</span><select className="min-h-11 rounded-2xl border px-3" value={status} onChange={(event) => setStatus(event.target.value)}><option value="active">Active</option><option value="disabled">Disabled</option></select></label></div><div className="mt-4 grid max-h-72 gap-2 overflow-y-auto rounded-2xl bg-neutral-50 p-3 sm:grid-cols-2">{staffPermissionOptions.map((permission) => <label className="flex min-h-9 items-center gap-2 text-sm" key={permission}><input checked={permissions.includes(permission)} onChange={() => togglePermission(permission)} type="checkbox" /><span>{permissionLabel(permission)}</span></label>)}</div><button className="mt-4 rounded-full bg-leaf-600 px-5 py-3 text-sm font-black text-white disabled:bg-neutral-300" disabled={saving} onClick={() => void saveStaff()} type="button">Save role and permissions</button></div>
      <form className="rounded-2xl bg-neutral-50 p-4" onSubmit={(event) => { event.preventDefault(); void resetStaffPassword(); }}><h3 className="font-black">Reset password</h3><p className="mt-1 text-sm text-neutral-600">All active sessions for this administrator will be revoked.</p><div className="mt-3 grid gap-3"><input className="min-h-11 rounded-2xl border px-3" autoComplete="new-password" minLength={10} placeholder="New password" required type="password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} /><input className="min-h-11 rounded-2xl border px-3" autoComplete="new-password" minLength={10} placeholder="Confirm new password" required type="password" value={resetConfirmation} onChange={(event) => setResetConfirmation(event.target.value)} /><button className="rounded-full border border-leaf-500 px-4 py-3 text-sm font-black text-leaf-700 disabled:opacity-50" disabled={saving} type="submit">Reset password</button></div></form>
    </div> : null}
    <div className="mt-6 rounded-3xl border border-neutral-200 p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="text-xl font-black">Active staff sessions</h3><p className="mt-1 text-sm text-neutral-500">Session identifiers are never shown.</p></div><button className="rounded-full border px-4 py-2 text-sm font-black" onClick={() => void load()} type="button">Refresh</button></div><div className="mt-4 grid gap-3">{sessions.map((session) => <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-4" key={String(session.id)}><span><strong>{String(session.admin_name ?? "Administrator")}</strong><span className="ml-2 text-sm text-neutral-500">{String(session.admin_email ?? "")}</span><small className="mt-1 block text-xs text-neutral-500">Expires {String(session.expires_at ?? "Not set")}</small></span><button className="rounded-full border border-rose-300 px-3 py-2 text-xs font-black text-rose-700" onClick={() => void operationsApi.revokeStaffSession(token, Number(session.id)).then(load).catch((sessionError) => setError(errorOf(sessionError)))} type="button">Revoke</button></div>)}{!loading && sessions.length === 0 ? <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">No active staff sessions.</p> : null}</div></div>
  </Shell>;
}

export function OperationsAdminPanel({ token }: { token: string }) {
  const [isReady, setIsReady] = useState<boolean | null>(null);
  const [jobs, setJobs] = useState<Array<{ uuid: string; failed_at: string }>>([]);
  const [message, setMessage] = useState("");
  const loadJobs = () => operationsApi.failedJobs(token).then((result) => setJobs(result.data.map((job) => ({ uuid: job.uuid, failed_at: job.failed_at })))).catch((error) => setMessage(errorOf(error)));
  useEffect(() => { void operationsApi.operations(token).then(() => setIsReady(true)).catch(() => setIsReady(false)); void loadJobs(); }, [token]);
  return <Shell title="System health"><p className="mt-3 text-sm text-neutral-600">Review service readiness and retry background tasks that need attention.</p><div className={`mt-6 rounded-2xl border p-5 ${isReady === false ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}><p className="font-black">{isReady === null ? "Checking services..." : isReady ? "Services are responding" : "Some services need attention"}</p><p className="mt-2 text-sm text-neutral-600">{isReady === false ? "Try again shortly or contact an authorized site administrator." : "Operational checks completed without exposing private configuration."}</p></div><div className="mt-6 rounded-2xl border border-neutral-200 p-4"><p className="font-black">Tasks needing attention ({jobs.length})</p>{message ? <p className="mt-2 text-sm text-red-700">{message}</p> : null}{jobs.length ? jobs.map((job) => <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3" key={job.uuid}><span className="text-xs"><strong>Background task</strong> · {new Date(job.failed_at).toLocaleString()}</span><button className="rounded-full border border-leaf-500 px-3 py-2 text-xs font-black text-leaf-700" onClick={() => void operationsApi.retryFailedJob(token, job.uuid).then(loadJobs).catch((error) => setMessage(errorOf(error)))} type="button">Retry</button></div>) : <p className="mt-2 text-sm text-neutral-500">No tasks need attention.</p>}</div></Shell>;
}
