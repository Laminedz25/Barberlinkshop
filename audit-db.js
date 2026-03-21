import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function deepAudit() {
    console.log('--- 🛡️ BarberLink Global System Audit ---');
    
    // 1. Check Project ID consistency
    console.log(`[1] Project ID in Service Account: ${serviceAccount.project_id}`);
    
    // 2. Check Collections
    console.log('[2] Checking Firestore Collections...');
    const collections = await db.listCollections();
    if (collections.length === 0) {
        console.log('❌ CRITICAL: No collections found in Firestore! The database might be empty or in a different region/mode.');
    } else {
        console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.id).join(', '));
    }

    // 3. Check for Admin User
    console.log('[3] Verifying Admin User...');
    const usersSnap = await db.collection('users').where('role', '==', 'admin').get();
    if (usersSnap.empty) {
        console.log('❌ ERROR: No users with role "admin" found.');
    } else {
        usersSnap.forEach(doc => {
            console.log(`✅ Admin found: ${doc.data().email} (UID: ${doc.id})`);
        });
    }

    // 4. Check System Settings
    console.log('[4] Verifying System Settings...');
    const settingsDoc = await db.collection('system').doc('settings').get();
    if (!settingsDoc.exists) {
        console.log('❌ ERROR: settings/system document is missing.');
    } else {
        console.log('✅ System settings exist.');
    }
    
    console.log('--- Audit Complete ---');
}

deepAudit().catch(console.error);
