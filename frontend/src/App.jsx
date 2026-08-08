import React, { useState, useEffect } from 'react';
import { fetchCandidates, startInterview, sendInterviewTurn, getSessionDebug } from './services/api';
import CandidateSelector from './components/CandidateSelector';
import ChatInterface from './components/ChatInterface';
import FeedbackView from './components/FeedbackView';
import { 
  Bot, LayoutDashboard, Users, MessageSquare, BarChart3, Settings, 
  ChevronRight, Shield, Zap, Sparkles 
} from 'lucide-react';

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [view, setView] = useState('selector'); // 'selector' | 'chat' | 'feedback'
  const [activeTab, setActiveTab] = useState('candidates');
  
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [questionCount, setQuestionCount] = useState(1);
  const [daysCoveredCount, setDaysCoveredCount] = useState(1);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadCandidatesList();
  }, []);

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
    } catch (err) {
      setError(err.message || 'Error starting interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTurn = async (userMessage) => {
    if (!sessionId || loading) return;
    
    // Add user response to message list immediately
    const updatedMessages = [...messages, { role: 'candidate', content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await sendInterviewTurn(sessionId, userMessage);

      if (res.done) {
        setFeedback(res.feedback);
        setView('feedback');
      } else {
        setMessages([...updatedMessages, { role: 'interviewer', content: res.reply }]);
        
        // Fetch session debug status to update question & day badges
        const status = await getSessionDebug(sessionId);
        if (status) {
          setQuestionCount(status.question_count || questionCount + 1);
          setDaysCoveredCount(status.unique_days_count || daysCoveredCount);
        } else {
          setQuestionCount((prev) => prev + 1);
        }
      }
    } catch (err) {
      setError(err.message || 'Error sending answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setView('selector');
    setMessages([]);
    setFeedback(null);
    setError(null);
  };

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

        <div className="header-tagline-badge">
          <Sparkles size={13} color="#a5b4fc" />
          <span>Build the interviewer, not the interview.</span>
        </div>
      </header>

      {/* Main SaaS Layout (Sidebar + Content) */}
      <div className="saas-body-wrapper">
        {/* Left Sidebar */}
        <aside className="saas-sidebar">
          <div className="sidebar-nav-section">
            <div className="nav-group-label">NAVIGATION</div>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'candidates' || view === 'selector' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('candidates');
                if (view !== 'selector' && !view === 'chat') handleRestart();
              }}
            >
              <Users size={18} />
              <span>Candidates</span>
              <span className="nav-count-badge">{candidates.length}</span>
            </button>

            <button 
              className={`sidebar-nav-btn ${view === 'chat' ? 'active' : ''}`}
              onClick={() => {
                if (messages.length > 0) setView('chat');
              }}
              disabled={messages.length === 0}
            >
              <MessageSquare size={18} />
              <span>Interviews</span>
              {view === 'chat' && <span className="nav-live-dot" />}
            </button>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </button>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
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

          {view === 'selector' && (
            <CandidateSelector
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
              onStartInterview={handleStartInterview}
              loading={loading}
            />
          )}

          {view === 'chat' && (
            <ChatInterface
              candidate={selectedCandidate}
              messages={messages}
              onSendTurn={handleSendTurn}
              loading={loading}
              questionCount={questionCount}
              daysCoveredCount={daysCoveredCount}
              onBackToCandidates={handleRestart}
            />
          )}

          {view === 'feedback' && (
            <FeedbackView
              candidate={selectedCandidate}
              feedback={feedback}
              onRestart={handleRestart}
            />
          )}
        </main>
      </div>
    </div>
  );
}
