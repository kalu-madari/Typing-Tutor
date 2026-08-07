import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Settings
  theme: 'dark',
  fontSize: 'medium',
  soundEffects: true,
  errorSounds: true,
  showVirtualKeyboard: true,
  highlightFingers: true,
  timerMode: 'none', // none, 1min, 3min, 5min
  allowBackspace: false,
  moveOnError: false,
  maxErrorsToSkip: 3,

  // Progress Stats (mirrored from DB for quick UI access)
  bestWpm: 0,
  bestAccuracy: 0,
  streak: 0,

  // Actions
  updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
  updateStat: (key, value) => set((state) => ({ ...state, [key]: value })),
}));
