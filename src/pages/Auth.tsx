import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Checkbox } from '@/components/ui/checkbox';
import { FcGoogle } from 'react-icons/fc';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import LocationPicker from '@/components/LocationPicker';
import { Home, Phone, User as UserIcon, Users } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState<string | undefined>('');
  const [userType, setUserType] = useState<'customer' | 'salon_owner' | 'salon_barber' | 'mobile_barber'>('customer');
  const [country, setCountry] = useState('Algeria');
  const [stateProv, setStateProv] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Coordinates for Barbers
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [completingProfile, setCompletingProfile] = useState(false);
  const [socialUser, setSocialUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !completingProfile) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (user.email === 'admin@barberlink.cloud') {
           if (!docSnap.exists() || docSnap.data().role !== 'admin') {
              await setDoc(docRef, { role: 'admin', email: user.email, full_name: 'Super Admin' }, { merge: true });
           }
           navigate('/admin');
           return;
        }

        if (docSnap.exists()) {
          const role = docSnap.data().role;
          if (role === 'admin') navigate('/admin');
          else if (role === 'barber') navigate('/dashboard');
          else navigate('/');
        } else {
          setSocialUser(user);
          setEmail(user.email || '');
          setFullName(user.displayName || '');
          setCompletingProfile(true);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, completingProfile]);

  const handleSocialLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createFirestoreUser = async (userAcc: User) => {
    const role = userAcc.email === 'admin@barberlink.cloud' ? 'admin' : (userType === 'customer' ? 'customer' : 'barber');

    await setDoc(doc(db, 'users', userAcc.uid), {
      id: userAcc.uid,
      email: email || userAcc.email,
      full_name: fullName || userAcc.displayName,
      phone: phone || '',
      role: role,
      barber_type: role === 'barber' ? userType : null,
      country,
      state: stateProv,
      municipality,
      created_at: new Date().toISOString()
    });

    if (role === 'barber') {
      await setDoc(doc(db, 'barbers', userAcc.uid), {
        user_id: userAcc.uid,
        business_name: fullName,
        type: userType,
        country, state: stateProv, city: municipality,
        coordinates: lat && lng ? { lat, lng } : null,
        is_active: true,
        salon_type: 'men',
        rating: 5,
        total_reviews: 0,
        id: userAcc.uid,
        created_at: new Date().toISOString()
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAccepted) return toast({ title: 'Security', description: 'Accept privacy policy to continue.', variant: 'warning' });
    
    setLoading(true);
    try {
      let userAcc = socialUser;
      if (!socialUser) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userAcc = userCredential.user;
        await updateProfile(userAcc, { displayName: fullName });
      }
      if (userAcc) await createFirestoreUser(userAcc);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (completingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 py-20">
        <Card className="w-full max-w-2xl rounded-[3rem] border-2 border-primary/10 shadow-2xl overflow-hidden relative">
          <CardHeader className="pt-10">
            <CardTitle className="text-4xl font-black text-center tracking-tighter">Complete Your <span className="text-primary italic">Profile</span></CardTitle>
            <CardDescription className="text-center font-bold">Join the most exclusive barber network in Algeria.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSignUp} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold flex gap-2"><UserIcon className="w-4 h-4 text-primary" /> Name / Business Name</Label>
                  <Input className="h-12 rounded-xl" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold flex gap-2"><Phone className="w-4 h-4 text-primary" /> Mobile Number</Label>
                   <PhoneInput international defaultCountry="DZ" value={phone} onChange={setPhone} className="flex h-12 w-full rounded-xl border px-3" />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <Label className="text-xl font-black">Select Account Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <RoleCard title="Customer" desc="Find barbers & book." selected={userType === 'customer'} onClick={() => setUserType('customer')} icon={<Users className="w-6 h-6" />} />
                   <RoleCard title="Salon Owner" desc="Grow your business." selected={userType === 'salon_owner'} onClick={() => setUserType('salon_owner')} icon={<Home className="w-6 h-6" />} />
                </div>
              </div>

              {userType !== 'customer' && (
                <div className="pt-6 border-t space-y-4">
                  <Label className="text-xl font-black">Salon Location</Label>
                  <div className="rounded-3xl overflow-hidden border-2 border-primary/5">
                    <LocationPicker defaultLat={36.75} defaultLng={3.04} onLocationSelect={(la, ln) => { setLat(la); setLng(ln); }} />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl">
                <Checkbox id="terms" checked={privacyAccepted} onCheckedChange={(c) => setPrivacyAccepted(c as boolean)} />
                <Label htmlFor="terms" className="text-sm font-bold">I accept the <Link to="/privacy-policy" className="text-primary underline">Privacy Policy</Link></Label>
              </div>

              <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black" disabled={loading}>
                {loading ? 'Saving...' : 'Finish Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Link to="/" className="mb-10 flex items-center gap-2">
         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border">
            <img src="/logo.png" className="h-8 w-auto" alt="Logo" />
         </div>
         <h1 className="text-3xl font-black tracking-tighter uppercase italic">Barber<span className="text-primary">Link</span></h1>
      </Link>

      <Card className="w-full max-w-md rounded-[3rem] shadow-2xl p-8">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-black tracking-tighter">Welcome <span className="text-primary italic">Back</span></CardTitle>
          <CardDescription className="font-bold mt-2">Manage your salon or find a style.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSocialLogin} disabled={loading} className="w-full h-16 rounded-2xl font-black text-lg gap-3 mb-8">
            <FcGoogle className="h-8 w-8" /> Continue with Google
          </Button>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input type="email" placeholder="Email" className="h-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input type="password" placeholder="Password" className="h-12 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="submit" className="w-full h-14 rounded-2xl font-black" disabled={loading}>Login</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
                <Button className="w-full h-14 rounded-2xl font-black" onClick={() => setCompletingProfile(true)}>Start Registration</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const RoleCard = ({ title, desc, selected, onClick, icon }: any) => (
    <div onClick={onClick} className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col items-center flex-1 ${selected ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}>
        <div className={`p-4 rounded-xl mb-3 ${selected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{icon}</div>
        <h4 className="font-bold">{title}</h4>
        <p className="text-[10px] text-slate-500">{desc}</p>
    </div>
);

export default Auth;