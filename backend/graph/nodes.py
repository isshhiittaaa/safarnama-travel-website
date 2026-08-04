from backend.graph.state import TourismState

from backend.recommendation.parser import PreferenceParser
from backend.recommendation.rule_engine import RuleEngine
from backend.rag.retriever import TourismRetriever
from backend.recommendation.ranking_engine import RankingEngine
from backend.recommendation.itinerary_engine import ItineraryEngine

from backend.prompts.prompt_builder import PromptBuilder
from backend.services.groq_service import GroqService


# ====================================================
# Singleton Objects
# ====================================================

parser = PreferenceParser()

rule_engine = RuleEngine()

retriever = TourismRetriever()

ranking_engine = RankingEngine()

itinerary_engine = ItineraryEngine()

prompt_builder = PromptBuilder()

llm = GroqService()


# ====================================================
# Parser Node
# ====================================================

# Cities we know exist but have NO data for — used only as a
# safety check to prevent silently substituting Varanasi data
# when the user explicitly asked about a different city.
OTHER_KNOWN_CITIES = [
    "jaipur", "agra", "delhi", "mumbai", "goa", "kerala",
    "manali", "shimla", "kolkata", "chennai", "bangalore",
    "udaipur", "jodhpur", "amritsar", "rishikesh", "pune",
    "hyderabad", "lucknow", "patna", "kanpur", "nagpur",
]

# Built once at startup from actual indexed data — not
# hardcoded by hand.
PLACE_INDEX = retriever.build_place_index()

SEMANTIC_CONFIDENCE_THRESHOLD = 0.65


def parser_node(state: TourismState):

    preference = parser.parse(
        state["user_query"]
    )

    query_lower = state["user_query"].lower()

    # ---- Step: City found via direct extraction? ----
    if preference.city:
        return {
            "preference": preference,
            "fallback_city": preference.city,
        }

    # ---- Step: Mentions another known (unsupported) city? ----
    if any(city in query_lower for city in OTHER_KNOWN_CITIES):
        # Explicit request for a city we don't have data for —
        # stop here, no fallback substitution.
        return {
            "preference": preference,
            "fallback_city": state.get("fallback_city"),
        }

    # ---- Step: Place-name index match ----
    matched_city = _match_place_index(query_lower)

    if matched_city:
        preference.city = matched_city
        return {
            "preference": preference,
            "fallback_city": matched_city,
        }

    # ---- Step: Semantic distance check ----
    resolved_city, is_confident = _resolve_city_semantically(
        state["user_query"]
    )

    if resolved_city and is_confident:
        preference.city = resolved_city
        return {
            "preference": preference,
            "fallback_city": resolved_city,
        }

    # ---- Step: Use session fallback_city, else ask ----
    if state.get("fallback_city"):
        preference.city = state["fallback_city"]

    return {
        "preference": preference,
        "fallback_city": preference.city or state.get("fallback_city"),
    }


def _match_place_index(query_lower: str):
    """
    Checks the query against every known place name in the
    database (built dynamically via build_place_index()).
    Longest names are checked first to avoid partial-substring
    false matches.
    """

    for place_name in sorted(PLACE_INDEX, key=len, reverse=True):

        if place_name in query_lower:
            return PLACE_INDEX[place_name]

    return None


def _resolve_city_semantically(query: str):
    """
    Fallback semantic match — used only when the place-name
    index found nothing. Returns (city, is_confident).
    """

    docs = retriever.search(
        query=query,
        filters=None,
        top_k=1,
    )

    if not docs:
        return None, False

    top_doc = docs[0]
    distance = top_doc.metadata.get("retrieval_distance")
    city = top_doc.metadata.get("city")

    if distance is None or city is None:
        return None, False

    is_confident = distance <= SEMANTIC_CONFIDENCE_THRESHOLD

    return city, is_confident

# ====================================================
# Rule Engine Node
# ====================================================

