import React from 'react';
import { 
  BarChart3, PieChart, Activity, Award, CheckCircle2, AlertTriangle, 
  HelpCircle, Calendar, Users, Cpu, Layers, Sparkles, TrendingUp, Target, Compass
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
          <linearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#38bdf8" />
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
              {/* Value label above bar */}
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

              {/* Bar background track */}
              <rect x={x} y={25} width={barWidth} height={chartHeight} rx="6" fill="rgba(255,255,255,0.03)" />

              {/* Filled Bar */}
              <rect
                x={x}
                y={hasValue ? y : chartHeight + 21}
                width={barWidth}
                height={hasValue ? Math.max(barH, 6) : 4}
                rx="6"
                fill={hasValue ? 'url(#barGradDefault)' : 'rgba(255,255,255,0.1)'}
                style={{ transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />

              {/* X-axis Label */}
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
function RadarChart() {
  const axes = [
    { label: 'Vector Embeddings', val: 85 },
    { label: 'Vector DBs', val: 78 },
    { label: 'Prompt Schemas', val: 92 },
    { label: 'MCP & Multi-Agent', val: 70 },
    { label: 'RAG Search', val: 88 },
    { label: 'Production Ops', val: 75 }
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
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.done).length;

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
  const verticalBarData = targetDays.map(d => ({
    day: d,
    value: dayFreq[d] || 0
  }));

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

      {/* Top Metrics Cards Row */}
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
            Distribution of candidate responses evaluated as strong, intermediate, or foundational.
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
            <Compass size={18} color="#38bdf8" /> Cohort Technical Competency Radar
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            Overall evaluation scoring across 6 key curriculum domain competencies.
          </p>

          <RadarChart />
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
              Number of interview evaluations conducted per 31-day curriculum module.
            </p>
          </div>
          <span className="badge badge-primary">Target Pool: 10 Core Modules</span>
        </div>

        <VerticalBarChart data={verticalBarData} />
      </div>

      {/* Grid Row 3: Smooth Area Trend Graph & Cohort Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Visual Graph 4: Session Depth Trend */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#c084fc" /> Session Question Depth Trend
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '1rem' }}>
            Question turn depth per recorded interview session.
          </p>

          <AreaTrendGraph sessions={sessions} />
        </div>

        {/* Cohort Progress Breakdown */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#fbbf24" /> Cohort Completion Leaderboard
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '1rem' }}>
            Mission progress signals across candidates.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {candidates.slice(0, 4).map((c, i) => {
              const completedMissions = c.signals?.missionsCompleted || 0;
              const pct = Math.round((completedMissions / 31) * 100);
              const barColors = [
                'linear-gradient(90deg, #6366f1, #38bdf8)',
                'linear-gradient(90deg, #38bdf8, #34d399)',
                'linear-gradient(90deg, #c084fc, #ec4899)',
                'linear-gradient(90deg, #fbbf24, #f97316)'
              ];
              return (
                <div key={c.member.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{c.member.name} ({c.member.jobRole})</span>
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
