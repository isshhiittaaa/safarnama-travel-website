"""
backend/services/multilingual_chat_service.py

Wraps run_chat_pipeline (untouched) with automatic language
detection + translation, so /chat/query can accept and respond
in any of Sarvam's supported Indian languages, not just English.

Flow:
    query (any language)
        -> detect_language()
        -> translate to English (if not already English)
        -> run_chat_pipeline()  [existing RAG pipeline, untouched]
        -> translate response back to the original language
"""

from backend.services.chat_service import run_chat_pipeline
from backend.services.sarvam_service import detect_language, translate_text


def run_multilingual_chat_pipeline(
    query: str,
    session_id: str | None,
    user_id: str,
) -> dict:
    """
    Args:
        query: the user's raw query, in any supported language.
        session_id: existing session id, or None to start a new one.
        user_id: the authenticated user's id.

    Returns:
        Same dict shape as run_chat_pipeline (session_id, response,
        preferred_categories, map_images), plus an extra
        "detected_language" key so the caller/frontend knows what
        language was detected and responded in.
    """

    detected_language = detect_language(query)

    if detected_language and detected_language != "en-IN":
        english_query = translate_text(
            text=query,
            source_language_code=detected_language,
            target_language_code="en-IN",
        )
    else:
        detected_language = "en-IN"
        english_query = query

    result = run_chat_pipeline(
        query=english_query,
        session_id=session_id,
        user_id=user_id,
    )

    if detected_language != "en-IN":
        result["response"] = translate_text(
            text=result["response"],
            source_language_code="en-IN",
            target_language_code=detected_language,
        )

    result["detected_language"] = detected_language

    return result