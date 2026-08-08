import React, { useState, useMemo } from 'react';
import { 
  User, Briefcase, GraduationCap, Award, Play, Eye, X, Search, Filter, ArrowUpDown, Trash2,
  Sparkles, Sliders, Cpu, BarChart3, CheckCircle2, AlertCircle, Clock, BookOpen, Layers, ShieldCheck, UserCheck
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

export default function CandidateSelector({ 
  candidates, 
  selectedCandidate, 
  onSelectCandidate, 
  onStartInterview, 
  onCandidateAdded,
  loading 
}) {
  const [profileModalCandidate, setProfileModalCandidate] = useState(null);
  const [deleteConfirmCandidate, setDeleteConfirmCandidate] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    job_role: '',
    years_experience: 3,
    education: 'BS Computer Science',
    skills: '',
    resume: ''
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmCandidate) return;
    const candId = deleteConfirmCandidate.member?.id;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const { deleteCandidate } = await import('../services/api');
      await deleteCandidate(candId);
      setDeleteConfirmCandidate(null);
      setToastMessage("Candidate deleted successfully.");
      setTimeout(() => setToastMessage(null), 3000);
      if (onCandidateAdded) onCandidateAdded();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete candidate.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [expFilter, setExpFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('RECOMMENDED');

  const getInitials = (name) => {
    if (!name) return 'CA';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.full_name || !addForm.full_name.trim()) {
      setAddError('Full Name is required.');
      return;
    }
    if (!addForm.email || !addForm.email.trim() || !addForm.email.includes('@')) {
      setAddError('A valid Email address is required.');
      return;
    }
    if (!addForm.job_role || !addForm.job_role.trim()) {
      setAddError('Position / Job Applied For is required.');
      return;
    }

    setAddLoading(true);
    setAddError(null);
    try {
      const { addCandidate } = await import('../services/api');
      const res = await addCandidate({
        ...addForm,
        years_experience: parseFloat(addForm.years_experience) || 0
      });
      setShowAddModal(false);
      const addedCand = res.candidate;
      setAddForm({
        full_name: '',
        email: '',
        phone: '',
        job_role: '',
        years_experience: 3,
        education: 'BS Computer Science',
        skills: '',
        resume: ''
      });
      
      // Reset search filters so the newly added candidate is not hidden
      setSearchQuery('');
      setRoleFilter('ALL');
      setExpFilter('ALL');

      // Show success toast notification
      setToastMessage(`Candidate "${addedCand.member.name}" created successfully!`);
      setTimeout(() => setToastMessage(null), 4000);

      // Auto-select the newly added candidate and scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onSelectCandidate) onSelectCandidate(addedCand);
      if (onCandidateAdded) onCandidateAdded(addedCand);
    } catch (err) {
      setAddError(err.message || 'Failed to add candidate.');
    } finally {
      setAddLoading(false);
    }
  };

  // Extract distinct roles for dropdown filter
  const distinctRoles = useMemo(() => {
    const roles = new Set(candidates.map(c => c.member?.jobRole).filter(Boolean));
    return Array.from(roles);
  }, [candidates]);

  // Filter & Sort Candidate List
  const filteredCandidates = useMemo(() => {
    return candidates.filter(cand => {
      const member = cand.member || {};
      const query = searchQuery.toLowerCase().trim();
      
      const matchesSearch = !query || (
        member.name?.toLowerCase().includes(query) ||
        member.id?.toLowerCase().includes(query) ||
        member.jobRole?.toLowerCase().includes(query) ||
        member.education?.toLowerCase().includes(query)
      );

      const matchesRole = roleFilter === 'ALL' || member.jobRole === roleFilter;

      const exp = member.yearsExperience || 0;
      let matchesExp = true;
      if (expFilter === 'JUNIOR') matchesExp = exp < 4;
      else if (expFilter === 'MID') matchesExp = exp >= 4 && exp <= 7;
      else if (expFilter === 'SENIOR') matchesExp = exp >= 8;

      return matchesSearch && matchesRole && matchesExp;
    }).sort((a, b) => {
      const aMem = a.member || {};
      const bMem = b.member || {};
      const aSig = a.signals || {};
      const bSig = b.signals || {};

      if (sortBy === 'EXPERIENCE_DESC') return (bMem.yearsExperience || 0) - (aMem.yearsExperience || 0);
      if (sortBy === 'NAME_ASC') return (aMem.name || '').localeCompare(bMem.name || '');
      if (sortBy === 'COMPLETION_DESC') return (bSig.missionsCompleted || 0) - (aSig.missionsCompleted || 0);
      return 0;
    });
  }, [candidates, searchQuery, roleFilter, expFilter, sortBy]);

  return (
    <div className="candidate-selector-container">
      {/* Header Section */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="hero-heading">
            Manage <span className="gradient-text">Candidates</span> ({candidates.length})
          </h1>
          <p className="hero-subtext">
            Select a candidate to launch an interview or add a new candidate account to the evaluation cohort.
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
          </div>
        </div>

        {/* Admin Add Candidate Button */}
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
        >
          <User size={16} /> + Add Candidate
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card filter-toolbar" style={{ marginBottom: '1.75rem', padding: '1rem 1.25rem' }}>
        <div className="filter-controls-row">
          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search candidate name, ID, role, or education..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {/* Role Filter */}
          <div className="select-wrapper">
            <Filter size={14} color="#a5b4fc" />
            <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="ALL">All Roles ({candidates.length})</option>
              {distinctRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div className="select-wrapper">
            <Briefcase size={14} color="#38bdf8" />
            <select className="filter-select" value={expFilter} onChange={(e) => setExpFilter(e.target.value)}>
              <option value="ALL">All Experience Levels</option>
              <option value="JUNIOR">Junior (&lt;4 yrs)</option>
              <option value="MID">Mid Level (4-7 yrs)</option>
              <option value="SENIOR">Senior (8+ yrs)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="select-wrapper">
            <ArrowUpDown size={14} color="#34d399" />
            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="RECOMMENDED">Sort: Recommended</option>
              <option value="EXPERIENCE_DESC">Sort: Experience (High to Low)</option>
              <option value="COMPLETION_DESC">Sort: Mission Progress</option>
              <option value="NAME_ASC">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3-Column Candidate Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="glass-card empty-state-box" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2.5rem' }}>
          <User size={40} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Candidates Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No candidate matched your search query or filter criteria.</p>
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '1rem' }}
            onClick={() => { setSearchQuery(''); setRoleFilter('ALL'); setExpFilter('ALL'); setSortBy('RECOMMENDED'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="candidate-grid-3col">
          {filteredCandidates.map((cand, index) => {
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {cand.isRegisteredUser || member.status === 'REGISTERED' ? (
                      <span className="recommended-badge" style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#e9d5ff' }}>
                        <UserCheck size={12} /> Registered
                      </span>
                    ) : isRecommended ? (
                      <span className="recommended-badge">
                        <Sparkles size={12} /> Recommended
                      </span>
                    ) : null}
                    <button 
                      className="btn-delete-icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmCandidate(cand);
                      }}
                      title={`Delete ${member.name}`}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.25rem 0.45rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
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
      )}

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

      {/* Admin Add Candidate Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>Add New Candidate (Admin)</h2>
                <p style={{ fontSize: '0.85rem', color: '#a5b4fc' }}>Register candidate credentials and technical evaluation profile.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            {addError && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '10px', fontSize: '0.85rem', marginTop: '1rem' }}>
                {addError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Full Name *</label>
                <input 
                  type="text" 
                  className="chat-input" 
                  style={{ width: '100%' }}
                  placeholder="e.g. Alex Rivera"
                  value={addForm.full_name}
                  onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Email Address *</label>
                  <input 
                    type="email" 
                    className="chat-input" 
                    style={{ width: '100%' }}
                    placeholder="alex@example.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Phone Number</label>
                  <input 
                    type="tel" 
                    className="chat-input" 
                    style={{ width: '100%' }}
                    placeholder="+1 (555) 019-2834"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Position / Job Applied For *</label>
                  <input 
                    type="text" 
                    className="chat-input" 
                    style={{ width: '100%' }}
                    placeholder="e.g. Senior AI Engineer"
                    value={addForm.job_role}
                    onChange={(e) => setAddForm({ ...addForm, job_role: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Years Experience *</label>
                  <input 
                    type="number" 
                    className="chat-input" 
                    style={{ width: '100%' }}
                    value={addForm.years_experience}
                    onChange={(e) => setAddForm({ ...addForm, years_experience: e.target.value })}
                    min="0"
                    max="40"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Highest Education</label>
                <input 
                  type="text" 
                  className="chat-input" 
                  style={{ width: '100%' }}
                  placeholder="e.g. MS Computer Science"
                  value={addForm.education}
                  onChange={(e) => setAddForm({ ...addForm, education: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Technical Skills (comma-separated)</label>
                <input 
                  type="text" 
                  className="chat-input" 
                  style={{ width: '100%' }}
                  placeholder="e.g. Python, PyTorch, FastAPI, Vector Search, MCP"
                  value={addForm.skills}
                  onChange={(e) => setAddForm({ ...addForm, skills: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#a5b4fc', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Resume Link / Document Reference</label>
                <input 
                  type="text" 
                  className="chat-input" 
                  style={{ width: '100%' }}
                  placeholder="https://drive.google.com/resume.pdf or summary text"
                  value={addForm.resume}
                  onChange={(e) => setAddForm({ ...addForm, resume: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addLoading}>
                  {addLoading ? 'Saving Candidate...' : 'Save / Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Candidate Confirmation Modal */}
      {deleteConfirmCandidate && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmCandidate(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
            <div className="modal-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: '#fca5a5' }}>Delete Candidate?</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setDeleteConfirmCandidate(null)}>
                <X size={20} />
              </button>
            </div>

            {deleteError && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '10px', fontSize: '0.85rem', marginTop: '1rem' }}>
                {deleteError}
              </div>
            )}

            <div className="modal-body" style={{ padding: '1rem 0' }}>
              <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong style={{ color: '#fff' }}>{deleteConfirmCandidate.member?.name}</strong>?
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmCandidate(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleConfirmDelete} 
                disabled={deleteLoading}
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #34d399',
          color: '#34d399',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          zIndex: 2000
        }}>
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}
    </div>
  );
}
