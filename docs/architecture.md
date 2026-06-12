# ControlRoom IQ Architecture

ControlRoom IQ is a human-in-the-loop AI supervision simulator built for the Microsoft Agents League Reasoning Agents track.

The system combines a React frontend, a FastAPI backend, specialised reasoning agents, Microsoft Foundry, and Foundry IQ grounded retrieval over synthetic policy documents.

## High-level architecture

```text
Learner / Human Supervisor
        ↓
React + Vite Frontend
        ↓
FastAPI Backend
        ↓
Assessment Orchestrator
        ↓
Evidence Grounding Agent ──→ Microsoft Foundry Agent ──→ Foundry IQ Knowledge Base
        ↓
Risk Critic Agent
        ↓
Assessment Agent
        ↓
Score + Explanation + Risk Flags + Grounded Supervisor Brief
        ↓
Manager Insights Agent
```

## Frontend

The frontend is built with React, TypeScript, Vite, and CSS.

It displays:

* Simulation drill library
* Runtime generated drill button
* AI worker recommendation
* Five human supervision actions
* Assessment result
* Evidence sources
* Grounded Supervisor Brief
* Visible multi-agent reasoning trace
* Manager readiness summary

The frontend also handles backend online/offline status. If the backend is unavailable, the UI can still show safe local fallback data for demo reliability.

## Backend

The backend is built with Python and FastAPI.

Main responsibilities:

* Serve curated synthetic drills
* Generate runtime AI supervision drills
* Receive learner decisions
* Run the live assessment pipeline
* Query Foundry IQ through the Foundry evidence agent
* Return score, explanation, evidence, risk critique, and orchestration trace
* Provide manager-level readiness summaries

Main endpoints:

```text
GET  /
GET  /api/drills
GET  /api/drills/{drill_id}
POST /api/assess
POST /api/generate-drill
GET  /api/manager-summary
```

## Agent responsibilities

### 1. Scenario Director Agent

The Scenario Director Agent creates synthetic AI supervision drills.

It supports two modes:

* Curated hardcoded drills from `backend/data/drills.json`
* Runtime generated drills through the configured Foundry model

Runtime generated drills are marked with `GEN-` identifiers and are validated before being returned to the frontend.

### 2. Simulated AI Worker Agent

The Simulated AI Worker Agent is represented inside each drill.

It produces the recommendation that the learner must supervise, such as approving vendor access, sending customer data, denying a refund, or escalating a payroll adjustment.

The simulated AI worker can be wrong, weakly grounded, stale, biased, privacy-risky, or unsafe.

### 3. Evidence Grounding Agent

The Evidence Grounding Agent retrieves policy evidence before a decision is assessed.

When Microsoft Foundry is configured, it calls the Foundry evidence agent connected to the Foundry IQ knowledge base. The response is displayed as the Grounded Supervisor Brief.

When Foundry IQ is unavailable, it falls back to local synthetic policy references so the demo remains safe and usable.

### 4. Risk Critic Agent

The Risk Critic Agent reviews the AI recommendation and evidence.

It checks for:

* Missing evidence
* Stale policy references
* Privacy leakage
* Biased or high-impact recommendations
* Governance and compliance risk
* Unsafe automation
* Bypassed human approval

### 5. Assessment Agent

The Assessment Agent scores the learner’s supervision decision.

It compares the chosen action against the drill rubric:

* Best decision
* Acceptable decisions
* Unsafe decisions

It returns:

* Score
* Verdict
* Explanation
* Whether the decision was safe
* Reasoning trace metadata

### 6. Manager Insights Agent

The Manager Insights Agent summarises team-level readiness.

It surfaces:

* Team readiness score
* Number of completed drills
* Automation over-trust risk
* Patterns that indicate where more training is needed

## Microsoft Foundry and Foundry IQ

ControlRoom IQ uses Microsoft Foundry and Foundry IQ as the grounding layer.

Configured resources include:

* Foundry project: `controlroom-iq`
* Model deployment: `gpt-4.1-mini`
* Foundry IQ knowledge base: `controlroom-iq-supervision-kb`
* Foundry evidence agent: `controlroom-iq-evidence-agent`
* Synthetic knowledge source: expanded policy and runbook documents

The Foundry evidence agent is instructed to use only the connected synthetic knowledge base and to return concise policy evidence with source references.

## Foundry IQ retrieval flow

```text
Learner submits decision
        ↓
Backend builds a grounding query from the drill
        ↓
Evidence Grounding Agent calls Foundry evidence agent
        ↓
Foundry agent retrieves from Foundry IQ knowledge base
        ↓
Grounded evidence and source documents are returned
        ↓
Risk Critic and Assessment Agent use the grounded context
        ↓
Frontend displays the Grounded Supervisor Brief
```

## Runtime drill generation flow

```text
Learner clicks Generate AI drill
        ↓
Frontend calls POST /api/generate-drill
        ↓
Scenario Generation Agent calls the configured Foundry model
        ↓
Generated JSON drill is normalised and validated
        ↓
Guardrails clean up unsafe labels and weak outputs
        ↓
Generated drill is returned to the frontend
        ↓
Frontend marks it as AI-generated runtime synthetic
```

## Guardrails for generated drills

Generated drills are normalised before being shown.

The backend enforces:

* ID starts with `GEN-`
* Recommendation is a full realistic sentence
* Fictional entities only
* No real people, real emails, credentials, PII, or confidential data
* `approve` is usually unsafe when hidden risk exists
* `evidence` is not treated as unsafe unless asking for evidence directly causes harm
* `pause` is not treated as unsafe unless delaying action directly causes harm
* Best decision is removed from acceptable and unsafe lists
* Local fallback scenario is available if generation fails

## Trace behaviour

The frontend shows two kinds of traces.

Before a learner submits a decision, it shows the full conceptual six-step workflow:

1. Scenario Director
2. Simulated AI Worker
3. Evidence Grounding Agent
4. Risk Critic Agent
5. Assessment Agent
6. Manager Insights Agent

After the learner submits a decision, it switches to the live backend orchestration trace returned by the assessment endpoint. The live trace currently shows the executed backend agents:

1. Evidence Grounding Agent
2. Risk Critic Agent
3. Assessment Agent

This keeps the UI honest: conceptual design before assessment, actual executed pipeline after assessment.

## Data sources

ControlRoom IQ uses synthetic data only.

Data sources include:

* Curated synthetic drill JSON
* Runtime generated synthetic drills
* Synthetic policy markdown documents
* Synthetic runbooks
* Synthetic manager readiness metrics

No real enterprise data is used.

## Reliability and fallback design

ControlRoom IQ includes fallback behavior for demo reliability.

If Foundry IQ is unavailable, the backend can still return local synthetic policy evidence. If the backend is unavailable, the frontend can still display fallback drills.

This keeps the simulator safe and demoable without exposing real data or secrets.

## Production-minded direction

A production version could extend this architecture with:

* Hosted Agents in Foundry Agent Service
* Managed identity and Azure Key Vault
* Stronger telemetry and evaluation sets
* Role-based access controls
* Formal learner profiles
* Organisation-specific approved policy documents
* Human approval audit logs
* Deployment through Azure Container Apps or Foundry Hosted Agents

The hackathon version focuses on the core reasoning pattern: grounded evidence, risk critique, human supervision, and readiness insights.
