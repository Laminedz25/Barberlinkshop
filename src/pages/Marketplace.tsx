import React, { useState, useEffect, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { ShoppingBag, Star, ShieldCheck, Zap, Heart, Search, Filter, ShoppingCart, Trash2, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  category: string;
  image: string;
  description?: string;
  stock?: number;
}

const Marketplace = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const params = useParams();
  const storeId = params.id; // If visiting /store/:id
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [loading, setLoading] = useState(true);

  // SEO
  useEffect(() => {
    document.title = storeId ? `Store | BarberLink` : 'Marketplace | BarberLink - Algeria Premium Grooming';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'Shop top-tier barber tools, care products and salon supplies on BarberLink Marketplace. Free Algerian delivery available.');
  }, [storeId]);

  useEffect(() => {
    const q = storeId 
      ? query(collection(db, 'products'), where('barber_id', '==', storeId), orderBy('name', 'asc'))
      : query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setDbProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const fallbackProducts: Product[] = [
    { id: 'f1', name: 'Premium Beard Oil', brand: 'BarberElite', price: 4500, rating: 4.9, category: 'Care', image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800&auto=format&fit=crop&q=60' },
    { id: 'f2', name: 'Pro Matte Wax', brand: 'GroomMaster', price: 3200, rating: 4.8, category: 'Styling', image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=60' },
    { id: 'f3', name: 'Gold Series Clipper', brand: 'TitanPro', price: 28500, rating: 5.0, category: 'Tools', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop&q=60' },
    { id: 'f4', name: 'Aftershave Mist', brand: 'BarberElite', price: 2800, rating: 4.7, category: 'Care', image: 'https://images.unsplash.com/photo-1605497746444-116035f11105?w=800&auto=format&fit=crop&q=60' },
  ];

  const allProducts = dbProducts.length > 0 ? dbProducts : fallbackProducts;

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchTerm, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast({ title: 'Added to Cart', description: `${product.name} has been added.` });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-32">
        <header className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <Badge variant="outline" className="mb-4 rounded-full px-4 py-1 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] bg-primary/5">
               {storeId ? 'Merchant Store' : (isRTL ? 'المتجر الذكي الصامت' : 'Silent Marketplace')}
           </Badge>
           <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4 scale-in-center">
             {isRTL ? 'مركز الحلاقة الفاخر' : 'Luxury Grooming Hub'}
           </h1>
           <p className="text-muted-foreground font-medium max-w-2xl mx-auto text-lg">
             {isRTL ? 'أدوات ومنتجات متميزة مختارة بعناية بواسطة شبكة الذكاء الاصطناعي لـ BarberLink.' : 'Premium tools and care products curated by the BarberLink AI network.'}
           </p>
           {storeId && (
             <button
               onClick={() => {
                 navigator.clipboard.writeText(window.location.href);
                 toast({ title: isRTL ? 'تم النسخ!' : 'Link Copied!', description: isRTL ? 'ارفق رابط متجرك في إعلانات الفيسبوك أو انستغرام الآن!' : 'Paste your store link in Facebook, TikTok, or Instagram ads now!' });
               }}
               className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full border border-primary/30 text-primary text-sm font-bold hover:bg-primary/10 transition-all"
             >
               <Share2 className="w-4 h-4" /> {isRTL ? 'شارك رابط متجرك' : 'Share Store Link for Ads'}
             </button>
           )}
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
           {/* Sidebar / Filters */}
           <aside className="w-full lg:w-72 space-y-8 sticky top-32 h-fit">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input 
                   className="pl-12 h-16 rounded-[1.5rem] border-none shadow-sm bg-white font-bold text-lg focus:ring-2 focus:ring-primary/20 transition-all" 
                   placeholder={isRTL ? 'البحث عن منتجات...' : 'Search products...'}
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>

              <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                 <h3 className="font-black uppercase text-xs tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Filter className="w-3 h-3" /> {isRTL ? 'الفئات' : 'Categories'}
                 </h3>
                 <div className="space-y-1">
                    {['All', 'Care', 'Styling', 'Tools', 'Kits'].map(cat => (
                       <button 
                         key={cat} 
                         onClick={() => setSelectedCategory(cat)}
                         className={`flex items-center justify-between w-full p-3 rounded-2xl text-sm font-black transition-all ${
                           selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'
                         }`}
                       >
                          {cat} {selectedCategory === cat && <Check className="w-4 h-4" />}
                       </button>
                    ))}
                 </div>
              </div>

              {/* SILENT AI AD COMPONENT */}
              <div className="p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-primary/30 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-primary/50 transition-all duration-700" />
                 <div className="relative z-10">
                    <Zap className="w-10 h-10 text-primary mb-6 fill-primary animate-pulse" />
                    <h4 className="text-2xl font-black tracking-tight leading-tight mb-3">AI SUGGESTION</h4>
                    <p className="text-xs text-white/60 font-medium mb-8 leading-relaxed italic">
                      "Based on your platform behavior, we suggest these tools to elevate your professional craft."
                    </p>
                    <Button className="w-full h-12 rounded-2xl bg-white text-slate-900 font-black text-xs hover:bg-white/90 group/btn shadow-xl transition-all">
                      VIEW RECOMMENDATION <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                 </div>
              </div>
           </aside>

           {/* Product Grid */}
           <section className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {filteredProducts.map((product, idx) => (
                    <Card key={product.id} className="group border-none shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 rounded-[3rem] overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                       <div className="aspect-[4/5] relative overflow-hidden">
                          <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute top-6 right-6">
                             <Button size="icon" variant="secondary" className="rounded-full bg-white/90 backdrop-blur-md shadow-lg border-none hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12">
                                <Heart className="w-4 h-4" />
                             </Button>
                          </div>
                          <Badge className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur-md text-white font-bold border-none px-4 py-1.5 uppercase text-[10px] tracking-widest rounded-full">
                             {product.brand}
                          </Badge>
                       </div>
                       <CardContent className="p-8">
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">{product.name}</h3>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{product.category}</span>
                             </div>
                             <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full text-amber-500 font-black text-xs border border-amber-100">
                                <Star className="w-3 h-3 fill-amber-500" /> {product.rating}
                             </div>
                          </div>
                          <div className="flex items-center justify-between mt-8">
                             <div className="space-y-0.5">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{isRTL ? 'السعر' : 'Price'}</span>
                                <p className="text-3xl font-black text-slate-900 leading-none">
                                  {product.price.toLocaleString()} <span className="text-xs text-primary">{isRTL ? 'د.ج' : 'DZD'}</span>
                                </p>
                             </div>
                             <Button 
                               onClick={() => addToCart(product)}
                               className="w-14 h-14 rounded-3xl shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                             >
                                <ShoppingCart className="w-6 h-6" />
                             </Button>
                          </div>
                       </CardContent>
                    </Card>
                 ))}
              </div>
           </section>
        </div>
      </main>

      {/* ─── SHOPPING CART NODE ─── */}
      <div className="fixed bottom-10 right-10 z-[70] md:bottom-20 md:right-20">
         <Sheet>
            <SheetTrigger asChild>
               <Button className="h-20 w-20 rounded-full shadow-[0_20px_50px_-10px_rgba(37,99,235,0.5)] bg-slate-900 text-white relative hover:scale-110 transition-all border-4 border-white">
                  <ShoppingBag className="h-8 w-8" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black h-7 w-7 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                        {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  )}
               </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-white border-l-0 rounded-l-[3rem] p-0 flex flex-col shadow-2xl">
               <SheetHeader className="p-8 pb-4 border-b">
                  <SheetTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-primary" /> {isRTL ? 'حقيبة التسوق' : 'Shopping Bag'}
                  </SheetTitle>
               </SheetHeader>
               
               <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                        <ShoppingCart className="w-20 h-20 stroke-[1.5]" />
                        <p className="font-black uppercase tracking-widest text-sm">{isRTL ? 'حقيبتك فارغة' : 'Your bag is empty'}</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.product.id} className="flex gap-4 items-center animate-in slide-in-from-right-4">
                        <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-sm">
                           <img src={item.product.image} alt={item.product.name || 'Product Image'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                           <h4 className="font-black text-sm uppercase tracking-tight">{item.product.name}</h4>
                           <p className="text-xs text-muted-foreground font-bold mb-2">{item.product.brand}</p>
                           <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-primary">{item.product.price} DZD</span>
                              <span className="text-[10px] font-bold text-muted-foreground">x{item.quantity}</span>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
               </div>

               {cart.length > 0 && (
                 <SheetFooter className="p-8 bg-slate-50 mt-auto border-t flex-col sm:flex-col space-y-6">
                    <div className="w-full space-y-3">
                        <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                           <span>SUBTOTAL</span>
                           <span>{totalAmount} DZD</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                           <span>ESTIMATED DELIVERY</span>
                           <span className="text-primary tracking-widest uppercase">FREE ON ORDERS {'>'} 10k</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-black pt-3 border-t border-slate-200">
                           <span className="tracking-tighter uppercase">Total</span>
                           <span className="text-primary">{totalAmount.toLocaleString()} DZD</span>
                        </div>
                    </div>
                    <Button 
                      className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-black text-white font-black text-sm shadow-2xl flex items-center justify-center gap-3"
                      onClick={() => {
                        const message = `Order details:\n${cart.map(i => `- ${i.product.name} (x${i.quantity})`).join('\n')}\nTotal: ${totalAmount} DZD`;
                        window.open(`https://wa.me/213000000000?text=${encodeURIComponent(message)}`);
                      }}
                    >
                      {isRTL ? 'إتمام الطلب عبر WhatsApp' : 'Checkout via WhatsApp'} <ChevronRight className="w-5 h-5" />
                    </Button>
                 </SheetFooter>
               )}
            </SheetContent>
         </Sheet>
      </div>
    </div>
  );
};

export default Marketplace;
