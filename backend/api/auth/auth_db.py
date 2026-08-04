import sqlite3
import os

from backend.api.auth.auth_service import hash_password


DB_PATH = "data/users.db"


def get_connection():

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    return conn


def init_db():
    """
    Creates the users table if it doesn't exist, and ensures
    a single fixed admin account exists (created from
    ADMIN_EMAIL / ADMIN_PASSWORD env vars). Call this once at
    server startup.
    """

    conn = get_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            is_admin INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    _ensure_admin_exists(conn)

    conn.close()


def _ensure_admin_exists(conn):

    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        print(
            "[auth_db] Warning: ADMIN_EMAIL / ADMIN_PASSWORD not set "
            "in .env — no admin account created."
        )
        return

    existing = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (admin_email,),
    ).fetchone()

    if existing:
        return

    conn.execute(
        """
        INSERT INTO users (username, email, hashed_password, is_admin)
        VALUES (?, ?, ?, 1)
        """,
        ("admin", admin_email, hash_password(admin_password)),
    )

    conn.commit()

    print(f"[auth_db] Admin account created: {admin_email}")


def get_user_by_email(email: str):

    conn = get_connection()

    row = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,),
    ).fetchone()

    conn.close()

    return dict(row) if row else None


def get_user_by_username(username: str):

    conn = get_connection()

    row = conn.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,),
    ).fetchone()

    conn.close()

    return dict(row) if row else None


def create_user(username: str, email: str, password: str):

    conn = get_connection()

    conn.execute(
        """
        INSERT INTO users (username, email, hashed_password, is_admin)
        VALUES (?, ?, ?, 0)
        """,
        (username, email, hash_password(password)),
    )

    conn.commit()
    conn.close()


# if __name__ == "__main__":
#     init_db()
#     print("Database initialized.")