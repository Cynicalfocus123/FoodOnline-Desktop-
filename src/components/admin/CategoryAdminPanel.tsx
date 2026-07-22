import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getPublicRouteHref } from "../../lib/routes";
import { adminError, catalogApi, uploadManagedImage } from "../../services/admin/catalogApi";
import type { AdminCategory, MediaPurpose, MediaStorageState } from "../../types/adminCatalog";
import { ActionButton, CheckField, ConfirmationModal, Field, Notice, PanelHeader, TextField, inputClass } from "./CatalogCommon";
import { ManagedMediaControl } from "./ManagedMediaControl";
import { slugifyCategoryName, updateCategoryPlacement } from "./categoryAdminLogic";
import { AdminListPage, exportCsv } from "./AdminListPage";
import {
  AdminSubmissionNotice,
  queueAdminSubmissionNotice,
  takeAdminSubmissionNotice,
  type AdminSubmissionNotice as AdminSubmissionNoticeState,
} from "./AdminSubmissionNotice";

const empty = {
  name: "", slug: "", parent_id: "", description: "", status: "draft", visibility: "public", sort_order: "",
  image_path: "", icon_path: "", desktop_banner_path: "", mobile_banner_path: "", is_featured: false,
  show_in_navigation: false, show_on_homepage: false, default_sort: "featured", meta_title: "", meta_description: "",
  canonical_url: "", robots_index: true, robots_follow: true,
};
type Form = typeof empty;
type StatusFilter = "all" | AdminCategory["status"];
type PendingCategoryMedia = Partial<Record<MediaPurpose, { file: File; previewUrl: string }>>;
const categoryMedia = [
  { purpose: "category_image", field: "image_path", url: "image_url", label: "Category tile" },
  { purpose: "category_icon", field: "icon_path", url: "icon_url", label: "Icon" },
  { purpose: "category_desktop_banner", field: "desktop_banner_path", url: "desktop_banner_url", label: "Desktop banner" },
  { purpose: "category_mobile_banner", field: "mobile_banner_path", url: "mobile_banner_url", label: "Mobile banner" },
] as const;

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

