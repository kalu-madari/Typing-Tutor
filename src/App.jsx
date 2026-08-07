import React, { useState } from 'react';
import { useTypingEngine } from './hooks/useTypingEngine';
import { krutidev010Layout } from './core/layouts/krutidev010';
import { getAllLessons, getLessonById, getNextLesson, getChapters } from './core/lessonEngine';
import TypingArea from './components/TypingArea';
import VirtualKeyboard from './components/VirtualKeyboard';

function App() {
  const allLessons = getAllLessons();
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const currentLesson = allLessons[currentLessonIndex];
  const [engineKey, setEngineKey] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  const startLesson = (lesson) => {
    setCurrentLessonIndex(allLessons.findIndex(l => l.id === lesson.id));
    setCurrentView('session');
    setEngineKey(prev => prev + 1);
    
    // Reset scroll immediately before render
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const hasPrev = currentLessonIndex > 0;
  const hasNext = currentLessonIndex < allLessons.length - 1;

  const goPrev = () => hasPrev && startLesson(allLessons[currentLessonIndex - 1]);
  const goNext = () => hasNext && startLesson(allLessons[currentLessonIndex + 1]);
  const doRestart = () => setEngineKey(prev => prev + 1);

  const handleLessonComplete = (id) => {
    setCompletedLessons(prev => new Set(prev).add(id));
  };

  return (
    <div id="app-container">
      {currentView !== 'session' && (
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      )}

      <main id="main-content">
        {currentView === 'dashboard' && <DashboardView setCurrentView={setCurrentView} onStart={startLesson} currentLesson={currentLesson} completedLessons={completedLessons} allLessons={allLessons} />}
        {currentView === 'lessons' && <LessonsView lessons={allLessons} onStart={startLesson} completedLessons={completedLessons} />}
        {currentView === 'session' && (
          <section id="view-lesson-detail" className="view active" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="view-header" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 20px' }}>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                <button className="btn btn-secondary" onClick={() => setCurrentView('lessons')}>← Library</button>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '28px' }}>{currentLesson.title}</h1>
                <p className="view-subtitle" style={{ margin: '4px 0 0', padding: 0 }}>{currentLesson.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setEngineKey(prev => prev + 1)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Restart
                </button>
              </div>
            </div>
            <TypingSession 
              key={engineKey} 
              lesson={currentLesson} 
              onComplete={handleLessonComplete}
              onNext={goNext}
              onPrev={goPrev}
              onRestart={doRestart}
              hasNext={hasNext}
              hasPrev={hasPrev}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', marginTop: '150px', borderTop: '1px solid var(--border-soft)' }}>
              <button className="btn btn-secondary" onClick={goPrev} disabled={!hasPrev} style={{ opacity: hasPrev ? 1 : 0.5 }}>← Previous</button>
              <button className="btn btn-primary" onClick={goNext} disabled={!hasNext} style={{ opacity: hasNext ? 1 : 0.5 }}>Next →</button>
            </div>
          </section>
        )}
        {currentView === 'practice' && <PracticeView />}
        {currentView === 'bookmarks' && <BookmarksView />}
        {currentView === 'achievements' && <AchievementsView />}
        {currentView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

const Sidebar = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
    { id: 'lessons', label: 'Lessons', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> },
    { id: 'practice', label: 'Practice', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
    { id: 'bookmarks', label: 'Bookmarks', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> },
    { id: 'achievements', label: 'Achievements', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg> },
    { id: 'settings', label: 'Settings', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> }
  ];

  return (
    <nav id="sidebar">
      <div className="sidebar-profile">
        <div className="profile-avatar">
          <span className="avatar-text">KM</span>
          <div className="avatar-ring"></div>
        </div>
        <div className="profile-info">
          <span className="profile-name">KrutiMaster</span>
          <span className="profile-level" id="user-level">Learner</span>
        </div>
      </div>

      <div className="sidebar-search">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" id="search-input" placeholder="Search..." autoComplete="off" />
      </div>

      <ul className="nav-menu" id="nav-menu">
        {navItems.map(item => (
          <li 
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const DashboardView = ({ setCurrentView, onStart, currentLesson, completedLessons, allLessons }) => {
  const chapters = getChapters();
  
  const totalLessons = allLessons.length;
  const globalProgress = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;
  
  return (
  <section id="view-dashboard" className="view active">
    <div className="view-header">
      <h1>Welcome back! 👋</h1>
      <p className="view-subtitle">Continue your KrutiDev journey</p>
    </div>

    <div className="stats-grid" id="dashboard-stats">
      <div className="stat-card glass-card">
        <div className="stat-card-icon" style={{'--accent': '#818cf8'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></div>
        <div className="stat-card-value" id="stat-lessons-done">{completedLessons.size}</div>
        <div className="stat-card-label">Lessons Completed</div>
        <div className="stat-card-bar"><div className="stat-bar-fill" id="stat-bar-lessons" style={{width: `${globalProgress}%`}}></div></div>
      </div>
      <div className="stat-card glass-card">
        <div className="stat-card-icon" style={{'--accent': '#34d399'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
        <div className="stat-card-value" id="stat-exercises-done">0</div>
        <div className="stat-card-label">Avg WPM</div>
        <div className="stat-card-bar"><div className="stat-bar-fill" id="stat-bar-exercises" style={{'--bar-color': '#34d399', width: '0%'}}></div></div>
      </div>
      <div className="stat-card glass-card">
        <div className="stat-card-icon" style={{'--accent': '#fbbf24'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg></div>
        <div className="stat-card-value" id="stat-streak">0</div>
        <div className="stat-card-label">Day Streak</div>
        <div className="stat-card-bar"><div className="stat-bar-fill" id="stat-bar-streak" style={{'--bar-color': '#fbbf24', width: '0%'}}></div></div>
      </div>
      <div className="stat-card glass-card">
        <div className="stat-card-icon" style={{'--accent': '#f472b6'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg></div>
        <div className="stat-card-value" id="stat-achievements">0</div>
        <div className="stat-card-label">Achievements</div>
        <div className="stat-card-bar"><div className="stat-bar-fill" id="stat-bar-achievements" style={{'--bar-color': '#f472b6', width: '0%'}}></div></div>
      </div>
    </div>

    <div className="section-block">
      <h2 className="section-title">Continue Learning</h2>
      <div className="continue-card glass-card" id="continue-card">
        <div className="continue-info">
          <span className="continue-chapter" id="continue-chapter">Chapter 1</span>
          <h3 className="continue-title" id="continue-title">{currentLesson?.title || "Home Row"}</h3>
          <p className="continue-desc" id="continue-desc">{currentLesson?.description || "Build muscle memory for the KrutiDev keyboard layout."}</p>
        </div>
        <button className="btn btn-primary btn-glow" id="continue-btn" onClick={() => onStart(currentLesson)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Continue
        </button>
      </div>
    </div>

    <div className="section-block">
      <h2 className="section-title">Chapter Progress</h2>
      <div className="chapter-progress-grid" id="chapter-progress-grid">
        {chapters.map(chapter => {
          const chCompleted = chapter.lessons.filter(l => completedLessons.has(l.id)).length;
          const pct = chapter.lessons.length > 0 ? Math.round((chCompleted / chapter.lessons.length) * 100) : 0;
          return (
            <div key={chapter.id} className="chapter-progress-card glass-card" style={{opacity: pct === 0 ? 0.6 : 1}}>
              <div className="progress-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="progress-card-title" style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Chapter {chapter.id}</span>
                <span className="progress-card-pct" style={{ fontWeight: 'bold', color: 'var(--brand)' }}>{pct}%</span>
              </div>
              <div className="progress-card-name">{chapter.title}</div>
              <div className="chapter-progress-bar"><div className="chapter-progress-fill" style={{width: `${pct}%`, backgroundColor: pct === 100 ? 'var(--success)' : 'var(--brand)', transition: 'width 0.3s ease'}}></div></div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
  );
};

const LessonsView = ({ lessons, onStart, completedLessons }) => {
  const [expandedChapter, setExpandedChapter] = useState(null);
  
  const chapters = getChapters();
  
  return (
    <section id="view-lessons" className="view active">
      <div className="view-header">
        <h1 style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{color: 'var(--brand)'}}>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          Lesson Library
        </h1>
        <p className="view-subtitle">Master KrutiDev step by step</p>
      </div>

      <div className="chapters-list stagger-children">
        {chapters.map(chapter => {
          const isExpanded = expandedChapter === chapter.id;
          const chCompleted = chapter.lessons.filter(l => completedLessons.has(l.id)).length;
          const progress = chapter.lessons.length > 0 ? Math.round((chCompleted / chapter.lessons.length) * 100) : 0;
          const isChapterComplete = progress === 100;
          
          return (
            <div key={chapter.id} className={`chapter-card glass-card ${isChapterComplete ? 'chapter-completed' : (progress > 0 || chapter.id === 1 ? 'chapter-in-progress' : '')} ${isExpanded ? 'expanded' : ''}`}>
              <div className="chapter-header" onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}>
                <div className={`chapter-badge ${isChapterComplete ? 'badge-completed' : 'badge-active'}`}>
                  {isChapterComplete ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ) : (
                    chapter.id
                  )}
                </div>
                <div className="chapter-header-info">
                  <div className="chapter-header-title">Chapter {chapter.id}: {chapter.title}</div>
                  <div className="chapter-header-desc">{chapter.description}</div>
                  <div className="chapter-header-meta">
                    <span className="chapter-meta-badge" style={{whiteSpace: 'nowrap'}}>{chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? 's' : ''}</span>
                    <div style={{display:'flex', alignItems:'center', gap:'8px', width:'100%', maxWidth:'200px', marginTop:'10px'}}>
                      <div className="chapter-progress-bar" style={{flex:1, height:'4px', background:'var(--bg-inset)', borderRadius:'2px', overflow:'hidden'}}>
                        <div className="chapter-progress-fill" style={{height:'100%', borderRadius:'2px', width:`${progress}%`, background: isChapterComplete ? 'var(--success)' : 'var(--brand)', transition: 'width 0.3s ease'}}></div>
                      </div>
                      <span style={{fontSize:'12px', color: isChapterComplete ? 'var(--success)' : 'var(--text-muted)', fontWeight:'600'}}>{progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="chapter-expand-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
              
              <div className="chapter-lessons">
                {chapter.lessons.map(lesson => {
                  const isCompleted = completedLessons.has(lesson.id);
                  return (
                  <div key={lesson.id} className={`lesson-item ${isCompleted ? 'completed' : ''}`}>
                    <div className="lesson-icon" style={{ color: isCompleted ? 'var(--success)' : 'inherit' }}>
                      {isCompleted ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      )}
                    </div>
                    <div className="lesson-info" style={{ flex: 1 }}>
                      <div className="lesson-item-title" style={{ fontSize: '17.5px' }}>{lesson.title}</div>
                      <div className="lesson-desc" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{lesson.description}</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onStart(lesson); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '2px' }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </button>
                  </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const PracticeView = () => (
  <section className="view active">
    <div className="view-header">
      <h1>Practice Mode</h1>
      <p className="view-subtitle">Sharpen your skills</p>
    </div>
  </section>
);

const BookmarksView = () => (
  <section className="view active">
    <div className="view-header">
      <h1>Bookmarks</h1>
      <p className="view-subtitle">Your saved lessons</p>
    </div>
  </section>
);

const AchievementsView = () => (
  <section className="view active">
    <div className="view-header">
      <h1>Achievements</h1>
      <p className="view-subtitle">Track your milestones</p>
    </div>
  </section>
);

const SettingsView = () => (
  <section className="view active">
    <div className="view-header">
      <h1>Settings</h1>
      <p className="view-subtitle">Customize your experience</p>
    </div>
  </section>
);

const TypingSession = ({ lesson, onComplete, onNext, onPrev, onRestart, hasNext, hasPrev }) => {
  const { engineState, stats } = useTypingEngine(lesson.text, krutidev010Layout);

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
  const strokeColor = acc >= 96 ? 'var(--success)' : acc >= 90 ? 'var(--warning)' : 'var(--error)';
  const strokeDasharray = 283;
  const strokeDashoffset = isFinished ? 283 - (283 * acc) / 100 : 283;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-start', marginTop: '20px', position: 'relative', width: '100%', padding: '0 20px' }}>
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

      <div className="stats-grid" style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="stat-card glass-card" style={{ padding: '20px' }}>
          <div className="stat-card-label" style={{ marginBottom: '8px' }}>WPM</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{stats.wpm}</div>
        </div>
        <div className="stat-card glass-card" style={{ padding: '20px' }}>
          <div className="stat-card-label" style={{ marginBottom: '8px' }}>Accuracy</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{stats.accuracy}%</div>
        </div>
        <div className="stat-card glass-card" style={{ padding: '20px' }}>
          <div className="stat-card-label" style={{ marginBottom: '8px' }}>Time</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{stats.timeInSeconds}s</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '712px', gap: '20px' }}>
        <TypingArea engineState={engineState} />
        <VirtualKeyboard layout={krutidev010Layout} engineState={engineState} />
      </div>

      <div></div>
    </div>
  );
};

export default App;
