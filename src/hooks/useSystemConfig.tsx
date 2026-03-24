import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface SystemConfig {
  stripeKey?: string;
  baridiMobAccount?: string;
  cibMerchantId?: string;
  telegramBotToken?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  whatsappNumber?: string;
  billionmailUser?: string;
  billionmailPass?: string;
}

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to live changes from the Admin Dashboard config doc
    const unsub = onSnapshot(doc(db, "system", "config"), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data() as SystemConfig);
      } else {
        console.warn("System configuration doc not found in Firestore.");
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { config, loading };
};
