import time

from backend.graph.graph_builder import build_graph


LINE = "=" * 90
SUBLINE = "-" * 90


def heading(title: str):

    print(f"\n{LINE}")
    print(title.center(90))
    print(LINE)


def section(title: str):

    print(f"\n{SUBLINE}")
    print(title)
    print(SUBLINE)


# ==========================================================
# Preference
# ==========================================================

def show_preference(pref):

    if pref is None:
        return

    print(f"City              : {pref.city or "Not specified"}")
    print(f"Days              : {pref.days or "Not specified"}")
    print(f"Budget            : "f"{'₹'+str(pref.budget) if pref.budget else 'Not specified'}")
    print(f"Traveller Type    : {pref.traveller_type}")
    print(f"Interests         : {', '.join(pref.interests)}")
    print(f"Senior Citizen    : {pref.senior_citizen}")
    print(f"Kids              : {pref.kids}")
    print(f"Accessibility    : {pref.accessibility}")
    print(f"Language         : {pref.language}")


# ==========================================================
# Recommendation Context
# ==========================================================

def show_context(context, show_limits=True):

    if context is None:
        return

    print("Filters")

    for key, value in context.filters.items():
        print(f"✓ {key} : {value}")

    print()

    print("Preferred Categories")

    if context.preferred_categories:
        for category in context.preferred_categories:
            print(f"✓ {category}")

    print()

    if show_limits:
        print(f"Maximum Attractions : {context.max_attractions}")
        print(f"Top K Retrieval     : {context.top_k}")
    else:
        print("Maximum Attractions : N/A (no matching data found)")
        print("Top K Retrieval     : N/A (no matching data found)")

    if context.explanation:
        print()
        print("Reason")
        print(context.explanation)


# ==========================================================
# Retrieved Documents
# ==========================================================

def show_documents(documents, total=None):

    total = total if total is not None else len(documents)

    if total != len(documents):
        print(f"Retrieved Documents : {total} (showing top {len(documents)})\n")
    else:
        print(f"Retrieved Documents : {total}\n")


    for i, doc in enumerate(documents, start=1):

        meta = doc.metadata

        name = (
            meta.get("place_name")
            or meta.get("restaurant_name")
            or meta.get("hotel_name")
            or meta.get("festival_name")
            or meta.get("question")
            or meta.get("service_name")
            or meta.get("title")
            or f"Document {i}"
        )

        print(f"{i}. {name}")

        print(f"   Category : {meta.get('category')}")

        if "price_range" in meta:
            print(f"   Price    : {meta['price_range']}")

        if "rating" in meta:
            print(f"   Rating   : {meta['rating']}")

        if "opening_time" in meta:
            print(
                f"   Timing   : "
                f"{meta['opening_time']} - {meta.get('closing_time','')}"
            )

        print()


# ==========================================================
# Ranked Documents
# ==========================================================

def show_ranked_documents(documents):

    print(f"Ranked Documents : {len(documents)}\n")

    for i, doc in enumerate(documents, start=1):

        meta = doc.metadata

        name = (
            meta.get("place_name")
            or meta.get("restaurant_name")
            or meta.get("hotel_name")
            or meta.get("festival_name")
            or meta.get("question")
            or "Unknown"
        )

        score = meta.get("recommendation_score", "-")

        print(f"{i}. {name}")

        print(f"   Score : {score}")

        reasons = meta.get("recommendation_reason")

        if reasons:

            print("   Reason")

            for reason in reasons:
                print(f"      ✓ {reason}")

        print()


# ==========================================================
# Itinerary
# ==========================================================

def show_itinerary(itinerary):

    if itinerary is None:
        return

    for day in itinerary.days:

        print(f"\nDay {day.day}")

        print("Attractions")

        if not day.attractions:
            print("   None")

        for attraction in day.attractions:

            print(
                f"   • {attraction.get('place_name','Unknown')}"
            )

        print("\nRestaurants")

        if not day.restaurants:
            print("   None")

        for restaurant in day.restaurants:

            print(
                f"   • {restaurant.get('restaurant_name','Unknown')}"
            )


# ==========================================================
# Main
# ==========================================================

def main():

    graph = build_graph()

    heading("AI TOURISM RECOMMENDATION & ITINERARY PLANNER")

    query = input("\nEnter your travel query\n> ")

    start = time.perf_counter()

    result = graph.invoke(
        {
            "user_query": query
        }
    )

    end = time.perf_counter()

    heading("STEP 1 : USER PREFERENCES")

    show_preference(
        result.get("preference")
    )

    heading("STEP 2 : RULE ENGINE")

    retrieved = result.get("retrieved_documents", [])

    show_context(
        result.get("recommendation_context"),
        show_limits=len(retrieved) > 0,
    )

    heading("STEP 3 : RETRIEVED DOCUMENTS")

    show_documents(
        retrieved[:10],
        total=len(retrieved),
    )

    heading("STEP 4 : RANKING ENGINE")

    ranked = result.get("ranked_documents", [])

    show_ranked_documents(
        ranked
    )

    heading("STEP 5 : GENERATED ITINERARY")

    show_itinerary(
        result.get("itinerary")
    )

    heading("STEP 6 : FINAL AI RESPONSE")

    print(
        result.get("response")
    )

    # -------------------------------------------------
    # Show map images relevant to this query, if any
    # -------------------------------------------------

    map_images = [
        doc.metadata.get("image_path")
        for doc in ranked
        if doc.metadata.get("category") == "city_maps"
        and doc.metadata.get("image_path")
    ]

    if map_images:
        heading("MAPS AVAILABLE FOR THIS QUERY")
        for path in map_images:
            print(f"Map image: {path}")

    heading("SYSTEM SUMMARY")

    similarity_scores = [
        doc.metadata.get("retrieval_distance")
        for doc in ranked
        if doc.metadata.get("retrieval_distance") is not None
    ]

    avg_distance = (
        round(sum(similarity_scores) / len(similarity_scores), 4)
        if similarity_scores else "N/A"
    )

    token_usage = result.get("token_usage", {}) or {}

    print(f"Execution Time      : {end-start:.2f} sec")
    print(f"Embedding Model     : BAAI/bge-m3")
    print(f"Vector Database     : ChromaDB")
    print(f"Workflow            : LangGraph")
    print(f"LLM                 : Groq")
    print(f"Retrieved Documents : {len(retrieved)}")
    print(f"Ranked Documents    : {len(ranked)}")
    print(f"Avg Cosine Distance : {avg_distance}")
    print(f"Prompt Tokens       : {token_usage.get('prompt_tokens', 'N/A')}")
    print(f"Completion Tokens   : {token_usage.get('completion_tokens', 'N/A')}")
    print(f"Total Tokens        : {token_usage.get('total_tokens', 'N/A')}")

    print("\nPipeline Completed Successfully ✅")


if __name__ == "__main__":
    main()