import React, { useMemo, useState } from "react";
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
} from "lucide-react";
import "./App.css";

type Decision = "approve" | "reject" | "evidence" | "escalate" | "pause";

type Drill = {
  id: string;
  title: string;
  department: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  aiAgent: string;
  recommendation: string;
  hiddenRisk: string;
  bestDecision: Decision;
  policyRefs: string[];
  learningGoal: string;
};

const drills: Drill[] = [
  {
    id: "HR-014",
    title: "Promotion List Recommendation",
    department: "HR",
    severity: "Critical",
    aiAgent: "Talent Ranking Agent",
    recommendation:
      "Remove Employee L-1004 from the promotion shortlist due to low predicted leadership fit.",
    hiddenRisk:
      "The recommendation is high-impact, weakly grounded, and may encode bias. The AI has not cited enough role-relevant evidence or human review history.",
    bestDecision: "escalate",
    policyRefs: [
      "HR-AI-Policy §2.1: High-impact employment decisions require human review.",
      "Responsible AI Guide §4.3: Automated recommendations must include evidence and appeal path.",
    ],
    learningGoal:
      "Recognise when an AI recommendation affects employment outcomes and must be escalated.",
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
      "The retrieved policy is stale. The policy changed last quarter for warranty exceptions.",
    bestDecision: "evidence",
    policyRefs: [
      "Support Runbook §3.2: Refund denials require current policy citation.",
      "Grounding Standard §1.4: Stale retrieval must be challenged before action.",
    ],
    learningGoal:
      "Challenge AI recommendations when the source may be outdated or incomplete.",
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
    policyRefs: [
      "Procurement Policy §5.1: Vendors cannot be approved without compliance documents.",
      "AI Tool Use Policy §2.7: Cost-saving recommendations must not bypass governance controls.",
    ],
    learningGoal:
      "Pause automation when a tool tries to skip required approval evidence.",
  },
];

const decisions: { id: Decision; label: string; icon: React.ReactNode }[] = [
  { id: "approve", label: "Approve", icon: <CheckCircle2 size={18} /> },
  { id: "reject", label: "Reject", icon: <XCircle size={18} /> },
  { id: "evidence", label: "Ask for evidence", icon: <FileText size={18} /> },
  { id: "escalate", label: "Escalate", icon: <Siren size={18} /> },
  { id: "pause", label: "Pause automation", icon: <PauseCircle size={18} /> },
];

const agentSteps = [
  "Scenario Director generated a realistic workplace AI supervision drill.",
  "Simulated AI Worker produced a recommendation with realistic failure risk.",
  "Evidence Grounding Agent retrieved synthetic policy references through Foundry IQ.",
  "Risk Critic Agent checked for weak evidence, stale retrieval, bias, privacy, and unsafe automation.",
  "Assessment Agent compared the learner decision against the safe-supervision rubric.",
  "Manager Insights Agent updated team readiness and certification risk.",
];

function App() {
  const [activeDrillId, setActiveDrillId] = useState(drills[0].id);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);

  const activeDrill = useMemo(
    () => drills.find((drill) => drill.id === activeDrillId) ?? drills[0],
    [activeDrillId]
  );

  const isCorrect = selectedDecision === activeDrill.bestDecision;

  const score = selectedDecision
    ? isCorrect
      ? 92
      : selectedDecision === "evidence" || selectedDecision === "pause"
      ? 68
      : 41
    : 0;

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
          </div>
        </div>

        <div className="hero-card">
          <ShieldCheck size={34} />
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
            <Brain size={18} />
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
              }}
            >
              <span>{drill.id}</span>
              <strong>{drill.title}</strong>
              <small>
                {drill.department} · {drill.severity}
              </small>
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
                onClick={() => setSelectedDecision(decision.id)}
              >
                {decision.icon}
                {decision.label}
              </button>
            ))}
          </div>

          {selectedDecision && (
            <div className={`result-card ${isCorrect ? "good" : "warn"}`}>
              <div className="result-heading">
                {isCorrect ? <CheckCircle2 /> : <AlertTriangle />}
                <h3>{isCorrect ? "Strong supervision decision" : "Risk missed"}</h3>
              </div>
              <p>
                Best decision: <strong>{activeDrill.bestDecision}</strong>
              </p>
              <p>{activeDrill.hiddenRisk}</p>
            </div>
          )}
        </section>

        <aside className="panel evidence-panel">
          <div className="panel-title">
            <FileText size={18} />
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

          <div className="risk-card">
            <div className="panel-title">
              <Gauge size={18} />
              <span>Assessment Score</span>
            </div>
            <div className="score">{selectedDecision ? score : "--"}</div>
            <p>
              {selectedDecision
                ? isCorrect
                  ? "Ready for advanced supervision drills."
                  : "Needs more practice on escalation and evidence checks."
                : "Choose a supervision action to receive a score."}
            </p>
          </div>
        </aside>
      </section>

      <section className="panel trace-panel">
        <div className="panel-title">
          <UserCheck size={18} />
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
            Synthetic team data shows 2 learners are ready, 2 need escalation
            practice, and 1 repeatedly approves weakly grounded AI actions.
          </p>
        </div>

        <div className="manager-stats">
          <div>
            <strong>78%</strong>
            <span>Team readiness</span>
          </div>
          <div>
            <strong>3</strong>
            <span>High-risk drills completed</span>
          </div>
          <div>
            <strong>1</strong>
            <span>Automation over-trust risk</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;