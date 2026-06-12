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

type BackendGeneratedDrill = BackendDrill;

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

  if (drill.id.startsWith("CS") || drill.id.startsWith("CX")) {
    return "Challenge customer-impacting automation when the source may be outdated, incomplete, or unfair.";
  }

  if (drill.id.startsWith("PROC")) {
    return "Pause automation when a tool tries to skip required vendor approval evidence.";
  }

  if (drill.id.startsWith("IT")) {
    return "Ask for contextual evidence before changing access or identity controls.";
  }

  if (drill.id.startsWith("PRIV") || drill.id.startsWith("DATA")) {
    return "Stop AI recommendations that misuse personal, sensitive, expired, or unnecessary data.";
  }

  if (drill.id.startsWith("FIN")) {
    return "Pause financial automation when fraud-control or payment evidence is missing.";
  }

  if (drill.id.startsWith("SEC")) {
    return "Challenge security automation when new evidence changes the risk profile.";
  }

  if (drill.id.startsWith("LEGAL")) {
    return "Escalate legal-risk recommendations instead of relying on AI similarity matching.";
  }

  if (drill.id.startsWith("COMP")) {
    return "Ask for validation evidence before closing compliance or audit findings.";
  }

  if (drill.id.startsWith("OPS")) {
    return "Reject AI recommendations that trade safety for operational efficiency.";
  }

  if (drill.id.startsWith("MKT")) {
    return "Reject or escalate targeting decisions that rely on sensitive inferred attributes.";
  }

  if (drill.id.startsWith("ENG")) {
    return "Pause production changes when critical release evidence is missing.";
  }

  if (drill.id.startsWith("TRAIN")) {
    return "Ask for assessment evidence before marking a learner as certification-ready.";
  }

  return "Decide whether the AI recommendation is safe enough to approve.";
}

function buildManagerImpact(drill: BackendDrill) {
  if (drill.id.startsWith("HR")) {
    return "Flags HR reviewers who over-trust AI ranking systems during high-impact decisions.";
  }

  if (drill.id.startsWith("CS") || drill.id.startsWith("CX")) {
    return "Identifies support leads who need more practice challenging stale or unfair customer automation.";
  }

  if (drill.id.startsWith("PROC")) {
    return "Shows procurement teams whether they can stop unsafe automation under pressure.";
  }

  if (drill.id.startsWith("IT")) {
    return "Highlights whether IT reviewers check business context before approving access changes.";
  }

  if (drill.id.startsWith("PRIV") || drill.id.startsWith("DATA")) {
    return "Flags teams that need stronger data minimisation and privacy supervision habits.";
  }

  if (drill.id.startsWith("FIN")) {
    return "Shows whether finance reviewers catch missing payment-control evidence.";
  }

  if (drill.id.startsWith("SEC")) {
    return "Highlights SOC reviewers who suppress alerts without checking changed evidence.";
  }

  if (drill.id.startsWith("LEGAL")) {
    return "Flags legal-risk scenarios where reviewers over-trust AI similarity matching.";
  }

  if (drill.id.startsWith("COMP")) {
    return "Shows whether compliance reviewers require validation evidence before closure.";
  }

  if (drill.id.startsWith("OPS")) {
    return "Flags operations teams that prioritise productivity over safety constraints.";
  }

  if (drill.id.startsWith("MKT")) {
    return "Identifies marketing workflows that need stronger consent and fairness checks.";
  }

  if (drill.id.startsWith("ENG")) {
    return "Shows whether engineering reviewers pause risky production changes.";
  }

  if (drill.id.startsWith("TRAIN")) {
    return "Shows whether learning managers separate completion from real readiness.";
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

function mapFrontendDrillToBackend(drill: Drill): BackendDrill {
  return {
    id: drill.id,
    title: drill.title,
    department: drill.department,
    severity: drill.severity,
    ai_agent: drill.aiAgent,
    recommendation: drill.recommendation,
    hidden_risk: drill.hiddenRisk,
    best_decision: drill.bestDecision,
    acceptable_decisions: drill.acceptableDecisions,
    unsafe_decisions: drill.unsafeDecisions,
    policy_refs: drill.policyRefs,
    supervisor_lesson: drill.supervisorLesson,
  };
}
export async function generateDrill(existingIds: string[]): Promise<Drill> {
  const response = await fetch(`${API_BASE}/api/generate-drill`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      existing_ids: existingIds,
    }),
  });

  if (!response.ok) {
    throw new Error(`Drill generation failed with ${response.status}`);
  }

  const data = (await response.json()) as BackendGeneratedDrill;
  return mapBackendDrill(data);
}

  export async function assessDecision(
    drillId: string,
    decision: Decision,
    drill?: Drill
  ): Promise<AssessmentResult> {
    const response = await fetch(`${API_BASE}/api/assess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        drill_id: drillId,
        decision,
        drill: drill ? mapFrontendDrillToBackend(drill) : undefined,
      }),
    });

  return response.json();
}
