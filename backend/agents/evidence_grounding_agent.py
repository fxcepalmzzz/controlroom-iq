from __future__ import annotations


def ground_evidence(drill: dict) -> dict:
    """
    Synthetic evidence grounding agent.

    In the current hackathon prototype, evidence is attached from local synthetic
    drill data. In a future Microsoft Foundry / Foundry IQ version, this agent
    would retrieve cited policy passages from a configured knowledge source.
    """
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
        "mode": "synthetic",
        "summary": (
            "Retrieved local synthetic policy references that should be checked "
            "before the AI recommendation is approved."
        ),
        "grounded_references": grounded_refs,
        "foundry_iq_ready": True,
    }