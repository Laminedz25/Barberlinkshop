import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    storageBucket: "barberlinkshop.firebasestorage.app"
  });
}

export const db = admin.firestore();
export const storage = admin.storage();
export const auth = admin.auth();
