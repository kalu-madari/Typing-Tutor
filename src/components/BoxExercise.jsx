import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const BoxExercise = ({ engineState }) => {
  const fontSize = useAppStore(s => s.fontSize);
  const [wrongChar, setWrongChar] = useState(null);
  const [shakeKey, setShakeKey] = useState(0);
  const prevIncorrect = useRef(engineState?.incorrectChars || 0);

  // Flash wrong char + shake box for 400ms on each new error — zero framer-motion on hot path
  useEffect(() => {
    const current = engineState?.incorrectChars || 0;
    if (current > prevIncorrect.current && engineState?.lastTypedChar) {
      setWrongChar(engineState.lastTypedChar);
      setShakeKey(k => k + 1); // changing key restarts CSS animation
      const t = setTimeout(() => setWrongChar(null), 400);
      prevIncorrect.current = current;
      return () => {
        clearTimeout(t);
        setWrongChar(null);
      };
    }
    prevIncorrect.current = current;
  }, [engineState?.incorrectChars, engineState?.lastTypedChar]);

  if (!engineState || !engineState.text) return null;

  const { text, currentIndex, errors, status, typedCharacters } = engineState;

  const CHUNK_SIZE = 10;
  const currentChunkIndex = Math.floor(currentIndex / CHUNK_SIZE);
  const startIndex = currentChunkIndex * CHUNK_SIZE;
  const endIndex = Math.min(startIndex + CHUNK_SIZE, text.length);

  const currentChars = text.split('').slice(startIndex, endIndex).map((char, localIndex) => ({
    char,
    index: startIndex + localIndex
  }));

  const charFontSize = fontSize === 'large' ? '36px' : fontSize === 'small' ? '24px' : '30px';

  const renderBoxes = () => (
    <AnimatePresence mode="wait">
      {/* Chunk-level animation is fine — only fires every 10 chars */}
      <motion.div
        key={currentChunkIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}
      >
        {currentChars.map(({ char, index }) => {
          const isActive = index === currentIndex;
          const isSpace = char === ' ' || char === '\n';

          let statusClass = 'upcoming';
          if (index < currentIndex) {
            const typed = typedCharacters[index];
            if (typed && typed.isError) statusClass = 'error';
            else if (errors.has(index)) statusClass = 'corrected';
            else statusClass = 'correct';
          }
          if (isActive) statusClass = isActive && wrongChar ? 'active-error' : 'active';

          // CSS classes instead of framer-motion per-char animations
          const boxClass = isActive && wrongChar ? `box-shake` : isActive ? 'box-active-pulse' : '';

          return (
            // Plain div — no framer-motion on individual boxes
            <div
              key={index}
              className={isActive && wrongChar ? `box-shake-${shakeKey}` : ''}
              style={{
                ...styles.box,
                height: '64px',
                backgroundColor: getBgColor(statusClass),
                borderColor: getBorderColor(statusClass),
                borderWidth: (statusClass === 'active' || statusClass === 'active-error') ? '3px' : '2px',
                boxShadow: (statusClass === 'active' || statusClass === 'active-error')
                  ? `0 0 20px ${getBorderColor(statusClass)}, inset 0 0 8px ${getBorderColor(statusClass)}`
                  : 'none',
                fontFamily: isSpace ? 'sans-serif' : '"Kruti Dev 010", sans-serif',
                borderRadius: '12px',
                // CSS animation via inline style trick: re-key resets animation
                animation: isActive && wrongChar
                  ? 'box-shake 0.35s ease'
                  : isActive ? 'box-pulse 1.5s ease infinite'
                  : 'none',
              }}
            >
              {/* Wrong char pop or normal char — plain span + CSS class */}
              {isActive && wrongChar ? (
                <span
                  key={`wrong-${shakeKey}`}
                  className="wrong-char-pop"
                  style={{
                    color: 'var(--danger)',
                    fontSize: (wrongChar === ' ' || wrongChar === '\n') ? '20px' : charFontSize,
                    fontFamily: (wrongChar === ' ' || wrongChar === '\n') ? 'sans-serif' : '"Kruti Dev 010", sans-serif',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {wrongChar}
                </span>
              ) : (
                <span
                  style={{
                    color: getTextColor(statusClass),
                    fontSize: isSpace ? '20px' : charFontSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  {isSpace ? (char === '\n' ? '↵' : '␣') : char}

                  {(statusClass === 'correct' || statusClass === 'corrected') && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      color: '#fff',
                      fontSize: '12px',
                      background: 'var(--success)',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      fontFamily: 'sans-serif'
                    }}>✓</span>
                  )}
                </span>
              )}
            </div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );

  const getBgColor = (status) => {
    switch(status) {
      case 'correct':     return 'rgba(16, 185, 129, 0.2)';
      case 'corrected':   return 'rgba(16, 185, 129, 0.2)';
      case 'error':       return 'rgba(239, 68, 68, 0.2)';
      case 'active-error':return 'rgba(239, 68, 68, 0.3)';
      case 'active':      return 'rgba(59, 130, 246, 0.3)';
      default:            return 'var(--glass-bg)';
    }
  };

  const getBorderColor = (status) => {
    switch(status) {
      case 'correct':     return 'var(--success)';
      case 'corrected':   return 'var(--success)';
      case 'error':       return 'var(--danger)';
      case 'active-error':return 'var(--danger)';
      case 'active':      return 'var(--accent-blue)';
      default:            return 'var(--glass-border)';
    }
  };

  const getTextColor = (status) => {
    switch(status) {
      case 'active':      return 'var(--accent-blue)';
      case 'active-error':return 'var(--danger)';
      case 'error':       return 'var(--danger)';
      default:            return 'var(--text-primary)';
    }
  };

  return (
    <div className="glass-panel" style={styles.container}>
      <div className="no-scrollbar" style={styles.boxesContainer}>
        {renderBoxes()}
      </div>

      {/* Progress */}
      <div style={styles.progressContainer}>
        <div style={{ ...styles.progressBar, width: `${Math.min(100, (currentIndex / text.length) * 100)}%` }} />
      </div>

      {status === 'finished' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.finishedMessage}
        >
          Box Exercise Complete!
        </motion.div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '850px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  boxesContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100px',
    padding: '20px',
    overflow: 'hidden'
  },
  box: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '48px',
    border: '2px solid',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '12px',
  },
  progressContainer: {
    width: '100%',
    height: '4px',
    backgroundColor: 'var(--glass-border)',
    borderRadius: '2px',
    marginTop: '30px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'var(--accent-blue)',
    transition: 'width 0.3s ease'
  },
  finishedMessage: {
    marginTop: '20px',
    color: 'var(--success)',
    textAlign: 'center',
    fontFamily: 'var(--font-ui)',
    fontWeight: 'bold',
    fontSize: '20px'
  }
};

export default BoxExercise;
