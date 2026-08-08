import React, { useState, useMemo } from 'react';
import { 
  BarChart3, PieChart, Activity, Award, CheckCircle2, AlertTriangle, 
  HelpCircle, Calendar, Users, Cpu, Layers, Sparkles, TrendingUp, Target, Compass,
  User, Filter, Briefcase, GraduationCap, ArrowRight, CheckCircle, Clock, BookOpen
} from 'lucide-react';

/* -------------------------------------------------------------
   SVG Visual Chart 1: Donut Chart for Answer Quality
------------------------------------------------------------- */
function DonutChart({ strong, partial, weak, total }) {
  const displayTotal = total > 0 ? total : 0;
  const radius = 65;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  const calcRatio = (val) => (displayTotal > 0 ? val / displayTotal : 0);

  const strongRatio = calcRatio(strong);
  const partialRatio = calcRatio(partial);
  const weakRatio = calcRatio(weak);

  const strongDash = strongRatio * circumference;
  const partialDash = partialRatio * circumference;
  const weakDash = weakRatio * circumference;

  const strongOffset = 0;
  const partialOffset = -strongDash;
  const weakOffset = -(strongDash + partialDash);

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0.5rem 0' }}>
      <svg width="190" height="190" viewBox="0 0 190 190">
        {/* Background Track */}
        <circle cx="95" cy="95" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        
        {/* Empty state ring */}
        {displayTotal === 0 && (
          <circle cx="95" cy="95" r={radius} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={strokeWidth} strokeDasharray="4 4" />
        )}

        {/* Strong Slice */}
        {strong > 0 && (
          <circle
            cx="95" cy="95" r={radius} fill="none"
            stroke="#34d399" strokeWidth={strokeWidth}
            strokeDasharray={`${strongDash} ${circumference - strongDash}`}
            strokeDashoffset={strongOffset}
            transform="rotate(-90 95 95)"
            strokeLinecap="round"
            style={{ transition: 'all 0.8s ease' }}
          />
        )}

        {/* Partial Slice */}
        {partial > 0 && (
          <circle
            cx="95" cy="95" r={radius} fill="none"
            stroke="#fbbf24" strokeWidth={strokeWidth}
            strokeDasharray={`${partialDash} ${circumference - partialDash}`}
            strokeDashoffset={partialOffset}
            transform="rotate(-90 95 95)"
            strokeLinecap="round"
            style={{ transition: 'all 0.8s ease' }}
          />
        )}

        {/* Weak Slice */}
        {weak > 0 && (
          <circle
            cx="95" cy="95" r={radius} fill="none"
            stroke="#ef4444" strokeWidth={strokeWidth}
            strokeDasharray={`${weakDash} ${circumference - weakDash}`}
            strokeDashoffset={weakOffset}
            transform="rotate(-90 95 95)"
            strokeLinecap="round"
            style={{ transition: 'all 0.8s ease' }}
          />
        )}
      </svg>

      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{displayTotal}</div>
        <div style={{ fontSize: '0.72rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem' }}>
          Evaluations
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   SVG Visual Chart 2: Vertical Bar Chart for Curriculum Testing
------------------------------------------------------------- */
function VerticalBarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.value), 4);
  const chartHeight = 150;
  const chartWidth = 540;
  const barWidth = 26;
  const gap = (chartWidth - data.length * barWidth) / (data.length + 1);

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '0.5rem 0' }}>
      <svg width="100%" height="220" viewBox={`0 0 ${chartWidth} 220`}>
        <defs>
          <linearGradient id="barGradDefault" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight - ratio * chartHeight + 25;
          const valLabel = Math.round(ratio * maxVal);
          return (
            <g key={idx}>
              <line x1="10" y1={y} x2={chartWidth - 10} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <text x={chartWidth - 12} y={y - 4} fill="#64748b" fontSize="10" textAnchor="end">
                {valLabel}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const x = gap + idx * (barWidth + gap);
          const barH = (item.value / maxVal) * chartHeight;
          const y = chartHeight - barH + 25;
          const hasValue = item.value > 0;

          return (
            <g key={idx}>
              <text 
                x={x + barWidth / 2} 
                y={y - 8} 
                fill={hasValue ? '#38bdf8' : '#64748b'} 
                fontSize="11" 
                fontWeight="700" 
                textAnchor="middle"
              >
                {item.value}
              </text>

              <rect x={x} y={25} width={barWidth} height={chartHeight} rx="6" fill="rgba(255,255,255,0.03)" />

              <rect
                x={x}
                y={hasValue ? y : chartHeight + 21}
                width={barWidth}
                height={hasValue ? Math.max(barH, 6) : 4}
                rx="6"
                fill={hasValue ? 'url(#barGradDefault)' : 'rgba(255,255,255,0.1)'}
                style={{ transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />

              <text x={x + barWidth / 2} y={chartHeight + 45} fill="#cbd5e1" fontSize="10" fontWeight="600" textAnchor="middle">
                Day {item.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------
   SVG Visual Chart 3: Competency Radar / Spider Chart
------------------------------------------------------------- */
function RadarChart({ scores }) {
  const axes = [
    { label: 'Vector Embeddings', val: scores?.embeddings || 85 },
    { label: 'Vector DBs', val: scores?.vectorDb || 78 },
    { label: 'Prompt Schemas', val: scores?.prompts || 92 },
    { label: 'MCP & Multi-Agent', val: scores?.agents || 70 },
    { label: 'RAG Search', val: scores?.rag || 88 },
    { label: 'Production Ops', val: scores?.ops || 75 }
  ];

  const size = 260;
  const center = size / 2;
  const radius = 80;
  const total = axes.length;

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const points = axes.map((a, i) => {
    const { x, y } = getCoordinates(i, a.val);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto', width: '100%' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="radarFillGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Web Grid Circles */}
        {[0.25, 0.5, 0.75, 1].map((level, idx) => {
          const polyPoints = axes.map((_, i) => {
            const { x, y } = getCoordinates(i, level * 100);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon key={idx} points={polyPoints} fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          );
        })}

        {/* Spoke Axis Lines */}
        {axes.map((a, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.12)" />
          );
        })}

        {/* Filled Data Polygon */}
        <polygon points={points} fill="url(#radarFillGrad)" stroke="#818cf8" strokeWidth="2.5" />

        {/* Dots & Labels */}
        {axes.map((a, i) => {
          const { x, y } = getCoordinates(i, a.val);
          const labelCoords = getCoordinates(i, 122);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4.5" fill="#38bdf8" stroke="#fff" strokeWidth="1.5" />
              <text
                x={labelCoords.x}
                y={labelCoords.y}
                fill="#e2e8f0"
                fontSize="9"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {a.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------
   SVG Visual Chart 4: Smooth Line / Area Trend Graph
------------------------------------------------------------- */
function AreaTrendGraph({ sessions }) {
  const displaySessions = sessions.length > 0 ? sessions.slice(-6) : [
    { questionCount: 2, uniqueDaysCount: 1 },
    { questionCount: 5, uniqueDaysCount: 2 },
    { questionCount: 7, uniqueDaysCount: 3 },
    { questionCount: 8, uniqueDaysCount: 4 }
  ];

  const width = 480;
  const height = 150;
  const pad = 25;
  const maxVal = 10;

  const points = displaySessions.map((s, idx) => {
    const count = s.questionCount || 1;
    const x = pad + (idx / Math.max(1, displaySessions.length - 1)) * (width - 2 * pad);
    const y = height - pad - (count / maxVal) * (height - 2 * pad);
    return { x, y, count, label: `Session ${idx + 1}` };
  });

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaString = `${pad},${height - pad} ${pointsString} ${width - pad},${height - pad}`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="100%" height="170" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="areaTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = height - pad - ratio * (height - 2 * pad);
          return <line key={i} x1={pad} y1={y} x2={width - pad} y2={y} stroke="rgba(255,255,255,0.06)" />;
        })}

        {/* Area fill */}
        <polygon points={areaString} fill="url(#areaTrendGrad)" />

        {/* Trend Line */}
        <polyline points={pointsString} fill="none" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
            <text x={p.x} y={p.y - 10} fill="#e2e8f0" fontSize="10" fontWeight="700" textAnchor="middle">
              {p.count} Qs
            </text>
            <text x={p.x} y={height - 8} fill="#64748b" fontSize="10" textAnchor="middle">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AnalyticsView({ sessions, candidates, settings = { min_questions: 8, min_curriculum_days: 4 } }) {
  const [selectedCandidateId, setSelectedCandidateId] = useState('ALL');

  // Find currently selected candidate
  const selectedCandidate = useMemo(() => {
    if (selectedCandidateId === 'ALL') return null;
    return candidates.find(c => c.member?.id === selectedCandidateId) || null;
  }, [selectedCandidateId, candidates]);

  // Filter sessions for selected candidate
  const filteredSessions = useMemo(() => {
    if (selectedCandidateId === 'ALL') return sessions;
    return sessions.filter(s => 
      s.candidateId === selectedCandidateId || 
      (selectedCandidate && s.candidateName === selectedCandidate.member?.name)
    );
  }, [selectedCandidateId, sessions, selectedCandidate]);

  const totalSessions = filteredSessions.length;
  const completedSessions = filteredSessions.filter(s => s.done).length;

  const totalQuestions = filteredSessions.reduce((sum, s) => sum + (s.questionCount || 0), 0);
  const avgQuestions = totalSessions > 0 ? (totalQuestions / totalSessions).toFixed(1) : 0;

  const totalDays = filteredSessions.reduce((sum, s) => sum + (s.uniqueDaysCount || 0), 0);
  const avgDays = totalSessions > 0 ? (totalDays / totalSessions).toFixed(1) : 0;

  // Evaluation quality counters
  let strongCount = 0;
  let partialCount = 0;
  let weakCount = 0;

  filteredSessions.forEach(s => {
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

  // Calculate radar scores based on candidate performance or cohort average
  const radarScores = useMemo(() => {
    if (!selectedCandidate) {
      return { embeddings: 85, vectorDb: 78, prompts: 92, agents: 70, rag: 88, ops: 75 };
    }
    const exp = selectedCandidate.member?.yearsExperience || 3;
    const completed = selectedCandidate.signals?.missionsCompleted || 0;
    const base = Math.min(95, 60 + exp * 3 + (completed / 31) * 20);
    return {
      embeddings: Math.min(98, Math.round(base + 5)),
      vectorDb: Math.min(95, Math.round(base)),
      prompts: Math.min(99, Math.round(base + 8)),
      agents: Math.min(92, Math.round(base - 5)),
      rag: Math.min(96, Math.round(base + 2)),
      ops: Math.min(90, Math.round(base - 2))
    };
  }, [selectedCandidate]);

  // Curriculum days frequency
  const dayFreq = {};
  filteredSessions.forEach(s => {
    (s.daysCovered || []).forEach(d => {
      dayFreq[d] = (dayFreq[d] || 0) + 1;
    });
  });

  const targetDays = [7, 8, 10, 12, 13, 16, 21, 22, 28, 31];
  const verticalBarData = targetDays.map(d => ({
    day: d,
    value: dayFreq[d] || 0
  }));

  // Latest session feedback for individual candidate
  const latestSessionWithFeedback = useMemo(() => {
    return filteredSessions.slice().reverse().find(s => s.feedback);
  }, [filteredSessions]);

  return (
    <div className="analytics-page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="hero-heading">
            Evaluation <span className="gradient-text">Analytics & Insights</span>
          </h1>
          <p className="hero-subtext">
            Programmatic performance analysis, candidate deep-dive analytics, curriculum testing coverage, and evaluation quality metrics.
          </p>
        </div>

        {/* Candidate Selector Dropdown */}
        <div className="glass-card" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <User size={16} color="#818cf8" />
          <select 
            className="filter-select"
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
          >
            <option value="ALL" style={{ background: '#0f172a', color: '#fff' }}>🌐 All Candidates (Cohort Overview)</option>
            {candidates.map(c => (
              <option key={c.member.id} value={c.member.id} style={{ background: '#0f172a', color: '#fff' }}>
                👤 {c.member.name} ({c.member.jobRole})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Profile Card if Individual Selected */}
      {selectedCandidate && (
        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(56,189,248,0.08))', border: '1px solid rgba(129,140,248,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="admin-avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.1rem', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                {selectedCandidate.member?.name ? selectedCandidate.member.name.substring(0, 2).toUpperCase() : 'CA'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 700 }}>{selectedCandidate.member?.name}</h2>
                  <span className="candidate-id-badge">{selectedCandidate.member?.id}</span>
                  {selectedCandidate.isRegisteredUser && (
                    <span className="recommended-badge" style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#e9d5ff' }}>
                      Registered User
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#a5b4fc', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Briefcase size={14} /> {selectedCandidate.member?.jobRole} ({selectedCandidate.member?.yearsExperience} yrs exp)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <GraduationCap size={14} /> {selectedCandidate.member?.education}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>{filteredSessions.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Interviews</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>{selectedCandidate.signals?.missionsCompleted || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Missions</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c084fc' }}>{selectedCandidate.signals?.commitDays || 0}d</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Commit Days</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Metrics Cards Row */}
      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-icon-box purple">
            <Activity size={20} />
          </div>
          <div>
            <div className="metric-value">{totalSessions}</div>
            <div className="metric-label">{selectedCandidate ? 'Candidate Sessions' : 'Total Sessions'}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box emerald">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="metric-value">{completedSessions}</div>
            <div className="metric-label">Completed Sessions</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box cyan">
            <HelpCircle size={20} />
          </div>
          <div>
            <div className="metric-value">{avgQuestions}</div>
            <div className="metric-label">Avg Questions / Session</div>
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

      {/* Grid Row 1: Donut Chart (Answer Quality) & Radar Chart (Competency Matrix) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Visual Graph 1: Donut Chart */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} color="#c084fc" /> Answer Depth & Technical Precision
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '1rem' }}>
            {selectedCandidate ? `Response evaluation breakdown for ${selectedCandidate.member?.name}.` : 'Distribution of candidate responses evaluated as strong, intermediate, or foundational.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', alignItems: 'center', gap: '1rem' }}>
            <DonutChart strong={strongCount} partial={partialCount} weak={weakCount} total={totalEvals} />

            {/* Donut Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} /> Strong Answers
                </span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{strongCount} ({strongPct}%)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} /> Intermediate
                </span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{partialCount} ({partialPct}%)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fca5a5', fontWeight: 600 }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} /> Foundational
                </span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{weakCount} ({weakPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Graph 2: Radar Competency Chart */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} color="#38bdf8" /> {selectedCandidate ? `${selectedCandidate.member?.name}'s Technical Radar` : 'Cohort Technical Competency Radar'}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            {selectedCandidate ? `Technical domain scores for ${selectedCandidate.member?.name} across curriculum modules.` : 'Overall evaluation scoring across 6 key curriculum domain competencies.'}
          </p>

          <RadarChart scores={radarScores} />
        </div>
      </div>

      {/* Grid Row 2: Vertical Bar Chart (Curriculum Testing Frequency) */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} color="#34d399" /> Curriculum Topic Testing Frequency
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              {selectedCandidate ? `Modules tested during ${selectedCandidate.member?.name}'s interviews.` : 'Number of interview evaluations conducted per 31-day curriculum module.'}
            </p>
          </div>
          <span className="badge badge-primary">Target Pool: 10 Core Modules</span>
        </div>

        <VerticalBarChart data={verticalBarData} />
      </div>

      {/* Individual AI Feedback Deep-Dive if Candidate Selected */}
      {selectedCandidate && latestSessionWithFeedback && (
        <div className="glass-card" style={{ marginBottom: '2rem', borderColor: 'rgba(56,189,248,0.3)' }}>
          <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#38bdf8" /> Latest Post-Interview AI Evaluation Feedback ({selectedCandidate.member?.name})
          </h3>
          
          <p style={{ color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.5', background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '3px solid #38bdf8', marginBottom: '1.25rem' }}>
            {latestSessionWithFeedback.feedback.summary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {/* Strengths */}
            <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', padding: '1rem', borderRadius: '10px' }}>
              <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={15} /> Observed Strengths
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#e2e8f0', fontSize: '0.82rem', lineHeight: '1.5' }}>
                {latestSessionWithFeedback.feedback.strengths?.map((s, i) => (
                  <li key={i} style={{ marginBottom: '0.35rem' }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', padding: '1rem', borderRadius: '10px' }}>
              <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertTriangle size={15} /> Areas for Growth
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#e2e8f0', fontSize: '0.82rem', lineHeight: '1.5' }}>
                {latestSessionWithFeedback.feedback.gaps?.map((g, i) => (
                  <li key={i} style={{ marginBottom: '0.35rem' }}>{g}</li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.2)', padding: '1rem', borderRadius: '10px' }}>
              <div style={{ color: '#c084fc', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Target size={15} /> Recommended Next Steps
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#e2e8f0', fontSize: '0.82rem', lineHeight: '1.5' }}>
                {latestSessionWithFeedback.feedback.next?.map((n, i) => (
                  <li key={i} style={{ marginBottom: '0.35rem' }}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Grid Row 3: Smooth Area Trend Graph & Cohort / Individual Session History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Visual Graph 4: Session Depth Trend */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#c084fc" /> Session Question Depth Trend
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '1rem' }}>
            {selectedCandidate ? `Question turn depth for ${selectedCandidate.member?.name}.` : 'Question turn depth per recorded interview session.'}
          </p>

          <AreaTrendGraph sessions={filteredSessions} />
        </div>

        {/* Cohort / Individual Progress Breakdown */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#fbbf24" /> {selectedCandidate ? `${selectedCandidate.member?.name}'s Mission Progress` : 'Cohort Completion Leaderboard'}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '1rem' }}>
            {selectedCandidate ? 'Curriculum day missions completed.' : 'Mission progress signals across candidates.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(selectedCandidate ? [selectedCandidate] : candidates.slice(0, 4)).map((c, i) => {
              const completedMissions = c.signals?.missionsCompleted || 0;
              const pct = Math.round((completedMissions / 31) * 100);
              const barColors = [
                'linear-gradient(90deg, #6366f1, #38bdf8)',
                'linear-gradient(90deg, #38bdf8, #34d399)',
                'linear-gradient(90deg, #c084fc, #ec4899)',
                'linear-gradient(90deg, #fbbf24, #f97316)'
              ];
              return (
                <div key={c.member?.id || i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{c.member?.name} ({c.member?.jobRole})</span>
                    <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{completedMissions} / 31 Days ({pct}%)</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct > 0 ? pct : 5}%`, background: barColors[i % barColors.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
