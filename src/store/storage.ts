import localforage from 'localforage';
import { StateStorage } from 'zustand/middleware';

export const asyncStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await localforage.getItem(name)) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await localforage.setItem(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await localforage.removeItem(name);
    },
};
