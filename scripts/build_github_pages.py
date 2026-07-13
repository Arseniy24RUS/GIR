#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / "giip" / "static"
SUPPORT = ROOT / "github_pages"
DESTINATION = ROOT / "pages-dist"
DATABASE = ROOT / "data" / "global_index_platform.sqlite"
PATCH_ID = "GIR_CUMULATIVE_S1_S8_20260713_R1"
DEFAULT_COUNTRY = "RUS"
DEFAULT_YEAR = 2026
INDEX_CODES = ("HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET")

NOTICE = """
  <aside class="github-pages-notice" aria-label="GitHub Pages publication mode">
    <span class="github-pages-notice__ru"><strong>Статическая публикация GIR.</strong> Зафиксированный срез России за 2026 год; полная FastAPI-платформа и все разрешённые данные находятся в репозитории.</span>
    <span class="github-pages-notice__en"><strong>GIR static publication.</strong> Fixed Russia 2026 snapshot; the complete FastAPI platform and all permitted data are available in the repository.</span>
    <a href="https://github.com/Arseniy24RUS/GIR" target="_blank" rel="noopener noreferrer">
      <span class="github-pages-notice__ru">Репозиторий и данные</span>
      <span class="github-pages-notice__en">Repository and data</span>
    </a>
  </aside>
""".rstrip()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def clean_destination() -> None:
    resolved_root = ROOT.resolve()
    resolved_destination = DESTINATION.resolve()
    if resolved_destination.parent != resolved_root:
        raise RuntimeError(f"Unsafe Pages destination: {resolved_destination}")
    if DESTINATION.exists():
        shutil.rmtree(DESTINATION)
    DESTINATION.mkdir()


def require_response(client: TestClient, path: str):
    response = client.get(path)
    if response.status_code != 200:
        raise RuntimeError(f"Pages export failed for {path}: HTTP {response.status_code}: {response.text[:500]}")
    return response


def write_response(client: TestClient, output_name: str, endpoint: str) -> dict[str, object]:
    response = require_response(client, endpoint)
    target = DESTINATION / "api" / output_name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(response.content)
    return {
        "path": target.relative_to(DESTINATION).as_posix(),
        "source_endpoint": endpoint,
        "bytes": target.stat().st_size,
        "sha256": sha256(target),
        "content_type": response.headers.get("content-type", "application/octet-stream"),
        "transformation": "exact FastAPI response snapshot",
    }


