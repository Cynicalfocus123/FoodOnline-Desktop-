import { FormEvent, useEffect, useState } from "react";
import {
  adminError,
  catalogApi,
  uploadManagedImage,
} from "../../services/admin/catalogApi";
import type {
  AdminCategory,
  MediaPurpose,
  MediaStorageStatus,
} from "../../types/adminCatalog";
import {
  ActionButton,
  CheckField,
  Field,
  Notice,
  PanelHeader,
  TextField,
  inputClass,
} from "./CatalogCommon";

const empty = {
  name: "",
  slug: "",
  parent_id: "",
  description: "",
  status: "draft",
  visibility: "public",
  sort_order: "0",
  image_path: "",
  icon_path: "",
  desktop_banner_path: "",
  mobile_banner_path: "",
  is_featured: false,
  show_in_navigation: false,
  show_on_homepage: false,
  default_sort: "featured",
  meta_title: "",
  meta_description: "",
  canonical_url: "",
  robots_index: true,
  robots_follow: true,
};
type Form = typeof empty;

export function CategoryAdminPanel({
  token,
  storage,
}: {
  token: string;
  storage: MediaStorageStatus | null;
}) {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [selected, setSelected] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [alias, setAlias] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const load = async () => {
    const response = await catalogApi.categories(
      token,
      search ? `&search=${encodeURIComponent(search)}` : "",
    );
    setItems(response.data);
  };
  useEffect(() => {
    void load().catch((error) => setMessage(adminError(error).message));
  }, [token]);
  const choose = async (item: AdminCategory) => {
    const detail = await catalogApi.category(token, item.id);
    setSelected(detail);
    setForm({
      name: detail.name,
      slug: detail.slug,
      parent_id: detail.parent_id ?? "",
      description: detail.description ?? "",
      status: detail.status,
      visibility: detail.visibility,
      sort_order: String(detail.sort_order),
      image_path: detail.media.image_path ?? "",
      icon_path: detail.media.icon_path ?? "",
      desktop_banner_path: detail.media.desktop_banner_path ?? "",
      mobile_banner_path: detail.media.mobile_banner_path ?? "",
      is_featured: detail.is_featured,
      show_in_navigation: detail.show_in_navigation,
      show_on_homepage: detail.show_on_homepage,
      default_sort: detail.default_sort,
      meta_title: detail.seo.meta_title ?? "",
      meta_description: detail.seo.meta_description ?? "",
      canonical_url: detail.seo.canonical_url ?? "",
      robots_index: detail.seo.robots_index,
      robots_follow: detail.seo.robots_follow,
    });
    setErrors({});
    setMessage("");
  };
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const body = {
        ...form,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        sort_order: Number(form.sort_order),
        image_path: form.image_path || null,
        icon_path: form.icon_path || null,
        desktop_banner_path: form.desktop_banner_path || null,
        mobile_banner_path: form.mobile_banner_path || null,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        canonical_url: form.canonical_url || null,
      };
      const result = await catalogApi.saveCategory(
        token,
        selected?.id ?? null,
        body,
      );
      await load();
      await choose(result);
      setMessage("Category saved.");
    } catch (error) {
      const clean = adminError(error);
      setMessage(clean.message);
      setErrors(clean.fields);
    } finally {
      setSaving(false);
    }
  }
  async function mediaUpload(purpose: MediaPurpose, file: File) {
    if (!selected) return;
    setProgress(0);
    try {
      await uploadManagedImage({
        token,
        purpose,
        targetUuid: selected.uuid,
        file,
        onProgress: setProgress,
      });
      await choose(selected);
      setMessage("Category media uploaded.");
    } catch (error) {
      setMessage(adminError(error).message);
    } finally {
      setProgress(null);
    }
  }
  async function changeStatus(action: "archive" | "restore") {
    if (
      !selected ||
      (action === "archive" &&
        !confirm(
          "Archive this category? It will be removed from active catalog navigation.",
        ))
    )
      return;
    const result =
      action === "archive"
        ? await catalogApi.archiveCategory(token, selected.id)
        : await catalogApi.restoreCategory(token, selected.id);
    await load();
    await choose(result);
  }
  return (
    <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft">
        <PanelHeader
          eyebrow="Catalog"
          title="Categories"
          actions={
            <ActionButton
              onClick={() => {
                setSelected(null);
                setForm(empty);
              }}
            >
              New
            </ActionButton>
          }
        />
        <div className="mt-5 flex gap-2">
          <input
            aria-label="Search categories"
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
              className={`min-h-11 rounded-xl border p-3 text-left ${selected?.id === item.id ? "border-citrus-500 bg-orange-50" : "border-neutral-100 hover:border-neutral-300"}`}
              key={item.id}
              onClick={() => void choose(item)}
              type="button"
            >
              <span className="block font-black text-ink">
                {"— ".repeat(item.depth)}
                {item.name}
              </span>
              <span className="text-xs font-semibold text-neutral-500">
                {item.status} · {item.visibility}
              </span>
            </button>
          ))}
        </div>
      </div>
      <form
        className="grid gap-6 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-7"
        onSubmit={save}
      >
        <PanelHeader
          eyebrow={selected ? "Edit category" : "New category"}
          title={selected?.name ?? "Create category"}
          actions={
            <div className="flex gap-2">
              <ActionButton disabled={saving} type="submit">
                {saving ? "Saving…" : "Save"}
              </ActionButton>
              {selected?.status === "archived" ? (
                <ActionButton
                  onClick={() => void changeStatus("restore")}
                  tone="secondary"
                >
                  Restore
                </ActionButton>
              ) : selected ? (
                <ActionButton
                  onClick={() => void changeStatus("archive")}
                  tone="danger"
                >
                  Archive
                </ActionButton>
              ) : null}
            </div>
          }
        />
        {message ? (
          <Notice tone={Object.keys(errors).length ? "error" : "neutral"}>
            {message}
          </Notice>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            error={errors.name?.[0]}
            label="Name"
            onChange={(v) => set("name", v)}
            value={form.name}
          />
          <TextField
            error={errors.slug?.[0]}
            label="Slug"
            onChange={(v) => set("slug", v)}
            value={form.slug}
          />
          <Field label="Parent">
            <select
              className={inputClass}
              onChange={(e) => set("parent_id", e.target.value)}
              value={form.parent_id}
            >
              <option value="">Root category</option>
              {items
                .filter((item) => item.id !== selected?.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.path}
                  </option>
                ))}
            </select>
          </Field>
          <TextField
            label="Sort order"
            onChange={(v) => set("sort_order", v)}
            type="number"
            value={form.sort_order}
          />
          <Field label="Status">
            <select
              className={inputClass}
              onChange={(e) => set("status", e.target.value)}
              value={form.status}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Visibility">
            <select
              className={inputClass}
              onChange={(e) => set("visibility", e.target.value)}
              value={form.visibility}
            >
              <option value="public">Public</option>
              <option value="catalog_only">Catalog only</option>
              <option value="hidden">Hidden</option>
            </select>
          </Field>
          <Field label="Default product sort">
            <select
              className={inputClass}
              onChange={(e) => set("default_sort", e.target.value)}
              value={form.default_sort}
            >
              {[
                "featured",
                "popular",
                "newest",
                "price_asc",
                "price_desc",
                "name_asc",
                "name_desc",
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
        </div>
        <TextField
          label="Description"
          multiline
          onChange={(v) => set("description", v)}
          value={form.description}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CheckField
            checked={form.is_featured}
            label="Featured"
            onChange={(v) => set("is_featured", v)}
          />
          <CheckField
            checked={form.show_in_navigation}
            label="Show in navigation"
            onChange={(v) => set("show_in_navigation", v)}
          />
          <CheckField
            checked={form.show_on_homepage}
            label="Show on homepage"
            onChange={(v) => set("show_on_homepage", v)}
          />
          <CheckField
            checked={form.robots_index}
            label="Robots index"
            onChange={(v) => set("robots_index", v)}
          />
          <CheckField
            checked={form.robots_follow}
            label="Robots follow"
            onChange={(v) => set("robots_follow", v)}
          />
        </div>
        <div>
          <h3 className="text-lg font-black">Managed media</h3>
          {!selected ? (
            <Notice>Save the category before uploading media.</Notice>
          ) : !storage?.uploads_enabled ? (
            <Notice tone="error">
              Media storage unavailable. Existing paths remain editable.
            </Notice>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["category_image", "Category tile"],
                  ["category_icon", "Icon"],
                  ["category_desktop_banner", "Desktop banner"],
                  ["category_mobile_banner", "Mobile banner"],
                ] as [MediaPurpose, string][]
              ).map(([purpose, label]) => (
                <label
                  className="min-h-11 rounded-xl border border-dashed border-neutral-300 p-3 text-sm font-bold"
                  key={purpose}
                >
                  {label}
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-2 block w-full text-sm"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      void mediaUpload(purpose, e.target.files[0])
                    }
                    type="file"
                  />
                </label>
              ))}
            </div>
          )}
          {progress !== null ? <Notice>Uploading: {progress}%</Notice> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Meta title"
            onChange={(v) => set("meta_title", v)}
            value={form.meta_title}
          />
          <TextField
            label="Canonical URL"
            onChange={(v) => set("canonical_url", v)}
            value={form.canonical_url}
          />
          <TextField
            label="Meta description"
            multiline
            onChange={(v) => set("meta_description", v)}
            value={form.meta_description}
          />
        </div>
        {selected ? (
          <div>
            <h3 className="text-lg font-black">Aliases / Redirects</h3>
            <div className="mt-3 flex gap-2">
              <input
                className={inputClass}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="old-category-slug"
                value={alias}
              />
              <ActionButton
                onClick={() =>
                  void catalogApi
                    .addAlias(token, selected.id, {
                      alias_slug: alias,
                      redirect_code: 301,
                      is_active: true,
                    })
                    .then(() => choose(selected))
                    .then(() => setAlias(""))
                }
              >
                Add
              </ActionButton>
            </div>
            <div className="mt-3 grid gap-2">
              {selected.aliases.map((item) => (
                <div
                  className="flex items-center justify-between rounded-xl bg-neutral-50 p-3"
                  key={item.id}
                >
                  <span className="text-sm font-bold">
                    /{item.alias_slug} · {item.redirect_code}
                  </span>
                  <ActionButton
                    onClick={() =>
                      void catalogApi
                        .deleteAlias(token, item.id)
                        .then(() => choose(selected))
                    }
                    tone="danger"
                  >
                    Remove
                  </ActionButton>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </form>
    </section>
  );
}
