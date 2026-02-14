import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const Assistant: React.FC = () => {
    const { user } = useAuth();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your SunSeeker Assistant. I can help you find the best spots for sunrise or sunset photography, or check the weather conditions for your upcoming trip. How can I help you today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Mock AI response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "That sounds like a great idea! I can definitely help with that. Since I'm currently in 'demo mode', I can't fetch real-time data yet, but imagine I just gave you the perfect location coordinates!",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="container" style={{ padding: 'var(--spacing-lg) 0', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Sparkles className="text-gradient" size={24} />
                    <h1 className="text-gradient" style={{ margin: 0, fontSize: '1.8rem' }}>AI Assistant</h1>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Your personal guide to the perfect light.
                </p>
            </div>

            <div className="glass-panel" style={{
                flex: 1,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                {/* Messages Area */}
                <div style={{ flex: 1, padding: 'var(--spacing-lg)', overflowY: 'auto' }}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                marginBottom: 'var(--spacing-md)'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                                alignItems: 'flex-start',
                                gap: '12px',
                                maxWidth: '80%'
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: msg.sender === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(255, 126, 95, 0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {msg.sender === 'user' ? (
                                        user?.avatar ?
                                            <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%' }} alt="You" /> :
                                            <User size={16} />
                                    ) : (
                                        <Sun size={18} className="text-gradient" />
                                    )}
                                </div>

                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
                                    borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                                    background: msg.sender === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    lineHeight: '1.5',
                                    fontSize: '0.95rem'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'rgba(255, 126, 95, 0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Sun size={18} className="text-gradient" />
                                </div>
                                <div style={{
                                    padding: '12px 16px', borderRadius: '16px', borderTopLeftRadius: '4px', background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: 'italic'
                                }}>
                                    Thinking...
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'rgba(0,0,0,0.2)',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <form onSubmit={handleSend} style={{ display: 'relative' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about sunrise times, locations, or weather..."
                                style={{
                                    width: '100%',
                                    padding: '14px 50px 14px 20px',
                                    borderRadius: 'var(--radius-full)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: input.trim() ? 'var(--color-primary)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: input.trim() ? 'pointer' : 'default',
                                    color: 'white',
                                    transition: 'var(--transition-base)',
                                    opacity: input.trim() ? 1 : 0.5
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Assistant;
