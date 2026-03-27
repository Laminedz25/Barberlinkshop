import { db } from './firebase';
import { 
  collection, query, where, getDocs, addDoc, Timestamp, doc, 
  updateDoc, serverTimestamp, runTransaction 
} from 'firebase/firestore';
import { NotificationService } from './notification-service';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Booking {
  id?: string;
  userId: string;
  barberId: string;
  salonId: string;
  services: string[];
  totalPrice: number;
  totalDuration: number; 
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export const BookingEngine = {
  calculateEndTime: (startTime: Date, durationMinutes: number) => {
    return new Date(startTime.getTime() + durationMinutes * 60000);
  },

  /**
   * ATOMIC CREATE: Prevents two users from booking the same slot simultaneously.
   */
  createBooking: async (booking: Omit<Booking, 'id' | 'createdAt' | 'endTime'>) => {
    const endTime = BookingEngine.calculateEndTime(booking.startTime, booking.totalDuration);
    
    try {
      return await runTransaction(db, async (transaction) => {
        // 1. Check for conflicts within the transaction
        const q = query(
          collection(db, 'bookings'),
          where('barberId', '==', booking.barberId),
          where('status', 'in', ['pending', 'confirmed', 'completed'])
        );
        
        const snap = await getDocs(q);
        const conflict = snap.docs.some(d => {
            const bStart = (d.data().startTime as Timestamp).toDate();
            const bEnd = (d.data().endTime as Timestamp).toDate();
            return (booking.startTime < bEnd && endTime > bStart);
        });

        if (conflict) {
          throw new Error("ALREADY_TAKEN");
        }

        // 2. Create the booking document
        const bookingRef = doc(collection(db, 'bookings'));
        transaction.set(bookingRef, {
          ...booking,
          startTime: Timestamp.fromDate(booking.startTime),
          endTime: Timestamp.fromDate(endTime),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'pending'
        });

        return bookingRef.id;
      });
    } catch (e) {
      if ((e as Error).message === "ALREADY_TAKEN") {
        throw new Error("This specific micro-slot was just secured by another node. Please select the next available window.");
      }
      throw e;
    } finally {
        // Trigger notification outside transaction to avoid slowing it down
        NotificationService.sendBookingConfirmation(
            booking.userId, 
            "BarberLink Salon", 
            booking.startTime.toLocaleString()
        ).catch(err => console.error("Post-Booking Async Notify Error:", err));
    }
  },

  updateStatus: async (bookingId: string, status: BookingStatus) => {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status,
      updatedAt: serverTimestamp()
    });
  },

  reschedule: async (bookingId: string, newStartTime: Date, durationMinutes: number) => {
    const endTime = BookingEngine.calculateEndTime(newStartTime, durationMinutes);
    await updateDoc(doc(db, 'bookings', bookingId), {
      startTime: Timestamp.fromDate(newStartTime),
      endTime: Timestamp.fromDate(endTime),
      updatedAt: serverTimestamp(),
      status: 'pending' 
    });
  },

  cancel: async (bookingId: string, userId: string) => {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'cancelled',
      cancelledBy: userId,
      cancelledAt: serverTimestamp()
    });
  }
};
