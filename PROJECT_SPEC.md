# PROJECT_SPEC.md — AI Technical Interviewer Specification

This specification documents the exact API contract, candidate data structures, curriculum layout, interview rules, adaptive engine behavior, and system requirements for **The Interview Agent**.

---

## 1. Exact Required API Endpoint

- **HTTP Method**: `POST`
- **Path**: `/api/interview`
- **Authentication**: None required.
- **State Management**: Stateful via `sessionId` passed in request payloads.

---

## 2. Exact Request Format

### A. Initial Request (Start Interview)
Sent on the very first call to start a new interview for a given candidate.

```json
{
  "sessionId": "abc-123",
  "candidate": {
    "member": {
      "id": "CAND-001",
      "name": "Sarah Johnson",
      "jobRole": "Senior Data Engineer",
      "yearsExperience": 9,
      "education": "MS Computer Science",
      "status": "COMPLETED"
    },
    "missions": [
      { "day": 7, "title": "Embeddings Explained", "passed": true, "attempts": 1 }
    ],
    "signals": {
      "commitDays": 28,
      "missionsCompleted": 30,
      "missionsFirstTry": 20
    }
  }
}
```

### B. Conversation Turn Request (Subsequent Turns)
Sent on all subsequent interactions during an ongoing interview.

```json
{
  "sessionId": "abc-123",
  "message": "To reduce chunk size, I would use a token-based sliding window splitter with overlap to ensure sentence boundaries are preserved..."
}
```

---

## 3. Exact Response Format

### A. Ongoing Turn Response (`done: false`)
Returned while the interview is in progress.

```json
{
  "reply": "That is a solid approach. Given your sliding window choice, how would you handle metadata loss across chunk boundaries in a production RAG pipeline?",
  "done": false
}
```

### B. Final Completion Response (`done: true`)
Returned on the turn when the interview completes (satisfying question count and curriculum coverage constraints).

```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "Sarah demonstrated exceptional depth in vector database indexing and RAG chunking strategies, but struggled slightly when discussing multi-agent fallback mechanisms under high concurrency.",
    "strengths": [
      "Deep understanding of vector embedding spaces and chunk boundary strategies.",
      "Clear explanation of trade-offs between Pinecone index types and local ChromaDB deployments.",
      "Strong architectural perspective appropriate for 9 years of experience."
    ],
    "gaps": [
      "Limited depth on Model Context Protocol (MCP) dynamic error routing.",
      "Could elaborate more on observability metrics for agentic loops."
    ],
    "next": [
      "Practice multi-agent orchestration fault tolerance patterns (Day 22).",
      "Implement hands-on Model Context Protocol (MCP) servers (Day 23)."
    ]
  }
}
```

---

## 4. Required `sessionId` Behavior

- Every request MUST contain a `sessionId` string.
- Initial request provides `sessionId` AND `candidate` object.
- Subsequent requests provide `sessionId` AND `message` string.
- The server maintains state in memory mapped by `sessionId`.
- Requests sharing the same `sessionId` belong to the same ongoing interview and continue the candidate's conversation context.
- Requests with distinct `sessionId` values are isolated from each other and track independent sessions.

---

## 5. Minimum Number of Interview Questions

- **Minimum Questions**: **8 questions** answered by the candidate.
- **Target Range**: 8 to 12 questions.
- **Safeguard**: The interview engine MUST NOT set `done: true` until at least 8 questions have been answered and evaluated.

---

## 6. Minimum Number of Curriculum Days Covered

- **Minimum Curriculum Days**: At least **4 distinct curriculum days**.
- **Safeguard**: The interview engine tracks `daysCovered` programmatically. Completion (`done: true`) is strictly blocked until `len(set(daysCovered)) >= 4`.

---

## 7. Required Final Feedback Format

When `done: true`, the response MUST include a `feedback` object with exact types:

| Field | Type | Description |
|---|---|---|
| `summary` | `string` | Concise high-level summary of candidate performance grounded in interview answers. |
| `strengths` | `string[]` | Array of specific, evidence-backed candidate strengths. |
| `gaps` | `string[]` | Array of specific observed technical gaps. |
| `next` | `string[]` | Array of actionable recommendations linked to curriculum topics. |

