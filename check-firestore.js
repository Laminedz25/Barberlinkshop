import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function check() {
    console.log('🔍 Checking Firestore connectivity...');
    const snapshot = await db.collection('system').get();
    console.log(`✅ Connection successful. Found ${snapshot.size} documents in 'system' collection.`);
    snapshot.forEach(doc => {
        console.log(` - Document: ${doc.id}`);
    });
}

check().catch(console.error);
