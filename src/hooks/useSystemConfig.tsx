import { useState, useEffect } from 'react';
import { doc, onSnapshot } from "firebase/firestore";
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
  commission_percentage?: number;
  referral_bonus_dzd?: number;
  global_pricing?: {
    usa: number;
    uk: number;
    france: number;
    dzd: number;
  };
  openaiKey?: string;
  maintenance_mode?: boolean;
  booking_buffer_minutes?: number;
  security_level?: 'standard' | 'high' | 'paranoid';
  auto_assign_agent?: boolean;
  supported_currencies?: string[];
  androidAppLink?: string;
  iosAppLink?: string;
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
