#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import os
import pathlib
import sqlite3
import sys

DB = pathlib.Path(os.getenv("GIIP_DB", "data/global_index_platform.sqlite"))
ROOT = pathlib.Path(".").resolve()
if not DB.exists():
    print("DB not found; provenance gate cannot pass:", DB)
    raise SystemExit(1)


def sha256(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def resolve(value: str) -> pathlib.Path:
    return ROOT / value.replace("\\", "/")


conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
cur = conn.cursor()
tables = {r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()}
required = {"source_registry", "raw_snapshots", "transformation_runs", "index_formulas", "quality_flags", "reproducibility_artifacts"}
missing = sorted(required - tables)
if missing:
    print("Missing required provenance tables:", missing)
    raise SystemExit(1)

required_cols = {
    "index_scores": {"value_id", "source_id", "source_url", "retrieved_at", "release_year", "raw_snapshot_path",
                     "raw_snapshot_sha256", "transformation_run_id", "transform_id", "formula_version",
                     "quality_flag", "is_official", "is_recomputed", "provenance_json"},
    "component_values": {"value_id", "source_id", "source_url", "retrieved_at", "release_year", "raw_snapshot_path",
                         "raw_snapshot_sha256", "transformation_run_id", "transform_id", "formula_version",
                         "quality_flag", "is_official", "is_recomputed", "provenance_json"},
}
for table, needed in required_cols.items():
    if table not in tables:
        print("Missing value table:", table)
        raise SystemExit(1)
    cols = {r[1] for r in cur.execute(f"PRAGMA table_info({table})").fetchall()}
    if not needed.issubset(cols):
        print(f"{table} missing provenance cols:", sorted(needed - cols))
        raise SystemExit(1)
    null_expr = " OR ".join(f'{col} IS NULL OR {col}=""' for col in needed if col not in {"is_official", "is_recomputed"})
    bad = cur.execute(f"SELECT COUNT(*) AS n FROM {table} WHERE {null_expr}").fetchone()["n"]
    if bad:
        print(f"{table} has {bad} rows with incomplete provenance")
        raise SystemExit(1)
    broken = cur.execute(f"""SELECT COUNT(*) AS n FROM {table} value
        LEFT JOIN source_registry source ON source.source_id=value.source_id
        LEFT JOIN transformation_runs run ON run.transformation_run_id=value.transformation_run_id
        WHERE source.source_id IS NULL OR run.transformation_run_id IS NULL""").fetchone()["n"]
    if broken:
        print(f"{table} has {broken} rows with broken provenance links")
        raise SystemExit(1)

snapshots = cur.execute("SELECT * FROM raw_snapshots ORDER BY snapshot_id").fetchall()
if not snapshots:
    print("No raw snapshots registered")
    raise SystemExit(1)
covered = 0
for snapshot in snapshots:
    raw_path = resolve(snapshot["raw_snapshot_path"])
    raw_valid = raw_path.exists() and sha256(raw_path) == snapshot["raw_snapshot_sha256"]
    artifacts = cur.execute("SELECT * FROM reproducibility_artifacts WHERE snapshot_id=?", (snapshot["snapshot_id"],)).fetchall()
    valid_types: set[str] = set()
    for artifact in artifacts:
        path = resolve(artifact["artifact_path"])
        if path.exists() and sha256(path) == artifact["artifact_sha256"]:
            valid_types.add(artifact["artifact_type"])
    if raw_valid:
        valid_types.add("raw_included")
    if not ("raw_included" in valid_types or {"derived_export", "download_recipe"}.issubset(valid_types)):
        print("Snapshot is not reproducible from delivery:", snapshot["snapshot_id"], snapshot["raw_snapshot_path"], sorted(valid_types))
        raise SystemExit(1)
    covered += 1

score_count = cur.execute("SELECT COUNT(*) AS n FROM index_scores").fetchone()["n"]
if score_count < 500:
    print("Too few real score rows for release:", score_count)
    raise SystemExit(1)
print(f"source provenance gate passed: {covered}/{len(snapshots)} snapshots reproducible")
