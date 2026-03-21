import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  getDoc, 
  getDocFromServer,
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout, Users, Settings, Database, Server, BarChart2, TrendingUp, Store, Shield, Key, Bot, CreditCard, Share2, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AutomationService } from '@/services/AutomationService';

interface UserData {
    id: string;
    email: string;
    full_name: string;
    role: string;
    barber_type?: string;
    is_banned?: boolean;
    subscription_expires_at?: string;
}

const AdminDashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [usersList, setUsersList] = useState<UserData[]>([]);
    const [prices, setPrices] = useState({ basic: 0, pro: 2500, premium: 5000 });
    const [apiKeys, setApiKeys] = useState({
        openai: '', stripeSecret: '', stripePublishable: '', stripeWebhook: '', telegramToken: '', weatherKey: '',
        nominatimUrl: '', other: '',
        billionmailEndpoint: '', billionmailApiKey: '', billionmailFrom: 'noreply@barberlink.cloud'
    });

    const [paymentInfo, setPaymentInfo] = useState({
        ccp: '',
        baridiMob: '',
        cib: '',
        postalAccount: '',
        fullName: '',
        rib: '',
        fixedDzdPrice: 2500,
        fixedUsdPrice: 20
    });

    const [subscriptionConfig, setSubscriptionConfig] = useState({
        discount3Months: 10,
        discount6Months: 15,
        discount12Months: 25,
        isActive: true
    });

    const [globalSettings, setGlobalSettings] = useState({
        seoTitle: 'BarberLink - Solution',
        seoDescription: 'Premium Platform.',
        maintenanceMode: false
    });

    const [socials, setSocials] = useState({ facebook: '', instagram: '', tiktok: '', snapchat: '', youtube: '' });
    const [stats, setStats] = useState({ salons: 0, barbers: 0, mobile: 0, customers: 0 });
    const [aiPrompts, setAiPrompts] = useState({
        customer_service: '', social_media: '', reports_generator: '', subscription_bot: ''
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/auth');
                return;
            }
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDocFromServer(docRef);
                if (docSnap.exists() && docSnap.data().role === 'admin') {
                    setIsAdmin(true);
                    setLoading(false);
                    fetchUsers();
                    fetchSystemSettings();
                } else {
                    navigate('/auth');
                }
            } catch (err) {
                setLoading(false);
                navigate('/auth');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchUsers = async () => {
        const q = query(collection(db, 'users'));
        const snap = await getDocs(q);
        const data: UserData[] = [];
        let salons = 0, barbers = 0, customers = 0;

        snap.forEach(d => {
            const u = { id: d.id, ...d.data() } as UserData;
            data.push(u);
            if (u.role === 'customer') customers++;
            if (u.role === 'barber') {
                if (u.barber_type === 'salon_owner') salons++;
                else barbers++;
            }
        });

        const mQuery = query(collection(db, 'barbers'), where('offers_home_visit', '==', true));
        const mSnap = await getDocs(mQuery);
        setStats({ salons, barbers, mobile: mSnap.size, customers });
        setUsersList(data);
    };

    const fetchSystemSettings = async () => {
        const docSnap = await getDoc(doc(db, 'system', 'settings'));
        if (docSnap.exists()) {
            const d = docSnap.data();
            if (d.prices) setPrices(d.prices);
            if (d.apiKeys) setApiKeys(d.apiKeys);
            if (d.socials) setSocials(d.socials);
            if (d.aiPrompts) setAiPrompts(d.aiPrompts);
            if (d.paymentInfo) setPaymentInfo(d.paymentInfo);
            if (d.globalSettings) setGlobalSettings(d.globalSettings);
        }
    };

    const saveSettings = async () => {
        try {
            await setDoc(doc(db, 'system', 'settings'), { 
                prices, apiKeys, socials, aiPrompts, paymentInfo, globalSettings, subscriptionConfig
            }, { merge: true });
            toast({ title: 'Success', description: 'Settings saved.' });
        } catch (e: any) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        }
    };

    const toggleBanUser = async (u: UserData) => {
        await updateDoc(doc(db, 'users', u.id), { is_banned: !u.is_banned });
        fetchUsers();
    };

    if (loading || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navigation />
            <main className="container mx-auto px-4 py-8 mt-20">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-5xl font-black mb-10 tracking-tighter uppercase italic">{t('admin.title')} <span className="text-primary tracking-normal">{t('admin.subtitle')}</span></h1>

                    <Tabs defaultValue="analytics" className="w-full">
                        <TabsList className="mb-10 bg-slate-200 dark:bg-slate-800 p-2 rounded-3xl flex flex-wrap h-auto gap-2">
                            <TabsTrigger value="analytics" className="rounded-2xl px-6 py-3 font-bold"><BarChart2 className="w-4 h-4 mr-2" /> {t('admin.tab.analytics')}</TabsTrigger>
                            <TabsTrigger value="settings" className="rounded-2xl px-6 py-3 font-bold"><Settings className="w-4 h-4 mr-2" /> {t('admin.tab.settings')}</TabsTrigger>
                            <TabsTrigger value="users" className="rounded-2xl px-6 py-3 font-bold"><Users className="w-4 h-4 mr-2" /> {t('admin.tab.users')}</TabsTrigger>
                            <TabsTrigger value="ai_agents" className="rounded-2xl px-6 py-3 font-bold"><Bot className="w-4 h-4 mr-2" /> {t('admin.tab.ai')}</TabsTrigger>
                            <TabsTrigger value="keys" className="rounded-2xl px-6 py-3 font-bold"><Key className="w-4 h-4 mr-2" /> {t('admin.tab.keys')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="analytics" className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard label="Salons" value={stats.salons} icon={<Store />} color="text-primary" />
                                <StatCard label="Barbers" value={stats.barbers} icon={<Users />} color="text-blue-500" />
                                <StatCard label="Mobile" value={stats.mobile} icon={<TrendingUp />} color="text-purple-500" />
                                <StatCard label="Customers" value={stats.customers} icon={<Users />} color="text-green-500" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="p-8 rounded-[3rem] shadow-xl">
                                    <h3 className="text-2xl font-black mb-6 flex items-center gap-2 text-indigo-600"><Server className="w-6 h-6" /> {t('admin.health.title')}</h3>
                                    <div className="space-y-4">
                                        <HealthRow label="Server Status" status="Live" color="bg-green-500" />
                                        <HealthRow label="Database (Firestore)" status="Connected" color="bg-green-500" />
                                        <HealthRow label="Auth Service" status="Active" color="bg-green-500" />
                                    </div>
                                </Card>
                                <Card className="p-8 rounded-[3rem] shadow-xl bg-slate-900 text-white">
                                    <h3 className="text-2xl font-black mb-6 flex items-center gap-2"><DollarSign className="w-6 h-6 text-primary" /> Revenue Estimate</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between border-b border-white/10 pb-4">
                                            <span className="opacity-60">This Month</span>
                                            <span className="text-2xl font-black text-primary">145,000 DZD</span>
                                        </div>
                                        <p className="text-xs opacity-40 italic mt-4">* Based on active pro-tier subscriptions.</p>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-8">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <Card className="p-8 rounded-[3rem] shadow-2xl">
                                    <h3 className="text-3xl font-black mb-8 flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary"><CreditCard className="w-6 h-6" /></div>
                                        {t('admin.payments.title')}
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="font-bold">Full Name (الاسم الكامل)</Label>
                                                <Input className="rounded-xl" value={paymentInfo.fullName} onChange={e => setPaymentInfo({...paymentInfo, fullName: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold">CCP</Label>
                                                <Input className="rounded-xl" value={paymentInfo.ccp} onChange={e => setPaymentInfo({...paymentInfo, ccp: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold">Baridi Mob</Label>
                                                <Input className="rounded-xl" value={paymentInfo.baridiMob} onChange={e => setPaymentInfo({...paymentInfo, baridiMob: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold">CIB / البطاقة الذهبية</Label>
                                                <Input className="rounded-xl" value={paymentInfo.cib} onChange={e => setPaymentInfo({...paymentInfo, cib: e.target.value})} />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="font-bold">Postal Account (حساب بريدي جاري)</Label>
                                                <Input className="rounded-xl" value={paymentInfo.postalAccount} onChange={e => setPaymentInfo({...paymentInfo, postalAccount: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-8 rounded-[3rem] shadow-2xl">
                                    <h3 className="text-3xl font-black mb-8 flex items-center gap-3">
                                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Share2 className="w-6 h-6" /></div>
                                        SEO & Meta
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="font-bold">Platform Title</Label>
                                            <Input className="rounded-xl" value={globalSettings.seoTitle} onChange={e => setGlobalSettings({...globalSettings, seoTitle: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold">Meta Description</Label>
                                            <Textarea className="rounded-2xl" value={globalSettings.seoDescription} onChange={e => setGlobalSettings({...globalSettings, seoDescription: e.target.value})} />
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-8 rounded-[3rem] shadow-2xl xl:col-span-2">
                                    <h3 className="text-3xl font-black mb-8 flex items-center gap-3">
                                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500"><CreditCard className="w-6 h-6" /></div>
                                        Subscription Pricing Config
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border">
                                            <Label className="font-bold text-lg text-slate-500">Basic Tier (Free/Starter)</Label>
                                            <Input type="number" className="rounded-xl h-14 text-xl font-black" value={prices.basic} onChange={e => setPrices({...prices, basic: Number(e.target.value)})} />
                                        </div>
                                        <div className="space-y-2 p-6 bg-blue-50 dark:bg-slate-800/50 rounded-3xl border border-blue-100 dark:border-blue-900">
                                            <Label className="font-bold text-lg text-blue-500">Pro Tier</Label>
                                            <Input type="number" className="rounded-xl h-14 text-xl font-black text-blue-600" value={prices.pro} onChange={e => setPrices({...prices, pro: Number(e.target.value)})} />
                                        </div>
                                        <div className="space-y-2 p-6 bg-yellow-50 dark:bg-slate-800/50 rounded-3xl border border-yellow-200 dark:border-yellow-900">
                                            <Label className="font-bold text-lg text-yellow-600">Premium Tier</Label>
                                            <Input type="number" className="rounded-xl h-14 text-xl font-black text-yellow-600" value={prices.premium} onChange={e => setPrices({...prices, premium: Number(e.target.value)})} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                        <div className="space-y-2">
                                            <Label className="font-bold">3 Months Discount (%)</Label>
                                            <Input type="number" className="rounded-xl" value={subscriptionConfig.discount3Months} onChange={e => setSubscriptionConfig({...subscriptionConfig, discount3Months: Number(e.target.value)})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold">6 Months Discount (%)</Label>
                                            <Input type="number" className="rounded-xl" value={subscriptionConfig.discount6Months} onChange={e => setSubscriptionConfig({...subscriptionConfig, discount6Months: Number(e.target.value)})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold">12 Months Discount (%)</Label>
                                            <Input type="number" className="rounded-xl" value={subscriptionConfig.discount12Months} onChange={e => setSubscriptionConfig({...subscriptionConfig, discount12Months: Number(e.target.value)})} />
                                        </div>
                                    </div>
                                    <p className="mt-6 text-muted-foreground font-medium text-center">Update these values to instantly reflect pricing changes across the main landing page and subscription modals.</p>
                                </Card>
                            </div>
                            <Button size="lg" className="w-full h-16 rounded-2xl text-xl font-black" onClick={saveSettings}>{t('admin.save.system')}</Button>
                        </TabsContent>

                        <TabsContent value="users">
                            <Card className="rounded-[3rem] overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                                            <tr>
                                                <th className="p-8 text-left font-black uppercase tracking-widest text-xs opacity-50">{t('admin.users.user')}</th>
                                                <th className="p-8 text-left font-black uppercase tracking-widest text-xs opacity-50">{t('admin.users.role')}</th>
                                                <th className="p-8 text-left font-black uppercase tracking-widest text-xs opacity-50">Type</th>
                                                <th className="p-8 text-left font-black uppercase tracking-widest text-xs opacity-50">{t('admin.users.status')}</th>
                                                <th className="p-8 text-right font-black uppercase tracking-widest text-xs opacity-50">{t('admin.users.action')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {usersList.map(u => (
                                                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                    <td className="p-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl uppercase">
                                                                {u.full_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{u.full_name}</p>
                                                                <p className="text-sm font-medium opacity-50">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-8">
                                                        <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-8 text-sm font-bold opacity-70 italic uppercase">
                                                        {u.barber_type || 'Customer'}
                                                    </td>
                                                    <td className="p-8">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2.5 h-2.5 rounded-full ${u.is_banned ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                                            <span className={`text-sm font-black uppercase tracking-tighter ${u.is_banned ? 'text-red-500' : 'text-green-500'}`}>
                                                                {u.is_banned ? 'Banned' : 'Active'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-8 text-right">
                                                        <Button 
                                                            variant={u.is_banned ? "default" : "outline"} 
                                                            size="lg" 
                                                            className={`rounded-2xl font-black h-12 px-8 shadow-xl ${u.is_banned ? 'bg-green-500 hover:bg-green-600 border-none' : 'border-2 hover:bg-red-50 text-red-500 border-red-100'}`}
                                                            onClick={() => toggleBanUser(u)}
                                                        >
                                                            {u.is_banned ? 'Unban' : 'Ban Access'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="ai_agents" className="space-y-6">
                            <Card className="p-8 rounded-[3rem]">
                                <h2 className="text-2xl font-black mb-6">AI Behavioral Prompting</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <AIPromptField label="Customer Service" value={aiPrompts.customer_service} onChange={val => setAiPrompts({...aiPrompts, customer_service: val})} />
                                    <AIPromptField label="Marketing / Socials" value={aiPrompts.social_media} onChange={val => setAiPrompts({...aiPrompts, social_media: val})} />
                                </div>
                                <Button onClick={saveSettings} className="mt-8 rounded-full">Save Brain Training</Button>
                            </Card>
                        </TabsContent>

                        <TabsContent value="keys" className="space-y-6">
                            <Card className="p-8 rounded-[3rem] max-w-2xl">
                                <h2 className="text-2xl font-black mb-6">Environment Variable Keys</h2>
                                <div className="space-y-4">
                                    <KeyField label="OpenAI API Key" value={apiKeys.openai} onChange={v => setApiKeys({...apiKeys, openai: v})} />
                                    <div className="grid md:grid-cols-3 gap-6 border-y py-6 my-6 border-slate-100 dark:border-slate-800">
                                        <KeyField label="Stripe Publishable Key" value={apiKeys.stripePublishable} onChange={v => setApiKeys({...apiKeys, stripePublishable: v})} />
                                        <KeyField label="Stripe Secret Key" value={apiKeys.stripeSecret} onChange={v => setApiKeys({...apiKeys, stripeSecret: v})} />
                                        <KeyField label="Stripe Webhook Secret" value={apiKeys.stripeWebhook} onChange={v => setApiKeys({...apiKeys, stripeWebhook: v})} />
                                    </div>
                                    <KeyField label="BillionMail API" value={apiKeys.billionmailApiKey} onChange={v => setApiKeys({...apiKeys, billionmailApiKey: v})} />
                                    <Button onClick={saveSettings} className="w-full rounded-2xl h-12">Securely Update Vault</Button>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border flex items-center justify-between">
        <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <h3 className={`text-4xl font-black ${color}`}>{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 ${color}`}>{icon}</div>
    </div>
);

const HealthRow = ({ label, status, color }: { label: string; status: string; color: string }) => (
    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
        <span className="font-bold opacity-70">{label}</span>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-sm font-black uppercase text-green-500">{status}</span>
        </div>
    </div>
);

const AIPromptField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-2">
        <Label className="font-bold">{label} Agent</Label>
        <Textarea className="h-32 rounded-2xl" value={value} onChange={e => onChange(e.target.value)} />
    </div>
);

const KeyField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-2">
        <Label className="font-bold">{label}</Label>
        <Input type="password" className="rounded-xl" value={value} onChange={e => onChange(e.target.value)} />
    </div>
);

export default AdminDashboard;
