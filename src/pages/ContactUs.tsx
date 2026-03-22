import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactUs = () => {
    const { t, isRTL } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Message Sent / تم الإرسال",
                description: "We will get back to you shortly. / سنتواصل معك قريباً.",
            });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto px-4 py-24 max-w-5xl">
                <h1 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
                    Contact Us / اتصل بنا
                </h1>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className={`space-y-8 ${isRTL ? "text-right" : ""}`}>
                        <h2 className="text-2xl font-bold">Get In Touch</h2>
                        <p className="text-muted-foreground">
                            Have questions or need assistance? Our 24/7 dedicated support team is here to help you get the most out of our automation tools.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/20 p-3 rounded-xl"><Mail className="text-primary" /></div>
                                <span>support@barberlinkshop.com</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-accent p-3 rounded-xl"><Phone className="text-accent-foreground" /></div>
                                <span>+213 (0) 555 123 456</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-green-500/20 p-3 rounded-xl"><MapPin className="text-green-500" /></div>
                                <span>123 Tech Hub, Algiers, Algeria</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-card p-8 rounded-3xl border shadow-xl space-y-6">
                        <div className="space-y-2">
                            <label className="font-semibold text-sm">Full Name</label>
                            <Input placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <label className="font-semibold text-sm">Email Address</label>
                            <Input type="email" placeholder="john@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <label className="font-semibold text-sm">Message</label>
                            <Textarea placeholder="How can we help?" className="h-32" required />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full rounded-xl">
                            {loading ? "Sending..." : "Send Message"}
                        </Button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContactUs;
