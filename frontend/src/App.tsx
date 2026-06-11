import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  FileText,
  Gauge,
  PauseCircle,
  ShieldCheck,
  Siren,
  UserCheck,
  XCircle,
  CircleSlash,
} from "lucide-react";
import "./App.css";
import {
  assessDecision,
  checkBackendHealth,
  fetchBackendDrills,
  type AssessmentResult,
  type Decision,
  type Drill,
} from "./api";



const fallbackDrills: Drill[] = [
  {
    id: "HR-014",
    title: "Promotion List Recommendation",
    department: "HR",
    severity: "Critical",
    aiAgent: "Talent Ranking Agent",
    recommendation:
      "Remove Employee L-1004 from the promotion shortlist due to low predicted leadership fit.",
    hiddenRisk:
      "The recommendation affects employment outcomes, is weakly grounded, and may encode bias. The AI has not cited enough role-relevant evidence or provided an appeal path.",
    bestDecision: "escalate",
    acceptableDecisions: ["escalate", "reject", "evidence"],
    unsafeDecisions: ["approve"],
    policyRefs: [
      "HR-AI-Policy §2.1: High-impact employment decisions require human review.",
      "Responsible AI Guide §4.3: Automated recommendations must include evidence and appeal path.",
    ],
    learningGoal:
      "Recognise when an AI recommendation affects employment outcomes and must be escalated.",
    supervisorLesson:
      "A safe supervisor should not let an AI system make or quietly influence high-impact HR decisions without policy-backed evidence, human review, and an appeal route.",
    managerImpact:
      "Flags HR reviewers who over-trust AI ranking systems during high-impact decisions.",
  },
  {
    id: "CS-022",
    title: "Refund Policy Automation",
    department: "Customer Support",
    severity: "High",
    aiAgent: "Support Resolution Agent",
    recommendation:
      "Automatically deny the customer refund because their case appears outside the return window.",
    hiddenRisk:
      "The retrieved policy is stale. The policy changed last quarter for warranty exceptions, so the AI may deny a valid claim.",
    bestDecision: "evidence",
    acceptableDecisions: ["evidence", "pause", "escalate"],
    unsafeDecisions: ["approve"],
    policyRefs: [
      "Support Runbook §3.2: Refund denials require current policy citation.",
      "Grounding Standard §1.4: Stale retrieval must be challenged before action.",
    ],
    learningGoal:
      "Challenge AI recommendations when the source may be outdated or incomplete.",
    supervisorLesson:
      "When an AI cites a policy, the supervisor must check whether the policy is current and relevant before approving customer-impacting automation.",
    managerImpact:
      "Identifies support leads who need more practice challenging stale retrieval.",
  },
  {
    id: "PROC-031",
    title: "Vendor Auto-Approval",
    department: "Procurement",
    severity: "High",
    aiAgent: "Vendor Screening Agent",
    recommendation:
      "Approve Vendor V-204 immediately because the quote is 18% cheaper than alternatives.",
    hiddenRisk:
      "The agent ignored missing compliance documentation and over-optimised for cost.",
    bestDecision: "pause",
    acceptableDecisions: ["pause", "evidence", "escalate"],
    unsafeDecisions: ["approve"],
    policyRefs: [
      "Procurement Policy §5.1: Vendors cannot be approved without compliance documents.",
      "AI Tool Use Policy §2.7: Cost-saving recommendations must not bypass governance controls.",
    ],
    learningGoal:
      "Pause automation when a tool tries to skip required approval evidence.",
    supervisorLesson:
      "Cost savings are not enough to approve a vendor. The AI must satisfy governance and compliance requirements before action is allowed.",
    managerImpact:
      "Shows procurement teams whether they can stop unsafe automation under pressure.",
  },
];

const decisions: { id: Decision; label: string; icon: React.ReactNode }[] = [
  { id: "approve", label: "Approve", icon: <CheckCircle2 size={17} /> },
  { id: "reject", label: "Reject", icon: <XCircle size={17} /> },
  { id: "evidence", label: "Ask for evidence", icon: <FileText size={17} /> },
  { id: "escalate", label: "Escalate", icon: <Siren size={17} /> },
  { id: "pause", label: "Pause automation", icon: <PauseCircle size={17} /> },
];

const agentSteps = [
  "Scenario Director creates a synthetic workplace drill with a hidden AI failure mode.",
  "Simulated AI Worker generates a recommendation that may be safe, weakly grounded, or unsafe.",
  "Evidence Grounding Agent retrieves policy references from the Foundry IQ knowledge layer.",
  "Risk Critic checks for missing evidence, stale sources, bias, privacy leakage, and automation risk.",
  "Assessment Agent scores the learner decision against the safe-supervision rubric.",
  "Manager Insights Agent updates team readiness and recommends the next drill.",
];

function getDecisionLabel(decision: Decision) {
  return decisions.find((item) => item.id === decision)?.label ?? decision;
}

function getScore(drill: Drill, decision: Decision | null) {
  if (!decision) return 0;
  if (decision === drill.bestDecision) return 94;
  if (drill.acceptableDecisions.includes(decision)) return 76;
  if (drill.unsafeDecisions.includes(decision)) return 28;
  return 52;
}

