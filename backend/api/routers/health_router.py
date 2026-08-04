from fastapi import APIRouter
from datetime import datetime

from backend.embeddings.embedding_model import EmbeddingModel
from backend.rag.vector_store import VectorStore


router = APIRouter()


@router.get("/")
def health_check():
    """
    Basic liveness check — server is running.
    """

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/detailed")
def detailed_health_check():
    """
    Checks that the vector database is reachable and has data.
    Useful for monitoring dashboards / IT team.
    """

    try:
        embedding = EmbeddingModel.get_embedding()
        store = VectorStore(embedding)
        doc_count = store.count()

        return {
            "status": "healthy",
            "chromadb": "connected",
            "indexed_documents": doc_count,
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "chromadb": "error",
            "detail": str(e),
            "timestamp": datetime.utcnow().isoformat(),
        }