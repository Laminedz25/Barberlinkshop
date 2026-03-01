import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Bot, Zap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const AutoSupport = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto px-4 py-24 max-w-5xl text-center space-y-12">
                <div className="space-y-4">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                        24/7 AI Automatic Support
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Experience the future of customer service. Our 100% automated AI Agents handle everything instantly around the clock.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-left">
                    <div className="bg-card p-8 rounded-3xl border shadow hover:shadow-xl transition-all">
                        <Bot className="w-12 h-12 text-primary mb-4" />
                        <h3 className="text-xl font-bold mb-2">Smart Ticketing</h3>
                        <p className="text-muted-foreground text-sm">
                            Submit an issue, and our intelligent AI will diagnose and categorize it instantly without any human delay.
                        </p>
                    </div>
                    <div className="bg-card p-8 rounded-3xl border shadow hover:shadow-xl transition-all">
                        <Zap className="w-12 h-12 text-yellow-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Auto-Resolutions</h3>
                        <p className="text-muted-foreground text-sm">
                            Most platform issues are resolved automatically through our self-healing microservices and auto-refund bots.
                        </p>
                    </div>
                    <div className="bg-card p-8 rounded-3xl border shadow hover:shadow-xl transition-all">
                        <ShieldCheck className="w-12 h-12 text-green-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
                        <p className="text-muted-foreground text-sm">
                            Your payment data and salon info are protected. Our automated escalation triggers humans only for critical level security events.
                        </p>
                    </div>
                </div>

                <div className="pt-12">
                    <h2 className="text-2xl font-bold mb-6">Need immediate help?</h2>
                    <p className="text-muted-foreground mb-8">
                        Try our AI Chatbot floating in the corner of this page for an instant response, or visit our <Link to="/contact" className="text-primary hover:underline">Contact Center</Link>.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AutoSupport;
