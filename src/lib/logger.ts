import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type LogLevel = 'info' | 'warn' | 'error' | 'critical';

export const Logger = {
  log: async (level: LogLevel, tag: string, message: string, context?: Record<string, unknown>) => {
    const logData = {
      level,
      tag,
      message,
      context: context ? JSON.parse(JSON.stringify(context)) : null,
      timestamp: serverTimestamp()
    };

    // 1. Console for dev
    if (level === 'error' || level === 'critical') {
        console.error(`[${tag}] ${message}`, context);
    } else {
        console.log(`[${tag}] ${message}`);
    }

    // 2. Firestore for persistence (System Monitoring)
    try {
      await addDoc(collection(db, 'system_logs'), logData);
    } catch (e) {
      console.warn("Failed to persist log to Firestore", e);
    }
  },

  info: (tag: string, message: string, ctx?: Record<string, unknown>) => Logger.log('info', tag, message, ctx),
  warn: (tag: string, message: string, ctx?: Record<string, unknown>) => Logger.log('warn', tag, message, ctx),
  error: (tag: string, message: string, ctx?: Record<string, unknown>) => Logger.log('error', tag, message, ctx),
  critical: (tag: string, message: string, ctx?: Record<string, unknown>) => Logger.log('critical', tag, message, ctx)
};
