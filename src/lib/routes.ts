const configuredPublicBase = import.meta.env?.BASE_URL ?? "/";
const publicBase = configuredPublicBase.endsWith("/") ? configuredPublicBase : `${configuredPublicBase}/`;

const applicationRoutePattern = /^(?:home|signup|login|cart|checkout|invite\/[^/?#]+|account(?:\/[^/?#]+)?|category\/[^/?#]+|product\/[^/?#]+|search\/[^?#]+|about-us|contact-us|return-policy|terms-and-conditions|privacy-policy|faq|become-vendor|become-partner|become-a-sponsor|wholesaler|affiliate|company\/drivers|recipes|company-news|our-mission|accessibility|sitemap)(?:[/?#].*)?$/i;

export function getPublicRouteHref(route = "") {
  return `${publicBase}${route.replace(/^\/+/, "")}`;
}

export function readCurrentRouteHash() {
  if (typeof window === "undefined") {
    return "#home";
  }

  const legacyHashRoute = window.location.hash.replace(/^#/, "");
  if (applicationRoutePattern.test(legacyHashRoute)) {
    return `#${legacyHashRoute}`;
  }

  let pathname = window.location.pathname;
  if (publicBase !== "/" && pathname.startsWith(publicBase)) {
    pathname = pathname.slice(publicBase.length);
  } else {
    pathname = pathname.replace(/^\/+/, "");
  }

  return pathname ? `#${pathname.replace(/\/+$/, "")}` : "#home";
}
