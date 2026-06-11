from __future__ import annotations

import os
from typing import Any


def is_foundry_iq_configured() -> bool:
    """
    Returns True when the environment has enough configuration to attempt
    a Foundry IQ-backed grounding request.

    This project still keeps a synthetic fallback so the hackathon demo remains
    safe and reliable when Azure credentials are not configured.
    """
    required = [
        "AZURE_AI_PROJECT_ENDPOINT",
        "AZURE_AI_MODEL_DEPLOYMENT",
        "FOUNDRY_IQ_KNOWLEDGE_BASE",
    ]

    return all(os.getenv(name) for name in required)


def retrieve_from_foundry_iq(query: str, drill: dict[str, Any]) -> dict[str, Any]:
    """
    Placeholder integration boundary for Microsoft Foundry IQ.

    Intended production path:
    - Create a Microsoft Foundry project.
    - Create or connect a Foundry IQ knowledge base backed by synthetic policy docs.
    - Connect the knowledge base to a Foundry Agent or retrieval endpoint.
    - Query that knowledge base from this function.
    - Return grounded evidence with citations.

    Current hackathon behavior:
    - This function does not fake a cloud call.
    - It reports whether the environment is configured.
    - If not configured, the Evidence Grounding Agent uses local synthetic evidence.
    """
    if not is_foundry_iq_configured():
        return {
            "configured": False,
            "mode": "synthetic_fallback",
            "reason": (
                "Foundry IQ environment variables are not configured. "
                "Using local synthetic policy evidence instead."
            ),
            "query": query,
            "citations": [],
            "raw_response": None,
        }

    return {
        "configured": True,
        "mode": "foundry_iq_ready",
        "reason": (
            "Foundry IQ configuration was detected. Replace this boundary with "
            "a live Foundry IQ retrieval call after the Azure knowledge base is created."
        ),
        "query": query,
        "citations": [],
        "raw_response": {
            "project_endpoint": os.getenv("AZURE_AI_PROJECT_ENDPOINT"),
            "model_deployment": os.getenv("AZURE_AI_MODEL_DEPLOYMENT"),
            "knowledge_base": os.getenv("FOUNDRY_IQ_KNOWLEDGE_BASE"),
        },
    }