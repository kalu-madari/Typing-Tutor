import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const TypingArea = ({ engineState, isIdle }) => {
  const store = useAppStore();
  const { fontSize, textAlign } = store;
  const activeCharRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeChar = activeCharRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const charRect = activeChar.getBoundingClientRect();
      
      // Protect against browser rendering glitches where inline spaces return 0 rects
      if (charRect.top === 0 && charRect.bottom === 0) return;
      
      const charTop = charRect.top - containerRect.top + container.scrollTop;
      const targetTop = Math.max(0, charTop - 40);
      
      // Instant scroll is crucial to prevent smooth-scroll queues from 
      // interrupting each other and resetting the container to the top
      if (Math.abs(container.scrollTop - targetTop) > 5) {
        container.scrollTop = targetTop;
      }
    }
  }, [engineState?.currentIndex]);

  if (!engineState || !engineState.text) return null;

  const { text, currentIndex, errors, status, typedCharacters } = engineState;

  // Split text into words to prevent mid-word line breaking
  const renderText = () => {
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
        <span key={wIdx} style={{ display: isWhitespace ? 'inline' : 'inline-block', whiteSpace: 'pre' }}>
          {wordTokens.map(({ char, index }) => {
            let statusClass = 'pending';
            if (index < currentIndex) {
              const typed = typedCharacters[index];
              if (typed && typed.isError) {
                statusClass = 'error';
              } else if (errors.has(index)) {
                statusClass = 'corrected';
              } else {
                statusClass = 'correct';
              }
            }

            const isActive = index === currentIndex;
            const isError = isActive && errors.has(index);

            return (
              <motion.span
                key={index}
                ref={isActive ? activeCharRef : null}
                style={{
                  ...styles.char,
                  position: 'relative',
                  color: isActive ? '#eab308' : getCharColor(statusClass),
                  textShadow: isActive ? '0 0 8px rgba(250, 204, 21, 0.4)' : 'none',
                  backgroundColor: (isActive && char === ' ') ? 'rgba(250, 204, 21, 0.4)' : 'transparent',
                  borderRadius: (isActive && char === ' ') ? '4px' : '0',
                  borderBottom: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  fontFamily: char === '\n' ? 'sans-serif' : 'inherit'
                }}
                animate={isError ? { x: [-2, 2, -2, 2, 0] } : (isActive ? { opacity: [1, 0.8, 1] } : {})}
                transition={isError ? { duration: 0.3 } : (isActive ? { repeat: Infinity, duration: 1 } : {})}
              >
                {isActive && isIdle && (
                  <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px', background: '#3b82f6', color: '#fff', padding: '4px 20px', borderRadius: '4px', fontSize: '13px', lineHeight: '1.2', fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontFamily: 'sans-serif' }}>
                    Start Typing
                    <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderTop: '4px solid #3b82f6', borderLeft: '4px solid transparent', borderRight: '4px solid transparent' }} />
                  </div>
                )}
                {char === ' ' ? '\u00A0' : char === '\n' ? '↵\n' : char}
              </motion.span>
            );
          })}
        </span>
      );
    });
  };

  const getCharColor = (status) => {
    if (status === 'correct') return 'var(--success)';
    if (status === 'error') return 'var(--danger)';
    if (status === 'corrected') return 'var(--text-primary)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="glass-panel" style={{ 
      ...styles.container,
      fontSize: fontSize === 'extra_large' ? '40px' : fontSize === 'large' ? '32px' : fontSize === 'small' ? '20px' : '26px',
      position: 'relative'
    }}>
      <div 
        ref={containerRef} 
        className="no-scrollbar" 
        style={{
          ...styles.textContainer,
          height: '140px', // Fixed height so large fonts don't break the layout
          lineHeight: '1.5em',
          overflowY: 'auto', // Important for scrolling to work
          padding: '4px',
          paddingTop: '20px', // Extra padding at top for the indicator tooltip
          textAlign: textAlign || 'center'
        }}
      >
        {renderText()}
      </div>
      {status === 'finished' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          style={styles.finishedMessage}
        >
          Lesson Complete!
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
    maxWidth: '1000px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  textContainer: {
    fontFamily: '"Kruti Dev 010", sans-serif',
    lineHeight: '1.6',
    letterSpacing: '0px',
    display: 'block',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    position: 'relative',
    transition: 'max-height 0.3s ease'
  },
  char: {
    position: 'relative',
    transition: 'color 0.1s ease, background-color 0.1s ease',
    borderRadius: '2px',
    margin: '0px',
    padding: '0px'
  },
  finishedMessage: {
    marginTop: '20px',
    color: 'var(--success)',
    textAlign: 'center',
    fontFamily: 'var(--font-ui)',
    fontWeight: 'bold'
  }
};

export default TypingArea;
