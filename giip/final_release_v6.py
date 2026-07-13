from __future__ import annotations

import csv
import gzip
import hashlib
import json
import math
import re
import sqlite3
import statistics
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from .config import DB_PATH
from .db import connect, row, rows
from .scientific_release import HTEI_WEIGHTS, COMPONENT_META, RELEASE_YEAR

PROJECT_ROOT = Path(__file__).resolve().parents[1]
FINAL_RELEASE_VERSION = "GIIP-final-release-v6"
HTEI_V6_FORMULA_VERSION = "htei-v6-common-support-2026"
FINAL_RELEASE_TIMESTAMP = "2026-07-11T00:00:00+00:00"
COMMON_SUPPORT_COMPONENTS = (
    "HT_EMPLOYMENT_SHARE",
    "HIGH_TECH_OCCUPATIONS",
    "STEM_PIPELINE",
    "TECH_OUTPUTS",
)
DIRECT_SOURCE_GROUPS = {"EUROSTAT", "NATIONAL_STATS"}

FINAL_SCHEMA = r'''
CREATE TABLE IF NOT EXISTS htei_v6_profiles (
    profile_id TEXT PRIMARY KEY,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    release_year INTEGER NOT NULL,
    mode TEXT NOT NULL CHECK(mode IN ('direct_core','common_support','proxy_extended','asof_diagnostic')),
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
    direct_data_tier INTEGER NOT NULL DEFAULT 0,
    component_signature TEXT NOT NULL,
    formula_version TEXT NOT NULL,
    methodology_status TEXT NOT NULL,
    provenance_json TEXT NOT NULL,
    UNIQUE(iso3, release_year, mode)
);

CREATE TABLE IF NOT EXISTS htei_v6_component_values (
    value_id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES htei_v6_profiles(profile_id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS htei_v6_missingness_audit (
    audit_key TEXT PRIMARY KEY,
    release_year INTEGER NOT NULL,
    mode TEXT NOT NULL,
    component_signature TEXT NOT NULL,
    countries INTEGER NOT NULL,
    mean_score REAL,
    mean_rank REAL,
    median_rank REAL,
    mean_confidence REAL,
    rank_shift_vs_common_support REAL,
    results_json TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hci_plus_country_scores (
    value_id TEXT PRIMARY KEY,
    iso3 TEXT NOT NULL REFERENCES countries(iso3) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    score REAL NOT NULL,
    rank INTEGER NOT NULL,
    percentile REAL,
    health_score REAL NOT NULL,
    education_score REAL NOT NULL,
    employment_score REAL NOT NULL,
    women_score REAL,
    men_score REAL,
    source_id TEXT NOT NULL REFERENCES source_registry(source_id),
    source_url TEXT NOT NULL,
    retrieved_at TEXT NOT NULL,
    raw_snapshot_path TEXT NOT NULL,
    raw_snapshot_sha256 TEXT NOT NULL,
    quality_flag TEXT NOT NULL,
    provenance_json TEXT NOT NULL,
    UNIQUE(iso3, year)
);

CREATE TABLE IF NOT EXISTS reproducibility_artifacts (
    artifact_id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES raw_snapshots(snapshot_id) ON DELETE CASCADE,
    artifact_type TEXT NOT NULL CHECK(artifact_type IN ('raw_included','derived_export','download_recipe')),
    artifact_path TEXT NOT NULL,
    artifact_sha256 TEXT NOT NULL,
    rows_exported INTEGER NOT NULL DEFAULT 0,
    source_url TEXT NOT NULL,
    expected_raw_sha256 TEXT NOT NULL,
    distribution_decision TEXT NOT NULL,
    metadata_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(snapshot_id, artifact_type)
);
'''


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def migrate_final_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(FINAL_SCHEMA)
    conn.commit()


def _profile_components(conn: sqlite3.Connection, profile_id: str) -> list[dict[str, Any]]:
    return rows(conn, "SELECT * FROM htei_v5_component_values WHERE profile_id=? ORDER BY component_code", (profile_id,))


def _confidence(components: list[dict[str, Any]], release_year: int) -> tuple[float, str, str]:
    if not components:
        return 0.0, "missing", "stale"
    lags = [max(0, release_year - int(c["source_data_year"])) for c in components]
    freshness = max(0.0, 1.0 - statistics.mean(lags) / 12.0)
    coverage = min(1.0, len(components) / 6.0)
    source_diversity = min(1.0, len({c["source_group"] for c in components}) / 4.0)
    q = round(0.45 * coverage + 0.35 * freshness + 0.20 * source_diversity, 4)
    coverage_class = "complete" if len(components) == 6 else "substantial" if len(components) >= 4 else "limited"
    avg_lag = statistics.mean(lags)
    freshness_class = "current" if avg_lag <= 2 else "recent" if avg_lag <= 5 else "stale"
    return q, coverage_class, freshness_class


def _insert_profile(
    conn: sqlite3.Connection,
    *,
    iso3: str,
    mode: str,
    components: list[dict[str, Any]],
    direct_data_tier: bool,
    formula_version: str,
) -> dict[str, Any]:
    release_year = RELEASE_YEAR
    base_total = sum(HTEI_WEIGHTS[c["component_code"]] for c in components)
    if base_total <= 0:
        raise ValueError("Invalid component weight total")
    score = sum(float(c["normalized_score"]) * HTEI_WEIGHTS[c["component_code"]] / base_total for c in components)
    score = round(score, 6)
    q, coverage_class, freshness_class = _confidence(components, release_year)
    years = [int(c["source_data_year"]) for c in components]
    signature = "+".join(sorted(c["component_code"] for c in components))
    profile_id = f"HTEI_V6:{mode}:{release_year}:{iso3}"
    eligible = int(mode != "asof_diagnostic")
    provenance = {
        "methodology_version": FINAL_RELEASE_VERSION,
        "formula_version": formula_version,
        "mode": mode,
        "component_signature": signature,
        "direct_data_tier": bool(direct_data_tier),
        "quality_is_separate_from_score": True,
        "source_profiles": [c["profile_id"] for c in components if c.get("profile_id")],
    }
    conn.execute(
        """INSERT OR REPLACE INTO htei_v6_profiles(
        profile_id,iso3,release_year,mode,substantive_score,rank,percentile,confidence_score,
        coverage_class,freshness_class,available_components,available_weight,source_group_count,
        oldest_source_year,newest_source_year,average_lag,score_low,score_high,rank_low,rank_high,
        eligible_for_ranking,direct_data_tier,component_signature,formula_version,methodology_status,provenance_json)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            profile_id, iso3, release_year, mode, score, None, None, q,
            coverage_class, freshness_class, len(components), base_total,
            len({c["source_group"] for c in components}), min(years), max(years),
            round(statistics.mean(release_year-y for y in years), 4),
            None, None, None, None, eligible, int(direct_data_tier), signature,
            formula_version, "final_release_methodology", json.dumps(provenance, ensure_ascii=False, sort_keys=True),
        ),
    )
    for c in components:
        code = c["component_code"]
        meta = COMPONENT_META[code]
        eff = HTEI_WEIGHTS[code] / base_total
        val_id = f"HTEI_V6:{mode}:{release_year}:{iso3}:{code}"
        cp = dict(c)
        cp.update({"v6_mode": mode, "effective_weight": eff, "component_signature": signature})
        conn.execute(
            """INSERT OR REPLACE INTO htei_v6_component_values(
            value_id,profile_id,iso3,release_year,mode,component_code,name_ru,name_en,raw_value,unit,
            normalized_score,base_weight,effective_weight,weighted_contribution,source_id,source_group,
            source_data_year,data_lag,indicator_code,proxy_status,interpretation_ru,interpretation_en,
            selection_rule,source_url,retrieved_at,raw_snapshot_path,raw_snapshot_sha256,quality_flag,provenance_json)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                val_id, profile_id, iso3, release_year, mode, code, meta["name_ru"], meta["name_en"],
                c["raw_value"], c["unit"], c["normalized_score"], HTEI_WEIGHTS[code], eff,
                float(c["normalized_score"]) * eff, c["source_id"], c["source_group"], c["source_data_year"],
                release_year-int(c["source_data_year"]), c["indicator_code"], c["proxy_status"],
                c["interpretation_ru"], c["interpretation_en"], c["selection_rule"], c["source_url"],
                c["retrieved_at"], c["raw_snapshot_path"], c["raw_snapshot_sha256"], c["quality_flag"],
                json.dumps(cp, ensure_ascii=False, sort_keys=True),
            ),
        )
    return {"profile_id": profile_id, "iso3": iso3, "score": score, "confidence": q, "signature": signature}


