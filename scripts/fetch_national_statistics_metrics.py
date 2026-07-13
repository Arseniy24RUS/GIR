#!/usr/bin/env python3
"""Load numeric observations from configured official national-statistics endpoints.

The connector is deliberately configuration-driven because national offices use
incompatible APIs.  It supports official JSON/CSV downloads over HTTPS, GET or
POST requests, nested record paths, fixed metadata and optional insertion into
HTEI's source-observation staging layer.  It never imputes or fabricates values.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import sys
import time
from datetime import datetime, timezone
from itertools import product
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from giip.db import connect, migrate_schema
from giip.final_release_v6 import (
    migrate_final_schema,
    finalize_license_distribution_policy,
    build_reproducibility_artifacts,
)

SOURCE_ID = "NATIONAL_STATS_NUMERIC"
HTEI_COMPONENTS = {
    "HT_EMPLOYMENT_SHARE", "HIGH_TECH_OCCUPATIONS", "RND_PERSONNEL",
    "STEM_PIPELINE", "TECH_OUTPUTS", "CORPORATE_STRATEGY_AND_DEMAND",
}


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def lookup(obj: Any, path: str | None) -> Any:
    if not path:
        return obj
    current = obj
    for part in path.split("."):
        if isinstance(current, list):
            current = current[int(part)]
        elif isinstance(current, dict):
            current = current[part]
        else:
            raise KeyError(path)
    return current


def field(record: dict[str, Any], key: str, fields: dict[str, Any], fixed: dict[str, Any]) -> Any:
    if key in fixed:
        return fixed[key]
    spec = fields.get(key)
    if isinstance(spec, dict):
        value = lookup(record, str(spec.get("path") or ""))
        if spec.get("multiplier") is not None:
            value = float(value) * float(spec["multiplier"])
        return value
    if isinstance(spec, str):
        return lookup(record, spec)
    return spec


def numeric(value: Any, decimal: str = ".") -> float:
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip().replace("\u00a0", "").replace(" ", "")
    if decimal == ",":
        text = text.replace(".", "").replace(",", ".")
    elif "," in text and "." not in text:
        text = text.replace(",", ".")
    # Remove common footnote markers without swallowing signs or decimals.
    text = re.sub(r"[^0-9eE+\-.]", "", text)
    return float(text)


def _ordered_category_codes(dimension: dict[str, Any], expected_size: int) -> list[str]:
    category = dimension.get("category") or {}
    index = category.get("index")
    if isinstance(index, dict):
        ordered: list[str | None] = [None] * expected_size
        for code, position in index.items():
            slot = int(position)
            if not 0 <= slot < expected_size or ordered[slot] is not None:
                raise ValueError("Invalid JSON-stat2 category index")
            ordered[slot] = str(code)
        if any(code is None for code in ordered):
            raise ValueError("Incomplete JSON-stat2 category index")
        return [str(code) for code in ordered]
    if isinstance(index, list) and len(index) == expected_size:
        return [str(code) for code in index]
    labels = category.get("label") or {}
    if isinstance(labels, dict) and len(labels) == expected_size:
        return [str(code) for code in labels]
    raise ValueError("JSON-stat2 dimension has no usable category index")


def flatten_json_stat2(dataset: dict[str, Any]) -> list[dict[str, Any]]:
    """Convert a JSON-stat2 dataset into one record per observation."""
    dimension_ids = dataset.get("id")
    sizes = dataset.get("size")
    dimensions = dataset.get("dimension")
    values = dataset.get("value")
    if (
        dataset.get("class") != "dataset"
        or not isinstance(dimension_ids, list)
        or not isinstance(sizes, list)
        or len(dimension_ids) != len(sizes)
        or not isinstance(dimensions, dict)
        or not isinstance(values, (list, dict))
    ):
        raise ValueError("Invalid JSON-stat2 dataset structure")

    integer_sizes = [int(size) for size in sizes]
    codes_by_dimension: list[list[str]] = []
    for dimension_id, size in zip(dimension_ids, integer_sizes):
        dimension = dimensions.get(str(dimension_id))
        if not isinstance(dimension, dict):
            raise ValueError(f"JSON-stat2 dimension is missing: {dimension_id}")
        codes_by_dimension.append(_ordered_category_codes(dimension, size))

    expected_values = 1
    for size in integer_sizes:
        expected_values *= size
    if isinstance(values, list) and len(values) != expected_values:
        raise ValueError(
            f"JSON-stat2 value count mismatch: expected {expected_values}, got {len(values)}"
        )

    records: list[dict[str, Any]] = []
    for linear_index, positions in enumerate(product(*(range(size) for size in integer_sizes))):
        value = values[linear_index] if isinstance(values, list) else values.get(str(linear_index))
        record: dict[str, Any] = {
            "__value__": value,
            "__dataset_label__": dataset.get("label"),
            "__source__": dataset.get("source"),
            "__updated__": dataset.get("updated"),
        }
        for dimension_id, position, codes in zip(dimension_ids, positions, codes_by_dimension):
            dimension_key = str(dimension_id)
            code = codes[position]
            labels = ((dimensions[dimension_key].get("category") or {}).get("label") or {})
            record[dimension_key] = code
            record[f"{dimension_key}__label"] = labels.get(code, code)
        records.append(record)
    return records


def parse_records(response: requests.Response, source: dict[str, Any]) -> list[dict[str, Any]]:
    fmt = str(source["format"]).lower()
    adapter = str(source.get("adapter") or "").lower()
    if adapter == "pxweb_json_stat2":
        if fmt != "json":
            raise ValueError("pxweb_json_stat2 adapter requires format=json")
        return flatten_json_stat2(response.json())
    if fmt == "json":
        records = lookup(response.json(), source.get("records_path"))
        if isinstance(records, dict):
            records = list(records.values())
    elif fmt == "csv":
        records = list(
            csv.DictReader(
                io.StringIO(response.content.decode(source.get("encoding", "utf-8-sig"))),
                delimiter=source.get("delimiter", ","),
            )
        )
    else:
        raise ValueError(f"Unsupported source format: {fmt}")
    if not isinstance(records, list):
        raise RuntimeError(f"records_path for {source['source_id']} did not produce a list")
    return records


def request_source(session: requests.Session, source: dict[str, Any]) -> requests.Response:
    method = str(source.get("method") or "GET").upper()
    headers = {str(k): str(v) for k, v in (source.get("headers") or {}).items()}
    kwargs: dict[str, Any] = {
        "timeout": int(source.get("timeout_seconds") or 120),
        "headers": headers,
        "params": source.get("params") or None,
    }
    if method == "POST":
        kwargs["json"] = source.get("request_json")
        response = session.post(source["url"], **kwargs)
    elif method == "GET":
        response = session.get(source["url"], **kwargs)
    else:
        raise ValueError(f"Unsupported HTTP method: {method}")
    response.raise_for_status()
    return response


def main() -> None:
    parser = argparse.ArgumentParser(description="Load real numeric metrics from official national statistical offices.")
    parser.add_argument("--config", type=Path, default=ROOT / "configs" / "national_statistics_sources.release.json")
    args = parser.parse_args()
    config = json.loads(args.config.read_text(encoding="utf-8"))
    sources = config.get("sources") or []
    if len(sources) < 4:
        raise SystemExit("Configuration must contain at least four real official national statistical office sources.")
    registry_release_year = max(
        int(source.get("source_release_year") or source.get("release_year") or datetime.now().year)
        for source in sources
    )

    hosts: set[str] = set()
    countries: set[str] = set()
    rows_loaded = 0
    retrieved = now()
    timestamp = retrieved.replace(":", "").replace("-", "")
    session = requests.Session()
    session.headers["User-Agent"] = config.get("user_agent") or "MGIMO-GIIP/1.0 responsible-data-ingestion"

    with connect() as conn:
        migrate_schema(conn)
        migrate_final_schema(conn)
        conn.execute(
            """INSERT OR REPLACE INTO source_registry(source_id,source_code,source_name,title,owner,url,source_url,
              access_mode,update_frequency,license_or_terms,license_note,automation_status,source_role,retrieved_at,release_year,is_official,free_access)
              VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                SOURCE_ID, SOURCE_ID, "National statistical offices — numeric layer", "National statistics numeric layer",
                "National statistical offices", "local:configs/national_statistics_sources.release.json",
                "local:configs/national_statistics_sources.release.json", "official CSV/JSON endpoints", "source-specific",
                "Source-specific official terms", "Distribution decisions are recorded separately.", "configured",
                "numeric_source", retrieved, registry_release_year, 1, 1,
            ),
        )

        for source in sources:
            parsed = urlparse(source["url"])
            expected_host = str(source["official_host"]).lower().strip(".")
            actual_host = (parsed.hostname or "").lower().strip(".")
            if parsed.scheme != "https" or not (actual_host == expected_host or actual_host.endswith("." + expected_host)):
                raise SystemExit(
                    f"Official host mismatch for {source['source_id']}: URL host {actual_host}, expected {expected_host}"
                )

            response = request_source(session, source)
            fmt = str(source["format"]).lower()
            source_release_year = int(
                source.get("source_release_year") or source.get("release_year") or registry_release_year
            )
            extension = "json" if fmt == "json" else "csv"
            raw_dir = ROOT / "data" / "raw" / SOURCE_ID / source["source_id"]
            raw_dir.mkdir(parents=True, exist_ok=True)
            raw_path = raw_dir / f"{timestamp}.{extension}"
            raw_path.write_bytes(response.content)
            digest = sha256(raw_path)
            snapshot_id = f"{SOURCE_ID}:{source['source_id']}:{timestamp}"
            conn.execute(
                """INSERT OR REPLACE INTO raw_snapshots(snapshot_id,source_id,release_year,retrieved_at,source_url,raw_snapshot_path,
                  raw_snapshot_sha256,content_type,bytes_count,is_official,license_or_terms) VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    snapshot_id, SOURCE_ID, source_release_year, retrieved, source["url"], str(raw_path.relative_to(ROOT)), digest,
                    response.headers.get("content-type") or ("application/json" if fmt == "json" else "text/csv"),
                    raw_path.stat().st_size, 1, source.get("license_or_terms", "official source terms"),
                ),
            )

            records = parse_records(response, source)

            fields = source["fields"]
            fixed = source.get("fixed") or {}
            source_rows = 0
            transform_run_id = f"NATIONAL_STATS_PARSE:{source['source_id']}:{timestamp}"
            component_code = str(source.get("htei_component_code") or "").upper()
            include_in_htei = bool(source.get("include_in_htei")) and component_code in HTEI_COMPONENTS
            for record in records[: int(source.get("max_records") or len(records))]:
                if not isinstance(record, dict):
                    continue
                try:
                    metric_code = str(field(record, "metric_code", fields, fixed)).strip()
                    year = int(float(field(record, "year", fields, fixed)))
                    value = numeric(field(record, "value", fields, fixed), str(source.get("decimal") or "."))
                    unit = str(field(record, "unit", fields, fixed)).strip()
                    name_ru = str(field(record, "metric_name_ru", fields, fixed)).strip()
                    name_en = str(field(record, "metric_name_en", fields, fixed)).strip()
                except (TypeError, ValueError, KeyError, IndexError):
                    continue
                if not (1900 <= year <= 2026) or not (float("-inf") < value < float("inf")):
                    continue

                metric_id = f"{SOURCE_ID}:{source['source_id']}:{source['iso3']}:{metric_code}:{year}"
                provenance = {
                    "source_id": source["source_id"], "source_url": source["url"], "snapshot_id": snapshot_id,
                    "raw_snapshot_path": str(raw_path.relative_to(ROOT)), "raw_snapshot_sha256": digest,
                    "source_release_year": source_release_year,
                    "source_version": source.get("source_version"),
                    "source_terms": source.get("license_or_terms"),
                    "source_terms_url": source.get("source_terms_url"),
                    "record": record,
                    "configuration": {
                        k: source.get(k)
                        for k in ("adapter", "records_path", "fields", "fixed", "params", "request_json")
                    },
                }
                conn.execute(
                    """INSERT OR REPLACE INTO national_statistics_metrics(metric_id,iso3,metric_code,metric_name_ru,metric_name_en,
                      year,value,unit,statistical_office,official_host,source_url,retrieved_at,raw_snapshot_path,raw_snapshot_sha256,transform_id,provenance_json)
                      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (
                        metric_id, source["iso3"], metric_code, name_ru, name_en, year, value, unit,
                        source["statistical_office"], expected_host, source["url"], retrieved,
                        str(raw_path.relative_to(ROOT)), digest, "national_stats_configured_v3",
                        json.dumps(provenance, ensure_ascii=False, sort_keys=True),
                    ),
                )
                if include_in_htei:
                    observation_id = f"{SOURCE_ID}:{source['source_id']}:{source['iso3']}:{component_code}:{metric_code}:{year}"
                    observation_provenance = {
                        **provenance,
                        "component_code": component_code,
                        "national_series_is_direct_input": True,
                        "selection_requires_rebuilding_htei": True,
                    }
                    conn.execute(
                        """INSERT OR REPLACE INTO source_observations(
                          observation_id,index_code,component_code,iso3,year,source_data_year,raw_value,unit,normalized_score,
                          selected,source_id,source_group,source_priority,indicator_code,dimensions_json,selection_rule,source_url,
                          retrieved_at,release_year,raw_snapshot_path,raw_snapshot_sha256,transformation_run_id,transform_id,
                          quality_flag,provenance_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                        (
                            observation_id, "HTEI", component_code, source["iso3"], year, year, value, unit, None, 1,
                            SOURCE_ID, "NATIONAL_STATS", int(source.get("source_priority") or 1), metric_code,
                            json.dumps({"statistical_office": source["statistical_office"], "official_host": expected_host}, sort_keys=True),
                            "official national-statistics series; latest comparable observation selected during HTEI rebuild",
                            source["url"], retrieved, source_release_year, str(raw_path.relative_to(ROOT)), digest, transform_run_id,
                            "national_stats_configured_v3", "official_national_numeric",
                            json.dumps(observation_provenance, ensure_ascii=False, sort_keys=True),
                        ),
                    )
                source_rows += 1
                rows_loaded += 1

            if source_rows == 0:
                raise RuntimeError(f"No numeric rows parsed from {source['source_id']}")
            conn.execute(
                """INSERT OR REPLACE INTO transformation_runs(transformation_run_id,transform_id,source_id,snapshot_id,
                  started_at,completed_at,code_version,rows_loaded,notes) VALUES(?,?,?,?,?,?,?,?,?)""",
                (
                    transform_run_id, "national_stats_configured_v3", SOURCE_ID, snapshot_id, retrieved, now(),
                    "GIIP-final-release-v6", source_rows,
                    f"Official numeric rows parsed from {source['statistical_office']} ({expected_host})",
                ),
            )
            hosts.add(expected_host)
            countries.add(str(source["iso3"]).upper())
            time.sleep(float(source.get("polite_delay_seconds") or 0.2))

        threshold_ok = rows_loaded >= 20 and len(hosts) >= 4 and len(countries) >= 4
        completed = now()
        run_id = f"NATIONAL_STATISTICS_REFRESH:{timestamp}"
        conn.execute(
            """INSERT OR REPLACE INTO operational_runs(run_id,job_code,started_at,completed_at,status,attempts,rows_loaded,message,log_path,metadata_json)
              VALUES(?,?,?,?,?,?,?,?,?,?)""",
            (
                run_id, "NATIONAL_STATISTICS_REFRESH", retrieved, completed, "success" if threshold_ok else "failed", 1,
                rows_loaded, "Official national-statistics numeric layer ingested" if threshold_ok else "National-statistics release threshold not reached",
                "", json.dumps({"official_hosts": sorted(hosts), "countries": sorted(countries),
                                "threshold": {"rows": 20, "hosts": 4, "countries": 4}}, ensure_ascii=False, sort_keys=True),
            ),
        )
        conn.execute(
            """UPDATE source_registry SET retrieved_at=?,release_year=?,latest_snapshot_id=(
               SELECT snapshot_id FROM raw_snapshots WHERE source_id=? ORDER BY retrieved_at DESC LIMIT 1) WHERE source_id=?""",
            (retrieved, registry_release_year, SOURCE_ID, SOURCE_ID),
        )
        finalize_license_distribution_policy(conn)
        conn.commit()
        if threshold_ok:
            build_reproducibility_artifacts(conn)
            conn.commit()

    result = {"status": "ok" if threshold_ok else "failed", "rows_loaded": rows_loaded,
              "official_hosts": len(hosts), "countries": len(countries)}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if not threshold_ok:
        raise SystemExit("National-statistics numeric release threshold not reached.")


if __name__ == "__main__":
    main()
