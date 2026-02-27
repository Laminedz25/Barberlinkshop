import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
    const { t, isRTL } = useLanguage();

    const testimonials = [
        {
            name: t('testi.1.name'),
            role: t('testi.1.role'),
            text: t('testi.1.text'),
            rating: 5,
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&auto=format&fit=crop&q=80'
        },
        {
            name: t('testi.2.name'),
            role: t('testi.2.role'),
            text: t('testi.2.text'),
            rating: 5,
            image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&auto=format&fit=crop&q=80'
        },
        {
            name: t('testi.3.name'),
            role: t('testi.3.role'),
            text: t('testi.3.text'),
            rating: 5,
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&auto=format&fit=crop&q=80'
        }
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-background to-slate-50 dark:to-slate-950 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <Badge text="Testimonials & Reviews" />
                    <h2 className="text-4xl md:text-5xl font-black mt-6 mb-4">{t('testi.title')}</h2>
                    <p className="text-xl text-muted-foreground font-medium">
                        {t('testi.sub')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {testimonials.map((testi, i) => (
                        <Card key={i} className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-[2rem] shadow-xl hover:-translate-y-2 transition-transform relative group">
                            <Quote className="absolute top-8 right-8 h-10 w-10 text-primary/10 group-hover:text-primary/20 transition-colors" />

                            <div className="flex gap-1 mb-6">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <Star key={idx} className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                                ))}
                            </div>

                            <p className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-8 flex-1">
                                "{testi.text}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto">
                                <img src={testi.image} alt={testi.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20" />
                                <div>
                                    <h4 className="font-extrabold text-foreground">{testi.name}</h4>
                                    <p className="text-sm text-primary font-semibold">{testi.role}</p>
                                </div>
                            </div>
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
