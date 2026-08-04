from typing import TypedDict

from langchain_core.documents import Document

from backend.recommendation.models import (
    UserPreference,
    RecommendationContext,
    Itinerary,
)


class TourismState(TypedDict):
    """
    Shared state passed between LangGraph nodes.

    Flow

    User Query
        ↓
    Parser
        ↓
    Rule Engine
        ↓
    Retriever
        ↓
    Ranking Engine
        ↓
    Itinerary Engine
        ↓
    Prompt Builder
        ↓
    LLM
    """

    # =====================================================
    # User Input
    # =====================================================

    user_query: str

    # =====================================================
    # Parser Output
    # =====================================================

    preference: UserPreference
    
    fallback_city: str

    # =====================================================
    # Rule Engine Output
    # =====================================================

    recommendation_context: RecommendationContext

    # =====================================================
    # Retrieval
    # =====================================================

    retrieved_documents: list[Document]

    # =====================================================
    # Ranking
    # =====================================================

    ranked_documents: list[Document]

    # =====================================================
    # Recommendation
    # =====================================================

    itinerary: Itinerary


    # =====================================================
    # Conversation_history
    # =====================================================
    
    conversation_history: str

    # =====================================================
    # Prompt
    # =====================================================

    system_prompt: str



    user_prompt: str

    # =====================================================
    # LLM Response
    # =====================================================

    response: str

    token_usage: dict

    # =====================================================
    # Diagnostics
    # =====================================================

    intent: str

    language: str

    errors: list[str]

    processing_time: float

    retrieved_count: int

    ranked_count: int