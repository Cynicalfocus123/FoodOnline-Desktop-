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

const PRODUCT_NAMES_BY_CATEGORY: Record<string, string[]> = {
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
  "Baby Care": [
    "Gentle Baby Wipes",
    "Newborn Diaper Pack",
    "Baby Lotion Soft Touch",
    "Stage 1 Formula",
    "Fruit Puree Pouch",
    "Baby Bath Wash",
    "Diaper Rash Cream",
    "Feeding Bottle Set",
    "Organic Baby Cereal",
    "Cotton Buds for Baby",
    "Baby Shampoo Mild",
    "Teething Snack Sticks",
    "Toddler Milk Drink",
    "Travel Changing Mat",
    "Baby Laundry Liquid",
  ],
  "Pharma & Wellness": [
    "Vitamin C Tablets",
    "Pain Relief Spray",
    "Digital Thermometer",
    "Electrolyte Drink Mix",
    "Antiseptic Liquid",
    "Wellness Protein Bar",
    "Hand Sanitizer Gel",
    "Bandage First Aid Kit",
    "Immunity Booster Gummies",
    "Cooling Gel Pack",
    "Sleep Support Tea",
    "Nasal Care Spray",
    "Calcium Supplement Tabs",
    "Hot Water Bag",
    "Detox Herbal Capsules",
  ],
  "Cleaning Essentials": [
    "Lemon Dishwash Liquid",
    "Floor Cleaner Refill",
    "Laundry Detergent Powder",
    "Toilet Cleaner Gel",
    "Kitchen Wipes Tub",
    "Glass Cleaner Spray",
    "Disinfectant Surface Spray",
    "Garbage Bag Roll",
    "Fabric Softener Bottle",
    "Scrub Sponge Pack",
    "Bleach Cleaning Liquid",
    "Multi Purpose Cleaner",
    "Toilet Tissue Pack",
    "Air Freshener Refill",
    "Stain Remover Gel",
  ],
  "Home & Office": [
    "Storage Zip Bags",
    "Kitchen Foil Wrap",
    "Paper Towel Rolls",
    "Ball Pen Combo Pack",
    "Sticky Note Pads",
    "Lunch Box Containers",
    "Desk Organizer Tray",
    "Steel Water Bottle",
    "Food Storage Wrap",
    "Notebook Value Pack",
    "Battery Cell Pack",
    "Coffee Mug Set",
    "Cable Tie Bundle",
    "Kitchen Tissue Box",
    "Mini Trash Liners",
  ],
  "Personal Care": [
    "Hydrating Face Wash",
    "Herbal Shampoo Bottle",
    "Fresh Mint Toothpaste",
    "Body Lotion Pump",
    "Sensitive Soap Bars",
    "Daily Deodorant Roll On",
    "Aloe Vera Gel",
    "Hair Conditioner Tube",
    "Soft Tissue Pocket Pack",
    "Moisturizing Hand Cream",
    "Beard Grooming Kit",
    "Sunscreen SPF Lotion",
    "Cotton Pad Pack",
    "Lip Balm Duo",
    "Bathing Bar Set",
  ],
  "Pet Care": [
    "Adult Dog Food",
    "Cat Litter Pack",
    "Chicken Pet Treats",
    "Pet Grooming Shampoo",
    "Puppy Training Pads",
    "Cat Wet Food",
    "Pet Water Bowl",
    "Dental Chew Sticks",
    "Flea Care Powder",
    "Pet Waste Bag Roll",
    "Grain Free Kibble",
    "Pet Play Ball",
    "Kitten Milk Treat",
    "Pet Hair Brush",
    "Pet Odor Spray",
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

function createCategoryImage(label: string, palette: Palette) {
  const shortLabel = label
    .split(/[,&]/)
    .map((word) => word.trim().slice(0, 1))
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" fill="none">
      <defs>
        <linearGradient id="g" x1="32" y1="32" x2="288" y2="288" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.from}"/>
          <stop offset="1" stop-color="${palette.to}"/>
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="56" fill="#ffffff"/>
      <rect x="24" y="24" width="272" height="272" rx="44" fill="url(#g)"/>
      <circle cx="242" cy="88" r="42" fill="rgba(255,255,255,0.26)"/>
      <circle cx="94" cy="98" r="26" fill="rgba(255,255,255,0.18)"/>
      <rect x="68" y="184" width="184" height="54" rx="27" fill="rgba(255,255,255,0.2)"/>
      <text x="160" y="170" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff">${escapeXml(shortLabel)}</text>
      <text x="160" y="218" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff">${escapeXml(label.slice(0, 22))}</text>
    </svg>
  `);
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
  size: string;
  price: string;
  deliveryTime: string;
  image: string;
};

export type ProductCarouselSection = {
  title: string;
  sectionId: string;
  seeAllHref: string;
  items: ProductItem[];
};

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
  { name: "Baby Care", icon: "baby", brand: "Tiny Nest", palette: { from: "#38bdf8", to: "#93c5fd", shell: "#eef7ff", badge: "#2563eb", text: "#1d4ed8" } },
  { name: "Pharma & Wellness", icon: "pharma", brand: "Well Path", palette: { from: "#14b8a6", to: "#67e8f9", shell: "#edfdfd", badge: "#0f766e", text: "#134e4a" } },
  { name: "Cleaning Essentials", icon: "cleaning", brand: "Clean Sweep", palette: { from: "#06b6d4", to: "#a5f3fc", shell: "#ecfcff", badge: "#0e7490", text: "#164e63" } },
  { name: "Home & Office", icon: "office", brand: "Desk & Home", palette: { from: "#64748b", to: "#cbd5e1", shell: "#f3f6fb", badge: "#334155", text: "#1e293b" } },
  { name: "Personal Care", icon: "personal-care", brand: "Pure Daily", palette: { from: "#f472b6", to: "#fbcfe8", shell: "#fff1f7", badge: "#be185d", text: "#831843" } },
  { name: "Pet Care", icon: "pet", brand: "Happy Paws", palette: { from: "#a855f7", to: "#d8b4fe", shell: "#f7f0ff", badge: "#7e22ce", text: "#581c87" } },
];

const categoryMap = new Map(categoryConfigs.map((config) => [config.name, config]));

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
  mobileHeroEmbed:
    "https://www.youtube.com/embed/x-ZFmik0geY?autoplay=1&mute=1&loop=1&playlist=x-ZFmik0geY&controls=0&playsinline=1&rel=0",
  heroPoster: localAsset("assets/food-hero-poster.svg"),
  splashVideo:
    "https://cdn.dribbble.com/userupload/37155242/file/original-dfa8adc9e11296c13069bce9286cb596.mp4",
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
  { label: "Beauty", icon: "beauty", href: "#personal-care" },
  { label: "Personal Care", icon: "personal-care", href: "#personal-care" },
  { label: "Home", icon: "home", href: "#home-office" },
  { label: "Electronics", icon: "electronics", href: "#home-office" },
  { label: "Baby & Mom", icon: "baby", href: "#baby-care" },
  { label: "Health", icon: "health", href: "#pharma-wellness" },
];

export const categories: CategoryTile[] = categoryConfigs.map((category) => ({
  name: category.name,
  icon: category.icon,
  image: createCategoryImage(category.name, category.palette),
  sectionId: `category-${slugify(category.name)}`,
}));

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
    seeAllHref: "#categories",
    items: PRODUCT_NAMES_BY_CATEGORY[category.name].map((productName, index) => ({
      id: `${slugify(category.name)}-${index + 1}`,
      brand: category.brand,
      name: productName,
      size: PRODUCT_SIZES[index],
      price: `$${(PRODUCT_PRICES[index] + category.name.length * 0.11).toFixed(2)}`,
      deliveryTime: DELIVERY_BADGES[index % DELIVERY_BADGES.length],
      image: createProductImage(productName, category.brand, category.palette),
    })),
  }));

export type FooterContactItem = {
  label: string;
  value: string;
  type: "location" | "phone" | "email" | "hours";
};

export type FooterLinkColumn = {
  title: string;
  links: string[];
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
      "About Us",
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
      "Compare products",
    ],
  },
  {
    title: "Corporate",
    links: [
      "Become a Vendor",
      "Affiliate Program",
      "Farm Business",
      "Farm Careers",
      "Our Suppliers",
      "Accessibility",
      "Promotions",
    ],
  },
];
