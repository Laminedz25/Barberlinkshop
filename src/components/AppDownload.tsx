import { Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const AppDownload = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      toast({
        title: isRTL ? 'إضافة للشاشة الرئيسية' : 'Add to Home Screen',
        description: isRTL ? 'تطبيقنا يعمل مباشرة من المتصفح! اضغط على "إضافة للشاشة الرئيسية" (Add to Home Screen) من خيارات المتصفح لتثبيته كبرنامج.' : 'Our app runs natively from your browser! Tap "Add to Home Screen" from your browser menu to install it.',
        variant: 'default',
      });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-gold/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('download.title')}
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('download.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Direct App Install Button */}
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-auto py-4 px-8 group text-lg font-bold shadow-xl shadow-primary/20"
              onClick={handleInstallClick}
            >
              <Download className="mr-2 h-6 w-6 animate-bounce" />
              {isRTL ? 'تثبيت التطبيق الآن' : 'Install App Now'}
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {t('download.subtitle')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
