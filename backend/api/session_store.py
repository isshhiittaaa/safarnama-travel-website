import sqlite3
import json
import os


DB_PATH = "data/sessions.db"


def _get_connection():

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    conn = sqlite3.connect(DB_PATH)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            query TEXT NOT NULL,
            response TEXT NOT NULL,
            preference TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    return conn


MAX_HISTORY = 4  # keep last 4 exchanges per session (for prompt context)


def get_history(session_id: str) -> list:

    conn = _get_connection()

    cursor = conn.execute(
        """
        SELECT query, response FROM sessions
        WHERE session_id = ?
        ORDER BY created_at ASC
        """,
        (session_id,),
    )

    rows = cursor.fetchall()
    conn.close()

    history = [{"query": q, "response": r} for q, r in rows]

    return history[-MAX_HISTORY:]


def get_last_preference(session_id: str):

    conn = _get_connection()

    cursor = conn.execute(
        """
        SELECT preference FROM sessions
        WHERE session_id = ?
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (session_id,),
    )

    row = cursor.fetchone()
    conn.close()

    if row and row[0]:
        return json.loads(row[0])

    return None


def add_exchange(session_id: str, user_id: int, query: str, response: str, preference: dict):

    conn = _get_connection()

    conn.execute(
        """
        INSERT INTO sessions (session_id, user_id, query, response, preference)
        VALUES (?, ?, ?, ?, ?)
        """,
        (session_id, user_id, query, response, json.dumps(preference)),
    )

    conn.commit()
    conn.close()


def format_history_for_prompt(session_id: str) -> str:

    history = get_history(session_id)

    if not history:
        return ""

    lines = ["Previous conversation in this session:\n"]

    for exchange in history:
        lines.append(f"User: {exchange['query']}")
        lines.append(f"Assistant: {exchange['response'][:300]}...\n")

    return "\n".join(lines)


# ==========================================================
# User-scoped history — for /chat/history and delete endpoints
# ==========================================================

def get_user_sessions(user_id: int) -> list:
    """
    Returns a list of distinct sessions belonging to this user,
    each with its first query (as a title) and last activity time.
    """

    conn = _get_connection()

    cursor = conn.execute(
        """
        SELECT session_id,
               MIN(query) as first_query,
               MAX(created_at) as last_active
        FROM sessions
        WHERE user_id = ?
        GROUP BY session_id
        ORDER BY last_active DESC
        """,
        (user_id,),
    )

    rows = cursor.fetchall()
    conn.close()

    return [
        {"session_id": r[0], "title": r[1], "last_active": r[2]}
        for r in rows
    ]


def get_session_messages(session_id: str, user_id: int) -> list:
    """
    Returns all messages in a session — but only if it belongs
    to the requesting user (prevents viewing others' chats).
    """

    conn = _get_connection()

    cursor = conn.execute(
        """
        SELECT query, response, created_at FROM sessions
        WHERE session_id = ? AND user_id = ?
        ORDER BY created_at ASC
        """,
        (session_id, user_id),
    )

    rows = cursor.fetchall()
    conn.close()

    return [
        {"query": q, "response": r, "created_at": c}
        for q, r, c in rows
    ]


def delete_session(session_id: str, user_id: int) -> bool:
    """
    Deletes a session — only if it belongs to the requesting user.
    Returns True if something was deleted.
    """

    conn = _get_connection()

    cursor = conn.execute(
        "DELETE FROM sessions WHERE session_id = ? AND user_id = ?",
        (session_id, user_id),
    )

    deleted = cursor.rowcount > 0

    conn.commit()
    conn.close()

    return deleted