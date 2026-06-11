from __future__ import annotations

from typing import Any

from agents.assessment_agent import assess_decision
from agents.evidence_grounding_agent import ground_evidence
from agents.risk_critic_agent import critique_risk


def run_supervision_drill(drill: dict[str, Any], decision: str) -> dict[str, Any]:
    """
    ControlRoom IQ multi-agent orchestration boundary.

    This is the explicit workflow entry point for the Reasoning Agents demo.

    Current local execution:
    1. Evidence Grounding Agent builds a policy grounding query and uses either
       the Foundry IQ integration boundary or local synthetic evidence.
    2. Risk Critic Agent identifies safety, fairness, privacy, stale-evidence,
       and automation risks.
    3. Assessment Agent scores the human supervisor decision using the drill rubric.
    4. The response is returned to the frontend as an explainable supervision trace.

    Future Microsoft Agent Framework path:
    - Convert each specialised function into an Agent Framework agent.
    - Keep this orchestrator as the planner/router workflow.
    - Use Foundry IQ as the real grounding layer for synthetic policy documents.
    - Add telemetry/evaluation around each agent step.
    """
    evidence = ground_evidence(drill)
    risk_critique = critique_risk(drill)
    assessment = assess_decision(drill, decision)

    # Keep the Assessment Agent as the scoring owner, but expose a clearer
    # orchestration trace for the UI, FastAPI docs, and judges.
    assessment["evidence"] = evidence
    assessment["risk_critique"] = risk_critique
    assessment["orchestration"] = {
        "agent": "ControlRoom IQ Orchestrator",
        "pattern": "planner-critic-assessor",
        "steps": [
            {
                "step": 1,
                "agent": "Evidence Grounding Agent",
                "purpose": "Retrieve or simulate policy evidence before a human approves an AI recommendation.",
                "mode": evidence.get("mode"),
            },
            {
                "step": 2,
                "agent": "Risk Critic Agent",
                "purpose": "Check for hidden safety, fairness, privacy, stale-evidence, or automation risks.",
                "risk_level": risk_critique.get("risk_level"),
            },
            {
                "step": 3,
                "agent": "Assessment Agent",
                "purpose": "Score the supervisor decision and explain whether the human intervention was safe.",
                "verdict": assessment.get("verdict"),
            },
        ],
        "human_in_the_loop": True,
        "synthetic_data_only": True,
        "microsoft_iq_layer": "Foundry IQ boundary with local synthetic fallback",
    }

    return assessment