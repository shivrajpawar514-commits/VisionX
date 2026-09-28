import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "VisionX" in data["service"]

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "cpu_usage_pct" in data

def test_prometheus_metrics():
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "visionx_system_cpu_usage" in response.text
    assert "visionx_fps_gauge" in response.text

def test_models_benchmarks():
    response = client.get("/api/v1/models/benchmarks")
    assert response.status_code == 200
    benchmarks = response.json()
    assert len(benchmarks) >= 3

def test_analytics_ask():
    response = client.post("/api/v1/analytics/ask", json={"query": "How many vehicles entered?"})
    assert response.status_code == 200
    data = response.json()
    assert "intent" in data
    assert "answer" in data
