import { useState, useEffect, useMemo } from 'react';
import SalonCard from "./SalonCard";
import SalonMap from "./SalonMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { Grid, Map as MapIcon, Loader2, SearchX } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import salon1 from "@/assets/salon-1.jpg";
import salon2 from "@/assets/salon-2.jpg";
import salon3 from "@/assets/salon-3.jpg";

interface SalonGridProps {
  searchQuery?: string;
  locationQuery?: string;
}

const SalonGrid = ({ searchQuery = '', locationQuery = '' }: SalonGridProps) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [dbSalons, setDbSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'barbers'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setDbSalons(snap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          image: doc.data().image || (doc.data().business_name?.includes('Elite') ? salon1 : salon2) 
      })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Sample fallback data for empty systems
  const fallbackSalons = [
    {
      id: 'f1',
      business_name: 'Elite Barbershop (Genesis Node)',
      image: salon1,
      rating: 4.8,
      address: 'Algiers Center, Algeria',
      verified: true,
      openUntil: '22:00',
      priceRange: '1,500-3,000 DZD',
      created_at: new Date().toISOString()
    },
    {
      id: 'f2',
      business_name: 'Oran Style Studio',
      image: salon2,
      rating: 4.9,
      address: 'Boulevard Mohamed V, Oran',
      verified: true,
      openUntil: '20:00',
      priceRange: '2,000-5,000 DZD',
      created_at: new Date().toISOString()
    }
  ];

  const allSalons = dbSalons.length > 0 ? dbSalons : fallbackSalons;

  const filteredSalons = useMemo(() => {
    return allSalons.filter(s => {
        const matchesSearch = !searchQuery || 
                             s.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             s.bio?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocation = !locationQuery || 
                               s.address?.toLowerCase().includes(locationQuery.toLowerCase());
        return matchesSearch && matchesLocation;
    });
  }, [allSalons, searchQuery, locationQuery]);

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
          <span className="font-medium text-foreground">{filteredSalons.length} {t('grid.found')}</span>
          <span>•</span>
          <span>{t('grid.sorted')}</span>
          <span>•</span>
          <span>{locationQuery || "Algeria"}</span>
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
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="font-bold text-muted-foreground animate-pulse">Consulting Global Node Registry...</p>
             </div>
        ) : filteredSalons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-6 bg-slate-50 rounded-full mb-6">
                    <SearchX className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No results matching your request</h3>
                <p className="text-muted-foreground max-w-sm">Try broadening your search or exploring different locations across Algeria.</p>
            </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map((salon) => (
              <SalonCard key={salon.id} salon={salon as any} />
            ))}
          </div>
        ) : (
          <SalonMap salons={filteredSalons} />
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