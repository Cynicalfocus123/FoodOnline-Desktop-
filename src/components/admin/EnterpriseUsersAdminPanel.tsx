import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { AdminUserRecord } from "../../data/admin";
import type { SignupRoleKey } from "../../lib/registerSchema";
import { toUserFacingErrorMessage } from "../../lib/userFacingError";
import { usersApi, type ManagedUser } from "../../services/admin/usersApi";
import { AdminListPage, exportCsv } from "./AdminListPage";

const plural: Record<SignupRoleKey, string> = { customer: "customers", supplier: "suppliers", partner: "partners" };
const labels: Record<SignupRoleKey, string> = { customer: "Customer", supplier: "Supplier", partner: "Partner" };
const empty = { email: "", first_name: "", last_name: "", contact_number: "", line_id: "", company_name: "", business_type: "", status: "active", password: "" };
const optionalValue = (value: string) => value.trim() || null;
const addressFieldLabel = (field: string) => field.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());

type Props = {
  token: string;
  role: SignupRoleKey;
  users: AdminUserRecord[];
  loading: boolean;
  mode?: "list" | "create" | "edit";
  recordId?: string | null;
  onChangeRole: (role: SignupRoleKey) => void;
  onNavigate: (path: string, replace?: boolean) => void;
  onReload: () => Promise<void>;
};

