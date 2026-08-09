import React, { useState, useEffect } from 'react';
import { Menu, Play, RotateCcw, Keyboard as KeyboardIcon, Hand, Volume2, Settings as SettingsIcon, Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type } from 'lucide-react';
import { useTypingEngine } from './hooks/useTypingEngine';
import { krutidev010Layout } from './core/layouts/krutidev010';
import { getAllLessons, getLessonById, getNextLesson, getChapters } from './core/lessonEngine';
import TypingArea from './components/TypingArea';
import BoxExercise from './components/BoxExercise';
import LessonResults from './components/LessonResults';
import VirtualKeyboard from './components/VirtualKeyboard';
import { useAppStore } from './store/useAppStore';

function App() {
  const allLessons = getAllLessons();
  const store = useAppStore();
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const currentLesson = allLessons[currentLessonIndex];
  const [engineKey, setEngineKey] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem('krutidev-completed-lessons');
    if (saved) {
      try { return new Set(JSON.parse(saved)); } catch (e) {}
    }
    return new Set();
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', store.theme);
  }, [store.theme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    setCompletedLessons(prev => {
      const newSet = new Set(prev).add(id);
      localStorage.setItem('krutidev-completed-lessons', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  return (
    <div id="app-container">
      {window.location.search.includes('debug=true') && <KeyLogger />}
      {currentView !== 'session' && (
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      )}

      <main id="main-content">
        {currentView === 'dashboard' && <DashboardView setCurrentView={setCurrentView} onStart={startLesson} currentLesson={currentLesson} completedLessons={completedLessons} allLessons={allLessons} />}
        {currentView === 'lessons' && <LessonsView lessons={allLessons} onStart={startLesson} completedLessons={completedLessons} />}
        {currentView === 'session' && (
          <section id="view-lesson-detail" className="view active" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
            <TypingSession 
              key={engineKey} 
              lesson={currentLesson} 
              onComplete={handleLessonComplete}
              onNext={goNext}
              onPrev={goPrev}
              onRestart={doRestart}
              hasNext={hasNext}
              hasPrev={hasPrev}
              onClose={() => setCurrentView('lessons')}
            />
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
                {chapter.lessons.map((lesson, lessonIndex) => {
                  const isCompleted = completedLessons.has(lesson.id);
                  return (
                  <div key={lesson.id} className={`lesson-item ${isCompleted ? 'completed' : ''}`}>
                    <div className="lesson-icon" style={{ color: isCompleted ? 'var(--success)' : 'inherit' }}>
                      {isCompleted ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-soft)', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{lessonIndex + 1}</span>
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

const SettingsView = () => {
  const store = useAppStore();
  
  return (
    <section className="view active">
      <div className="view-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand)' }}>
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          Settings
        </h1>
        <p className="view-subtitle">Customize your experience</p>
      </div>

      <div className="settings-list">
        <div className="setting-group glass-card">
          <h3>Appearance</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Theme</span>
              <span className="setting-desc">Choose your preferred color scheme</span>
            </div>
            <RoundedSelect
              value={store.theme}
              onChange={(val) => store.updateSetting('theme', val)}
              options={[
                { value: 'vscode-dark', label: 'VS Code Dark' },
                { value: 'light', label: 'Light' },
                { value: 'midnight-indigo', label: 'Midnight Indigo' },
                { value: 'nord', label: 'Nord' },
                { value: 'solarized-dark', label: 'Solarized Dark' },
                { value: 'vscode-light', label: 'VS Code Light' }
              ]}
            />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Lesson Text Size</span>
              <span className="setting-desc">Adjust the lesson reading font size</span>
            </div>
            <RoundedSelect
              value={store.fontSize}
              onChange={(val) => store.updateSetting('fontSize', val)}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
                { value: 'extra_large', label: 'Extra Large' }
              ]}
            />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Text Alignment</span>
              <span className="setting-desc">Align lesson text to left, center, or right</span>
            </div>
            <RoundedSelect
              value={store.textAlign}
              onChange={(val) => store.updateSetting('textAlign', val)}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
                { value: 'justify', label: 'Justify' }
              ]}
            />
          </div>
        </div>

        <div className="setting-group glass-card">
          <h3>Typing Engine</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Virtual Keyboard</span>
              <span className="setting-desc">Show on-screen keyboard guidance</span>
            </div>
            <Switch checked={store.showVirtualKeyboard} onChange={(val) => store.updateSetting('showVirtualKeyboard', val)} />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Allow Backspace</span>
              <span className="setting-desc">Allow correcting mistakes using backspace</span>
            </div>
            <Switch checked={store.allowBackspace} onChange={(val) => store.updateSetting('allowBackspace', val)} />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Move On Error</span>
              <span className="setting-desc">Automatically move cursor forward after making a mistake</span>
            </div>
            <Switch checked={store.moveOnError} onChange={(val) => store.updateSetting('moveOnError', val)} />
          </div>
          {store.moveOnError && (
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Max Errors to Skip</span>
                <span className="setting-desc">Number of consecutive errors before skipping character</span>
              </div>
              <RoundedSelect
                value={store.maxErrorsToSkip}
                onChange={(val) => store.updateSetting('maxErrorsToSkip', parseInt(val, 10))}
                options={[
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' }
                ]}
              />
            </div>
          )}
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Block On Error</span>
              <span className="setting-desc">Block typing completely after making multiple mistakes</span>
            </div>
            <Switch checked={store.blockOnError} onChange={(val) => store.updateSetting('blockOnError', val)} />
          </div>
          {store.blockOnError && (
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Max Errors to Block</span>
                <span className="setting-desc">Number of consecutive errors before blocking</span>
              </div>
              <RoundedSelect
                value={store.maxErrorsToBlock}
                onChange={(val) => store.updateSetting('maxErrorsToBlock', parseInt(val, 10))}
                options={[
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 5, label: '5' }
                ]}
              />
            </div>
          )}
        </div>

        <div className="setting-group glass-card">
          <h3>Audio</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Key Sounds</span>
              <span className="setting-desc">Play typing sounds on every key press</span>
            </div>
            <Switch checked={store.soundEffects} onChange={(val) => store.updateSetting('soundEffects', val)} />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Error Sounds</span>
              <span className="setting-desc">Play error beep when typing an incorrect character</span>
            </div>
            <Switch checked={store.errorSounds} onChange={(val) => store.updateSetting('errorSounds', val)} />
          </div>
        </div>
      </div>
    </section>
  );
};

const TypingSession = ({ lesson, onComplete, onNext, onPrev, onRestart, hasNext, hasPrev, onClose }) => {
  const { engineState, stats, altCodeState, isIdle } = useTypingEngine(lesson.text, krutidev010Layout);
  const storeState = useAppStore();
  
  const [soundMenuOpen, setSoundMenuOpen] = React.useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = React.useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = React.useState(false);

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
          
          <div style={{ position: 'relative' }}>
            <button className="icon-btn-plain" title="Appearance" onClick={() => { setPaletteMenuOpen(!paletteMenuOpen); setSoundMenuOpen(false); setSettingsMenuOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
              <Palette size={20} />
            </button>
            {paletteMenuOpen && (
                 <div className="glass-card" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', padding: '16px', width: '220px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '15px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Font Size</span>
                   <div style={{ display: 'flex', gap: '5px' }}>
                     <button onClick={() => storeState.updateSetting('fontSize', 'small')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: storeState.fontSize === 'small' ? 'var(--brand)' : 'transparent', color: storeState.fontSize === 'small' ? '#fff' : 'var(--text-primary)', cursor: 'pointer' }}><Type size={12}/></button>
                     <button onClick={() => storeState.updateSetting('fontSize', 'medium')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: storeState.fontSize === 'medium' ? 'var(--brand)' : 'transparent', color: storeState.fontSize === 'medium' ? '#fff' : 'var(--text-primary)', cursor: 'pointer' }}><Type size={16}/></button>
                     <button onClick={() => storeState.updateSetting('fontSize', 'large')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: storeState.fontSize === 'large' ? 'var(--brand)' : 'transparent', color: storeState.fontSize === 'large' ? '#fff' : 'var(--text-primary)', cursor: 'pointer' }}><Type size={20}/></button>
                     <button onClick={() => storeState.updateSetting('fontSize', 'extra_large')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: storeState.fontSize === 'extra_large' ? 'var(--brand)' : 'transparent', color: storeState.fontSize === 'extra_large' ? '#fff' : 'var(--text-primary)', cursor: 'pointer' }}><Type size={24}/></button>
                   </div>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Alignment</span>
                   <div style={{ display: 'flex', gap: '5px' }}>
                     <button onClick={() => storeState.updateSetting('textAlign', 'left')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: storeState.textAlign === 'left' ? 'var(--brand)' : 'transparent', color: storeState.textAlign === 'left' ? '#fff' : 'var(--text-primary)', cursor: 'pointer' }}><AlignLeft size={16}/></button>
                     <button onClick={() => storeState.updateSetting('textAlign', 'center')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: storeState.textAlign === 'center' ? 'var(--brand)' : 'transparent', color: storeState.textAlign === 'center' ? '#fff' : 'var(--text-primary)', cursor: 'pointer' }}><AlignCenter size={16}/></button>
                     <button onClick={() => storeState.updateSetting('textAlign', 'right')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: storeState.textAlign === 'right' ? 'var(--brand)' : 'transparent', color: storeState.textAlign === 'right' ? '#fff' : 'var(--text-primary)', cursor: 'pointer' }}><AlignRight size={16}/></button>
                     <button onClick={() => storeState.updateSetting('textAlign', 'justify')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: storeState.textAlign === 'justify' ? 'var(--brand)' : 'transparent', color: storeState.textAlign === 'justify' ? '#fff' : 'var(--text-primary)', cursor: 'pointer' }}><AlignJustify size={16}/></button>
                   </div>
                 </div>
               </div>
            )}
          </div>
          <button className="icon-btn-plain" title="Hand Guide" onClick={() => storeState.updateSetting('showHandGuide', !storeState.showHandGuide)} style={{ background: 'transparent', border: 'none', color: storeState.showHandGuide ? 'var(--accent-blue)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
            <Hand size={20} />
          </button>
          
          <div style={{ position: 'relative' }}>
            <button className="icon-btn-plain" onClick={() => { setSoundMenuOpen(!soundMenuOpen); setSettingsMenuOpen(false); setPaletteMenuOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
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
            <button className="icon-btn-plain" onClick={() => { setSettingsMenuOpen(!settingsMenuOpen); setSoundMenuOpen(false); setPaletteMenuOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
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
                 <Switch checked={storeState.blockOnError} onChange={val => storeState.updateSetting('blockOnError', val)} label="Block on error" />
                 {storeState.blockOnError && (
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                     <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Max errors:</span>
                     <RoundedSelect className="rselect-small" value={storeState.maxErrorsToBlock} onChange={(val) => storeState.updateSetting('maxErrorsToBlock', parseInt(val, 10))} options={[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 5, label: '5' }]} />
                   </div>
                 )}
               </div>
            )}
          </div>
        </div>
      </div>

      {isFinished ? (
        <LessonResults 
          stats={stats} 
          onNext={onNext} 
          onPrev={onPrev} 
          onRestart={onRestart} 
          hasNext={hasNext} 
          hasPrev={hasPrev} 
        />
      ) : (
        <>
          {/* Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px 10px', minHeight: '300px' }} onClick={() => { setSoundMenuOpen(false); setSettingsMenuOpen(false); setPaletteMenuOpen(false); }}>
            
            {lesson?.type === 'box_practice' ? (
              <BoxExercise engineState={engineState} />
            ) : (
              <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%' }}>
                  <TypingArea engineState={engineState} isIdle={isIdle} />
                </div>
                
                {/* Border line */}
                <div style={{ width: '100%', height: '1px', background: 'var(--border-soft)', marginTop: '20px', marginBottom: '15px' }} />
                
                {/* Live Speed + Accuracy inline */}
                <div style={{ display: 'flex', gap: '60px', marginBottom: '20px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', opacity: 0.7 }}>Speed</span>
                      <span style={{ fontSize: '28px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{stats.wpm} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'normal' }}>WPM</span></span>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', opacity: 0.7 }}>Accuracy</span>
                      <span style={{ fontSize: '28px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{stats.accuracy}<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 'normal' }}>%</span></span>
                   </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Keyboard Area */}
          {storeState.showVirtualKeyboard && (
            <div style={{ paddingBottom: '20px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
               <VirtualKeyboard layout={krutidev010Layout} engineState={engineState} altCodeState={altCodeState} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
const KeyLogger = () => {
  const [logs, setLogs] = useState([]);

  React.useEffect(() => {
    const handleKey = (type, e) => {
      // Only log if Alt is held, OR if it's the Alt key itself, OR if it's a keypress
      if (e.altKey || e.key === 'Alt' || type === 'keypress' || type === 'textInput') {
        const logStr = `${type}: key='${e.key}', code='${e.code}', loc=${e.location}, alt=${e.altKey}`;
        setLogs(prev => [...prev.slice(-14), logStr]);
      }
    };

    const down = (e) => handleKey('down', e);
    const up = (e) => handleKey('up', e);
    const press = (e) => handleKey('press', e);
    const debugLog = (e) => setLogs(prev => [...prev.slice(-14), e.detail]);

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('keypress', press);
    window.addEventListener('debugLog', debugLog);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('keypress', press);
      window.removeEventListener('debugLog', debugLog);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 10, left: 10, background: 'rgba(0,0,0,0.9)', color: '#0f0', padding: 10, zIndex: 9999, fontFamily: 'monospace', fontSize: 12, borderRadius: 5, pointerEvents: 'none' }}>
      <strong>Hardware Key Logger (Alt codes)</strong>
      {logs.map((l, i) => <div key={i}>{l}</div>)}
      {logs.length === 0 && <div>Press Alt + numbers...</div>}
    </div>
  );
};

const Switch = ({ checked, onChange, label }) => {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '10px' }}>
      {label && <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{label}</span>}
      <div style={{
        position: 'relative',
        width: '36px',
        height: '20px',
        backgroundColor: checked ? '#10b981' : '#9ca3af',
        borderRadius: '10px',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          transition: 'transform 0.2s',
          transform: checked ? 'translateX(16px)' : 'translateX(0)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }} />
      </div>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ display: 'none' }} />
    </label>
  );
};

const RoundedSelect = ({ value, onChange, options, style, className = '' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const wrapperRef = React.useRef(null);

  const selectedOption = options.find(opt => opt.value == value) || options[0];

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('keydown', handleKey, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [isOpen]);

  return (
    <div className={`rselect ${isOpen ? 'is-open' : ''} ${className}`} ref={wrapperRef} style={style}>
      <select className="rselect-native" value={value} onChange={(e) => onChange(e.target.value)} style={{ display: 'none' }}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      
      <button 
        type="button" 
        className="rselect-trigger select-input" 
        aria-haspopup="listbox" 
        aria-expanded={isOpen}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        <span className="rselect-label">{selectedOption?.label}</span>
        <span className="rselect-caret" aria-hidden="true">▾</span>
      </button>
      
      <ul className="rselect-panel" role="listbox" hidden={!isOpen}>
        {options.map(opt => (
          <li 
            key={opt.value}
            className={`rselect-option ${value == opt.value ? 'is-selected' : ''}`} 
            role="option" 
            data-value={opt.value}
            onClick={() => {
              onChange(opt.value);
              setIsOpen(false);
            }}
          >
            {opt.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
