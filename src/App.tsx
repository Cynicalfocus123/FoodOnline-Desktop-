import { lazy, Suspense, useEffect } from "react";
import { CategoryStrip } from "./components/CategoryStrip";
import { DealsGrid } from "./components/DealsGrid";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HeroSlider } from "./components/HeroSlider";
import { PromoExperience } from "./components/PromoExperience";
import { useHomeStore } from "./store/homeStore";
import { usePublicAuthStore } from "./store/publicAuthStore";

const AccountPage = lazy(() => import("./components/AccountPage").then((module) => ({ default: module.AccountPage })));
const AboutUsPage = lazy(() => import("./components/AboutUsPage").then((module) => ({ default: module.AboutUsPage })));
const AffiliateHeroSection = lazy(() =>
  import("./components/AffiliateHeroSection").then((module) => ({ default: module.AffiliateHeroSection })),
);
const BecomePartnerPage = lazy(() => import("./components/BecomePartnerPage").then((module) => ({ default: module.BecomePartnerPage })));
const BecomeSponsorPage = lazy(() => import("./components/BecomeSponsorPage").then((module) => ({ default: module.BecomeSponsorPage })));
const BecomeVendorPage = lazy(() => import("./components/BecomeVendorPage").then((module) => ({ default: module.BecomeVendorPage })));
const CartPage = lazy(() => import("./components/CartPage").then((module) => ({ default: module.CartPage })));
const CategoryListingPage = lazy(() =>
  import("./components/CategoryListingPage").then((module) => ({ default: module.CategoryListingPage })),
);
const CheckoutPage = lazy(() => import("./components/CheckoutPage").then((module) => ({ default: module.CheckoutPage })));
const ContactUsPage = lazy(() => import("./components/ContactUsPage").then((module) => ({ default: module.ContactUsPage })));
const DriverLandingPage = lazy(() => import("./components/DriverLandingPage").then((module) => ({ default: module.DriverLandingPage })));
const FaqPage = lazy(() => import("./components/FaqPage").then((module) => ({ default: module.FaqPage })));
const LoginFlow = lazy(() => import("./components/LoginFlow").then((module) => ({ default: module.LoginFlow })));
const ProductDetailPage = lazy(() => import("./components/ProductDetailPage").then((module) => ({ default: module.ProductDetailPage })));
const PrivacyPolicyPage = lazy(() => import("./components/PrivacyPolicyPage").then((module) => ({ default: module.PrivacyPolicyPage })));
const ReturnPolicyPage = lazy(() => import("./components/ReturnPolicyPage").then((module) => ({ default: module.ReturnPolicyPage })));
const SearchResultsPage = lazy(() => import("./components/SearchResultsPage").then((module) => ({ default: module.SearchResultsPage })));
const SignupFlow = lazy(() => import("./components/SignupFlow").then((module) => ({ default: module.SignupFlow })));
const TermsOfUsePage = lazy(() => import("./components/TermsOfUsePage").then((module) => ({ default: module.TermsOfUsePage })));
const WholesalerPage = lazy(() => import("./components/WholesalerPage").then((module) => ({ default: module.WholesalerPage })));

export default function App() {
  const siteView = useHomeStore((state) => state.siteView);
  const selectedProductId = useHomeStore((state) => state.selectedProductId);
  const selectedCategorySlug = useHomeStore((state) => state.selectedCategorySlug);
  const searchQuery = useHomeStore((state) => state.searchQuery);
  const syncRouteFromHash = useHomeStore((state) => state.syncRouteFromHash);
  const hydrateSession = usePublicAuthStore((state) => state.hydrateSession);
  const hasHydratedSession = usePublicAuthStore((state) => state.hasHydratedSession);
  const token = usePublicAuthStore((state) => state.token);

  useEffect(() => {
    if (!hasHydratedSession) {
      void hydrateSession();
    }
  }, [hasHydratedSession, hydrateSession, token]);

  useEffect(() => {
    syncRouteFromHash(window.location.hash);

    const handleRouteChange = () => {
      syncRouteFromHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [syncRouteFromHash]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [searchQuery, selectedCategorySlug, selectedProductId, siteView]);

  return (
    <main className="min-h-screen bg-white font-sans text-ink">
      <Header />
      {siteView === "home" ? (
        <div className="pt-[116px] sm:pt-[128px] lg:pt-[138px]">
          <HeroSlider />
          <CategoryStrip />
          <DealsGrid />
        </div>
      ) : null}
      <Suspense fallback={null}>
        {siteView === "signup" ? <SignupFlow /> : null}
        {siteView === "login" ? <LoginFlow /> : null}
        {siteView === "cart" ? <CartPage /> : null}
        {siteView === "checkout" ? <CheckoutPage /> : null}
        {siteView === "category" ? <CategoryListingPage /> : null}
        {siteView === "product" ? <ProductDetailPage /> : null}
        {siteView === "search" ? <SearchResultsPage /> : null}
        {siteView === "account" ? <AccountPage /> : null}
        {siteView === "aboutUs" ? <AboutUsPage /> : null}
        {siteView === "contactUs" ? <ContactUsPage /> : null}
        {siteView === "becomeVendor" ? <BecomeVendorPage /> : null}
        {siteView === "becomePartner" ? <BecomePartnerPage /> : null}
        {siteView === "becomeSponsor" ? <BecomeSponsorPage /> : null}
        {siteView === "wholesaler" ? <WholesalerPage /> : null}
        {siteView === "affiliate" ? <AffiliateHeroSection /> : null}
        {siteView === "drivers" ? <DriverLandingPage /> : null}
        {siteView === "returnPolicy" ? <ReturnPolicyPage /> : null}
        {siteView === "termsOfUse" ? <TermsOfUsePage /> : null}
        {siteView === "privacyPolicy" ? <PrivacyPolicyPage /> : null}
        {siteView === "faq" ? <FaqPage /> : null}
      </Suspense>
      <Footer />
      {siteView === "home" ? <PromoExperience /> : null}
    </main>
  );
}
