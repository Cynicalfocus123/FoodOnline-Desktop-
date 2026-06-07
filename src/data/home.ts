const localAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const PRODUCT_SIZES = [
  "500 g",
  "1 kg",
  "750 ml",
  "12 pcs",
  "400 g",
  "900 g",
  "330 ml",
  "6 pcs",
  "250 g",
  "1.5 L",
  "700 g",
  "2 pcs",
  "850 g",
  "1 pack",
  "390 g",
];

const PRODUCT_PRICES = [
  3.99,
  4.49,
  5.29,
  6.19,
  7.49,
  8.29,
  9.59,
  10.49,
  11.99,
  12.49,
  13.25,
  14.1,
  15.45,
  16.89,
  18.25,
];

const DELIVERY_BADGES = ["12 MINS", "15 MINS", "18 MINS", "20 MINS"];
const FILTER_BRANDS = ["NestFood", "Stouffer", "StarKist", "Aldi", "Adidas", "Costco", "Harris", "ISnack", "Burbe"] as const;
const DELIVERY_TYPES = ["Local Delivery", "GLOBAL+"] as const;
const PRODUCT_TYPES = ["Deals", "New Arrivals", "Recently Restocked", "SNAP"] as const;
const MADE_IN_OPTIONS = ["USA", "Spain", "Russia", "China", "Korea", "Japan"] as const;
const LISTING_VARIATION_LABELS = ["", " Family Pack", " Pantry Pick", " Weekly Value"];
const DAIRY_BREAD_CATEGORY_NAME = "Dairy, Bread & Eggs";
const FRUITS_VEGETABLES_CATEGORY_NAME = "Fruits & Vegetables";
const DRINKS_BEVERAGE_CATEGORY_NAME = "Cold Drinks & Juices";
const SNACKS_MUNCHIES_CATEGORY_NAME = "Snacks & Munchies";
const BREAKFAST_INSTANT_FOOD_CATEGORY_NAME = "Breakfast & Instant Food";
const SWEET_TOOTH_CATEGORY_NAME = "Sweet Tooth";
const BAKERY_BISCUITS_CATEGORY_NAME = "Bakery & Biscuits";
const ATTA_RICE_DAL_CATEGORY_NAME = "Atta, Rice & Dal";
const TEA_COFFEE_MILK_DRINKS_CATEGORY_NAME = "Tea, Coffee & Milk Drinks";
const MASALA_OIL_MORE_CATEGORY_NAME = "Masala, Oil & More";
const SAUCES_SPREADS_CATEGORY_NAME = "Sauces & Spreads";
const VEGAN_FOODS_CATEGORY_NAME = "Vegan Foods";
const CHICKEN_MEAT_FISH_CATEGORY_NAME = "Chicken, Meat & Fish";
const ORGANIC_HEALTHY_LIVING_CATEGORY_NAME = "Organic & Healthy Living";
const FROZEN_CATEGORY_NAME = "Frozen";
const dairyBreadMockupAssetPaths = [
  ...Array.from({ length: 5 }, (_, index) => localAsset(`assets/dairy-bread-mockups/dairy-bread-${String(index + 1).padStart(2, "0")}.avif`)),
  ...Array.from({ length: 41 }, (_, index) => localAsset(`assets/dairy-bread-mockups/dairy-bread-${String(index + 6).padStart(2, "0")}.png`)),
  ...Array.from({ length: 3 }, (_, index) => localAsset(`assets/dairy-bread-mockups/dairy-bread-${String(index + 47).padStart(2, "0")}.avif`)),
];
const fruitVegetableMockupAssetPaths = [
  ...Array.from({ length: 60 }, (_, index) => {
    const fileIndex = index + 1;
    const extension = fileIndex === 53 ? "jpg" : fileIndex === 60 ? "png" : "avif";
    return localAsset(`assets/fruits-vegetables-mockups/fruits-vegetables-${String(fileIndex).padStart(2, "0")}.${extension}`);
  }),
];
const drinksBeverageMockupAssetPaths = Array.from({ length: 60 }, (_, index) => {
  const fileIndex = index + 1;
  const extension = fileIndex >= 25 && fileIndex <= 56 ? "png" : "avif";
  return localAsset(`assets/drinks-beverage-mockups/drinks-beverage-${String(fileIndex).padStart(2, "0")}.${extension}`);
});
const snacksMunchiesMockupAssetPaths = Array.from({ length: 60 }, (_, index) =>
  localAsset(`assets/snacks-munchies-mockups/snacks-munchies-${String(index + 1).padStart(2, "0")}.png`),
);
const breakfastInstantFoodMockupAssetPaths = Array.from({ length: 60 }, (_, index) => {
  const fileIndex = index + 1;
  const extension = fileIndex >= 8 && fileIndex <= 41 ? "png" : "avif";
  return localAsset(
    `assets/breakfast-instant-food-mockups/breakfast-instant-food-${String(fileIndex).padStart(2, "0")}.${extension}`,
  );
});
const sweetToothMockupAssetPaths = Array.from({ length: 60 }, (_, index) => {
  const fileIndex = index + 1;
  const extension = fileIndex <= 26 ? "avif" : "png";
  return localAsset(`assets/sweet-tooth-mockups/sweet-tooth-${String(fileIndex).padStart(2, "0")}.${extension}`);
});
const bakeryBiscuitsMockupAssetPaths = Array.from({ length: 60 }, (_, index) =>
  localAsset(`assets/bakery-biscuits-mockups/bakery-biscuits-${String(index + 1).padStart(2, "0")}.avif`),
);
const attaRiceDalMockupAssetPaths = Array.from({ length: 60 }, (_, index) =>
  localAsset(`assets/atta-rice-dal-mockups/atta-rice-dal-${String(index + 1).padStart(2, "0")}.avif`),
);
const teaCoffeeMilkDrinksMockupAssetPaths = Array.from({ length: 60 }, (_, index) =>
  localAsset(`assets/tea-coffee-milk-drinks-mockups/tea-coffee-milk-drinks-${String(index + 1).padStart(2, "0")}.avif`),
);
const masalaOilMoreMockupAssetPaths = Array.from({ length: 60 }, (_, index) => {
  const fileIndex = index + 1;
  const extension = fileIndex === 31 ? "webp" : "avif";
  return localAsset(`assets/masala-oil-more-mockups/masala-oil-more-${String(fileIndex).padStart(2, "0")}.${extension}`);
});
const saucesSpreadsMockupAssetPaths = Array.from({ length: 60 }, (_, index) =>
  localAsset(`assets/sauces-spreads-mockups/sauces-spreads-${String(index + 1).padStart(2, "0")}.avif`),
);
const chickenMeatFishMockupAssetPaths = Array.from({ length: 60 }, (_, index) =>
  localAsset(`assets/chicken-meat-fish-mockups/chicken-meat-fish-${String(index + 1).padStart(2, "0")}.avif`),
);
const organicHealthyLivingMockupAssetPaths = Array.from({ length: 60 }, (_, index) =>
  localAsset(`assets/organic-healthy-living-mockups/organic-healthy-living-${String(index + 1).padStart(2, "0")}.avif`),
);
const veganFoodsMockupAssetPaths = Array.from({ length: 60 }, (_, index) =>
  localAsset(`assets/vegan-foods-mockups/vegan-foods-${String(index + 1).padStart(2, "0")}.avif`),
);
const frozenMockupAssetPaths = Array.from({ length: 60 }, (_, index) =>
  localAsset(`assets/frozen-mockups/frozen-${String(index + 1).padStart(2, "0")}.avif`),
);

