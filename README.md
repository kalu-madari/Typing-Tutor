# Kruti Dev 010 Typing Tutor

A modern, visually stunning typing tutor built to help users master the legacy **Kruti Dev 010** Hindi font layout. Built with React, Vite, and Framer Motion.

## Features

*   **Custom Typing Engine:** Built completely from scratch to accurately track legacy Hindi glyph combinations and matras without breaking text rendering. Strict case-sensitive tracking prevents accidental Shift/Caps Lock errors.
*   **Interactive Virtual Keyboard:** A responsive on-screen keyboard that visually maps standard English keystrokes to their corresponding Hindi characters.
*   **Finger Mapping:** Highlights which finger to use for the upcoming key using subtle glass-morphic color zones.
*   **Dynamic Visual Feedback:**
    *   **Pulse Animation:** Smoothly highlights the target key and pulses out on each successful keystroke to build typing rhythm.
    *   **Error Shake:** The target key flashes red and physically shakes back and forth if you press the wrong key.
    *   **Spacebar Highlight:** Special visual indicator when a space is required.
*   **Progressive Chapters & Lessons:** Carefully structured curriculum starting from the Home Row (Chapter 1), Top Row (Chapter 2), Bottom Row (Chapter 3), full alphabet mastery (Chapter 4), and Tricky matra combinations (Chapter 5).
*   **Live Analytics:** Tracks your WPM (Words Per Minute), Accuracy percentage, and time spent in real-time.
*   **Premium Glassmorphism UI:** A gorgeous dark-mode user interface with frosted glass components, glowing accents, and smooth transitions.

## Tech Stack

*   **Frontend:** React (JSX)
*   **Build Tool:** Vite
*   **Animations:** Framer Motion
*   **Styling:** Vanilla CSS (CSS Variables, Flexbox/Grid, Glassmorphism)
*   **Font:** Kruti Dev 010 (Local Asset)

## Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation & Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/kalu-madari/Typing-Tutor.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Typing-Tutor
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and visit the local URL provided by Vite (usually `http://localhost:5173`).

## Roadmap

*   **Chapter 6:** Introduction to Shift Key variations and half-letters.
*   **Chapter 7+:** Advanced paragraphs, number rows, and punctuation.
*   **Audio Feedback:** Optional keystroke clicks and error buzzers.
*   **Persistent Storage:** Save user progress, unlocked chapters, and high scores to local storage.

---

*Designed and built with a focus on absolute visual excellence and precise mechanical feedback.*
