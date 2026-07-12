import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const publicRoot = join(root, "public");
const distRoot = join(root, "dist");

const directories = [
  "assets/atta-rice-dal-mockups",
  "assets/bakery-biscuits-mockups",
  "assets/breakfast-instant-food-mockups",
  "assets/categories",
  "assets/chicken-meat-fish-mockups",
  "assets/dairy-bread-mockups",
  "assets/drinks-beverage-mockups",
  "assets/frozen-mockups",
  "assets/fruits-vegetables-mockups",
  "assets/home-banners",
  "assets/masala-oil-more-mockups",
  "assets/organic-healthy-living-mockups",
  "assets/payment-icons",
  "assets/sauces-spreads-mockups",
  "assets/snacks-munchies-mockups",
  "assets/sweet-tooth-mockups",
  "assets/tea-coffee-milk-drinks-mockups",
  "assets/vegan-foods-mockups",
  "images/about/circle-assets",
];

const files = [
  "404.html",
  "favicon.svg",
  "assets/food-hero-poster.svg",
  "assets/food-horizontal.mp4",
  "assets/food-online-long-text-cutout.png",
  "images/about/about-food-table.webp",
  "images/about/leadership/ahmet-yilmaz.webp",
  "images/about/leadership/anna-goldstein.webp",
  "images/about/leadership/jakapun-viwatkurkul.webp",
  "images/about/leadership/janet-weiler.webp",
  "images/about/leadership/lucas-huber.webp",
  "images/about/leadership/natalie.webp",
  "images/about/leadership/pasit-viwatkurkul.webp",
  "images/about/leadership/paul-pongpichan.webp",
  "images/affiliate/affiliate-dashboard.png",
  "images/affiliate/affiliate-signup-banner.webp",
  "images/affiliate/how-it-works/create-account-visual.png",
  "images/affiliate/how-it-works/get-started-visual.png",
  "images/affiliate/how-it-works/share-visual.png",
  "images/become-partner/partner-food-table.webp",
  "images/become-partner/partner-icon-globe.png",
  "images/become-partner/partner-icon-growth.png",
  "images/become-partner/partner-icon-megaphone.png",
  "images/become-partner/partner-team.png",
  "images/become-sponsor/category-pages-1.png",
  "images/become-sponsor/category-pages-2.png",
  "images/become-sponsor/deals-bestsellers-new-arrivals-1.png",
  "images/become-sponsor/deals-bestsellers-new-arrivals-2.png",
  "images/become-sponsor/featured-homepage-visual.png",
  "images/become-sponsor/over-30-million-downloads.png",
  "images/become-sponsor/product-detail-pages-1.png",
  "images/become-sponsor/product-detail-pages-2.png",
  "images/become-sponsor/search-results-advertising-phone.png",
  "images/become-sponsor/sponsored-products-phone-bg.png",
  "images/become-sponsor/sponsored-products-weekly-1.png",
  "images/become-sponsor/sponsored-products-weekly-2.png",
  "images/become-vendor/vendor-food-globe-transparent.webp",
  "images/become-vendor/vendor-hero-tomato.svg",
  "images/become-vendor/vendor-hero-vegetable.svg",
  "images/contact-us/contact-hero-groceries.webp",
  "images/drivers/driver-apply-team.webp",
  "images/drivers/driver-earnings-person-crop.webp",
  "images/drivers/driver-payout-phone.webp",
  "images/drivers/driver-program-van.webp",
  "images/drivers/driver-route-delivery.webp",
  "images/drivers/driver-schedule-calendar.webp",
  "images/drivers/driver-value-cab.webp",
  "images/drivers/driver-value-loading.webp",
  "images/drivers/driver-value-pair.webp",
  "images/drivers/driver-value-team.webp",
  "images/drivers/foodonlines-driver-community.webp",
  "images/drivers/foodonlines-driver-earnings.webp",
  "images/drivers/foodonlines-driver-hero.webp",
  "images/drivers/foodonlines-driver-support.webp",
  "images/wholesaler/brands-corporate.webp",
  "images/wholesaler/brands-hospitality.webp",
  "images/wholesaler/brands-restaurant.webp",
  "images/wholesaler/brands-retail.webp",
  "images/wholesaler/hero-section.webp",
  "images/wholesaler/savings-bibigo-bag.webp",
  "images/wholesaler/savings-canned-chicken.webp",
  "images/wholesaler/savings-curry-box.webp",
  "images/wholesaler/savings-sauce-tubs.webp",
  "images/wholesaler/savings-wave.png",
];

function copyPublicPath(relativePath) {
  const from = join(publicRoot, relativePath);
  const to = join(distRoot, relativePath);

  if (!existsSync(from)) {
    throw new Error(`Missing public asset: ${relativePath}`);
  }

  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

for (const directory of directories) {
  copyPublicPath(directory);
}

for (const file of files) {
  copyPublicPath(file);
}

console.log(`Copied ${directories.length} public asset directories and ${files.length} explicit public assets.`);
