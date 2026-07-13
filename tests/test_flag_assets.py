from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from giip.api import app


ROOT = Path(__file__).resolve().parents[1]
FLAGS_DIR = ROOT / "giip" / "static" / "flags"
MANIFEST_PATH = FLAGS_DIR / "MANIFEST.json"
APP_JS_PATH = ROOT / "giip" / "static" / "app.js"
STYLES_PATH = ROOT / "giip" / "static" / "styles.css"
ISO2_RE = re.compile(r"^[A-Z]{2}$")
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")


@pytest.fixture(scope="module")
def api_client():
    with TestClient(app) as client:
        yield client


def _manifest() -> dict:
    assert MANIFEST_PATH.is_file(), f"Flag manifest is missing: {MANIFEST_PATH}"
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def test_countries_api_has_complete_iso2_flag_mappings(api_client: TestClient) -> None:
    response = api_client.get("/api/countries")
    assert response.status_code == 200
    countries = response.json()

    assert len(countries) == 225
    assert len({country["iso3"] for country in countries}) == 225
    assert all(ISO2_RE.fullmatch(country.get("iso2", "")) for country in countries)

    iso3_by_iso2: dict[str, set[str]] = defaultdict(set)
    for country in countries:
        iso3_by_iso2[country["iso2"]].add(country["iso3"])

    assert len(iso3_by_iso2) == 224
    assert {iso2: iso3s for iso2, iso3s in iso3_by_iso2.items() if len(iso3s) > 1} == {
        "PS": {"PSE", "WBG"}
    }


def test_flag_manifest_matches_api_and_every_svg_hash(api_client: TestClient) -> None:
    manifest = _manifest()
    mappings = manifest["countries"]

    assert manifest["schema_version"] == 1
    assert manifest["aspect_ratio"] == "4x3"
    assert manifest["missing"] == []
    assert len(mappings) == 225
    assert len({row["iso3"] for row in mappings}) == 225

    api_countries = api_client.get("/api/countries")
    assert api_countries.status_code == 200
    api_mapping = {row["iso3"]: row["iso2"] for row in api_countries.json()}
    manifest_mapping = {row["iso3"]: row["iso2"] for row in mappings}
    assert manifest_mapping == api_mapping

    metadata_by_path: dict[str, tuple[int, str]] = {}
    iso3_by_iso2: dict[str, set[str]] = defaultdict(set)
    for row in mappings:
        assert ISO2_RE.fullmatch(row["iso2"])
        assert row["path"] == f'{row["iso2"].lower()}.svg'
        assert isinstance(row["bytes"], int) and row["bytes"] > 0
        assert SHA256_RE.fullmatch(row["sha256"])
        iso3_by_iso2[row["iso2"]].add(row["iso3"])

        metadata = (row["bytes"], row["sha256"])
        previous = metadata_by_path.setdefault(row["path"], metadata)
        assert previous == metadata, f'Conflicting manifest metadata for {row["path"]}'

    assert len(metadata_by_path) == 224
    assert {iso2: iso3s for iso2, iso3s in iso3_by_iso2.items() if len(iso3s) > 1} == {
        "PS": {"PSE", "WBG"}
    }
    assert {path.name for path in FLAGS_DIR.glob("*.svg")} == set(metadata_by_path)

    for relative_path, (expected_bytes, expected_sha256) in metadata_by_path.items():
        asset = FLAGS_DIR / relative_path
        assert asset.is_file(), f"Manifest flag is missing: {relative_path}"
        content = asset.read_bytes()
        assert len(content) == expected_bytes, f"Unexpected byte size for {relative_path}"
        assert hashlib.sha256(content).hexdigest() == expected_sha256, (
            f"SHA-256 mismatch for {relative_path}"
        )


def test_russian_flag_is_served_from_the_local_static_mount(api_client: TestClient) -> None:
    local_asset = FLAGS_DIR / "ru.svg"
    manifest_row = next(row for row in _manifest()["countries"] if row["iso3"] == "RUS")
    response = api_client.get("/static/flags/ru.svg")

    assert response.status_code == 200
    assert response.headers["content-type"].split(";", 1)[0] == "image/svg+xml"
    assert response.content == local_asset.read_bytes()
    assert hashlib.sha256(response.content).hexdigest() == manifest_row["sha256"]


def test_frontend_references_local_flags_and_accessible_fallbacks() -> None:
    app_js = APP_JS_PATH.read_text(encoding="utf-8")
    styles = STYLES_PATH.read_text(encoding="utf-8")

    assert app_js.count("/static/flags/${iso2}.svg") >= 2
    assert "--country-flag-url" in app_js
    assert "classList.add('is-fallback')" in app_js
    assert "this.remove()" in app_js
    assert 'aria-label="${label}"' in app_js

    assert ".flag-slot.is-fallback .flag-fallback" in styles
    assert "select.select.country-select" in styles
    assert ".country-select-display" in styles
    assert "background-image: var(--country-flag-url)" in styles
