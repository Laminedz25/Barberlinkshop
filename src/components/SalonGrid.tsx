import { useState } from 'react';
import SalonCard from "./SalonCard";
import SalonMap from "./SalonMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { Grid, Map as MapIcon } from 'lucide-react';
import salon1 from "@/assets/salon-1.jpg";
import salon2 from "@/assets/salon-2.jpg";
import salon3 from "@/assets/salon-3.jpg";

const SalonGrid = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Sample salon data
  const salons = [
    {
      id: '1',
      name: 'Elite Barbershop',
      image: salon1,
      rating: 4.8,
      reviewCount: 124,
      distance: '0.5 km',
      address: 'Rue Didouche Mourad, Algiers Center',
      isOpen: true,
      openUntil: '22:00',
      specialties: ['Classic Cut', 'Beard Styling', 'Hot Towel'],
      priceRange: '1,500-3,000 DZD',
      nextAvailable: 'Today 3:30 PM',
      isVip: true,
      gender: 'men' as const,
      gallery: [
        {
          id: '1',
          type: 'image' as const,
          url: salon1,
          title: 'Classic Haircut',
          description: 'Professional classic haircut for men'
        },
        {
          id: '2',
          type: 'image' as const,
          url: salon2,
          title: 'Beard Styling',
          description: 'Expert beard trimming and styling'
        }
      ]
    },
    {
      id: '2',
      name: 'Glamour Beauty Studio',
      image: salon2,
      rating: 4.9,
      reviewCount: 89,
      distance: '1.2 km',
      address: 'Boulevard Mohamed V, Oran',
      isOpen: true,
      openUntil: '20:00',
      specialties: ['Hair Styling', 'Coloring', 'Manicure', 'Facial'],
      priceRange: '2,000-5,000 DZD',
      nextAvailable: 'Tomorrow 10:00 AM',
      isVip: false,
      gender: 'women' as const,
      gallery: [
        {
          id: '3',
          type: 'image' as const,
          url: salon2,
          title: 'Hair Styling',
          description: 'Professional women hair styling'
        },
        {
          id: '4',
          type: 'image' as const,
          url: salon3,
          title: 'Hair Coloring',
          description: 'Expert hair coloring service'
        }
      ]
    },
    {
      id: '3',
      name: 'Style Hub Unisex',
      image: salon3,
      rating: 4.7,
      reviewCount: 156,
      distance: '0.8 km',
      address: 'Avenue de l\'Independence, Constantine',
      isOpen: false,
      specialties: ['Modern Cut', 'Hair Treatment', 'Styling'],
      priceRange: '1,200-2,800 DZD',
      nextAvailable: 'Tomorrow 9:00 AM',
      isVip: false,
      gender: 'unisex' as const
    },
    {
      id: '4',
      name: 'Royal Men\'s Lounge',
      image: salon1,
      rating: 4.6,
      reviewCount: 98,
      distance: '2.1 km',
      address: 'Rue Larbi Ben M\'hidi, Tlemcen',
      isOpen: true,
      openUntil: '21:30',
      specialties: ['Premium Cut', 'Massage', 'Grooming'],
      priceRange: '2,500-4,500 DZD',
      nextAvailable: 'Today 5:00 PM',
      isVip: true,
      gender: 'men' as const
    },
    {
      id: '5',
      name: 'Bella Vista Salon',
      image: salon2,
      rating: 4.8,
      reviewCount: 203,
      distance: '1.5 km',
      address: 'Place 1er Novembre, Annaba',
      isOpen: true,
      openUntil: '19:00',
      specialties: ['Bridal Hair', 'Extensions', 'Makeup'],
      priceRange: '3,000-8,000 DZD',
      nextAvailable: 'Today 4:15 PM',
      isVip: true,
      gender: 'women' as const
    },
    {
      id: '6',
      name: 'Modern Look Studio',
      image: salon3,
      rating: 4.5,
      reviewCount: 67,
      distance: '3.2 km',
      address: 'Boulevard Emir Abdelkader, Sétif',
      isOpen: true,
      openUntil: '22:30',
      specialties: ['Trendy Cut', 'Color Correction', 'Perm'],
      priceRange: '1,800-3,500 DZD',
      nextAvailable: 'Tomorrow 11:30 AM',
      isVip: false,
      gender: 'unisex' as const
    }
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('grid.title')} <span className="gradient-hero bg-clip-text text-transparent">{t('grid.title.highlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('grid.description')}
          </p>
        </div>

        {/* Filter Summary */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{salons.length} {t('grid.found')}</span>
          <span>•</span>
          <span>{t('grid.sorted')}</span>
          <span>•</span>
          <span>Algiers, Algeria</span>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center p-1 bg-muted rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid className="h-4 w-4" /> Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <MapIcon className="h-4 w-4" /> Map View
            </button>
          </div>
        </div>

        {/* Salon View Mode */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <SalonCard key={salon.id} salon={salon as unknown as React.ComponentProps<typeof SalonCard>['salon']} />
            ))}
          </div>
        ) : (
          <SalonMap salons={salons} />
        )}

        {/* Load More */}
        <div className="text-center mt-12 pb-12">
          <button className="px-8 py-3 bg-secondary text-secondary-foreground rounded-full transition-smooth hover:bg-accent hover:shadow-card">
            {t('grid.load')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default SalonGrid;