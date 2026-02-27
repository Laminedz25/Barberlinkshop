import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, CreditCard, Wallet } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviewCount: number;
    address: string;
    priceRange: string;
    isVip: boolean;
    gender: 'men' | 'women' | 'unisex';
    specialties: string[];
  };
}

const BookingModal = ({ isOpen, onClose, salon }: BookingModalProps) => {
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('after_service');
  const { t } = useLanguage();

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t('booking.title')} - {salon.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Service Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('booking.service')}</label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('booking.service.select')} />
              </SelectTrigger>
              <SelectContent>
                {salon.specialties.map((service, index) => (
                  <SelectItem key={index} value={service}>
                    {service} - {salon.priceRange}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {t('booking.date')}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : t('booking.date.select')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('booking.time')}
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className={cn(
                    "h-10",
                    selectedTime === time && "bg-primary text-white"
                  )}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('booking.payment')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPayment('electronic')}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  selectedPayment === 'electronic'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <CreditCard className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">{t('payment.electronic')}</div>
              </button>
              <button
                onClick={() => setSelectedPayment('after_service')}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  selectedPayment === 'after_service'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Wallet className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">{t('payment.after.visit')}</div>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{selectedService || t('booking.service.none')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>{t('booking.total')}</span>
              <span className="text-primary">{salon.priceRange}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              {t('booking.cancel')}
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              disabled={!selectedService || !date || !selectedTime}
            >
              {t('booking.confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;