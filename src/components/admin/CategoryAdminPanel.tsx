import { FormEvent, useEffect, useMemo, useState } from "react";
import { getPublicRouteHref } from "../../lib/routes";
import { adminError, catalogApi, uploadManagedImage } from "../../services/admin/catalogApi";
import type { AdminCategory, MediaPurpose, MediaStorageState } from "../../types/adminCatalog";
import { ActionButton, CheckField, Field, Notice, PanelHeader, TextField, inputClass } from "./CatalogCommon";
import { slugifyCategoryName, updateCategoryPlacement } from "./categoryAdminLogic";

const empty = {
  name: "", slug: "", parent_id: "", description: "", status: "draft", visibility: "public", sort_order: "",
  image_path: "", icon_path: "", desktop_banner_path: "", mobile_banner_path: "", is_featured: false,
  show_in_navigation: false, show_on_homepage: false, default_sort: "featured", meta_title: "", meta_description: "",
  canonical_url: "", robots_index: true, robots_follow: true,
};
type Form = typeof empty;
type StatusFilter = "all" | AdminCategory["status"];

function formFromCategory(detail: AdminCategory): Form {
  return {
    name: detail.name, slug: detail.slug, parent_id: detail.parent_id ?? "", description: detail.description ?? "",
    status: detail.status, visibility: detail.visibility, sort_order: String(detail.sort_order),
    image_path: detail.media.image_path ?? "", icon_path: detail.media.icon_path ?? "",
    desktop_banner_path: detail.media.desktop_banner_path ?? "", mobile_banner_path: detail.media.mobile_banner_path ?? "",
    is_featured: detail.is_featured, show_in_navigation: detail.show_in_navigation, show_on_homepage: detail.show_on_homepage,
    default_sort: detail.default_sort, meta_title: detail.seo.meta_title ?? "", meta_description: detail.seo.meta_description ?? "",
    canonical_url: detail.seo.canonical_url ?? "", robots_index: detail.seo.robots_index, robots_follow: detail.seo.robots_follow,
  };
}

