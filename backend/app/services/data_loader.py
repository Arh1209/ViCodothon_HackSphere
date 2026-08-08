import os
import json
from typing import Dict, List, Any, Optional
from app.services.db_service import get_registered_candidates

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data"))
if not os.path.exists(DATA_DIR):
    DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))

CANDIDATES_FILE = os.path.join(DATA_DIR, "candidates.json")
CURRICULUM_FILE = os.path.join(DATA_DIR, "curriculum.json")

def load_candidates() -> List[Dict[str, Any]]:
    original_candidates = []
    if os.path.exists(CANDIDATES_FILE):
        with open(CANDIDATES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            original_candidates = data.get("candidates", [])

    # Combine original cohort dataset with newly registered DB candidates
    registered_candidates = get_registered_candidates()
    return original_candidates + registered_candidates

def get_candidate_by_id(candidate_id: str) -> Optional[Dict[str, Any]]:
    candidates = load_candidates()
    for cand in candidates:
        if cand.get("member", {}).get("id") == candidate_id:
            return cand
    return None

def load_curriculum() -> Dict[str, Any]:
    if os.path.exists(CURRICULUM_FILE):
        with open(CURRICULUM_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"cohort": "", "modules": [], "days": []}

def get_curriculum_day(day_number: int) -> Optional[Dict[str, Any]]:
    curr = load_curriculum()
    for day_obj in curr.get("days", []):
        if day_obj.get("day") == day_number:
            return day_obj
    return None
