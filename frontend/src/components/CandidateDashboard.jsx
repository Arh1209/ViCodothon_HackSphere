import React from 'react';
import { 
  User, Play, Award, CheckCircle2, AlertTriangle, ArrowRightCircle, 
  Clock, HelpCircle, Calendar, MessageSquare, LogOut, Sparkles 
} from 'lucide-react';

export default function CandidateDashboard({ 
  candidate, 
  sessions, 
  onStartInterview, 
  onLogout 
}) {
  const member = candidate.member || {};
  const mySessions = sessions.filter(s => s.candidateId === member.id || s.candidateName === member.name);
  const completedCount = mySessions.filter(s => s.done).length;
  const inProgressCount = mySessions.filter(s => !s.done).length;
  const latestSession = mySessions.length > 0 ? mySessions[mySessions.length - 1] : null;

  return (
    <div className="candidate-portal-container" style={{ maxWidth: '950px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div className="dashboard-hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="hero-badge">
              <Sparkles size={14} color="#38bdf8" /> Candidate Portal Dashboard
            </div>
            <h1 className="hero-heading" style={{ fontSize: '1.8rem', marginTop: '0.4rem' }}>
              Welcome, <span className="gradient-text">{member.name}</span>
            </h1>
            <p className="hero-subtext" style={{ marginBottom: '1.25rem' }}>
              {member.jobRole} • {member.yearsExperience} yrs experience • {member.education || 'CS Degree'}
            </p>

            <button 
              className="btn btn-primary"
              onClick={onStartInterview}
              style={{ padding: '0.75rem 1.5rem' }}
            >
              <Play size={16} fill="currentColor" /> Start Technical Interview
            </button>
          </div>

          <button 
            className="btn btn-secondary"
            onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="metric-card">
          <div className="metric-icon-box purple">
            <User size={20} />
          </div>
          <div>
            <div className="metric-value">{mySessions.length}</div>
            <div className="metric-label">Total Interviews</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box emerald">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="metric-value">{completedCount}</div>
            <div className="metric-label">Completed Interviews</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box amber">
            <Clock size={20} />
          </div>
          <div>
            <div className="metric-value">{inProgressCount}</div>
            <div className="metric-label">In Progress</div>
          </div>
        </div>
      </div>

      {/* Latest Evaluation Report */}
      {latestSession && latestSession.feedback ? (
        <div className="glass-card" style={{ marginBottom: '1.75rem' }}>
          <div className="feedback-section-title" style={{ color: '#818cf8', fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} /> Latest Interview Evaluation Report
          </div>
          <p style={{ color: '#f1f5f9', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
            {latestSession.feedback.summary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h4 style={{ color: '#34d399', fontSize: '0.88rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={16} /> Verified Strengths
              </h4>
              <ul className="feedback-list strengths">
                {(latestSession.feedback.strengths || []).map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#fbbf24', fontSize: '0.88rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={16} /> Recommended Focus Areas
              </h4>
              <ul className="feedback-list gaps">
                {(latestSession.feedback.gaps || []).map((gp, i) => (
                  <li key={i}>{gp}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#38bdf8', fontSize: '0.88rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ArrowRightCircle size={16} /> Recommended Next Steps
            </h4>
            <ul className="feedback-list next">
              {(latestSession.feedback.next || []).map((nx, i) => (
                <li key={i}>{nx}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="glass-card empty-state-box" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.75rem' }}>
          <MessageSquare size={36} color="#64748b" style={{ marginBottom: '0.85rem' }} />
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.4rem' }}>No Interviews Completed Yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1rem' }}>
            Launch your technical evaluation session to receive adaptive AI questions and detailed performance feedback.
          </p>
          <button className="btn btn-primary" onClick={onStartInterview}>
            Start New Technical Interview
          </button>
        </div>
      )}

      {/* Previous Sessions History */}
      {mySessions.length > 0 && (
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }}>
            My Interview History ({mySessions.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mySessions.map(sess => (
              <div key={sess.sessionId} className="recent-session-item">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="candidate-name-text">Session {sess.sessionId.slice(-6)}</span>
                    <span className={`status-pill ${sess.done ? 'passed' : 'failed'}`}>
                      {sess.done ? 'COMPLETED' : 'IN PROGRESS'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    {sess.questionCount} Questions Asked • {sess.uniqueDaysCount} Curriculum Days Covered
                  </div>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#a5b4fc' }}>
                  {new Date(sess.createdAt * 1000).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
