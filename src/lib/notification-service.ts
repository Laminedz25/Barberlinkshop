import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

export type NotificationChannel = 'email' | 'telegram' | 'whatsapp' | 'in_app';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'delivered';

export interface NotificationPayload {
  recipientId: string;
  type: 'booking_confirm' | 'reminder' | 'payment_success' | 'system_alert';
  title: string;
  body: string;
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
}

export const NotificationService = {
  dispatch: async (payload: NotificationPayload, attempts = 3) => {
    let currentId = '';
    try {
      console.log(`[NotificationNode] Attempting dispatch (${4-attempts}/3) for ${payload.type}`);
      
      const docRef = await addDoc(collection(db, 'system_notifications'), {
        ...payload,
        status: 'queued',
        retryCount: 3 - attempts,
        createdAt: serverTimestamp(),
        lastAttempt: serverTimestamp()
      });
      currentId = docRef.id;

      // Realistic Simulation of 3rd Party API Call (Email/SMS/Push)
      const success = Math.random() > 0.1; // 90% success rate simulation
      if (!success) throw new Error("UPSTREAM_GATEWAY_TIMEOUT");

      await NotificationService.markAsSent(currentId);
      return currentId;
    } catch (e) {
      console.error(`[NotificationNode] Dispatch Error (Attempt ${4-attempts}):`, e);
      if (attempts > 1) {
        // Wait 2 seconds before retry
        await new Promise(res => setTimeout(res, 2000));
        return NotificationService.dispatch(payload, attempts - 1);
      }
      if (currentId) await NotificationService.handleFailure(currentId, (e as Error).message);
      return null;
    }
  },

  markAsSent: async (notificationId: string) => {
    await updateDoc(doc(db, 'system_notifications', notificationId), {
      status: 'sent',
      sentAt: serverTimestamp(),
      lastAttempt: serverTimestamp()
    });
  },

  handleFailure: async (notificationId: string, error: string) => {
    await updateDoc(doc(db, 'system_notifications', notificationId), {
      status: 'failed',
      lastError: error,
      lastAttempt: serverTimestamp()
    });
  },

  sendBookingConfirmation: async (userId: string, salonName: string, time: string) => {
    return NotificationService.dispatch({
      recipientId: userId,
      type: 'booking_confirm',
      title: 'Booking Confirmed! 💈',
      body: `Your appointment at ${salonName} is set for ${time}. We look forward to seeing you!`,
      channels: ['in_app', 'email'],
      priority: 'high'
    });
  },

  sendAdminAlert: async (title: string, body: string) => {
    return NotificationService.dispatch({
      recipientId: 'admin_global',
      type: 'system_alert',
      title: `🚨 ${title}`,
      body,
      channels: ['telegram', 'in_app'],
      priority: 'critical'
    });
  }
};
