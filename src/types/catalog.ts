export type ProductImageFit = "contain" | "cover";

export type ProductImage = {
  url: string;
  fit?: ProductImageFit;
  alt?: string;
};

export type DeliveryTypeOption = "Local Delivery" | "GLOBAL+";
export type ProductTypeOption = "Deals" | "New Arrivals" | "Recently Restocked" | "SNAP";
export type MadeInOption = "USA" | "Spain" | "Russia" | "China" | "Korea" | "Japan";
export type CategoryFilterBrand = string;

export type IconName =
  | "categories" | "snack" | "grocery" | "beverage" | "beauty" | "personal-care"
  | "home" | "electronics" | "baby" | "health" | "paan" | "dairy" | "fruit"
  | "breakfast" | "sweet" | "bakery" | "tea" | "grain" | "spice" | "sauce"
  | "meat" | "organic" | "pharma" | "cleaning" | "office" | "pet";

export type Category = {
  id?: string;
  uuid?: string;
  name: string;
  icon: IconName;
  image: string;
  sectionId: string;
  categorySlug: string;
  href: string;
  seo?: { title?: string | null; description?: string | null; canonical_url?: string | null; robots_index?: boolean; robots_follow?: boolean };
  apiImageAvailable?: boolean;
  status?: "draft" | "published" | "archived";
  visibility?: "public" | "hidden" | "catalog_only";
  sortOrder?: number;
  showInNavigation?: boolean;
  showOnHomepage?: boolean;
  isFeatured?: boolean;
  catalogOrigin?: ProductSourceIdentity;
};

export type ProductVariant = {
  id: string;
  uuid?: string;
  label: string;
  packSize: string;
  price: number;
  unitPrice: string;
  oldPrice?: number;
  currencyCode?: string;
  availabilityStatus?: "in_stock" | "out_of_stock" | "preorder" | "backorder";
  inStock?: boolean;
  sku?: string;
  gtin?: string;
};

export type ProductSourceIdentity = "local" | "api" | "hybrid";

export type ProductCompatibilityState = {
  localProductIds: string[];
  localVariantToApiVariant: Record<string, string>;
};

export type RecipeSuggestion = {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  usage: string;
  ingredients: string[];
};

export type NutritionFacts = {
  servingSize: string;
  calories: number;
  totalFat: string;
  sodium: string;
  carbohydrates: string;
  sugar: string;
  protein: string;
  ingredientsNote?: string;
  allergenNote?: string;
};

export type ProductReview = {
  id: string;
  customerName: string;
  rating: number;
  text: string;
  date: string;
  verifiedPurchase: boolean;
  isPurchased: boolean;
  images: string[];
  tags: string[];
};

export type RatingBreakdown = Record<1 | 2 | 3 | 4 | 5, number>;

export type Product = {
  id: string;
  uuid?: string;
  slug: string;
  brand: string;
  name: string;
  categorySlug: string;
  size: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  deliveryTime: string;
  image: string;
  imageUrls: string[];
  imageFit?: ProductImageFit;
  inStock?: boolean;
  unitPrice: string;
  soldCount: number;
  categoryId: string;
  categoryName: string;
  deliveryType: DeliveryTypeOption;
  productType: ProductTypeOption;
  madeIn: MadeInOption;
  tags: string[];
  badges: string[];
  provider: string;
  country: string;
  countryOfOrigin: string;
  brandOrigin: string;
  netContent: string;
  quantity: string;
  description: string;
  ingredients?: string;
  storageInstructions?: string;
  sku: string;
  recipeSuggestions: RecipeSuggestion[];
  nutritionFacts: NutritionFacts;
  returnPolicy: string;
  reviews: ProductReview[];
  reviewTags: string[];
  averageRating: number;
  ratingBreakdown: RatingBreakdown;
  reviewCount: number;
  variants: ProductVariant[];
  apiBacked?: boolean;
  catalogOrigin?: ProductSourceIdentity;
  compatibilityOnly?: boolean;
  apiMediaAvailable?: boolean;
  apiVariantsAvailable?: boolean;
  apiReviewDataAvailable?: boolean;
  apiNutritionDataAvailable?: boolean;
  apiSoldCountAvailable?: boolean;
  compatibility?: ProductCompatibilityState;
};

export type ProductItem = Product;

export type ProductCarouselSection = {
  title: string;
  sectionId: string;
  seeAllHref: string;
  items: Product[];
};

export type ProductSortOption = "featured" | "best-selling" | "price-low" | "price-high";

export type CatalogQuery = {
  categorySlug?: string;
  search?: string;
  brand?: string;
  countryOfOrigin?: string;
  storageType?: "ambient" | "refrigerated" | "frozen";
  availability?: ProductVariant["availabilityStatus"];
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sort?: ProductSortOption;
};

export type PaginatedProductResult = {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
};
