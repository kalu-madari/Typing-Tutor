import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const VirtualKeyboard = ({ layout, engineState }) => {
  const { showVirtualKeyboard, highlightFingers } = useAppStore();

  if (!showVirtualKeyboard || !layout.keyboardMap) return null;

  const nextChar = engineState?.status !== 'finished' ? engineState?.text[engineState?.currentIndex] : null;
  const expectedKeys = nextChar ? layout.getExpectedKeys(nextChar) : [];

  const getFingerColor = (finger) => {
    if (!highlightFingers) return 'var(--bg-tertiary)';
    switch(finger) {
      case 'left-pinky': return 'rgba(255, 99, 132, 0.2)'; // light red
      case 'left-ring': return 'rgba(255, 159, 64, 0.2)'; // orange
      case 'left-middle': return 'rgba(255, 205, 86, 0.2)'; // yellow
      case 'left-index': return 'rgba(75, 192, 192, 0.2)'; // teal
      case 'right-index': return 'rgba(54, 162, 235, 0.2)'; // blue
      case 'right-middle': return 'rgba(153, 102, 255, 0.2)'; // purple
      case 'right-ring': return 'rgba(201, 203, 207, 0.2)'; // grey
      case 'right-pinky': return 'rgba(255, 99, 255, 0.2)'; // pink
      default: return 'var(--bg-tertiary)';
    }
  };

  return (
    <div className="virtual-keyboard glass" style={styles.container}>
      {layout.keyboardMap.map((row, rowIndex) => (
        <div key={rowIndex} style={styles.row}>
          {row.map((keyObj) => {
            const isExpected = expectedKeys.includes(keyObj.key);
            
            return (
              <motion.div
                key={keyObj.key}
                style={{
                  ...styles.key,
                  backgroundColor: getFingerColor(keyObj.finger),
                  borderColor: isExpected ? 'var(--accent-blue)' : 'var(--glass-border)',
                  boxShadow: isExpected ? '0 0 10px var(--accent-blue)' : 'none',
                }}
                animate={{
                  scale: isExpected ? 1.05 : 1,
                  y: isExpected ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <span style={styles.keyLabelPrimary}>{keyObj.display}</span>
                {/* For KrutiDev, showing the english character as secondary label might help beginners */}
                <span style={styles.keyLabelSecondary}>{keyObj.key.toUpperCase()}</span>
              </motion.div>
            );
          })}
        </div>
      ))}
      <div style={styles.row}>
        {/* Spacebar */}
        <motion.div
          style={{
            ...styles.key,
            width: '400px',
            backgroundColor: highlightFingers ? 'rgba(75, 192, 192, 0.1)' : 'var(--bg-tertiary)',
            borderColor: expectedKeys.includes(' ') ? 'var(--accent-blue)' : 'var(--glass-border)',
            boxShadow: expectedKeys.includes(' ') ? '0 0 10px var(--accent-blue)' : 'none',
          }}
          animate={{ scale: expectedKeys.includes(' ') ? 1.02 : 1 }}
        >
          <span style={{...styles.keyLabelPrimary, fontFamily: 'var(--font-ui)', fontSize: '24px'}}>␣</span>
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center',
    marginTop: '30px'
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
    fontFamily: 'var(--font-typing)',
    fontSize: '18px',
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
