import React, { useState, useEffect } from 'react';
import { fetchCandidates, startInterview, sendInterviewTurn, getSessionDebug } from './services/api';
import CandidateSelector from './components/CandidateSelector';
import ChatInterface from './components/ChatInterface';
import FeedbackView from './components/FeedbackView';
import { Bot } from 'lucide-react';

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [view, setView] = useState('selector'); // 'selector' | 'chat' | 'feedback'
  
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
    <div className="app-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="logo">
          <Bot size={28} color="#6366f1" />
          <span>THE INTERVIEW AGENT</span>
        </div>
        <div className="tagline-badge">
          Build the interviewer, not the interview
        </div>
      </header>

      {/* Main Content */}
      <main className="main-wrapper">
        {error && (
          <div className="glass-card" style={{ borderLeft: '4px solid #ef4444', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)' }}>
            <p style={{ color: '#fca5a5', fontWeight: 500 }}>{error}</p>
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
  );
}
