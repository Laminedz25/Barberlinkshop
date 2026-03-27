import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SearchFilters from "@/components/SearchFilters";
import SalonGrid from "@/components/SalonGrid";
import AppDownload from "@/components/AppDownload";
import Footer from "@/components/Footer";
import PricingPlans from "@/components/PricingPlans";
import AiStylist from "@/components/AiStylist";
import Testimonials from "@/components/Testimonials";

import { useState, useEffect } from "react";
import { Activity, Zap, TrendingUp, Users } from "lucide-react";

const Index = () => {
  const [ticker, setTicker] = useState("AI AGENT #092 initialized in Algiers...");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  useEffect(() => {
    const activitiesList = [
      "New booking in Salon El-Bahia",
      "AI Stylist generated 14 styles in Oran",
      "Investor query from Paris hub",
      "BarberLink Global Node #03 Online",
      "Subscription upgraded for 'The Fade Master'",
      "Revenue forecast: +12% growth detected",
      "New 5-star review for 'Elite Barber Studio'",
    ];
    const interval = setInterval(() => {
      setTicker(activitiesList[Math.floor(Math.random() * activitiesList.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-[60] py-1 bg-primary text-[9px] font-black text-white uppercase tracking-[0.2em] flex items-center justify-center gap-4 overflow-hidden shadow-2xl">
         <div className="flex items-center gap-2 animate-pulse"><Activity className="w-2.5 h-2.5" /> LIVE STATUS:</div>
         <span className="animate-in fade-in slide-in-from-right-1 duration-500">{ticker}</span>
         <div className="flex items-center gap-6 ml-8 opacity-40">
            <span className="flex items-center gap-1"><Users className="w-2 h-2" /> 8.4k ONLINE</span>
            <span className="flex items-center gap-1"><Zap className="w-2 h-2" /> 0.2ms LATENCY</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-2 h-2" /> DZD SYSTEM ACTIVE</span>
         </div>
      </div>
      <Navigation />

      <main>
        <HeroSection onSearch={setSearchQuery} onLocationChange={setLocationQuery} />

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
              <SalonGrid searchQuery={searchQuery} locationQuery={locationQuery} />
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
