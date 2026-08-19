import { useAppStore } from '../store/useAppStore';

export class TypingEngine {
  constructor(text, layout, lessonType) {
    this.text = text;
    this.layout = layout;
    this.lessonType = lessonType;
    this.currentIndex = 0;
    this.status = 'idle'; // idle | running | finished
    this.startTime = null;
    this.endTime = null;
    this.correctChars = 0;
    this.incorrectChars = 0;
    this.totalTypedChars = 0;
    this.errors = new Set(); // indices where an error occurred
    this.typedCharacters = [];
    this.lastTypedChar = null;
    this.currentConsecutiveErrors = 0;
    
    // Live timer properties
    this.totalActiveTimeMs = 0;
    this.lastInteractionTime = Date.now();
    
    // Callbacks for UI updates
    this.onStateChange = null;
    this.onFinish = null;
    this.onPlaySound = null; // To play error or success sounds
  }

  start() {
    if (this.status === 'idle') {
      this.status = 'running';
      this.startTime = Date.now();
      this.lastInteractionTime = Date.now();
      this.notify();
    }
  }

  handleKeyPress(key) {
    if (this.status === 'finished') return;
    if (this.status === 'idle') this.start();
    
    const now = Date.now();
    if (this.status === 'running') {
      const timeSinceLast = now - (this.lastInteractionTime || now);
      if (timeSinceLast < 8000) {
        this.totalActiveTimeMs += timeSinceLast;
      }
      this.lastInteractionTime = now;
    }

    let { allowBackspace, moveOnError, maxErrorsToSkip, blockOnError, maxErrorsToBlock } = useAppStore.getState();

    // Box practice strictly bans move on error
    if (this.lessonType === 'box_practice') {
      moveOnError = false;
    }

    // Ignore modifier keys like Shift, Control, Alt
    if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta' || key === 'CapsLock' || key === 'Tab') {
      return;
    }
    
    if (key === 'Backspace' && allowBackspace) {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.typedCharacters.pop();
        this.currentConsecutiveErrors = 0;
        this.notify();
      }
      return;
    }
    
    if (key === 'Backspace') return;

    let actualKey = key;
    if (actualKey === "'") actualKey = "*";
    if (actualKey === '"') actualKey = String.fromCharCode(223);

    const targetChar = this.text[this.currentIndex];
    
    if (actualKey === 'Enter' && targetChar !== '\n') {
      return;
    }

    const isCorrect = (targetChar === '\n' && actualKey === 'Enter') || (actualKey === targetChar);
    
    this.totalTypedChars++;

    if (isCorrect) {
      // Correct!
      this.typedCharacters.push({ char: this.text[this.currentIndex], isError: false });
      this.correctChars++;
      this.currentIndex++;
      this.currentConsecutiveErrors = 0;
      this.lastTypedChar = null;
      if (this.onPlaySound) this.onPlaySound('keystroke');

      if (this.currentIndex >= this.text.length) {
        this.status = 'finished';
        this.endTime = Date.now();
        if (this.onFinish) this.onFinish(this.getState());
      }
    } else {
      // Incorrect
      this.lastTypedChar = actualKey;
      this.incorrectChars++;
      this.errors.add(this.currentIndex);
      this.currentConsecutiveErrors++;
      if (this.onPlaySound) this.onPlaySound('error');
      
      if (blockOnError && this.currentConsecutiveErrors >= maxErrorsToBlock) {
        // Do nothing (block advancement)
      } else if (moveOnError && this.currentConsecutiveErrors >= maxErrorsToSkip) {
        // Force skip the character
        this.typedCharacters.push({ char: actualKey, isError: true });
        this.currentIndex++;
        this.currentConsecutiveErrors = 0;
        this.lastTypedChar = null;
        
        if (this.currentIndex >= this.text.length) {
          this.status = 'finished';
          this.endTime = Date.now();
          if (this.onFinish) this.onFinish(this.getState());
        }
      }
    }

    this.notify();
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  getState() {
    return {
      text: this.text,
      currentIndex: this.currentIndex,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      totalActiveTimeMs: this.totalActiveTimeMs,
      lastInteractionTime: this.lastInteractionTime,
      correctChars: this.correctChars,
      incorrectChars: this.incorrectChars,
      totalTypedChars: this.totalTypedChars,
      errors: new Set(this.errors), // Clone to avoid mutation issues in React
      typedCharacters: [...this.typedCharacters],
      lastTypedChar: this.lastTypedChar,
      layout: this.layout
    };
  }
}