const PRODUCT_NAMES_BY_CATEGORY: Record<string, string[]> = {
  "Paan Corner": [
    "Royal Paan Masala Mix",
    "Mouth Freshener Seeds",
    "Sweet Betel Candy Pack",
    "Classic Supari Bites",
    "Mint Paan Drops",
    "Rose Gulkand Filling",
    "Meetha Paan Paste",
    "Silver Fennel Blend",
    "Cardamom Paan Cubes",
    "Sada Paan Kit",
    "Premium Chuna Pack",
    "Paan Leaf Preserve",
    "Kulfi Paan Candy",
    "Tobacco-Free Zarda Mix",
    "After Meal Paan Treats",
  ],
  "Dairy, Bread & Eggs": [
    "Farm Fresh Whole Milk",
    "Golden Brown Bread Loaf",
    "Cage-Free Large Eggs",
    "Salted Creamery Butter",
    "Greek Style Yogurt Cup",
    "Paneer Cooking Blocks",
    "Soft Brioche Burger Buns",
    "Aged Cheddar Cheese Slices",
    "Protein Breakfast Egg Whites",
    "Vanilla Yogurt Drink",
    "Artisan Sandwich Bread",
    "Mozzarella Cheese Shreds",
    "Cultured Buttermilk Bottle",
    "Fresh Dairy Cream",
    "Breakfast Croissant Pack",
  ],
  "Fruits & Vegetables": [
    "Sweet Mini Banana Bunch",
    "Crisp Fuji Apples",
    "Baby Spinach Leaves",
    "Juicy Valencia Oranges",
    "Vine Ripened Tomatoes",
    "Seedless Green Grapes",
    "Fresh Cut Broccoli",
    "English Cucumber Pack",
    "Purple Onion Basket",
    "Organic Carrot Sticks",
    "Creamy Hass Avocados",
    "Fresh Coriander Bundle",
    "Red Bell Pepper Trio",
    "Tender Green Beans",
    "Hydro Lettuce Heads",
  ],
  "Cold Drinks & Juices": [
    "Orange Mango Juice",
    "Sparkling Lemon Soda",
    "Apple Splash Juice",
    "Coconut Water Carton",
    "Mixed Berry Cooler",
    "Classic Cola Bottle",
    "Mint Lime Refresher",
    "Peach Iced Tea",
    "Guava Nectar Drink",
    "Watermelon Chiller",
    "Energy Boost Drink",
    "Ginger Ale Can Pack",
    "Pineapple Juice Blend",
    "Lychee Fruit Soda",
    "Still Spring Water",
  ],
  "Snacks & Munchies": [
    "Sea Salt Potato Chips",
    "Masala Peanut Crunch",
    "Roasted Corn Puffs",
    "Cheese Cracker Bites",
    "Chili Rice Crisps",
    "Trail Mix Snack Jar",
    "Kettle Cut Chips",
    "Salted Pretzel Twists",
    "Honey Almond Clusters",
    "Barbecue Corn Chips",
    "Sweet Chili Popcorn",
    "Classic Nacho Triangles",
    "Baked Veggie Crisps",
    "Sesame Stick Mix",
    "Sour Cream Rings",
  ],
  "Breakfast & Instant Food": [
    "Oats Breakfast Bowl",
    "Classic Corn Flakes",
    "Instant Poha Mix",
    "Cup Noodle Soup",
    "Stuffed Paratha Pack",
    "Granola Breakfast Clusters",
    "Ready Idli Batter",
    "Chocolate Wheat Cereal",
    "Instant Upma Bowl",
    "Maple Pancake Mix",
    "Multigrain Dosa Batter",
    "Quick Pasta Cups",
    "Peanut Butter Granola",
    "Vegetable Sandwich Spread",
    "Breakfast Hash Browns",
  ],
  "Sweet Tooth": [
    "Chocolate Truffle Bites",
    "Strawberry Wafer Rolls",
    "Classic Vanilla Cupcakes",
    "Butterscotch Dessert Jar",
    "Milk Chocolate Bar",
    "Gulab Jamun Tin",
    "Rainbow Sprinkle Donuts",
    "Caramel Cookie Sandwich",
    "Rasmalai Dessert Cups",
    "Choco Filled Croissants",
    "Mini Brownie Squares",
    "Pistachio Kulfi Pops",
    "Peanut Chikki Bites",
    "Fudge Ice Cream Cups",
    "Honey Sesame Brittle",
  ],
  "Bakery & Biscuits": [
    "Butter Cookie Tin",
    "Jeera Biscuit Pack",
    "Whole Wheat Rusks",
    "Chocolate Cream Cookies",
    "Digestive Biscuit Box",
    "Fresh Garlic Bread",
    "Puff Pastry Sheets",
    "Tea Rusk Toast",
    "Multigrain Crackers",
    "Classic Bourbon Biscuits",
    "Fruit Cake Slices",
    "Butter Puff Sticks",
    "Oatmeal Raisin Cookies",
    "Milk Bread Rolls",
    "Coconut Biscuit Pack",
  ],
  "Tea, Coffee & Milk Drinks": [
    "Premium Assam Tea",
    "Instant Coffee Blend",
    "Masala Chai Mix",
    "Cold Coffee Bottle",
    "Hazelnut Latte Drink",
    "Green Tea Sachets",
    "Filter Coffee Decoction",
    "Cardamom Milk Drink",
    "Vanilla Almond Milk",
    "Cappuccino Sachet Box",
    "Thai Tea Bottle",
    "Unsweetened Oat Milk",
    "Classic Black Tea",
    "Mocha Energy Latte",
    "Turmeric Milk Blend",
  ],
  "Atta, Rice & Dal": [
    "Stoneground Wheat Atta",
    "Premium Basmati Rice",
    "Everyday Sona Masoori Rice",
    "Yellow Toor Dal",
    "Split Moong Dal",
    "Organic Brown Rice",
    "Chana Dal Value Pack",
    "Idli Rice Bag",
    "Whole Masoor Dal",
    "Jeera Rice Mix",
    "Multi Millet Flour",
    "Matta Rice Pack",
    "Kabuli Chana Pack",
    "Fine Suji Rava",
    "Red Lentil Masoor Dal",
  ],
  "Masala, Oil & More": [
    "Cold Pressed Sunflower Oil",
    "Mustard Seeds Whole",
    "Kitchen King Masala",
    "Red Chili Powder",
    "Coriander Powder",
    "Pure Ghee Jar",
    "Turmeric Powder",
    "Cumin Jeera Seeds",
    "Garam Masala Blend",
    "Sesame Oil Bottle",
    "Black Pepper Grinder",
    "Kasuri Methi Leaves",
    "Tandoori Spice Mix",
    "Coconut Cooking Oil",
    "Hing Asafoetida Mix",
  ],
  "Sauces & Spreads": [
    "Classic Tomato Ketchup",
    "Creamy Peanut Butter",
    "Eggless Garlic Mayo",
    "Hot Chili Sauce",
    "Chunky Pasta Sauce",
    "Strawberry Fruit Jam",
    "Honey Mustard Dressing",
    "Green Chutney Dip",
    "Chocolate Hazelnut Spread",
    "Sweet Soy Sauce",
    "Cheese Sandwich Spread",
    "Peri Peri Dip",
    "Tamarind Date Chutney",
    "Organic Honey Squeeze",
    "Schezwan Stir Fry Sauce",
  ],
  "Chicken, Meat & Fish": [
    "Boneless Chicken Breast",
    "Fresh Chicken Drumsticks",
    "Classic Chicken Sausage",
    "Mutton Curry Cuts",
    "Freshwater Fish Fillets",
    "Prawns Cleaned Pack",
    "Chicken Seekh Kebabs",
    "Lamb Mince Pack",
    "Salmon Portion Cuts",
    "Spicy Chicken Wings",
    "Marinated Fish Steaks",
    "Chicken Meatballs",
    "Turkey Slices",
    "Tandoori Chicken Pack",
    "Boneless Basa Fillets",
  ],
  "Organic & Healthy Living": [
    "Organic Quinoa Seeds",
    "Chia Wellness Pack",
    "Raw Almond Kernels",
    "Gluten Free Oatmeal",
    "Cold Pressed Juice",
    "Date Sweetened Granola",
    "Organic Jaggery Powder",
    "Protein Seed Mix",
    "Natural Peanut Butter",
    "Apple Cider Vinegar",
    "Green Superfood Powder",
    "Vegan Protein Shake",
    "Wholegrain Muesli",
    "Organic Coconut Sugar",
    "Roasted Foxnut Makhana",
  ],
  "Vegan Foods": [
    "Plant Protein Bowl",
    "Vegan Cheese Slices",
    "Coconut Yogurt Cup",
    "Tofu Stir Fry Kit",
    "Almond Milk Unsweetened",
    "Jackfruit Taco Filling",
    "Chickpea Curry Pack",
    "Vegan Butter Spread",
    "Cauliflower Nuggets",
    "Oat Milk Chocolate Drink",
    "Lentil Pasta Box",
    "Vegan Mayo Jar",
    "Mushroom Burger Patties",
    "Cashew Cream Sauce",
    "Tempeh Teriyaki Pack",
  ],
  Frozen: [
    "Chicken Parmesan Meal",
    "Frozen Vegetable Mix",
    "Breaded Fish Fillets",
    "Chicken Pot Pie",
    "Frozen Dumplings",
    "Frozen Waffles",
    "Ice Cream Sandwiches",
    "Frozen Pizza",
    "Garlic Bread",
    "Frozen Berry Blend",
    "Mac and Cheese Bites",
    "Chicken Nuggets",
    "Shrimp Tempura",
    "Frozen French Fries",
    "Mango Kulfi",
  ],
};

