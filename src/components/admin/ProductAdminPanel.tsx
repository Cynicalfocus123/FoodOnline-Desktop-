import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  adminError,
  catalogApi,
  uploadManagedImage,
} from "../../services/admin/catalogApi";
import type {
  AdminBrand,
  AdminCategory,
  AdminMedia,
  AdminNutrition,
  AdminProduct,
  AdminVariant,
  MediaStorageStatus,
} from "../../types/adminCatalog";
import { getPublicRouteHref } from "../../lib/routes";
import {
  ActionButton,
  CheckField,
  CountryField,
  Field,
  Notice,
  PanelHeader,
  TextField,
  inputClass,
} from "./CatalogCommon";

type Tab = "basics" | "variants" | "media" | "nutrition" | "publication";
const blankProduct = {
  category_id: "",
  brand_id: "",
  name: "",
  slug: "",
  description: "",
  country_of_origin_code: "",
  storage_type: "",
  ingredients_text: "",
  allergen_statement: "",
  storage_instructions: "",
  is_featured: false,
};
const blankVariant = {
  title: "",
  sku: "",
  gtin: "",
  size_label: "",
  net_content_value: "",
  net_content_unit: "",
  pack_count: "1",
  package_type: "",
  price_amount: "",
  compare_at_price_amount: "",
  currency_code: "USD",
  availability_status: "in_stock",
  is_default: false,
  is_active: true,
  sort_order: "0",
};
const blankNutrition = {
  serving_size: "",
  calories: "",
  total_fat_g: "",
  sodium_mg: "",
  total_carbohydrate_g: "",
  total_sugars_g: "",
  protein_g: "",
  ingredients_note: "",
  allergen_note: "",
};

