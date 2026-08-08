import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchCandidates, startInterview, sendInterviewTurn, 
  getSessionDebug, fetchSessions 
} from './services/api';

import DashboardView from './components/DashboardView';
import CandidateSelector from './components/CandidateSelector';
import ChatInterface from './components/ChatInterface';
import FeedbackView from './components/FeedbackView';
import InterviewsView from './components/InterviewsView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';

import { 
  Bot, LayoutDashboard, Users, MessageSquare, BarChart3, Settings, 
  Search, Bell, Sparkles, Zap, ChevronRight, X, Activity, CheckCircle2
} from 'lucide-react';

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'candidates' | 'interviews' | 'analytics' | 'settings'
  const [view, setView] = useState('selector'); // 'selector' | 'chat' | 'feedback'
  
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [questionCount, setQuestionCount] = useState(1);
  const [daysCoveredCount, setDaysCoveredCount] = useState(1);
  const [feedback, setFeedback] = useState(null);

  // Global Search State
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Activity Feed
  const [activityLogs, setActivityLogs] = useState([]);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);

  useEffect(() => {
    loadCandidatesList();
    loadSessionsList();
  }, []);

  const addActivityLog = (text) => {
    setActivityLogs(prev => [
      { text, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19)
    ]);
  };

  const loadCandidatesList = async () => {
    try {
      setLoading(true);
      const data = await fetchCandidates();
      setCandidates(data);
      if (data.length > 0) {
        setSelectedCandidate(data[0]);
      }
    } catch (err) {
      setError('Could not connect to backend server. Make sure FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionsList = async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      console.warn('Could not fetch sessions list:', err);
    }
  };

  const handleStartInterview = async () => {
    if (!selectedCandidate) return;
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setSessionId(newSessionId);
    setLoading(true);
    setError(null);
    setMessages([]);

    try {
      const res = await startInterview(newSessionId, selectedCandidate);
      setMessages([{ role: 'interviewer', content: res.reply }]);
      setQuestionCount(1);
      setDaysCoveredCount(1);
      setView('chat');
      setActiveTab('interviews');
      addActivityLog(`Interview started for candidate ${selectedCandidate.member.name} (${selectedCandidate.member.jobRole})`);
      loadSessionsList();
    } catch (err) {
      setError(err.message || 'Error starting interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTurn = async (userMessage) => {
    if (!sessionId || loading) return;
    
    const updatedMessages = [...messages, { role: 'candidate', content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);
    addActivityLog(`Candidate response submitted for turn ${questionCount}`);

    try {
      const res = await sendInterviewTurn(sessionId, userMessage);

      if (res.done) {
        setFeedback(res.feedback);
        setView('feedback');
        addActivityLog(`Interview completed for candidate ${selectedCandidate?.member?.name || 'Candidate'}. Feedback generated.`);
      } else {
        setMessages([...updatedMessages, { role: 'interviewer', content: res.reply }]);
        
        const status = await getSessionDebug(sessionId);
        if (status) {
          setQuestionCount(status.question_count || questionCount + 1);
          setDaysCoveredCount(status.unique_days_count || daysCoveredCount);
        } else {
          setQuestionCount((prev) => prev + 1);
        }
      }
      loadSessionsList();
    } catch (err) {
      setError(err.message || 'Error sending answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setView('selector');
    setActiveTab('candidates');
    setMessages([]);
    setFeedback(null);
    setError(null);
    loadSessionsList();
  };

  // Global Search Filtering
  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return { candidates: [], sessions: [] };
    const q = globalSearch.toLowerCase().trim();

    const matchedCandidates = candidates.filter(c => 
      c.member?.name?.toLowerCase().includes(q) ||
      c.member?.id?.toLowerCase().includes(q) ||
      c.member?.jobRole?.toLowerCase().includes(q)
    );

    const matchedSessions = sessions.filter(s => 
      s.sessionId?.toLowerCase().includes(q) ||
      s.candidateName?.toLowerCase().includes(q) ||
      s.jobRole?.toLowerCase().includes(q)
    );

    return { candidates: matchedCandidates, sessions: matchedSessions };
  }, [globalSearch, candidates, sessions]);

  return (
    <div className="saas-app-layout">
      {/* Top Header */}
      <header className="saas-header">
        <div className="logo-brand">
          <div className="logo-icon-glow">
            <Bot size={26} color="#818cf8" />
          </div>
          <span className="brand-title">THE INTERVIEW AGENT</span>
        </div>

        {/* Global Search Box */}
        <div className="header-search-container" style={{ position: 'relative', width: '320px' }}>
          <div className="search-input-wrapper" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' }}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text"
              className="search-input"
              placeholder="Global search (candidates, sessions, roles)..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
            />
            {globalSearch && (
              <button className="clear-search-btn" onClick={() => { setGlobalSearch(''); setShowSearchDropdown(false); }}>✕</button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && globalSearch.trim() && (
            <div className="glass-card search-dropdown-results" style={{ position: 'absolute', top: '44px', left: 0, right: 0, zIndex: 1000, padding: '0.85rem', maxHeight: '350px', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, marginBottom: '0.5rem' }}>MATCHING CANDIDATES</div>
              {searchResults.candidates.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '0.4rem 0' }}>No matching candidates</div>
              ) : (
                searchResults.candidates.map(c => (
                  <div 
                    key={c.member.id} 
                    className="search-result-item" 
                    onClick={() => {
                      setSelectedCandidate(c);
                      setActiveTab('candidates');
                      setView('selector');
                      setShowSearchDropdown(false);
                    }}
                  >
                    <span style={{ color: '#fff', fontWeight: 600 }}>{c.member.name}</span>
                    <span style={{ color: '#38bdf8', fontSize: '0.78rem' }}>{c.member.jobRole}</span>
                  </div>
                ))
              )}

              <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700, marginTop: '0.85rem', marginBottom: '0.5rem' }}>MATCHING SESSIONS</div>
              {searchResults.sessions.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '0.4rem 0' }}>No matching sessions</div>
              ) : (
                searchResults.sessions.map(s => (
                  <div 
                    key={s.sessionId} 
                    className="search-result-item" 
                    onClick={() => {
                      setActiveTab('interviews');
                      setShowSearchDropdown(false);
                    }}
                  >
                    <span style={{ color: '#fff', fontWeight: 600 }}>{s.candidateName}</span>
                    <span style={{ color: '#34d399', fontSize: '0.78rem' }}>{s.done ? 'Completed' : 'In Progress'}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Activity & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            style={{ position: 'relative', padding: '0.45rem 0.75rem', borderRadius: '10px' }}
            onClick={() => setShowActivityDrawer(!showActivityDrawer)}
            title="Activity Feed"
          >
            <Bell size={18} color="#a5b4fc" />
            {activityLogs.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} />
            )}
          </button>

          <div className="header-tagline-badge">
            <Sparkles size={13} color="#a5b4fc" />
            <span>Build the interviewer, not the interview.</span>
          </div>
        </div>
      </header>

      {/* Activity Logs Slide-out Panel */}
      {showActivityDrawer && (
        <div className="glass-card activity-drawer-panel" style={{ position: 'fixed', top: '70px', right: '2rem', width: '320px', zIndex: 999, padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} color="#38bdf8" /> Real-time Activity Log
            </span>
            <button className="modal-close-btn" onClick={() => setShowActivityDrawer(false)}>✕</button>
          </div>

          {activityLogs.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '1rem 0', textAlign: 'center' }}>
              No recent activity.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '300px', overflowY: 'auto' }}>
              {activityLogs.map((log, i) => (
                <div key={i} style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: '#e2e8f0', fontWeight: 500 }}>{log.text}</div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.2rem' }}>{log.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main SaaS Layout (Sidebar + Content) */}
      <div className="saas-body-wrapper">
        {/* Left Sidebar */}
        <aside className="saas-sidebar">
          <div className="sidebar-nav-section">
            <div className="nav-group-label">NAVIGATION</div>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'dashboard' && view !== 'chat' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dashboard');
                if (view === 'chat' || view === 'feedback') setView('selector');
              }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'candidates' && view === 'selector' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('candidates');
                setView('selector');
              }}
            >
              <Users size={18} />
              <span>Candidates</span>
              <span className="nav-count-badge">{candidates.length}</span>
            </button>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'interviews' || view === 'chat' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('interviews');
                if (messages.length > 0 && view !== 'chat') setView('chat');
              }}
            >
              <MessageSquare size={18} />
              <span>Interviews</span>
              {view === 'chat' && <span className="nav-live-dot" />}
            </button>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('analytics');
                if (view === 'chat' || view === 'feedback') setView('selector');
              }}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </button>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('settings');
                if (view === 'chat' || view === 'feedback') setView('selector');
              }}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </div>

          {/* AI Interviewer Tagline Box at Sidebar Bottom */}
          <div className="sidebar-info-box">
            <div className="info-box-title">
              <Zap size={14} color="#38bdf8" /> AI Interviewer
            </div>
            <p className="info-box-text">
              Personalized.<br />
              Adaptive.<br />
              Insightful.<br />
              Built for real technical evaluation.
            </p>
          </div>

          {/* User/Admin Section */}
          <div className="sidebar-admin-footer">
            <div className="admin-avatar-circle">
              <span>LE</span>
            </div>
            <div className="admin-user-meta">
              <div className="admin-name">Lead Evaluator</div>
              <div className="admin-role">Admin Portal</div>
            </div>
          </div>
        </aside>

        {/* Main Content View */}
        <main className="saas-main-content">
          {error && (
            <div className="glass-card error-banner">
              <p>{error}</p>
            </div>
          )}

          {/* Render Active View / Tab */}
          {view === 'chat' ? (
            <ChatInterface
              candidate={selectedCandidate}
              messages={messages}
              onSendTurn={handleSendTurn}
              loading={loading}
              questionCount={questionCount}
              daysCoveredCount={daysCoveredCount}
              onBackToCandidates={handleRestart}
            />
          ) : view === 'feedback' ? (
            <FeedbackView
              candidate={selectedCandidate}
              feedback={feedback}
              onRestart={handleRestart}
            />
          ) : activeTab === 'dashboard' ? (
            <DashboardView
              candidates={candidates}
              sessions={sessions}
              onStartNewInterview={() => { setActiveTab('candidates'); setView('selector'); }}
              onViewSessionDetail={(sid) => { setActiveTab('interviews'); }}
              onSelectCandidate={(c) => { setSelectedCandidate(c); setActiveTab('candidates'); setView('selector'); }}
            />
          ) : activeTab === 'candidates' ? (
            <CandidateSelector
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
              onStartInterview={handleStartInterview}
              loading={loading}
            />
          ) : activeTab === 'interviews' ? (
            <InterviewsView
              sessions={sessions}
              onStartNewInterview={() => { setActiveTab('candidates'); setView('selector'); }}
            />
          ) : activeTab === 'analytics' ? (
            <AnalyticsView
              sessions={sessions}
              candidates={candidates}
            />
          ) : activeTab === 'settings' ? (
            <SettingsView
              candidatesCount={candidates.length}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
