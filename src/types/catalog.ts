export type ProductImageFit = "contain" | "cover";

export type ProductImage = {
  url: string;
  fit?: ProductImageFit;
  alt?: string;
};

export type DeliveryTypeOption = "Local Delivery" | "GLOBAL+";
export type ProductTypeOption = "Deals" | "New Arrivals" | "Recently Restocked" | "SNAP";
export type MadeInOption = "USA" | "Spain" | "Russia" | "China" | "Korea" | "Japan";
export type CategoryFilterBrand = "NestFood" | "Stouffer" | "StarKist" | "Aldi" | "Adidas" | "Costco" | "Harris" | "ISnack" | "Burbe";

export type IconName =
  | "categories" | "snack" | "grocery" | "beverage" | "beauty" | "personal-care"
  | "home" | "electronics" | "baby" | "health" | "paan" | "dairy" | "fruit"
  | "breakfast" | "sweet" | "bakery" | "tea" | "grain" | "spice" | "sauce"
  | "meat" | "organic" | "pharma" | "cleaning" | "office" | "pet";

export type Category = {
  name: string;
  icon: IconName;
  image: string;
  sectionId: string;
  categorySlug: string;
  href: string;
};

export type ProductVariant = {
  id: string;
  label: string;
  packSize: string;
  price: number;
  unitPrice: string;
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
