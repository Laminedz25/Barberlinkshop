import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

import AIAssistant from "./components/AIAssistant";
import NotificationManager from "./components/NotificationManager";

const Index = lazy(() => import("./pages/Index"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Auth = lazy(() => import("./pages/Auth"));
const BarberProfile = lazy(() => import("./pages/BarberProfile"));
const BarberDashboard = lazy(() => import("./pages/BarberDashboard"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const Chat = lazy(() => import("./pages/Chat"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Book = lazy(() => import("./pages/Book"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Support = lazy(() => import("./pages/Support"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="w-16 h-16 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <NotificationManager />
        <Toaster />
        <Sonner />
        <AIAssistant />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/barber/:id" element={<BarberProfile />} />
              <Route path="/dashboard" element={<BarberDashboard />} />
              <Route path="/bookings" element={<CustomerDashboard />} />
              <Route path="/book/:id" element={<Book />} />
              <Route path="/chat/:barberId" element={<Chat />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/support" element={<Support />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
