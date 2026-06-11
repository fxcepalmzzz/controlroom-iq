from __future__ import annotations

from typing import Any

from agents.foundry_iq_client import retrieve_from_foundry_iq


def build_grounding_query(drill: dict[str, Any]) -> str:
    """
    Builds the retrieval question that would be sent to Foundry IQ.

    The query intentionally asks for policy evidence, not a final decision,
    because ControlRoom IQ keeps the human supervisor in the loop.
    """
    title = drill.get("title", "Untitled drill")
    department = drill.get("department", "Unknown department")
    recommendation = drill.get("recommendation", "")

    return (
        f"Find policy evidence for supervising this AI recommendation. "
        f"Drill: {title}. Department: {department}. "
        f"AI recommendation: {recommendation}"
    )


def ground_evidence(drill: dict[str, Any]) -> dict[str, Any]:
    """
    Evidence Grounding Agent.

    Current demo:
    - Uses local synthetic policy references from the drill.

    Foundry IQ-ready path:
    - Builds a retrieval query.
    - Checks whether Foundry IQ environment configuration exists.
    - Reports integration mode clearly.
    - Keeps a safe synthetic fallback when Foundry is not configured.
    """
    query = build_grounding_query(drill)
    foundry_result = retrieve_from_foundry_iq(query=query, drill=drill)

    policy_refs = drill.get("policy_refs", [])

    grounded_refs = [
        {
            "source": ref.split(":")[0],
            "excerpt": ref,
            "confidence": "synthetic-high",
            "grounding_mode": "local_synthetic_policy",
        }
        for ref in policy_refs
    ]

    return {
        "agent": "Evidence Grounding Agent",
        "mode": foundry_result["mode"],
        "foundry_iq_configured": foundry_result["configured"],
        "query": query,
        "summary": (
            "Grounded the drill against synthetic policy references. "
            "When Foundry IQ is configured, this agent is the integration point "
            "for cited knowledge retrieval."
        ),
        "grounded_references": grounded_refs,
        "foundry_iq": foundry_result,
    }