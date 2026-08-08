import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { ArrowLeft, RotateCcw, ArrowRight } from 'lucide-react';

const AnimatedMeter = ({ value, label, isPercent = false, max = 100, color = 'var(--accent-blue)', delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      delay: delay,
      ease: "easeOut",
      onUpdate(val) {
        setDisplayValue(Math.round(val));
      }
    });
    return () => controls.stop();
  }, [value, delay]);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  // Prevent max from being 0 to avoid Infinity
  const safeMax = Math.max(max, 1);
  const targetOffset = circumference - (value / safeMax) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
          {/* Animated progress circle */}
          <motion.circle 
            cx="80" 
            cy="80" 
            r={radius} 
            fill="none" 
            stroke={color} 
            strokeWidth="8" 
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: targetOffset }}
            transition={{ duration: 1.5, delay: delay, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1 }}>
            {displayValue}{isPercent ? '%' : ''}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};

const LessonResults = ({ stats, onNext, onPrev, onRestart, hasNext, hasPrev }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', width: '100%' }}
    >
      <h2 style={{ fontSize: '32px', margin: '0 0 60px', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', fontWeight: 'bold' }}>Lesson Complete</h2>
      
      <div style={{ display: 'flex', gap: '80px', marginBottom: '80px' }}>
        <AnimatedMeter value={stats.accuracy} label="accuracy" isPercent={true} max={100} color="var(--success)" delay={0.1} />
        {/* Make max WPM dynamically scale based on user speed, fallback to 60 as standard max */}
        <AnimatedMeter value={stats.wpm} label="WPM" isPercent={false} max={Math.max(stats.wpm, 60)} color="var(--accent-blue)" delay={0.3} />
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={onPrev} 
          disabled={!hasPrev}
          className="glass-button"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', opacity: hasPrev ? 1 : 0.5, cursor: hasPrev ? 'pointer' : 'not-allowed', fontSize: '16px' }}
        >
          <ArrowLeft size={20} /> Previous
        </button>
        <button 
          onClick={onRestart} 
          className="glass-button"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', fontSize: '16px' }}
        >
          <RotateCcw size={20} /> Restart
        </button>
        <button 
          onClick={onNext} 
          disabled={!hasNext}
          className="glass-button"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', opacity: hasNext ? 1 : 0.5, cursor: hasNext ? 'pointer' : 'not-allowed', fontSize: '16px', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)' }}
        >
          Next <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default LessonResults;
