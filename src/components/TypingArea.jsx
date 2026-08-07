import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const TypingArea = ({ engineState }) => {
  const store = useAppStore();
  const { fontSize } = store;
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
              statusClass = errors.has(index) ? 'error' : 'correct';
            }

            const isActive = index === currentIndex;
            const isError = isActive && errors.has(index);

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
          })}
        </span>
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
      
      {/* Settings Column */}
      <div style={styles.settingsColumn}>
        <h4 style={styles.settingsTitle}>Settings</h4>
        
        <label style={styles.settingRow}>
          <input 
            type="checkbox" 
            checked={store.allowBackspace} 
            onChange={(e) => store.updateSetting('allowBackspace', e.target.checked)}
          />
          Allow Backspace
        </label>
        
        <label style={styles.settingRow}>
          <input 
            type="checkbox" 
            checked={store.soundEffects} 
            onChange={(e) => store.updateSetting('soundEffects', e.target.checked)}
          />
          Key sounds
        </label>
        
        <label style={styles.settingRow}>
          <input 
            type="checkbox" 
            checked={store.errorSounds} 
            onChange={(e) => store.updateSetting('errorSounds', e.target.checked)}
          />
          Error sounds
        </label>
        
        <label style={styles.settingRow}>
          <input 
            type="checkbox" 
            checked={store.showVirtualKeyboard} 
            onChange={(e) => store.updateSetting('showVirtualKeyboard', e.target.checked)}
          />
          Virtual keyboard
        </label>
        
        <label style={styles.settingRow}>
          <input 
            type="checkbox" 
            checked={store.moveOnError} 
            onChange={(e) => store.updateSetting('moveOnError', e.target.checked)}
          />
          Move on error
        </label>
        
        {store.moveOnError && (
          <div style={styles.subSetting}>
            <span>Max errors:</span>
            <select 
              value={store.maxErrorsToSkip} 
              onChange={(e) => store.updateSetting('maxErrorsToSkip', parseInt(e.target.value, 10))}
              style={styles.selectInput}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
        )}
      </div>
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
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    gap: '30px',
    alignItems: 'flex-start'
  },
  settingsColumn: {
    width: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '8px',
    fontFamily: 'var(--font-ui)',
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  settingsTitle: {
    margin: '0 0 5px 0',
    color: 'var(--text-primary)',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  subSetting: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '24px',
    marginTop: '-4px'
  },
  selectInput: {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '2px 6px',
    outline: 'none',
    cursor: 'pointer'
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
