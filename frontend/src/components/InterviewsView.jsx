import React, { useState } from 'react';
import { 
  MessageSquare, CheckCircle2, Clock, Eye, ArrowLeft, Bot, User, 
  HelpCircle, Calendar, Award, AlertTriangle, ArrowRightCircle, Sparkles, Filter
} from 'lucide-react';

export default function InterviewsView({ sessions, onStartNewInterview }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'IN_PROGRESS' | 'COMPLETED'
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const filteredSessions = sessions.filter(s => {
    if (filter === 'COMPLETED') return s.done;
    if (filter === 'IN_PROGRESS') return !s.done;
    return true;
  });

  const selectedSession = sessions.find(s => s.sessionId === selectedSessionId);

  if (selectedSession) {
    const messages = selectedSession.messages || [];
    const feedback = selectedSession.feedback;

    return (
      <div className="interview-detail-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setSelectedSessionId(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} /> Back to Sessions List
          </button>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.4rem' }}>
              Interview Details: <span className="gradient-text">{selectedSession.candidateName}</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              {selectedSession.jobRole} • Session ID: <code>{selectedSession.sessionId}</code>
            </p>
          </div>
        </div>

        {/* Status Pills Bar */}
        <div className="glass-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
          <span className="badge badge-primary">
            <HelpCircle size={14} /> {selectedSession.questionCount} Questions Asked
          </span>
          <span className="badge badge-cyan">
            <Calendar size={14} /> {selectedSession.uniqueDaysCount} Curriculum Days Covered
          </span>
          <span className={`status-pill ${selectedSession.done ? 'passed' : 'failed'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
            {selectedSession.done ? 'INTERVIEW COMPLETED' : 'IN PROGRESS'}
          </span>
        </div>

        {/* Conversation Transcript */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} color="#818cf8" /> Full Conversation Transcript
          </h3>

          <div className="transcript-feed" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-row ${msg.role}`} style={{ maxWidth: '90%' }}>
                <div className={`avatar ${msg.role}`}>
                  {msg.role === 'interviewer' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className="bubble">
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Feedback Section if completed */}
        {feedback && (
          <div className="glass-card">
            <div className="feedback-section-title" style={{ color: '#818cf8', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              <Award size={20} /> Evaluation Report & Feedback
            </div>
            <p style={{ color: '#f1f5f9', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              {feedback.summary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h4 style={{ color: '#34d399', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={16} /> Observed Strengths
                </h4>
                <ul className="feedback-list strengths">
                  {(feedback.strengths || []).map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{ color: '#fbbf24', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertTriangle size={16} /> Technical Gaps
                </h4>
                <ul className="feedback-list gaps">
                  {(feedback.gaps || []).map((gp, i) => (
                    <li key={i}>{gp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#38bdf8', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ArrowRightCircle size={16} /> Recommended Next Steps
              </h4>
              <ul className="feedback-list next">
                {(feedback.next || []).map((nx, i) => (
                  <li key={i}>{nx}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="interviews-page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="hero-heading">
            Technical <span className="gradient-text">Interview Sessions</span>
          </h1>
          <p className="hero-subtext">
            Review recorded AI interview sessions, multi-turn transcripts, answer evaluations, and candidate feedback reports.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onStartNewInterview}>
          <Sparkles size={16} /> Start New Interview
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('ALL')}
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
          >
            All Sessions ({sessions.length})
          </button>
          <button 
            className={`btn ${filter === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('COMPLETED')}
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
          >
            Completed ({sessions.filter(s => s.done).length})
          </button>
          <button 
            className={`btn ${filter === 'IN_PROGRESS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('IN_PROGRESS')}
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
          >
            In Progress ({sessions.filter(s => !s.done).length})
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="glass-card empty-state-box" style={{ padding: '3rem', textAlign: 'center' }}>
          <MessageSquare size={40} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Interview Sessions Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No interview sessions match the selected filter criteria.</p>
          <button className="btn btn-primary" onClick={onStartNewInterview} style={{ marginTop: '1rem' }}>
            Start New Interview
          </button>
        </div>
      ) : (
        <div className="sessions-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredSessions.map(sess => (
            <div key={sess.sessionId} className="glass-card session-card-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>{sess.candidateName}</h3>
                  <span className={`status-pill ${sess.done ? 'passed' : 'failed'}`}>
                    {sess.done ? 'COMPLETED' : 'IN PROGRESS'}
                  </span>
                </div>
                <div style={{ color: '#a5b4fc', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  {sess.jobRole} • Candidate ID: <code>{sess.candidateId}</code>
                </div>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span><HelpCircle size={13} style={{ display: 'inline', marginRight: '4px' }} /> {sess.questionCount} Questions</span>
                  <span><Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} /> {sess.uniqueDaysCount} Curriculum Days</span>
                  <span><Clock size={13} style={{ display: 'inline', marginRight: '4px' }} /> {new Date(sess.createdAt * 1000).toLocaleTimeString()}</span>
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => setSelectedSessionId(sess.sessionId)}
                style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
              >
                <Eye size={14} /> View Transcript & Feedback
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
