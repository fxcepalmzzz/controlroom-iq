from __future__ import annotations

from typing import Any

from agents.foundry_iq_client import retrieve_from_foundry_iq


def build_grounding_query(drill: dict[str, Any]) -> str:
    """
    Builds the retrieval question sent to the Foundry IQ-backed agent.

    The query asks for policy evidence, not a final decision, because
    ControlRoom IQ keeps the human supervisor in the loop.
    """
    title = drill.get("title", "Untitled drill")
    department = drill.get("department", "Unknown department")
    recommendation = drill.get("recommendation", "")
    hidden_risk = drill.get("hidden_risk", "")

    return (
        "What policy evidence should a human supervisor check before deciding "
        "whether to approve, reject, ask for evidence, escalate, or pause this "
        "AI recommendation? "
        f"Drill: {title}. Department: {department}. "
        f"AI recommendation: {recommendation}. "
        f"Known hidden risk: {hidden_risk}."
    )


def _build_local_references(drill: dict[str, Any]) -> list[dict[str, Any]]:
    policy_refs = drill.get("policy_refs", [])

    return [
        {
            "source": ref.split(":")[0],
            "excerpt": ref,
            "confidence": "synthetic-high",
            "grounding_mode": "local_synthetic_policy",
        }
        for ref in policy_refs
    ]


def ground_evidence(drill: dict[str, Any]) -> dict[str, Any]:
    """
    Evidence Grounding Agent.

    Live path:
    - Calls a Microsoft Foundry agent connected to the Foundry IQ knowledge base.

    Fallback path:
    - Uses local synthetic policy references from the drill data.

    This keeps the demo reliable while still proving real Foundry IQ integration
    when the Azure environment is configured.
    """
    query = build_grounding_query(drill)
    foundry_result = retrieve_from_foundry_iq(query=query, drill=drill)

    local_refs = _build_local_references(drill)

    if foundry_result.get("answer"):
        grounded_refs = [
            {
                "source": ", ".join(foundry_result.get("citations", []))
                or "Microsoft Foundry IQ",
                "excerpt": foundry_result["answer"],
                "confidence": "foundry-grounded",
                "grounding_mode": "foundry_iq_agent",
            }
        ]

        # Keep the original synthetic drill references visible as backup context.
        grounded_refs.extend(local_refs)
    else:
        grounded_refs = local_refs

    return {
        "agent": "Evidence Grounding Agent",
        "mode": foundry_result["mode"],
        "foundry_iq_configured": foundry_result["configured"],
        "query": query,
        "summary": (
            "Grounded the drill using Microsoft Foundry IQ when available, "
            "with local synthetic policy references as a safe fallback."
        ),
        "grounded_references": grounded_refs,
        "foundry_iq": foundry_result,
    }