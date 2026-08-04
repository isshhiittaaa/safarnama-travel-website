"""
Central registry for all dataset categories.

Every module should import categories from here
instead of hardcoding strings.
"""


class DatasetRegistry:

    # -----------------------------------------
    # Tourism Datasets
    # -----------------------------------------

    ATTRACTIONS = "attractions"
    RESTAURANTS = "restaurants"
    HOTELS = "hotels"

    # -----------------------------------------
    # Knowledge Datasets
    # -----------------------------------------

    FAQS = "faqs"
    TRAVEL_TIPS = "travel_tips"
    FESTIVALS = "festivals"
    RESTRICTIONS = "restrictions"
    EMERGENCY_SERVICES = "emergency_services"
    DISTANCE_MATRIX = "distance_matrix"

    # -----------------------------------------
    # AI Dataset
    # -----------------------------------------

    AI_METADATA = "ai_metadata"

    # -----------------------------------------
    # Extra
    # -----------------------------------------

    TOURISM_STATS = "tourism_stats"
    POLICY = "policy"
    CITY_MAPS = "city_maps"

    # -----------------------------------------
    # All Categories
    # -----------------------------------------

    ALL = [
        ATTRACTIONS,
        RESTAURANTS,
        HOTELS,
        FAQS,
        TRAVEL_TIPS,
        FESTIVALS,
        RESTRICTIONS,
        EMERGENCY_SERVICES,
        DISTANCE_MATRIX,
        AI_METADATA,
        TOURISM_STATS,
        POLICY,
        CITY_MAPS,
    ]