import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { Send, User as UserIcon } from 'lucide-react';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    text: string;
    created_at: string;
}

interface UserProfile {
    id: string;
    full_name: string;
    role: string;
}

const Chat = () => {
    const { barberId } = useParams(); // Could be barberId or customerId depending on who is viewing
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    const { toast } = useToast();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        if (!barberId) return;

        // Fetch other user's profile
        const fetchOtherUser = async () => {
            try {
                const docRef = await getDoc(doc(db, 'users', barberId));
                if (docRef.exists()) {
                    setOtherUser({ id: docRef.id, ...docRef.data() } as UserProfile);
                }
            } catch (error) {
                console.error("Error fetching user profile", error);
            }
        };
        fetchOtherUser();

        // Listen for messages between current user and barberId
        const q = query(
            collection(db, 'messages'),
            where('participants', 'array-contains', user.uid),
            orderBy('created_at', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if ((data.sender_id === user.uid && data.receiver_id === barberId) ||
                    (data.sender_id === barberId && data.receiver_id === user.uid)) {
                    msgs.push({ id: doc.id, ...data } as Message);
                }
            });
            setMessages(msgs);
            // Scroll to bottom
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        return () => unsubscribe();
    }, [user, barberId, navigate]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !barberId) return;

        const msgText = newMessage.trim();
        setNewMessage(''); // optimistic clear

        try {
            await addDoc(collection(db, 'messages'), {
                sender_id: user.uid,
                receiver_id: barberId,
                participants: [user.uid, barberId],
                text: msgText,
                created_at: new Date().toISOString()
            });
        } catch (error: unknown) {
            toast({
                title: t('error'),
                description: error instanceof Error ? error.message : "An error occurred",
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navigation />

            <main className="container mx-auto px-4 py-8 mt-20 flex-1 flex flex-col max-w-4xl">
                <Card className="flex-1 flex flex-col shadow-lg border-primary/10 h-[70vh]">
                    <CardHeader className="border-b bg-muted/40">
                        <CardTitle className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <UserIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">{otherUser?.full_name || 'Loading...'}</h3>
                                <p className="text-sm text-muted-foreground capitalize">{otherUser?.role || 'User'}</p>
                            </div>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4 pb-4">
                                {messages.length === 0 ? (
                                    <div className="text-center text-muted-foreground mt-10">
                                        No messages yet. Start the conversation!
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMine = msg.sender_id === user?.uid;
                                        return (
                                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'
                                                    }`}>
                                                    <p>{msg.text}</p>
                                                    <span className={`text-[10px] block mt-1 ${isMine ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="flex-1 rounded-full"
                                />
                                <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!newMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Chat;
