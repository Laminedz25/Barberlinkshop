import { useState, useEffect } from 'react';
import { onSnapshot, collection, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles, Star, TrendingUp, Zap, Globe } from 'lucide-react';
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

export default function PricingPlans() {
    const { t, currency, setCurrency } = useLanguage();
    const { config } = useSystemConfig();
    const { toast } = useToast();
    const [dbPlans, setDbPlans] = useState<SubscriptionPlan[]>([]);

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

    const handleSubscribe = (planName: string) => {
        toast({
            title: t('store.comingsoon'),
            description: `Subscription for ${planName} will be available in the next release! Enjoy your 1-month free trial.`,
            variant: 'default',
        });
    };

    const getPrice = (plan: SubscriptionPlan) => {
        if (currency === 'USD') return plan.price_usd;
        return plan.price_dzd;
    };

    const dzdBase = config?.global_pricing?.dzd || 1000;
    const usdBase = config?.global_pricing?.usa || 10;

    const fallbackPlans: SubscriptionPlan[] = [
        {
            id: 'basic',
            name: t('pricing.basic.name'),
            desc: t('pricing.basic.desc'),
            price_dzd: dzdBase,
            price_usd: usdBase,
            icon: <Star className="h-6 w-6 text-blue-500" />,
            color: "from-blue-500/10 to-transparent border-blue-500/20",
            features: [t('pricing.basic.f1'), t('pricing.basic.f2'), t('pricing.basic.f3')],
            btnVariant: 'outline'
        },
        {
            id: 'pro',
            name: t('pricing.pro.name'),
            desc: t('pricing.pro.desc'),
            price_dzd: Math.round(dzdBase * 2.5),
            price_usd: Math.round(usdBase * 2.5),
            icon: <Zap className="h-6 w-6 text-primary" />,
            color: "from-primary/20 to-primary/5 border-primary/40 shadow-primary/20",
            isPopular: true,
            features: [t('pricing.pro.f1'), t('pricing.pro.f2'), t('pricing.pro.f3'), t('pricing.pro.f4')],
            btnVariant: 'default'
        },
        {
            id: 'premium',
            name: t('pricing.premium.name'),
            desc: t('pricing.premium.desc'),
            price_dzd: dzdBase * 5,
            price_usd: usdBase * 5,
            icon: <TrendingUp className="h-6 w-6 text-amber-500" />,
            color: "from-amber-500/10 to-transparent border-amber-500/20",
            features: [t('pricing.premium.f1'), t('pricing.premium.f2'), t('pricing.premium.f3'), t('pricing.premium.f4')],
            btnVariant: 'outline'
        }
    ];

    const activePlans = fallbackPlans.map(fallback => {
        const dbPlan = dbPlans.find(p => p.id === fallback.id);
        if (dbPlan) {
            return {
                ...fallback,
                ...dbPlan,
                // Ensure features are merged or overridden correctly
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
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 font-bold text-xs text-primary uppercase tracking-widest animate-slide-up">
                        <Globe className="w-3 h-3" /> Scale Globally
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter animate-slide-up animation-delay-100">
                        Invest in your <span className="text-primary">Success</span>
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium animate-slide-up animation-delay-200">
                        {t('pricing.subtitle')}
                    </p>

                    <div className="flex justify-center mt-10 animate-slide-up animation-delay-300">
                        <div className="p-1 bg-muted rounded-2xl flex border border-border shadow-sm">
                            <button 
                                onClick={() => setCurrency('DZD')}
                                className={`px-8 py-2.5 rounded-xl font-bold transition-all ${currency === 'DZD' ? 'bg-background text-primary shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                DZD (Algeria)
                            </button>
                            <button 
                                onClick={() => setCurrency('USD')}
                                className={`px-8 py-2.5 rounded-xl font-bold transition-all ${currency === 'USD' ? 'bg-background text-primary shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                USD (Global)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {activePlans.map((plan, i) => (
                        <Card 
                            key={plan.id} 
                            className={`group relative flex flex-col p-10 bg-card/40 backdrop-blur-xl rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${plan.color || (i === 1 ? "from-primary/20 to-primary/5 border-primary/40 shadow-primary/20" : "from-blue-500/10 to-transparent border-blue-500/20")} ${i === 1 ? 'animate-slide-up animation-delay-200 lg:scale-105 z-20' : 'animate-slide-up animation-delay-100'}`}
                        >
                            {(plan.isPopular || i === 1) && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full font-black text-sm shadow-xl shadow-primary/40 flex items-center gap-2 animate-bounce-subtle">
                                    <Sparkles className="h-4 w-4" /> MOST POPULAR
                                </div>
                            )}

                            <div className="mb-10">
                                <div className="p-4 bg-background border rounded-2xl w-max shadow-sm mb-8">
                                    {plan.icon || (i === 1 ? <Zap className="h-6 w-6 text-primary" /> : <Star className="h-6 w-6 text-blue-500" />)}
                                </div>
                                <h3 className="text-3xl font-black mb-3">{plan.name}</h3>
                                <p className="text-muted-foreground font-medium text-lg leading-relaxed">{plan.desc || t('pricing.pro.desc')}</p>
                            </div>

                            <div className="mb-12 flex items-baseline gap-2">
                                <span className="text-6xl font-black tracking-tighter decoration-primary underline-offset-8">
                                    {getPrice(plan)}
                                </span>
                                <div className="flex flex-col">
                                    <span className="font-black text-xl text-primary">{currency}</span>
                                    <span className="text-muted-foreground font-bold text-sm">{t('pricing.month')}</span>
                                </div>
                            </div>

                            <div className="space-y-5 mb-12 flex-1">
                                {plan.features.map((feat: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="mt-1 bg-primary/10 p-1 rounded-full border border-primary/20">
                                            <Check className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-semibold text-foreground/80 leading-tight">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Button 
                                variant={plan.btnVariant || (i === 1 ? 'default' : 'outline')}
                                className={`w-full h-16 rounded-[1.25rem] text-lg font-black transition-all ${(plan.btnVariant || (i === 1 ? 'default' : 'outline')) === 'default' ? 'shadow-xl shadow-primary/30' : 'hover:bg-primary/5'}`}
                                onClick={() => handleSubscribe(plan.name)}
                            >
                                {t('pricing.button.start')}
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
