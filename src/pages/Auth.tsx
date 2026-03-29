import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
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
  const [userType, setUserType] = useState<'customer' | 'salon_owner' | 'salon_barber' | 'mobile_barber' | 'investor'>('customer');
  const [country, setCountry] = useState('Algeria');
  const [stateProv, setStateProv] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // For social login complete profile step
  const [completingProfile, setCompletingProfile] = useState(false);
  const [socialUser, setSocialUser] = useState<User | null>(null);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const isRegistering = useRef(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferrerId(ref);
      console.log("[Sentinel] Capture referral node:", ref);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !completingProfile && !isRegistering.current) {
        // Check if they exist in firestore
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // SILENT REDIRECTION MESH
          if (userData.role === 'admin') {
            navigate('/admin');
          } else if (userData.role === 'investor') {
            navigate('/admin'); // Redirect to Admin Growth Hub for now or separate Dashboard
          } else if (userData.role === 'barber') {
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
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setSocialUser(user);
        setEmail(user.email || '');
        setFullName(user.displayName || '');
        setCompletingProfile(true);
      } else {
        const u = docSnap.data();
        toast({ title: 'Welcome Back', description: `Signed in as ${u.role}` });
        if (u.role === 'admin' || u.role === 'investor') navigate('/admin');
        else if (u.role === 'barber') navigate('/dashboard');
        else navigate('/');
      }
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createFirestoreUser = async (userAcc: User) => {
    // Generate a unique 6-char referral code for the new user
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    await setDoc(doc(db, 'users', userAcc.uid), {
      id: userAcc.uid,
      email: email,
      full_name: fullName,
      phone: phone,
      role: userType === 'customer' ? 'customer' : (userType === 'investor' ? 'investor' : 'barber'),
      barber_type: (userType !== 'customer' && userType !== 'investor') ? userType : null,
      country,
      state: stateProv,
      municipality,
      referral_code: referralCode,
      referred_by: referrerId, 
      created_at: new Date().toISOString()
    });

    if (userType !== 'customer') {
      const salonType = 'men';
      // Initialize Barber Profile with Level 3 verification and revenue tracking
      await setDoc(doc(db, 'barbers', userAcc.uid), {
        user_id: userAcc.uid,
        business_name: fullName,
        type: userType,
        country,
        state: stateProv,
        city: municipality,
        is_active: true,
        salon_type: salonType,
        rating: 5,
        total_reviews: 0,
        verification_status: 'pending', // Level 3 Requirement
        revenue_total: 0,
        created_at: new Date().toISOString()
      });

      // Initialize Barber Wallet
      await setDoc(doc(db, 'wallets', userAcc.uid), {
        user_id: userAcc.uid,
        balance_dzd: 0,
        balance_usd: 0,
        referral_earnings: 0,
        commission_paid: 0,
        last_updated: new Date().toISOString()
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Email Required', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    if (!privacyAccepted) {
      return toast({ title: 'Error', description: 'You must accept the privacy policy.', variant: 'destructive' });
    }

    setLoading(true);
    isRegistering.current = true;
    try {
      let userAcc = socialUser;
      if (!userAcc) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const res = await createUserWithEmailAndPassword(auth, email, password);
        userAcc = res.user;
        await updateProfile(userAcc, { displayName: fullName });
        // LEVEL 3: Identity Verification Hook
        await sendEmailVerification(userAcc);
        toast({ title: 'Verification Email Sent', description: 'Please check your inbox to confirm your identity.' });
      }
      
      if (!userAcc) {
          isRegistering.current = false;
          return;
      }

      await createFirestoreUser(userAcc);

      toast({ title: t('auth.signup.success'), description: t('auth.signup.success.desc') });
      navigate('/');
    } catch (error: any) {
      console.error("[Auth Error]", error);
      toast({ title: t('auth.error'), description: error?.message || "An unknown error occurred", variant: 'destructive' });
    } finally {
      setLoading(false);
      isRegistering.current = false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const res = await signInWithEmailAndPassword(auth, email, password);
      // FORCE REDIRECTION SYNC
      const snap = await getDoc(doc(db, 'users', res.user.uid));
      if (snap.exists()) {
        const u = snap.data();
        toast({ title: 'Welcome Back', description: `Signed in as ${u.role}` });
        if (u.role === 'admin' || u.role === 'investor') navigate('/admin');
        else if (u.role === 'barber') navigate('/dashboard');
        else navigate('/');
      } else {
         navigate('/');
      }
    } catch (error: any) {
      console.error("[Auth Error]", error);
      toast({ title: t('auth.error'), description: error?.message || "An unknown error occurred", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: 'Email Required', description: 'Please enter your email address to reset your password.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: 'Success', description: 'Password reset email sent. Please check your inbox.' });
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
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
                  <Label>{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</Label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="example@mail.com"
                    required 
                    disabled={!!socialUser} // Disable if google login, as email is already fixed
                  />
                </div>
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
                <RadioGroup value={userType} onValueChange={(value: 'customer' | 'salon_owner' | 'salon_barber' | 'mobile_barber' | 'investor') => setUserType(value)} className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                  <div className="flex items-center space-x-2 border p-3 rounded-lg border-primary/30 bg-primary/5">
                    <RadioGroupItem value="investor" id="investor_comp" />
                    <Label htmlFor="investor_comp" className="cursor-pointer font-bold text-primary">{isRTL ? 'مستثمر / شريك' : 'Investor / Partner'}</Label>
                  </div>
                </RadioGroup>
              </div>

              {!socialUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>{isRTL ? 'كلمة المرور' : 'Password'}</Label>
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                    </button>
                  </div>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-signin">{t('auth.password')}</Label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                    </button>
                  </div>
                  <Input id="password-signin" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="flex items-center space-x-2 pb-2">
                  <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c as boolean)} />
                  <Label htmlFor="remember-me" className="text-sm cursor-pointer">{isRTL ? 'تذكرني' : 'Remember me'}</Label>
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