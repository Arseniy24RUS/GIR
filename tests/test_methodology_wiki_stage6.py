from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from fastapi.testclient import TestClient

from giip.api import app
from giip.config import STATIC_DIR

METHODOLOGY = STATIC_DIR / "methodology"
PROJECT_ROOT = Path(__file__).resolve().parents[1]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_content(lang: str) -> dict:
    return json.loads((METHODOLOGY / "content" / f"methodology.{lang}.json").read_text(encoding="utf-8"))


def test_bundle_contains_all_bilingual_theme_variants() -> None:
    canonical = {
        "01_taxonomy.png",
        "02_pipeline.png",
        "03_database_layers.png",
        "04_htei_modes.png",
        "05_htei_weights.png",
        "06_index_coverage.png",
        "07_primary_sources_archive.png",
        "08_release_gates.png",
        "09_methodology_page_architecture.png",
    }
    for lang in ("ru", "en"):
        for theme in ("light", "dark"):
            folder = METHODOLOGY / "figures" / f"{lang}-{theme}"
            assert {item.name for item in folder.glob("*.png")} == canonical
            for image in folder.glob("*.png"):
                assert image.stat().st_size > 500_000


def test_project_asset_manifest_registers_all_methodology_figures() -> None:
    manifest = json.loads((STATIC_DIR / "ASSET_MANIFEST.json").read_text(encoding="utf-8"))
    records = {item["path"]: item for item in manifest["assets"]}
    actual = {
        image.relative_to(STATIC_DIR).as_posix()
        for image in (METHODOLOGY / "figures").glob("*/*.png")
    }
    registered = {path for path in records if path.startswith("methodology/figures/")}
    assert registered == actual
    for relative in actual:
        path = STATIC_DIR / relative
        record = records[relative]
        assert record["bytes"] == path.stat().st_size
        assert record["sha256"] == sha256(path)
        assert record["locale"] in {"ru", "en"}
        assert record["theme"] in {"light", "dark"}
        assert record["dimensions"] == "1672x941"


def test_precompiled_documents_are_searchable_structured_and_safe() -> None:
    expectations = {"ru": (30, 18_000, 100), "en": (20, 4_000, 40)}
    required_roles = {"summary", "framework", "pipeline", "data", "sources", "algorithms", "passports", "htei", "training", "api", "quality", "limitations"}
    for lang, (minimum_chapters, minimum_words, minimum_search) in expectations.items():
        content = load_content(lang)
        assert content["schema_version"] == "gir-methodology-wiki-v1"
        assert content["chapter_count"] >= minimum_chapters
        assert content["word_count"] >= minimum_words
        assert len(content["search"]) >= minimum_search
        assert len(content["quick_routes"]) == 4
        assert len(content["figures"]) == 9
        assert required_roles <= set(content["roles"])
        if lang == "ru":
            assert "database" in content["roles"]
        assert len({chapter["key"] for chapter in content["chapters"]}) == content["chapter_count"]
        all_html = "\n".join(chapter["html"] for chapter in content["chapters"])
        assert "<script" not in all_html.lower()
        assert "javascript:" not in all_html.lower()
        assert "method-table" in all_html
        assert "method-figure" in all_html
        operational = [chapter for chapter in content["chapters"] if chapter.get("operational_snapshot")]
        assert operational
        assert any("customer_final_release" in chapter["html"] or "release readiness" in chapter["html"].lower() or "релиз" in chapter["html"].lower() for chapter in operational)


def test_generator_check_mode_passes_against_committed_json() -> None:
    # The generator must be deterministic enough to validate the committed output.
    import subprocess

    result = subprocess.run(
        ["python", "scripts/build_methodology_wiki.py", "--check"],
        cwd=PROJECT_ROOT,
        check=False,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stdout + result.stderr


def test_methodology_summary_is_live_and_compact() -> None:
    with TestClient(app) as client:
        response = client.get("/api/methodology/summary")
    assert response.status_code == 200
    assert len(response.content) < 40_000
    payload = response.json()
    assert payload["schema_version"] == "gir-methodology-summary-v1"
    assert payload["scale"]["countries"] == 225
    assert payload["scale"]["database_tables"] == 36
    assert payload["scale"]["index_scores"] == 10_076
    assert payload["scale"]["component_values"] == 36_945
    assert payload["scale"]["source_observations"] == 18_569
    assert payload["scale"]["raw_snapshots"] == 275
    assert payload["scale"]["reproducibility_artifacts"] == 376
    assert len(payload["index_registry"]) == 8
    assert {item["classification"] for item in payload["index_registry"]} >= {"official", "historical", "derived", "project"}
    assert len(payload["principles"]) == 4


def test_static_mount_serves_content_figures_and_master_document() -> None:
    with TestClient(app) as client:
        content = client.get("/static/methodology/content/methodology.ru.json")
        figure = client.get("/static/methodology/figures/en-light/09_methodology_page_architecture.png")
        docx = client.get("/static/methodology/downloads/GIR_methodology_full_ru_2026.docx")
    assert content.status_code == 200 and content.headers["content-type"].startswith("application/json")
    assert figure.status_code == 200 and figure.headers["content-type"].startswith("image/png")
    assert docx.status_code == 200
    assert len(docx.content) > 10_000_000


def test_methodology_route_has_an_independent_loading_contract() -> None:
    app_js = (STATIC_DIR / "app.js").read_text(encoding="utf-8")
    assert 'function pageNeedsAppData(page) { return page === "country" || page === "index-HTEI" || page === "acceptance"; }' in app_js
    assert 'function pageUsesPlatformContext(page)' in app_js
    assert 'window.GIRMethodology.render({ lang: state.lang, theme: state.theme })' in app_js
    assert '/api/app-data' not in (STATIC_DIR / "methodology.js").read_text(encoding="utf-8")

    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    assert html.index("/static/methodology.js") < html.index("/static/app.js")
    assert "/static/methodology.css" in html


def test_public_methodology_renderer_does_not_embed_release_status_panel() -> None:
    app_js = (STATIC_DIR / "app.js").read_text(encoding="utf-8")
    start = app_js.index("function renderMethodology()")
    end = app_js.index("function renderAcceptance()", start)
    renderer = app_js[start:end]
    assert "releaseReadinessPanel" not in renderer
    assert "final_release_candidate" not in renderer
    assert "hash mismatch" not in renderer.lower()

    methodology_js = (STATIC_DIR / "methodology.js").read_text(encoding="utf-8")
    assert "/api/methodology/summary" in methodology_js
    assert "/api/app-data" not in methodology_js
    assert "method-search-results" in methodology_js
    assert "method-continuous" in methodology_js
    assert "method-atlas-grid" in methodology_js
    assert "Снимок служебного состояния" in methodology_js
    assert "They are not the live status of the installed build" in methodology_js


def test_source_markdown_and_download_links_are_present() -> None:
    ru = load_content("ru")
    en = load_content("en")
    assert (STATIC_DIR / ru["source_markdown"].removeprefix("/static/")).exists()
    assert (STATIC_DIR / en["source_markdown"].removeprefix("/static/")).exists()
    assert ru["docx_download"]
    assert (STATIC_DIR / ru["docx_download"].removeprefix("/static/")).exists()
    assert en["docx_download"] in {None, ""}


def test_documentation_describes_regeneration_and_public_service_boundary() -> None:
    text = (PROJECT_ROOT / "docs" / "methodology" / "README.md").read_text(encoding="utf-8")
    assert "build_methodology_wiki.py --check" in text
    assert "final_release_candidate" in text
    assert "not used as the opening narrative" in text
    assert "does not rewrite the immutable manifest" in text
