import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function updateBillionMailSettings() {
    console.log('🚀 Updating BillionMail settings to use hostname...');
    const systemRef = db.collection('system').doc('settings');
    await systemRef.set({
        billionmailEndpoint: 'http://mail.barberlink.cloud:9080',
        billionmailApiKey: 'bl_api_88888888888888888888888888888888'
    }, { merge: true });
    console.log('✅ BillionMail settings updated in Firestore.');
}

updateBillionMailSettings().catch(console.error);
