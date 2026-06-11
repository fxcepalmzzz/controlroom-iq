# ControlRoom IQ

**Human-in-the-loop flight simulator for AI supervisors.**

ControlRoom IQ is a Microsoft Agents League Reasoning Agents project that trains employees to safely supervise AI agents before automation reaches the real world.

Instead of building another static certification planner, ControlRoom IQ puts learners inside realistic AI control-room drills. Each drill presents an AI agent recommendation, supporting policy evidence, hidden risks, and a required human decision: approve, reject, ask for evidence, escalate, or pause automation.

## Why this matters

Enterprise AI is no longer just answering questions. Agents are beginning to recommend actions, trigger workflows, draft decisions, and automate business processes.

The missing skill is not only building agents. It is knowing when humans should stop them.

ControlRoom IQ helps organisations train people for safe AI supervision before agents affect real workflows.

## Demo scenario

A simulated workplace AI agent recommends:

> Remove Employee L-1004 from the promotion shortlist due to low predicted leadership fit.

The learner must decide whether to approve, reject, ask for evidence, escalate, or pause the recommendation.

ControlRoom IQ then scores the decision, explains the hidden risk, retrieves grounded policy evidence, and shows the multi-agent reasoning trace.

## Core features

* Interactive AI supervision drills
* Multi-agent reasoning trace
* Microsoft Foundry IQ evidence grounding
* Local synthetic evidence fallback
* Safe / unsafe decision scoring
* Manager readiness dashboard
* Backend online/offline fallback mode
* Synthetic data only
* Human-in-the-loop safety design

## Multi-agent architecture

ControlRoom IQ uses a multi-agent supervision workflow:

1. **Scenario Director Agent** loads realistic workplace AI supervision drills.
2. **Simulated AI Worker Agent** produces the AI recommendation the learner must supervise.
3. **Evidence Grounding Agent** retrieves policy evidence from a Microsoft Foundry agent connected to a Foundry IQ knowledge base. If Foundry is unavailable, it falls back to local synthetic policy references.
4. **Risk Critic Agent** checks for weak evidence, stale retrieval, bias, privacy leakage, high-impact decisions, and unsafe automation.
5. **Assessment Agent** scores the learner decision against a safe-supervision rubric.
6. **Manager Insights Agent** updates team readiness, over-trust risk, and recommended next drills.

## Microsoft Foundry IQ Integration

ControlRoom IQ integrates with Microsoft Foundry and Foundry IQ for grounded policy evidence.

The live integration path uses:

* **Microsoft Foundry project:** `controlroom-iq`
* **Model deployment:** `gpt-4.1-mini`
* **Foundry IQ resource:** `controlroom-iq-knowledge`
* **Foundry IQ knowledge base:** `controlroom-iq-supervision-kb`
* **Foundry agent:** `controlroom-iq-evidence-agent`
* **Synthetic knowledge source:** `controlroom-iq-policy-kb`

The uploaded knowledge source contains only synthetic markdown documents created for this hackathon demo. It does not contain real employee data, customer data, credentials, confidential information, or PII.

When a learner makes a supervision decision, the backend calls:

```text
POST /api/assess
```

The request flows through the multi-agent orchestration layer:

```text
User decision
→ ControlRoom IQ Orchestrator
→ Evidence Grounding Agent
→ Microsoft Foundry agent connected to Foundry IQ
→ Risk Critic Agent
→ Assessment Agent
→ Frontend orchestration trace
```

When Foundry is configured in `.env`, the Evidence Grounding Agent calls the Microsoft Foundry agent. The Foundry agent retrieves evidence from the Foundry IQ knowledge base and returns source document references such as:

```text
human-approval-thresholds.md
responsible-ai-supervision-guide.md
```

If Foundry credentials, local Azure authentication, or the Foundry endpoint are unavailable, the backend safely falls back to local synthetic policy references so the demo remains reliable.

This means the project is demoable both with and without a live Azure session, while still showing a real Microsoft Foundry IQ integration path when configured.

## Environment Configuration

Create a local `.env` file from `.env.example`.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000

CONTROLROOM_IQ_ENV=local
CONTROLROOM_IQ_DATA_MODE=synthetic
CONTROLROOM_IQ_BACKEND_HOST=127.0.0.1
CONTROLROOM_IQ_BACKEND_PORT=8000

AZURE_AI_PROJECT_ENDPOINT=
AZURE_AI_MODEL_DEPLOYMENT=gpt-4.1-mini
FOUNDRY_IQ_KNOWLEDGE_BASE=
FOUNDRY_AGENT_NAME=

USE_SYNTHETIC_DATA=true
ALLOW_REAL_ENTERPRISE_DATA=false
ALLOW_AUTONOMOUS_ACTIONS=false
```

Do not commit `.env`.

For local Foundry authentication, install Azure CLI and run:

```powershell
az login
```

The backend uses `DefaultAzureCredential` through the Microsoft Foundry SDK. If Azure authentication is not available, the app falls back to local synthetic evidence.

## Foundry Smoke Tests

The backend includes two optional smoke tests for the Foundry integration.

```powershell
cd backend
.venv\Scripts\activate

python test_foundry_connection.py
python test_foundry_agent.py
```

`test_foundry_connection.py` verifies that the backend can authenticate to the Microsoft Foundry project.

`test_foundry_agent.py` verifies that the Foundry agent can retrieve grounded evidence from the Foundry IQ knowledge base. A successful response should reference the synthetic source documents.

## Tech stack

Frontend:

* React
* TypeScript
* Vite
* CSS
* lucide-react

Backend:

* Python
* FastAPI
* Microsoft Foundry SDK
* Azure Identity
* Synthetic JSON drills
* Synthetic markdown knowledge documents
* Microsoft Foundry IQ knowledge base

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
│  ├─ test_foundry_connection.py
│  ├─ test_foundry_agent.py
│  ├─ agents/
│  ├─ data/
│  └─ knowledge/
├─ docs/
│  ├─ architecture.md
│  └─ safety.md
├─ .env.example
└─ README.md
```

## Run locally

Backend:

```powershell
cd backend
.venv\Scripts\activate
uvicorn main:app --reload
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Local URLs:

```text
Frontend: http://localhost:5173
Backend: http://127.0.0.1:8000
FastAPI docs: http://127.0.0.1:8000/docs
```

## Safety and data handling

ControlRoom IQ uses synthetic data only.

The project does not use:

* real employee data
* real customer data
* real HR records
* credentials
* confidential company documents
* PII
* autonomous actions against real systems

The simulator is designed to train human supervision decisions, not to make real workplace decisions.

## Hackathon positioning

ControlRoom IQ fits the Reasoning Agents track because it demonstrates:

* multi-agent orchestration
* grounded evidence retrieval with Microsoft Foundry IQ
* critic / verifier reasoning
* human-in-the-loop decision making
* safe fallback behaviour
* synthetic-only demo data
* a polished interactive user experience

The core idea:

> The missing enterprise skill is not only building AI agents. It is knowing when humans should stop them.