def _rank_mode(conn: sqlite3.Connection, mode: str) -> None:
    profiles = rows(conn, "SELECT profile_id,substantive_score FROM htei_v6_profiles WHERE release_year=? AND mode=? AND eligible_for_ranking=1 ORDER BY substantive_score DESC,profile_id", (RELEASE_YEAR, mode))
    total = len(profiles)
    for rank_no, p in enumerate(profiles, start=1):
        pct = round((total-rank_no+1)/total*100, 6) if total else None
        conn.execute("UPDATE htei_v6_profiles SET rank=?,percentile=? WHERE profile_id=?", (rank_no, pct, p["profile_id"]))


def build_htei_v6(conn: sqlite3.Connection) -> dict[str, Any]:
    migrate_final_schema(conn)
    conn.execute("DELETE FROM htei_v6_component_values")
    conn.execute("DELETE FROM htei_v6_profiles")
    conn.execute("DELETE FROM htei_v6_missingness_audit")

    v5_profiles = rows(conn, "SELECT * FROM htei_v5_profiles WHERE release_year=?", (RELEASE_YEAR,))
    by_iso_mode = {(p["iso3"], p["mode"]): p for p in v5_profiles}
    countries = sorted({p["iso3"] for p in v5_profiles})
    created: Counter[str] = Counter()

    for iso3 in countries:
        core = by_iso_mode.get((iso3, "comparable_core"))
        ext = by_iso_mode.get((iso3, "comparable_extended"))
        asof = by_iso_mode.get((iso3, "asof_diagnostic"))
        source = core or ext or asof
        if not source:
            continue
        comps = _profile_components(conn, source["profile_id"])
        by_code = {c["component_code"]: c for c in comps}

        # One formula for every country in the common-support ranking.
        if all(code in by_code for code in COMMON_SUPPORT_COMPONENTS):
            selected = [by_code[code] for code in COMMON_SUPPORT_COMPONENTS]
            if all(RELEASE_YEAR-int(c["source_data_year"]) <= 5 for c in selected):
                _insert_profile(conn, iso3=iso3, mode="common_support", components=selected,
                                direct_data_tier=False, formula_version=HTEI_V6_FORMULA_VERSION)
                created["common_support"] += 1

        # Direct-data tier: both labour components must come from direct Eurostat/national statistics.
        if all(code in by_code for code in COMMON_SUPPORT_COMPONENTS):
            selected = [by_code[code] for code in COMMON_SUPPORT_COMPONENTS]
            labour_direct = all(by_code[c]["source_group"] in DIRECT_SOURCE_GROUPS for c in ("HT_EMPLOYMENT_SHARE", "HIGH_TECH_OCCUPATIONS"))
            if labour_direct and all(RELEASE_YEAR-int(c["source_data_year"]) <= 5 for c in selected):
                _insert_profile(conn, iso3=iso3, mode="direct_core", components=selected,
                                direct_data_tier=True, formula_version="htei-v6-direct-core-2026")
                created["direct_core"] += 1

        # Broad comparable mode retains the v5 extended universe, but is explicitly a proxy tier.
        proxy_source = ext or core
        if proxy_source:
            proxy_comps = _profile_components(conn, proxy_source["profile_id"])
            if len(proxy_comps) >= 4:
                _insert_profile(conn, iso3=iso3, mode="proxy_extended", components=proxy_comps,
                                direct_data_tier=False, formula_version="htei-v6-proxy-extended-2026")
                created["proxy_extended"] += 1

        if asof:
            asof_comps = _profile_components(conn, asof["profile_id"])
            if len(asof_comps) >= 2:
                _insert_profile(conn, iso3=iso3, mode="asof_diagnostic", components=asof_comps,
                                direct_data_tier=False, formula_version="htei-v6-asof-diagnostic-2026")
                created["asof_diagnostic"] += 1

    for mode in ("direct_core", "common_support", "proxy_extended"):
        _rank_mode(conn, mode)

    # Score intervals and rank intervals from the existing v5 audit where available.
    for mode in ("direct_core", "common_support", "proxy_extended"):
        profiles = rows(conn, "SELECT * FROM htei_v6_profiles WHERE release_year=? AND mode=? ORDER BY rank", (RELEASE_YEAR, mode))
        for p in profiles:
            half = max(1.0, (1.0-p["confidence_score"])*10.0)
            low, high = max(0.0, p["substantive_score"]-half), min(100.0, p["substantive_score"]+half)
            peers = [x for x in profiles if low <= x["substantive_score"] <= high]
            ranks = [x["rank"] for x in peers if x["rank"] is not None]
            conn.execute("UPDATE htei_v6_profiles SET score_low=?,score_high=?,rank_low=?,rank_high=? WHERE profile_id=?",
                         (round(low,4),round(high,4),min(ranks) if ranks else p["rank"],max(ranks) if ranks else p["rank"],p["profile_id"]))

    _build_missingness_audit(conn)
    conn.commit()
    return dict(created)




class _DeterministicUniformV6:
    """Small deterministic PRNG used only for reproducible sensitivity analysis."""

    def __init__(self, seed: int) -> None:
        self.state = seed & 0x7FFFFFFF

    def uniform(self, low: float, high: float) -> float:
        self.state = (1103515245 * self.state + 12345) & 0x7FFFFFFF
        fraction = self.state / 0x7FFFFFFF
        return low + (high - low) * fraction


def _rank_map_v6(scores: dict[str, float]) -> dict[str, int]:
    return {
        iso3: rank
        for rank, (iso3, _value) in enumerate(
            sorted(scores.items(), key=lambda item: (-item[1], item[0])), start=1
        )
    }


def _spearman_v6(rank_a: dict[str, int], rank_b: dict[str, int]) -> float:
    common = sorted(set(rank_a) & set(rank_b))
    n = len(common)
    if n < 2:
        return 1.0
    d2 = sum((rank_a[code] - rank_b[code]) ** 2 for code in common)
    return 1.0 - 6.0 * d2 / (n * (n * n - 1))


def _quantile_v6(values: list[float], q: float) -> float:
    ordered = sorted(values)
    if not ordered:
        return 0.0
    if len(ordered) == 1:
        return float(ordered[0])
    position = (len(ordered) - 1) * q
    lo = int(math.floor(position))
    hi = int(math.ceil(position))
    if lo == hi:
        return float(ordered[lo])
    fraction = position - lo
    return float(ordered[lo] * (1.0 - fraction) + ordered[hi] * fraction)


def _component_alternative_score(component: dict[str, Any], key: str) -> float:
    try:
        outer = json.loads(component.get("provenance_json") or "{}")
        nested = json.loads(outer.get("provenance_json") or "{}")
        if key == "percentile":
            return float(nested.get("alternative_percentile_score", component["normalized_score"]))
        if key == "robust_z":
            return float(nested.get("alternative_robust_z_score", component["normalized_score"]))
    except Exception:
        pass
    return float(component["normalized_score"])


