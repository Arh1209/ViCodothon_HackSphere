import httpx
import json
import sys

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_PROXY_URL = "http://127.0.0.1:3000"
HEADERS = {"Connection": "close"}

def run_verification():
    print("=== STEP 1: Check FastAPI Backend Health ===")
    resp = httpx.get(f"{BACKEND_URL}/health", headers=HEADERS, timeout=10.0)
    print(f"Backend Health HTTP {resp.status_code}: {resp.json()}")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

    print("\n=== STEP 2: Check Frontend Dev Server ===")
    resp = httpx.get(FRONTEND_PROXY_URL, headers=HEADERS, timeout=10.0)
    print(f"Frontend Dev Server HTTP {resp.status_code}")
    assert resp.status_code == 200

    print("\n=== STEP 3: Verify Frontend Proxy Communication with Backend ===")
    resp = httpx.get(f"{FRONTEND_PROXY_URL}/api/candidates", headers=HEADERS, timeout=10.0)
    print(f"Frontend Proxy /api/candidates HTTP {resp.status_code}")
    assert resp.status_code == 200
    candidates = resp.json().get("candidates", [])
    print(f"Fetched {len(candidates)} candidates via Frontend Proxy.")
    assert len(candidates) >= 10, "Expected at least 10 candidates in candidates.json"

    candidate = candidates[0] # CAND-001 Sarah Johnson
    session_id = "live-verify-session-999"

    # Reset settings to default 8 questions and 4 days for test predictability
    httpx.post(f"{BACKEND_URL}/api/settings", json={"min_questions": 8, "min_curriculum_days": 4}, headers=HEADERS, timeout=5.0)

    print(f"\n=== STEP 4: Test POST /api/interview (Start Interview with candidate {candidate['member']['name']}) ===")
    start_payload = {
        "sessionId": session_id,
        "candidate": candidate
    }
    resp = httpx.post(f"{BACKEND_URL}/api/interview", json=start_payload, headers=HEADERS, timeout=10.0)
    print(f"Start Interview HTTP {resp.status_code}")
    assert resp.status_code == 200
    data = resp.json()
    print(f"Initial Question: {data['reply']}")
    assert data["done"] is False
    assert data["feedback"] is None
    assert len(data["reply"]) > 10

    # candidate answers tailored to Sarah Johnson's Data Engineering / AI background
    candidate_answers = [
        "For high-throughput vector embedding pipelines, I prefer cosine similarity with 1536-dim OpenAI or 768-dim Gemini embeddings with HNSW indexing in Qdrant or Pinecone.",
        "When chunking technical documentation, I set chunk size to 512 tokens with 50-token overlap to maintain semantic boundary context across code snippets.",
        "For hybrid search, I combine dense vector retrieval with sparse BM25 text indices and apply Reciprocal Rank Fusion (RRF) for re-ranking search hits.",
        "We enforce strict output schemas using Pydantic models with FastAPI and Instructor library to handle JSON validation and retry handling on LLM outputs.",
        "In multi-agent setups, we use MCP tools with stateful persistent memory and explicit fallback routers for failed tool calls.",
        "We log token consumption per user request, enforce rate limits via Redis token buckets, and set request timeout thresholds on downstream model endpoints.",
        "To prevent prompt injection, we sanitize input fields, use system prompt boundary markers, and run input validation guardrails prior to embedding generation.",
        "For Kubernetes auto-scaling, we monitor custom Prometheus metrics like GPU memory utilization and inference queue depth using HPA and KEDA."
    ]

    print("\n=== STEP 5: Conduct Multi-turn Interview & Verify Adaptability & Session Context ===")
    for turn_idx, answer in enumerate(candidate_answers, 1):
        turn_payload = {
            "sessionId": session_id,
            "message": answer
        }
        resp = httpx.post(f"{BACKEND_URL}/api/interview", json=turn_payload, headers=HEADERS, timeout=10.0)
        assert resp.status_code == 200
        data = resp.json()

        # Inspect session debug endpoint
        debug_resp = httpx.get(f"{BACKEND_URL}/api/session/{session_id}", headers=HEADERS, timeout=10.0)
        assert debug_resp.status_code == 200
        debug_info = debug_resp.json()

        print(f"\n--- Turn {turn_idx} ---")
        print(f"Candidate Answer: '{answer[:60]}...'")
        print(f"Interviewer Response: '{data['reply'][:100]}...'")
        print(f"Done: {data['done']}")
        print(f"Session Stats -> Q Count: {debug_info['question_count']}, Unique Days Covered: {debug_info['unique_days_count']}, History Length: {debug_info['history_length']}")

        if turn_idx < 8:
            assert data["done"] is False
            assert data["feedback"] is None
        else:
            assert data["done"] is True
            assert data["feedback"] is not None
            fb = data["feedback"]
            print("\n=== STEP 6: Verify Final Feedback & Curriculum Coverage ===")
            print(f"Feedback Summary: {fb['summary']}")
            print(f"Strengths ({len(fb['strengths'])}): {fb['strengths']}")
            print(f"Gaps ({len(fb['gaps'])}): {fb['gaps']}")
            print(f"Next Steps ({len(fb['next'])}): {fb['next']}")

            assert debug_info["question_count"] >= 8, f"Expected at least 8 questions, got {debug_info['question_count']}"
            assert debug_info["unique_days_count"] >= 4, f"Expected at least 4 curriculum days, got {debug_info['unique_days_count']}"
            assert len(fb["summary"]) > 20
            assert len(fb["strengths"]) > 0
            assert len(fb["gaps"]) > 0
            assert len(fb["next"]) > 0

    print("\nALL VERIFICATION STEPS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    try:
        run_verification()
    except Exception as e:
        print(f"Verification failed: {e}", file=sys.stderr)
        sys.exit(1)
