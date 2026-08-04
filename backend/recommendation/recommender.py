from backend.rag.retriever import TourismRetriever
from backend.recommendation.models import (
    UserPreference,
    RecommendationContext,
)
from backend.recommendation.rule_engine import RuleEngine


class TourismRecommender:
    """
    Coordinates the recommendation workflow.

        User Query
             ↓
      Preference Parser
             ↓
        Rule Engine
             ↓
      Category Retrieval
             ↓
     Merge & Remove Duplicates
             ↓
      Ranked Recommendations
    """

    def __init__(self):

        self.rule_engine = RuleEngine()
        self.retriever = TourismRetriever()

    # -----------------------------------------------------

    def recommend(
        self,
        preference: UserPreference,
    ):

        context: RecommendationContext = (
            self.rule_engine.build_context(preference)
        )

        retrieved_documents = []

        # -----------------------------------------
        # Search every required dataset
        # -----------------------------------------

        for category in context.preferred_categories:

            filters = {
                "$and": [
                    {
                        "city": context.filters.get("city", "")
                    },
                    {
                        "category": category
                    }
                ]
            }

            docs = self.retriever.search(
                query=preference.original_query,
                filters=filters,
                top_k=max(15, context.top_k),
            )

            retrieved_documents.extend(docs)

        # -----------------------------------------
        # Remove duplicate documents
        # -----------------------------------------

        unique_documents = {}

        for doc in retrieved_documents:

            doc_id = (
                doc.metadata.get("attraction_id")
                or doc.metadata.get("restaurant_id")
                or doc.metadata.get("hotel_id")
                or doc.metadata.get("restriction_id")
                or doc.metadata.get("emergency_id")
                or doc.metadata.get("tip_id")
                or doc.metadata.get("festival")
                or doc.metadata.get("question")
                or doc.metadata.get("place_name")
            )

            if doc_id not in unique_documents:
                unique_documents[doc_id] = doc

        retrieved_documents = list(unique_documents.values())

        return retrieved_documents