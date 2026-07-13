from __future__ import annotations

import csv
import io
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from giip.api import app

ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="module")
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def workspace(client: TestClient, iso3: str = "RUS", mode: str = "proxy_extended") -> dict:
    response = client.get(
        "/api/htei/workspace",
        params={"iso3": iso3, "year": 2026, "mode": mode},
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_russia_mode_catalog_is_explicit_and_falls_back_without_silent_substitution(client: TestClient) -> None:
    payload = workspace(client, mode="common_support")
    assert payload["schema_version"] == "htei-workspace-v1"
    assert payload["requested_mode"] == "common_support"
    assert payload["effective_mode"] == "proxy_extended"
    assert payload["fallback"] == {
        "requested_mode": "common_support",
        "effective_mode": "proxy_extended",
        "reason_ru": "Страна не входит в фиксированную четырёхкомпонентную вселенную основного рейтинга.",
        "reason_en": "The country is outside the fixed four-component universe of the primary ranking.",
    }

    modes = {item["code"]: item for item in payload["mode_catalog"]}
    assert list(modes) == ["direct_core", "common_support", "proxy_extended", "asof_diagnostic"]
    assert modes["direct_core"]["countries"] == 34
    assert modes["common_support"]["countries"] == 89
    assert modes["proxy_extended"]["countries"] == 105
    assert modes["asof_diagnostic"]["countries"] == 203
    assert modes["direct_core"]["available_for_country"] is False
    assert modes["common_support"]["available_for_country"] is False
    assert modes["proxy_extended"]["available_for_country"] is True
    assert modes["asof_diagnostic"]["available_for_country"] is True


def test_russia_proxy_profile_reconciles_score_and_exposes_six_components(client: TestClient) -> None:
    payload = workspace(client)
    profile = payload["profile"]
    components = payload["components"]
    summary = payload["summary"]

    assert profile["score"] == pytest.approx(54.907879, abs=1e-6)
    assert profile["rank"] == 25
    assert payload["ranking_total"] == 105
    assert len(components) == 6
    assert {item["component_code"] for item in components} == {
        "HT_EMPLOYMENT_SHARE",
        "HIGH_TECH_OCCUPATIONS",
        "RND_PERSONNEL",
        "STEM_PIPELINE",
        "TECH_OUTPUTS",
        "CORPORATE_STRATEGY_AND_DEMAND",
    }
    assert sum(float(item["effective_weight"]) for item in components) == pytest.approx(1.0)
    assert sum(float(item["weighted_contribution"]) for item in components) == pytest.approx(profile["score"], abs=1e-5)
    assert summary["score_reconciliation_error"] < 1e-6
    assert summary["strongest_component"]["component_code"] == "HIGH_TECH_OCCUPATIONS"
    assert summary["priority_gap_component"]["component_code"] == "RND_PERSONNEL"
    assert summary["direct_component_count"] == 2
    assert summary["proxy_component_count"] == 3
    assert summary["mixed_component_count"] == 1

    for item in components:
        assert item["name_ru"] and item["name_en"]
        assert item["unit_ru"] and item["unit_en"]
        assert item["source_id"]
        assert item["source_data_year"]
        assert item["raw_snapshot_sha256"]
        assert item["benchmark"]["universe_count"] > 0
        assert item["benchmark"]["rank"] is not None


def test_asof_is_diagnostic_and_never_publishes_an_international_rank(client: TestClient) -> None:
    payload = workspace(client, mode="asof_diagnostic")
    assert payload["effective_mode"] == "asof_diagnostic"
    assert payload["fallback"] is None
    assert payload["ranking_is_synchronous"] is False
    assert payload["ranking_total"] == 203
    assert payload["profile"]["rank"] is None
    assert payload["profile"]["rank_low"] is None
    assert payload["profile"]["rank_high"] is None
    assert all(item["rank"] is None for item in payload["ranking"])


def test_direct_mode_is_available_for_an_eligible_country(client: TestClient) -> None:
    payload = workspace(client, iso3="DNK", mode="direct_core")
    assert payload["effective_mode"] == "direct_core"
    assert payload["fallback"] is None
    assert payload["profile"]["eligible_for_ranking"] == 1
    assert payload["ranking_total"] == 34
    assert len(payload["components"]) == 4
    # The mode is strict because its two labour inputs come from the direct
    # Eurostat high-tech/HRST layer. Component badges still disclose that the
    # conceptual occupation/output measures remain broad or composite proxies.
    assert payload["summary"]["direct_component_count"] == 1
    assert payload["summary"]["proxy_component_count"] == 2
    assert payload["summary"]["mixed_component_count"] == 1


def test_cross_mode_comparisons_are_based_only_on_shared_ranked_countries(client: TestClient) -> None:
    payload = workspace(client)
    comparisons = {(item["left_mode"], item["right_mode"]): item for item in payload["comparisons"]}
    direct = comparisons[("direct_core", "proxy_extended")]
    common = comparisons[("common_support", "proxy_extended")]

    assert direct["n"] == 34
    assert direct["score_pearson"] == pytest.approx(0.905799, abs=1e-6)
    assert direct["rank_spearman"] == pytest.approx(0.877464, abs=1e-6)
    assert common["n"] == 89
    assert common["score_pearson"] == pytest.approx(0.96994, abs=1e-4)
    assert common["rank_spearman"] == pytest.approx(0.970208, abs=1e-6)
    assert all(point["left_rank"] is not None and point["right_rank"] is not None for point in direct["points"])


def test_v6_profile_and_component_provenance_are_resolvable(client: TestClient) -> None:
    payload = workspace(client)
    profile_id = payload["profile"]["value_id"]
    component_id = payload["components"][0]["value_id"]

    profile_response = client.get(f"/api/provenance/value/{profile_id}")
    component_response = client.get(f"/api/provenance/value/{component_id}")
    assert profile_response.status_code == 200
    assert component_response.status_code == 200

    profile = profile_response.json()
    component = component_response.json()
    assert profile["source_id"] == "HTEI_FINAL_V6"
    assert profile["raw_snapshot_sha256"]
    assert profile["mode"] == "proxy_extended"
    assert len(profile["component_value_ids"]) == 6
    assert profile["available_weight"] == pytest.approx(1.0)

    assert component["profile_id"] == profile_id
    assert component["source_id"]
    assert component["raw_snapshot_sha256"]
    assert component["indicator_code"]
    assert component["weighted_contribution"] is not None
    assert component["selection_rule"]


def test_workspace_csv_exports_the_same_ranked_universe(client: TestClient) -> None:
    response = client.get("/api/htei/workspace.csv", params={"mode": "proxy_extended"})
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "htei-proxy_extended-2026.csv" in response.headers["content-disposition"]

    exported = list(csv.DictReader(io.StringIO(response.text)))
    assert len(exported) == 105
    assert exported[0]["rank"] == "1"
    russia = next(item for item in exported if item["iso3"] == "RUS")
    assert russia["rank"] == "25"
    assert float(russia["score"]) == pytest.approx(54.907879)

    asof = client.get("/api/htei/workspace.csv", params={"mode": "asof_diagnostic"})
    assert asof.status_code == 422


def test_workspace_payload_is_compact_and_frontend_assets_are_connected(client: TestClient) -> None:
    response = client.get(
        "/api/htei/workspace",
        params={"iso3": "RUS", "year": 2026, "mode": "proxy_extended"},
    )
    assert response.status_code == 200
    assert len(response.content) < 250_000

    html = client.get("/").text
    assert "/static/htei-workspace.css" in html
    assert "/static/htei-workspace.js" in html

    js = (ROOT / "giip/static/htei-workspace.js").read_text(encoding="utf-8")
    css = (ROOT / "giip/static/htei-workspace.css").read_text(encoding="utf-8")
    app_js = (ROOT / "giip/static/app.js").read_text(encoding="utf-8")
    assert "window.GIRHTEI" in js
    assert "mode_catalog" in js
    assert "data-htei-mode" in js
    assert ".htei-component" in css
    assert ".htei-lineage" in css
    assert "renderHteiWorkspace" in app_js
    assert "/api/htei/workspace" in app_js


def test_unknown_country_is_reported_as_not_found(client: TestClient) -> None:
    response = client.get("/api/htei/workspace", params={"iso3": "ZZZ", "year": 2026})
    assert response.status_code == 404
    assert "Unknown country ZZZ" in json.dumps(response.json())
