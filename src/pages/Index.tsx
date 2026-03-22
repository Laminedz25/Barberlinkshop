import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SearchFilters from "@/components/SearchFilters";
import SalonGrid from "@/components/SalonGrid";
import AppDownload from "@/components/AppDownload";
import Footer from "@/components/Footer";
import PricingPlans from "@/components/PricingPlans";
import AiStylist from "@/components/AiStylist";
import Testimonials from "@/components/Testimonials";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <HeroSection />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <SearchFilters />
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <SalonGrid />
            </div>
          </div>
        </div>

        <AiStylist />
        <PricingPlans />
        <Testimonials />
        <AppDownload />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
