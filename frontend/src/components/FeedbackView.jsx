import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRightCircle, RefreshCw, Award } from 'lucide-react';

export default function FeedbackView({ candidate, feedback, onRestart }) {
  const member = candidate?.member || {};
  const strengths = feedback?.strengths || [];
  const gaps = feedback?.gaps || [];
  const nextSteps = feedback?.next || [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', padding: '0.6rem 1.2rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>
          <Award size={18} style={{ marginRight: '6px' }} /> Technical Interview Completed
        </div>
        <h1 className="hero-title">Candidate Evaluation Report</h1>
        <p className="hero-subtitle">
          Performance assessment for <strong>{member.name}</strong> ({member.jobRole}, {member.yearsExperience} yrs exp)
        </p>
      </div>

      <div className="glass-card summary-card" style={{ marginBottom: '1.5rem' }}>
        <div className="feedback-section-title" style={{ color: '#818cf8' }}>
          Executive Summary
        </div>
        <p style={{ fontSize: '1.05rem', color: '#f1f5f9', lineHeight: '1.7' }}>
          {feedback?.summary}
        </p>
      </div>

      <div className="feedback-grid">
        {/* Strengths */}
        <div className="glass-card">
          <div className="feedback-section-title" style={{ color: '#34d399' }}>
            <CheckCircle2 size={20} /> Observed Strengths
          </div>
          <ul className="feedback-list strengths">
            {strengths.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Technical Gaps */}
        <div className="glass-card">
          <div className="feedback-section-title" style={{ color: '#fbbf24' }}>
            <AlertTriangle size={20} /> Areas Needing Improvement
          </div>
          <ul className="feedback-list gaps">
            {gaps.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Actionable Next Steps */}
        <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <div className="feedback-section-title" style={{ color: '#22d3ee' }}>
            <ArrowRightCircle size={20} /> Recommended Curriculum Next Steps
          </div>
          <ul className="feedback-list next">
            {nextSteps.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <button className="btn btn-primary" onClick={onRestart} style={{ padding: '0.9rem 2rem' }}>
          <RefreshCw size={18} /> Interview Another Candidate
        </button>
      </div>
    </div>
  );
}
