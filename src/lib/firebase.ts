import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuz9012n769uSrrL20y7JsRYvc_dvG_lE",
  authDomain: "barberlinkshop.firebaseapp.com",
  projectId: "barberlinkshop",
  storageBucket: "barberlinkshop.firebasestorage.app",
  messagingSenderId: "829508519099",
  appId: "1:829508519099:web:8e20b4b1dc931df410559e"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
