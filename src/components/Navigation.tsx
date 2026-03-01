import { Button } from "@/components/ui/button";
import {
  MapPin,
  User,
  Calendar,
  Menu
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

const Navigation = () => {
  const { t, isRTL } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Left Side - Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="hidden sm:flex hover:bg-[#007BFF] hover:text-white"
                >
                  {t('nav.signout')}
                </Button>
                <Button variant="ghost" className="hidden sm:flex items-center gap-2 hover:bg-[#007BFF] hover:text-white">
                  <User className="h-4 w-4" />
                  {t('nav.profile')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="hidden sm:flex hover:bg-[#007BFF] hover:text-white"
                >
                  {t('nav.signin')}
                </Button>
                <Button
                  className="hidden sm:flex bg-primary hover:bg-[#007BFF] text-white"
                  onClick={() => navigate('/auth')}
                >
                  {t('nav.signup')}
                </Button>
              </>
            )}

            <ThemeToggle />
            <LanguageSwitcher />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-[#007BFF] hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Center - Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-[#007BFF] hover:text-white" asChild>
              <Link to="/">
                <MapPin className="h-4 w-4" />
                {t('nav.explore')}
              </Link>
            </Button>
            {user && (
              <>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-[#007BFF] hover:text-white" asChild>
                  <Link to="/bookings">
                    <Calendar className="h-4 w-4" />
                    {t('nav.bookings')}
                  </Link>
                </Button>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-[#007BFF] hover:text-white" asChild>
                  <Link to="/dashboard">
                    <User className="h-4 w-4" />
                    {t('nav.account')}
                  </Link>
                </Button>
              </>
            )}
          </nav>

          {/* Right Side - Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="barberlinkshop Logo" className="h-8 w-auto mix-blend-difference" />
            <h1 className="text-xl font-bold">
              barberlinkshop
            </h1>
          </Link>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="flex flex-col py-4 space-y-2">
              <Button variant="ghost" className="justify-start hover:bg-[#007BFF] hover:text-white" asChild>
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <MapPin className="h-4 w-4 mr-2" />
                  {t('nav.explore')}
                </Link>
              </Button>
              {user ? (
                <>
                  <Button variant="ghost" className="justify-start hover:bg-[#007BFF] hover:text-white" asChild>
                    <Link to="/bookings" onClick={() => setIsMenuOpen(false)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {t('nav.bookings')}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start hover:bg-[#007BFF] hover:text-white" asChild>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      {t('nav.account')}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start hover:bg-[#007BFF] hover:text-white"
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    {t('nav.signout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start hover:bg-[#007BFF] hover:text-white"
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                  >
                    {t('nav.signin')}
                  </Button>
                  <Button
                    className="justify-start bg-primary hover:bg-[#007BFF] text-white"
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                  >
                    {t('nav.signup')}
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
