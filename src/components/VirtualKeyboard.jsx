import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { altCodesMap } from '../core/altCodesMap';

const VirtualKeyboard = ({ layout, engineState, altCodeState = "" }) => {
  const storeState = useAppStore();
  const { showVirtualKeyboard, highlightFingers } = storeState;

  // (Early return moved below hooks)
  const [isShiftActive, setIsShiftActive] = React.useState(false);
  const [isCapsActive, setIsCapsActive] = React.useState(false);
  const prevIndex = React.useRef(engineState?.currentIndex || 0);
  const prevWrong = React.useRef(engineState?.incorrectChars || 0);
  const [animationEvent, setAnimationEvent] = React.useState({ type: 'none', id: 0 });

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') setIsShiftActive(true);
      if (e.getModifierState) setIsCapsActive(e.getModifierState('CapsLock'));
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setIsShiftActive(false);
      if (e.getModifierState) setIsCapsActive(e.getModifierState('CapsLock'));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  React.useEffect(() => {
    const currentWrong = engineState?.incorrectChars || 0;
    const currentIndex = engineState?.currentIndex || 0;
    
    if (currentWrong > prevWrong.current) {
      setAnimationEvent(prev => ({ type: 'shake', id: prev.id + 1 }));
    } else if (currentIndex !== prevIndex.current) {
      setAnimationEvent(prev => ({ type: 'pulse', id: prev.id + 1 }));
    }
    
    prevIndex.current = currentIndex;
    prevWrong.current = currentWrong;
  }, [engineState?.currentIndex, engineState?.incorrectChars]);

  React.useEffect(() => {
    if (animationEvent.type !== 'none') {
      const timer = setTimeout(() => {
        setAnimationEvent(prev => ({ ...prev, type: 'none' }));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [animationEvent.type, animationEvent.id]);

  if (!layout.keyboardMap || !showVirtualKeyboard) return null;

  const nextChar = engineState?.status !== 'finished' ? engineState?.text[engineState?.currentIndex] : null;
  let expectedKeys = nextChar ? layout.getExpectedKeys(nextChar) : [];
  
  // Custom highlight logic for Alt codes (Kruti Dev special characters)
  if (nextChar && altCodesMap[nextChar]) {
    const sequence = altCodesMap[nextChar];
    const expectedStr = sequence.slice(2).map(k => k.replace('Numpad', '')).join(''); // e.g. "0161"
    
    let typedLength = 0;
    if (altCodeState) {
      // Find how many correct digits they typed before making a mistake
      while (typedLength < altCodeState.length && expectedStr[typedLength] === altCodeState[typedLength]) {
        typedLength++;
      }
    }
    
    // Always highlight Alt
    expectedKeys = [...expectedKeys, 'AltLeft', 'AltRight'];
    
    // Highlight the next required number (offset by 2 because AltLeft/AltRight are at index 0 and 1)
    if (typedLength + 2 < sequence.length) {
      expectedKeys.push(sequence[typedLength + 2]);
    }
  }

  const requiresShift = expectedKeys.includes('ShiftLeft') || expectedKeys.includes('ShiftRight');

  // (Hooks moved up)
  // (useEffect moved up)

  const showShiftDisplay = (keyObj) => {
    if (!keyObj.shiftDisplay) return false;
    const isLetter = /^[a-z]$/i.test(keyObj.key);
    if (isLetter) {
      return isShiftActive !== isCapsActive;
    }
    return isShiftActive;
  };

  const getFingerColor = (finger, isExpected) => {
    if (!highlightFingers) return 'var(--bg-tertiary)';
    const opacity = isExpected ? '0.6' : '0.15';
    switch(finger) {
      case 'left-pinky': return `rgba(255, 99, 132, ${opacity})`;
      case 'left-ring': return `rgba(255, 159, 64, ${opacity})`;
      case 'left-middle': return `rgba(255, 205, 86, ${opacity})`;
      case 'left-index': return `rgba(75, 192, 192, ${opacity})`;
      case 'right-index': return `rgba(54, 162, 235, ${opacity})`;
      case 'right-middle': return `rgba(153, 102, 255, ${opacity})`;
      case 'right-ring': return `rgba(201, 203, 207, ${opacity})`;
      case 'right-pinky': return `rgba(255, 99, 255, ${opacity})`;
      case 'left-thumb':
      case 'right-thumb':
      case 'thumb': return `rgba(75, 192, 192, ${opacity})`; // Same teal as index
      default: return 'var(--bg-tertiary)';
    }
  };

  const renderKey = (keyObj) => {
    let isExpected = false;
    
    if (expectedKeys.includes(keyObj.key)) {
      if (keyObj.key === 'ShiftLeft' || keyObj.key === 'ShiftRight') {
        isExpected = true;
      } else {
        if (!requiresShift && isShiftActive) {
          isExpected = false;
        } else if (requiresShift && !isShiftActive) {
          isExpected = false;
        } else {
          isExpected = true;
        }
      }
    }

    const animationKey = isExpected ? `${keyObj.key}-active-${animationEvent.id}` : keyObj.key;
    
    if (keyObj.noBg) {
      return <div key={animationKey} style={{ width: keyObj.width }}></div>;
    }

    return (
      <motion.div
        key={animationKey}
        initial={isExpected ? { 
          scale: animationEvent.type === 'shake' ? 1.05 : 0.95, 
          backgroundColor: getFingerColor(keyObj.finger, false) 
        } : false}
        style={{
          ...styles.key,
          width: keyObj.gridArea ? '100%' : (keyObj.width || styles.key.minWidth),
          height: keyObj.gridArea ? '100%' : (keyObj.height || '46px'),
          gridArea: keyObj.gridArea || 'auto',
          borderColor: isExpected ? 'var(--accent-blue)' : 'var(--glass-border)',
          boxShadow: isExpected ? '0 0 10px var(--accent-blue)' : 'none',
        }}
        animate={{
          scale: isExpected ? 1.05 : 1,
          y: isExpected ? -2 : 0,
          x: (isExpected && animationEvent.type === 'shake') ? [0, 10, -10, 6, -6, 0] : 0,
          backgroundColor: (isExpected && animationEvent.type === 'shake') 
            ? ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.8)', getFingerColor(keyObj.finger, true)] 
            : getFingerColor(keyObj.finger, isExpected),
        }}
        transition={{ 
          type: 'spring', stiffness: 400, damping: 25,
          x: { type: 'keyframes', duration: 0.4 },
          backgroundColor: { type: 'keyframes', duration: 0.4 }
        }}
      >
        <span style={{ 
          ...styles.keyLabelPrimary, 
          fontSize: keyObj.isNumpad ? '16px' : styles.keyLabelPrimary.fontSize,
          ...((keyObj.key.length > 1 || keyObj.isNumpad) ? { fontFamily: 'var(--font-ui)' } : {}),
          ...(keyObj.labelStyle || {}) 
        }}>{showShiftDisplay(keyObj) ? keyObj.shiftDisplay : keyObj.display}</span>
        {keyObj.shiftDisplay && keyObj.key.length === 1 && keyObj.key !== ' ' && (
          <span style={styles.keyLabelSecondary}>
            {showShiftDisplay(keyObj) ? keyObj.shiftDisplay : keyObj.display}
          </span>
        )}
      </motion.div>
    );
  };

  return (
    <div className="virtual-keyboard glass" style={styles.container}>
      <div style={styles.mainKeyboard}>
        {layout.keyboardMap.map((row, rowIndex) => (
          <div key={rowIndex} style={styles.row}>
            {row.map(renderKey)}
          </div>
        ))}
      </div>
      
      {layout.numpadKeys && (
        <div style={styles.numpad}>
          {layout.numpadKeys.map(k => renderKey({ ...k, isNumpad: true }))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'row',
    gap: '40px',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: '-30px',
    width: '100%',
    maxWidth: '1000px'
  },
  mainKeyboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  numpad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 46px)',
    gridTemplateRows: 'repeat(5, 46px)',
    gap: '8px',
  },
  row: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
  },
  key: {
    position: 'relative',
    minWidth: '40px',
    height: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: '1px solid',
    color: 'var(--text-primary)',
  },
  keyLabelPrimary: {
    fontFamily: '"Kruti Dev 010", sans-serif',
    fontSize: '22px',
  },
  keyLabelSecondary: {
    position: 'absolute',
    top: '2px',
    right: '4px',
    fontSize: '9px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-ui)',
  }
};

export default VirtualKeyboard;
