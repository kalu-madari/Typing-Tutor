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

  const [altCodeState, setAltCodeState] = useState("");

  useEffect(() => {
    let altCodeStr = "";

    const handleKeyDown = (e) => {
      if (!engineRef.current) return;

      if (e.key === 'Alt') {
        altCodeStr = "";
        setAltCodeState(altCodeStr);
        return;
      }

      // Track Alt codes for visual highlighting in the Virtual Keyboard
      if (e.altKey) {
        let digit = "";
        if (e.code && e.code.startsWith('Numpad') && e.code.length === 7) {
          digit = e.code.charAt(6); 
        } else if (/^[0-9]$/.test(e.key)) {
          digit = e.key; 
        }

        if (/^[0-9]$/.test(digit)) {
          altCodeStr += digit;
          setAltCodeState(altCodeStr);
          e.preventDefault(); // Stop Windows from interfering; we will inject manually on keyUp
        }
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
      }
      engineRef.current.handleKeyPress(e.key);
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Alt') {
        if (altCodeStr.length > 0 && engineRef.current) {
          const charCode = parseInt(altCodeStr, 10);
          if (!isNaN(charCode)) {
            const char = String.fromCharCode(charCode);
            engineRef.current.handleKeyPress(char);
          }
        }
        altCodeStr = "";
        setAltCodeState(altCodeStr);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return { engineState, stats, altCodeState, resetEngine: () => {
    // Basic reset logic by recreating the engine could go here
    // or handled by unmounting/remounting component
  }};
};
