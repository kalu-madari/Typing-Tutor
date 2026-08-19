# Handoff Document: KrutiDev Typing App

## 📝 Recent Work & Bug Fixes

In our recent sessions, we made significant improvements to the app's performance, stability, and user experience:

1.  **Performance Optimization (Lag Reduction):**
    *   **Removed Framer Motion Overhead:** Replaced expensive `framer-motion` per-character animations on the hot typing path with lightweight CSS `@keyframes` in `styles.css`.
    *   **Zustand Selectors:** Updated components (`TypingArea`, `VirtualKeyboard`, `useTypingEngine`, `App.jsx`) to use specific Zustand selectors (e.g., `useAppStore(s => s.fontSize)`) instead of subscribing to the entire store. This drastically reduces unnecessary re-renders.
    *   **Stats Calculation Bail-out:** Optimized `useTypingEngine` to avoid recalculating and triggering re-renders for WPM and accuracy on every keystroke if the values haven't changed.
    *   **Virtual Keyboard Pulse:** Removed the continuous pulse animation on correct keystrokes in `VirtualKeyboard`, reserving the shake animation only for errors.

2.  **Feature Enhancements & Fixes:**
    *   **Audio Playback:** Implemented actual audio playback for keystrokes (`click.mp3`) and errors (`error.mp3`). Stored sound preferences in `useRef` to prevent engine recreation when toggling sounds.
    *   **Box Exercise Improvements:**
        *   Fixed a bug where the font reverted to English (`sans-serif`) after typing a correct character. It now strictly uses KrutiDev.
        *   Added a visual cue for mistakes: a wrong character briefly pops up in red, accompanied by a box shake, all powered by efficient CSS animations.
    *   **Normal Typing Visual Cues:** Added a zero-React-overhead wrong character flash using direct DOM manipulation for instant feedback without re-renders.
    *   **Lesson Library Stats:** The Lesson Library (`LessonsView`) now displays the Best WPM and Accuracy for each completed lesson. Unattempted lessons display "Not attempted".
    *   **Shortcut Stability:** Fixed the `Ctrl+K` shortcut (toggle virtual keyboard) by using stable selectors, ensuring the event listener doesn't constantly re-register.

## 🛠️ Current Code Architecture (Highlights)
*   **State Management:** Zustand (`src/store/useAppStore.js`).
*   **Typing Engine:** Custom hook (`useTypingEngine.js`) orchestrating the core logic (`typingEngine.js`).
*   **Rendering:** React components (`TypingArea.jsx`, `VirtualKeyboard.jsx`, `BoxExercise.jsx`).
*   **Styling:** Vanilla CSS (`styles.css`).

## 🚀 Next Steps / Pending Items
*   **Settings Menu Reset Button:** The user previously requested a reset button in the settings menu to clear all progress. (Note: A "Danger Zone" reset button currently exists in the Audio settings area of `App.jsx`, but it might need to be moved or made more prominent depending on user preference).
*   **Library Button Navigation:** Refactor the library button behavior: when in a lesson, pressing the library button should take the user to the specific chapter of that lesson, auto-scroll to the lesson, and de-collapse the chapter view.
*   **Streak Logic Investigation:** The user mentioned that the daily streak doesn't update correctly (should be at least 1). The logic in `updateStreak` within `useAppStore.js` might need a review.

## ⚠️ Important Rules for Next Agent
*   **Font Encoding:** The app uses KrutiDev 010 (Legacy encoding). NEVER generate Unicode Hindi. Font: `"Kruti Dev 010", sans-serif`.
*   **Performance:** The user is highly sensitive to lag. Always prioritize performance, especially on the hot path (typing characters). Avoid unnecessary React re-renders or heavy animations during typing. Use CSS animations or direct DOM manipulation when appropriate.
*   **Alt Codes:** The alt code cheat sheet mode is "Always on show all". When pressing Alt for an alt code, only highlight the left Alt key, not both.
