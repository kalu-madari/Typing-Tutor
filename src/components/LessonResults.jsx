import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { ArrowLeft, RotateCcw, ArrowRight } from 'lucide-react';

// Generates the tick marks for the inner ring
const CircularTicks = ({ radius, count, progress, isSpeed = false }) => {
  const ticks = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * 360) / count;
    const isFilled = (i / count) <= progress;
    // Speed has a red/pink section for the first few ticks in the image, but we'll stick to a clean white/grey fill
    const color = isFilled ? '#ffffff' : 'rgba(255, 255, 255, 0.2)';
    
    ticks.push(
      <line
        key={i}
        x1="0"
        y1={-radius + 15} // Inner edge of the thick ring
        x2="0"
        y2={-radius + 5}  // Outer edge of the thick ring
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(${angle})`}
      />
    );
  }
  return <g transform="translate(100, 100)">{ticks}</g>;
};

// Accuracy and Speed share the large gauge design
const LargeGauge = ({ value, label, subLabel, sideLabel, sideLabelPos, max, delay, unit = '', color }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const safeValue = value || 0;
    const safeMax = Math.max(max || 1, 1);
    const targetProgress = Math.min(safeValue / safeMax, 1);
    
    const controls = animate(0, safeValue, {
      duration: 1.5,
      delay: delay || 0,
      ease: "easeOut",
      onUpdate(val) {
        setDisplayValue(Math.round(val));
        setProgress(val / safeMax);
      }
    });
    return () => controls.stop();
  }, [value, delay, max]);

  const size = 200;
  const center = size / 2;
  const outerRadius = 90;
  const innerRingRadius = 75;
  const circumference = 2 * Math.PI * outerRadius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      {/* Side Label */}
      {sideLabel && (
        <div style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          [sideLabelPos]: '-80px',
          textAlign: sideLabelPos === 'left' ? 'right' : 'left',
          width: '80px',
          opacity: 0,
          animation: `fadeIn 0.5s ease-out ${delay + 1.5}s forwards`
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{sideLabel.value}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.2 }}>{sideLabel.text}</div>
          {/* Decorative line connecting to the circle */}
          <div style={{
            position: 'absolute',
            top: '50%',
            [sideLabelPos === 'left' ? 'right' : 'left']: '-20px',
            width: '15px',
            height: '2px',
            background: 'var(--text-muted)',
            opacity: 0.5
          }} />
        </div>
      )}

      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Inner dark circle background */}
          <circle cx={center} cy={center} r={innerRingRadius} fill="rgba(30, 41, 59, 0.8)" />
          
          {/* Thick blue inner ring */}
          <circle cx={center} cy={center} r={innerRingRadius} fill="none" stroke="#2563eb" strokeWidth="20" opacity="0.3" />
          
          {/* Ticks inside the blue ring */}
          <CircularTicks radius={innerRingRadius} count={40} progress={progress} />

          {/* Outer Yellow Progress Ring Background */}
          <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="rgba(234, 179, 8, 0.1)" strokeWidth="6" />

          {/* Animated Outer Progress Ring */}
          <motion.circle 
            cx={center} 
            cy={center} 
            r={outerRadius} 
            fill="none" 
            stroke={color || "#eab308"} 
            strokeWidth="6" 
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.5, delay: delay, ease: "easeOut" }}
            style={{ strokeDasharray: circumference, transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
          />
        </svg>

        {/* Center Text */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ffffff', lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {displayValue}{unit}
          </div>
          {subLabel && (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              {subLabel}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginTop: '15px' }}>
        {label}
      </div>
    </div>
  );
};

// Duration shares a similar inner ring but has a different outer border and is smaller
const DurationGauge = ({ seconds, delay }) => {
  const [displaySeconds, setDisplaySeconds] = useState(0);

  useEffect(() => {
    const safeSeconds = seconds || 0;
    const controls = animate(0, safeSeconds, {
      duration: 1.5,
      delay: delay || 0,
      ease: "easeOut",
      onUpdate(val) {
        setDisplaySeconds(Math.round(val));
      }
    });
    return () => controls.stop();
  }, [seconds, delay]);

  const size = 160;
  const center = size / 2;
  const innerRingRadius = 60;
  const outerRadius = 75;

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Inner dark circle background */}
          <circle cx={center} cy={center} r={innerRingRadius} fill="rgba(30, 41, 59, 0.8)" />
          
          {/* Thick blue inner ring */}
          <circle cx={center} cy={center} r={innerRingRadius} fill="none" stroke="#2563eb" strokeWidth="15" opacity="0.3" />
          
          {/* Ticks inside the blue ring */}
          {/* For duration, we just fill it completely based on time? The reference image has a filled track */}
          <g transform={`translate(${center}, ${center})`}>
             {Array.from({length: 24}).map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={-innerRingRadius + 10}
                  x2="0"
                  y2={-innerRingRadius + 4}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  transform={`rotate(${(i * 360) / 24})`}
                  opacity={displaySeconds > 0 ? 1 : 0.2}
                />
             ))}
          </g>

        </svg>

        {/* Center Text */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff', lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {formatTime(displaySeconds)}
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
            min : seconds
          </div>
        </div>
      </div>
      
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginTop: '15px' }}>
        Duration
      </div>
    </div>
  );
};

const getAccuracyColor = (acc) => {
  if (acc >= 98) return '#16a34a';
  if (acc >= 90) return '#4ade80';
  if (acc >= 80) return '#fde047';
  if (acc >= 70) return '#eab308';
  if (acc >= 60) return '#f87171';
  if (acc >= 40) return '#ef4444';
  return '#b91c1c';
};

const getWPMColor = (wpm) => {
  if (wpm >= 40) return '#16a34a';
  if (wpm >= 30) return '#4ade80';
  if (wpm >= 20) return '#fde047';
  if (wpm >= 15) return '#eab308';
  if (wpm >= 10) return '#f87171';
  return '#ef4444';
};

const LessonResults = ({ stats, onNext, onPrev, onRestart, hasNext, hasPrev }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', width: '100%', minHeight: '600px' }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-50%) translateX(10px); }
          to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
        .glass-button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }
        .glass-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          color: #ffffff;
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '80px', marginTop: '40px' }}>
        {/* Accuracy Gauge (Left) */}
        <LargeGauge 
          value={stats.accuracy} 
          label="Accuracy" 
          subLabel="real accuracy"
          unit="%"
          max={100} 
          delay={0.1}
          color={getAccuracyColor(stats.accuracy)}
          sideLabel={{ value: '80%', text: 'minimum accuracy' }}
          sideLabelPos="left"
        />
        
        {/* Duration Gauge (Center) */}
        <DurationGauge 
          seconds={stats.timeInSeconds || 0}
          delay={0.4}
        />

        {/* Speed Gauge (Right) */}
        <LargeGauge 
          value={stats.wpm} 
          label="Speed"
          subLabel="wpm" 
          max={Math.max(stats.wpm, 60)} 
          delay={0.7}
          color={getWPMColor(stats.wpm)}
          sideLabel={{ value: '15 wpm', text: 'Requirement: 15 wpm' }}
          sideLabelPos="right"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 2.0 }}
        style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <button 
          onClick={onPrev} 
          disabled={!hasPrev}
          className="glass-button"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', opacity: hasPrev ? 1 : 0.5, cursor: hasPrev ? 'pointer' : 'not-allowed' }}
        >
          <ArrowLeft size={18} /> Previous
        </button>
        <button 
          onClick={onRestart} 
          className="glass-button"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px' }}
        >
          <RotateCcw size={18} /> Restart
        </button>
        <button 
          onClick={onNext} 
          disabled={!hasNext}
          className="glass-button"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', opacity: hasNext ? 1 : 0.5, cursor: hasNext ? 'pointer' : 'not-allowed' }}
        >
          Next <ArrowRight size={18} />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default LessonResults;
