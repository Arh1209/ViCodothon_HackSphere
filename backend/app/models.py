from typing import List, Optional, Any
from pydantic import BaseModel, Field

class CandidateMember(BaseModel):
    id: str
    name: str
    jobRole: str
    yearsExperience: float
    education: str
    status: Optional[str] = "COMPLETED"

class CandidateMission(BaseModel):
    day: int
    title: str
    passed: Optional[bool] = None
    skipped: Optional[bool] = None
    attempts: Optional[int] = None

class CandidateSignals(BaseModel):
    commitDays: int
    missionsCompleted: int
    missionsFirstTry: int

class CandidateModel(BaseModel):
    member: CandidateMember
    missions: List[CandidateMission] = []
    signals: Optional[CandidateSignals] = None

class InterviewRequest(BaseModel):
    sessionId: str = Field(..., description="Unique interview session identifier")
    candidate: Optional[CandidateModel] = Field(None, description="Candidate object provided on session initialization")
    message: Optional[str] = Field(None, description="Candidate response message on ongoing turn")

class FeedbackModel(BaseModel):
    summary: str
    strengths: List[str]
    gaps: List[str]
    next: List[str]

class InterviewResponse(BaseModel):
    reply: str
    done: bool = False
    feedback: Optional[FeedbackModel] = None

class EvaluationResult(BaseModel):
    correctness: str
    technical_depth: str
    strengths_observed: List[str] = []
    gaps_observed: List[str] = []
    next_action: str  # deeper_followup | clarification | new_topic | architecture | finish
    reasoning: str
