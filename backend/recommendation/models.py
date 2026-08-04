from typing import Dict, List, Optional

from pydantic import BaseModel, Field


# ==========================================================
# User Preference
# ==========================================================

class UserPreference(BaseModel):
    """
    Structured preferences extracted from the user's query.
    """

    original_query: str = ""

    city: str = ""

    days: Optional[int] = None

    budget: Optional[int] = None

    interests: List[str] = Field(default_factory=list)

    traveller_type: str = "general"

    senior_citizen: bool = False

    kids: bool = False

    accessibility: bool = False

    language: str = "English"


# ==========================================================
# Recommendation Context
# ==========================================================

class RecommendationContext(BaseModel):
    """
    Stores business-rule decisions before retrieval.
    """

    filters: Dict[str, str] = Field(default_factory=dict)

    preferred_categories: List[str] = Field(default_factory=list)

    excluded_categories: List[str] = Field(default_factory=list)

    top_k: int = 8

    max_attractions: int = 5

    explanation: str = ""
    


# ==========================================================
# Recommended Place
# ==========================================================

class RecommendedPlace(BaseModel):
    """
    Final ranked place passed through the pipeline.
    """

    metadata: Dict = Field(default_factory=dict)

    recommendation_score: float = 0.0

    recommendation_reason: List[str] = Field(default_factory=list)


# ==========================================================
# Day Plan
# ==========================================================

class DayPlan(BaseModel):
    """
    Represents one travel day.
    """

    day: int

    attractions: List[dict] = Field(default_factory=list)

    restaurants: List[dict] = Field(default_factory=list)

    hotels: List[dict] = Field(default_factory=list)

    travel_tips: List[str] = Field(default_factory=list)

    notes: List[str] = Field(default_factory=list)


# ==========================================================
# Itinerary
# ==========================================================

class Itinerary(BaseModel):
    """
    Multi-day itinerary.
    """

    city: str = ""

    total_days: int = 1

    estimated_budget: Optional[int] = None

    traveller_type: str = "general"

    days: List[DayPlan] = Field(default_factory=list)

    summary: str = ""


# ==========================================================
# Final Recommendation Response
# ==========================================================

class RecommendationResult(BaseModel):
    """
    Complete output produced before sending to the LLM.
    """

    preference: UserPreference

    context: RecommendationContext

    itinerary: Itinerary

    retrieved_documents: List = Field(default_factory=list)

    ranked_documents: List = Field(default_factory=list)

    llm_response: str = ""