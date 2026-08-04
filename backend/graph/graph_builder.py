from langgraph.graph import StateGraph
from langgraph.graph import START, END

from backend.graph.state import TourismState

from backend.graph.nodes import (
    parser_node,
    rule_engine_node,
    retriever_node,
    ranking_node,
    itinerary_node,
    prompt_builder_node,
    llm_node,
)


def build_graph():

    graph = StateGraph(TourismState)

    graph.add_node("parser", parser_node)

    graph.add_node("rule_engine", rule_engine_node)

    graph.add_node("retriever", retriever_node)

    graph.add_node("ranking", ranking_node)

    graph.add_node("itinerary", itinerary_node)

    graph.add_node("prompt_builder", prompt_builder_node)

    graph.add_node("llm", llm_node)

    graph.add_edge(START, "parser")

    graph.add_edge("parser", "rule_engine")

    graph.add_edge("rule_engine", "retriever")

    graph.add_edge("retriever", "ranking")

    graph.add_edge("ranking", "itinerary")

    graph.add_edge("itinerary", "prompt_builder")

    graph.add_edge("prompt_builder", "llm")

    graph.add_edge("llm", END)

    return graph.compile()