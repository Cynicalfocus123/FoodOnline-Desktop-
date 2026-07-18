import { resolveMediaUrl } from "../../lib/media.ts";
import { getPublicRouteHref } from "../../lib/routes.ts";
import type { Category, IconName } from "../../types/catalog";

export interface ApiCategoryDto {
  id?: string | number;
  uuid?: string;
  name?: string | null;
  slug?: string | null;
  image_url?: string | null;
  icon_url?: string | null;
  status?: "draft" | "published" | "archived";
  visibility?: "public" | "hidden" | "catalog_only";
  sort_order?: number;
  is_featured?: boolean;
  show_in_navigation?: boolean;
  show_on_homepage?: boolean;
  seo?: Category["seo"];
}

const icons: IconName[] = ["categories", "snack", "grocery", "beverage", "dairy", "fruit", "sweet", "tea", "meat", "organic"];

export function mapApiCategory(dto: ApiCategoryDto, index = 0): Category {
  const slug = dto.slug ?? `category-${dto.id ?? index}`;
  return {
    id: dto.id == null ? undefined : String(dto.id),
    uuid: dto.uuid,
    name: dto.name ?? slug,
    icon: icons[index % icons.length],
    image: dto.image_url ? resolveMediaUrl(dto.image_url) : "",
    sectionId: `category-${slug}`,
    categorySlug: slug,
    href: getPublicRouteHref(`category/${slug}`),
    seo: dto.seo,
    apiImageAvailable: Boolean(dto.image_url?.trim()),
    status: dto.status ?? "published",
    visibility: dto.visibility ?? "public",
    sortOrder: dto.sort_order ?? index,
    showInNavigation: Boolean(dto.show_in_navigation),
    showOnHomepage: Boolean(dto.show_on_homepage),
    isFeatured: Boolean(dto.is_featured),
    catalogOrigin: "api",
  };
}
