from __future__ import annotations

from typing import Any


HIGH_IMPACT_DEPARTMENTS = {"HR", "Procurement", "IT", "Security", "Compliance"}
HIGH_SEVERITY_LEVELS = {"High", "Critical"}


def critique_risk(drill: dict[str, Any]) -> dict[str, Any]:
    """
    Risk Critic Agent.

    Reviews the AI recommendation and drill metadata for supervision risks.
    This deterministic critic makes the demo explainable and stable.
    """
    department = drill.get("department", "Unknown")
    severity = drill.get("severity", "Medium")
    hidden_risk = drill.get("hidden_risk", "No hidden risk provided.")
    recommendation = drill.get("recommendation", "")

    risk_flags: list[str] = []

    if severity in HIGH_SEVERITY_LEVELS:
        risk_flags.append("High-severity workflow requires stronger human review.")

    if department in HIGH_IMPACT_DEPARTMENTS:
        risk_flags.append(
            f"{department} decisions can create governance, compliance, fairness, or security risk."
        )

    if "automatically" in recommendation.lower() or "immediately" in recommendation.lower():
        risk_flags.append("Recommendation pushes fast automation before enough human review.")

    if "stale" in hidden_risk.lower():
        risk_flags.append("Evidence may be stale and should be challenged.")

    if "bias" in hidden_risk.lower():
        risk_flags.append("Recommendation may encode bias or unfair treatment.")

    if "privacy" in hidden_risk.lower():
        risk_flags.append("Scenario may involve privacy or data-handling risk.")

    if not risk_flags:
        risk_flags.append("No obvious blocker found, but supervisor review is still required.")

    return {
        "agent": "Risk Critic Agent",
        "risk_level": severity,
        "primary_risk": hidden_risk,
        "risk_flags": risk_flags,
        "recommended_supervisor_action": drill.get("best_decision", "evidence"),
    }