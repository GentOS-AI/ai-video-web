import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";

// Lazy load ShowcaseSection since it's below the fold
const ShowcaseSection = dynamic(
  () => import("@/components/ShowcaseSection").then((mod) => ({ default: mod.ShowcaseSection })),
  {
    loading: () => (
      <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-bg/30">
        <div className="max-w-7xl mx-auto text-center">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mx-auto mb-4" />
          <div className="h-4 w-96 bg-gray-200 animate-pulse rounded mx-auto" />
        </div>
      </div>
    ),
    ssr: true,
  }
);

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
