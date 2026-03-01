import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { FcGoogle } from 'react-icons/fc';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'customer' | 'salon_owner' | 'salon_barber' | 'mobile_barber'>('customer');
  const [country, setCountry] = useState('Algeria');
  const [stateProv, setStateProv] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // For social login complete profile step
  const [completingProfile, setCompletingProfile] = useState(false);
  const [socialUser, setSocialUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !completingProfile) {
        // Check if they exist in firestore
        if (user.email === 'admin@gmail.com') {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists() || docSnap.data().role !== 'admin') {
            await setDoc(docRef, {
              id: user.uid,
              email: user.email,
              full_name: 'Admin',
              role: 'admin',
              created_at: new Date().toISOString()
            }, { merge: true });
          }
          navigate('/admin');
          return;
        }

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const role = docSnap.data().role;
          if (role === 'admin') {
            navigate('/admin');
          } else if (role === 'barber') {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        } else {
          // They used social login but haven't completed profile
          setSocialUser(user);
          setEmail(user.email || '');
          setFullName(user.displayName || '');
          setCompletingProfile(true);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, completingProfile]);

  const handleSocialLogin = async (providerName: 'google') => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email === 'admin@gmail.com') {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().role !== 'admin') {
          await setDoc(docRef, {
            id: user.uid,
            email: user.email,
            full_name: 'Admin',
            role: 'admin',
            created_at: new Date().toISOString()
          }, { merge: true });
        }
        toast({ title: 'Success', description: 'Logged in successfully as Admin!' });
        navigate('/admin');
        return;
      }

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setSocialUser(user);
        setEmail(user.email || '');
        setFullName(user.displayName || '');
        setCompletingProfile(true);
      } else {
        toast({ title: 'Success', description: 'Logged in successfully!' });
        const role = docSnap.data().role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'barber') navigate('/dashboard');
        else navigate('/');
      }
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createFirestoreUser = async (userAcc: User) => {
    let role = userType === 'customer' ? 'customer' : 'barber';
    if (email === 'admin@gmail.com') {
      role = 'admin';
    }

    await setDoc(doc(db, 'users', userAcc.uid), {
      id: userAcc.uid,
      email: email,
      full_name: fullName,
      phone: phone,
      role: role,
      barber_type: userType !== 'customer' ? userType : null,
      country,
      state: stateProv,
      municipality,
      avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&auto=format&fit=crop',
      created_at: new Date().toISOString()
    });

    if (userType !== 'customer') {
      const salonType = 'men';
      await setDoc(doc(db, 'barbers', userAcc.uid), {
        user_id: userAcc.uid,
        business_name: fullName,
        type: userType, // salon_owner, salon_barber, mobile_barber
        country,
        state: stateProv,
        city: municipality,
        is_active: true,
        salon_type: salonType,
        rating: 5,
        total_reviews: 0,
        cover_photo_url: 'https://images.unsplash.com/photo-1512496015851-a1dc8a477858?w=800&auto=format&fit=crop',
        created_at: new Date().toISOString()
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAccepted) {
      return toast({ title: 'Error', description: 'You must accept the privacy policy.', variant: 'destructive' });
    }
    if (password !== confirmPassword) {
      return toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
    }

    setLoading(true);

    try {
      let userAcc = socialUser;

      if (!socialUser) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userAcc = userCredential.user;
        await updateProfile(userAcc, { displayName: fullName });
      }

      await createFirestoreUser(userAcc);

      toast({ title: t('auth.signup.success'), description: t('auth.signup.success.desc') });
      if (email === 'admin@gmail.com') {
        navigate('/admin');
      } else if (userType !== 'customer') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error: unknown) {
      toast({ title: t('auth.error'), description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (user.email === 'admin@gmail.com') {
        const adminData = {
          id: user.uid,
          email: user.email,
          full_name: 'Admin',
          role: 'admin',
          created_at: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid), adminData, { merge: true });
        navigate('/admin');
        return;
      }

      if (docSnap.exists()) {
        const role = docSnap.data().role;
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'barber') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error: unknown) {
      toast({ title: t('auth.error'), description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (completingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 py-12">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{isRTL ? 'إكمال الملف الشخصي' : 'Complete Your Profile'}</CardTitle>
            <CardDescription className="text-center">{isRTL ? 'يرجى تقديم تفاصيل إضافية لإنهاء التسجيل.' : 'Please provide additional details to finish registration.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الاسم الكامل / اسم المستخدم' : 'Full Name / Username'}</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</Label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'البلد' : 'Country'}</Label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الولاية / المقاطعة' : 'State / Province'}</Label>
                  <Input value={stateProv} onChange={(e) => setStateProv(e.target.value)} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{isRTL ? 'البلدية' : 'Municipality'}</Label>
                  <Input value={municipality} onChange={(e) => setMunicipality(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-lg font-semibold">{isRTL ? 'أنا...' : 'I am a...'}</Label>
                <RadioGroup value={userType} onValueChange={(value: 'customer' | 'salon_owner' | 'salon_barber' | 'mobile_barber') => setUserType(value)} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 border p-3 rounded-lg">
                    <RadioGroupItem value="customer" id="customer_comp" />
                    <Label htmlFor="customer_comp" className="cursor-pointer">{isRTL ? 'زبون' : 'Customer'}</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-lg">
                    <RadioGroupItem value="salon_owner" id="salon_owner_comp" />
                    <Label htmlFor="salon_owner_comp" className="cursor-pointer">{isRTL ? 'صاحب صالون' : 'Salon Owner'}</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-lg">
                    <RadioGroupItem value="salon_barber" id="salon_barber_comp" />
                    <Label htmlFor="salon_barber_comp" className="cursor-pointer">{isRTL ? 'حلاق داخل صالون' : 'Barber in a Salon'}</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-lg">
                    <RadioGroupItem value="mobile_barber" id="mobile_barber_comp" />
                    <Label htmlFor="mobile_barber_comp" className="cursor-pointer">{isRTL ? 'حلاق متنقل' : 'Mobile Barber'}</Label>
                  </div>
                </RadioGroup>
              </div>

              {!socialUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'كلمة المرور' : 'Password'}</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox id="terms" checked={privacyAccepted} onCheckedChange={(c) => setPrivacyAccepted(c as boolean)} />
                <Label htmlFor="terms" className="text-sm">{isRTL ? 'أوافق على ' : 'I agree to the '}<a href="/privacy-policy" className="text-primary hover:underline" target="_blank">{isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>{isRTL ? ' و شروط الخدمة.' : ' and Terms of Service.'}</Label>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'إكمال التسجيل' : 'Complete Registration')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t('auth.welcome')}</CardTitle>
          <CardDescription className="text-center">{t('auth.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>

          <div className="grid grid-cols-1 gap-3 mb-6">
            <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={loading} className="w-full">
              <FcGoogle className="mr-2 h-5 w-5" /> Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{isRTL ? 'أو المتابعة باستخدام البريد الإلكتروني' : 'Or continue with email'}</span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t('auth.signin')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">{t('auth.email')}</Label>
                  <Input id="email-signin" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin">{t('auth.password')}</Label>
                  <Input id="password-signin" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.loading') : t('auth.signin')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <div className="mt-4 text-center">
                <p className="mb-4 text-sm text-muted-foreground">{isRTL ? 'للتسجيل باستخدام البريد الإلكتروني، انقر أدناه لبدء عملية التسجيل.' : 'To sign up with email, click below to start the registration process.'}</p>
                <Button className="w-full" onClick={() => {
                  setSocialUser(null);
                  setEmail('');
                  setPassword('');
                  setCompletingProfile(true);
                }}>
                  {isRTL ? 'بدء التسجيل' : 'Start Registration'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;