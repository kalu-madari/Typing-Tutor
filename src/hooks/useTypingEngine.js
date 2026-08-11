import { useState, useEffect, useRef } from 'react';
import { TypingEngine } from '../core/typingEngine';
import { getTypingStats } from '../core/statistics';
import { useAppStore } from '../store/useAppStore';
import { altCodesMap } from '../core/altCodesMap';

export const useTypingEngine = (text, layout, lessonType) => {
  const [engineState, setEngineState] = useState(null);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, timeInSeconds: 0 });
  const [isIdle, setIsIdle] = useState(false);
  const engineRef = useRef(null);
  const clickAudioRef = useRef(null);
  const errorAudioRef = useRef(null);

  // Fix #4 — use selectors so changing unrelated store fields doesn't re-run this hook
  // Fix #10 — use refs for sound flags so toggling sound doesn't destroy the engine
  const soundEffects = useAppStore(s => s.soundEffects);
  const errorSounds = useAppStore(s => s.errorSounds);
  const soundEffectsRef = useRef(soundEffects);
  const errorSoundsRef = useRef(errorSounds);
  useEffect(() => { soundEffectsRef.current = soundEffects; }, [soundEffects]);
  useEffect(() => { errorSoundsRef.current = errorSounds; }, [errorSounds]);
  useEffect(() => {
    const clickAudio = new Audio('/sounds/click.mp3');
    const errorAudio = new Audio('/sounds/error.mp3');

    clickAudio.preload = 'auto';
    errorAudio.preload = 'auto';
    clickAudioRef.current = clickAudio;
    errorAudioRef.current = errorAudio;
  }, []);

  useEffect(() => {
    const engine = new TypingEngine(text, layout, lessonType);
    engineRef.current = engine;

    engine.onStateChange = (state) => {
      setEngineState(state);
      setIsIdle(false);
      // Fix #8/#9 — don't compute stats on every keystroke; let the 500ms interval handle it.
      // Only compute on finish so the results screen is accurate immediately.
      if (state.status === 'finished') {
        setStats(getTypingStats(state));
      }
    };

    // Fix #10 — onPlaySound reads from refs so sound prefs are always current
    engine.onPlaySound = (type) => {
      if (type === 'keystroke' && soundEffectsRef.current) {
        const audio = clickAudioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise?.catch) playPromise.catch(() => {});
      } else if (type === 'error' && errorSoundsRef.current) {
        const audio = errorAudioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise?.catch) playPromise.catch(() => {});
      }
    };

    setEngineState(engine.getState());

    return () => {
      engine.onStateChange = null;
      engine.onPlaySound = null;
    };
  // Fix #10 — removed soundEffects/errorSounds from deps; they're handled via refs now
  }, [text, layout, lessonType]);

  useEffect(() => {
    let interval;
    if (engineState?.status === 'running' || engineState?.status === 'idle') {
      interval = setInterval(() => {
        if (engineRef.current && (engineRef.current.status === 'running' || engineRef.current.status === 'idle')) {
          const state = engineRef.current.getState();

          // Fix #9 — bail out of setStats if wpm/accuracy haven't changed to avoid wasted re-renders
          setStats(prev => {
            const next = getTypingStats(state);
            if (prev.wpm === next.wpm && prev.accuracy === next.accuracy) return prev;
            return next;
          });

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
          e.preventDefault();

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

  return { engineState, stats, altCodeState, isIdle, resetEngine: () => {} };
};
