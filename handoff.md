# KrutiDev Typing App - Project Handoff Context

## 1. Project Overview & Architecture
This is a React-based typing tutor application specifically designed for the **KrutiDev 010** legacy Hindi font.
- **Tech Stack**: React, Vite, CSS (Vanilla with CSS variables for themes).
- **State Management**: Zustand (`src/store/useAppStore.js`) handles global user preferences.
- **Core Files**:
  - `src/App.jsx`: Main routing and UI shell (DashboardView, TypingSession, SettingsView).
  - `src/hooks/useTypingEngine.js`: Core typing logic, live WPM/Accuracy tracking, and a complex **4-digit Alt Code injection engine**.
  - `src/components/TypingArea.jsx`: Renders the lesson text and handles visual cursor placement.
  - `src/components/VirtualKeyboard.jsx`: On-screen visual keyboard.
  - `src/core/lessonEngine.js` & `src/data/chapters/*`: Contains the curriculum data.
  - `src/css/styles.css`: Global styles (imported directly from reference project).

## 2. Strict Rules & Guidelines (CRITICAL)
- **Font & Encoding**: The app strictly uses **KrutiDev 010** (Legacy encoding). **NEVER generate or teach Unicode Hindi**. All Hindi text in lessons must be in the ASCII characters that map to KrutiDev 010.
- **Basic Lesson Formatting**: For *basic* lessons (early chapters), lessons should have a **maximum of 30 words** and consist of exactly **one paragraph**. (Note: This size restriction applies only to basic lessons).
- **UI & Aesthetics**: The strict source of truth for the UI and themes is another local repository: `C:\Users\navee\Desktop\CPP-UI-UPG\cpp-test`. 
  - Match its exact CSS classes, HTML structure, and aesthetic vibe whenever building new UI components.
  - Settings and other views should use the `glass-card` aesthetic.
- **Typing Mechanics**: 
  - The typing time is **live** and pauses automatically if the user doesn't press any key for **3 seconds**.
  - The switch buttons in the UI use a grey `#9ca3af` color for their "off" state.

## 3. Recent Accomplishments & Current State
- **Alt Code Engine**: Built an engine inside `useTypingEngine.js` that intercepts Alt key events, buffers up to 4 numpad digits, and injects the corresponding KrutiDev character.
- **Lesson Content**: Chapters 1 through 5 have been generated, formatted, and debugged (including specific fixes for difficult character combinations like `fra`, `oo`, `Ru`).
- **Settings UI Refactor**: 
  - Created a dedicated `SettingsView` (accessible from the sidebar) matching the `cpp-test` layout.
  - Added theme selection, font size, and text alignment dropdowns.
  - Maintained the original toggles on the right side of the `TypingSession` view (Backspace, Key Sounds, Virtual Keyboard, Move on Error, etc.) exactly as they were in commit `318508e`.
- **Layout Fixes**: Fixed a major bug where the `TypingSession` layout grid was broken due to missing HTML closing tags, restoring it completely to a stable state.

## 4. Immediate Next Steps for Next Agent
- **Generate Chapter 6**: Create the lesson content and data for Chapter 6 based on the established KrutiDev 010 curriculum structure.
- **Review UI Consistency**: Continue ensuring any new features adhere perfectly to the `cpp-test` reference design.
