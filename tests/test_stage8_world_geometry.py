from __future__ import annotations

import json
from pathlib import Path

from fastapi.testclient import TestClient

from giip.api import app

ROOT = Path(__file__).resolve().parents[1]


def test_lite_geometry_preserves_country_features_and_reduces_payload() -> None:
    source = ROOT / "giip/static/world_countries.geojson"
    lite = ROOT / "giip/static/world_countries_lite.geojson"
    source_data = json.loads(source.read_text(encoding="utf-8"))
    lite_data = json.loads(lite.read_text(encoding="utf-8"))
    assert len(source_data["features"]) == len(lite_data["features"]) == 242
    assert lite.stat().st_size < source.stat().st_size * 0.3
    source_ids = {item["properties"].get("iso3") for item in source_data["features"]}
    lite_ids = {item["properties"].get("iso3") for item in lite_data["features"]}
    assert source_ids == lite_ids
    assert lite_data["metadata"]["purpose"].startswith("interactive dashboard")


def test_public_world_route_serves_the_dashboard_derivative() -> None:
    with TestClient(app) as client:
        response = client.get("/world.geojson")
        assert response.status_code == 200
        assert response.headers["x-gir-geometry"] == "simplified-dashboard-derivative"
        assert len(response.content) < 1_000_000
        assert len(response.json()["features"]) == 242
