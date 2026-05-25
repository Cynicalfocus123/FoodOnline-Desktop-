import { useEffect } from "react";
import { AccountSummary } from "./components/AccountSummary";
import { CartPage } from "./components/CartPage";
import { CategoryStrip } from "./components/CategoryStrip";
import { CategoryListingPage } from "./components/CategoryListingPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { DealsGrid } from "./components/DealsGrid";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HeroSlider } from "./components/HeroSlider";
import { LoginFlow } from "./components/LoginFlow";
import { ProductDetailPage } from "./components/ProductDetailPage";
import { PromoExperience } from "./components/PromoExperience";
import { SignupFlow } from "./components/SignupFlow";
import { useHomeStore } from "./store/homeStore";
import { usePublicAuthStore } from "./store/publicAuthStore";

export default function App() {
  const siteView = useHomeStore((state) => state.siteView);
  const selectedProductId = useHomeStore((state) => state.selectedProductId);
  const selectedCategorySlug = useHomeStore((state) => state.selectedCategorySlug);
  const syncRouteFromHash = useHomeStore((state) => state.syncRouteFromHash);
  const hydrateSession = usePublicAuthStore((state) => state.hydrateSession);
  const hasHydratedSession = usePublicAuthStore((state) => state.hasHydratedSession);
  const currentUser = usePublicAuthStore((state) => state.currentUser);
  const token = usePublicAuthStore((state) => state.token);

  useEffect(() => {
    if (!hasHydratedSession) {
      void hydrateSession();
    }
  }, [hasHydratedSession, hydrateSession, token]);

  useEffect(() => {
    syncRouteFromHash(window.location.hash);

    const handleHashChange = () => {
      syncRouteFromHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [syncRouteFromHash]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [siteView, selectedProductId, selectedCategorySlug]);

  return (
    <main className="min-h-screen bg-white font-sans text-ink">
      <Header />
      {siteView === "home" ? (
        <div className="pt-[116px] sm:pt-[128px] lg:pt-[138px]">
          <HeroSlider />
          {currentUser ? <AccountSummary /> : null}
          <CategoryStrip />
          <DealsGrid />
        </div>
      ) : null}
      {siteView === "signup" ? (
        <SignupFlow />
      ) : null}
      {siteView === "login" ? <LoginFlow /> : null}
      {siteView === "cart" ? <CartPage /> : null}
      {siteView === "checkout" ? <CheckoutPage /> : null}
      {siteView === "category" ? <CategoryListingPage /> : null}
      {siteView === "product" ? <ProductDetailPage /> : null}
      <Footer />
      {siteView === "home" ? <PromoExperience /> : null}
    </main>
  );
}
