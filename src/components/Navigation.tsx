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

          {/* Right Side - Logo (Branded) */}
          <Link to="/" className="flex items-center gap-2 group transition-all">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                 <img src="/logo.png" alt="BarberLink" className="h-7 w-auto transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                BARBER<span className="text-primary italic">LINK</span>
              </span>
              <span className="text-[10px] font-bold text-muted-foreground -mt-1 tracking-widest uppercase opacity-70">Professional Network</span>
            </div>
          </Link>

          {/* Center - Navigation Links (High-end) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            <Button variant="ghost" className="rounded-full flex items-center gap-2 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all text-sm font-bold" asChild>
              <Link to="/">
                <MapPin className="h-4 w-4 text-primary" />
                {t('nav.explore')}
              </Link>
            </Button>
            {user && (
              <>
                <Button variant="ghost" className="rounded-full flex items-center gap-2 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all text-sm font-bold" asChild>
                  <Link to="/bookings">
                    <Calendar className="h-4 w-4 text-primary" />
                    {t('nav.bookings')}
                  </Link>
                </Button>
                <Button variant="ghost" className="rounded-full flex items-center gap-2 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all text-sm font-bold" asChild>
                  <Link to="/dashboard">
                    <User className="h-4 w-4 text-primary" />
                    {t('nav.account')}
                  </Link>
                </Button>
              </>
            )}
          </nav>

          {/* Left Side - Auth Actions (Premium Styling) */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center border-l pl-3 border-slate-200 dark:border-slate-800 gap-2">
               <ThemeToggle />
               <LanguageSwitcher />
            </div>

            {user ? (
               <div className="flex items-center gap-2">
                 <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="rounded-full font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
                  >
                    {t('nav.signout')}
                  </Button>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-[2px] cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/dashboard')}>
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                       <User className="h-5 w-5 text-primary" />
                    </div>
                  </div>
               </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="rounded-full font-bold text-sm hidden sm:flex"
                >
                  {t('nav.signin')}
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 font-bold shadow-lg shadow-primary/25 h-10 text-sm"
                  onClick={() => navigate('/auth')}
                >
                  {t('nav.signup')}
                </Button>
              </div>
            )}

            <div className="lg:hidden flex items-center gap-1">
               <ThemeToggle />
               <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
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
