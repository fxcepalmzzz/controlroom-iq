# ControlRoom IQ Demo Script

**Demo length:** 2-3 minutes
**Project:** ControlRoom IQ: Human-in-the-Loop Flight Simulator for AI Supervisors
**Track:** Microsoft Agents League - Reasoning Agents

---

## 0:00 - 0:20 — Opening hook

Enterprise AI agents are starting to recommend actions, trigger workflows, and influence real business decisions.

But the missing enterprise skill is not only building AI agents.

It is knowing when humans should stop them.

ControlRoom IQ is a human-in-the-loop flight simulator for AI supervisors. It trains employees to safely supervise AI agents before automation reaches the real world.

---

## 0:20 - 0:50 — Product overview

This is not a static certification planner.

Instead, the learner is placed inside realistic AI control-room drills.

Each drill shows an AI agent recommendation, the business context, policy-style evidence, hidden risks, and a set of human supervisor actions.

The learner must decide whether to:

* approve the recommendation
* reject it
* ask for more evidence
* escalate it
* or pause automation

The system then scores the decision and explains whether the learner supervised the AI safely.

---

## 0:50 - 1:30 — Demo walkthrough

In this example, a simulated HR AI agent recommends removing an employee from a promotion shortlist because of a low predicted leadership fit.

That sounds like a normal AI recommendation, but it is actually a high-impact employment decision.

The learner can see synthetic policy references from the Evidence Grounding Agent, but they still need to reason about the risk.

If they approve too quickly, ControlRoom IQ marks it as unsafe because the AI recommendation may encode bias, lacks enough role-relevant evidence, and does not provide an appeal path.

A stronger human supervisor response is to escalate, reject, or ask for evidence depending on the scenario.

This turns abstract responsible AI principles into a practical supervision drill.

---

## 1:30 - 2:10 — Multi-agent reasoning

ControlRoom IQ is built around a synthetic multi-agent architecture.

The Scenario Director Agent creates the workplace drill.

The Simulated AI Worker Agent produces the recommendation the learner must supervise.

The Evidence Grounding Agent retrieves synthetic policy and runbook references.

The Risk Critic Agent checks for weak evidence, stale sources, bias, privacy leakage, and unsafe automation.

The Assessment Agent scores the learner's decision.

The Manager Insights Agent updates team readiness, over-trust risk, and recommended next drills.

This fits the Reasoning Agents track because the core experience is not just generating an answer. It is multi-step reasoning about evidence, risk, policy, and when a human should intervene.

---

## 2:10 - 2:40 — Microsoft Foundry IQ plan

The current hackathon prototype uses local synthetic data and synthetic policy documents.

That is intentional for safety: there is no real employee data, no real customer data, no credentials, and no autonomous action against real systems.

The planned Microsoft Foundry version would connect the Evidence Grounding Agent to Foundry IQ or Microsoft Foundry knowledge sources.

Synthetic company policies, HR runbooks, support procedures, procurement rules, and security playbooks would be uploaded as knowledge sources.

Each drill could then retrieve grounded evidence, generate cited risk critiques, and assess whether the human supervisor made a safe decision.

---

## 2:40 - 3:00 — Closing

ControlRoom IQ helps organisations answer a question most AI training tools ignore:

Before we give employees powerful AI agents, can they safely supervise them?

The goal is to train people not just to use AI, but to know when to challenge it, escalate it, and stop it.

That is why ControlRoom IQ is a flight simulator for the next generation of AI supervisors.
