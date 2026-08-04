from backend.recommendation.models import (
    UserPreference,
    RecommendationContext,
)
from config.dataset_registry import DatasetRegistry
import re


class RuleEngine:
    """
    Applies business rules and decides which datasets
    should be searched based on the user's intent.
    """

    def build_context(
        self,
        preference: UserPreference,
    ) -> RecommendationContext:

        context = RecommendationContext()

        query = preference.original_query.lower()

        # -------------------------------------------------
        # City Filter
        # -------------------------------------------------

        if preference.city:
            context.filters["city"] = preference.city


        # -------------------------------------------------
        # Default categories for every city trip
        # -------------------------------------------------

            context.preferred_categories.extend([
                DatasetRegistry.ATTRACTIONS,
                DatasetRegistry.TRAVEL_TIPS,
                DatasetRegistry.RESTRICTIONS,
            ])

        # -------------------------------------------------
        # Recommendation Categories
        # -------------------------------------------------

        if "spiritual" in preference.interests:
            context.preferred_categories.extend([
                DatasetRegistry.ATTRACTIONS,
                DatasetRegistry.FAQS,
                DatasetRegistry.TRAVEL_TIPS,
            ])

        if "food" in preference.interests:
            context.preferred_categories.append(
                DatasetRegistry.RESTAURANTS
            )

        if "festival" in preference.interests:
            context.preferred_categories.append(
                DatasetRegistry.FESTIVALS
            )

        # -------------------------------------------------
        # Hotel Queries
        # -------------------------------------------------

        if (
            any(word in query for word in [
            "hotel",
            "stay",
            "accommodation",
            "resort",
            "hostel",
            "guest house",
            "guesthouse",
            "room"
        ])
         or "hotel" in preference.interests):

            context.preferred_categories.append(
                DatasetRegistry.HOTELS
            )

        # -------------------------------------------------
        # Restaurant Queries
        # -------------------------------------------------

        if any(word in query for word in [
            "restaurant",
            "food",
            "cafe",
            "eat",
            "breakfast",
            "lunch",
            "dinner",
            "street food"
        ]):

            context.preferred_categories.append(
                DatasetRegistry.RESTAURANTS
            )

        # -------------------------------------------------
        # Festival Queries
        # -------------------------------------------------

        if any(word in query for word in [
            "festival",
            "event",
            "celebration",
            "dev deepawali",
            "mahashivratri"
        ]):

            context.preferred_categories.append(
                DatasetRegistry.FESTIVALS
            )

        # -------------------------------------------------
        # Restriction Queries
        # -------------------------------------------------

        if any(word in query for word in [
            "allowed",
            "restriction",
            "camera",
            "photography",
            "mobile",
            "phone",
            "dress",
            "shoes",
            "drone",
            "food allowed"
        ]):

            context.preferred_categories.append(
                DatasetRegistry.RESTRICTIONS
            )

        # -------------------------------------------------
        # Emergency Queries
        # -------------------------------------------------

        if any(word in query for word in [
            "hospital",
            "ambulance",
            "emergency",
            "police",
            "fire",
            "helpline",
            "medical"
        ]):

            context.preferred_categories.append(
                DatasetRegistry.EMERGENCY_SERVICES
            )

        # -------------------------------------------------
        # FAQ Queries
        # -------------------------------------------------

        if any(word in query for word in [
            "what is",
            "why",
            "history",
            "famous",
            "best known",
            "tell me about"
        ]):

            context.preferred_categories.append(
                DatasetRegistry.FAQS
            )

        # -------------------------------------------------
        # Travel Tips
        # -------------------------------------------------

        if any(word in query for word in [
            "tips",
            "advice",
            "safe",
            "safety",
            "travel tip",
            "scam"
        ]):

            context.preferred_categories.append(
                DatasetRegistry.TRAVEL_TIPS,
            )


        if any(word in query for word in [
            "trip",
            "itinerary",
            "plan",
            "travel",
            "visit",
            "tour",
            "recommend"
        ]):
    
            context.preferred_categories.append(
                DatasetRegistry.ATTRACTIONS,
            )

        if any(word in query for word in [
            "transport",
            "transportation",
            "taxi",
            "cab",
            "auto",
            "rickshaw",
            "bus",
            "metro",
            "how to reach"
        ]):

            context.preferred_categories.append(
                DatasetRegistry.TRAVEL_TIPS
            )

            context.preferred_categories.append(
                DatasetRegistry.FAQS
            )

        # -------------------------------------------------
        # Distance Queries
        # -------------------------------------------------

        if any(
            re.search(rf"\b{re.escape(word)}\b", query) 
            for word in [
                "near",
                "nearest",
                "distance",
                "walk",
                "walking",
                "how far"
            ]
        ):

            context.preferred_categories.append(
                DatasetRegistry.DISTANCE_MATRIX
            )

        # -------------------------------------------------
        # Tourism Statistics Queries (official documents)
        # -------------------------------------------------

        if any(word in query for word in [
            "how many tourist", "foreign tourist", "domestic tourist",
            "fta", "dtv", "tourist number", "tourist arrival",
            "tourist visit", "footfall", "annual report",
        ]):
            context.preferred_categories.append(
                DatasetRegistry.TOURISM_STATS
            )

        # -------------------------------------------------
        # Government Policy Queries
        # -------------------------------------------------

        if any(word in query for word in [
            "policy", "scheme", "government scheme",
            "tourism policy", "subsidy", "grant",
        ]):
            context.preferred_categories.append(
                DatasetRegistry.POLICY
            )

        # -------------------------------------------------
        # Map Queries
        # -------------------------------------------------

        if any(word in query for word in [
            "map", "location map", "route map", "show me the map",
        ]):
            context.preferred_categories.append(
                DatasetRegistry.CITY_MAPS
            )

        # -------------------------------------------------
        # Default
        # -------------------------------------------------

        if len(context.preferred_categories) == 0:

            context.preferred_categories.append(
                DatasetRegistry.ATTRACTIONS
            )

        # -------------------------------------------------
        # Remove duplicates
        # -------------------------------------------------

        context.preferred_categories = list(
            dict.fromkeys(context.preferred_categories)
        )

        # -------------------------------------------------
        # Senior Citizen
        # -------------------------------------------------

        if preference.senior_citizen:

            context.explanation += (
                "Prioritize senior citizen friendly places. "
            )

        # -------------------------------------------------
        # Family
        # -------------------------------------------------

        if preference.traveller_type == "family":

            context.explanation += (
                "Prefer family-friendly places. "
            )

        # -------------------------------------------------
        # Accessibility
        # -------------------------------------------------

        if preference.accessibility:

            context.explanation += (
                "Prefer wheelchair accessible locations. "
            )

        # -------------------------------------------------
        # Trip Length
        # -------------------------------------------------

        if preference.days:

            if preference.days == 1:
                context.max_attractions = 3

            elif preference.days == 2:
                context.max_attractions = 5

            elif preference.days == 3:
                context.max_attractions = 8

            else:
                context.max_attractions = 10

        return context
    