type Palette = {
  from: string;
  to: string;
  shell: string;
  badge: string;
  text: string;
};

type CategoryConfig = {
  name: string;
  icon: IconName;
  palette: Palette;
  brand: string;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getCategorySlug(value: string) {
  return slugify(value);
}

export function getCategoryHash(slug: string) {
  return `#category/${slug}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function svgDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createProductImage(productName: string, brand: string, palette: Palette) {
  const productLabel = productName.split(" ").slice(0, 2).join(" ");
  const brandLabel = brand.toUpperCase();

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240" fill="none">
      <defs>
        <linearGradient id="g" x1="28" y1="24" x2="286" y2="216" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.from}"/>
          <stop offset="1" stop-color="${palette.to}"/>
        </linearGradient>
      </defs>
      <rect width="320" height="240" rx="28" fill="${palette.shell}"/>
      <rect x="22" y="22" width="276" height="196" rx="32" fill="url(#g)"/>
      <circle cx="242" cy="76" r="34" fill="rgba(255,255,255,0.28)"/>
      <circle cx="90" cy="76" r="18" fill="rgba(255,255,255,0.18)"/>
      <rect x="102" y="48" width="116" height="124" rx="26" fill="#ffffff" fill-opacity="0.92"/>
      <rect x="118" y="64" width="84" height="18" rx="9" fill="${palette.badge}" fill-opacity="0.22"/>
      <rect x="124" y="92" width="72" height="44" rx="16" fill="${palette.badge}" fill-opacity="0.84"/>
      <rect x="84" y="182" width="152" height="22" rx="11" fill="rgba(255,255,255,0.18)"/>
      <text x="160" y="78" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="800" fill="${palette.text}">${escapeXml(brandLabel.slice(0, 18))}</text>
      <text x="160" y="156" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800" fill="#ffffff">${escapeXml(productLabel.slice(0, 16))}</text>
    </svg>
  `);
}

export type IconName =
  | "categories"
  | "snack"
  | "grocery"
  | "beverage"
  | "beauty"
  | "personal-care"
  | "home"
  | "electronics"
  | "baby"
  | "health"
  | "paan"
  | "dairy"
  | "fruit"
  | "breakfast"
  | "sweet"
  | "bakery"
  | "tea"
  | "grain"
  | "spice"
  | "sauce"
  | "meat"
  | "organic"
  | "pharma"
  | "cleaning"
  | "office"
  | "pet";

export type LanguageOption = {
  code: string;
  label: string;
  shortLabel: string;
  dir?: "ltr" | "rtl";
  lang?: string;
};

export type ShortcutItem = {
  label: string;
  icon: IconName;
  href: string;
};

export type CategoryTile = {
  name: string;
  icon: IconName;
  image: string;
  sectionId: string;
  categorySlug: string;
  href: string;
};

export type PromoBannerData = {
  title: string;
  saleText: string;
  ctaLabel: string;
  href: string;
  products: Array<{
    name: string;
    image: string;
  }>;
};

