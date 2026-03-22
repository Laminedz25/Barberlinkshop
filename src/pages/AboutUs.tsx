import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutUs = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl space-y-8">
                <h1 className="text-4xl font-black text-primary text-center">About Us / من نحن</h1>
                <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed text-muted-foreground">
                    <p>
                        Welcome to barberlinkshop! We are the leading platform connecting top barbers with clients seeking the best grooming experience. Our mission is to revolutionize the salon and barbershop industry using cutting-edge AI technology, seamless bookings, and a dynamic marketplace.
                    </p>
                    <p>
                        Whether you are a professional barber looking to grow your business or a customer searching for the perfect haircut, our smart AI assistants and robust platform are here to make your journey effortless.
                    </p>
                    <p>
                        مرحباً بك في منصتنا! نحن نسعى لتقديم أفضل الحلول التقنية لتسهيل حجز المواعيد وإدارة الصالونات بطريقة عصرية وذكية.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AboutUs;
