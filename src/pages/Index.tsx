import { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SearchFilters from "@/components/SearchFilters";
import SalonCard from "@/components/SalonCard";
import AppDownload from "@/components/AppDownload";
import Footer from "@/components/Footer";
import PricingPlans from "@/components/PricingPlans";
import AiStylist from "@/components/AiStylist";
import Testimonials from "@/components/Testimonials";
import { useLanguage } from "@/contexts/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { User, Users, Car, Scissors, ChevronRight, Star, ShieldCheck, Zap, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{
    men: unknown[], women: unknown[], unisex: unknown[], mobile: unknown[]
  }>({ men: [], women: [], unisex: [], mobile: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const barbersRef = collection(db, 'barbers');
        
        // Fetch Men's Barbers
        const menQuery = query(barbersRef, where('salon_type', '==', 'men'), limit(6));
        const menSnap = await getDocs(menQuery);
        const menList = menSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch Women's Salons
        const womenQuery = query(barbersRef, where('salon_type', '==', 'women'), limit(6));
        const womenSnap = await getDocs(womenQuery);
        const womenList = womenSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch Unisex
        const unisexQuery = query(barbersRef, where('salon_type', '==', 'unisex'), limit(6));
        const unisexSnap = await getDocs(unisexQuery);
        const unisexList = unisexSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch Mobile
        const mobileQuery = query(barbersRef, where('offers_home_visit', '==', true), limit(6));
        const mobileSnap = await getDocs(mobileQuery);
        const mobileList = mobileSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setCategories({ 
          men: menList, 
          women: womenList, 
          unisex: unisexList, 
          mobile: mobileList 
        });
      } catch (err) {
        console.error("Error fetching homepage categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBarbers();
  }, []);

  const CategorySection = ({ title, icon: Icon, items, type, color }: { title: string, icon: any, items: any[], type: string, color: string }) => (
    <section className="py-20 border-b border-slate-100 dark:border-slate-800 last:border-0 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="flex items-center gap-5">
           <div className={`p-5 rounded-[2rem] bg-gradient-to-br ${color} text-white shadow-xl shadow-slate-200 dark:shadow-none`}>
              <Icon className="w-8 h-8" />
           </div>
           <div>
              <h2 className="text-4xl font-black tracking-tight">{title}</h2>
              <p className="text-lg text-muted-foreground font-medium opacity-70 italic">Explore the best rated {title.toLowerCase()} near you</p>
           </div>
        </div>
        <button 
           onClick={() => navigate('/explore')}
           className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
           {t('grid.load')} <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
      
      <div className="relative group">
        <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-hide snap-x snap-mandatory px-2">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="min-w-[320px] h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[3rem] animate-pulse" />
             ))
          ) : items.length === 0 ? (
            <div className="w-full text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-dashed">
                <p className="text-muted-foreground italic">No salons found in this category yet. Be the first!</p>
            </div>
          ) : (
            items.map((item: any) => (
              <div key={item.id} className="min-w-[320px] md:min-w-[400px] snap-start">
                <SalonCard salon={item} />
              </div>
            ))
          )}
        </div>
        {!loading && items.length > 0 && (
            <div className="absolute top-0 right-0 h-full w-40 pointer-events-none bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />

      <main>
        <HeroSection />

        <div className="container mx-auto px-4">
           {/* Trust Stats Bar */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-10 mb-20 relative z-20">
              <StatItem icon={<Star className="text-yellow-500" />} label={t('index.stats.rating')} value="4.9/5" />
              <StatItem icon={<Users className="text-blue-500" />} label={t('index.stats.clients')} value="10k+" />
              <StatItem icon={<Zap className="text-orange-500" />} label={t('index.stats.bookings')} value="850+" />
              <StatItem icon={<ShieldCheck className="text-green-500" />} label={t('index.stats.verified')} value="500+" />
           </div>

           <CategorySection 
              title={t('salon.type.men')} 
              icon={User} 
              items={categories.men}
              type="men"
              color="from-blue-600 to-indigo-700"
           />

           <CategorySection 
              title={t('salon.type.women')} 
              icon={Users} 
              items={categories.women}
              type="women"
              color="from-pink-500 to-rose-600"
           />

           <div className="py-20 bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl relative overflow-hidden my-10 px-10 border border-slate-100 dark:border-slate-800">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                      <h2 className="text-5xl lg:text-7xl font-black leading-tight italic decoration-primary underline decoration-8">{t('index.how.title')} <span className="text-primary not-italic">{t('index.how.works')}</span></h2>
                      <div className="space-y-6">
                          <Step number="01" title={t('index.how.step1.title')} desc={t('index.how.step1.desc')} />
                          <Step number="02" title={t('index.how.step2.title')} desc={t('index.how.step2.desc')} />
                          <Step number="03" title={t('index.how.step3.title')} desc={t('index.how.step3.desc')} />
                      </div>
                      <Button size="lg" className="rounded-2xl h-16 px-12 text-lg font-black" onClick={() => navigate('/auth')}>{t('index.how.button')}</Button>
                  </div>
                  <div className="relative group">
                      <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl group-hover:bg-primary/30 transition-all" />
                      <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl flex items-center justify-center transform group-hover:rotate-1 transition-transform">
                          <div className="p-8 bg-white/20 backdrop-blur-md rounded-full text-white animate-pulse">
                              <Play className="w-12 h-12 fill-current" />
                          </div>
                      </div>
                  </div>
              </div>
           </div>

           <CategorySection 
              title={t('salon.type.unisex')} 
              icon={Scissors} 
              items={categories.unisex}
              type="unisex"
              color="from-purple-600 to-fuchsia-700"
           />

           <CategorySection 
              title={t('index.mobile.title')} 
              icon={Car} 
              items={categories.mobile}
              type="mobile"
              color="from-emerald-500 to-teal-700"
           />
        </div>

        <AiStylist />
        <PricingPlans />
        <Testimonials />
        <AppDownload />
      </main>

      <Footer />
    </div>
  );
};

const StatItem = ({ icon, label, value }: any) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-4 transition-transform hover:-translate-y-2">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">{icon}</div>
        <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">{value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
    </div>
);

const Step = ({ number, title, desc }: any) => (
    <div className="flex gap-6 group">
        <div className="text-4xl font-black text-primary/20 group-hover:text-primary transition-colors">{number}</div>
        <div>
            <h4 className="text-xl font-black mb-1">{title}</h4>
            <p className="text-muted-foreground font-medium leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default Index;
