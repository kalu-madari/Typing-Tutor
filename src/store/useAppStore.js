import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      // Settings
      theme: 'vscode-dark',
      fontSize: 'medium',
      textAlign: 'left',
      soundEffects: true,
      errorSounds: true,
      showVirtualKeyboard: true,
      highlightFingers: true,
      timerMode: 'none', // none, 1min, 3min, 5min
      allowBackspace: false,
      moveOnError: false,
      maxErrorsToSkip: 3,
      blockOnError: false,
      maxErrorsToBlock: 3,

      // Progress Stats (mirrored from DB for quick UI access)
      bestWpm: 0,
      bestAccuracy: 0,
      streak: 0,
      totalTypedChars: 0,
      perfectLessonsCount: 0,
      unlockedAchievements: [],
      bookmarks: [],

      // Actions
      updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
      updateStat: (key, value) => set((state) => ({ ...state, [key]: value })),
      incrementTotalTypedChars: (count) => set((state) => ({ ...state, totalTypedChars: state.totalTypedChars + count })),
      incrementPerfectLessons: () => set((state) => ({ ...state, perfectLessonsCount: state.perfectLessonsCount + 1 })),
      unlockAchievement: (id) => set((state) => {
        if (!state.unlockedAchievements.includes(id)) {
          return { ...state, unlockedAchievements: [...state.unlockedAchievements, id] };
        }
        return state;
      }),
      toggleBookmark: (id) => set((state) => {
        if (state.bookmarks.includes(id)) {
          return { ...state, bookmarks: state.bookmarks.filter(b => b !== id) };
        } else {
          return { ...state, bookmarks: [...state.bookmarks, id] };
        }
      }),
    }),
    {
      name: 'krutidev-settings-storage', // name of the item in the storage (must be unique)
    }
  )
);
