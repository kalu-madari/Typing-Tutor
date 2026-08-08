import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Palette, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';

const TypingArea = ({ engineState, isIdle }) => {
  const store = useAppStore();
  const { fontSize, textAlign } = store;
  const activeCharRef = useRef(null);
  const containerRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeChar = activeCharRef.current;
      
      const charTop = activeChar.offsetTop;
      
      container.scrollTo({
        top: Math.max(0, charTop - 24),
        behavior: 'smooth'
      });
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
                  <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
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
      fontSize: fontSize === 'large' ? '32px' : fontSize === 'small' ? '20px' : '26px',
      position: 'relative'
    }}>
      {/* Quick Settings Toolbar */}
      <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 50 }}>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="icon-btn-plain"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}
        >
          <Palette size={20} />
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '10px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                boxShadow: 'var(--shadow)',
                minWidth: '150px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Font Size</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => store.updateSetting('fontSize', 'small')} style={{ ...styles.quickBtn, background: fontSize === 'small' ? 'var(--accent-blue)' : 'transparent', color: fontSize === 'small' ? '#fff' : 'var(--text-primary)' }}><Type size={12}/></button>
                  <button onClick={() => store.updateSetting('fontSize', 'medium')} style={{ ...styles.quickBtn, background: fontSize === 'medium' ? 'var(--accent-blue)' : 'transparent', color: fontSize === 'medium' ? '#fff' : 'var(--text-primary)' }}><Type size={16}/></button>
                  <button onClick={() => store.updateSetting('fontSize', 'large')} style={{ ...styles.quickBtn, background: fontSize === 'large' ? 'var(--accent-blue)' : 'transparent', color: fontSize === 'large' ? '#fff' : 'var(--text-primary)' }}><Type size={20}/></button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Alignment</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => store.updateSetting('textAlign', 'left')} style={{ ...styles.quickBtn, background: textAlign === 'left' ? 'var(--accent-blue)' : 'transparent', color: textAlign === 'left' ? '#fff' : 'var(--text-primary)' }}><AlignLeft size={16}/></button>
                  <button onClick={() => store.updateSetting('textAlign', 'center')} style={{ ...styles.quickBtn, background: textAlign === 'center' ? 'var(--accent-blue)' : 'transparent', color: textAlign === 'center' ? '#fff' : 'var(--text-primary)' }}><AlignCenter size={16}/></button>
                  <button onClick={() => store.updateSetting('textAlign', 'right')} style={{ ...styles.quickBtn, background: textAlign === 'right' ? 'var(--accent-blue)' : 'transparent', color: textAlign === 'right' ? '#fff' : 'var(--text-primary)' }}><AlignRight size={16}/></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div 
        ref={containerRef} 
        className="no-scrollbar" 
        style={{
          ...styles.textContainer,
          height: '6em', // 4 lines if line-height is 1.5em
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
    maxWidth: '712px',
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
  },
  quickBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default TypingArea;
