import { getPublicRouteHref } from "../lib/routes";

type InformationPageKey = "recipes" | "company-news" | "our-mission" | "accessibility" | "sitemap";

const pageContent: Record<InformationPageKey, { eyebrow: string; title: string; description: string }> = {
  recipes: {
    eyebrow: "FoodOnlines recipes",
    title: "Recipes for every table",
    description: "Explore practical meal ideas using groceries, pantry staples, snacks, drinks, and global ingredients available from FoodOnlines.",
  },
  "company-news": {
    eyebrow: "Company news",
    title: "What’s happening at FoodOnlines",
    description: "Product, service, partnership, and community updates from the FoodOnlines team will be published here.",
  },
  "our-mission": {
    eyebrow: "Our mission",
    title: "Global food, made easier to find",
    description: "FoodOnlines works to make authentic groceries more accessible, affordable, and convenient for households and businesses.",
  },
  accessibility: {
    eyebrow: "Accessibility",
    title: "A storefront designed for everyone",
    description: "FoodOnlines is committed to improving keyboard access, readable content, clear controls, and compatibility with assistive technology.",
  },
  sitemap: {
    eyebrow: "Sitemap",
    title: "Find your way around FoodOnlines",
    description: "Use the site header and footer to reach shopping, account, company, support, wholesale, partner, affiliate, sponsor, and driver destinations.",
  },
};

export function InformationPage({ page }: { page: InformationPageKey }) {
  const content = pageContent[page];
  return (
    <section className="min-h-[62vh] bg-[#fbfaf7] px-4 pb-24 pt-40 sm:px-6 sm:pt-48">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-citrus-600">{content.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.03em] text-neutral-950 sm:text-6xl">{content.title}</h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-neutral-700">{content.description}</p>
        <a className="mt-10 inline-flex min-h-12 items-center rounded-xl bg-leaf-600 px-6 font-bold text-white" href={getPublicRouteHref()}>
          Back to FoodOnlines
        </a>
      </div>
    </section>
  );
}
