import React from 'react';
import { User, Briefcase, GraduationCap, Award, Play } from 'lucide-react';

export default function CandidateSelector({ candidates, selectedCandidate, onSelectCandidate, onStartInterview, loading }) {
  return (
    <div>
      <div className="hero-title">Select a Candidate for Interview</div>
      <p className="hero-subtitle">
        Choose a candidate from the cohort dataset. The AI interviewer will personalize questions, difficulty, and technical focus based on their background.
      </p>

      <div className="candidate-grid">
        {candidates.map((cand) => {
          const member = cand.member;
          const signals = cand.signals || {};
          const isSelected = selectedCandidate?.member?.id === member.id;

          return (
            <div
              key={member.id}
              className={`glass-card candidate-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectCandidate(cand)}
            >
              <div>
                <div className="candidate-header">
                  <div>
                    <div className="candidate-name">{member.name}</div>
                    <div className="candidate-role">{member.jobRole}</div>
                  </div>
                  <span className="tagline-badge">{member.id}</span>
                </div>

                <div className="candidate-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Briefcase size={14} /> {member.yearsExperience} yrs exp
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <GraduationCap size={14} /> {member.education}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  <span className="stat-pill">
                    <Award size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {signals.missionsCompleted || 0} Missions Completed
                  </span>
                  <span className="stat-pill">
                    {signals.commitDays || 0} Commit Days
                  </span>
                  <span className="stat-pill">
                    {signals.missionsFirstTry || 0} 1st Try Passes
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: isSelected ? '#818cf8' : 'var(--text-subtle)' }}>
                  {isSelected ? 'Ready to launch interview' : 'Click to select candidate'}
                </span>
                {isSelected && (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartInterview();
                    }}
                    disabled={loading}
                  >
                    <Play size={14} /> Start Interview
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
