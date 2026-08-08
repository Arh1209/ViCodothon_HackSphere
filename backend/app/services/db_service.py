import sqlite3
import hashlib
import os
import json
import time
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "app_database.db")

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        job_role TEXT NOT NULL,
        years_experience REAL NOT NULL,
        education TEXT NOT NULL,
        phone TEXT DEFAULT '',
        resume TEXT DEFAULT '',
        skills TEXT DEFAULT '',
        role TEXT DEFAULT 'candidate',
        created_at REAL NOT NULL
    )
    """)

    # Ensure phone, resume, skills columns exist if table was initialized earlier
    for col in ["phone", "resume", "skills"]:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col} TEXT DEFAULT ''")
        except sqlite3.OperationalError:
            pass

    # Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    # Initialize default settings if not exists
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('min_questions', '8')")
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('min_curriculum_days', '4')")

    # Sessions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        candidate_name TEXT NOT NULL,
        job_role TEXT NOT NULL,
        messages_json TEXT NOT NULL,
        evaluations_json TEXT NOT NULL,
        question_count INTEGER DEFAULT 0,
        days_covered_json TEXT NOT NULL,
        done INTEGER DEFAULT 0,
        feedback_json TEXT,
        created_at REAL NOT NULL,
        updated_at REAL NOT NULL
    )
    """)

    # Deleted Candidates Table (Soft delete tracker)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS deleted_candidates (
        candidate_id TEXT PRIMARY KEY,
        deleted_at REAL NOT NULL
    )
    """)

    conn.commit()
    conn.close()

def get_deleted_candidate_ids() -> set:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT candidate_id FROM deleted_candidates")
    rows = cursor.fetchall()
    conn.close()
    return {r["candidate_id"] for r in rows}

def delete_candidate_db(candidate_id: str) -> bool:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Record in deleted_candidates table (Soft delete)
    now = time.time()
    cursor.execute("INSERT OR REPLACE INTO deleted_candidates (candidate_id, deleted_at) VALUES (?, ?)", (candidate_id, now))

    conn.commit()
    conn.close()
    return True

def restore_candidate_db(candidate_id: str) -> bool:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM deleted_candidates WHERE candidate_id = ?", (candidate_id,))
    conn.commit()
    conn.close()
    return True

def hash_password(password: str) -> str:
    salt = "interview_agent_secure_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def register_user(
    full_name: str, 
    email: str, 
    password: str = "password123", 
    job_role: str = "", 
    years_experience: float = 0, 
    education: str = "",
    phone: str = "",
    resume: str = "",
    skills: str = ""
) -> Dict[str, Any]:
    init_db()
    email_clean = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check duplicate
    cursor.execute("SELECT id FROM users WHERE email = ?", (email_clean,))
    if cursor.fetchone():
        conn.close()
        raise ValueError("Candidate with this email already exists.")

    cand_count_cursor = cursor.execute("SELECT COUNT(*) as cnt FROM users")
    cnt = cand_count_cursor.fetchone()['cnt']
    cand_id = f"CAND-REG-{cnt + 101:03d}"
    pwd = password if password else "password123"
    pwd_hash = hash_password(pwd)
    now = time.time()

    cursor.execute("""
    INSERT INTO users (candidate_id, full_name, email, password_hash, job_role, years_experience, education, phone, resume, skills, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'candidate', ?)
    """, (
        cand_id, full_name.strip(), email_clean, pwd_hash, 
        job_role.strip(), years_experience, education.strip(), 
        phone.strip(), resume.strip(), skills.strip(), now
    ))

    conn.commit()
    
    cursor.execute("SELECT * FROM users WHERE email = ?", (email_clean,))
    user = dict(cursor.fetchone())
    conn.close()

    skills_list = [s.strip() for s in (user.get("skills") or "").split(",") if s.strip()]

    # Convert to candidate model structure
    cand_obj = {
        "member": {
            "id": user["candidate_id"],
            "name": user["full_name"],
            "jobRole": user["job_role"],
            "yearsExperience": user["years_experience"],
            "education": user["education"],
            "phone": user.get("phone", ""),
            "resume": user.get("resume", ""),
            "skills": skills_list,
            "status": "REGISTERED",
            "email": user["email"]
        },
        "missions": [],
        "signals": { "commitDays": 0, "missionsCompleted": 0, "missionsFirstTry": 0 },
        "isRegisteredUser": True
    }
    return cand_obj

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    init_db()
    email_clean = email.strip().lower()
    pwd_hash = hash_password(password)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ? AND password_hash = ?", (email_clean, pwd_hash))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return None

    u = dict(user)
    skills_list = [s.strip() for s in (u.get("skills") or "").split(",") if s.strip()]
    return {
        "member": {
            "id": u["candidate_id"],
            "name": u["full_name"],
            "jobRole": u["job_role"],
            "yearsExperience": u["years_experience"],
            "education": u["education"],
            "phone": u.get("phone", ""),
            "resume": u.get("resume", ""),
            "skills": skills_list,
            "status": "REGISTERED",
            "email": u["email"]
        },
        "missions": [],
        "signals": { "commitDays": 0, "missionsCompleted": 0, "missionsFirstTry": 0 },
        "isRegisteredUser": True
    }

def get_registered_candidates() -> List[Dict[str, Any]]:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY created_at ASC")
    users = cursor.fetchall()
    conn.close()

    res = []
    for u in users:
        d = dict(u)
        skills_list = [s.strip() for s in (d.get("skills") or "").split(",") if s.strip()]
        res.append({
            "member": {
                "id": d["candidate_id"],
                "name": d["full_name"],
                "jobRole": d["job_role"],
                "yearsExperience": d["years_experience"],
                "education": d["education"],
                "phone": d.get("phone", ""),
                "resume": d.get("resume", ""),
                "skills": skills_list,
                "status": "REGISTERED",
                "email": d["email"]
            },
            "missions": [],
            "signals": { "commitDays": 0, "missionsCompleted": 0, "missionsFirstTry": 0 },
            "isRegisteredUser": True
        })
    return res

def get_settings() -> Dict[str, int]:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    rows = cursor.fetchall()
    conn.close()

    settings = {"min_questions": 8, "min_curriculum_days": 4}
    for r in rows:
        key, val = r["key"], r["value"]
        if key in settings:
            try:
                settings[key] = int(val)
            except ValueError:
                pass
    return settings

def update_settings(min_questions: int, min_curriculum_days: int) -> Dict[str, int]:
    if min_questions < 8:
        raise ValueError("Minimum questions cannot be less than 8 per Technical Specification.")
    if min_curriculum_days < 4:
        raise ValueError("Minimum curriculum days cannot be less than 4 per Technical Specification.")

    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('min_questions', ?)", (str(min_questions),))
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('min_curriculum_days', ?)", (str(min_curriculum_days),))
    conn.commit()
    conn.close()
    return get_settings()

def save_session_db(session_id: str, candidate_id: str, candidate_name: str, job_role: str, messages: list, evaluations: list, question_count: int, days_covered: list, done: bool, feedback: dict, created_at: float):
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    now = time.time()

    cursor.execute("""
    INSERT OR REPLACE INTO sessions (session_id, candidate_id, candidate_name, job_role, messages_json, evaluations_json, question_count, days_covered_json, done, feedback_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        session_id, candidate_id, candidate_name, job_role,
        json.dumps(messages), json.dumps(evaluations), question_count,
        json.dumps(days_covered), 1 if done else 0,
        json.dumps(feedback) if feedback else None,
        created_at, now
    ))
    conn.commit()
    conn.close()

# Initialize DB on module import
init_db()
