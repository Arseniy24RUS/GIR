#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from statistics import median
from typing import Any

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from giip.config import DATA_DIR, DB_PATH
from giip.db import connect, upsert_many
from giip.production_data import (
    COMPONENTS,
    QS_OFFICIAL_URL,
    Snapshot,
    assign_ranks,
    build_if_missing,
    build_value_rows,
    country_rows,
    iso3_from_name,
    normalize_values,
    rel_path,
    sha256_bytes,
    transform_for,
)

SOURCE_ID = "QS_ET"
FORMULA_VERSION = "qs-country-aggregation-v1"
CORE_FIELDS = ("country", "university", "overall_score")
FIELD_ALIASES = {
    "ranking_name": ("ranking_name", "ranking", "ranking_name_en"),
    "subject": ("subject", "subject_name", "faculty_area", "broad_subject"),
    "year": ("year", "release_year"),
    "university": ("university", "institution", "institution_name", "name"),
    "university_qs_url": ("university_qs_url", "university_url", "profile_url"),
    "country": ("country", "location", "country_region", "country_or_region"),
    "city": ("city",),
    "rank": ("rank", "position"),
    "rank_display": ("rank_display", "rank_range", "display_rank"),
    "overall_score": ("overall_score", "overall", "score", "overall_score_value"),
    "academic_reputation_score": ("academic_reputation_score", "academic_reputation"),
    "employer_reputation_score": ("employer_reputation_score", "employer_reputation"),
    "citations_per_paper_score": ("citations_per_paper_score", "citations_per_paper"),
    "h_index_score": ("h_index_score", "h_index"),
    "international_research_network_score": (
        "international_research_network_score",
        "international_research_network",
    ),
    "source_url": ("source_url", "url"),
    "release_version_url": ("release_version_url", "release_url"),
    "methodology_url": ("methodology_url", "methodology"),
    "retrieved_at": ("retrieved_at", "downloaded_at"),
    "raw_file_sha256": ("raw_file_sha256", "file_sha256", "sha256"),
    "row_sha256": ("row_sha256", "row_hash"),
    "quality_flag": ("quality_flag",),
}


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def normalize_header(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.strip().lower()).strip("_")


