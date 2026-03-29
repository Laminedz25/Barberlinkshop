import React from 'react';
import Navigation from '@/components/Navigation';
import { ShieldCheck, Lock, Eye, FileText, Globe, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-32 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <header className="text-center space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Trusted Governance
           </div>
           <h1 className="text-6xl font-black tracking-tighter uppercase">Privacy <span className="text-primary">Policy</span></h1>
           <p className="text-muted-foreground font-medium text-lg">Last Updated: March 29, 2026</p>
        </header>

        <section className="grid gap-8">
           <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-12 space-y-8">
                 <div className="space-y-4">
                    <h2 className="text-3xl font-black flex items-center gap-4">
                       <Eye className="w-8 h-8 text-primary" /> 1. Information Collection
                    </h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                       BarberLink ("we", "our", "platform") collects personal information including your name, email, phone number, and location data to provide and improve our autonomous SaaS services. We use AI agents to analyze this data for optimization purposes.
                    </p>
                 </div>

                 <div className="space-y-4">
                    <h2 className="text-3xl font-black flex items-center gap-4">
                       <Lock className="w-8 h-8 text-primary" /> 2. Data Security
                    </h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                       Your data is encrypted both in transit and at rest using industry-standard protocols. Administrative access is strictly limited to authorized "Super Admins" as identified by our Identity Federation system.
                    </p>
                 </div>

                 <div className="space-y-4">
                    <h2 className="text-3xl font-black flex items-center gap-4">
                       <Globe className="w-8 h-8 text-primary" /> 3. Regional Compliance
                    </h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                       We operate in compliance with Algerian data protection laws and international standards (e.g., GDPR principles). Users have the right to request data deletion at any time.
                    </p>
                 </div>

                 <div className="space-y-4">
                    <h2 className="text-3xl font-black flex items-center gap-4">
                       <Scale className="w-8 h-8 text-primary" /> 4. AI Orchestration
                    </h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                       Our "Master Orchestrator" and associated agents (Ads, Delivery, Finance) process data to automate business workflows. This processing is performed silently and securely within our private cloud environment.
                    </p>
                 </div>
              </CardContent>
           </Card>

           <footer className="text-center p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-2xl">
              <FileText className="w-12 h-12 text-primary mx-auto opacity-50" />
              <h3 className="text-xl font-black tracking-tight uppercase">Questions?</h3>
              <p className="text-white/60 text-sm font-medium">Contact our Legal Sentinel at legal@barberlink.cloud</p>
           </footer>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
