import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Camera, Sparkles, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AiStylist() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<{ image: string, desc: string }[] | null>(null);

    const handleUpload = () => {
        setIsUploading(true);
        // Simulate upload delay
        setTimeout(() => {
            setPhotoUrl('https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=500&auto=format&fit=crop&q=60'); // placeholder face
            setIsUploading(false);
        }, 1500);
    };

    const handleGenerate = (type: 'men' | 'women') => {
        setIsGenerating(true);
        setTimeout(() => {
            if (type === 'men') {
                setResults([
                    { image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=60', desc: 'Modern Fade & Trimmed Beard' },
                    { image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=60', desc: 'Classic Pompadour' }
                ]);
            } else {
                setResults([
                    { image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&auto=format&fit=crop&q=60', desc: 'Elegant Waves & Evening Makeup' },
                    { image: 'https://images.unsplash.com/photo-1512413913418-2e37db7bb14b?w=500&auto=format&fit=crop&q=60', desc: 'Sleek Bob & Natural Glow' }
                ]);
            }
            setIsGenerating(false);
            toast({
                title: "AI Analysis Complete",
                description: "We found the perfect styles for you!",
            });
        }, 2500);
    };

    return (
        <section className="py-20 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black mb-4">
                        {t('ai.stylist.title')}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t('ai.stylist.desc')}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <Card className="p-1 sm:p-2 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[2rem] shadow-2xl">
                        <div className="bg-white dark:bg-slate-950 rounded-[1.8rem] p-6 sm:p-10">
                            {!photoUrl ? (
                                <div className="border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors rounded-[1.5rem] p-12 flex flex-col items-center justify-center text-center bg-primary/5 cursor-pointer" onClick={handleUpload}>
                                    {isUploading ? (
                                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                    ) : (
                                        <Upload className="w-12 h-12 text-primary/70 mb-4" />
                                    )}
                                    <h3 className="text-xl font-bold mb-2">{t('ai.stylist.upload')}</h3>
                                    <p className="text-muted-foreground text-sm max-w-xs">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 mb-8 shadow-xl">
                                        <img src={photoUrl} alt="User Face" className="w-full h-full object-cover" />
                                        <button onClick={() => setPhotoUrl(null)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full"><Camera className="w-4 h-4 inline mr-1" /> Retake</span>
                                        </button>
                                    </div>

                                    {!results ? (
                                        <Tabs defaultValue="men" className="w-full max-w-md">
                                            <TabsList className="grid w-full grid-cols-2 p-1.5 rounded-2xl mb-8">
                                                <TabsTrigger value="men" className="rounded-xl py-3 font-bold">{t('ai.stylist.men')}</TabsTrigger>
                                                <TabsTrigger value="women" className="rounded-xl py-3 font-bold">{t('ai.stylist.women')}</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="men">
                                                <Button disabled={isGenerating} onClick={() => handleGenerate('men')} className="w-full h-14 rounded-full text-lg font-bold shadow-lg shadow-primary/25">
                                                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                                                    {t('ai.stylist.generate')}
                                                </Button>
                                            </TabsContent>
                                            <TabsContent value="women">
                                                <Button disabled={isGenerating} onClick={() => handleGenerate('women')} className="w-full h-14 rounded-full bg-pink-600 hover:bg-pink-700 text-lg font-bold shadow-lg shadow-pink-600/25">
                                                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                                                    {t('ai.stylist.generate')}
                                                </Button>
                                            </TabsContent>
                                        </Tabs>
                                    ) : (
                                        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-2xl font-bold">{t('ai.stylist.result')}</h3>
                                                <Button variant="outline" size="sm" onClick={() => setResults(null)} className="rounded-full">Try Again</Button>
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                {results.map((res, idx) => (
                                                    <div key={idx} className="group overflow-hidden rounded-[1.5rem] border border-border shadow-md hover:shadow-xl transition-all bg-card">
                                                        <div className="aspect-[4/5] overflow-hidden">
                                                            <img src={res.image} alt={res.desc} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        </div>
                                                        <div className="p-5 text-center">
                                                            <p className="font-bold text-lg leading-tight">{res.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
