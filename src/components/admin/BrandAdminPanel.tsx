import { FormEvent, useEffect, useState } from "react";
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
}: {
  token: string;
  storage: MediaStorageState;
}) {
  const [items, setItems] = useState<AdminBrand[]>([]);
  const [selected, setSelected] = useState<AdminBrand | null>(null);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [pendingLogo, setPendingLogo] = useState<{ file: File; previewUrl: string } | null>(null);
  const clearPendingLogo = () => setPendingLogo((current) => {
    if (current) URL.revokeObjectURL(current.previewUrl);
    return null;
  });
  const load = async () =>
    setItems(
      (
        await catalogApi.brands(
          token,
          search ? `&search=${encodeURIComponent(search)}` : "",
        )
      ).data,
    );
  useEffect(() => {
    void load().catch((error) => setMessage(adminError(error).message));
  }, [token]);
  const choose = (item: AdminBrand) => {
    clearPendingLogo();
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
    setErrors({});
    try {
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
          setMessage(`Brand saved. ${adminError(error).message}`);
        } finally {
          setProgress(null);
        }
      }
      await load();
      setSelected(finalItem);
      setForm({ name: finalItem.name, slug: finalItem.slug, country_code: finalItem.country_code ?? "", logo_path: finalItem.logo_path ?? "", is_active: finalItem.is_active, sort_order: String(finalItem.sort_order) });
      if (!uploadFailed) setMessage(pendingLogo ? "Brand and selected image saved." : "Brand saved.");
    } catch (error) {
      const clean = adminError(error);
      setMessage(clean.message);
      setErrors(clean.fields);
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
  return (
    <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft">
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
      </div>
      <form
        className="grid gap-5 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-7"
        onSubmit={save}
      >
        <PanelHeader
          eyebrow={selected ? "Edit brand" : "New brand"}
          title={selected?.name ?? "Create brand"}
          actions={<ActionButton type="submit">Save</ActionButton>}
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
