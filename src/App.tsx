import { useEffect } from "react";
import { AccountSummary } from "./components/AccountSummary";
import { CategoryStrip } from "./components/CategoryStrip";
import { DealsGrid } from "./components/DealsGrid";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HeroSlider } from "./components/HeroSlider";
import { LoginFlow } from "./components/LoginFlow";
import { PromoExperience } from "./components/PromoExperience";
import { ShortcutRow } from "./components/ShortcutRow";
import { SignupFlow } from "./components/SignupFlow";
import { useHomeStore } from "./store/homeStore";
import { usePublicAuthStore } from "./store/publicAuthStore";

export default function App() {
  const siteView = useHomeStore((state) => state.siteView);
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
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [siteView]);

  return (
    <main className="min-h-screen bg-white font-sans text-ink">
      <Header />
      {siteView === "home" ? (
        <div className="pt-[132px] sm:pt-[146px] lg:pt-[154px]">
          <ShortcutRow />
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
      <Footer />
      {siteView === "home" ? <PromoExperience /> : null}
    </main>
  );
}
