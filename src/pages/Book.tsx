import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, CreditCard, Users2 } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StaffMember {
    id: string;
    name: string;
    role: string;
}

interface Service {
    id: string;
    name_ar: string;
    name_en: string;
    name_fr: string;
    price: number;
    duration_minutes: number;
    usage_count?: number;
}

const Book = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const { user } = useAuth();

    const [services, setServices] = useState<Service[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('cash');
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);

    const [searchParams] = useSearchParams();
    const initialChair = searchParams.get('chair') || 'any';
    const [selectedChair, setSelectedChair] = useState<string>(initialChair);

    const mockStaff: StaffMember[] = [
        { id: 's1', name: 'Ahmed (Senior Barber)', role: 'Senior Barber' },
        { id: 's2', name: 'Karim (Fade Specialist)', role: 'Fade Specialist' },
        { id: 's3', name: 'Youssef (Hair Stylist)', role: 'Hair Stylist' }
    ];

    // Hardcoded timeslots for demonstration
    const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

    useEffect(() => {
        if (!id || !date) return;
        const fetchBookedSlots = async () => {
            try {
                const q = query(collection(db, 'appointments'), where('barber_id', '==', id), where('status', 'in', ['pending', 'accepted']));
                const snap = await getDocs(q);
                const slots: string[] = [];
                snap.forEach(d => {
                    const data = d.data();
                    const apptDate = new Date(data.appointment_date);
                    if (apptDate.toDateString() === date.toDateString()) {
                        slots.push(data.appointment_time);
                    }
                });
                setBookedSlots(slots);
                // Clear time if it is now booked
                if (slots.includes(time)) {
                    setTime('');
                }
            } catch (error) {
                console.error("Error fetching booked slots:", error);
            }
        };
        fetchBookedSlots();
    }, [id, date]);

    useEffect(() => {
        if (!user) {
            toast({
                title: t('auth.error'),
                description: 'Please login to book an appointment.',
                variant: 'destructive',
            });
            navigate('/auth');
            return;
        }
        fetchServices();
    }, [id, user]);

    const fetchServices = async () => {
        if (!id) return;
        try {
            const servicesQuery = query(collection(db, 'services'), where('barber_id', '==', id), where('is_active', '==', true));
            const servicesSnap = await getDocs(servicesQuery);
            const servicesList: Service[] = [];
            servicesSnap.forEach(docSnap => {
                servicesList.push({ id: docSnap.id, usage_count: Math.floor(Math.random() * 50), ...(docSnap.data() as Omit<Service, 'id' | 'usage_count'>) });
            });

            // Sort services by usage_count (popularity) descending
            servicesList.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));

            setServices(servicesList);
        } catch (error: unknown) {
            toast({
                title: t('error'),
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getServiceName = (service: Service) => {
        switch (language) {
            case 'ar': return service.name_ar;
            case 'fr': return service.name_fr || service.name_en;
            default: return service.name_en || service.name_ar;
        }
    };

    const toggleService = (serviceId: string) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter(id => id !== serviceId));
        } else {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    const totalAmount = selectedServices.reduce((sum, serviceId) => {
        const service = services.find(s => s.id === serviceId);
        return sum + (service?.price || 0);
    }, 0);

    const totalDuration = selectedServices.reduce((sum, serviceId) => {
        const service = services.find(s => s.id === serviceId);
        return sum + (service?.duration_minutes || 0);
    }, 0);

    const handleBooking = async () => {
        if (!user) return;
        if (selectedServices.length === 0) {
            toast({
                title: t('error'),
                description: 'Please select at least one service.',
                variant: 'destructive',
            });
            return;
        }
        if (!date || !time) {
            toast({
                title: t('error'),
                description: 'Please select a date and time.',
                variant: 'destructive',
            });
            return;
        }

        setBookingLoading(true);

        try {
            await addDoc(collection(db, 'appointments'), {
                barber_id: id,
                customer_id: user.uid,
                services: selectedServices,
                total_price: totalAmount,
                total_duration: totalDuration,
                appointment_date: date.toISOString(),
                appointment_time: time,
                payment_method: paymentMethod,
                barber_chair_id: selectedChair,
                status: 'pending',
                created_at: new Date().toISOString()
            });

            toast({
                title: 'Success',
                description: 'Your appointment has been booked successfully!',
            });
            navigate(`/`); // Can navigate to user appointments later
        } catch (error: unknown) {
            toast({
                title: t('error'),
                description: (error as Error).message,
                variant: 'destructive',
            });
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">{t('loading')}</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <main className="container mx-auto px-4 py-8 mt-20 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">

                        {/* Services Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    Select Services
                                </CardTitle>
                                <CardDescription>Choose one or more services</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {services.length === 0 ? (
                                    <p className="text-muted-foreground">No services available</p>
                                ) : (
                                    services.map((service) => (
                                        <div key={service.id} className="flex items-center justify-between space-x-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`service-${service.id}`}
                                                    checked={selectedServices.includes(service.id)}
                                                    onCheckedChange={() => toggleService(service.id)}
                                                />
                                                <Label htmlFor={`service-${service.id}`} className="text-md cursor-pointer">{getServiceName(service)}</Label>
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-semibold text-primary">{service.price} {t('currency')}</span>
                                                <span className="text-muted-foreground ml-2">({service.duration_minutes} min)</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Barber / Chair Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Users2 className="h-5 w-5" /> {t('salon.staff')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select value={selectedChair} onValueChange={setSelectedChair}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('salon.staff')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">{t('booking.notspecified')}</SelectItem>
                                        {mockStaff.map(staff => (
                                            <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Date & Time Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Calendar className="h-5 w-5" /> Select Date & Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CalendarUI
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border mx-auto"
                                />

                                <div className="mt-6">
                                    <Label className="mb-2 block">Available Times</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {timeSlots.map(slot => (
                                            <Button
                                                key={slot}
                                                variant={time === slot ? "default" : "outline"}
                                                className={`w-full ${bookedSlots.includes(slot) ? 'opacity-50 line-through' : ''}`}
                                                onClick={() => !bookedSlots.includes(slot) && setTime(slot)}
                                                disabled={bookedSlots.includes(slot)}
                                            >
                                                {slot}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Options */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" /> Payment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={paymentMethod} onValueChange={(val: string) => setPaymentMethod(val)}>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <RadioGroupItem value="baridimob" id="baridimob" />
                                        <Label htmlFor="baridimob" className="cursor-pointer">BaridiMob (بريدي موب)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <RadioGroupItem value="paypal" id="paypal" />
                                        <Label htmlFor="paypal" className="cursor-pointer">PayPal</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <RadioGroupItem value="visacard" id="visacard" />
                                        <Label htmlFor="visacard" className="cursor-pointer">Visa Card</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <RadioGroupItem value="google_pay" id="google_pay" />
                                        <Label htmlFor="google_pay" className="cursor-pointer">Google Pay</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="cash" id="cash" />
                                        <Label htmlFor="cash" className="cursor-pointer">Cash after service (الدفع في الصالون)</Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                    </div>

                    <div className="space-y-6">
                        {/* Booking Summary */}
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-2xl">Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm border-b pb-2">
                                        <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4" /> Date</span>
                                        <span className="font-medium">{date ? format(date, 'PPP') : 'Not selected'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b pb-2">
                                        <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4" /> Time</span>
                                        <span className="font-medium">{time || 'Not selected'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b pb-2">
                                        <span className="text-muted-foreground flex items-center gap-1"><Users2 className="h-4 w-4" /> Staff</span>
                                        <span className="font-medium">{selectedChair === 'any' ? t('booking.notspecified') : mockStaff.find(s => s.id === selectedChair)?.name}</span>
                                    </div>

                                    <div className="pt-2">
                                        <h4 className="font-semibold mb-2">Selected Services ({selectedServices.length})</h4>
                                        {selectedServices.map(serviceId => {
                                            const svc = services.find(s => s.id === serviceId);
                                            return (
                                                <div key={serviceId} className="flex justify-between text-sm text-muted-foreground mb-1">
                                                    <span>{svc ? getServiceName(svc) : ''}</span>
                                                    <span>{svc?.price} {t('currency')}</span>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="flex justify-between items-center font-bold text-lg pt-4 border-t border-primary/20">
                                        <span>Total ({totalDuration} min)</span>
                                        <span className="text-primary">{totalAmount} {t('currency')}</span>
                                    </div>

                                    <Button
                                        className="w-full mt-4"
                                        size="lg"
                                        onClick={handleBooking}
                                        disabled={bookingLoading || selectedServices.length === 0 || !time || !date}
                                    >
                                        {bookingLoading ? 'Processing...' : 'Confirm Book'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Book;
