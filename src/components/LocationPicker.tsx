import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useLanguage } from "@/contexts/LanguageContext";

// Fix standard marker icon issue in react-leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    defaultLat?: number;
    defaultLng?: number;
}

const LocationPicker = ({ onLocationSelect, defaultLat = 36.7525, defaultLng = 3.04197 }: LocationPickerProps) => {
    const [position, setPosition] = useState<L.LatLng | null>(
        defaultLat && defaultLng ? new L.LatLng(defaultLat, defaultLng) : null
    );
    const { isRTL } = useLanguage();

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            },
        });

        return position === null ? null : (
            <Marker position={position}></Marker>
        );
    };

    useEffect(() => {
        if (defaultLat && defaultLng) {
            setPosition(new L.LatLng(defaultLat, defaultLng));
        }
    }, [defaultLat, defaultLng]);

    return (
        <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
                {isRTL ? "انقر على الخريطة لتحديد موقعك بدقة:" : "Click on the map to pin your exact location:"}
            </p>
            <div className="h-[250px] w-full rounded-2xl overflow-hidden shadow-md border z-0 relative">
                <MapContainer center={[defaultLat, defaultLng]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker />
                </MapContainer>
            </div>
        </div>
    );
};

export default LocationPicker;
