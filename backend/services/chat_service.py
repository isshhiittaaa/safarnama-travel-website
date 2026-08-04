"""
backend/services/chat_service.py

Shared pipeline logic used by both /chat/query (text) and
/voice/query (audio). Extracted from chat_router.py so the RAG
pipeline runs through exactly one code path — nothing about the
pipeline itself changes.
"""

import time
import uuid

from backend.graph.graph_builder import build_graph
from backend.api.session_store import (
    add_exchange,
    format_history_for_prompt,
    get_last_preference,
)
from backend.api.stats import log_query
from langfuse import observe


graph = build_graph()

@observe()
def run_chat_pipeline(query: str, session_id: str | None, user_id: str) -> dict:
    """
    Runs one query through the full RAG pipeline: loads session
    history/fallback city, invokes the graph, logs stats, saves
    the exchange, and returns a plain dict (same fields
    QueryResponse used before).
    """

    session_id = session_id or str(uuid.uuid4())

    conversation_history = format_history_for_prompt(session_id)

    last_preference = get_last_preference(session_id)
    fallback_city = (last_preference or {}).get("city", "")

    start = time.perf_counter()

    result = graph.invoke({
        "user_query": query,
        "conversation_history": conversation_history,
        "fallback_city": fallback_city,
    })

    end = time.perf_counter()

    ranked = result.get("ranked_documents", [])
    retrieved = result.get("retrieved_documents", [])

    map_images = [
        doc.metadata.get("image_path")
        for doc in ranked
        if doc.metadata.get("category") == "city_maps"
        and doc.metadata.get("image_path")
    ]

    context = result.get("recommendation_context")
    response_text = result.get("response", "")
    token_usage = result.get("token_usage", {}) or {}

    status = "answered" if len(retrieved) > 0 else "unanswered"

    log_query(
        query=query,
        session_id=session_id,
        status=status,
        token_usage=token_usage,
        retrieved_count=len(retrieved),
        execution_time=end - start,
    )

    preference = result.get("preference")

    add_exchange(
        session_id=session_id,
        user_id=user_id,
        query=query,
        response=response_text,
        preference=preference.__dict__ if preference else {},
    )

    return {
        "session_id": session_id,
        "response": response_text,
        "preferred_categories": context.preferred_categories if context else [],
        "map_images": map_images,
    }