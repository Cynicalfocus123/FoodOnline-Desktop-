import { resolveMediaUrl } from "../../lib/media";
import type { Product, ProductImageFit, ProductVariant } from "../../types/catalog";
import { applyPresentationCompatibility } from "./presentationCompatibility";
import { productFallbackArtwork } from "../../components/productVisuals";

export interface ApiVariantDto {
  id?: string | number;
  uuid?: string;
  title?: string | null;
  sku?: string | null;
  gtin?: string | null;
  size?: string | null;
  price?: string | number | null;
  old_price?: string | number | null;
  currency_code?: string | null;
  availability_status?: ProductVariant["availabilityStatus"] | null;
  in_stock?: boolean | null;
  is_default?: boolean;
}

export interface ApiProductDto {
  id?: string | number;
  uuid?: string;
  name?: string | null;
  slug?: string | null;
  category_slug?: string | null;
  category_id?: string | number | null;
  category_name?: string | null;
  price?: string | number | null;
  old_price?: string | number | null;
  primary_image?: string | null;
  image_urls?: Array<string | null> | null;
  images?: Array<{ url?: string | null; alt?: string | null; image_fit?: ProductImageFit | null }> | null;
  image_fit?: ProductImageFit | null;
  in_stock?: boolean | number | null;
  availability_status?: ProductVariant["availabilityStatus"] | null;
  variants?: ApiVariantDto[] | null;
  default_variant?: ApiVariantDto | null;
  brand?: string | null;
  brand_id?: string | null;
  brand_summary?: { name?: string | null; country_code?: string | null; logo_url?: string | null } | null;
  size?: string | null;
  description?: string | null;
  country_of_origin_code?: string | null;
  storage_type?: string | null;
  ingredients?: string | null;
  allergen_statement?: string | null;
  storage_instructions?: string | null;
  sku?: string | null;
  nutrition_facts?: { serving_size?: string | null; calories?: number | null; total_fat_g?: string | null; sodium_mg?: string | null; total_carbohydrate_g?: string | null; total_sugars_g?: string | null; protein_g?: string | null; ingredients_note?: string | null; allergen_note?: string | null } | null;
  sold_count?: number | null;
  review_summary?: { average_rating?: number; review_count?: number; breakdown?: Record<string, number> } | null;
}

