import { db } from './firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { AgentAPI } from './agent-api';
import { Logger } from './logger';

/**
 * Master System Integrity Service
 * Ensures 100% synchronization between Admin Dashboard and Global UI.
 */
export const SystemIntegrity = {
  
  /**
   * Deep Sync: Forces all core nodes to match the latest system registry.
   */
  forceGlobalSync: async (investorMetrics?: Record<string, unknown>) => {
    Logger.info('SystemIntegrity', 'Initiating Deep Global Sync Sequence...');
    
    try {
      await Promise.all([
        // 1. Force AI Registry Sync
        AgentAPI.syncLocalRegistry(),
        
        // 2. Force Subscription Plans Sync
        SystemIntegrity.seedSubscriptions(),
        
        // 3. Force System Config Sync
        SystemIntegrity.seedGlobalConfig(),
        
        // 4. Investor Metrics (if provided)
        investorMetrics ? setDoc(doc(db, 'system', 'investor_metrics'), investorMetrics) : Promise.resolve()
      ]);
      
      Logger.info('SystemIntegrity', 'Global Sync Successful. All Nodes Online.');
      return true;
    } catch (err) {
      Logger.critical('SystemIntegrity', 'Global Sync FAILED', { error: String(err) });
      throw err;
    }
  },

  seedSubscriptions: async () => {
    const plans = [
        { id: 'basic', name: 'Basic Tier', price_dzd: 1000, price_usd: 10, duration_days: 30, features: ['Standard Booking', 'Map Visibility', 'Basic Support'] },
        { id: 'pro', name: 'Professional Pro', price_dzd: 2500, price_usd: 25, duration_days: 30, features: ['Unlimited Bookings', 'AI Assistant', 'Client Analytics', 'Marketing Hub'], isPopular: true },
        { id: 'premium', name: 'Elite Enterprise', price_dzd: 5000, price_usd: 50, duration_days: 30, features: ['Full AI Management', 'Investor Dash Access', '24/7 Security Ops', 'Priority Scaling'] }
    ];
    for (const plan of plans) {
      await setDoc(doc(db, 'subscriptions', plan.id), plan, { merge: true });
    }
  },

  seedGlobalConfig: async () => {
    await setDoc(doc(db, 'system', 'config'), {
        commission_percentage: 10,
        referral_bonus_dzd: 500,
        maintenance_mode: false,
        beta_mode: true,
        global_pricing: { usa: 29.99, uk: 24.99, france: 24.99, dzd: 1000 }
    }, { merge: true });
  },

  /**
   * Demo Seeder: Populates the platform with high-quality content for preview.
   */
  seedDemoEcosystem: async (adminUid: string) => {
    Logger.info('SystemIntegrity', 'Seeding Deep Demo Ecosystem...');
    
    const demoId = "elite_salon_algiers";
    await setDoc(doc(db, 'barbers', demoId), {
        business_name: "The Royal Fade Studio",
        address: "Zeralda, Algiers",
        rating: 5,
        user_id: adminUid,
        socials: { instagram: "royalfade_dz", facebook: "royalfade" },
        bio: "Where tradition meets modern cutting-edge style. Level 3 Certified Salon.",
        verified: true,
        created_at: new Date().toISOString()
    });

    // 1. Seed Services
    const services = [
        { name_ar: "قص شعر عصري", name_en: "Modern Haircut", price: 1500, duration_minutes: 40, barber_id: demoId },
        { name_ar: "تنظيف بشرة", name_en: "Facial Care", price: 2000, duration_minutes: 20, barber_id: demoId }
    ];
    for (const s of services) {
        await addDoc(collection(db, 'services'), s);
    }

    // 2. Seed Staff (Sub-collection)
    const staffRef = collection(db, 'barbers', demoId, 'staff');
    const staff = [
        { name: "Samy 'The Blade'", role: "Master Stylist", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Samy" },
        { name: "Omar Fade", role: "Junior Barber", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar" }
    ];
    for (const member of staff) {
        await addDoc(staffRef, member);
    }

    // 3. Seed Portfolio (Sub-collection)
    const portRef = collection(db, 'barbers', demoId, 'portfolio');
    const gallery = [
        { media_url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80" },
        { media_url: "https://images.unsplash.com/photo-1621605815841-db897c4733dd?w=800&q=80" }
    ];
    for (const item of gallery) {
        await addDoc(portRef, item);
    }
    
    Logger.info('SystemIntegrity', 'Deep Demo Ecosystem Seeded Successfully.');
    return true;
  }
};
