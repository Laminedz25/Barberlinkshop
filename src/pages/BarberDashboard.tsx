import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  Plus, Edit, Trash2, DollarSign, Clock, QrCode, 
  ImagePlus, UserPlus, Link as LinkIcon, CheckCircle2, 
  XCircle, Check, TrendingUp, TrendingDown, ShoppingBag, 
  Activity, Bot, Users2, Zap, Star, MapPin, ChevronRight, LayoutDashboard
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Expense {
  id: string;
  name: string;
  amount: number;
  created_at: string;
}

interface Service {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  description_ar?: string;
  description_en?: string;
  description_fr?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  is_active: boolean;
  created_at?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating?: number;
}

interface Appointment {
  id: string;
  customer_id: string;
  services: string[];
  total_price: number;
  total_duration: number;
  appointment_date: string;
  appointment_time: string;
  payment_method: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  customer_name?: string;
}

const BarberDashboard = () => {
  const { user } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [barberId, setBarberId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name_ar: '', name_en: '', name_fr: '',
    description_ar: '', description_en: '', description_fr: '',
    price: 0, duration_minutes: 30,
  });

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '', price: 0, image: '', description: '',
  });

  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffFormData, setStaffFormData] = useState({
    name: '', role: '', avatar: '',
  });

  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [socials, setSocials] = useState({
    instagram: '', facebook: '', whatsapp: '', 
    tiktok: '', snapchat: '', telegram: '', website: ''
  });
  const [referralLink, setReferralLink] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 36.1898, lng: 5.4108 }); // Default Sétif
  const [address, setAddress] = useState('');
  const [detectedLocation, setDetectedLocation] = useState(false);

  const fetchBarberProfile = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, 'barbers'), where('user_id', '==', user.uid));
      const snap = await getDocs(q);
      if (snap.empty) { navigate('/'); return; }
      const docData = snap.docs[0].data();
      setBarberId(snap.docs[0].id);
      setIsVerified(docData.is_verified || docData.verified || false);
      setSocials(docData.socials || {});
      setCoordinates(docData.coordinates || { lat: 36.1898, lng: 5.4108 });
      setAddress(docData.address || '');
      setReferralLink(`${window.location.origin}/auth?ref=${snap.docs[0].id}`);
    } catch (e) { 
      const error = e as Error;
      toast({ title: 'Error', description: error.message, variant: 'destructive' }); 
    }
  }, [user?.uid, navigate, toast]);

  const fetchServices = useCallback(async () => {
    if (!barberId) return;
    const snap = await getDocs(query(collection(db, 'services'), where('barber_id', '==', barberId)));
    setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
  }, [barberId]);

  const fetchProducts = useCallback(async () => {
    if (!barberId) return;
    const snap = await getDocs(query(collection(db, 'products'), where('barber_id', '==', barberId)));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
  }, [barberId]);

  const fetchStaff = useCallback(async () => {
    if (!barberId) return;
    const snap = await getDocs(collection(db, 'barbers', barberId, 'staff'));
    setStaff(snap.docs.map(d => ({ id: d.id, ...d.data() } as StaffMember)));
  }, [barberId]);

  const fetchAppointments = useCallback(async () => {
    if (!barberId) return;
    const snap = await getDocs(query(collection(db, 'appointments'), where('barber_id', '==', barberId)));
    const appts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));
    setAppointments(appts);
  }, [barberId]);

  const fetchExpenses = useCallback(async () => {
    if (!barberId) return;
    const snap = await getDocs(query(collection(db, 'expenses'), where('barber_id', '==', barberId)));
    setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
  }, [barberId]);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchBarberProfile();
  }, [user, navigate, fetchBarberProfile]);

  useEffect(() => {
    if (barberId) {
      fetchServices();
      fetchAppointments();
      fetchExpenses();
      fetchProducts();
      fetchStaff();
    }
  }, [barberId, fetchServices, fetchAppointments, fetchExpenses, fetchProducts, fetchStaff]);

  const updateAppointmentStatus = async (appId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appId), { status: newStatus });
      toast({ title: 'Success', description: `Appointment ${newStatus}` });
      fetchAppointments();
    } catch (e) {
      const error = e as Error;
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberId) return;
    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), formData);
        toast({ title: 'Success', description: 'Service updated' });
      } else {
        await addDoc(collection(db, 'services'), { ...formData, barber_id: barberId, is_active: true, created_at: new Date().toISOString() });
        toast({ title: 'Success', description: 'Service added' });
      }
      setIsDialogOpen(false);
      fetchServices();
    } catch (e) {
      const error = e as Error;
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberId) return;
    try {
      if (editingStaff) {
        await updateDoc(doc(db, 'barbers', barberId, 'staff', editingStaff.id), staffFormData);
      } else {
        await addDoc(collection(db, 'barbers', barberId, 'staff'), { ...staffFormData, rating: 5 });
      }
      setIsStaffDialogOpen(false);
      fetchStaff();
      toast({ title: 'Success', description: 'Staff operation complete' });
    } catch (e) {
      const error = e as Error;
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberId) return;
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productFormData);
      } else {
        await addDoc(collection(db, 'products'), { ...productFormData, barber_id: barberId, is_active: true, created_at: new Date().toISOString() });
      }
      setIsProductDialogOpen(false);
      fetchProducts();
      toast({ title: 'Success', description: 'Product updated' });
    } catch (e) {
      const error = e as Error;
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddExpense = async () => {
    if (!expenseName || !expenseAmount || !barberId) return;
    try {
      await addDoc(collection(db, 'expenses'), { name: expenseName, amount: Number(expenseAmount), barber_id: barberId, created_at: new Date().toISOString() });
      setExpenseName(''); setExpenseAmount('');
      fetchExpenses();
    } catch (e) {
      const error = e as Error;
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getServiceName = (s: Service) => language === 'ar' ? s.name_ar : (language === 'fr' ? s.name_fr : s.name_en);

  const totalEarnings = appointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + (a.total_price || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalProfit = totalEarnings - totalExpenses;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Barber Dashboard
              </h1>
              <p className="text-muted-foreground">Manage your autonomous grooming company</p>
            </div>
          </div>

          {/* AI FINANCIAL INSIGHTS - BARBER CFO NODE */}
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
             <Card className="md:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/30 transition-all duration-1000" />
                <div className="relative z-10 p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
                   <div className="space-y-4">
                      <Badge variant="outline" className="text-primary border-primary/30 font-black uppercase tracking-widest text-[10px]">AI CFO Intelligence</Badge>
                      <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">Your Weekly<br /><span className="text-primary">Growth Catalyst</span></h2>
                      <p className="text-white/50 text-xs font-medium max-w-sm">"Fridays are your peak revenue days (+14%). We recommend opening 2 extra slots for 'Precision Fades' which is currently trending in your city."</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center min-w-[100px]">
                         <p className="text-[10px] text-white/40 font-black uppercase mb-1">Weekly Growth</p>
                         <p className="text-2xl font-black text-emerald-400">+12%</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/5 text-center min-w-[100px]">
                         <p className="text-[10px] text-white/40 font-black uppercase mb-1">Peak Day</p>
                         <p className="text-2xl font-black text-amber-400">FRI</p>
                      </div>
                   </div>
                </div>
             </Card>
             <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden p-8 flex flex-col justify-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Autonomous Revenue</h3>
                <p className="text-5xl font-black tracking-tighter text-slate-900 mb-2">12.5k <span className="text-xs">DZD</span></p>
                <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> +8% vs last week</p>
             </Card>
          </div>

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-2xl h-auto">
              <TabsTrigger value="services" className="rounded-xl py-3 font-bold">{t('dashboard.tabs.services')}</TabsTrigger>
              <TabsTrigger value="staff" className="rounded-xl py-3 font-bold gap-2"><Users2 className="w-4 h-4" /> {t('salon.staff')}</TabsTrigger>
              <TabsTrigger value="store_hub" className="rounded-xl py-3 font-bold gap-2"><ShoppingBag className="w-4 h-4" /> {isRTL ? 'مركز المتجر' : 'Store Hub'}</TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-xl py-3 font-bold">{t('dashboard.tabs.bookings')}</TabsTrigger>
              <TabsTrigger value="finance" className="rounded-xl py-3 font-bold">{t('dashboard.tabs.finance')}</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl py-3 font-bold">{t('dashboard.tabs.profile')}</TabsTrigger>
              <TabsTrigger value="ai_marketing" className="rounded-xl py-3 font-bold gap-2"><Bot className="w-4 h-4 text-primary" /> Ads AI</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-8 space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{t('dashboard.services.management')}</h2>
                  <Button onClick={() => { setEditingService(null); setIsDialogOpen(true); }}>
                    <Plus className="mr-2" /> Add Service
                  </Button>
               </div>
               <div className="grid md:grid-cols-3 gap-6">
                  {services.map(s => (
                    <Card key={s.id} className="rounded-3xl p-6 shadow-xl border-none bg-white/60 dark:bg-slate-900/60 transition-all hover:-translate-y-1">
                       <h3 className="font-bold text-xl mb-4">{getServiceName(s)}</h3>
                       <div className="flex gap-4 mb-6">
                          <Badge variant="secondary">{s.price} {t('currency')}</Badge>
                          <Badge variant="outline">{s.duration_minutes} min</Badge>
                       </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { 
                            if (s) {
                              setEditingService(s); 
                              setFormData({
                                name_ar: s.name_ar,
                                name_en: s.name_en,
                                name_fr: s.name_fr,
                                description_ar: s.description_ar || '',
                                description_en: s.description_en || '',
                                description_fr: s.description_fr || '',
                                price: s.price,
                                duration_minutes: s.duration_minutes
                              }); 
                              setIsDialogOpen(true);
                            }
                          }}>Edit</Button>
                          <Button variant="outline" className="text-red-500 rounded-xl" onClick={async () => { await deleteDoc(doc(db, 'services', s.id)); fetchServices(); }}><Trash2 className="h-4 w-4" /></Button>
                       </div>
                    </Card>
                  ))}
               </div>
            </TabsContent>

            <TabsContent value="staff" className="mt-8 space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{t('salon.staff')}</h2>
                  <Button onClick={() => { setEditingStaff(null); setIsStaffDialogOpen(true); }}>
                    <Plus className="mr-2" /> Add Member
                  </Button>
               </div>
               <div className="grid md:grid-cols-3 gap-6">
                  {staff.map(m => (
                    <div key={m.id} className="flex items-center gap-4 p-4 border rounded-3xl bg-white/60 dark:bg-slate-900/60 shadow-xl">
                       <img src={m.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&auto=format&fit=crop'} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                       <div className="flex-1">
                          <h4 className="font-bold text-lg">{m.name}</h4>
                          <p className="text-xs text-muted-foreground font-black uppercase tracking-tighter">{m.role}</p>
                       </div>
                       <Button size="icon" variant="ghost" onClick={async () => { await deleteDoc(doc(db, 'barbers', barberId!, 'staff', m.id)); fetchStaff(); }} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
               </div>
            </TabsContent>

            <TabsContent value="store_hub" className="mt-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="md:col-span-3 p-8 rounded-[2.5rem] border-none shadow-xl bg-white space-y-6">
                     <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Products & Inventory</h2>
                        <Button onClick={() => { setEditingProduct(null); setIsProductDialogOpen(true); }} className="rounded-xl">
                          <Plus className="mr-2 h-4 w-4" /> New Product
                        </Button>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(p => (
                          <div key={p.id} className="group relative bg-slate-50 rounded-3xl p-4 border border-slate-100 transition-all hover:bg-white hover:shadow-lg">
                          <img src={p.image} alt={p.name || 'Product Image'} className="w-full h-32 object-cover rounded-2xl mb-4" />
                             <h4 className="font-bold text-sm">{p.name}</h4>
                             <p className="text-primary font-black text-xs">{p.price} DZD</p>
                             <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-rose-500 bg-white/80 rounded-full" onClick={async () => { await deleteDoc(doc(db, 'products', p.id)); fetchProducts(); }}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        ))}
                     </div>
                  </Card>

                  <div className="space-y-6">
                     <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-slate-900 text-white">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Delivery Partner</h3>
                        <div className="space-y-4">
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                              <p className="text-sm font-bold">Suggested: Yalidine Express</p>
                              <p className="text-[10px] text-white/40">National coverage in Algeria detected.</p>
                           </div>
                           <Button variant="outline" className="w-full rounded-xl border-white/10 text-white hover:bg-white/10 text-xs">CONFIGURE API</Button>
                        </div>
                     </Card>
                     
                     <Card className="p-6 rounded-[2rem] border-none shadow-xl bg-white">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Orders Agent</h3>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                           <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                           <p className="text-[10px] font-bold">Syncing to Google Sheets...</p>
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-[10px] uppercase font-black tracking-widest">Open Analytics</Button>
                     </Card>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="ai_marketing" className="mt-8">
               <Card className="p-12 rounded-[3.5rem] border-none shadow-2xl bg-white overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[90px] rounded-full -mr-32 -mt-32" />
                  <div className="relative z-10 max-w-2xl">
                     <Badge className="bg-primary text-white border-none py-1.5 px-4 rounded-full uppercase text-[10px] tracking-[0.2em] mb-8">Campaign Manager v1.0</Badge>
                     <h2 className="text-5xl font-black tracking-tighter uppercase mb-6 leading-none text-slate-900">Push your products<br />to the <span className="text-primary tracking-normal">Edge</span></h2>
                     <p className="text-slate-600 font-medium text-lg leading-relaxed mb-10">
                        Our AI Ads Agent generates professional creatives, targets local audiences in <span className="text-primary font-black">Setif, Algeria</span>, and optimizes your budget for maximum ROI.
                     </p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                           <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                              <TrendingUp className="h-6 w-6" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">Est. Reach</p>
                              <p className="text-2xl font-black">45.2k <span className="text-xs">users</span></p>
                           </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                           <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                              <DollarSign className="h-6 w-6" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">Daily Budget</p>
                              <p className="text-2xl font-black">500 <span className="text-xs">DZD</span></p>
                           </div>
                        </div>
                     </div>
                     
                     <Button className="h-20 px-12 rounded-[1.75rem] bg-slate-900 text-white font-black text-xl hover:bg-black transition-all shadow-2xl shadow-slate-900/10 flex items-center gap-4 group/ai">
                        CREATE AI CAMPAIGN <ChevronRight className="w-6 h-6 group-hover/ai:translate-x-1 transition-transform" />
                     </Button>
                  </div>
               </Card>
            </TabsContent>

            <TabsContent value="bookings" className="mt-8 space-y-6">
               <h2 className="text-2xl font-bold">{t('dashboard.tabs.bookings')}</h2>
               <div className="grid gap-4">
                  {appointments.map(a => (
                    <Card key={a.id} className="p-6 rounded-3xl border-none shadow-xl bg-white/60 dark:bg-slate-900/60">
                       <div className="flex justify-between items-center">
                          <div>
                             <Badge className={a.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}>{a.status}</Badge>
                             <h4 className="font-bold text-xl mt-2">{a.customer_name || 'Customer'}</h4>
                             <p className="text-sm text-muted-foreground">{new Date(a.appointment_date).toLocaleDateString()} at {a.appointment_time}</p>
                          </div>
                          <div className="flex gap-2">
                             {a.status === 'pending' && <Button onClick={() => updateAppointmentStatus(a.id, 'accepted')} className="bg-green-600 rounded-xl">Accept</Button>}
                             <Button onClick={() => updateAppointmentStatus(a.id, 'completed')} variant="outline" className="rounded-xl">Complete</Button>
                             <Button onClick={() => updateAppointmentStatus(a.id, 'rejected')} variant="destructive" className="rounded-xl">Reject</Button>
                          </div>
                       </div>
                    </Card>
                  ))}
               </div>
            </TabsContent>

            <TabsContent value="finance" className="mt-8 space-y-8">
               <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-8 rounded-[2rem] bg-green-500 text-white shadow-xl shadow-green-500/20">
                     <h3 className="text-lg font-bold opacity-80">Earnings</h3>
                     <p className="text-4xl font-black mt-2">{totalEarnings} {t('currency')}</p>
                  </Card>
                  <Card className="p-8 rounded-[2rem] bg-red-500 text-white shadow-xl shadow-red-500/20">
                     <h3 className="text-lg font-bold opacity-80">Expenses</h3>
                     <p className="text-4xl font-black mt-2">{totalExpenses} {t('currency')}</p>
                  </Card>
                  <Card className="p-8 rounded-[2rem] bg-primary text-white shadow-xl shadow-primary/20">
                     <h3 className="text-lg font-bold opacity-80">Profit</h3>
                     <p className="text-4xl font-black mt-2">{totalProfit} {t('currency')}</p>
                  </Card>
               </div>

               <Card className="p-10 rounded-[3rem] border-none shadow-2xl bg-slate-950 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -mr-40 -mt-40 animate-pulse group-hover:bg-primary/30 transition-all duration-700" />
                  <div className="relative z-10">
                     <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-black flex items-center gap-4 tracking-tighter uppercase">
                           <Bot className="text-primary fill-primary w-8 h-8" /> Neural Business Insights
                        </h3>
                        <Badge className="bg-primary/20 text-primary border-none font-bold px-4 py-2 rounded-full uppercase text-[10px] tracking-widest">Level 3 Autonomous Analysis</Badge>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3 p-6 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                           <TrendingUp className="text-green-500 w-6 h-6" />
                           <h4 className="font-bold text-lg">Revenue Projection</h4>
                           <p className="text-sm text-white/60">AI predicts a <span className="text-green-400 font-black">+18% growth</span> next month based on current booking velocity and local market trends in Setif.</p>
                        </div>
                        <div className="space-y-3 p-6 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                           <Activity className="text-blue-500 w-6 h-6" />
                           <h4 className="font-bold text-lg">Occupancy Efficiency</h4>
                           <p className="text-sm text-white/60">Current peak hours (14:00 - 18:00) are <span className="text-blue-400 font-black">94% saturated</span>. AI recommends adding a part-time barber to maximize ROI.</p>
                        </div>
                        <div className="space-y-3 p-6 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                           <Zap className="text-amber-500 w-6 h-6" />
                           <h4 className="font-bold text-lg">Smart Recommendations</h4>
                           <p className="text-sm text-white/60">Launch a "Happy Hour" promotion between 09:00-11:00 on weekdays to fill low-occupancy nodes.</p>
                        </div>
                     </div>
                     
                     <Button className="mt-10 w-full h-16 rounded-2xl bg-white text-slate-950 font-black text-lg hover:bg-slate-100 transition-all active:scale-[0.98]">
                        IMPLEMENT AI STRATEGY
                     </Button>
                  </div>
               </Card>
               
               <div className="grid md:grid-cols-2 gap-8">
                  <Card className="p-8 rounded-3xl shadow-xl bg-white/60 dark:bg-slate-900/60 border-none">
                     <h3 className="text-xl font-bold mb-6">Finance Tracking</h3>
                     <div className="space-y-4">
                        <Input placeholder="Expense Name" value={expenseName} onChange={e => setExpenseName(e.target.value)} className="rounded-xl" />
                        <Input placeholder="Amount" type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} className="rounded-xl" />
                        <Button onClick={handleAddExpense} className="w-full h-12 rounded-xl">Add Expense</Button>
                     </div>
                  </Card>
                  <Card className="p-8 rounded-3xl shadow-xl bg-white/60 dark:bg-slate-900/60 border-none">
                     <h3 className="text-xl font-bold mb-6">Referral Engine</h3>
                     <p className="text-sm text-muted-foreground mb-4">Invite other barbers and earn 500 DZD for each successful verification.</p>
                     <div className="flex gap-2">
                        <Input readOnly value={referralLink} className="rounded-xl flex-1" />
                        <Button variant="outline" className="rounded-xl" onClick={() => { navigator.clipboard.writeText(referralLink); toast({ title: "Copied!" }) }}><LinkIcon className="h-4 w-4" /></Button>
                     </div>
                  </Card>
               </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                   <Card className="p-10 rounded-[3rem] shadow-2xl bg-white/60 dark:bg-slate-900/60 border-none flex flex-col items-center">
                      <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">Your Salon QR</h3>
                      <div className="p-6 bg-white rounded-[2rem] shadow-inner mb-6">
                         {barberId && <QRCodeSVG value={`${window.location.origin}/barber/${barberId}`} size={200} />}
                      </div>
                      <p className="text-center text-sm text-muted-foreground">Customers can scan this to book directly from your salon. Print and place on your mirror!</p>
                   </Card>
                   
                   <Card className="p-10 rounded-[3rem] shadow-2xl bg-white/60 dark:bg-slate-900/60 border-none">
                      <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">Verification Profile</h3>
                       <div className="flex items-center gap-6 p-6 border rounded-[2rem] bg-primary/5 border-primary/20">
                          <div className={`p-5 rounded-full ${isVerified ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white shadow-lg'}`}>
                             {isVerified ? <CheckCircle2 className="h-8 w-8" /> : <Activity className="h-8 w-8" />}
                          </div>
                          <div className="flex-1">
                             <p className="font-extrabold text-xl">{isVerified ? "Verified Studio" : "Identity In Review"}</p>
                             <p className="text-sm opacity-80">{isVerified ? t('verified') : "Level 1 Access - Standard"}</p>
                          </div>
                          {!isVerified && (
                             <Button onClick={async () => {
                                if (!barberId) return;
                                await updateDoc(doc(db, 'barbers', barberId), { verification_status: 'pending' });
                                toast({ title: "Verification Requested", description: "Identity node submitted for Level 3 review." });
                             }} variant="outline" className="rounded-xl border-primary/20 bg-white">Request Official Badge</Button>
                          )}
                       </div>
                    </Card>

                    <Card className="p-10 rounded-[3rem] shadow-2xl bg-white/60 dark:bg-slate-900/60 border-none space-y-6 lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-2xl font-black uppercase tracking-tighter">Location Presence</h3>
                           <Button variant="outline" size="sm" onClick={() => {
                              navigator.geolocation.getCurrentPosition((pos) => {
                                 setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                                 setDetectedLocation(true);
                                 toast({ title: "GPS Detected", description: "Coordinates updated automatically." });
                              });
                           }} className="rounded-full gap-2">
                              {detectedLocation ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <MapPin className="w-4 h-4" />}
                              {detectedLocation ? "Detected" : "Auto-Detect Location"}
                           </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="space-y-1">
                              <Label className="uppercase text-[10px] font-black">Latitude</Label>
                              <Input type="number" step="any" value={coordinates.lat} onChange={(e) => setCoordinates({...coordinates, lat: Number(e.target.value)})} className="rounded-xl" />
                           </div>
                           <div className="space-y-1">
                              <Label className="uppercase text-[10px] font-black">Longitude</Label>
                              <Input type="number" step="any" value={coordinates.lng} onChange={(e) => setCoordinates({...coordinates, lng: Number(e.target.value)})} className="rounded-xl" />
                           </div>
                           <div className="space-y-1">
                              <Label className="uppercase text-[10px] font-black">Store Address</Label>
                              <Input placeholder="St. 25, Setif, Algeria" value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl" />
                           </div>
                        </div>
                        <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black" onClick={async () => {
                           if (barberId) {
                              await updateDoc(doc(db, 'barbers', barberId), { coordinates, address });
                              toast({ title: "Success", description: "Location saved to Google Maps Node." });
                           }
                        }}>SAVE LOCATION DATA</Button>
                    </Card>

                    <Card className="p-10 rounded-[3rem] shadow-2xl bg-white/60 dark:bg-slate-900/60 border-none space-y-6">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Social Connectivity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {Object.keys(socials).map((k) => (
                              <div key={k} className="space-y-1">
                                 <Label className="capitalize text-[10px] font-black">{k}</Label>
                                 <Input 
                                    placeholder={k === 'whatsapp' ? '213...' : `@${k}_id`} 
                                    className="rounded-xl" 
                                    value={socials[k as keyof typeof socials] || ''} 
                                    onChange={async (e) => {
                                       const newSocials = { ...socials, [k]: e.target.value };
                                       setSocials(newSocials);
                                       if (barberId) await updateDoc(doc(db, 'barbers', barberId), { socials: newSocials });
                                    }}
                                 />
                              </div>
                           ))}
                        </div>
                    </Card>
                </div>
            </TabsContent>

          </Tabs>

        </div>
      </main>

      <Footer />

      {/* Dialogs */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-8">
           <DialogHeader><DialogTitle>{editingService ? 'Edit' : 'Add'} Service</DialogTitle></DialogHeader>
           <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1"><Label>Nombre (AR)</Label><Input value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} required dir="rtl" /></div>
                 <div className="space-y-1"><Label>Name (EN)</Label><Input value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1"><Label>Price</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required /></div>
                 <div className="space-y-1"><Label>Duration (min)</Label><Input type="number" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})} required /></div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl">Save Service</Button>
           </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-8">
           <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
           <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div className="space-y-1"><Label>Full Name</Label><Input value={staffFormData.name} onChange={e => setStaffFormData({...staffFormData, name: e.target.value})} required /></div>
              <div className="space-y-1"><Label>Role</Label><Input value={staffFormData.role} onChange={e => setStaffFormData({...staffFormData, role: e.target.value})} required /></div>
              <div className="space-y-1"><Label>Avatar URL</Label><Input value={staffFormData.avatar} onChange={e => setStaffFormData({...staffFormData, avatar: e.target.value})} placeholder="https://..." /></div>
              <Button type="submit" className="w-full h-12 rounded-xl">Save Member</Button>
           </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-8">
           <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
           <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="space-y-1"><Label>Product Name</Label><Input value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1"><Label>Price</Label><Input type="number" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})} required /></div>
                 <div className="space-y-1"><Label>Image URL</Label><Input value={productFormData.image} onChange={e => setProductFormData({...productFormData, image: e.target.value})} /></div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl">Save Product</Button>
           </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarberDashboard;
