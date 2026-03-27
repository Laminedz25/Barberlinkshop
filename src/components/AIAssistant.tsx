import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Zap, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { getAIResponse } from "@/lib/ai-service";

interface ChatMessage {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: string;
}

const initialMessages: ChatMessage[] = [
    {
        id: "init_1",
        text: "مرحباً بك في BarberLink! أنا المساعد الذكي المعزز. كيف يمكنني مساعدتك في العثور على أفضل حلاق، أو الإجابة عن استفساراتك حول المنصة والخدمات العالمية؟",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
];

const AIAssistant = () => {
    const { config } = useSystemConfig();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { isRTL, language } = useLanguage();

    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const lowInput = input.toLowerCase();
        const offTopicKeywords = ['طبخ', 'وصفة', 'ألعاب', 'cook', 'recipe', 'game', 'minecraft', 'fortnite', 'politics', 'سياسة'];
        const isOffTopic = offTopicKeywords.some(key => lowInput.includes(key));

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: input.trim(),
            isBot: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        if (isOffTopic) {
            setTimeout(() => {
                const botMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    text: language === 'ar' ? "أنا هنا للمساعدة فقط في الأمور المتعلقة بمنصة BarberLink، خدمات الحلاقة، والجمال. لا يمكنني الإجابة على استفسارات خارج هذا النطاق." : "I am specialized only in BarberLink platform, grooming services, and beauty advice. I cannot assist with off-topic queries.",
                    isBot: true,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages((prev) => [...prev, botMsg]);
                setIsTyping(false);
            }, 1000);
            return;
        }

        // Fetch Real AI Response from ChatGPT (with logical fallback)
        const responseText = await getAIResponse(
            userMsg.text, 
            config, 
            "You are the Lead Assistant for BarberLink. STRICT RULE: Only answer questions about barbering, salons, appointments, pricing, and platform features. If asked about cooking, games, or politics, politely decline and steer back to grooming. Be professional, helpful, and encourage booking.",
            language
        );

        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-16 w-16 rounded-full shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] bg-primary text-white hover:bg-blue-600 transition-all hover:scale-110 active:scale-95 p-0 flex items-center justify-center border-2 border-white/20"
                >
                    <div className="relative">
                        <Bot className="h-8 w-8" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                </Button>
            </div>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-[22rem] sm:w-[26rem] h-[550px] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 border-white/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border-t border-l">
            <CardHeader className="bg-gradient-to-br from-primary via-blue-700 to-indigo-900 text-white flex flex-row items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Bot className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black uppercase tracking-tighter">BarberLink OS</CardTitle>
                        <div className="flex items-center gap-1.5 opacity-80">
                           <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                           <span className="text-[10px] font-bold uppercase tracking-widest">Global AI Engine Active</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white rounded-full h-10 w-10 transition-colors" onClick={() => setIsOpen(false)}>
                    <X className="h-6 w-6" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 px-4 py-6 scroll-smooth">
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"} group`}>
                                <div className={`flex gap-3 max-w-[85%] ${msg.isBot ? (isRTL ? "flex-row-reverse" : "flex-row") : (isRTL ? "flex-row" : "flex-row-reverse")}`}>
                                    <div className={`shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center ${msg.isBot ? 'bg-primary shadow-lg shadow-primary/20 text-white' : 'bg-white shadow-xl text-primary'}`}>
                                        {msg.isBot ? <Sparkles className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className={`p-4 shadow-xl mb-1 ${msg.isBot ? 'bg-white/10 text-white rounded-[1.5rem] rounded-tl-sm border border-white/5' : 'bg-primary text-white rounded-[1.5rem] rounded-tr-sm'}`}>
                                            <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                                        </div>
                                        <p className={`text-[9px] uppercase font-black opacity-40 group-hover:opacity-100 transition-opacity ${msg.isBot ? 'text-white' : 'text-white text-right'}`}>
                                            {msg.timestamp} • {msg.isBot ? 'Verified Agent' : 'User Auth'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className={`flex justify-start ${isRTL ? "flex-row-reverse" : ""}`}>
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center bg-primary/20 text-primary border border-primary/20">
                                        <Zap className="h-5 w-5 animate-pulse" />
                                    </div>
                                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex gap-1.5 items-center">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-6 bg-slate-900/60 border-t border-white/10 backdrop-blur-2xl">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={language === 'ar' ? "كيف يمكنني مساعدتك؟" : "How can I help you?"}
                            className={`flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:bg-white/10 focus:ring-primary/50 transition-all ${isRTL ? "text-right pr-6" : "pl-6"}`}
                            dir={isRTL ? "rtl" : "ltr"}
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="rounded-2xl shrink-0 h-14 w-14 bg-primary hover:bg-blue-600 shadow-xl shadow-primary/20 border border-white/10">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                    <div className="mt-4 flex justify-center gap-4">
                       <Badge variant="outline" className="text-[10px] py-1 px-3 border-white/10 text-white/40 uppercase font-black bg-white/5"><ShieldCheck className="w-3 h-3 mr-1" /> Secure End-to-End</Badge>
                       <Badge variant="outline" className="text-[10px] py-1 px-3 border-white/10 text-white/40 uppercase font-black bg-white/5"><Zap className="w-3 h-3 mr-1" /> Real-time Sync</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AIAssistant;
