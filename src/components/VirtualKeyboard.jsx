import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const VirtualKeyboard = ({ layout, engineState }) => {
  const { showVirtualKeyboard, highlightFingers } = useAppStore();

  if (!showVirtualKeyboard || !layout.keyboardMap) return null;

  const [isShiftActive, setIsShiftActive] = React.useState(false);
  const [isCapsActive, setIsCapsActive] = React.useState(false);

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

  const nextChar = engineState?.status !== 'finished' ? engineState?.text[engineState?.currentIndex] : null;
  let expectedKeys = nextChar ? layout.getExpectedKeys(nextChar) : [];
  
  // Custom highlight logic for Alt codes (Kruti Dev special characters)
  const altCodes = {
    '¡': ['AltLeft', 'AltRight', '0', '1', '6', '1'],
    '¿': ['AltLeft', 'AltRight', '0', '1', '9', '1'],
    'Ø': ['AltLeft', 'AltRight', '0', '2', '1', '6'],
    'Ý': ['AltLeft', 'AltRight', '0', '2', '2', '1'],
    'Å': ['AltLeft', 'AltRight', '0', '1', '9', '7'],
    'â': ['AltLeft', 'AltRight', '0', '2', '2', '6'],
  };
  
  if (nextChar && altCodes[nextChar]) {
    expectedKeys = [...expectedKeys, ...altCodes[nextChar]];
  }

  const requiresShift = expectedKeys.includes('ShiftLeft') || expectedKeys.includes('ShiftRight');

  const prevIndex = React.useRef(engineState?.currentIndex || 0);
  const prevWrong = React.useRef(engineState?.incorrectChars || 0);
  const [animationEvent, setAnimationEvent] = React.useState({ type: 'none', id: 0 });

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

  return (
    <div className="virtual-keyboard glass" style={styles.container}>
      {layout.keyboardMap.map((row, rowIndex) => (
        <div key={rowIndex} style={styles.row}>
          {row.map((keyObj) => {
            let isExpected = false;
            
            if (expectedKeys.includes(keyObj.key)) {
              if (keyObj.key === 'ShiftLeft' || keyObj.key === 'ShiftRight') {
                isExpected = true; // Always highlight required shift
              } else if (requiresShift) {
                isExpected = isShiftActive; // Highlight base key only if shift is held down
              } else {
                isExpected = true;
              }
            }

            const animationKey = isExpected ? `${keyObj.key}-active-${animationEvent.id}` : keyObj.key;
            
            return (
              <motion.div
                key={animationKey}
                initial={isExpected ? { 
                  scale: animationEvent.type === 'shake' ? 1.05 : 0.95, 
                  backgroundColor: getFingerColor(keyObj.finger, false) 
                } : false}
                style={{
                  ...styles.key,
                  width: keyObj.width || styles.key.minWidth,
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
                  ...(keyObj.key.length > 1 ? { fontFamily: 'var(--font-ui)' } : {}),
                  ...(keyObj.labelStyle || {}) 
                }}>{showShiftDisplay(keyObj) ? keyObj.shiftDisplay : keyObj.display}</span>
                {keyObj.shiftDisplay && keyObj.key.length === 1 && keyObj.key !== ' ' && (
                  <span style={styles.keyLabelSecondary}>
                    {showShiftDisplay(keyObj) ? keyObj.shiftDisplay : keyObj.display}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px 0',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center',
    marginTop: '30px',
    width: '100%',
    maxWidth: '712px'
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
