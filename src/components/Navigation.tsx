import { Button } from "@/components/ui/button";
import {
  MapPin,
  User,
  Calendar,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import GlobalSettings from "./GlobalSettings";
import ThemeToggle from "./ThemeToggle";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Navigation = () => {
  const { t, isRTL } = useLanguage();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setIsAdmin(userDoc.data().role === 'admin');
          }
        } catch (e) {
          console.error("Admin check failed (likely guest/pending status):", e);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'h-16 bg-background/80 backdrop-blur-xl border-b' : 'h-20 bg-transparent'
    } ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Left Side: Logo & Premium Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-lg border-2 border-primary/20 group-hover:border-primary transition-all">
            <img src="/logo.png" alt="BarberLink" className="object-cover w-full h-full scale-110 group-hover:scale-100 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 decoration-primary decoration-4">
              Barber<span className="text-primary">Link</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Global Platform</span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Hub */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-muted/30 backdrop-blur-md rounded-full border border-white/10">
          <NavLink to="/" icon={<MapPin className="h-4 w-4" />} label={t('nav.explore')} active={location.pathname === '/'} />
          <NavLink to="/marketplace" icon={<ShoppingBag className="h-4 w-4" />} label={isRTL ? 'المتجر' : 'Marketplace'} active={location.pathname === '/marketplace'} />
          {user && (
            <>
              <NavLink to="/bookings" icon={<Calendar className="h-4 w-4" />} label={t('nav.bookings')} active={location.pathname === '/bookings'} />
              <NavLink to="/dashboard" icon={<User className="h-4 w-4" />} label={t('nav.account')} active={location.pathname === '/dashboard'} />
              {isAdmin && (
                <NavLink to="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="Super Admin" active={location.pathname === '/admin'} color="text-primary font-bold animate-pulse-glow" />
              )}
            </>
          )}
        </nav>

        {/* Right Side: Global Settings & Auth */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <GlobalSettings />
            <ThemeToggle />
          </div>

          {user ? (
            <div className="flex items-center gap-2 bg-muted/40 p-1 pl-3 rounded-full border border-white/5">
                <span className="hidden xl:inline text-xs font-semibold max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                <Button 
                   size="icon" 
                   variant="ghost" 
                   className="rounded-full w-8 h-8 hover:bg-destructive hover:text-white transition-colors"
                   onClick={signOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
               <Button variant="ghost" className="hidden xl:flex items-center gap-2 rounded-full font-bold px-6 text-foreground/80 hover:text-primary transition-all group" onClick={() => navigate('/auth')}>
                 {t('nav.signin')} <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
               </Button>
               <Button className="bg-primary hover:bg-primary/90 text-white font-black px-8 rounded-full shadow-[0_4px_20px_-5px] shadow-primary/40 animate-pulse-glow" onClick={() => navigate('/auth')}>
                 {t('nav.signup')}
               </Button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

const NavLink = ({ to, icon, label, active, color }: { to: string, icon: React.ReactNode, label: string, active: boolean, color?: string }) => (
    <Button variant="ghost" className={`flex items-center gap-2 rounded-full px-5 transition-all ${
        active ? 'bg-background text-primary shadow-sm border border-primary/10' : 'hover:bg-primary/10 hover:text-primary'
    } ${color || ''}`} asChild>
      <Link to={to}>
        {icon}
        <span className="font-semibold text-xs tracking-wide">{label}</span>
      </Link>
    </Button>
);

export default Navigation;
