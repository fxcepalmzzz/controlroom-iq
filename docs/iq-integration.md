# Foundry IQ Integration

## Overview

ControlRoom IQ integrates **Microsoft Foundry IQ** as the grounded knowledge layer for AI supervision drills.

The purpose of Foundry IQ in this project is to ground each assessment in approved synthetic policy documents instead of relying only on unsupported model output.

When a learner submits a supervision decision, the Evidence Grounding Agent queries a Microsoft Foundry evidence agent connected to the Foundry IQ knowledge base. The returned answer is shown in the app as the **Grounded Supervisor Brief**.

## Current implementation

The current implementation uses:

* Microsoft Foundry project
* Foundry model deployment
* Foundry evidence agent
* Foundry IQ knowledge base
* Synthetic markdown policy documents
* FastAPI backend integration
* Local synthetic fallback when Foundry IQ is unavailable

The app does not use real customer data, real employee data, credentials, or confidential company documents.

## Configured Foundry components

The project is designed around the following Foundry configuration:

```text
Foundry project:
controlroom-iq

Model deployment:
gpt-4.1-mini

Foundry IQ knowledge base:
controlroom-iq-supervision-kb

Foundry evidence agent:
controlroom-iq-evidence-agent

Knowledge source:
expanded synthetic AI supervision policy pack
```

The Foundry evidence agent is instructed to:

* Use only the connected synthetic knowledge base
* Return concise policy evidence
* Include source document references
* Avoid inventing policies
* Say when evidence is insufficient
* Never use real employee, customer, or confidential data

## Synthetic knowledge base

The Foundry IQ knowledge base is built from synthetic supervision documents.

Example documents:

* `human-approval-thresholds.md`
* `responsible-ai-supervision-guide.md`
* `enterprise-ai-supervision-policies.md`
* `domain-control-runbooks.md`

These documents contain fictional guidance for:

* Human approval thresholds
* Escalation rules
* Responsible AI supervision
* Privacy and data minimisation
* Procurement approval
* HR decision risk
* IT access governance
* Finance and payroll validation
* Safety and operations escalation
* Audit and compliance closure

## Evidence grounding flow

```text
1. Learner chooses a supervision action.
2. Frontend sends the decision to POST /api/assess.
3. Backend builds a grounding query from the drill context.
4. Evidence Grounding Agent calls the Foundry evidence agent.
5. Foundry evidence agent retrieves from the Foundry IQ knowledge base.
6. Foundry IQ returns grounded evidence and source documents.
7. Risk Critic Agent analyses the hidden risk.
8. Assessment Agent scores the learner decision.
9. Frontend displays evidence, risk flags, score, trace, and Grounded Supervisor Brief.
```

## What the Grounded Supervisor Brief shows

The Grounded Supervisor Brief displays the Foundry-grounded output returned by the Evidence Grounding Agent.

It usually includes:

* Evidence bullets
* Recommended supervisor action
* Source document names

This makes the assessment explainable and demonstrates that the system is not only scoring from hardcoded UI text. It is grounding the supervision decision in a policy knowledge layer.

## Fallback behaviour

ControlRoom IQ includes safe fallback behaviour.

If Foundry IQ is unavailable, missing, rate-limited, or misconfigured, the backend returns local synthetic policy references instead of failing the demo.

The UI labels the grounding mode so the user can see whether the assessment used:

* `foundry_iq_agent`
* `foundry_iq_error_fallback`
* `synthetic_fallback`

This is intentional. The project remains honest about grounding mode while staying demoable and safe.

## Why Foundry IQ fits this project

Foundry IQ is a strong fit because ControlRoom IQ is about policy-grounded human oversight.

The simulator needs to answer questions such as:

* Does this AI recommendation require human approval?
* Is the evidence current and relevant?
* Does the recommendation involve sensitive data?
* Should the supervisor reject, escalate, pause, or ask for more evidence?
* Which policy source supports the safer action?

Foundry IQ provides the grounded retrieval layer for those questions.

## Relationship to the Reasoning Agents challenge

The Reasoning Agents challenge asks for a multi-agent system using Microsoft Foundry that demonstrates reasoning, orchestration, grounded knowledge, semantic business understanding, and production-minded patterns.

ControlRoom IQ addresses this by combining:

* Specialised agents
* Microsoft Foundry
* Foundry IQ grounded retrieval
* Multi-step assessment
* Risk critique
* Visible orchestration trace
* Synthetic data only
* Human oversight guardrails
* Manager readiness insights

## Safety and privacy

The project uses synthetic data only.

It does not include:

* Real employee data
* Real customer data
* Real HR records
* Real support tickets
* Real procurement records
* Real emails
* Credentials
* API keys
* Connection strings
* Confidential company policies
* Autonomous execution against business systems

The project is a training simulator and does not make real workplace decisions.

## Environment variables

The local `.env` file should contain the project-specific Foundry settings. It must not be committed.

```env
AZURE_AI_PROJECT_ENDPOINT=
AZURE_AI_MODEL_DEPLOYMENT=gpt-4.1-mini
FOUNDRY_IQ_KNOWLEDGE_BASE=controlroom-iq-supervision-kb
FOUNDRY_AGENT_NAME=controlroom-iq-evidence-agent
```

Use `.env.example` as the committed template.

## Validation scripts

The backend includes smoke tests for Foundry setup:

```powershell
cd backend
.venv\Scripts\activate
python test_foundry_connection.py
python test_foundry_agent.py
```

These confirm that the Foundry project client can connect and that the Foundry evidence agent can retrieve from the connected synthetic knowledge base.

## Summary

ControlRoom IQ uses Foundry IQ as the policy grounding layer for a responsible AI supervision simulator.

The project demonstrates how enterprise AI training can move beyond static quizzes by combining:

* Grounded evidence
* Risk critique
* Human-in-the-loop decisions
* Runtime generated scenarios
* Manager readiness insights

The system is intentionally synthetic, transparent, and safety-focused for hackathon submission.
