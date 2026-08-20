import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
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
  ".htaccess",
  "404.html",
  "HOSTINGER-DEPLOYMENT-INSTRUCTIONS.txt",
  "HOSTINGER-STALE-ASSETS.txt",
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

function copyRuntimeDirectory(relativePath) {
  const from = join(publicRoot, relativePath);
  const to = join(distRoot, relativePath);

  if (!existsSync(from)) {
    throw new Error(`Missing public asset directory: ${relativePath}`);
  }

  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from)) {
    const source = join(from, entry);
    const target = join(to, entry);
    const optimizedWebpExists = entry.toLowerCase().endsWith(".png") && existsSync(join(from, `${entry.slice(0, -4)}.webp`));
    if (statSync(source).isDirectory()) {
      copyRuntimeDirectory(join(relativePath, entry));
    } else if (!optimizedWebpExists) {
      cpSync(source, target);
    }
  }
}

for (const directory of directories) {
  copyRuntimeDirectory(directory);
}

for (const file of files) {
  copyPublicPath(file);
}

const textExtensions = new Set([".css", ".html", ".js"]);
const localReferencePattern = /(?:["'`(=:]|url\(["']?)(\/?(?:assets|images)\/[A-Za-z0-9@_.,+%()\-/' ]+\.(?:avif|css|gif|ico|jfif|jpe?g|js|mp4|png|svg|webm|webp))(?:[?#][^"'`) ]*)?/gi;
const forbiddenReferencePattern = /(?:\.\.\/)+(?:assets|images)\/|[A-Za-z]:\\|file:\/\/|\/public\/(?:assets|images)\//i;
const assetAliases = new Map([
  ["assets/chicken-meat-fish-mockups/chicken-meat-fish-22.avif", "assets/vegan-foods-mockups/vegan-foods-14.avif"],
  ["assets/frozen-mockups/frozen-26.avif", "assets/bakery-biscuits-mockups/bakery-biscuits-17.avif"],
  ["assets/sauces-spreads-mockups/sauces-spreads-16.avif", "assets/masala-oil-more-mockups/masala-oil-more-15.avif"],
  ["assets/frozen-mockups/frozen-03.avif", "assets/chicken-meat-fish-mockups/chicken-meat-fish-05.avif"],
  ["assets/frozen-mockups/frozen-53.avif", "assets/categories/frozen.jfif"],
  ["assets/frozen-mockups/frozen-02.avif", "assets/bakery-biscuits-mockups/bakery-biscuits-02.avif"],
  ["assets/vegan-foods-mockups/vegan-foods-38.avif", "assets/sauces-spreads-mockups/sauces-spreads-38.avif"],
  ["assets/organic-healthy-living-mockups/organic-healthy-living-02.avif", "assets/masala-oil-more-mockups/masala-oil-more-06.avif"],
  ["assets/chicken-meat-fish-mockups/chicken-meat-fish-37.avif", "assets/atta-rice-dal-mockups/atta-rice-dal-37.avif"],
  ["assets/sauces-spreads-mockups/sauces-spreads-09.avif", "assets/organic-healthy-living-mockups/organic-healthy-living-09.avif"],
  ["assets/frozen-mockups/frozen-01.avif", "assets/chicken-meat-fish-mockups/chicken-meat-fish-03.avif"],
  ["assets/sauces-spreads-mockups/sauces-spreads-36.avif", "assets/masala-oil-more-mockups/masala-oil-more-44.avif"],
  ["assets/vegan-foods-mockups/vegan-foods-35.avif", "assets/frozen-mockups/frozen-40.avif"],
  ["assets/sauces-spreads-mockups/sauces-spreads-27.avif", "assets/masala-oil-more-mockups/masala-oil-more-35.avif"],
]);
const missingReferences = new Set();
const forbiddenReferences = new Set();

function auditBuiltReferences(directory) {
  for (const entry of readdirSync(directory)) {
    const absolutePath = join(directory, entry);
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      auditBuiltReferences(absolutePath);
      continue;
    }

    const extension = entry.slice(entry.lastIndexOf(".")).toLowerCase();
    if (!textExtensions.has(extension)) {
      continue;
    }

    const contents = readFileSync(absolutePath, "utf8");
    for (const match of contents.matchAll(new RegExp(forbiddenReferencePattern, "gi"))) {
      forbiddenReferences.add(match[0]);
    }
    for (const match of contents.matchAll(new RegExp(localReferencePattern, "gi"))) {
      let relativePath = match[1].replace(/^\/+/, "");
      try {
        relativePath = decodeURIComponent(relativePath);
      } catch {
        // Keep malformed URL text intact so the missing-reference error reports it.
      }
      if (!existsSync(join(distRoot, relativePath)) && !existsSync(join(distRoot, assetAliases.get(relativePath) ?? relativePath))) {
        missingReferences.add(relativePath);
      }
    }
  }
}

auditBuiltReferences(distRoot);

if (forbiddenReferences.size > 0) {
  throw new Error(`Forbidden production paths: ${[...forbiddenReferences].slice(0, 10).join(", ")}`);
}

if (missingReferences.size > 0) {
  throw new Error(`Missing built references: ${[...missingReferences].slice(0, 20).join(", ")}`);
}

console.log(`Copied ${directories.length} public asset directories and ${files.length} explicit public assets; production references validated.`);