def parse_number(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    text = str(value).strip()
    if not text or text in {"-", "n/a", "N/A"}:
        return None
    match = re.search(r"-?\d+(?:\.\d+)?", text.replace(",", ""))
    return float(match.group(0)) if match else None


def parse_rank(row: dict[str, Any]) -> int | None:
    value = get_field(row, "rank")
    if value in (None, ""):
        value = get_field(row, "rank_display")
    parsed = parse_number(value)
    return int(parsed) if parsed is not None else None


def load_csv(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return [dict(row) for row in csv.DictReader(handle)]


def load_xlsx(path: Path) -> list[dict[str, Any]]:
    workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
    sheet = workbook.active
    iterator = sheet.iter_rows(values_only=True)
    headers = [str(cell or "").strip() for cell in next(iterator)]
    records = []
    for row in iterator:
        if not any(cell is not None and str(cell).strip() for cell in row):
            continue
        records.append({headers[i]: row[i] if i < len(row) else None for i in range(len(headers))})
    return records


def load_records(path: Path) -> list[dict[str, Any]]:
    if path.suffix.lower() in {".xlsx", ".xlsm"}:
        return load_xlsx(path)
    return load_csv(path)


def canonicalize(row: dict[str, Any]) -> dict[str, Any]:
    by_normalized = {normalize_header(k): v for k, v in row.items()}
    out = {}
    for field, aliases in FIELD_ALIASES.items():
        out[field] = None
        for alias in aliases:
            if alias in by_normalized:
                out[field] = by_normalized[alias]
                break
    return out


def get_field(row: dict[str, Any], field: str) -> Any:
    return row.get(field)


def require_core_fields(rows: list[dict[str, Any]]) -> None:
    if not rows:
        raise SystemExit("QS import failed: the official file has no data rows.")
    missing = [field for field in CORE_FIELDS if all(get_field(row, field) in (None, "") for row in rows)]
    if all(get_field(row, "rank") in (None, "") and get_field(row, "rank_display") in (None, "") for row in rows):
        missing.append("rank or rank_display")
    if missing:
        raise SystemExit(f"QS import failed: missing required fields: {', '.join(missing)}")


def looks_like_engineering(row: dict[str, Any]) -> bool:
    text = " ".join(str(get_field(row, field) or "") for field in ("ranking_name", "subject")).lower()
    if not text:
        return True
    return "engineering" in text or "technology" in text


def archive_snapshot(path: Path, release_year: int, source_url: str, retrieved_at: str) -> Snapshot:
    content = path.read_bytes()
    digest = sha256_bytes(content)
    stamp = retrieved_at.replace(":", "").replace("+", "Z")
    target_dir = DATA_DIR / "raw" / SOURCE_ID / str(release_year) / stamp
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / path.name
    if path.resolve() != target.resolve():
        shutil.copy2(path, target)
    snapshot = Snapshot(
        snapshot_id=f"{SOURCE_ID}:{release_year}:{digest[:16]}",
        source_id=SOURCE_ID,
        release_year=release_year,
        retrieved_at=retrieved_at,
        source_url=source_url,
        raw_snapshot_path=rel_path(target),
        raw_snapshot_sha256=digest,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        if path.suffix.lower() in {".xlsx", ".xlsm"}
        else "text/csv",
        bytes_count=len(content),
        license_or_terms="QS ranking terms; official user-provided export archived for reproducible country aggregation.",
    )
    target.with_suffix(target.suffix + ".metadata.json").write_text(
        json.dumps(snapshot.__dict__, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return snapshot


def build_qs_aggregation(rows: list[dict[str, Any]], release_year: int) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, str]]:
    groups: dict[str, list[dict[str, Any]]] = {}
    country_names: dict[str, str] = {}
    for row in rows:
        if not looks_like_engineering(row):
            continue
        country = str(get_field(row, "country") or "").strip()
        iso3 = iso3_from_name(country)
        rank = parse_rank(row)
        score = parse_number(get_field(row, "overall_score"))
        university = str(get_field(row, "university") or "").strip()
        if not iso3 or not country or rank is None or score is None or not university:
            continue
        groups.setdefault(iso3, []).append({"rank": rank, "score": score, "university": university})
        country_names.setdefault(iso3, country)

    if not groups:
        raise SystemExit("QS import failed: no Engineering & Technology rows could be mapped to ISO3 countries.")

    metrics: dict[str, dict[str, float]] = {}
    for iso3, institutions in groups.items():
        ranks = [item["rank"] for item in institutions]
        scores = [item["score"] for item in institutions]
        metrics[iso3] = {
            "TOP_COUNT": float(len(institutions)),
            "BEST_RANK": float(min(ranks)),
            "MEDIAN_RANK": float(median(ranks)),
            "QS_SCORE": float(sum(scores)),
        }

    normalized = {
        "TOP_COUNT": normalize_values({iso3: item["TOP_COUNT"] for iso3, item in metrics.items()}),
        "BEST_RANK": normalize_values({iso3: item["BEST_RANK"] for iso3, item in metrics.items()}, reverse=True),
        "MEDIAN_RANK": normalize_values({iso3: item["MEDIAN_RANK"] for iso3, item in metrics.items()}, reverse=True),
        "QS_SCORE": normalize_values({iso3: item["QS_SCORE"] for iso3, item in metrics.items()}),
    }
    weights = {code: weight for code, _ru, _en, weight, _note in COMPONENTS["QS_ET"]}

    scores_out = []
    components_out = []
    for iso3, item in metrics.items():
        score = sum(normalized[code][iso3] * weights[code] for code in weights)
        scores_out.append({"iso3": iso3, "score": score, "rank": 0, "source_data_year": release_year})
        for code, raw_value in item.items():
            components_out.append({
                "iso3": iso3,
                "component_code": code,
                "raw_value": raw_value,
                "normalized_score": normalized[code][iso3],
                "unit": "QS official export country aggregation input",
                "source_data_year": release_year,
            })
    assign_ranks(scores_out)
    return scores_out, components_out, country_names


def purge_existing_qs(conn, year: int) -> None:
    params = ("QS_ET", year)
    conn.execute("DELETE FROM recommendations WHERE index_code=?", ("QS_ET",))
    conn.execute("DELETE FROM diagnostics WHERE index_code=? AND year=?", params)
    conn.execute("DELETE FROM rankings WHERE index_code=? AND year=?", params)
    conn.execute("DELETE FROM component_values WHERE index_code=? AND year=?", params)
    conn.execute("DELETE FROM index_scores WHERE index_code=? AND year=?", params)


def import_qs(args: argparse.Namespace) -> dict[str, Any]:
    input_path = Path(args.input).resolve()
    if not input_path.exists():
        raise SystemExit(f"QS import failed: file not found: {input_path}")
    if args.release_year != 2025:
        raise SystemExit("QS import currently writes to the platform release year 2025.")
    if not args.confirm_official_export:
        raise SystemExit("QS import requires --confirm-official-export.")

    content = input_path.read_bytes()
    digest = sha256_bytes(content)
    if args.expected_sha256 and args.expected_sha256.lower() != digest:
        raise SystemExit(f"QS import failed: checksum mismatch. Actual SHA-256: {digest}")

    raw_rows = load_records(input_path)
    rows = [canonicalize(row) for row in raw_rows]
    require_core_fields(rows)
    for row in rows:
        file_hash = str(get_field(row, "raw_file_sha256") or "").strip().lower()
        if file_hash and file_hash != digest:
            raise SystemExit(f"QS import failed: row raw_file_sha256 does not match file SHA-256: {digest}")

    source_url = args.source_url or str(get_field(rows[0], "source_url") or QS_OFFICIAL_URL)
    retrieved_at = args.retrieved_at or str(get_field(rows[0], "retrieved_at") or now_iso())
    snapshot = archive_snapshot(input_path, args.release_year, source_url, retrieved_at)
    scores, components, country_names = build_qs_aggregation(rows, args.release_year)
    transform = transform_for(
        snapshot,
        "qs_official_export_to_country_aggregation",
        len(scores),
        "QS official Engineering & Technology export aggregated to country-level indicators.",
    )
    score_rows, component_rows, ranking_rows, diagnostics, recommendations = build_value_rows(
        "QS_ET",
        scores,
        components,
        snapshot,
        transform,
        FORMULA_VERSION,
        score_quality="recomputed_from_official_components",
        component_quality="recomputed_from_official_components",
        score_is_official=False,
        score_is_recomputed=True,
    )

    db_path = Path(args.db)
    build_if_missing(db_path)
    iso_to_region = {iso3: "Global" for iso3 in country_names}
    iso_to_income = {iso3: "Not classified" for iso3 in country_names}
    with connect(db_path) as conn:
        purge_existing_qs(conn, args.release_year)
        upsert_many(conn, "countries", country_rows(country_names, iso_to_region, iso_to_income))
        upsert_many(conn, "raw_snapshots", [snapshot.__dict__ | {"is_official": 1}])
        upsert_many(conn, "transformation_runs", [transform.__dict__])
        upsert_many(conn, "index_scores", score_rows)
        upsert_many(conn, "component_values", component_rows)
        upsert_many(conn, "rankings", ranking_rows)
        upsert_many(conn, "diagnostics", diagnostics)
        upsert_many(conn, "recommendations", recommendations)
        conn.execute(
            """
            UPDATE source_registry
            SET retrieved_at=?, release_year=?, latest_snapshot_id=?, source_url=?,
                automation_status='manual_official_file_import_loaded'
            WHERE source_id=?
            """,
            (snapshot.retrieved_at, snapshot.release_year, snapshot.snapshot_id, snapshot.source_url, SOURCE_ID),
        )
        conn.commit()

    return {
        "status": "ok",
        "source_id": SOURCE_ID,
        "countries": len(scores),
        "component_rows": len(component_rows),
        "raw_snapshot_path": snapshot.raw_snapshot_path,
        "raw_snapshot_sha256": snapshot.raw_snapshot_sha256,
        "transform_id": transform.transform_id,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Import an official QS Engineering & Technology export file.")
    parser.add_argument("input", help="Official QS CSV or XLSX export path.")
    parser.add_argument("--db", default=str(DB_PATH), help="SQLite database path.")
    parser.add_argument("--release-year", type=int, default=2025)
    parser.add_argument("--source-url", default=QS_OFFICIAL_URL)
    parser.add_argument("--retrieved-at")
    parser.add_argument("--expected-sha256")
    parser.add_argument("--confirm-official-export", action="store_true")
    args = parser.parse_args()
    print(json.dumps(import_qs(args), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