export function EnterpriseUsersAdminPanel({ token, role, users, loading, mode = "list", recordId, onChangeRole, onNavigate, onReload }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const userLoadVersion = useRef(0);

  useEffect(() => {
    const requestVersion = ++userLoadVersion.current;
    setEditing(null);
    if (mode === "create") {
      setForm(empty);
      setMessage("");
      return;
    }
    if (mode !== "edit" || !recordId) return;
    setMessage("");
    void usersApi.show(token, recordId).then(({ user }) => {
      if (requestVersion !== userLoadVersion.current) return;
      setEditing(user);
      setForm({ email: user.email, first_name: user.first_name ?? "", last_name: user.last_name ?? "", contact_number: user.contact_number ?? "", line_id: user.line_id ?? "", company_name: user.company_name ?? "", business_type: user.business_type ?? "", status: user.status, password: "" });
    }).catch((error) => {
      if (requestVersion === userLoadVersion.current) setMessage(toUserFacingErrorMessage(error, "Unable to load this user."));
    });
    return () => { userLoadVersion.current += 1; };
  }, [mode, recordId, token]);

  const filtered = useMemo(() => users
    .filter((user) => (!status || (status === "active" ? user.requestStatus === "approved" : status === "disabled" ? user.requestStatus === "disabled" : user.requestStatus === "in_review")) && `${user.emailAddress} ${user.firstName} ${user.lastName} ${user.companyName}`.toLowerCase().includes(search.toLowerCase()))
    .sort((left, right) => sort === "name" ? `${left.firstName} ${left.lastName}`.localeCompare(`${right.firstName} ${right.lastName}`) : sort === "oldest" ? left.createdTimestamp.localeCompare(right.createdTimestamp) : right.createdTimestamp.localeCompare(left.createdTimestamp)), [users, search, status, sort]);
  const pageSize = 20;
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allSelected = pageItems.length > 0 && pageItems.every((user) => selectedIds.has(user.id));

  async function bulk(action: "publish" | "archive" | "delete") {
    const targets = users.filter((user) => selectedIds.has(user.id));
    if (!targets.length || !window.confirm(`${action[0].toUpperCase() + action.slice(1)} ${targets.length} selected ${plural[role]}?`)) return;
    try {
      for (const user of targets) {
        if (action === "publish") await usersApi.save(token, user.id, { status: "active" });
        else await usersApi.archive(token, user.id);
      }
      setSelectedIds(new Set());
      await onReload();
    } catch (error) {
      setMessage(toUserFacingErrorMessage(error, "Unable to update the selected users."));
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await usersApi.save(token, editing?.id ?? null, { ...form, account_type: role, line_id: optionalValue(form.line_id), company_name: optionalValue(form.company_name), password: form.password || undefined });
      setEditing(response.user);
      setForm((current) => ({ ...current, password: "" }));
      await onReload();
      setMessage(`${labels[role]} saved.`);
      if (mode === "create") onNavigate(`/admin/${plural[role]}/${response.user.id}/edit`, true);
    } catch (error) {
      setMessage(toUserFacingErrorMessage(error, `Unable to save this ${labels[role].toLowerCase()}.`));
    } finally {
      setSaving(false);
    }
  }

  if (mode === "list") {
    return <AdminListPage bulkActions={[{ label: "Bulk delete", tone: "danger", onClick: () => void bulk("delete") }, { label: "Bulk publish", onClick: () => void bulk("publish") }, { label: "Bulk archive", onClick: () => void bulk("archive") }]} count={filtered.length} createLabel={`Create ${labels[role]}`} description={`Manage ${plural[role]} in a dedicated list with lifecycle, export, and bulk controls.`} filters={<div className="flex flex-wrap gap-2"><div className="flex flex-wrap gap-2">{(["customer", "supplier", "partner"] as SignupRoleKey[]).map((value) => <button className={`min-h-10 rounded-full px-4 text-xs font-black ${role === value ? "bg-citrus-500 text-white" : "bg-neutral-100 text-neutral-700"}`} key={value} onClick={() => onChangeRole(value)} type="button">{plural[value][0].toUpperCase() + plural[value].slice(1)}</button>)}</div><select className="min-h-10 rounded-xl border border-neutral-200 px-4 text-sm font-bold" onChange={(event) => setStatus(event.target.value)} value={status}><option value="">All statuses</option><option value="active">Published</option><option value="in_review">In review</option><option value="disabled">Archived</option></select></div>} onCreate={() => onNavigate(`/admin/${plural[role]}/create`)} onExport={() => exportCsv(`${plural[role]}.csv`, filtered.map((user) => ({ email: user.emailAddress, first_name: user.firstName, last_name: user.lastName, phone: user.contactNumber, company: user.companyName, status: user.requestStatus, created: user.createdTimestamp })))} onPage={setPage} onSearch={setSearch} onSort={setSort} page={page} pageSize={pageSize} search={search} selectedCount={selectedIds.size} sort={sort} sortOptions={[{ value: "newest", label: "Sort: Newest" }, { value: "oldest", label: "Sort: Oldest" }, { value: "name", label: "Sort: Name" }]} title={plural[role][0].toUpperCase() + plural[role].slice(1)} total={filtered.length}><table className="min-w-[1050px] w-full text-left text-sm"><thead className="bg-neutral-50"><tr>{["", "User", "Contact", "Company", "Status", "Source", "Created", "Updated", ""].map((header, index) => <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.14em] text-neutral-500" key={`${header}-${index}`}>{index === 0 ? <input aria-label="Select page" checked={allSelected} onChange={() => setSelectedIds((current) => { const next = new Set(current); pageItems.forEach((user) => allSelected ? next.delete(user.id) : next.add(user.id)); return next; })} type="checkbox" /> : header}</th>)}</tr></thead><tbody>{loading ? <tr><td className="px-4 py-10 text-center" colSpan={9}>Loading users…</td></tr> : pageItems.map((user) => <tr className="border-t border-neutral-100 hover:bg-orange-50/30" key={user.id}><td className="px-4 py-4"><input aria-label={`Select ${user.emailAddress}`} checked={selectedIds.has(user.id)} onChange={() => setSelectedIds((current) => { const next = new Set(current); next.has(user.id) ? next.delete(user.id) : next.add(user.id); return next; })} type="checkbox" /></td><td className="px-4 py-4"><button className="font-black hover:text-citrus-600" onClick={() => onNavigate(`/admin/${plural[role]}/${user.id}/edit`)} type="button">{user.firstName || user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.emailAddress}</button><p className="mt-1 text-xs text-neutral-500">{user.emailAddress}</p></td><td className="px-4 py-4">{user.contactNumber || "—"}<br /><span className="text-xs text-neutral-500">{user.lineId || "No Line ID"}</span></td><td className="px-4 py-4">{user.companyName || "—"}</td><td className="px-4 py-4 capitalize">{user.requestStatus.replaceAll("_", " ")}</td><td className="px-4 py-4">{user.sourceLabel}</td><td className="px-4 py-4">{new Date(user.createdTimestamp).toLocaleString()}</td><td className="px-4 py-4">{user.reviewedAt ? new Date(user.reviewedAt).toLocaleString() : "—"}</td><td className="px-4 py-4"><button className="font-black text-leaf-700" onClick={() => onNavigate(`/admin/${plural[role]}/${user.id}/edit`)} type="button">Edit</button></td></tr>)}</tbody></table></AdminListPage>;
  }

  return <form className="grid gap-6 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-8" onSubmit={save}><button className="w-fit text-sm font-black text-leaf-700" onClick={() => onNavigate(`/admin/${plural[role]}`)} type="button">← {plural[role][0].toUpperCase() + plural[role].slice(1)}</button><div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-citrus-500">{editing ? `Edit ${labels[role].toLowerCase()}` : `Create ${labels[role].toLowerCase()}`}</p><h2 className="mt-2 text-3xl font-black">{editing ? `${editing.first_name ?? ""} ${editing.last_name ?? ""}`.trim() || editing.email : `Create ${labels[role]}`}</h2></div><div className="flex flex-wrap gap-2"><button className="rounded-2xl bg-citrus-500 px-5 py-3 text-sm font-black text-white disabled:opacity-50" disabled={saving} type="submit">{saving ? "Saving…" : "Save"}</button><button className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-black" disabled={saving} type="submit">Save &amp; Continue</button>{editing ? <button className="rounded-2xl border border-rose-200 px-5 py-3 text-sm font-black text-rose-700" onClick={() => { if (window.confirm(`Delete this ${labels[role].toLowerCase()}? Existing commerce history will be preserved.`)) void usersApi.archive(token, editing.id).then(() => onNavigate(`/admin/${plural[role]}`)); }} type="button">Delete</button> : null}</div></div>{message ? <p aria-live="polite" className="rounded-2xl bg-neutral-50 p-3 text-sm" role="status">{message}</p> : null}<section className="grid gap-4 rounded-2xl border border-neutral-200 p-5 md:grid-cols-2">{[["email", "Email", "email"], ["first_name", "First name", "text"], ["last_name", "Last name", "text"], ["contact_number", "Contact number", "tel"], ["line_id", "LINE ID (optional)", "text"], ["company_name", "Company name (optional)", "text"], ["business_type", "Business type", "text"], ["password", editing ? "New password (optional)" : "Password", "password"]].map(([key, label, type]) => <label className="grid gap-2 text-sm font-bold" key={key}>{label}<input className="min-h-12 rounded-xl border border-neutral-200 px-4 text-base" onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} required={key === "email" || (!editing && key === "password")} type={type} value={form[key as keyof typeof form]} /></label>)}<label className="grid gap-2 text-sm font-bold">Publication<select className="min-h-12 rounded-xl border border-neutral-200 px-4" onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} value={form.status}><option value="active">Published</option><option value="in_review">In review</option><option value="disabled">Archived</option></select></label></section>{role === "customer" && editing ? <section className="grid gap-4 rounded-2xl border border-neutral-200 p-5"><div><p className="text-sm font-black uppercase tracking-[0.16em] text-citrus-500">Customer addresses</p><h3 className="mt-2 text-xl font-black">Address book</h3></div>{editing.addresses?.length ? <div className="grid gap-3 lg:grid-cols-2">{editing.addresses.map((address) => <article className="min-w-0 rounded-2xl border border-neutral-200 bg-neutral-50 p-4" key={address.id}><div className="flex flex-wrap items-start justify-between gap-2"><p className="font-black text-neutral-950">{address.address_values.fullName || "Saved address"}</p>{address.is_default ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-leaf-700">Default</span> : null}</div><p className="mt-2 break-words text-sm leading-6 text-neutral-700">{address.summary || "Address details unavailable."}</p><dl className="mt-3 grid gap-2 border-t border-neutral-200 pt-3 text-sm">{Object.entries(address.address_values).filter(([, value]) => value?.trim()).map(([field, value]) => <div className="grid gap-0.5 sm:grid-cols-[9rem_1fr]" key={field}><dt className="font-bold text-neutral-500">{addressFieldLabel(field)}</dt><dd className="min-w-0 break-words text-neutral-800">{value}</dd></div>)}</dl></article>)}</div> : <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">This customer has no saved addresses.</p>}</section> : null}</form>;
}
