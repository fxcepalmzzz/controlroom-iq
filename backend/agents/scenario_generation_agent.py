from __future__ import annotations

import json
import os
import re
import uuid
from pathlib import Path
from typing import Any

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")


ALLOWED_DECISIONS = {"approve", "reject", "evidence", "escalate", "pause"}
ALLOWED_SEVERITIES = {"Low", "Medium", "High", "Critical"}


def _fallback_generated_drill() -> dict[str, Any]:
    unique_id = uuid.uuid4().hex[:6].upper()

    return {
        "id": f"GEN-{unique_id}",
        "title": "AI-Generated Access Exception",
        "department": "IT Governance",
        "severity": "High",
        "ai_agent": "Access Review Agent",
        "recommendation": "Approve temporary admin access for User U-517 because the request matches a previous emergency-access pattern.",
        "hidden_risk": "The request has no current manager approval and the previous access pattern was for a different system. The AI is overgeneralising from stale context.",
        "best_decision": "evidence",
        "acceptable_decisions": ["pause", "escalate", "reject"],
        "unsafe_decisions": ["approve"],
        "policy_refs": [
            "Access Control Runbook §4.2: Access changes require current approval and business justification.",
            "Enterprise AI Supervision Policies: High-impact access decisions require human review and relevant evidence."
        ],
        "supervisor_lesson": "A safe supervisor should ask for current evidence before approving elevated access based on a pattern match."
    }


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()

    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned)
        cleaned = re.sub(r"```$", "", cleaned).strip()

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)

    if not match:
        raise ValueError("No JSON object found in model response.")

    return json.loads(match.group(0))


def _normalise_drill(raw: dict[str, Any]) -> dict[str, Any]:
    raw_id = str(raw.get("id") or "")

    generated_id = (
        raw_id
        if raw_id.startswith("GEN-")
        else f"GEN-{uuid.uuid4().hex[:6].upper()}"
    )

    raw_recommendation = str(raw.get("recommendation") or "").strip()

    if len(raw_recommendation) < 35:
        raw_recommendation = (
            "Approve the AI-recommended enterprise action because it appears to match "
            "a prior pattern and may reduce manual review time."
        )

    drill = {
        "id": generated_id,
        "title": raw.get("title") or "Generated Supervision Drill",
        "department": raw.get("department") or "Enterprise Operations",
        "severity": raw.get("severity") if raw.get("severity") in ALLOWED_SEVERITIES else "High",
        "ai_agent": raw.get("ai_agent") or "Generated AI Worker Agent",
        "recommendation": raw_recommendation,
        "hidden_risk": raw.get("hidden_risk") or "The recommendation may be missing relevant evidence or human review.",
        "best_decision": raw.get("best_decision") if raw.get("best_decision") in ALLOWED_DECISIONS else "evidence",
        "acceptable_decisions": [
            decision for decision in raw.get("acceptable_decisions", []) if decision in ALLOWED_DECISIONS
        ],
        "unsafe_decisions": [
            decision for decision in raw.get("unsafe_decisions", []) if decision in ALLOWED_DECISIONS
        ],
        "policy_refs": raw.get("policy_refs") if isinstance(raw.get("policy_refs"), list) else [],
        "supervisor_lesson": raw.get("supervisor_lesson") or "A safe supervisor should require evidence before approving AI automation.",
    }

    # Safety cleanup:
    # Generated scenarios should not treat asking for evidence as dangerous.
    # Evidence may be incomplete, but it is usually safer than blind approval.
    if drill["best_decision"] != "evidence" and "evidence" in drill["unsafe_decisions"]:
        drill["unsafe_decisions"].remove("evidence")

        if "evidence" not in drill["acceptable_decisions"]:
            drill["acceptable_decisions"].append("evidence")

    # Best decision should never also appear as merely acceptable or unsafe.
    drill["acceptable_decisions"] = [
        decision
        for decision in drill["acceptable_decisions"]
        if decision != drill["best_decision"]
    ]

    drill["unsafe_decisions"] = [
        decision
        for decision in drill["unsafe_decisions"]
        if decision != drill["best_decision"]
        and decision not in drill["acceptable_decisions"]
    ]

    # Blind approval is usually the dangerous action in generated supervision drills.
    if drill["best_decision"] != "approve" and "approve" not in drill["unsafe_decisions"]:
        drill["unsafe_decisions"].append("approve")


    if not drill["acceptable_decisions"]:
        drill["acceptable_decisions"] = ["evidence", "pause", "escalate"]

    if not drill["unsafe_decisions"]:
        drill["unsafe_decisions"] = ["approve"]

    if not drill["policy_refs"]:
        drill["policy_refs"] = [
            "Enterprise AI Supervision Policies: High-impact AI recommendations require human review.",
            "Domain Control Runbooks: Supervisors should ask for evidence when context is incomplete."
        ]

    return drill


def generate_supervision_drill(existing_ids: list[str] | None = None) -> dict[str, Any]:
    endpoint = os.getenv("AZURE_AI_PROJECT_ENDPOINT")
    deployment = os.getenv("AZURE_AI_MODEL_DEPLOYMENT")

    existing_ids = existing_ids or []

    if not endpoint or not deployment:
        return _fallback_generated_drill()

    try:
        from azure.ai.projects import AIProjectClient
        from azure.identity import DefaultAzureCredential

        project = AIProjectClient(
            endpoint=endpoint,
            credential=DefaultAzureCredential(),
        )

        openai = project.get_openai_client()

        prompt = f"""
You are the Scenario Director Agent for ControlRoom IQ.

Generate exactly one synthetic AI supervision drill for a human-in-the-loop AI supervisor simulator.

Rules:
- Use only fictional entities.
- Do not use real companies, real people, real emails, credentials, PII, or confidential information.
- Make the scenario realistic for enterprise AI supervision.
- The learner must choose one of: approve, reject, evidence, escalate, pause.
- Avoid these existing IDs: {existing_ids}
- The id must start with "GEN-".
- Do not put "evidence" in unsafe_decisions unless asking for more evidence would directly cause harm.
- For most generated drills, "approve" should be unsafe when the recommendation has hidden risk.
- If the best decision is "escalate", then "pause" and "evidence" are usually acceptable but incomplete.

JSON shape:
{{
  "id": "GEN-123456",
  "title": "Short scenario title",
  "department": "Department name",
  "severity": "Low | Medium | High | Critical",
  "ai_agent": "Name of simulated AI worker agent",
  "recommendation": "The AI recommendation the learner must supervise.",
  "hidden_risk": "The risk the learner should notice.",
  "best_decision": "approve | reject | evidence | escalate | pause",
  "acceptable_decisions": ["..."],
  "unsafe_decisions": ["..."],
  "policy_refs": [
    "Synthetic policy reference 1",
    "Synthetic policy reference 2"
  ],
  "supervisor_lesson": "One sentence explaining the safe supervision lesson."
}}

Prefer one of these domains:
HR, finance, procurement, IT access, privacy, security, legal, compliance, operations, engineering, customer support, marketing, data governance.
"""

        response = openai.responses.create(
            model=deployment,
            input=prompt,
        )

        raw = _extract_json(response.output_text)
        return _normalise_drill(raw)

    except Exception:
        return _fallback_generated_drill()