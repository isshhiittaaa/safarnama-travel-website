from fastapi import APIRouter, Query

from backend.rag.retriever import TourismRetriever


router = APIRouter()

retriever = TourismRetriever()


@router.get("/attractions")
def list_attractions(limit: int = Query(default=10, le=50)):
    """
    Public endpoint — browse top attractions without logging in.
    No LLM call, no personalization — just raw indexed data.
    """

    docs = retriever.search(
        query="tourist attractions in varanasi",
        filters={
            "$and": [
                {"city": "varanasi"},
                {"category": "attractions"},
            ]
        },
        top_k=limit,
    )

    results = []

    for doc in docs:
        meta = doc.metadata
        if not meta.get("place_name"):
            continue
        results.append({
            "place_name": meta.get("place_name"),
            "category": meta.get("place_category"),
            "opening_time": meta.get("opening_time"),
            "closing_time": meta.get("closing_time"),
            "entry_fee": meta.get("entry_fee"),
            "rating": meta.get("rating"),
        })

    return {"attractions": results}


@router.get("/festivals")
def list_festivals(limit: int = Query(default=10, le=50)):
    """
    Public endpoint — browse festivals without logging in.
    """

    docs = retriever.search(
        query="festivals and events in varanasi",
        filters={
            "$and": [
                {"city": "varanasi"},
                {"category": "festivals"},
            ]
        },
        top_k=limit,
    )

    results = []

    for doc in docs:
        meta = doc.metadata
        if not meta.get("festival"):
            continue
        results.append({
            "festival_name": meta.get("festival") or meta.get("festival_name"),
            "content": doc.page_content[:200],
        })

    return {"festivals": results}