from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from fastapi.testclient import TestClient

from giip.api import app, cached_app_data
from giip.db import connect, migrate_schema
from giip.scientific_release import apply_scientific_release, _populate_license_registry
from giip.final_release_v6 import apply_offline_finalization

ROOT = Path(__file__).resolve().parents[1]




_CLIENT = TestClient(app)

def client() -> TestClient:
    return _CLIENT


def teardown_module(module) -> None:
    _CLIENT.close()


def test_country_profile_retains_all_indices_and_real_provenance() -> None:
    data = client().get("/api/country/RUS/profile?year=2026").json()
    by_code = {item["index_code"]: item for item in data["indices"]}
    assert {"HTEI", "QS_ET", "HDI", "GTCI", "GII", "IDI"} <= set(by_code)
    assert ("HCI_PLUS" in by_code) or ("HCI" in by_code)
    assert by_code["QS_ET"]["available"] is True
    assert by_code["QS_ET"]["value_year"] == 2026
    assert by_code["HDI"]["provenance"]["raw_snapshot_sha256"]


def test_historical_asof_and_value_provenance_contracts_survive_v5() -> None:
    c = client()
    app_data = c.get("/api/app-data?country=RUS&year=2026").json()
    assert 1990 in app_data["years"]
    assert 2026 in app_data["years"]
    hdi = next(item for item in app_data["country"]["indices"] if item["index_code"] == "HDI")
    assert hdi["requested_year"] == 2026
    assert hdi["value_year"] == 2023
    provenance = c.get(f"/api/provenance/value/{hdi['value_id']}").json()
    assert provenance["source_id"] == "UNDP_HDR"
    assert provenance["raw_snapshot_sha256"]


def test_country_metadata_and_server_side_matrix_sorting_are_retained() -> None:
    c = client()
    countries = c.get("/api/countries").json()
    assert countries
    assert not any(country["region"] == "Global" for country in countries)
    assert sum(country["income_group"] == "Not classified" for country in countries) <= 5
    response = c.get(
        "/api/cross-matrix?year=2026&region=Europe&topN=10&sort_index=HTEI&sort_metric=rank&sort_dir=asc"
    )
    assert response.status_code == 200
    matrix = response.json()
    assert matrix["countries"]
    ranks = [row["indices"]["HTEI"]["rank"] for row in matrix["countries"] if row["indices"].get("HTEI")]
    assert ranks == sorted(ranks)
    assert len(matrix["countries"]) <= 10


def test_existing_training_qs_and_gtci_contracts_are_retained() -> None:
    c = client()
    gtci = c.get("/api/index/GTCI?country=RUS&year=2026").json()
    assert len(gtci["country_diagnostics"]["components"]) == 6
    qs = c.get("/api/qs/RUS?year=2026").json()
    assert qs["institutions"]
    assert qs["summary"]["country_score"] is not None
    training = c.get("/api/training-competitiveness?country=RUS&year=2026").json()
    assert len(training["blocks"]) >= 4
    assert training["source_group_coverage"]


def test_v3_observation_staging_remains_auditable_beneath_v5() -> None:
    with connect() as conn:
        observed = conn.execute(
            "SELECT COUNT(*) n FROM source_observations WHERE index_code='HTEI'"
        ).fetchone()["n"]
        selected = conn.execute(
            "SELECT COUNT(*) n FROM source_observations WHERE index_code='HTEI' AND selected=1"
        ).fetchone()["n"]
        sources = {
            row["source_id"]
            for row in conn.execute(
                "SELECT DISTINCT source_id FROM source_observations WHERE index_code='HTEI'"
            )
        }
    assert observed > selected > 0
    assert {"ILOSTAT_HTEI", "OECD_HTEI", "EUROSTAT_HTEC"} <= sources


def test_legacy_htei_explainer_route_is_upgraded_to_v6_semantics() -> None:
    c = client()
    legacy = c.get("/api/index/HTEI/explainer?iso3=RUS&year=2026&mode=asof")
    assert legacy.status_code == 200
    assert legacy.json()["ranking_mode"] == "PROXY_EXTENDED"
    assert legacy.json()["formula"]["formula_version"] == "htei-v6-common-support-2026"
    scientific = c.get("/api/htei/v5/profile/RUS?mode=asof_diagnostic").json()
    assert scientific["profile"]["rank"] is None
    assert scientific["profile"]["formula_version"] == "htei-v5-scientific-2026"


def test_current_gir_shell_and_cache_bust_are_preserved() -> None:
    html = client().get("/").content.decode("utf-8")
    assert "GIR — Глобальный рейтинг индексов" in html
    assert 'data-sidebar="expanded"' in html
    assert "gir-unified-s1-s6-20260712-1" in html
    js = (ROOT / "giip" / "static" / "app.js").read_text(encoding="utf-8")
    css = (ROOT / "giip" / "static" / "styles.css").read_text(encoding="utf-8")
    assert 'data-scale-mode="quantile"' in js
    assert 'src="/static/flags/' in js
    assert "--country-flag" in css
    assert "--map-bin-7" in css
    assert "width: 400px" in css


def test_windows_launcher_survives_v6_patch() -> None:
    launcher = (ROOT / "open_platform.cmd").read_text(encoding="utf-8")
    assert "'giip.cli'" in launcher
    assert "'runserver'" in launcher
    assert "/api/health" in launcher
    assert "start \"\"" in launcher


def test_windows_redirected_validator_output_is_utf8_safe() -> None:
    environment = os.environ.copy()
    environment["PYTHONIOENCODING"] = "cp1252"
    result = subprocess.run(
        [sys.executable, "scripts/validate_scientific_release_candidate.py"],
        cwd=ROOT,
        env=environment,
        capture_output=True,
        check=False,
    )
    assert result.returncode == 0, result.stderr.decode("utf-8", errors="replace")
    assert "customer_release_ready" in result.stdout.decode("utf-8")


def test_scientific_refresh_preserves_existing_legal_review_decision() -> None:
    source_id = "HTEI_SCIENTIFIC_V5"
    with connect() as conn:
        conn.execute(
            """UPDATE license_registry
               SET storage_allowed=1,
                   transformation_allowed=1,
                   redistribution_allowed=1,
                   release_archive_decision='include',
                   review_status='approved',
                   reviewer_name='Independent legal reviewer',
                   reviewed_at='2026-07-10T00:00:00+00:00',
                   evidence_path='audit_evidence/legal/htei-v5-review.pdf'
               WHERE source_id=?""",
            (source_id,),
        )
        conn.commit()
        # Exercise the exact registry refresh responsible for preserving a reviewed
        # decision. Rebuilding every scientific table is unnecessary in this
        # regression test and can contend with ASGI test clients in a full suite.
        _populate_license_registry(conn)
        conn.commit()
        row = conn.execute(
            """SELECT storage_allowed,transformation_allowed,redistribution_allowed,
                      release_archive_decision,review_status,reviewer_name,reviewed_at,evidence_path
               FROM license_registry WHERE source_id=?""",
            (source_id,),
        ).fetchone()

    assert row is not None
    assert tuple(row) == (
        1,
        1,
        1,
        "include",
        "approved",
        "Independent legal reviewer",
        "2026-07-10T00:00:00+00:00",
        "audit_evidence/legal/htei-v5-review.pdf",
    )
    # Restore the final layer because the whole test session shares one isolated DB.
    apply_offline_finalization()
