import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "drills.json"


def get_drills():
    with DATA_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def get_drill_by_id(drill_id: str):
    drills = get_drills()

    for drill in drills:
        if drill["id"] == drill_id:
            return drill

    raise ValueError(f"Drill not found: {drill_id}")