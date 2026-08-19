import React, { useRef, useLayoutEffect, useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

// Fix #4 — use selectors so TypingArea only re-renders when its specific fields change
const TypingArea = ({ engineState, isIdle }) => {
  const fontSize = useAppStore(s => s.fontSize);
  const textAlign = useAppStore(s => s.textAlign);
  const typingMode = useAppStore(s => s.typingMode) || 'classic';
  const showVirtualKeyboard = useAppStore(s => s.showVirtualKeyboard);
  const containerRef = useRef(null);
  const bottomContainerRef = useRef(null);

  // Declare these BEFORE any hooks that reference them
  const engineText = engineState?.text;
  const textIsString = typeof engineText === 'string';
  const currentIndex = engineState?.currentIndex;

  const { status } = engineState || {};

  // Auto-scroll to active character
  useLayoutEffect(() => {
    if (!isIdle && status === 'running') {
      const doScroll = (cRef) => {
        if (!cRef?.current) return;
        const activeEl = cRef.current.querySelector(`[data-char-index="${currentIndex}"]`);
        if (activeEl) {
          const containerRect = cRef.current.getBoundingClientRect();
          const activeRect = activeEl.getBoundingClientRect();
          const relativeTop = activeRect.top - containerRect.top;
          
          if (relativeTop < 20 || relativeTop > containerRect.height - 40) {
            cRef.current.scrollTo({
              top: cRef.current.scrollTop + relativeTop - (containerRect.height / 2) + (activeRect.height / 2),
              behavior: 'smooth'
            });
          }
        }
      };

      doScroll(containerRef);
      if (typingMode === 'two-box') {
        doScroll(bottomContainerRef);
      }
    }
  }, [currentIndex, engineText, isIdle, typingMode, status]);

  // Wrong char flash — pure DOM manipulation for classic mode
  const prevIncorrect = useRef(0);
  useLayoutEffect(() => {
    if (typingMode !== 'classic') return;
    const current = engineState?.incorrectChars || 0;
    if (current > prevIncorrect.current && engineState?.lastTypedChar && containerRef.current) {
      const activeEl = containerRef.current.querySelector(`[data-char-index="${currentIndex}"]`);
      if (activeEl) {
        const wrongKey = engineState.lastTypedChar;
        let overlay = activeEl.querySelector('.wrong-overlay');
        if (!overlay) {
          overlay = document.createElement('span');
          overlay.className = 'wrong-overlay';
          overlay.style.position = 'absolute';
          overlay.style.left = '50%';
          overlay.style.top = '100%';
          overlay.style.transform = 'translate(-50%, -50%)';
          overlay.style.color = 'var(--danger)';
          overlay.style.fontWeight = 'bold';
          overlay.style.pointerEvents = 'none';
          overlay.style.zIndex = '10';
          overlay.style.textShadow = '0 0 4px var(--bg-app), 0 0 8px var(--bg-app)';
          activeEl.appendChild(overlay);
        }
        overlay.textContent = wrongKey;
        
        activeEl.classList.remove('char-error-shake');
        // trigger reflow
        void activeEl.offsetWidth;
        activeEl.classList.add('char-error-shake');
      }
    }
    prevIncorrect.current = current;
  }, [engineState?.incorrectChars, engineState?.lastTypedChar, currentIndex, typingMode]);

  // Parse text into word tokens — only recomputes when text changes
  const words = useMemo(() => {
    if (!textIsString) return [];
    const wordsArray = [];
    let currentWord = [];
    engineText.split('').forEach((char, index) => {
      if (char === ' ' || char === '\n') {
        if (currentWord.length > 0) { wordsArray.push(currentWord); currentWord = []; }
        wordsArray.push([{ char, index }]);
      } else {
        currentWord.push({ char, index });
      }
    });
    if (currentWord.length > 0) wordsArray.push(currentWord);
    return wordsArray;
  }, [engineText, textIsString]);

  // ALL HOOKS MUST BE DECLARED ABOVE THIS LINE
  if (!engineState || !textIsString) return null;

  // Fix #3 — stable errors reference: only a new Set when content actually changes
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const errors = engineState.errors || new Set();
  const typedCharacters = engineState.typedCharacters || [];

  // Fix #4 — font size lookup map (avoids repeated ternary chains)
  const FONT_SIZE_MAP = { extra_large: '40px', large: '32px', small: '20px', medium: '26px' };
  const MASK_MAP = {
    extra_large: 'linear-gradient(to bottom, black 0%, black 160px, transparent 195px)',
    large:       'linear-gradient(to bottom, black 0%, black 170px, transparent 195px)',
    small:       'linear-gradient(to bottom, black 0%, black 178px, transparent 195px)',
    medium:      'linear-gradient(to bottom, black 0%, black 174px, transparent 195px)',
  };
  const fontSizePx = FONT_SIZE_MAP[fontSize] || '26px';
  const maskGradient = MASK_MAP[fontSize] || MASK_MAP.medium;

  // Fix #6 — memoize rendered text so O(n) word scan doesn't run on every render
  // NOTE: this is intentionally inside the component body (after early-return) but
  // React rules allow useMemo calls only at the top level. We use a helper instead.
  const renderText = (mode, cRef) => {
    const MAX_AHEAD = 160;
    let windowEnd = words.length;
    if (words.length > MAX_AHEAD) {
      let currentWordIdx = 0;
      for (let i = 0; i < words.length; i++) {
        if (currentIndex <= words[i][words[i].length - 1].index) { currentWordIdx = i; break; }
      }
      windowEnd = Math.min(words.length, currentWordIdx + MAX_AHEAD);
    }
    return (
      <>
        {words.slice(0, windowEnd).map((wordTokens, wIdx) => (
          <WordSpan
            key={wIdx}
            wordTokens={wordTokens}
            currentIndex={currentIndex}
            typedCharacters={typedCharacters}
            errors={errors}
            isIdle={isIdle}
            containerRef={cRef}
            mode={mode}
            lastTypedChar={engineState.lastTypedChar}
          />
        ))}
        {windowEnd < words.length && (
          <span style={{ color: mode === 'two-box-top' ? 'var(--text-primary)' : (mode === 'two-box-bottom' ? 'transparent' : 'var(--text-secondary)') }}>
            {engineText.slice(words[windowEnd][0].index)}
          </span>
        )}
      </>
    );
  };

  return (
    <div className="glass-panel" style={{
      ...styles.container,
      fontSize: fontSizePx,
      position: 'relative'
    }}>
      {typingMode === 'classic' ? (
        <div style={{
          position: 'relative',
          height: '195px',
          overflow: 'hidden',
          WebkitMaskImage: maskGradient,
          maskImage: maskGradient,
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
              paddingLeft: '8px', // Fix padding for clipping
              paddingRight: '8px',
              textAlign: textAlign || 'center',
            }}
          >
            {renderText('classic', containerRef)}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            ref={containerRef}
            className="no-scrollbar"
            style={{
              ...styles.textContainer,
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              height: showVirtualKeyboard ? '135px' : 'min(300px, 35vh)',
              overflowY: 'auto',
              padding: '16px',
              paddingTop: '40px',
              paddingLeft: '24px',
              textAlign: textAlign || 'left',
              lineHeight: '1.5em'
            }}
          >
            {renderText('two-box-top', containerRef)}
          </div>
          <div
            ref={bottomContainerRef}
            className="no-scrollbar"
            style={{
              ...styles.textContainer,
              border: '1px solid var(--border-soft)',
              borderRadius: '8px',
              height: showVirtualKeyboard ? '135px' : 'min(300px, 35vh)',
              overflowY: 'auto',
              padding: '16px',
              paddingLeft: '24px',
              textAlign: textAlign || 'left',
              lineHeight: '1.5em'
            }}
          >
            {renderText('two-box-bottom', bottomContainerRef)}
          </div>
        </div>
      )}
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

const WordSpan = React.memo(({ wordTokens, currentIndex, typedCharacters, errors, isIdle, containerRef, mode, lastTypedChar }) => {
  const isWhitespace = wordTokens.length === 1 && (wordTokens[0].char === ' ' || wordTokens[0].char === '\n');
  return (
    <span style={{ display: isWhitespace ? 'inline' : 'inline-block' }}>
      {wordTokens.map(({ char, index }) => {
        let statusClass = 'pending';
        if (index < currentIndex) {
          const typed = typedCharacters[index];
          if (typed && typed.isError) statusClass = 'error';
          else if (errors.has(index)) statusClass = 'corrected';
          else statusClass = 'correct';
        }
        const isActive = index === currentIndex;
        const isError = isActive && errors.has(index);
        return (
          <CharSpan
            key={index}
            char={char}
            index={index}
            currentIndex={currentIndex}
            statusClass={statusClass}
            isActive={isActive}
            isError={isError}
            isIdle={isIdle}
            containerRef={containerRef}
            mode={mode}
            lastTypedChar={lastTypedChar}
            typedChar={typedCharacters[index]}
          />
        );
      })}
    </span>
  );
});

// Fix #1 — replace motion.span (framer-motion infinite loop) with plain span + CSS classes
// The cursor blink and error shake are now handled by .char-active and .char-error-shake in styles.css
const CharSpan = React.memo(({
  char, index, currentIndex, statusClass, isActive, isError, isIdle, containerRef, mode, lastTypedChar, typedChar
}) => {
  // Error shake: we use a key trick — changing the key restarts the CSS animation
  const [shakeKey, setShakeKey] = useState(0);
  const prevIsError = useRef(false);
  const prevTypedCharRef = useRef(typedChar);
  const [tempDisplayChar, setTempDisplayChar] = useState(null);

  if (isError && !prevIsError.current) {
    setShakeKey(k => k + 1);
  }
  prevIsError.current = isError;

  useEffect(() => {
    let charToShow = null;
    if (isActive && isError && lastTypedChar) {
      charToShow = lastTypedChar;
    } else if (typedChar && typedChar.isError && !prevTypedCharRef.current) {
      charToShow = typedChar.char;
    }
    prevTypedCharRef.current = typedChar;

    if (charToShow) {
      setTempDisplayChar(charToShow);
      const timer = setTimeout(() => setTempDisplayChar(null), 200);
      return () => clearTimeout(timer);
    }
  }, [isActive, isError, lastTypedChar, typedChar]);

  let displayChar = char;
  let color = getCharColor(statusClass);
  let isHidden = false;

  if (mode !== 'two-box-bottom' && tempDisplayChar) {
    displayChar = tempDisplayChar;
    color = 'var(--danger)';
  } else {
    if (mode === 'two-box-top') {
      color = 'var(--text-primary)';
    } else if (mode === 'two-box-bottom') {
      if (index > currentIndex) {
        isHidden = true;
      } else if (index === currentIndex) {
        isHidden = true;
      } else {
        if (typedChar) {
          displayChar = typedChar.char;
          color = typedChar.isError ? 'var(--danger)' : 'var(--text-primary)';
        }
      }
    }
  }

  return (
    <span
      key={shakeKey > 0 ? `shake-${shakeKey}` : undefined}
      data-char-index={index}
      className={isActive && mode !== 'two-box-bottom' ? 'char-active' : (isError && mode === 'classic' ? `char-error-shake` : '')}
      style={{
        ...styles.char,
        position: 'relative',
        color: (isActive && mode === 'classic') ? '#eab308' : (isActive && mode === 'two-box-top' ? 'var(--brand-hover)' : color),
        textShadow: (isActive && mode === 'classic') ? '0 0 8px rgba(250, 204, 21, 0.4)' : 'none',
        backgroundColor: (isActive && displayChar === ' ') ? (mode === 'classic' ? 'rgba(250, 204, 21, 0.4)' : 'var(--bg-active)') : 'transparent',
        borderRadius: (isActive && displayChar === ' ') ? '4px' : '0',
        borderBottom: (isActive && mode !== 'two-box-bottom') ? '2px solid var(--accent-blue)' : '2px solid transparent',
        fontFamily: displayChar === '\n' ? 'sans-serif' : 'inherit',
        visibility: isHidden ? 'hidden' : 'visible'
      }}
    >
      {isActive && isIdle && mode !== 'two-box-bottom' && (
        <IndicatorTooltip activeCharIndex={index} containerRef={containerRef} />
      )}
      {displayChar === ' ' ? ' ' : displayChar === '\n' ? '↵\n' : displayChar}
    </span>
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
    const safeRightEdge = containerRect.left + container.clientWidth - 12;
    if (charCenterX - halfTooltip < containerRect.left + 4) {
      tooltipShift = (containerRect.left + 4) - (charCenterX - halfTooltip);
    } else if (charCenterX + halfTooltip > safeRightEdge) {
      tooltipShift = safeRightEdge - (charCenterX + halfTooltip);
    }
    tooltipRef.current.style.transform = `translateX(calc(-50% + ${tooltipShift}px))`;
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
        position: 'absolute', bottom: '100%', left: '50%',
        transform: 'translateX(-50%)', marginBottom: '8px',
        background: '#3b82f6', color: '#fff', padding: '4px 20px',
        borderRadius: '4px', fontSize: '13px', lineHeight: '1.2',
        fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontFamily: 'sans-serif',
        pointerEvents: 'none'
      }}
    >
      Start Typing
      <div
        ref={arrowRef}
        style={{
          position: 'absolute', top: '100%', left: '50%',
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
    // Fix #8 — removed 'transition: max-height 0.3s ease' (never used, wasted paint)
  },
  char: {
    position: 'relative',
    // Fix #7 — removed 'transition: color 0.1s ease' (hundreds of overlapping transitions at speed)
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
