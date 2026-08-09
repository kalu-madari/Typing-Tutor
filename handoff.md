# KrutiDev Typing App - Project Handoff Context

## 1. Project Overview & Architecture
This is a React-based typing tutor application specifically designed for the **KrutiDev 010** legacy Hindi font.
- **Tech Stack**: React, Vite, CSS (Vanilla with CSS variables for themes).
- **State Management**: Zustand (`src/store/useAppStore.js`) handles global user preferences.
- **Core Files**:
  - `src/App.jsx`: Main routing and UI shell (DashboardView, TypingSession, SettingsView).
  - `src/hooks/useTypingEngine.js`: Core typing logic, live WPM/Accuracy tracking, and a complex **4-digit Alt Code injection engine**.
  - `src/components/TypingArea.jsx`: Renders the lesson text, auto-scrolls to keep the active line at the top, and handles visual cursor placement.
  - `src/components/VirtualKeyboard.jsx`: On-screen visual keyboard.
  - `src/core/lessonEngine.js` & `src/data/chapters/*`: Contains the curriculum data.
  - `src/css/styles.css`: Global styles (imported directly from reference project).

## 2. Strict Rules & Guidelines (CRITICAL)
- **Font & Encoding**: The app strictly uses **KrutiDev 010** (Legacy encoding). **NEVER generate or teach Unicode Hindi**. All Hindi text in lessons must be in the ASCII characters that map to KrutiDev 010.
- **Basic Lesson Formatting**: For *basic* lessons (early chapters), lessons should have a **maximum of 45 words** and consist of exactly **one paragraph**. 
- **UI & Aesthetics**: The strict source of truth for the UI and themes is another local repository: `C:\Users\navee\Desktop\CPP-UI-UPG\cpp-test`. 
  - Match its exact CSS classes, HTML structure, and aesthetic vibe whenever building new UI components.
  - Settings and other views should use the `glass-card` aesthetic.
  - Result screen must show ONLY performance metrics (Accuracy, Speed, Duration) with Title Case labels. No stars, points, XP, or high scores. Meters should have dynamic border colors based on performance.
- **Typing Mechanics**: 
  - The typing time is **live** and pauses automatically if the user doesn't press any key for **8 seconds**. An idle indicator reading "Start Typing" pointing downwards is shown.
  - Auto-scroll in TypingArea uses `getBoundingClientRect` to anchor the current active line to the top of a fixed `140px` height container, leaving `40px` padding above for the idle tooltip.

## 3. Recent Accomplishments & Current State
- **Alt Code Engine**: Built an engine inside `useTypingEngine.js` that intercepts Alt key events, buffers up to 4 numpad digits, and injects the corresponding KrutiDev character.
- **UI/UX Polishing**: 
  - Replaced the clock icon with the lesson index number in a circle for non-completed lessons in the Lesson Library.
  - Moved the Appearance (Palette) quick-settings into the Top Bar next to the Virtual Keyboard toggle.
  - Expanded TypingArea `maxWidth` to `1000px` to match the virtual keyboard width.
  - Added "Extra Large" (40px) font size and "Justify" text alignment options to global and quick settings.
  - Perfected auto-scrolling to keep the current typed line at the top of the view.
- **Data Normalization**: Used Python scripts to rebuild `tools/Basic Level 2.txt` so that all lessons are sequential and contain 40-45 words each.

## 4. Immediate Next Steps for Next Agent
- [x] **Curriculum Restructuring**:
  - [x] Shift existing chapters 4, 5, 6 to 10, 11, 12.
  - [x] Add new chapters in between (Ch 4: top number row, Ch 5-8: similar to original 1-4, Ch 9: mix practice 1-8).
  - [x] Add specific symbols (`[ ] \` in Ch 2; `{ } |` in Ch 6).
  - [x] Ensure chapters 1-10 have **no alt-code letters**.
- [x] **Python Scripts for Curriculum Management**: 
  - [x] Create a script to automatically reorder chapters (`tools/reorder_chapters.py`).
  - [x] Create a script to edit specific lesson data and seamlessly convert normal input into the Krutidev10 mapping format (`tools/lesson_editor.py`).
