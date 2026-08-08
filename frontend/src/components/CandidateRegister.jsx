import React, { useState } from 'react';
import { registerCandidate } from '../services/api';
import { UserPlus, LogIn, Bot, Mail, Key, User, Briefcase, GraduationCap } from 'lucide-react';

export default function CandidateRegister({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    job_role: '',
    years_experience: 3,
    education: 'BS Computer Science'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password || !formData.job_role) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await registerCandidate({
        ...formData,
        years_experience: parseFloat(formData.years_experience) || 0
      });
      onRegisterSuccess(data.candidate);
    } catch (err) {
      setError(err.message || 'Registration failed. Duplicate email or invalid input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="logo-icon-glow" style={{ margin: '0 auto 0.85rem auto', width: '48px', height: '48px' }}>
            <Bot size={28} color="#c084fc" />
          </div>
          <h2 className="hero-heading" style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>
            Candidate <span className="gradient-text">Registration</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Create your evaluation profile to take adaptive technical interviews.
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
              Full Name *
            </label>
            <div className="search-input-wrapper" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <User size={16} color="#94a3b8" />
              <input 
                type="text" 
                name="full_name"
                className="search-input" 
                placeholder="Jane Doe"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Email Address *
              </label>
              <div className="search-input-wrapper" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Mail size={16} color="#94a3b8" />
                <input 
                  type="email" 
                  name="email"
                  className="search-input" 
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Password (min 6 chars) *
              </label>
              <div className="search-input-wrapper" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Key size={16} color="#94a3b8" />
                <input 
                  type="password" 
                  name="password"
                  className="search-input" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Target Job Role *
              </label>
              <div className="search-input-wrapper" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Briefcase size={16} color="#94a3b8" />
                <input 
                  type="text" 
                  name="job_role"
                  className="search-input" 
                  placeholder="e.g. AI Engineer"
                  value={formData.job_role}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Years of Experience *
              </label>
              <div className="search-input-wrapper" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <input 
                  type="number" 
                  name="years_experience"
                  className="search-input" 
                  value={formData.years_experience}
                  onChange={handleChange}
                  min="0"
                  max="40"
                  step="0.5"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
              Highest Education
            </label>
            <div className="search-input-wrapper" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <GraduationCap size={16} color="#94a3b8" />
              <input 
                type="text" 
                name="education"
                className="search-input" 
                placeholder="e.g. MS Computer Science"
                value={formData.education}
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem' }}
          >
            <UserPlus size={16} /> {loading ? 'Creating Profile...' : 'Register & Continue'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
          <button 
            onClick={onSwitchToLogin}
            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}
          >
            <LogIn size={14} /> Already have an account? Log In
          </button>
        </div>
      </div>
    </div>
  );
}
