import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onLocationChange: (location: string) => void;
}

const HeroSection = ({ onSearch, onLocationChange }: HeroSectionProps) => {
  const { t, isRTL } = useLanguage();
  const [localSearch, setLocalSearch] = useState("");
  const [localLocation, setLocalLocation] = useState("");

  const handleSearch = () => {
    onSearch(localSearch);
    onLocationChange(localLocation);
  };
  
  return (
    <section className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 ${isRTL ? 'rtl' : 'ltr'}`}>
      
      {/* Premium Background: Animated Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full animate-float direction-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="flex flex-col items-center text-center space-y-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 animate-slide-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">The Future of Grooming is Here</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-6 max-w-5xl animate-slide-up animation-delay-200">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-foreground">
              {t('hero.title').split(' ').map((word, i) => (
                <span key={i} className={i % 3 === 0 ? "text-primary" : ""}>{word} </span>
              ))}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              {t('hero.description')}
            </p>
          </div>

          {/* Premium Search Hub */}
          <div className="w-full max-w-4xl p-2 bg-background/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl animate-slide-up animation-delay-300">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 w-full relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder={t('hero.search.salon')}
                  className="w-full h-16 pl-14 pr-6 bg-transparent border-none text-lg font-semibold focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50" />
              <div className="flex-1 w-full relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  value={localLocation}
                  onChange={(e) => setLocalLocation(e.target.value)}
                  placeholder={t('hero.search.location')}
                  className="w-full h-16 pl-14 pr-6 bg-transparent border-none text-lg font-semibold focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
              <Button 
                onClick={handleSearch}
                size="lg" 
                className="w-full md:w-auto h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                {t('hero.search.button')}
                <ArrowRight className={`w-5 h-5 transition-transform ${isRTL ? 'rotate-180 mr-2 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'}`} />
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 animate-slide-up animation-delay-500 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-primary" />
               <span className="text-sm font-bold">Secure Global Payments</span>
            </div>
            <div className="flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-primary" />
               <span className="text-sm font-bold">AI Style Assistant</span>
            </div>
            <div className="flex items-center gap-2">
               <MapPin className="w-5 h-5 text-primary" />
               <span className="text-sm font-bold">500+ Premium Salons</span>
            </div>
          </div>

        </div>
      </div>

      {/* Modern Accents */}
      <div className="absolute top-[20%] right-[15%] w-24 h-24 border-2 border-primary/10 rounded-3xl rotate-12 animate-float" />
      <div className="absolute bottom-[20%] left-[10%] w-16 h-16 bg-primary/5 rounded-full blur-xl animate-pulse" />
      
    </section>
  );
};

export default HeroSection;