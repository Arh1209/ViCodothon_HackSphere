import os
import json
import logging
import httpx
from typing import Dict, Any, Tuple, List, Optional

from app.models import CandidateModel, FeedbackModel, EvaluationResult
from app.session.manager import InterviewSession
from app.services.data_loader import load_curriculum, get_curriculum_day
from app.prompts.interviewer import EVALUATION_SYSTEM_PROMPT, QUESTION_GENERATION_PROMPT, FEEDBACK_GENERATION_PROMPT

logger = logging.getLogger("ai_engine")

class AIEngine:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.curriculum = load_curriculum()
        
    def _is_api_available(self) -> bool:
        return bool(self.api_key and self.api_key.strip() and self.api_key != "your_gemini_api_key_here")

    def generate_first_question(self, session: InterviewSession) -> str:
        """
        Initializes first question personalized to candidate role, experience & mission background.
        """
        member = session.candidate.member
        missions = session.candidate.missions
        
        # Select initial curriculum day based on candidate background
        # Find first relevant completed or struggle topic in curriculum
        initial_day = 7  # Default Embeddings
        for m in missions:
            if m.day in [7, 8, 10, 12, 16, 22, 23, 28]:
                initial_day = m.day
                break
                
        curr_day = get_curriculum_day(initial_day) or get_curriculum_day(7)
        day_title = curr_day.get("title", "Embeddings Explained") if curr_day else "Embeddings Explained"
        session.record_curriculum_day(initial_day, day_title)
        
        if self._is_api_available():
            try:
                question = self._call_gemini_question(session, is_first=True)
                if question:
                    return question
            except Exception as e:
                logger.warning(f"Gemini API call failed for first question, falling back to template: {e}")
                
        # Deterministic personalized initial question generator
        return self._rule_based_first_question(session, initial_day, day_title)

    def process_turn(self, session: InterviewSession, candidate_message: str) -> Tuple[str, bool, Optional[FeedbackModel]]:
        """
        Processes candidate response:
        1. Evaluates candidate response
        2. Updates session history & stats
        3. Checks if 8+ questions and 4+ days covered -> finish
        4. Selects next curriculum day & topic
        5. Generates next question or final feedback
        """
        # Step 1: Add user message to history
        session.add_message("candidate", candidate_message)
        session.question_count += 1
        
        # Step 2: Evaluate answer
        eval_result = self.evaluate_answer(session, candidate_message)
        session.record_evaluation(eval_result)
        
        # Step 3: Check completion criteria using dynamic settings
        from app.services.db_service import get_settings, save_session_db
        settings = get_settings()
        min_q = settings.get("min_questions", 8)
        min_days = settings.get("min_curriculum_days", 4)
        unique_days = len(set(session.days_covered))

        if session.question_count >= min_q and unique_days >= min_days:
            # Finish interview and generate structured feedback
            session.done = True
            feedback = self.generate_final_feedback(session)
            session.feedback = feedback.model_dump()
            completion_msg = "Interview completed."
            session.add_message("interviewer", completion_msg)
            save_session_db(
                session.session_id, session.candidate.member.id,
                session.candidate.member.name, session.candidate.member.jobRole,
                session.messages, session.evaluations, session.question_count,
                session.days_covered, True, session.feedback, session.created_at
            )
            return completion_msg, True, feedback
            
        # Step 4: Determine next curriculum day to satisfy min days rule
        next_day = self._select_next_curriculum_day(session)
        curr_day_info = get_curriculum_day(next_day) or {"title": f"Day {next_day} Topic"}
        session.record_curriculum_day(next_day, curr_day_info.get("title", ""))
        
        # Step 5: Generate next question
        if self._is_api_available():
            try:
                next_q = self._call_gemini_question(session, is_first=False)
                if next_q:
                    session.add_message("interviewer", next_q)
                    return next_q, False, None
            except Exception as e:
                logger.warning(f"Gemini API call failed for turn question: {e}")

        # Fallback question generation
        next_q = self._rule_based_turn_question(session, eval_result, next_day, curr_day_info)
        session.add_message("interviewer", next_q)
        return next_q, False, None

    def evaluate_answer(self, session: InterviewSession, candidate_message: str) -> Dict[str, Any]:
        """
        Evaluates answer using Gemini API or fallback rules.
        """
        if self._is_api_available():
            try:
                eval_dict = self._call_gemini_eval(session, candidate_message)
                if eval_dict:
                    return eval_dict
            except Exception as e:
                logger.warning(f"Gemini API eval failed: {e}")
                
        # Rule-based evaluation fallback
        msg_len = len(candidate_message.strip().split())
        if msg_len > 35:
            correctness = "strong"
            depth = "advanced" if session.candidate.member.yearsExperience >= 5 else "intermediate"
            strengths = ["Detailed technical explanation", "Demonstrated domain knowledge"]
            gaps = []
            action = "deeper_followup"
        elif msg_len > 12:
            correctness = "partially_correct"
            depth = "intermediate"
            strengths = ["Clear baseline concept"]
            gaps = ["Could expand further on trade-offs and edge cases"]
            action = "clarification"
        else:
            correctness = "weak"
            depth = "foundational"
            strengths = []
            gaps = ["Brief response lacking architectural depth"]
            action = "reinforcement"
            
        return {
            "correctness": correctness,
            "technical_depth": depth,
            "strengths_observed": strengths,
            "gaps_observed": gaps,
            "next_action": action,
            "reasoning": f"Evaluated response of length {msg_len} words."
        }

    def generate_final_feedback(self, session: InterviewSession) -> FeedbackModel:
        """
        Generates structured final feedback.
        """
        if self._is_api_available():
            try:
                feedback = self._call_gemini_feedback(session)
                if feedback:
                    return feedback
            except Exception as e:
                logger.warning(f"Gemini API feedback call failed: {e}")

        # Deterministic feedback fallback based on actual session data
        member = session.candidate.member
        strengths = list(session.strengths) if session.strengths else [
            f"Solid foundational understanding of core curriculum concepts.",
            f"Effective technical communication appropriate for a {member.jobRole}."
        ]
        gaps = list(session.gaps) if session.gaps else [
            "Could deepen mastery on system failure modes and production scaling trade-offs."
        ]
        
        # Build actionable next steps connected to curriculum days
        covered = set(session.days_covered)
        next_steps = []
        if 22 in covered or 23 in covered:
            next_steps.append("Practice Multi-Agent Orchestration and MCP tool error handling (Day 22 & 23).")
        if 28 in covered:
            next_steps.append("Implement health check probes and Kubernetes autoscaling configurations (Day 28).")
        if 10 in covered or 13 in covered:
            next_steps.append("Deepen structured output validation using Pydantic and function schemas (Day 13).")
            
        if len(next_steps) < 2:
            next_steps.append("Review Production Readiness & Capstone integration patterns (Day 30 & 31).")
            
        summary = (
            f"{member.name} ({member.jobRole}, {member.yearsExperience} yrs exp) completed a {session.question_count}-question "
            f"technical interview covering {len(set(session.days_covered))} curriculum days. "
            f"Demonstrated good command of core AI concepts with opportunities for deeper architectural refinement."
        )
        
        return FeedbackModel(
            summary=summary,
            strengths=strengths[:4],
            gaps=gaps[:3],
            next=next_steps[:4]
        )

    def _select_next_curriculum_day(self, session: InterviewSession) -> int:
        """
        Ensures interview covers at least 4 distinct curriculum days across the session.
        Curriculum pool: [7, 8, 10, 12, 13, 16, 22, 23, 28, 31]
        """
        day_pool = [7, 8, 10, 12, 13, 16, 21, 22, 23, 28, 31]
        covered = session.days_covered
        
        # Pick unvisited day first to expand coverage
        for d in day_pool:
            if d not in covered:
                return d
                
        # If all visited, cycle based on question count
        return day_pool[session.question_count % len(day_pool)]

    def _rule_based_first_question(self, session: InterviewSession, day: int, day_title: str) -> str:
        member = session.candidate.member
        role = member.jobRole
        exp = member.yearsExperience
        name = member.name
        
        if exp >= 8:
            return (
                f"Welcome {name}. Given your experience as a {role}, let's start with Day {day} ({day_title}). "
                f"When designing high-throughput vector embedding pipelines, what vector dimension trade-offs and distance metrics (e.g., Cosine vs Dot Product) "
                f"do you prioritize for real-time similarity search?"
            )
        elif exp >= 3:
            return (
                f"Welcome {name}. Let's begin by discussing Day {day} ({day_title}). "
                f"How do vector embeddings convert unstructured text into numerical representations, and how do you determine the optimal chunk size when indexing documents?"
            )
        else:
            return (
                f"Welcome {name}. Let's start with Day {day} ({day_title}). "
                f"Can you explain what text embeddings are in simple terms, and why they are essential for modern AI search?"
            )

    def _rule_based_turn_question(self, session: InterviewSession, eval_res: Dict[str, Any], next_day: int, curr_day_info: Dict[str, Any]) -> str:
        action = eval_res.get("next_action", "new_topic")
        day_title = curr_day_info.get("title", f"Day {next_day} Topic")
        q_count = session.question_count + 1
        
        transitions = [
            "Good. Let me take us to the next technical topic.",
            "That's a clear point. Let's move deeper into the architecture.",
            "Understood. Moving forward to our next curriculum module.",
            "That makes sense. Let's make this more practical.",
            "Appreciate the explanation. Let's look at another area."
        ]
        trans = transitions[q_count % len(transitions)]
        
        # Topic specific question templates
        if next_day in [8, 9, 10]:
            if session.candidate.member.yearsExperience >= 8:
                return f"{trans} On Day {next_day} ({day_title}), how would you architect a hybrid search engine combining BM25 keyword matching with dense vector retrieval in ChromaDB or Pinecone?"
            return f"{trans} On Day {next_day} ({day_title}), what are the primary differences between local vector databases like ChromaDB and cloud managed databases like Pinecone?"
            
        elif next_day in [12, 13]:
            return f"{trans} Turning to Day {next_day} ({day_title}), how do you enforce strict structured JSON output schemas from LLMs using function calling or Pydantic validation?"
            
        elif next_day in [21, 22, 23]:
            if session.candidate.member.yearsExperience >= 5:
                return f"{trans} Regarding Day {next_day} ({day_title}), how do you handle state persistence and cascading tool failure modes in multi-agent frameworks using MCP or LangGraph?"
            return f"{trans} Regarding Day {next_day} ({day_title}), what is the core role of Model Context Protocol (MCP) in connecting AI models to external tools?"
            
        elif next_day in [27, 28, 29]:
            return f"{trans} On Day {next_day} ({day_title}), what specific guardrails and Docker/Kubernetes container health checks do you deploy to secure AI APIs against prompt injection and memory leaks?"
            
        else:
            return f"{trans} Moving to Day {next_day} ({day_title}), how would you test and benchmark this system before deploying it to production?"

    def _call_gemini_question(self, session: InterviewSession, is_first: bool) -> Optional[str]:
        prompt = f"""
Candidate: {session.candidate.member.name} ({session.candidate.member.jobRole}, {session.candidate.member.yearsExperience} yrs exp)
Missions Context: {[m.model_dump() for m in session.candidate.missions[:5]]}
Current Question Count: {session.question_count}
Days Covered So Far: {session.days_covered}
Current Target Day: Day {session.current_day} ({session.current_topic})
Recent History:
{json.dumps(session.messages[-4:], indent=2)}

Generate EXACTLY ONE natural interviewer question for Day {session.current_day}.
"""
        return self._raw_gemini_generate(QUESTION_GENERATION_PROMPT, prompt)

    def _call_gemini_eval(self, session: InterviewSession, answer: str) -> Optional[Dict[str, Any]]:
        prompt = f"""
Candidate Level: {session.candidate.member.jobRole}, {session.candidate.member.yearsExperience} yrs exp
Question Asked: {session.messages[-2]['content'] if len(session.messages)>=2 else ''}
Candidate Answer: {answer}

Evaluate candidate answer strictly per schema.
"""
        res_text = self._raw_gemini_generate(EVALUATION_SYSTEM_PROMPT, prompt)
        if res_text:
            try:
                # Strip markdown code blocks if any
                clean_json = res_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
                return json.loads(clean_json)
            except Exception:
                pass
        return None

    def _call_gemini_feedback(self, session: InterviewSession) -> Optional[FeedbackModel]:
        prompt = f"""
Candidate: {session.candidate.member.name} ({session.candidate.member.jobRole}, {session.candidate.member.yearsExperience} yrs exp)
Questions Answered: {session.question_count}
Curriculum Days Covered: {session.days_covered}
Full Conversation History:
{json.dumps(session.messages, indent=2)}

Generate final structured feedback strictly per schema.
"""
        res_text = self._raw_gemini_generate(FEEDBACK_GENERATION_PROMPT, prompt)
        if res_text:
            try:
                clean_json = res_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
                data = json.loads(clean_json)
                return FeedbackModel(**data)
            except Exception:
                pass
        return None

    def _raw_gemini_generate(self, system_instruction: str, user_prompt: str) -> Optional[str]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_instruction}\n\n{user_prompt}"}]}
            ]
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
        return None

ai_engine = AIEngine()
