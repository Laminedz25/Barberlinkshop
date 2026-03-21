import { useState, useEffect } from 'react';

export const useCurrency = () => {
    const [currency, setCurrency] = useState<'DZD' | 'USD'>('DZD');
    const [isAlgeria, setIsAlgeria] = useState(true);

    useEffect(() => {
        const detectLocation = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data.country_code !== 'DZ') {
                    setCurrency('USD');
                    setIsAlgeria(false);
                }
            } catch (err) {
                console.warn("Location detection failed, defaulting to DZD.");
            }
        };
        detectLocation();
    }, []);

    const formatPrice = (dzdPrice: number | string, usdPrice: number | string) => {
        if (isAlgeria) {
            return `${dzdPrice} د.ج`;
        }
        return `$${usdPrice}`;
    };

    return { currency, isAlgeria, formatPrice };
};
