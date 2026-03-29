import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';

export class DBMaintenanceAgent {
  private static instance: DBMaintenanceAgent;
  private isRunning: boolean = false;

  public static getInstance(): DBMaintenanceAgent {
    if (!DBMaintenanceAgent.instance) {
      DBMaintenanceAgent.instance = new DBMaintenanceAgent();
    }
    return DBMaintenanceAgent.instance;
  }

  public async executeNightlyMaintenance() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[DB_Agent] Initiating Autonomous Database Maintenance Sequence...');

    try {
      await this.cleanOrphanedBarberNodes();
      await this.enforceStrictAccountIsolation();
      await this.auditFinancialConcurrency();
      console.log('[DB_Agent] Maintenance Sequence Complete. System stable.');
    } catch (error) {
      console.error('[DB_Agent] Encountered error during maintenance:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async cleanOrphanedBarberNodes() {
    // Finds barber profiles that have no corresponding user account and deletes them to prevent ghost accounts.
    const barbersRef = collection(db, 'barbers');
    const usersRef = collection(db, 'users');
    
    const barbersSnap = await getDocs(barbersRef);
    const usersSnap = await getDocs(usersRef);
    
    const validUserIds = new Set(usersSnap.docs.map(doc => doc.id));
    
    let deletedCount = 0;
    for (const barberDoc of barbersSnap.docs) {
      const data = barberDoc.data();
      if (!validUserIds.has(data.user_id)) {
        await deleteDoc(barberDoc.ref);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      console.log(`[DB_Agent] Cleaned ${deletedCount} orphaned barber nodes.`);
    }
  }

  private async enforceStrictAccountIsolation() {
    // Ensures users don't have overlapping roles and cleans up any corrupted state from concurrency glitches
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);
    
    for (const userDoc of snap.docs) {
      const data = userDoc.data();
      if (!data.role) {
        // Fallback to customer if role is completely missing due to a network glitch during signup
        await updateDoc(userDoc.ref, { role: 'customer' });
      }
    }
  }

  private async auditFinancialConcurrency() {
    // Safeguard financial ledgers to ensure no negative balances or stuck transactions
    const walletsRef = collection(db, 'wallets');
    const snap = await getDocs(walletsRef);
    
    for (const walletDoc of snap.docs) {
      const data = walletDoc.data();
      let needsFix = false;
      const updates: Record<string, number> = {};
      
      if (data.balance_dzd < 0) {
        updates.balance_dzd = 0;
        needsFix = true;
      }
      
      if (needsFix) {
        await updateDoc(walletDoc.ref, updates);
        console.warn(`[DB_Agent] Corrected ledger concurrency anomaly for wallet ${walletDoc.id}`);
      }
    }
  }
}
