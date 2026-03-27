import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'requires_action' | 'refunded';

export interface PaymentRecord {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: 'DZD' | 'USD';
  status: PaymentStatus;
  retryCount: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PaymentService = {
  createPayment: async (bookingId: string, userId: string, amount: number, currency: 'DZD' | 'USD' = 'DZD') => {
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    await setDoc(doc(db, 'payments', paymentId), {
      bookingId,
      userId,
      amount,
      currency,
      status: 'pending',
      retryCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return paymentId;
  },

  handleFailure: async (paymentId: string, error: string) => {
    await updateDoc(doc(db, 'payments', paymentId), {
      status: 'failed',
      lastError: error,
      retryCount: increment(1),
      updatedAt: serverTimestamp()
    });
    
    // Auto-alert admin for mission-critical payment failures
    console.error(`[PaymentNode] ALERT: Payment ${paymentId} failed: ${error}`);
  },

  handleSuccess: async (paymentId: string, transactionId: string) => {
    await updateDoc(doc(db, 'payments', paymentId), {
      status: 'succeeded',
      transactionId,
      updatedAt: serverTimestamp()
    });
    
    // Notify business logic that payment was successful
    console.log(`[PaymentNode] SUCCESS: Payment ${paymentId} verified.`);
  },

  processRefund: async (paymentId: string, reason: string) => {
    await updateDoc(doc(db, 'payments', paymentId), {
      status: 'refunded',
      refundReason: reason,
      updatedAt: serverTimestamp()
    });
    console.log(`[PaymentNode] REFUND: Payment ${paymentId} refunded. Reason: ${reason}`);
  }
};
