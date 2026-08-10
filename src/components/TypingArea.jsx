import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const TypingArea = ({ engineState, isIdle }) => {
  const store = useAppStore();
  const { fontSize, textAlign } = store;
  const containerRef = useRef(null);

  // Declare these BEFORE any hooks that reference them
  const engineText = engineState?.text;
  const textIsString = typeof engineText === 'string';
  const currentIndex = engineState?.currentIndex;

  useLayoutEffect(() => {
    if (!engineText) return;
    // Only check scroll if we just typed a space/newline (word boundary),
    // or if we are at the beginning, or if idle (so tooltip can position).
    const prevChar = currentIndex > 0 ? engineText[currentIndex - 1] : null;
    const isBoundary = currentIndex === 0 || prevChar === ' ' || prevChar === '\n' || isIdle;
    
    if (!isBoundary) return;

    // Wait one frame to ensure React commits, layout calculates, and fonts stabilize
    requestAnimationFrame(() => {
      if (!containerRef.current || currentIndex === undefined) return;
      
      const container = containerRef.current;
      const activeElement = container.querySelector(`[data-char-index="${currentIndex}"]`);
      
      if (!activeElement) return;
      
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      
      // Protect against Chromium layout glitches
      if (activeRect.top === 0 && activeRect.bottom === 0) return;
      
      const activeTop = activeRect.top;
      const activeBottom = activeRect.bottom;
      const visibleTop = containerRect.top;
      const visibleBottom = containerRect.bottom;
      
      const TOP_PADDING = 35;
      const BOTTOM_PADDING = 35;
      
      if (activeTop < visibleTop + TOP_PADDING) {
        container.scrollTop -= (visibleTop + TOP_PADDING) - activeTop;
      } else if (activeBottom > visibleBottom - BOTTOM_PADDING) {
        container.scrollTop += activeBottom - (visibleBottom - BOTTOM_PADDING);
      }
    });
  }, [currentIndex, engineText, isIdle]);

  // Parse text into words only when the text changes to save CPU cycles
  const words = React.useMemo(() => {
    if (!textIsString) return [];
    const wordsArray = [];
    let currentWord = [];
    
    engineText.split('').forEach((char, index) => {
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
  }, [engineText, textIsString]);

  // ALL HOOKS MUST BE DECLARED ABOVE THIS LINE
  if (!engineState || !textIsString) return null;

  const { text, status } = engineState;
  const errors = engineState.errors || new Set();
  const typedCharacters = engineState.typedCharacters || [];

  const renderText = () => {
    // Virtualization: If text is huge, only render active components for a small window.
    // The rest is rendered as raw strings so layout and scroll height remain perfect!
    const MAX_WORDS = 150;
    let windowStart = 0;
    let windowEnd = words.length;

    if (words.length > MAX_WORDS) {
      // Find the current word index
      let currentWordIdx = 0;
      for (let i = 0; i < words.length; i++) {
        if (currentIndex <= words[i][words[i].length - 1].index) {
          currentWordIdx = i;
          break;
        }
      }
      
      windowStart = Math.max(0, currentWordIdx - 30);
      windowEnd = Math.min(words.length, windowStart + MAX_WORDS);
      
      // Keep the window stable at the end
      if (windowEnd === words.length) {
        windowStart = Math.max(0, words.length - MAX_WORDS);
      }
    }

    const renderWords = words.slice(windowStart, windowEnd);

    return (
      <>
        {windowStart > 0 && (
          <span style={{ color: 'var(--text-secondary)' }}>
            {engineText.slice(0, words[windowStart][0].index)}
          </span>
        )}
        {renderWords.map((wordTokens, localIdx) => {
          const wIdx = windowStart + localIdx;
          return (
            <WordSpan 
              key={wIdx}
              wordTokens={wordTokens}
              currentIndex={currentIndex}
              typedCharacters={typedCharacters}
              errors={errors}
              isIdle={isIdle}
              containerRef={containerRef}
            />
          );
        })}
        {windowEnd < words.length && (
          <span style={{ color: 'var(--text-secondary)' }}>
            {engineText.slice(words[windowEnd][0].index)}
          </span>
        )}
      </>
    );
  };



  return (
    <div className="glass-panel" style={{ 
      ...styles.container,
      fontSize: fontSize === 'extra_large' ? '40px' : fontSize === 'large' ? '32px' : fontSize === 'small' ? '20px' : '26px',
      position: 'relative'
    }}>
      {/* Wrapper with mask — clips the VISIBLE 195px viewport, not the scroll content */}
      <div style={{
        position: 'relative',
        height: '195px',
        overflow: 'hidden',
        // Fade only the bottom N lines of upcoming text. All typed text above is fully visible.
        // extra_large=2 lines (120px), large=3 lines (144px), medium=4 lines (156px), small=5 lines (150px)
        WebkitMaskImage: fontSize === 'extra_large'
          ? 'linear-gradient(to bottom, black 0%, black 160px, transparent 195px)'
          : fontSize === 'large'
          ? 'linear-gradient(to bottom, black 0%, black 170px, transparent 195px)'
          : fontSize === 'small'
          ? 'linear-gradient(to bottom, black 0%, black 178px, transparent 195px)'
          : 'linear-gradient(to bottom, black 0%, black 174px, transparent 195px)',
        maskImage: fontSize === 'extra_large'
          ? 'linear-gradient(to bottom, black 0%, black 160px, transparent 195px)'
          : fontSize === 'large'
          ? 'linear-gradient(to bottom, black 0%, black 170px, transparent 195px)'
          : fontSize === 'small'
          ? 'linear-gradient(to bottom, black 0%, black 178px, transparent 195px)'
          : 'linear-gradient(to bottom, black 0%, black 174px, transparent 195px)',
      }}>
        <div 
          ref={containerRef} 
          className="no-scrollbar" 
          style={{
            ...styles.textContainer,
            height: '195px',
            lineHeight: '1.5em',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '4px',
            paddingTop: '45px',
            textAlign: textAlign || 'center',
          }}
        >
          {renderText()}
        </div>
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

const WordSpan = React.memo(({ wordTokens, currentIndex, typedCharacters, errors, isIdle, containerRef }) => {
  const isWhitespace = wordTokens.length === 1 && (wordTokens[0].char === ' ' || wordTokens[0].char === '\n');
  
  return (
    <span style={{ display: isWhitespace ? 'inline' : 'inline-block' }}>
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
}, (prevProps, nextProps) => {
  // If the lesson restarts, we must re-render everything
  if (prevProps.typedCharacters.length > 0 && nextProps.typedCharacters.length === 0) return false;

  const wordStart = prevProps.wordTokens[0].index;
  const wordEnd = prevProps.wordTokens[prevProps.wordTokens.length - 1].index;

  // We only re-render the word if the cursor was in it previously OR is in it currently.
  const isCurrentlyActive = nextProps.currentIndex >= wordStart && nextProps.currentIndex <= wordEnd + 1;
  const wasPreviouslyActive = prevProps.currentIndex >= wordStart && prevProps.currentIndex <= wordEnd + 1;

  if (isCurrentlyActive || wasPreviouslyActive) return false;

  // Also check if we skipped/backspaced across this word in one frame
  const minCursor = Math.min(prevProps.currentIndex, nextProps.currentIndex);
  const maxCursor = Math.max(prevProps.currentIndex, nextProps.currentIndex);
  if (wordStart >= minCursor && wordEnd <= maxCursor) return false;

  return true; // No need to re-render
});

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
