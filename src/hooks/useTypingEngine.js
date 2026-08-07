import { useState, useEffect, useRef } from 'react';
import { TypingEngine } from '../core/typingEngine';
import { getTypingStats } from '../core/statistics';
import { useAppStore } from '../store/useAppStore';

export const useTypingEngine = (text, layout) => {
  const [engineState, setEngineState] = useState(null);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, timeInSeconds: 0 });
  const engineRef = useRef(null);
  const { soundEffects, errorSounds } = useAppStore();

  useEffect(() => {
    const engine = new TypingEngine(text, layout);
    engineRef.current = engine;
    
    engine.onStateChange = (state) => {
      setEngineState(state);
      if (state.status === 'running' || state.status === 'finished') {
        setStats(getTypingStats(state));
      }
    };

    engine.onPlaySound = (type) => {
      if (type === 'keystroke' && soundEffects) {
        // play subtle click
      } else if (type === 'error' && errorSounds) {
        // play error beep
      }
    };

    setEngineState(engine.getState());

    // Clean up
    return () => {
      engine.onStateChange = null;
      engine.onPlaySound = null;
    };
  }, [text, layout, soundEffects, errorSounds]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (engineRef.current) {
        if (e.key === ' ') e.preventDefault();
        engineRef.current.handleKeyPress(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { engineState, stats, resetEngine: () => {
    // Basic reset logic by recreating the engine could go here
    // or handled by unmounting/remounting component
  }};
};
