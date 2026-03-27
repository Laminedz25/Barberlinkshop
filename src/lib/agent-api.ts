import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, getDocs, updateDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { AGENT_REGISTRY } from '@/ai-agents/AgentRegistry';

export interface AgentRecord {
  id: string;
  role: string;
  status: 'active' | 'idle' | 'executing' | 'error';
  last_active: string;
  logs: string[];
  workflow?: string;
  memoryType?: string;
}

export const AgentAPI = {
  listenToAgents: (callback: (data: AgentRecord[]) => void) => {
    return onSnapshot(collection(db, 'ai_agents'), (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as AgentRecord)));
    });
  },

  syncLocalRegistry: async () => {
    for (const [id, data] of Object.entries(AGENT_REGISTRY)) {
      await setDoc(doc(db, 'ai_agents', id), {
        ...data,
        status: 'active',
        last_active: new Date().toISOString(),
        logs: [`[System] Agent Node ${id} initialized for global operations.`]
      }, { merge: true });
    }
  },

  // The 'Brain' - Decision Execution
  executeAction: async (agentId: string, action: string, targetId: string, metadata?: any) => {
    const logEntry = `[Decision] Agent ${agentId} triggered: ${action} on node ${targetId}. Reason: ${metadata?.reason || 'System Optimization'}`;
    
    await updateDoc(doc(db, 'ai_agents', agentId), {
      status: 'executing',
      logs: arrayUnion(logEntry),
      last_active: new Date().toISOString()
    });

    // Execute the actual logic based on action type
    try {
        switch(action) {
            case 'CONFIRM_BOOKING':
                await updateDoc(doc(db, 'bookings', targetId), { status: 'confirmed' });
                break;
            case 'CANCEL_NO_SHOW':
                await updateDoc(doc(db, 'bookings', targetId), { status: 'no_show' });
                break;
            case 'FLAG_RISKY_PAYMENT':
                await updateDoc(doc(db, 'payments', targetId), { security_flag: true });
                break;
        }

        await updateDoc(doc(db, 'ai_agents', agentId), { status: 'active' });
        return true;
    } catch (e) {
        await updateDoc(doc(db, 'ai_agents', agentId), { 
            status: 'error',
            logs: arrayUnion(`[Error] Action ${action} failed: ${String(e)}`)
        });
        return false;
    }
  }
};
