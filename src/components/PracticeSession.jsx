import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, X, CheckCircle, XCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

/**
 * KDPH (Key Depressions Per Hour) formula used in HC exams:
 *   Net KDPH = (Net correct keystrokes / time in minutes) * 60
 *   Obtained Marks = (maxMarks / maxKdph) * netKdph
 *   where maxKdph = 8000 when maxMarks = 20 (standard HC scale)
 *
 * Pass condition: obtainedMarks >= passingMarks
 */
const calcKdph = (correctChars, timeInMinutes) => {
  if (timeInMinutes <= 0) return 0;
  return Math.round((correctChars / timeInMinutes) * 60);
};

const calcObtainedMarks = (kdph, maxMarks, maxKdph) => {
  // (maxMarks / maxKdph) × netKdph  — capped at maxMarks
  const marks = (maxMarks / maxKdph) * kdph;
  return Math.min(maxMarks, Math.round(marks * 100) / 100);
};

const PracticeSession = ({ lesson, onClose }) => {
  const store = useAppStore();

  // ── Config from exercise metadata ──────────────────────────────────
  const timeLimitMinutes = lesson.timeLimitMinutes ?? 10;
  const PRACTICE_TIME_LIMIT = timeLimitMinutes * 60;
  const maxMarks      = lesson.maxMarks      ?? 20;
  const passingMarks  = lesson.passingMarks  ?? 10;
  // The "full speed" KDPH that maps to maxMarks (HC standard: 8000 KDPH = 20 marks)
  const maxKdph       = (maxMarks / 20) * 8000;

  // ── State ──────────────────────────────────────────────────────────
  const [typedText, setTypedText] = useState('');
  const [timeLeft,  setTimeLeft]  = useState(PRACTICE_TIME_LIMIT);
  const [status,    setStatus]    = useState('idle'); // idle | running | finished
  const [results,   setResults]   = useState(null);
  const textareaRef = useRef(null);

  // ── Timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'running') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); finishTest(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Finish test ────────────────────────────────────────────────────
  const finishTest = () => {
    setStatus('finished');

    const refWords  = lesson.text.trim().split(/\s+/);
    const userWords = typedText.trim().split(/\s+/).filter(w => w.length > 0);

    // ── Word stats ──
    let correctWords = 0, wrongWords = 0;
    for (let i = 0; i < userWords.length; i++) {
      if (userWords[i] === refWords[i]) correctWords++;
      else wrongWords++;
    }
    const skippedWords = Math.max(0, refWords.length - userWords.length);

    // ── Char stats ──
    const refChars  = lesson.text.split('');
    const userChars = typedText.split('');
    let correctChars = 0, wrongChars = 0;
    for (let i = 0; i < userChars.length; i++) {
      if (userChars[i] === refChars[i]) correctChars++;
      else wrongChars++;
    }
    const skippedChars = Math.max(0, refChars.length - userChars.length);

    // ── Timing ──
    const timeUsedSec = PRACTICE_TIME_LIMIT - timeLeft;
    const timeUsedMin = Math.max(timeUsedSec / 60, 0.01);

    // ── WPM (for reference) ──
    const wpm = Math.round((correctChars / 5) / timeUsedMin);

    // ── HC Marks formula ──
    const netKdph       = calcKdph(correctChars, timeUsedMin);
    const obtainedMarks = calcObtainedMarks(netKdph, maxMarks, maxKdph);
    const passed        = obtainedMarks >= passingMarks;

    setResults({
      wpm,
      correctWords, wrongWords, skippedWords,
      totalTypedWords: userWords.length,
      correctChars, wrongChars, skippedChars,
      totalTypedChars: userChars.length,
      timeUsedSec,
      netKdph,
      maxMarks,
      passingMarks,
      obtainedMarks,
      passed,
    });
  };

  // ── Input handlers ─────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
    }
    if (status === 'idle' && e.key.length === 1) {
      setStatus('running');
    }
  };

  const handleChange = (e) => {
    if (status === 'finished') return;
    setTypedText(e.target.value);
    if (e.target.value.length >= lesson.text.length) {
      finishTest();
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────
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

  // ══════════════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ══════════════════════════════════════════════════════════════════
  if (status === 'finished' && results) {
    const marksColor = results.passed ? 'var(--success)' : 'var(--danger)';

    return (
      <div className="fade-in" style={{ padding: '24px', maxWidth: '860px', margin: '0 auto', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Practice Results</h2>
          <button className="icon-btn-plain" onClick={onClose}><X size={24} /></button>
        </div>

        {/* ── Pass / Fail banner ── */}
        <div className="glass-panel" style={{ padding: '28px 32px', textAlign: 'center', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: marksColor }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '10px' }}>
            {results.passed
              ? <CheckCircle size={44} style={{ color: 'var(--success)' }} />
              : <XCircle    size={44} style={{ color: 'var(--danger)'  }} />}
            <h1 style={{ margin: 0, fontSize: '32px', color: marksColor }}>
              {results.passed ? 'TEST PASSED' : 'TEST FAILED'}
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Requirement: passing marks ≥ {results.passingMarks} / {results.maxMarks}
          </p>
        </div>

        {/* ── Marks card ── */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--brand)', marginBottom: '16px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>
            HC Exam Marks  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Formula: Max Marks / 8000 × Net KDPH)</span>
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Max Marks</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{results.maxMarks}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Passing Marks</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{results.passingMarks}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Obtained Marks</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: marksColor }}>{results.obtainedMarks.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Net KDPH</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{results.netKdph}</div>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          {/* Performance */}
          <div className="glass-panel" style={{ padding: '18px' }}>
            <h3 style={{ color: 'var(--brand)', marginBottom: '14px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>Performance</h3>
            <Row label="Speed" value={`${results.wpm} WPM`} />
            <Row label="Net KDPH" value={results.netKdph} />
            <Row label="Time Used" value={formatTime(results.timeUsedSec)} />
          </div>

          {/* Words */}
          <div className="glass-panel" style={{ padding: '18px' }}>
            <h3 style={{ color: 'var(--brand)', marginBottom: '14px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>
              Words ({results.totalTypedWords}/{lesson.text.trim().split(/\s+/).length})
            </h3>
            <Row label="Correct"               value={results.correctWords}  color="var(--success)" />
            <Row label="Wrong"                 value={results.wrongWords}    color="var(--danger)"  />
            <Row label="Skipped / Unattempted" value={results.skippedWords}  color="var(--text-muted)" />
          </div>

          {/* Letters - full width */}
          <div className="glass-panel" style={{ padding: '18px', gridColumn: '1 / -1' }}>
            <h3 style={{ color: 'var(--brand)', marginBottom: '14px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>
              Letters ({results.totalTypedChars}/{lesson.text.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <Row label="Correct"               value={results.correctChars}  color="var(--success)" />
              <Row label="Wrong"                 value={results.wrongChars}    color="var(--danger)"  />
              <Row label="Skipped / Unattempted" value={results.skippedChars}  color="var(--text-muted)" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleRestart}>
            <RotateCcw size={16} /> Try Again
          </button>
          <button className="btn btn-primary btn-glow" onClick={handleSubmit}>
            <CheckCircle size={16} /> Save &amp; Submit Result
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // TYPING SCREEN
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="practice-session fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{lesson.title}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Strict Mode · No Backspace · Pass: {passingMarks}/{maxMarks} marks
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 'bold',
            color: timeLeft <= 60 ? 'var(--danger)' : 'var(--text-primary)',
            background: 'var(--bg-elevated)', padding: '6px 14px', borderRadius: '6px'
          }}>
            {formatTime(timeLeft)}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleRestart} title="Restart">
            <RotateCcw size={16} />
          </button>
          <button className="icon-btn-plain" onClick={onClose} title="Exit">
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Split screen */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px', minHeight: 0 }}>
        {/* TOP: Reference text */}
        <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '24px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 8, right: 12, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Reference Text
          </div>
          <div style={{ fontFamily: 'KrutiDev', fontSize: '28px', lineHeight: '1.9', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {lesson.text}
          </div>
        </div>

        {/* BOTTOM: User input */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 8, right: 12, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 10 }}>
            Your Typing {status === 'idle' && <span style={{ color: 'var(--brand)' }}>· Start typing to begin timer</span>}
          </div>
          <textarea
            ref={textareaRef}
            value={typedText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
            disabled={status === 'finished'}
            autoFocus
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            placeholder=""
            style={{
              flex: 1, width: '100%', resize: 'none', border: 'none', background: 'transparent',
              padding: '28px 24px', fontFamily: 'KrutiDev', fontSize: '28px', lineHeight: '1.9',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Small helper row component ─────────────────────────────────────
const Row = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{label}</span>
    <span style={{ fontWeight: 'bold', color: color || 'var(--text-primary)', fontSize: '15px' }}>{value}</span>
  </div>
);

export default PracticeSession;
