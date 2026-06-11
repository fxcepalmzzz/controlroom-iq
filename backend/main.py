from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agents.assessment_agent import assess_decision
from agents.manager_insights_agent import build_manager_summary
from agents.scenario_director_agent import get_drills, get_drill_by_id

app = FastAPI(
    title="ControlRoom IQ Backend",
    description="Synthetic multi-agent backend for AI supervisor readiness drills.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "project": "ControlRoom IQ",
        "mode": "synthetic demo",
    }


@app.get("/api/drills")
def list_drills():
    return get_drills()


@app.get("/api/drills/{drill_id}")
def read_drill(drill_id: str):
    return get_drill_by_id(drill_id)


@app.post("/api/assess")
def assess(payload: dict):
    drill_id = payload.get("drill_id")
    decision = payload.get("decision")

    drill = get_drill_by_id(drill_id)
    return assess_decision(drill, decision)


@app.get("/api/manager-summary")
def manager_summary():
    return build_manager_summary()