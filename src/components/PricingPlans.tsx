import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles, Star, Store, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PricingPlans() {
    const { t, isRTL } = useLanguage();
    const { toast } = useToast();

    const handleSubscribe = (planName: string) => {
        toast({
            title: t('store.comingsoon'),
            description: `Subscription for ${planName} will be available in the next release! Enjoy your 1-month free trial.`,
            variant: 'default',
        });
    };

    const [prices, setPrices] = useState({ basic: '1000', pro: '1500', premium: '2000' });

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const docRef = doc(db, 'system', 'settings');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().prices) {
                    const data = docSnap.data().prices;
                    setPrices({
                        basic: data.basic ? String(data.basic) : '1000',
                        pro: data.pro ? String(data.pro) : '1500',
                        premium: data.premium ? String(data.premium) : '2000'
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
            name: t('pricing.basic.name'),
            desc: t('pricing.basic.desc'),
            price: prices.basic,
            icon: <Star className="h-6 w-6 text-blue-500" />,
            color: "from-blue-500/20 to-transparent border-blue-500/20",
            btnClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 text-white",
            features: [
                t('pricing.basic.f1'),
                t('pricing.basic.f2'),
                t('pricing.basic.f3'),
            ]
        },
        {
            name: t('pricing.pro.name'),
            desc: t('pricing.pro.desc'),
            price: prices.pro,
            icon: <Store className="h-6 w-6 text-primary" />,
            color: "from-primary/20 to-primary/5 border-primary/50",
            btnClass: "bg-primary hover:bg-primary/90 shadow-primary/30 text-white",
            isPopular: true,
            features: [
                t('pricing.pro.f1'),
                <span className="font-bold text-primary">{t('pricing.pro.f2')}</span>,
                <span className="font-bold text-primary">{t('pricing.pro.f3')}</span>,
                t('pricing.pro.f4'),
            ]
        },
        {
            name: t('pricing.premium.name'),
            desc: t('pricing.premium.desc'),
            price: prices.premium,
            icon: <TrendingUp className="h-6 w-6 text-yellow-500" />,
            color: "from-yellow-500/20 to-transparent border-yellow-500/20",
            btnClass: "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20 text-white",
            features: [
                t('pricing.premium.f1'),
                <span className="font-bold text-yellow-600 dark:text-yellow-400">{t('pricing.premium.f2')}</span>,
                t('pricing.premium.f3'),
                t('pricing.premium.f4'),
            ]
        }
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            {/* Decorative Lights */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <Badge text={t('pricing.title')} />
                    <h2 className="text-4xl md:text-5xl font-black mt-6 mb-4">{t('pricing.title')}</h2>
                    <p className="text-xl text-muted-foreground font-medium">
                        {t('pricing.subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <Card key={i} className={`relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] border ${plan.color} p-8 shadow-2xl transition-transform hover:-translate-y-2 flex flex-col`}>
                            {plan.isPopular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-1.5 rounded-full font-bold shadow-lg shadow-primary/30 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl w-max shadow-sm mb-6 border border-slate-100 dark:border-slate-700">
                                    {plan.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-muted-foreground min-h-[48px]">{plan.desc}</p>
                            </div>

                            <div className="mb-8 flex items-end gap-2">
                                <span className="text-5xl font-black">{plan.price}</span>
                                <div className="flex flex-col pb-1">
                                    <span className="font-bold text-lg">{t('pricing.dzd')}</span>
                                    <span className="text-muted-foreground text-sm font-medium">{t('pricing.month')}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feat, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <div className="bg-green-500/10 p-1 rounded-full shrink-0">
                                            <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                                        </div>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button className={`w-full rounded-full h-14 text-lg font-bold shadow-lg transition-all ${plan.btnClass}`} onClick={() => handleSubscribe(plan.name as string)}>
                                {t('pricing.button.start')}
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
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary shadow-sm drop-shadow-sm transition-colors hover:bg-primary/20">
            {text}
        </div>
    );
}
