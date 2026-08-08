import React from 'react';
import { 
  Users, MessageSquare, CheckCircle2, Clock, Play, HelpCircle, 
  BookOpen, Sparkles, ArrowRight, Activity, Award, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function DashboardView({ 
  candidates, 
  sessions, 
  onStartNewInterview, 
  onViewSessionDetail,
  onSelectCandidate
}) {
  const totalCandidates = candidates.length;
  const totalInterviews = sessions.length;
  const completedInterviews = sessions.filter(s => s.done).length;
  const activeInterviews = sessions.filter(s => !s.done).length;

  const totalQCount = sessions.reduce((acc, s) => acc + (s.questionCount || 0), 0);
  const avgQCount = totalInterviews > 0 ? (totalQCount / totalInterviews).toFixed(1) : '0';

  const totalDays = sessions.reduce((acc, s) => acc + (s.uniqueDaysCount || 0), 0);
  const avgDays = totalInterviews > 0 ? (totalDays / totalInterviews).toFixed(1) : '0';

  // Sort candidates by completion
  const sortedCandidates = [...candidates].sort((a, b) => 
    (b.signals?.missionsCompleted || 0) - (a.signals?.missionsCompleted || 0)
  );
  const topCandidates = sortedCandidates.slice(0, 3);
  const availableCandidates = candidates.slice(0, 4);

  // Curriculum day frequencies
  const dayCounts = {};
  sessions.forEach(s => {
    (s.daysCovered || []).forEach(d => {
      dayCounts[d] = (dayCounts[d] || 0) + 1;
    });
  });

  const targetDays = [7, 8, 10, 12, 13, 16, 21, 22, 28, 31];

  return (
    <div className="dashboard-container">
      {/* Hero Welcome Banner */}
      <div className="dashboard-hero-card">
        <div>
          <div className="hero-badge">
            <Sparkles size={14} color="#38bdf8" /> AI Technical Evaluation System
          </div>
          <h1 className="hero-heading" style={{ fontSize: '1.8rem', marginTop: '0.4rem' }}>
            Interview Agent <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="hero-subtext" style={{ marginBottom: '1.25rem' }}>
            Real-time personalized technical evaluations powered by dynamic adaptive AI, cohort learning signals, and multi-turn context.
          </p>

          <button className="btn btn-primary" onClick={onStartNewInterview} style={{ padding: '0.75rem 1.5rem' }}>
            <Play size={16} fill="currentColor" /> Start New Technical Interview
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box purple">
            <Users size={20} />
          </div>
          <div>
            <div className="metric-value">{totalCandidates}</div>
            <div className="metric-label">Total Candidates</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box cyan">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="metric-value">{totalInterviews}</div>
            <div className="metric-label">Total Sessions</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box emerald">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="metric-value">{completedInterviews}</div>
            <div className="metric-label">Completed Interviews</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box amber">
            <Clock size={20} />
          </div>
          <div>
            <div className="metric-value">{activeInterviews}</div>
            <div className="metric-label">Active / In Progress</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box purple">
            <HelpCircle size={20} />
          </div>
          <div>
            <div className="metric-value">{avgQCount}</div>
            <div className="metric-label">Avg Questions / Session</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box cyan">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="metric-value">{avgDays}</div>
            <div className="metric-label">Avg Days Covered</div>
          </div>
        </div>
      </div>

      {/* 2 Column Layout: Recent Interviews & Candidate Overview */}
      <div className="dashboard-grid-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Recent Interviews */}
        <div className="glass-card">
          <div className="section-header-row">
            <h3 style={{ color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#818cf8" /> Recent Interview Sessions
            </h3>
            <span className="badge badge-primary">{sessions.length} Recorded</span>
          </div>

          {sessions.length === 0 ? (
            <div className="empty-state-box">
              <MessageSquare size={32} color="#64748b" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No interview sessions recorded yet.</p>
              <button className="btn btn-secondary" onClick={onStartNewInterview} style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}>
                Launch First Interview
              </button>
            </div>
          ) : (
            <div className="recent-sessions-list">
              {sessions.slice(-5).reverse().map((sess) => (
                <div key={sess.sessionId} className="recent-session-item">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="candidate-name-text">{sess.candidateName}</span>
                      <span className={`status-pill ${sess.done ? 'passed' : 'failed'}`}>
                        {sess.done ? 'COMPLETED' : 'IN PROGRESS'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      {sess.jobRole} • {sess.questionCount} Questions • {sess.uniqueDaysCount} Days Covered
                    </div>
                  </div>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => onViewSessionDetail(sess.sessionId)}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Candidate Overview */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#34d399" /> Candidate Overview
          </h3>

          <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
            HIGHEST CURRICULUM COMPLETION
          </div>
          <div className="mini-candidates-list" style={{ marginBottom: '1.25rem' }}>
            {topCandidates.map(c => (
              <div key={c.member.id} className="mini-candidate-item" onClick={() => onSelectCandidate(c)}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{c.member.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{c.member.jobRole}</div>
                </div>
                <span className="stat-pill">{c.signals?.missionsCompleted || 0} Missions</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
            AVAILABLE FOR INTERVIEW
          </div>
          <div className="mini-candidates-list">
            {availableCandidates.map(c => (
              <div key={c.member.id} className="mini-candidate-item" onClick={() => onSelectCandidate(c)}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{c.member.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{c.member.yearsExperience} yrs exp</div>
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curriculum Coverage Distribution */}
      <div className="glass-card">
        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={18} color="#38bdf8" /> Curriculum Days Testing Coverage
        </h3>

        <div className="curriculum-bars-grid">
          {targetDays.map(d => {
            const count = dayCounts[d] || 0;
            const percentage = Math.min(100, count * 25);
            return (
              <div key={d} className="curriculum-bar-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '0.3rem' }}>
                  <span>Day {d} Module</span>
                  <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{count} {count === 1 ? 'test' : 'tests'}</span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${percentage > 0 ? percentage : 8}%`, background: percentage > 0 ? 'linear-gradient(90deg, #6366f1, #38bdf8)' : 'rgba(255,255,255,0.08)' }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
