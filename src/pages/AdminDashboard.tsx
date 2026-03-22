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
import { 
  Settings, Users, Key, Bell, BarChart2, Share2, TrendingUp, 
  DollarSign, Store, Bot, CreditCard, Smartphone, Globe, 
  ShieldCheck, Server, User 
} from 'lucide-react';
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
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [usersList, setUsersList] = useState<UserData[]>([]);
    const [prices, setPrices] = useState({ basic: 1000, pro: 1500, premium: 2000 });
    const [apiKeys, setApiKeys] = useState({
        openai: '', stripe: '', telegramToken: '', weatherKey: '',
        nominatimUrl: '', other: '',
        billionmailEndpoint: '', billionmailApiKey: '', billionmailFrom: 'noreply@barberlink.cloud'
    });

    const [paymentInfo, setPaymentInfo] = useState({
        ccp: '',
        baridiMob: '',
        fullName: '',
        rib: '',
        fixedDzdPrice: 1000,
        fixedUsdPrice: 20
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
                prices, apiKeys, socials, aiPrompts, paymentInfo, globalSettings 
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
                                                <Label className="font-bold">Full Name</Label>
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
                                                <Label className="font-bold">Fixed DZD</Label>
                                                <Input type="number" className="rounded-xl" value={paymentInfo.fixedDzdPrice} onChange={e => setPaymentInfo({...paymentInfo, fixedDzdPrice: Number(e.target.value)})} />
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
                            </div>
                            <Button size="lg" className="w-full h-16 rounded-2xl text-xl font-black" onClick={saveSettings}>{t('admin.save.system')}</Button>
                        </TabsContent>

                        <TabsContent value="users">
                            <Card className="rounded-[3rem] overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-100 dark:bg-slate-800">
                                        <tr>
                                            <th className="p-6 text-left">User</th>
                                            <th className="p-6 text-left">Role</th>
                                            <th className="p-6 text-left">Status</th>
                                            <th className="p-6 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.map(u => (
                                            <tr key={u.id} className="border-b">
                                                <td className="p-6 font-bold">{u.full_name}<br/><span className="text-xs font-normal opacity-50">{u.email}</span></td>
                                                <td className="p-6 uppercase text-xs font-black text-primary">{u.role}</td>
                                                <td className="p-6">{u.is_banned ? 'Banned' : 'Active'}</td>
                                                <td className="p-6 text-right">
                                                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toggleBanUser(u)}>{u.is_banned ? 'Unban' : 'Ban'}</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                    <KeyField label="Stripe Secret" value={apiKeys.stripe} onChange={v => setApiKeys({...apiKeys, stripe: v})} />
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

const StatCard = ({ label, value, icon, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border flex items-center justify-between">
        <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <h3 className={`text-4xl font-black ${color}`}>{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 ${color}`}>{icon}</div>
    </div>
);

const HealthRow = ({ label, status, color }: any) => (
    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
        <span className="font-bold opacity-70">{label}</span>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-sm font-black uppercase text-green-500">{status}</span>
        </div>
    </div>
);

const AIPromptField = ({ label, value, onChange }: any) => (
    <div className="space-y-2">
        <Label className="font-bold">{label} Agent</Label>
        <Textarea className="h-32 rounded-2xl" value={value} onChange={e => onChange(e.target.value)} />
    </div>
);

const KeyField = ({ label, value, onChange }: any) => (
    <div className="space-y-2">
        <Label className="font-bold">{label}</Label>
        <Input type="password" className="rounded-xl" value={value} onChange={e => onChange(e.target.value)} />
    </div>
);

export default AdminDashboard;
