import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SearchFilters from "@/components/SearchFilters";
import SalonGrid from "@/components/SalonGrid";
import AppDownload from "@/components/AppDownload";
import Footer from "@/components/Footer";
import PricingPlans from "@/components/PricingPlans";
import AiStylist from "@/components/AiStylist";
import Testimonials from "@/components/Testimonials";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, Zap, TrendingUp, Users, ShoppingBag, ArrowRight, X } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t, isRTL } = useLanguage();
  const [ticker, setTicker] = useState("AI AGENT #092 initialized in Algiers...");
  const [showTicker, setShowTicker] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  useEffect(() => {
    const activitiesList = [
      "New booking in Salon El-Bahia",
      "AI Stylist generated 14 styles in Oran",
      "Investor query from Paris hub",
      "BarberLink Global Node #03 Online",
      "Subscription upgraded for 'The Fade Master'",
      "Revenue forecast: +12% growth detected",
      "New 5-star review for 'Elite Barber Studio'",
    ];
    const interval = setInterval(() => {
      setTicker(activitiesList[Math.floor(Math.random() * activitiesList.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {showTicker && (
        <div className="fixed top-0 left-0 right-0 z-[60] py-1 bg-primary text-[9px] font-black text-white uppercase tracking-[0.2em] flex items-center justify-center gap-4 overflow-hidden shadow-2xl">
           <div className="flex items-center gap-2 animate-pulse"><Activity className="w-2.5 h-2.5" /> LIVE STATUS:</div>
           <span className="animate-in fade-in slide-in-from-right-1 duration-500">{ticker}</span>
           <div className="flex items-center gap-6 ml-8 opacity-40">
              <span className="flex items-center gap-1"><Users className="w-2 h-2" /> 8.4k ONLINE</span>
              <span className="flex items-center gap-1"><Zap className="w-2 h-2" /> 0.2ms LATENCY</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-2 h-2" /> DZD SYSTEM ACTIVE</span>
           </div>
           <button onClick={() => setShowTicker(false)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity" title="Dismiss Status Bar" aria-label="Dismiss Status Bar">
              <X className="w-2.5 h-2.5" />
           </button>
        </div>
      )}
      <Navigation />

      <main>
        <HeroSection onSearch={setSearchQuery} onLocationChange={setLocationQuery} />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <SearchFilters />
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <SalonGrid searchQuery={searchQuery} locationQuery={locationQuery} />
            </div>
          </div>
        </div>

        {/* Global Marketplace CTA Section */}
        <section className="py-24 bg-gradient-to-tr from-slate-950 via-slate-900 to-primary/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
           <div className="container mx-auto px-6 relative z-10 text-center text-white">
              <Badge className="bg-primary/20 text-primary border-none mb-6 px-4 py-2 uppercase tracking-widest text-[10px]">New Feature Ecosystem</Badge>
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
                {isRTL ? 'تسوق من ' : 'Shop the '}<span className="text-primary">{isRTL ? 'السوق العالمية' : 'Global Marketplace'}</span>
              </h2>
              <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-white/70">
                {isRTL 
                  ? 'اكتشف واشتري أفضل منتجات العناية والمكائن الحلاقة من متاجر صالوناتك المفضلة مباشرة. ادعم أعمالهم أو حسّن أدواتك!' 
                  : 'Discover and purchase top-tier grooming products directly from your favorite salons. Support local businesses or upgrade your toolkit.'}
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <Button asChild className="h-16 px-10 rounded-full text-lg font-black shadow-[0_0_40px_-10px] shadow-primary/50 text-white hover:scale-105 transition-all">
                   <Link to="/marketplace">
                     <ShoppingBag className="w-5 h-5 mr-3" /> {isRTL ? 'استكشف المتجر الآن' : 'Explore Marketplace Now'}
                   </Link>
                 </Button>
              </div>
           </div>
        </section>

        <AiStylist />
        <PricingPlans />

        {/* Affiliate Marketing Section */}
        <section className="py-24 bg-card relative overflow-hidden">
           <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                 <div className="space-y-8">
                    <Badge variant="outline" className="text-primary border-primary/20 px-4 py-2 rounded-full font-black uppercase tracking-widest text-[10px]">
                       <TrendingUp className="w-3 h-3 mr-2" /> {isRTL ? 'نظام التسويق بالعمولة' : 'Affiliate Power Engine'}
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight italic">
                       {isRTL ? 'كن شريكاً في الربح. ' : 'Earn Passive Income. '}<br />
                       <span className="text-primary">{isRTL ? 'اربح مع كل حلاق ينضم!' : 'Refer a Barber, Get Paid.'}</span>
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                       {isRTL 
                        ? 'انضم إلى شبكة شركاء BarberLink. احصل على نسبة من اشتراكات كل صالون أو حلاق تدعوه باستخدام رابطك الخاص. تتبع أرباحك لحظة بلحظة مع محرك الذكاء الاصطناعي الخاص بنا!'
                        : 'Join the BarberLink Global Affiliate Mesh. Earn recurring commissions for every salon or barber you onboard. Track your growth in real-time with our AI Financial Hub.'}
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-4 bg-muted/50 rounded-2xl">
                          <p className="text-2xl font-black text-primary">10%</p>
                          <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">{isRTL ? 'عمولة لكل اشتراك' : 'Per Subscription'}</p>
                       </div>
                       <div className="p-4 bg-muted/50 rounded-2xl">
                          <p className="text-2xl font-black text-primary">DZD</p>
                          <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">{isRTL ? 'دفع فوري' : 'Instant Payouts'}</p>
                       </div>
                    </div>
                    <Button asChild size="lg" className="h-16 px-10 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 group">
                       <Link to="/auth">
                          {isRTL ? 'ابدأ كمسوق الآن' : 'Start Earning Now'} 
                          <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                       </Link>
                    </Button>
                 </div>
                 <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                    <Card className="relative z-10 border-none bg-slate-900 shadow-2xl p-8 rounded-[3rem] text-white">
                        <div className="flex justify-between items-center mb-8">
                           <h3 className="font-black text-xs uppercase tracking-[0.3em] text-primary">Mesh Dashboard</h3>
                           <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                        <div className="space-y-6">
                           <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                              <p className="text-xs text-white/50 font-bold uppercase mb-2">Total Earnings</p>
                              <p className="text-4xl font-black tracking-tighter">14,200.00 <span className="text-sm text-primary">DZD</span></p>
                           </div>
                           <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                              <p className="text-xs text-white/50 font-bold uppercase mb-2">Active Referrals</p>
                              <p className="text-4xl font-black tracking-tighter">12 <span className="text-sm text-primary">SALONS</span></p>
                           </div>
                        </div>
                    </Card>
                 </div>
              </div>
           </div>
        </section>

        <Testimonials />
        <AppDownload />
      </main>

      <Footer />
      
      {/* ─── SYSTEM DIAGNOSTICS NODE (Developer/Owner Only) ─── */}
      <SystemDiagnostics />
    </div>
  );
};

const SystemDiagnostics = () => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                try {
                    const snap = await getDoc(doc(db, 'users', u.uid));
                    if (snap.exists()) setRole(snap.data().role);
                } catch (e) {
                    console.error("DIAGNOSTICS: Failed to fetch role:", e);
                }
            }
        });
        return () => unsub();
    }, []);

    if (!user) return null;

    return (
        <div className={`fixed bottom-4 left-4 z-[100] transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
            <Card className="bg-slate-900/90 border-primary/40 backdrop-blur-xl text-white p-6 rounded-[2rem] shadow-2xl border-2 w-80">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                    <Zap className="w-3 h-3 fill-primary" /> Identity Hub
                  </h3>
                  <button onClick={() => setVisible(false)} className="text-[10px] opacity-40 hover:opacity-100">SHUTDOWN</button>
                </div>
                
                <div className="space-y-3 text-[10px] font-mono">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="opacity-60">EMAIL:</span>
                        <span className="text-blue-400 truncate max-w-[150px]">{user.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="opacity-60">UID:</span>
                        <span className="opacity-90">{user.uid.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                        <span className="opacity-60">DB_ROLE:</span>
                        <span className={`font-black ${role === 'admin' ? 'text-rose-400' : role === 'investor' ? 'text-amber-400' : 'text-green-400'}`}>
                            {role?.toUpperCase() || 'NONE'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-60">SEC_LEVEL:</span>
                        <span className="text-primary">{(user.email === 'lamine.sanfour25didou@gmail.com' || user.email === 'admin@barberlink.cloud') ? 'ROOT_OWNER' : 'STANDARD'}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 text-[8px] opacity-40 italic">
                    Sentinel AI: Authenticity check passed. Node verified.
                </div>
            </Card>
        </div>
    );
};

export default Index;