export type ProductItem = {
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
  unitPrice: string;
  soldCount: number;
  categoryId: string;
  categoryName: string;
  deliveryType: (typeof DELIVERY_TYPES)[number];
  productType: (typeof PRODUCT_TYPES)[number];
  madeIn: (typeof MADE_IN_OPTIONS)[number];
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

export type ProductCarouselSection = {
  title: string;
  sectionId: string;
  seeAllHref: string;
  items: ProductItem[];
};

export type CategoryFilterBrand = (typeof FILTER_BRANDS)[number];
export type DeliveryTypeOption = (typeof DELIVERY_TYPES)[number];
export type ProductTypeOption = (typeof PRODUCT_TYPES)[number];
export type MadeInOption = (typeof MADE_IN_OPTIONS)[number];

const PRODUCT_COUNTRIES = [
  "Thailand",
  "Japan",
  "South Korea",
  "Taiwan",
  "Vietnam",
  "Singapore",
  "Malaysia",
];

const REVIEW_NAMES = ["Mina L.", "Andre T.", "Jade S.", "Mook P.", "Chris A.", "Nina W."];

export function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function createGalleryImage(productName: string, brand: string, palette: Palette, frameIndex: number) {
  const title = productName.split(" ").slice(0, 2).join(" ");
  const accent = frameIndex % 2 === 0 ? palette.badge : palette.text;
  const note = ["Front", "Side", "Pack", "Close-up"][frameIndex] ?? "View";

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="860" height="860" viewBox="0 0 860 860" fill="none">
      <defs>
        <linearGradient id="bg" x1="120" y1="84" x2="742" y2="760" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.from}"/>
          <stop offset="1" stop-color="${palette.to}"/>
        </linearGradient>
      </defs>
      <rect width="860" height="860" rx="90" fill="#f8fafc"/>
      <rect x="78" y="78" width="704" height="704" rx="86" fill="url(#bg)" fill-opacity="0.12"/>
      <circle cx="676" cy="214" r="88" fill="${accent}" fill-opacity="0.12"/>
      <circle cx="244" cy="222" r="58" fill="${accent}" fill-opacity="0.08"/>
      <rect x="242" y="118" width="376" height="560" rx="84" fill="#ffffff"/>
      <rect x="282" y="168" width="296" height="78" rx="30" fill="${palette.badge}" fill-opacity="0.16"/>
      <rect x="316" y="300" width="228" height="220" rx="46" fill="${palette.badge}" fill-opacity="0.9"/>
      <rect x="274" y="570" width="312" height="46" rx="23" fill="${accent}" fill-opacity="0.14"/>
      <text x="430" y="217" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800" fill="${palette.text}">${escapeXml(brand)}</text>
      <text x="430" y="600" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800" fill="${palette.text}">${escapeXml(note)}</text>
      <text x="430" y="786" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800" fill="${palette.text}">${escapeXml(title)}</text>
    </svg>
  `);
}

function createRecipeSuggestions(product: {
  id: string;
  name: string;
  quantity: string;
  categoryName: string;
}) {
  return [
    {
      id: `${product.id}-recipe-1`,
      title: `${product.name} quick bowl`,
      description: `Turn ${product.name.toLowerCase()} into a fast weeknight plate with crisp vegetables and pantry staples.`,
      prepTime: "12 min",
      usage: `Use ${product.quantity} with rice, greens, or noodles.`,
      ingredients: [product.name, "Scallions", "Sesame oil", "Steamed rice"],
    },
    {
      id: `${product.id}-recipe-2`,
      title: `${product.categoryName} easy meal prep`,
      description: `Batch a simple prep-friendly recipe that keeps flavor and texture through lunch or dinner.`,
      prepTime: "18 min",
      usage: `Use ${product.name.toLowerCase()} as main flavor base.`,
      ingredients: [product.name, "Garlic", "Soy sauce", "Mixed vegetables"],
    },
  ] satisfies RecipeSuggestion[];
}

function createNutritionFacts(product: { id: string; quantity: string; name: string }) {
  const seed = product.id.length + product.name.length;
  return {
    servingSize: product.quantity,
    calories: 120 + (seed % 9) * 15,
    totalFat: `${4 + (seed % 5)} g`,
    sodium: `${150 + (seed % 6) * 35} mg`,
    carbohydrates: `${16 + (seed % 4) * 3} g`,
    sugar: `${5 + (seed % 4)} g`,
    protein: `${3 + (seed % 5)} g`,
    ingredientsNote: "Sample nutrition values for demo display. Check actual product packaging for final values.",
    allergenNote: "Allergen and ingredient details may vary by provider batch.",
  } satisfies NutritionFacts;
}

function createReviewDate(offset: number) {
  const date = new Date(Date.UTC(2026, 4, 24 - offset));
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

function createReviews(product: { id: string; name: string; imageUrls: string[] }) {
  return [
    {
      id: `${product.id}-review-1`,
      customerName: REVIEW_NAMES[0],
      rating: 5,
      text: `${product.name} arrived in great condition and matched the photos. Would buy again for pantry restock.`,
      date: createReviewDate(1),
      verifiedPurchase: true,
      isPurchased: true,
      images: [product.imageUrls[0]],
      tags: ["Fresh", "Well packed"],
    },
    {
      id: `${product.id}-review-2`,
      customerName: REVIEW_NAMES[1],
      rating: 4,
      text: `Flavor and size were good. Shipping was quick and the packaging felt secure.`,
      date: createReviewDate(5),
      verifiedPurchase: true,
      isPurchased: true,
      images: [],
      tags: ["Fast delivery"],
    },
    {
      id: `${product.id}-review-3`,
      customerName: REVIEW_NAMES[2],
      rating: 5,
      text: `Nice value for the price. I used it in two recipes already and it worked exactly as expected.`,
      date: createReviewDate(12),
      verifiedPurchase: false,
      isPurchased: false,
      images: [product.imageUrls[1]],
      tags: ["Good value", "Recipe friendly"],
    },
    {
      id: `${product.id}-review-4`,
      customerName: REVIEW_NAMES[3],
      rating: 3,
      text: `Good overall, though I wish the pack size was a little larger. Still a solid grocery staple.`,
      date: createReviewDate(18),
      verifiedPurchase: true,
      isPurchased: true,
      images: [],
      tags: ["Staple item"],
    },
  ] satisfies ProductReview[];
}

function createRatingBreakdown(reviews: ProductReview[]) {
  return reviews.reduce<RatingBreakdown>(
    (accumulator, review) => {
      const key = Math.max(1, Math.min(5, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
      accumulator[key] += 1;
      return accumulator;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  );
}

function createProductRecord(category: CategoryConfig, productName: string, index: number): ProductItem {
  const categoryId = slugify(category.name);
  const id = `${categoryId}-${index + 1}`;
  const price = Number((PRODUCT_PRICES[index] + category.name.length * 0.11).toFixed(2));
  const oldPrice = Number((price * 1.16).toFixed(2));
  const discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
  const size = PRODUCT_SIZES[index];
  const generatedImageUrls = [0, 1, 2, 3].map((frameIndex) => createGalleryImage(productName, category.brand, category.palette, frameIndex));
  const dairyBreadPrimaryImage =
    category.name === DAIRY_BREAD_CATEGORY_NAME && index < 15 ? dairyBreadMockupAssetPaths[index] : undefined;
  const fruitVegetablePrimaryImage =
    category.name === FRUITS_VEGETABLES_CATEGORY_NAME && index < 15 ? fruitVegetableMockupAssetPaths[index] : undefined;
  const drinksBeveragePrimaryImage =
    category.name === DRINKS_BEVERAGE_CATEGORY_NAME && index < 15 ? drinksBeverageMockupAssetPaths[index] : undefined;
  const snacksMunchiesPrimaryImage =
    category.name === SNACKS_MUNCHIES_CATEGORY_NAME && index < 15 ? snacksMunchiesMockupAssetPaths[index] : undefined;
  const breakfastInstantFoodPrimaryImage =
    category.name === BREAKFAST_INSTANT_FOOD_CATEGORY_NAME && index < 15
      ? breakfastInstantFoodMockupAssetPaths[index]
      : undefined;
  const sweetToothPrimaryImage =
    category.name === SWEET_TOOTH_CATEGORY_NAME && index < 15 ? sweetToothMockupAssetPaths[index] : undefined;
  const bakeryBiscuitsPrimaryImage =
    category.name === BAKERY_BISCUITS_CATEGORY_NAME && index < 15 ? bakeryBiscuitsMockupAssetPaths[index] : undefined;
  const attaRiceDalPrimaryImage =
    category.name === ATTA_RICE_DAL_CATEGORY_NAME && index < 15 ? attaRiceDalMockupAssetPaths[index] : undefined;
  const teaCoffeeMilkDrinksPrimaryImage =
    category.name === TEA_COFFEE_MILK_DRINKS_CATEGORY_NAME && index < 15
      ? teaCoffeeMilkDrinksMockupAssetPaths[index]
      : undefined;
  const masalaOilMorePrimaryImage =
    category.name === MASALA_OIL_MORE_CATEGORY_NAME && index < 15 ? masalaOilMoreMockupAssetPaths[index] : undefined;
  const saucesSpreadsPrimaryImage =
    category.name === SAUCES_SPREADS_CATEGORY_NAME && index < 15 ? saucesSpreadsMockupAssetPaths[index] : undefined;
  const chickenMeatFishPrimaryImage =
    category.name === CHICKEN_MEAT_FISH_CATEGORY_NAME && index < 15 ? chickenMeatFishMockupAssetPaths[index] : undefined;
  const organicHealthyLivingPrimaryImage =
    category.name === ORGANIC_HEALTHY_LIVING_CATEGORY_NAME && index < 15
      ? organicHealthyLivingMockupAssetPaths[index]
      : undefined;
  const veganFoodsPrimaryImage =
    category.name === VEGAN_FOODS_CATEGORY_NAME && index < 15 ? veganFoodsMockupAssetPaths[index] : undefined;
  const frozenPrimaryImage =
    category.name === FROZEN_CATEGORY_NAME && index < 15 ? frozenMockupAssetPaths[index] : undefined;
  const realPrimaryImage =
    dairyBreadPrimaryImage ??
    fruitVegetablePrimaryImage ??
    drinksBeveragePrimaryImage ??
    snacksMunchiesPrimaryImage ??
    breakfastInstantFoodPrimaryImage ??
    sweetToothPrimaryImage ??
    bakeryBiscuitsPrimaryImage ??
    attaRiceDalPrimaryImage ??
    teaCoffeeMilkDrinksPrimaryImage ??
    masalaOilMorePrimaryImage ??
    saucesSpreadsPrimaryImage ??
    chickenMeatFishPrimaryImage ??
    organicHealthyLivingPrimaryImage ??
    veganFoodsPrimaryImage ??
    frozenPrimaryImage;
  const imageUrls = realPrimaryImage ? [realPrimaryImage, ...generatedImageUrls.slice(1)] : generatedImageUrls;
  const quantity = size;
  const reviews = createReviews({ id, name: productName, imageUrls });
  const ratingBreakdown = createRatingBreakdown(reviews);
  const reviewCount = reviews.length;
  const averageRating =
    reviews.reduce((total, review) => total + review.rating, 0) / Math.max(reviewCount, 1);

  return {
    id,
    brand: FILTER_BRANDS[(index + category.name.length) % FILTER_BRANDS.length],
    name: productName,
    categorySlug: categoryId,
    size,
    price,
    oldPrice,
    discountPercent,
    deliveryTime: DELIVERY_BADGES[index % DELIVERY_BADGES.length],
    image: realPrimaryImage ?? imageUrls[0],
    imageUrls,
    unitPrice: `${formatPrice(Number((price / (index % 3 === 0 ? 0.5 : 1)).toFixed(2)))}/${index % 2 === 0 ? "lb" : "pack"}`,
    soldCount: 120 + index * 17 + category.name.length,
    categoryId,
    categoryName: category.name,
    deliveryType: DELIVERY_TYPES[index % DELIVERY_TYPES.length],
    productType: PRODUCT_TYPES[(index + category.name.length) % PRODUCT_TYPES.length],
    madeIn: MADE_IN_OPTIONS[(index + category.name.length) % MADE_IN_OPTIONS.length],
    tags: ["Best Seller", category.name.split("&")[0].trim(), "Daily grocery"].slice(0, 3),
    badges: [discountPercent >= 12 ? `${discountPercent}% OFF` : "Fresh Pick", index % 2 === 0 ? "Popular" : "Top Rated"],
    provider: `${category.brand} Market`,
    country: PRODUCT_COUNTRIES[index % PRODUCT_COUNTRIES.length],
    countryOfOrigin: PRODUCT_COUNTRIES[(index + 2) % PRODUCT_COUNTRIES.length],
    brandOrigin: PRODUCT_COUNTRIES[(index + 1) % PRODUCT_COUNTRIES.length],
    netContent: size,
    quantity,
    description: `${productName} is a demo-ready ${category.name.toLowerCase()} product built for the desktop product page. It keeps backend-ready fields while showing a polished grocery ecommerce layout across desktop, tablet, and mobile.`,
    ingredients: `Sample ingredients for ${productName.toLowerCase()}: primary product base, seasoning blend, and provider-specific components.`,
    storageInstructions: index % 2 === 0 ? "Keep refrigerated after opening." : "Store in a cool, dry place away from direct sunlight.",
    sku: `FO-${categoryId.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    recipeSuggestions: createRecipeSuggestions({ id, name: productName, quantity, categoryName: category.name }),
    nutritionFacts: createNutritionFacts({ id, quantity, name: productName }),
    returnPolicy:
      "Eligible unopened items can be returned within 7 days. Damaged or missing items should be reported with photos through support for a quick resolution.",
    reviews,
    reviewTags: ["Fresh", "Good value", "Fast delivery", "Would repurchase"],
    averageRating: Number(averageRating.toFixed(1)),
    ratingBreakdown,
    reviewCount,
    variants: [
      { id: `${id}-default`, label: "Default", packSize: size, price, unitPrice: `${formatPrice(price)}/pack` },
      { id: `${id}-family`, label: "Family Size", packSize: `2 x ${size}`, price: Number((price * 1.88).toFixed(2)), unitPrice: `${formatPrice(Number((price * 0.94).toFixed(2)))}/pack` },
      { id: `${id}-bundle`, label: "Bundle", packSize: `3 x ${size}`, price: Number((price * 2.7).toFixed(2)), unitPrice: `${formatPrice(Number((price * 0.9).toFixed(2)))}/pack` },
    ],
  };
}

