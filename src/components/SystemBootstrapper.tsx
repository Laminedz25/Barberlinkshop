import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { AgentAPI } from '@/lib/agent-api';

const SystemBootstrapper = () => {
    useEffect(() => {
        const bootstrap = async () => {
            // ONLY SEED IF ADMIN IS LOGGED IN or if it fails, just log silently
            try {
                // 1. Check System Config (Read is public)
                const confRef = doc(db, 'system', 'config');
                const confSnap = await getDoc(confRef);
                
                // 2. Read Subscriptions (Read is public)
                const subSnap = await getDocs(collection(db, 'subscriptions'));

                // 3. SEEDING LOGIC - Only if user is possibly an admin
                // We don't check role here to avoid another fetch, but we catch write errors
                if (!confSnap.exists()) {
                    await setDoc(confRef, {
                        commission_percentage: 10,
                        referral_bonus_dzd: 500,
                        maintenance_mode: false,
                        beta_mode: true,
                        global_pricing: { usa: 29.99, uk: 24.99, france: 24.99, dzd: 1000 },
                        facebookUrl: 'https://fb.com/barberlink',
                        instagramUrl: 'https://instagram.com/barberlink',
                        tiktokUrl: 'https://tiktok.com/@barberlink',
                        whatsappNumber: '+213...'
                    }).catch(() => console.log("[SystemBootstrapper] Skipping Config Seed (Unauthorized)"));
                }

                if (subSnap.empty) {
                    const plans = [
                        { id: 'basic', name: 'Basic Tier', price_dzd: 1000, price_usd: 10, duration_days: 30, features: ['Standard Booking', 'Map Visibility', 'Basic Support'], color: "from-blue-500/10 to-transparent border-blue-500/20", btnVariant: 'outline' },
                        { id: 'pro', name: 'Professional Pro', price_dzd: 2500, price_usd: 25, duration_days: 30, features: ['Unlimited Bookings', 'AI Assistant', 'Client Analytics', 'Marketing Hub'], isPopular: true, color: "from-primary/20 to-primary/5 border-primary/40 shadow-primary/20", btnVariant: 'default' },
                        { id: 'premium', name: 'Elite Enterprise', price_dzd: 5000, price_usd: 50, duration_days: 30, features: ['Full AI Management', 'Investor Dash Access', '24/7 Security Ops', 'Priority Scaling'], color: "from-amber-500/10 to-transparent border-amber-500/20", btnVariant: 'outline' }
                    ];
                    for (const plan of plans) {
                        await setDoc(doc(db, 'subscriptions', plan.id), plan).catch(() => {});
                    }
                }

            } catch (err) {
                // Silent for guests who can't seed
                console.log("[SystemBootstrapper] Orchestration active (Read-only mode).");
            }
        };

        bootstrap();
    }, []);

    return null;
};

export default SystemBootstrapper;
