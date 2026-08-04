import re

from backend.recommendation.models import UserPreference


class PreferenceParser:
    """
    Extracts structured travel preferences
    from natural language queries.
    """

    SUPPORTED_CITIES = [
        "varanasi",
    ]

    INTEREST_KEYWORDS = {

        # ----------------------------
        # Spiritual Tourism
        # ----------------------------

        "spiritual": [
            "temple",
            "temples",
            "mandir",
            "shiv",
            "mahadev",
            "hanuman",
            "kashi",
            "vishwanath",
            "religious",
            "spiritual",
            "ganga",
            "ganga aarti",
            "aarti",
            "ghat",
            "pilgrimage",
            "darshan",
            "puja",
            "jyotirlinga",
            "sarnath",
        ],

        # ----------------------------
        # Food Tourism
        # ----------------------------

        "food": [
            "food",
            "restaurant",
            "restaurants",
            "cafe",
            "cafes",
            "street food",
            "chaat",
            "lassi",
            "kachori",
            "jalebi",
            "thali",
            "sweets",
            "snacks",
            "breakfast",
            "lunch",
            "dinner",
            "local food",
        ],

        # ----------------------------
        # Heritage / History
        # ----------------------------

        "history": [
            "history",
            "historical",
            "heritage",
            "museum",
            "ancient",
            "monument",
            "archaeological",
            "culture",
        ],

        # ----------------------------
        # Nature
        # ----------------------------

        "nature": [
            "nature",
            "park",
            "garden",
            "river",
            "sunrise",
            "sunset",
            "boat",
            "boat ride",
        ],

        # ----------------------------
        # Shopping
        # ----------------------------

        "shopping": [
            "shopping",
            "market",
            "bazaar",
            "silk",
            "saree",
            "shopping street",
            "souvenir",
            "handicraft",
        ],

        # ----------------------------
        # Adventure
        # ----------------------------

        "adventure": [
            "adventure",
            "camping",
            "trek",
            "cycling",
            "walking tour",
        ],

        # ----------------------------
        # Festivals
        # ----------------------------

        "festival": [
            "festival",
            "dev deepawali",
            "mahashivratri",
            "diwali",
            "crowd",
        ],

        # ----------------------------
        # Hotels
        # ----------------------------

        "hotel": [
            "hotel",
            "stay",
            "accommodation",
            "resort",
            "guest house",
            "hostel",
        ],
    }

    # ===================================================

    def parse(self, query: str) -> UserPreference:

        text = query.lower()

        return UserPreference(
            original_query=query,
            city=self._extract_city(text) or "",
            days=self._extract_days(text),
            budget=self._extract_budget(text),
            interests=self._extract_interests(text),
            traveller_type=self._extract_traveller_type(text),
            senior_citizen=self._extract_senior(text),
            kids=self._extract_kids(text),
            accessibility=self._extract_accessibility(text),
        )

    # ===================================================

    def _extract_city(self, text):

        for city in self.SUPPORTED_CITIES:
            if city in text:
                return city

        return None

    # ===================================================

    def _extract_days(self, text):

        match = re.search(r"(\d+)\s*[-]?\s*days?", text)

        if match:
            return int(match.group(1))

        return None

    # ===================================================

    def _extract_budget(self, text):

        text = text.replace(",", "")
        
        patterns = [
            r"under\s*₹?\s*(\d+)",
            r"budget\s*₹?\s*(\d+)",
            r"₹\s*(\d+)",
            r"rs\.?\s*(\d+)",
            r"rupees?\s*(\d+)",
        ]
        

        for pattern in patterns:

            match = re.search(pattern, text)

            if match:
                return int(match.group(1))

        return None

    # ===================================================

    def _extract_interests(self, text):

        interests = []

        for interest, keywords in self.INTEREST_KEYWORDS.items():

            if any(keyword in text for keyword in keywords):
                interests.append(interest)

        return interests

    # ===================================================

    def _extract_traveller_type(self, text):

        if any(word in text for word in [
            "family",
            "parents",
            "children",
            "kids",
            "baby",
        ]):
            return "family"

        if any(word in text for word in [
            "couple",
            "wife",
            "husband",
            "honeymoon",
        ]):
            return "couple"

        if any(word in text for word in [
            "friends",
            "friend",
            "group",
        ]):
            return "friends"

        if any(word in text for word in [
            "solo",
            "alone",
            "myself",
        ]):
            return "solo"

        return "general"

    # ===================================================

    def _extract_senior(self, text):

        keywords = [
            "senior",
            "elderly",
            "old age",
            "grandparents",
            "parents",
        ]

        return any(keyword in text for keyword in keywords)

    # ===================================================

    def _extract_kids(self, text):

        keywords = [
            "kid",
            "kids",
            "child",
            "children",
            "baby",
        ]

        return any(keyword in text for keyword in keywords)

    # ===================================================

    def _extract_accessibility(self, text):

        keywords = [
            "wheelchair",
            "accessible",
            "disabled",
            "handicap",
            "ramp",
        ]

        return any(keyword in text for keyword in keywords)