const categoryConfigs: CategoryConfig[] = [
  { name: "Paan Corner", icon: "paan", brand: "Blink Basket", palette: { from: "#22c55e", to: "#86efac", shell: "#eefbf0", badge: "#15803d", text: "#14532d" } },
  { name: "Dairy, Bread & Eggs", icon: "dairy", brand: "Farm Basket", palette: { from: "#f59e0b", to: "#fde68a", shell: "#fff7e8", badge: "#b45309", text: "#7c2d12" } },
  { name: "Fruits & Vegetables", icon: "fruit", brand: "Fresh Route", palette: { from: "#22c55e", to: "#bbf7d0", shell: "#eefbf2", badge: "#15803d", text: "#14532d" } },
  { name: "Cold Drinks & Juices", icon: "beverage", brand: "Cool Cart", palette: { from: "#38bdf8", to: "#c4b5fd", shell: "#eef8ff", badge: "#0369a1", text: "#1e3a8a" } },
  { name: "Snacks & Munchies", icon: "snack", brand: "Snack Stop", palette: { from: "#fb7185", to: "#fdba74", shell: "#fff2f0", badge: "#be123c", text: "#7f1d1d" } },
  { name: "Breakfast & Instant Food", icon: "breakfast", brand: "Sunrise Pantry", palette: { from: "#f97316", to: "#fdba74", shell: "#fff4ec", badge: "#c2410c", text: "#7c2d12" } },
  { name: "Sweet Tooth", icon: "sweet", brand: "Sugar Day", palette: { from: "#ec4899", to: "#f9a8d4", shell: "#fff1f7", badge: "#be185d", text: "#831843" } },
  { name: "Bakery & Biscuits", icon: "bakery", brand: "Oven & Co", palette: { from: "#f59e0b", to: "#fcd34d", shell: "#fff8e6", badge: "#d97706", text: "#78350f" } },
  { name: "Tea, Coffee & Milk Drinks", icon: "tea", brand: "Brew Table", palette: { from: "#8b5cf6", to: "#c4b5fd", shell: "#f4efff", badge: "#6d28d9", text: "#4c1d95" } },
  { name: "Atta, Rice & Dal", icon: "grain", brand: "Daily Staples", palette: { from: "#d97706", to: "#fde68a", shell: "#fff8eb", badge: "#92400e", text: "#78350f" } },
  { name: "Masala, Oil & More", icon: "spice", brand: "Spice Craft", palette: { from: "#ef4444", to: "#fdba74", shell: "#fff2ee", badge: "#b91c1c", text: "#7f1d1d" } },
  { name: "Sauces & Spreads", icon: "sauce", brand: "Kitchen Dip", palette: { from: "#f97316", to: "#facc15", shell: "#fff7ec", badge: "#c2410c", text: "#7c2d12" } },
  { name: "Chicken, Meat & Fish", icon: "meat", brand: "Protein Market", palette: { from: "#ef4444", to: "#fca5a5", shell: "#fff1f1", badge: "#991b1b", text: "#7f1d1d" } },
  { name: "Organic & Healthy Living", icon: "organic", brand: "Green Ritual", palette: { from: "#10b981", to: "#6ee7b7", shell: "#effdf7", badge: "#047857", text: "#064e3b" } },
  { name: "Vegan Foods", icon: "organic", brand: "Plant Pantry", palette: { from: "#34d399", to: "#a7f3d0", shell: "#effcf5", badge: "#059669", text: "#065f46" } },
  { name: "Frozen", icon: "health", brand: "Freezer Picks", palette: { from: "#38bdf8", to: "#bfdbfe", shell: "#eff8ff", badge: "#2563eb", text: "#1e3a8a" } },
];

