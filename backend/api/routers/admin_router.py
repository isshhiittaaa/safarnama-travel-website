from fastapi import APIRouter, Depends

from backend.api.stats import get_analytics
from backend.api.auth.auth_router import get_current_admin
from backend.api.auth.auth_db import get_connection


router = APIRouter()


@router.get("/stats")
def admin_stats(current_admin: dict = Depends(get_current_admin)):
    """
    Query analytics — total/answered/unanswered queries, token
    usage. Admin only.
    """

    return get_analytics()


@router.get("/users")
def list_users(current_admin: dict = Depends(get_current_admin)):
    """
    List all registered users. Admin only.
    """

    conn = get_connection()

    rows = conn.execute(
        "SELECT id, username, email, is_admin, created_at FROM users"
    ).fetchall()

    conn.close()

    return {
        "users": [
            {
                "id": r["id"],
                "username": r["username"],
                "email": r["email"],
                "is_admin": bool(r["is_admin"]),
                "created_at": r["created_at"],
            }
            for r in rows
        ]
    }