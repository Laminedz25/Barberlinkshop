import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function inspectUsers() {
    console.log('--- 👤 User Inspection ---');
    const usersSnap = await db.collection('users').get();
    console.log(`Total users in DB: ${usersSnap.size}`);
    usersSnap.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id} | Email: ${data.email} | Role: ${data.role}`);
    });
}

inspectUsers().catch(console.error);
