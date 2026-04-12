import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MapPin, Calendar } from 'lucide-react';

interface SeoPostData {
  title: string;
  title_ar?: string;
  content_en: string;
  content_ar: string;
  city: string;
  country: string;
  created_at: string;
  keywords: string[];
}

const SeoPost = () => {
    const { city } = useParams();
    const { isRTL, language } = useLanguage();
    const [post, setPost] = useState<SeoPostData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!city) return;
            const q = query(collection(db, 'seo_posts'), where('city', '==', city), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
                setPost(snap.docs[0].data() as SeoPostData);
            }
            setLoading(false);
        };
        fetchPost();
    }, [city]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Sparkles className="animate-spin text-primary" /></div>;
    if (!post) return <div className="min-h-screen flex items-center justify-center">Post not found. Explore our main <a href="/" className="text-primary ml-1">Directory</a>.</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navigation />
            <main className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
                <Badge className="bg-primary/20 text-primary border-none mb-6">GLOBAL GROOMING GUIDE</Badge>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
                    {language === 'ar' ? post.title_ar || post.title : post.title}
                </h1>

                <div className="flex items-center gap-6 text-muted-foreground mb-12 font-bold uppercase text-xs tracking-widest">
                   <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {post.city}, {post.country}</div>
                   <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(post.created_at).toLocaleDateString()}</div>
                </div>

                <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white mb-12">
                   <CardContent className="p-10 md:p-16 prose prose-slate dark:prose-invert max-w-none">
                      <div className="text-lg leading-relaxed whitespace-pre-wrap">
                         {language === 'ar' ? post.content_ar : post.content_en}
                      </div>

                      <div className="mt-12 p-8 bg-blue-50 rounded-3xl border border-blue-100 text-center">
                         <h3 className="text-2xl font-black mb-4">Ready for a fresh cut in {post.city}?</h3>
                         <p className="mb-6 opacity-70">Browse the top-rated barbers in our autonomous network today.</p>
                         <a href={`/search?city=${post.city}`} className="inline-flex h-14 px-8 bg-primary text-white items-center justify-center rounded-2xl font-black shadow-lg hover:shadow-primary/20 transition-all">
                            EXPLORE NEARBY SALONS
                         </a>
                      </div>
                   </CardContent>
                </Card>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                   {post.keywords?.map((k: string) => (
                      <Badge key={k} variant="secondary" className="px-4 py-2 rounded-xl">#{k}</Badge>
                   ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SeoPost;
