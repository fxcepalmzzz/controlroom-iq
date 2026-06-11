export type Decision = "approve" | "reject" | "evidence" | "escalate" | "pause";

export type Drill = {
  id: string;
  title: string;
  department: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  aiAgent: string;
  recommendation: string;
  hiddenRisk: string;
  bestDecision: Decision;
  acceptableDecisions: Decision[];
  unsafeDecisions: Decision[];
  policyRefs: string[];
  learningGoal: string;
  supervisorLesson: string;
  managerImpact: string;
};

type BackendDrill = {
  id: string;
  title: string;
  department: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  ai_agent: string;
  recommendation: string;
  hidden_risk: string;
  best_decision: Decision;
  acceptable_decisions: Decision[];
  unsafe_decisions: Decision[];
  policy_refs: string[];
  supervisor_lesson: string;
};

const API_BASE = "http://127.0.0.1:8000";

function mapBackendDrill(drill: BackendDrill): Drill {
  return {
    id: drill.id,
    title: drill.title,
    department: drill.department,
    severity: drill.severity,
    aiAgent: drill.ai_agent,
    recommendation: drill.recommendation,
    hiddenRisk: drill.hidden_risk,
    bestDecision: drill.best_decision,
    acceptableDecisions: drill.acceptable_decisions,
    unsafeDecisions: drill.unsafe_decisions,
    policyRefs: drill.policy_refs,
    supervisorLesson: drill.supervisor_lesson,
    learningGoal: buildLearningGoal(drill),
    managerImpact: buildManagerImpact(drill),
  };
}

function buildLearningGoal(drill: BackendDrill) {
  if (drill.id.startsWith("HR")) {
    return "Recognise when an AI recommendation affects employment outcomes and must be escalated.";
  }

  if (drill.id.startsWith("CS")) {
    return "Challenge AI recommendations when the source may be outdated or incomplete.";
  }

  if (drill.id.startsWith("PROC")) {
    return "Pause automation when a tool tries to skip required approval evidence.";
  }

  return "Decide whether the AI recommendation is safe enough to approve.";
}

function buildManagerImpact(drill: BackendDrill) {
  if (drill.id.startsWith("HR")) {
    return "Flags HR reviewers who over-trust AI ranking systems during high-impact decisions.";
  }

  if (drill.id.startsWith("CS")) {
    return "Identifies support leads who need more practice challenging stale retrieval.";
  }

  if (drill.id.startsWith("PROC")) {
    return "Shows procurement teams whether they can stop unsafe automation under pressure.";
  }

  return "Updates team readiness based on the learner's supervision decision.";
}

export async function fetchBackendDrills(): Promise<Drill[]> {
  const response = await fetch(`${API_BASE}/api/drills`);

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }

  const data = (await response.json()) as BackendDrill[];
  return data.map(mapBackendDrill);
}

export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE}/`);

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }

  return response.json();
}