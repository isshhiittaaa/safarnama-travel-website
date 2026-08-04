from typing import List

from langchain_core.documents import Document
from langchain_chroma import Chroma

from config.settings import (
    CHROMA_DB_DIR,
    COLLECTION_NAME,
)


class VectorStore:
    """
    Wrapper around ChromaDB.

    Responsibilities
    ----------------
    • Create vector database
    • Load existing database
    • Add new documents
    • Delete collection
    • Count indexed documents
    """

    # =====================================================

    def __init__(self, embedding):

        self.embedding = embedding

    # =====================================================

    def create(
        self,
        documents: List[Document],
    ) -> Chroma:
        """
        Create a new vector database from documents.
        """

        return Chroma.from_documents(
            documents=documents,
            embedding=self.embedding,
            collection_name=COLLECTION_NAME,
            persist_directory=str(CHROMA_DB_DIR),
        )

    # =====================================================

    def load(self) -> Chroma:
        """
        Load an existing Chroma collection.
        """

        return Chroma(
            persist_directory=str(CHROMA_DB_DIR),
            embedding_function=self.embedding,
            collection_name=COLLECTION_NAME,
        )

    # =====================================================

    def add_documents(
        self,
        documents: List[Document],
        ids: List[str] = None,
    ) -> None:
        """
        Add new documents to an existing collection.
        Passing ids makes this idempotent — re-adding the same
        document_id overwrites instead of duplicating.
        """

        db = self.load()

        if ids:

            texts = [doc.page_content for doc in documents]
            metadatas = [doc.metadata for doc in documents]

            embeddings = self.embedding.embed_documents(texts)
            
            db._collection.upsert(
                ids=ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
            )
        else:
            db.add_documents(documents)

    # =====================================================

    def count(self) -> int:
        """
        Return total indexed documents.
        """

        db = self.load()

        return db._collection.count()

    # =====================================================

    def reset(self) -> None:
        """
        Delete the entire collection.

        Useful when rebuilding embeddings.
        """

        db = self.load()

        db.delete_collection()

    # =====================================================

    def get(self) -> Chroma:
        """
        Return Chroma instance.
        """

        return self.load()


# ==========================================================
# Local Test
# ==========================================================

def main():

    from backend.embeddings.embedding_model import EmbeddingModel

    embedding = EmbeddingModel.get_embedding()

    store = VectorStore(embedding)

    db = store.load()

    print("=" * 60)
    print("Collection Loaded Successfully")
    print("Collection Name :", COLLECTION_NAME)
    print("Documents       :", store.count())
    print("=" * 60)


if __name__ == "__main__":
    main()