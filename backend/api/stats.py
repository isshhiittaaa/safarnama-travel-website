import os
import json
from datetime import datetime


LOG_PATH = "logs/query_log.jsonl"


def log_query(
    query: str,
    session_id: str,
    status: str,          # "answered" | "unanswered"
    token_usage: dict,
    retrieved_count: int,
    execution_time: float,
):
    """
    Called once per user query, from main.py — saves one record
    to logs/query_log.jsonl. This is the raw data that powers
    the admin stats endpoint.
    """

    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)

    record = {
        "timestamp": datetime.utcnow().isoformat(),
        "session_id": session_id,
        "query": query,
        "status": status,
        "retrieved_count": retrieved_count,
        "execution_time_sec": round(execution_time, 2),
        "prompt_tokens": token_usage.get("prompt_tokens", 0),
        "completion_tokens": token_usage.get("completion_tokens", 0),
        "total_tokens": token_usage.get("total_tokens", 0),
    }

    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")


def get_analytics() -> dict:
    """
    Called by the /admin/stats endpoint — reads all saved records
    and returns aggregate counts/totals for the IT team.
    """

    if not os.path.exists(LOG_PATH):
        return {
            "total_queries": 0,
            "answered_queries": 0,
            "unanswered_queries": 0,
            "total_tokens_used": 0,
            "tokens_by_answered_queries": 0,
            "tokens_by_unanswered_queries": 0,
            "avg_tokens_per_query": 0,
            "avg_execution_time_sec": 0,
        }

    records = []
    with open(LOG_PATH, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line))

    total = len(records)
    answered = [r for r in records if r["status"] == "answered"]
    unanswered = [r for r in records if r["status"] == "unanswered"]

    total_tokens = sum(r["total_tokens"] for r in records)
    tokens_answered = sum(r["total_tokens"] for r in answered)
    tokens_unanswered = sum(r["total_tokens"] for r in unanswered)

    avg_time = (
        round(sum(r["execution_time_sec"] for r in records) / total, 2)
        if total else 0
    )

    return {
        "total_queries": total,
        "answered_queries": len(answered),
        "unanswered_queries": len(unanswered),
        "total_tokens_used": total_tokens,
        "tokens_by_answered_queries": tokens_answered,
        "tokens_by_unanswered_queries": tokens_unanswered,
        "avg_tokens_per_query": (
            round(total_tokens / total, 2) if total else 0
        ),
        "avg_execution_time_sec": avg_time,
    }