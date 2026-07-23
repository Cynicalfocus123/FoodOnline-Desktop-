import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ApiError } from "../../lib/apiClient";
import { toUserFacingErrorMessage } from "../../lib/userFacingError";
import { adminReferralsApi, type AdminReferral, type ReferralListMeta, type ReferralProgram } from "../../services/admin/referralsApi";

type LoadState = "loading" | "ready" | "error";

const emptyMeta: ReferralListMeta = { current_page: 1, last_page: 1, total: 0 };
const statusOptions = ["", "registered", "active", "completed", "under_review", "disqualified"];
const reviewOptions = ["", "clear", "under_review", "disqualified"];
const moneyFields = ["referrer_first_reward_minor", "referrer_second_reward_minor", "referee_first_discount_minor", "referee_second_discount_minor", "minimum_order_subtotal_minor"] as const;
const dayFields = ["first_order_deadline_days", "second_order_deadline_days", "reward_expiration_days"] as const;

function userMessage(error: unknown, fallback: string) {
  return toUserFacingErrorMessage(error, fallback);
}

function titleCase(value: string | null | undefined) {
  return (value || "—").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusBadge({ value }: { value: string | null | undefined }) {
  return <span className="inline-flex rounded-full bg-leaf-50 px-3 py-1 text-xs font-black text-leaf-800">{titleCase(value)}</span>;
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><p className="text-2xl font-black text-ink">{value}</p><p className="mt-1 text-xs font-bold text-neutral-500">{label}</p></div>;
}

export function ReferralAdminPanel({ token, recordId, settings, onNavigate }: { token: string; recordId: string | null; settings: boolean; onNavigate: (path: string) => void }) {
  if (settings) return <ReferralSettings token={token} />;
  if (recordId) return <ReferralDetail onNavigate={onNavigate} recordId={recordId} token={token} />;
  return <ReferralList onNavigate={onNavigate} token={token} />;
}

function ReferralList({ token, onNavigate }: { token: string; onNavigate: (path: string) => void }) {
  const [items, setItems] = useState<AdminReferral[]>([]);
  const [meta, setMeta] = useState<ReferralListMeta>(emptyMeta);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setState("loading");
    setMessage(null);
    try {
      const response = await adminReferralsApi.list(token, { page, perPage: 25, search, status, reviewStatus });
      setItems(response.data);
      setMeta(response.meta);
      setSummary(response.summary);
      setState("ready");
    } catch (error) {
      setMessage(userMessage(error, "We couldn't load referrals. Please retry."));
      setState("error");
    }
  }, [page, reviewStatus, search, status, token]);

  useEffect(() => { void load(); }, [load]);

  const filtered = Boolean(search || status || reviewStatus);
  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sm font-black uppercase tracking-[0.16em] text-citrus-500">Referrals</p><h2 className="mt-2 text-2xl font-black text-ink">Referral operations</h2><p className="mt-2 text-sm text-neutral-600">Review registration, qualification, rewards, and safe account-bound coupon status.</p></div>
      <button className="min-h-11 rounded-full border border-leaf-500 px-4 text-sm font-black text-leaf-700" onClick={() => onNavigate("/admin/referral-settings")} type="button">Settings</button>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Registered" value={summary.registered ?? 0} /><SummaryCard label="Qualified" value={summary.active ?? 0} /><SummaryCard label="Completed" value={summary.completed ?? 0} /><SummaryCard label="Under review" value={summary.under_review ?? 0} />
    </div>
    <form className="mt-6 grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]" noValidate onSubmit={applyFilters}>
      <label className="grid gap-1 text-sm font-bold text-neutral-700"><span className="sr-only">Search referrals</span><input className="min-h-11 rounded-xl border border-neutral-200 bg-white px-3" onChange={(event) => setSearchInput(event.target.value)} placeholder="Search referrer or friend" value={searchInput} /></label>
      <label className="grid gap-1 text-sm font-bold text-neutral-700"><span className="sr-only">Referral status</span><select className="min-h-11 rounded-xl border border-neutral-200 bg-white px-3" onChange={(event) => { setStatus(event.target.value); setPage(1); }} value={status}>{statusOptions.map((value) => <option key={value} value={value}>{value ? titleCase(value) : "All statuses"}</option>)}</select></label>
      <label className="grid gap-1 text-sm font-bold text-neutral-700"><span className="sr-only">Review status</span><select className="min-h-11 rounded-xl border border-neutral-200 bg-white px-3" onChange={(event) => { setReviewStatus(event.target.value); setPage(1); }} value={reviewStatus}>{reviewOptions.map((value) => <option key={value} value={value}>{value ? titleCase(value) : "All review states"}</option>)}</select></label>
      <button className="min-h-11 rounded-full bg-citrus-500 px-5 text-sm font-black text-white" type="submit">Apply</button>
    </form>
    {state === "error" ? <RetryNotice message={message ?? "We couldn't load referrals. Please retry."} onRetry={load} /> : null}
    {state === "loading" ? <p className="mt-6 text-sm font-semibold text-neutral-600">Loading referral operations…</p> : null}
    {state === "ready" ? <><div className="mt-6 overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead><tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500"><th className="p-3">Referrer</th><th className="p-3">Friend</th><th className="p-3">Code</th><th className="p-3">Status</th><th className="p-3">Registered</th></tr></thead><tbody>{items.map((item) => <tr className="cursor-pointer border-b border-neutral-100 transition hover:bg-neutral-50" key={item.id} onClick={() => onNavigate("/admin/referrals/" + item.id)}><td className="p-3 font-semibold text-ink">{item.referrer.name || "Customer"}<span className="mt-1 block text-xs font-medium text-neutral-500">{item.referrer.email}</span></td><td className="p-3">{item.referred.name || "Customer"}<span className="mt-1 block text-xs text-neutral-500">{item.referred.email}</span></td><td className="p-3 font-mono text-xs font-bold text-neutral-700">{item.code || "—"}</td><td className="p-3"><StatusBadge value={item.status} /></td><td className="p-3 text-neutral-600">{item.registered_at ? new Date(item.registered_at).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div>{!items.length ? <p className="mt-6 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">{filtered ? "No referrals match the selected filters." : "No referrals found."}</p> : null}<Pagination meta={meta} onPage={setPage} /></> : null}
  </section>;
}

function Pagination({ meta, onPage }: { meta: ReferralListMeta; onPage: (page: number) => void }) {
  if (meta.last_page <= 1) return null;
  return <div className="mt-5 flex items-center justify-between gap-3 text-sm"><p className="text-neutral-600">Page {meta.current_page} of {meta.last_page} · {meta.total} total</p><div className="flex gap-2"><button className="min-h-10 rounded-full border border-neutral-200 px-4 font-black disabled:cursor-not-allowed disabled:opacity-40" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)} type="button">Previous</button><button className="min-h-10 rounded-full border border-neutral-200 px-4 font-black disabled:cursor-not-allowed disabled:opacity-40" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)} type="button">Next</button></div></div>;
}