function getResultTitle(drill: Drill, decision: Decision | null) {
  if (!decision) return "Awaiting supervisor action";
  if (decision === drill.bestDecision) return "Excellent supervision decision";
  if (drill.acceptableDecisions.includes(decision)) return "Defensible but incomplete";
  if (drill.unsafeDecisions.includes(decision)) return "Unsafe approval path";
  return "Risk partially missed";
}

function getResultText(drill: Drill, decision: Decision | null) {
  if (!decision) {
    return "Choose how the human supervisor should respond to the AI recommendation.";
  }

  if (decision === drill.bestDecision) {
    return drill.supervisorLesson;
  }

  if (drill.acceptableDecisions.includes(decision)) {
    return `This action reduces risk, but the strongest response is "${getDecisionLabel(
      drill.bestDecision
    )}" because the scenario requires a more direct safety control.`;
  }

  if (drill.unsafeDecisions.includes(decision)) {
    return `Approving here would allow the AI recommendation to affect a real workflow despite this hidden risk: ${drill.hiddenRisk}`;
  }

  return `This choice does not fully address the hidden risk: ${drill.hiddenRisk}`;
}

function App() {
  const [drills, setDrills] = useState<Drill[]>(fallbackDrills);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );
  const [activeDrillId, setActiveDrillId] = useState(drills[0].id);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [assessmentStatus, setAssessmentStatus] = useState<"idle" | "checking" | "fallback">(
    "idle"
  );
  const [completed, setCompleted] = useState<Record<string, number>>({});
  
  useEffect(() => {
    async function loadBackendData() {
      try {
        await checkBackendHealth();
        const backendDrills = await fetchBackendDrills();

        if (backendDrills.length > 0) {
          setDrills(backendDrills);
          setActiveDrillId(backendDrills[0].id);
          setBackendStatus("online");
        }
      } catch {
        setBackendStatus("offline");
      }
    }

    loadBackendData();
  }, []);

  const activeDrill = useMemo(
    () => drills.find((drill) => drill.id === activeDrillId) ?? drills[0],
    [activeDrillId]
  );

  const score = assessment?.score ?? getScore(activeDrill, selectedDecision);
  const isBest = selectedDecision === activeDrill.bestDecision;
  const isUnsafe = selectedDecision
    ? activeDrill.unsafeDecisions.includes(selectedDecision)
    : false;

  const averageScore = useMemo(() => {
    const scores = Object.values(completed);
    if (selectedDecision) {
      const simulated = { ...completed, [activeDrill.id]: score };
      const values = Object.values(simulated);
      return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
    }
    if (!scores.length) return 78;
    return Math.round(scores.reduce((sum, item) => sum + item, 0) / scores.length);
  }, [activeDrill.id, completed, score, selectedDecision]);

  const completedCount = new Set([
    ...Object.keys(completed),
    ...(selectedDecision ? [activeDrill.id] : []),
  ]).size;

  const overTrustRisk =
    selectedDecision && isUnsafe
      ? 2
      : Object.values(completed).filter((item) => item < 50).length || 1;

  async function handleDecision(decision: Decision) {
    setSelectedDecision(decision);
    setAssessment(null);

    const fallbackScore = getScore(activeDrill, decision);

    setCompleted((previous) => ({
      ...previous,
      [activeDrill.id]: fallbackScore,
    }));

    if (backendStatus !== "online") {
      setAssessmentStatus("fallback");
      return;
    }

    try {
      setAssessmentStatus("checking");
      const result = await assessDecision(activeDrill.id, decision);
      setAssessment(result);
      setAssessmentStatus("idle");

      setCompleted((previous) => ({
        ...previous,
        [activeDrill.id]: result.score,
      }));
    } catch {
      setAssessmentStatus("fallback");
    }
  }

  function handleNextDrill() {
    const currentIndex = drills.findIndex((drill) => drill.id === activeDrill.id);
    const next = drills[(currentIndex + 1) % drills.length];
    setActiveDrillId(next.id);
    setSelectedDecision(null);
    setAssessment(null);
    setAssessmentStatus("idle");
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Microsoft Agents League · Reasoning Agents</p>
          <h1>ControlRoom IQ</h1>
          <p className="hero-text">
            A human-in-the-loop flight simulator that trains employees to safely
            supervise AI agents before automation reaches the real world.
          </p>
          <div className="hero-actions">
            <span className="pill">Microsoft Foundry</span>
            <span className="pill">Foundry IQ</span>
            <span className="pill">Synthetic Data Only</span>
            <span className="pill">Responsible AI</span>
            <span className={`pill backend-pill ${backendStatus}`}>
              Backend {backendStatus}
            </span>
          </div>
        </div>

        <div className="hero-card">
          <ShieldCheck size={30} />
          <h2>AI Supervisor Readiness</h2>
          <p>
            Learners must decide when to approve, reject, question, escalate, or
            pause AI recommendations.
          </p>
        </div>
      </section>

      <section className="grid-layout">
        <aside className="panel drill-list">
          <div className="panel-title">
            <Brain size={17} />
            <span>Simulation Drills</span>
          </div>

          {drills.map((drill) => (
            <button
              key={drill.id}
              className={`drill-button ${
                activeDrill.id === drill.id ? "active" : ""
              }`}
              onClick={() => {
                setActiveDrillId(drill.id);
                setSelectedDecision(null);
                setAssessment(null);
                setAssessmentStatus("idle");
              }}
            >
              <span>{drill.id}</span>
              <strong>{drill.title}</strong>
              <small>
                {drill.department} · {drill.severity}
              </small>
              {completed[drill.id] && (
                <em className="mini-score">Score {completed[drill.id]}</em>
              )}
            </button>
          ))}
        </aside>

        <section className="panel main-drill">
          <div className="status-row">
            <span className={`severity ${activeDrill.severity.toLowerCase()}`}>
              {activeDrill.severity} risk
            </span>
            <span>{activeDrill.department} scenario</span>
          </div>

          <h2>{activeDrill.title}</h2>
          <p className="learning-goal">{activeDrill.learningGoal}</p>

          <div className="recommendation-box">
            <div>
              <p className="box-label">Simulated AI Worker Agent</p>
              <h3>{activeDrill.aiAgent}</h3>
            </div>
            <p>{activeDrill.recommendation}</p>
          </div>

          <div className="decision-row">
            {decisions.map((decision) => (
              <button
                key={decision.id}
                className={`decision-button ${
                  selectedDecision === decision.id ? "selected" : ""
                }`}
                onClick={() => handleDecision(decision.id)}
              >
                {decision.icon}
                {decision.label}
              </button>
            ))}
          </div>

          <div
            className={`result-card ${
              selectedDecision ? (isBest ? "good" : isUnsafe ? "danger" : "warn") : ""
            }`}
          >
            <div className="result-heading">
              {selectedDecision ? (
                isBest ? (
                  <CheckCircle2 />
                ) : isUnsafe ? (
                  <CircleSlash />
                ) : (
                  <AlertTriangle />
                )
              ) : (
                <Gauge />
              )}
              <h3>{getResultTitle(activeDrill, selectedDecision)}</h3>
            </div>
            <p>{assessment?.explanation ?? getResultText(activeDrill, selectedDecision)}</p>

            {selectedDecision && (
              <p className="agent-source">
                {assessmentStatus === "checking"
                  ? "Assessment Agent checking backend multi-agent response..."
                  : assessment
                  ? `Scored by backend ${assessment.agent} with ${assessment.risk_critique?.agent ?? "Risk Critic Agent"} and ${assessment.evidence?.agent ?? "Evidence Grounding Agent"}.`
                  : "Using local fallback scoring because backend assessment was unavailable."}
              </p>
            )}

            {selectedDecision && (
              <button className="next-drill-button" onClick={handleNextDrill}>
                Load next drill
              </button>
            )}
          </div>
        </section>

        <aside className="panel evidence-panel">
          <div className="panel-title">
            <FileText size={17} />
            <span>Foundry IQ Evidence</span>
          </div>

          <p className="muted">
            Synthetic policy references retrieved by the Evidence Grounding Agent.
          </p>

          {activeDrill.policyRefs.map((ref) => (
            <div className="evidence-card" key={ref}>
              {ref}
            </div>
          ))}

          {assessment?.evidence && (
            <div className="iq-mode-card">
              <strong>Grounding mode</strong>
              <span>{assessment.evidence.mode}</span>
              <p>{assessment.evidence.summary}</p>
            </div>
          )}

          {assessment?.risk_critique && (
            <div className="risk-flags">
              <strong>Risk Critic flags</strong>
              {assessment.risk_critique.risk_flags.map((flag) => (
                <span key={flag}>{flag}</span>
              ))}
            </div>
          )}
          
          <div className="risk-card">
            <div className="panel-title">
              <Gauge size={17} />
              <span>Assessment Score</span>
            </div>
            <div className="score">{selectedDecision ? score : "--"}</div>
            <p>
              {selectedDecision
                ? activeDrill.managerImpact
                : "Choose a supervision action to receive a score."}
            </p>
          </div>
        </aside>
      </section>

      <section className="panel trace-panel">
        <div className="panel-title">
          <UserCheck size={17} />
          <span>Visible Multi-Agent Reasoning Trace</span>
        </div>

        <div className="trace-grid">
          {agentSteps.map((step, index) => (
            <div className="trace-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel manager-panel">
        <div>
          <p className="eyebrow">Manager Insights Agent</p>
          <h2>Team readiness summary</h2>
          <p>
            Synthetic team data updates as drills are completed. The manager sees
            who over-trusts AI, who asks for evidence, and who escalates correctly
            before agents affect real workflows.
          </p>
        </div>

        <div className="manager-stats">
          <div>
            <strong>{averageScore}%</strong>
            <span>Team readiness</span>
          </div>
          <div>
            <strong>{completedCount}</strong>
            <span>Drills completed</span>
          </div>
          <div>
            <strong>{overTrustRisk}</strong>
            <span>Automation over-trust risk</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;