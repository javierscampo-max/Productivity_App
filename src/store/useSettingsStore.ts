import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './storage';

interface SettingsState {
    autoCompleteParentTask: boolean;
    syncCalendarEventToTask: boolean;
    themeColor: string; // e.g. '#3b82f6'
    setSettings: (updates: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            autoCompleteParentTask: true,
            syncCalendarEventToTask: true,
            themeColor: '#3b82f6', // default blue
            setSettings: (updates) => set((state) => ({ ...state, ...updates })),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => asyncStorage),
        }
    )
);