def rule_engine_node(state: TourismState):

    context = rule_engine.build_context(
        state["preference"]
    )

    return {
        "recommendation_context": context
    }


# ====================================================
# Retriever Node
# ====================================================

def retriever_node(state: TourismState):

    preference = state["preference"]

    context = state["recommendation_context"]

    documents = []

    for category in context.preferred_categories:

        # ----------------------------------------
        # Dataset-specific retrieval size
        # ----------------------------------------

        if category == "attractions":
            top_k = 15

        elif category == "restaurants":
            top_k = 8

        elif category == "hotels":
            top_k = 6

        elif category == "festivals":
            top_k = 4

        elif category == "travel_tips":
            top_k = 3

        elif category == "restrictions":
            top_k = 3

        elif category == "emergency_services":
            top_k = 2

        elif category == "distance_matrix":
            top_k = 5

        elif category == "faqs":
            top_k = 5

        else:
            top_k = context.top_k

        filters = {
            "$and": [
                {
                    "city": preference.city
                },
                {
                    "category": category
                }
            ]
        }

        docs = retriever.search(

            # Use the user's full query instead of only interests
            query=preference.original_query,

            filters=filters,

            top_k=top_k,

        )

        documents.extend(docs)

    # ----------------------------------------
    # Remove duplicate documents
    # ----------------------------------------

    unique_documents = []
    seen = set()

    for doc in documents:

        key = (
            doc.metadata.get("category"),
            doc.page_content,
        )

        if key in seen:
            continue

        seen.add(key)
        unique_documents.append(doc)

    return {
        "retrieved_documents": unique_documents
    }


# ====================================================
# Ranking Node
# ====================================================

def ranking_node(state: TourismState):

    ranked = ranking_engine.rank(

        documents=state["retrieved_documents"],

        preference=state["preference"]

    )

    return {

        "ranked_documents": ranked

    }


# ====================================================
# Itinerary Node
# ====================================================

def itinerary_node(state: TourismState):

    itinerary = itinerary_engine.build(

        preference=state["preference"],

        documents=state["ranked_documents"]

    )

    return {

        "itinerary": itinerary

    }


# ====================================================
# Prompt Builder Node
# ====================================================

def prompt_builder_node(state: TourismState):

    system_prompt, user_prompt = prompt_builder.build(

        user_query=state["user_query"],

        preference=state["preference"],

        itinerary=state["itinerary"],

        documents=state["ranked_documents"],

        conversation_history=state.get("conversation_history", ""),

    )

    return {

        "system_prompt": system_prompt,

        "user_prompt": user_prompt,

    }


# ====================================================
# LLM Node
# ====================================================

def llm_node(state: TourismState):

    documents = state.get("retrieved_documents", [])

    if not documents:

        preference = state["preference"]

        if preference.city:
            city_display = preference.city.title()
        else:
            city_display = _guess_mentioned_city(state["user_query"])

        return {
            "response": (
                f"I couldn't find reliable information for {city_display} "
                f"in the tourism knowledge base. This system currently has "
                f"verified data only for Varanasi. Please ask about Varanasi "
                f"instead, or check back once more cities are added."
            ),
            "token_usage": {},
        }

    response, token_usage = llm.generate(

        system_prompt=state["system_prompt"],

        user_prompt=state["user_prompt"],

    )

    return {

        "response": response,

        "token_usage": token_usage,

    }


# ====================================================
# Helper — best-effort city name for clearer "not found" messages
# ====================================================

def _guess_mentioned_city(query: str) -> str:
    """
    Purely for display in the "no data found" message — does NOT
    affect retrieval or filtering in any way.
    """

    common_cities = [
        "jaipur", "agra", "delhi", "mumbai", "goa", "kerala",
        "manali", "shimla", "kolkata", "chennai", "bangalore",
        "udaipur", "jodhpur", "amritsar", "rishikesh",
    ]

    query_lower = query.lower()

    for city in common_cities:
        if city in query_lower:
            return city.title()

    return "the requested location"