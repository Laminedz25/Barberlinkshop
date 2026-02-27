import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Star, MapPin } from 'lucide-react';

// Fix for default Leaflet icon not showing correctly in React apps
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMarkerProps {
    position: L.LatLngExpression | null;
}

function LocationMarker({ position }: LocationMarkerProps) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom(), { animate: true });
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>You are here</Popup>
        </Marker>
    );
}

interface SalonData {
    id?: string | number;
    name?: string;
    rating?: number | string;
    reviewCount?: number | string;
    address?: string;
    [key: string]: unknown;
}

interface SalonMapProps {
    salons: SalonData[];
}

const SalonMap = ({ salons }: SalonMapProps) => {
    const navigate = useNavigate();
    const [position, setPosition] = useState<L.LatLngExpression | null>(null);

    useEffect(() => {
        // Fallback timeout in case geolocation hangs completely
        const timer = setTimeout(() => {
            setPosition(prev => {
                if (!prev) return [36.7538, 3.0588];
                return prev;
            });
        }, 5000);

        // Attempt to get user location
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    clearTimeout(timer);
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => {
                    clearTimeout(timer);
                    console.warn("Could not get location", err);
                    setPosition([36.7538, 3.0588]); // Default to Algiers
                },
                { timeout: 4000, maximumAge: 0, enableHighAccuracy: false }
            );
        } else {
            clearTimeout(timer);
            setPosition([36.7538, 3.0588]);
        }

        return () => clearTimeout(timer);
    }, []);

    if (!position) {
        return <div className="h-[600px] flex items-center justify-center bg-muted rounded-xl animate-pulse">Loading Map...</div>;
    }

    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-lg border relative z-0">
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationMarker position={position} />

                {/* Mock adding markers for salons slightly offset from user location for demo purposes */}
                {salons.map((salon, index) => {
                    const lat = (position as number[])[0] + (Math.random() - 0.5) * 0.05;
                    const lng = (position as number[])[1] + (Math.random() - 0.5) * 0.05;

                    return (
                        <Marker key={salon.id || index} position={[lat, lng]}>
                            <Popup className="min-w-[200px]">
                                <div className="p-1">
                                    <h3 className="font-bold text-lg mb-1">{salon.name}</h3>
                                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span className="text-sm font-medium">{salon.rating}</span>
                                        <span className="text-xs text-muted-foreground">({salon.reviewCount})</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3 flex items-start gap-1">
                                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" /> {salon.address}
                                    </p>
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => navigate(`/barber/${salon.id}`)}
                                    >
                                        Book Now
                                    </Button>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
        </div>
    );
};

export default SalonMap;
