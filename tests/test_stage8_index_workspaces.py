from __future__ import annotations

import csv
import io
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from giip.api import app

ROOT = Path(__file__).resolve().parents[1]
CLIENT = TestClient(app)
STANDARD_CODES = ("HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET")


def teardown_module(module) -> None:
    CLIENT.close()


@pytest.mark.parametrize("code", STANDARD_CODES)
def test_standard_index_workspace_contract_is_complete_and_compact(code: str) -> None:
    response = CLIENT.get(f"/api/index/{code}/workspace?year=2026&country=RUS")
    assert response.status_code == 200
    assert len(response.content) < 180_000
    payload = response.json()
    assert payload["schema_version"] == "gir-index-workspace-v1"
    assert payload["index"]["code"] == code
    assert payload["country"]["iso3"] == "RUS"
    assert payload["score"]["score"] is not None
    assert payload["score"]["rank"] is not None
    assert payload["index"]["scale"]["max"] > 0
    assert payload["ranking"]
    assert payload["trend"]
    assert payload["source"]["source_id"]
    assert payload["source"]["source_url"]
    assert payload["formula"]


def test_hci_plus_preserves_methodology_break_and_rounding_reconciliation() -> None:
    payload = CLIENT.get("/api/index/HCI_PLUS/workspace?year=2026&country=RUS").json()
    assert payload["index"]["scale"]["max"] == 325.0
    assert payload["methodology_break"]["break"] is True
    assert "HCI 2010–2020" in payload["methodology_break"]["warning_ru"]
    components = payload["components"]
    assert {item["component_code"] for item in components} == {"HEALTH", "EDUCATION", "EMPLOYMENT"}
    reconciliation = payload["component_insight"]["reconciliation"]
    assert reconciliation["published_component_sum"] == pytest.approx(248.0)
    assert reconciliation["official_total"] == pytest.approx(249.0)
    assert reconciliation["rounding_difference"] == pytest.approx(1.0)


def test_qs_workspace_exposes_country_aggregation_and_institutions() -> None:
    payload = CLIENT.get("/api/index/QS_ET/workspace?year=2026&country=RUS").json()
    assert payload["index"]["official_or_derived"]
    assert payload["qs_summary"]["institution_count"] == 14
    assert payload["qs_summary"]["best_rank"] == 143
    assert len(payload["institutions"]) == 14
    first = payload["institutions"][0]
    assert first["title"] == "Lomonosov Moscow State University"
    assert first["rank"] == 143
    assert first["source_id"] and first["raw_snapshot_sha256"]


def test_platform_context_is_small_and_contains_public_navigation_universe() -> None:
    response = CLIENT.get("/api/platform-context")
    assert response.status_code == 200
    assert len(response.content) < 60_000
    payload = response.json()
    assert payload["schema_version"] == "gir-platform-context-v1"
    assert payload["default_year"] == 2026
    assert len(payload["countries"]) == 225
    assert {item["code"] for item in payload["indices"]} >= set(STANDARD_CODES)
    assert payload["facts"]["scores"] == 10076
    assert payload["facts"]["components"] == 36945


@pytest.mark.parametrize("code", STANDARD_CODES)
def test_workspace_csv_is_utf8_complete_and_has_download_headers(code: str) -> None:
    response = CLIENT.get(f"/api/index/{code}/workspace.csv?year=2026&country=RUS&lang=ru")
    assert response.status_code == 200
    assert response.content.startswith(b"\xef\xbb\xbf")
    assert "text/csv" in response.headers["content-type"]
    assert f"gir-{code.lower()}-2026.csv" in response.headers["content-disposition"]
    rows = list(csv.DictReader(io.StringIO(response.content.decode("utf-8-sig"))))
    assert rows
    assert any(row["iso3"] == "RUS" for row in rows)


def test_standard_index_frontend_is_wired_without_heavy_app_payload() -> None:
    app_js = (ROOT / "giip/static/app.js").read_text(encoding="utf-8")
    module_js = (ROOT / "giip/static/index-workspace.js").read_text(encoding="utf-8")
    module_css = (ROOT / "giip/static/index-workspace.css").read_text(encoding="utf-8")
    html = (ROOT / "giip/static/index.html").read_text(encoding="utf-8")
    assert "renderStandardIndexWorkspace" in app_js
    assert "page === \"country\" || page === \"index-HTEI\" || page === \"acceptance\"" in app_js
    assert "page === \"country\" || page === \"index-HTEI\"" in app_js
    assert "/api/platform-context" in app_js
    assert "/api/index/${encodeURIComponent(selectedCode())}/workspace" in module_js
    assert "/api/index/${encodeURIComponent(idx.code)}/workspace.csv" in module_js
    assert "GIRIndexWorkspace" in module_js
    assert "index-workspace.css" in html and "index-workspace.js" in html
    assert "skip-link" in html and 'tabindex="-1"' in html
    assert "prefers-reduced-motion" in module_css
    assert "aria-label" in module_js and "role=\"region\"" in module_js


def test_release_shell_keeps_strict_script_policy_without_inline_handlers() -> None:
    response = CLIENT.get("/")
    csp = response.headers.get("content-security-policy", "")
    assert "script-src 'self'" in csp
    assert "script-src 'self' 'unsafe-inline'" not in csp
    html = (ROOT / "giip/static/index.html").read_text(encoding="utf-8")
    app_js = (ROOT / "giip/static/app.js").read_text(encoding="utf-8")
    assert " onclick=\"" not in html + app_js
    assert " onkeydown=\"" not in html + app_js
    assert " onerror=\"" not in html + app_js
    assert "data-gir-action" in app_js
