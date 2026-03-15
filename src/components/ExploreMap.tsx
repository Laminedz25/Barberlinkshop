import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useLanguage } from "@/contexts/LanguageContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { Star, MapPin } from "lucide-react";

interface BarberLocation {
    id: string;
    business_name: string;
    type: string;
    coordinates: { lat: number; lng: number };
    rating: number;
}

const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const ExploreMap = () => {
    const { isRTL, t } = useLanguage();
    const navigate = useNavigate();
    const [barbers, setBarbers] = useState<BarberLocation[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        // Get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => {
                    // Default to Algiers if location access denied
                    setUserLocation({ lat: 36.7525, lng: 3.04197 });
                }
            );
        } else {
            setUserLocation({ lat: 36.7525, lng: 3.04197 });
        }

        const fetchBarbersWithLocation = async () => {
            try {
                const q = query(collection(db, "barbers"), where("is_active", "==", true));
                const snap = await getDocs(q);
                const barbersData: BarberLocation[] = [];
                snap.forEach((doc) => {
                    const data = doc.data();
                    if (data.coordinates && data.coordinates.lat && data.coordinates.lng) {
                        barbersData.push({
                            id: doc.id,
                            business_name: data.business_name,
                            type: data.type,
                            coordinates: data.coordinates,
                            rating: data.rating || 5,
                        });
                    }
                });
                setBarbers(barbersData);
            } catch (error) {
                console.error("Error fetching map barbers:", error);
            }
        };

        fetchBarbersWithLocation();
    }, []);

    if (!userLocation) {
        return (
            <div className="h-[500px] w-full rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center border shadow-inner">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin className="text-primary w-6 h-6" />
                    {isRTL ? "اكتشف الصالونات القريبة منك" : "Discover Nearby Salons"}
                </h2>
            </div>

            <div className="h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 z-0 relative">
                <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={12} scrollWheelZoom={true} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />

                    {/* User Marker */}
                    <Marker position={[userLocation.lat, userLocation.lng]}>
                        <Popup>
                            <div className="font-bold text-center">{isRTL ? "أنت هنا" : "You are here"}</div>
                        </Popup>
                    </Marker>

                    {/* Barber Markers */}
                    {barbers.map((barber) => (
                        <Marker key={barber.id} position={[barber.coordinates.lat, barber.coordinates.lng]}>
                            <Popup className="rounded-2xl">
                                <div className="flex flex-col gap-2 p-1 max-w-[200px] text-center">
                                    <h3 className="font-bold text-lg">{barber.business_name}</h3>
                                    <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{barber.rating}</span>
                                    </div>
                                    <Badge className="w-fit mx-auto mb-2 text-xs uppercase bg-primary/10 text-primary hover:bg-primary/20">
                                        {barber.type.replace('_', ' ')}
                                    </Badge>
                                    <Button size="sm" onClick={() => navigate(`/barber/${barber.id}`)} className="rounded-full w-full">
                                        {t('dashboard.view.profile')}
                                    </Button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default ExploreMap;
