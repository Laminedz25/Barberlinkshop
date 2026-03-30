import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star, MapPin, Phone, MessageCircle, Share2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface SalonCardProps {
  salon: {
    id: string;
    business_name?: string;
    name?: string; // Fallback
    image: string;
    rating?: number;
    reviewCount?: number;
    distance?: string;
    address?: string;
    isOpen?: boolean;
    specialties?: string[];
    priceRange?: string;
    nextAvailable?: string;
    isVip?: boolean;
    gender?: 'men' | 'women' | 'unisex';
    salonType?: 'men' | 'women' | 'unisex';
    phone?: string;
    whatsapp?: string;
    user_id?: string;
  };
}

const SalonCard = ({ salon }: SalonCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const businessName = salon.business_name || salon.name || "Unnamed Salon";
  const rating = salon.rating || 5.0;
  const reviewCount = salon.reviewCount || 0;
  const specialties = salon.specialties || [];
  const distance = salon.distance || "Near you";
  const priceRange = salon.priceRange || "1,000 - 3,000 DZD";

  const getSalonTypeText = (type?: string) => {
    switch (type) {
      case 'men': return t('salon.type.men');
      case 'women': return t('salon.type.women');
      case 'unisex': return t('salon.type.unisex');
      default: return t('salon.type.men');
    }
  };

  const getSalonTypeBadgeColor = (type?: string) => {
    switch (type) {
      case 'men': return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'women': return 'bg-pink-500 text-white hover:bg-pink-600';
      case 'unisex': return 'bg-purple-500 text-white hover:bg-purple-600';
      default: return 'bg-blue-500 text-white hover:bg-blue-600';
    }
  };

  const handleCall = () => {
    if (salon.phone) {
      window.location.href = `tel:${salon.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (salon.whatsapp) {
      window.open(`https://wa.me/${salon.whatsapp}`, '_blank');
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-500 animate-fade-in border-slate-100 rounded-[2.5rem] bg-white">
      <div className="relative overflow-hidden aspect-[4/3] cursor-pointer" onClick={() => navigate(`/salon/${salon.id}`)}>
        <img
          src={salon.image}
          alt={businessName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Distance Badge - Top Left */}
        <Badge className="absolute top-4 left-4 bg-white/95 text-foreground backdrop-blur-sm border-0 shadow-xl py-2 px-4 rounded-2xl font-black text-[10px] uppercase">
          {distance}
        </Badge>

        {/* Rating Badge - Top Right */}
        <Badge className="absolute top-4 right-4 bg-amber-400 text-white backdrop-blur-sm border-0 shadow-xl py-2 px-4 rounded-2xl">
          <Star className="h-3 w-3 fill-white mr-1" />
          <span className="font-black">{rating}</span>
        </Badge>

        {/* VIP Badge */}
        {salon.isVip && (
          <Badge className="absolute bottom-4 left-4 bg-primary text-white border-0 shadow-lg py-2 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">
            {t('salon.vip')}
          </Badge>
        )}
      </div>

      <div className="p-8 space-y-6">
        {/* Name and Salon Type */}
        <div className="space-y-2">
          <Badge className={`${getSalonTypeBadgeColor(salon.salonType || salon.gender)} border-0 rounded-full py-1 text-[9px] font-black uppercase tracking-tighter`}>
             {getSalonTypeText(salon.salonType || salon.gender)}
          </Badge>
          <div className="cursor-pointer" onClick={() => navigate(`/salon/${salon.id}`)}>
            <h3 className="font-black text-2xl tracking-tighter hover:text-primary transition-colors uppercase leading-none">{businessName}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
          <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
          <span className="line-clamp-1">{salon.address || "Location unmapped"}</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-2xl font-black tracking-tighter text-primary">
            {priceRange}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground font-bold italic">({reviewCount} {t('salon.reviews')})</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {specialties.length > 0 ? specialties.slice(0, 3).map((specialty, index) => (
            <Badge key={index} variant="secondary" className="text-[10px] font-black tracking-tighter uppercase px-3 py-1 rounded-xl bg-slate-100 text-slate-600">
              {specialty}
            </Badge>
          )) : (
            <Badge variant="secondary" className="text-[10px] font-black tracking-tighter uppercase px-3 py-1 rounded-xl bg-slate-50 text-slate-400 italic">
              Elite Styling
            </Badge>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-xl transition-all hover:scale-[1.02] active:scale-95"
            onClick={() => navigate(`/book/${salon.id}`)}
          >
            QUICK BOOK
          </Button>
          <Button
            className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            onClick={() => navigate(`/salon/${salon.id}`)}
          >
            EXPLORE
          </Button>
          <Button
            onClick={() => {
              const url = `${window.location.origin}/barber/${salon.id}`;
              if (navigator.share) {
                navigator.share({ title: businessName, url });
              } else {
                navigator.clipboard.writeText(url);
                alert("Link copied to clipboard!");
              }
            }}
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-2xl border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => navigate(`/chat/${salon.user_id || salon.id}`)}
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-2xl border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SalonCard;
