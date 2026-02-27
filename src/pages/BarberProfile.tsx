import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Phone, Calendar, Heart, Share2, Instagram, Facebook, MessageCircle, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { Users2 } from 'lucide-react';

interface BarberProfile {
  id: string;
  user_id: string;
  business_name: string;
  bio: string;
  cover_photo_url: string;
  location_lat: number;
  location_lng: number;
  address: string;
  city: string;
  whatsapp: string;
  phone: string;
  instagram: string;
  facebook: string;
  is_vip: boolean;
  offers_home_visit: boolean;
  rating: number;
  total_reviews: number;
  salon_type: 'men' | 'women' | 'unisex';
  profiles: { full_name: string; avatar_url: string; phone: string };
}

interface Service {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  price: number;
  duration_minutes: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: { full_name: string; avatar_url: string };
}

interface GalleryItem {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

const BarberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [barber, setBarber] = useState<BarberProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);



  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  useEffect(() => {
    fetchBarberData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchBarberData = async () => {
    if (!id) return;
    try {
      const barberDoc = await getDoc(doc(db, 'barbers', id));
      if (!barberDoc.exists()) {
        throw new Error("Barber not found");
      }
      const barberData = barberDoc.data();

      let profileData = {};
      if (barberData.user_id) {
        const profileDoc = await getDoc(doc(db, 'users', barberData.user_id));
        if (profileDoc.exists()) {
          profileData = profileDoc.data();
        }
      }

      setBarber({ id: barberDoc.id, ...barberData, profiles: profileData } as unknown as BarberProfile);

      const servicesQuery = query(collection(db, 'services'), where('barber_id', '==', id), where('is_active', '==', true));
      const servicesSnap = await getDocs(servicesQuery);
      const servicesList: Service[] = [];
      servicesSnap.forEach(doc => {
        servicesList.push({ id: doc.id, ...doc.data() } as Service);
      });
      setServices(servicesList);

      const staffQuery = query(collection(db, 'staff'), where('barber_id', '==', id));
      const staffSnap = await getDocs(staffQuery);
      const staffData: StaffMember[] = [];
      staffSnap.forEach(doc => {
        staffData.push({ id: doc.id, ...doc.data() } as StaffMember);
      });
      setStaffList(staffData);

      const reviewsQuery = query(collection(db, 'reviews'), where('barber_id', '==', id));
      const reviewsSnap = await getDocs(reviewsQuery);
      let reviewsList: Record<string, unknown>[] = [];
      reviewsSnap.forEach(doc => {
        reviewsList.push({ id: doc.id, ...doc.data() });
      });

      reviewsList.sort((a, b) => ((b.created_at as string) || "").localeCompare((a.created_at as string) || ""));
      reviewsList = reviewsList.slice(0, 10);

      const reviewsWithProfiles: Review[] = await Promise.all(
        reviewsList.map(async (review) => {
          if (!review.customer_id) return { ...review, profiles: {} } as Review;
          const profDoc = await getDoc(doc(db, 'users', review.customer_id as string));
          return { ...review, profiles: profDoc.exists() ? profDoc.data() : { full_name: 'Unknown', avatar_url: '' } } as Review;
        })
      );
      setReviews(reviewsWithProfiles);

      const galleryQuery = query(collection(db, 'work_gallery'), where('barber_id', '==', id));
      const gallerySnap = await getDocs(galleryQuery);
      const galleryList: GalleryItem[] = [];
      gallerySnap.forEach(doc => {
        galleryList.push({ id: doc.id, ...doc.data() } as GalleryItem);
      });
      setGallery(galleryList);

      const productsQuery = query(collection(db, 'products'), where('barber_id', '==', id));
      const productsSnap = await getDocs(productsQuery);
      const productsList: Product[] = [];
      productsSnap.forEach(doc => {
        productsList.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsList);

      if (user?.uid) {
        const favQuery = query(collection(db, 'favorites'), where('customer_id', '==', user.uid), where('barber_id', '==', id));
        const favSnap = await getDocs(favQuery);
        if (!favSnap.empty) {
          setIsFavorite(true);
          setFavoriteId(favSnap.docs[0].id);
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      }
    } catch (error: unknown) {
      toast({
        title: t('error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user?.uid) {
      navigate('/auth');
      return;
    }
    if (!id) return;

    try {
      if (isFavorite && favoriteId) {
        await deleteDoc(doc(db, 'favorites', favoriteId));
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        const docRef = await addDoc(collection(db, 'favorites'), {
          customer_id: user.uid,
          barber_id: id,
          created_at: new Date().toISOString()
        });
        setIsFavorite(true);
        setFavoriteId(docRef.id);
      }
    } catch (error: unknown) {
      toast({
        title: t('error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleBooking = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/book/${id}`);
  };

  const handleWhatsApp = () => {
    if (barber?.whatsapp) {
      window.open(`https://wa.me/${barber.whatsapp}`, '_blank');
    }
  };

  const handleCall = () => {
    if (barber?.phone) {
      window.location.href = `tel:${barber.phone}`;
    }
  };

  const handleAppChat = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/chat/${id}`);
  };

  const getSalonTypeText = (type: string) => {
    switch (type) {
      case 'men': return t('salon.type.men');
      case 'women': return t('salon.type.women');
      case 'unisex': return t('salon.type.unisex');
      default: return t('salon.type.men');
    }
  };

  const getSalonTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'men': return 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30';
      case 'women': return 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30';
      case 'unisex': return 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/30';
      default: return 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!barber) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-semibold bg-slate-50 dark:bg-slate-950">{t('barber.notfound')}</div>;
  }

  const getServiceName = (service: Service) => {
    // Enforce Arabic names as primary choice per user request
    return service.name_ar || service.name_fr || service.name_en;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navigation />

      {/* Decorative Blur Backgrounds */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] dark:bg-primary/10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] dark:bg-blue-500/10" />
      </div>

      {/* Cover Photo - Dynamic gradient matching VIP status or regular */}
      <div className={`relative h-72 md:h-[400px] w-full ${barber.is_vip ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/50' : 'bg-gradient-to-r from-primary/30 to-blue-600/40'}`}>
        {barber.cover_photo_url && (
          <>
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <img src={barber.cover_photo_url} alt="Cover" className="w-full h-full object-cover z-0 relative" />
          </>
        )}
      </div>

      <div className="container mx-auto px-4 -mt-32 pb-16 relative z-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Profile Card */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-800/80 p-8 sm:p-10 rounded-[3rem] shadow-2xl mb-10 overflow-visible relative">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
              {/* Avatar */}
              <div className="relative shrink-0 -mt-20 md:-mt-24 mx-auto md:mx-0 w-36 h-36 md:w-48 md:h-48 group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-[4px] shadow-2xl transition-transform group-hover:scale-105">
                  <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full overflow-hidden">
                    <img
                      src={barber.profiles?.avatar_url || '/placeholder.svg'}
                      alt={barber.business_name || barber.profiles?.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 text-center md:text-start">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 drop-shadow-sm mb-2">
                      {barber.business_name || barber.profiles?.full_name}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                      <Badge className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg border-none ${getSalonTypeBadgeColor(barber.salon_type)}`}>
                        {getSalonTypeText(barber.salon_type)}
                      </Badge>
                      {barber.is_vip && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 text-sm font-bold shadow-lg shadow-yellow-500/30 border-none">VIP</Badge>}
                      {barber.offers_home_visit && <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold">{t('barber.homevisit')}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    {barber.instagram && (
                      <a href={barber.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram Profile" title="Instagram Profile">
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F] transition-all shadow-sm">
                          <Instagram className="h-5 w-5" />
                        </Button>
                      </a>
                    )}
                    {barber.facebook && (
                      <a href={barber.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook Profile" title="Facebook Profile">
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all shadow-sm">
                          <Facebook className="h-5 w-5" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleFavorite}
                      className={`rounded-full h-12 w-12 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 transition-all shadow-sm ${isFavorite ? 'border-red-500 hover:bg-red-50' : 'hover:bg-red-500 hover:text-white hover:border-red-500'}`}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-5">
                  <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1.5 rounded-2xl dark:bg-yellow-400/5">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                    <span className="font-extrabold text-lg">{barber.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-muted-foreground font-medium">({barber.total_reviews || 0} {t('barber.reviews')})</span>
                  </div>
                  {barber.city && (
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-slate-100/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-2xl font-medium">
                      <MapPin className="h-4 w-4" />
                      <span>{barber.city}</span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl mx-auto md:mx-0 font-medium">
                  {barber.bio || 'Your trusted professional barber platform.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-2">
                  <Button onClick={handleBooking} size="lg" className="flex-1 rounded-full h-14 text-lg font-bold shadow-xl shadow-primary/25 hover:-translate-y-1 transition-all">
                    <Calendar className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('barber.book')}
                  </Button>
                  <Button onClick={handleAppChat} variant="secondary" size="lg" className="flex-1 sm:flex-none h-14 rounded-full font-bold px-8 shadow-lg hover:-translate-y-1 transition-all">
                    <MessageCircle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary`} />
                    {t('contact.chat')}
                  </Button>
                  {barber.whatsapp && (
                    <Button onClick={handleWhatsApp} variant="outline" size="lg" className="flex-1 sm:flex-none h-14 rounded-full font-bold px-8 border-[#25D366] text-[#25D366] hover:bg-[#25D366] bg-white/50 dark:bg-slate-900/50 hover:text-white shadow-lg hover:-translate-y-1 transition-all">
                      <Phone className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('contact.whatsapp')}
                    </Button>
                  )}
                  {barber.phone && (
                    <Button onClick={handleCall} variant="outline" size="icon" className="h-14 w-14 rounded-full font-bold border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 shadow-lg hover:-translate-y-1 transition-all">
                      <Phone className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Content Tabs */}
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/40 dark:border-slate-800/60 p-6 sm:p-10 rounded-[3rem] shadow-xl">
            <Tabs defaultValue="services" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-10 h-auto">
                <TabsTrigger value="services" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md py-3 text-base sm:text-lg font-bold transition-all">{t('barber.services')}</TabsTrigger>
                <TabsTrigger value="staff" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md py-3 text-base sm:text-lg font-bold transition-all flex items-center justify-center gap-2"><Users2 className="w-5 h-5 hidden sm:block" /> {t('salon.staff')}</TabsTrigger>
                <TabsTrigger value="store" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md py-3 text-base sm:text-lg font-bold transition-all flex items-center justify-center gap-2"><ShoppingBag className="w-5 h-5 hidden sm:block" /> {t('store.title')}</TabsTrigger>
                <TabsTrigger value="gallery" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md py-3 text-base sm:text-lg font-bold transition-all">{t('barber.gallery')}</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md py-3 text-base sm:text-lg font-bold transition-all">{t('barber.reviews')}</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-4">
                {services.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground text-lg font-medium">{t('barber.services')} {t('store.comingsoon')}</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div key={service.id} className="group bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 p-6 rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all flex justify-between items-center cursor-default">
                        <div>
                          <h3 className="font-extrabold text-xl mb-1 text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{getServiceName(service)}</h3>
                          <p className="text-sm text-muted-foreground font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> {service.duration_minutes} {t('barber.minutes')}</p>
                        </div>
                        <div className="bg-primary/10 dark:bg-primary/5 px-4 py-2 rounded-2xl">
                          <span className="text-xl font-black text-primary drop-shadow-sm">{service.price}</span>
                          <span className="text-sm font-bold text-primary ml-1">{t('currency')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="staff">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {staffList.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-muted-foreground text-lg font-medium">No staff members found.</div>
                  ) : (
                    staffList.map((staff) => (
                      <Card key={staff.id} className="bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-md hover:shadow-xl transition-all text-center group">
                        <div className="mx-auto w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary transition-colors">
                          <img src={staff.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&auto=format&fit=crop&q=80"} alt={staff.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <h3 className="text-xl font-bold">{staff.name}</h3>
                        <p className="text-primary font-medium mb-2">{staff.role}</p>
                        <div className="flex justify-center items-center gap-1 mb-6">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{staff.rating}</span>
                        </div>
                        <Button onClick={() => navigate(`/book/${id}?chair=${staff.id}`)} className="w-full rounded-full shadow-lg shadow-primary/20">
                          {t('staff.book')} {staff.name}
                        </Button>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="store">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-muted-foreground text-lg font-medium">{t('store.comingsoon')}</div>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="group overflow-hidden flex flex-col sm:flex-row bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700/50 rounded-[2rem] shadow-md hover:shadow-2xl transition-all">
                        <div className="h-56 sm:h-auto sm:w-48 overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex justify-between items-start mb-3 gap-2">
                              <h3 className="font-extrabold text-xl leading-snug">{product.name}</h3>
                              <span className="font-black text-xl text-primary shrink-0 bg-primary/10 px-3 py-1 rounded-xl">{product.price} {t('currency')}</span>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium mb-6 leading-relaxed">{product.description}</p>
                          </div>
                          <Button className="w-full rounded-full h-12 text-md font-bold shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform" onClick={() => toast({ title: t('store.comingsoon'), description: t('store.desc') })}>
                            <ShoppingBag className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} /> {t('store.buy')}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="gallery">
                {gallery.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground text-lg font-medium">{t('barber.gallery')} {t('store.comingsoon')}</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {gallery.map((item) => (
                      <div key={item.id} className="group aspect-square rounded-[2rem] overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all relative">
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center pointer-events-none">
                          <span className="text-white font-bold bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">View Details</span>
                        </div>
                        {item.media_type === 'image' ? (
                          <img src={item.media_url} alt={item.caption || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 z-0" />
                        ) : (
                          <video src={item.media_url} className="w-full h-full object-cover z-0" controls />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground text-lg font-medium">No reviews yet</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white/60 dark:bg-slate-800/60 p-6 sm:p-8 rounded-[2rem] border border-white/50 dark:border-slate-700/50 shadow-md">
                        <div className="flex gap-4">
                          <div className="shrink-0 w-14 h-14 rounded-full overflow-hidden bg-gradient-to-tr from-primary to-blue-400 p-[2px]">
                            <img
                              src={review.profiles?.avatar_url || '/placeholder.svg'}
                              alt={review.profiles?.full_name}
                              className="w-full h-full rounded-full object-cover bg-white"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                              <div>
                                <h4 className="font-extrabold text-lg truncate">{review.profiles?.full_name}</h4>
                                <div className="flex gap-1 mt-1 bg-white/50 dark:bg-slate-900/50 w-max px-2 py-1 rounded-lg">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 sm:h-4 sm:w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'text-slate-300 dark:text-slate-600'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-muted-foreground bg-slate-100/50 dark:bg-slate-900/50 px-3 py-1 rounded-xl">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-4">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BarberProfile;