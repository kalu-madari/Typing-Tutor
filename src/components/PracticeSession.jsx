import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, X, CheckCircle, XCircle } from 'lucide-react';
import { calculateWPM, calculateAccuracy } from '../core/statistics';
import { useAppStore } from '../store/useAppStore';

const PRACTICE_TIME_LIMIT = 600; // 10 minutes
const PASS_MIN_WPM = 60;
const PASS_MIN_ACCURACY = 95;

const PracticeSession = ({ lesson, onClose }) => {
  const store = useAppStore();
  const [typedText, setTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(PRACTICE_TIME_LIMIT);
  const [status, setStatus] = useState('idle'); // idle, running, finished
  const [results, setResults] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (status === 'running') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, typedText]); // Include typedText to calculate on timeout

  const finishTest = () => {
    setStatus('finished');
    
    const refWords = lesson.text.trim().split(/\s+/);
    const userWords = typedText.trim().split(/\s+/).filter(w => w.length > 0);
    
    let correctWords = 0;
    let wrongWords = 0;
    for (let i = 0; i < userWords.length; i++) {
      if (userWords[i] === refWords[i]) correctWords++;
      else wrongWords++;
    }
    const skippedWords = Math.max(0, refWords.length - userWords.length);

    const refChars = lesson.text.split('');
    const userChars = typedText.split('');
    let correctChars = 0;
    let wrongChars = 0;
    for (let i = 0; i < userChars.length; i++) {
      if (userChars[i] === refChars[i]) correctChars++;
      else wrongChars++;
    }
    const skippedChars = Math.max(0, refChars.length - userChars.length);

    const timeInSeconds = PRACTICE_TIME_LIMIT - timeLeft;
    const wpm = calculateWPM(correctChars, timeInSeconds || 1);
    const accuracy = calculateAccuracy(correctChars, userChars.length);
    
    const passed = wpm >= PASS_MIN_WPM && accuracy >= PASS_MIN_ACCURACY;

    setResults({
      wpm,
      accuracy,
      correctWords,
      wrongWords,
      skippedWords,
      totalTypedWords: userWords.length,
      correctChars,
      wrongChars,
      skippedChars,
      totalTypedChars: userChars.length,
      timeInSeconds,
      passed
    });
  };

  const handleKeyDown = (e) => {
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault(); // Strict: no backspace
    }
    if (status === 'idle' && e.key.length === 1) {
      setStatus('running');
    }
  };

  const handleChange = (e) => {
    if (status === 'finished') return;
    setTypedText(e.target.value);
    
    // Check if they finished the text early
    if (e.target.value.length >= lesson.text.length) {
      finishTest();
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRestart = () => {
    setTypedText('');
    setTimeLeft(PRACTICE_TIME_LIMIT);
    setStatus('idle');
    setResults(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSubmit = () => {
    if (results) {
      store.savePracticeResult(lesson.id, results);
    }
    onClose();
  };

  if (status === 'finished' && results) {
    return (
      <div className="practice-results-screen fade-in" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Practice Results</h2>
          <button className="icon-btn-plain" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: results.passed ? 'var(--success)' : 'var(--danger)' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
            {results.passed ? (
              <CheckCircle size={48} style={{ color: 'var(--success)' }} />
            ) : (
              <XCircle size={48} style={{ color: 'var(--danger)' }} />
            )}
            <h1 style={{ margin: 0, fontSize: '36px', color: results.passed ? 'var(--success)' : 'var(--danger)' }}>
              {results.passed ? 'TEST PASSED' : 'TEST FAILED'}
            </h1>
          </div>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
            Requirement: {PASS_MIN_WPM} WPM & {PASS_MIN_ACCURACY}% Accuracy
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--brand)', marginBottom: '16px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>Performance</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Speed</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{results.wpm} WPM</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Accuracy</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{results.accuracy}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Time</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{formatTime(results.timeInSeconds)}</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--brand)', marginBottom: '16px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>Words ({results.totalTypedWords}/{lesson.text.trim().split(/\s+/).length})</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Typed</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{results.totalTypedWords}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Wrong</span>
              <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>{results.wrongWords}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Skipped / Unattempted</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>{results.skippedWords}</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', gridColumn: '1 / -1' }}>
            <h3 style={{ color: 'var(--brand)', marginBottom: '16px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>Letters ({results.totalTypedChars}/{lesson.text.length})</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Correct</span>
              <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{results.correctChars}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Wrong</span>
              <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>{results.wrongChars}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Skipped / Unattempted</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>{results.skippedChars}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleRestart}>
            <RotateCcw size={16} /> Try Again
          </button>
          <button className="btn btn-primary btn-glow" onClick={handleSubmit}>
            <CheckCircle size={16} /> Save & Submit Result
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-session fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
      <div className="session-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Practice: {lesson.title}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Strict Mode • No Backspace • 60 WPM Min</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 'bold', 
            color: timeLeft <= 60 ? 'var(--danger)' : 'var(--text-primary)',
            background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: '6px'
          }}>
            {formatTime(timeLeft)}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleRestart} title="Restart Practice">
            <RotateCcw size={16} />
          </button>
          <button className="icon-btn-plain" onClick={onClose} title="Exit Practice">
            <X size={24} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '20px', minHeight: 0 }}>
        {/* TOP HALF: Reference Text */}
        <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '24px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 8, right: 12, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Reference Text
          </div>
          <div style={{ fontFamily: 'KrutiDev', fontSize: '28px', lineHeight: '1.8', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {lesson.text}
          </div>
        </div>

        {/* BOTTOM HALF: User Input */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 8, right: 12, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 10 }}>
            Your Typing
          </div>
          <textarea
            ref={textareaRef}
            value={typedText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()} // prevent clicking to move cursor
            disabled={status === 'finished'}
            autoFocus
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            placeholder={status === 'idle' ? 'Start typing here...' : ''}
            style={{ 
              flex: 1, width: '100%', resize: 'none', border: 'none', background: 'transparent',
              padding: '24px', fontFamily: 'KrutiDev', fontSize: '28px', lineHeight: '1.8', 
              color: 'var(--text-primary)', outline: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PracticeSession;
