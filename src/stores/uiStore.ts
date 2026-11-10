import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'system' | 'light' | 'dark';

interface UIState {
  theme: Theme;
  soundEnabled: boolean;
  setTheme: (theme: Theme) => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      soundEnabled: true,
      setTheme: (theme) => set({ theme }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    }),
    { name: 'ui-preferences' },
  ),
);
