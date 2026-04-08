import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import {
  Scissors, Building2, TrendingUp, ShoppingBag,
  User, MapPin, Phone, Globe, Instagram, ChevronRight,
  CheckCircle, Sparkles, ArrowLeft
} from 'lucide-react';

type AccountType = 'barber' | 'salon_owner' | 'investor' | 'seller' | null;

interface OnboardingData {
  accountType: AccountType;
  fullName: string;
  businessName: string;
  phone: string;
  address: string;
  city: string;
  bio: string;
  instagram: string;
  website: string;
  services: string;
  priceRange: string;
  investmentBudget: string;
  storeType: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const totalSteps = 4;
  const progress = Math.round((step / totalSteps) * 100);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.setProperty('--progress', `${progress}%`);
    }
  }, [progress]);
  const [data, setData] = useState<OnboardingData>({
    accountType: null,
    fullName: '',
    businessName: '',
    phone: '',
    address: '',
    city: '',
    bio: '',
    instagram: '',
    website: '',
    services: '',
    priceRange: '',
    investmentBudget: '',
    storeType: ''
  });

  const set = (key: keyof OnboardingData, val: string) => setData(d => ({ ...d, [key]: val }));

  const accountTypes = [
    { id: 'barber', icon: <Scissors className="w-8 h-8" />, label: t('onboarding.type.barber'), desc: t('onboarding.type.barber.desc') },
    { id: 'salon_owner', icon: <Building2 className="w-8 h-8" />, label: t('onboarding.type.salon'), desc: t('onboarding.type.salon.desc') },
    { id: 'investor', icon: <TrendingUp className="w-8 h-8" />, label: t('onboarding.type.investor'), desc: t('onboarding.type.investor.desc') },
    { id: 'seller', icon: <ShoppingBag className="w-8 h-8" />, label: t('onboarding.type.seller'), desc: t('onboarding.type.seller.desc') },
  ];

  const handleFinish = async () => {
    const user = auth.currentUser;
    if (!user) { navigate('/auth'); return; }
    setSaving(true);
    try {
      const profileData = {
        role: data.accountType,
        full_name: data.fullName,
        business_name: data.businessName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        bio: data.bio,
        socials: { instagram: data.instagram, website: data.website },
        services: data.services.split(',').map(s => s.trim()).filter(Boolean),
        price_range: data.priceRange,
        investment_budget: data.investmentBudget,
        store_type: data.storeType,
        onboarding_complete: true,
        verified: false,
        verification_status: 'pending',
        created_at: serverTimestamp(),
        user_id: user.uid,
      };

      // Write to users collection
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        email: user.email,
      }, { merge: true });

      // Write to role-specific collection
      if (data.accountType === 'barber' || data.accountType === 'salon_owner') {
        await setDoc(doc(db, 'barbers', user.uid), profileData, { merge: true });
      }

      toast({
        title: isRTL ? '🎉 مرحباً بك في BarberLink!' : '🎉 Welcome to BarberLink!',
        description: isRTL ? 'تم إنشاء ملفك الشخصي بنجاح.' : 'Your profile has been created successfully.',
      });

      navigate('/dashboard');
    } catch (e) {
      toast({ title: 'Error', description: String(e), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20 max-w-2xl">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between mb-3">
            <p className="text-white/60 text-sm font-bold uppercase tracking-widest">
              {t('onboarding.step')} {step + 1} {t('onboarding.of')} {totalSteps + 1}
            </p>
            <p className="text-primary font-black text-sm">{progress}%</p>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className="onboarding-progress-bar"
            />
          </div>
        </div>

        {/* Step 0: Choose Account Type */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center text-white mb-10">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-black tracking-tighter mb-2">
                {t('onboarding.welcome')}
              </h1>
              <p className="text-white/50">{t('onboarding.subtitle')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {accountTypes.map(type => (
                <Card
                  key={type.id}
                  onClick={() => { set('accountType', type.id); setStep(1); }}
                  className="cursor-pointer p-6 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-white text-center group"
                >
                  <div className="flex justify-center mb-4 text-white/50 group-hover:text-primary transition-colors">{type.icon}</div>
                  <h3 className="font-black text-lg mb-1">{type.label}</h3>
                  <p className="text-xs text-white/40">{type.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card className="p-8 rounded-3xl border-none bg-white shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-black">{isRTL ? 'معلوماتك الأساسية' : 'Basic Information'}</h2>
            </div>
            <Input placeholder={isRTL ? 'الاسم الكامل *' : 'Full Name *'} value={data.fullName} onChange={e => set('fullName', e.target.value)} className="h-14 rounded-2xl text-base" />
            {(data.accountType === 'barber' || data.accountType === 'salon_owner' || data.accountType === 'seller') && (
              <Input placeholder={isRTL ? 'اسم الصالون / المتجر *' : 'Business / Store Name *'} value={data.businessName} onChange={e => set('businessName', e.target.value)} className="h-14 rounded-2xl text-base" />
            )}
            <Input placeholder={isRTL ? 'رقم الهاتف *' : 'Phone Number *'} value={data.phone} onChange={e => set('phone', e.target.value)} className="h-14 rounded-2xl text-base" />
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1 h-14 rounded-2xl font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t('onboarding.back')}
              </Button>
              <Button onClick={() => setStep(2)} disabled={!data.fullName || !data.phone} className="flex-1 h-14 rounded-2xl font-black">
                {t('onboarding.next')} <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Location & Details */}
        {step === 2 && (
          <Card className="p-8 rounded-3xl border-none bg-white shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-black">{isRTL ? 'موقعك وتفاصيلك' : 'Location & Details'}</h2>
            </div>
            <Input placeholder={isRTL ? 'العنوان (شارع، حي...)' : 'Street Address'} value={data.address} onChange={e => set('address', e.target.value)} className="h-14 rounded-2xl text-base" />
            <Input placeholder={isRTL ? 'الولاية / المدينة *' : 'City / Wilaya *'} value={data.city} onChange={e => set('city', e.target.value)} className="h-14 rounded-2xl text-base" />
            <textarea
              placeholder={isRTL ? 'نبذة عنك أو عن صالونك...' : 'Brief bio or about your business...'}
              value={data.bio}
              onChange={e => set('bio', e.target.value)}
              className="w-full h-28 p-4 rounded-2xl text-base border border-input resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {data.accountType === 'investor' && (
              <Input placeholder={isRTL ? 'ميزانية الاستثمار المتوقعة ($)' : 'Expected Investment Budget ($)'} value={data.investmentBudget} onChange={e => set('investmentBudget', e.target.value)} className="h-14 rounded-2xl text-base" />
            )}
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> {t('onboarding.back')}</Button>
              <Button onClick={() => setStep(3)} disabled={!data.city} className="flex-1 h-14 rounded-2xl font-black">{t('onboarding.next')} <ChevronRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </Card>
        )}

        {/* Step 3: Socials & Services */}
        {step === 3 && (
          <Card className="p-8 rounded-3xl border-none bg-white shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-black">{isRTL ? 'التواصل الاجتماعي والخدمات' : 'Socials & Services'}</h2>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-2xl">
              <Instagram className="w-5 h-5 text-pink-500 shrink-0" />
              <Input placeholder="Instagram username" value={data.instagram} onChange={e => set('instagram', e.target.value)} className="h-10 rounded-xl border-none shadow-none" />
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-2xl">
              <Globe className="w-5 h-5 text-blue-500 shrink-0" />
              <Input placeholder="Website URL (optional)" value={data.website} onChange={e => set('website', e.target.value)} className="h-10 rounded-xl border-none shadow-none" />
            </div>
            {(data.accountType === 'barber' || data.accountType === 'salon_owner') && (
              <>
                <Input placeholder={isRTL ? 'الخدمات (قص، حلاقة، ...) افصل بفاصلة' : 'Services (Haircut, Beard, ...) — comma separated'} value={data.services} onChange={e => set('services', e.target.value)} className="h-14 rounded-2xl text-base" />
                <Input placeholder={isRTL ? 'نطاق الأسعار (مثال: 500-2000 دج)' : 'Price Range (e.g. 500-2000 DZD)'} value={data.priceRange} onChange={e => set('priceRange', e.target.value)} className="h-14 rounded-2xl text-base" />
              </>
            )}
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-14 rounded-2xl font-bold"><ArrowLeft className="w-4 h-4 mr-2" /> {t('onboarding.back')}</Button>
              <Button onClick={() => setStep(4)} className="flex-1 h-14 rounded-2xl font-black">{t('onboarding.next')} <ChevronRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </Card>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <Card className="p-8 rounded-3xl border-none bg-white shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 text-center">
            <CheckCircle className="w-20 h-20 text-primary mx-auto" />
            <h2 className="text-3xl font-black">{isRTL ? 'كل شيء جاهز! 🎉' : 'All Set! 🎉'}</h2>
            <p className="text-muted-foreground text-lg">{isRTL ? 'بروفايلك يكاد يكون كاملاً. سيتم مراجعته وتفعيله من قِبل فريق BarberLink.' : 'Your profile is almost complete. It will be reviewed and activated by the BarberLink team.'}</p>
            <div className="grid grid-cols-2 gap-3 my-6 text-left">
              <div className="p-3 bg-muted/50 rounded-xl text-sm"><span className="font-bold block mb-1">{isRTL ? 'الاسم' : 'Name'}</span>{data.fullName}</div>
              <div className="p-3 bg-muted/50 rounded-xl text-sm"><span className="font-bold block mb-1">{isRTL ? 'النوع' : 'Type'}</span><Badge>{data.accountType}</Badge></div>
              <div className="p-3 bg-muted/50 rounded-xl text-sm"><span className="font-bold block mb-1">{isRTL ? 'المدينة' : 'City'}</span>{data.city}</div>
              <div className="p-3 bg-muted/50 rounded-xl text-sm"><span className="font-bold block mb-1">{isRTL ? 'الهاتف' : 'Phone'}</span>{data.phone}</div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(3)} className="h-14 px-8 rounded-2xl font-bold"><ArrowLeft className="w-4 h-4 mr-2" /></Button>
              <Button onClick={handleFinish} disabled={saving} className="flex-1 h-14 rounded-2xl font-black text-lg">
                {saving ? '⏳ ...' : t('onboarding.finish')}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Onboarding;
