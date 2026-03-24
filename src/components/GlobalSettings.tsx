import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Globe, Coins, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const GlobalSettings = () => {
  const { language, setLanguage, currency, setCurrency } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇩🇿' }
  ];

  const currencies = [
    { code: 'DZD', name: 'Algerian Dinar (DZD)', symbol: 'دج' },
    { code: 'USD', name: 'US Dollar (USD)', symbol: '$' }
  ];

  const currentLang = languages.find(lang => lang.code === language);
  const currentCurr = currencies.find(curr => curr.code === currency);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all rounded-full px-4 shadow-sm group">
          <Globe className="h-4 w-4 text-primary group-hover:rotate-[30deg] transition-transform" />
          <span className="hidden md:inline font-semibold">{currentLang?.flag} {currentLang?.name}</span>
          <span className="md:hidden font-semibold">{currentLang?.flag}</span>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <span className="font-bold text-primary">{currentCurr?.symbol}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] animate-in fade-in slide-in-from-top-2 duration-300">
        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground font-bold flex items-center gap-2">
            <Globe className="h-3 w-3" /> Language
        </DropdownMenuLabel>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as 'en' | 'fr' | 'ar')}
            className={`gap-3 ${language === lang.code ? 'bg-primary/10 text-primary font-semibold' : ''}`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground font-bold flex items-center gap-2">
            <Coins className="h-3 w-3" /> Currency
        </DropdownMenuLabel>
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr.code as 'DZD' | 'USD')}
            className={`gap-3 ${currency === curr.code ? 'bg-primary/10 text-primary font-semibold' : ''}`}
          >
            <span className="font-bold w-6">{curr.symbol}</span>
            <span>{curr.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Separator = ({ orientation, className }: { orientation: string, className?: string }) => (
    <div className={`${orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full'} bg-border ${className}`} />
);

export default GlobalSettings;
