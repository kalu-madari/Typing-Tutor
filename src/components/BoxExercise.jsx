import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const BoxExercise = ({ engineState }) => {
  const store = useAppStore();
  const { fontSize } = store;

  if (!engineState || !engineState.text) return null;

  const { text, currentIndex, errors, status, typedCharacters } = engineState;

  const CHUNK_SIZE = 8;
  const currentChunkIndex = Math.floor(currentIndex / CHUNK_SIZE);
  
  const startIndex = currentChunkIndex * CHUNK_SIZE;
  const endIndex = Math.min(startIndex + CHUNK_SIZE, text.length);
  
  const currentChars = text.split('').slice(startIndex, endIndex).map((char, localIndex) => ({
    char,
    index: startIndex + localIndex
  }));

  const renderBoxes = () => {
    return (
      <AnimatePresence mode="wait">
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
                style={{
                  ...styles.box,
                  width: isSpace ? '48px' : '48px', // Reduced space size down to match standard box
                  height: '64px', // Taller box looks better in a single row
                  backgroundColor: getBgColor(statusClass),
                  borderColor: getBorderColor(statusClass),
                  boxShadow: isActive ? `0 0 16px ${getBorderColor(statusClass)}` : 'none',
                  fontFamily: (statusClass === 'correct' || statusClass === 'corrected') ? 'sans-serif' : (isSpace ? 'sans-serif' : '"Kruti Dev 010", sans-serif'),
                  borderRadius: '12px'
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
                      style={{ color: '#fff', fontSize: '28px' }}
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
                        fontSize: isSpace ? '20px' : (fontSize === 'large' ? '36px' : fontSize === 'small' ? '24px' : '30px'),
                        position: 'relative'
                      }}
                    >
                      {isSpace ? (char === '\n' ? '↵' : '␣') : char}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    );
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
        className="no-scrollbar" 
        style={styles.boxesContainer}
      >
        {renderBoxes()}
      </div>
      
      {/* Progress Indicator */}
      <div style={styles.progressContainer}>
        <div style={{
          ...styles.progressBar,
          width: `${Math.min(100, (currentIndex / text.length) * 100)}%`
        }} />
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
    border: '2px solid',
    position: 'relative',
    transition: 'all 0.2s ease',
    overflow: 'hidden'
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
