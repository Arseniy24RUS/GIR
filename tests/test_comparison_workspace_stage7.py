from __future__ import annotations

import csv
import io
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from giip.api import app
from giip.comparison_workspace import comparison_workspace_csv, comparison_workspace_payload
from giip.db import connect

ROOT = Path(__file__).resolve().parents[1]


def workspace(**kwargs):
    with connect() as conn:
        return comparison_workspace_payload(conn, 2026, **kwargs)


def test_g20_workspace_has_seven_modules_and_high_coverage() -> None:
    data = workspace(group="G20")
    assert [item["code"] for item in data["indices"]] == ["HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET", "HTEI"]
    assert data["group"]["code"] == "G20"
    assert data["summary"]["country_count"] == 19
    assert data["summary"]["index_count"] == 7
    assert data["summary"]["coverage_rate"] > 0.95
    assert data["summary"]["complete_profiles"] >= 15
    assert data["htei"]["mode"] == "proxy_extended"
    assert data["htei"]["release_year"] == 2026


def test_russia_profile_retains_original_scales_rank_and_years() -> None:
    data = workspace(group="G20")
    russia = next(item for item in data["selected_countries"] if item["iso3"] == "RUS")
    hci = russia["indices"]["HCI_PLUS"]
    htei = russia["indices"]["HTEI"]
    assert hci["score"] == pytest.approx(249.0)
    assert hci["rank"] == 31
    assert hci["universe_count"] == 158
    assert 0 <= hci["percentile"] <= 100
    assert htei["rank"] == 25
    assert htei["universe_count"] == 105
    assert htei["value_year"] == 2026
    assert htei["source_year_min"] <= htei["source_year_max"] <= 2026
    assert htei["value_id"] == "HTEI_V6:proxy_extended:2026:RUS"
    meta = {item["code"]: item for item in data["indices"]}
    assert "0-325" in meta["HCI_PLUS"]["score_scale"]
    assert "0-100" in meta["HTEI"]["score_scale"]


def test_cross_index_profile_uses_percentiles_without_losing_source_values() -> None:
    data = workspace(group="G20")
    for country in data["countries"]:
        for code, cell in country["indices"].items():
            if not cell:
                continue
            assert 0 <= cell["percentile"] <= 100
            assert cell["score"] is not None
            assert cell["value_year"] <= 2026
            assert cell["source_data_year"] <= 2026
            assert cell["value_id"]
    assert data["methodology"]["comparison_scale"] == "percentile_0_100"
    assert "not a new official index" in data["summary"]["diagnostic_mean_note_en"]


def test_pairwise_spearman_matrix_is_symmetric_and_withholds_small_samples() -> None:
    data = workspace(group="G20")
    cells = {(item["x"], item["y"]): item for item in data["correlations"]["cells"]}
    assert len(cells) == 49
    for (x, y), cell in cells.items():
        reverse = cells[(y, x)]
        assert cell["n"] == reverse["n"]
        if cell["coefficient"] is None:
            assert cell["n"] < cell["minimum_n"] or x != y
        else:
            assert cell["coefficient"] == pytest.approx(reverse["coefficient"])
            assert -1 <= cell["coefficient"] <= 1
    assert cells[("HDI", "HDI")]["coefficient"] == pytest.approx(1.0)


def test_scatter_uses_common_country_sample_and_percentile_axes() -> None:
    data = workspace(group="G20", scatter_x="HTEI", scatter_y="GII")
    scatter = data["scatter"]
    assert scatter["scale"] == "percentile_0_100"
    assert scatter["n"] >= 15
    assert scatter["correlation"] is not None
    assert sum(scatter["quadrants"].values()) == scatter["n"]
    russia = next(point for point in scatter["points"] if point["iso3"] == "RUS")
    assert russia["selected"] is True
    assert russia["x_rank"] == 25
    assert 0 <= russia["x"] <= 100
    assert 0 <= russia["y"] <= 100


