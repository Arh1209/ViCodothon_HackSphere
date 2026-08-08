const API_BASE = '/api';

export async function fetchCandidates() {
  const res = await fetch(`${API_BASE}/candidates`);
  if (!res.ok) throw new Error('Failed to fetch candidates');
  const data = await res.json();
  return data.candidates || [];
}

export async function fetchCurriculum() {
  const res = await fetch(`${API_BASE}/curriculum`);
  if (!res.ok) throw new Error('Failed to fetch curriculum');
  return await res.json();
}

export async function startInterview(sessionId, candidate) {
  const res = await fetch(`${API_BASE}/interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      candidate
    })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to start interview session');
  }
  return await res.json();
}

export async function sendInterviewTurn(sessionId, message) {
  const res = await fetch(`${API_BASE}/interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      message
    })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit interview turn');
  }
  return await res.json();
}

export async function getSessionDebug(sessionId) {
  const res = await fetch(`${API_BASE}/session/${sessionId}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.sessions || [];
}

export async function fetchHealth() {
  const res = await fetch(`/health`);
  if (!res.ok) return { status: 'offline' };
  return await res.json();
}

export async function registerCandidate(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Registration failed.');
  }
  return await res.json();
}

export async function loginCandidate(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Login failed.');
  }
  return await res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) return { min_questions: 8, min_curriculum_days: 4 };
  return await res.json();
}

export async function updateSettings(minQuestions, minCurriculumDays) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      min_questions: minQuestions,
      min_curriculum_days: minCurriculumDays
    })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to update settings.');
  }
  return await res.json();
}
