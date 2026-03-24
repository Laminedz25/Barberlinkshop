const admin = require('firebase-admin');
const serviceAccount = require('C:/Users/PC/AppData/Local/Temp/barberlink_sa.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkUsers() {
  console.log('--- Current Firestore Users ---');
  const snap = await db.collection('users').get();
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(`UID: ${d.id} | Email: ${data.email} | Role: ${data.role} | Name: ${data.full_name}`);
  });
}

checkUsers().catch(console.error);
