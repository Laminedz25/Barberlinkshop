import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Mic, MicOff, Paperclip, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
    id: string;
    text: string;
    isBot: boolean;
}

const initialMessages: ChatMessage[] = [
    {
        id: "1",
        text: "مرحباً بك في barberlinkshop! أنا المساعد الذكي. كيف يمكنني مساعدتك في العثور على الحلاق المناسب، أو الإجابة على استفساراتك اليوم؟",
        isBot: true,
    }
];

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTTSEnabled, setIsTTSEnabled] = useState(false);
    const [fileAttachment, setFileAttachment] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [aiContext, setAiContext] = useState("");
    const [userRole, setUserRole] = useState("guest");
    const { user } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const { isRTL } = useLanguage();

    useEffect(() => {
        const fetchRole = async () => {
            if (!user) {
                setUserRole("guest");
                return;
            }
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.role === 'admin') {
                    setUserRole('admin');
                } else if (data.role === 'customer') {
                    setUserRole('customer');
                } else if (data.role === 'barber') {
                    const bRef = doc(db, 'barbers', user.uid);
                    const bSnap = await getDoc(bRef);
                    if (bSnap.exists()) {
                        setUserRole(bSnap.data().type || 'barber');
                    } else {
                        setUserRole('barber');
                    }
                }
            }
        };
        fetchRole();
    }, [user]);

    useEffect(() => {
        const fetchAiContext = async () => {
            try {
                const docRef = doc(db, 'system', 'settings');
                const docSnap = await getDoc(docRef);
                const data = docSnap.data();
                if (docSnap.exists() && data?.aiPrompts?.customer_service) {
                    setAiContext(data.aiPrompts.customer_service);
                }
            } catch (error) {
                console.error("Error loading AI context", error);
            }
        };
        fetchAiContext();
    }, []);

    const handleStartRecording = () => {
        // @ts-expect-error - webkitSpeechRecognition might be used
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = isRTL ? 'ar-SA' : 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: { results: { transcript: string }[][] }) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => (prev ? prev + " " + transcript : transcript));
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
    };

    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim() && !fileAttachment) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: fileAttachment ? `[File attached: ${fileAttachment.name}] ${input}` : input,
            isBot: false,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setFileAttachment(null);
        setIsTyping(true);

        // Mock AI response
        setTimeout(() => {
            let botResponse = getMockResponse(userMsg.text);
            if (fileAttachment && fileAttachment.type.startsWith('image/')) {
                botResponse = "لقد قمت بتحليل صورتك المرفقة بناءً على شكل وجهك. أنصحك بتسريحة (Fade Haircut) مع تخفيف اللحية من الجوانب لتعطيك مظهراً أكثر حدة وأناقة! هل ترغب في حجز موعد لتطبيق هذه التسريحة؟";
            }

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                isBot: true,
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);

            if (isTTSEnabled) {
                const utterance = new SpeechSynthesisUtterance(botResponse);
                utterance.lang = isRTL ? 'ar-SA' : 'en-US';
                window.speechSynthesis.speak(utterance);
            }

        }, 1500);
    };

    const getMockResponse = (query: string): string => {
        const q = query.toLowerCase();

        // 1. Security and Privacy Boundaries
        const protectedKeywords = ["سر", "معلومات شخصية", "بيانات", "secret", "ارباح", "أرباح", "profit", "revenue", "دخل"];
        if (protectedKeywords.some(keyword => q.includes(keyword))) {
            return "عذراً، بصفتي مساعداً ذكياً ومبنياً على مبادئ الشفافية والخصوصية، لا يسعني الإفصاح عن معلومات سرية أو تفاصيل خاصة ببيانات أو أرباح الأفراد أو المنصة.";
        }

        // 2. Investor Support & Escalation
        const containsEmail = q.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (q.includes("استثمار") || q.includes("invest") || q.includes("مستثمر") || containsEmail) {
            return "أهلاً بك. يبدو أنك تبحث عن تواصل مهني أو استثماري. المنصة تفتح أبوابها للمستثمرين بشفافية كاملة. لقد قمت برفع رسالتك إلى الإدارة وسيتم الرد عليك في أقرب وقت عبر بريدك الإلكتروني الاحترافي.";
        }

        // 3. User Role Based Context boundaries
        if (userRole === 'admin') {
            if (q.includes("احصائيات") || q.includes("stats") || q.includes("مستخدمين")) {
                return "أهلاً بك أيها المدير. يمكنك مشاهدة جميع إحصائيات المنصة، عدد الصالونات والزبائن مفصلة في تبويبة 'الإحصائيات' داخل لوحة التحكم الخاصة بك.";
            } else {
                return "أهلاً بالإدارة. أنا هنا لتقديم دعم سريع. لتغيير الإعدادات المركزية للمنصة، يُرجى التوجه لتبويبة الإعدادات.";
            }
        }

        if (userRole === 'salon_owner') {
            if (q.includes("احجز") || q.includes("موعد")) {
                return "أهلاً بك صاحب الصالون. لإضافة موعد زبون حضر مباشرة (Offline)، يُرجى التوجه إلى قسم الاستقبال (Walk-ins) في لوحة التحكم وتأكيد حجزه لتحديث قائمة الانتظار الذكية.";
            }
            return "أهلاً بك صاحب الصالون. يمكنك الاعتماد عليّ للإجابة عن أسئلتك التقنية المتعلقة بالمنصة، مثل كيفية إدارة طاقم الحلاقين وإعداد نقاط الولاء لمتجرك.";
        }

        if (userRole === 'mobile_barber' || userRole === 'salon_barber') {
            if (q.includes("موعد") || q.includes("طلب")) {
                return "أهلاً صديقي الحلاق. لمراجعة وجدولة طلباتك، يُرجى التحقق من تبويبة الطلبات (Bookings) داخل لوحة التحكم للموافقة أو تقديم وقت بديل.";
            }
            return "أهلاً بك! يمكنني مساعدتك في توضيح كيفية تفعيل خدماتك، تعديل أوقات دوامك، والتواصل مع زبائنك لضمان تقديم تجربة ممتازة.";
        }

        // 4. Default Mock AI Context (For Guests and Customers)
        const baseContext = aiContext ? `[AI System Rule: ${aiContext}] ` : "";

        if (q.includes("احجز") || q.includes("حجز") || q.includes("book")) {
            return baseContext + "تم مبدئياً البحث عن مواعيد قريبة لك! يمكنك الضغط على 'استكشف' واختيار الحلاق ثم الضغط على زر الحجز المباشر واختيار التوقيت المناسب.";
        }
        if (q.includes("سعر") || q.includes("اسعار") || q.includes("price")) {
            return baseContext + "الأسعار تختلف حسب كل صالون والخدمة المقدمة. يمكنك رؤية تفاصيل الأسعار لكل خدمة داخل الصفحة الشخصية للحلاق الذي تختاره.";
        }
        if (q.includes("دفع") || q.includes("pay") || q.includes("نقاط") || q.includes("points")) {
            return baseContext + "نحن نوفر الدفع الإلكتروني بالإضافة إلى الدفع داخل الصالون، ويمكنك استخدام 'نقاط الولاء' الخاصة بك للحصول على خصومات حصرية أو حلاقة مجانية!";
        }

        return baseContext + (userRole === 'customer'
            ? "بصفتي المساعد الذكي، أنا هنا لتسهيل تجربتك. يمكنك إرسال صورتك لأقترح لك تسريحة، أو البحث لك عن أوقات شاغرة."
            : "هذا سؤال رائع. هل ترغب في مساعدة للبحث عن صالون معين أو معرفة المزيد حول كيفية عمل المنصة؟");
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-[#007BFF] transition-transform hover:scale-105 z-50 p-0 flex items-center justify-center"
            >
                <Bot className="h-7 w-7 text-white" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] flex flex-col shadow-2xl z-50 border-primary/20 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
            <CardHeader className="bg-primary text-primary-foreground flex flex-row items-center justify-between p-4 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    <CardTitle className="text-lg">barberlinkshop AI</CardTitle>
                </div>
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/20 text-white rounded-full h-8 w-8 mr-1" onClick={() => setIsTTSEnabled(!isTTSEnabled)} title="Toggle Voice / تفعيل الصوت">
                        {isTTSEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 opacity-70" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/20 text-white rounded-full h-8 w-8" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 bg-background/95 backdrop-blur">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 pb-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isBot ? "justify-start" : "justify-end"} ${isRTL ? "flex-row-reverse" : ""}`}>
                                <div className={`flex gap-2 max-w-[85%] ${isRTL ? "flex-row-reverse" : ""}`}>
                                    <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.isBot ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        {msg.isBot ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl ${msg.isBot ? 'bg-muted text-foreground rounded-tl-sm' : 'bg-primary text-primary-foreground rounded-tr-sm'}`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className={`flex justify-start ${isRTL ? "flex-row-reverse" : ""}`}>
                                <div className={`flex gap-2 max-w-[85%] ${isRTL ? "flex-row-reverse" : ""}`}>
                                    <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-primary/20 text-primary">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-muted rounded-tl-sm flex gap-1 items-center">
                                        <div className="w-2 h-2 bg-primary/50 text-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-primary/50 text-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-primary/50 text-foreground rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-3 border-t bg-background">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                        <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            className="hidden"
                            ref={fileInputRef}
                            title="Attach File"
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setFileAttachment(e.target.files[0]);
                                }
                            }}
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className={`rounded-full shrink-0 h-10 w-10 transition-colors ${fileAttachment ? 'bg-primary/10 border-primary/50' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach File / قم بإرفاق ملف"
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className={`rounded-full shrink-0 h-10 w-10 transition-colors ${isRecording ? 'bg-destructive/10 text-destructive border-destructive/50 animate-pulse' : ''}`}
                            onClick={handleStartRecording}
                        >
                            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={fileAttachment ? `File: ${fileAttachment.name}` : (isRTL ? "اكتب رسالتك الذكية هنا أو ارفق ملفاً..." : "Type your smart message or attach...")}
                            className={`flex-1 rounded-full ${isRTL ? "text-right" : ""}`}
                            dir={isRTL ? "rtl" : "ltr"}
                            disabled={isRecording}
                        />
                        <Button type="submit" size="icon" disabled={(!input.trim() && !fileAttachment) || isTyping || isRecording} className="rounded-full shrink-0 h-10 w-10">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
};

export default AIAssistant;