function ReferralDetail({ token, recordId, onNavigate }: { token: string; recordId: string; onNavigate: (path: string) => void }) {
  const [referral, setReferral] = useState<AdminReferral | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const load = useCallback(async () => { setState("loading"); setMessage(null); try { const response = await adminReferralsApi.show(token, recordId); setReferral(response.referral); setState("ready"); } catch (error) { setMessage(userMessage(error, "We couldn't load this referral. Please retry.")); setState("error"); } }, [recordId, token]);
  useEffect(() => { void load(); }, [load]);
  const action = async (name: string, rewardId?: string) => { if (!referral || isSaving) return; setIsSaving(true); setMessage(null); try { const response = await adminReferralsApi.action(token, referral.id, { action: name, reward_id: rewardId }); setReferral(response.referral); setMessage("Referral updated."); } catch (error) { setMessage(userMessage(error, "We couldn't update this referral. Please retry.")); } finally { setIsSaving(false); } };
  return <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-6"><button className="min-h-11 rounded-full px-2 text-sm font-black text-leaf-700 hover:bg-leaf-50" onClick={() => onNavigate("/admin/referrals")} type="button">← Referrals</button>{state === "loading" ? <p className="mt-5 text-sm text-neutral-600">Loading referral…</p> : null}{state === "error" ? <RetryNotice message={message ?? "We couldn't load this referral. Please retry."} onRetry={load} /> : null}{state === "ready" && referral ? <><div className="mt-4 flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-black uppercase tracking-[0.16em] text-citrus-500">Referral detail</p><h2 className="mt-2 text-2xl font-black text-ink">{referral.referrer.name || "Customer"} → {referral.referred.name || "Customer"}</h2><p className="mt-2 text-sm text-neutral-600">Code {referral.code || "—"} · Registered {referral.registered_at ? new Date(referral.registered_at).toLocaleString() : "—"}</p></div><StatusBadge value={referral.status} /></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><DetailValue label="Referrer" value={referral.referrer.email || referral.referrer.name || "—"} /><DetailValue label="Friend" value={referral.referred.email || referral.referred.name || "—"} /><DetailValue label="Review status" value={titleCase(referral.review_status)} /><DetailValue label="Qualification" value={referral.second_qualified_at ? "Second qualifying order complete" : referral.first_qualified_at ? "First qualifying order complete" : "Awaiting qualifying order"} /></div>{referral.disqualification_reason ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Review note: {referral.disqualification_reason}</p> : null}<div className="mt-6 flex flex-wrap gap-2">{["review", "approve", "disqualify", "restore", "disable_code"].map((name) => <button className="min-h-10 rounded-full border border-neutral-200 px-4 text-xs font-black text-neutral-700 disabled:opacity-50" disabled={isSaving} key={name} onClick={() => void action(name)} type="button">{titleCase(name)}</button>)}</div><section className="mt-7"><h3 className="text-lg font-black text-ink">Rewards and coupons</h3><div className="mt-3 grid gap-3">{referral.rewards.map((reward) => <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4" key={reward.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black text-ink">{titleCase(reward.milestone)}</p><p className="mt-1 text-sm text-neutral-600">{reward.coupon_code || "Coupon not available"}</p></div><StatusBadge value={reward.status} /></div><p className="mt-3 text-xs text-neutral-500">Expires {reward.expires_at ? new Date(reward.expires_at).toLocaleDateString() : "—"}</p>{reward.status === "issued" ? <button className="mt-3 min-h-10 rounded-full border border-red-200 px-4 text-xs font-black text-red-700 disabled:opacity-50" disabled={isSaving} onClick={() => void action("revoke_reward", reward.id)} type="button">Revoke coupon</button> : null}</article>)}{!referral.rewards.length ? <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">No rewards have been issued for this referral.</p> : null}</div></section>{message ? <p aria-live="polite" className="mt-5 text-sm font-semibold text-neutral-700">{message}</p> : null}</> : null}</section>;
}

