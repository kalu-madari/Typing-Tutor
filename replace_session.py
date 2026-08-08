with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_typing_session = """const TypingSession = ({ lesson, onComplete, onNext, onPrev, onRestart, hasNext, hasPrev, onClose }) => {
  const { engineState, stats, altCodeState } = useTypingEngine(lesson.text, krutidev010Layout);
  const storeState = useAppStore();
  
  const [soundMenuOpen, setSoundMenuOpen] = React.useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  React.useEffect(() => {
    if (engineState?.status === 'finished') {
      onComplete(lesson.id);
    }
  }, [engineState?.status, lesson.id, onComplete]);

  const isFinished = engineState?.status === 'finished';

  React.useEffect(() => {
    if (isFinished && hasNext) {
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onNext();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFinished, hasNext, onNext]);

  const acc = stats.accuracy;
  const getAccuracyColor = (acc) => {
    if (acc >= 98) return '#16a34a'; // Extreme green
    if (acc >= 90) return '#4ade80'; // Light green
    if (acc >= 80) return '#fde047'; // Light yellow
    if (acc >= 70) return '#eab308'; // Yellow
    if (acc >= 60) return '#f87171'; // Light red
    if (acc >= 40) return '#ef4444'; // Normal red
    return '#b91c1c';                // Extreme red
  };
  const strokeColor = getAccuracyColor(acc);
  const strokeDasharray = 283;
  const visualAcc = Math.max(acc, 2); 
  const strokeDashoffset = isFinished ? 283 - (283 * visualAcc) / 100 : 283;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <div style={{ height: '60px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="icon-btn-plain" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
            <Menu size={20} />
          </button>
          <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500 }}>{lesson.title}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="icon-btn-plain" title="Play/Pause" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
            <Play size={20} />
          </button>
          <button className="icon-btn-plain" title="Restart" onClick={onRestart} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
            <RotateCcw size={20} />
          </button>
          <button className="icon-btn-plain" title="Virtual Keyboard" onClick={() => storeState.updateSetting('showVirtualKeyboard', !storeState.showVirtualKeyboard)} style={{ background: 'transparent', border: 'none', color: storeState.showVirtualKeyboard ? 'var(--accent-blue)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
            <KeyboardIcon size={20} />
          </button>
          <button className="icon-btn-plain" title="Hand Guide" onClick={() => storeState.updateSetting('showHandGuide', !storeState.showHandGuide)} style={{ background: 'transparent', border: 'none', color: storeState.showHandGuide ? 'var(--accent-blue)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
            <Hand size={20} />
          </button>
          
          <div style={{ position: 'relative' }}>
            <button className="icon-btn-plain" onClick={() => { setSoundMenuOpen(!soundMenuOpen); setSettingsMenuOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
              <Volume2 size={20} />
            </button>
            {soundMenuOpen && (
               <div className="glass-card" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', padding: '16px', width: '200px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                 <Switch checked={storeState.soundEffects} onChange={val => storeState.updateSetting('soundEffects', val)} label="Key sounds" />
                 <Switch checked={storeState.errorSounds} onChange={val => storeState.updateSetting('errorSounds', val)} label="Error sounds" />
               </div>
            )}
          </div>
          
          <div style={{ position: 'relative' }}>
            <button className="icon-btn-plain" onClick={() => { setSettingsMenuOpen(!settingsMenuOpen); setSoundMenuOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
              <SettingsIcon size={20} />
            </button>
            {settingsMenuOpen && (
               <div className="glass-card" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', padding: '16px', width: '240px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                 <Switch checked={storeState.allowBackspace} onChange={val => storeState.updateSetting('allowBackspace', val)} label="Backspace" />
                 <Switch checked={storeState.moveOnError} onChange={val => storeState.updateSetting('moveOnError', val)} label="Move on error" />
                 {storeState.moveOnError && (
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                     <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Max errors:</span>
                     <RoundedSelect className="rselect-small" value={storeState.maxErrorsToSkip} onChange={(val) => storeState.updateSetting('maxErrorsToSkip', parseInt(val, 10))} options={[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }]} />
                   </div>
                 )}
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', minHeight: '400px' }} onClick={() => { setSoundMenuOpen(false); setSettingsMenuOpen(false); }}>
        
        {lesson?.type === 'box_practice' ? (
          <BoxExercise engineState={engineState} />
        ) : (
          <div style={{ maxWidth: '800px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <TypingArea engineState={engineState} />
          </div>
        )}
         
        {/* Live Speed + Accuracy inline */}
        {lesson?.type !== 'box_practice' && (
          <div style={{ display: 'flex', gap: '60px', marginTop: '60px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', opacity: 0.7 }}>Speed</span>
                <span style={{ fontSize: '28px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{stats.wpm} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'normal' }}>WPM</span></span>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', opacity: 0.7 }}>Accuracy</span>
                <span style={{ fontSize: '28px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{stats.accuracy}<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 'normal' }}>%</span></span>
             </div>
          </div>
        )}
      </div>
      
      {/* Keyboard Area */}
      {storeState.showVirtualKeyboard && (
        <div style={{ paddingBottom: '40px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
           <VirtualKeyboard layout={krutidev010Layout} engineState={engineState} altCodeState={altCodeState} />
        </div>
      )}

      {/* Completion Modal */}
      {isFinished && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <h2 style={{ fontSize: '32px', margin: '0 0 10px', color: 'var(--text-primary)' }}>Lesson Complete!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Great job. Here's how you did:</p>
            
            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--accent-blue)', lineHeight: 1 }}>{stats.wpm}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px' }}>WPM</div>
              </div>
              
              <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke={strokeColor} strokeWidth="8" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 1s ease-out' }} strokeLinecap="round" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1 }}>{stats.accuracy}%</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Acc</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button className="btn btn-secondary" onClick={onRestart} style={{ flex: 1 }}>Restart</button>
              <button className="btn btn-primary" onClick={onNext} disabled={!hasNext} style={{ flex: 1, opacity: hasNext ? 1 : 0.5 }}>Next Lesson</button>
            </div>
            <button className="btn btn-secondary" onClick={onPrev} disabled={!hasPrev} style={{ width: '100%', marginTop: '10px', opacity: hasPrev ? 1 : 0.5, background: 'transparent' }}>← Previous</button>
          </div>
        </div>
      )}
    </div>
  );
};
"""

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if line.startswith("const TypingSession = "):
        start_idx = i
    if start_idx != -1 and line.startswith("const KeyLogger = "):
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    lines[start_idx:end_idx] = [new_typing_session]
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Replaced TypingSession!")
else:
    print("Could not find bounds", start_idx, end_idx)
