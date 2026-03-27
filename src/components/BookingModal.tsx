import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, CreditCard, Wallet, Users2, CheckCircle2, ChevronRight, Sparkles, Scissors } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BookingEngine } from "@/lib/booking-engine";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  duration_minutes: number;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
  salonName: string;
}

const BookingModal = ({ isOpen, onClose, salonId, salonName }: BookingModalProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'electronic' | 'after_service'>('after_service');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  // --- PERSISTENCE LAYER: Prevent data loss on disconnect or reload ---
  useEffect(() => {
    if (!isOpen || !salonId) return;
    const saved = localStorage.getItem(`booking_cache_${salonId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedServices(parsed.services || []);
        setSelectedBarberId(parsed.barberId || '');
        setStep(parsed.step || 1);
        console.log("[Sentinel] Recovered booking state from local cache.");
      } catch (e) { console.error("Cache recovery failed", e); }
    }
  }, [isOpen, salonId]);

  useEffect(() => {
    if (isOpen && salonId && step > 0) {
      localStorage.setItem(`booking_cache_${salonId}`, JSON.stringify({
        services: selectedServices,
        barberId: selectedBarberId,
        step: step,
        updatedAt: Date.now()
      }));
    }
  }, [selectedServices, selectedBarberId, step, isOpen, salonId]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(`booking_cache_${salonId}`);
  }, [salonId]);

  const fetchData = useCallback(async () => {
    try {
      const sSnap = await getDocs(query(collection(db, 'services'), where('barber_id', '==', salonId)));
      setServices(sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
      
      const stSnap = await getDocs(collection(db, 'barbers', salonId, 'staff'));
      if (!stSnap.empty) {
        setStaff(stSnap.docs.map(d => ({ id: d.id, ...d.data() } as StaffMember)));
      } else {
        setStaff([{ id: 'owner', name: salonName, role: 'Master Barber' }]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [salonId, salonName]);

  useEffect(() => {
    if (isOpen && salonId) {
      fetchData();
    }
  }, [isOpen, salonId, fetchData]);

  const totals = useMemo(() => {
    const selectedList = services.filter(s => selectedServices.includes(s.id));
    return {
      price: selectedList.reduce((acc, curr) => acc + curr.price, 0),
      duration: selectedList.reduce((acc, curr) => acc + curr.duration_minutes, 0)
    };
  }, [selectedServices, services]);

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    if (!user) return toast({ title: "Authentication Required", description: "Please sign in to book." });
    if (!date || !selectedTime || !selectedBarberId) return;

    setIsSubmitting(true);
    
    if (paymentMethod === 'electronic') {
        setPaymentStatus('processing');
        // Simulated Secure Gateway Handshake
        await new Promise(r => setTimeout(r, 2000));
        setPaymentStatus('success');
    }

    try {
      const startTime = new Date(date);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      startTime.setHours(hours, minutes, 0, 0);

      await BookingEngine.createBooking({
        userId: user.uid,
        barberId: selectedBarberId,
        salonId: salonId,
        services: selectedServices,
        totalPrice: totals.price,
        totalDuration: totals.duration,
        startTime: startTime,
        status: paymentMethod === 'electronic' ? 'confirmed' : 'pending'
      });

      clearCache();
      toast({ 
          title: "Booking Confirmed!", 
          description: `Your appointment at ${salonName} is set for ${format(startTime, 'PPP')} at ${selectedTime}.`,
          variant: "default" 
      });
      
      setTimeout(() => {
        onClose();
        setStep(1);
        setPaymentStatus('idle');
      }, 1000);

    } catch (e) {
      const error = e as Error;
      toast({ title: "Booking Error", description: error.message, variant: "destructive" });
      setPaymentStatus('failed');
    } finally {
      setIsSubmitting(false);
    }
  };
   const isConfirmDisabled = !selectedServices.length || !selectedBarberId || !date || !selectedTime || isSubmitting || paymentStatus === 'processing';

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
        <div className="flex h-full">
            {/* Sidebar Visual */}
            <div className="hidden md:flex w-1/3 bg-slate-950 p-10 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-primary/20 blur-[100px] rounded-full -ml-32 -mt-32" />
                <div className="relative z-10">
                    <Sparkles className="text-primary w-10 h-10 mb-6" />
                    <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter">Your Next Look Starts Here.</h2>
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <p className="text-[10px] font-black tracking-widest text-primary uppercase mb-1">Total Estate</p>
                        <p className="text-2xl font-black text-white">{totals.price} DZD</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <p className="text-[10px] font-black tracking-widest text-white/50 uppercase mb-1">Estimated Time</p>
                        <p className="text-xl font-bold text-white">{totals.duration} MIN</p>
                    </div>
                </div>
            </div>

            {/* Main Flow */}
            <div className="flex-1 p-10 bg-white dark:bg-slate-900">
                <DialogHeader className="mb-8">
                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase whitespace-nowrap">
                        {step === 1 ? 'Select Services' : step === 2 ? 'Choose Expert' : 'Final Details'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {services.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => toggleService(s.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all text-left",
                                            selectedServices.includes(s.id) 
                                                ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                                                : "border-slate-100 dark:border-slate-800 hover:border-primary/30"
                                        )}
                                    >
                                        <div>
                                            <p className="font-bold text-sm leading-none mb-1">{language === 'ar' ? s.name_ar : s.name_en}</p>
                                            <p className="text-[10px] font-black uppercase text-muted-foreground">{s.duration_minutes} MIN • {s.price} DZD</p>
                                        </div>
                                        {selectedServices.includes(s.id) && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                    </button>
                                ))}
                            </div>
                            <Button disabled={selectedServices.length === 0} onClick={() => setStep(2)} className="w-full h-16 rounded-2xl font-black text-lg gap-2">
                                Continue <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {staff.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedBarberId(m.id)}
                                        className={cn(
                                            "p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                                            selectedBarberId === m.id ? "border-primary bg-primary/5" : "border-slate-100 dark:border-slate-800"
                                        )}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                            <img src={m.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed='+m.name} alt="" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{m.name}</p>
                                            <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{m.role}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl font-bold">Back</Button>
                                <Button disabled={!selectedBarberId} onClick={() => setStep(3)} className="flex-2 h-14 rounded-2xl font-black px-8">Pick DateTime</Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Select Date</label>
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                                        className="rounded-2xl border bg-slate-50/50"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Available Slots</label>
                                    <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {timeSlots.map((time) => (
                                            <Button
                                                key={time}
                                                variant={selectedTime === time ? "default" : "outline"}
                                                className={cn("h-12 rounded-xl text-xs font-bold", selectedTime === time && "shadow-lg shadow-primary/20")}
                                                onClick={() => setSelectedTime(time)}
                                            >
                                                {time}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-sm">Preferred Payment</span>
                                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border">
                                        <button onClick={() => setPaymentMethod('after_service')} className={cn("px-4 py-2 rounded-lg text-xs font-bold", paymentMethod === 'after_service' ? "bg-primary text-white" : "text-slate-500")}>In Shop</button>
                                        <button onClick={() => setPaymentMethod('electronic')} className={cn("px-4 py-2 rounded-lg text-xs font-bold", paymentMethod === 'electronic' ? "bg-primary text-white" : "text-slate-500")}>Online</button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-14 rounded-2xl font-bold">Back</Button>
                                <Button 
                                    disabled={isConfirmDisabled} 
                                    onClick={handleConfirm} 
                                    className="flex-3 h-14 rounded-2xl font-black px-12 text-lg shadow-xl shadow-primary/20"
                                >
                                    {paymentStatus === 'processing' ? 'PROCESSING GATEWAY...' :
                                     isSubmitting ? "SYNCING LEDGER..." : 
                                     "Confirm & Book Now"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;