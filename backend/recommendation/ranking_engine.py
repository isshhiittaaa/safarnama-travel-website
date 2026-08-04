from config.recommendation_weights import DEFAULT_WEIGHTS
from backend.recommendation.models import UserPreference


class RankingEngine:
    """
    Scores retrieved tourism documents according to
    AI metadata + user preferences.
    """

    LANDMARK_BONUS = {
        "kashi vishwanath temple": 8,
        "dashashwamedh ghat": 7,
        "assi ghat": 6,
        "sarnath": 6,
        "manikarnika ghat": 5,
        "ramnagar fort": 4,
    }

    INTEREST_FIELD = {
        "spiritual": "religious_score",
        "food": "food_score",
        "history": "history_score",
        "nature": "nature_score",
        "photography": "photography_score",
    }

    def rank(
        self,
        documents,
        preference: UserPreference,
    ):

        ranked = []

        for document in documents:

            metadata = document.metadata

            score = self._calculate_score(
                metadata,
                preference,
            )

            metadata["recommendation_score"] = round(score, 2)

            metadata["recommendation_reason"] = self._generate_reason(
                metadata,
                preference,
            )

            ranked.append(document)

        ranked.sort(
            key=lambda d: d.metadata["recommendation_score"],
            reverse=True,
        )

        return ranked

    # =====================================================

    def _calculate_score(
        self,
        metadata,
        preference,
    ):

        score = 0

        category = str(
            metadata.get("category", "")
        ).lower()

        # --------------------------------------
        # Base AI Metadata
        # --------------------------------------

        for field, weight in DEFAULT_WEIGHTS.items():

            value = metadata.get(field)

            try:
                score += float(value) * weight
            except Exception:
                pass

        # --------------------------------------
        # User Interest Boost
        # --------------------------------------

        for interest in preference.interests:

            field = self.INTEREST_FIELD.get(interest)

            if not field:
                continue

            try:
                score += float(metadata.get(field, 0)) * 0.75
            except Exception:
                pass

        # --------------------------------------
        # Family
        # --------------------------------------

        if (
            preference.traveller_type == "family"
            and str(
                metadata.get(
                    "family_friendly",
                    "",
                )
            ).lower()
            == "yes"
        ):
            score += 3

        # --------------------------------------

        if (
            preference.kids
            and str(
                metadata.get(
                    "child_friendly",
                    "",
                )
            ).lower()
            == "yes"
        ):
            score += 2

        # --------------------------------------

        if (
            preference.senior_citizen
            and str(
                metadata.get(
                    "senior_citizen_friendly",
                    "",
                )
            ).lower()
            == "yes"
        ):
            score += 3

        # --------------------------------------

        if (
            preference.accessibility
            and str(
                metadata.get(
                    "wheelchair_accessible",
                    "",
                )
            ).lower()
            == "yes"
        ):
            score += 2

        # --------------------------------------
        # Budget
        # --------------------------------------

        if preference.budget:

            fee = str(
                metadata.get(
                    "entry_fee",
                    "",
                )
            ).lower()

            budget = str(
                metadata.get(
                    "budget_category",
                    "",
                )
            ).lower()

            # -----------------------------
            # Budget Rewards
            # -----------------------------

            if "free" in fee:
                score += 3

            if "free" in budget:
                score += 3

            elif "budget" in budget:
                score += 2

            # -----------------------------
            # Budget Penalties
            # -----------------------------

            if preference.budget <= 10000:

                if "luxury" in budget:
                    score -= 5

                elif "fine" in budget:
                    score -= 3

        # --------------------------------------
        # Restaurant Rating
        # (independent of budget)
        # --------------------------------------

        try:

            rating = float(
                metadata.get(
                    "rating",
                    0,
                )
            )

            score += rating / 2

        except Exception:
            pass

        # --------------------------------------
        # Popularity (Attractions Only)
        # --------------------------------------

        if category == "attractions":

            try:

                popularity = float(
                    metadata.get(
                        "popularity_score",
                        0,
                    )
                )

                score += popularity * 0.30

            except Exception:
                pass

        # --------------------------------------
        # Landmark Bonus (Attractions Only)
        # --------------------------------------

        if category == "attractions":

            place = str(
                metadata.get(
                    "place_name",
                    "",
                )
            ).lower()

            for landmark, bonus in self.LANDMARK_BONUS.items():

                if landmark in place:
                    score += bonus
                    break

        # --------------------------------------
        # Exact Query Match
        # --------------------------------------

        query = preference.original_query.lower()

        if category == "attractions":

            place = str(
                metadata.get(
                    "place_name",
                    "",
                )
            ).lower()

        elif category == "restaurants":

            place = str(
                metadata.get(
                    "restaurant_name",
                    "",
                )
            ).lower()

        elif category == "hotels":

            place = str(
                metadata.get(
                    "hotel_name",
                    "",
                )
            ).lower()

        else:

            place = ""

        if place:

            if place == query:
                score += 20

            elif place in query:
                score += 10

        # --------------------------------------
        # Closed Penalty
        # --------------------------------------

        status = str(
            metadata.get(
                "status",
                "",
            )
        ).lower()

        if any(
            word in status
            for word in [
                "closed",
                "maintenance",
                "temporarily closed",
            ]
        ):
            score -= 10

        return score

    # =====================================================

    def _generate_reason(
        self,
        metadata,
        preference,
    ):

        reasons = []

        if (
            preference.traveller_type == "family"
            and str(
                metadata.get(
                    "family_friendly",
                    "",
                )
            ).lower()
            == "yes"
        ):
            reasons.append("Family Friendly")

        if (
            preference.kids
            and str(
                metadata.get(
                    "child_friendly",
                    "",
                )
            ).lower()
            == "yes"
        ):
            reasons.append("Suitable for Children")

        if (
            preference.senior_citizen
            and str(
                metadata.get(
                    "senior_citizen_friendly",
                    "",
                )
            ).lower()
            == "yes"
        ):
            reasons.append("Senior Citizen Friendly")

        if (
            preference.accessibility
            and str(
                metadata.get(
                    "wheelchair_accessible",
                    "",
                )
            ).lower()
            == "yes"
        ):
            reasons.append("Wheelchair Accessible")

        if metadata.get("entry_fee"):
            reasons.append(
                f"Entry Fee: {metadata['entry_fee']}"
            )

        if metadata.get("budget_category"):
            reasons.append(
                f"Budget: {metadata['budget_category']}"
            )

        if metadata.get("rating"):
            reasons.append(
                f"Rating: {metadata['rating']}"
            )

        if metadata.get("best_time_to_visit"):
            reasons.append(
                f"Best Time: {metadata['best_time_to_visit']}"
            )

        if metadata.get("popularity_score"):
            reasons.append(
                f"Popularity Score: {metadata['popularity_score']}"
            )

        place = str(
            metadata.get(
                "place_name",
                "",
            )
        ).lower()

        for landmark in self.LANDMARK_BONUS:

            if landmark in place:
                reasons.append("Iconic Tourist Attraction")
                break

        return reasons