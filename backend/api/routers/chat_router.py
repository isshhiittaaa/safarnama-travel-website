import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.api.session_store import (
    get_user_sessions,
    get_session_messages,
    delete_session,
)
from backend.api.auth.auth_router import get_current_user
from backend.services.multilingual_chat_service import run_multilingual_chat_pipeline


router = APIRouter()


# ==========================================================
# Schemas
# ==========================================================

class QueryRequest(BaseModel):
    query: str
    session_id: str | None = None


class QueryResponse(BaseModel):
    session_id: str
    response: str
    preferred_categories: list[str]
    map_images: list[str]
    detected_language: str = "en-IN"


# ==========================================================
# POST /chat/query — main chat, login required
# ==========================================================

@router.post("/query", response_model=QueryResponse)
def query_planner(
    request: QueryRequest,
    current_user: dict = Depends(get_current_user),
):

    result = run_multilingual_chat_pipeline(
        query=request.query,
        session_id=request.session_id,
        user_id=current_user["user_id"],
    )

    return QueryResponse(**result)


# ==========================================================
# POST /chat/new — explicitly start a fresh conversation
# ==========================================================

@router.post("/new")
def new_chat(current_user: dict = Depends(get_current_user)):
    """
    Just generates a fresh session_id — the frontend should use
    this for its next /chat/query call to start a clean session.
    """

    return {"session_id": str(uuid.uuid4())}


# ==========================================================
# GET /chat/history — list this user's past chat sessions
# ==========================================================

@router.get("/history")
def list_history(current_user: dict = Depends(get_current_user)):

    sessions = get_user_sessions(current_user["user_id"])

    return {"sessions": sessions}


# ==========================================================
# GET /chat/history/{session_id} — messages in one session
# ==========================================================

@router.get("/history/{session_id}")
def get_history_detail(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):

    messages = get_session_messages(session_id, current_user["user_id"])

    if not messages:
        raise HTTPException(
            status_code=404,
            detail="Session not found or does not belong to you.",
        )

    return {"session_id": session_id, "messages": messages}


# ==========================================================
# DELETE /chat/history/{session_id}
# ==========================================================

@router.delete("/history/{session_id}")
def delete_history(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):

    deleted = delete_session(session_id, current_user["user_id"])

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Session not found or does not belong to you.",
        )

    return {"status": "deleted", "session_id": session_id}