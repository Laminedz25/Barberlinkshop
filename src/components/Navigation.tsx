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
import { motion } from "framer-motion";

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
          <Link to="/" className="flex items-center gap-3 group transition-all shrink-0">
            <motion.div 
               initial={{ rotateY: -180, scale: 0.5, opacity: 0 }}
               animate={{ rotateY: 0, scale: 1, opacity: 1 }}
               transition={{ type: 'spring', stiffness: 100, damping: 10 }}
               className="relative flex items-center justify-center p-2"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary via-indigo-500 to-blue-500 rounded-2xl blur-md opacity-30 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative bg-white dark:bg-slate-950 p-2 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                 <img src="/logo.png" alt="BarberLink Logo" className="h-8 w-auto md:h-10 drop-shadow-md" />
              </div>
            </motion.div>
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                BARBER<span className="text-primary italic">LINK</span>
              </span>
              <span className="text-[10px] md:text-xs font-black text-muted-foreground tracking-[0.2em] uppercase opacity-70">Premium Solution</span>
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
