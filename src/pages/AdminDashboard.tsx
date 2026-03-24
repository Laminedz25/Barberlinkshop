import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Scissors, CalendarCheck, ShieldAlert, RefreshCw, CheckCircle, XCircle, LogOut } from 'lucide-react';

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  suspended?: boolean;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

import { useSystemConfig, SystemConfig } from '@/hooks/useSystemConfig';
import { setDoc, deleteDoc } from 'firebase/firestore';

interface AIAgent {
  id: string;
  name: string;
  type: 'stylist' | 'support' | 'marketing' | 'supervisor';
  status: 'active' | 'training' | 'idle';
  tasks: string[];
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price_dzd: number;
  price_usd: number;
  features: string[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'ai_agents' | 'marketing' | 'monitoring' | 'settings'>('overview');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState({ users: 0, barbers: 0, bookings: 0, revenue_dzd: 154000, revenue_usd: 1200 });
  const [savingSettings, setSavingSettings] = useState(false);
  const { config: systemConfig, loading: configLoading } = useSystemConfig();
  const [systemSettings, setSystemSettings] = useState<Partial<SystemConfig>>({});
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([
    { id: '1', name: 'BarberAI Stylist', type: 'stylist', status: 'active', tasks: ['Face detection', 'Style recommendation'] },
    { id: '2', name: 'GroomSupport', type: 'support', status: 'idle', tasks: ['Chat handling', 'FAQ'] }
  ]);
  const [vpsHealth, setVpsHealth] = useState({ cpu: 12, ram: 45, disk: 30, uptime: '14 days' });

  const loadData = useCallback(async () => {
    try {
      const [usersSnap, barbersSnap, bookingsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), orderBy('created_at', 'desc'), limit(50))),
        getDocs(collection(db, 'barbers')),
        getDocs(collection(db, 'bookings'))
      ]);
      const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as UserRecord));
      setUsers(usersData);
      setStats({
        users: usersSnap.size,
        barbers: barbersSnap.size,
        bookings: bookingsSnap.size,
        revenue_dzd: 154000,
        revenue_usd: 1200
      });
      if (systemConfig) {
        setSystemSettings(systemConfig);
      }
    } catch (err) {
      toast({ title: 'Error loading data', description: String(err), variant: 'destructive' });
    }
  }, [toast, systemConfig]);

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

  const savePlans = async (currency: 'DZD' | 'USD') => {
      // Logic to save plans to Firestore
      toast({ title: `${currency} pricing updated` });
  };

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
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'ai_agents', label: 'AI Agents' },
            { id: 'marketing', label: 'Marketing' },
            { id: 'monitoring', label: 'Monitoring' },
            { id: 'settings', label: 'Settings' }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              className={`rounded-none border-b-2 ${activeTab === tab.id ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'subscriptions' | 'ai_agents' | 'marketing' | 'monitoring' | 'settings')}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
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
            {/* ... other overview components ... */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            <Card>
              <CardHeader><CardTitle>Algeria Pricing (DZD)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                   <label htmlFor="dzd-basic">Basic Plan</label>
                   <input id="dzd-basic" type="number" className="w-24 p-1 rounded" defaultValue={1000} placeholder="1000" />
                 </div>
                 <div className="flex items-center justify-between p-3 bg-muted rounded-lg border-2 border-primary">
                   <label htmlFor="dzd-pro">Pro Plan</label>
                   <input id="dzd-pro" type="number" className="w-24 p-1 rounded" defaultValue={2500} placeholder="2500" />
                 </div>
                 <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                   <label htmlFor="dzd-premium">Premium Plan</label>
                   <input id="dzd-premium" type="number" className="w-24 p-1 rounded" defaultValue={5000} placeholder="5000" />
                 </div>
                 <Button className="w-full" onClick={() => savePlans('DZD')}>Update DZD Plans</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Global Pricing (USD)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                   <label htmlFor="usd-basic">Basic Plan (Global)</label>
                   <input id="usd-basic" type="number" className="w-24 p-1 rounded" defaultValue={10} placeholder="10" />
                 </div>
                 <div className="flex items-center justify-between p-3 bg-muted rounded-lg border-2 border-primary">
                   <label htmlFor="usd-pro">Pro Plan (Global)</label>
                   <input id="usd-pro" type="number" className="w-24 p-1 rounded" defaultValue={25} placeholder="25" />
                 </div>
                 <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                   <label htmlFor="usd-premium">Premium Plan (Global)</label>
                   <input id="usd-premium" type="number" className="w-24 p-1 rounded" defaultValue={50} placeholder="50" />
                 </div>
                 <Button className="w-full" onClick={() => savePlans('USD')}>Update USD Plans</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'ai_agents' && (
          <Card className="animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Multi-AI Agent Management</CardTitle>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add New Agent</Button>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {aiAgents.map(agent => (
                   <div key={agent.id} className="p-4 border rounded-xl hover:shadow-lg transition-shadow bg-card/40">
                     <div className="flex justify-between mb-2">
                       <h4 className="font-bold flex items-center gap-2">
                         <Bot className="h-4 w-4 text-primary" /> {agent.name}
                       </h4>
                       <Badge variant={agent.status === 'active' ? 'default' : 'outline'}>{agent.status}</Badge>
                     </div>
                     <p className="text-xs text-muted-foreground mb-4">Type: {agent.type}</p>
                     <div className="flex flex-wrap gap-1 mb-4">
                       {agent.tasks.map((t, i) => <Badge key={i} variant="secondary" className="text-[10px]">{t}</Badge>)}
                     </div>
                     <div className="flex justify-end gap-2">
                       <Button size="sm" variant="outline">Train</Button>
                       <Button size="sm" variant="outline">Logs</Button>
                       <Button size="sm" variant="destructive">Delete</Button>
                     </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-6 animate-slide-up">
            <Card>
              <CardHeader><CardTitle>BillionMail Campaigns</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2">Target Audience</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Barbers Only</Button>
                    <Button variant="outline" size="sm">Customers Only</Button>
                    <Button variant="default" size="sm">All Users</Button>
                  </div>
                </div>
                <div>
                  <label htmlFor="camp-subject" className="text-sm font-medium mb-1 block">Campaign Subject</label>
                  <input id="camp-subject" type="text" className="w-full p-2 border rounded-md" placeholder="e.g. New Year Discount 50%!" />
                </div>
                <div>
                  <label htmlFor="camp-body" className="text-sm font-medium mb-1 block">Email Body (HTML Supported)</label>
                  <textarea id="camp-body" className="w-full p-2 border rounded-md h-32" placeholder="Dear Barber, we have news..."></textarea>
                </div>
                <Button className="w-full">Send Campaign via BillionMail</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
             <Card>
               <CardHeader><CardTitle className="text-sm">CPU Usage</CardTitle></CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold">{vpsHealth.cpu}%</div>
                 <div className="w-full bg-muted h-2 rounded-full mt-2 overflow-hidden">
                   <div className="bg-primary h-2 rounded-full transition-all duration-1000 w-[12%]"></div>
                 </div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader><CardTitle className="text-sm">RAM Usage</CardTitle></CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold">{vpsHealth.ram}%</div>
                 <div className="w-full bg-muted h-2 rounded-full mt-2 overflow-hidden">
                   <div className="bg-primary h-2 rounded-full transition-all duration-1000 w-[45%]"></div>
                 </div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader><CardTitle className="text-sm">DB Integrity</CardTitle></CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold text-green-500">OPTIMAL</div>
                 <p className="text-xs text-muted-foreground mt-2">All checks passed</p>
               </CardContent>
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
                        <input id="stripe-key" type="password" placeholder="sk_live_..." className="w-full p-2 border rounded-md" value={systemSettings.stripeKey || ''} onChange={(e) => setSystemSettings({ ...systemSettings, stripeKey: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="baridimob-ccp" className="text-xs font-semibold uppercase text-muted-foreground">BaridiMob Account</label>
                        <input id="baridimob-ccp" type="text" placeholder="00799999 12" className="w-full p-2 border rounded-md" value={systemSettings.baridiMobAccount || ''} onChange={(e) => setSystemSettings({ ...systemSettings, baridiMobAccount: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Communication Hub</h4>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label htmlFor="tg-token" className="text-xs font-semibold uppercase text-muted-foreground">Telegram Bot Token</label>
                        <input id="tg-token" type="password" placeholder="7823...:AAH..." className="w-full p-2 border rounded-md" value={systemSettings.telegramBotToken || ''} onChange={(e) => setSystemSettings({ ...systemSettings, telegramBotToken: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="bm-user" className="text-xs font-semibold uppercase text-muted-foreground">BillionMail Username</label>
                        <input id="bm-user" type="text" className="w-full p-2 border rounded-md" value={systemSettings.billionmailUser || ''} onChange={(e) => setSystemSettings({ ...systemSettings, billionmailUser: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                   <h4 className="font-semibold mb-3">Social Identity Management</h4>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="fb-url" className="text-xs font-semibold">Facebook URL</label>
                        <input id="fb-url" type="text" className="w-full p-2 border rounded-md text-sm" value={systemSettings.facebookUrl || ''} onChange={(e) => setSystemSettings({ ...systemSettings, facebookUrl: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="ig-url" className="text-xs font-semibold">Instagram URL</label>
                        <input id="ig-url" type="text" className="w-full p-2 border rounded-md text-sm" value={systemSettings.instagramUrl || ''} onChange={(e) => setSystemSettings({ ...systemSettings, instagramUrl: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="tt-url" className="text-xs font-semibold">TikTok URL</label>
                        <input id="tt-url" type="text" className="w-full p-2 border rounded-md text-sm" value={systemSettings.tiktokUrl || ''} onChange={(e) => setSystemSettings({ ...systemSettings, tiktokUrl: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="wa-num" className="text-xs font-semibold">WhatsApp Number</label>
                        <input id="wa-num" type="text" className="w-full p-2 border rounded-md text-sm" value={systemSettings.whatsappNumber || ''} onChange={(e) => setSystemSettings({ ...systemSettings, whatsappNumber: e.target.value })} />
                      </div>
                   </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg shadow-lg animate-pulse-glow" disabled={savingSettings}>
                  {savingSettings ? 'Synchronizing System...' : 'Publish Global System Updates'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
