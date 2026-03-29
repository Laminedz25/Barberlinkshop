import { useState, useEffect } from 'react';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles, Star, TrendingUp, Zap, Globe, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSystemConfig } from '@/hooks/useSystemConfig';

interface SubscriptionPlan {
    id: string;
    name: string;
    desc?: string;
    price_dzd: number;
    price_usd: number;
    features: string[];
    icon?: React.ReactNode;
    color?: string;
    isPopular?: boolean;
    btnVariant?: 'default' | 'outline';
}

type BillingInterval = 1 | 3 | 6 | 12;

export default function PricingPlans() {
    const { t, currency, setCurrency, isRTL } = useLanguage();
    const { config } = useSystemConfig();
    const { toast } = useToast();
    const [dbPlans, setDbPlans] = useState<SubscriptionPlan[]>([]);
    const [interval, setInterval] = useState<BillingInterval>(1);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'subscriptions'), (snap) => {
            const plansData = snap.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            })) as SubscriptionPlan[];
            setDbPlans(plansData);
        });
        return () => unsub();
    }, []);

    const getDiscount = (months: number) => {
        if (months === 3) return 0.15; // 15% Off
        if (months === 6) return 0.25; // 25% Off
        if (months === 12) return 0.40; // 40% Off
        return 0;
    };

    const handleSubscribe = (planName: string) => {
        const monthsText = interval === 1 ? 'month' : `${interval} months`;
        toast({
            title: isRTL ? 'بدء الإعداد' : 'Initializing Setup',
            description: isRTL 
                ? `جاري تحضير اشتراكك لـ ${planName} لمدة ${interval} أشهر. استمتع بفترة تجريبية مجانية!` 
                : `Preparing your ${planName} plan for ${monthsText}. Enjoy your automated trial!`,
            variant: 'default',
        });
    };

    const getPrice = (plan: SubscriptionPlan) => {
        const base = currency === 'USD' ? plan.price_usd : plan.price_dzd;
        const totalBase = base * interval;
        const discount = getDiscount(interval);
        const final = Math.round(totalBase * (1 - discount));
        return final;
    };

    const dzdBase = config?.global_pricing?.dzd || 1000;
    const usdBase = config?.global_pricing?.usa || 10;

    const fallbackPlans: SubscriptionPlan[] = [
        {
            id: 'basic',
            name: isRTL ? 'الأساسية' : 'Standard Starter',
            desc: isRTL ? 'مثالية للبدء والتواجد على الخريطة الذكية.' : 'Perfect for getting your barbershop on the map.',
            price_dzd: dzdBase,
            price_usd: usdBase,
            icon: <Star className="h-6 w-6 text-blue-500" />,
            color: "from-blue-500/10 to-transparent border-blue-500/20",
            features: isRTL ? ['حجوزات قياسية غير محدودة', 'ظهور في الخريطة والتطبيق', 'تلقي التقييمات'] : ['Unlimited Standard Bookings', 'Global App Visibility', 'Receive Client Reviews'],
            btnVariant: 'outline'
        },
        {
            id: 'pro',
            name: isRTL ? 'احترافي بلس' : 'Professional Plus',
            desc: isRTL ? 'أدوات ذكية بالذكاء الاصطناعي لزيادة أرباحك.' : 'AI-powered tools to maximize your revenue.',
            price_dzd: Math.round(dzdBase * 2.5),
            price_usd: Math.round(usdBase * 2.5),
            icon: <Zap className="h-6 w-6 text-primary" />,
            color: "from-primary/20 to-primary/5 border-primary/40 shadow-primary/20",
            isPopular: true,
            features: isRTL ? ['مساعد الذكاء الاصطناعي (AI Stylist)', 'محفظة أعمال احترافية وحسابات تواصل', 'نظام "الحلاق المفضل"', 'أولوية في نتائج الحجز (SEO)'] : ['AI Assistant (Stylist)', 'Pro Portfolio & Social Integrations', 'Favorite Barber Feature', 'Booking Priority (SEO)'],
            btnVariant: 'default'
        },
        {
            id: 'premium',
            name: isRTL ? 'نخبة الأعمال' : 'Elite Enterprise',
            desc: isRTL ? 'إدارة كاملة للمستثمرين وأصحاب الصالونات المتعددة.' : 'Full management for investors & multiple salons.',
            price_dzd: dzdBase * 5,
            price_usd: usdBase * 5,
            icon: <TrendingUp className="h-6 w-6 text-amber-500" />,
            color: "from-amber-500/10 to-transparent border-amber-500/20",
            features: isRTL ? ['وكيل صيانة البيانات المستقل (AI)', 'لوحة تحكم استثمارية متقدمة', 'دردشة مالية وتسويق بالعمولة', 'دعم وحماية أمنية 24/7'] : ['Autonomous Database Agent', 'Investor Advanced Dashboard', 'Financial Chat & Affiliates', '24/7 Premium Security Support'],
            btnVariant: 'outline'
        }
    ];

    const activePlans = fallbackPlans.map(fallback => {
        const dbPlan = dbPlans.find(p => p.id === fallback.id);
        if (dbPlan) {
            return {
                ...fallback,
                ...dbPlan,
                features: dbPlan.features && dbPlan.features.length > 0 ? dbPlan.features : fallback.features
            };
        }
        return fallback;
    });

    return (
        <section className="py-32 bg-background relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 font-bold text-xs text-primary uppercase tracking-widest">
                        <Globe className="w-3 h-3" /> Scale Globally
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
                        {isRTL ? 'استثمر في ' : 'Invest in your '}<span className="text-primary">{isRTL ? 'نجاحك' : 'Success'}</span>
                    </h2>
                    
                    {/* Interval Selector */}
                    <div className="flex flex-col items-center gap-8 mt-12 w-full">
                        <div className="p-1.5 bg-muted/50 backdrop-blur-md rounded-2xl flex flex-wrap md:flex-nowrap justify-center gap-2 border border-border shadow-inner w-full max-w-2xl">
                            {[1, 3, 6, 12].map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => setInterval(m as BillingInterval)}
                                    className={`relative px-6 py-3 rounded-xl font-black text-xs transition-all uppercase tracking-widest flex flex-col items-center gap-1 ${interval === m ? 'bg-background text-primary shadow-xl ring-1 ring-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {m === 1 ? (isRTL ? 'شهري' : 'Monthly') : `${m} ${isRTL ? 'أشهر' : 'Months'}`}
                                    {getDiscount(m) > 0 && (
                                        <Badge className="bg-green-500 text-white border-none py-0 px-1.5 text-[8px] animate-pulse">
                                            -{getDiscount(m) * 100}%
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setCurrency('DZD')}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${currency === 'DZD' ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}
                            >
                                DZD
                            </button>
                            <button 
                                onClick={() => setCurrency('USD')}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${currency === 'USD' ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}
                            >
                                USD
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {activePlans.map((plan, i) => (
                        <Card 
                            key={plan.id} 
                            className={`group relative flex flex-col p-10 bg-card/40 backdrop-blur-xl rounded-[3rem] border transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] ${plan.color || (i === 1 ? "from-primary/20 to-primary/5 border-primary/40" : "from-blue-500/10 to-transparent border-blue-500/20")} ${i === 1 ? 'lg:scale-105 z-20 shadow-2xl shadow-primary/10' : 'opacity-90 hover:opacity-100'}`}
                        >
                            {(plan.isPopular || i === 1) && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-8 py-2.5 rounded-full font-black text-[10px] tracking-[0.2em] shadow-2xl shadow-primary/40 flex items-center gap-2">
                                    <Sparkles className="h-3 w-3 fill-white" /> {isRTL ? 'الأكثر طلباً' : 'MOST POPULAR'}
                                </div>
                            )}

                            <div className="mb-10 text-center lg:text-left">
                                <div className="p-5 bg-background border rounded-[1.5rem] w-max shadow-sm mb-8 mx-auto lg:mx-0">
                                    {plan.icon || (i === 1 ? <Zap className="h-8 w-8 text-primary fill-primary" /> : <Star className="h-8 w-8 text-blue-500" />)}
                                </div>
                                <h3 className="text-4xl font-black mb-4 tracking-tighter uppercase">{plan.name}</h3>
                                <p className="text-muted-foreground font-medium text-lg leading-relaxed">{plan.desc || t('pricing.pro.desc')}</p>
                            </div>

                            <div className="mb-12 flex items-baseline gap-3 justify-center lg:justify-start">
                                <span className="text-7xl font-black tracking-tighter text-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {getPrice(plan).toLocaleString()}
                                </span>
                                <div className="flex flex-col">
                                    <span className="font-black text-2xl text-primary">{currency}</span>
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block mt-1">
                                        / {interval === 1 ? (isRTL ? 'شهري' : 'Month') : `${interval} ${isRTL ? 'أشهر' : 'Months'}`}
                                    </span>
                                </div>
                            </div>

                            {getDiscount(interval) > 0 && (
                                <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-between">
                                    <span className="text-xs font-black text-green-700 uppercase tracking-widest">{isRTL ? 'توفير ذكي' : 'SMART SAVINGS'}</span>
                                    <Badge className="bg-green-600 text-white border-none font-black">-{getDiscount(interval) * 100}% {isRTL ? 'خصم' : 'OFF'}</Badge>
                                </div>
                            )}

                            <div className="space-y-6 mb-12 flex-1">
                                {plan.features.map((feat: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="mt-1 bg-primary/10 p-1 rounded-full border border-primary/20 shrink-0">
                                            <Check className="h-3 w-3 text-primary stroke-[3px]" />
                                        </div>
                                        <span className="font-bold text-slate-700 leading-tight">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Button 
                                variant={plan.btnVariant || (i === 1 ? 'default' : 'outline')}
                                className={`w-full h-20 rounded-[1.75rem] text-xl font-black transition-all group/btn ${(plan.btnVariant || (i === 1 ? 'default' : 'outline')) === 'default' ? 'shadow-2xl shadow-primary/20 hover:scale-105' : 'hover:bg-primary/5 hover:border-primary/40'}`}
                                onClick={() => handleSubscribe(plan.name)}
                            >
                                {t('pricing.button.start')} <CalendarDays className="ml-3 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${className}`}>
        {children}
    </span>
);
