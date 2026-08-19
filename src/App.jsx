import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Play, RotateCcw, Keyboard as KeyboardIcon, Hand, Volume2, Settings as SettingsIcon, Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Bookmark, HelpCircle, X as CloseIcon } from 'lucide-react';
import { useTypingEngine } from './hooks/useTypingEngine';
import { krutidev010Layout } from './core/layouts/krutidev010';
import { getAllLessons, getLessonById, getNextLesson, getChapters } from './core/lessonEngine';
import TypingArea from './components/TypingArea';
import BoxExercise from './components/BoxExercise';
import LessonResults from './components/LessonResults';
import VirtualKeyboard from './components/VirtualKeyboard';
import PracticeSession from './components/PracticeSession';
import { useAppStore } from './store/useAppStore';
import { ACHIEVEMENTS_LIST, checkAchievements } from './core/achievements';

function App() {
  const allLessons = getAllLessons();
  const store = useAppStore();
  const [currentView, setCurrentView] = useState('dashboard');
  const initialIndex = store.continueLessonId ? Math.max(0, allLessons.findIndex(l => l.id === store.continueLessonId)) : 0;
  const [currentLessonIndex, setCurrentLessonIndex] = useState(initialIndex);
  const currentLesson = allLessons[currentLessonIndex];
  const [engineKey, setEngineKey] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem('krutidev-completed-lessons');
    if (saved) {
      try { return new Set(JSON.parse(saved)); } catch (e) {}
    }
    return new Set();
  });

  const [targetChapter, setTargetChapter] = useState(null);
  const [targetLesson, setTargetLesson] = useState(null);
  const [autoFullscreen, setAutoFullscreen] = useState(false);

  useEffect(() => {
    // Migrate old 'vscode-dark' to 'dark' for existing users
    const currentTheme = store.theme === 'vscode-dark' ? 'dark' : store.theme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (store.theme === 'vscode-dark') store.updateSetting('theme', 'dark');
  }, [store.theme]);

  const requestFullscreenIfNeeded = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setAutoFullscreen(true);
    }
  };

  const exitFullscreenIfNeeded = () => {
    if (autoFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setAutoFullscreen(false);
    }
  };

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

  useEffect(() => {
    // Run achievement check on load to retroactively award any earned milestones
    // Use setTimeout to ensure store is hydrated
    setTimeout(() => {
      const currentStore = useAppStore.getState();
      checkAchievements(currentStore, completedLessons.size, currentStore.perfectLessonsCount, null); 
    }, 1000);
  }, []);

  const startLesson = (lesson) => {
    requestFullscreenIfNeeded();
    setCurrentLessonIndex(allLessons.findIndex(l => l.id === lesson.id));
    store.updateStat('continueLessonId', lesson.id);
    setCurrentView('session');
    setEngineKey(prev => prev + 1);
    
    // Reset scroll immediately before render
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleCloseSession = () => {
    exitFullscreenIfNeeded();
    setCurrentView('dashboard');
  };

  const hasPrev = currentLessonIndex > 0;
  const hasNext = currentLessonIndex < allLessons.length - 1;

  const goPrev = () => hasPrev && startLesson(allLessons[currentLessonIndex - 1]);
  const goNext = () => hasNext && startLesson(allLessons[currentLessonIndex + 1]);
  const doRestart = () => setEngineKey(prev => prev + 1);

  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLessonComplete = useCallback((id, stats, totalCharsTyped) => {
    // 1. Update completed lessons
    setCompletedLessons(prev => {
      if (prev.has(id)) return prev;
      const newSet = new Set(prev).add(id);
      localStorage.setItem('krutidev-completed-lessons', JSON.stringify([...newSet]));
      return newSet;
    });

    const currentIndex = allLessons.findIndex(l => l.id === id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      const currentStore = useAppStore.getState();
      // Only set to next if user didn't manually open another lesson meanwhile
      if (currentStore.continueLessonId === id) {
        currentStore.updateStat('continueLessonId', allLessons[currentIndex + 1].id);
      }
    }

    // 2. Update stats
    const currentStore = useAppStore.getState();
    currentStore.updateStreak();
    currentStore.updateLessonStats(id, stats.wpm, stats.accuracy);
    if (stats.wpm > currentStore.bestWpm) currentStore.updateStat('bestWpm', stats.wpm);
    if (stats.accuracy === 100) currentStore.incrementPerfectLessons();
    if (totalCharsTyped) currentStore.incrementTotalTypedChars(totalCharsTyped);

    // 3. Check Achievements
    setTimeout(() => {
      const freshStore = useAppStore.getState();
      const completedSize = JSON.parse(localStorage.getItem('krutidev-completed-lessons') || '[]').length;
      checkAchievements(freshStore, completedSize, freshStore.perfectLessonsCount, showToast);
    }, 500);
  }, []);

  return (
    <div id="app-container">
      {toast && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'success' ? 'var(--success)' : 'var(--brand)', color: '#fff', padding: '12px 24px', borderRadius: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: 9999, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.message}
        </div>
      )}
      {window.location.search.includes('debug=true') && <KeyLogger />}
      {currentView !== 'session' && (
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      )}

      <main id="main-content">
        {currentView === 'dashboard' && <DashboardView setCurrentView={setCurrentView} onStart={startLesson} currentLesson={currentLesson} completedLessons={completedLessons} allLessons={allLessons} setTargetChapter={setTargetChapter} store={store} />}
        {currentView === 'lessons' && <LessonsView lessons={allLessons} onStart={startLesson} completedLessons={completedLessons} targetLesson={targetLesson} setTargetLesson={setTargetLesson} targetChapter={targetChapter} setTargetChapter={setTargetChapter} store={store} />}
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
              onClose={() => {
                exitFullscreenIfNeeded();
                setTargetLesson(currentLesson);
                setCurrentView('lessons');
              }}
            />
          </section>
        )}
        {currentView === 'practice' && <PracticeView store={store} />}
        {currentView === 'bookmarks' && <BookmarksView store={store} allLessons={allLessons} completedLessons={completedLessons} onStart={startLesson} onBrowse={() => setCurrentView('lessons')} />}
        {currentView === 'achievements' && <AchievementsView store={store} completedLessons={completedLessons} />}
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

