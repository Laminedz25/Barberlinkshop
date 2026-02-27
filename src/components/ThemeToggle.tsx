import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title={t('theme.toggle')}
      className="transition-smooth hover:bg-[#007BFF] hover:text-white hover:border-[#007BFF]"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{t('theme.toggle')}</span>
    </Button>
  );
};

export default ThemeToggle;
