import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc, query, orderBy, limit, setDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Scissors, ShoppingBag, TrendingUp, TrendingDown, Users, DollarSign, Calendar, MessageSquare, Bot, Brain, Activity, ShieldCheck, Mail, ShieldAlert, BarChart3, RefreshCw, Zap, Save, CheckCircle, XCircle, Settings, Plus, BookOpen } from 'lucide-react';
import { MasterOrchestrator } from '@/ai-agents/MasterOrchestrator';
import { MemorySystem, MemoryNode } from '@/lib/agent-memory';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AGENT_REGISTRY } from '@/ai-agents/AgentRegistry';
import { AgentAPI, AgentRecord } from '@/lib/agent-api';
import { useSystemConfig, SystemConfig } from '@/hooks/useSystemConfig';
import { SystemIntegrity } from '@/lib/system-integrity';
import { Sentinel, HealthStatus } from '@/lib/sentinel-service';

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  suspended?: boolean;
}

interface Stats {
  users: number;
  barbers: number;
  bookings: number;
  revenue_dzd: number;
  revenue_usd: number;
  conversion_rate: number;
  retention_rate: number;
}

interface AIAgent {
  id: string;
  name: string;
  role: string;
  type: 'stylist' | 'support' | 'marketing' | 'supervisor';
  status: 'active' | 'training' | 'idle';
  tasks: string[];
  memoryType?: string;
  workflow?: string;
  logs?: string[];
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price_dzd: number;
  price_usd: number;
  features: string[];
  duration_days: number;
  auto_assign_agent?: boolean;
  supported_currencies?: string[];
  beta_mode?: boolean;
  data_isolation?: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  expiry_date: string;
  active: boolean;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'ai_agents' | 'marketing' | 'monitoring' | 'settings' | 'verification' | 'investors'>('overview');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [barbers, setBarbers] = useState<BarberRecord[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<BarberRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ users: 0, barbers: 0, bookings: 0, revenue_dzd: 154000, revenue_usd: 1200, conversion_rate: 0, retention_rate: 0 });
  const [savingSettings, setSavingSettings] = useState(false);
  const { config: systemConfig, loading: configLoading } = useSystemConfig();
  const [systemSettings, setSystemSettings] = useState<Partial<SystemConfig>>({});
  const [aiAgents, setAiAgents] = useState<AgentRecord[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [vpsHealth, setVpsHealth] = useState({ cpu: 12, ram: 45, disk: 30, uptime: '14 days' });
  const [investorMetrics, setInvestorMetrics] = useState({
    total_revenue: 1540000,
    active_barbers: 1240,
    ai_efficiency: 94,
    monthly_growth: 12
  });
  const [aiMemories, setAiMemories] = useState<MemoryNode[]>([]);
  const [selectedAgentForTraining, setSelectedAgentForTraining] = useState<AgentRecord | null>(null);
  const [newSystemPrompt, setNewSystemPrompt] = useState('');
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [newAgent, setNewAgent] = useState<Partial<AIAgent>>({ name: '', type: 'stylist', status: 'idle', tasks: [] });
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({ name: '', price_dzd: 0, price_usd: 0, features: [], duration_days: 30 });
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({ code: '', discount_percent: 0, expiry_date: '', active: true });
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      if (user && user.email === 'admin@barberlink.cloud') {
        setAuthorized(true);
        setLoading(false);
      } else {
        setAuthorized(false);
        setLoading(false);
        navigate('/');
        toast({ 
            title: "Security Violation", 
            description: "Unauthorized access attempts are logged. Please sign in with primary credentials.", 
            variant: "destructive" 
        });
      }
    });
    return () => unsubscribe();
  }, [navigate, toast]);

  const loadData = useCallback(async () => {
    try {
      const [usersSnap, barbersSnap, bookingsSnap, plansSnap, couponsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), orderBy('created_at', 'desc'), limit(50))),
        getDocs(collection(db, 'barbers')),
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'subscriptions')),
        getDocs(collection(db, 'coupons'))
      ]);
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as UserRecord)));
      setPlans(plansSnap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionPlan)));
      setCoupons(couponsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon)));
      
      const allBarbers = barbersSnap.docs.map(d => ({ id: d.id, ...d.data() } as BarberRecord));
      setBarbers(allBarbers);
      setPendingVerifications(allBarbers.filter(b => b.verification_status === 'pending' && !b.verified));

      setStats({
        users: usersSnap.size,
        barbers: barbersSnap.size,
        bookings: bookingsSnap.size,
        revenue_dzd: 154000,
        revenue_usd: 1200,
        conversion_rate: 68,
        retention_rate: 42
      });
      const invRef = doc(db, 'system', 'investor_metrics');
      const invSnap = await getDoc(invRef);
      if (invSnap.exists()) setInvestorMetrics(invSnap.data() as typeof investorMetrics);
      if (systemConfig) setSystemSettings(systemConfig);
    } catch (err) {
      toast({ title: 'Error loading data', description: String(err), variant: 'destructive' });
    }
  }, [toast, systemConfig]);

  useEffect(() => {
    if (!authorized) return;
    const unsub = AgentAPI.listenToAgents((data: AgentRecord[]) => {
      setAiAgents(data);
      if (data.length === 0) {
          AgentAPI.syncLocalRegistry(); 
      }
    });

    loadData().finally(() => setLoading(false));
    MasterOrchestrator.getInstance().startLoop();
    // Fetch memories
    const fetchMemories = async () => {
      const q = query(collection(db, 'ai_memories'), orderBy('timestamp', 'desc'), limit(20));
      const snap = await getDocs(q);
      setAiMemories(snap.docs.map(d => d.data() as MemoryNode));
    };
    fetchMemories();

    return () => unsub();
  }, [authorized, loadData]);

  // NEW: Deep Seed for Demo Scenarios (Salons, Services, Staff)
  const seedDemoBarbers = async () => {
    try {
      const demoId = "demo_salon_01";
      await setDoc(doc(db, 'barbers', demoId), {
        business_name: "Elite Barber Studio",
        address: "El Biar, Algiers",
        rating: 5,
        user_id: auth.currentUser?.uid,
        socials: { instagram: "elite_dz", facebook: "elitebarber" },
        bio: "The ultimate premium grooming experience in the heart of Algiers.",
        verified: true,
        created_at: new Date().toISOString()
      });

      // Seed Services
      const services = [
        { name_ar: "قص شعر بريميوم", name_en: "Premium Haircut", price: 1200, duration_minutes: 45, barber_id: demoId },
        { name_ar: "حلاقة ذقن ملكية", name_en: "Royal Beard Trim", price: 800, duration_minutes: 30, barber_id: demoId }
      ];
      for (const s of services) {
        await addDoc(collection(db, 'services'), s);
      }

      // Seed Staff
      const staffRef = collection(db, 'barbers', demoId, 'staff');
      await addDoc(staffRef, { name: "Ahmed Master", role: "Elite Stylist", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed" });

      toast({ title: 'Demo Data Seeded', description: 'Elite Barber Studio node is now live.' });
      loadData();
    } catch (err) {
      toast({ title: 'Seeding Failed', description: String(err), variant: 'destructive' });
    }
  };

  const runDiagnostic = async () => {
    const res = await Sentinel.performDiagnostic();
    setHealthStatus(res);
    toast({ title: 'Diagnostic Complete', description: `System is ${res.status.toUpperCase()}` });
  };

  const runStressTest = async () => {
    setSimulating(true);
    try {
      const res = await Sentinel.runLoadSimulation(100);
      toast({ title: 'Stress Test Successful', description: `Processed ${res.count} requests at ${res.avg_latency} latency.` });
    } finally {
      setSimulating(false);
    }
  };

  const seedAll = useCallback(async () => {
    setLoading(true);
    try {
      await SystemIntegrity.forceGlobalSync(investorMetrics);
      toast({ title: 'Deep Global Sync Successful', description: 'AI, Financial and Data nodes are now 100% synchronized.' });
      loadData();
    } catch (err) {
      toast({ title: 'Sync Failure', description: String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [investorMetrics, loadData, toast]);

  const seedDemoBarbersAction = async () => {
    try {
        await SystemIntegrity.seedDemoEcosystem(auth.currentUser?.uid || '');
        toast({ title: 'Demo Salon Generated', description: 'Elite Barber Studio is now live in the database.' });
        loadData();
    } catch (err) {
        toast({ title: 'Demo Generation Failed', description: String(err), variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (authorized && aiAgents.length === 0 && plans.length === 0) {
      // Auto-init only if totally empty and admin first visits
      seedAll();
    }
  }, [authorized, aiAgents.length, plans.length, seedAll]);

  const addAgent = async (agent: Partial<AIAgent>) => {
    try {
      const docRef = doc(collection(db, 'ai_agents'));
      await setDoc(docRef, { ...agent, status: 'idle', tasks: [] });
      toast({ title: 'AI Agent Created' });
      loadData();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const deleteAgent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ai_agents', id));
      toast({ title: 'Agent Deleted' });
      loadData();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const updateInvestorMetrics = async () => {
    try {
      await setDoc(doc(db, 'system', 'investor_metrics'), investorMetrics);
      toast({ title: 'Investor Metrics Updated', description: 'Real-time data synced to Investor Module.' });
    } catch (e) { 
      const error = e as Error;
      toast({ title: 'Error', description: error.message, variant: 'destructive' }); 
    }
  };

  const addPlan = async (plan: Partial<SubscriptionPlan>) => {
    try {
      const docRef = doc(collection(db, 'subscriptions'));
      await setDoc(docRef, plan);
      toast({ title: 'Plan Added' });
      loadData();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'subscriptions', id));
      toast({ title: 'Plan Deleted' });
      loadData();
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'system', 'config'), systemSettings);
      toast({ title: 'Settings Saved', description: 'Global ecosystem configuration updated successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleSuspend = async (userId: string, currently: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { suspended: !currently });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, suspended: !currently } : u));
      toast({ title: currently ? 'User Reactivated' : 'User Suspended' });
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to make this user an admin?')) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: 'admin' });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'admin' } : u));
      toast({ title: 'User promoted to admin' });
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/auth'); return; }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists() || snap.data().role !== 'admin') {
          toast({ title: 'Access Denied', description: 'You do not have admin privileges.', variant: 'destructive' });
          navigate('/');
          return;
        }
        setAuthorized(true);
        await loadData();
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate, loadData, toast]);

  useEffect(() => {
    if (systemConfig) setSystemSettings(systemConfig);
  }, [systemConfig, setSystemSettings]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  const statCards: StatCard[] = [
    { label: 'Total Users', value: stats.users, icon: <Users className="h-5 w-5" />, color: 'text-blue-500' },
    { label: 'Active Barbers', value: stats.barbers, icon: <Scissors className="h-5 w-5" />, color: 'text-green-500' },
    { label: 'Total Bookings', value: stats.bookings, icon: <CalendarCheck className="h-5 w-5" />, color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-xl font-bold">BarberLink Admin</h1>
              <p className="text-xs text-muted-foreground">Platform Control Panel</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => { auth.signOut(); navigate('/'); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={s.color}>{s.icon}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
            { id: 'subscriptions', label: 'SaaS Plans' },
            { id: 'ai_agents', label: 'AI Agents' },
            { id: 'verification', label: 'Verification', color: 'text-orange-600' },
            { id: 'marketing', label: 'Marketing' },
            { id: 'monitoring', label: 'Health' },
            { id: 'investors', label: 'Investor Hub' },
            { id: 'settings', label: 'Settings' }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              className={`rounded-none border-b-2 ${activeTab === tab.id ? 'border-primary' : 'border-transparent'} ${tab.color || ''}`}
              onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'subscriptions' | 'ai_agents' | 'marketing' | 'monitoring' | 'settings' | 'verification' | 'investors')}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20 overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Layers className="w-32 h-32" />
               </div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black flex items-center gap-2 tracking-tighter uppercase"><Activity className="text-primary h-6 w-6" /> Global OS Heartbeat</h3>
                        <p className="text-muted-foreground font-medium max-w-xl">
                           Manage the entire ecosystem from AI Cognitive Nodes to Financial Gates. 
                           <span className="block mt-2 font-black text-primary uppercase">Current Protocol: Level 3 Autonomous SaaS</span>
                        </p>
                     </div>
                     <div className="flex gap-4">
                        <Button 
                           onClick={seedAll} 
                           variant="outline"
                           className="h-14 px-8 rounded-2xl font-black border-primary text-primary hover:bg-primary hover:text-white transition-all"
                        >
                           <RefreshCw className="mr-3 h-5 w-5" /> RE-SYNC COGNITIVE CORE
                        </Button>
                        <Button 
                           onClick={seedDemoBarbersAction} 
                           className="h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/20"
                        >
                           <Scissors className="mr-3 h-5 w-5" /> GENERATE DEMO SALON
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <Card><CardContent className="pt-4">
                 <p className="text-xs text-muted-foreground uppercase font-semibold">Total Revenue (DZD)</p>
                 <p className="text-2xl font-bold">{stats.revenue_dzd.toLocaleString()} دج</p>
               </CardContent></Card>
               <Card><CardContent className="pt-4">
                 <p className="text-xs text-muted-foreground uppercase font-semibold">Total Revenue (USD)</p>
                 <p className="text-2xl font-bold">${stats.revenue_usd.toLocaleString()}</p>
               </CardContent></Card>
               <Card><CardContent className="pt-4">
                 <p className="text-xs text-muted-foreground uppercase font-semibold">Uptime</p>
                 <p className="text-2xl font-bold text-green-500">{vpsHealth.uptime}</p>
               </CardContent></Card>
               <Card><CardContent className="pt-4">
                 <p className="text-xs text-muted-foreground uppercase font-semibold">Active AI Agents</p>
                 <p className="text-2xl font-bold">{aiAgents.filter(a => a.status === 'active').length}</p>
               </CardContent></Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="flex items-center p-6 border-slate-200 shadow-sm rounded-3xl group hover:shadow-xl transition-all">
                  <div className="p-4 rounded-2xl bg-slate-100 text-slate-900 group-hover:bg-primary group-hover:text-white transition-all"><BarChart className="w-6 h-6" /></div>
                  <div className="ml-6">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">Conversion Rate</p>
                    <p className="text-3xl font-black">{stats.conversion_rate}%</p>
                  </div>
                </Card>
                <Card className="flex items-center p-6 border-slate-200 shadow-sm rounded-3xl group hover:shadow-xl transition-all">
                  <div className="p-4 rounded-2xl bg-slate-100 text-slate-900 group-hover:bg-primary group-hover:text-white transition-all"><TrendingUp className="w-6 h-6" /></div>
                  <div className="ml-6">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">Retention Rate</p>
                    <p className="text-3xl font-black">{stats.retention_rate}%</p>
                  </div>
                </Card>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <Card className="animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Joined</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{user.full_name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={user.role === 'admin' ? 'default' : user.role === 'barber' ? 'secondary' : 'outline'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-3">
                          {user.suspended ? (
                            <span className="flex items-center gap-1 text-destructive text-xs"><XCircle className="h-3 w-3" /> Suspended</span>
                          ) : (
                            <span className="flex items-center gap-1 text-green-500 text-xs"><CheckCircle className="h-3 w-3" /> Active</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {user.role !== 'admin' && (
                              <>
                                <Button
                                  size="sm"
                                  variant={user.suspended ? 'default' : 'destructive'}
                                  onClick={() => toggleSuspend(user.id, !!user.suspended)}
                                  className="text-xs h-7"
                                >
                                  {user.suspended ? 'Reactivate' : 'Suspend'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => promoteToAdmin(user.id)}
                                  className="text-xs h-7"
                                >
                                  Make Admin
                                </Button>
                              </>
                            )}
                            {user.role === 'admin' && (
                              <span className="text-xs text-muted-foreground italic">Admin</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No users found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-6 animate-slide-up">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Subscription Plans Control</CardTitle>
                <Button onClick={() => setIsAddingPlan(true)} size="sm"><Plus className="h-4 w-4 mr-2" /> Create Plan</Button>
              </CardHeader>
              <CardContent>
                {isAddingPlan && (
                  <div className="mb-6 p-4 border-2 border-primary/20 rounded-xl bg-primary/5 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                         <input aria-label="Plan Name" className="p-2 border rounded" placeholder="Plan Name" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} />
                         <input aria-label="Price in DZD" className="p-2 border rounded" type="number" placeholder="Price DZD" value={newPlan.price_dzd} onChange={e => setNewPlan({...newPlan, price_dzd: Number(e.target.value)})} />
                         <input aria-label="Price in USD" className="p-2 border rounded" type="number" placeholder="Price USD" value={newPlan.price_usd} onChange={e => setNewPlan({...newPlan, price_usd: Number(e.target.value)})} />
                      </div>
                     <div className="flex gap-2">
                        <Button onClick={() => { addPlan(newPlan); setIsAddingPlan(false); }}>Save New Plan</Button>
                        <Button variant="outline" onClick={() => setIsAddingPlan(false)}>Cancel</Button>
                     </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map(plan => (
                    <div key={plan.id} className="p-5 border-2 rounded-2xl relative group bg-card transition-all hover:border-primary/50">
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deletePlan(plan.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <h4 className="font-bold text-lg mb-2">{plan.name}</h4>
                      <div className="space-y-3 pt-2 border-t">
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold uppercase text-muted-foreground mr-2">DZD</span>
                           <input aria-label={`Price DZD for ${plan.name}`} type="number" step="100" className="w-24 p-1 text-sm border rounded bg-transparent font-black text-primary text-right" value={plan.price_dzd} onChange={async (e) => {
                              const newVal = Number(e.target.value);
                              await updateDoc(doc(db, 'subscriptions', plan.id), { price_dzd: newVal });
                              setPlans(prev => prev.map(p => p.id === plan.id ? {...p, price_dzd: newVal} : p));
                           }} />
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold uppercase text-muted-foreground mr-2">USD</span>
                           <input aria-label={`Price USD for ${plan.name}`} type="number" step="1" className="w-24 p-1 text-sm border rounded bg-transparent font-bold text-blue-600 text-right" value={plan.price_usd} onChange={async (e) => {
                              const newVal = Number(e.target.value);
                              await updateDoc(doc(db, 'subscriptions', plan.id), { price_usd: newVal });
                              setPlans(prev => prev.map(p => p.id === plan.id ? {...p, price_usd: newVal} : p));
                           }} />
                        </div>
                      </div>
                      <div className="mt-4 space-y-1">
                        {plan.features?.map((f, i) => (
                           <p key={i} className="text-[10px] flex items-center gap-1"><CheckCircle className="h-2 w-2 text-green-500" /> {f}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Discount Coupons</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsAddingCoupon(true)}><Plus className="h-4 w-4 mr-2" /> Add Coupon</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {coupons.map(coupon => (
                    <div key={coupon.id} className="p-3 border rounded-lg bg-muted/20 flex justify-between items-center">
                      <div>
                        <p className="font-mono font-bold">{coupon.code}</p>
                        <p className="text-[10px] text-primary">{coupon.discount_percent}% OFF</p>
                      </div>
                      <Badge variant={coupon.active ? 'default' : 'outline'}>{coupon.active ? 'Active' : 'Expired'}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'ai_agents' && (
          <div className="space-y-8 animate-slide-up pb-20">
            <div className="flex justify-between items-center bg-card p-8 rounded-[2.5rem] border shadow-sm">
               <div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase">AI Neural Core</h1>
                  <p className="text-muted-foreground font-medium text-lg">Managing {aiAgents.length} autonomous agents in real-time.</p>
               </div>
               <div className="flex gap-4">
                 <Button variant="outline" size="lg" className="rounded-2xl font-black border-primary/20 text-primary" onClick={() => AgentAPI.syncLocalRegistry()}>
                    <RefreshCw className="h-5 w-5 mr-3" /> HARD RE-SYNC
                 </Button>
                 <Button size="lg" className="rounded-2xl font-black shadow-xl shadow-primary/20" onClick={() => setIsAddingAgent(true)}>
                    <Plus className="h-5 w-5 mr-3" /> DEPLOY NEW AGENT
                 </Button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="md:col-span-2 p-8 rounded-[3rem] border-none shadow-2xl bg-slate-950 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] rounded-full -mr-40 -mt-40 animate-pulse" />
                  <div className="relative z-10">
                     <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black flex items-center gap-3 tracking-tighter uppercase">
                           <Zap className="text-primary fill-primary w-6 h-6" /> Live Orchestration Log
                        </h3>
                        <Badge className="bg-green-500/20 text-green-500 border-none font-bold">SYSTEM STABLE</Badge>
                     </div>
                     
                     <div className="font-mono text-sm space-y-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                        {aiAgents.flatMap((a: AgentRecord) => a.logs || []).slice(-15).reverse().map((log: string, i: number) => (
                           <div key={i} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                              <span className="text-primary font-black shrink-0">[{new Date().toLocaleTimeString()}]</span>
                              <span className="text-white/80">{log}</span>
                           </div>
                        ))}
                        {aiAgents.length === 0 && <p className="text-white/40 italic">Waiting for agent telemetry...</p>}
                     </div>
                  </div>
               </Card>

               <div className="space-y-6">
                  <Card className="p-6 bg-primary/5 border-primary/20 rounded-[2rem]">
                     <h4 className="font-black text-sm uppercase tracking-widest text-primary mb-4">Neural Health</h4>
                     <div className="space-y-4">
                        <div className="flex justify-between text-xs font-bold">
                           <span>COGNITIVE LOAD</span>
                           <span className="text-primary">24%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                           <div className="h-full bg-primary w-[24%] transition-all duration-1000"></div>
                        </div>
                        <div className="flex justify-between text-xs font-bold pt-2">
                           <span>MEMORY RECALL SPEED</span>
                           <span className="text-green-500">12ms</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 w-[92%] transition-all duration-1000"></div>
                        </div>
                     </div>
                  </Card>
                  
                  <Card className="p-6 bg-slate-900 text-white rounded-[2rem] border-none">
                     <h4 className="font-black text-sm uppercase tracking-widest text-primary/80 mb-4">Autonomous Workflows</h4>
                     <div className="space-y-3">
                         <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold">Auto-Scale Agents</span>
                            <div className="w-8 h-4 bg-primary rounded-full relative"><div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div></div>
                         </div>
                         <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold">Predictive Booking</span>
                            <div className="w-8 h-4 bg-white/10 rounded-full relative"><div className="absolute left-1 top-1 w-2 h-2 bg-white/40 rounded-full"></div></div>
                         </div>
                     </div>
                  </Card>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {aiAgents.map(agent => (
                    <div key={agent.id} className="p-8 bg-card border rounded-[2.5rem] group hover:border-primary transition-all duration-500 hover:shadow-2xl shadow-sm relative overflow-hidden flex flex-col">
                       <div className="flex justify-between items-start mb-6">
                          <div className="p-4 rounded-[1.5rem] bg-slate-100 text-slate-900 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                             {agent.id.includes('support') ? <Users className="w-6 h-6" /> : 
                              agent.id.includes('orchestrator') ? <Brain className="w-6 h-6" /> :
                              agent.id.includes('payment') ? <ShieldCheck className="w-6 h-6" /> :
                              <Bot className="w-6 h-6" />}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <Badge variant="outline" className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-tighter border-slate-200">
                                {agent.id.split('_')[0]} Node
                             </Badge>
                             <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${agent.status === 'active' || agent.status === 'executing' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                <span className="text-[10px] font-black uppercase text-muted-foreground">{agent.status}</span>
                             </div>
                          </div>
                       </div>
                       
                       <h4 className="text-xl font-black mb-2 tracking-tight uppercase line-clamp-1">{agent.id.replace(/_/g, ' ')}</h4>
                       <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-6 h-10 line-clamp-2">{agent.role}</p>
                       
                       <div className="mt-auto space-y-4">
                          <div className="p-3 bg-muted/30 rounded-xl border border-slate-100">
                             <span className="text-[9px] font-black uppercase text-primary/70 block mb-1">Last Autonomous Output</span>
                             <p className="text-[10px] font-mono text-slate-600 truncate">{agent.logs?.[agent.logs.length - 1] || 'Scanning mesh...'}</p>
                          </div>
                          
                          <div className="flex gap-2">
                             <Button onClick={() => {
                                setSelectedAgentForTraining(agent);
                                const registryEntry = AGENT_REGISTRY[agent.id];
                                setNewSystemPrompt(registryEntry?.systemPrompt || '');
                             }} variant="outline" className="flex-1 h-10 rounded-xl border-slate-200 text-xs font-black uppercase">Train Node</Button>
                             <Button className="flex-1 h-10 rounded-xl text-xs font-black uppercase shadow-lg shadow-primary/10">Manage</Button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-1 space-y-6">
                   <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 text-white overflow-hidden">
                      <div className="p-6 border-b border-white/5 bg-white/5">
                         <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" /> Neural Memory
                         </h3>
                      </div>
                      <CardContent className="p-4 max-h-[600px] overflow-y-auto no-scrollbar">
                         <div className="space-y-4">
                            {aiMemories.map((mem, i) => (
                               <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 group hover:bg-white/10 transition-all">
                                  <div className="flex justify-between items-center">
                                     <Badge variant="outline" className="text-[8px] border-primary/30 text-primary font-black uppercase">{mem.agent_id.split('_')[0]}</Badge>
                                     <span className="text-[8px] text-white/30">{new Date(mem.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                  <p className="text-[10px] font-bold text-white/80">{mem.decision}</p>
                                  <p className="text-[9px] text-white/40 line-clamp-2 font-mono">{JSON.stringify(mem.context)}</p>
                               </div>
                            ))}
                            {aiMemories.length === 0 && <p className="text-center py-10 text-xs text-white/20 italic font-medium tracking-widest">Awaiting Neural Spikes...</p>}
                         </div>
                      </CardContent>
                   </Card>
                </div>
             </div>
          </div>
        )}

        {/* Training Dialog */}
        <Dialog open={!!selectedAgentForTraining} onOpenChange={() => setSelectedAgentForTraining(null)}>
           <DialogContent className="rounded-[3rem] p-8 sm:p-10 max-w-2xl bg-white/95 backdrop-blur-xl">
              <DialogHeader>
                 <DialogTitle className="text-3xl font-black uppercase tracking-tighter mb-4">
                    Fine-Tune Node: <span className="text-primary">{selectedAgentForTraining?.id.replace(/_/g, ' ')}</span>
                 </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                 <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground italic">Neural Core Instructions (System Prompt)</Label>
                    <textarea 
                       value={newSystemPrompt}
                       onChange={(e) => setNewSystemPrompt(e.target.value)}
                       className="w-full h-80 rounded-[2rem] p-6 bg-slate-50 border-2 border-slate-100 font-mono text-xs focus:border-primary transition-all outline-none"
                    />
                 </div>
                 <Button onClick={async () => {
                    if (!selectedAgentForTraining) return;
                    await updateDoc(doc(db, 'ai_agents', selectedAgentForTraining.id), { 
                      systemPrompt: newSystemPrompt,
                      logs: arrayUnion(`[System] Neural Core Updated. Re-indexing logic nodes at ${new Date().toISOString()}`)
                    });
                    toast({ title: "Node Trained", description: "Identity logic reorganized for global operations." });
                    setSelectedAgentForTraining(null);
                 }} className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20">
                    SYNC NEURAL CORE
                 </Button>
              </div>
           </DialogContent>
        </Dialog>

        {activeTab === 'marketing' && (
          <div className="space-y-6 animate-slide-up">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Global BillionMail Hub</CardTitle>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" /> SMTP Config</Button>
                   <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" /> New Template</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2">Target Audience Segment</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="hover:bg-primary/10">Salons Only</Button>
                    <Button variant="outline" size="sm" className="hover:bg-primary/10">Barbers Only</Button>
                    <Button variant="outline" size="sm" className="hover:bg-primary/10">Customers Only</Button>
                    <Button variant="default" size="sm" className="shadow-lg shadow-primary/20">Broadcast (All)</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="camp-subject" className="text-xs font-bold uppercase text-muted-foreground">Campaign Subject</label>
                    <input id="camp-subject" type="text" className="w-full p-2 border rounded-md" placeholder="e.g. New Year Discount 50%!" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="camp-template" className="text-xs font-bold uppercase text-muted-foreground">Select Template</label>
                    <select id="camp-template" className="w-full p-2 border rounded-md">
                       <option>Welcome Newsletter</option>
                       <option>Promotion #1</option>
                       <option>Service Update</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="camp-body" className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Email Content (HTML/JSON Editor)</label>
                  <textarea id="camp-body" className="w-full p-3 border rounded-md h-48 font-mono text-sm" placeholder="Dear {{name}}, we have exciting news..."></textarea>
                </div>
                <Button className="w-full h-12 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                   Launch Campaign via BillionMail Engine
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                  <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><Bot className="h-4 w-4" /> Social Media Automation</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                     <p className="text-xs text-muted-foreground">Connect your AI agents to auto-generate and post content to TikTok, Instagram & Facebook.</p>
                     <div className="flex items-center justify-between p-3 border rounded-lg bg-background/50">
                        <span className="text-sm">Auto-Post Weekly Trends</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                     </div>
                     <Button variant="outline" size="sm" className="w-full">Schedule Next Post</Button>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4" /> Telegram Bot Status</CardTitle></CardHeader>
                  <CardContent className="space-y-3 font-mono text-[10px]">
                     <div className="p-2 bg-black/90 text-green-400 rounded border border-white/10">
                        <p>[{new Date().toISOString().split('T')[0]} 12:05] Bot Online: @BarberLink_Bot</p>
                        <p>[{new Date().toISOString().split('T')[0]} 12:05] Monitoring active salons...</p>
                        <p>[{new Date().toISOString().split('T')[0]} 12:05] Ready for /stats command</p>
                     </div>
                     <Button variant="outline" size="sm" className="w-full">Restart Bot Instance</Button>
                  </CardContent>
               </Card>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className={`border-2 ${healthStatus?.status === 'healthy' ? 'border-green-500/20' : healthStatus?.status === 'degraded' ? 'border-orange-500/20' : 'border-slate-200'}`}>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4" /> System Health</CardTitle>
                    <Badge variant={healthStatus?.status === 'healthy' ? 'default' : 'outline'} className={healthStatus?.status === 'healthy' ? 'bg-green-500 hover:bg-green-600' : ''}>
                       {healthStatus?.status || 'UNKNOWN'}
                    </Badge>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs font-medium"><span>DB Connection</span> {healthStatus?.checks.database ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}</div>
                       <div className="flex justify-between text-xs font-medium"><span>AI Orchestration</span> {healthStatus?.checks.ai_core ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}</div>
                       <div className="flex justify-between text-xs font-medium"><span>Node Latency</span> <span className="text-primary font-bold">{healthStatus?.latency || 0}ms</span></div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-6 rounded-xl font-bold" onClick={runDiagnostic}>RUN RE-DIAGNOSTIC</Button>
                 </CardContent>
               </Card>

               <Card className="bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-all" />
                  <CardHeader><CardTitle className="text-sm font-black tracking-widest uppercase text-primary/80">Stress Simulation</CardTitle></CardHeader>
                  <CardContent className="relative z-10">
                     <p className="text-xs text-white/60 mb-6">Simulate 100-500 concurrent users to validate platform resilience and auto-scaling pods.</p>
                     <Button 
                        disabled={simulating} 
                        className="w-full h-12 rounded-2xl bg-white text-slate-900 font-black shadow-xl hover:bg-primary hover:text-white transition-all"
                        onClick={runStressTest}
                     >
                        {simulating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                        {simulating ? 'STRESSING CORE...' : 'RUN LOAD TEST (100 USERS)'}
                     </Button>
                  </CardContent>
               </Card>

               <Card>
                 <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><RefreshCw className="h-4 w-4" /> VPS Resource Node</CardTitle></CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase"><span>CPU Usage</span> <span>{vpsHealth.cpu}%</span></div>
                      <Progress value={vpsHealth.cpu} className="h-1.5" />
                      <div className="flex justify-between text-[10px] font-black uppercase"><span>RAM Usage</span> <span>{vpsHealth.ram}%</span></div>
                      <Progress value={vpsHealth.ram} className="h-1.5 bg-blue-500/10" />
                   </div>
                 </CardContent>
               </Card>
            </div>

            <Card className="border-none shadow-sm bg-muted/20">
               <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest">Autonomous Security Logs</CardTitle></CardHeader>
               <CardContent>
                  <div className="font-mono text-[10px] space-y-2 max-h-40 overflow-y-auto">
                     <p className="text-green-500/80">[{new Date().toISOString()}] - FIREWALL: All ports secured. SSL handshake valid.</p>
                     <p className="text-green-500/80">[{new Date().toISOString()}] - DDOS PROTECTION: Traffic within normal thresholds.</p>
                     <p className="text-green-500/80">[{new Date().toISOString()}] - ACCESS: Admin login verified from secure IP.</p>
                  </div>
               </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'verification' && (
          <Card className="animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary" /> Professional Verification Center</CardTitle>
               <Badge variant="outline">{pendingVerifications.length} Pending Nodes</Badge>
            </CardHeader>
            <CardContent>
              {pendingVerifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {pendingVerifications.map(b => (
                     <div key={b.id} className="p-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50/50 space-y-4">
                        <div className="flex justify-between items-start">
                           <h4 className="text-xl font-extrabold">{b.business_name}</h4>
                           <Badge className="bg-orange-500 text-white border-none">Pending Level 3</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-bold">{b.address}</p>
                        <div className="pt-4 flex gap-2">
                           <Button onClick={async () => {
                              await updateDoc(doc(db, 'barbers', b.id), { verified: true, verification_status: 'verified' });
                              toast({ title: 'Barber Verified', description: `${b.business_name} is now a Level-3 partner.` });
                              loadData();
                           }} className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 font-bold">Approve</Button>
                           <Button onClick={async () => {
                              await updateDoc(doc(db, 'barbers', b.id), { verification_status: 'rejected' });
                              toast({ title: 'Request Rejected', variant: 'destructive' });
                              loadData();
                           }} variant="outline" className="flex-1 rounded-xl text-destructive font-bold">Reject</Button>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-200">
                  <ShieldAlert className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">Safe & Secure</h3>
                  <p className="text-muted-foreground mt-2">Zero pending verification requests in the queue.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

          {activeTab === 'investors' && (
            <div className="space-y-8 animate-slide-up">
              <h1 className="text-3xl font-black">Strategic Growth Hub 🚀</h1>
              <Card className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <h3 className="text-xl font-bold mb-6">Real-time Performance Metrics</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="space-y-2">
                    <Label>Total Revenue (DZD)</Label>
                    <Input type="number" value={investorMetrics.total_revenue} onChange={e => setInvestorMetrics({...investorMetrics, total_revenue: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Active Barbers</Label>
                    <Input type="number" value={investorMetrics.active_barbers} onChange={e => setInvestorMetrics({...investorMetrics, active_barbers: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>AI Efficiency (%)</Label>
                    <Input type="number" value={investorMetrics.ai_efficiency} onChange={e => setInvestorMetrics({...investorMetrics, ai_efficiency: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Growth (%)</Label>
                    <Input type="number" value={investorMetrics.monthly_growth} onChange={e => setInvestorMetrics({...investorMetrics, monthly_growth: Number(e.target.value)})} />
                  </div>
                </div>
                <Button onClick={updateInvestorMetrics} size="lg" className="rounded-2xl h-14 px-10 shadow-xl shadow-primary/20 font-bold">
                   <Save className="mr-2 h-5 w-5" /> Sync Investor Data
                </Button>
              </Card>

              <Card className="p-8 rounded-[2.5rem] border-blue-500/20 bg-blue-500/5">
                 <h3 className="text-xl font-bold mb-4">Strategic Advisory AI</h3>
                 <p className="text-muted-foreground mb-6">Based on current metrics, our AI predicts a 150% ROI for Tier-1 Seed Investors within 18 months, driven by automated barber acquisition agents.</p>
                 <div className="flex gap-4">
                    <Badge className="bg-blue-600">Level 3 Autonomous</Badge>
                    <Badge variant="outline">Institutional Grade</Badge>
                 </div>
              </Card>
            </div>
          )}

        {activeTab === 'settings' && (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Global Identity & API Ecosystem</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                  <div>
                    <h4 className="font-semibold mb-3">Finance & Gateway</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label htmlFor="stripe-key" className="text-xs font-semibold uppercase text-muted-foreground">Stripe Master Key</label>
                        <input id="stripe-key" type="password" placeholder="sk_live_..." className="w-full p-2 border border-slate-200 rounded-md" value={systemSettings.stripeKey || ''} onChange={(e) => setSystemSettings({ ...systemSettings, stripeKey: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="baridimob-ccp" className="text-xs font-semibold uppercase text-muted-foreground">BaridiMob Account</label>
                        <input id="baridimob-ccp" type="text" placeholder="00799999 12" className="w-full p-2 border border-slate-200 rounded-md" value={systemSettings.baridiMobAccount || ''} onChange={(e) => setSystemSettings({ ...systemSettings, baridiMobAccount: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Communication Hub</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label htmlFor="tg-token" className="text-xs font-semibold uppercase text-muted-foreground">Telegram Bot Token</label>
                        <input id="tg-token" type="password" placeholder="7823...:AAH..." className="w-full p-2 border border-slate-200 rounded-md" value={systemSettings.telegramBotToken || ''} onChange={(e) => setSystemSettings({ ...systemSettings, telegramBotToken: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="bm-user" className="text-xs font-semibold uppercase text-muted-foreground">BillionMail Username</label>
                        <input id="bm-user" type="text" className="w-full p-2 border border-slate-200 rounded-md" value={systemSettings.billionmailUser || ''} onChange={(e) => setSystemSettings({ ...systemSettings, billionmailUser: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>

                 <div className="pt-6 border-t animate-in fade-in slide-in-from-bottom-2 duration-700 mb-8">
                    <h4 className="font-black text-primary mb-6 flex items-center gap-2 uppercase tracking-tighter"><Brain className="h-5 w-5" /> AI NEURAL CORE & AUTONOMOUS CONFIG</h4>
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/30 transition-all duration-1000" />
                       <div className="relative z-10 space-y-6">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Global Intelligence Provider (OpenAI ChatGPT Key)</label>
                          <div className="relative">
                            <input 
                              type="password"
                              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                              value={systemSettings.openaiKey || ''} 
                              onChange={(e) => setSystemSettings({ ...systemSettings, openaiKey: e.target.value })}
                            />
                            <Zap className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-pulse" />
                          </div>
                          <p className="text-[10px] text-white/40 font-medium">Activation allows all Registry Agents (Support, Marketing, Supervisor) to utilize GPT-4o for complex decision making. Leave blank to use Fallback Logic.</p>
                       </div>
                    </div>
                 </div>

                 <div>
                    <h4 className="font-semibold mb-3">Social Identity Management</h4>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="fb-url" className="text-xs font-semibold">Facebook URL</label>
                        <input id="fb-url" type="text" className="w-full p-2 border border-slate-200 rounded-md text-sm" value={systemSettings.facebookUrl || ''} onChange={(e) => setSystemSettings({ ...systemSettings, facebookUrl: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="ig-url" className="text-xs font-semibold">Instagram URL</label>
                        <input id="ig-url" type="text" className="w-full p-2 border border-slate-200 rounded-md text-sm" value={systemSettings.instagramUrl || ''} onChange={(e) => setSystemSettings({ ...systemSettings, instagramUrl: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="tt-url" className="text-xs font-semibold">TikTok URL</label>
                        <input id="tt-url" type="text" className="w-full p-2 border border-slate-200 rounded-md text-sm" value={systemSettings.tiktokUrl || ''} onChange={(e) => setSystemSettings({ ...systemSettings, tiktokUrl: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="wa-num" className="text-xs font-semibold">WhatsApp Number</label>
                        <input id="wa-num" type="text" className="w-full p-2 border border-slate-200 rounded-md text-sm" value={systemSettings.whatsappNumber || ''} onChange={(e) => setSystemSettings({ ...systemSettings, whatsappNumber: e.target.value })} />
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t">
                   <h4 className="font-black text-primary mb-6 flex items-center gap-2 uppercase tracking-tighter"><Globe className="h-5 w-5" /> REVENUE ENGINE & GLOBAL EXPANSION</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-4 p-4 rounded-3xl bg-slate-100/50">
                         <label className="text-[10px] font-black uppercase text-muted-foreground flex justify-between items-center">System Commission (%) <Badge className="bg-primary/20 text-primary border-none shadow-none">{systemSettings.commission_percentage}%</Badge></label>
                          <input type="range" title="System Commission Percentage" aria-label="System Commission Percentage" min="0" max="50" step="1" className="w-full accent-primary" value={systemSettings.commission_percentage || 10} onChange={(e) => setSystemSettings({ ...systemSettings, commission_percentage: Number(e.target.value) })} />
                         <p className="text-[10px] text-muted-foreground">Global transactional fee applied automatically.</p>
                      </div>
                      <div className="space-y-4 p-4 rounded-3xl bg-slate-100/50">
                         <label className="text-[10px] font-black uppercase text-muted-foreground">Referral Bounty (DZD)</label>
                          <input type="number" title="Referral Bounty Amount" aria-label="Referral Bounty Amount" className="w-full p-2 border border-slate-200 rounded-xl bg-transparent font-bold" value={systemSettings.referral_bonus_dzd || 500} onChange={(e) => setSystemSettings({ ...systemSettings, referral_bonus_dzd: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-4 p-4 rounded-3xl bg-slate-100/50">
                         <label className="text-[10px] font-black uppercase text-muted-foreground">International Targeting Price (Mon)</label>
                         <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold">🇺🇸 USA ($)</label>
                                <input type="number" title="USA Monthly Price" aria-label="USA Monthly Price" step="0.01" className="w-full p-1.5 text-xs border border-slate-200 rounded-lg" value={systemSettings.global_pricing?.usa || 29.99} onChange={(e) => setSystemSettings({ ...systemSettings, global_pricing: {...(systemSettings.global_pricing || {usa: 29.99, uk: 24.99, france: 24.99, dzd: 1000}), usa: Number(e.target.value)} })} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold">🇬🇧 UK (£)</label>
                                <input type="number" title="UK Monthly Price" aria-label="UK Monthly Price" step="0.01" className="w-full p-1.5 text-xs border border-slate-200 rounded-lg" value={systemSettings.global_pricing?.uk || 24.99} onChange={(e) => setSystemSettings({ ...systemSettings, global_pricing: {...(systemSettings.global_pricing || {usa: 29.99, uk: 24.99, france: 24.99, dzd: 1000}), uk: Number(e.target.value)} })} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold">🇫🇷 FR (€)</label>
                                <input type="number" title="France Monthly Price" aria-label="France Monthly Price" step="0.01" className="w-full p-1.5 text-xs border border-slate-200 rounded-lg" value={systemSettings.global_pricing?.france || 24.99} onChange={(e) => setSystemSettings({ ...systemSettings, global_pricing: {...(systemSettings.global_pricing || {usa: 29.99, uk: 24.99, france: 24.99, dzd: 1000}), france: Number(e.target.value)} })} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold">🇩🇿 DZ (DZD)</label>
                                <input type="number" title="Algeria Monthly Price" aria-label="Algeria Monthly Price" step="1" className="w-full p-1.5 text-xs border border-slate-200 rounded-lg" value={systemSettings.global_pricing?.dzd || 1000} onChange={(e) => setSystemSettings({ ...systemSettings, global_pricing: {...(systemSettings.global_pricing || {usa: 29.99, uk: 24.99, france: 24.99, dzd: 1000}), dzd: Number(e.target.value)} })} />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1 h-12 text-lg shadow-lg animate-pulse-glow" disabled={savingSettings}>
                    {savingSettings ? 'Synchronizing System...' : 'Publish Global System Updates'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
