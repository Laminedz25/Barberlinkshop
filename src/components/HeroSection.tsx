import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-barbershop.jpg";

const HeroSection = () => {
  const { t, isRTL } = useLanguage();
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Professional barbershop interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-primary/20" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('hero.description')}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  placeholder={t('hero.search.salon')}
                  className="w-full border bg-card text-lg py-6 px-4 rounded-lg"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              <div className="relative">
                <Input
                  placeholder={t('hero.search.location')}
                  className="w-full border bg-card text-lg py-6 px-4 rounded-lg"
                />
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <Button 
              size="lg" 
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-12 py-6 text-lg"
            >
              {t('hero.search.button')}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full md:w-auto border-border bg-card/50 backdrop-blur-sm px-8 py-6"
            >
              <MapPin className="h-5 w-5 mr-2" />
              {t('hero.search.nearby')}
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 rounded-full gradient-hero opacity-20 blur-xl animate-pulse" />
      <div className="absolute bottom-1/3 right-10 w-32 h-32 rounded-full bg-gold/10 blur-2xl animate-pulse delay-1000" />
    </section>
  );
};

export default HeroSection;