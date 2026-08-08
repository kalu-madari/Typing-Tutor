import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const BoxExercise = ({ engineState }) => {
  const store = useAppStore();
  const { fontSize, showVirtualKeyboard } = store;
  const activeBoxRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (activeBoxRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeBox = activeBoxRef.current;
      
      const containerHalfHeight = container.clientHeight / 2;
      const boxTop = activeBox.offsetTop;
      const boxHalfHeight = activeBox.clientHeight / 2;
      
      container.scrollTo({
        top: boxTop - containerHalfHeight + boxHalfHeight,
        behavior: 'smooth'
      });
    }
  }, [engineState?.currentIndex]);

  if (!engineState || !engineState.text) return null;

  const { text, currentIndex, errors, status, typedCharacters } = engineState;

  // Group characters by words to prevent breaking a word across lines
  const renderBoxes = () => {
    const words = [];
    let currentWord = [];
    
    text.split('').forEach((char, index) => {
      if (char === ' ' || char === '\n') {
        if (currentWord.length > 0) {
          words.push(currentWord);
          currentWord = [];
        }
        words.push([{ char, index }]);
      } else {
        currentWord.push({ char, index });
      }
    });
    if (currentWord.length > 0) {
      words.push(currentWord);
    }

    return words.map((wordTokens, wIdx) => {
      const isWhitespace = wordTokens.length === 1 && (wordTokens[0].char === ' ' || wordTokens[0].char === '\n');
      
      return (
        <div key={wIdx} style={{ display: 'inline-flex', gap: '8px', margin: '8px', verticalAlign: 'top' }}>
          {wordTokens.map(({ char, index }) => {
            const isActive = index === currentIndex;
            const isError = isActive && errors.has(index);
            
            let statusClass = 'upcoming';
            if (index < currentIndex) {
              const typed = typedCharacters[index];
              if (typed && typed.isError) {
                statusClass = 'error';
              } else if (errors.has(index)) {
                statusClass = 'corrected'; // if allowing correction
              } else {
                statusClass = 'correct';
              }
            }

            if (isActive) statusClass = 'active';
            if (isError) statusClass = 'active-error';

            const isSpace = char === ' ' || char === '\n';

            return (
              <motion.div
                key={index}
                ref={isActive ? activeBoxRef : null}
                style={{
                  ...styles.box,
                  width: isSpace ? '80px' : '48px',
                  height: '56px',
                  backgroundColor: getBgColor(statusClass),
                  borderColor: getBorderColor(statusClass),
                  boxShadow: isActive ? `0 0 12px ${getBorderColor(statusClass)}` : 'none',
                  fontFamily: (statusClass === 'correct' || statusClass === 'corrected') ? 'sans-serif' : (isSpace ? 'sans-serif' : '"Kruti Dev 010", sans-serif'),
                }}
                animate={isError ? { x: [-4, 4, -4, 4, 0] } : (isActive ? { scale: [1, 1.05, 1] } : { scale: 1 })}
                transition={isError ? { duration: 0.3 } : (isActive ? { repeat: Infinity, duration: 1.5 } : { duration: 0.2 })}
              >
                <AnimatePresence mode="wait">
                  {(statusClass === 'correct' || statusClass === 'corrected') ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      style={{ color: '#fff', fontSize: '24px' }}
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <motion.span
                      key="char"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ 
                        color: getTextColor(statusClass),
                        fontSize: isSpace ? '16px' : (fontSize === 'large' ? '32px' : fontSize === 'small' ? '20px' : '26px'),
                        position: 'relative'
                      }}
                    >
                      {isActive && !isSpace && (
                        <span style={{ position: 'absolute', left: '-14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--accent-blue)', opacity: 0.7, fontFamily: 'sans-serif' }}>▣</span>
                      )}
                      {isSpace ? (char === '\n' ? '↵' : '␣') : char}
                      {isActive && !isSpace && (
                        <span style={{ position: 'absolute', right: '-14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--accent-blue)', opacity: 0.7, fontFamily: 'sans-serif' }}>▣</span>
                      )}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      );
    });
  };

  const getBgColor = (status) => {
    switch(status) {
      case 'correct': return 'var(--success)';
      case 'corrected': return 'var(--success)';
      case 'error': return 'rgba(239, 68, 68, 0.2)';
      case 'active-error': return 'rgba(239, 68, 68, 0.3)';
      case 'active': return 'rgba(59, 130, 246, 0.1)';
      default: return 'var(--glass-bg)';
    }
  };

  const getBorderColor = (status) => {
    switch(status) {
      case 'correct': return 'var(--success)';
      case 'corrected': return 'var(--success)';
      case 'error': return 'var(--danger)';
      case 'active-error': return 'var(--danger)';
      case 'active': return 'var(--accent-blue)';
      default: return 'var(--glass-border)';
    }
  };

  const getTextColor = (status) => {
    switch(status) {
      case 'active': return 'var(--accent-blue)';
      case 'active-error': return 'var(--danger)';
      case 'error': return 'var(--danger)';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <div className="glass-panel" style={{ 
      ...styles.container,
    }}>
      <div 
        ref={containerRef} 
        className="no-scrollbar" 
        style={{
          ...styles.boxesContainer,
          maxHeight: showVirtualKeyboard ? '220px' : '400px',
        }}
      >
        {renderBoxes()}
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
    padding: '30px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '850px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  boxesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'flex-start',
    overflowY: 'auto',
    position: 'relative',
    transition: 'max-height 0.3s ease',
    padding: '10px'
  },
  box: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '2px solid',
    borderRadius: '8px',
    position: 'relative',
    transition: 'all 0.2s ease',
    overflow: 'hidden'
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
