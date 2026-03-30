import { create } from 'zustand';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { aiTools, executeAiTool } from '../api';

export interface AiMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

interface AiState {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    messages: AiMessage[];
    isTyping: boolean;
    chatSession: ChatSession | null;
    initChat: () => void;
    sendMessage: (text: string) => Promise<void>;
    clearHistory: () => void;
}

export const useAiStore = create<AiState>((set, get) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
    messages: [
        { id: '1', role: 'model', text: "Hi! I'm Apex AI. I have direct access to your task list and calendar. Ask me to plan your day, add events, or break down a project into subtasks!" }
    ],
    isTyping: false,
    chatSession: null,

    initChat: () => {
        const apiKey = useSettingsStore.getState().geminiApiKey;
        if (!apiKey) return;

        const genAI = new GoogleGenerativeAI(apiKey);
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        // Pre-compute next 7 days so the AI doesn't miscalculate day-of-week
        const upcoming: string[] = [];
        for (let i = 0; i <= 7; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() + i);
            const dayName = d.toLocaleDateString('en-GB', { weekday: 'long' });
            const iso = d.toISOString().split('T')[0];
            upcoming.push(`${dayName} = ${iso}`);
        }
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            tools: [{ functionDeclarations: aiTools }],
            systemInstruction: `You are the Apex AI Assistant inside a productivity PWA. Today is ${dateStr}. Here are the exact dates for each upcoming day: ${upcoming.join(', ')}. When the user says a day name like "Tuesday" or "this Friday", use this mapping to get the exact YYYY-MM-DD date — do NOT calculate it yourself. You are helpful, extremely concise, and proactive. ALWAYS intelligently call your tools to fetch user data if you need context, or to create tasks/events on behalf of the user when they instruct you.`
        });

        const chat = model.startChat({ history: [] });
        set({ chatSession: chat });
    },

    sendMessage: async (text: string) => {
        const { chatSession, messages } = get();
        if (!chatSession) {
            get().initChat();
            if (!get().chatSession) {
                set({ messages: [...messages, { id: crypto.randomUUID(), role: 'model', text: 'Error: Please configure your Gemini API Key in the Settings tab first!' }] });
                return;
            }
        }

        const currentChat = get().chatSession!;
        const userMsg: AiMessage = { id: crypto.randomUUID(), role: 'user', text };
        set((state) => ({ messages: [...state.messages, userMsg], isTyping: true }));

        try {
            let result = await currentChat.sendMessage(text);
            let functionCalls = result.response.functionCalls();
            
            // Loop for chained tool execution
            while (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                const functionResponse = await executeAiTool(call);
                
                result = await currentChat.sendMessage([{
                    functionResponse: {
                        name: call.name,
                        response: functionResponse
                    }
                }]);
                functionCalls = result.response.functionCalls();
            }

            const modelReply = result.response.text();
            if (modelReply) {
                const modelMsg: AiMessage = { id: crypto.randomUUID(), role: 'model', text: modelReply };
                set((state) => ({ messages: [...state.messages, modelMsg] }));
            }
            
        } catch (error: any) {
            console.error("AI Assistant Error:", error);
            let errorText = `Connection Error: ${error.message}`;
            if (error.message?.includes('429') || error.message?.includes('Resource has been exhausted')) {
                errorText = '⏳ You\'ve hit the free API rate limit. Wait about 60 seconds and try again — your key is fine!';
            } else if (error.message?.includes('403')) {
                errorText = '🔑 Your API key appears to be invalid. Please check it in Settings.';
            }
            const errorMsg: AiMessage = { id: crypto.randomUUID(), role: 'model', text: errorText };
            set((state) => ({ messages: [...state.messages, errorMsg] }));
        } finally {
            set({ isTyping: false });
        }
    },
    
    clearHistory: () => {
        set({ 
            chatSession: null,
            messages: [{ id: '1', role: 'model', text: "Hi! I'm Apex AI. I have direct access to your task list and calendar. Ask me to plan your day, add events, or break down a project into subtasks!" }] 
        });
        get().initChat();
    }
}));
