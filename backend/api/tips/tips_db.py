import sqlite3
import os


DB_PATH = "data/tips.db"


def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_tips_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS local_tips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            place_name TEXT NOT NULL COLLATE NOCASE,
            rating INTEGER NOT NULL,
            tip_text TEXT NOT NULL,
            photo_path TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def create_tip(user_id: int, username: str, place_name: str, rating: int, tip_text: str, photo_path: str = None):
    conn = get_connection()
    cursor = conn.execute(
        """
        INSERT INTO local_tips (user_id, username, place_name, rating, tip_text, photo_path)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (user_id, username, place_name, rating, tip_text, photo_path),
    )
    conn.commit()
    tip_id = cursor.lastrowid
    conn.close()
    return tip_id


def get_tips_for_place(place_name: str) -> list:
    """Public — anyone can see community tips for a place, no login needed."""
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM local_tips WHERE place_name = ? ORDER BY created_at DESC",
        (place_name,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_user_tips(user_id: int) -> list:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM local_tips WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_tip(tip_id: int, user_id: int) -> bool:
    conn = get_connection()
    cursor = conn.execute(
        "DELETE FROM local_tips WHERE id = ? AND user_id = ?",
        (tip_id, user_id),
    )
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted