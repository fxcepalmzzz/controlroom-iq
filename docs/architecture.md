# ControlRoom IQ Architecture

ControlRoom IQ is a synthetic multi-agent training system for AI supervisor readiness.

## Agents

1. Scenario Director Agent  
Creates realistic workplace AI supervision drills.

2. Simulated AI Worker Agent  
Produces the AI recommendation that the learner must supervise.

3. Evidence Grounding Agent  
Retrieves synthetic policy and runbook references. In the final Microsoft Foundry version, this maps to Foundry IQ grounded retrieval.

4. Risk Critic Agent  
Checks the recommendation for missing evidence, stale sources, bias, privacy leakage, and unsafe automation.

5. Assessment Agent  
Scores the learner's decision against the safe-supervision rubric.

6. Manager Insights Agent  
Summarizes team readiness, over-trust risk, and recommended follow-up drills.

## Current implementation

The current prototype includes a React frontend and a FastAPI backend using synthetic data.

## Planned Microsoft integration

- Microsoft Foundry for model and agent orchestration.
- Foundry IQ for grounded retrieval over synthetic policy documents.
- Optional Microsoft Agent Framework for local orchestration.