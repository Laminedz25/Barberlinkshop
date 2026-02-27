import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star, MapPin, Phone, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface SalonCardProps {
  salon: {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviewCount: number;
    distance: string;
    address: string;
    isOpen: boolean;
    specialties: string[];
    priceRange: string;
    nextAvailable: string;
    isVip: boolean;
    gender: 'men' | 'women' | 'unisex';
    salonType?: 'men' | 'women' | 'unisex';
    phone?: string;
    whatsapp?: string;
  };
}

const SalonCard = ({ salon }: SalonCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'men': return t('salon.men');
      case 'women': return t('salon.women');
      case 'unisex': return t('salon.mixed');
      default: return '';
    }
  };

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
    <>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in">
        <div className="relative overflow-hidden aspect-[4/3] cursor-pointer" onClick={() => navigate(`/barber/${salon.id}`)}>
          <img
            src={salon.image}
            alt={salon.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Distance Badge - Top Left */}
          <Badge className="absolute top-3 left-3 bg-white/95 text-foreground backdrop-blur-sm border-0 shadow-md">
            {salon.distance}
          </Badge>

          {/* Rating Badge - Top Right */}
          <Badge className="absolute top-3 right-3 bg-amber-400 text-white backdrop-blur-sm border-0 shadow-md">
            <Star className="h-3 w-3 fill-white mr-1" />
            {salon.rating}
          </Badge>

          {/* VIP Badge */}
          {salon.isVip && (
            <Badge className="absolute bottom-3 left-3 bg-primary text-white border-0 shadow-md">
              {t('salon.vip')}
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Name and Salon Type */}
          <div className="flex items-center gap-2 flex-wrap cursor-pointer" onClick={() => navigate(`/barber/${salon.id}`)}>
            <h3 className="font-bold text-lg hover:text-primary transition-colors">{salon.name}</h3>
            <Badge className={getSalonTypeBadgeColor(salon.salonType || salon.gender)}>
              {getSalonTypeText(salon.salonType || salon.gender)}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{salon.address}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-primary">
              {salon.priceRange}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{salon.rating}</span>
              <span className="text-muted-foreground">({salon.reviewCount} {t('salon.reviews')})</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {salon.specialties.slice(0, 4).map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-primary hover:bg-[#007BFF] text-white transition-smooth"
              onClick={() => navigate(`/book/${salon.id}`)}
            >
              {t('salon.book')}
            </Button>
            <Button
              onClick={() => salon.phone ? handleCall() : undefined}
              variant="outline"
              size="icon"
              className="hover:bg-[#007BFF] hover:text-white hover:border-[#007BFF] transition-smooth border-slate-300 dark:border-slate-700"
              title={t('contact.call')}
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => salon.whatsapp ? handleWhatsApp() : navigate(`/chat/${salon.id}`)}
              variant="outline"
              size="icon"
              className="hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-smooth border-slate-300 dark:border-slate-700"
              title={salon.whatsapp ? t('contact.whatsapp') : t('contact.chat')}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default SalonCard;
