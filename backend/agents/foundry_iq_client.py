from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")


def is_foundry_iq_configured() -> bool:
    """
    Returns True when the environment has enough configuration to attempt
    a Microsoft Foundry agent call backed by Foundry IQ.
    """
    required = [
        "AZURE_AI_PROJECT_ENDPOINT",
        "AZURE_AI_MODEL_DEPLOYMENT",
        "FOUNDRY_IQ_KNOWLEDGE_BASE",
        "FOUNDRY_AGENT_NAME",
    ]

    return all(os.getenv(name) for name in required)


def _extract_source_names(text: str) -> list[str]:
    """
    Extracts markdown source names from Foundry-style cited text.

    Example citation:
    【4:0†human-approval-thresholds.md】
    """
    matches = re.findall(r"[\w\-]+\.md", text)
    return sorted(set(matches))

def _clean_foundry_text(text: str) -> str:
    """
    Normalizes Foundry citation artifacts for frontend display.

    Foundry responses can include citation markers that render cleanly in the
    portal but appear as unusual characters in plain JSON/PowerShell output.
    We keep extracted source names separately in `citations`, so the display
    text can be simplified safely.
    """
    cleaned = text
    cleaned = cleaned.replace("ã", "")
    cleaned = re.sub(r"【[^】]+†([^】]+)】", r"(\1)", cleaned)
    cleaned = re.sub(r"\s{3,}", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()

def retrieve_from_foundry_iq(query: str, drill: dict[str, Any]) -> dict[str, Any]:
    """
    Calls the Microsoft Foundry agent configured in .env.

    The Foundry agent is connected to the Foundry IQ knowledge base in the
    Microsoft Foundry portal. The knowledge base contains only synthetic
    ControlRoom IQ policy and runbook documents.

    If Foundry is not configured or the call fails, this function returns a
    structured fallback response instead of breaking the local demo.
    """
    if not is_foundry_iq_configured():
        return {
            "configured": False,
            "mode": "synthetic_fallback",
            "reason": (
                "Foundry environment variables are not fully configured. "
                "Using local synthetic policy evidence instead."
            ),
            "query": query,
            "answer": None,
            "citations": [],
            "raw_response": None,
        }

    try:
        from azure.ai.projects import AIProjectClient
        from azure.identity import DefaultAzureCredential

        endpoint = os.getenv("AZURE_AI_PROJECT_ENDPOINT")
        agent_name = os.getenv("FOUNDRY_AGENT_NAME")
        deployment = os.getenv("AZURE_AI_MODEL_DEPLOYMENT")
        knowledge_base = os.getenv("FOUNDRY_IQ_KNOWLEDGE_BASE")

        project = AIProjectClient(
            endpoint=endpoint,
            credential=DefaultAzureCredential(),
        )

        openai = project.get_openai_client()
        conversation = openai.conversations.create()

        prompt = (
            "You are grounding a ControlRoom IQ AI supervision drill. "
            "Use only the connected Foundry IQ knowledge base. "
            "Return concise policy evidence with source document names. "
            "Do not invent policies. "
            "If evidence is insufficient, say that more evidence is needed.\n\n"
            f"Drill title: {drill.get('title', 'Untitled drill')}\n"
            f"Department: {drill.get('department', 'Unknown')}\n"
            f"AI recommendation: {drill.get('recommendation', '')}\n"
            f"Hidden risk to evaluate: {drill.get('hidden_risk', '')}\n\n"
            f"Grounding question: {query}"
        )

        response = openai.responses.create(
            conversation=conversation.id,
            extra_body={
                "agent_reference": {
                    "name": agent_name,
                    "type": "agent_reference",
                }
            },
            input=prompt,
        )

        answer = _clean_foundry_text(response.output_text)
        citations = _extract_source_names(response.output_text)

        return {
            "configured": True,
            "mode": "foundry_iq_agent",
            "reason": (
                "Retrieved policy evidence through a Microsoft Foundry agent "
                "connected to the ControlRoom IQ Foundry IQ knowledge base."
            ),
            "query": query,
            "answer": answer,
            "citations": citations,
            "raw_response": {
                "agent_name": agent_name,
                "model_deployment": deployment,
                "knowledge_base": knowledge_base,
            },
        }

    except Exception as exc:
        return {
            "configured": True,
            "mode": "foundry_iq_error_fallback",
            "reason": (
                "Foundry was configured, but the live Foundry agent call failed. "
                "Using local synthetic policy evidence instead."
            ),
            "query": query,
            "answer": None,
            "citations": [],
            "raw_response": {
                "error_type": type(exc).__name__,
                "error": str(exc),
            },
        }