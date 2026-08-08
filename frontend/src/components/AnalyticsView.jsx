import React from 'react';
import { 
  BarChart3, PieChart, Activity, Award, CheckCircle2, AlertTriangle, 
  HelpCircle, Calendar, Users, Cpu, Layers, Sparkles, TrendingUp
} from 'lucide-react';

export default function AnalyticsView({ sessions, candidates }) {
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.done).length;
  const inProgressSessions = sessions.filter(s => !s.done).length;

  const totalQuestions = sessions.reduce((sum, s) => sum + (s.questionCount || 0), 0);
  const avgQuestions = totalSessions > 0 ? (totalQuestions / totalSessions).toFixed(1) : 0;

  const totalDays = sessions.reduce((sum, s) => sum + (s.uniqueDaysCount || 0), 0);
  const avgDays = totalSessions > 0 ? (totalDays / totalSessions).toFixed(1) : 0;

  // Evaluation quality counters
  let strongCount = 0;
  let partialCount = 0;
  let weakCount = 0;

  sessions.forEach(s => {
    (s.evaluations || []).forEach(ev => {
      const corr = ev.correctness;
      if (corr === 'strong') strongCount++;
      else if (corr === 'partially_correct') partialCount++;
      else weakCount++;
    });
  });

  const totalEvals = strongCount + partialCount + weakCount;
  const strongPct = totalEvals > 0 ? Math.round((strongCount / totalEvals) * 100) : 0;
  const partialPct = totalEvals > 0 ? Math.round((partialCount / totalEvals) * 100) : 0;
  const weakPct = totalEvals > 0 ? Math.round((weakCount / totalEvals) * 100) : 0;

  // Curriculum days frequency
  const dayFreq = {};
  sessions.forEach(s => {
    (s.daysCovered || []).forEach(d => {
      dayFreq[d] = (dayFreq[d] || 0) + 1;
    });
  });

  const targetDays = [7, 8, 10, 12, 13, 16, 21, 22, 28, 31];

  return (
    <div className="analytics-page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="hero-heading">
          Evaluation <span className="gradient-text">Analytics & Insights</span>
        </h1>
        <p className="hero-subtext">
          Programmatic performance analysis, curriculum testing coverage, answer depth breakdown, and evaluation quality metrics.
        </p>
      </div>

      {totalSessions === 0 ? (
        <div className="glass-card empty-state-box" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <BarChart3 size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Interview Session Data Yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            Analytics will populate dynamically as candidates complete technical interview turns and evaluation sessions.
          </p>
        </div>
      ) : (
        <>
          {/* Top Metrics Row */}
          <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
            <div className="metric-card">
              <div className="metric-icon-box purple">
                <Activity size={20} />
              </div>
              <div>
                <div className="metric-value">{totalSessions}</div>
                <div className="metric-label">Total Sessions</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box emerald">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="metric-value">{completedSessions}</div>
                <div className="metric-label">Completed</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box cyan">
                <HelpCircle size={20} />
              </div>
              <div>
                <div className="metric-value">{avgQuestions}</div>
                <div className="metric-label">Avg Questions / Interview</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box amber">
                <Calendar size={20} />
              </div>
              <div>
                <div className="metric-value">{avgDays}</div>
                <div className="metric-label">Avg Days Covered</div>
              </div>
            </div>
          </div>

          {/* 2 Column Layout: Answer Depth & Performance Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Answer Depth & Quality Distribution */}
            <div className="glass-card">
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieChart size={18} color="#c084fc" /> Answer Depth & Technical Precision
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>Strong Technical Answers</span>
                    <span>{strongCount} ({strongPct}%)</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${strongPct}%`, background: '#34d399' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>Partially Correct / Intermediate</span>
                    <span>{partialCount} ({partialPct}%)</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${partialPct}%`, background: '#fbbf24' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#fca5a5', fontWeight: 600 }}>Foundational / Brief Answers</span>
                    <span>{weakCount} ({weakPct}%)</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${weakPct}%`, background: '#ef4444' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Cohort Progress Summary */}
            <div className="glass-card">
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#38bdf8" /> Cohort Performance Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {candidates.slice(0, 4).map(c => {
                  const completedMissions = c.signals?.missionsCompleted || 0;
                  const pct = Math.round((completedMissions / 31) * 100);
                  return (
                    <div key={c.member.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{c.member.name} ({c.member.jobRole})</span>
                        <span style={{ color: '#a5b4fc' }}>{completedMissions} / 31 Days ({pct}%)</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6366f1, #c084fc)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Curriculum Day Coverage Breakdown */}
          <div className="glass-card">
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="#34d399" /> Curriculum Days Tested Across Interviews
            </h3>

            <div className="curriculum-bars-grid">
              {targetDays.map(d => {
                const count = dayFreq[d] || 0;
                const percentage = Math.min(100, count * 30);
                return (
                  <div key={d} className="curriculum-bar-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '0.3rem' }}>
                      <span>Day {d} Module</span>
                      <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{count} evaluations</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${percentage > 0 ? percentage : 6}%`, background: percentage > 0 ? 'linear-gradient(90deg, #34d399, #38bdf8)' : 'rgba(255,255,255,0.08)' }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
