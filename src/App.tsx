import { CategoryStrip } from "./components/CategoryStrip";
import { DealsGrid } from "./components/DealsGrid";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HeroSlider } from "./components/HeroSlider";

export default function App() {
  return (
    <main className="min-h-screen bg-white font-sans text-ink">
      <Header />
      <HeroSlider />
      <CategoryStrip />
      <DealsGrid />
      <Footer />
    </main>
  );
}
