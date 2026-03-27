import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, DollarSign, Globe, PieChart, ShieldCheck, ArrowUpRight, BarChart3, Rocket, MessageSquareDot } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useLanguage } from "@/contexts/LanguageContext";

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from "react";

const mockGrowthData = [
  { month: 'Jan', revenue: 45000, users: 1200 },
  { month: 'Feb', revenue: 52000, users: 1800 },
  { month: 'Mar', revenue: 61000, users: 2500 },
  { month: 'Apr', revenue: 78000, users: 3200 },
  { month: 'May', revenue: 95000, users: 4400 },
  { month: 'Jun', revenue: 125000, users: 5600 },
];

const Investors = () => {
  const { isRTL } = useLanguage();
  const [metrics, setMetrics] = useState({
    arr: '$1.5M',
    growth: '+142%',
    barbers: '8.4k',
    markets: '4',
    efficiency: '92%'
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const snap = await getDoc(doc(db, 'system', 'investor_metrics'));
        if (snap.exists()) {
          const data = snap.data();
          setMetrics({
             arr: data.total_revenue || '$1.5M',
             growth: data.growth_rate || '+142%',
             barbers: data.active_barbers || '8.4k',
             markets: data.markets_served || '4',
             efficiency: data.ai_efficiency || '92%'
          });
        }
      } catch (err) { console.error(err); }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 font-black text-xs text-primary uppercase tracking-widest mb-8">
                <Rocket className="w-4 h-4" /> Global Seed Round Open
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                Invest in the <span className="text-primary italic">Autonomous Future</span> of Grooming
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
                BarberLink is transforming the $80B grooming industry through AI-orchestrated marketplaces and global SaaS automation.
            </p>
        </section>

        {/* Global Metrics Grid */}
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
                { label: "Annual Run Rate", value: metrics.arr, growth: metrics.growth, icon: DollarSign, color: "text-green-500" },
                { label: "Active Barbers", value: metrics.barbers, growth: "+85%", icon: Users, color: "text-blue-500" },
                { label: "Markets Served", value: metrics.markets, growth: "Scaling", icon: Globe, color: "text-primary" },
                { label: "AI Efficiency", value: metrics.efficiency, growth: "Automated", icon: ShieldCheck, color: "text-purple-500" },
            ].map((stat, i) => (
                <Card key={i} className="border-none bg-card/40 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden group">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white transition-all`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> {stat.growth}
                            </span>
                        </div>
                        <p className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black tracking-tighter">{stat.value}</h3>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Growth Analytics */}
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            <Card className="lg:col-span-2 border-none bg-card/40 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-8">
                <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between font-black uppercase text-xs text-muted-foreground tracking-widest">
                    <span>Revenue Growth (USD)</span>
                    <BarChart3 className="w-4 h-4" />
                </CardHeader>
                <div className="h-[400px] mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockGrowthData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: 'none', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="border-none bg-primary text-white shadow-2xl rounded-[2.5rem] p-10 flex flex-col justify-between">
                <div>
                   <h2 className="text-4xl font-black tracking-tighter mb-6 leading-tight">Scale your portfolio with global tech.</h2>
                   <p className="text-primary-foreground/80 font-medium mb-8">
                      We are currently evaluating strategic partners for our Series A. Join the most advanced grooming marketplace on the planet.
                   </p>
                   <ul className="space-y-4 mb-10">
                      <li className="flex items-center gap-3 font-bold"><ShieldCheck className="w-5 h-5" /> 82% Contribution Margin</li>
                      <li className="flex items-center gap-3 font-bold"><TrendingUp className="w-5 h-5" /> 3.2x YoY Growth</li>
                      <li className="flex items-center gap-3 font-bold"><Users className="w-5 h-5" /> 450k+ Monthly Bookings</li>
                   </ul>
                </div>
                <Button size="lg" className="bg-white text-primary hover:bg-slate-100 rounded-2xl h-16 text-lg font-black w-full shadow-2xl shadow-black/20">
                   <MessageSquareDot className="mr-2 w-5 h-5" /> Request Pitch Deck
                </Button>
            </Card>
        </div>

        {/* Vision Section */}
        <section className="container mx-auto px-6 text-center max-w-4xl">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter flex items-center justify-center gap-3">
               <PieChart className="w-8 h-8 text-primary" /> TAM & Global Vision
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
               <div className="p-8 border rounded-3xl space-y-4 bg-muted/20">
                  <h4 className="text-xl font-bold">Phase 1: Market Entry (DONE)</h4>
                  <p className="text-muted-foreground font-medium text-sm">Automated marketplace launch in Algeria with DZD/BaridiMob integration.</p>
               </div>
               <div className="p-8 border border-primary/40 rounded-3xl space-y-4 bg-primary/5 shadow-2xl shadow-primary/10">
                  <h4 className="text-xl font-bold text-primary">Phase 2: Global Scaling (ACTIVE)</h4>
                  <p className="text-muted-foreground font-medium text-sm">Expansion into USA & EMEA with multi-currency dynamic pricing and AI Brain.</p>
               </div>
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Investors;
