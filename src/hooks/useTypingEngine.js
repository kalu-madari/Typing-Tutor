import { useState, useEffect, useRef } from 'react';
import { TypingEngine } from '../core/typingEngine';
import { getTypingStats } from '../core/statistics';
import { useAppStore } from '../store/useAppStore';
import { altCodesMap } from '../core/altCodesMap';

export const useTypingEngine = (text, layout) => {
  const [engineState, setEngineState] = useState(null);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, timeInSeconds: 0 });
  const [isIdle, setIsIdle] = useState(false);
  const engineRef = useRef(null);
  const { soundEffects, errorSounds } = useAppStore();

  useEffect(() => {
    const engine = new TypingEngine(text, layout);
    engineRef.current = engine;
    
    engine.onStateChange = (state) => {
      setEngineState(state);
      setIsIdle(false);
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
    let interval;
    if (engineState?.status === 'running' || engineState?.status === 'idle') {
      interval = setInterval(() => {
        if (engineRef.current && (engineRef.current.status === 'running' || engineRef.current.status === 'idle')) {
          const state = engineRef.current.getState();
          setStats(getTypingStats(state));
          
          const now = Date.now();
          if ((now - (state.lastInteractionTime || now)) >= 8000) {
            setIsIdle(true);
          }
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [engineState?.status]);

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
          if (engineRef.current && engineRef.current.status !== 'finished') {
            const state = engineRef.current.getState();
            const nextChar = state.text[state.currentIndex];
            
            if (nextChar && altCodesMap[nextChar]) {
              const sequence = altCodesMap[nextChar];
              const expectedStr = sequence.slice(2).map(k => k.replace('Numpad', '')).join('');
              
              if (digit !== expectedStr[altCodeStr.length]) {
                altCodeStr = "";
                setAltCodeState(altCodeStr);
                e.preventDefault();
                engineRef.current.handleKeyPress('WRONG_ALT_DIGIT');
                return;
              }
            } else {
              altCodeStr = "";
              setAltCodeState(altCodeStr);
              e.preventDefault();
              engineRef.current.handleKeyPress('WRONG_ALT_DIGIT');
              return;
            }
          }

          altCodeStr += digit;
          setAltCodeState(altCodeStr);
          e.preventDefault(); // Stop Windows from interfering

          // Numpad Alt codes often suppress the keyup event on Windows.
          // Since our target KrutiDev Alt codes are exactly 4 digits long (e.g. 0161),
          // we can bypass the OS entirely and inject instantly on the 4th digit!
          if (altCodeStr.length === 4) {
            if (engineRef.current) {
              const charCode = parseInt(altCodeStr, 10);
              if (!isNaN(charCode)) {
                const char = String.fromCharCode(charCode);
                window.dispatchEvent(new CustomEvent('debugLog', { detail: `INJECT: ${char} (code=${charCode})` }));
                engineRef.current.handleKeyPress(char);
              }
            }
            altCodeStr = "";
            setAltCodeState(altCodeStr);
          }
        }
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
      }
      engineRef.current.handleKeyPress(e.key);
    };

    const handleKeyUp = (e) => {
      // Clean up the tracking string if they release Alt before finishing 4 digits
      // (Using !e.altKey is safer than e.key === 'Alt' because the OS might change the key string)
      if (!e.altKey && altCodeStr.length > 0) {
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

  return { engineState, stats, altCodeState, isIdle, resetEngine: () => {
    // Basic reset logic by recreating the engine could go here
    // or handled by unmounting/remounting component
  }};
};
