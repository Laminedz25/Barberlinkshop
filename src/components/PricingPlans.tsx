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
            name: "Starter",
            desc: "For newly opened salons",
            price: "Free",
            icon: <Star className="h-6 w-6 text-slate-400" />,
            color: "border-slate-200 dark:border-slate-800",
            btnClass: "bg-slate-800 hover:bg-slate-900 text-white",
            features: [
                "Basic Profile",
                "Up to 50 Bookings/mo",
                "WhatsApp Integration",
                "Standard Search Result"
            ],
            notIncluded: ["No Analytics", "No Ranking Boost", "No Multiple Staff"]
        },
        {
            name: "Pro Professional",
            desc: "Most Popular for growing businesses",
            price: formatPrice(prices.pro, '25'),
            icon: <Zap className="h-6 w-6 text-primary" />,
            color: "border-primary/50 shadow-primary/10 scale-105 z-10",
            btnClass: "bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20",
            isPopular: true,
            features: [
                "Everything in Starter",
                "Unlimited Bookings",
                <span className="font-bold text-primary">Advanced Analytics</span>,
                "Showcase Store Products",
                "Staff Management (3 Chairs)",
                "Email Notifications"
            ],
            notIncluded: ["Standard Search Ranking"]
        },
        {
            name: "Ultimate Premium",
            desc: "Dominate your local market",
            price: formatPrice(prices.premium, '49'),
            icon: <ShieldCheck className="h-6 w-6 text-yellow-500" />,
            color: "border-yellow-500/30",
            btnClass: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-xl shadow-yellow-500/20",
            features: [
                "Everything in Pro",
                <span className="font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Top-of-Search Ranking Boost</span>,
                "VIP Profile Badge",
                "Unlimited Staff/Chairs",
                "Dedicated Account Manager",
                "Custom SEO for Profile"
            ]
        }
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden" id="pricing">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <Badge text="Flexible Plans" />
                    <h2 className="text-4xl md:text-6xl font-black mt-6 mb-4 tracking-tighter">
                        Empower Your <span className="text-primary">Business</span>
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium">
                        Choose the plan that fits your salon size. Scale as you grow with local DZD support.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-4 bg-white dark:bg-slate-900 w-max mx-auto p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-green-600 bg-green-500/10 px-3 py-1 rounded-lg">
                           <Clock className="w-4 h-4" /> 30-Day Free Trial on all Pro/Premium plans
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, i) => (
                        <Card key={i} className={`relative bg-white dark:bg-slate-900 rounded-[3rem] border-2 ${plan.color} p-10 transition-all hover:shadow-2xl flex flex-col`}>
                            {plan.isPopular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full font-black shadow-xl flex items-center gap-2 text-sm uppercase tracking-widest">
                                    <Sparkles className="h-4 w-4" /> Recommended
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] w-max mb-6">
                                    {plan.icon}
                                </div>
                                <h3 className="text-3xl font-black mb-2 tracking-tight">{plan.name}</h3>
                                <p className="text-muted-foreground font-medium">{plan.desc}</p>
                            </div>

                            <div className="mb-8 flex items-baseline gap-2">
                                <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                                {plan.price !== 'Free' && (
                                    <span className="text-muted-foreground font-bold text-lg">/month</span>
                                )}
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="bg-green-500/15 p-1 rounded-full shrink-0">
                                            <Check className="h-4 w-4 text-green-600 dark:text-green-400 stroke-[3]" />
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-slate-300 text-base">{feat}</span>
                                    </div>
                                ))}
                                {plan.notIncluded?.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-3 opacity-40">
                                        <div className="bg-slate-200 p-1 rounded-full shrink-0">
                                            <div className="h-4 w-4 border-2 border-slate-400 rounded-full" />
                                        </div>
                                        <span className="font-bold text-slate-500 line-through text-base">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Button 
                                className={`w-full rounded-[1.5rem] h-16 text-lg font-black transition-transform hover:scale-[1.02] active:scale-[0.98] ${plan.btnClass}`}
                                onClick={() => window.location.href = '/auth'}
                            >
                                Get Started Now
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

