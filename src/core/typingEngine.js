export class TypingEngine {
  constructor(text, layout) {
    this.text = text;
    this.layout = layout;
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
    
    // Callbacks for UI updates
    this.onStateChange = null;
    this.onFinish = null;
    this.onPlaySound = null; // To play error or success sounds
  }

  start() {
    if (this.status === 'idle') {
      this.status = 'running';
      this.startTime = Date.now();
      this.notify();
    }
  }

  handleKeyPress(key) {
    if (this.status === 'finished') return;
    if (this.status === 'idle') this.start();

    // Ignore modifier keys like Shift, Control, Alt
    if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta' || key === 'CapsLock' || key === 'Tab' || key === 'Enter') {
      return;
    }

    const targetChar = this.text[this.currentIndex];
    // Use layout to get expected key(s)
    const expectedKeys = this.layout.getExpectedKeys(targetChar);

    this.totalTypedChars++;

    if (expectedKeys.includes(key)) {
      // Correct!
      this.typedCharacters.push({ char: this.text[this.currentIndex], isError: false });
      this.correctChars++;
      this.currentIndex++;
      if (this.onPlaySound) this.onPlaySound('keystroke');

      if (this.currentIndex >= this.text.length) {
        this.status = 'finished';
        this.endTime = Date.now();
        if (this.onFinish) this.onFinish(this.getState());
      }
    } else {
      // Incorrect
      // If we want to allow typing incorrect chars and moving forward, we can, but currently it blocks.
      // Let's store the incorrect keystroke for the UI to blink it or show it.
      this.lastTypedChar = key;
      this.incorrectChars++;
      this.errors.add(this.currentIndex);
      if (this.onPlaySound) this.onPlaySound('error');
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
