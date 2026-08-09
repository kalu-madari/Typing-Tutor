import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const TypingArea = ({ engineState, isIdle }) => {
  const store = useAppStore();
  const { fontSize, textAlign } = store;
  const containerRef = useRef(null);
  const currentIndex = engineState?.currentIndex;

  useLayoutEffect(() => {
    // Wait one frame to ensure React commits, layout calculates, and fonts stabilize
    requestAnimationFrame(() => {
      if (!containerRef.current || currentIndex === undefined) return;
      
      const container = containerRef.current;
      // Using data attributes is a robust way to locate the exact DOM node without relying on fragile React refs
      const activeElement = container.querySelector(`[data-char-index="${currentIndex}"]`);
      
      if (!activeElement) return;
      
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      
      // Protect against Chromium layout glitches where inline spaces return 0 height rects
      if (activeRect.top === 0 && activeRect.bottom === 0) return;
      
      const activeTop = activeRect.top;
      const activeBottom = activeRect.bottom;
      
      const visibleTop = containerRect.top;
      const visibleBottom = containerRect.bottom;
      
      // Keep a safe padding above and below so the line and tooltip are always fully readable
      const TOP_PADDING = 35;
      const BOTTOM_PADDING = 35;
      
      // If the character is already safely visible, do absolutely nothing (preserves user's manual scroll).
      // Only nudge the container if the character breaches the upper or lower safe zones.
      if (activeTop < visibleTop + TOP_PADDING) {
        container.scrollTop -= (visibleTop + TOP_PADDING) - activeTop;
      } else if (activeBottom > visibleBottom - BOTTOM_PADDING) {
        container.scrollTop += activeBottom - (visibleBottom - BOTTOM_PADDING);
      }
    });
  }, [currentIndex]);

  if (!engineState || !engineState.text) return null;

  const { text, errors, status, typedCharacters } = engineState;

  // Parse text into words only when the text changes to save CPU cycles
  const words = React.useMemo(() => {
    const wordsArray = [];
    let currentWord = [];
    
    text.split('').forEach((char, index) => {
      if (char === ' ' || char === '\n') {
        if (currentWord.length > 0) {
          wordsArray.push(currentWord);
          currentWord = [];
        }
        wordsArray.push([{ char, index }]);
      } else {
        currentWord.push({ char, index });
      }
    });
    if (currentWord.length > 0) {
      wordsArray.push(currentWord);
    }
    return wordsArray;
  }, [text]);

  const renderText = () => {
    return words.map((wordTokens, wIdx) => {
      const isWhitespace = wordTokens.length === 1 && (wordTokens[0].char === ' ' || wordTokens[0].char === '\n');
      
      // Removed whiteSpace: 'pre' so spaces can hang at the end of the line
      // rather than wrapping to the start of the next line.
      return (
        <span key={wIdx} style={{ display: isWhitespace ? 'inline' : 'inline-block' }}>
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
              <CharSpan 
                key={index}
                char={char}
                index={index}
                statusClass={statusClass}
                isActive={isActive}
                isError={isError}
                isIdle={isIdle}
                containerRef={containerRef}
              />
            );
          })}
        </span>
      );
    });
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
          height: '165px', // Increased height to allow tooltip to render in the empty space above
          lineHeight: '1.5em',
          overflowY: 'auto', // Important for scrolling to work
          overflowX: 'hidden', // Disable horizontal scrollbar
          padding: '4px',
          paddingTop: '45px', // Increased padding to provide space for the tooltip without squishing text
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

const getCharColor = (status) => {
  if (status === 'correct') return 'var(--success)';
  if (status === 'error') return 'var(--danger)';
  if (status === 'corrected') return 'var(--text-primary)';
  return 'var(--text-secondary)';
};

const CharSpan = React.memo(({
  char,
  index,
  statusClass,
  isActive,
  isError,
  isIdle,
  containerRef
}) => {
  return (
    <motion.span
      data-char-index={index}
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
        <IndicatorTooltip activeCharIndex={index} containerRef={containerRef} />
      )}
      {char === ' ' ? ' ' : char === '\n' ? '↵\n' : char}
    </motion.span>
  );
});

const IndicatorTooltip = ({ activeCharIndex, containerRef }) => {
  const tooltipRef = useRef(null);
  const arrowRef = useRef(null);

  useLayoutEffect(() => {
    if (!tooltipRef.current || !arrowRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const activeChar = container.querySelector(`[data-char-index="${activeCharIndex}"]`);
    if (!activeChar) return;

    const containerRect = container.getBoundingClientRect();
    const charRect = activeChar.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const charCenterX = charRect.left + (charRect.width / 2);
    const halfTooltip = tooltipRect.width / 2;

    let tooltipShift = 0;
    
    // We want the tooltip to stay at least 4px inside the container's left edge
    // And at least 12px inside the right edge (to account for the native scrollbar width!)
    const safeRightEdge = containerRect.left + container.clientWidth - 12;

    if (charCenterX - halfTooltip < containerRect.left + 4) {
      const desiredLeft = containerRect.left + 4;
      tooltipShift = desiredLeft - (charCenterX - halfTooltip);
    } else if (charCenterX + halfTooltip > safeRightEdge) {
      const desiredRight = safeRightEdge;
      tooltipShift = desiredRight - (charCenterX + halfTooltip);
    }

    // Shift tooltip body to keep it inside the container
    tooltipRef.current.style.transform = `translateX(calc(-50% + ${tooltipShift}px))`;
    
    // Apply exact inverse shift to the arrow so it stays perfectly locked onto the character!
    // We clamp it slightly so the arrow doesn't clip outside the rounded corners of the tooltip box
    const maxArrowShift = halfTooltip - 12;
    let arrowShift = -tooltipShift;
    if (arrowShift > maxArrowShift) arrowShift = maxArrowShift;
    if (arrowShift < -maxArrowShift) arrowShift = -maxArrowShift;
    
    arrowRef.current.style.transform = `translateX(calc(-50% + ${arrowShift}px))`;
  }, [activeCharIndex]);

  return (
    <div 
      ref={tooltipRef}
      style={{ 
        position: 'absolute', 
        bottom: '100%', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        marginBottom: '8px', 
        background: '#3b82f6', 
        color: '#fff', 
        padding: '4px 20px', 
        borderRadius: '4px', 
        fontSize: '13px', 
        lineHeight: '1.2', 
        fontWeight: 'bold', 
        whiteSpace: 'nowrap', 
        zIndex: 10, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)', 
        fontFamily: 'sans-serif',
        pointerEvents: 'none'
      }}
    >
      Start Typing
      <div 
        ref={arrowRef}
        style={{ 
          position: 'absolute', 
          top: '100%', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          borderTop: '4px solid #3b82f6', 
          borderLeft: '4px solid transparent', 
          borderRight: '4px solid transparent' 
        }} 
      />
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
