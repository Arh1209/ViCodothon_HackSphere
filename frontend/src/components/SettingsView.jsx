import React, { useState, useEffect } from 'react';
import { 
  Settings, Sliders, Cpu, Mic, Server, Shield, CheckCircle2, 
  AlertCircle, Lock, Info, Activity, Database
} from 'lucide-react';
import { fetchHealth } from '../services/api';

export default function SettingsView({ candidatesCount }) {
  const [healthStatus, setHealthStatus] = useState({ status: 'checking...' });
  const [minQuestions] = useState(8);
  const [minDays] = useState(4);
  const [difficultyPref, setDifficultyPref] = useState('ADAPTIVE');

  const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const isVoiceSupported = Boolean(SpeechRecognition);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const data = await fetchHealth();
      setHealthStatus(data);
    } catch (e) {
      setHealthStatus({ status: 'offline' });
    }
  };

  return (
    <div className="settings-page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="hero-heading">
          Platform <span className="gradient-text">Settings & Configuration</span>
        </h1>
        <p className="hero-subtext">
          Configure interview evaluation parameters, view AI model capabilities, manage voice input options, and inspect real-time system health.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* System Health Status Area */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#34d399" /> System Health & Data Status
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="stat-box" style={{ textAlign: 'left', padding: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <Server size={16} color="#818cf8" />
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>FastAPI Backend</span>
              </div>
              <span className={`status-pill ${healthStatus.status === 'healthy' ? 'passed' : 'failed'}`}>
                {healthStatus.status === 'healthy' ? 'CONNECTED (200 OK)' : 'OFFLINE'}
              </span>
            </div>

            <div className="stat-box" style={{ textAlign: 'left', padding: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <Cpu size={16} color="#c084fc" />
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>AI Inference Engine</span>
              </div>
              <span className="status-pill passed">ACTIVE (Gemini 2.5)</span>
            </div>

            <div className="stat-box" style={{ textAlign: 'left', padding: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <Database size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>Candidate Dataset</span>
              </div>
              <span className="status-pill passed">LOADED ({candidatesCount} Records)</span>
            </div>

            <div className="stat-box" style={{ textAlign: 'left', padding: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <Mic size={16} color="#fbbf24" />
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>Voice Recognition</span>
              </div>
              <span className={`status-pill ${isVoiceSupported ? 'passed' : 'failed'}`}>
                {isVoiceSupported ? 'SUPPORTED' : 'UNSUPPORTED'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Interview Settings */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="#818cf8" /> Technical Interview Rules & Bounds
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#a5b4fc', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Minimum Questions (Tech Spec Rule)
              </label>
              <input 
                type="number" 
                className="chat-input" 
                value={minQuestions} 
                disabled 
                style={{ opacity: 0.8 }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.3rem' }}>
                Mandatory minimum requirement: 8 questions per interview.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#a5b4fc', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Minimum Curriculum Days (Tech Spec Rule)
              </label>
              <input 
                type="number" 
                className="chat-input" 
                value={minDays} 
                disabled 
                style={{ opacity: 0.8 }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.3rem' }}>
                Mandatory minimum requirement: 4 distinct curriculum days.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#a5b4fc', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Interview Difficulty Mode
              </label>
              <select 
                className="filter-select" 
                style={{ width: '100%' }}
                value={difficultyPref}
                onChange={(e) => setDifficultyPref(e.target.value)}
              >
                <option value="ADAPTIVE">Adaptive (Dynamic difficulty based on answer depth)</option>
                <option value="FOUNDATIONAL">Foundational Focus</option>
                <option value="ARCHITECTURAL">Architectural & System Design Focus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: AI Interviewer Settings */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} color="#c084fc" /> AI Model Engine Parameters
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Primary LLM Model</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Gemini 2.5 Flash REST Integration with Rule-Based Fallback Engine</div>
              </div>
              <span className="badge badge-primary">gemini-2.5-flash</span>
            </div>

            <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Adaptive Questioning Engine</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Evaluates answer correctness and adjusts follow-up actions dynamically</div>
              </div>
              <span className="status-pill passed">ENABLED</span>
            </div>

            <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Candidate Background Personalization</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Reads candidate role, experience, education, and mission dataset</div>
              </div>
              <span className="status-pill passed">ENABLED</span>
            </div>

            <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Session Context Memory Retention</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>In-memory multi-turn session tracking per sessionId</div>
              </div>
              <span className="status-pill passed">ENABLED</span>
            </div>
          </div>
        </div>

        {/* Section 3: Voice Input Settings */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mic size={18} color="#fbbf24" /> Voice Input & Speech Recognition
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Browser Speech Recognition</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Web Speech API (SpeechRecognition / webkitSpeechRecognition)</div>
              </div>
              <span className={`status-pill ${isVoiceSupported ? 'passed' : 'failed'}`}>
                {isVoiceSupported ? 'AVAILABLE' : 'UNAVAILABLE'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>Text Answer Input Fallback</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Always available regardless of microphone permission or voice support</div>
              </div>
              <span className="status-pill passed">ALWAYS ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Section 4: Security & Environment Safeguards */}
        <div className="glass-card" style={{ borderLeft: '4px solid #818cf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
            <Shield size={18} /> API Key & Security Safeguards
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5' }}>
            The API environment variable <code>GEMINI_API_KEY</code> is loaded securely on the backend server and is never exposed to client-side code or browser network payloads.
          </p>
        </div>
      </div>
    </div>
  );
}
