// /lib/use-ui-store.ts

import { create } from 'zustand';

interface UIState {
    isSettingsOpen: boolean;
    aiEnabled: boolean;
    apiKey: string;
    subtitleColor: string;
    subtitleBackgroundColor: string;
    subtitleFont: string;
    isVideoMuted: boolean;
    openSettings: () => void;
    closeSettings: () => void;
    toggleAI: () => void;
    setApiKey: (key: string) => void;
    setSubtitleColor: (color: string) => void;
    setSubtitleBackgroundColor: (color: string) => void;
    setSubtitleFont: (font: string) => void;
    toggleMute: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSettingsOpen: false,
    aiEnabled: true,
    apiKey: '',
    subtitleColor: '#FFFFFF',
    subtitleBackgroundColor: '#000000',
    subtitleFont: 'arial',
    isVideoMuted: false, // Default to not muted
    openSettings: () => set({ isSettingsOpen: true }),
    closeSettings: () => set({ isSettingsOpen: false }),
    toggleAI: () => set((state) => ({ aiEnabled: !state.aiEnabled })),
    setApiKey: (key) => set({ apiKey: key }),
    setSubtitleColor: (color) => set({ subtitleColor: color }),
    setSubtitleBackgroundColor: (color) => set({ subtitleBackgroundColor: color }),
    setSubtitleFont: (font) => set({ subtitleFont: font }),
    toggleMute: () => set((state) => ({ isVideoMuted: !state.isVideoMuted })),

}));