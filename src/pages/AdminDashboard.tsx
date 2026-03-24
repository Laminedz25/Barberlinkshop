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

interface SystemSettings {
  stripe_key?: string;
  baridimob_ccp?: string;
  cib_merchant_id?: string;
  notification_email?: string;
  service_fee_percent?: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState({ users: 0, barbers: 0, bookings: 0 });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({});
  const [savingSettings, setSavingSettings] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [usersSnap, barbersSnap, bookingsSnap, settingsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), orderBy('created_at', 'desc'), limit(50))),
        getDocs(collection(db, 'barbers')),
        getDocs(collection(db, 'bookings')),
        getDoc(doc(db, 'system', 'settings'))
      ]);
      const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as UserRecord));
      setUsers(usersData);
      setStats({ users: usersSnap.size, barbers: barbersSnap.size, bookings: bookingsSnap.size });
      if (settingsSnap.exists()) {
        setSystemSettings(settingsSnap.data());
      }
    } catch (err) {
      toast({ title: 'Error loading data', description: String(err), variant: 'destructive' });
    }
  }, [toast]);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateDoc(doc(db, 'system', 'settings'), { ...systemSettings });
      toast({ title: 'Settings Saved', description: 'System configuration updated successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'destructive' });
    } finally {
      setSavingSettings(false);
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

  const toggleSuspend = async (userId: string, currently: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { suspended: !currently });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, suspended: !currently } : u));
      toast({ title: currently ? 'User Reactivated' : 'User Suspended' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to make this user an admin?')) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: 'admin' });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'admin' } : u));
      toast({ title: 'User promoted to admin' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
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
        <div className="flex gap-4 border-b">
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            className="rounded-none border-b-2 border-transparent"
            onClick={() => setActiveTab('users')}
          >
            Users Management
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            className="rounded-none border-b-2 border-transparent"
            onClick={() => setActiveTab('settings')}
          >
            System Settings
          </Button>
        </div>

        {activeTab === 'users' && (
          <Card>
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

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveSettings} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="stripe-key" className="text-sm font-medium">Stripe API Key</label>
                    <input
                      id="stripe-key"
                      type="password"
                      placeholder="sk_live_..."
                      className="w-full p-2 border rounded-md"
                      value={systemSettings.stripe_key || ''}
                      onChange={(e) => setSystemSettings({ ...systemSettings, stripe_key: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="baridimob-ccp" className="text-sm font-medium">BaridiMob CCP</label>
                    <input
                      id="baridimob-ccp"
                      type="text"
                      placeholder="00799999 12"
                      className="w-full p-2 border rounded-md"
                      value={systemSettings.baridimob_ccp || ''}
                      onChange={(e) => setSystemSettings({ ...systemSettings, baridimob_ccp: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cib-id" className="text-sm font-medium">CIB Merchant ID</label>
                    <input
                      id="cib-id"
                      type="text"
                      placeholder="MAG1234567"
                      className="w-full p-2 border rounded-md"
                      value={systemSettings.cib_merchant_id || ''}
                      onChange={(e) => setSystemSettings({ ...systemSettings, cib_merchant_id: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="admin-email" className="text-sm font-medium">Admin Notification Email</label>
                    <input
                      id="admin-email"
                      type="email"
                      placeholder="admin@barberlink.cloud"
                      className="w-full p-2 border rounded-md"
                      value={systemSettings.notification_email || ''}
                      onChange={(e) => setSystemSettings({ ...systemSettings, notification_email: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={savingSettings}>
                  {savingSettings ? 'Saving...' : 'Update Settings'}
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
