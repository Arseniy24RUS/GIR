from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from giip.api import app


ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / "giip" / "static"


def test_unified_frontend_loads_every_product_module() -> None:
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        html = response.text

    required_assets = {
        "/static/landing.css": STATIC / "landing.css",
        "/static/landing.js": STATIC / "landing.js",
        "/static/country_profile_v2.css": STATIC / "country_profile_v2.css",
        "/static/country_profile_v2.js": STATIC / "country_profile_v2.js",
        "/static/htei-workspace.css": STATIC / "htei-workspace.css",
        "/static/htei-workspace.js": STATIC / "htei-workspace.js",
        "/static/stage4.css": STATIC / "stage4.css",
        "/static/stage4.js": STATIC / "stage4.js",
        "/static/methodology.css": STATIC / "methodology.css",
        "/static/methodology.js": STATIC / "methodology.js",
    }
    for public_path, local_path in required_assets.items():
        assert public_path in html
        assert local_path.is_file()

    app_js = (STATIC / "app.js").read_text(encoding="utf-8")
    assert '{ key: "policy-center"' in app_js
    assert '{ key: "methodology"' in app_js
    assert '{ key: "data-lab"' in app_js
    public_nav = app_js[app_js.index("function navGroups"):app_js.index("function countryOptions")]
    assert '{ key: "acceptance"' not in public_nav
    assert 'state.page === "acceptance"' in app_js  # retained as a non-public service route


def test_unified_api_contracts_are_available_together() -> None:
    routes = {
        "landing": "/api/landing-summary",
        "country": "/api/country/RUS/workspace?year=2026",
        "htei": "/api/htei/workspace?country=RUS&year=2026&mode=proxy_extended",
        "training": "/api/training/workspace?country=RUS&year=2026",
        "policy": "/api/policy/russia/workspace?year=2026",
        "methodology": "/api/methodology/summary",
        "catalog": "/api/data-catalog/summary",
        "explorer": "/api/data-explorer/schema",
    }
    payloads: dict[str, object] = {}
    with TestClient(app) as client:
        for name, url in routes.items():
            response = client.get(url)
            assert response.status_code == 200, f"{name}: {response.text[:500]}"
            payloads[name] = response.json()

    assert payloads["landing"]["country"]["iso3"] == "RUS"
    assert payloads["country"]["country"]["iso3"] == "RUS"
    assert payloads["htei"]["country"]["iso3"] == "RUS"
    assert payloads["htei"]["profile"]["value_id"].startswith("HTEI_V6:")
    assert payloads["training"]["country"]["iso3"] == "RUS"
    assert len(payloads["policy"]["items"]) == 8
    assert payloads["methodology"]["scale"]["database_tables"] == 36
    assert len(payloads["methodology"]["index_registry"]) >= 7
    assert payloads["catalog"]["registered_snapshots"] == 275
    assert len(payloads["explorer"]["datasets"]) >= 8


def test_data_lab_skips_expected_forbidden_preview_request() -> None:
    script = (STATIC / "stage5_data_lab.js").read_text(encoding="utf-8")
    assert "if(f.preview_allowed)" in script
    assert "Preview is unavailable under the distribution terms." in script
    assert "/preview`)" in script


def test_large_research_payloads_are_compressed() -> None:
    with TestClient(app) as client:
        app_data = client.get(
            "/api/app-data?country=RUS&year=2026",
            headers={"Accept-Encoding": "gzip"},
        )
        assert app_data.status_code == 200
        assert app_data.headers.get("content-encoding") == "gzip"
        assert int(app_data.headers["content-length"]) < 600_000

        geojson = client.get(
            "/static/world_countries.geojson",
            headers={"Accept-Encoding": "gzip"},
        )
        assert geojson.status_code == 200
        assert geojson.headers.get("content-encoding") == "gzip"
