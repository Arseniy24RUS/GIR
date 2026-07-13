from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from giip.api import app

ROOT = Path(__file__).resolve().parents[1]
CLIENT = TestClient(app)


def teardown_module(module) -> None:
    CLIENT.close()


def workspace(iso3: str = "RUS", year: int = 2026) -> dict:
    response = CLIENT.get(f"/api/country/{iso3}/workspace", params={"year": year})
    assert response.status_code == 200, response.text
    return response.json()


def test_country_workspace_exposes_seven_distinct_modules() -> None:
    payload = workspace()
    assert payload["schema_version"] == "country-workspace-v2"
    assert payload["country"]["iso3"] == "RUS"
    assert [item["index_code"] for item in payload["indices"]] == [
        "HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET", "HTEI"
    ]
    assert len(payload["indices"]) == 7
    assert all(item["available"] for item in payload["indices"])
    assert "tz_summary" not in payload


def test_scales_ranks_and_htei_uncertainty_are_explicit() -> None:
    cards = {item["index_code"]: item for item in workspace()["indices"]}
    assert cards["HCI_PLUS"]["score"] == 249.0
    assert cards["HCI_PLUS"]["scale"]["max"] == 325
    assert cards["HCI_PLUS"]["rank"] == 31
    assert cards["HCI_PLUS"]["universe"] == 158
    assert cards["HDI"]["scale"]["max"] == 100
    assert cards["HTEI"]["mode"] == "proxy_extended"
    assert cards["HTEI"]["rank"] == 25
    assert cards["HTEI"]["universe"] == 105
    assert cards["HTEI"]["score_low"] < cards["HTEI"]["score"] < cards["HTEI"]["score_high"]
    assert cards["HTEI"]["rank_low"] <= cards["HTEI"]["rank"] <= cards["HTEI"]["rank_high"]


def test_peer_groups_use_human_readable_countries_and_percentile_benchmarks() -> None:
    payload = workspace()
    groups = {item["code"]: item for item in payload["benchmark_groups"]}
    assert groups["RUSSIA_CORE"]["label_ru"] == "Технологические сопоставления"
    assert groups["RUSSIA_CORE"]["label_en"] == "Technology peers"
    assert {country["iso3"] for country in groups["RUSSIA_CORE"]["countries"]} == {
        "RUS", "CHN", "IND", "DEU", "KOR", "SGP", "USA"
    }
    assert all(country["name_ru"] and country["name_en"] for country in groups["OECD"]["countries"])
    hci = next(item for item in payload["indices"] if item["index_code"] == "HCI_PLUS")
    benchmark = hci["peer_benchmarks"]["RUSSIA_CORE"]
    assert benchmark["country_count"] >= 5
    assert 0 <= benchmark["percentile_mean"] <= 100
    assert benchmark["gap"] is not None


def test_htei_components_have_public_labels_units_and_benchmarks() -> None:
    htei = next(item for item in workspace()["indices"] if item["index_code"] == "HTEI")
    assert len(htei["components"]) == 6
    by_code = {item["component_code"]: item for item in htei["components"]}
    assert by_code["RND_PERSONNEL"]["unit_public"]["label_ru"] == "персонала НИОКР на 1 млн жителей"
    assert by_code["STEM_PIPELINE"]["unit_public"]["label_en"] == "% of tertiary graduates"
    assert by_code["TECH_OUTPUTS"]["public_name_ru"] == "Технологические результаты экономики"
    assert by_code["CORPORATE_STRATEGY_AND_DEMAND"]["unit_public"]["label_en"] == "% of gross domestic expenditure on R&D"
    assert all("RUSSIA_CORE" in item["benchmarks"] for item in htei["components"])


def test_russia_workspace_publishes_all_eight_actions_with_correct_english_records() -> None:
    policies = workspace()["policies"]
    assert len(policies) == 8
    by_id = {item["item_id"]: item for item in policies}
    assert by_id["RUS-HTEI-05"]["title_en"] == "Link workforce policy to measurable technology outcomes"
    assert by_id["RUS-HTEI-06"]["title_en"] == "Build a quantitative corporate layer for technology workforce demand"
    assert by_id["RUS-SYSTEM-07"]["indicator_en"].endswith("international cooperation block")
    assert by_id["RUS-QS-08"]["title_en"].startswith("Increase the international visibility")
    assert all(item["title_ru"] and item["measure_ru"] and item["horizon"] for item in policies)


def test_htei_v6_profile_and_component_provenance_are_publicly_resolved() -> None:
    for value_id in (
        "HTEI_V6:proxy_extended:2026:RUS",
        "HTEI_V6:proxy_extended:2026:RUS:TECH_OUTPUTS",
    ):
        response = CLIENT.get(f"/api/provenance/value/{value_id}")
        assert response.status_code == 200, response.text
        record = response.json()
        assert record["value_id"] == value_id
        assert record["formula_version"]
        assert record["source_id"]
        assert record["source_data_year"]
        assert record["quality_flag"]


def test_country_brief_export_contains_complete_action_programme() -> None:
    response = CLIENT.get("/api/export/country/RUS/brief", params={"year": 2026, "lang": "en", "format": "json"})
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["policy_brief"]) == 8
    assert any(item["item_id"] == "RUS-QS-08" for item in payload["policy_brief"])
    text = CLIENT.get("/api/export/country/RUS/brief", params={"year": 2026, "lang": "en", "format": "txt"})
    assert text.status_code == 200
    assert "Increase the international visibility of engineering and technology programmes" in text.text


def test_unknown_country_and_static_integration_contract() -> None:
    response = CLIENT.get("/api/country/ZZZ/workspace", params={"year": 2026})
    assert response.status_code == 404
    html = (ROOT / "giip/static/index.html").read_text(encoding="utf-8")
    app_js = (ROOT / "giip/static/app.js").read_text(encoding="utf-8")
    module_js = (ROOT / "giip/static/country_profile_v2.js").read_text(encoding="utf-8")
    module_css = (ROOT / "giip/static/country_profile_v2.css").read_text(encoding="utf-8")
    assert "/static/country_profile_v2.css" in html
    assert "/static/country_profile_v2.js" in html
    assert "GIRCountryProfileV2?.render" in app_js
    assert "AUS, AUT, BEL" not in module_js
    assert "Блоки исходного ТЗ" not in module_js
    assert ".cp2-page" in module_css
