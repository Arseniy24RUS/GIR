from __future__ import annotations

import csv
import io
import json
from pathlib import Path

from fastapi.testclient import TestClient

from giip.api import app

ROOT = Path(__file__).resolve().parents[1]
CLIENT = TestClient(app)


def teardown_module(module) -> None:
    CLIENT.close()


def test_training_workspace_reproduces_official_russia_result() -> None:
    response = CLIENT.get("/api/training/workspace?country=RUS&year=2026")
    assert response.status_code == 200
    payload = response.json()
    assert payload["available"] is True
    assert payload["value_year"] == 2026
    assert payload["summary"]["universe_count"] == 135
    assert payload["score"]["rank"] == 87
    assert abs(payload["score"]["score"] - 41.966909903460184) < 1e-10
    assert [item["code"] for item in payload["blocks"]] == [
        "institutional_environment",
        "educational_infrastructure",
        "corporate_strategies",
        "international_cooperation",
    ]
    contribution = sum(float(item["contribution"]) for item in payload["blocks"])
    assert abs(contribution - payload["score"]["score"]) < 1e-10


def test_training_workspace_discloses_block_specific_universes_and_benchmarks() -> None:
    payload = CLIENT.get("/api/training/workspace?country=RUS&year=2026").json()
    blocks = {item["code"]: item for item in payload["blocks"]}
    assert blocks["institutional_environment"]["universe_count"] == 135
    assert blocks["educational_infrastructure"]["universe_count"] == 133
    assert blocks["corporate_strategies"]["universe_count"] == 122
    assert blocks["international_cooperation"]["universe_count"] == 132
    assert blocks["educational_infrastructure"]["score"] > blocks["international_cooperation"]["score"]
    assert all(block["median"] is not None and block["upper_quartile"] is not None for block in blocks.values())
    groups = {item["code"]: item for item in payload["benchmark_groups"]}
    assert {"TECHNOLOGY_PEERS", "BRICS5", "G20", "OECD", "TOP_QUARTILE", "TOP10"} <= set(groups)
    assert groups["TECHNOLOGY_PEERS"]["country_count"] == 9


def test_training_workspace_exposes_component_evidence_and_method_audit() -> None:
    payload = CLIENT.get("/api/training/workspace?country=RUS&year=2026").json()
    components = [component for block in payload["blocks"] for component in block["components"]]
    assert len(components) == 13
    assert len(payload["sources"]) == 8
    assert all(item["value_id"] and item["source_id"] and item["source_data_year"] for item in components)
    assert all("benchmarks" in item and "ALL" in item["benchmarks"] for item in components)
    audit = payload["audit"]
    assert audit["run_count"] == 200
    assert audit["countries"] == 117
    assert audit["sensitivity_passed"] == 1
    assert audit["min_spearman"] > 0.99


def test_policy_center_contains_complete_evidence_linked_portfolio() -> None:
    response = CLIENT.get("/api/policy/russia/workspace?year=2026")
    assert response.status_code == 200
    payload = response.json()
    assert payload["summary"]["measure_count"] == 8
    assert payload["summary"]["strand_count"] == 4
    assert payload["summary"]["start_year"] == 2026
    assert payload["summary"]["end_year"] == 2030
    assert payload["summary"]["evidence_linked_count"] == 8
    assert len(payload["roadmap"]["items"]) == 8
    assert payload["diagnosis"]["training_model"]["rank"] == 87
    assert payload["diagnosis"]["htei"]["rank"] == 25
    assert payload["diagnosis"]["htei"]["universe_count"] == 105
    for item in payload["items"]:
        assert item["evidence_value_id"]
        assert item["linked_block"]
        assert item["target_kpi_ru"] and item["target_kpi_en"]
        assert 0 <= item["diagnostic_priority"]["score"] <= 100
        assert item["diagnostic_priority"]["level"] in {"critical", "high", "structural"}


