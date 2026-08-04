from typing import Optional

from langchain_chroma import Chroma

from backend.embeddings.embedding_model import EmbeddingModel
from config.settings import (
    CHROMA_DB_DIR,
    COLLECTION_NAME,
    TOP_K_RESULTS,
)


class TourismRetriever:
    """
    Retrieves tourism documents from ChromaDB using semantic search.
    """

    def __init__(self):

        self.embedding = EmbeddingModel.get_embedding()

        self.db = Chroma(
            persist_directory=str(CHROMA_DB_DIR),
            embedding_function=self.embedding,
            collection_name=COLLECTION_NAME,
        )

    # -----------------------------------------------------

    def search(
        self,
        query: str,
        filters: Optional[dict] = None,
        top_k: int = TOP_K_RESULTS,
    ):
        """
        Perform semantic search.

        Parameters
        ----------
        query : str
            User query.

        filters : dict
            Metadata filters.

        top_k : int
            Number of documents to retrieve.

        Returns
        -------
        list[Document]
            Retrieved documents, each with a "retrieval_distance"
            entry added to its metadata (lower = more similar).
        """

        if not query.strip():
            return []

        results = self.db.similarity_search_with_score(
            query=query.strip(),
            k=max(1, top_k),
            filter=filters,
        )

        documents = []

        for doc, score in results:
            doc.metadata["retrieval_distance"] = round(float(score), 4)
            documents.append(doc)

        return documents

#  ----------------------------------------------------------------------
    def build_place_index(self) -> dict:
        """
        Builds a lookup of every place/restaurant/hotel/festival
        name already in the collection, mapped to its city.
        Built dynamically from indexed data — no manually
        hardcoded landmark list. Used for fast, deterministic
        city resolution before falling back to semantic search.
        """

        all_data = self.db._collection.get(include=["metadatas"])

        index = {}

        name_fields = (
            "place_name",
            "restaurant_name",
            "hotel_name",
            "festival",
            "festival_name",
        )

        for meta in all_data.get("metadatas", []):

            city = meta.get("city")

            if not city:
                continue

            for field in name_fields:

                name = meta.get(field)

                if name:
                    index[str(name).strip().lower()] = city

        return index


# ----------------------------------------------------------------------

def main():

    retriever = TourismRetriever()

    results = retriever.search(
        query="Kashi Vishwanath temple",
        filters={
            "$and": [
                {"city": "varanasi"},
                {"category": "attractions"},
            ]
        },
        top_k=15,
    )

    print(f"\nRetrieved {len(results)} documents\n")

    for i, doc in enumerate(results, start=1):

        metadata = doc.metadata

        print("=" * 80)
        print(f"Document {i}")
        print("=" * 80)

        print("Category           :", metadata.get("category"))
        print("City               :", metadata.get("city"))
        print("Place              :", metadata.get("place_name"))
        print("Retrieval Distance :", metadata.get("retrieval_distance"))
        print("Popularity Score   :", metadata.get("popularity_score"))
        print("Religious Score    :", metadata.get("religious_score"))
        print("Family Score       :", metadata.get("family_score"))
        print("History Score      :", metadata.get("history_score"))
        print("Food Score         :", metadata.get("food_score"))

        print("\nPreview")
        print("-" * 80)
        print(doc.page_content[:300], "...\n")


if __name__ == "__main__":
    main()