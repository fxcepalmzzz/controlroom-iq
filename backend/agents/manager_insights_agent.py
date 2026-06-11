def build_manager_summary():
    return {
        "agent": "Manager Insights Agent",
        "team": "Synthetic AI Operations Team",
        "readiness_score": 78,
        "drills_completed": 3,
        "automation_overtrust_risk": 1,
        "summary": (
            "Synthetic team data shows strong escalation behaviour in HR scenarios, "
            "but weaker evidence-checking in procurement and customer support drills."
        ),
        "recommended_next_steps": [
            "Run stale-retrieval drills for support leads.",
            "Run vendor compliance drills for procurement reviewers.",
            "Require high-impact HR recommendations to be escalated.",
        ],
    }