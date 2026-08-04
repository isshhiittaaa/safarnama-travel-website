import sqlite3
import os


DB_PATH = "data/reports.db"


def get_connection():

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    return conn


def init_reports_db():

    conn = get_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS issue_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            photo_path TEXT,
            location_hint TEXT,
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


def create_report(user_id: int, category: str, description: str, photo_path: str, location_hint: str):

    conn = get_connection()

    cursor = conn.execute(
        """
        INSERT INTO issue_reports
            (user_id, category, description, photo_path, location_hint)
        VALUES (?, ?, ?, ?, ?)
        """,
        (user_id, category, description, photo_path, location_hint),
    )

    conn.commit()
    report_id = cursor.lastrowid
    conn.close()

    return report_id


def get_user_reports(user_id: int) -> list:

    conn = get_connection()

    rows = conn.execute(
        "SELECT * FROM issue_reports WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,),
    ).fetchall()

    conn.close()

    return [dict(r) for r in rows]


def get_all_reports() -> list:
    """Admin — sees every report from every user."""

    conn = get_connection()

    rows = conn.execute(
        "SELECT * FROM issue_reports ORDER BY created_at DESC"
    ).fetchall()

    conn.close()

    return [dict(r) for r in rows]


def update_report_status(report_id: int, status: str) -> bool:

    conn = get_connection()

    cursor = conn.execute(
        "UPDATE issue_reports SET status = ? WHERE id = ?",
        (status, report_id),
    )

    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()

    return updated