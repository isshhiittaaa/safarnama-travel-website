class ContentClassifier:
    """
    Lightweight, rule-based classifier for extracted PDF content.

    Runs once at ingestion time (not per query) — assigns each
    chunk of official document text to a category, so the Rule
    Engine can later decide which categories are relevant to a
    given user query. This lets official PDF data stay in ChromaDB
    permanently without polluting itinerary-planning retrieval.
    """

    # -------------------------------------------------
    # Keyword signals per category
    # -------------------------------------------------

    CATEGORY_KEYWORDS = {

        "tourism_stats": [
            "foreign tourist", "domestic tourist", "fta", "dtv",
            "tourist arrival", "tourist visit", "footfall",
            "growth rate", "cagr", "occupancy rate",
            "annual report", "survey", "statistics",
        ],

        "policy": [
            "policy", "scheme", "ministry of tourism",
            "government of", "notification", "regulation",
            "guideline", "grant", "subsidy", "department of tourism",
        ],

        "city_maps": [
            "map", "location map", "route map", "corridor",
            "connectivity", "accessibility", "linkages",
            "geographical location", "latitude", "longitude",  
            "regional level", "city level",
        ],

        "travel_tips": [
            "how to reach", "railway", "airport", "bus stand",
            "metro", "flight", "train", "taxi", "auto",
            "tips", "advice", "safety",
        ],

        "festivals": [
            "festival", "mahotsav", "utsav", "celebration",
            "mela", "jayanti",
        ],

        "restrictions": [
            "not allowed", "prohibited", "restricted",
            "dress code", "entry timing", "photography",
            "mobile phone",
        ],

        "attractions": [
            "temple", "ghat", "fort", "museum", "garden",
            "palace", "shrine", "monument", "aarti",
        ],

        "emergency_services": [
            "hospital", "ambulance", "emergency", "police",
            "helpline",
        ],
    }

    # -------------------------------------------------
    # Categories that are "official document" info —
    # never included in itinerary-planning by default,
    # only pulled in when a query explicitly asks for them
    # -------------------------------------------------

    OFFICIAL_CATEGORIES = {"tourism_stats", "policy"}

    DEFAULT_CATEGORY = "faqs"

    # =====================================================

    def classify(self, text: str, heading: str = "") -> str:

        combined = f"{heading} {text}".lower()

        scores = {}

        for category, keywords in self.CATEGORY_KEYWORDS.items():

            score = sum(
                1 for kw in keywords if kw in combined
            )

            if score:
                scores[category] = score

        if not scores:
            return self.DEFAULT_CATEGORY

        return max(scores, key=scores.get)

    # =====================================================

    def is_meaningful(self, text: str, min_length: int = 40) -> bool:
        """
        Decides whether a chunk is worth indexing at all.
        Used for image/figure blocks where Sarvam couldn't
        extract any real caption/label text — those should
        not become retrievable documents.
        """

        return len(text.strip()) >= min_length