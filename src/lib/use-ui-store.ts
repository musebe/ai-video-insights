// lib/use-ui-store.ts

import { create } from 'zustand';

interface UIState {
    isSettingsOpen: boolean;
    aiEnabled: boolean;
    apiKey: string;
    openSettings: () => void;
    closeSettings: () => void;
    toggleAI: () => void;
    setApiKey: (key: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSettingsOpen: false,
    aiEnabled: true,
    apiKey: '',
    openSettings: () => set({ isSettingsOpen: true }),
    closeSettings: () => set({ isSettingsOpen: false }),
    toggleAI: () => set((s) => ({ aiEnabled: !s.aiEnabled })),
    setApiKey: (key) => set({ apiKey: key }),
}));
