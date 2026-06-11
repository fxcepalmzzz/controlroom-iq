# ControlRoom IQ

**Human-in-the-loop flight simulator for AI supervisors.**

ControlRoom IQ is a Microsoft Agents League Reasoning Agents project that trains employees to safely supervise AI agents before automation reaches the real world.

Instead of building another static certification planner, ControlRoom IQ puts learners inside realistic AI control-room drills. Each drill presents an AI agent recommendation, supporting policy evidence, hidden risks, and a required human decision: approve, reject, ask for evidence, escalate, or pause automation.

## Why this matters

Enterprise AI is no longer just answering questions. Agents are beginning to recommend actions, trigger workflows, draft decisions, and automate business processes.

The missing skill is not only building agents. It is knowing when humans should stop them.

ControlRoom IQ helps organisations train and certify people for safe AI supervision.

## Demo scenario

A simulated workplace AI agent recommends:

> Remove Employee L-1004 from the promotion shortlist due to low predicted leadership fit.

The learner must decide whether to approve, reject, ask for evidence, escalate, or pause the recommendation.

ControlRoom IQ then scores the decision and explains the hidden risk using synthetic policy references.

## Core features

- Interactive AI supervision drills
- Multi-agent reasoning trace
- Synthetic Foundry IQ-style evidence panel
- Safe / unsafe decision scoring
- Manager readiness dashboard
- Backend online/offline fallback mode
- Synthetic data only
- Human-in-the-loop safety design

## Multi-agent architecture

ControlRoom IQ uses a synthetic multi-agent architecture:

1. **Scenario Director Agent** creates realistic workplace AI supervision drills.
2. **Simulated AI Worker Agent** produces the AI recommendation the learner must supervise.
3. **Evidence Grounding Agent** retrieves synthetic policy and runbook references. In a full Microsoft Foundry version, this maps to Foundry IQ grounded retrieval.
4. **Risk Critic Agent** checks for weak evidence, stale retrieval, bias, privacy leakage, and unsafe automation.
5. **Assessment Agent** scores the learner decision against a safe-supervision rubric.
6. **Manager Insights Agent** updates team readiness, over-trust risk, and recommended next drills.

## Microsoft IQ integration plan

ControlRoom IQ is designed around **Foundry IQ** as the main Microsoft IQ layer.

Current prototype:

- Uses synthetic policy references and local markdown knowledge files
- Exposes a FastAPI backend for drill and assessment logic
- Demonstrates the intended grounded evidence workflow

Planned Microsoft Foundry version:

- Upload synthetic policy docs into Foundry IQ / knowledge sources
- Retrieve grounded evidence for each drill
- Generate cited recommendations and assessment explanations
- Use Microsoft Foundry or Microsoft Agent Framework for orchestration

## Tech stack

Frontend:

- React
- TypeScript
- Vite
- CSS
- lucide-react

Backend:

- Python
- FastAPI
- Synthetic JSON datasets
- Synthetic markdown knowledge base

## Project structure

```text
controlroom-iq/
├─ frontend/
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ App.css
│  │  ├─ api.ts
│  │  └─ main.tsx
├─ backend/
│  ├─ main.py
│  ├─ requirements.txt
│  ├─ agents/
│  ├─ data/
│  └─ knowledge/
├─ docs/
│  ├─ architecture.md
│  └─ safety.md
└─ README.md