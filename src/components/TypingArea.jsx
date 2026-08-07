import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const TypingArea = ({ engineState }) => {
  const { fontSize } = useAppStore();
  const activeCharRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeChar = activeCharRef.current;
      
      const containerHalfHeight = container.clientHeight / 2;
      const charTop = activeChar.offsetTop;
      const charHalfHeight = activeChar.clientHeight / 2;
      
      container.scrollTo({
        top: charTop - containerHalfHeight + charHalfHeight,
        behavior: 'smooth'
      });
    }
  }, [engineState?.currentIndex]);

  if (!engineState || !engineState.text) return null;

  const { text, currentIndex, errors, status } = engineState;

  // Split text into characters to render them individually
  const renderText = () => {
    return text.split('').map((char, index) => {
      let statusClass = 'pending';
      if (index < currentIndex) {
        statusClass = errors.has(index) ? 'error' : 'correct';
      }

      const isActive = index === currentIndex;
      const isError = isActive && errors.has(index); // If they just typed error on this active one

      return (
        <motion.span
          key={index}
          ref={isActive ? activeCharRef : null}
          style={{
            ...styles.char,
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
          {char === ' ' ? '\u00A0' : char === '\n' ? '↵\n' : char}
        </motion.span>
      );
    });
  };

  const getCharColor = (status) => {
    if (status === 'correct') return 'var(--success)';
    if (status === 'error') return 'var(--error)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="glass" style={{
      ...styles.container,
      fontSize: fontSize === 'large' ? '32px' : fontSize === 'small' ? '20px' : '26px'
    }}>
      <div ref={containerRef} className="no-scrollbar" style={styles.textContainer}>
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
    maxWidth: '712px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  textContainer: {
    fontFamily: '"Kruti Dev 010", sans-serif',
    lineHeight: '1.6',
    letterSpacing: '0px',
    display: 'block',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    maxHeight: '160px',
    overflowY: 'auto',
    position: 'relative'
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
