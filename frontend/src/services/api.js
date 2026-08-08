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
