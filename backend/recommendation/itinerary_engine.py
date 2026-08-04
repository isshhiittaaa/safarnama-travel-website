from math import ceil

from backend.recommendation.models import (
    UserPreference,
    Itinerary,
    DayPlan,
)


class ItineraryEngine:
    """
    Builds a structured itinerary from ranked documents.

    Current strategy
    ----------------
    1. Uses ranking engine output.
    2. Highest scored attractions first.
    3. Evenly distributes attractions across days.
    4. Adds restaurants to each day.
    5. Avoids duplicate places.

    Future improvements
    -------------------
    • Distance Matrix optimization
    • Opening hours optimization
    • Morning / Evening scheduling
    • Festival crowd handling
    • Nearby restaurant selection
    """

    def build(
        self,
        preference: UserPreference,
        documents,
    ) -> Itinerary:

        itinerary = Itinerary()

        total_days = max(1, preference.days or 1)

        attractions = []
        restaurants = []
        hotels = []

        # --------------------------------------------------
        # Separate categories
        # --------------------------------------------------

        for doc in documents:

            category = doc.metadata.get("category", "").lower()

            if category == "attractions":
                attractions.append(doc)

            elif category == "restaurants":
                restaurants.append(doc)

            elif category == "hotels":
                hotels.append(doc)

        # --------------------------------------------------
        # Sort using recommendation score
        # --------------------------------------------------

        attractions.sort(
            key=lambda x: x.metadata.get(
                "recommendation_score",
                0,
            ),
            reverse=True,
        )

        restaurants.sort(
            key=lambda x: float(
                x.metadata.get(
                    "rating",
                    0,
                ) or 0
            ),
            reverse=True,
        )

        # --------------------------------------------------
        # Remove duplicate attractions
        # --------------------------------------------------

        unique = {}
        for doc in attractions:

            name = doc.metadata.get(
                "place_name",
                "",
            )

            if name not in unique:
                unique[name] = doc

        attractions = list(unique.values())

        # --------------------------------------------------
        # Decide maximum attractions
        # --------------------------------------------------

        if total_days == 1:
            max_attractions = 5
        elif total_days == 2:
            max_attractions = 8
        elif total_days == 3:
            max_attractions = 12
        else:
            max_attractions = len(attractions)

        attractions = attractions[:max_attractions]

        # --------------------------------------------------
        # Calculate attractions/day
        # --------------------------------------------------

        attractions_per_day = max(
            1,
            ceil(len(attractions) / total_days),
        )

        attraction_index = 0
        restaurant_index = 0

        # --------------------------------------------------
        # Build itinerary
        # --------------------------------------------------

        for day in range(1, total_days + 1):

            plan = DayPlan(day=day)

            daily_attractions = attractions[
                attraction_index:
                attraction_index + attractions_per_day
            ]

            plan.attractions = [
                doc.metadata
                for doc in daily_attractions
            ]

            attraction_index += attractions_per_day

            # ----------------------------------------------
            # Add restaurants
            # ----------------------------------------------

            if restaurant_index < len(restaurants):

                plan.restaurants.append(
                    restaurants[
                        restaurant_index
                    ].metadata
                )

                restaurant_index += 1

            if (
                restaurant_index < len(restaurants)
                and total_days >= 2
            ):

                plan.restaurants.append(
                    restaurants[
                        restaurant_index
                    ].metadata
                )

                restaurant_index += 1

            # ----------------------------------------------
            # Add Hotels (only on Day 1)
            # ----------------------------------------------

            if day == 1:

                for hotel in hotels[:3]:

                    plan.hotels.append(
                        hotel.metadata
                    )

            itinerary.days.append(plan)

        return itinerary
    