def run_htei_v6_sensitivity(conn: sqlite3.Connection) -> dict[str, Any]:
    """Audit the actual common-support formula used by HTEI v6.

    Unlike the legacy v5 audit, every country here has the identical four-component
    support. The routine tests 200 deterministic weight perturbations, two alternative
    normalisations and four leave-one-component-out scenarios. It updates uncertainty
    intervals on the v6 common-support profiles and registers an auditable summary.
    """
    profiles = {
        item["iso3"]: item
        for item in rows(
            conn,
            "SELECT * FROM htei_v6_profiles WHERE release_year=? AND mode='common_support'",
            (RELEASE_YEAR,),
        )
    }
    components_by_country: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    for item in rows(
        conn,
        "SELECT * FROM htei_v6_component_values WHERE release_year=? AND mode='common_support'",
        (RELEASE_YEAR,),
    ):
        components_by_country[item["iso3"]][item["component_code"]] = item
    required = list(COMMON_SUPPORT_COMPONENTS)
    eligible = {
        iso3: comps
        for iso3, comps in components_by_country.items()
        if all(code in comps for code in required)
    }
    baseline_scores = {iso3: float(profiles[iso3]["substantive_score"]) for iso3 in eligible if iso3 in profiles}
    baseline_ranks = _rank_map_v6(baseline_scores)
    if len(baseline_scores) < 2:
        summary = {"countries": len(baseline_scores), "run_count": 0, "reason": "insufficient_common_support"}
        conn.execute("DELETE FROM methodology_audit_runs WHERE model_code='HTEI_V6' AND release_year=?", (RELEASE_YEAR,))
        conn.execute(
            """INSERT INTO methodology_audit_runs(audit_id,model_code,release_year,methodology_version,run_count,countries,
               mean_spearman,min_spearman,mean_absolute_rank_change,max_rank_change,sensitivity_passed,results_json,created_at)
               VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (f"HTEI-V6:{RELEASE_YEAR}", "HTEI_V6", RELEASE_YEAR, HTEI_V6_FORMULA_VERSION, 0,
             len(baseline_scores), None, None, None, None, 0, json.dumps(summary, sort_keys=True), utc_now()),
        )
        conn.commit()
        return summary

    base_weights = {code: HTEI_WEIGHTS[code] for code in required}
    total_base = sum(base_weights.values())
    base_weights = {code: value / total_base for code, value in base_weights.items()}
    rng = _DeterministicUniformV6(20260711)
    run_stats: list[dict[str, Any]] = []
    score_samples: dict[str, list[float]] = defaultdict(list)
    rank_samples: dict[str, list[int]] = defaultdict(list)

    def calculate(weights: dict[str, float], *, norm_key: str = "normalized", drop: str | None = None) -> tuple[dict[str, float], dict[str, int]]:
        active = [code for code in required if code != drop]
        denominator = sum(weights[code] for code in active)
        scores: dict[str, float] = {}
        for iso3, comps in eligible.items():
            score = 0.0
            for code in active:
                component = comps[code]
                value = (
                    float(component["normalized_score"])
                    if norm_key == "normalized"
                    else _component_alternative_score(component, norm_key)
                )
                score += value * weights[code] / denominator
            scores[iso3] = score
        return scores, _rank_map_v6(scores)

    for run_number in range(1, 201):
        raw = {code: weight * math.exp(rng.uniform(-0.20, 0.20)) for code, weight in base_weights.items()}
        total = sum(raw.values())
        weights = {code: value / total for code, value in raw.items()}
        scores, ranks = calculate(weights)
        changes = [abs(baseline_ranks[iso3] - ranks[iso3]) for iso3 in baseline_ranks]
        run_stats.append({
            "type": "weight_perturbation", "run": run_number,
            "spearman": _spearman_v6(baseline_ranks, ranks),
            "mean_abs_rank_change": statistics.mean(changes),
            "max_rank_change": max(changes),
        })
        for iso3, score in scores.items():
            score_samples[iso3].append(score)
            rank_samples[iso3].append(ranks[iso3])

    for norm_key in ("percentile", "robust_z"):
        scores, ranks = calculate(base_weights, norm_key=norm_key)
        changes = [abs(baseline_ranks[iso3] - ranks[iso3]) for iso3 in baseline_ranks]
        run_stats.append({
            "type": f"alternative_normalization_{norm_key}",
            "spearman": _spearman_v6(baseline_ranks, ranks),
            "mean_abs_rank_change": statistics.mean(changes),
            "max_rank_change": max(changes),
        })

    for component_code in required:
        scores, ranks = calculate(base_weights, drop=component_code)
        changes = [abs(baseline_ranks[iso3] - ranks[iso3]) for iso3 in baseline_ranks]
        run_stats.append({
            "type": "leave_one_component_out", "component": component_code,
            "spearman": _spearman_v6(baseline_ranks, ranks),
            "mean_abs_rank_change": statistics.mean(changes),
            "max_rank_change": max(changes),
        })

    for iso3, samples in score_samples.items():
        ranks = [float(value) for value in rank_samples[iso3]]
        conn.execute(
            """UPDATE htei_v6_profiles SET score_low=?,score_high=?,rank_low=?,rank_high=?
               WHERE iso3=? AND release_year=? AND mode='common_support'""",
            (
                round(_quantile_v6(samples, 0.025), 6), round(_quantile_v6(samples, 0.975), 6),
                int(math.floor(_quantile_v6(ranks, 0.025))), int(math.ceil(_quantile_v6(ranks, 0.975))),
                iso3, RELEASE_YEAR,
            ),
        )

    spearman_values = [float(item["spearman"]) for item in run_stats]
    mean_changes = [float(item["mean_abs_rank_change"]) for item in run_stats]
    max_changes = [int(item["max_rank_change"]) for item in run_stats]
    summary = {
        "countries": len(baseline_scores),
        "run_count": len(run_stats),
        "weight_perturbation_runs": 200,
        "additional_runs": len(run_stats) - 200,
        "component_support": required,
        "mean_spearman": statistics.mean(spearman_values),
        "min_spearman": min(spearman_values),
        "mean_absolute_rank_change": statistics.mean(mean_changes),
        "max_rank_change": max(max_changes),
        "pass_thresholds": {"min_spearman": 0.85, "mean_absolute_rank_change": 5.0},
        "runs": run_stats,
    }
    passed = summary["min_spearman"] >= 0.85 and summary["mean_absolute_rank_change"] <= 5.0
    conn.execute("DELETE FROM methodology_audit_runs WHERE model_code='HTEI_V6' AND release_year=?", (RELEASE_YEAR,))
    conn.execute(
        """INSERT INTO methodology_audit_runs(audit_id,model_code,release_year,methodology_version,run_count,countries,
           mean_spearman,min_spearman,mean_absolute_rank_change,max_rank_change,sensitivity_passed,results_json,created_at)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            f"HTEI-V6:{RELEASE_YEAR}", "HTEI_V6", RELEASE_YEAR, HTEI_V6_FORMULA_VERSION,
            len(run_stats), len(baseline_scores), summary["mean_spearman"], summary["min_spearman"],
            summary["mean_absolute_rank_change"], summary["max_rank_change"], int(passed),
            json.dumps(summary, ensure_ascii=False, sort_keys=True), utc_now(),
        ),
    )
    conn.commit()
    return {key: value for key, value in summary.items() if key != "runs"} | {"sensitivity_passed": int(passed)}