const categoryMap = new Map(categoryConfigs.map((config) => [config.name, config]));

const categoryImageByName: Record<string, string> = {
  "Paan Corner": "paan-corner.jpg",
  "Dairy, Bread & Eggs": "dairy-bread-eggs.jpg",
  "Fruits & Vegetables": "fruits-vegetables.jpg",
  "Cold Drinks & Juices": "cold-drinks-juices.jpg",
  "Snacks & Munchies": "snacks-munchies.jpg",
  "Breakfast & Instant Food": "breakfast-instant-food.jpg",
  "Sweet Tooth": "sweet-tooth.jpg",
  "Bakery & Biscuits": "bakery-biscuits.jpg",
  "Tea, Coffee & Milk Drinks": "tea-coffee-milk-drinks.jpg",
  "Atta, Rice & Dal": "atta-rice-dal.jpg",
  "Masala, Oil & More": "masala-oil-more.jpg",
  "Sauces & Spreads": "sauces-spreads.jpg",
  "Chicken, Meat & Fish": "chicken-meat-fish.jpg",
  "Organic & Healthy Living": "organic-healthy-living.jpg",
  "Vegan Foods": "organic-healthy-living.jpg",
  Frozen: "frozen.jfif",
};

function getCategoryConfig(name: string) {
  const config = categoryMap.get(name);

  if (!config) {
    throw new Error(`Missing category config for ${name}`);
  }

  return config;
}

export const assets = {
  logo: localAsset("assets/food-online-long-text-cutout.png"),
  heroVideo: localAsset("assets/food-horizontal.mp4"),
  heroPoster: localAsset("assets/food-hero-poster.svg"),
  splashVideo: localAsset("assets/food-horizontal.mp4"),
  homeCategoryPromoBanner: localAsset("assets/home-banners/memorial-day-sale-banner.png"),
  favicon: localAsset("favicon.svg"),
};

export type NavItem = {
  label: string;
  href: string;
  accent?: "leaf";
  hasChevron?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "#home", accent: "leaf" },
  { label: "Recipe", href: "#company" },
  { label: "Coupon", href: "#best-deals" },
  { label: "Products", href: "#best-deals", hasChevron: true },
  { label: "Healthy Product", href: "#organic-healthy-living" },
  { label: "Wholesale Products", href: "#best-deals", accent: "leaf" },
  { label: "Deal-of-the-week", href: "#best-deals" },
];

export const zipCodeExample = "91789";

export const languageOptions: LanguageOption[] = [
  { code: "en", label: "English", shortLabel: "English" },
  { code: "th", label: "ไทย", shortLabel: "ไทย", lang: "th" },
  { code: "zh", label: "中文", shortLabel: "中文", lang: "zh" },
  { code: "ru", label: "Русский", shortLabel: "Русский", lang: "ru" },
  { code: "uk", label: "Українська", shortLabel: "Українська", lang: "uk" },
  { code: "ar", label: "العربية", shortLabel: "العربية", dir: "rtl", lang: "ar" },
  { code: "ja", label: "日本語", shortLabel: "日本語", lang: "ja" },
  { code: "ko", label: "한국어", shortLabel: "한국어", lang: "ko" },
];

