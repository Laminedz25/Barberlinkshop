import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star, MapPin, Phone, MessageCircle, Share2, ShieldCheck,
  Users2, Scissors, Instagram, Facebook, Globe, Sparkles,
  ChevronRight, Clock, ShoppingBag
} from 'lucide-react';

interface SalonData {
  id: string;
  business_name: string;
  address: string;
  rating: number;
  phone?: string;
  bio?: string;
  image?: string;
  socials?: { instagram?: string; facebook?: string; website?: string; whatsapp?: string; };
  verified?: boolean;
  user_id?: string;
}

interface BarberMember {
  id: string;
  business_name: string;
  image?: string;
  rating?: number;
  bio?: string;
  role?: string;
}

interface Service {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  duration_minutes: number;
}

const SalonProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const { toast } = useToast();

  const [salon, setSalon] = useState<SalonData | null>(null);
  const [barbers, setBarbers] = useState<BarberMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalon = async () => {
      if (!id) return;
      try {
        // Try fetching from 'barbers' collection (salon_owner sub-type)
        const snap = await getDoc(doc(db, 'barbers', id));
        if (snap.exists()) {
          setSalon({ id: snap.id, ...snap.data() } as SalonData);
          // Fetch staff/barbers in this salon
          const staffSnap = await getDocs(collection(db, 'barbers', id, 'staff'));
          setBarbers(staffSnap.docs.map(d => ({ id: d.id, ...d.data() } as BarberMember)));
          // Fetch services
          const servSnap = await getDocs(query(collection(db, 'services'), where('barber_id', '==', id)));
          setServices(servSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
        }
      } catch (e) {
        toast({ title: 'Error', description: 'Could not load salon profile.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchSalon();
  }, [id, toast]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Sparkles className="animate-spin text-primary h-10 w-10" /></div>;
  if (!salon) return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Salon not found.</div>;

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: salon.business_name, url, text: `Check out ${salon.business_name} on BarberLink!` });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: 'Link Copied!', description: 'Salon link ready to share on social media.' });
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* SEO Meta */}
      <title>{salon.business_name} | BarberLink</title>

      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">

        {/* Hero Header */}
        <div className="relative rounded-[3rem] overflow-hidden mb-12 bg-gradient-to-br from-slate-900 to-slate-800 p-10 md:p-16 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-20">
            {salon.image && <img src={salon.image} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              {salon.verified && (
                <Badge className="bg-primary/20 text-primary border-none mb-3">
                  <ShieldCheck className="w-3 h-3 mr-1" /> {isRTL ? 'صالون موثق' : 'Verified Salon'}
                </Badge>
              )}
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-3">{salon.business_name}</h1>
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="w-4 h-4" />
                <span>{salon.address}</span>
              </div>
              {salon.bio && <p className="mt-4 max-w-xl text-white/60 text-sm leading-relaxed">{salon.bio}</p>}
            </div>
            <div className="flex flex-wrap gap-3">
              {salon.phone && (
                <Button size="icon" onClick={() => window.location.href = `tel:${salon.phone}`} className="h-14 w-14 rounded-2xl bg-white/10 hover:bg-white/20">
                  <Phone className="w-5 h-5" />
                </Button>
              )}
              {salon.socials?.whatsapp && (
                <Button size="icon" onClick={() => window.open(`https://wa.me/${salon.socials!.whatsapp}`, '_blank')} className="h-14 w-14 rounded-2xl bg-green-500/20 hover:bg-green-500/40">
                  <MessageCircle className="w-5 h-5" />
                </Button>
              )}
              <Button size="icon" onClick={handleShare} className="h-14 w-14 rounded-2xl bg-white/10 hover:bg-white/20">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Socials */}
        <div className="flex flex-wrap gap-3 mb-10">
          {salon.socials?.instagram && (
            <Button variant="outline" onClick={() => window.open(`https://instagram.com/${salon.socials!.instagram}`, '_blank')} className="rounded-xl h-11 gap-2 font-bold px-5">
              <Instagram className="w-4 h-4 text-pink-500" /> @{salon.socials.instagram}
            </Button>
          )}
          {salon.socials?.facebook && (
            <Button variant="outline" onClick={() => window.open(`https://facebook.com/${salon.socials!.facebook}`, '_blank')} className="rounded-xl h-11 gap-2 font-bold px-5">
              <Facebook className="w-4 h-4 text-blue-500" /> Facebook
            </Button>
          )}
          {salon.socials?.website && (
            <Button variant="outline" onClick={() => window.open(salon.socials!.website, '_blank')} className="rounded-xl h-11 gap-2 font-bold px-5">
              <Globe className="w-4 h-4" /> Website
            </Button>
          )}
        </div>

        <Tabs defaultValue="barbers" className="w-full">
          <TabsList className="mb-8 h-14 p-1.5 bg-muted/80 rounded-2xl gap-2">
            <TabsTrigger value="barbers" className="rounded-xl font-bold flex gap-2"><Users2 className="w-4 h-4" />{isRTL ? 'الحلاقون' : 'Barbers'}</TabsTrigger>
            <TabsTrigger value="services" className="rounded-xl font-bold flex gap-2"><Scissors className="w-4 h-4" />{isRTL ? 'الخدمات' : 'Services'}</TabsTrigger>
            <TabsTrigger value="store" className="rounded-xl font-bold flex gap-2"><ShoppingBag className="w-4 h-4" />{isRTL ? 'المتجر' : 'Store'}</TabsTrigger>
          </TabsList>

          <TabsContent value="barbers">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {barbers.length === 0 ? (
                <div className="col-span-3 text-center py-20 text-muted-foreground">
                  <Users2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg">{isRTL ? 'لا يوجد حلاقون بعد' : 'No barbers listed yet'}</p>
                </div>
              ) : barbers.map((barber) => (
                <Card
                  key={barber.id}
                  className="group rounded-[2.5rem] overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white dark:bg-slate-900"
                  onClick={() => navigate(`/barber/${barber.id}`)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={barber.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${barber.id}`}
                      alt={barber.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black text-lg tracking-tight">{barber.business_name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold">{barber.rating || 5.0}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{barber.bio || barber.role || 'Professional Barber'}</p>
                    <Button className="w-full h-10 rounded-xl font-bold text-xs">
                      {isRTL ? 'عرض البروفايل' : 'View Profile'} <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="services">
            <div className="grid sm:grid-cols-2 gap-4">
              {services.length === 0 ? (
                <div className="col-span-2 text-center py-20 text-muted-foreground">
                  <Scissors className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg">{isRTL ? 'لا توجد خدمات بعد' : 'No services listed yet'}</p>
                </div>
              ) : services.map((svc) => (
                <Card key={svc.id} className="p-6 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <p className="font-black text-base">{isRTL ? svc.name_ar : svc.name_en}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {svc.duration_minutes} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-primary">{svc.price.toLocaleString()} DZD</p>
                    <Button size="sm" className="mt-2 rounded-xl text-xs font-bold" onClick={() => navigate(`/book/${id}`)}>
                      {isRTL ? 'احجز' : 'Book'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="store">
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
              <h3 className="font-black text-2xl mb-2">{isRTL ? 'متجر الصالون' : 'Salon Store'}</h3>
              <p className="text-muted-foreground mb-6">
                {isRTL ? 'اكتشف منتجات هذا الصالون في المتجر الرئيسي.' : 'Discover products from this salon in the main marketplace.'}
              </p>
              <Button onClick={() => navigate(`/store/${id}`)} className="h-14 px-8 rounded-2xl font-black text-lg">
                <ShoppingBag className="w-5 h-5 mr-2" /> {isRTL ? 'زيارة المتجر' : 'Visit Store'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default SalonProfile;
