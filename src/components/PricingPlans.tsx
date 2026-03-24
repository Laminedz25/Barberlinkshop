import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles, Star, Store, TrendingUp, Zap, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function PricingPlans() {
    const { t, currency, setCurrency } = useLanguage();
    const { toast } = useToast();

    const handleSubscribe = (planName: string) => {
        toast({
            title: t('store.comingsoon'),
            description: `Subscription for ${planName} will be available in the next release! Enjoy your 1-month free trial.`,
            variant: 'default',
        });
    };

    const plans = [
        {
            id: 'basic',
            name: t('pricing.basic.name'),
            desc: t('pricing.basic.desc'),
            price: currency === 'USD' ? '10' : '1000',
            icon: <Star className="h-6 w-6 text-blue-500" />,
            color: "from-blue-500/10 to-transparent border-blue-500/20",
            features: [t('pricing.basic.f1'), t('pricing.basic.f2'), t('pricing.basic.f3')],
            btnVariant: 'outline' as const
        },
        {
            id: 'pro',
            name: t('pricing.pro.name'),
            desc: t('pricing.pro.desc'),
            price: currency === 'USD' ? '25' : '2500',
            icon: <Zap className="h-6 w-6 text-primary" />,
            color: "from-primary/20 to-primary/5 border-primary/40 shadow-primary/20",
            isPopular: true,
            features: [t('pricing.pro.f1'), t('pricing.pro.f2'), t('pricing.pro.f3'), t('pricing.pro.f4')],
            btnVariant: 'default' as const
        },
        {
            id: 'premium',
            name: t('pricing.premium.name'),
            desc: t('pricing.premium.desc'),
            price: currency === 'USD' ? '50' : '5000',
            icon: <TrendingUp className="h-6 w-6 text-amber-500" />,
            color: "from-amber-500/10 to-transparent border-amber-500/20",
            features: [t('pricing.premium.f1'), t('pricing.premium.f2'), t('pricing.premium.f3'), t('pricing.premium.f4')],
            btnVariant: 'outline' as const
        }
    ];

    return (
        <section className="py-32 bg-background relative overflow-hidden">
            {/* Background elements */}
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

                    {/* Currency Switcher Toggle */}
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
                    {plans.map((plan, i) => (
                        <Card 
                            key={i} 
                            className={`group relative flex flex-col p-10 bg-card/40 backdrop-blur-xl rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${plan.color} ${i === 1 ? 'animate-slide-up animation-delay-200 lg:scale-105 z-20' : 'animate-slide-up animation-delay-100'}`}
                        >
                            {plan.isPopular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full font-black text-sm shadow-xl shadow-primary/40 flex items-center gap-2 animate-bounce-subtle">
                                    <Sparkles className="h-4 w-4" /> MOST POPULAR
                                </div>
                            )}

                            <div className="mb-10">
                                <div className="p-4 bg-background border rounded-2xl w-max shadow-sm mb-8">
                                    {plan.icon}
                                </div>
                                <h3 className="text-3xl font-black mb-3">{plan.name}</h3>
                                <p className="text-muted-foreground font-medium text-lg leading-relaxed">{plan.desc}</p>
                            </div>

                            <div className="mb-12 flex items-baseline gap-2">
                                <span className="text-6xl font-black tracking-tighter decoration-primary underline-offset-8">
                                    {plan.price}
                                </span>
                                <div className="flex flex-col">
                                    <span className="font-black text-xl text-primary">{currency}</span>
                                    <span className="text-muted-foreground font-bold text-sm">{t('pricing.month')}</span>
                                </div>
                            </div>

                            <div className="space-y-5 mb-12 flex-1">
                                {plan.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="mt-1 bg-primary/10 p-1 rounded-full border border-primary/20">
                                            <Check className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-semibold text-foreground/80 leading-tight">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Button 
                                variant={plan.btnVariant}
                                className={`w-full h-16 rounded-[1.25rem] text-lg font-black transition-all ${plan.btnVariant === 'default' ? 'shadow-xl shadow-primary/30' : 'hover:bg-primary/5'}`}
                                onClick={() => handleSubscribe(plan.name as string)}
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
