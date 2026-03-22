import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Auth from "./pages/Auth";
import BarberProfile from "./pages/BarberProfile";
import BarberDashboard from "./pages/BarberDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import Book from "./pages/Book";
import AdminDashboard from "./pages/AdminDashboard";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import AutoSupport from "./pages/AutoSupport";

import AIAssistant from "./components/AIAssistant";
import NotificationManager from "./components/NotificationManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <NotificationManager />
        <Toaster />
        <Sonner />
        <AIAssistant />
        <BrowserRouter>
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
            <Route path="/support" element={<AutoSupport />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
