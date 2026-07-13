from __future__ import annotations

import hashlib
import json
import sqlite3
from pathlib import Path

from fastapi.testclient import TestClient

from giip.api import app
from giip.config import DB_PATH, STATIC_DIR

LANDING_ROOT = STATIC_DIR / "landing"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def test_landing_manifest_covers_every_raster_variant() -> None:
    manifest = json.loads((LANDING_ROOT / "asset-manifest.json").read_text(encoding="utf-8"))
    records: dict[str, dict[str, object]] = {}
    for item in manifest["assets"]:
        for variant in ("png", "webp"):
            record = item[variant]
            records[str(record["path"])] = record

    actual = {
        path.relative_to(LANDING_ROOT).as_posix()
        for folder in (LANDING_ROOT / "hero", LANDING_ROOT / "product")
        for path in folder.iterdir()
        if path.is_file() and path.suffix.lower() in {".png", ".webp"}
    }
    assert set(records) == actual
    for relative, record in records.items():
        path = LANDING_ROOT / relative
        assert path.stat().st_size == record["bytes"]
        assert sha256(path) == record["sha256"]


def test_project_asset_manifest_registers_landing_and_remote_form_service() -> None:
    manifest = json.loads((STATIC_DIR / "ASSET_MANIFEST.json").read_text(encoding="utf-8"))
    records = {item["path"]: item for item in manifest["assets"]}
    for folder in (LANDING_ROOT / "hero", LANDING_ROOT / "product"):
        for path in folder.iterdir():
            if path.is_file():
                relative = path.relative_to(STATIC_DIR).as_posix()
                assert records[relative]["sha256"] == sha256(path)
    assert {
        "icons/house.svg",
        "icons/mail.svg",
        "icons/map.svg",
        "icons/chart-no-axes-combined.svg",
        "icons/server.svg",
        "icons/boxes.svg",
        "icons/landmark.svg",
        "icons/graduation-cap.svg",
        "icons/briefcase-business.svg",
        "icons/network.svg",
        "icons/flag.svg",
    } <= set(records)
    assert manifest["runtime_remote_dependencies"] is True
    assert manifest["runtime_remote_services"][0]["name"] == "FormSubmit"


def test_static_mount_serves_webp_with_an_image_media_type() -> None:
    with TestClient(app) as client:
        response = client.get("/static/landing/hero/hero-dark.webp")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/webp")


def test_landing_editorial_data_counts_match_the_release_snapshot() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        countries = conn.execute("SELECT COUNT(*) FROM countries").fetchone()[0]
        scored_countries = conn.execute("SELECT COUNT(DISTINCT iso3) FROM index_scores").fetchone()[0]
        scores = conn.execute("SELECT COUNT(*) FROM index_scores").fetchone()[0]
        snapshots = conn.execute("SELECT COUNT(*) FROM raw_snapshots").fetchone()[0]
        years = conn.execute("SELECT MIN(year),MAX(year) FROM index_scores").fetchone()
        tables = conn.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchone()[0]

    assert countries == 225
    assert scored_countries == 219
    assert scores == 10_076
    assert snapshots == 275
    assert years == (1990, 2026)
    assert tables == 36
