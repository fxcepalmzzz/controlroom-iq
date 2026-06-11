# Foundry IQ Integration Plan

## Overview

ControlRoom IQ is designed as a human-in-the-loop training simulator for AI supervisor readiness.

The current prototype uses a synthetic Foundry IQ-style grounding layer. This means the application demonstrates the intended evidence-grounded workflow using local JSON drills and synthetic markdown policy documents, without connecting to a live Microsoft Foundry or Foundry IQ deployment.

This is intentional for the hackathon prototype because the project must remain safe, portable, and demo-friendly.

---

## Current prototype state

The current version is a local synthetic demo.

It includes:

* Synthetic enterprise drills stored in local JSON
* Synthetic policy and runbook references
* A FastAPI backend for drill loading, assessment, and manager summaries
* A React frontend that displays AI recommendations, policy evidence, hidden risks, and supervisor decisions
* A multi-agent reasoning trace that shows the intended architecture
* Offline frontend fallback data when the backend is unavailable

The evidence shown in the UI is not retrieved from a live Foundry IQ index yet.

Instead, the project simulates the same pattern:

1. A workplace AI recommendation is generated or selected.
2. Relevant policy-style references are attached to the drill.
3. A risk critique identifies why the recommendation may be unsafe.
4. The learner makes a human supervision decision.
5. The assessment layer scores the decision against a safe-supervision rubric.

---

## Why synthetic data is used

ControlRoom IQ uses synthetic data only.

The prototype does not include:

* real employee data
* real customer data
* real HR records
* real procurement documents
* real support tickets
* real credentials
* confidential company policies
* autonomous execution against business systems

This keeps the hackathon demo safe while still showing the intended enterprise workflow.

The goal is to train safe human supervision behaviour, not to make real workplace decisions.

---

## Intended Microsoft Foundry / Foundry IQ architecture

In a fuller Microsoft implementation, ControlRoom IQ would use Microsoft Foundry and Foundry IQ as the grounding and orchestration layer.

A possible production architecture would include:

1. **Microsoft Foundry knowledge sources**

   Synthetic or approved company policy documents would be uploaded into a Foundry knowledge layer.

   Example sources:

   * HR AI usage policy
   * promotion and performance review guidelines
   * customer refund policy
   * procurement approval policy
   * vendor compliance checklist
   * IT access removal runbook
   * privacy and data handling policy
   * incident escalation playbook

2. **Foundry IQ grounded retrieval**

   For each drill, the Evidence Grounding Agent would retrieve relevant policy sections from the knowledge layer.

   Instead of hardcoded policy references, the system would return grounded evidence with citations.

3. **Risk Critic Agent**

   The Risk Critic Agent would inspect the AI recommendation and retrieved evidence.

   It would check for:

   * missing evidence
   * stale policies
   * biased or high-impact recommendations
   * privacy leakage
   * automation that bypasses required human approval
   * weak or contradictory citations

4. **Assessment Agent**

   The Assessment Agent would compare the learner's decision against the drill's safety rubric.

   It would explain whether the learner correctly approved, rejected, escalated, asked for evidence, or paused automation.

5. **Manager Insights Agent**

   The Manager Insights Agent would summarize readiness trends.

   It could identify patterns such as:

   * teams that approve too quickly
   * users who miss stale evidence
   * departments that need more high-impact decision drills
   * learners who correctly escalate risk

---

## Example Foundry IQ workflow

A learner opens a drill:

> A support AI agent recommends automatically denying a customer refund.

The Evidence Grounding Agent queries the Foundry IQ knowledge source.

It retrieves:

* current refund policy
* warranty exception policy
* customer-impacting automation standard

The Risk Critic Agent identifies that the AI recommendation may be using a stale refund rule.

The learner chooses whether to approve, reject, ask for evidence, escalate, or pause automation.

The Assessment Agent scores the learner's response.

The Manager Insights Agent updates readiness metrics.

---

## Honest hackathon disclosure

The current version of ControlRoom IQ does not yet connect to a real Microsoft Foundry or Foundry IQ instance.

The current version is a local synthetic prototype that demonstrates the intended product experience, safety design, and multi-agent reasoning architecture.

A real Foundry integration would require:

* a Microsoft Foundry project
* configured model deployment
* configured knowledge sources
* secure environment variables
* retrieval and citation logic
* production-grade authentication and access controls

The prototype is therefore best described as:

> A synthetic Foundry IQ-style human-in-the-loop AI supervision simulator, designed for future Microsoft Foundry and Foundry IQ integration.

---

## Why this matters

Most AI training tools focus on prompting, productivity, or certification checklists.

ControlRoom IQ focuses on a different enterprise problem:

Can employees safely supervise AI agents before those agents affect real workflows?

Foundry IQ grounding would make that training more realistic by connecting each drill to trusted organisational knowledge.

The result is a practical training simulator for responsible AI adoption, where humans learn when to trust, challenge, escalate, or stop AI recommendations.
