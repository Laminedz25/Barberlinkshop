const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

/**
 * BarberLink Level 3 Platform Seeder 🚀📊
 * Run this ONCE to prepare your Firebase DB for the global startup.
 */

// WARNING: You must have a serviceAccountKey.json in your project root
// to run this administrative script.
const serviceAccount = require('../serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function seedPlatform() {
  console.log("🚀 Initializing Level 3 Database Schema...");

  // 1. System Global Configuration
  const sysConfigRef = db.collection('system').doc('config');
  const sysConfig = await sysConfigRef.get();

  if (!sysConfig.exists) {
    console.log("⚙️ Creating System Global Configuration...");
    await sysConfigRef.set({
      public: true,
      last_updated: new Date().toISOString(),
      commission_percentage: 10,
      referral_bonus_dzd: 500,
      global_pricing: {
        usa: 29.99,
        uk: 24.99,
        france: 24.99
      },
      supported_countries: ['Algeria', 'USA', 'UK', 'France'],
      active_modules: {
        ai_brain: true,
        revenue_engine: true,
        global_mode: true,
        verification_hub: true
      }
    });
  }

  // 2. Initialize Platforms Admin Wallets
  const adminWalletRef = db.collection('wallets').doc('platform_reserve');
  if (!(await adminWalletRef.get()).exists) {
    console.log("💰 Creating Platform Reserve Wallet...");
    await adminWalletRef.set({
      role: 'platform_reserve',
      balance_dzd: 0,
      balance_usd: 0,
      total_commission_collected: 0,
      total_referrals_paid: 0,
      last_updated: new Date().toISOString()
    });
  }

  // 3. Setup Default Verification Tiers
  const tiersRef = db.collection('system').doc('verification_tiers');
  if (!(await tiersRef.get()).exists) {
    console.log("🛡️ Initializing Verification Tiers...");
    await tiersRef.set({
      public: true,
      tiers: [
        { id: 'standard', name: 'Standard (Self-verified)', features: ['Listing'] },
        { id: 'pro', name: 'Professional (Identity Verified)', features: ['Badge', 'Promoted Listing'] },
        { id: 'premium', name: 'Premium (Top Rated + Verified)', features: ['AI Strategist Access', 'Priority Booking'] }
      ]
    });
  }

  console.log("✅ Platform Database Seeded Successfully!");
  process.exit(0);
}

seedPlatform().catch(err => {
  console.error("❌ Seeding Error:", err);
  process.exit(1);
});
