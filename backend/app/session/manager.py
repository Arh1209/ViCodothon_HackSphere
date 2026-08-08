from typing import Dict, Any, Optional, List
import time
from app.models import CandidateModel

class InterviewSession:
    def __init__(self, session_id: str, candidate: CandidateModel):
        self.session_id = session_id
        self.candidate = candidate
        self.messages: List[Dict[str, str]] = []
        self.question_count: int = 0
        self.days_covered: List[int] = []
        self.topics_covered: List[str] = []
        self.evaluations: List[Dict[str, Any]] = []
        self.strengths: List[str] = []
        self.gaps: List[str] = []
        self.done: bool = False
        self.feedback: Optional[Dict[str, Any]] = None
        self.created_at: float = time.time()
        self.last_updated: float = time.time()
        
        # Adaptive tracking state
        self.current_day: int = 7
        self.current_topic: str = "Embeddings & Vector Search"
        self.current_difficulty: str = "intermediate"  # foundational | intermediate | advanced | architectural
        
    def add_message(self, role: str, content: str):
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": str(time.time())
        })
        self.last_updated = time.time()

    def record_curriculum_day(self, day: int, topic: str):
        if day not in self.days_covered:
            self.days_covered.append(day)
        if topic not in self.topics_covered:
            self.topics_covered.append(topic)
        self.current_day = day
        self.current_topic = topic

    def record_evaluation(self, eval_data: Dict[str, Any]):
        self.evaluations.append(eval_data)
        if eval_data.get("strengths_observed"):
            for s in eval_data["strengths_observed"]:
                if s not in self.strengths:
                    self.strengths.append(s)
        if eval_data.get("gaps_observed"):
            for g in eval_data["gaps_observed"]:
                if g not in self.gaps:
                    self.gaps.append(g)

class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, InterviewSession] = {}

    def get_session(self, session_id: str) -> Optional[InterviewSession]:
        return self._sessions.get(session_id)

    def create_session(self, session_id: str, candidate: CandidateModel) -> InterviewSession:
        session = InterviewSession(session_id, candidate)
        self._sessions[session_id] = session
        return session

    def clear_all(self):
        self._sessions.clear()

session_manager = SessionManager()
