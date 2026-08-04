"""
Weights used by the recommendation ranking engine.
Values can be tuned without changing the ranking logic.
"""

DEFAULT_WEIGHTS = {
    "family_score": 0.20,
    "budget_score": 0.15,
    "religious_score": 0.15,
    "history_score": 0.10,
    "nature_score": 0.10,
    "food_score": 0.10,
    "photography_score": 0.05,
    "accessibility_score": 0.10,
    "popularity_score": 0.05,
}