function DetailValue({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-neutral-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-neutral-500">{label}</p><p className="mt-2 break-words text-sm font-semibold text-ink">{value}</p></div>; }

function ReferralSettings({ token }: { token: string }) {
  const [program, setProgram] = useState<ReferralProgram | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const load = useCallback(async () => { setState("loading"); setMessage(null); try { const response = await adminReferralsApi.settings(token); setProgram(response.program); setState("ready"); } catch (error) { setMessage(userMessage(error, "We couldn't load referral settings. Please retry.")); setState("error"); } }, [token]);
  useEffect(() => { void load(); }, [load]);
  const validationMessage = useMemo(() => message && state !== "error" ? message : null, [message, state]);
  const save = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!program || isSaving) return; setIsSaving(true); setMessage(null); try { const response = await adminReferralsApi.saveSettings(token, program); setProgram(response.program); setMessage("Referral settings saved."); } catch (error) { const fieldError = error instanceof ApiError ? Object.values(error.fieldErrors)[0]?.[0] : null; setMessage(fieldError || userMessage(error, "We couldn't save referral settings. Please retry.")); } finally { setIsSaving(false); } };
  const update = (key: keyof ReferralProgram, value: unknown) => setProgram((current) => current ? { ...current, [key]: value } : current);
  return <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-6"><p className="text-sm font-black uppercase tracking-[0.16em] text-citrus-500">Referrals</p><h2 className="mt-2 text-2xl font-black text-ink">Referral settings</h2><p className="mt-2 text-sm text-neutral-600">Changes apply to the existing referral program and are recorded in the administrator audit log.</p>{state === "loading" ? <p className="mt-6 text-sm text-neutral-600">Loading settings…</p> : null}{state === "error" ? <RetryNotice message={message ?? "We couldn't load referral settings. Please retry."} onRetry={load} /> : null}{state === "ready" && !program ? <p className="mt-6 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">Referral settings are not available yet.</p> : null}{state === "ready" && program ? <form className="mt-6 grid gap-5" noValidate onSubmit={save}><div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1 text-sm font-bold text-neutral-700">Program status<select className="min-h-11 rounded-xl border border-neutral-200 px-3" onChange={(event) => update("status", event.target.value)} value={String(program.status ?? "draft")}><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option><option value="ended">Ended</option></select></label><label className="grid gap-1 text-sm font-bold text-neutral-700">Currency<input className="min-h-11 rounded-xl border border-neutral-200 px-3 uppercase" maxLength={3} onChange={(event) => update("currency_code", event.target.value.toUpperCase())} value={String(program.currency_code ?? "")} /></label>{moneyFields.map((key) => <label className="grid gap-1 text-sm font-bold text-neutral-700" key={key}>{titleCase(key)}<input className="min-h-11 rounded-xl border border-neutral-200 px-3" min="0" onChange={(event) => update(key, Number(event.target.value))} type="number" value={String(program[key] ?? 0)} /></label>)}{dayFields.map((key) => <label className="grid gap-1 text-sm font-bold text-neutral-700" key={key}>{titleCase(key)}<input className="min-h-11 rounded-xl border border-neutral-200 px-3" min="1" onChange={(event) => update(key, Number(event.target.value))} type="number" value={String(program[key] ?? 1)} /></label>)}</div><label className="flex min-h-11 items-center gap-3 text-sm font-bold text-neutral-700"><input checked={Boolean(program.manual_code_entry_enabled)} onChange={(event) => update("manual_code_entry_enabled", event.target.checked)} type="checkbox" />Allow referral-code entry during customer registration</label><button className="min-h-11 w-fit rounded-full bg-citrus-500 px-5 text-sm font-black text-white disabled:opacity-50" disabled={isSaving} type="submit">{isSaving ? "Saving…" : "Save settings"}</button>{validationMessage ? <p aria-live="polite" className="text-sm font-semibold text-neutral-700">{validationMessage}</p> : null}</form> : null}</section>;
}

function RetryNotice({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-semibold text-amber-950">{message}</p><button className="mt-3 min-h-10 rounded-full border border-amber-300 px-4 text-sm font-black text-amber-900" onClick={() => void onRetry()} type="button">Retry</button></div>; }