def test_policy_center_does_not_claim_implementation_progress() -> None:
    payload = CLIENT.get("/api/policy/russia/workspace?year=2026").json()
    text = json.dumps(payload, ensure_ascii=False).lower()
    assert "progress_percent" not in text
    assert "процент выполнения" not in text
    assert "approved government plan" in payload["roadmap"]["notice_en"].lower()
    assert "не утверждённым государственным планом" in payload["roadmap"]["notice_ru"].lower()


def test_stage4_csv_exports_are_utf8_and_complete() -> None:
    training = CLIENT.get("/api/training/workspace/export.csv?country=RUS&year=2026&lang=ru")
    assert training.status_code == 200
    assert training.content.startswith(b"\xef\xbb\xbf")
    training_rows = list(csv.DictReader(io.StringIO(training.content.decode("utf-8-sig"))))
    assert len(training_rows) == 135
    assert next(row for row in training_rows if row["iso3"] == "RUS")["rank"] == "87"

    policy = CLIENT.get("/api/policy/russia/export.csv?year=2026&lang=en")
    assert policy.status_code == 200
    policy_rows = list(csv.DictReader(io.StringIO(policy.content.decode("utf-8-sig"))))
    assert len(policy_rows) == 8
    assert {row["item_id"] for row in policy_rows} == {
        "RUS-HTEI-01", "RUS-HTEI-02", "RUS-HTEI-03", "RUS-HTEI-04",
        "RUS-HTEI-05", "RUS-HTEI-06", "RUS-SYSTEM-07", "RUS-QS-08",
    }


def test_stage4_aggregate_provenance_is_available() -> None:
    for value_id, source_id, component_count in [
        ("TRAINING_SYSTEM:RUS:2026:score", "TRAINING_SYSTEM_MODEL", 13),
        ("HTEI_V6:proxy_extended:2026:RUS", "HTEI_FINAL_V6", 6),
    ]:
        response = CLIENT.get(f"/api/provenance/value/{value_id}")
        assert response.status_code == 200
        payload = response.json()
        assert payload["source_id"] == source_id
        assert len(payload["component_value_ids"]) == component_count
        assert payload["formula_version"]


def test_stage4_public_assets_and_navigation_contract() -> None:
    html = CLIENT.get("/").text
    app_js = (ROOT / "giip/static/app.js").read_text(encoding="utf-8")
    stage_js = (ROOT / "giip/static/stage4.js").read_text(encoding="utf-8")
    stage_css = (ROOT / "giip/static/stage4.css").read_text(encoding="utf-8")
    assert "/static/stage4.css" in html
    assert "/static/stage4.js" in html
    assert '"policy-center"' in app_js
    assert 'policyCenter: "Рекомендации России"' in app_js
    assert "renderTraining" in stage_js and "renderPolicy" in stage_js
    assert "Data Explorer" not in stage_js
    assert ".s4-roadmap" in stage_css
    assert ".s4-block-grid" in stage_css
    assert ".s4-action-card" in stage_css
    assert (ROOT / "giip/static/icons/download.svg").exists()


def test_policy_public_russian_copy_avoids_release_facing_internal_codes() -> None:
    payload = CLIENT.get("/api/policy/russia/workspace?year=2026").json()
    visible_fields = (
        "title_ru", "problem_ru", "indicator_ru", "measure_ru", "actor_ru",
        "target_kpi_ru", "benchmark_ru", "expected_effect_ru", "risk_ru",
        "resources_ru", "monitoring_ru",
    )
    text = "\n".join(
        str(item.get(field) or "")
        for item in payload["items"]
        for field in visible_fields
    ).lower()
    banned = (
        "high-tech/kis", "training_model", "qs_et", "r&d-центры",
        "среднее top-10", "qs engineering & technology",
    )
    assert not [term for term in banned if term in text]
    assert "индекса технологической занятости (htei)" in text
    assert "рейтинге qs по инженерным и технологическим направлениям" in text
