const localAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const assets = {
  logo: localAsset("assets/food-online-long-text-cutout.png"),
  heroVideo: localAsset("assets/food-horizontal.mp4"),
  splashVideo:
    "https://cdn.dribbble.com/userupload/37155242/file/original-dfa8adc9e11296c13069bce9286cb596.mp4",
};

export const navItems = ["Home", "Best deals", "Categories", "Company"];

export const slides = [
  {
    title: "Fresh food, ready for any night",
  },
  {
    eyebrow: "Black Friday offer",
    title: "Organic foods up to 50% off",
    body: "Seasonal fruit, vegetables, bakery, dairy, and ready meals with crisp desktop checkout flow.",
  },
  {
    eyebrow: "Local supplier chain",
    title: "Market-fresh groceries without market chaos",
    body: "Track categories, compare deals, and reserve daily essentials before the evening rush.",
  },
];

export const categories = [
  { name: "Vegetable", items: "25 items", accent: "bg-leaf-100 text-leaf-700" },
  { name: "Coffee & Drinks", items: "15 items", accent: "bg-orange-100 text-citrus-600" },
  { name: "Milk & Dairy", items: "18 items", accent: "bg-citrus-500 text-white" },
  { name: "Meat", items: "55 items", accent: "bg-yellow-100 text-yellow-700" },
  { name: "Fresh Fruits", items: "30 items", accent: "bg-pink-100 text-pink-700" },
];

export const products = [
  {
    name: "Organic Tomato Basket",
    price: "$10.00",
    previousPrice: "$24.00",
    tag: "-40%",
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Berry Vanilla Tray",
    price: "$14.00",
    previousPrice: "$24.00",
    tag: "-12%",
    image:
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Broccoli Morning Pack",
    price: "$9.00",
    previousPrice: "$18.00",
    tag: "Fresh",
    image:
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=640&q=80",
  },
];

export const footerLinkRows = [
  ["Privacy", "Terms", "FAQ", "Company News", "Our Mission", "Contact Us"],
  ["Seller", "Recipe", "Partners"],
];
