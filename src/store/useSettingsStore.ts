import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './storage';

interface SettingsState {
    autoCompleteParentTask: boolean;
    syncCalendarEventToTask: boolean;
    themeColor: string; // e.g. '#3b82f6'
    customBgPrimary: string;
    customBgSecondary: string;
    customTextPrimary: string;
    customTextSecondary: string;
    customBorder: string;
    geminiApiKey: string;
    setSettings: (updates: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            autoCompleteParentTask: true,
            syncCalendarEventToTask: true,
            themeColor: '#3b82f6', // default blue
            customBgPrimary: '#0f172a',
            customBgSecondary: '#1e293b',
            customTextPrimary: '#f8fafc',
            customTextSecondary: '#cbd5e1',
            customBorder: '#334155',
            geminiApiKey: '',
            setSettings: (updates) => set((state) => ({ ...state, ...updates })),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => asyncStorage),
        }
    )
);
