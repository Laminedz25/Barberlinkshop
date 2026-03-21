import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * HostingerService.ts
 * Logic for interacting with Hostinger VPS API:
 * - VM Management
 * - Monitoring
 */
export class HostingerService {
  /**
   * Fetches all VPS virtual machines from Hostinger.
   * Requires HOSTINGER_TOKEN in Firestore system/settings.
   */
  static async getVirtualMachines() {
    try {
      const settingsRef = doc(db, 'system', 'settings');
      const settingsSnap = await getDoc(settingsRef);
      const hostingerToken = settingsSnap.exists()
        ? settingsSnap.data()?.apiKeys?.hostingerToken
        : '';

      if (!hostingerToken) {
        throw new Error("Hostinger API Token not configured in Admin settings.");
      }

      const response = await fetch("https://developers.hostinger.com/api/vps/v1/virtual-machines", {
        headers: {
          "Authorization": `Bearer ${hostingerToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Hostinger API error: ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[Hostinger] Failed to fetch VMs:", error);
      throw error;
    }
  }
}
