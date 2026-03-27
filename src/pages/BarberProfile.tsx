import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, MapPin, Clock, Phone, MessageSquare, Share2, 
  ShieldCheck, Heart, Calendar, ShoppingBag, Grid, Users2,
  Instagram, Facebook, Globe, Award, Sparkles, ChevronRight,
  Scissors
} from 'lucide-react';
import BookingModal from '@/components/BookingModal';

interface BarberProfileData {
  id: string;
  business_name: string;
  address: string;
  rating: number;
  user_id: string;
  socials?: { instagram?: string; facebook?: string; website?: string };
  bio?: string;
  verified?: boolean;
}

interface Service {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  price: number;
  duration_minutes: number;
}

interface GalleryItem {
  id: string;
  media_url: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

const BarberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [barber, setBarber] = useState<BarberProfileData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const snap = await getDoc(doc(db, 'barbers', id));
      if (!snap.exists()) throw new Error("Barber node not found");
      setBarber({ id: snap.id, ...snap.data() } as BarberProfileData);

      const sSnap = await getDocs(query(collection(db, 'services'), where('barber_id', '==', id)));
      setServices(sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));

      const stSnap = await getDocs(collection(db, 'barbers', id, 'staff'));
      setStaff(stSnap.docs.map(d => ({ id: d.id, ...d.data() } as StaffMember)));

      const gSnap = await getDocs(collection(db, 'barbers', id, 'portfolio'));
      setGallery(gSnap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));

    } catch (e) {
      const error = e as Error;
      toast({ title: "Booking Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchData();
    
    // EXCLUSIVE: Deep-link Trigger (QR Code / Direct Referral)
    const params = new URLSearchParams(window.location.search);
    if (params.get('book') === 'true') {
        setIsBookingOpen(true);
        toast({ title: "Node Protocol: Direct Booking", description: "QR identity verified. Initiating immediate slot reservation.", variant: "default" });
    }
  }, [fetchData, toast]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Sparkles className="animate-spin text-primary" /></div>;
  if (!barber) return <div className="min-h-screen flex items-center justify-center">404: Node Disconnected</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            {/* Header Identity */}
            <section className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full py-1 text-[10px] font-black uppercase tracking-widest">
                       <ShieldCheck className="w-3 h-3 mr-1" /> Licensed Pro
                    </Badge>
                    <Badge variant="outline" className="rounded-full py-1 text-[10px] font-black uppercase tracking-widest">
                       {staff.length} Masters
                    </Badge>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{barber.business_name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground font-bold">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{barber.address}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                   <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200">
                     <Heart className="w-6 h-6" />
                   </Button>
                   <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200">
                     <Share2 className="w-6 h-6" />
                   </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                 {barber.socials?.instagram && (
                   <Button variant="ghost" className="rounded-xl h-12 gap-2 font-bold px-6 bg-white shadow-sm hover:text-pink-500">
                     <Instagram className="w-5 h-5" /> Instagram
                   </Button>
                 )}
                 {barber.socials?.facebook && (
                   <Button variant="ghost" className="rounded-xl h-12 gap-2 font-bold px-6 bg-white shadow-sm hover:text-blue-600">
                     <Facebook className="w-5 h-5" /> Facebook
                   </Button>
                 )}
                 <Button variant="ghost" className="rounded-xl h-12 gap-2 font-bold px-6 bg-white shadow-sm hover:text-primary">
                    <Globe className="w-5 h-5" /> Website
                 </Button>
              </div>
            </section>

            <Tabs defaultValue="services" className="w-full">
              <TabsList className="bg-transparent border-b-2 border-slate-100 rounded-none h-auto p-0 mb-10 w-full justify-start overflow-x-auto overflow-y-hidden">
                <TabsTrigger value="services" className="px-10 py-5 data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none font-black text-xs uppercase tracking-widest">{t('dashboard.tabs.services')}</TabsTrigger>
                <TabsTrigger value="portfolio" className="px-10 py-5 data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none font-black text-xs uppercase tracking-widest">Portfolio</TabsTrigger>
                <TabsTrigger value="experts" className="px-10 py-5 data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none font-black text-xs uppercase tracking-widest">Team</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
                 {services.map(s => (
                   <Card key={s.id} className="border-none bg-white shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 rounded-[2rem] overflow-hidden group">
                     <CardContent className="p-8 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="h-16 w-16 bg-slate-50 flex items-center justify-center rounded-2xl group-hover:bg-primary/5 transition-colors">
                              <Scissors className="w-7 h-7 text-slate-300 group-hover:text-primary" />
                           </div>
                           <div>
                              <h4 className="text-xl font-black">{language === 'ar' ? s.name_ar : s.name_en}</h4>
                              <p className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">{s.duration_minutes} MINS EXPERIENCE</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-8">
                           <span className="text-3xl font-black tracking-tighter">{s.price} <span className="text-sm text-primary uppercase ml-1">DZD</span></span>
                           <Button onClick={() => setIsBookingOpen(true)} className="rounded-2xl h-14 px-8 font-black shadow-lg shadow-primary/20">BOOK</Button>
                        </div>
                     </CardContent>
                   </Card>
                 ))}
              </TabsContent>

              <TabsContent value="portfolio" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {gallery.length > 0 ? gallery.map(item => (
                      <div key={item.id} className="aspect-square bg-slate-200 rounded-[2rem] overflow-hidden relative group">
                        <img src={item.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                      </div>
                    )) : (
                      [1,2,3,4,5,6].map(i => (
                         <div key={i} className="aspect-square bg-slate-200 rounded-[2rem] relative overflow-hidden">
                            <img src={`https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80&sig=${i}`} className="w-full h-full object-cover opacity-80" alt="" />
                         </div>
                      ))
                    )}
                 </div>
              </TabsContent>

              <TabsContent value="experts" className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                 {staff.map(m => (
                   <div key={m.id} className="p-6 bg-white rounded-[2rem] border-slate-100 border flex items-center gap-6 shadow-sm hover:shadow-lg transition-all">
                      <div className="h-20 w-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                         <img src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="space-y-1">
                         <h4 className="font-extrabold text-lg flex items-center gap-2">{m.name} <Award className="w-4 h-4 text-primary" /></h4>
                         <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{m.role}</p>
                         <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-black">5.0</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-10">
            <Card className="border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] bg-slate-900 text-white p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
               <div className="relative z-10 space-y-8">
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase mb-2">Reserve Node</h3>
                    <p className="text-white/60 font-medium">Limited slots available for today's session.</p>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <Clock className="w-6 h-6 text-primary" />
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-primary">Open Today</p>
                           <p className="font-bold">09:00 AM — 08:30 PM</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <Phone className="w-6 h-6 text-primary" />
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-primary">Priority Contact</p>
                           <p className="font-bold">+213 555 000 000</p>
                        </div>
                     </div>
                  </div>

                  <Button onClick={() => setIsBookingOpen(true)} className="w-full h-20 rounded-[1.5rem] bg-white text-slate-900 text-xl font-black hover:bg-white/90 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                     START BOOKING
                  </Button>
               </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
               <Button className="h-16 rounded-2xl border-none bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold gap-3">
                  <MessageSquare className="w-5 h-5 text-primary" /> CHAT
               </Button>
               <Button className="h-16 rounded-2xl border-none bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold gap-3">
                  <Share2 className="w-5 h-5 text-primary" /> SOCIAL
               </Button>
            </div>
          </div>

        </div>
      </main>
      
      <BookingModal 
         isOpen={isBookingOpen} 
         onClose={() => setIsBookingOpen(false)} 
         salonId={id || ''} 
         salonName={barber.business_name} 
      />

      <Footer />
    </div>
  );
};

export default BarberProfile;