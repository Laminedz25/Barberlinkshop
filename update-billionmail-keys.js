import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function updateApiKeys() {
    const ref = db.collection('system').doc('settings');
    await ref.set({
        apiKeys: {
            billionmailEndpoint: 'http://72.61.71.63:9080',
            billionmailApiKey: 'bl_api_72a1b9c3e5d7f8g9h0i1k2l3m4n5o6p',
            billionmailFrom: 'noreply@barberlink.cloud'
        }
    }, { merge: true });
    console.log('✅ BillionMail API keys corrected in Firestore.');
}

updateApiKeys().catch(console.error);
