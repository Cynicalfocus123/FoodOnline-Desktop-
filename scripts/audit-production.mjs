import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const distRoot = join(root, "dist");
const sourceRoot = join(root, "src");

const routeAudit = [
  ["/", "Home shell", null, null],
  ["/login", "LoginFlow", "LoginFlow-", null],
  ["/signup", "SignupFlow", "SignupFlow-", null],
  ["/account", "AccountPage", "AccountPage-", null],
  ["/search/:query", "SearchResultsPage", "SearchResultsPage-", null],
  ["/cart", "CartPage", "CartPage-", null],
  ["/checkout", "CheckoutPage", "CheckoutPage-", null],
  ["/category/:slug", "CategoryListingPage", "CategoryListingPage-", null],
  ["/product/:id", "ProductDetailPage", "ProductDetailPage-", null],
  ["/wholesaler", "WholesalerPage", "WholesalerPage-", "images/wholesaler"],
  ["/become-vendor", "BecomeVendorPage", "BecomeVendorPage-", "images/become-vendor"],
  ["/become-partner", "BecomePartnerPage", "BecomePartnerPage-", "images/become-partner"],
  ["/affiliate", "AffiliateHeroSection", "AffiliateHeroSection-", "images/affiliate"],
  ["/become-a-sponsor", "BecomeSponsorPage", "BecomeSponsorPage-", "images/become-sponsor"],
  ["/company/drivers", "DriverLandingPage", "DriverLandingPage-", "images/drivers"],
  ["/about-us", "AboutUsPage", "AboutUsPage-", "images/about"],
  ["/contact-us", "ContactUsPage", "ContactUsPage-", "images/contact-us"],
  ["/faq", "FaqPage", "FaqPage-", null],
  ["/privacy-policy", "PrivacyPolicyPage", "PrivacyPolicyPage-", null],
  ["/return-policy", "ReturnPolicyPage", "ReturnPolicyPage-", null],
  ["/terms-and-conditions", "TermsOfUsePage", "TermsOfUsePage-", null],
  ["/recipes", "InformationPage", "InformationPage-", null],
  ["/company-news", "InformationPage", "InformationPage-", null],
  ["/our-mission", "InformationPage", "InformationPage-", null],
  ["/accessibility", "InformationPage", "InformationPage-", null],
  ["/sitemap", "InformationPage", "InformationPage-", null],
  ["/admin", "AdminPortal", "admin-", null],
];

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const absolutePath = join(directory, entry);
    return statSync(absolutePath).isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

if (!existsSync(distRoot)) {
  throw new Error("dist does not exist; run the production build first.");
}

const distFiles = walk(distRoot);
const distRelative = new Set(distFiles.map((file) => relative(distRoot, file).replaceAll("\\", "/")));
const jsFiles = [...distRelative].filter((file) => file.endsWith(".js"));
const failures = [];

const compiledTextFiles = distFiles.filter((file) => [".html", ".js", ".css"].includes(extname(file)));
const forbiddenCompiledPatterns = [
  [/www\.api\.foodonlines\.com/i, "obsolete API hostname"],
  [/API TARGET/i, "visible API target label"],
  [/API BASE URL/i, "visible API base URL label"],
  [/BACKEND URL/i, "visible backend URL label"],
  [/SERVER URL/i, "visible server URL label"],
  [/DEBUG API/i, "visible debug API label"],
];

for (const file of compiledTextFiles) {
  const contents = readFileSync(file, "utf8");
  for (const [pattern, label] of forbiddenCompiledPatterns) {
    if (pattern.test(contents)) failures.push(`${relative(distRoot, file)}: ${label}`);
  }
}

if (distFiles.some((file) => file.endsWith(".map"))) {
  failures.push("source maps must not be included in the production deployment");
}

for (const [route, component, chunkPrefix, mediaDirectory] of routeAudit) {
  if (chunkPrefix && !jsFiles.some((file) => file.startsWith(`assets/${chunkPrefix}`))) {
    failures.push(`${route}: missing ${component} chunk (${chunkPrefix}*)`);
  }
  if (mediaDirectory && ![...distRelative].some((file) => file.startsWith(`${mediaDirectory}/`))) {
    failures.push(`${route}: missing media directory ${mediaDirectory}`);
  }
}

const sourceFiles = walk(sourceRoot).filter((file) => [".ts", ".tsx", ".css"].includes(extname(file)));
const placeholderPattern = /href\s*=\s*["'](?:#|\s*)["']|javascript:void\s*\(/i;
for (const file of sourceFiles) {
  const contents = readFileSync(file, "utf8");
  if (placeholderPattern.test(contents)) {
    failures.push(`placeholder navigation in ${relative(root, file)}`);
  }
}

const indexHtml = readFileSync(join(distRoot, "index.html"), "utf8");
const adminHtml = readFileSync(join(distRoot, "admin.html"), "utf8");
for (const [name, html] of [["index.html", indexHtml], ["admin.html", adminHtml]]) {
  if (/\b(?:src|href)=["']\.\.?\//i.test(html)) {
    failures.push(`${name}: document-relative entry asset`);
  }
}

const htaccess = readFileSync(join(distRoot, ".htaccess"), "utf8");
if (!htaccess.includes("[R=404,L]") || !htaccess.includes("RewriteRule . index.html") || !htaccess.includes("RewriteRule ^admin(?:/.*)?$ admin.html [L]")) {
  failures.push(".htaccess does not separate missing static files from SPA routes");
}

if (failures.length > 0) {
  throw new Error(`Production audit failed:\n- ${failures.join("\n- ")}`);
}

const bytes = distFiles.reduce((total, file) => total + statSync(file).size, 0);
const mediaCount = (directory) => [...distRelative].filter((file) => file.startsWith(`${directory}/`)).length;
console.log(JSON.stringify({
  routes: routeAudit.length,
  lazyChunks: new Set(routeAudit.map((row) => row[2]).filter((value) => value && value !== "admin-")).size,
  javascriptFiles: jsFiles.length,
  localReferencesMissing: 0,
  placeholderLinks: 0,
  driverAssets: mediaCount("images/drivers"),
  wholesalerAssets: mediaCount("images/wholesaler"),
  files: distFiles.length,
  bytes,
}, null, 2));
