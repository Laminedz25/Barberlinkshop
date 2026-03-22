import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Calendar, Clock, Star } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Appointment {
    id: string;
    barber_id: string;
    services: string[];
    total_price: number;
    total_duration: number;
    appointment_date: string;
    appointment_time: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    created_at: string;
    barber_name?: string;
}

const CustomerDashboard = () => {
    const { user } = useAuth();
    const { t, isRTL } = useLanguage();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(5);
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        fetchMyBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate]);

    const fetchMyBookings = async () => {
        try {
            const q = query(collection(db, 'appointments'), where('customer_id', '==', user?.uid));
            const snap = await getDocs(q);
            const appts: Appointment[] = [];

            for (const docSnap of snap.docs) {
                const apptData = docSnap.data() as Appointment;
                apptData.id = docSnap.id;

                const barberRef = await getDocs(query(collection(db, 'barbers'), where('__name__', '==', apptData.barber_id)));
                if (!barberRef.empty) {
                    const barberData = barberRef.docs[0].data();
                    apptData.barber_name = barberData.business_name;
                }
                appts.push(apptData);
            }

            appts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setAppointments(appts);
        } catch (error) {
            toast({ title: t('error'), description: error instanceof Error ? error.message : "An error occurred", variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async () => {
        if (!selectedAppt || !user) return;
        try {
            await addDoc(collection(db, 'reviews'), {
                barber_id: selectedAppt.barber_id,
                customer_id: user.uid,
                rating,
                comment: reviewText,
                appointment_id: selectedAppt.id,
                created_at: new Date().toISOString()
            });
            toast({ title: t('auth.signup.success'), description: t('dashboard.review.submit') + ' ✓' });
            setIsReviewOpen(false);
            setReviewText('');
            setRating(5);
        } catch (error) {
            toast({ title: t('error'), description: error instanceof Error ? error.message : "An error occurred", variant: 'destructive' });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/30';
            case 'accepted': return 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30';
            case 'completed': return 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30';
            case 'rejected': return 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-20 transition-colors duration-300">
            <Navigation />

            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px]" />
            </div>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
                        {t('dashboard.title.customer')}
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 p-12 text-center shadow-2xl transition-all hover:shadow-primary/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h2 className="text-2xl font-bold mb-4">{t('dashboard.customer.empty')}</h2>
                        <Button size="lg" className="rounded-full shadow-xl shadow-primary/20" onClick={() => navigate('/')}>
                            {t('dashboard.explore')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {appointments.map(appt => (
                            <div key={appt.id} className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-6 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.01] overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <Badge className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getStatusColor(appt.status)}`}>
                                                {t(`dashboard.requests.${appt.status === 'pending' ? 'online' : appt.status}`) || appt.status}
                                            </Badge>
                                            <h3 className="text-2xl font-bold truncate">{appt.barber_name || 'Barber'}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                                <Calendar className="h-5 w-5 text-primary" />
                                                <span className="font-medium">{new Date(appt.appointment_date).toLocaleDateString()} at {appt.appointment_time}</span>
                                            </div>
                                            <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                                <Clock className="h-5 w-5 text-primary" />
                                                <span className="font-medium">{appt.total_duration} {t('dashboard.service.duration').replace('(minutes)', '')}</span>
                                            </div>
                                            <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-2xl sm:col-span-2">
                                                <span className="font-bold text-lg text-foreground">
                                                    {t('booking.total')}: {appt.total_price} {t('currency')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-end gap-3 min-w-[200px]">
                                        {appt.status === 'completed' && (
                                            <Dialog open={isReviewOpen && selectedAppt?.id === appt.id} onOpenChange={(open) => {
                                                setIsReviewOpen(open);
                                                if (open) setSelectedAppt(appt);
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="rounded-full border-primary/50 text-primary hover:bg-primary shadow-lg hover:shadow-primary/25 hover:text-white transition-all">
                                                        <Star className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} drop-shadow-sm`} /> {t('dashboard.review.write')}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="rounded-[2rem] p-6 sm:p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border-white/20">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-bold text-center mb-2">{t('dashboard.review.rate')}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-6 py-4">
                                                        <div className="flex justify-center gap-3">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-10 w-10 cursor-pointer transition-all hover:scale-110 ${star <= rating ? 'fill-yellow-400 text-yellow-400 drop-shadow-md' : 'text-slate-200 dark:text-slate-700'}`}
                                                                    onClick={() => setRating(star)}
                                                                />
                                                            ))}
                                                        </div>
                                                        <Textarea
                                                            placeholder="..."
                                                            className="min-h-[120px] rounded-2xl resize-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                                            value={reviewText}
                                                            onChange={(e) => setReviewText(e.target.value)}
                                                        />
                                                        <Button onClick={handleReviewSubmit} size="lg" className="w-full rounded-full text-lg shadow-xl shadow-primary/20">
                                                            {t('dashboard.review.submit')}
                                                        </Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                        <Button variant="ghost" className="rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50" onClick={() => navigate(`/barber/${appt.barber_id}`)}>
                                            {t('dashboard.view.profile')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CustomerDashboard;

