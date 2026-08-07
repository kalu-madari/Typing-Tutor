import React, { useState } from 'react';
import { useTypingEngine } from './hooks/useTypingEngine';
import { krutidev010Layout } from './core/layouts/krutidev010';
import { getAllLessons } from './core/lessonEngine';
import TypingArea from './components/TypingArea';
import VirtualKeyboard from './components/VirtualKeyboard';

function App() {
  const allLessons = getAllLessons();
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentLesson, setCurrentLesson] = useState(allLessons[0]);
  const [engineKey, setEngineKey] = useState(0);

  const startLesson = (lesson) => {
    setCurrentLesson(lesson);
    setEngineKey(prev => prev + 1);
    setCurrentView('session');
  };

  return (
    <div id="app-container">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <main id="main-content">
        {currentView === 'dashboard' && <DashboardView setCurrentView={setCurrentView} />}
        {currentView === 'lessons' && <LessonsView lessons={allLessons} onStart={startLesson} />}
        {currentView === 'session' && (
          <section id="view-lesson-detail" className="view active" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '28px' }}>{currentLesson.title}</h1>
                <p className="view-subtitle">{currentLesson.description}</p>
              </div>
              <button className="btn btn-secondary" onClick={() => setCurrentView('lessons')}>← Back to Library</button>
            </div>
            <TypingSession key={engineKey} lesson={currentLesson} />
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

const DashboardView = ({ setCurrentView }) => (
  <section id="view-dashboard" className="view active">
    <div className="view-header">
      <h1>Welcome back! 👋</h1>
      <p className="view-subtitle">Continue your KrutiDev journey</p>
    </div>

    <div className="stats-grid" id="dashboard-stats">
      <div className="stat-card glass-card">
        <div className="stat-card-icon" style={{'--accent': '#818cf8'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></div>
        <div className="stat-card-value" id="stat-lessons-done">0</div>
        <div className="stat-card-label">Lessons Completed</div>
        <div className="stat-card-bar"><div className="stat-bar-fill" id="stat-bar-lessons" style={{width: '0%'}}></div></div>
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
          <h3 className="continue-title" id="continue-title">Learn Finger Placement</h3>
          <p className="continue-desc" id="continue-desc">Build muscle memory for the KrutiDev keyboard layout.</p>
        </div>
        <button className="btn btn-primary btn-glow" id="continue-btn" onClick={() => setCurrentView('lessons')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Continue
        </button>
      </div>
    </div>

    <div className="section-block">
      <h2 className="section-title">Chapter Progress</h2>
      <div className="chapter-progress-grid" id="chapter-progress-grid">
        <div className="chapter-progress-card glass-card">
          <div className="progress-card-header">
            <span className="progress-card-title">Chapter 1</span>
            <span className="progress-card-pct">0%</span>
          </div>
          <div className="progress-card-name">Learn Finger Placement</div>
          <div className="chapter-progress-bar"><div className="chapter-progress-fill" style={{width: '0%', backgroundColor: 'var(--brand)'}}></div></div>
        </div>
        <div className="chapter-progress-card glass-card" style={{opacity: 0.6}}>
          <div className="progress-card-header">
            <span className="progress-card-title">Chapter 2</span>
            <span className="progress-card-pct">0%</span>
          </div>
          <div className="progress-card-name">Top Row & Bottom Row</div>
          <div className="chapter-progress-bar"><div className="chapter-progress-fill" style={{width: '0%', backgroundColor: 'var(--brand)'}}></div></div>
        </div>
      </div>
    </div>
  </section>
);

const LessonsView = ({ lessons, onStart }) => {
  const [expanded, setExpanded] = useState(false);
  
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
        <div className={`chapter-card glass-card chapter-in-progress ${expanded ? 'expanded' : ''}`}>
          <div className="chapter-header" onClick={() => setExpanded(!expanded)}>
            <div className="chapter-badge badge-active">1</div>
            <div className="chapter-header-info">
              <div className="chapter-header-title">Chapter 1: Learn Finger Placement</div>
              <div className="chapter-header-desc">Build muscle memory for the KrutiDev keyboard layout.</div>
              <div className="chapter-header-meta">
                <span className="chapter-meta-badge" style={{whiteSpace: 'nowrap'}}>{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</span>
                <div style={{display:'flex', alignItems:'center', gap:'8px', width:'100%', maxWidth:'200px', marginTop:'10px'}}>
                  <div className="chapter-progress-bar" style={{flex:1, height:'4px', background:'var(--bg-inset)', borderRadius:'2px', overflow:'hidden'}}>
                    <div className="chapter-progress-fill" style={{height:'100%', borderRadius:'2px', width:'0%', background:'var(--brand)'}}></div>
                  </div>
                  <span style={{fontSize:'12px', color:'var(--text-muted)', fontWeight:'600'}}>0%</span>
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
            {lessons.map(lesson => (
              <div key={lesson.id} className="lesson-item">
                <div className="lesson-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="lesson-info">
                  <div className="lesson-item-title" style={{ fontSize: '17.5px' }}>{lesson.title}</div>
                  <div className="lesson-desc" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{lesson.description}</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onStart(lesson); }}>Start</button>
              </div>
            ))}
          </div>
        </div>
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

const TypingSession = ({ lesson }) => {
  const { engineState, stats } = useTypingEngine(lesson.text, krutidev010Layout);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <div className="stats-grid" style={{ width: '100%', maxWidth: '800px', marginBottom: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div className="stat-card glass-card">
          <div className="stat-card-label" style={{ marginBottom: '8px' }}>WPM</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{stats.wpm}</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-card-label" style={{ marginBottom: '8px' }}>Accuracy</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{stats.accuracy}%</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-card-label" style={{ marginBottom: '8px' }}>Time</div>
          <div className="stat-card-value" style={{ color: 'var(--accent-blue)' }}>{stats.timeInSeconds}s</div>
        </div>
      </div>
      <TypingArea engineState={engineState} />
      <VirtualKeyboard layout={krutidev010Layout} engineState={engineState} />
    </div>
  );
};

export default App;