export function CategoryAdminPanel({ token, storage }: { token: string; storage: MediaStorageState }) {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [selected, setSelected] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"neutral" | "error" | "success">("neutral");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [listError, setListError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [alias, setAlias] = useState("");
  const [aliasError, setAliasError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  async function load(preferredId?: string) {
    setLoading(true);
    setListError("");
    try {
      const query = `${search ? `&search=${encodeURIComponent(search)}` : ""}${statusFilter !== "all" ? `&status=${statusFilter}` : ""}`;
      const next = await catalogApi.allCategories(token, query);
      setItems(next);
      if (preferredId && !next.some((item) => item.id === preferredId)) setSelected(null);
      return next;
    } catch (error) {
      setListError(adminError(error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [token, statusFilter]);

  async function choose(item: AdminCategory) {
    try {
      const detail = await catalogApi.category(token, item.id);
      setSelected(detail);
      setForm(formFromCategory(detail));
      setSlugEdited(true);
      setErrors({}); setMessage(""); setAliasError(""); setDeleteConfirmation(""); setUploadError("");
    } catch (error) {
      setMessage(adminError(error).message); setMessageTone("error");
    }
  }

  function startNew() {
    setSelected(null); setForm(empty); setSlugEdited(false); setErrors({}); setMessage(""); setAlias("");
    setAliasError(""); setDeleteConfirmation(""); setUploadError("");
  }

  function setField<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => {
      const next = updateCategoryPlacement(current, key, value);
      if (key === "name" && !selected && !slugEdited) next.slug = slugifyCategoryName(String(value));
      return next;
    });
    if (key === "slug") setSlugEdited(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setErrors({}); setMessage("");
    try {
      const body = {
        ...form,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        ...(form.sort_order === "" ? { sort_order: undefined } : { sort_order: Number(form.sort_order) }),
        description: form.description || null, image_path: form.image_path || null, icon_path: form.icon_path || null,
        desktop_banner_path: form.desktop_banner_path || null, mobile_banner_path: form.mobile_banner_path || null,
        meta_title: form.meta_title || null, meta_description: form.meta_description || null, canonical_url: form.canonical_url || null,
      };
      const result = await catalogApi.saveCategory(token, selected?.id ?? null, body);
      setSelected(result); setForm(formFromCategory(result)); setSlugEdited(true);
      await load(result.id);
      setMessage("Category saved."); setMessageTone("success");
    } catch (error) {
      const clean = adminError(error); setMessage(clean.message); setMessageTone("error"); setErrors(clean.fields);
    } finally { setSaving(false); }
  }

  async function mediaUpload(purpose: MediaPurpose, file: File) {
    if (!selected) return;
    setProgress(0); setUploadError("");
    try {
      await uploadManagedImage({ token, purpose, targetUuid: selected.uuid, file, onProgress: setProgress });
      const detail = await catalogApi.category(token, selected.id);
      setSelected(detail); setForm(formFromCategory(detail)); setMessage("Category image uploaded."); setMessageTone("success");
    } catch (error) { setUploadError(adminError(error).message); } finally { setProgress(null); }
  }

  async function changeStatus(action: "archive" | "restore") {
    if (!selected || (action === "archive" && !confirm("Archive this category? It will leave navigation and the homepage."))) return;
    try {
      const result = action === "archive" ? await catalogApi.archiveCategory(token, selected.id) : await catalogApi.restoreCategory(token, selected.id);
      setSelected(result); setForm(formFromCategory(result)); await load(result.id);
      setMessage(action === "archive" ? "Category archived." : "Category restored as a draft."); setMessageTone("success");
    } catch (error) { setMessage(adminError(error).message); setMessageTone("error"); }
  }

  async function addAlias() {
    if (!selected || !alias.trim()) return;
    setAliasError("");
    try { await catalogApi.addAlias(token, selected.id, { alias_slug: alias, redirect_code: 301, is_active: true }); await choose(selected); setAlias(""); }
    catch (error) { const clean = adminError(error); setAliasError(clean.fields.alias_slug?.[0] ?? clean.message); }
  }

  async function removeAlias(id: string) {
    if (!selected) return;
    try { await catalogApi.deleteAlias(token, id); await choose(selected); }
    catch (error) { setAliasError(adminError(error).message); }
  }

  async function permanentlyDelete() {
    if (!selected || deleteConfirmation !== selected.slug) return;
    try {
      await catalogApi.deleteCategory(token, selected.id, deleteConfirmation);
      startNew(); await load(); setMessage("Category permanently deleted."); setMessageTone("success");
    } catch (error) { const clean = adminError(error); setMessage(clean.fields.category?.[0] ?? clean.message); setMessageTone("error"); }
  }

  const storefrontReasons = selected ? [
    selected.status !== "published" ? `Status is ${selected.status}.` : null,
    selected.visibility !== "public" ? `Visibility is ${selected.visibility}.` : null,
    !selected.show_on_homepage && !selected.show_in_navigation ? "Not enabled for homepage or navigation." : null,
  ].filter((reason): reason is string => Boolean(reason)) : ["Save the category to evaluate storefront access."];
  const counts = useMemo(() => ({
    all: items.length, published: items.filter((item) => item.status === "published").length,
    draft: items.filter((item) => item.status === "draft").length, archived: items.filter((item) => item.status === "archived").length,
  }), [items]);

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft">
        <PanelHeader eyebrow="Catalog" title="Categories" actions={<ActionButton onClick={startNew}>New</ActionButton>} />
        <div className="mt-5 flex gap-2"><input aria-label="Search categories" className={inputClass} onChange={(e) => setSearch(e.target.value)} placeholder="Search" value={search} /><ActionButton onClick={() => void load()} tone="secondary">Go</ActionButton></div>
        <div className="mt-3 flex flex-wrap gap-2">{(["all", "published", "draft", "archived"] as StatusFilter[]).map((status) => <button className={`min-h-10 rounded-full px-3 text-xs font-black capitalize ${statusFilter === status ? "bg-emerald-700 text-white" : "bg-neutral-100 text-neutral-700"}`} key={status} onClick={() => setStatusFilter(status)} type="button">{status} {counts[status]}</button>)}</div>
        {listError ? <div className="mt-3"><Notice tone="error">{listError}</Notice></div> : null}
        <div className="mt-4 grid max-h-[65vh] gap-2 overflow-y-auto">
          {loading ? <p className="p-3 text-sm font-semibold text-neutral-500">Loading categories…</p> : null}
          {!loading && !items.length ? <p className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">No categories match this view.</p> : null}
          {items.map((item) => <button className={`min-h-11 rounded-xl border p-3 text-left ${selected?.id === item.id ? "border-citrus-500 bg-orange-50" : "border-neutral-100 hover:border-neutral-300"}`} key={item.id} onClick={() => void choose(item)} type="button"><span className="block break-words font-black text-ink">{"— ".repeat(item.depth)}{item.name}</span><span className="text-xs font-semibold capitalize text-neutral-500">{item.status} · {item.visibility.replace("_", " ")}</span></button>)}
        </div>
      </div>

      <form className="grid gap-6 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-7" onSubmit={save}>
        <PanelHeader eyebrow={selected ? "Edit category" : "New category"} title={selected?.name ?? "Create category"} actions={<div className="flex flex-wrap gap-2"><ActionButton disabled={saving} type="submit">{saving ? "Saving…" : "Save"}</ActionButton>{selected?.status === "archived" ? <ActionButton onClick={() => void changeStatus("restore")} tone="secondary">Restore</ActionButton> : selected ? <ActionButton onClick={() => void changeStatus("archive")} tone="danger">Archive</ActionButton> : null}</div>} />
        {message ? <Notice tone={messageTone}>{message}</Notice> : null}
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Public Storefront Status</p><p className={`mt-1 text-lg font-black ${selected && !storefrontReasons.length ? "text-emerald-700" : "text-amber-700"}`}>{selected && !storefrontReasons.length ? "Accessible" : "Not publicly accessible"}</p></div>{selected ? <ActionButton onClick={() => window.open(getPublicRouteHref(`category/${selected.slug}`), "_blank", "noopener,noreferrer")} tone="secondary">View on Storefront</ActionButton> : null}</div>{storefrontReasons.length ? <ul className="mt-2 grid gap-1 text-sm text-neutral-600">{storefrontReasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul> : <p className="mt-2 text-sm text-neutral-600">Published public categories can be reached from the storefront.</p>}</div>

        <div className="grid gap-4 md:grid-cols-2">
          <TextField error={errors.name?.[0]} label="Name" onChange={(value) => setField("name", value)} value={form.name} />
          <TextField error={errors.slug?.[0]} label="Slug" onChange={(value) => setField("slug", value)} value={form.slug} />
          <Field label="Parent" error={errors.parent_id?.[0]}><select className={inputClass} onChange={(e) => setField("parent_id", e.target.value)} value={form.parent_id}><option value="">Root category</option>{items.filter((item) => item.id !== selected?.id).map((item) => <option key={item.id} value={item.id}>{item.path}</option>)}</select></Field>
          <TextField error={errors.sort_order?.[0]} label="Sort order (optional)" onChange={(value) => setField("sort_order", value)} type="number" value={form.sort_order} />
          <Field label="Status"><select className={inputClass} onChange={(e) => setField("status", e.target.value)} value={form.status}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
          <Field label="Visibility"><select className={inputClass} onChange={(e) => setField("visibility", e.target.value)} value={form.visibility}><option value="public">Public</option><option value="catalog_only">Catalog only</option><option value="hidden">Hidden</option></select></Field>
          <Field label="Default product sort"><select className={inputClass} onChange={(e) => setField("default_sort", e.target.value)} value={form.default_sort}>{["featured", "popular", "newest", "price_asc", "price_desc", "name_asc", "name_desc"].map((value) => <option key={value}>{value}</option>)}</select></Field>
        </div>
        <TextField error={errors.description?.[0]} label="Description (optional)" multiline onChange={(value) => setField("description", value)} value={form.description} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><CheckField checked={form.is_featured} label="Featured" onChange={(value) => setField("is_featured", value)} /><CheckField checked={form.show_in_navigation} label="Show in navigation" onChange={(value) => setField("show_in_navigation", value)} /><CheckField checked={form.show_on_homepage} label="Show on homepage" onChange={(value) => setField("show_on_homepage", value)} /></div>
        <Notice>Public placement automatically uses Published + Public. Draft, Archived, Hidden, and Catalog only categories stay out of navigation and homepage placement.</Notice>

        <details className="rounded-2xl border border-neutral-200 p-4"><summary className="cursor-pointer text-lg font-black">Images — Optional</summary><div className="mt-4 grid gap-3">{!selected ? <Notice>Save the category first. Images can be added later.</Notice> : storage.phase === "checking" ? <Notice>Checking image upload availability. You can save this category now.</Notice> : storage.phase === "unavailable" ? <Notice>Image uploads are not connected yet. You can save and manage this category now, then add images later.</Notice> : <div className="grid gap-3 sm:grid-cols-2">{([ ["category_image", "Category tile"], ["category_icon", "Icon"], ["category_desktop_banner", "Desktop banner"], ["category_mobile_banner", "Mobile banner"] ] as [MediaPurpose, string][]).map(([purpose, label]) => <label className="min-h-11 rounded-xl border border-dashed border-neutral-300 p-3 text-sm font-bold" key={purpose}>{label}<input accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={(e) => e.target.files?.[0] && void mediaUpload(purpose, e.target.files[0])} type="file" /></label>)}</div>}{progress !== null ? <Notice>Uploading: {progress}%</Notice> : null}{uploadError ? <Notice tone="error">{uploadError}</Notice> : null}</div></details>

        <details className="rounded-2xl border border-neutral-200 p-4"><summary className="cursor-pointer text-lg font-black">SEO &amp; Redirects — Optional</summary><div className="mt-4 grid gap-4 md:grid-cols-2"><TextField error={errors.meta_title?.[0]} label="Meta title" onChange={(value) => setField("meta_title", value)} value={form.meta_title} /><TextField error={errors.canonical_url?.[0]} label="Canonical URL" onChange={(value) => setField("canonical_url", value)} value={form.canonical_url} /><TextField error={errors.meta_description?.[0]} label="Meta description" multiline onChange={(value) => setField("meta_description", value)} value={form.meta_description} /><div className="grid gap-3"><CheckField checked={form.robots_index} label="Allow search indexing" onChange={(value) => setField("robots_index", value)} /><CheckField checked={form.robots_follow} label="Allow link following" onChange={(value) => setField("robots_follow", value)} /></div></div>{selected ? <div className="mt-5"><h3 className="font-black">Aliases / Redirects</h3><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input className={inputClass} onChange={(e) => setAlias(e.target.value)} placeholder="old-category-slug" value={alias} /><ActionButton onClick={() => void addAlias()}>Add</ActionButton></div>{aliasError ? <p className="mt-2 text-sm font-semibold text-rose-700">{aliasError}</p> : null}<div className="mt-3 grid gap-2">{selected.aliases.map((item) => <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3" key={item.id}><span className="break-all text-sm font-bold">/{item.alias_slug} · {item.redirect_code}</span><ActionButton onClick={() => void removeAlias(item.id)} tone="danger">Remove</ActionButton></div>)}</div></div> : <Notice>Save the category before adding an alias.</Notice>}</details>

        {selected?.status === "archived" ? <div className="grid gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-5"><h3 className="text-lg font-black text-rose-900">Danger Zone</h3><p className="text-sm text-rose-800">Permanent deletion is available only when this category has no products or child categories. Type <strong>{selected.slug}</strong> exactly.</p><input aria-label="Confirm category slug" className={inputClass} onChange={(e) => setDeleteConfirmation(e.target.value)} value={deleteConfirmation} /><div><ActionButton disabled={deleteConfirmation !== selected.slug} onClick={() => void permanentlyDelete()} tone="danger">Permanently delete</ActionButton></div></div> : null}
        <div className="flex justify-end border-t border-neutral-200 pt-5"><ActionButton disabled={saving} type="submit">{saving ? "Saving…" : "Save category"}</ActionButton></div>
      </form>
    </section>
  );
}
