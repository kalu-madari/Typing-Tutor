import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      // Settings
      theme: 'dark',
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
      continueLessonId: null,
      bestWpm: 0,
      bestAccuracy: 0,
      streak: 0,
      lastActiveDate: null,
      totalTypedChars: 0,
      perfectLessonsCount: 0,
      unlockedAchievements: [],
      bookmarks: [],
      practiceResults: {},

      // Actions
      updateStreak: () => set((state) => {
        const today = new Date().toDateString();
        if (state.lastActiveDate === today) return state;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (state.lastActiveDate === yesterday.toDateString()) {
          return { ...state, streak: state.streak + 1, lastActiveDate: today };
        } else {
          return { ...state, streak: 1, lastActiveDate: today };
        }
      }),
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
      savePracticeResult: (lessonId, result) => set((state) => {
        const updated = { ...(state.practiceResults || {}) };
        if (!updated[lessonId]) updated[lessonId] = [];
        updated[lessonId] = [...updated[lessonId], { ...result, date: Date.now() }];
        return { ...state, practiceResults: updated };
      }),
      toggleBookmark: (id) => set((state) => {
        const bookmarks = state.bookmarks || [];
        if (bookmarks.includes(id)) {
          return { ...state, bookmarks: bookmarks.filter(b => b !== id) };
        } else {
          return { ...state, bookmarks: [...bookmarks, id] };
        }
      }),
      resetProgress: () => set((state) => {
        localStorage.removeItem('krutidev-completed-lessons');
        return {
          ...state,
          continueLessonId: null,
          bestWpm: 0,
          bestAccuracy: 0,
          streak: 0,
          lastActiveDate: null,
          totalTypedChars: 0,
          perfectLessonsCount: 0,
          unlockedAchievements: [],
          bookmarks: [],
          practiceResults: {},
        };
      }),
    }),
    {
      name: 'krutidev-settings-storage', // name of the item in the storage (must be unique)
    }
  )
);
