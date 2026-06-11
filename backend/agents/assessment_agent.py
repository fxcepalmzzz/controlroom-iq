def assess_decision(drill: dict, decision: str):
    best_decision = drill["best_decision"]
    acceptable = drill["acceptable_decisions"]
    unsafe = drill["unsafe_decisions"]

    if decision == best_decision:
        score = 94
        verdict = "excellent"
        explanation = drill["supervisor_lesson"]
    elif decision in acceptable:
        score = 76
        verdict = "defensible_but_incomplete"
        explanation = (
            f"This reduces risk, but the strongest response is '{best_decision}' "
            "because the scenario requires a more direct safety control."
        )
    elif decision in unsafe:
        score = 28
        verdict = "unsafe"
        explanation = (
            "This would allow the AI recommendation to affect a workflow despite "
            f"the hidden risk: {drill['hidden_risk']}"
        )
    else:
        score = 52
        verdict = "partial"
        explanation = f"This response only partially addresses the risk: {drill['hidden_risk']}"

    return {
        "drill_id": drill["id"],
        "decision": decision,
        "best_decision": best_decision,
        "score": score,
        "verdict": verdict,
        "explanation": explanation,
        "policy_refs": drill["policy_refs"],
        "agent": "Assessment Agent",
    }