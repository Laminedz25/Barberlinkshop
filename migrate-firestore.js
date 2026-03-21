import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrate() {
    console.log('🚀 Starting Firestore migration to BarberLink...');

    // 1. Update system settings
    const systemRef = db.collection('system').doc('settings');
    const systemSnap = await systemRef.get();
    if (systemSnap.exists) {
        let data = systemSnap.data();
        let str = JSON.stringify(data);
        str = str.replace(/BarberLink/g, 'BarberLink');
        str = str.replace(/barberlinkshop/g, 'barberlink');
        await systemRef.set(JSON.parse(str), { merge: true });
        console.log('✅ System settings updated.');
    }

    // 2. Update users (admin check)
    const usersSnap = await db.collection('users').where('email', '==', 'admin@gmail.com').get();
    for (const doc of usersSnap.docs) {
        await doc.ref.update({ email: 'admin@barberlink.cloud' });
        console.log(`✅ Updated admin user: ${doc.id}`);
    }

    // 3. Update any other references in barbers or bookings (optional, but good for consistency)
    // We'll focus on the core identity for now.

    console.log('✅ Firestore migration complete.');
}

migrate().catch(console.error);
