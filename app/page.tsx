import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ShowcaseSection } from "@/components/ShowcaseSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main id="hero">
        <HeroSection />
        <ShowcaseSection />
      </main>
      <Footer />
    </div>
  );
}
