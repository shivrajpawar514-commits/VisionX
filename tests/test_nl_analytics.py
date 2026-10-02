import pytest
from src.analytics.nl_analytics import nl_engine

def test_nl_safety_violation_query():
    res = nl_engine.process_query("What PPE safety violations occurred today?")
    assert res["intent"] == "safety_violation_lookup"
    assert "safety" in res["answer"].lower() or "ppe" in res["answer"].lower()
    assert res["confidence"] >= 0.9

def test_nl_vehicle_count_query():
    res = nl_engine.process_query("How many vehicles entered through the main gate?")
    assert res["intent"] == "vehicle_traffic_count"
    assert "vehicles" in res["answer"].lower() or "cars" in res["answer"].lower()
    assert res["result_count"] > 0

def test_nl_speed_query():
    res = nl_engine.process_query("Did any vehicle exceed the speed limit?")
    assert res["intent"] == "vehicle_speed_audit"
    assert "speed" in res["answer"].lower()
