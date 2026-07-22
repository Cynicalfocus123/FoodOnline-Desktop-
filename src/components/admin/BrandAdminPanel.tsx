import { FormEvent, useEffect, useRef, useState } from "react";
import {
  adminError,
  catalogApi,
  uploadManagedImage,
} from "../../services/admin/catalogApi";
import type { AdminBrand, MediaStorageState } from "../../types/adminCatalog";
import { countryNameFromCode } from "../../data/countries";
import {
  ActionButton,
  CheckField,
  CountryField,
  Notice,
  PanelHeader,
  TextField,
  inputClass,
} from "./CatalogCommon";
import { ManagedMediaControl } from "./ManagedMediaControl";
import { AdminListPage, exportCsv } from "./AdminListPage";
import {
  AdminSubmissionNotice,
  queueAdminSubmissionNotice,
  takeAdminSubmissionNotice,
  type AdminSubmissionNotice as AdminSubmissionNoticeState,
} from "./AdminSubmissionNotice";

const blank = {
  name: "",
  slug: "",
  country_code: "",
  logo_path: "",
  is_active: true,
  sort_order: "0",
};
export function BrandAdminPanel({
  token,
  storage,
  mode = "list",
  recordId,
  onNavigate = () => undefined,
}: {
  token: string;
  storage: MediaStorageState;
  mode?: "list" | "create" | "edit";
  recordId?: string | null;
  onNavigate?: (path: string, replace?: boolean) => void;
}) {
  const [items, setItems] = useState<AdminBrand[]>([]);
  const [selected, setSelected] = useState<AdminBrand | null>(null);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");
  const [submissionNotice, setSubmissionNotice] = useState<AdminSubmissionNoticeState | null>(() => takeAdminSubmissionNotice());
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const saveInFlight = useRef(false);
  const pendingLogoTargetRef = useRef<string | null>(null);
  const [pendingLogo, setPendingLogo] = useState<{ file: File; previewUrl: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("sort_order");
  const clearPendingLogo = () => {
    pendingLogoTargetRef.current = null;
    setPendingLogo((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
  };
  const load = async () =>
    setItems(await catalogApi.allBrands(token, search ? `&search=${encodeURIComponent(search)}` : ""));
  useEffect(() => {
    void load().catch((error) => setMessage(adminError(error).message));
  }, [token]);
  useEffect(() => {
    const queuedNotice = takeAdminSubmissionNotice();
    if (queuedNotice) setSubmissionNotice(queuedNotice);
    if (mode === "create") { clearPendingLogo(); setSelected(null); setForm(blank); setErrors({}); setMessage(""); }
    if (mode === "edit" && recordId) void catalogApi.brand(token, recordId).then((detail) => choose(detail, pendingLogoTargetRef.current !== detail.uuid)).catch((error) => setMessage(adminError(error).message));
  }, [mode, recordId, token]);
  const choose = (item: AdminBrand, discardPending = true) => {
    if (discardPending) clearPendingLogo();
    setSelected(item);
    setForm({
      name: item.name,
      slug: item.slug,
      country_code: item.country_code ?? "",
      logo_path: item.logo_path ?? "",
      is_active: item.is_active,
      sort_order: String(item.sort_order),
    });
    setErrors({});
  };
  async function save(event: FormEvent) {
    event.preventDefault();
    if (saveInFlight.current) return;
    saveInFlight.current = true;
    setSaving(true);
    setErrors({});
    setMessage("");
    try {
      const wasNew = !selected;
      const item = await catalogApi.saveBrand(token, selected?.uuid ?? null, {
        ...form,
        country_code: form.country_code || null,
        logo_path: form.logo_path || null,
        sort_order: Number(form.sort_order),
      });
      let finalItem = item;
      let uploadFailed = false;
      if (pendingLogo) {
        setProgress(0);
        try {
          await uploadManagedImage({ token, purpose: "brand_logo", targetUuid: item.uuid, file: pendingLogo.file, onProgress: setProgress });
          const refreshed = (await catalogApi.brands(token, `&search=${encodeURIComponent(item.slug)}`)).data.find((candidate) => candidate.uuid === item.uuid);
          if (refreshed) finalItem = refreshed;
          clearPendingLogo();
        } catch (error) {
          uploadFailed = true;
        } finally {
          setProgress(null);
        }
      }
      await load();
      setSelected(finalItem);
      setForm({ name: finalItem.name, slug: finalItem.slug, country_code: finalItem.country_code ?? "", logo_path: finalItem.logo_path ?? "", is_active: finalItem.is_active, sort_order: String(finalItem.sort_order) });
      const notice: AdminSubmissionNoticeState = uploadFailed
        ? {
            tone: "warning",
            message: wasNew
              ? "The record was created, but one or more images could not be uploaded. Retry the remaining images."
              : "One or more images could not be uploaded. Retry the remaining images.",
          }
        : {
            tone: "success",
            message: wasNew ? "Brand created successfully." : "Brand updated successfully.",
          };
      pendingLogoTargetRef.current = uploadFailed ? finalItem.uuid : null;
      if (wasNew) {
        queueAdminSubmissionNotice(notice);
        onNavigate(`/admin/brands/${finalItem.uuid}/edit`, true);
      } else {
        setSubmissionNotice(notice);
      }
    } catch (error) {
      const clean = adminError(error);
      setMessage(clean.message);
      setErrors(clean.fields);
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }
  async function upload(file: File) {
    if (!selected) {
      const previewUrl = URL.createObjectURL(file);
      setPendingLogo((current) => {
        if (current) URL.revokeObjectURL(current.previewUrl);
        return { file, previewUrl };
      });
      setMessage("Image selected. It will upload automatically when you save the brand.");
      return;
    }
    setProgress(0);
    try {
      await uploadManagedImage({
        token,
        purpose: "brand_logo",
        targetUuid: selected.uuid,
        file,
        onProgress: setProgress,
      });
      const refreshed = (
        await catalogApi.brands(
          token,
          `&search=${encodeURIComponent(selected.slug)}`,
        )
      ).data.find((item) => item.uuid === selected.uuid);
      if (refreshed) choose(refreshed);
      else clearPendingLogo();
      setMessage("Image uploaded.");
    } catch (error) {
      setMessage(adminError(error).message);
    } finally {
      setProgress(null);
    }
  }
  async function removeLogo() {
    if (pendingLogo) {
      clearPendingLogo();
      setMessage("Selected image removed.");
      return;
    }
    if (!selected) return;
    try {
      const updated = await catalogApi.saveBrand(token, selected.uuid, { logo_path: null });
      await load();
      choose(updated);
      setMessage("Image removed.");
    } catch (error) {
      setMessage(adminError(error).message);
    }
  }
  const sortedItems = [...items].sort((left, right) => sort === "name" ? left.name.localeCompare(right.name) : sort === "country" ? countryNameFromCode(left.country_code).localeCompare(countryNameFromCode(right.country_code)) : left.sort_order - right.sort_order || left.name.localeCompare(right.name));
  const pageSize = 20;
  const pageItems = sortedItems.slice((page - 1) * pageSize, page * pageSize);
  const allPageSelected = pageItems.length > 0 && pageItems.every((item) => selectedIds.has(item.uuid));
  async function bulk(action: "publish" | "archive" | "delete") {
    const targets = items.filter((item) => selectedIds.has(item.uuid));
    if (!targets.length || !window.confirm(`${action[0].toUpperCase() + action.slice(1)} ${targets.length} selected brands?`)) return;
    try {
      for (const item of targets) action === "delete" ? await catalogApi.deleteBrand(token, item.uuid) : await catalogApi.saveBrand(token, item.uuid, { is_active: action === "publish" });
      setSelectedIds(new Set()); await load(); setMessage(`${targets.length} brands updated.`);
    } catch (error) { setMessage(adminError(error).message); }
  }
  if (mode === "list") return <AdminListPage bulkActions={[{ label: "Bulk delete", tone: "danger", onClick: () => void bulk("delete") }, { label: "Bulk publish", onClick: () => void bulk("publish") }, { label: "Bulk archive", onClick: () => void bulk("archive") }]} count={items.length} createLabel="Create Brand" description="Manage brand identity, origin, visibility, and logos." filters={<div className="flex flex-wrap gap-2"><button className="min-h-10 rounded-full bg-emerald-700 px-4 text-xs font-black text-white" type="button">All {items.length}</button><button className="min-h-10 rounded-full bg-neutral-100 px-4 text-xs font-black text-neutral-700" type="button">Published {items.filter((item) => item.is_active).length}</button><button className="min-h-10 rounded-full bg-neutral-100 px-4 text-xs font-black text-neutral-700" type="button">Archived {items.filter((item) => !item.is_active).length}</button></div>} onCreate={() => onNavigate("/admin/brands/create")} onExport={() => exportCsv("brands.csv", sortedItems.map((item) => ({ name: item.name, slug: item.slug, country: countryNameFromCode(item.country_code), status: item.is_active ? "published" : "archived", sort_order: item.sort_order })))} onPage={setPage} onSearch={setSearch} onSubmitSearch={() => { setPage(1); void load(); }} onSort={setSort} page={page} pageSize={pageSize} search={search} selectedCount={selectedIds.size} sort={sort} sortOptions={[{ value: "sort_order", label: "Sort: Display order" }, { value: "name", label: "Sort: Name" }, { value: "country", label: "Sort: Country" }]} title="Brands" total={items.length}><table className="min-w-[820px] w-full text-left text-sm"><thead className="bg-neutral-50"><tr>{["", "Brand", "Country", "Status", "Order", ""].map((header, index) => <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.14em] text-neutral-500" key={`${header}-${index}`}>{index === 0 ? <input aria-label="Select page" checked={allPageSelected} onChange={() => setSelectedIds((current) => { const next = new Set(current); pageItems.forEach((item) => allPageSelected ? next.delete(item.uuid) : next.add(item.uuid)); return next; })} type="checkbox" /> : header}</th>)}</tr></thead><tbody>{pageItems.map((item) => <tr className="border-t border-neutral-100 hover:bg-orange-50/30" key={item.uuid}><td className="px-4 py-4"><input aria-label={`Select ${item.name}`} checked={selectedIds.has(item.uuid)} onChange={() => setSelectedIds((current) => { const next = new Set(current); next.has(item.uuid) ? next.delete(item.uuid) : next.add(item.uuid); return next; })} type="checkbox" /></td><td className="px-4 py-4"><button className="font-black hover:text-citrus-600" onClick={() => onNavigate(`/admin/brands/${item.uuid}/edit`)} type="button">{item.name}</button><p className="mt-1 text-xs text-neutral-500">/{item.slug}</p></td><td className="px-4 py-4">{countryNameFromCode(item.country_code) || "Not set"}</td><td className="px-4 py-4">{item.is_active ? "Published" : "Archived"}</td><td className="px-4 py-4">{item.sort_order}</td><td className="px-4 py-4"><button className="font-black text-leaf-700" onClick={() => onNavigate(`/admin/brands/${item.uuid}/edit`)} type="button">Edit</button></td></tr>)}</tbody></table></AdminListPage>;
  return (
    <section className="grid gap-6">
      {false ? <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft">
        <PanelHeader
          eyebrow="Catalog"
          title="Brands"
          actions={
            <ActionButton
              onClick={() => {
                clearPendingLogo();
                setSelected(null);
                setForm(blank);
              }}
            >
              New
            </ActionButton>
          }
        />
        <div className="mt-5 flex gap-2">
          <input
            aria-label="Search brands"
            className={inputClass}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            value={search}
          />
          <ActionButton onClick={() => void load()} tone="secondary">
            Go
          </ActionButton>
        </div>
        <div className="mt-4 grid max-h-[65vh] gap-2 overflow-y-auto">
          {items.map((item) => (
            <button
              className={`rounded-xl border p-3 text-left ${selected?.uuid === item.uuid ? "border-citrus-500 bg-orange-50" : "border-neutral-100"}`}
              key={item.uuid}
              onClick={() => choose(item)}
              type="button"
            >
              <span className="block font-black">{item.name}</span>
              <span className="text-xs font-semibold text-neutral-500">
                {countryNameFromCode(item.country_code) || "No country"} ·{" "}
                {item.is_active ? "Active" : "Inactive"}
              </span>
            </button>
          ))}
        </div>
      </div> : null}
      <form
        className="grid gap-5 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-7"
        onSubmit={save}
      >
        <button className="w-fit text-sm font-black text-leaf-700" onClick={() => onNavigate("/admin/brands")} type="button">← Brands</button>
        <PanelHeader
          eyebrow={selected ? "Edit brand" : "New brand"}
          title={selected?.name ?? "Create brand"}
          actions={<div className="flex flex-wrap gap-2"><ActionButton disabled={saving} type="submit">{saving ? "Saving…" : "Save"}</ActionButton><ActionButton disabled={saving} tone="secondary" type="submit">{saving ? "Saving…" : "Save & Continue"}</ActionButton>{selected ? <ActionButton onClick={() => void catalogApi.deleteBrand(token, selected.uuid).then(() => onNavigate("/admin/brands"))} tone="danger">Delete</ActionButton> : null}</div>}
        />
        {message ? (
          <Notice tone={Object.keys(errors).length ? "error" : "neutral"}>
            {message}
          </Notice>
        ) : null}
        <AdminSubmissionNotice notice={submissionNotice} onDismiss={() => setSubmissionNotice(null)} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            error={errors.name?.[0]}
            label="Name"
            onChange={(v) => setForm({ ...form, name: v })}
            value={form.name}
          />
          <TextField
            error={errors.slug?.[0]}
            label="Slug"
            onChange={(v) => setForm({ ...form, slug: v })}
            value={form.slug}
          />
          <CountryField
            error={errors.country_code?.[0]}
            onChange={(v) => setForm({ ...form, country_code: v })}
            value={form.country_code}
          />
          <TextField
            label="Sort order"
            onChange={(v) => setForm({ ...form, sort_order: v })}
            type="number"
            value={form.sort_order}
          />
          <CheckField
            checked={form.is_active}
            label="Active brand"
            onChange={(v) => setForm({ ...form, is_active: v })}
          />
        </div>
        <div>
          <h3 className="text-lg font-black">Logo</h3>
          <ManagedMediaControl
            entityId={selected?.uuid ?? null}
            entityType="brand"
            items={[{ id: selected?.uuid ?? "new", purpose: "brand_logo", label: "Brand logo", url: pendingLogo?.previewUrl ?? selected?.logo_url }]}
            onRemove={() => void removeLogo()}
            onUpload={(_purpose, file) => void upload(file)}
            progress={progress}
            storage={storage}
          />
        </div>
      </form>
    </section>
  );
}
