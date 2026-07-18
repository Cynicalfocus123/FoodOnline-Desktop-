export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
};

export type CategoryAlias = {
  id: string;
  alias_slug: string;
  redirect_code: 301 | 302;
  is_active: boolean;
};
export type AdminCategory = {
  id: string;
  uuid: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  status: "draft" | "published" | "archived";
  visibility: "public" | "hidden" | "catalog_only";
  sort_order: number;
  depth: number;
  path: string;
  is_featured: boolean;
  show_in_navigation: boolean;
  show_on_homepage: boolean;
  default_sort: string;
  media: Record<string, string | null>;
  seo: {
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    robots_index: boolean;
    robots_follow: boolean;
  };
  aliases: CategoryAlias[];
};
export type AdminBrand = {
  id: string;
  uuid: string;
  name: string;
  slug: string;
  logo_path: string | null;
  logo_url: string | null;
  country_code: string | null;
  is_active: boolean;
  sort_order: number;
};
export type AdminVariant = {
  id: string;
  uuid: string;
  title: string;
  sku: string;
  gtin: string | null;
  size_label: string | null;
  net_content_value: string | null;
  net_content_unit: string | null;
  pack_count: number;
  package_type: string | null;
  price: string;
  old_price: string | null;
  currency_code: string;
  availability_status: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
};
export type AdminMedia = {
  id: string;
  path: string;
  url: string | null;
  alt_text: string | null;
  image_fit: "contain" | "cover";
  is_primary: boolean;
  sort_order: number;
};
export type AdminNutrition = {
  serving_size: string | null;
  calories: number | null;
  total_fat_g: string | null;
  sodium_mg: string | null;
  total_carbohydrate_g: string | null;
  total_sugars_g: string | null;
  protein_g: string | null;
  ingredients_note: string | null;
  allergen_note: string | null;
};
export type AdminProduct = {
  id: string;
  internal_id: number;
  uuid: string;
  name: string;
  slug: string;
  category_id: string;
  category_name: string | null;
  brand_internal_id: number | null;
  brand: string | null;
  description: string | null;
  country_of_origin_code: string | null;
  storage_type: string | null;
  ingredients: string | null;
  allergen_statement: string | null;
  storage_instructions: string | null;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  availability_status: string | null;
  sku: string | null;
  primary_image: string | null;
  price: string | null;
  currency_code: string | null;
  updated_at: string | null;
  variants: AdminVariant[];
  media: AdminMedia[];
  nutrition_facts?: AdminNutrition | null;
  readiness_errors: Record<string, string[]>;
};
export type MediaStorageStatus = {
  uploads_available: boolean;
  strategy: "multipart" | "direct";
  accepted_types: string[];
  maximum_size_bytes: Record<string, number>;
};
export type MediaStorageState = {
  phase: "checking" | "available" | "unavailable";
  status: MediaStorageStatus | null;
};
export type MediaPurpose =
  | "product_image"
  | "brand_logo"
  | "category_image"
  | "category_icon"
  | "category_desktop_banner"
  | "category_mobile_banner"
  | "review_image"
  | "return_evidence"
  | "support_attachment";
