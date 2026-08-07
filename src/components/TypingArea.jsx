import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const TypingArea = ({ engineState }) => {
  const { fontSize } = useAppStore();

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
          style={{
            ...styles.char,
            color: getCharColor(statusClass, isActive),
            backgroundColor: isActive ? 'var(--glass-border)' : 'transparent',
            borderBottom: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent'
          }}
          animate={isError ? { x: [-2, 2, -2, 2, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      );
    });
  };

  const getCharColor = (status, isActive) => {
    if (status === 'correct') return 'var(--success)';
    if (status === 'error') return 'var(--error)';
    if (isActive) return 'var(--text-primary)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="glass" style={{
      ...styles.container,
      fontSize: fontSize === 'large' ? '32px' : fontSize === 'small' ? '20px' : '26px'
    }}>
      <div style={styles.textContainer}>
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
    maxWidth: '800px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  textContainer: {
    fontFamily: '"Kruti Dev 010", sans-serif',
    lineHeight: '1.6',
    letterSpacing: '2px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  char: {
    position: 'relative',
    transition: 'color 0.1s ease, background-color 0.1s ease',
    borderRadius: '2px',
    margin: '0 1px',
    padding: '0 2px'
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
