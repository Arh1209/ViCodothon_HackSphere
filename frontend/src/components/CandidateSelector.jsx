import React, { useState } from 'react';
import { 
  User, Briefcase, GraduationCap, Award, Play, Eye, X, 
  Sparkles, Sliders, Cpu, BarChart3, CheckCircle2, AlertCircle, Clock, BookOpen, Layers, ShieldCheck
} from 'lucide-react';

const AVATAR_COLORS = [
  { bg: 'linear-gradient(135deg, #6366f1, #a855f7)', border: '#818cf8', text: '#e0e7ff' }, // CAND-001
  { bg: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: '#38bdf8', text: '#e0f2fe' }, // CAND-002
  { bg: 'linear-gradient(135deg, #ec4899, #8b5cf6)', border: '#f472b6', text: '#fce7f3' }, // CAND-003
  { bg: 'linear-gradient(135deg, #10b981, #06b6d4)', border: '#34d399', text: '#ecfdf5' }, // CAND-004
  { bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', border: '#fbbf24', text: '#fffbeb' }, // CAND-005
  { bg: 'linear-gradient(135deg, #8b5cf6, #d946ef)', border: '#c084fc', text: '#f3e8ff' }, // CAND-006
  { bg: 'linear-gradient(135deg, #14b8a6, #3b82f6)', border: '#2dd4bf', text: '#ccfbf1' }, // CAND-007
  { bg: 'linear-gradient(135deg, #6366f1, #ec4899)', border: '#a5b4fc', text: '#e0e7ff' }, // CAND-008
  { bg: 'linear-gradient(135deg, #f97316, #e11d48)', border: '#fb923c', text: '#ffedd5' }, // CAND-009
  { bg: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: '#60a5fa', text: '#dbeafe' }, // CAND-010
];

export default function CandidateSelector({ candidates, selectedCandidate, onSelectCandidate, onStartInterview, loading }) {
  const [profileModalCandidate, setProfileModalCandidate] = useState(null);

  const getInitials = (name) => {
    if (!name) return 'CA';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="candidate-selector-container">
      {/* Header Section */}
      <div className="page-header">
        <h1 className="hero-heading">
          Select a <span className="gradient-text">Candidate</span> for Interview
        </h1>
        <p className="hero-subtext">
          Choose a candidate from the cohort dataset. The AI interviewer will personalize questions, difficulty, and technical focus based on their background.
        </p>

        {/* Feature Badges */}
        <div className="feature-badges-row">
          <div className="feature-badge">
            <Sparkles size={14} className="badge-icon purple" />
            <span>Personalized Questions</span>
          </div>
          <div className="feature-badge">
            <Sliders size={14} className="badge-icon cyan" />
            <span>Adaptive Difficulty</span>
          </div>
          <div className="feature-badge">
            <Cpu size={14} className="badge-icon emerald" />
            <span>Deep Technical Focus</span>
          </div>
          <div className="feature-badge">
            <BarChart3 size={14} className="badge-icon amber" />
            <span>Actionable Feedback</span>
          </div>
        </div>
      </div>

      {/* 3-Column Candidate Grid */}
      <div className="candidate-grid-3col">
        {candidates.map((cand, index) => {
          const member = cand.member || {};
          const signals = cand.signals || {};
          const isSelected = selectedCandidate?.member?.id === member.id;
          const avatarStyle = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const isRecommended = index === 0;

          return (
            <div
              key={member.id}
              className={`saas-candidate-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectCandidate(cand)}
            >
              {/* Card Header Top */}
              <div className="card-top-bar">
                <span className="candidate-id-badge">{member.id}</span>
                {isRecommended && (
                  <span className="recommended-badge">
                    <Sparkles size={12} /> Recommended
                  </span>
                )}
              </div>

              {/* Avatar & Basic Details */}
              <div className="candidate-profile-header">
                <div 
                  className="candidate-avatar-circle"
                  style={{
                    background: avatarStyle.bg,
                    boxShadow: `0 0 16px ${avatarStyle.border}40`,
                    borderColor: avatarStyle.border
                  }}
                >
                  <span className="avatar-initials" style={{ color: avatarStyle.text }}>
                    {getInitials(member.name)}
                  </span>
                </div>
                
                <h3 className="card-candidate-name">{member.name}</h3>
                <p className="card-candidate-role">{member.jobRole}</p>
              </div>

              {/* Meta Info: Experience & Education */}
              <div className="candidate-meta-grid">
                <div className="meta-item">
                  <Briefcase size={14} color="#818cf8" />
                  <span>{member.yearsExperience} yrs exp</span>
                </div>
                <div className="meta-item">
                  <GraduationCap size={14} color="#38bdf8" />
                  <span className="truncate">{member.education}</span>
                </div>
              </div>

              {/* 3 Statistics Boxes */}
              <div className="stats-boxes-row">
                <div className="stat-box">
                  <div className="stat-value">{signals.missionsCompleted || 0}</div>
                  <div className="stat-label">Missions</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{signals.commitDays || 0}</div>
                  <div className="stat-label">Commit Days</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{signals.missionsFirstTry || 0}</div>
                  <div className="stat-label">1st Try Passes</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card-actions-row">
                <button
                  className={`btn-start-interview ${isSelected ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCandidate(cand);
                    onStartInterview();
                  }}
                  disabled={loading}
                >
                  <Play size={14} fill="currentColor" /> Start Interview
                </button>
                <button
                  className="btn-view-profile"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileModalCandidate(cand);
                  }}
                >
                  <Eye size={14} /> Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Bar */}
      <div className="summary-cards-grid">
        <div className="summary-card">
          <div className="summary-icon-box purple">
            <User size={20} />
          </div>
          <div>
            <div className="summary-number">{candidates.length} Candidates</div>
            <div className="summary-desc">Available for interview</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon-box cyan">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="summary-number">31-Day Curriculum</div>
            <div className="summary-desc">8 Modules • 200+ Topics</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon-box emerald">
            <Cpu size={20} />
          </div>
          <div>
            <div className="summary-number">Adaptive AI Engine</div>
            <div className="summary-desc">Personalized interviews</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon-box amber">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="summary-number">Data-Driven</div>
            <div className="summary-desc">Insightful feedback</div>
          </div>
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {profileModalCandidate && (
        <div className="modal-backdrop" onClick={() => setProfileModalCandidate(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div 
                  className="candidate-avatar-circle small"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                >
                  {getInitials(profileModalCandidate.member.name)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>{profileModalCandidate.member.name}</h2>
                  <p style={{ fontSize: '0.85rem', color: '#a5b4fc' }}>
                    {profileModalCandidate.member.jobRole} ({profileModalCandidate.member.yearsExperience} yrs exp)
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setProfileModalCandidate(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section-title">Cohort Mission History & Progress</div>
              <div className="missions-list">
                {profileModalCandidate.missions?.map((m, idx) => (
                  <div key={idx} className="mission-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {m.passed ? (
                        <CheckCircle2 size={16} color="#34d399" />
                      ) : m.skipped ? (
                        <Clock size={16} color="#94a3b8" />
                      ) : (
                        <AlertCircle size={16} color="#fbbf24" />
                      )}
                      <span style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 500 }}>
                        Day {m.day}: {m.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {m.attempts && (
                        <span className="attempts-pill">{m.attempts} {m.attempts === 1 ? 'attempt' : 'attempts'}</span>
                      )}
                      <span className={`status-pill ${m.passed ? 'passed' : m.skipped ? 'skipped' : 'failed'}`}>
                        {m.passed ? 'PASSED' : m.skipped ? 'SKIPPED' : 'INCOMPLETE'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setProfileModalCandidate(null)}>
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  onSelectCandidate(profileModalCandidate);
                  setProfileModalCandidate(null);
                  onStartInterview();
                }}
              >
                <Play size={14} /> Start Interview for {profileModalCandidate.member.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