def register_htei_v6_release_metadata(conn: sqlite3.Connection, created: dict[str, int]) -> dict[str, Any]:
    """Register the v6 comparison layers and an immutable build manifest."""
    retrieved = FINAL_RELEASE_TIMESTAMP
    source_id = "HTEI_FINAL_V6"
    source_url = "local:docs/HTEI_METHODOLOGY_V6.md"
    conn.execute(
        """INSERT INTO source_registry(source_id,source_code,source_name,title,owner,url,source_url,
        access_mode,update_frequency,license_or_terms,license_note,automation_status,source_role,retrieved_at,
        release_year,latest_snapshot_id,is_official,free_access) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(source_id) DO UPDATE SET
          source_code=excluded.source_code, source_name=excluded.source_name, title=excluded.title,
          owner=excluded.owner, url=excluded.url, source_url=excluded.source_url,
          access_mode=excluded.access_mode, update_frequency=excluded.update_frequency,
          license_or_terms=excluded.license_or_terms, license_note=excluded.license_note,
          automation_status=excluded.automation_status, source_role=excluded.source_role,
          retrieved_at=excluded.retrieved_at, release_year=excluded.release_year,
          latest_snapshot_id=excluded.latest_snapshot_id, is_official=excluded.is_official,
          free_access=excluded.free_access""",
        (source_id, source_id, "HTEI final comparison methodology v6", "HTEI final comparison methodology v6",
         "MGIMO / FNISC RAS", source_url, source_url, "derived from archived official observations", "annual",
         "Project methodology; underlying sources retain their own terms", "Authorial composite required by the approved research report.",
         "automated", "project_composite", retrieved, RELEASE_YEAR, f"{source_id}:{RELEASE_YEAR}", 0, 1),
    )
    formula_ru = (
        "HTEI использует утверждённые веса НИР. Основной международный срез Common Support рассчитывается "
        "на одном и том же наборе четырёх компонентов: занятость, профессиональная структура, STEM pipeline и "
        "технологические результаты; исходные веса перенормируются только внутри этого фиксированного набора. "
        "Качество данных публикуется отдельно и не изменяет содержательную оценку."
    )
    formula_en = (
        "HTEI uses the weights fixed by the approved research report. The primary Common Support comparison uses "
        "the same four components for every country: employment, occupational structure, STEM pipeline and technology "
        "outputs; the approved weights are renormalised only within this fixed set. Data confidence is reported separately "
        "and does not alter the substantive score."
    )
    conn.execute(
        """INSERT OR REPLACE INTO index_formulas(index_code,formula_version,formula_text_ru,formula_text_en,
        method_notes_ru,method_notes_en,weights_json,normalization_ru,normalization_en,official_formula_available,source_id)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        ("HTEI", HTEI_V6_FORMULA_VERSION, formula_ru, formula_en,
         "Весовая схема зафиксирована утверждённым отчётом по НИР; v6 устраняет влияние качества данных на score и вводит единый common-support рейтинг.",
         "The weighting scheme is fixed by the approved research report; v6 removes data-quality multiplication and introduces a common-support ranking.",
         json.dumps(HTEI_WEIGHTS, ensure_ascii=False, sort_keys=True),
         "Робастная нормировка исходных официальных рядов в HTEI v5; в Common Support используется один фиксированный набор компонентов.",
         "Robust normalisation of archived official observations in HTEI v5; Common Support uses one fixed component set.",
         0, source_id),
    )
    conn.execute(
        """INSERT OR REPLACE INTO index_methodology_registry(index_code,score_status,component_status,formula_status,
        methodology_version,label_ru,label_en,warning_ru,warning_en,source_url,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        ("HTEI", "project_composite_index", "fixed_common_support_and_diagnostic_tiers", "approved_research_weights_v6",
         FINAL_RELEASE_VERSION, "авторский составной показатель проекта", "project composite index",
         "Common Support является основным сопоставимым рейтингом; Direct Core показывает слой прямых данных; ASOF-профили не ранжируются.",
         "Common Support is the primary comparable ranking; Direct Core identifies direct-data profiles; ASOF profiles are not ranked.",
         source_url, retrieved),
    )
    manifest = {
        "methodology_version": FINAL_RELEASE_VERSION,
        "formula_version": HTEI_V6_FORMULA_VERSION,
        "release_year": RELEASE_YEAR,
        "created_at": retrieved,
        "modes": created,
        "common_support_components": list(COMMON_SUPPORT_COMPONENTS),
        "approved_weights": HTEI_WEIGHTS,
        "quality_is_separate_from_score": True,
        "asof_profiles_are_unranked": True,
    }
    path = PROJECT_ROOT / "data" / "raw" / source_id / str(RELEASE_YEAR) / "htei_final_v6_manifest.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    digest = sha256_file(path)
    snapshot_id = f"{source_id}:{RELEASE_YEAR}"
    conn.execute(
        """INSERT INTO raw_snapshots(snapshot_id,source_id,release_year,retrieved_at,source_url,
        raw_snapshot_path,raw_snapshot_sha256,content_type,bytes_count,is_official,license_or_terms)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(snapshot_id) DO UPDATE SET
          source_id=excluded.source_id, release_year=excluded.release_year,
          retrieved_at=excluded.retrieved_at, source_url=excluded.source_url,
          raw_snapshot_path=excluded.raw_snapshot_path, raw_snapshot_sha256=excluded.raw_snapshot_sha256,
          content_type=excluded.content_type, bytes_count=excluded.bytes_count,
          is_official=excluded.is_official, license_or_terms=excluded.license_or_terms""",
        (snapshot_id, source_id, RELEASE_YEAR, retrieved, source_url, str(path.relative_to(PROJECT_ROOT)).replace("\\", "/"),
         digest, "application/json", path.stat().st_size, 0, "Project methodology manifest"),
    )
    run_id = f"{source_id}:BUILD:{RELEASE_YEAR}"
    conn.execute(
        """INSERT OR REPLACE INTO transformation_runs(transformation_run_id,transform_id,source_id,snapshot_id,
        started_at,completed_at,code_version,rows_loaded,notes) VALUES(?,?,?,?,?,?,?,?,?)""",
        (run_id, "build_htei_v6", source_id, snapshot_id, retrieved, retrieved, FINAL_RELEASE_VERSION,
         sum(created.values()), "Deterministic build of HTEI v6 comparison and diagnostic tiers"),
    )
    conn.commit()
    return {"source_id": source_id, "snapshot_id": snapshot_id, "manifest": str(path.relative_to(PROJECT_ROOT)), "sha256": digest}

def _build_missingness_audit(conn: sqlite3.Connection) -> None:
    created_at = utc_now()
    common = {r["iso3"]: r for r in rows(conn, "SELECT * FROM htei_v6_profiles WHERE release_year=? AND mode='common_support'", (RELEASE_YEAR,))}
    for mode in ("direct_core", "common_support", "proxy_extended", "asof_diagnostic"):
        profiles = rows(conn, "SELECT * FROM htei_v6_profiles WHERE release_year=? AND mode=?", (RELEASE_YEAR, mode))
        groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for p in profiles:
            groups[p["component_signature"]].append(p)
        for signature, items in groups.items():
            ranks = [float(p["rank"]) for p in items if p["rank"] is not None]
            shifts = []
            for p in items:
                cp = common.get(p["iso3"])
                if cp and p["rank"] is not None and cp["rank"] is not None:
                    shifts.append(abs(float(p["rank"])-float(cp["rank"])))
            result = {
                "countries": [p["iso3"] for p in items],
                "rank_shifts": shifts,
                "note": "Common-support uses an identical four-component formula for every ranked country.",
            }
            key = hashlib.sha256(f"{RELEASE_YEAR}|{mode}|{signature}".encode()).hexdigest()[:20]
            conn.execute("""INSERT OR REPLACE INTO htei_v6_missingness_audit(
                audit_key,release_year,mode,component_signature,countries,mean_score,mean_rank,median_rank,
                mean_confidence,rank_shift_vs_common_support,results_json,created_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",(
                    key,RELEASE_YEAR,mode,signature,len(items),
                    statistics.mean(float(p["substantive_score"]) for p in items) if items else None,
                    statistics.mean(ranks) if ranks else None,
                    statistics.median(ranks) if ranks else None,
                    statistics.mean(float(p["confidence_score"]) for p in items) if items else None,
                    statistics.mean(shifts) if shifts else None,
                    json.dumps(result,ensure_ascii=False,sort_keys=True),created_at,
                ))


def _safe_file_name(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", value)[:160]


def _table_has_column(conn: sqlite3.Connection, table: str, column: str) -> bool:
    exists = conn.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?", (table,)).fetchone()[0]
    if not exists:
        return False
    return column in {r[1] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()}


def _prepare_reproducibility_indexes(conn: sqlite3.Connection) -> None:
    for table in (
        "index_scores", "component_values", "source_observations", "qs_institution_rankings",
        "national_statistics_metrics", "corporate_metrics", "htei_v5_component_values",
        "htei_v6_component_values", "hci_plus_country_scores",
    ):
        if _table_has_column(conn, table, "raw_snapshot_path"):
            conn.execute(f"CREATE INDEX IF NOT EXISTS idx_{table}_raw_snapshot_path ON {table}(raw_snapshot_path)")
    conn.commit()


def build_reproducibility_artifacts(conn: sqlite3.Connection) -> dict[str, int]:
    """Build a self-contained provenance layer without redistributing restricted raw files.

    Every registered snapshot is represented by either a verified included raw file or by both an exact derived-row
    export and a deterministic download recipe.  The operation is incremental and commits per snapshot so a network or
    process interruption cannot roll the whole package back.
    """
    migrate_final_schema(conn)
    _prepare_reproducibility_indexes(conn)
    out_root = PROJECT_ROOT / "data" / "reproducibility"
    out_dir = out_root / "derived"
    recipe_dir = out_root / "recipes"
    out_dir.mkdir(parents=True, exist_ok=True)
    recipe_dir.mkdir(parents=True, exist_ok=True)
    counts = Counter()
    tables = (
        "index_scores", "component_values", "source_observations", "qs_institution_rankings",
        "national_statistics_metrics", "corporate_metrics", "htei_v5_component_values",
        "htei_v6_component_values", "hci_plus_country_scores",
    )
    snapshots = rows(conn, "SELECT * FROM raw_snapshots ORDER BY snapshot_id")
    for snap in snapshots:
        # Rebuild exactly one coherent artifact set per snapshot.  Old rows from a
        # previous policy decision must not survive and create contradictory evidence.
        conn.execute("DELETE FROM reproducibility_artifacts WHERE snapshot_id=?", (snap["snapshot_id"],))
        raw_path = PROJECT_ROOT / str(snap["raw_snapshot_path"]).replace("\\", "/")
        license_row = row(conn, "SELECT release_archive_decision FROM license_registry WHERE source_id=?", (snap["source_id"],)) or {}
        decision = license_row.get("release_archive_decision") or "exclude_raw_keep_derived"
        raw_valid = raw_path.exists() and sha256_file(raw_path) == snap["raw_snapshot_sha256"]
        if raw_valid and decision == "include":
            rel = raw_path.relative_to(PROJECT_ROOT)
            conn.execute("""INSERT OR REPLACE INTO reproducibility_artifacts(
                artifact_id,snapshot_id,artifact_type,artifact_path,artifact_sha256,rows_exported,source_url,
                expected_raw_sha256,distribution_decision,metadata_json,created_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?)""", (
                    f"raw:{snap['snapshot_id']}", snap["snapshot_id"], "raw_included", str(rel).replace("\\", "/"),
                    snap["raw_snapshot_sha256"], 0, snap["source_url"], snap["raw_snapshot_sha256"], "include",
                    json.dumps({"content_type": snap.get("content_type"), "bytes_count": snap.get("bytes_count")}, sort_keys=True), utc_now(),
                ))
            counts["raw_included"] += 1
            conn.commit()
            continue

        payload: dict[str, Any] = {
            "format": "GIIP derived snapshot export v1",
            "snapshot": snap,
            "tables": {},
        }
        total_rows = 0
        for table in tables:
            if not _table_has_column(conn, table, "raw_snapshot_path"):
                continue
            data = rows(conn, f"SELECT * FROM {table} WHERE raw_snapshot_path=?", (snap["raw_snapshot_path"],))
            if data:
                payload["tables"][table] = data
                total_rows += len(data)
        base = _safe_file_name(snap["snapshot_id"])
        derived_path = out_dir / f"{base}.json.gz"
        # Write a deterministic gzip stream.  The default gzip writer embeds the current
        # timestamp, which made repeated test/finalisation runs rewrite the same artifact
        # with a different SHA-256.  mtime=0 and an empty embedded filename keep the
        # byte stream stable for identical source rows.
        payload_bytes = json.dumps(
            payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")
        ).encode("utf-8")
        with derived_path.open("wb") as raw_handle:
            with gzip.GzipFile(filename="", mode="wb", fileobj=raw_handle, mtime=0) as gz_handle:
                gz_handle.write(payload_bytes)
        derived_sha = sha256_file(derived_path)
        conn.execute("""INSERT OR REPLACE INTO reproducibility_artifacts(
            artifact_id,snapshot_id,artifact_type,artifact_path,artifact_sha256,rows_exported,source_url,
            expected_raw_sha256,distribution_decision,metadata_json,created_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)""", (
                f"derived:{snap['snapshot_id']}", snap["snapshot_id"], "derived_export",
                str(derived_path.relative_to(PROJECT_ROOT)).replace("\\", "/"), derived_sha, total_rows,
                snap["source_url"], snap["raw_snapshot_sha256"], "exclude_raw_keep_derived",
                json.dumps({"reason": "raw file not redistributed; exact delivered rows exported", "tables": sorted(payload["tables"])}, sort_keys=True), utc_now(),
            ))
        counts["derived_export"] += 1

        recipe = {
            "format": "GIIP download recipe v1",
            "snapshot_id": snap["snapshot_id"],
            "source_id": snap["source_id"],
            "official_source_url": snap["source_url"],
            "retrieved_at": snap["retrieved_at"],
            "expected_raw_sha256": snap["raw_snapshot_sha256"],
            "expected_bytes": snap.get("bytes_count"),
            "content_type": snap.get("content_type"),
            "target_path": str(snap["raw_snapshot_path"]).replace("\\", "/"),
            "distribution_decision": decision,
            "verification": "Download only from the official_source_url and require the expected SHA-256. If the publisher changes the file, register a new snapshot instead of overwriting this recipe.",
        }
        recipe_path = recipe_dir / f"{base}.json"
        recipe_path.write_text(json.dumps(recipe, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
        recipe_sha = sha256_file(recipe_path)
        conn.execute("""INSERT OR REPLACE INTO reproducibility_artifacts(
            artifact_id,snapshot_id,artifact_type,artifact_path,artifact_sha256,rows_exported,source_url,
            expected_raw_sha256,distribution_decision,metadata_json,created_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)""", (
                f"recipe:{snap['snapshot_id']}", snap["snapshot_id"], "download_recipe",
                str(recipe_path.relative_to(PROJECT_ROOT)).replace("\\", "/"), recipe_sha, 0,
                snap["source_url"], snap["raw_snapshot_sha256"], decision,
                json.dumps({"official_host_only": True, "immutable_snapshot": True}, sort_keys=True), utc_now(),
            ))
        counts["download_recipe"] += 1
        conn.commit()

    manifest = {
        "version": FINAL_RELEASE_VERSION,
        "created_at": utc_now(),
        "counts": dict(counts),
        "artifacts": rows(conn, "SELECT * FROM reproducibility_artifacts ORDER BY snapshot_id,artifact_type"),
    }
    manifest_path = out_root / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    return dict(counts)

def ensure_hci_plus_pending_metadata(conn: sqlite3.Connection) -> dict[str, Any]:
    """Register HCI+ as the current primary edition before official online ingestion.

    HCI+ is added to the metadata tables (including ``indices``) before official
    online ingestion so the seven current modules are visible in RU/EN navigation.
    No score rows are created until the official loader reaches the minimum country
    coverage. This preserves the correct hierarchy without fabricating numeric data.
    """
    loaded = int(
        conn.execute(
            "SELECT COUNT(*) FROM hci_plus_country_scores WHERE year=2026"
        ).fetchone()[0]
    )
    if loaded >= 150:
        retrieved = utc_now()
        source_url = "https://humancapital.worldbank.org/en/country-briefs"
        rows = conn.execute(
            """SELECT * FROM hci_plus_country_scores WHERE year=2026
               ORDER BY rank,iso3"""
        ).fetchall()
        frontier = {
            "HEALTH": max(float(row["health_score"]) for row in rows),
            "EDUCATION": max(float(row["education_score"]) for row in rows),
            "EMPLOYMENT": max(float(row["employment_score"]) for row in rows),
        }
        conn.execute("DELETE FROM component_values WHERE index_code='HCI_PLUS' AND year=2026")
        conn.execute("DELETE FROM index_scores WHERE index_code='HCI_PLUS' AND year=2026")
        for row in rows:
            transformation_run_id = f"WORLD_BANK_HCIPLUS:PARSE:{row['iso3']}:2026"
            conn.execute(
                """INSERT INTO index_scores(value_id,index_code,iso3,year,source_data_year,score,rank,percentile,
                   rank_delta_1y,rank_delta_5y,data_quality,source_type,source_id,source_url,retrieved_at,release_year,
                   raw_snapshot_path,raw_snapshot_sha256,transformation_run_id,transform_id,formula_version,quality_flag,
                   is_official,is_recomputed,provenance_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    row["value_id"], "HCI_PLUS", row["iso3"], 2026, 2026, row["score"], row["rank"], row["percentile"],
                    None, None, 1.0, "official_country_brief", row["source_id"], row["source_url"], row["retrieved_at"],
                    2026, row["raw_snapshot_path"], row["raw_snapshot_sha256"], transformation_run_id,
                    "hci_plus_country_brief_v1", "official-hci-plus-2026", row["quality_flag"], 1, 0,
                    row["provenance_json"],
                ),
            )
            for component_code, column in (
                ("HEALTH", "health_score"),
                ("EDUCATION", "education_score"),
                ("EMPLOYMENT", "employment_score"),
            ):
                raw_value = float(row[column])
                gap = max(frontier[component_code] - raw_value, 0.0)
                normalized = raw_value / frontier[component_code] * 100 if frontier[component_code] else 0.0
                component_provenance = json.loads(row["provenance_json"] or "{}")
                component_provenance.update({
                    "pillar": component_code,
                    "official_pillar_score": raw_value,
                    "diagnostic_normalized_score": normalized,
                    "public_mirror_restored_by": "GIIP-final-release-v6",
                })
                conn.execute(
                    """INSERT INTO component_values(value_id,index_code,component_code,iso3,year,source_data_year,
                       raw_value,unit,normalized_score,weighted_contribution,gap_to_frontier,gap_to_peer_group,
                       weighted_gap,rank_leverage,actionability,priority_score,source_id,source_url,retrieved_at,
                       release_year,raw_snapshot_path,raw_snapshot_sha256,transformation_run_id,transform_id,
                       formula_version,quality_flag,is_official,is_recomputed,source_note,provenance_json)
                       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (
                        f"{row['value_id']}:{component_code}", "HCI_PLUS", component_code, row["iso3"], 2026, 2026,
                        raw_value, "points", normalized, raw_value, gap, 0.0, gap, 0.0, 0.5, gap * 0.5,
                        row["source_id"], row["source_url"], row["retrieved_at"], 2026, row["raw_snapshot_path"],
                        row["raw_snapshot_sha256"], transformation_run_id, "hci_plus_country_brief_v1",
                        "official-hci-plus-2026", row["quality_flag"], 1, 0,
                        "Official World Bank HCI+ pillar score; normalized score and gaps are diagnostics only.",
                        json.dumps(component_provenance, ensure_ascii=False, sort_keys=True),
                    ),
                )
        conn.execute(
            """UPDATE source_registry
               SET automation_status='automated',source_role='official_index',retrieved_at=?,release_year=2026
               WHERE source_id='WORLD_BANK_HCIPLUS'""",
            (retrieved,),
        )
        for table in ("index_definitions", "indices"):
            conn.execute(
                f"""UPDATE {table}
                    SET description_ru=?,description_en=?,recompute_mode='official HCI+ 2026 country-brief import',
                        official_or_derived='official_index'
                    WHERE code='HCI_PLUS'""",
                (
                    "Основной актуальный индекс человеческого капитала Всемирного банка 2026 года, учитывающий здоровье, образование и занятость на протяжении трудовой жизни.",
                    "The World Bank's current 2026 human-capital index covering health, education and employment over the working life.",
                ),
            )
        conn.execute(
            """UPDATE index_methodology_registry
               SET score_status='official_hci_plus_2026',component_status='official_pillar_scores',
                   formula_status='official_additive_score',methodology_version='world-bank-hci-plus-2026',
                   label_ru='Официальная актуальная редакция HCI+ 2026',
                   label_en='Official current HCI+ 2026 edition',
                   warning_ru='HCI+ является основной актуальной редакцией; исторический HCI 2020 показан отдельно из-за методологического разрыва.',
                   warning_en='HCI+ is the current primary edition; historical HCI 2020 is shown separately because of the methodology break.',
                   source_url=?,updated_at=?
               WHERE index_code='HCI_PLUS'""",
            (source_url, retrieved),
        )
        conn.execute(
            """UPDATE index_formulas
               SET formula_version='official-hci-plus-2026',
                   method_notes_ru='Официальные страновые briefs загружены; HCI+ и исторический HCI не образуют непрерывный ряд.',
                   method_notes_en='Official country briefs are loaded; HCI+ and historical HCI do not form one continuous series.'
               WHERE index_code='HCI_PLUS'"""
        )
        conn.execute("UPDATE index_aliases SET is_primary=0 WHERE index_code='HCI'")
        conn.commit()
        return {
            "index_code": "HCI_PLUS",
            "status": "official_online_ingestion_loaded",
            "countries": loaded,
            "public_score_rows": len(rows),
            "public_component_rows": len(rows) * 3,
        }

    retrieved = utc_now()
    source_id = "WORLD_BANK_HCIPLUS"
    source_url = "https://humancapital.worldbank.org/en/country-briefs"
    conn.execute(
        """INSERT OR IGNORE INTO source_registry(source_id,source_code,source_name,title,owner,url,source_url,
        access_mode,update_frequency,license_or_terms,license_note,automation_status,source_role,retrieved_at,
        release_year,is_official,free_access) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (source_id, source_id, "World Bank Human Capital Index Plus 2026", "HCI+ 2026 country briefs",
         "World Bank", source_url, source_url, "official country-brief PDFs", "edition based",
         "World Bank country-brief terms", "Official HCI+ records are loaded only by the online connector.",
         "connector_ready", "official_index_pending", retrieved, 2026, 1, 1),
    )
    values = (
        "HCI_PLUS", "Human Capital Index Plus", "HCI+", "Индекс человеческого капитала плюс (HCI+)",
        "Индекс человеческого капитала плюс", "Human Capital Index Plus", "HCI+", "human_capital",
        "World Bank", source_url,
        "Основная актуальная редакция индекса человеческого капитала Всемирного банка 2026 года. До онлайн-загрузки официальных страновых briefs числовые значения не публикуются.",
        "The current 2026 World Bank human-capital edition. Numeric values remain unavailable until official country briefs are ingested.",
        "0-325 official score", "desc", "official HCI+ 2026 country-brief import pending", "official_index_pending", 0,
    )
    placeholders = ",".join("?" for _ in values)
    conn.execute(f"INSERT OR REPLACE INTO index_definitions VALUES({placeholders})", values)
    # The ``indices`` row is metadata only. Country scores remain absent until the
    # official World Bank country briefs are ingested by the online connector.
    conn.execute(f"INSERT OR REPLACE INTO indices VALUES({placeholders})", values)
    conn.execute("UPDATE index_aliases SET is_primary=0 WHERE index_code='HCI'")
    aliases = [
        ("HCI_PLUS:ru:primary", "HCI_PLUS", "ru", "Индекс человеческого капитала плюс", 1),
        ("HCI_PLUS:ru:name", "HCI_PLUS", "ru", "Индекс человеческого капитала плюс (HCI+)", 0),
        ("HCI_PLUS:en:primary", "HCI_PLUS", "en", "HCI+", 1),
        ("HCI_PLUS:en:name", "HCI_PLUS", "en", "Human Capital Index Plus", 0),
        ("HCI:ru:historical", "HCI", "ru", "Исторический Индекс человеческого капитала 2020", 0),
        ("HCI:en:historical", "HCI", "en", "Historical Human Capital Index 2020", 0),
    ]
    for item in aliases:
        conn.execute("INSERT OR REPLACE INTO index_aliases(alias,index_code,lang,display_label,is_primary) VALUES(?,?,?,?,?)", item)
    conn.execute(
        """INSERT OR REPLACE INTO index_methodology_registry(index_code,score_status,component_status,formula_status,
        methodology_version,label_ru,label_en,warning_ru,warning_en,source_url,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        ("HCI_PLUS", "official_hci_plus_2026_pending", "official_pillar_scores_pending", "official_additive_score_pending",
         "world-bank-hci-plus-2026-pending", "Официальная актуальная редакция HCI+ 2026 — ожидает онлайн-загрузки",
         "Official current HCI+ 2026 edition — online ingestion pending",
         "HCI+ является основным актуальным модулем человеческого капитала. До загрузки не менее 150 официальных страновых briefs платформа не показывает итоговые значения и не имитирует данные.",
         "HCI+ is the primary current human-capital module. The platform shows no numeric values until at least 150 official country briefs have been ingested.",
         source_url, retrieved),
    )
    conn.execute(
        """INSERT OR REPLACE INTO index_formulas(index_code,formula_version,formula_text_ru,formula_text_en,
        method_notes_ru,method_notes_en,weights_json,normalization_ru,normalization_en,official_formula_available,source_id)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        ("HCI_PLUS", "official-hci-plus-2026-pending",
         "HCI+ = здоровье + образование + занятость; официальный балл Всемирного банка на шкале 0–325.",
         "HCI+ = health + education + employment; official World Bank score on the 0–325 scale.",
         "Метаданные зарегистрированы; числовые значения появляются только после официальной онлайн-загрузки.",
         "Metadata are registered; numeric values appear only after official online ingestion.",
         json.dumps({"HEALTH":"official pillar","EDUCATION":"official pillar","EMPLOYMENT":"official pillar"}, ensure_ascii=False, sort_keys=True),
         "Официальные значения используются без перенормировки.", "Official values are used without renormalisation.", 1, source_id),
    )
    conn.commit()
    return {"index_code": "HCI_PLUS", "status": "pending_official_online_ingestion"}


def fix_policy_brief_english(conn: sqlite3.Connection) -> int:
    """Replace the release English fields with reviewed, native English text.

    Existing Russian recommendations are retained exactly. This function is deterministic and does not translate
    country values or invent evidence.
    """
    translations = {
        1: {
            "title_en":"Build a national high-technology workforce observatory",
            "problem_en":"National workforce planning lacks a single auditable view of employment in information, communication, professional-scientific and directly measured high-technology sectors.",
            "measure_en":"Establish a quarterly workforce observatory linking official statistics, employer validation and regional recruitment plans for ICT, R&D and high-technology manufacturing.",
            "actor_en":"Ministry of Science and Higher Education; Ministry of Industry and Trade; Ministry of Digital Development; Rosstat; regions; sector employers",
            "target_kpi_en":"Publish a harmonised quarterly series and cover at least 80% of employment in the selected technology sectors by 2028.",
            "expected_effect_en":"A more precise link between education supply, employer demand and measurable high-technology employment.",
            "risk_en":"Differences between agency classifications may reduce comparability; a public crosswalk and versioned transformation rules are required.",
            "resources_en":"Inter-agency data team, classification specialists, secure data exchange and an annual employer validation survey.",
            "monitoring_en":"Quarterly publication of coverage, revisions, sector employment and employer-confirmed vacancies by region.",
        },
        2: {
            "title_en":"Create a portfolio of engineering and digital occupations for priority industries",
            "problem_en":"Training targets are not consistently linked to detailed technology occupation profiles and verified skill requirements.",
            "measure_en":"Define occupation and skill profiles, align admissions and short reskilling programmes, and introduce independent skill assessment with employer participation.",
            "actor_en":"Ministry of Science and Higher Education; Ministry of Labour; sector qualification councils; universities; technology companies",
            "target_kpi_en":"Approve a national portfolio of priority occupations and assess at least 70% of graduates in participating programmes by 2029.",
            "expected_effect_en":"Lower shortages in applied engineering and digital roles and faster transition from study to technology employment.",
            "risk_en":"Employers may under-report future demand; participation should be linked to co-financing and sector agreements.",
            "resources_en":"Sector councils, labour-market analysts, assessment providers and co-funded university-company programme teams.",
            "monitoring_en":"Annual comparison of graduate supply, vacancy duration, assessed skills and first-year employment outcomes.",
        },
        3: {
            "title_en":"Scale industrial doctoral tracks and company-linked laboratories",
            "problem_en":"The R&D personnel pipeline is weakened by short contracts and a weak institutional bridge between universities and corporate research centres.",
            "measure_en":"Fund long-term early-career research positions, industrial PhD tracks and joint laboratories with shared publication, patent and deployment KPIs.",
            "actor_en":"Ministry of Science and Higher Education; Russian Science Foundation; universities; corporations with R&D centres",
            "target_kpi_en":"Increase the number of industry-linked doctoral positions and jointly funded laboratory posts by at least 30% by 2030.",
            "expected_effect_en":"A larger and more stable R&D personnel base connected to real corporate technology programmes.",
            "risk_en":"Partnerships may remain formal without substantive R&D tasks; project portfolios and corporate co-financing must be audited.",
            "resources_en":"Competitive grants, corporate co-financing, multi-year employment commitments and shared research infrastructure.",
            "monitoring_en":"Annual reporting on personnel, funding, patents, publications, prototypes and implemented technologies.",
        },
        4: {
            "title_en":"Improve completion and employment outcomes in the STEM pipeline",
            "problem_en":"The education pipeline is measured mainly by enrolment and graduation shares, while completion quality and transition to technology employment remain uneven.",
            "measure_en":"Combine early guidance, bridge courses in mathematics and programming, industry mentoring and graduate employment tracking.",
            "actor_en":"Ministry of Science and Higher Education; education quality agencies; universities; partner schools; industry mentors",
            "target_kpi_en":"Raise completion in participating STEM programmes and achieve verified technology employment for at least 75% of graduates within one year.",
            "expected_effect_en":"A more reliable supply of graduates with skills usable in high-technology industries.",
            "risk_en":"Rapid expansion may reduce quality; completion, employment and independent skill outcomes must be monitored together.",
            "resources_en":"Bridge-course faculty, mentoring networks, graduate tracking infrastructure and independent assessment.",
            "monitoring_en":"Cohort-level monitoring of completion, assessed skills, first employment and employer satisfaction.",
        },
        5: {
            "title_en":"Create an auditable corporate technology workforce reporting layer",
            "problem_en":"Corporate reporting does not provide a comparable view of technology workforce plans, R&D personnel and skill demand.",
            "measure_en":"Introduce a voluntary official-report register and a common disclosure template for R&D personnel, technology recruitment and reskilling plans.",
            "actor_en":"Ministry of Economic Development; Ministry of Industry and Trade; Ministry of Digital Development; major technology employers; sector associations",
            "target_kpi_en":"Obtain audited disclosures from at least 50 major technology employers by 2028 and publish an annual aggregate report.",
            "expected_effect_en":"Corporate evidence becomes comparable and can support future workforce-demand indicators without overstating incomplete data.",
            "risk_en":"Selective disclosure may bias results; numeric scoring must remain separate until coverage and audit thresholds are met.",
            "resources_en":"Disclosure standard, secure filing service, audit procedures and sector outreach.",
            "monitoring_en":"Annual coverage, completeness, audit status and comparison with official employment statistics.",
        },
        6: {
            "title_en":"Link workforce programmes to measurable technology outputs",
            "problem_en":"Education and workforce initiatives are often assessed without tracing their connection to patents, ICT services, high-technology exports and deployed R&D.",
            "measure_en":"Create targeted university-company consortia and evaluate them through a balanced set of workforce and technology-output indicators.",
            "actor_en":"Ministry of Science and Higher Education; Ministry of Industry and Trade; Ministry of Digital Development; development institutions; patent and export agencies",
            "target_kpi_en":"Publish annual consortium scorecards and increase the share of projects reaching verified deployment or export outcomes by 2030.",
            "expected_effect_en":"Workforce policy is linked to real technology production rather than graduate numbers alone.",
            "risk_en":"Technology outputs react with a lag; short-term workforce indicators and long-term output indicators must be interpreted separately.",
            "resources_en":"Consortium grants, patent and export analytics, technology-transfer teams and independent outcome verification.",
            "monitoring_en":"Annual review of personnel, patents, exports, licences, prototypes and implemented R&D results.",
        },
        7: {
            "title_en":"Develop regional technology workforce compacts",
            "problem_en":"National averages conceal major regional differences in education supply, technology employers and research capacity.",
            "measure_en":"Create regional compacts that align universities, employers, research organisations and authorities around a shared workforce plan.",
            "actor_en":"Regional governments; universities; regional employers; development agencies; federal ministries",
            "target_kpi_en":"Launch compacts in at least 15 technology-intensive regions and publish comparable regional dashboards by 2028.",
            "expected_effect_en":"Regional training capacity is aligned with local technology specialisation and employer demand.",
            "risk_en":"Regions may use incompatible indicators; all compacts must follow a common data model and audit protocol.",
            "resources_en":"Regional analytics teams, co-financing agreements and shared monitoring infrastructure.",
            "monitoring_en":"Six-month reporting on admissions, completions, vacancies, R&D personnel and technology employment.",
        },
        8: {
            "title_en":"Institutionalise annual HTEI and training-system review",
            "problem_en":"Policy decisions need a stable cycle for reviewing data quality, component changes and the effects of workforce measures.",
            "measure_en":"Establish an annual review panel that publishes the comparable HTEI, diagnostic profiles, data-quality report and implementation status of recommendations.",
            "actor_en":"MGIMO; FNISC RAS; Ministry of Science and Higher Education; participating data owners and sector experts",
            "target_kpi_en":"Publish one audited annual release with versioned methodology, provenance and implementation tracking starting in 2027.",
            "expected_effect_en":"The platform becomes a repeatable decision-support process rather than a one-off research output.",
            "risk_en":"Methodological drift can undermine comparability; all changes require versioning and a published impact assessment.",
            "resources_en":"Permanent methodology team, data engineering capacity, external review budget and release governance.",
            "monitoring_en":"Annual release checklist, change log, data-quality audit and public response to reviewer comments.",
        },
    }
    changed = 0
    for r in rows(conn,"SELECT item_id,priority FROM policy_brief_items WHERE iso3='RUS' ORDER BY priority"):
        item = translations.get(int(r["priority"]))
        if not item:
            continue
        assignments=",".join(f"{k}=?" for k in item)
        conn.execute(f"UPDATE policy_brief_items SET {assignments},editorial_status='release_bilingual_reviewed',updated_at=? WHERE item_id=?",
                     tuple(item.values())+(utc_now(),r["item_id"]))
        changed += 1
    conn.commit()
    return changed


def normalize_playwright_manifest_paths() -> int:
    manifest = PROJECT_ROOT / "audit_evidence" / "playwright" / "scientific_v5_playwright_manifest.json"
    if not manifest.exists():
        return 0
    data=json.loads(manifest.read_text(encoding="utf-8"))
    changed=0
    def norm(v: Any) -> Any:
        nonlocal changed
        if isinstance(v,str) and "\\" in v:
            changed+=1
            return v.replace("\\","/")
        if isinstance(v,dict): return {k:norm(x) for k,x in v.items()}
        if isinstance(v,list): return [norm(x) for x in v]
        return v
    data=norm(data)
    manifest.write_text(json.dumps(data,ensure_ascii=False,indent=2,sort_keys=True),encoding="utf-8")
    return changed


def finalize_license_distribution_policy(conn: sqlite3.Connection) -> int:
    """Apply a conservative distribution policy without pretending to provide legal advice.

    Open-data sources may be included when their terms explicitly permit reuse. Sources with unclear or restrictive
    redistribution are delivered as derived rows plus a download recipe. This resolves the delivery design issue while
    retaining full source attribution.
    """
    policies = {
        "UNDP_HDR": (1,1,1,"UNDP attribution required","include","project_policy_approved","https://hdr.undp.org/terms-use"),
        "WORLD_BANK_COUNTRIES": (1,1,1,"World Bank attribution required","include","project_policy_approved","https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets"),
        "WORLD_BANK_HCI": (1,1,1,"World Bank attribution required","include","project_policy_approved","https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets"),
        "WORLD_BANK_HTEI": (1,1,1,"World Bank attribution required","include","project_policy_approved","https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets"),
        "WORLD_BANK_HCIPLUS": (1,1,1,"World Bank attribution; HCI+ brief is CC BY-NC 3.0 IGO","include","project_policy_approved","https://openknowledge.worldbank.org/entities/publication/dfa7e24c-72f4-4903-88af-346f89875842"),
        "EUROSTAT_HTEC": (1,1,1,"Source: Eurostat","include","project_policy_approved","https://ec.europa.eu/eurostat/about-us/policies/copyright"),
        "OECD_HTEI": (1,1,0,"OECD attribution required","exclude_raw_keep_derived","project_policy_approved","https://www.oecd.org/en/about/terms-conditions.html"),
        "ILOSTAT_HTEI": (1,1,1,"Source: ILOSTAT","include","project_policy_approved","https://www.ilo.org/about-ilo/legal-notice"),
        "UIS_HTEI": (1,1,1,"Source: UNESCO Institute for Statistics","include","project_policy_approved","https://www.unesco.org/en/open-access/cc-sa"),
        "WIPO_GII": (1,1,0,"Source: WIPO Global Innovation Index","exclude_raw_keep_derived","project_policy_approved","https://www.wipo.int/copyright/en/"),
        "ITU_IDI": (1,1,0,"Source: International Telecommunication Union","exclude_raw_keep_derived","project_policy_approved","https://www.itu.int/en/about/Pages/terms-of-use.aspx"),
        "PORTULANS_GTCI": (1,1,0,"Source: INSEAD/Portulans Institute GTCI","exclude_raw_keep_derived","project_policy_approved","https://www.insead.edu/about-insead/website-terms-use"),
        "QS_ET": (1,1,0,"Source: QS World University Rankings by Subject","exclude_raw_keep_derived","project_policy_approved","https://www.topuniversities.com/terms-and-conditions"),
        "NATIONAL_STATS_HTEI": (1,1,0,"Source-specific official attribution","exclude_raw_keep_derived","project_policy_approved","local:docs/DATA_DISTRIBUTION_POLICY.md"),
        "NATIONAL_STATS_NUMERIC": (1,1,0,"Source-specific official attribution","exclude_raw_keep_derived","project_policy_approved","local:docs/DATA_DISTRIBUTION_POLICY.md"),
        "CORPORATE_REPORTS_HTEI": (1,1,0,"Issuer and filing-system attribution","exclude_raw_keep_derived","project_policy_approved","local:docs/DATA_DISTRIBUTION_POLICY.md"),
        "SEC_EDGAR_CORPORATE_NUMERIC": (1,1,0,"U.S. SEC fair-access attribution","exclude_raw_keep_derived","project_policy_approved","https://www.sec.gov/about/privacy-information#security"),
        "SPECIALIZED_RATINGS_HTEI": (1,1,0,"Source-specific attribution","exclude_raw_keep_derived","project_policy_approved","local:docs/DATA_DISTRIBUTION_POLICY.md"),
        "HTEI_MULTI_SOURCE": (1,1,1,"Underlying sources retained in provenance","include","project_policy_approved","local:docs/HTEI_METHODOLOGY_V6.md"),
        "HTEI_SCIENTIFIC_V5": (1,1,1,"Underlying sources retained in provenance","include","project_policy_approved","local:docs/HTEI_METHODOLOGY_V6.md"),
        "HTEI_FINAL_V6": (1,1,1,"Underlying sources retained in provenance","include","project_policy_approved","local:docs/HTEI_METHODOLOGY_V6.md"),
    }
    count=0
    for source_id in [r["source_id"] for r in rows(conn,"SELECT source_id FROM source_registry")]:
        existing = row(conn, "SELECT * FROM license_registry WHERE source_id=?", (source_id,)) or {}
        # A documented human/legal approval always takes precedence over the conservative
        # project policy. Deterministic refreshes must never erase reviewer identity,
        # evidence paths or a stricter source-specific distribution decision.
        if existing.get("review_status") == "approved" and existing.get("reviewer_name"):
            count += 1
            continue
        p=policies.get(source_id,(1,1,0,"Source-specific attribution","exclude_raw_keep_derived","project_policy_approved","local:docs/DATA_DISTRIBUTION_POLICY.md"))
        conn.execute("""INSERT INTO license_registry(source_id,terms_url,terms_version_date,storage_allowed,transformation_allowed,
            redistribution_allowed,attribution_required,release_archive_decision,review_status,reviewer_name,reviewed_at,evidence_path,notes)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(source_id) DO UPDATE SET terms_url=excluded.terms_url,terms_version_date=excluded.terms_version_date,
            storage_allowed=excluded.storage_allowed,transformation_allowed=excluded.transformation_allowed,
            redistribution_allowed=excluded.redistribution_allowed,attribution_required=excluded.attribution_required,
            release_archive_decision=excluded.release_archive_decision,review_status=excluded.review_status,
            reviewer_name=excluded.reviewer_name,reviewed_at=excluded.reviewed_at,evidence_path=excluded.evidence_path,notes=excluded.notes""",
            (source_id,p[6],"2026-07-11",p[0],p[1],p[2],p[3],p[4],p[5],"GIIP project distribution policy",utc_now(),"docs/DATA_DISTRIBUTION_POLICY.md",
             "Conservative archive policy. This record documents distribution handling and is not a substitute for legal advice."))
        count+=1
    conn.commit(); return count


def apply_offline_finalization(
    db_path: Path | str = DB_PATH,
    *,
    build_artifacts: bool = True,
    normalize_playwright: bool = True,
) -> dict[str, Any]:
    """Apply deterministic v6 scientific and delivery layers.

    Delivery files are written only when operating on the canonical project database.
    Isolated audit/test databases may rebuild SQL layers, but must never mutate the
    live project's manifests, derived exports or Playwright evidence.
    """
    requested_db = Path(db_path).resolve()
    canonical_db = (PROJECT_ROOT / "data" / "global_index_platform.sqlite").resolve()
    writes_delivery_files = requested_db == canonical_db
    with connect(requested_db) as conn:
        migrate_final_schema(conn)
        htei = build_htei_v6(conn)
        htei_v6_audit = run_htei_v6_sensitivity(conn)
        if writes_delivery_files:
            htei_manifest = register_htei_v6_release_metadata(conn, htei)
        else:
            htei_manifest = {
                "status": "skipped_for_noncanonical_database",
                "database": str(requested_db),
            }
        hci_plus_metadata = ensure_hci_plus_pending_metadata(conn)
        translations = fix_policy_brief_english(conn)
        licenses = finalize_license_distribution_policy(conn)
        if build_artifacts and writes_delivery_files:
            reproducibility = build_reproducibility_artifacts(conn)
        else:
            reproducibility = {"skipped": 1, "reason": "noncanonical database or explicitly disabled"}
    path_changes = (
        normalize_playwright_manifest_paths()
        if normalize_playwright and writes_delivery_files
        else 0
    )
    return {
        "htei_v6": htei,
        "htei_v6_audit": htei_v6_audit,
        "htei_manifest": htei_manifest,
        "hci_plus_metadata": hci_plus_metadata,
        "reproducibility": reproducibility,
        "policy_translations": translations,
        "license_rows": licenses,
        "playwright_paths": path_changes,
        "writes_delivery_files": writes_delivery_files,
    }
