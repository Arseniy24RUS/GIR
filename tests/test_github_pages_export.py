from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "pages-dist"


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def test_pages_entrypoints_are_project_path_safe() -> None:
    for name in ("index.html", "404.html", "data-lab.html", "personal-data-consent.html"):
        text = (PAGES / name).read_text(encoding="utf-8")
        assert 'href="/static/' not in text
        assert 'src="/static/' not in text
        assert "static/pages-runtime.js" in text
    data_lab = (PAGES / "data-lab.html").read_text(encoding="utf-8")
    assert 'href="./"' in data_lab


def test_pages_export_uses_real_release_database_and_verified_files() -> None:
    manifest = json.loads((PAGES / "PAGES_EXPORT_MANIFEST.json").read_text(encoding="utf-8"))
    database = ROOT / manifest["source_database"]
    assert _sha256(database) == manifest["source_database_sha256"]
    assert manifest["country"] == "RUS"
    assert manifest["year"] == 2026
    assert len(manifest["api_exports"]) >= 59
    for item in manifest["files"]:
        path = PAGES / item["path"]
        assert path.is_file(), item["path"]
        assert path.stat().st_size == item["bytes"], item["path"]
        assert _sha256(path) == item["sha256"], item["path"]


def test_pages_landing_and_data_lab_contain_published_observations() -> None:
    landing = json.loads((PAGES / "api" / "landing-summary.json").read_text(encoding="utf-8"))
    assert landing["country"]["iso3"] == "RUS"
    assert landing["htei"]["available"] is True
    assert landing["htei"]["score"] is not None
    assert landing["htei"]["rank"] is not None

    query = json.loads((PAGES / "api" / "data-explorer-query.json").read_text(encoding="utf-8"))
    assert query["rows"]
    assert query["summary"]["returned_rows"] == len(query["rows"])
    assert all(row.get("source_id") for row in query["rows"])


def test_pages_selector_scope_is_explicit_and_full_payload_is_retained() -> None:
    scoped = json.loads((PAGES / "api" / "app-data-RUS-2026.json").read_text(encoding="utf-8"))
    full = json.loads((PAGES / "api" / "app-data-RUS-2026-full.json").read_text(encoding="utf-8"))
    assert [country["iso3"] for country in scoped["countries"]] == ["RUS"]
    assert scoped["years"] == [2026]
    assert len(full["countries"]) > 150
    assert scoped["country"] == full["country"]
    assert scoped["index_payloads"] == full["index_payloads"]
