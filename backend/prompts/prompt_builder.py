from collections import defaultdict

from langchain_core.documents import Document

from backend.prompts.system_prompt import SYSTEM_PROMPT
from backend.recommendation.models import (
    UserPreference,
    Itinerary,
)


class PromptBuilder:
    """
    Builds the final prompt for the LLM.

    Prompt includes:
    • User query
    • Parsed preferences
    • Ranked tourism knowledge
    • AI generated itinerary
    • Structured tourism context
    """

    # MAX_DOCUMENTS = 15
    MAX_PER_CATEGORY = {
        "attractions": 8,
        "restaurants": 5,
        "hotels": 3,
        "festivals": 3,
        "travel_tips": 3,
        "restrictions": 3,
        "emergency_services": 2,
        "faqs": 3,
        "distance_matrix": 2,
        "tourism_stats": 2,
        "policy": 2,
        "city_maps": 2,
    }

    DEFAULT_CATEGORY_LIMIT = 3

    # ---------------------------------------------------------

    def build(
        self,
        user_query: str,
        preference: UserPreference,
        itinerary: Itinerary,
        documents: list[Document],
        conversation_history: str = "",
    ) -> tuple[str, str]:

        documents = self._limit_documents(documents)

        tourism_context = self._format_documents(documents)

        itinerary_text = self._format_itinerary(itinerary)

        user_prompt = f"""

=========================================================
CONVERSATION HISTORY
=========================================================

{conversation_history if conversation_history else "This is the first message in the conversation."}

=========================================================
USER QUERY
=========================================================

{user_query}

=========================================================
USER PROFILE
=========================================================

City                : {preference.city or "Not specified"}

Trip Duration       : {preference.days or "Not specified"} day(s)

Budget              : {preference.budget or "Not specified"}

Traveller Type      : {preference.traveller_type}

Interests           : {", ".join(preference.interests) if preference.interests else "General"}

Senior Citizen      : {"Yes" if preference.senior_citizen else "No"}

Travelling with Kids: {"Yes" if preference.kids else "No"}

Accessibility Need  : {"Yes" if preference.accessibility else "No"}

=========================================================
RETRIEVED TOURISM KNOWLEDGE
=========================================================

{tourism_context}

=========================================================
GENERATED ITINERARY
=========================================================

{itinerary_text}

=========================================================
RESPONSE INSTRUCTIONS
=========================================================

Use ONLY the tourism information above.

If the user asked for recommendations:
- Recommend the highest ranked places.
- Explain WHY each place is recommended.

If hotels are available:
- Recommend suitable hotels.

If restaurants are available:
- Suggest restaurants naturally with the itinerary.

If travel tips are available:
- Mention them naturally.

If restrictions are available:
- Mention them clearly.

If emergency information is available:
- Mention hospitals or emergency contacts only if relevant.

If FAQ information exists:
- Use it while answering.

Never invent information.

Do not mention internal scores.

Write naturally.

Use headings.

Use bullet points.

End with useful travel advice.
"""
        return SYSTEM_PROMPT, user_prompt

    # ---------------------------------------------------------

    def _limit_documents(
        self,
        documents: list[Document],
    ) -> list[Document]:

        grouped = defaultdict(list)

        for doc in documents:

            category = doc.metadata.get(
                "category",
                "others",
            )

            grouped[category].append(doc)

        limited = []

        for category, docs in grouped.items():

            limit = self.MAX_PER_CATEGORY.get(
                category,
                self.DEFAULT_CATEGORY_LIMIT,
            )

            # docs is already in ranked (highest-score-first) order
            # since it was sliced out of the already-sorted
            # ranked_documents list, so this keeps the best ones
            # per category.
            limited.extend(docs[:limit])

        return limited

    # ---------------------------------------------------------

    def _format_documents(
        self,
        documents: list[Document],
    ) -> str:

        grouped = defaultdict(list)

        for doc in documents:

            category = doc.metadata.get(
                "category",
                "others",
            )

            grouped[category].append(doc)

        output = []

        category_titles = {
            "attractions": "Top Attractions",
            "restaurants": "Restaurants",
            "hotels": "Hotels",
            "travel_tips": "Travel Tips",
            "faqs": "FAQs",
            "festivals": "Festivals",
            "restrictions": "Restrictions",
            "distance_matrix": "Nearby Places",
            "emergency_services": "Emergency Services",
            "ai_metadata": "AI Metadata",
            "tourism_stats": "Official Tourism Statistics",
            "policy": "Government Tourism Policy",
            "city_maps": "Maps & Location",
        }

        for category, docs in grouped.items():

            output.append(
                f"\n========== {category_titles.get(category, category.title())} ==========\n"
            )

            for index, doc in enumerate(docs, start=1):

                metadata = doc.metadata

                name = (
                    metadata.get("place_name")
                    or metadata.get("restaurant_name")
                    or metadata.get("hotel_name")
                    or metadata.get("festival_name")
                    or metadata.get("festival")
                    or metadata.get("question")
                    or metadata.get("title")
                    or "Unknown"
                )

                reasons = ", ".join(
                    metadata.get(
                        "recommendation_reason",
                        [],
                    )
                )

                output.append(
                    f"""
{index}. {name}

Why Recommended:
{reasons if reasons else "N/A"}

Information:
{doc.page_content}
"""
                )

        return "\n".join(output)

    # ---------------------------------------------------------

    def _format_itinerary(
        self,
        itinerary: Itinerary,
    ) -> str:

        if not itinerary.days:
            return "No itinerary generated."

        output = []

        for day in itinerary.days:

            output.append(f"Day {day.day}")

            if day.attractions:

                output.append("Attractions:")

                for attraction in day.attractions:

                    output.append(
                        f"• {attraction.get('place_name','Unknown')}"
                    )

            if day.restaurants:

                output.append("Restaurants:")

                for restaurant in day.restaurants:

                    output.append(
                        f"• {restaurant.get('restaurant_name','Unknown')}"
                    )

            if day.hotels:

                output.append("Hotels:")

                for hotel in day.hotels:

                    output.append(
                        f"• {hotel.get('hotel_name', 'Unknown')}"
                    )

                output.append("")

            output.append("")

        return "\n".join(output)