import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles, Star, Store, TrendingUp, Zap, ShieldCheck, BarChart3, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useCurrency } from '@/hooks/useCurrency';

export default function PricingPlans() {
    const { t, isRTL } = useLanguage();
    const { toast } = useToast();
    const { formatPrice, isAlgeria } = useCurrency();

    const [prices, setPrices] = useState({ basic: '1000', pro: '2500', premium: '4500' });

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const docRef = doc(db, 'system', 'settings');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().prices) {
                    const data = docSnap.data().prices;
                    setPrices({
                        basic: data.basic ? String(data.basic) : '1000',
                        pro: data.pro ? String(data.pro) : '2500',
                        premium: data.premium ? String(data.premium) : '4500'
                    });
                }
            } catch (err) {
                console.error("Error fetching dynamic pricing", err);
            }
        };
        fetchPricing();
    }, []);

    const plans = [
        {
            name: t('pricing.free.name'),
            desc: t('pricing.free.desc'),
            price: "Free",
            icon: <Star className="h-6 w-6 text-slate-400" />,
            color: "border-slate-200 dark:border-slate-800",
            btnClass: "bg-slate-800 hover:bg-slate-900 text-white",
            features: [
                t('pricing.features.basic'),
                t('pricing.features.bookings.limit'),
                t('pricing.features.whatsapp'),
                t('pricing.features.search')
            ],
            notIncluded: [
                t('pricing.not.analytics'),
                t('pricing.not.ranking'),
                t('pricing.not.staff')
            ]
        },
        {
            name: t('pricing.pro.name'),
            desc: t('pricing.pro.desc'),
            price: formatPrice(prices.pro, '25'),
            icon: <Zap className="h-6 w-6 text-primary" />,
            color: "border-primary/50 shadow-primary/10 scale-105 z-10",
            btnClass: "bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20",
            isPopular: true,
            features: [
                t('pricing.features.bookings.unlimit'),
                t('pricing.features.analytics'),
                t('pricing.features.store'),
                t('pricing.features.staff3'),
                t('pricing.features.notifications')
            ],
            notIncluded: [t('pricing.not.ranking')]
        },
        {
            name: t('pricing.premium.name'),
            desc: t('pricing.premium.desc'),
            price: formatPrice(prices.premium, '49'),
            icon: <ShieldCheck className="h-6 w-6 text-yellow-500" />,
            color: "border-yellow-500/30",
            btnClass: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-xl shadow-yellow-500/20",
            features: [
                t('pricing.features.ranking'),
                t('pricing.features.badge'),
                t('pricing.features.staff.unlimit'),
                t('pricing.features.manager'),
                t('pricing.features.seo')
            ]
        }
    ];

    return (
        <section className="py-32 bg-slate-50 dark:bg-slate-950 relative overflow-hidden" id="pricing">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
                    <Badge text={t('pricing.trial')} />
                    <h2 className="text-5xl md:text-7xl font-black mt-8 mb-6 tracking-tighter leading-none">
                        {t('pricing.title').split(' ').map((word, i) => (
                          <span key={i} className={i === 2 ? 'text-primary block md:inline' : ''}>{word} </span>
                        ))}
                    </h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
                        {t('pricing.subtitle')}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
                    {plans.map((plan, i) => (
                        <Card key={i} className={`relative bg-white dark:bg-slate-900 rounded-[3.5rem] border-2 ${plan.color} p-12 transition-all hover:shadow-2xl flex flex-col group`}>
                            {plan.isPopular && (
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white px-8 py-3 rounded-full font-black shadow-2xl flex items-center gap-2 text-xs uppercase tracking-widest animate-bounce">
                                    <Sparkles className="h-4 w-4" /> {t('grid.title.highlight')}
                                </div>
                            )}

                            <div className="mb-10">
                                <div className={`p-5 rounded-[2rem] w-max mb-8 transition-transform group-hover:rotate-12 duration-500 bg-slate-50 dark:bg-slate-800`}>
                                    {plan.icon}
                                </div>
                                <h3 className="text-3xl font-black mb-3 tracking-tighter">{plan.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest">{plan.desc}</p>
                            </div>

                            <div className="mb-10 flex items-baseline gap-3">
                                <span className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white">{plan.price}</span>
                                {plan.price !== 'Free' && (
                                    <span className="text-slate-400 font-black text-sm uppercase tracking-widest">{t('pricing.month')}</span>
                                )}
                            </div>

                            <div className="space-y-5 mb-12 flex-1">
                                {plan.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group/item">
                                        <div className="bg-primary/10 p-1.5 rounded-full shrink-0 group-hover/item:bg-primary/20 transition-colors">
                                            <Check className="h-4 w-4 text-primary stroke-[4]" />
                                        </div>
                                        <span className="font-bold text-slate-600 dark:text-slate-300 text-base">{feat}</span>
                                    </div>
                                ))}
                                {plan.notIncluded?.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-4 opacity-30">
                                        <div className="bg-slate-200 dark:bg-slate-800 p-1.5 rounded-full shrink-0">
                                            <div className="h-4 w-4 border-2 border-slate-400 rounded-full" />
                                        </div>
                                        <span className="font-bold text-slate-400 line-through text-base">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Button 
                                className={`w-full rounded-[2rem] h-20 text-xl font-black transition-all hover:scale-[1.05] active:scale-[0.95] shadow-2xl ${plan.btnClass}`}
                                onClick={() => window.location.href = '/auth'}
                            >
                                {t('pricing.cta')}
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Badge({ text }: { text: string }) {
    return (
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary shadow-sm">
            {text}
        </div>
    );
}

