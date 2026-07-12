import { resolveMediaUrl } from "../../lib/media";
import type { Product, ProductImageFit, ProductVariant } from "../../types/catalog";

export interface ApiProductDto {
  id: string | number;
  name?: string | null;
  category_slug?: string | null;
  category_id?: string | number | null;
  category_name?: string | null;
  price?: string | number | null;
  old_price?: string | number | null;
  primary_image?: string | null;
  image_urls?: Array<string | null> | null;
  image_fit?: ProductImageFit | null;
  in_stock?: boolean | number | null;
  variants?: ProductVariant[] | null;
  brand?: string | null;
  size?: string | null;
  description?: string | null;
  sku?: string | null;
}

function toFiniteNumber(value: string | number | null | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveOptionalMediaUrl(value: string | null | undefined) {
  return value?.trim() ? resolveMediaUrl(value) : null;
}

export function mapApiProduct(dto: ApiProductDto, fallback: Product): Product {
  const imageUrls = (dto.image_urls ?? [])
    .map(resolveOptionalMediaUrl)
    .filter((url): url is string => Boolean(url));
  const primaryImage = resolveOptionalMediaUrl(dto.primary_image) ?? imageUrls[0] ?? fallback.image;
  const normalizedImages = imageUrls.length ? imageUrls : [primaryImage, ...fallback.imageUrls.slice(1)];

  return {
    ...fallback,
    id: String(dto.id),
    name: dto.name ?? fallback.name,
    categorySlug: dto.category_slug ?? fallback.categorySlug,
    categoryId: dto.category_id == null ? fallback.categoryId : String(dto.category_id),
    categoryName: dto.category_name ?? fallback.categoryName,
    price: toFiniteNumber(dto.price, fallback.price),
    oldPrice: dto.old_price == null ? undefined : toFiniteNumber(dto.old_price, fallback.oldPrice ?? fallback.price),
    image: primaryImage,
    imageUrls: normalizedImages,
    imageFit: dto.image_fit ?? fallback.imageFit,
    inStock: dto.in_stock == null ? fallback.inStock : Boolean(dto.in_stock),
    variants: dto.variants ?? fallback.variants,
    brand: dto.brand ?? fallback.brand,
    size: dto.size ?? fallback.size,
    description: dto.description ?? fallback.description,
    sku: dto.sku ?? fallback.sku,
  };
}
