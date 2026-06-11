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

export type GroundedReference = {
  source: string;
  excerpt: string;
  confidence: string;
  grounding_mode: string;
};

export type EvidenceResult = {
  agent: string;
  mode: string;
  foundry_iq_configured: boolean;
  query: string;
  summary: string;
  grounded_references: GroundedReference[];
  foundry_iq: {
    configured: boolean;
    mode: string;
    reason: string;
    query: string;
    answer?: string | null;
    citations: string[];
    raw_response: unknown;
  };
};

export type RiskCritique = {
  agent: string;
  risk_level: string;
  primary_risk: string;
  risk_flags: string[];
  recommended_supervisor_action: Decision;
};
export type OrchestrationStep = {
  step: number;
  agent: string;
  purpose: string;
  mode?: string;
  risk_level?: string;
  verdict?: string;
};

export type OrchestrationTrace = {
  agent: string;
  pattern: string;
  steps: OrchestrationStep[];
  human_in_the_loop: boolean;
  synthetic_data_only: boolean;
  microsoft_iq_layer: string;
};

export type AssessmentResult = {
  drill_id: string;
  decision: Decision;
  best_decision: Decision;
  score: number;
  verdict: string;
  explanation: string;
  policy_refs: string[];
  evidence?: EvidenceResult;
  risk_critique?: RiskCritique;
  orchestration?: OrchestrationTrace;
  agent: string;
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

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

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

export async function assessDecision(
  drillId: string,
  decision: Decision
): Promise<AssessmentResult> {
  const response = await fetch(`${API_BASE}/api/assess`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      drill_id: drillId,
      decision,
    }),
  });

  if (!response.ok) {
    throw new Error(`Assessment failed with ${response.status}`);
  }

  return response.json();
}