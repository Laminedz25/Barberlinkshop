import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle, MessageCircle, Phone, HelpCircle, Video } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Support = () => {
    const { t, isRTL } = useLanguage();
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    const tutorials = [
        { id: '1', title: 'How to Register as a Barber', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: '2', title: 'Managing your Salon Profile', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: '3', title: 'Adding Services & Gallery', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { id: '4', title: 'How to use the Booking System', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ];

    const faqs = [
        { q: t('support.faq.q1'), a: t('support.faq.a1') },
        { q: t('support.faq.q2'), a: t('support.faq.a2') },
        { 
            q: isRTL ? 'هل يمكنني إلغاء الحجز؟' : 'Can I cancel my booking?', 
            a: isRTL ? 'نعم، يمكنك إلغاء الحجز من خلال لوحة تحكم الزبون قبل موعد الخدمة بـ 24 ساعة.' : 'Yes, you can cancel your booking from your customer dashboard up to 24 hours before the appointment.' 
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navigation />
            
            <main className="container mx-auto px-4 py-20">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                        {t('support.title')}
                    </h1>
                    <p className="text-xl text-muted-foreground italic">
                        {t('support.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <Card className="p-8 rounded-[3rem] border-2 border-primary/10 shadow-xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <Video className="w-32 h-32 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
                            <PlayCircle className="text-primary w-8 h-8" /> {t('support.tutorials.title')}
                        </h2>
                        <p className="text-muted-foreground mb-8">{t('support.tutorials.desc')}</p>
                        
                        <div className="space-y-4">
                            {tutorials.map((video) => (
                                <button 
                                    key={video.id}
                                    onClick={() => setActiveVideo(video.url)}
                                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl hover:bg-primary hover:text-white transition-all group/btn shadow-sm"
                                >
                                    <span className="font-bold">{video.title}</span>
                                    <PlayCircle className="w-5 h-5 opacity-50 group-hover/btn:opacity-100" />
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[3rem] border-2 border-indigo-500/10 shadow-xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <HelpCircle className="w-32 h-32 text-indigo-500" />
                        </div>
                        <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                            <HelpCircle className="text-indigo-500 w-8 h-8" /> {t('support.faq.title')}
                        </h2>
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, i) => (
                                <AccordionItem key={i} value={`item-${i}`} className="border-b border-slate-100 dark:border-slate-800">
                                    <AccordionTrigger className="text-left font-bold text-lg hover:text-primary decoration-none">{faq.q}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed text-md">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </Card>
                </div>

                {activeVideo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl">
                            <button 
                                onClick={() => setActiveVideo(null)}
                                className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-all"
                                title="Close video"
                                aria-label="Close video"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                            <iframe 
                                src={activeVideo} 
                                title="Video Tutorial"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}

                <div className="max-w-3xl mx-auto bg-primary rounded-[3rem] p-10 text-white text-center shadow-2xl shadow-primary/40 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <h2 className="text-3xl font-black mb-6 flex items-center justify-center gap-3 italic underline decoration-white/20">
                        <MessageCircle className="w-10 h-10" /> Ready to Scale?
                    </h2>
                    <p className="text-xl opacity-90 mb-10 leading-relaxed font-medium">
                        {t('support.contact.us')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-white text-primary hover:bg-slate-100 rounded-2xl px-10 h-14 text-lg font-black shadow-xl" asChild>
                            <a href="https://wa.me/213550000000" target="_blank" rel="noopener noreferrer">
                                <Phone className="w-5 h-5 mr-3" /> WhatsApp Support
                            </a>
                        </Button>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-2xl px-10 h-14 text-lg font-black" asChild>
                            <a href="mailto:support@barberlink.dz">Email Support</a>
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Support;
