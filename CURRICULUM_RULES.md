# KrutiDev Typing Curriculum Rules

This document serves as the absolute rulebook for an AI or script to automatically generate thousands of JSON lesson files for the KrutiDev typing application. 

The application logic must be decoupled from the data. The engine accepts lessons; these rules dictate how those lessons are formed.

---

## 1. Lesson Schema and Metadata

Every generated lesson JSON MUST conform to the following schema:
```json
{
  "id": "chap1-les1-2",
  "chapterId": 1,
  "lessonNumber": 2,
  "title": "The Index Fingers",
  "description": "Learn to use your index fingers on the home row.",
  "difficulty": 1, 
  "estimatedTimeMinutes": 3,
  "minAccuracy": 90,
  "targetWpm": 12,
  "unlockedAfter": "chap1-les1-1",
  "newKeys": ["f", "j"],
  "previouslyUsedKeys": [],
  "fingersUsed": ["left-index", "right-index"],
  "type": "practice", 
  "content": [ ...exercises... ]
}
```

### 1.1 Types of Lessons
*   `practice`: Standard learning (introduces new keys).
*   `review`: Reuses old keys only. Mixes old and new.
*   `speed`: Forces a higher target WPM, simple text.
*   `accuracy`: Forces 95%+ accuracy, complex text.
*   `test`: Graded milestone.

---

## 2. Exercise Generation Rules

A lesson contains an array of `content` items (exercises).
An exercise goes through stages smoothly within a lesson:

### 2.1 Progression Pipeline (Within a single practice lesson)
1.  **Single Characters:** `f j f j f j`
2.  **Double Characters:** `ff jj fj jf`
3.  **Triplets/Quads:** `fff jjj fjf jfj`
4.  **Mixed with Previous (if any):** `fd jk fs jl`
5.  **Small Words:** Generate words strictly using `newKeys` + `previouslyUsedKeys`.

### 2.2 Difficulty Scaling (Pacing)
*   **Max New Keys:** NEVER introduce more than 2 new keys per lesson.
*   **Ratio:** 70% of an exercise must focus on the `newKeys`. 30% must weave in `previouslyUsedKeys`.
*   **Cadence:** 
    *   Every 5th lesson MUST be `type: "review"`.
    *   Every 10th lesson MUST be `type: "test"`.

---

## 3. Keyboard & Finger Rules

### 3.1 Strict KrutiDev 010 Mapping
The generator must only use standard English QWERTY key characters as the underlying text. The UI renders this via the KrutiDev font. 
*   **DO NOT** generate Unicode Hindi characters (e.g., `म`).
*   **DO** generate the English keystroke (e.g., `e`).

### 3.2 Finger Assignment
Every key generated must map to its ergonomically correct finger.
*   `a` -> `left-pinky`
*   `s` -> `left-ring`
*   `d` -> `left-middle`
*   `f`, `g`, `r`, `t`, `v`, `b` -> `left-index`
*   `space` -> `thumb` (either left or right)

*Rule:* Do not create exercises that require awkward finger jumps (e.g., rapid alternation of `x` and `c` on the same hand without space).

---

## 4. Word & Text Generation Rules

### 4.1 Allowed Character Pool
When generating "words", the script must look at `newKeys` + `previouslyUsedKeys`. 
*   **Rule:** It is strictly forbidden to use a character in an exercise if it has not been introduced in the current or a previous lesson.

### 4.2 Word Length Scaling
*   **Level 1 (Lessons 1-10):** 2-3 letter words (e.g., `asdf`, `lkj`).
*   **Level 2 (Lessons 11-30):** 3-5 letter words.
*   **Level 3 (Lessons 31-90):** 5-8 letter words.
*   **Level 4 (Lessons 91+):** Real dictionary words, sentences, and paragraphs.

### 4.3 Sensible Hindi Output
Even though we are typing English characters, the resulting KrutiDev output should ideally look like readable Hindi text or plausible syllables, rather than completely random garbage, especially from Chapter 8 onwards.

---

## 5. Scoring and Gamification Rules

### 5.1 Star Calculation (Per Lesson)
Stars are calculated based on achieving targets:
*   **1 Star (Bronze):** Met `minAccuracy` (e.g., 90%).
*   **2 Stars (Silver):** Met `minAccuracy` + `targetWpm`.
*   **3 Stars (Gold):** `minAccuracy` >= 96% + `targetWpm` + 10%.
*   **4 Stars (Perfect):** 100% Accuracy + exceeded `targetWpm`.

### 5.2 Unlock Logic
*   Lesson `N` is locked until Lesson `N-1` is completed with at least 1 Star.
*   Tests require all previous lessons in the chapter to have at least 1 Star.

### 5.3 Stats tracked
The generator must assume the engine tracks:
*   WPM (Words Per Minute)
*   Accuracy %
*   Errors per key (To fuel dynamic review lessons in the future).

---

## 6. Future Expansion Rules

*   **Layout Agnostic:** The lesson rules rely on key combinations, not visual representations. If we add `Remington` or `Inscript` later, we only swap the layout map in the application engine; the JSON structure remains identical.
*   **Dynamic Generation:** The JSON files should be static for the core curriculum, but the application engine can use these exact same generation rules to create "Dynamic Practice" sessions based on the user's highest error keys.