function numberValue(value: string | number | null | undefined, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function media(value: string | null | undefined) {
  return value?.trim() ? resolveMediaUrl(value) : null;
}

function mapVariant(dto: ApiVariantDto, fallbackId: string, fallbackPrice: number): ProductVariant {
  const price = numberValue(dto.price, fallbackPrice);
  const oldPrice = dto.old_price == null ? undefined : numberValue(dto.old_price);
  return {
    id: dto.uuid ?? String(dto.id ?? fallbackId),
    uuid: dto.uuid,
    label: dto.title ?? "Default",
    packSize: dto.size ?? "Standard pack",
    price,
    oldPrice,
    unitPrice: `${new Intl.NumberFormat("en-US", { style: "currency", currency: dto.currency_code ?? "USD" }).format(price)}/pack`,
    currencyCode: dto.currency_code ?? "USD",
    availabilityStatus: dto.availability_status ?? (dto.in_stock === false ? "out_of_stock" : "in_stock"),
    inStock: dto.in_stock ?? dto.availability_status === "in_stock",
    sku: dto.sku ?? undefined,
    gtin: dto.gtin ?? undefined,
  };
}

export function mapApiProduct(dto: ApiProductDto): Product {
  const id = dto.uuid ?? String(dto.id ?? dto.slug ?? "unknown-product");
  const price = numberValue(dto.price);
  const imageUrls = [
    ...(dto.images ?? []).map((image) => media(image.url)),
    ...(dto.image_urls ?? []).map(media),
    media(dto.primary_image),
  ].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);
  const hasApiMedia = imageUrls.length > 0;
  const hasApiVariants = Boolean(dto.variants?.length || dto.default_variant?.uuid || dto.default_variant?.id);
  const variants = (dto.variants ?? []).map((variant, index) => mapVariant(variant, `${id}-variant-${index + 1}`, price));
  const defaultVariant = dto.default_variant ? mapVariant(dto.default_variant, `${id}-default`, price) : variants.find((variant) => variant.id === id) ?? variants[0];
  const effectiveVariants = variants.length ? variants : [defaultVariant ?? mapVariant({ uuid: `${id}-default`, title: "Default", size: dto.size, price, availability_status: dto.availability_status, in_stock: Boolean(dto.in_stock) }, `${id}-default`, price)];
  const effectiveDefault = defaultVariant ?? effectiveVariants[0];
  const primaryImage = imageUrls[0] ?? productFallbackArtwork(dto.name ?? "Catalog product");
  const slug = dto.slug ?? String(dto.name ?? id).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const product: Product = {
    id,
    uuid: dto.uuid ?? id,
    slug,
    brand: dto.brand_summary?.name ?? dto.brand ?? "FoodOnlines",
    name: dto.name ?? "Catalog product",
    categorySlug: dto.category_slug ?? "catalog",
    size: dto.size ?? effectiveDefault.packSize,
    price: effectiveDefault.price,
    oldPrice: effectiveDefault.oldPrice,
    discountPercent: effectiveDefault.oldPrice ? Math.round((1 - effectiveDefault.price / effectiveDefault.oldPrice) * 100) : undefined,
    deliveryTime: "Fast delivery",
    image: primaryImage,
    imageUrls: imageUrls.length ? imageUrls : [primaryImage],
    imageFit: dto.image_fit ?? dto.images?.[0]?.image_fit ?? "contain",
    inStock: effectiveDefault.inStock,
    unitPrice: effectiveDefault.unitPrice,
    soldCount: Number(dto.sold_count ?? 0),
    categoryId: dto.category_id == null ? dto.category_slug ?? "" : String(dto.category_id),
    categoryName: dto.category_name ?? "Catalog",
    deliveryType: "Local Delivery",
    productType: "New Arrivals",
    madeIn: "USA",
    tags: [],
    badges: [],
    provider: "FoodOnlines",
    country: "Unknown",
    countryOfOrigin: dto.country_of_origin_code ?? "Unknown",
    brandOrigin: dto.brand_summary?.country_code ?? "Unknown",
    netContent: effectiveDefault.packSize,
    quantity: effectiveDefault.packSize,
    description: dto.description ?? "Product details are provided by the FoodOnlines catalog.",
    ingredients: dto.ingredients ?? undefined,
    storageInstructions: dto.storage_instructions ?? undefined,
    sku: dto.sku ?? effectiveDefault.sku ?? effectiveDefault.id,
    recipeSuggestions: [],
    nutritionFacts: {
      servingSize: dto.nutrition_facts?.serving_size ?? "See package",
      calories: dto.nutrition_facts?.calories ?? 0,
      totalFat: dto.nutrition_facts?.total_fat_g ?? "Not supplied",
      sodium: dto.nutrition_facts?.sodium_mg ?? "Not supplied",
      carbohydrates: dto.nutrition_facts?.total_carbohydrate_g ?? "Not supplied",
      sugar: dto.nutrition_facts?.total_sugars_g ?? "Not supplied",
      protein: dto.nutrition_facts?.protein_g ?? "Not supplied",
      ingredientsNote: dto.nutrition_facts?.ingredients_note ?? undefined,
      allergenNote: dto.nutrition_facts?.allergen_note ?? dto.allergen_statement ?? undefined,
    },
    returnPolicy: "See our return policy.",
    reviews: [],
    reviewTags: [],
    averageRating: Number(dto.review_summary?.average_rating ?? 0),
    ratingBreakdown: { 1: Number(dto.review_summary?.breakdown?.["1"] ?? 0), 2: Number(dto.review_summary?.breakdown?.["2"] ?? 0), 3: Number(dto.review_summary?.breakdown?.["3"] ?? 0), 4: Number(dto.review_summary?.breakdown?.["4"] ?? 0), 5: Number(dto.review_summary?.breakdown?.["5"] ?? 0) },
    reviewCount: Number(dto.review_summary?.review_count ?? 0),
    variants: effectiveVariants,
    apiBacked: true,
    catalogOrigin: "api",
    compatibilityOnly: false,
    apiMediaAvailable: hasApiMedia,
    apiVariantsAvailable: hasApiVariants,
    apiReviewDataAvailable: dto.review_summary != null,
    apiNutritionDataAvailable: dto.nutrition_facts != null,
    apiSoldCountAvailable: dto.sold_count != null,
  };
  return applyPresentationCompatibility({ ...product, price: effectiveDefault.price, oldPrice: effectiveDefault.oldPrice, inStock: effectiveDefault.inStock });
}
