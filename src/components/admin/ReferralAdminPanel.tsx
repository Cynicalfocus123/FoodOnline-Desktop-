import { useEffect, useState } from "react";
import { adminReferralsApi, type AdminReferral, type ReferralProgram } from "../../services/admin/referralsApi";

export function ReferralAdminPanel({ token, recordId, settings, onNavigate }: { token: string; recordId: string | null; settings: boolean; onNavigate: (path: string) => void }) {
  const [items, setItems] = useState<AdminReferral[]>([]);
  const [selected, setSelected] = useState<AdminReferral | null>(null);
  const [program, setProgram] = useState<ReferralProgram | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (settings) { adminReferralsApi.settings(token).then((response) => setProgram(response.program)).catch(() => setMessage("Unable to load referral settings.")); return; }
    if (recordId) { adminReferralsApi.show(token, recordId).then((response) => setSelected(response.referral)).catch(() => setMessage("Referral record was not found.")); return; }
    adminReferralsApi.list(token).then((response) => setItems(response.data)).catch(() => setMessage("Unable to load referrals."));
  }, [recordId, settings, token]);
  const action = async (name: string, rewardId?: string) => {
    if (!selected) return;
    const response = await adminReferralsApi.action(token, selected.id, { action: name, reward_id: rewardId });
    setSelected(response.referral);
    setMessage("Referral updated.");
  };
  const save = async () => {
    if (!program) return;
    const response = await adminReferralsApi.saveSettings(token, program);
    setProgram(response.program);
    setMessage("Referral settings saved.");
  };
  if (settings) return <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-soft"><p className="text-sm font-black uppercase tracking-[0.16em] text-citrus-500">Referrals</p><h2 className="mt-2 text-2xl font-black text-ink">Referral settings</h2>{program ? <div className="mt-6 grid gap-4 md:grid-cols-2">{["referrer_first_reward_minor", "referrer_second_reward_minor", "referee_first_discount_minor", "referee_second_discount_minor", "minimum_order_subtotal_minor", "first_order_deadline_days", "second_order_deadline_days", "reward_expiration_days"].map((key) => <label className="grid gap-1 text-sm font-bold text-neutral-700" key={key}>{key.replaceAll("_", " ")}<input className="min-h-11 rounded-xl border border-neutral-200 px-3" onChange={(event) => setProgram({ ...program, [key]: Number(event.target.value) })} type="number" value={String(program[key] ?? 0)} /></label>)}</div> : <p className="mt-4 text-sm text-neutral-600">Loading settings…</p>}<button className="mt-6 min-h-11 rounded-full bg-citrus-500 px-5 text-sm font-black text-white" onClick={() => void save()} type="button">Save settings</button>{message ? <p className="mt-3 text-sm font-semibold text-neutral-600">{message}</p> : null}</section>;
  if (recordId) return <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-soft"><button className="text-sm font-black text-leaf-700" onClick={() => onNavigate("/admin/referrals")} type="button">← Referrals</button>{selected ? <><h2 className="mt-4 text-2xl font-black text-ink">Referral detail</h2><p className="mt-2 text-sm text-neutral-600">{selected.referrer.name} → {selected.referred.name} · {selected.code}</p><div className="mt-5 flex flex-wrap gap-2">{["review", "approve", "disqualify", "restore", "disable_code"].map((name) => <button className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-black text-neutral-700" key={name} onClick={() => void action(name)} type="button">{name.replaceAll("_", " ")}</button>)}</div><div className="mt-6 grid gap-3">{selected.rewards.map((reward) => <div className="rounded-2xl bg-neutral-50 p-4" key={reward.id}><p className="font-bold text-ink">{reward.milestone} · {reward.status}</p><p className="mt-1 text-sm text-neutral-600">{reward.coupon_code ?? "No coupon code"}</p>{reward.status === "issued" ? <button className="mt-3 text-xs font-black text-red-700" onClick={() => void action("revoke_reward", reward.id)} type="button">Revoke coupon</button> : null}</div>)}</div></> : <p className="mt-5 text-sm text-neutral-600">{message ?? "Loading referral…"}</p>}</section>;
  return <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-soft"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-black uppercase tracking-[0.16em] text-citrus-500">Referrals</p><h2 className="mt-2 text-2xl font-black text-ink">Referral operations</h2></div><button className="rounded-full border border-leaf-500 px-4 py-2 text-sm font-black text-leaf-700" onClick={() => onNavigate("/admin/referral-settings")} type="button">Settings</button></div>{message ? <p className="mt-4 text-sm text-red-700">{message}</p> : null}<div className="mt-6 overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead><tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500"><th className="p-3">Referrer</th><th className="p-3">Friend</th><th className="p-3">Code</th><th className="p-3">Status</th><th className="p-3">Registered</th></tr></thead><tbody>{items.map((item) => <tr className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50" key={item.id} onClick={() => onNavigate("/admin/referrals/" + item.id)}><td className="p-3 font-semibold">{item.referrer.name}</td><td className="p-3">{item.referred.name}</td><td className="p-3">{item.code}</td><td className="p-3">{item.status}</td><td className="p-3">{item.registered_at ? new Date(item.registered_at).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div></section>;
}
