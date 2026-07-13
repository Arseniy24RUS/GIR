from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Iterable, Mapping, Any

from .config import DB_PATH, DATA_DIR

SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS countries (
    iso3 TEXT PRIMARY KEY,
    iso2 TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    region TEXT NOT NULL,
    income_group TEXT NOT NULL,
    population_m REAL,
    flag TEXT
);

CREATE TABLE IF NOT EXISTS index_definitions (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    short_name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    short_name_en TEXT NOT NULL,
    theme TEXT NOT NULL,
    authority TEXT NOT NULL,
    url TEXT NOT NULL,
    description_ru TEXT NOT NULL,
    description_en TEXT NOT NULL,
    score_scale TEXT NOT NULL,
    rank_direction TEXT NOT NULL DEFAULT 'desc',
    recompute_mode TEXT NOT NULL,
    official_or_derived TEXT NOT NULL,
    is_tz_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS indices (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    short_name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    short_name_en TEXT NOT NULL,
    theme TEXT NOT NULL,
    authority TEXT NOT NULL,
    url TEXT NOT NULL,
    description_ru TEXT NOT NULL,
    description_en TEXT NOT NULL,
    score_scale TEXT NOT NULL,
    rank_direction TEXT NOT NULL DEFAULT 'desc',
    recompute_mode TEXT NOT NULL,
    official_or_derived TEXT NOT NULL,
    is_tz_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS index_aliases (
    alias TEXT PRIMARY KEY,
    index_code TEXT NOT NULL REFERENCES index_definitions(code) ON DELETE CASCADE,
    lang TEXT NOT NULL,
    display_label TEXT NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS index_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    index_code TEXT NOT NULL REFERENCES index_definitions(code) ON DELETE CASCADE,
    component_code TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    weight REAL NOT NULL,
    source_note TEXT,
    UNIQUE(index_code, component_code)
);

CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    index_code TEXT NOT NULL REFERENCES indices(code) ON DELETE CASCADE,
    component_code TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    weight REAL NOT NULL,
    source_note TEXT,
    UNIQUE(index_code, component_code)
);

CREATE TABLE IF NOT EXISTS source_registry (
    source_id TEXT PRIMARY KEY,
    source_code TEXT NOT NULL UNIQUE,
    source_name TEXT NOT NULL,
    title TEXT NOT NULL,
    owner TEXT NOT NULL,
    url TEXT NOT NULL,
    source_url TEXT NOT NULL,
    access_mode TEXT NOT NULL,
    update_frequency TEXT NOT NULL,
    license_or_terms TEXT NOT NULL,
    license_note TEXT NOT NULL,
    automation_status TEXT NOT NULL,
    source_role TEXT NOT NULL DEFAULT 'numeric_source',
    retrieved_at TEXT,
    release_year INTEGER,
    latest_snapshot_id TEXT,
    is_official INTEGER NOT NULL DEFAULT 1,
    free_access INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS raw_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES source_registry(source_id) ON DELETE CASCADE,
    release_year INTEGER NOT NULL,
    retrieved_at TEXT NOT NULL,
    source_url TEXT NOT NULL,
    raw_snapshot_path TEXT NOT NULL,
    raw_snapshot_sha256 TEXT NOT NULL,
    content_type TEXT,
    bytes_count INTEGER NOT NULL,
    is_official INTEGER NOT NULL DEFAULT 1,
    license_or_terms TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transformation_runs (
    transformation_run_id TEXT PRIMARY KEY,
    transform_id TEXT NOT NULL,
    source_id TEXT NOT NULL REFERENCES source_registry(source_id) ON DELETE CASCADE,
    snapshot_id TEXT NOT NULL REFERENCES raw_snapshots(snapshot_id) ON DELETE CASCADE,
    started_at TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    code_version TEXT NOT NULL,
    rows_loaded INTEGER NOT NULL,
    notes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS index_formulas (
    index_code TEXT NOT NULL REFERENCES index_definitions(code) ON DELETE CASCADE,
    formula_version TEXT NOT NULL,
    formula_text_ru TEXT NOT NULL,
    formula_text_en TEXT NOT NULL,
    method_notes_ru TEXT NOT NULL,
    method_notes_en TEXT NOT NULL,
    weights_json TEXT NOT NULL,
    normalization_ru TEXT NOT NULL,
    normalization_en TEXT NOT NULL,
    official_formula_available INTEGER NOT NULL DEFAULT 1,
    source_id TEXT NOT NULL REFERENCES source_registry(source_id),
    PRIMARY KEY(index_code, formula_version)
);

CREATE TABLE IF NOT EXISTS index_scores (
    value_id TEXT PRIMARY KEY,
    index_code TEXT NOT NULL REFERENCES index_definitions(code) ON DELETE CASCADE,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    source_data_year INTEGER,
    score REAL NOT NULL,
    rank INTEGER NOT NULL,
    percentile REAL,
    rank_delta_1y INTEGER,
    rank_delta_5y INTEGER,
    data_quality REAL NOT NULL DEFAULT 1.0,
    source_type TEXT NOT NULL DEFAULT 'official_snapshot',
    source_id TEXT NOT NULL REFERENCES source_registry(source_id),
    source_url TEXT NOT NULL,
    retrieved_at TEXT NOT NULL,
    release_year INTEGER NOT NULL,
    raw_snapshot_path TEXT NOT NULL,
    raw_snapshot_sha256 TEXT NOT NULL,
    transformation_run_id TEXT NOT NULL REFERENCES transformation_runs(transformation_run_id),
    transform_id TEXT NOT NULL,
    formula_version TEXT NOT NULL,
    quality_flag TEXT NOT NULL,
    is_official INTEGER NOT NULL DEFAULT 1,
    is_recomputed INTEGER NOT NULL DEFAULT 0,
    provenance_json TEXT NOT NULL,
    UNIQUE(index_code, iso3, year)
);

CREATE TABLE IF NOT EXISTS component_values (
    value_id TEXT PRIMARY KEY,
    index_code TEXT NOT NULL REFERENCES index_definitions(code) ON DELETE CASCADE,
    component_code TEXT NOT NULL,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    source_data_year INTEGER,
    raw_value REAL NOT NULL,
    unit TEXT NOT NULL,
    normalized_score REAL NOT NULL,
    weighted_contribution REAL NOT NULL,
    gap_to_frontier REAL NOT NULL,
    gap_to_peer_group REAL NOT NULL,
    weighted_gap REAL NOT NULL,
    rank_leverage REAL NOT NULL,
    actionability REAL NOT NULL,
    priority_score REAL NOT NULL,
    source_id TEXT NOT NULL REFERENCES source_registry(source_id),
    source_url TEXT NOT NULL,
    retrieved_at TEXT NOT NULL,
    release_year INTEGER NOT NULL,
    raw_snapshot_path TEXT NOT NULL,
    raw_snapshot_sha256 TEXT NOT NULL,
    transformation_run_id TEXT NOT NULL REFERENCES transformation_runs(transformation_run_id),
    transform_id TEXT NOT NULL,
    formula_version TEXT NOT NULL,
    quality_flag TEXT NOT NULL,
    is_official INTEGER NOT NULL DEFAULT 0,
    is_recomputed INTEGER NOT NULL DEFAULT 1,
    source_note TEXT,
    provenance_json TEXT NOT NULL,
    UNIQUE(index_code, component_code, iso3, year)
);

CREATE TABLE IF NOT EXISTS source_observations (
    observation_id TEXT PRIMARY KEY,
    index_code TEXT NOT NULL,
    component_code TEXT NOT NULL,
    iso3 TEXT NOT NULL,
    year INTEGER NOT NULL,
    source_data_year INTEGER,
    raw_value REAL NOT NULL,
    unit TEXT NOT NULL,
    normalized_score REAL,
    selected INTEGER NOT NULL DEFAULT 0,
    source_id TEXT NOT NULL REFERENCES source_registry(source_id),
    source_group TEXT NOT NULL,
    source_priority INTEGER NOT NULL,
    indicator_code TEXT NOT NULL,
    dimensions_json TEXT NOT NULL,
    selection_rule TEXT NOT NULL,
    source_url TEXT NOT NULL,
    retrieved_at TEXT NOT NULL,
    release_year INTEGER NOT NULL,
    raw_snapshot_path TEXT NOT NULL,
    raw_snapshot_sha256 TEXT NOT NULL,
    transformation_run_id TEXT NOT NULL REFERENCES transformation_runs(transformation_run_id),
    transform_id TEXT NOT NULL,
    quality_flag TEXT NOT NULL,
    provenance_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rankings (
    index_code TEXT NOT NULL REFERENCES index_definitions(code) ON DELETE CASCADE,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    score REAL NOT NULL,
    percentile REAL,
    value_id TEXT NOT NULL REFERENCES index_scores(value_id) ON DELETE CASCADE,
    PRIMARY KEY(index_code, iso3, year)
);

CREATE TABLE IF NOT EXISTS qs_institution_rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    score_nid TEXT,
    nid TEXT,
    core_id TEXT,
    title TEXT NOT NULL,
    qs_path TEXT,
    region TEXT,
    country TEXT NOT NULL,
    iso3 TEXT,
    city TEXT,
    overall_score REAL,
    rank_display TEXT,
    rank INTEGER,
    indicators_json TEXT NOT NULL,
    source_id TEXT NOT NULL REFERENCES source_registry(source_id),
    source_url TEXT NOT NULL,
    retrieved_at TEXT NOT NULL,
    raw_snapshot_path TEXT NOT NULL,
    raw_snapshot_sha256 TEXT NOT NULL,
    quality_flag TEXT NOT NULL,
    UNIQUE(year, score_nid, title, country)
);

CREATE TABLE IF NOT EXISTS diagnostics (
    diagnostic_id TEXT PRIMARY KEY,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    index_code TEXT NOT NULL REFERENCES index_definitions(code) ON DELETE CASCADE,
    component_code TEXT,
    year INTEGER NOT NULL,
    gap_to_frontier REAL NOT NULL,
    gap_to_peer_group REAL NOT NULL,
    weighted_gap REAL NOT NULL,
    rank_leverage REAL NOT NULL,
    actionability REAL NOT NULL,
    data_quality REAL NOT NULL,
    priority_score REAL NOT NULL,
    weakest_component TEXT,
    highest_leverage_component TEXT,
    explanation_ru TEXT NOT NULL,
    explanation_en TEXT NOT NULL,
    source_value_id TEXT
);

CREATE TABLE IF NOT EXISTS training_model_scores (
    value_id TEXT PRIMARY KEY,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    requested_year INTEGER NOT NULL,
    score REAL NOT NULL,
    rank INTEGER NOT NULL,
    percentile REAL,
    data_quality REAL NOT NULL,
    available_block_weight REAL NOT NULL,
    source_group_coverage TEXT NOT NULL,
    formula_version TEXT NOT NULL,
    quality_flag TEXT NOT NULL,
    provenance_json TEXT NOT NULL,
    UNIQUE(iso3, year)
);

CREATE TABLE IF NOT EXISTS training_model_components (
    value_id TEXT PRIMARY KEY,
    model_value_id TEXT NOT NULL REFERENCES training_model_scores(value_id) ON DELETE CASCADE,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    block_code TEXT NOT NULL,
    block_name_ru TEXT NOT NULL,
    block_name_en TEXT NOT NULL,
    component_ref TEXT NOT NULL,
    component_name_ru TEXT NOT NULL,
    component_name_en TEXT NOT NULL,
    source_value_id TEXT,
    source_data_year INTEGER,
    raw_value REAL,
    normalized_score REAL NOT NULL,
    weight REAL NOT NULL,
    weighted_contribution REAL NOT NULL,
    source_id TEXT,
    source_group TEXT,
    quality_flag TEXT NOT NULL,
    provenance_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quality_flags (
    quality_flag TEXT PRIMARY KEY,
    label_ru TEXT NOT NULL,
    label_en TEXT NOT NULL,
    severity INTEGER NOT NULL,
    description_ru TEXT NOT NULL,
    description_en TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ui_translations (
    key TEXT NOT NULL,
    lang TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY(key, lang)
);

CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    index_code TEXT NOT NULL REFERENCES indices(code) ON DELETE CASCADE,
    component_code TEXT NOT NULL,
    year INTEGER NOT NULL DEFAULT 2025,
    priority_score REAL NOT NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT NOT NULL,
    text_ru TEXT NOT NULL,
    text_en TEXT NOT NULL,
    horizon TEXT NOT NULL,
    policy_area TEXT NOT NULL
);
"""


def source_role_for(source_id: str, automation_status: str | None = None) -> str:
    if source_id in {"WORLD_BANK_COUNTRIES"}:
        return "reference_metadata"
    if source_id in {"NATIONAL_STATS_HTEI", "CORPORATE_REPORTS_HTEI", "SPECIALIZED_RATINGS_HTEI"}:
        return "audit_register"
    if automation_status and "audit_register" in automation_status:
        return "audit_register"
    if source_id in {"HTEI_MULTI_SOURCE"}:
        return "qualitative_evidence"
    return "numeric_source"


def migrate_schema(conn: sqlite3.Connection) -> None:
    existing_tables = {
        r["name"]
        for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    }
    if "source_registry" not in existing_tables:
        return
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(source_registry)").fetchall()}
    if "source_role" not in cols:
        conn.execute("ALTER TABLE source_registry ADD COLUMN source_role TEXT NOT NULL DEFAULT 'numeric_source'")
    for r in conn.execute("SELECT source_id, automation_status FROM source_registry").fetchall():
        conn.execute(
            "UPDATE source_registry SET source_role=? WHERE source_id=?",
            (source_role_for(r["source_id"], r["automation_status"]), r["source_id"]),
        )
    conn.commit()


def connect(db_path: Path | str | None = DB_PATH) -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if db_path is None:
        db_path = DB_PATH
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    migrate_schema(conn)
    return conn


def init_db(db_path: Path | str | None = DB_PATH, reset: bool = False) -> None:
    if db_path is None:
        db_path = DB_PATH
    db_path = Path(db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if reset and db_path.exists():
        db_path.unlink()
    with connect(db_path) as conn:
        conn.executescript(SCHEMA)
        migrate_schema(conn)


def rows(conn: sqlite3.Connection, sql: str, params: tuple = ()) -> list[dict[str, Any]]:
    return [dict(r) for r in conn.execute(sql, params).fetchall()]


def row(conn: sqlite3.Connection, sql: str, params: tuple = ()) -> dict[str, Any] | None:
    r = conn.execute(sql, params).fetchone()
    return dict(r) if r else None


def upsert_many(conn: sqlite3.Connection, table: str, items: Iterable[Mapping[str, Any]]) -> None:
    items = list(items)
    if not items:
        return
    cols = list(items[0].keys())
    placeholders = ','.join(['?'] * len(cols))
    col_sql = ','.join(cols)
    conn.executemany(
        f"INSERT OR REPLACE INTO {table} ({col_sql}) VALUES ({placeholders})",
        [[item.get(c) for c in cols] for item in items],
    )

# Scientific-release extension. Kept separate so existing customer databases can be
# migrated in-place without rebuilding official snapshots.
SCIENTIFIC_SCHEMA = r'''
CREATE TABLE IF NOT EXISTS index_methodology_registry (
    index_code TEXT PRIMARY KEY,
    score_status TEXT NOT NULL,
    component_status TEXT NOT NULL,
    formula_status TEXT NOT NULL,
    methodology_version TEXT NOT NULL,
    label_ru TEXT NOT NULL,
    label_en TEXT NOT NULL,
    warning_ru TEXT NOT NULL,
    warning_en TEXT NOT NULL,
    source_url TEXT,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS htei_v5_profiles (
    profile_id TEXT PRIMARY KEY,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    release_year INTEGER NOT NULL,
    requested_year INTEGER NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('comparable_core','comparable_extended','asof_diagnostic')),
    substantive_score REAL NOT NULL,
    rank INTEGER,
    percentile REAL,
    confidence_score REAL NOT NULL,
    coverage_class TEXT NOT NULL,
    freshness_class TEXT NOT NULL,
    available_components INTEGER NOT NULL,
    available_weight REAL NOT NULL,
    source_group_count INTEGER NOT NULL,
    oldest_source_year INTEGER NOT NULL,
    newest_source_year INTEGER NOT NULL,
    average_lag REAL NOT NULL,
    score_low REAL,
    score_high REAL,
    rank_low INTEGER,
    rank_high INTEGER,
    eligible_for_ranking INTEGER NOT NULL DEFAULT 0,
    eligibility_reasons_json TEXT NOT NULL,
    formula_version TEXT NOT NULL,
    methodology_status TEXT NOT NULL,
    provenance_json TEXT NOT NULL,
    UNIQUE(iso3, release_year, mode)
);

CREATE TABLE IF NOT EXISTS htei_v5_component_values (
    value_id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES htei_v5_profiles(profile_id) ON DELETE CASCADE,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    release_year INTEGER NOT NULL,
    mode TEXT NOT NULL,
    component_code TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    raw_value REAL NOT NULL,
    unit TEXT NOT NULL,
    normalized_score REAL NOT NULL,
    base_weight REAL NOT NULL,
    effective_weight REAL NOT NULL,
    weighted_contribution REAL NOT NULL,
    source_id TEXT NOT NULL REFERENCES source_registry(source_id),
    source_group TEXT NOT NULL,
    source_data_year INTEGER NOT NULL,
    data_lag INTEGER NOT NULL,
    indicator_code TEXT NOT NULL,
    proxy_status TEXT NOT NULL,
    interpretation_ru TEXT NOT NULL,
    interpretation_en TEXT NOT NULL,
    selection_rule TEXT NOT NULL,
    source_url TEXT NOT NULL,
    retrieved_at TEXT NOT NULL,
    raw_snapshot_path TEXT NOT NULL,
    raw_snapshot_sha256 TEXT NOT NULL,
    quality_flag TEXT NOT NULL,
    provenance_json TEXT NOT NULL,
    UNIQUE(profile_id, component_code)
);

CREATE TABLE IF NOT EXISTS methodology_audit_runs (
    audit_id TEXT PRIMARY KEY,
    model_code TEXT NOT NULL,
    release_year INTEGER NOT NULL,
    methodology_version TEXT NOT NULL,
    run_count INTEGER NOT NULL,
    countries INTEGER NOT NULL,
    mean_spearman REAL,
    min_spearman REAL,
    mean_absolute_rank_change REAL,
    max_rank_change INTEGER,
    sensitivity_passed INTEGER NOT NULL,
    results_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS policy_brief_items (
    item_id TEXT PRIMARY KEY,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    priority INTEGER NOT NULL,
    title_ru TEXT NOT NULL,
    title_en TEXT NOT NULL,
    problem_ru TEXT NOT NULL,
    problem_en TEXT NOT NULL,
    indicator_ru TEXT NOT NULL,
    indicator_en TEXT NOT NULL,
    current_value REAL,
    unit TEXT,
    source_data_year INTEGER,
    source_id TEXT,
    benchmark_ru TEXT NOT NULL,
    benchmark_en TEXT NOT NULL,
    measure_ru TEXT NOT NULL,
    measure_en TEXT NOT NULL,
    actor_ru TEXT NOT NULL,
    actor_en TEXT NOT NULL,
    horizon TEXT NOT NULL,
    target_kpi_ru TEXT NOT NULL,
    target_kpi_en TEXT NOT NULL,
    expected_effect_ru TEXT NOT NULL,
    expected_effect_en TEXT NOT NULL,
    risk_ru TEXT NOT NULL,
    risk_en TEXT NOT NULL,
    resources_ru TEXT NOT NULL,
    resources_en TEXT NOT NULL,
    monitoring_ru TEXT NOT NULL,
    monitoring_en TEXT NOT NULL,
    relation_to_tz TEXT NOT NULL,
    evidence_value_id TEXT,
    editorial_status TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS national_statistics_metrics (
    metric_id TEXT PRIMARY KEY,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    metric_code TEXT NOT NULL,
    metric_name_ru TEXT NOT NULL,
    metric_name_en TEXT NOT NULL,
    year INTEGER NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    statistical_office TEXT NOT NULL,
    official_host TEXT NOT NULL,
    source_url TEXT NOT NULL,
    retrieved_at TEXT NOT NULL,
    raw_snapshot_path TEXT NOT NULL,
    raw_snapshot_sha256 TEXT NOT NULL,
    transform_id TEXT NOT NULL,
    provenance_json TEXT NOT NULL,
    UNIQUE(iso3, metric_code, year, source_url)
);

CREATE TABLE IF NOT EXISTS corporate_metrics (
    metric_id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    metric_code TEXT NOT NULL,
    metric_name_ru TEXT NOT NULL,
    metric_name_en TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    source_system TEXT NOT NULL,
    source_url TEXT NOT NULL,
    retrieved_at TEXT NOT NULL,
    raw_snapshot_path TEXT NOT NULL,
    raw_snapshot_sha256 TEXT NOT NULL,
    transform_id TEXT NOT NULL,
    provenance_json TEXT NOT NULL,
    UNIQUE(company_id, metric_code, fiscal_year)
);

CREATE TABLE IF NOT EXISTS license_registry (
    source_id TEXT PRIMARY KEY REFERENCES source_registry(source_id) ON DELETE CASCADE,
    terms_url TEXT NOT NULL,
    terms_version_date TEXT,
    storage_allowed INTEGER,
    transformation_allowed INTEGER,
    redistribution_allowed INTEGER,
    attribution_required TEXT,
    release_archive_decision TEXT NOT NULL DEFAULT 'pending',
    review_status TEXT NOT NULL DEFAULT 'pending_legal_review',
    reviewer_name TEXT,
    reviewed_at TEXT,
    evidence_path TEXT,
    notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS external_method_reviews (
    review_id TEXT PRIMARY KEY,
    reviewer_name TEXT NOT NULL,
    affiliation TEXT NOT NULL,
    expertise TEXT NOT NULL,
    independence_statement TEXT NOT NULL,
    methodology_version TEXT NOT NULL,
    decision TEXT NOT NULL CHECK(decision IN ('approved','approved_with_conditions','rejected')),
    review_date TEXT NOT NULL,
    document_path TEXT NOT NULL,
    document_sha256 TEXT NOT NULL,
    conditions_json TEXT NOT NULL,
    imported_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS operational_runs (
    run_id TEXT PRIMARY KEY,
    job_code TEXT NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    status TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 1,
    rows_loaded INTEGER NOT NULL DEFAULT 0,
    message TEXT NOT NULL DEFAULT '',
    log_path TEXT,
    metadata_json TEXT NOT NULL DEFAULT '{}'
);
'''

# Wrap the existing migration function with the scientific extension. This is
# intentionally defined after the original function so all existing callers keep
# working while every connection receives the additional release tables.
_original_migrate_schema = migrate_schema

def migrate_schema(conn: sqlite3.Connection) -> None:  # type: ignore[override]
    _original_migrate_schema(conn)
    conn.executescript(SCIENTIFIC_SCHEMA)
    conn.commit()
