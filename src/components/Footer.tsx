import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Custom icons for social media
const TikTokIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const SnapchatIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.206 2c2.381 0 5.522.022 6.989 2.462.617.968.93 2.293.93 3.935 0 .99-.047 1.477-.187 1.97-.29 1.031-1.045 1.808-2.122 2.187-.008.005-.007.016.003.027.126.15.726.705 1.056 1.002l.022.02c.457.413.912.826 1.337 1.15.33.252.744.528 1.213.798.68.39.934.572 1.023.86.066.214.043.495-.064.738-.182.41-.64.697-1.213.759a5.36 5.36 0 0 1-.852.061c-.317 0-.643-.034-.969-.066-.348-.036-.696-.07-1.024-.07-.302 0-.558.036-.783.11-.27.09-.477.23-.733.428-.252.196-.563.44-.997.772-.553.423-1.224.95-2.008 1.347-.784.398-1.687.597-2.684.597-.997 0-1.9-.199-2.684-.597-.784-.398-1.455-.924-2.008-1.347-.434-.332-.745-.576-.997-.772-.256-.198-.463-.338-.733-.428-.225-.074-.481-.11-.783-.11-.328 0-.676.034-1.024.07-.326.032-.652.066-.969.066-.287 0-.576-.022-.852-.061-.573-.062-1.031-.349-1.213-.759-.107-.243-.13-.524-.064-.738.089-.288.343-.47 1.023-.86.469-.27.883-.546 1.213-.798.425-.324.88-.737 1.337-1.15l.022-.02c.33-.297.93-.852 1.056-1.002.01-.011.011-.022.003-.027-1.077-.379-1.832-1.156-2.122-2.187-.14-.493-.187-.98-.187-1.97 0-1.642.313-2.967.93-3.935C6.684 2.022 9.825 2 12.206 2z" />
  </svg>
);

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [socials, setSocials] = useState({ facebook: '', instagram: '', tiktok: '', snapchat: '', youtube: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'system', 'settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().socials) {
          setSocials(docSnap.data().socials);
        }
      } catch (e) {
        console.error("Failed to load footer settings:", e);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              barberlinkshop
            </h3>
            <p className="text-muted-foreground text-sm">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#1877F2] transition-colors" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#E4405F] transition-colors" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socials.tiktok && (
                <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#000000] transition-colors" aria-label="TikTok">
                  <TikTokIcon />
                </a>
              )}
              {socials.snapchat && (
                <a href={socials.snapchat} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#FFFC00] transition-colors" aria-label="Snapchat">
                  <SnapchatIcon />
                </a>
              )}
              {socials.youtube && (
                <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#FF0000] transition-colors" aria-label="Youtube">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">{t('nav.about')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  24/7 AI Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">{t('footer.contact')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">{t('footer.download')}</h4>
            <div className="space-y-3">
              <a
                href="#"
                className="block bg-background hover:bg-accent border border-border rounded-lg p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Google Play</p>
                    <p className="text-sm font-medium">Android</p>
                  </div>
                </div>
              </a>
              <a
                href="#"
                className="block bg-background hover:bg-accent border border-border rounded-lg p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">App Store</p>
                    <p className="text-sm font-medium">iOS</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} barberlinkshop. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
