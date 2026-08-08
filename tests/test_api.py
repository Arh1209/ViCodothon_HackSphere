import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.session.manager import session_manager
from app.services.data_loader import load_candidates

client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_sessions():
    session_manager.clear_all()
    from app.services.db_service import update_settings, get_db_connection
    update_settings(8, 4)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM deleted_candidates")
    conn.commit()
    conn.close()
    yield

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_candidates():
    response = client.get("/api/candidates")
    assert response.status_code == 200
    candidates = response.json().get("candidates", [])
    assert len(candidates) >= 10
    assert any(c["member"]["id"] == "CAND-001" for c in candidates)

def test_start_interview():
    candidates = load_candidates()
    cand1 = candidates[0]
    
    payload = {
        "sessionId": "test-session-001",
        "candidate": cand1
    }
    response = client.post("/api/interview", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 10
    assert data["done"] is False
    assert data["feedback"] is None

def test_interview_turn_flow():
    candidates = load_candidates()
    cand = candidates[0] # Sarah Johnson (Senior Data Engineer)
    session_id = "test-session-turn-001"
    
    # 1. Start session
    start_resp = client.post("/api/interview", json={"sessionId": session_id, "candidate": cand})
    assert start_resp.status_code == 200
    assert start_resp.json()["done"] is False
    
    # 2. Perform 7 turn requests (Total 7 answers) - Should NOT be done yet (min 8 required)
    for i in range(1, 8):
        msg = f"Candidate response {i} explaining vector search and embeddings chunking strategy."
        turn_resp = client.post("/api/interview", json={"sessionId": session_id, "message": msg})
        assert turn_resp.status_code == 200
        data = turn_resp.json()
        assert data["done"] is False
        assert "reply" in data
        
    # Check session state
    sess_resp = client.get(f"/api/session/{session_id}")
    assert sess_resp.status_code == 200
    sess_data = sess_resp.json()
    assert sess_data["question_count"] == 7
    assert sess_data["unique_days_count"] >= 4
    
    # 3. 8th Turn request - Should complete the interview (8 questions & 4+ days)
    final_resp = client.post("/api/interview", json={
        "sessionId": session_id, 
        "message": "For Kubernetes autoscaling, I deploy Horizontal Pod Autoscalers based on CPU and request latency metrics."
    })
    assert final_resp.status_code == 200
    final_data = final_resp.json()
    assert final_data["done"] is True
    assert final_data["reply"] == "Interview completed."
    
    # Verify feedback structure strictly
    fb = final_data["feedback"]
    assert fb is not None
    assert isinstance(fb["summary"], str) and len(fb["summary"]) > 20
    assert isinstance(fb["strengths"], list) and len(fb["strengths"]) > 0
    assert isinstance(fb["gaps"], list) and len(fb["gaps"]) > 0
    assert isinstance(fb["next"], list) and len(fb["next"]) > 0

def test_session_isolation():
    candidates = load_candidates()
    c1 = candidates[0]
    c2 = candidates[1]
    
    s1 = "sess-isolated-001"
    s2 = "sess-isolated-002"
    
    # Start session 1
    r1 = client.post("/api/interview", json={"sessionId": s1, "candidate": c1})
    # Start session 2
    r2 = client.post("/api/interview", json={"sessionId": s2, "candidate": c2})
    
    assert r1.status_code == 200
    assert r2.status_code == 200
    
    # Send turn to session 1
    t1 = client.post("/api/interview", json={"sessionId": s1, "message": "My answer for session 1."})
    
    # Check session debug stats
    debug1 = client.get(f"/api/session/{s1}").json()
    debug2 = client.get(f"/api/session/{s2}").json()
    
    assert debug1["question_count"] == 1
    assert debug2["question_count"] == 0
    assert debug1["candidate"] == c1["member"]["name"]
    assert debug2["candidate"] == c2["member"]["name"]

def test_three_candidate_personalization():
    candidates = load_candidates()
    # Test 3 different candidate roles: Senior Data Engineer, AI Engineer, IT Support Specialist
    c_senior = candidates[0]  # CAND-001 Sarah Johnson
    c_ai = candidates[2]      # CAND-003 Emily Chen
    c_support = candidates[9] # CAND-010 Gerald Combs
    
    for i, c in enumerate([c_senior, c_ai, c_support]):
        sid = f"persona-test-session-00{i}"
        r = client.post("/api/interview", json={"sessionId": sid, "candidate": c})
        assert r.status_code == 200
        reply = r.json()["reply"]
        assert len(reply) > 10
        # Each candidate gets a personalized opening question mentioning their role or day
        assert c["member"]["name"] in reply or "Welcome" in reply

def test_invalid_requests_error_handling():
    # 1. Missing sessionId
    r1 = client.post("/api/interview", json={"message": "hello"})
    assert r1.status_code in [400, 422]

    # 2. Non-existent sessionId turn
    r2 = client.post("/api/interview", json={"sessionId": "non-existent-id", "message": "hello"})
    assert r2.status_code == 404

    # 3. Empty message turn
    candidates = load_candidates()
    sid = "err-session-001"
    client.post("/api/interview", json={"sessionId": sid, "candidate": candidates[0]})
    r3 = client.post("/api/interview", json={"sessionId": sid, "message": "   "})
    assert r3.status_code == 400

def test_adaptive_evaluation_scaling():
    candidates = load_candidates()
    sid = "adaptive-test-session"
    client.post("/api/interview", json={"sessionId": sid, "candidate": candidates[0]})

    # Strong detailed response (> 35 words)
    strong_ans = "To optimize similarity search across billions of dense vector embeddings, we implement HNSW indexing with Cosine Distance and apply quantization technique scalar quantization SQ8 to minimize GPU memory footprint without degrading recall precision."
    r_strong = client.post("/api/interview", json={"sessionId": sid, "message": strong_ans})
    assert r_strong.status_code == 200
    assert r_strong.json()["done"] is False
    assert len(r_strong.json()["reply"]) > 10

def test_candidate_registration_and_login():
    import time
    email = f"testcand_{int(time.time())}@example.com"
    reg_payload = {
        "full_name": "Test Candidate",
        "email": email,
        "password": "password123",
        "job_role": "ML Ops Engineer",
        "years_experience": 4.5,
        "education": "BS Software Engineering"
    }
    # 1. Register candidate
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    assert "candidate" in reg_data
    assert reg_data["candidate"]["member"]["email"] == email

    # 2. Duplicate registration attempt should fail
    dup_resp = client.post("/api/auth/register", json=reg_payload)
    assert dup_resp.status_code == 400

    # 3. Login candidate with valid credentials
    login_resp = client.post("/api/auth/login", json={"email": email, "password": "password123"})
    assert login_resp.status_code == 200
    assert login_resp.json()["candidate"]["member"]["name"] == "Test Candidate"

    # 4. Login candidate with invalid password should fail
    bad_login = client.post("/api/auth/login", json={"email": email, "password": "wrongpassword"})
    assert bad_login.status_code == 401

def test_settings_get_and_update_validation():
    # 1. Get settings
    get_resp = client.get("/api/settings")
    assert get_resp.status_code == 200
    settings = get_resp.json()
    assert "min_questions" in settings
    assert "min_curriculum_days" in settings

    # 2. Update settings with invalid values (<8 or <4) should fail
    inv_resp = client.post("/api/settings", json={"min_questions": 5, "min_curriculum_days": 2})
    assert inv_resp.status_code == 400

    # 3. Update settings with valid higher values
    valid_resp = client.post("/api/settings", json={"min_questions": 10, "min_curriculum_days": 5})
    assert valid_resp.status_code == 200
    new_settings = valid_resp.json()["settings"]
    assert new_settings["min_questions"] == 10
    assert new_settings["min_curriculum_days"] == 5

def test_delete_candidate():
    # 1. Register candidate to delete
    cand = client.post("/api/admin/add-candidate", json={
        "full_name": "Candidate To Delete",
        "email": "delcand@example.com",
        "password": "password123",
        "job_role": "Tester",
        "years_experience": 2,
        "education": "BS"
    }).json()["candidate"]

    cand_id = cand["member"]["id"]
    
    # Verify candidate exists in candidate list
    candidates_before = client.get("/api/candidates").json()["candidates"]
    assert any(c["member"]["id"] == cand_id for c in candidates_before)

    # 2. Delete candidate
    del_resp = client.delete(f"/api/admin/candidate/{cand_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["candidateId"] == cand_id

    # 3. Verify candidate no longer appears in candidate list
    candidates_after = client.get("/api/candidates").json()["candidates"]
    assert not any(c["member"]["id"] == cand_id for c in candidates_after)
