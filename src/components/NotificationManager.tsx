import { useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotificationManager() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { t } = useLanguage();
    const notified30m = useRef<Set<string>>(new Set());
    const notified15m = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!user) return;

        const checkAppointments = async () => {
            try {
                // Query as customer
                const qCustomer = query(collection(db, 'appointments'), where('customer_id', '==', user.uid));
                // We will need the barber document id to query as barber. 
                // A simpler way: just query where barber_id == user.uid? No, barber_id is the doc ID of the barber collection, not user.uid.
                // Let's get barberProfile if exists.
                const barberProfQuery = query(collection(db, 'barbers'), where('user_id', '==', user.uid));
                const barberProfSnap = await getDocs(barberProfQuery);
                let barberDocId = null;
                if (!barberProfSnap.empty) {
                    barberDocId = barberProfSnap.docs[0].id;
                }

                const appointments: Record<string, unknown>[] = [];
                const snapCustomer = await getDocs(qCustomer);
                snapCustomer.docs.forEach(d => appointments.push({ id: d.id, ...d.data() }));

                if (barberDocId) {
                    const qBarber = query(collection(db, 'appointments'), where('barber_id', '==', barberDocId));
                    const snapBarber = await getDocs(qBarber);
                    // avoid duplicates just in case
                    const existingIds = new Set(appointments.map(a => a.id));
                    snapBarber.docs.forEach(d => {
                        if (!existingIds.has(d.id)) {
                            appointments.push({ id: d.id, ...d.data() });
                        }
                    });
                }

                const now = new Date();

                appointments.forEach(appt => {
                    if (appt.status !== 'accepted') return;

                    const apptDate = new Date(`${appt.appointment_date.split('T')[0]}T${appt.appointment_time}`);
                    const diffMs = apptDate.getTime() - now.getTime();
                    const diffMins = Math.floor(diffMs / (1000 * 60));

                    if (diffMins > 15 && diffMins <= 30 && !notified30m.current.has(appt.id)) {
                        toast({
                            title: t('notification.upcoming.30m'),
                            description: `${t('notification.upcoming.msg')}`,
                        });
                        notified30m.current.add(appt.id);
                    }

                    if (diffMins > 0 && diffMins <= 15 && !notified15m.current.has(appt.id)) {
                        toast({
                            title: t('notification.upcoming.15m'),
                            description: `${t('notification.upcoming.msg')}`,
                            variant: 'destructive',
                        });
                        notified15m.current.add(appt.id);
                    }
                });

            } catch (error) {
                console.error("Error checking notifications", error);
            }
        };

        checkAppointments();
        const interval = setInterval(checkAppointments, 60000);
        return () => clearInterval(interval);
    }, [user, t, toast]);

    return null;
}
