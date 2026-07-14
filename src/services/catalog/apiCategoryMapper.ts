import { resolveMediaUrl } from "../../lib/media";
import { getPublicRouteHref } from "../../lib/routes";
import type { Category, IconName } from "../../types/catalog";

export interface ApiCategoryDto {
  id?: string | number;
  uuid?: string;
  name?: string | null;
  slug?: string | null;
  image_url?: string | null;
  icon_url?: string | null;
  is_featured?: boolean;
  show_in_navigation?: boolean;
  show_on_homepage?: boolean;
}

const icons: IconName[] = ["categories", "snack", "grocery", "beverage", "dairy", "fruit", "sweet", "tea", "meat", "organic"];

export function mapApiCategory(dto: ApiCategoryDto, index = 0): Category {
  const slug = dto.slug ?? `category-${dto.id ?? index}`;
  return {
    id: dto.id == null ? undefined : String(dto.id),
    uuid: dto.uuid,
    name: dto.name ?? slug,
    icon: icons[index % icons.length],
    image: dto.image_url ? resolveMediaUrl(dto.image_url) : `${import.meta.env.BASE_URL}assets/categories/paan-corner.jpg`,
    sectionId: `category-${slug}`,
    categorySlug: slug,
    href: getPublicRouteHref(`category/${slug}`),
  };
}
