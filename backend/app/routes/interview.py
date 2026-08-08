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