export function CategoryAdminPanel({ token, storage, mode = "list", recordId, onNavigate = () => undefined }: { token: string; storage: MediaStorageState; mode?: "list" | "create" | "edit"; recordId?: string | null; onNavigate?: (path: string, replace?: boolean) => void }) {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [selected, setSelected] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"neutral" | "error" | "success">("neutral");
  const [submissionNotice, setSubmissionNotice] = useState<AdminSubmissionNoticeState | null>(() => takeAdminSubmissionNotice());
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [listError, setListError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [alias, setAlias] = useState("");
  const [aliasError, setAliasError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [pendingMedia, setPendingMedia] = useState<PendingCategoryMedia>({});
  const pendingMediaTargetRef = useRef<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("sort_order");

  function clearPendingMedia() {
    pendingMediaTargetRef.current = null;
    setPendingMedia((current) => {
      Object.values(current).forEach((item) => item && URL.revokeObjectURL(item.previewUrl));
      return {};
    });
  }

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

  useEffect(() => {
    const queuedNotice = takeAdminSubmissionNotice();
    if (queuedNotice) setSubmissionNotice(queuedNotice);
    if (mode === "create") {
      startNew();
      return;
    }
    if (mode === "edit" && recordId) {
      void catalogApi.category(token, recordId).then((detail) => {
        setSelected(detail); setForm(formFromCategory(detail)); setSlugEdited(true);
        if (pendingMediaTargetRef.current !== detail.uuid) clearPendingMedia();
        setErrors({}); setMessage(""); setAliasError(""); setDeleteOpen(false); setUploadError("");
      }).catch((error) => { setMessage(adminError(error).message); setMessageTone("error"); });
    }
  }, [mode, recordId, token]);

  async function choose(item: AdminCategory) {
    try {
      const detail = await catalogApi.category(token, item.id);
      setSelected(detail);
      setForm(formFromCategory(detail));
      setSlugEdited(true);
      clearPendingMedia(); setErrors({}); setMessage(""); setAliasError(""); setDeleteOpen(false); setUploadError("");
    } catch (error) {
      setMessage(adminError(error).message); setMessageTone("error");
    }
  }

  function startNew() {
    setSelected(null); setForm(empty); setSlugEdited(false); setErrors({}); setMessage(""); setAlias("");
    clearPendingMedia(); setAliasError(""); setDeleteOpen(false); setUploadError("");
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
      const wasNew = !selected;
      const body = {
        ...form,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        ...(form.sort_order === "" ? { sort_order: undefined } : { sort_order: Number(form.sort_order) }),
        description: form.description || null, image_path: form.image_path || null, icon_path: form.icon_path || null,
        desktop_banner_path: form.desktop_banner_path || null, mobile_banner_path: form.mobile_banner_path || null,
        meta_title: form.meta_title || null, meta_description: form.meta_description || null, canonical_url: form.canonical_url || null,
      };
      const result = await catalogApi.saveCategory(token, selected?.id ?? null, body);
      const queued = Object.entries(pendingMedia) as Array<[MediaPurpose, { file: File; previewUrl: string }]>;
      const uploaded: MediaPurpose[] = [];
      const uploadFailures: string[] = [];
      for (const [purpose, pending] of queued) {
        setProgress(0);
        try {
          await uploadManagedImage({ token, purpose, targetUuid: result.uuid, file: pending.file, onProgress: setProgress });
          uploaded.push(purpose);
          URL.revokeObjectURL(pending.previewUrl);
        } catch (error) {
          uploadFailures.push(adminError(error).message);
        }
      }
      if (uploaded.length) {
        setPendingMedia((current) => Object.fromEntries(Object.entries(current).filter(([purpose]) => !uploaded.includes(purpose as MediaPurpose))) as PendingCategoryMedia);
      }
      const detail = queued.length ? await catalogApi.category(token, result.id) : result;
      setSelected(detail); setForm(formFromCategory(detail)); setSlugEdited(true);
      await load(result.id);
      setUploadError(uploadFailures[0] ?? "");
      const notice: AdminSubmissionNoticeState = uploadFailures.length
        ? {
            tone: "warning",
            message: wasNew
              ? "The record was created, but one or more images could not be uploaded. Retry the remaining images."
              : "One or more images could not be uploaded. Retry the remaining images.",
          }
        : {
            tone: "success",
            message: wasNew ? "Category created successfully." : "Category updated successfully.",
          };
      pendingMediaTargetRef.current = uploadFailures.length ? result.uuid : null;
      if (wasNew) {
        queueAdminSubmissionNotice(notice);
        onNavigate(`/admin/categories/${result.id}/edit`, true);
      } else {
        setSubmissionNotice(notice);
      }
    } catch (error) {
      const clean = adminError(error); setMessage(clean.message); setMessageTone("error"); setErrors(clean.fields);
    } finally { setProgress(null); setSaving(false); }
  }

  async function mediaUpload(purpose: MediaPurpose, file: File) {
    if (!selected) {
      const previewUrl = URL.createObjectURL(file);
      setPendingMedia((current) => {
        const previous = current[purpose];
        if (previous) URL.revokeObjectURL(previous.previewUrl);
        return { ...current, [purpose]: { file, previewUrl } };
      });
      setUploadError("");
      setMessage("Image selected. It will upload automatically when you save the category."); setMessageTone("neutral");
      return;
    }
    setProgress(0); setUploadError("");
    try {
      await uploadManagedImage({ token, purpose, targetUuid: selected.uuid, file, onProgress: setProgress });
      const queued = pendingMedia[purpose];
      if (queued) {
        URL.revokeObjectURL(queued.previewUrl);
        setPendingMedia((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== purpose)) as PendingCategoryMedia);
      }
      const detail = await catalogApi.category(token, selected.id);
      setSelected(detail); setForm(formFromCategory(detail)); setMessage("Category image uploaded."); setMessageTone("success");
    } catch (error) { setUploadError(adminError(error).message); } finally { setProgress(null); }
  }

  async function removeMedia(purpose: string) {
    const pending = pendingMedia[purpose as MediaPurpose];
    if (pending) {
      URL.revokeObjectURL(pending.previewUrl);
      setPendingMedia((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== purpose)) as PendingCategoryMedia);
      setMessage("Selected image removed."); setMessageTone("neutral");
      return;
    }
    if (!selected) return;
    const definition = categoryMedia.find((item) => item.purpose === purpose);
    if (!definition) return;
    setUploadError("");
    try {
      const detail = await catalogApi.saveCategory(token, selected.id, { [definition.field]: null });
      setSelected(detail); setForm(formFromCategory(detail)); setMessage("Image removed."); setMessageTone("success");
    } catch (error) {
      setUploadError(adminError(error).message);
    }
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
    if (!selected) return;
    setDeleting(true);
    try {
      await catalogApi.deleteCategory(token, selected.id);
      setDeleteOpen(false); startNew(); await load(); onNavigate("/admin/categories"); setMessage("Category permanently deleted."); setMessageTone("success");
    } catch (error) { const clean = adminError(error); setMessage(clean.fields.category?.[0] ?? clean.message); setMessageTone("error"); }
    finally { setDeleting(false); }
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

  const sortedItems = useMemo(() => [...items].sort((left, right) => sort === "name" ? left.name.localeCompare(right.name) : sort === "updated" ? right.id.localeCompare(left.id) : left.sort_order - right.sort_order || left.name.localeCompare(right.name)), [items, sort]);
  const pageSize = 20;
  const pageItems = sortedItems.slice((page - 1) * pageSize, page * pageSize);
  const allPageSelected = pageItems.length > 0 && pageItems.every((item) => selectedIds.has(item.id));
  const toggleSelected = (id: string) => setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  async function bulkCategory(action: "publish" | "archive" | "delete") {
    const targets = items.filter((item) => selectedIds.has(item.id));
    if (!targets.length || !window.confirm(`${action[0].toUpperCase() + action.slice(1)} ${targets.length} selected categories?`)) return;
    try {
      for (const item of targets) {
        if (action === "publish") await catalogApi.saveCategory(token, item.id, { status: "published" });
        else if (action === "archive") await catalogApi.archiveCategory(token, item.id);
        else await catalogApi.deleteCategory(token, item.id);
      }
      setSelectedIds(new Set()); await load(); setMessage(`${targets.length} categories updated.`); setMessageTone("success");
    } catch (error) { setListError(adminError(error).message); }
  }

  if (mode === "list") {
    return <AdminListPage bulkActions={[{ label: "Bulk delete", tone: "danger", onClick: () => void bulkCategory("delete") }, { label: "Bulk publish", onClick: () => void bulkCategory("publish") }, { label: "Bulk archive", onClick: () => void bulkCategory("archive") }]} count={items.length} createLabel="Create Category" description="Manage category hierarchy, visibility, publication, and storefront placement." filters={<div className="flex flex-wrap gap-2">{(["all", "published", "draft", "archived"] as StatusFilter[]).map((value) => <button className={`min-h-10 rounded-full px-4 text-xs font-black capitalize ${statusFilter === value ? "bg-emerald-700 text-white" : "bg-neutral-100 text-neutral-700"}`} key={value} onClick={() => { setStatusFilter(value); setPage(1); }} type="button">{value} {counts[value]}</button>)}</div>} onCreate={() => onNavigate("/admin/categories/create")} onExport={() => exportCsv("categories.csv", sortedItems.map((item) => ({ name: item.name, slug: item.slug, status: item.status, visibility: item.visibility, path: item.path, sort_order: item.sort_order })))} onPage={setPage} onSearch={setSearch} onSubmitSearch={() => { setPage(1); void load(); }} onSort={setSort} page={page} pageSize={pageSize} search={search} selectedCount={selectedIds.size} sort={sort} sortOptions={[{ value: "sort_order", label: "Sort: Display order" }, { value: "name", label: "Sort: Name" }, { value: "updated", label: "Sort: Newest" }]} title="Categories" total={items.length}>
      {listError ? <div className="m-4"><Notice tone="error">{listError}</Notice></div> : null}
      <table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-neutral-50"><tr>{["", "Category", "Path", "Status", "Visibility", "Placement", "Order", ""].map((header, index) => <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.14em] text-neutral-500" key={`${header}-${index}`}>{index === 0 ? <input aria-label="Select page" checked={allPageSelected} onChange={() => setSelectedIds((current) => { const next = new Set(current); pageItems.forEach((item) => allPageSelected ? next.delete(item.id) : next.add(item.id)); return next; })} type="checkbox" /> : header}</th>)}</tr></thead><tbody>
        {loading ? <tr><td className="px-4 py-10 text-center text-neutral-500" colSpan={8}>Loading categories…</td></tr> : null}
        {!loading && !pageItems.length ? <tr><td className="px-4 py-10 text-center text-neutral-500" colSpan={8}>No categories match this view.</td></tr> : null}
        {pageItems.map((item) => <tr className="border-t border-neutral-100 hover:bg-orange-50/30" key={item.id}><td className="px-4 py-4"><input aria-label={`Select ${item.name}`} checked={selectedIds.has(item.id)} onChange={() => toggleSelected(item.id)} type="checkbox" /></td><td className="px-4 py-4"><button className="font-black text-ink hover:text-citrus-600" onClick={() => onNavigate(`/admin/categories/${item.id}/edit`)} type="button">{"— ".repeat(item.depth)}{item.name}</button><p className="mt-1 text-xs text-neutral-500">/{item.slug}</p></td><td className="px-4 py-4 text-neutral-600">{item.path}</td><td className="px-4 py-4 capitalize">{item.status}</td><td className="px-4 py-4 capitalize">{item.visibility.replace("_", " ")}</td><td className="px-4 py-4 text-neutral-600">{item.show_on_homepage ? "Homepage" : item.show_in_navigation ? "Navigation" : "Catalog"}</td><td className="px-4 py-4">{item.sort_order}</td><td className="px-4 py-4"><button className="font-black text-leaf-700" onClick={() => onNavigate(`/admin/categories/${item.id}/edit`)} type="button">Edit</button></td></tr>)}
      </tbody></table>
    </AdminListPage>;
  }

  return (
    <section className="grid gap-6">
      {false ? <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft">
        <PanelHeader eyebrow="Catalog" title="Categories" actions={<ActionButton onClick={startNew}>New</ActionButton>} />
        <div className="mt-5 flex gap-2"><input aria-label="Search categories" className={inputClass} onChange={(e) => setSearch(e.target.value)} placeholder="Search" value={search} /><ActionButton onClick={() => void load()} tone="secondary">Go</ActionButton></div>
        <div className="mt-3 flex flex-wrap gap-2">{(["all", "published", "draft", "archived"] as StatusFilter[]).map((status) => <button className={`min-h-10 rounded-full px-3 text-xs font-black capitalize ${statusFilter === status ? "bg-emerald-700 text-white" : "bg-neutral-100 text-neutral-700"}`} key={status} onClick={() => setStatusFilter(status)} type="button">{status} {counts[status]}</button>)}</div>
        {listError ? <div className="mt-3"><Notice tone="error">{listError}</Notice></div> : null}
        <div className="mt-4 grid max-h-[65vh] gap-2 overflow-y-auto">
          {loading ? <p className="p-3 text-sm font-semibold text-neutral-500">Loading categories…</p> : null}
          {!loading && !items.length ? <p className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">No categories match this view.</p> : null}
          {items.map((item) => <button className={`min-h-11 rounded-xl border p-3 text-left ${selected?.id === item.id ? "border-citrus-500 bg-orange-50" : "border-neutral-100 hover:border-neutral-300"}`} key={item.id} onClick={() => void choose(item)} type="button"><span className="block break-words font-black text-ink">{"— ".repeat(item.depth)}{item.name}</span><span className="text-xs font-semibold capitalize text-neutral-500">{item.status} · {item.visibility.replace("_", " ")}</span></button>)}
        </div>
      </div> : null}

      <form className="grid gap-6 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-7" onSubmit={save}>
        <div className="flex flex-col gap-4 border-b border-neutral-100 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><button className="text-sm font-black text-leaf-700" onClick={() => onNavigate("/admin/categories")} type="button">← Categories</button><PanelHeader eyebrow={selected ? "Edit category" : "Create category"} title={selected?.name ?? "Create category"} /></div><div className="flex flex-wrap gap-2"><ActionButton disabled={saving} type="submit">{saving ? "Saving…" : "Save"}</ActionButton><ActionButton disabled={saving} type="submit" tone="secondary">Save &amp; Continue</ActionButton>{selected?.status === "archived" ? <ActionButton onClick={() => void changeStatus("restore")} tone="secondary">Restore</ActionButton> : selected ? <ActionButton onClick={() => void changeStatus("archive")} tone="danger">Archive</ActionButton> : null}</div></div>
        {message ? <Notice tone={messageTone}>{message}</Notice> : null}
        <AdminSubmissionNotice notice={submissionNotice} onDismiss={() => setSubmissionNotice(null)} />
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

        <details className="rounded-2xl border border-neutral-200 p-4"><summary className="cursor-pointer text-lg font-black">Images — Optional</summary><div className="mt-4"><ManagedMediaControl entityId={selected?.uuid ?? null} entityType="category" error={uploadError} items={categoryMedia.map((item) => ({ id: selected?.uuid ?? "new", purpose: item.purpose, label: item.label, url: pendingMedia[item.purpose]?.previewUrl ?? selected?.media[item.url] }))} onRemove={(item) => void removeMedia(item.purpose)} onUpload={(purpose, file) => void mediaUpload(purpose as MediaPurpose, file)} progress={progress} storage={storage} /></div></details>

        <details className="rounded-2xl border border-neutral-200 p-4"><summary className="cursor-pointer text-lg font-black">SEO &amp; Redirects — Optional</summary><div className="mt-4 grid gap-4 md:grid-cols-2"><TextField error={errors.meta_title?.[0]} label="Meta title" onChange={(value) => setField("meta_title", value)} value={form.meta_title} /><TextField error={errors.canonical_url?.[0]} label="Canonical URL" onChange={(value) => setField("canonical_url", value)} value={form.canonical_url} /><TextField error={errors.meta_description?.[0]} label="Meta description" multiline onChange={(value) => setField("meta_description", value)} value={form.meta_description} /><div className="grid gap-3"><CheckField checked={form.robots_index} label="Allow search indexing" onChange={(value) => setField("robots_index", value)} /><CheckField checked={form.robots_follow} label="Allow link following" onChange={(value) => setField("robots_follow", value)} /></div></div>{selected ? <div className="mt-5"><h3 className="font-black">Aliases / Redirects</h3><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input className={inputClass} onChange={(e) => setAlias(e.target.value)} placeholder="old-category-slug" value={alias} /><ActionButton onClick={() => void addAlias()}>Add</ActionButton></div>{aliasError ? <p className="mt-2 text-sm font-semibold text-rose-700">{aliasError}</p> : null}<div className="mt-3 grid gap-2">{selected.aliases.map((item) => <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3" key={item.id}><span className="break-all text-sm font-bold">/{item.alias_slug} · {item.redirect_code}</span><ActionButton onClick={() => void removeAlias(item.id)} tone="danger">Remove</ActionButton></div>)}</div></div> : <Notice>Save the category before adding an alias.</Notice>}</details>

        {selected?.status === "archived" ? <div className="grid gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-5"><h3 className="text-lg font-black text-rose-900">Danger Zone</h3><p className="text-sm text-rose-800">Permanent deletion is available only when this category has no products or child categories.</p><div><ActionButton onClick={() => setDeleteOpen(true)} tone="danger">Delete</ActionButton></div></div> : null}
        <div className="flex justify-end border-t border-neutral-200 pt-5"><ActionButton disabled={saving} type="submit">{saving ? "Saving…" : "Save category"}</ActionButton></div>
      </form>
      <ConfirmationModal busy={deleting} onCancel={() => setDeleteOpen(false)} onConfirm={() => void permanentlyDelete()} open={deleteOpen} />
    </section>
  );
}
