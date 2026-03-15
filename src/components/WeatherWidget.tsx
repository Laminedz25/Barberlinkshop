import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sun, Cloud, CloudRain, Snowflake, Wind, Loader2 } from 'lucide-react';

interface WeatherData {
    temperature: number;
    weathercode: number;
}

const WeatherWidget = ({ lat = 36.7525, lon = 3.04197 }) => { // Default to Algiers
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const { isRTL } = useLanguage();

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                const json = await res.json();
                setData(json.current_weather);
            } catch (error) {
                console.error("Failed to fetch weather", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, [lat, lon]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4 bg-white/60 dark:bg-slate-900/60 rounded-3xl border shadow-md w-full md:w-auto h-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) return null;

    const getWeatherIcon = (code: number) => {
        if (code === 0) return <Sun className="w-8 h-8 text-yellow-500" />;
        if (code >= 1 && code <= 3) return <Cloud className="w-8 h-8 text-gray-400" />;
        if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-400" />;
        if (code >= 71 && code <= 77) return <Snowflake className="w-8 h-8 text-cyan-200" />;
        return <Wind className="w-8 h-8 text-slate-400" />;
    };

    const getWeatherText = (code: number) => {
        if (code === 0) return isRTL ? 'مشمس' : 'Clear Sky';
        if (code >= 1 && code <= 3) return isRTL ? 'غائم جزئياً' : 'Partly Cloudy';
        if (code >= 51 && code <= 67) return isRTL ? 'ممطر' : 'Rainy';
        if (code >= 71 && code <= 77) return isRTL ? 'مثلج' : 'Snowy';
        return isRTL ? 'عاصف/غائم' : 'Windy/Cloudy';
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-900/60 rounded-3xl border shadow-md w-full sm:w-auto">
            {getWeatherIcon(data.weathercode)}
            <div>
                <div className="font-bold text-lg">{data.temperature}°C</div>
                <div className="text-sm text-muted-foreground font-medium">{getWeatherText(data.weathercode)}</div>
            </div>
        </div>
    );
};

export default WeatherWidget;