const DashboardView = ({ setCurrentView, onStart, currentLesson, completedLessons, allLessons, setTargetChapter, store }) => {
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
        <div className="stat-card-value" id="stat-exercises-done">{store?.bestWpm || 0}</div>
        <div className="stat-card-label">Best WPM</div>
        <div className="stat-card-bar"><div className="stat-bar-fill" id="stat-bar-exercises" style={{'--bar-color': '#34d399', width: `${Math.min(100, ((store?.bestWpm || 0) / 80) * 100)}%`}}></div></div>
      </div>
      <div className="stat-card glass-card">
        <div className="stat-card-icon" style={{'--accent': '#fbbf24'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg></div>
        <div className="stat-card-value" id="stat-streak">{store?.streak || 0}</div>
        <div className="stat-card-label">Day Streak</div>
        <div className="stat-card-bar"><div className="stat-bar-fill" id="stat-bar-streak" style={{'--bar-color': '#fbbf24', width: `${Math.min(100, ((store?.streak || 0) / 30) * 100)}%`}}></div></div>
      </div>
      <div className="stat-card glass-card">
        <div className="stat-card-icon" style={{'--accent': '#f472b6'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg></div>
        <div className="stat-card-value" id="stat-achievements">{store.unlockedAchievements.length}</div>
        <div className="stat-card-label">Achievements</div>
        <div className="stat-card-bar"><div className="stat-bar-fill" id="stat-bar-achievements" style={{'--bar-color': '#f472b6', width: `${(store.unlockedAchievements.length / ACHIEVEMENTS_LIST.length) * 100}%`}}></div></div>
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
            <div key={chapter.id} className="chapter-progress-card glass-card" style={{opacity: pct === 0 ? 0.6 : 1, cursor: 'pointer'}} onClick={() => { setTargetChapter(chapter.id); setCurrentView('lessons'); }}>
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

const LessonsView = ({ lessons, onStart, completedLessons, targetLesson, setTargetLesson, targetChapter, setTargetChapter, store }) => {
  const [expandedChapter, setExpandedChapter] = useState(targetLesson ? targetLesson.chapterId : (targetChapter || null));

  useEffect(() => {
    if (targetLesson) {
      setExpandedChapter(targetLesson.chapterId);
      
      setTimeout(() => {
        const lessonEl = document.getElementById(`lesson-item-${targetLesson.id}`);
        if (lessonEl) {
          lessonEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Optional: Add a brief highlight effect
          lessonEl.style.transition = 'background-color 0.5s';
          lessonEl.style.backgroundColor = 'rgba(129, 140, 248, 0.2)';
          setTimeout(() => {
            lessonEl.style.backgroundColor = '';
          }, 1500);
        } else {
          // Fallback to chapter if lesson not found for some reason
          const chapterEl = document.getElementById(`chapter-card-${targetLesson.chapterId}`);
          if (chapterEl) chapterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // slightly longer delay to ensure DOM is ready after expanding chapter

      setTargetLesson(null);
    }
  }, [targetLesson, setTargetLesson]);
  
  useEffect(() => {
    if (targetChapter) {
      setExpandedChapter(targetChapter);
      
      setTimeout(() => {
        const chapterEl = document.getElementById(`chapter-card-${targetChapter}`);
        if (chapterEl) chapterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      setTargetChapter(null);
    }
  }, [targetChapter, setTargetChapter]);

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
            <div id={`chapter-card-${chapter.id}`} key={chapter.id} className={`chapter-card glass-card ${isChapterComplete ? 'chapter-completed' : (progress > 0 || chapter.id === 1 ? 'chapter-in-progress' : '')} ${isExpanded ? 'expanded' : ''}`}>
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
                  <div id={`lesson-item-${lesson.id}`} key={lesson.id} className={`lesson-item ${isCompleted ? 'completed' : ''}`}>
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
                      <div style={{ fontSize: '12px', marginTop: '6px', color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        {isCompleted && store?.lessonStats?.[lesson.id] ? (
                          <span style={{ display: 'flex', gap: '12px', fontWeight: '500' }}>
                            <span>Best: <span style={{ color: 'var(--success)' }}>{store.lessonStats[lesson.id].bestWpm} WPM</span></span>
                            <span>Acc: <span style={{ color: 'var(--accent-blue)' }}>{store.lessonStats[lesson.id].bestAccuracy}%</span></span>
                          </span>
                        ) : (
                          <span style={{ opacity: 0.7 }}>Not attempted</span>
                        )}
                      </div>
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

const PracticeView = ({ store }) => {
  const [activeExercise, setActiveExercise] = React.useState(null);
  const [exercises, setExercises] = React.useState([]);
  const [expandedSets, setExpandedSets] = React.useState({});

  React.useEffect(() => {
    import('./core/exerciseEngine').then(m => {
      setExercises(m.getAllExercises());
    }).catch(() => setExercises([]));
  }, []);

  const toggleSet = (setId) =>
    setExpandedSets(prev => ({ ...prev, [setId]: !prev[setId] }));

  const startExercise = (exercise) => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setAutoFullscreen(true);
    }
    setActiveExercise(exercise);
  };

  const handleClosePractice = () => {
    if (autoFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setAutoFullscreen(false);
    }
    setActiveExercise(null);
  };

  if (activeExercise) {
    return <PracticeSession lesson={activeExercise} onClose={handleClosePractice} />;
  }

  const groups = exercises.reduce((acc, ex) => {
    const key = ex.setId || ex.setName || 'ungrouped';
    if (!acc[key]) acc[key] = { setName: ex.setName || key, setId: key, items: [] };
    acc[key].items.push(ex);
    return acc;
  }, {});

  return (
    <section className="view active" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="view-header" style={{ flexShrink: 0 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand)' }}>
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
          Practice Mode
        </h1>
        <p className="view-subtitle">Strict typing tests to evaluate your KrutiDev skills</p>
      </div>
      <div className="lessons-container no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '12px', paddingBottom: '40px' }}>
        {exercises.length === 0 ? (
          <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.8, textAlign: 'center' }}>
            <div className="empty-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>No practice exercises yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Use the <strong>Exercise Builder</strong> tool to create exercise sets.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Run: <code style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>python tools/exercise_builder.py</code></p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.values(groups).map(group => {
              const isOpen = !!expandedSets[group.setId];
              const totalPassed = group.items.filter(ex => (store.practiceResults?.[ex.id] || []).some(r => r.passed)).length;
              return (
                <div key={group.setId} className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <button onClick={() => toggleSet(group.setId)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: isOpen ? '1px solid var(--border-soft)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{group.setName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{group.items.length} exercise{group.items.length !== 1 ? 's' : ''} · {totalPassed} passed</div>
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  {isOpen && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '14px', padding: '16px 20px' }}>
                      {group.items.map(exercise => {
                        const results = store.practiceResults?.[exercise.id] || [];
                        const bestResult = results.length > 0 ? results.reduce((best, curr) => (curr.obtainedMarks || 0) > (best.obtainedMarks || 0) ? curr : best, results[0]) : null;
                        const maxMarks = exercise.maxMarks ?? 25;
                        const passingMarks = exercise.passingMarks ?? 10;
                        return (
                          <div key={exercise.id} style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-soft)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                              <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>{exercise.title}</h4>
                              {bestResult && bestResult.passed && (
                                <span style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--success)', padding: '3px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '8px' }}>PASSED</span>
                              )}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', flex: 1, marginBottom: '12px', lineHeight: 1.5 }}>{exercise.description}</p>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                              <span>⏱ {exercise.timeLimitMinutes}m</span>
                              <span>🎯 {exercise.minWpm} WPM</span>
                              <span>📊 Pass: {passingMarks}/{maxMarks}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-soft)' }}>
                              <div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Best Score</div>
                                <div style={{ fontWeight: 'bold', fontSize: '14px', color: bestResult ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                  {bestResult ? `${bestResult.obtainedMarks?.toFixed(2) ?? '--'} / ${maxMarks}` : '--'}
                                </div>
                              </div>
                              <button className="btn btn-primary btn-sm" onClick={() => startExercise(exercise)}>Start Test</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

const BookmarksView = ({ store, allLessons, completedLessons, onStart, onBrowse }) => {
  const bookmarks = store.bookmarks || [];
  const bookmarkedLessons = allLessons.filter(l => bookmarks.includes(l.id));

  return (
    <section className="view active" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="view-header" style={{ flexShrink: 0 }}>
        <h1>Bookmarks</h1>
        <p className="view-subtitle">Your saved lessons</p>
      </div>
      <div className="lessons-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '12px' }}>
        {bookmarkedLessons.length === 0 ? (
          <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.8, textAlign: 'center' }}>
            <div className="empty-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>🔖</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>No bookmarks yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Bookmark lessons to access them quickly here.</p>
            <button className="btn btn-primary" onClick={onBrowse}>
              Browse Lessons &rarr;
            </button>
          </div>
        ) : (
          <div className="bookmarks-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {bookmarkedLessons.map(lesson => (
              <div key={lesson.id} className="bookmark-item glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px', borderRadius: '8px' }}>
                <div className="bookmark-icon" style={{ fontSize: '26px', display: 'flex', color: 'var(--brand)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                </div>
                <div className="bookmark-info" onClick={() => onStart(lesson)} style={{ flex: 1, cursor: 'pointer' }}>
                  <div className="bookmark-title" style={{ fontWeight: 600, fontSize: '15.5px', color: 'var(--text-primary)' }}>{lesson.title}</div>
                  <div className="bookmark-chapter" style={{ fontWeight: 500, fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' }}>Chapter {lesson.chapterId}</div>
                </div>
                <button className="bookmark-remove" title="Remove bookmark" onClick={() => store.toggleBookmark(lesson.id)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'transparent', color: 'var(--text-muted)', fontSize: '20px', border: 'none', cursor: 'pointer' }}>&times;</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const AchievementsView = ({ store, completedLessons }) => {
  const { unlockedAchievements } = store;

  const formatNum = (num) => num.toLocaleString();

  return (
    <section className="view active" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="view-header" style={{ flexShrink: 0 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand)' }}>
            <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
          </svg>
          Achievements
        </h1>
        <p className="view-subtitle">Track your milestones ({unlockedAchievements.length} / {ACHIEVEMENTS_LIST.length} Unlocked)</p>
        
        <div className="chapter-progress-bar" style={{ marginTop: '16px', height: '6px' }}>
          <div className="chapter-progress-fill" style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS_LIST.length) * 100}%`, backgroundColor: 'var(--brand)' }}></div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }} className="no-scrollbar">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', paddingBottom: '40px' }}>
          {ACHIEVEMENTS_LIST.map((achievement) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            
            let progressHtml = null;
            if (!isUnlocked) {
              let current = 0;
              let target = 1;
              let label = '';
              
              const parts = achievement.id.split('-');
              const rawTarget = parts[parts.length - 1];
              
              if (achievement.category === 'speed') {
                current = store.bestWpm;
                target = parseInt(rawTarget, 10);
                label = 'WPM';
              } else if (achievement.category === 'lessons') {
                current = completedLessons.size;
                target = parseInt(rawTarget, 10);
                label = 'lessons';
              } else if (achievement.category === 'streak') {
                current = store.streak;
                target = parseInt(rawTarget, 10);
                label = 'days';
              } else if (achievement.category === 'accuracy') {
                current = store.perfectLessonsCount;
                target = parseInt(rawTarget, 10);
                label = 'perfect lessons';
              } else if (achievement.category === 'volume') {
                current = store.totalTypedChars;
                if (rawTarget.endsWith('k')) target = parseFloat(rawTarget) * 1000;
                else if (rawTarget.endsWith('m')) target = parseFloat(rawTarget) * 1000000;
                else target = parseInt(rawTarget, 10);
                label = 'chars';
              }

              if (current > target) current = target;
              const pct = target > 0 ? (current / target) * 100 : 0;
              
              progressHtml = (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{formatNum(Math.floor(current))} / {formatNum(target)} {label}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-inset)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, background: 'var(--brand)', height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
              );
            }

            return (
              <div key={achievement.id} className="glass-card" style={{ 
                opacity: isUnlocked ? 1 : 0.6, 
                display: 'flex', 
                flexDirection: 'column',
                padding: '20px',
                border: isUnlocked ? '1px solid var(--accent-blue)' : '1px solid var(--glass-border)',
                background: isUnlocked ? 'rgba(59, 130, 246, 0.05)' : 'var(--glass-bg)',
                filter: isUnlocked ? 'none' : 'grayscale(0.8)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ fontSize: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {achievement.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {achievement.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {achievement.desc}
                    </div>
                  </div>
                </div>
                {progressHtml}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

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
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' }
              ]}
            />
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Typing Area Mode</span>
              <span className="setting-desc">Choose the layout of the typing interface</span>
            </div>
            <RoundedSelect
              value={store.typingMode || 'classic'}
              onChange={(val) => store.updateSetting('typingMode', val)}
              options={[
                { value: 'classic', label: 'Classic (Single Box)' },
                { value: 'two-box', label: 'Two-Box (Split)' }
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
        <div className="setting-group glass-card">
          <h3>Danger Zone</h3>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label" style={{ color: 'var(--danger)' }}>Reset All Progress</span>
              <span className="setting-desc">Permanently delete all stats, achievements, and completed lessons</span>
            </div>
            <button 
              className="btn" 
              style={{ background: 'var(--danger)', color: 'white', border: 'none' }}
              onClick={() => {
                if (window.confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
                  store.resetProgress();
                  window.location.reload();
                }
              }}
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const AltCodesModal = ({ onClose }) => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch('/fonts/KrutiDev010_AltCodes.txt')
      .then(res => res.text())
      .then(text => {
        const lines = text.split('\n').filter(l => l.trim() && l.includes('|') && !l.startsWith('AltCode'));
        const parsed = lines.map(line => {
          const [code, char] = line.split('|');
          return { code: code.replace('Alt+', '').trim(), char: char.trim() };
        });
        setCodes(parsed);
      })
      .catch(() => setCodes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '700px', background: 'var(--bg-elevated)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={20} style={{ color: 'var(--brand)' }} /> KrutiDev Alt Codes Cheat Sheet
          </h2>
          <button className="icon-btn-plain" onClick={onClose} style={{ background: 'var(--bg-inset)', border: 'none', color: 'var(--text-muted)', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}>
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="no-scrollbar" style={{ padding: '24px', overflowY: 'auto', maxHeight: '60vh' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Loading...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
              {codes.map((item, idx) => (
                <div key={item.code + idx} style={{ background: 'var(--bg-inset)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontFamily: '"Kruti Dev 010", sans-serif', fontSize: '28px', color: 'var(--text-primary)' }}>{item.char}</div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--brand)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>Alt + {item.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TypingSession = ({ lesson, onComplete, onNext, onPrev, onRestart, hasNext, hasPrev, onClose }) => {
  const { engineState, stats, altCodeState, isIdle } = useTypingEngine(lesson.text, krutidev010Layout, lesson.type);
  // Fix #4/#5 — use stable selectors instead of full store subscription
  const storeState = useAppStore();
  const showVirtualKeyboard = useAppStore(s => s.showVirtualKeyboard);
  const updateSetting = useAppStore(s => s.updateSetting);

  const [soundMenuOpen, setSoundMenuOpen] = React.useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = React.useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = React.useState(false);
  const [showAltCodes, setShowAltCodes] = React.useState(false);

  React.useLayoutEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  React.useEffect(() => {
    if (engineState?.status === 'finished') {
      onComplete(lesson.id, stats, engineState.totalTypedChars);
    }
  }, [engineState?.status, lesson.id, onComplete, stats, engineState?.totalTypedChars]);

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

  // Fix #5 — Ctrl+K shortcut with stable deps so listener isn't re-registered every render
  React.useEffect(() => {
    const handleShortcut = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        e.stopImmediatePropagation();
        updateSetting('showVirtualKeyboard', !showVirtualKeyboard);
      }
    };
    window.addEventListener('keydown', handleShortcut, true);
    return () => window.removeEventListener('keydown', handleShortcut, true);
  }, [showVirtualKeyboard, updateSetting]);



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
          <button className="icon-btn-plain" title="Virtual Keyboard (Ctrl+K)" onClick={() => storeState.updateSetting('showVirtualKeyboard', !storeState.showVirtualKeyboard)} style={{ background: 'transparent', border: 'none', color: storeState.showVirtualKeyboard ? 'var(--accent-blue)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
            <KeyboardIcon size={20} />
          </button>
          <button className="icon-btn-plain" title="Alt Codes Cheat Sheet" onClick={() => setShowAltCodes(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
            <HelpCircle size={20} />
          </button>
          <button className="icon-btn-plain" title="Bookmark Lesson" onClick={() => storeState.toggleBookmark(lesson.id)} style={{ background: 'transparent', border: 'none', color: (storeState.bookmarks || []).includes(lesson.id) ? 'var(--brand)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}>
            <Bookmark size={20} fill={(storeState.bookmarks || []).includes(lesson.id) ? 'currentColor' : 'none'} />
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
                 <Switch checked={storeState.blockOnError} onChange={val => storeState.updateSetting('blockOnError', val)} label="Block on error" />
                 {storeState.blockOnError && (
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                     <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Max errors:</span>
                     <RoundedSelect className="rselect-small" value={storeState.maxErrorsToBlock} onChange={(val) => storeState.updateSetting('maxErrorsToBlock', parseInt(val, 10))} options={[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }, { value: 5, label: '5' }]} />
                   </div>
                 )}
                 {lesson?.type !== 'box_practice' && (
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                     <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>View Mode:</span>
                     <RoundedSelect 
                       className="rselect-small" 
                       value={storeState.typingMode || 'classic'} 
                       onChange={(val) => storeState.updateSetting('typingMode', val)} 
                       options={[{ value: 'classic', label: 'Classic' }, { value: 'two-box', label: 'Two-Box' }]} 
                     />
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
                {storeState.typingMode === 'classic' && (
                  <div style={{ width: '100%', height: '1px', background: 'var(--border-soft)', marginTop: '20px', marginBottom: '15px' }} />
                )}
                
                {/* Live Speed + Accuracy inline */}
                {storeState.typingMode === 'classic' && (
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
                )}
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

      {/* Alt Codes Modal */}
      {showAltCodes && <AltCodesModal onClose={() => setShowAltCodes(false)} />}
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