export const slides = [
  {
    title: "Groceries delivered fast, fresh, and cart-ready for busy nights",
  },
];

export const shortcutItems: ShortcutItem[] = [
  { label: "Categories", icon: "categories", href: "#categories" },
  { label: "Snack", icon: "snack", href: "#snacks-munchies" },
  { label: "Grocery", icon: "grocery", href: "#atta-rice-dal" },
  { label: "Beverage", icon: "beverage", href: "#cold-drinks-juices" },
  { label: "Sweet Tooth", icon: "sweet", href: "#sweet-tooth" },
  { label: "Frozen", icon: "health", href: "#frozen" },
  { label: "Meat & Fish", icon: "meat", href: "#chicken-meat-fish" },
  { label: "Organic", icon: "organic", href: "#organic-healthy-living" },
  { label: "Vegan Foods", icon: "organic", href: "#vegan-foods" },
  { label: "Tea & Coffee", icon: "tea", href: "#tea-coffee-milk-drinks" },
];

export const categories: CategoryTile[] = categoryConfigs.map((category) => ({
  name: category.name,
  icon: category.icon,
  image: localAsset(`assets/categories/${categoryImageByName[category.name]}`),
  sectionId: `category-${slugify(category.name)}`,
  categorySlug: slugify(category.name),
  href: getCategoryHash(slugify(category.name)),
}));

export const productCatalog: ProductItem[] = categoryConfigs
  .flatMap((category) =>
    PRODUCT_NAMES_BY_CATEGORY[category.name].map((productName, index) => createProductRecord(category, productName, index)),
  );

function createListingProductClone(product: ProductItem, cloneIndex: number) {
  const variationLabel = LISTING_VARIATION_LABELS[cloneIndex % LISTING_VARIATION_LABELS.length];
  const priceMultiplier = [1, 1.06, 0.94, 1.12][cloneIndex % 4] ?? 1;
  const price = Number((product.price * priceMultiplier).toFixed(2));
  const oldPrice = product.oldPrice ? Number((product.oldPrice * priceMultiplier).toFixed(2)) : undefined;

  return {
    ...product,
    id: `${product.id}-listing-${cloneIndex + 1}`,
    name: `${product.name}${variationLabel}`,
    price,
    oldPrice,
    soldCount: product.soldCount + cloneIndex * 9,
    size: cloneIndex % 2 === 0 ? product.size : `${product.size} pack`,
    quantity: cloneIndex % 2 === 0 ? product.quantity : `${product.quantity} pack`,
    unitPrice: `${formatPrice(Number((price / ((cloneIndex % 3) + 1)).toFixed(2)))}/${cloneIndex % 2 === 0 ? "pack" : "lb"}`,
    deliveryType: DELIVERY_TYPES[cloneIndex % DELIVERY_TYPES.length],
    productType: PRODUCT_TYPES[(cloneIndex + product.categoryName.length) % PRODUCT_TYPES.length],
    madeIn: MADE_IN_OPTIONS[(cloneIndex + product.categoryName.length) % MADE_IN_OPTIONS.length],
    brand: FILTER_BRANDS[(cloneIndex + product.name.length) % FILTER_BRANDS.length],
  } satisfies ProductItem;
}

export const categoryListingCatalogBySlug = new Map(
  categoryConfigs.map((category) => {
    const slug = slugify(category.name);
    const baseProducts = productCatalog.filter((product) => product.categorySlug === slug);
    const listingProducts = Array.from({ length: 60 }, (_, index) => {
      const baseProduct = baseProducts[index % baseProducts.length];
      return index < baseProducts.length ? baseProduct : createListingProductClone(baseProduct, index);
    });
    const overrideAssetPaths =
      category.name === DAIRY_BREAD_CATEGORY_NAME
        ? dairyBreadMockupAssetPaths
        : category.name === FRUITS_VEGETABLES_CATEGORY_NAME
          ? fruitVegetableMockupAssetPaths
          : category.name === DRINKS_BEVERAGE_CATEGORY_NAME
            ? drinksBeverageMockupAssetPaths
            : category.name === SNACKS_MUNCHIES_CATEGORY_NAME
              ? snacksMunchiesMockupAssetPaths
              : category.name === BREAKFAST_INSTANT_FOOD_CATEGORY_NAME
                ? breakfastInstantFoodMockupAssetPaths
                : category.name === SWEET_TOOTH_CATEGORY_NAME
                  ? sweetToothMockupAssetPaths
                  : category.name === BAKERY_BISCUITS_CATEGORY_NAME
                    ? bakeryBiscuitsMockupAssetPaths
                    : category.name === ATTA_RICE_DAL_CATEGORY_NAME
                      ? attaRiceDalMockupAssetPaths
                      : category.name === TEA_COFFEE_MILK_DRINKS_CATEGORY_NAME
                        ? teaCoffeeMilkDrinksMockupAssetPaths
                        : category.name === MASALA_OIL_MORE_CATEGORY_NAME
                          ? masalaOilMoreMockupAssetPaths
                          : category.name === SAUCES_SPREADS_CATEGORY_NAME
                            ? saucesSpreadsMockupAssetPaths
                            : category.name === CHICKEN_MEAT_FISH_CATEGORY_NAME
                              ? chickenMeatFishMockupAssetPaths
                              : category.name === ORGANIC_HEALTHY_LIVING_CATEGORY_NAME
                                ? organicHealthyLivingMockupAssetPaths
                                : category.name === VEGAN_FOODS_CATEGORY_NAME
                                  ? veganFoodsMockupAssetPaths
                                  : category.name === FROZEN_CATEGORY_NAME
                                    ? frozenMockupAssetPaths
                            : null;
    const listingProductsWithImages = overrideAssetPaths
      ? listingProducts.map((product, index) => {
          const overrideImage = overrideAssetPaths[index];
          if (!overrideImage) {
            const generatedImageUrls = [0, 1, 2, 3].map((frameIndex) =>
              createGalleryImage(product.name, product.brand, category.palette, frameIndex),
            );
            return {
              ...product,
              image: generatedImageUrls[0],
              imageUrls: generatedImageUrls,
            };
          }
          return {
            ...product,
            image: overrideImage,
            imageUrls: [overrideImage, ...product.imageUrls.slice(1)],
          };
        })
      : listingProducts;

    return [slug, listingProductsWithImages] as const;
  }),
);

const allListingProducts = Array.from(categoryListingCatalogBySlug.values()).flat();
export const productCatalogById = new Map(allListingProducts.map((product) => [product.id, product]));
export const categoryTileBySlug = new Map(categories.map((category) => [category.categorySlug, category]));
const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  "baby-care": slugify(VEGAN_FOODS_CATEGORY_NAME),
};

function resolveCategorySlug(slug: string) {
  return CATEGORY_SLUG_ALIASES[slug] ?? slug;
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[_/\\-]+/g, " ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactSearchText(value: string) {
  return normalizeSearchText(value).replace(/\s+/g, "");
}