---

## 8. Candidate Profile Structure

From `candidates.json`:

```json
{
  "member": {
    "id": "string",
    "name": "string",
    "jobRole": "string",
    "yearsExperience": "number",
    "education": "string",
    "status": "string"
  },
  "missions": [
    {
      "day": "number",
      "title": "string",
      "passed": "boolean (optional)",
      "skipped": "boolean (optional)",
      "attempts": "number (optional)"
    }
  ],
  "signals": {
    "commitDays": "number",
    "missionsCompleted": "number",
    "missionsFirstTry": "number"
  }
}
```

---

## 9. Curriculum Structure

From `curriculum.json`:

```json
{
  "cohort": "string",
  "modules": [
    {
      "n": "number",
      "title": "string",
      "days": ["number"]
    }
  ],
  "days": [
    {
      "day": "number",
      "title": "string",
      "type": "string (SETUP | BUILD | AI_CORE | SHIP_IT | LEARN | OPTIMIZE | CAPSTONE)",
      "tools": ["string"],
      "objectives": ["string"]
    }
  ]
}
```

---

## 10. Candidate Fields Useful for Personalization

1. **`member.jobRole`**: Adjusts question domain and focus (e.g., Data Engineering focus vs DevOps infrastructure vs AI Engineer core algorithm vs UX Researcher entry-level AI).
2. **`member.yearsExperience`**: Controls baseline technical depth and initial question difficulty:
   - Low experience (0-2 years): Focus on concepts, basic API mechanics, implementation basics.
   - Mid experience (3-7 years): Focus on practical design, trade-offs, error handling.
   - High experience (8+ years): Focus on system architecture, scalability, cost vs latency trade-offs, reliability, production failure modes.
3. **`member.education`**: Provides additional academic background context.
4. **`missions` performance history**:
   - High attempt count (`attempts >= 3`): Signals topics where the candidate struggled; probe understanding to verify mastery.
   - First-try pass (`attempts == 1`): Signals confidence; move quickly to advanced/architectural questions.
   - Skipped missions (`skipped: true`): Indicates unstudied topics; start with foundational concepts if testing these days.
   - Failed missions (`passed: false`): Highlights known failure areas; target with supportive/diagnostic questions.
5. **`signals` summary metrics**:
   - `missionsCompleted` & `missionsFirstTry`: Ratios used to tune initial AI interviewer expectations and pacing.

---

## 11. Completed, Failed, Skipped and Attempt Information Available

In `candidates.json`, each mission in `candidate.missions` provides:
- **Completed**: `passed: true` (mission was completed successfully).
- **Failed**: `passed: false` (mission was attempted but failed).
- **Skipped**: `skipped: true` (mission was skipped by candidate).
- **Attempts**: `attempts: <integer>` (number of submissions/attempts needed to pass or fail).

Overall aggregate signals in `candidate.signals`:
- `commitDays`: Total active coding days.
- `missionsCompleted`: Total completed missions across cohort.
- `missionsFirstTry`: Number of missions passed on first attempt.

---

## 12. Every Mandatory Requirement from Technical Specification

1. Endpoint MUST be `POST /api/interview`.
2. No authentication required.
3. Session state MUST be maintained via `sessionId`.
4. Initial request payload MUST contain `sessionId` and `candidate` object.
5. Initial response MUST return `{"reply": "...", "done": false}`.
6. Subsequent request payloads MUST contain `sessionId` and `message` string.
7. Subsequent turn responses MUST return `{"reply": "...", "done": false}`.
8. End of interview response MUST return `{"reply": "Interview completed.", "done": true, "feedback": {...}}`.
9. Final `feedback` object MUST contain `summary` (string), `strengths` (string[]), `gaps` (string[]), `next` (string[]).
10. Dynamic adaptive questioning with 8+ questions and 4+ curriculum days covered.
11. Gemini API key MUST come from `GEMINI_API_KEY` environment variable.
