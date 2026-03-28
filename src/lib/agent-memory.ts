import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export interface MemoryNode {
  agent_id: string;
  user_id?: string;
  decision: string;
  context: Record<string, unknown>;
  outcome: 'success' | 'failure' | 'pending';
  timestamp: string;
}

export const MemorySystem = {
  save: async (node: Omit<MemoryNode, 'timestamp'>) => {
    const memory = {
      ...node,
      timestamp: new Date().toISOString()
    };
    await addDoc(collection(db, 'ai_memories'), memory);
  },

  getRecent: async (agentId: string, limitCount = 5) => {
    const q = query(
      collection(db, 'ai_memories'),
      where('agent_id', '==', agentId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as MemoryNode);
  }
};
