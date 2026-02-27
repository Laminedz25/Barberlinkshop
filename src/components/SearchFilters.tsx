import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Filter, 
  MapPin, 
  Star, 
  DollarSign, 
  Users, 
  Clock,
  Scissors,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const SearchFilters = () => {
  const { t } = useLanguage();
  const [priceRange, setPriceRange] = useState([1000, 5000]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const quickFilters = [
    { id: 'nearby', label: t('filters.nearby'), icon: MapPin },
    { id: 'open-now', label: t('filters.open'), icon: Clock },
    { id: 'highly-rated', label: t('filters.rated'), icon: Star },
    { id: 'vip-service', label: t('filters.vip'), icon: Sparkles },
  ];

  const services = [
    { id: 'haircut', label: t('service.haircut') },
    { id: 'beard', label: t('service.beard') },
    { id: 'styling', label: t('service.styling') },
    { id: 'coloring', label: t('service.coloring') },
    { id: 'keratin', label: t('service.keratin') },
    { id: 'protein', label: t('service.protein') },
    { id: 'manicure', label: 'Manicure' },
    { id: 'pedicure', label: 'Pedicure' },
    { id: 'facial', label: t('service.facial') },
    { id: 'massage', label: t('service.massage') }
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  return (
    <Card className="shadow-card">
      <CardContent className="p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">{t('filters.title')}</h3>
          {selectedFilters.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedFilters([])}
              className="text-muted-foreground hover:text-foreground"
            >
              {t('filters.clear')}
            </Button>
          )}
        </div>

        {/* Search Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('filters.location')}</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t('filters.location.placeholder')}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('filters.quick')}</label>
          <div className="grid grid-cols-2 gap-2">
            {quickFilters.map((filter) => {
              const Icon = filter.icon;
              const isActive = selectedFilters.includes(filter.id);
              
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter(filter.id)}
                  className={`justify-start ${isActive ? 'gradient-hero text-white' : ''}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Gender Preference */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('filters.gender')}</label>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filter.all')}</SelectItem>
              <SelectItem value="men">{t('filter.men')}</SelectItem>
              <SelectItem value="women">{t('filter.women')}</SelectItem>
              <SelectItem value="unisex">{t('filter.unisex')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Services */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('filters.services')}</label>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => {
              const isActive = selectedFilters.includes(service.id);
              return (
                <Badge
                  key={service.id}
                  variant={isActive ? "default" : "secondary"}
                  className={`cursor-pointer transition-smooth hover:scale-105 ${
                    isActive ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => toggleFilter(service.id)}
                >
                  <Scissors className="h-3 w-3 mr-1" />
                  {service.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t('filters.price')}</label>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              {priceRange[0]} - {priceRange[1]} {t('currency')}
            </div>
          </div>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={10000}
            min={500}
            step={250}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>500 {t('currency')}</span>
            <span>10,000 {t('currency')}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('filters.rating')}</label>
          <Select defaultValue="4">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3+ {t('salon.reviews')}</SelectItem>
              <SelectItem value="4">4+ {t('salon.reviews')}</SelectItem>
              <SelectItem value="4.5">4.5+ {t('salon.reviews')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Apply Filters */}
        <Button className="w-full gradient-hero text-white transition-bounce hover:scale-105">
          <Filter className="h-4 w-4 mr-2" />
          {t('filters.apply')} ({selectedFilters.length})
        </Button>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;