def test_htei_trend_marks_v6_methodology_break() -> None:
    data = workspace(group="G20", selected="RUS,USA,DEU,KOR,IND", trend_index="HTEI")
    assert data["trend"]["warnings_ru"]
    russia = next(series for series in data["trend"]["series"] if series["iso3"] == "RUS")
    current = next(point for point in russia["points"] if point["segment"] == "current_v6")
    assert current["year"] == 2026
    assert current["comparable_to_previous"] is False
    assert current["rank"] == 25


def test_brics_filter_and_extended_csv_export() -> None:
    data = workspace(group="BRICS")
    assert {item["iso3"] for item in data["countries"]} == {"BRA", "RUS", "IND", "CHN", "ZAF"}
    text = comparison_workspace_csv(data, "ru")
    parsed = list(csv.DictReader(io.StringIO(text)))
    assert len(parsed) == 5
    assert {row["iso3"] for row in parsed} == {"BRA", "RUS", "IND", "CHN", "ZAF"}
    assert "HCI_PLUS_score" in parsed[0]
    assert "HTEI_value_id" in parsed[0]


def test_http_contract_static_assets_and_download_headers() -> None:
    with TestClient(app) as client:
        response = client.get("/api/comparison/workspace?year=2026&group=G20&scatter_x=HTEI&scatter_y=GII")
        assert response.status_code == 200
        assert response.json()["schema_version"] == "comparison-workspace-v1"
        csv_response = client.get("/api/comparison/workspace.csv?year=2026&group=BRICS&lang=en")
        assert csv_response.status_code == 200
        assert "text/csv" in csv_response.headers["content-type"]
        assert "gir-country-comparison-2026.csv" in csv_response.headers["content-disposition"]
        assert client.get("/static/stage7_comparison.js").status_code == 200
        assert client.get("/static/stage7_comparison.css").status_code == 200


def test_htei_v6_provenance_is_available_from_comparison_cells() -> None:
    with TestClient(app) as client:
        profile = client.get("/api/provenance/value/HTEI_V6%3Aproxy_extended%3A2026%3ARUS")
        component = client.get("/api/provenance/value/HTEI_V6%3Aproxy_extended%3A2026%3ARUS%3ATECH_OUTPUTS")
        assert profile.status_code == 200
        assert component.status_code == 200
        profile_data = profile.json()
        component_data = component.json()
        assert profile_data["source_id"] == "HTEI_FINAL_V6"
        assert profile_data["formula_version"]
        assert profile_data["component_value_ids"]
        assert component_data["source_id"]
        assert component_data["raw_snapshot_path"]


def test_frontend_delegates_matrix_route_and_preserves_legacy_selectors() -> None:
    app_js = (ROOT / "giip/static/app.js").read_text(encoding="utf-8")
    stage_js = (ROOT / "giip/static/stage7_comparison.js").read_text(encoding="utf-8")
    stage_css = (ROOT / "giip/static/stage7_comparison.css").read_text(encoding="utf-8")
    html = (ROOT / "giip/static/index.html").read_text(encoding="utf-8")
    assert "window.GIRComparison.render" in app_js
    assert "stage7_comparison.css" in html and "stage7_comparison.js" in html
    for selector in ["matrixGroup", "matrixMetric", "matrixTopN", "matrixSearch", "regionSelect", "incomeSelect"]:
        assert selector in stage_js
    for selector in ["matrix-table", "cell-rank", "table-head-btn", "country-link"]:
        assert selector in stage_js
    assert "/api/cross-matrix.csv" in stage_js
    assert "aria-labelledby" in stage_js and "<desc" in stage_js
    assert "mobileProfileChart" in stage_js and "s7-mobile-chart-note" in stage_js
    assert "s7-mobile-scroll-hint" in stage_js and "s7-mobile-profile-track" in stage_css
    assert "prefers-reduced-motion" in stage_css
