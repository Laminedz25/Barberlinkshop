import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Plus, Edit, Trash2, DollarSign, Clock, QrCode, ImagePlus, UserPlus, Link as LinkIcon, CheckCircle2, XCircle, Check, TrendingUp, TrendingDown, ShoppingBag } from 'lucide-react';
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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AutomationService } from '@/services/AutomationService';

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
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    name_fr: '',
    description_ar: '',
    description_fr: '',
    price: 0,
    duration_minutes: 30,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    price: 0,
    image: '',
    description: '',
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBarberProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  useEffect(() => {
    if (barberId) {
      fetchServices();
      fetchAppointments();
      fetchExpenses();
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barberId]);

  const fetchBarberProfile = async () => {
    if (!user?.uid) return;

    try {
      const q = query(collection(db, 'barbers'), where('user_id', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: t('error'),
          description: 'You need to create a barber profile first',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setBarberId(querySnapshot.docs[0].id);
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: t('error'),
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const fetchProducts = async () => {
    if (!barberId) return;
    try {
      const q = query(collection(db, 'products'), where('barber_id', '==', barberId));
      const querySnapshot = await getDocs(q);

      const productsData: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        productsData.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });

      productsData.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      setProducts(productsData || []);
    } catch (error: unknown) {
      console.error("Error fetching products", error);
    }
  };

  const fetchServices = async () => {
    if (!barberId) return;
    try {
      const q = query(collection(db, 'services'), where('barber_id', '==', barberId));
      const querySnapshot = await getDocs(q);

      const servicesData: Service[] = [];
      querySnapshot.forEach((docSnap) => {
        servicesData.push({ id: docSnap.id, ...docSnap.data() } as Service);
      });

      servicesData.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
      setServices(servicesData || []);
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: t('error'),
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const fetchAppointments = async () => {
    if (!barberId) return;
    try {
      const q = query(collection(db, 'appointments'), where('barber_id', '==', barberId));
      const querySnapshot = await getDocs(q);

      const apptsData: Appointment[] = [];
      querySnapshot.forEach((docSnap) => {
        apptsData.push({ id: docSnap.id, ...docSnap.data() } as Appointment);
      });

      for (const app of apptsData) {
        if (app.customer_id) {
          const usersSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', app.customer_id)));
          if (!usersSnap.empty) {
            app.customer_name = usersSnap.docs[0].data().full_name || 'Customer';
          }
        }
      }

      apptsData.sort((a, b) => {
        const dateA = new Date(`${a.appointment_date.split('T')[0]}T${a.appointment_time}`);
        const dateB = new Date(`${b.appointment_date.split('T')[0]}T${b.appointment_time}`);
        return dateB.getTime() - dateA.getTime();
      });

      setAppointments(apptsData);
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: t('error'),
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const fetchExpenses = async () => {
    if (!barberId) return;
    try {
      const q = query(collection(db, 'expenses'), where('barber_id', '==', barberId));
      const querySnapshot = await getDocs(q);
      const exps: Expense[] = [];
      querySnapshot.forEach((docSnap) => {
        exps.push({ id: docSnap.id, ...docSnap.data() } as Expense);
      });
      setExpenses(exps);
    } catch (error: unknown) {
      console.error("Error fetching expenses", error);
    }
  };

  const updateAppointmentStatus = async (appId: string, newStatus: string) => {
    try {
      const appRef = doc(db, 'appointments', appId);
      await updateDoc(appRef, { status: newStatus });
      toast({ title: 'Success', description: t(`dashboard.requests.${newStatus === 'completed' ? 'complete' : newStatus}`) || `Appointment marked as ${newStatus}` });
      fetchAppointments();
    } catch (error: unknown) {
      const err = error as Error;
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barberId) return;

    const serviceData = {
      ...formData,
      barber_id: barberId,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingService) {
        const serviceRef = doc(db, 'services', editingService.id);
        await updateDoc(serviceRef, serviceData);
        toast({ title: 'Success', description: t('dashboard.service.update') + ' ✓' });
      } else {
        const newService = {
          ...serviceData,
          created_at: new Date().toISOString()
        };
        await addDoc(collection(db, 'services'), newService);
        toast({ title: 'Success', description: t('dashboard.service.add') + ' ✓' });
      }

      setIsDialogOpen(false);
      setEditingService(null);
      setFormData({
        name_ar: '',
        name_en: '',
        name_fr: '',
        description_ar: '',
        description_en: '',
        description_fr: '',
        price: 0,
        duration_minutes: 30,
      });
      fetchServices();
    } catch (error: unknown) {
      const err = error as Error;
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name_ar: service.name_ar || '',
      name_en: service.name_en || '',
      name_fr: service.name_fr || '',
      description_ar: service.description_ar || '',
      description_en: service.description_en || '',
      description_fr: service.description_fr || '',
      price: service.price || 0,
      duration_minutes: service.duration_minutes || 30,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
      toast({ title: 'Success', description: 'Service deleted successfully' });
      fetchServices();
    } catch (error: unknown) {
      const err = error as Error;
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
    }
  };

  const getServiceName = (service: Service) => {
    if (language === 'ar') return service.name_ar;
    if (language === 'fr') return service.name_fr;
    return service.name_en;
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barberId) return;

    const newProductData = {
      ...productFormData,
      barber_id: barberId,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingProduct) {
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, newProductData);
        toast({ title: 'Success', description: 'Product updated successfully ✓' });
      } else {
        const newProduct = {
          ...newProductData,
          created_at: new Date().toISOString()
        };
        await addDoc(collection(db, 'products'), newProduct);
        toast({ title: 'Success', description: 'Product added successfully ✓' });

        // Trigger Automated MCP Action to post product to social media
        await AutomationService.autoPostToSocialMedia(
          barberId,
          newProductData.image || "default-product.jpg",
          `New Product Alert: ${newProductData.name} is now available in our store for ${newProductData.price} DZD!`
        );
        toast({ title: 'Automation', description: 'Product auto-posted to Social Media (MCP)' });
      }

      setIsProductDialogOpen(false);
      setEditingProduct(null);
      setProductFormData({
        name: '',
        price: 0,
        image: '',
        description: '',
      });
      fetchProducts();
    } catch (error: unknown) {
      const err = error as Error;
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
    }
  };

  const handleProductEdit = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name || '',
      price: product.price || 0,
      image: product.image || '',
      description: product.description || '',
    });
    setIsProductDialogOpen(true);
  };

  const handleProductDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: 'Success', description: 'Product deleted successfully' });
      fetchProducts();
    } catch (error: unknown) {
      const err = error as Error;
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
    }
  };

  const handleAddExpense = async () => {
    if (!expenseName || !expenseAmount || !barberId) return;
    try {
      await addDoc(collection(db, 'expenses'), {
        name: expenseName,
        amount: Number(expenseAmount),
        barber_id: barberId,
        created_at: new Date().toISOString()
      });
      setExpenseName('');
      setExpenseAmount('');
      toast({ title: "Success", description: "Expense added successfully" });
      fetchExpenses();
    } catch (error: unknown) {
      const err = error as Error;
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const totalEarnings = appointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + (a.total_price || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalProfit = totalEarnings - totalExpenses;

  // Mock chart data (you can later replace this by aggregating appointments by date)
  const chartData = [
    { name: 'Mon', revenue: 1500 },
    { name: 'Tue', revenue: 2000 },
    { name: 'Wed', revenue: 1200 },
    { name: 'Thu', revenue: 3500 },
    { name: 'Fri', revenue: 4500 },
    { name: 'Sat', revenue: 5000 },
    { name: 'Sun', revenue: 2500 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navigation />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      <main className="container mx-auto px-4 py-8 mt-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400 mb-2">
                {t('dashboard.services.management')}
              </h1>
              <p className="text-muted-foreground text-lg">{t('dashboard.services.desc')}</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full shadow-xl shadow-primary/20" onClick={() => {
                  setEditingService(null);
                  setFormData({
                    name_ar: '', name_en: '', name_fr: '',
                    description_ar: '', description_en: '', description_fr: '',
                    price: 0, duration_minutes: 30,
                  });
                }}>
                  <Plus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('dashboard.service.add')}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-6 sm:p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {editingService ? t('dashboard.service.edit') : t('dashboard.service.add')}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="name_ar">{t('dashboard.service.name.ar')}</Label>
                        <Input id="name_ar" className="mt-1" value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} required dir="rtl" />
                      </div>
                      <div>
                        <Label htmlFor="name_en">{t('dashboard.service.name.en')}</Label>
                        <Input id="name_en" className="mt-1" value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} required />
                      </div>
                      <div>
                        <Label htmlFor="name_fr">{t('dashboard.service.name.fr')}</Label>
                        <Input id="name_fr" className="mt-1" value={formData.name_fr} onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="description_ar">{t('dashboard.service.desc.ar')}</Label>
                        <Textarea id="description_ar" className="mt-1 resize-none" value={formData.description_ar} onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })} dir="rtl" />
                      </div>
                      <div>
                        <Label htmlFor="description_en">{t('dashboard.service.desc.en')}</Label>
                        <Textarea id="description_en" className="mt-1 resize-none" value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="description_fr">{t('dashboard.service.desc.fr')}</Label>
                        <Textarea id="description_fr" className="mt-1 resize-none" value={formData.description_fr} onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">{t('dashboard.service.price')}</Label>
                        <Input id="price" type="number" className="mt-1" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required min="0" />
                      </div>
                      <div>
                        <Label htmlFor="duration">{t('dashboard.service.duration')}</Label>
                        <Input id="duration" type="number" className="mt-1" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })} required min="15" step="15" />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full rounded-full shadow-lg">
                    {editingService ? t('dashboard.service.update') : t('dashboard.service.add')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="services" className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl h-auto">
                <TabsTrigger value="services" className="rounded-xl py-3 text-sm sm:text-base font-bold transition-all">{t('dashboard.tabs.services')}</TabsTrigger>
                <TabsTrigger value="store" className="rounded-xl py-3 text-sm sm:text-base font-bold transition-all gap-2"><ShoppingBag className="w-4 h-4 hidden sm:block" /> {t('store.title')}</TabsTrigger>
                <TabsTrigger value="bookings" className="rounded-xl py-3 text-sm sm:text-base font-bold transition-all">{t('dashboard.tabs.bookings')}</TabsTrigger>
                <TabsTrigger value="profile" className="rounded-xl py-3 text-sm sm:text-base font-bold transition-all">{t('dashboard.tabs.profile')}</TabsTrigger>
                <TabsTrigger value="finance" className="rounded-xl py-3 text-sm sm:text-base font-bold transition-all">{t('dashboard.tabs.finance')}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="services" className="space-y-6 mt-4">
              <div className="grid gap-6">
                {services.length === 0 ? (
                  <div className="text-center py-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl shadow-xl">
                    <p className="text-xl text-muted-foreground mb-6">{t('dashboard.services.empty')}</p>
                    <Button size="lg" className="rounded-full shadow-xl shadow-primary/20" onClick={() => setIsDialogOpen(true)}>
                      <Plus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('dashboard.services.first')}
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <div key={service.id} className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-6 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div>
                          <h3 className="text-xl font-bold mb-4">{getServiceName(service)}</h3>
                          <div className="space-y-3 mb-6 flex flex-wrap gap-2">
                            <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-2 rounded-2xl text-sm font-medium">
                              <DollarSign className="h-4 w-4 text-primary" />
                              <span>{service.price} {t('currency')}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-2 rounded-2xl text-sm font-medium">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>{service.duration_minutes} {t('barber.minutes')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-auto">
                          <Button variant="outline" className="flex-1 rounded-xl border-primary/20 hover:bg-primary/5" onClick={() => handleEdit(service)}>
                            <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} /> Edit
                          </Button>
                          <Button variant="outline" className="flex-1 rounded-xl border-red-500/20 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleDelete(service.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="store" className="space-y-6 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3"><ShoppingBag className="text-primary" /> {t('store.title')}</h2>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="rounded-full shadow-xl shadow-primary/20" onClick={() => {
                      setEditingProduct(null);
                      setProductFormData({ name: '', price: 0, image: '', description: '' });
                    }}>
                      <Plus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('dashboard.service.add')} Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl rounded-[2rem] p-6 sm:p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-white/20">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">
                        {editingProduct ? 'Edit Product' : 'Add Product'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProductSubmit} className="space-y-6 mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label>Product Name</Label>
                          <Input value={productFormData.name} onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Price ({t('currency')})</Label>
                            <Input type="number" value={productFormData.price} onChange={(e) => setProductFormData({ ...productFormData, price: Number(e.target.value) })} required min="0" />
                          </div>
                          <div>
                            <Label>Image URL</Label>
                            <Input value={productFormData.image} onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })} placeholder="https://..." />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea value={productFormData.description} onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })} />
                        </div>
                      </div>
                      <Button type="submit" size="lg" className="w-full rounded-full shadow-lg">Save Product</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl shadow-xl">
                  <p className="text-xl text-muted-foreground mb-6">No products available in your store.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="group overflow-hidden flex flex-col bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700/50 rounded-[2rem] shadow-md hover:shadow-2xl transition-all">
                      <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img src={product.image || 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=500&auto=format&fit=crop'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h3 className="font-extrabold text-lg">{product.name}</h3>
                          <span className="font-black text-primary bg-primary/10 px-2 py-1 rounded-xl text-sm whitespace-nowrap">{product.price} {t('currency')}</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium mb-4 flex-1 line-clamp-2">{product.description}</p>
                        <div className="flex gap-2 mt-auto">
                          <Button variant="outline" className="flex-1 rounded-xl border-primary/20 hover:bg-primary/5" onClick={() => handleProductEdit(product)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>
                          <Button variant="outline" className="flex-1 rounded-xl border-red-500/20 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleProductDelete(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookings" className="space-y-8 mt-4">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3"><Clock className="text-primary" /> {t('dashboard.requests.online')}</h2>
                {appointments.length === 0 ? (
                  <div className="py-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl text-center text-lg font-medium text-muted-foreground shadow-sm">
                    {t('dashboard.requests.empty')}
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {appointments.filter(a => a.status === 'pending' || a.status === 'accepted').map(appt => (
                      <div key={appt.id} className={`group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border ${appt.status === 'pending' ? 'border-primary/50 bg-primary/5' : 'border-white/40 dark:border-slate-800/60'} rounded-3xl p-6 shadow-xl transition-all`}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="w-full md:w-auto">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <Badge className={`px-3 py-1 font-bold uppercase tracking-wider ${appt.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/30' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'}`}>
                                {t(`dashboard.requests.${appt.status === 'pending' ? 'online' : appt.status}`) || appt.status}
                              </Badge>
                              <span className="font-bold text-xl">{appt.customer_name || 'Customer'}</span>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm font-semibold">
                              <div className="bg-white dark:bg-slate-800 px-4 py-2 shadow-sm rounded-xl">{new Date(appt.appointment_date).toLocaleDateString()}</div>
                              <div className="bg-white dark:bg-slate-800 px-4 py-2 shadow-sm rounded-xl">{appt.appointment_time}</div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                              <div className="opacity-90">{t('booking.total')}: {appt.total_price} {t('currency')} • {appt.total_duration} {t('barber.minutes')}</div>
                              <div className="opacity-80">
                                {appt.payment_method === 'pay_now' ? t('dashboard.payment.online') : t('dashboard.payment.salon')}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 w-full md:w-auto min-w-[140px]">
                            {appt.status === 'pending' && (
                              <>
                                <Button onClick={() => updateAppointmentStatus(appt.id, 'accepted')} className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-600/20">
                                  <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} /> {t('dashboard.requests.accept')}
                                </Button>
                                <Button onClick={() => updateAppointmentStatus(appt.id, 'rejected')} variant="destructive" className="rounded-xl shadow-lg shadow-red-600/20">
                                  <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} /> {t('dashboard.requests.reject')}
                                </Button>
                              </>
                            )}
                            {appt.status === 'accepted' && (
                              <Button onClick={() => updateAppointmentStatus(appt.id, 'completed')} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-xl">
                                <Check className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} /> {t('dashboard.requests.complete')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                  <UserPlus className="h-6 w-6 text-primary" /> {t('dashboard.walkin.title')}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">{t('dashboard.walkin.desc')}</p>
                <div className="flex justify-center py-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800">
                  <Button variant="outline" className="rounded-full shadow-sm" size="lg">
                    <Plus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('dashboard.walkin.add')}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-8 mt-4">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-between">
                  <div className="w-full">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-2 w-full justify-center">
                      <QrCode className="h-6 w-6 text-primary" /> {t('dashboard.qr.title')}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-8 text-center">{t('dashboard.qr.desc')}</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] shadow-2xl mb-8 transform transition-all hover:scale-105 hover:shadow-primary/30 border border-slate-100 dark:border-slate-200">
                    {user && barberId && (
                      <QRCodeSVG value={`${window.location.origin}/barber/${barberId}`} size={220} level="H" includeMargin={true} />
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <Input readOnly value={`${window.location.origin}/barber/${barberId}`} className="flex-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl" />
                    <Button variant="secondary" className="rounded-xl shadow-md" onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/barber/${barberId}`);
                      toast({ title: "Copied!", description: "Link copied to clipboard ✓" });
                    }}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-8 shadow-xl flex flex-col">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                      <ImagePlus className="h-6 w-6 text-primary" /> {t('dashboard.gallery.title')}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-8">{t('dashboard.gallery.desc')}</p>
                  </div>
                  <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/50 flex-1 flex flex-col items-center justify-center transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800">
                    <Button variant="outline" size="lg" className="rounded-full shadow-sm">
                      <Plus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('dashboard.gallery.upload')}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="finance" className="space-y-8 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute top-0 right-0 w-2 h-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500/10 rounded-2xl"><TrendingUp className="text-green-600 dark:text-green-400 h-6 w-6" /></div>
                    <h3 className="text-xl font-bold">{t('dashboard.finance.earnings')}</h3>
                  </div>
                  <p className="text-4xl font-black text-green-600 dark:text-green-400">
                    {totalEarnings} {t('currency')}
                  </p>
                </div>

                <div className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute top-0 right-0 w-2 h-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-500/10 rounded-2xl"><TrendingDown className="text-red-500 dark:text-red-400 h-6 w-6" /></div>
                    <h3 className="text-xl font-bold">{t('dashboard.finance.expenses')}</h3>
                  </div>
                  <p className="text-4xl font-black text-red-500 dark:text-red-400">{totalExpenses} {t('currency')}</p>
                </div>

                <div className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute top-0 right-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl"><DollarSign className="text-primary h-6 w-6" /></div>
                    <h3 className="text-xl font-bold">{t('dashboard.finance.profit')}</h3>
                  </div>
                  <p className="text-4xl font-black text-primary">
                    {totalProfit} {t('currency')}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-8 shadow-xl">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><TrendingUp className="text-primary h-6 w-6" /> {t('dashboard.finance.weekly')}</h2>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="revenue" fill="currentColor" radius={[6, 6, 0, 0]} className="fill-primary" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-8 shadow-xl flex flex-col">
                  <h2 className="text-2xl font-bold mb-2">{t('dashboard.finance.add')}</h2>
                  <p className="text-sm text-muted-foreground mb-8">{t('dashboard.finance.expense.desc')}</p>

                  <div className="flex flex-col gap-4 mb-4">
                    <Input value={expenseName} onChange={e => setExpenseName(e.target.value)} placeholder={t('dashboard.finance.expense.name')} className="w-full rounded-xl bg-slate-50/50 dark:bg-slate-800/50 h-12" />
                    <Input value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} type="number" placeholder={t('dashboard.finance.expense.amount')} className="w-full rounded-xl bg-slate-50/50 dark:bg-slate-800/50 h-12" />
                    <Button onClick={handleAddExpense} className="w-full rounded-xl shadow-lg shadow-primary/20 h-12 font-bold mt-2" size="lg"><Plus className="h-5 w-5 mr-2" /> {t('dashboard.finance.add')}</Button>
                  </div>

                  {expenses.length > 0 && (
                    <div className="mt-8 flex-1">
                      <h4 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wider">{t('dashboard.finance.recent')}</h4>
                      <div className="space-y-3">
                        {expenses.slice(0, 3).map(exp => (
                          <div key={exp.id} className="flex justify-between items-center p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl">
                            <span className="font-semibold">{exp.name}</span>
                            <span className="font-bold text-red-500">-{exp.amount} {t('currency')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BarberDashboard;