function compactSearchTextWithoutAnd(value: string) {
  return normalizeSearchText(value).replace(/\band\b/g, " ").replace(/\s+/g, "");
}

const productSearchIndex = allListingProducts.map((product) => {
  const searchableFields = [
    product.name,
    product.categoryName,
    product.brand,
    product.provider,
    product.tags.join(" "),
    product.badges.join(" "),
    product.size,
    product.unitPrice,
    product.country,
    product.countryOfOrigin,
    product.brandOrigin,
    product.madeIn,
    product.netContent,
    product.quantity,
  ].join(" ");

  return {
    product,
    nameNormalized: normalizeSearchText(product.name),
    nameCompact: compactSearchText(product.name),
    nameLooseCompact: compactSearchTextWithoutAnd(product.name),
    categoryNormalized: normalizeSearchText(product.categoryName),
    categoryCompact: compactSearchText(product.categoryName),
    categoryLooseCompact: compactSearchTextWithoutAnd(product.categoryName),
    searchableNormalized: normalizeSearchText(searchableFields),
    searchableCompact: compactSearchText(searchableFields),
    searchableLooseCompact: compactSearchTextWithoutAnd(searchableFields),
  };
});

export function getProductById(productId: string | null) {
  if (!productId) {
    return productCatalog[0];
  }

  return productCatalogById.get(productId) ?? productCatalog[0];
}

export function getRelatedProducts(product: ProductItem, limit = 8) {
  const sameCategory = productCatalog.filter((item) => item.id !== product.id && item.categoryId === product.categoryId);
  const fallback = productCatalog.filter((item) => item.id !== product.id && item.categoryId !== product.categoryId);
  return [...sameCategory, ...fallback].slice(0, limit);
}

export function getCategoryBySlug(slug: string | null) {
  if (!slug) {
    return categories[0];
  }

  const resolvedSlug = resolveCategorySlug(slug);
  return categoryTileBySlug.get(resolvedSlug) ?? categories[0];
}

export function getCategoryListingProducts(categorySlug: string | null) {
  const fallbackSlug = categories[0]?.categorySlug ?? "paan-corner";
  const resolvedSlug = resolveCategorySlug(categorySlug ?? fallbackSlug);
  return categoryListingCatalogBySlug.get(resolvedSlug) ?? categoryListingCatalogBySlug.get(fallbackSlug) ?? [];
}

export function searchProducts(query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [];
  }

  const compactQuery = normalizedQuery.replace(/\s+/g, "");
  const looseCompactQuery = compactSearchTextWithoutAnd(query);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);

  return productSearchIndex
    .map((entry) => {
      const compactMatch =
        entry.searchableCompact.includes(compactQuery) ||
        entry.nameCompact.includes(compactQuery) ||
        entry.categoryCompact.includes(compactQuery) ||
        entry.searchableLooseCompact.includes(looseCompactQuery) ||
        entry.nameLooseCompact.includes(looseCompactQuery) ||
        entry.categoryLooseCompact.includes(looseCompactQuery);
      const tokenMatches = queryTokens.filter(
        (token) => entry.searchableNormalized.includes(token) || entry.searchableCompact.includes(token),
      );

      if (!compactMatch && tokenMatches.length === 0) {
        return null;
      }

      let score = 0;

      if (entry.nameCompact.includes(compactQuery)) {
        score += 120;
      }

      if (entry.categoryCompact.includes(compactQuery)) {
        score += 80;
      }

      if (entry.searchableCompact.includes(compactQuery)) {
        score += 60;
      }

      score += tokenMatches.length * 15;

      if (queryTokens.length > 1 && tokenMatches.length === queryTokens.length) {
        score += 25;
      }

      return {
        product: entry.product,
        score,
      };
    })
    .filter((entry): entry is { product: ProductItem; score: number } => Boolean(entry))
    .sort((left, right) => right.score - left.score || right.product.soldCount - left.product.soldCount || left.product.name.localeCompare(right.product.name))
    .map((entry) => entry.product);
}

export function getAvailableFilterBrands() {
  return [...FILTER_BRANDS];
}

export function getAvailableDeliveryTypes() {
  return [...DELIVERY_TYPES];
}

export function getAvailableProductTypes() {
  return [...PRODUCT_TYPES];
}

export function getAvailableMadeInOptions() {
  return [...MADE_IN_OPTIONS];
}

const promoCategoryNames = ["Snacks & Munchies", "Cold Drinks & Juices", "Sweet Tooth"];

export const promoBanner: PromoBannerData = {
  title: "Memorial Day Sale",
  saleText: "UP TO 80% OFF",
  ctaLabel: "Shop Now",
  href: "#best-deals",
  products: promoCategoryNames.map((name, index) => {
    const config = getCategoryConfig(name);
    const productName = PRODUCT_NAMES_BY_CATEGORY[name][index];

    return {
      name: productName,
      image: createProductImage(productName, config.brand, config.palette),
    };
  }),
};

export const productCarouselSections: ProductCarouselSection[] = categoryConfigs
  .filter((category) => category.name !== "Paan Corner")
  .map((category) => ({
    title: category.name,
    sectionId: slugify(category.name),
    seeAllHref: getCategoryHash(slugify(category.name)),
    items: productCatalog.filter((product) => product.categoryId === slugify(category.name)),
  }));

export type FooterContactItem = {
  label: string;
  value: string;
  type: "location" | "phone" | "email" | "hours";
};

export type FooterLinkColumn = {
  title: string;
  links: Array<string | { label: string; href: string }>;
};

export const footerDescription = "We bring Grocery to your door for less";

export const footerContactItems: FooterContactItem[] = [
  {
    label: "Bangkok office:",
    value: "279 Watcharaphon Rd. Tha rang, Bangkhen, Bangkok, Thailand",
    type: "location",
  },
  {
    label: "Call Us:",
    value: "(66+) 097-392-4632",
    type: "phone",
  },
  {
    label: "Email:",
    value: "sale@foodonlines.com",
    type: "email",
  },
  {
    label: "Hours:",
    value: "10:00 - 18:00, Mon - Sat",
    type: "hours",
  },
];

export const footerColumns: FooterLinkColumn[] = [
  {
    title: "Company",
    links: [
      "Become Our Distributor",
      "Apply Credit",
      "Privacy Policy",
      "Terms & Conditions",
      { label: "About Us", href: "/about-us" },
      "Contact Us",
      "Complaint",
      "Careers",
      "Sitmap",
    ],
  },
  {
    title: "Account",
    links: [
      "Sign In",
      "View Cart",
      "My Wishlist",
      "Track My Order",
      "Help Ticket",
      "Shipping Details",
      "Recipe",
    ],
  },
  {
    title: "Corporate",
    links: [
      { label: "Become a Vendor", href: "/become-vendor" },
      "Affiliate Program",
      { label: "Become Our Drivers", href: "/company/drivers" },
      "Farm Careers",
      { label: "Become a Partner", href: "/become-partner" },
      "Accessibility",
      { label: "Become a Sponsor", href: "/become-a-sponsor" },
    ],
  },
];
