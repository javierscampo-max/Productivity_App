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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, isOpen]);

    const handleInputResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;
        sendMessage(input.trim());
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset immediately on send
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <>
            {/* Chat Window — bottom aligned with the FAB so it opens FROM the button */}
            <div className={clsx(
                "fixed bottom-44 right-3 sm:bottom-24 sm:right-4 z-50",
                "bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform",
                "h-[450px] w-[320px] sm:w-[380px]",
                "origin-bottom-right",
                isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
            )}>
                {/* Header */}
                <div className="bg-primary text-white p-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} />
                        <span className="font-bold">Apex Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={clearHistory} className="p-1.5 hover:bg-white/20 rounded-md transition-colors" title="Clear Chat">
                            <Trash2 size={16} />
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-md transition-colors" title="Close Panel">
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
                            "max-w-[85%] rounded-2xl p-3 text-sm animate-in zoom-in-95 duration-200 shadow-sm",
                            msg.role === 'user' 
                                ? "bg-primary text-white self-end ml-auto rounded-tr-sm" 
                                : "bg-surface border border-border text-text self-start rounded-tl-sm"
                        )}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="bg-surface border border-border text-muted self-start rounded-2xl rounded-tl-sm p-3 w-16 items-center justify-center flex animate-in zoom-in-95 shadow-sm">
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
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            handleInputResize();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={apiKey ? "Ask Apex to plan something..." : "API key required..."}
                        disabled={!apiKey || isTyping}
                        className="flex-1 bg-background border border-border rounded-2xl px-4 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-primary disabled:opacity-50 transition-colors resize-none overflow-y-auto min-h-[40px] max-h-[100px]"
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

            {/* Floating Action Button — shares exact same position */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "fixed bottom-44 right-3 sm:bottom-24 sm:right-4 z-50",
                    "bg-primary text-white w-14 h-14 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all duration-300",
                    isOpen ? "opacity-0 scale-50 rotate-90 pointer-events-none" : "opacity-100 hover:scale-105 active:scale-95 rotate-0 scale-100"
                )}
                title="Open Assistant"
            >
                <Sparkles size={24} />
            </button>
        </>
    );
};