def write_platform_context(client: TestClient) -> list[dict[str, object]]:
    response = require_response(client, "/api/platform-context")
    full_payload = response.json()
    full_target = DESTINATION / "api" / "platform-context-full.json"
    full_target.parent.mkdir(parents=True, exist_ok=True)
    full_target.write_bytes(response.content)

    pages_payload = dict(full_payload)
    pages_payload["countries"] = [
        item for item in full_payload.get("countries", []) if item.get("iso3") == DEFAULT_COUNTRY
    ]
    pages_payload["years"] = [DEFAULT_YEAR]
    pages_payload["default_year"] = DEFAULT_YEAR
    pages_payload["pages_publication"] = {
        "scope": "fixed_country_year_snapshot",
        "country": DEFAULT_COUNTRY,
        "year": DEFAULT_YEAR,
        "full_context_path": "api/platform-context-full.json",
    }
    target = DESTINATION / "api" / "platform-context.json"
    target.write_text(json.dumps(pages_payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return [
        {
            "path": full_target.relative_to(DESTINATION).as_posix(),
            "source_endpoint": "/api/platform-context",
            "bytes": full_target.stat().st_size,
            "sha256": sha256(full_target),
            "content_type": "application/json",
            "transformation": "exact FastAPI response snapshot",
        },
        {
            "path": target.relative_to(DESTINATION).as_posix(),
            "source_endpoint": "/api/platform-context",
            "bytes": target.stat().st_size,
            "sha256": sha256(target),
            "content_type": "application/json",
            "transformation": "country and year selectors restricted to the published RUS 2026 snapshot; full response retained alongside",
        },
    ]


def write_app_data(client: TestClient) -> list[dict[str, object]]:
    endpoint = f"/api/app-data?country={DEFAULT_COUNTRY}&year={DEFAULT_YEAR}"
    response = require_response(client, endpoint)
    full_payload = response.json()
    full_target = DESTINATION / "api" / "app-data-RUS-2026-full.json"
    full_target.parent.mkdir(parents=True, exist_ok=True)
    full_target.write_bytes(response.content)

    pages_payload = dict(full_payload)
    pages_payload["countries"] = [
        item for item in full_payload.get("countries", []) if item.get("iso3") == DEFAULT_COUNTRY
    ]
    pages_payload["years"] = [DEFAULT_YEAR]
    pages_payload["default_year"] = DEFAULT_YEAR
    pages_payload["pages_publication"] = {
        "scope": "fixed_country_year_snapshot",
        "country": DEFAULT_COUNTRY,
        "year": DEFAULT_YEAR,
        "full_response_path": "api/app-data-RUS-2026-full.json",
    }
    target = DESTINATION / "api" / "app-data-RUS-2026.json"
    target.write_text(json.dumps(pages_payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return [
        {
            "path": full_target.relative_to(DESTINATION).as_posix(),
            "source_endpoint": endpoint,
            "bytes": full_target.stat().st_size,
            "sha256": sha256(full_target),
            "content_type": "application/json",
            "transformation": "exact FastAPI response snapshot",
        },
        {
            "path": target.relative_to(DESTINATION).as_posix(),
            "source_endpoint": endpoint,
            "bytes": target.stat().st_size,
            "sha256": sha256(target),
            "content_type": "application/json",
            "transformation": "country and year selectors restricted to the published RUS 2026 snapshot; full response retained alongside",
        },
    ]


def prepare_static_assets() -> None:
    shutil.copytree(STATIC, DESTINATION / "static")

    for duplicate_entry in ("index.html", "data-lab.html", "personal-data-consent.html"):
        (DESTINATION / "static" / duplicate_entry).unlink(missing_ok=True)

    for path in (DESTINATION / "static").rglob("*.js"):
        text = path.read_text(encoding="utf-8")
        text = text.replace("/static/", "static/")
        text = text.replace('href: "/data-lab"', 'href: "data-lab.html"')
        text = text.replace('href="/personal-data-consent"', 'href="personal-data-consent.html"')
        path.write_text(text, encoding="utf-8")

    for path in (DESTINATION / "static").rglob("*.css"):
        text = path.read_text(encoding="utf-8").replace("/static/", "./")
        path.write_text(text, encoding="utf-8")

    shutil.copy2(SUPPORT / "pages-runtime.js", DESTINATION / "static" / "pages-runtime.js")
    shutil.copy2(SUPPORT / "pages.css", DESTINATION / "static" / "pages.css")
    shutil.copy2(STATIC / "world_countries_lite.geojson", DESTINATION / "world.geojson")


def prepare_html(source_name: str, output_name: str, *, main_shell: bool = False) -> None:
    text = (STATIC / source_name).read_text(encoding="utf-8")
    text = text.replace("/static/", "static/")
    text = text.replace('href="/data-lab"', 'href="data-lab.html"')
    text = text.replace('href="/personal-data-consent"', 'href="personal-data-consent.html"')
    if source_name == "data-lab.html":
        text = text.replace('href="/"', 'href="./"')
    text = text.replace("</head>", '  <link rel="stylesheet" href="static/pages.css?v=gir-pages-20260713-1">\n</head>')
    text = text.replace("<body>", f"<body>\n{NOTICE}", 1)

    if main_shell:
        marker = '  <script src="static/landing.js'
    elif source_name == "data-lab.html":
        marker = '  <script src="static/stage5_data_lab.js'
    else:
        marker = '  <script src="static/cooperation.js'
    text = text.replace(marker, f'  <script src="static/pages-runtime.js?v=gir-pages-20260713-1"></script>\n{marker}', 1)
    (DESTINATION / output_name).write_text(text, encoding="utf-8")


def default_explorer_query(schema: dict[str, object]) -> str:
    dataset = schema["datasets"][0]
    defaults = dataset.get("default", {})
    query: dict[str, object] = {
        "dataset": dataset["id"],
        "measure": defaults.get("measure") or dataset["measures"][0]["code"],
        "countries": defaults.get("countries", "RUS,CHN,USA,DEU,KOR,SGP"),
        "year_from": dataset.get("year_min"),
        "year_to": dataset.get("year_max"),
    }
    for dimension in dataset.get("dimensions", []):
        code = dimension.get("code")
        if code and defaults.get(code) not in (None, "", "all"):
            query[code] = defaults[code]
    return urlencode({key: value for key, value in query.items() if value not in (None, "")})


def export_api_snapshot() -> list[dict[str, object]]:
    sys.path.insert(0, str(ROOT))
    from giip.api import app

    records: list[dict[str, object]] = []
    with TestClient(app) as client:
        records.extend(write_platform_context(client))
        records.extend(write_app_data(client))
        json_exports = {
            "landing-summary.json": f"/api/landing-summary?country={DEFAULT_COUNTRY}",
            "country-RUS-workspace.json": f"/api/country/{DEFAULT_COUNTRY}/workspace?year={DEFAULT_YEAR}",
            "cross-matrix.json": f"/api/cross-matrix?year={DEFAULT_YEAR}&group=all&income_group=all&metric=rank&sort_index=HTEI&sort_metric=rank&sort_dir=asc&lang=ru",
            "htei-workspace.json": f"/api/htei/workspace?country={DEFAULT_COUNTRY}&year={DEFAULT_YEAR}&mode=common_support&limit=25&offset=0",
            "htei-explainer.json": f"/api/index/HTEI/explainer?country={DEFAULT_COUNTRY}&year={DEFAULT_YEAR}&mode=common_support&lang=ru",
            "training-workspace.json": f"/api/training/workspace?country={DEFAULT_COUNTRY}&year={DEFAULT_YEAR}",
            "policy-russia-workspace.json": f"/api/policy/russia/workspace?year={DEFAULT_YEAR}",
            "methodology-summary.json": "/api/methodology/summary",
            "methodology-registry.json": "/api/methodology/registry",
            "comparison-workspace.json": f"/api/comparison/workspace?year={DEFAULT_YEAR}&country={DEFAULT_COUNTRY}",
            "data-catalog-summary.json": "/api/data-catalog/summary",
            "data-explorer-schema.json": "/api/data-explorer/schema",
            "data-catalog-sources.json": "/api/data-catalog/sources",
            "data-catalog-files.json": "/api/data-catalog/files?page=1&page_size=30",
        }
        for name, endpoint in json_exports.items():
            records.append(write_response(client, name, endpoint))

        for code in INDEX_CODES:
            records.append(write_response(
                client,
                f"index-{code}-workspace.json",
                f"/api/index/{code}/workspace?country={DEFAULT_COUNTRY}&year={DEFAULT_YEAR}",
            ))
            records.append(write_response(
                client,
                f"index-{code}-workspace.csv",
                f"/api/index/{code}/workspace.csv?country={DEFAULT_COUNTRY}&year={DEFAULT_YEAR}&lang=ru",
            ))

        csv_exports = {
            "cross-matrix.csv": f"/api/cross-matrix.csv?year={DEFAULT_YEAR}&group=all&metric=rank&sort_index=HTEI&sort_metric=rank&sort_dir=asc&lang=ru",
            "htei-workspace.csv": "/api/htei/workspace.csv?mode=common_support",
            "training-workspace.csv": f"/api/training/workspace/export.csv?country={DEFAULT_COUNTRY}&year={DEFAULT_YEAR}&lang=ru",
            "policy-russia-workspace.csv": f"/api/policy/russia/export.csv?year={DEFAULT_YEAR}&lang=ru",
            "comparison-workspace.csv": f"/api/comparison/workspace.csv?year={DEFAULT_YEAR}&country={DEFAULT_COUNTRY}&lang=ru",
            "data-catalog-manifest.csv": "/api/data-catalog/manifest.csv",
        }
        for name, endpoint in csv_exports.items():
            records.append(write_response(client, name, endpoint))

        schema = require_response(client, "/api/data-explorer/schema").json()
        explorer_query = default_explorer_query(schema)
        records.append(write_response(client, "data-explorer-query.json", f"/api/data-explorer/query?{explorer_query}"))
        records.append(write_response(client, "data-explorer-query.csv", f"/api/data-explorer/export.csv?{explorer_query}"))

        sources = require_response(client, "/api/data-catalog/sources").json().get("sources", [])
        for source in sources:
            source_id = source["source_id"]
            records.append(write_response(
                client,
                f"data-catalog-source-{source_id}.json",
                f"/api/data-catalog/sources/{source_id}",
            ))
    return records


def write_manifest(api_records: list[dict[str, object]]) -> None:
    files = []
    for path in sorted(item for item in DESTINATION.rglob("*") if item.is_file()):
        relative = path.relative_to(DESTINATION).as_posix()
        if relative == "PAGES_EXPORT_MANIFEST.json":
            continue
        files.append({"path": relative, "bytes": path.stat().st_size, "sha256": sha256(path)})
    manifest = {
        "schema_version": "gir-pages-export-v1",
        "patch_id": PATCH_ID,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_database": "data/global_index_platform.sqlite",
        "source_database_sha256": sha256(DATABASE),
        "country": DEFAULT_COUNTRY,
        "year": DEFAULT_YEAR,
        "scope": "static real-data publication; complete dynamic platform remains in the repository",
        "api_exports": api_records,
        "files": files,
    }
    target = DESTINATION / "PAGES_EXPORT_MANIFEST.json"
    target.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    clean_destination()
    prepare_static_assets()
    prepare_html("index.html", "index.html", main_shell=True)
    prepare_html("data-lab.html", "data-lab.html")
    prepare_html("personal-data-consent.html", "personal-data-consent.html")
    shutil.copy2(DESTINATION / "index.html", DESTINATION / "404.html")
    (DESTINATION / ".nojekyll").write_text("", encoding="utf-8")
    api_records = export_api_snapshot()
    write_manifest(api_records)
    print(f"GitHub Pages artifact prepared: {DESTINATION}")
    print(f"API snapshots: {len(api_records)}")
    print(f"Database SHA-256: {sha256(DATABASE)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
