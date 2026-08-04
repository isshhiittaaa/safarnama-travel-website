import sqlite3
import os


DB_PATH = "data/favorites.db"


def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_favorites_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            place_name TEXT NOT NULL COLLATE NOCASE,
            category TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, place_name)
        )
    """)
    conn.commit()
    conn.close()


def add_favorite(user_id: int, place_name: str, category: str):
    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO favorites (user_id, place_name, category) VALUES (?, ?, ?)",
            (user_id, place_name, category),
        )
        conn.commit()
        return cursor.lastrowid
    except sqlite3.IntegrityError:
        return None  # already favorited (case-insensitive match caught it)
    finally:
        conn.close()


def get_user_favorites(user_id: int) -> list:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def remove_favorite(favorite_id: int, user_id: int) -> bool:
    conn = get_connection()
    cursor = conn.execute(
        "DELETE FROM favorites WHERE id = ? AND user_id = ?",
        (favorite_id, user_id),
    )
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted