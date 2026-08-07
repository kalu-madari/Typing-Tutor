export const calculateWPM = (correctChars, timeInSeconds) => {
  if (timeInSeconds === 0) return 0;
  const words = correctChars / 5;
  const minutes = timeInSeconds / 60;
  return Math.round(words / minutes);
};

export const calculateAccuracy = (correctChars, totalTypedChars) => {
  if (totalTypedChars === 0) return 100;
  return Math.round((correctChars / totalTypedChars) * 100);
};

export const getTypingStats = (state) => {
  // calculate time from totalActiveTimeMs
  let ms = state.totalActiveTimeMs || 0;
  if (state.status === 'running') {
    // add any pending time less than 3000ms
    const now = Date.now();
    const timeSinceLast = now - (state.lastInteractionTime || now);
    if (timeSinceLast < 3000) {
      ms += timeSinceLast;
    }
  }
  
  const timeInSeconds = ms / 1000;
  
  return {
    wpm: calculateWPM(state.correctChars, timeInSeconds),
    accuracy: calculateAccuracy(state.correctChars, state.totalTypedChars),
    timeInSeconds: Math.floor(timeInSeconds)
  };
};
