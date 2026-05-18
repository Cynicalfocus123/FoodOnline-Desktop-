import { CategoryStrip } from "./components/CategoryStrip";
import { DealsGrid } from "./components/DealsGrid";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HeroSlider } from "./components/HeroSlider";
import { SignupFlow } from "./components/SignupFlow";
import { useHomeStore } from "./store/homeStore";

export default function App() {
  const signupView = useHomeStore((state) => state.signupView);

  return (
    <main className="min-h-screen bg-white font-sans text-ink">
      <Header />
      {signupView === "home" ? (
        <>
          <HeroSlider />
          <CategoryStrip />
          <DealsGrid />
        </>
      ) : (
        <SignupFlow />
      )}
      <Footer />
    </main>
  );
}
