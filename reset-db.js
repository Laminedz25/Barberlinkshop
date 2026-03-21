import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function resetAndSetup() {
  console.log('🧹 Starting Database Reset...');
  
  const collections = ['users', 'barbers', 'system', 'system_settings', 'bookings', 'salons'];
  
  for (const coll of collections) {
    const snapshot = await db.collection(coll).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`✅ Collection ${coll} cleared.`);
  }

  console.log('🏗️ Rebuilding Database for barberlink...');

  // 1. Create Admin User
  await db.collection('users').doc('tmx3GRDXzWOw8dCAltPS7mybNHz1').set({
    id: 'tmx3GRDXzWOw8dCAltPS7mybNHz1',
    email: 'admin@barberlink.cloud',
    role: 'admin',
    name: 'Main Admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('✅ Admin user created.');

  // 2. System Settings
  await db.collection('system_settings').doc('general').set({
    brandName: 'barberlink',
    primaryColor: '#3b82f6',
    contactEmail: 'support@barberlink.cloud',
    maintenanceMode: false,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('✅ System settings initialized.');

  // 3. AI Agents Initial Data
  const agents = [
    { id: 'supervisor', name: 'Al-Mushrif', role: 'supervisor' },
    { id: 'support', name: 'BarberLink Support', role: 'support' },
    { id: 'marketing', name: 'Marketing Pro', role: 'marketing' }
  ];
  
  for (const agent of agents) {
    await db.collection('system').doc(`agent_${agent.id}`).set({
      ...agent,
      status: 'active',
      lastPulse: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  console.log('✅ AI Agents initialized.');

  console.log('🎉 Database Reset & Setup Completed Successfully!');
}

resetAndSetup().catch(err => {
  console.error('❌ Error during reset:', err);
  process.exit(1);
});