export function ProductAdminPanel({
  token,
  storage,
}: {
  token: string;
  storage: MediaStorageStatus | null;
}) {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState(blankProduct);
  const [tab, setTab] = useState<Tab>("basics");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [availability, setAvailability] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [storageFilter, setStorageFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [progress, setProgress] = useState<number | null>(null);
  const query = useMemo(
    () =>
      `${search ? `&search=${encodeURIComponent(search)}` : ""}${status ? `&status=${status}` : ""}${categoryFilter ? `&category_id=${categoryFilter}` : ""}${brandFilter ? `&brand_id=${brandFilter}` : ""}${availability ? `&availability_status=${availability}` : ""}${countryFilter ? `&country_of_origin_code=${countryFilter}` : ""}${storageFilter ? `&storage_type=${storageFilter}` : ""}${featuredFilter ? `&is_featured=${featuredFilter}` : ""}${minPrice ? `&min_price=${minPrice}` : ""}${maxPrice ? `&max_price=${maxPrice}` : ""}`,
    [
      search,
      status,
      categoryFilter,
      brandFilter,
      availability,
      countryFilter,
      storageFilter,
      featuredFilter,
      minPrice,
      maxPrice,
    ],
  );
  const load = async () =>
    setItems((await catalogApi.products(token, query)).data);
  useEffect(() => {
    void Promise.all([
      catalogApi.categories(token),
      catalogApi.brands(token),
      catalogApi.products(token),
    ])
      .then(([c, b, p]) => {
        setCategories(c.data);
        setBrands(b.data);
        setItems(p.data);
      })
      .catch((error) => setMessage(adminError(error).message));
  }, [token]);
  const choose = async (item: AdminProduct) => {
    const detail = await catalogApi.product(token, item.uuid);
    setSelected(detail);
    setForm({
      category_id: detail.category_id,
      brand_id: detail.brand_internal_id
        ? String(detail.brand_internal_id)
        : "",
      name: detail.name,
      slug: detail.slug,
      description: detail.description ?? "",
      country_of_origin_code: detail.country_of_origin_code ?? "",
      storage_type: detail.storage_type ?? "",
      ingredients_text: detail.ingredients ?? "",
      allergen_statement: detail.allergen_statement ?? "",
      storage_instructions: detail.storage_instructions ?? "",
      is_featured: detail.is_featured,
    });
    setErrors({});
    setMessage("");
  };
  const refresh = async () => {
    if (selected) await choose(selected);
    await load();
  };
  async function save(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    try {
      const body = {
        ...form,
        category_id: Number(form.category_id),
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        country_of_origin_code: form.country_of_origin_code || null,
        storage_type: form.storage_type || null,
        description: form.description || null,
        ingredients_text: form.ingredients_text || null,
        allergen_statement: form.allergen_statement || null,
        storage_instructions: form.storage_instructions || null,
      };
      const saved = await catalogApi.saveProduct(
        token,
        selected?.uuid ?? null,
        body,
      );
      await load();
      await choose(saved);
      setMessage(
        selected
          ? "Product saved."
          : "Draft product created. Add at least one active default variant and one image before publishing.",
      );
      if (!selected) setTab("variants");
    } catch (error) {
      const clean = adminError(error);
      setMessage(clean.message);
      setErrors(clean.fields);
    }
  }
  async function action(next: "publish" | "restore" | "archive") {
    if (!selected) return;
    if (
      next === "archive" &&
      !confirm("Archive this product? It will no longer be publicly available.")
    )
      return;
    try {
      await catalogApi.productAction(token, selected.uuid, next);
      await refresh();
      setMessage(
        `Product ${next === "publish" ? "published" : next === "restore" ? "restored to draft" : "archived"}.`,
      );
    } catch (error) {
      const clean = adminError(error);
      setMessage(clean.message);
      setErrors(clean.fields);
      setTab("publication");
    }
  }
  const storefrontReasons = selected
    ? Object.values(selected.readiness_errors).flat().concat(selected.status !== "published" ? [`Status is ${selected.status}.`] : [])
    : ["Save the product to evaluate storefront access."];
  const storefrontUrl = selected ? getPublicRouteHref(`product/${selected.slug}`) : null;
  const filters = (
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      <input
        aria-label="Search products"
        className={inputClass}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Name, brand, SKU, GTIN"
        value={search}
      />
      <select
        aria-label="Status filter"
        className={inputClass}
        onChange={(e) => setStatus(e.target.value)}
        value={status}
      >
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
      <input
        aria-label="Country of origin filter"
        className={inputClass}
        maxLength={2}
        onChange={(e) => setCountryFilter(e.target.value.toUpperCase())}
        placeholder="Origin country code"
        value={countryFilter}
      />
      <select
        aria-label="Storage type filter"
        className={inputClass}
        onChange={(e) => setStorageFilter(e.target.value)}
        value={storageFilter}
      >
        <option value="">All storage types</option>
        <option value="ambient">Ambient</option>
        <option value="refrigerated">Refrigerated</option>
        <option value="frozen">Frozen</option>
      </select>
      <select
        aria-label="Featured filter"
        className={inputClass}
        onChange={(e) => setFeaturedFilter(e.target.value)}
        value={featuredFilter}
      >
        <option value="">Featured or standard</option>
        <option value="1">Featured only</option>
        <option value="0">Standard only</option>
      </select>
      <input
        aria-label="Minimum price filter"
        className={inputClass}
        min="0"
        onChange={(e) => setMinPrice(e.target.value)}
        placeholder="Minimum price"
        step="0.01"
        type="number"
        value={minPrice}
      />
      <input
        aria-label="Maximum price filter"
        className={inputClass}
        min="0"
        onChange={(e) => setMaxPrice(e.target.value)}
        placeholder="Maximum price"
        step="0.01"
        type="number"
        value={maxPrice}
      />
      <select
        aria-label="Category filter"
        className={inputClass}
        onChange={(e) => setCategoryFilter(e.target.value)}
        value={categoryFilter}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Brand filter"
        className={inputClass}
        onChange={(e) => setBrandFilter(e.target.value)}
        value={brandFilter}
      >
        <option value="">All brands</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Availability filter"
        className={inputClass}
        onChange={(e) => setAvailability(e.target.value)}
        value={availability}
      >
        <option value="">All availability</option>
        {["in_stock", "out_of_stock", "preorder", "backorder"].map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
      <ActionButton onClick={() => void load()} tone="secondary">
        Apply filters
      </ActionButton>
    </div>
  );
  return (
    <section className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
      <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft">
        <PanelHeader
          eyebrow="Catalog"
          title="Products"
          actions={
            <ActionButton
              onClick={() => {
                setSelected(null);
                setForm(blankProduct);
                setTab("basics");
              }}
            >
              New
            </ActionButton>
          }
        />
        {filters}
        <div className="mt-4 grid max-h-[58vh] gap-2 overflow-y-auto">
          {items.map((item) => (
            <button
              className={`grid grid-cols-[52px_1fr] gap-3 rounded-xl border p-3 text-left ${selected?.uuid === item.uuid ? "border-citrus-500 bg-orange-50" : "border-neutral-100"}`}
              key={item.uuid}
              onClick={() => void choose(item)}
              type="button"
            >
              <div className="h-12 w-12 rounded-lg bg-neutral-50">
                {item.primary_image ? (
                  <img
                    alt=""
                    className="h-full w-full object-contain"
                    src={item.primary_image}
                  />
                ) : null}
              </div>
              <span>
                <b className="block text-sm text-ink">{item.name}</b>
                <small className="text-neutral-500">
                  {item.brand ?? "No brand"} /{" "}
                  {item.category_name ?? "No category"}
                  <br />
                  {item.sku ?? "No SKU"} / {item.price ?? "No price"}{" "}
                  {item.currency_code ?? ""} /{" "}
                  {item.availability_status ?? "No variant"}
                  <br />
                  {item.status}
                  {item.is_featured ? " / Featured" : ""}
                  {item.updated_at
                    ? ` / Updated ${item.updated_at.slice(0, 10)}`
                    : ""}
                </small>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="min-w-0 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-7">
        <PanelHeader
          eyebrow={selected ? `Product / ${selected.status}` : "New draft"}
          title={selected?.name ?? "Create product"}
          actions={
            <div className="flex flex-wrap gap-2">
              {selected?.status === "archived" ? (
                <ActionButton
                  onClick={() => void action("restore")}
                  tone="secondary"
                >
                  Restore
                </ActionButton>
              ) : selected ? (
                <ActionButton
                  onClick={() => void action("archive")}
                  tone="danger"
                >
                  Archive
                </ActionButton>
              ) : null}
              <ActionButton
                onClick={() =>
                  document
                    .getElementById("product-basics-form")
                    ?.dispatchEvent(
                      new Event("submit", { bubbles: true, cancelable: true }),
                    )
                }
              >
                Save
              </ActionButton>
            </div>
          }
        />
        {message ? (
          <div className="mt-4">
            <Notice tone={Object.keys(errors).length ? "error" : "neutral"}>
              {message}
            </Notice>
          </div>
        ) : null}
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">Public Storefront Status</p>
              <p className={`mt-1 text-lg font-black ${selected && storefrontReasons.length === 0 ? "text-emerald-700" : "text-amber-700"}`}>
                {selected && storefrontReasons.length === 0 ? "Published and accessible" : "Not publicly accessible"}
              </p>
            </div>
            {storefrontUrl ? <ActionButton onClick={() => window.open(storefrontUrl, "_blank", "noopener,noreferrer")} tone="secondary">View on Storefront</ActionButton> : null}
          </div>
          {storefrontReasons.length ? <ul className="mt-2 grid gap-1 text-sm text-neutral-600">{storefrontReasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul> : <p className="mt-2 text-sm text-neutral-600">The current publication and catalog requirements are satisfied.</p>}
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {(
            ["basics", "variants", "media", "nutrition", "publication"] as Tab[]
          ).map((key) => (
            <button
              className={`min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-black ${tab === key ? "bg-[#112017] text-white" : "border border-neutral-200 bg-white text-neutral-700"}`}
              key={key}
              onClick={() => setTab(key)}
              type="button"
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        {tab === "basics" ? (
          <form
            className="mt-5 grid gap-5"
            id="product-basics-form"
            onSubmit={save}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field error={errors.category_id?.[0]} label="Category">
                <select
                  className={inputClass}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  value={form.category_id}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.path}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Brand">
                <select
                  className={inputClass}
                  onChange={(e) =>
                    setForm({ ...form, brand_id: e.target.value })
                  }
                  value={form.brand_id}
                >
                  <option value="">No brand</option>
                  {brands
                    .filter(
                      (b) => b.is_active || String(b.id) === form.brand_id,
                    )
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </Field>
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
                onChange={(v) =>
                  setForm({ ...form, country_of_origin_code: v })
                }
                value={form.country_of_origin_code}
              />
              <Field label="Storage type">
                <select
                  className={inputClass}
                  onChange={(e) =>
                    setForm({ ...form, storage_type: e.target.value })
                  }
                  value={form.storage_type}
                >
                  <option value="">Not specified</option>
                  <option value="ambient">Ambient</option>
                  <option value="refrigerated">Refrigerated</option>
                  <option value="frozen">Frozen</option>
                </select>
              </Field>
            </div>
            <TextField
              label="Description"
              multiline
              onChange={(v) => setForm({ ...form, description: v })}
              value={form.description}
            />
            <TextField
              label="Ingredients"
              multiline
              onChange={(v) => setForm({ ...form, ingredients_text: v })}
              value={form.ingredients_text}
            />
            <TextField
              label="Allergen statement"
              multiline
              onChange={(v) => setForm({ ...form, allergen_statement: v })}
              value={form.allergen_statement}
            />
            <TextField
              label="Storage instructions"
              multiline
              onChange={(v) => setForm({ ...form, storage_instructions: v })}
              value={form.storage_instructions}
            />
            <CheckField
              checked={form.is_featured}
              label="Featured product"
              onChange={(v) => setForm({ ...form, is_featured: v })}
            />
            <ActionButton type="submit">Save product</ActionButton>
          </form>
        ) : null}
        {tab === "variants" ? (
          <VariantEditor product={selected} refresh={refresh} token={token} />
        ) : null}
        {tab === "media" ? (
          <MediaEditor
            product={selected}
            progress={progress}
            refresh={refresh}
            setMessage={setMessage}
            setProgress={setProgress}
            storage={storage}
            token={token}
          />
        ) : null}
        {tab === "nutrition" ? (
          <NutritionEditor product={selected} token={token} />
        ) : null}
        {tab === "publication" ? (
          <PublicationPanel action={action} product={selected} />
        ) : null}
      </div>
    </section>
  );
}

function VariantEditor({
  product,
  token,
  refresh,
}: {
  product: AdminProduct | null;
  token: string;
  refresh: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<AdminVariant | null>(null);
  const [form, setForm] = useState(blankVariant);
  const [message, setMessage] = useState("");
  if (!product)
    return (
      <div className="mt-5">
        <Notice>Save the draft product before adding variants.</Notice>
      </div>
    );
  const productUuid = product.uuid;
  const unitPreview = (() => {
    const value = Number(form.net_content_value);
    const price = Number(form.price_amount);
    const pack = Number(form.pack_count) || 1;
    if (!(value > 0) || !(price > 0) || !form.net_content_unit) return null;
    const conversion: Record<string, [number, string]> = {
      mg: [0.001, "g"],
      g: [1, "g"],
      kg: [1000, "g"],
      ml: [1, "ml"],
      l: [1000, "ml"],
      fl_oz: [29.5735, "ml"],
      oz: [28.3495, "g"],
      lb: [453.592, "g"],
      ct: [1, "ct"],
    };
    const [multiplier, unit] = conversion[form.net_content_unit] ?? [
      1,
      form.net_content_unit,
    ];
    return `${form.currency_code} ${(price / (value * multiplier * pack)).toFixed(3)} / ${unit}`;
  })();
  const choose = (v: AdminVariant) => {
    setEditing(v);
    setForm({
      title: v.title,
      sku: v.sku,
      gtin: v.gtin ?? "",
      size_label: v.size_label ?? "",
      net_content_value: v.net_content_value ?? "",
      net_content_unit: v.net_content_unit ?? "",
      pack_count: String(v.pack_count),
      package_type: v.package_type ?? "",
      price_amount: v.price,
      compare_at_price_amount: v.old_price ?? "",
      currency_code: v.currency_code,
      availability_status: v.availability_status,
      is_default: v.is_default,
      is_active: v.is_active,
      sort_order: String(v.sort_order),
    });
  };
  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      await catalogApi.saveVariant(token, productUuid, editing?.uuid ?? null, {
        ...form,
        gtin: form.gtin || null,
        size_label: form.size_label || null,
        net_content_value: form.net_content_value || null,
        net_content_unit: form.net_content_unit || null,
        pack_count: Number(form.pack_count),
        package_type: form.package_type || null,
        price_amount: Number(form.price_amount),
        compare_at_price_amount: form.compare_at_price_amount
          ? Number(form.compare_at_price_amount)
          : null,
        sort_order: Number(form.sort_order),
      });
      await refresh();
      setEditing(null);
      setForm(blankVariant);
      setMessage("Variant saved.");
    } catch (error) {
      setMessage(adminError(error).message);
    }
  }
  return (
    <div className="mt-5 grid gap-5">
      <div className="grid gap-2">
        {product.variants.map((v) => (
          <div
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
            key={v.uuid}
          >
            <span>
              <b>{v.title}</b>
              <small className="ml-2 text-neutral-500">
                {v.sku} · {v.price} {v.currency_code} · {v.availability_status}
                {v.is_default ? " · Default" : ""}
              </small>
            </span>
            <div className="flex gap-2">
              <ActionButton onClick={() => choose(v)} tone="secondary">
                Edit
              </ActionButton>
              {!v.is_default ? (
                <ActionButton
                  onClick={() =>
                    void catalogApi.makeDefault(token, v.uuid).then(refresh)
                  }
                >
                  Make default
                </ActionButton>
              ) : null}
              <ActionButton
                onClick={() =>
                  confirm("Deactivate this variant?") &&
                  void catalogApi.deactivateVariant(token, v.uuid).then(refresh)
                }
                tone="danger"
              >
                Deactivate
              </ActionButton>
            </div>
          </div>
        ))}
      </div>
      {message ? <Notice>{message}</Notice> : null}
      <form
        className="grid gap-4 rounded-2xl bg-neutral-50 p-4"
        onSubmit={save}
      >
        <h3 className="text-lg font-black">
          {editing ? "Edit variant" : "Add variant"}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["title", "Title"],
              ["sku", "SKU"],
              ["gtin", "GTIN"],
              ["size_label", "Size label"],
              ["net_content_value", "Net content"],
              ["pack_count", "Pack count"],
              ["price_amount", "Price"],
              ["compare_at_price_amount", "Previous price"],
              ["sort_order", "Sort order"],
            ] as [keyof typeof form, string][]
          ).map(([key, label]) => (
            <TextField
              key={key}
              label={label}
              onChange={(v) => setForm({ ...form, [key]: v })}
              type={
                [
                  "net_content_value",
                  "pack_count",
                  "price_amount",
                  "compare_at_price_amount",
                  "sort_order",
                ].includes(key)
                  ? "number"
                  : "text"
              }
              value={String(form[key])}
            />
          ))}
          <Field label="Net unit">
            <select
              className={inputClass}
              onChange={(e) =>
                setForm({ ...form, net_content_unit: e.target.value })
              }
              value={form.net_content_unit}
            >
              <option value="">None</option>
              {["mg", "g", "kg", "ml", "l", "fl_oz", "oz", "lb", "ct"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
          </Field>
          <Field label="Package">
            <select
              className={inputClass}
              onChange={(e) =>
                setForm({ ...form, package_type: e.target.value })
              }
              value={form.package_type}
            >
              <option value="">None</option>
              {[
                "bag",
                "box",
                "bottle",
                "can",
                "jar",
                "pouch",
                "carton",
                "tray",
                "tub",
                "pack",
                "other",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Availability">
            <select
              className={inputClass}
              onChange={(e) =>
                setForm({ ...form, availability_status: e.target.value })
              }
              value={form.availability_status}
            >
              {["in_stock", "out_of_stock", "preorder", "backorder"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
          </Field>
          <Field label="Currency">
            <select
              className={inputClass}
              onChange={(e) =>
                setForm({ ...form, currency_code: e.target.value })
              }
              value={form.currency_code}
            >
              <option value="USD">USD</option>
            </select>
          </Field>
          <CheckField
            checked={form.is_active}
            label="Active"
            onChange={(v) => setForm({ ...form, is_active: v })}
          />
          <CheckField
            checked={form.is_default}
            label="Request as default"
            onChange={(v) => setForm({ ...form, is_default: v })}
          />
        </div>
        {unitPreview ? (
          <Notice>
            Unit price preview: {unitPreview}. Display guidance only; billing
            uses the saved variant price.
          </Notice>
        ) : null}
        <div className="flex gap-2">
          <ActionButton type="submit">Save variant</ActionButton>
          {editing ? (
            <ActionButton
              onClick={() => {
                setEditing(null);
                setForm(blankVariant);
              }}
              tone="secondary"
            >
              Cancel
            </ActionButton>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function MediaEditor({
  product,
  token,
  storage,
  progress,
  setProgress,
  setMessage,
  refresh,
}: {
  product: AdminProduct | null;
  token: string;
  storage: MediaStorageStatus | null;
  progress: number | null;
  setProgress: (n: number | null) => void;
  setMessage: (s: string) => void;
  refresh: () => Promise<void>;
}) {
  if (!product)
    return (
      <div className="mt-5">
        <Notice>Save the draft product before uploading images.</Notice>
      </div>
    );
  const productUuid = product.uuid;
  const mediaItems = product.media;
  async function upload(file: File, id?: string) {
    setProgress(0);
    try {
      await uploadManagedImage({
        token,
        purpose: "product_image",
        targetUuid: productUuid,
        productMediaId: id,
        file,
        onProgress: setProgress,
        metadata: { image_fit: "contain" },
      });
      await refresh();
      setMessage(
        id
          ? "Image replaced with a new immutable object."
          : "Product image uploaded.",
      );
    } catch (error) {
      setMessage(adminError(error).message);
    } finally {
      setProgress(null);
    }
  }
  async function move(index: number, delta: number) {
    const reordered = [...mediaItems];
    const target = index + delta;
    if (target < 0 || target >= reordered.length) return;
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];
    await catalogApi.reorderMedia(
      token,
      productUuid,
      reordered.map((m) => m.id),
    );
    await refresh();
  }
  return (
    <div className="mt-5 grid gap-4">
      {!storage?.uploads_enabled ? (
        <Notice tone="error">
          Media storage unavailable. Metadata controls remain available.
        </Notice>
      ) : mediaItems.length >= 12 ? (
        <Notice>Maximum of 12 images reached.</Notice>
      ) : (
        <label className="rounded-xl border border-dashed p-4 text-sm font-black">
          Upload Images
          <input
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block w-full"
            multiple
            onChange={(e) =>
              Array.from(e.target.files ?? [])
                .slice(0, 12 - mediaItems.length)
                .reduce(
                  (chain, file) => chain.then(() => upload(file)),
                  Promise.resolve(),
                )
            }
            type="file"
          />
        </label>
      )}
      {progress !== null ? (
        <Notice>Uploading directly to media storage: {progress}%</Notice>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {mediaItems.map((media, index) => (
          <MediaCard
            index={index}
            key={media.id}
            media={media}
            move={move}
            refresh={refresh}
            storage={storage}
            token={token}
            upload={upload}
          />
        ))}
      </div>
    </div>
  );
}
function MediaCard({
  media,
  index,
  token,
  storage,
  refresh,
  move,
  upload,
}: {
  media: AdminMedia;
  index: number;
  token: string;
  storage: MediaStorageStatus | null;
  refresh: () => Promise<void>;
  move: (i: number, d: number) => Promise<void>;
  upload: (f: File, id?: string) => Promise<void>;
}) {
  const [alt, setAlt] = useState(media.alt_text ?? "");
  const [fit, setFit] = useState(media.image_fit);
  return (
    <article className="grid gap-3 rounded-2xl border p-4">
      <div className="aspect-square rounded-xl bg-neutral-50">
        {media.url ? (
          <img
            alt={alt || "Product media preview"}
            className={`h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
            src={media.url}
          />
        ) : null}
      </div>
      <TextField label="Alt text" onChange={setAlt} value={alt} />
      <Field label="Image fit">
        <select
          className={inputClass}
          onChange={(e) => setFit(e.target.value as "contain" | "cover")}
          value={fit}
        >
          <option value="contain">Contain</option>
          <option value="cover">Cover</option>
        </select>
      </Field>
      <div className="flex flex-wrap gap-2">
        <ActionButton
          onClick={() =>
            void catalogApi
              .updateMedia(token, media.id, { alt_text: alt, image_fit: fit })
              .then(refresh)
          }
        >
          Save
        </ActionButton>
        {!media.is_primary ? (
          <ActionButton
            onClick={() =>
              void catalogApi.makePrimary(token, media.id).then(refresh)
            }
            tone="secondary"
          >
            Make primary
          </ActionButton>
        ) : (
          <span className="self-center text-sm font-black text-emerald-700">
            Primary image
          </span>
        )}
        <ActionButton onClick={() => void move(index, -1)} tone="secondary">
          Move up
        </ActionButton>
        <ActionButton onClick={() => void move(index, 1)} tone="secondary">
          Move down
        </ActionButton>
        <ActionButton
          onClick={() =>
            confirm(
              "Delete this image? Managed storage is removed only when safe.",
            ) && void catalogApi.deleteMedia(token, media.id).then(refresh)
          }
          tone="danger"
        >
          Delete
        </ActionButton>
        {storage?.uploads_enabled ? (
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border px-4 text-sm font-black">
            Replace
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) =>
                e.target.files?.[0] && void upload(e.target.files[0], media.id)
              }
              type="file"
            />
          </label>
        ) : null}
      </div>
    </article>
  );
}

function NutritionEditor({
  product,
  token,
}: {
  product: AdminProduct | null;
  token: string;
}) {
  const [form, setForm] = useState(blankNutrition);
  const [loaded, setLoaded] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (product && loaded !== product.uuid) {
      void catalogApi.nutrition(token, product.uuid).then((n) => {
        setForm(
          n
            ? (Object.fromEntries(
                Object.keys(blankNutrition).map((key) => [
                  key,
                  String(n[key as keyof AdminNutrition] ?? ""),
                ]),
              ) as typeof blankNutrition)
            : blankNutrition,
        );
        setLoaded(product.uuid);
      });
    }
  }, [product, token, loaded]);
  if (!product)
    return (
      <div className="mt-5">
        <Notice>Save the product before adding nutrition facts.</Notice>
      </div>
    );
  const productUuid = product.uuid;
  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      await catalogApi.saveNutrition(
        token,
        productUuid,
        Object.fromEntries(
          Object.entries(form).map(([key, value]) => [
            key,
            value === ""
              ? null
              : [
                    "calories",
                    "total_fat_g",
                    "sodium_mg",
                    "total_carbohydrate_g",
                    "total_sugars_g",
                    "protein_g",
                  ].includes(key)
                ? Number(value)
                : value,
          ]),
        ),
      );
      setMessage("Nutrition facts saved.");
    } catch (error) {
      setMessage(adminError(error).message);
    }
  }
  return (
    <form className="mt-5 grid gap-4" onSubmit={save}>
      {message ? <Notice>{message}</Notice> : null}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.keys(blankNutrition)
          .filter((k) => !k.endsWith("note"))
          .map((key) => (
            <TextField
              key={key}
              label={key.replaceAll("_", " ")}
              onChange={(v) => setForm({ ...form, [key]: v })}
              type={key === "serving_size" ? "text" : "number"}
              value={form[key as keyof typeof form]}
            />
          ))}
      </div>
      <TextField
        label="Ingredients note"
        multiline
        onChange={(v) => setForm({ ...form, ingredients_note: v })}
        value={form.ingredients_note}
      />
      <TextField
        label="Allergen note"
        multiline
        onChange={(v) => setForm({ ...form, allergen_note: v })}
        value={form.allergen_note}
      />
      <div className="flex gap-2">
        <ActionButton type="submit">Save nutrition</ActionButton>
        <ActionButton
          onClick={() =>
            confirm("Delete nutrition facts for this product?") &&
            void catalogApi.deleteNutrition(token, productUuid).then(() => {
              setForm(blankNutrition);
              setMessage("Nutrition facts deleted.");
            })
          }
          tone="danger"
        >
          Delete
        </ActionButton>
      </div>
    </form>
  );
}
function PublicationPanel({
  product,
  action,
}: {
  product: AdminProduct | null;
  action: (a: "publish" | "restore" | "archive") => Promise<void>;
}) {
  if (!product)
    return (
      <div className="mt-5">
        <Notice>
          Create the product before reviewing publication readiness.
        </Notice>
      </div>
    );
  const messages = Object.entries(product.readiness_errors).flatMap(
    ([key, values]) =>
      values.map((value) => `${key.replaceAll("_", " ")}: ${value}`),
  );
  return (
    <div className="mt-5 grid gap-4">
      <div className="rounded-2xl border p-5">
        <p className="text-sm font-black uppercase text-neutral-500">
          Current status
        </p>
        <p className="mt-2 text-2xl font-black">{product.status}</p>
      </div>
      {messages.length ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-black text-amber-900">Not ready to publish</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-semibold text-amber-900">
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : (
        <Notice tone="success">
          Ready to publish: category, default variant, price, currency, and
          primary image checks pass.
        </Notice>
      )}
      <div className="flex gap-2">
        {product.status !== "published" ? (
          <ActionButton
            disabled={messages.length > 0}
            onClick={() => void action("publish")}
          >
            Publish product
          </ActionButton>
        ) : (
          <ActionButton onClick={() => void action("archive")} tone="danger">
            Archive product
          </ActionButton>
        )}
      </div>
    </div>
  );
}
