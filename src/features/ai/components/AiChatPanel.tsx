import React, { useState, useRef, useEffect } from 'react';
import { useAiStore } from '../store/useAiStore';
import { Sparkles, X, Send, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useSettingsStore } from '../../../store/useSettingsStore';

export const AiChatPanel: React.FC = () => {
    const { isOpen, setIsOpen, messages, isTyping, sendMessage, clearHistory } = useAiStore();
    const apiKey = useSettingsStore(s => s.geminiApiKey);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;
        sendMessage(input.trim());
        setInput('');
    };

    return (
        <div className="fixed bottom-44 right-3 sm:bottom-24 sm:right-4 z-50 flex flex-col items-end pointer-events-none">
            
            {/* Chat Window */}
            <div className={clsx(
                "pointer-events-auto bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right mb-4",
                isOpen ? "scale-100 opacity-100 h-[450px] w-[320px] sm:w-[380px]" : "scale-0 opacity-0 h-0 w-0"
            )}>
                {/* Header */}
                <div className="bg-primary text-white p-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} />
                        <span className="font-bold">Apex Assistant</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={clearHistory} className="p-1 hover:bg-white/20 rounded transition-colors" title="Clear Chat">
                            <Trash2 size={16} />
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded transition-colors" title="Close Panel">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Warning if no key */}
                {!apiKey && isOpen && (
                    <div className="bg-red-500/10 border-b border-red-500/20 p-2 text-xs text-center text-red-500 font-semibold shrink-0">
                        Please add your Gemini API Key in Settings to enable the AI.
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                    {messages.map((msg) => (
                        <div key={msg.id} className={clsx(
                            "max-w-[85%] rounded-xl p-3 text-sm animate-in zoom-in-95 duration-200",
                            msg.role === 'user' 
                                ? "bg-primary text-white self-end ml-auto rounded-tr-sm" 
                                : "bg-surface border border-border text-text self-start rounded-tl-sm shadow-sm"
                        )}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="bg-surface border border-border text-muted self-start rounded-xl rounded-tl-sm p-3 w-16 items-center justify-center flex animate-in zoom-in-95 shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
                                <div className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
                                <div className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="border-t border-border p-3 bg-surface shrink-0 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={apiKey ? "Ask Apex to plan something..." : "API key required..."}
                        disabled={!apiKey || isTyping}
                        className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || !apiKey || isTyping}
                        className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity shrink-0 shadow-sm"
                    >
                        <Send size={16} className="ml-0.5" />
                    </button>
                </form>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "pointer-events-auto bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300",
                    isOpen && "scale-0 opacity-0"
                )}
                title="Open Assistant"
            >
                <Sparkles size={24} />
            </button>
        </div>
    );
};
