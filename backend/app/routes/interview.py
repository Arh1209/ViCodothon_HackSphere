from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from app.models import InterviewRequest, InterviewResponse, CandidateModel
from app.session.manager import session_manager
from app.services.ai_engine import ai_engine
from app.services.data_loader import load_candidates, load_curriculum

router = APIRouter(prefix="/api", tags=["interview"])

@router.post("/interview", response_model=InterviewResponse)
def handle_interview(req: InterviewRequest):
    """
    Mandatory Technical Specification Endpoint: POST /api/interview
    Handles initial session creation AND subsequent interview turns.
    """
    if not req.sessionId or not req.sessionId.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="sessionId is required."
        )

    session = session_manager.get_session(req.sessionId)

    # -------------------------------------------------------------
    # Case 1: Initial Session Request (Start Interview)
    # -------------------------------------------------------------
    if req.candidate is not None:
        # Create or restart session
        session = session_manager.create_session(req.sessionId, req.candidate)
        
        # Generate initial question
        first_question = ai_engine.generate_first_question(session)
        session.add_message("interviewer", first_question)
        
        return InterviewResponse(
            reply=first_question,
            done=False,
            feedback=None
        )

    # -------------------------------------------------------------
    # Case 2: Subsequent Conversation Turn Request
    # -------------------------------------------------------------
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with sessionId '{req.sessionId}' not found. Please start an interview with candidate details first."
        )

    if req.message is None or not req.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="message string cannot be empty for an ongoing interview turn."
        )

    # If interview is already completed for this session
    if session.done:
        return InterviewResponse(
            reply="Interview completed.",
            done=True,
            feedback=session.feedback
        )

    # Process conversation turn
    reply, done, feedback = ai_engine.process_turn(session, req.message)

    return InterviewResponse(
        reply=reply,
        done=done,
        feedback=feedback
    )

@router.get("/candidates")
def get_candidates():
    """
    Returns candidate list for frontend candidate selection menu.
    """
    return {"candidates": load_candidates()}

@router.get("/curriculum")
def get_curriculum():
    """
    Returns full curriculum details.
    """
    return load_curriculum()

@router.get("/session/{session_id}")
def get_session_debug(session_id: str):
    """
    Returns session status and metrics for verification.
    """
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "sessionId": session.session_id,
        "candidate": session.candidate.member.name,
        "question_count": session.question_count,
        "days_covered": session.days_covered,
        "unique_days_count": len(set(session.days_covered)),
        "done": session.done,
        "history_length": len(session.messages),
        "feedback": session.feedback
    }

@router.get("/sessions")
def get_all_sessions():
    """
    Returns list of all active and completed interview sessions.
    """
    sessions = session_manager.get_all_sessions()
    result = []
    for s in sessions:
        result.append({
            "sessionId": s.session_id,
            "candidateId": s.candidate.member.id,
            "candidateName": s.candidate.member.name,
            "jobRole": s.candidate.member.jobRole,
            "questionCount": s.question_count,
            "daysCovered": s.days_covered,
            "uniqueDaysCount": len(set(s.days_covered)),
            "topicsCovered": s.topics_covered,
            "done": s.done,
            "createdAt": s.created_at,
            "lastUpdated": s.last_updated,
            "messages": s.messages,
            "evaluations": s.evaluations,
            "feedback": s.feedback
        })
    return {"sessions": result}

# -------------------------------------------------------------
# AUTH & SETTINGS ENDPOINTS
# -------------------------------------------------------------

def register_candidate_impl(payload: Dict[str, Any]):
    from app.services.db_service import register_user
    full_name = payload.get("full_name") or payload.get("name", "")
    email = payload.get("email", "")
    password = payload.get("password", "password123")
    job_role = payload.get("job_role") or payload.get("position") or payload.get("jobRole", "")
    years_experience = payload.get("years_experience") or payload.get("experience") or payload.get("yearsExperience", 0)
    education = payload.get("education", "")
    phone = payload.get("phone", "")
    resume = payload.get("resume", "")
    skills = payload.get("skills", "")

    if not full_name or not str(full_name).strip():
        raise HTTPException(status_code=400, detail="Full Name is required.")
    if not email or not str(email).strip():
        raise HTTPException(status_code=400, detail="Email is required.")
    if not job_role or not str(job_role).strip():
        raise HTTPException(status_code=400, detail="Position / Job Role is required.")

    if isinstance(skills, list):
        skills_str = ", ".join(skills)
    else:
        skills_str = str(skills)

    try:
        cand = register_user(
            full_name=str(full_name).strip(),
            email=str(email).strip(),
            password=str(password) if password else "password123",
            job_role=str(job_role).strip(),
            years_experience=float(years_experience) if years_experience else 0.0,
            education=str(education).strip(),
            phone=str(phone).strip(),
            resume=str(resume).strip(),
            skills=skills_str
        )
        return {"candidate": cand, "message": "Candidate created successfully."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/admin/add-candidate")
def add_candidate_endpoint(payload: Dict[str, Any]):
    return register_candidate_impl(payload)

@router.delete("/admin/candidate/{candidate_id}")
@router.post("/admin/candidate/{candidate_id}/delete")
@router.post("/admin/delete-candidate/{candidate_id}")
def delete_candidate_endpoint(candidate_id: str):
    from app.services.db_service import delete_candidate_db
    try:
        delete_candidate_db(candidate_id)
        return {"candidateId": candidate_id, "message": "Candidate deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete candidate: {str(e)}")

@router.post("/admin/candidate/{candidate_id}/restore")
@router.post("/admin/candidate/{candidate_id}/undo-delete")
@router.post("/admin/restore-candidate/{candidate_id}")
def restore_candidate_endpoint(candidate_id: str):
    from app.services.db_service import restore_candidate_db
    try:
        restore_candidate_db(candidate_id)
        return {"candidateId": candidate_id, "message": "Candidate restored successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to restore candidate: {str(e)}")

@router.post("/auth/register")
def register_candidate_endpoint(payload: Dict[str, Any]):
    return register_candidate_impl(payload)

@router.post("/auth/login")
def login_candidate(payload: Dict[str, Any]):
    from app.services.db_service import authenticate_user
    email = payload.get("email", "")
    password = payload.get("password", "")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    cand = authenticate_user(email, password)
    if not cand:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"candidate": cand, "message": "Login successful."}

@router.get("/settings")
def get_interview_settings():
    from app.services.db_service import get_settings
    return get_settings()

@router.post("/settings")
def update_interview_settings(payload: Dict[str, Any]):
    from app.services.db_service import update_settings
    min_q = payload.get("min_questions", 8)
    min_days = payload.get("min_curriculum_days", 4)

    try:
        new_settings = update_settings(int(min_q), int(min_days))
        return {
            "settings": new_settings,
            "message": "Interview settings updated successfully."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
