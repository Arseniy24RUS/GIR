from __future__ import annotations

import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pycountry

HTEI_WEIGHTS = {
    "HT_EMPLOYMENT_SHARE": 0.22,
    "HIGH_TECH_OCCUPATIONS": 0.18,
    "RND_PERSONNEL": 0.18,
    "STEM_PIPELINE": 0.16,
    "TECH_OUTPUTS": 0.14,
    "CORPORATE_STRATEGY_AND_DEMAND": 0.12,
}
MIN_COMPONENTS = 2
MIN_AVAILABLE_WEIGHT = 0.30
RELEASE_YEAR = 2026
SOURCE_ID = "HTEI_MULTI_SOURCE"
FORMULA_VERSION = "htei-v3-multisource-asof-2026"
QUALITY_FLAG_SCORE = "asof_value_from_official_observations"
QUALITY_FLAG_COMPONENT = "selected_official_observation"
TRANSFORM_ID = "htei_asof_from_official_observations_v1"
RUN_ID = "htei_asof_from_official_observations_v1:release2026"
SNAPSHOT_PATH = "data/raw/HTEI_MULTI_SOURCE/2026/htei_asof_release_manifest.json"
MANIFEST_PAYLOAD = {
    "formula_version": FORMULA_VERSION,
    "release_year": RELEASE_YEAR,
    "mode": "HTEI_ASOF",
    "selection_rule": "latest selected official observation at or before release year",
    "minimum_rules": {
        "components": MIN_COMPONENTS,
        "available_weight": MIN_AVAILABLE_WEIGHT,
    },
    "quality_adjustment": "coverage, average source-year lag and source-group diversity",
    "underlying_observations": "source_observations",
}
MANIFEST_BYTES = json.dumps(MANIFEST_PAYLOAD, ensure_ascii=False, indent=2, sort_keys=True).encode("utf-8")
SNAPSHOT_SHA = hashlib.sha256(MANIFEST_BYTES).hexdigest()

RU_NAMES = {
    "ABW": "Аруба", "AIA": "Ангилья", "ASM": "Американское Самоа", "BMU": "Бермуды", "COK": "Острова Кука", "CUW": "Кюрасао", "CYM": "Каймановы острова", "FLK": "Фолклендские острова", "FRO": "Фарерские острова", "GGY": "Гернси", "GIB": "Гибралтар", "GRL": "Гренландия", "GUM": "Гуам", "IMN": "Остров Мэн", "JEY": "Джерси", "MSR": "Монтсеррат", "NCL": "Новая Каледония", "NIU": "Ниуэ", "PRI": "Пуэрто-Рико", "PRK": "КНДР", "PYF": "Французская Полинезия", "REU": "Реюньон", "SHN": "Остров Святой Елены", "SXM": "Синт-Мартен", "TCA": "Теркс и Кайкос", "TKL": "Токелау", "VGB": "Британские Виргинские острова", "WLF": "Уоллис и Футуна",
}

REGION_FALLBACKS = {
    "ABW": "Latin America & Caribbean", "AIA": "Latin America & Caribbean", "BMU": "North America", "CUW": "Latin America & Caribbean", "CYM": "Latin America & Caribbean", "MSR": "Latin America & Caribbean", "PRI": "Latin America & Caribbean", "SXM": "Latin America & Caribbean", "TCA": "Latin America & Caribbean", "VGB": "Latin America & Caribbean",
    "ASM": "East Asia & Pacific", "COK": "East Asia & Pacific", "GUM": "East Asia & Pacific", "NCL": "East Asia & Pacific", "NIU": "East Asia & Pacific", "PYF": "East Asia & Pacific", "TKL": "East Asia & Pacific", "WLF": "East Asia & Pacific",
    "FLK": "Latin America & Caribbean", "FRO": "Europe", "GGY": "Europe", "GIB": "Europe", "GRL": "Europe", "IMN": "Europe", "JEY": "Europe", "PRK": "East Asia & Pacific", "REU": "Sub-Saharan Africa", "SHN": "Sub-Saharan Africa",
}

INCOME_FALLBACKS = {
    "ABW": "High income", "AIA": "High income", "ASM": "High income", "BMU": "High income", "COK": "Upper middle income", "CUW": "High income", "CYM": "High income", "FLK": "High income", "FRO": "High income", "GGY": "High income", "GIB": "High income", "GRL": "High income", "GUM": "High income", "IMN": "High income", "JEY": "High income", "MSR": "Upper middle income", "NCL": "High income", "NIU": "Upper middle income", "PRI": "High income", "PRK": "Low income", "PYF": "High income", "REU": "High income", "SHN": "Upper middle income", "SXM": "High income", "TCA": "High income", "TKL": "Upper middle income", "VGB": "High income", "WLF": "High income",
}


def _rows(conn: sqlite3.Connection, sql: str, params: tuple = ()) -> list[dict[str, Any]]:
    cur = conn.execute(sql, params)
    return [dict(r) for r in cur.fetchall()]


def _row(conn: sqlite3.Connection, sql: str, params: tuple = ()) -> dict[str, Any] | None:
    cur = conn.execute(sql, params)
    r = cur.fetchone()
    return dict(r) if r else None


def _flag(iso2: str | None) -> str:
    if not iso2 or len(iso2) != 2:
        return ""
    base = 127397
    return "".join(chr(base + ord(ch)) for ch in iso2.upper())


def ensure_country_rows_for_htei(conn: sqlite3.Connection) -> None:
    existing = {r[0] for r in conn.execute("SELECT iso3 FROM countries").fetchall()}
    htei_iso = {r[0] for r in conn.execute("SELECT DISTINCT iso3 FROM source_observations WHERE index_code='HTEI'").fetchall()}
    for iso3 in sorted(htei_iso - existing):
        country = pycountry.countries.get(alpha_3=iso3)
        iso2 = getattr(country, "alpha_2", "") if country else ""
        name_en = getattr(country, "name", iso3) if country else iso3
        name_ru = RU_NAMES.get(iso3, name_en)
        region = REGION_FALLBACKS.get(iso3, "Other / not classified")
        income = INCOME_FALLBACKS.get(iso3, "Not classified")
        conn.execute(
            "INSERT OR REPLACE INTO countries(iso3, iso2, name_ru, name_en, region, income_group, population_m, flag) VALUES (?,?,?,?,?,?,?,?)",
            (iso3, iso2, name_ru, name_en, region, income, None, _flag(iso2)),
        )


def latest_source_observations(conn: sqlite3.Connection, release_year: int = RELEASE_YEAR) -> dict[str, dict[str, dict[str, Any]]]:
    sql = """
    SELECT * FROM (
      SELECT so.*, sr.source_name AS source_name,
             ROW_NUMBER() OVER (
               PARTITION BY so.iso3, so.component_code
               ORDER BY so.source_priority ASC, so.year DESC, so.source_id ASC
             ) AS selection_rank
      FROM source_observations so
      JOIN source_registry sr ON sr.source_id=so.source_id
      WHERE so.index_code='HTEI' AND so.selected=1 AND so.year BETWEEN ? AND ?
    ) ranked
    WHERE selection_rank=1
    ORDER BY iso3, component_code
    """
    out: dict[str, dict[str, dict[str, Any]]] = {}
    for r in _rows(conn, sql, (release_year - 29, release_year)):
        out.setdefault(r["iso3"], {})[r["component_code"]] = r
    return out


def minmax_norm(values: list[float]) -> tuple[float, float]:
    mn = min(values)
    mx = max(values)
    return mn, mx


def normalize_latest(latest: dict[str, dict[str, dict[str, Any]]]) -> dict[str, dict[str, float]]:
    norms: dict[str, dict[str, float]] = {}
    for comp in HTEI_WEIGHTS:
        vals = [float(comps[comp]["raw_value"]) for comps in latest.values() if comp in comps and comps[comp].get("raw_value") is not None]
        if not vals:
            continue
        mn, mx = minmax_norm(vals)
        for iso3, comps in latest.items():
            if comp not in comps:
                continue
            value = float(comps[comp]["raw_value"])
            score = 50.0 if mx == mn else (value - mn) / (mx - mn) * 100.0
            norms.setdefault(iso3, {})[comp] = max(0.0, min(100.0, score))
    return norms


def _quality(available_weight: float, source_years: list[int], source_groups: set[str], release_year: int = RELEASE_YEAR) -> float:
    coverage_quality = min(1.0, available_weight)
    if source_years:
        avg_lag = sum(max(0, release_year - int(y)) for y in source_years) / len(source_years)
    else:
        avg_lag = 10
    freshness_quality = max(0.35, 1.0 - min(avg_lag, 8) * 0.07)
    source_quality = min(1.0, len(source_groups) / 4.0)
    return round(0.50 * coverage_quality + 0.30 * freshness_quality + 0.20 * source_quality, 4)


def _provenance(base: dict[str, Any], formula_version: str, source_group_coverage: list[str] | None = None, available_weight: float | None = None) -> str:
    payload = {
        "source_id": base.get("source_id"),
        "source_name": base.get("source_name"),
        "source_url": base.get("source_url"),
        "retrieved_at": base.get("retrieved_at"),
        "release_year": base.get("release_year", RELEASE_YEAR),
        "source_release_year": base.get("source_release_year"),
        "raw_snapshot_path": base.get("raw_snapshot_path"),
        "raw_snapshot_sha256": base.get("raw_snapshot_sha256"),
        "transform_id": base.get("transform_id", TRANSFORM_ID),
        "transformation_run_id": base.get("transformation_run_id", RUN_ID),
        "formula_version": formula_version,
        "quality_flag": base.get("quality_flag"),
        "is_official": bool(base.get("is_official", False)),
        "underlying_source_is_official": bool(base.get("underlying_source_is_official", False)),
        "is_recomputed": bool(base.get("is_recomputed", True)),
        "source_group": base.get("source_group"),
        "source_priority": base.get("source_priority"),
        "selection_rule": base.get("selection_rule"),
        "dimensions_json": base.get("dimensions_json"),
        "source_group_coverage": source_group_coverage,
        "available_weight": available_weight,
    }
    return json.dumps(payload, ensure_ascii=False, sort_keys=True)



def ensure_support_rows(conn: sqlite3.Connection, release_year: int = RELEASE_YEAR) -> None:
    retrieved_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    manifest_path = Path(__file__).resolve().parents[1] / SNAPSHOT_PATH
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    if not manifest_path.exists() or manifest_path.read_bytes() != MANIFEST_BYTES:
        manifest_path.write_bytes(MANIFEST_BYTES)
    # The score source is the project methodology manifest; component rows keep original official source ids.
    existing = conn.execute("SELECT 1 FROM source_registry WHERE source_id=?", (SOURCE_ID,)).fetchone()
    if not existing:
        conn.execute(
            """INSERT OR REPLACE INTO source_registry(source_id, source_code, source_name, title, owner, url, source_url, access_mode, update_frequency, license_or_terms, license_note, automation_status, source_role, retrieved_at, release_year, latest_snapshot_id, is_official, free_access)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (SOURCE_ID, SOURCE_ID, "HTEI multi-source as-of computation manifest", "HTEI multi-source as-of computation manifest", "MGIMO / FNISC RAS", "local:methodology/htei-v3-asof", "local:methodology/htei-v3-asof", "recomputed from archived official observations", "per release build", "Project methodology; underlying values retain original official source terms", "Project methodology; underlying values retain original official source terms", "implemented_reproducible_transform", "qualitative_evidence", retrieved_at, release_year, f"{SOURCE_ID}:{release_year}:{SNAPSHOT_SHA[:16]}", 0, 1)
        )
    conn.execute(
        """INSERT OR IGNORE INTO raw_snapshots(snapshot_id, source_id, release_year, retrieved_at, source_url, raw_snapshot_path, raw_snapshot_sha256, content_type, bytes_count, is_official, license_or_terms)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
        (f"{SOURCE_ID}:{release_year}:{SNAPSHOT_SHA[:16]}", SOURCE_ID, release_year, retrieved_at, "local:methodology/htei-v3-asof", SNAPSHOT_PATH, SNAPSHOT_SHA, "application/json", len(MANIFEST_BYTES), 0, "Project methodology; underlying values retain original official source terms")
    )
    conn.execute(
        "UPDATE source_registry SET latest_snapshot_id=?, retrieved_at=?, release_year=?, is_official=0 WHERE source_id=?",
        (f"{SOURCE_ID}:{release_year}:{SNAPSHOT_SHA[:16]}", retrieved_at, release_year, SOURCE_ID),
    )

    weights_json = json.dumps(HTEI_WEIGHTS, ensure_ascii=False, sort_keys=True)
    formula_text_ru = "Индекс занятости в высокотехнологичных отраслях рассчитывается как многоисточниковый as-of composite: для каждой страны берётся последний доступный официальный показатель по каждому компоненту на дату релизной сборки; компоненты нормируются min-max по доступным странам; базовая оценка = сумма нормированных компонентов с весами, делённая на доступный вес; релизная оценка = базовая оценка × коэффициент качества данных."
    formula_text_en = "The High-Tech Employment Index is computed as a multi-source as-of composite: for each country the latest available official observation for every component is selected at release build time; components are min-max normalized across available countries; the base score is the weighted sum divided by available weight; the release score equals the base score multiplied by the data-quality coefficient."
    method_notes_ru = "Коэффициент качества учитывает покрытие компонентов, свежесть фактических лет данных и разнообразие групп источников. Каждое значение сохраняет source_data_year, источник, raw snapshot и SHA-256."
    method_notes_en = "The quality coefficient accounts for component coverage, source-data freshness and source-group diversity. Every value preserves source_data_year, source, raw snapshot and SHA-256."
    conn.execute(
        """INSERT OR REPLACE INTO index_formulas(index_code, formula_version, formula_text_ru, formula_text_en, method_notes_ru, method_notes_en, weights_json, normalization_ru, normalization_en, official_formula_available, source_id)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
        ("HTEI", FORMULA_VERSION, formula_text_ru, formula_text_en, method_notes_ru, method_notes_en, weights_json, "Min-max по последним доступным официальным наблюдениям; итоговая оценка нормируется на доступный вес и коэффициент качества данных.", "Min-max across latest available official observations; the final score is normalized by available weight and the data-quality coefficient.", 0, SOURCE_ID),
    )
    conn.execute(
        """INSERT OR REPLACE INTO transformation_runs(transformation_run_id, transform_id, source_id, snapshot_id, started_at, completed_at, code_version, rows_loaded, notes)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (RUN_ID, TRANSFORM_ID, SOURCE_ID, f"{SOURCE_ID}:{release_year}:{SNAPSHOT_SHA[:16]}", retrieved_at, retrieved_at, FORMULA_VERSION, 0, "As-of HTEI release composite from archived official source observations")
    )


def ensure_htei_asof_release(conn: sqlite3.Connection, release_year: int = RELEASE_YEAR) -> dict[str, Any]:
    conn.row_factory = sqlite3.Row
    ensure_support_rows(conn, release_year)
    ensure_country_rows_for_htei(conn)
    latest = latest_source_observations(conn, release_year)
    norms = normalize_latest(latest)
    countries = {r["iso3"]: r for r in _rows(conn, "SELECT * FROM countries")}
    # Remove only release-year HTEI composite rows; historical official/asof snapshots stay intact.
    for table, col in [("index_scores", "index_code"), ("rankings", "index_code"), ("component_values", "index_code"), ("diagnostics", "index_code")]:
        conn.execute(f"DELETE FROM {table} WHERE {col}='HTEI' AND year=?", (release_year,))
    conn.execute("DELETE FROM recommendations WHERE index_code='HTEI' AND year=?", (release_year,))

    comps_meta = {r["component_code"]: r for r in _rows(conn, "SELECT * FROM components WHERE index_code='HTEI'")}
    htei_scores: list[dict[str, Any]] = []
    component_rows: list[dict[str, Any]] = []
    diagnostics_rows: list[dict[str, Any]] = []
    recommendations: list[dict[str, Any]] = []

    for iso3, comp_obs in latest.items():
        if iso3 not in countries:
            continue
        available = [comp for comp in HTEI_WEIGHTS if comp in comp_obs and comp in norms.get(iso3, {})]
        available_weight = sum(HTEI_WEIGHTS[c] for c in available)
        if len(available) < MIN_COMPONENTS or available_weight < MIN_AVAILABLE_WEIGHT:
            continue
        source_years = [int(comp_obs[c]["source_data_year"] or comp_obs[c]["year"]) for c in available]
        source_groups = {str(comp_obs[c].get("source_group") or comp_obs[c].get("source_id")) for c in available}
        # Normalize by available weight to avoid mechanically penalizing countries whose official statistical systems publish fewer optional components.
        base_score = sum(norms[iso3][c] * HTEI_WEIGHTS[c] for c in available) / available_weight
        quality = _quality(available_weight, source_years, source_groups, release_year)
        # The release score is confidence-adjusted so that thin or stale country profiles cannot outrank
        # well documented high-technology workforce systems merely because of one extreme official observation.
        score = base_score * quality
        htei_scores.append({
            "iso3": iso3,
            "score": round(score, 6),
            "base_score": round(base_score, 6),
            "available": available,
            "available_weight": available_weight,
            "source_data_year": min(source_years),
            "latest_source_data_year": max(source_years),
            "data_quality": quality,
            "source_group_coverage": sorted(source_groups),
        })

    htei_scores.sort(key=lambda x: (x["score"], x["data_quality"]), reverse=True)
    total = len(htei_scores)
    for rank, score_item in enumerate(htei_scores, start=1):
        score_item["rank"] = rank
        score_item["percentile"] = round((total - rank + 1) / total * 100.0, 4) if total else None

    # Precompute frontiers after component normalization.
    frontier_by_component = {comp: max((norms.get(iso, {}).get(comp, 0.0) for iso in norms), default=100.0) for comp in HTEI_WEIGHTS}
    top10 = {s["iso3"] for s in htei_scores[:10]}
    top10_avg = {}
    for comp in HTEI_WEIGHTS:
        vals = [norms.get(iso, {}).get(comp) for iso in top10 if comp in norms.get(iso, {})]
        top10_avg[comp] = sum(vals) / len(vals) if vals else None

    retrieved_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    score_rows = []
    ranking_rows = []
    comp_rows = []
    diag_rows = []
    rec_rows = []
    for s in htei_scores:
        iso3 = s["iso3"]
        score_value_id = f"HTEI:{iso3}:{release_year}:score"
        score_base = {
            "source_id": SOURCE_ID,
            "source_name": "HTEI multi-source as-of composite",
            "source_url": "local:methodology/htei-v3-asof",
            "retrieved_at": retrieved_at,
            "release_year": release_year,
            "raw_snapshot_path": SNAPSHOT_PATH,
            "raw_snapshot_sha256": SNAPSHOT_SHA,
            "transform_id": TRANSFORM_ID,
            "transformation_run_id": RUN_ID,
            "formula_version": FORMULA_VERSION,
            "quality_flag": QUALITY_FLAG_SCORE,
            "is_official": False,
            "is_recomputed": True,
        }
        score_rows.append({
            "value_id": score_value_id,
            "index_code": "HTEI",
            "iso3": iso3,
            "year": release_year,
            "source_data_year": s["source_data_year"],
            "score": s["score"],
            "rank": s["rank"],
            "percentile": s["percentile"],
            "rank_delta_1y": None,
            "rank_delta_5y": None,
            "data_quality": s["data_quality"],
            "source_type": "recomputed_from_official_components",
            "source_id": SOURCE_ID,
            "source_url": "local:methodology/htei-v3-asof",
            "retrieved_at": retrieved_at,
            "release_year": release_year,
            "raw_snapshot_path": SNAPSHOT_PATH,
            "raw_snapshot_sha256": SNAPSHOT_SHA,
            "transformation_run_id": RUN_ID,
            "transform_id": TRANSFORM_ID,
            "formula_version": FORMULA_VERSION,
            "quality_flag": QUALITY_FLAG_SCORE,
            "is_official": 0,
            "is_recomputed": 1,
            "provenance_json": _provenance(score_base, FORMULA_VERSION, s["source_group_coverage"], s["available_weight"]),
        })
        ranking_rows.append({"index_code": "HTEI", "iso3": iso3, "year": release_year, "rank": s["rank"], "score": s["score"], "percentile": s["percentile"], "value_id": score_value_id})
        country_components = []
        for comp in s["available"]:
            obs = comp_obs = latest[iso3][comp]
            norm = norms[iso3][comp]
            weight = HTEI_WEIGHTS[comp]
            contribution = norm * weight / s["available_weight"] * s["data_quality"]
            frontier = frontier_by_component.get(comp, 100.0)
            gap = max(0.0, frontier - norm)
            peer = top10_avg.get(comp)
            peer_gap = max(0.0, (peer if peer is not None else frontier) - norm)
            actionability = {"HT_EMPLOYMENT_SHARE":0.75,"HIGH_TECH_OCCUPATIONS":0.8,"RND_PERSONNEL":0.65,"STEM_PIPELINE":0.85,"TECH_OUTPUTS":0.55,"CORPORATE_STRATEGY_AND_DEMAND":0.7}.get(comp,0.6)
            leverage = 1.0 + (gap / 100.0)
            priority = gap * weight * leverage * actionability
            value_id = f"HTEI:{iso3}:{release_year}:{comp}"
            source_base = dict(obs)
            source_base.update({
                "release_year": release_year,
                "source_release_year": obs.get("release_year"),
                "quality_flag": QUALITY_FLAG_COMPONENT,
                "is_official": False,
                "underlying_source_is_official": True,
                "is_recomputed": True,
            })
            component = {
                "value_id": value_id,
                "index_code": "HTEI",
                "component_code": comp,
                "iso3": iso3,
                "year": release_year,
                "source_data_year": int(obs.get("source_data_year") or obs.get("year")),
                "raw_value": float(obs["raw_value"]),
                "unit": obs.get("unit") or "official source unit",
                "normalized_score": round(norm, 6),
                "weighted_contribution": round(contribution, 6),
                "gap_to_frontier": round(gap, 6),
                "gap_to_peer_group": round(peer_gap, 6),
                "weighted_gap": round(gap * weight, 6),
                "rank_leverage": round(leverage, 6),
                "actionability": actionability,
                "priority_score": round(priority, 6),
                "source_id": obs["source_id"],
                "source_url": obs["source_url"],
                "retrieved_at": obs["retrieved_at"],
                "release_year": release_year,
                "raw_snapshot_path": obs["raw_snapshot_path"],
                "raw_snapshot_sha256": obs["raw_snapshot_sha256"],
                "transformation_run_id": obs["transformation_run_id"],
                "transform_id": obs["transform_id"],
                "formula_version": FORMULA_VERSION,
                "quality_flag": QUALITY_FLAG_COMPONENT,
                "is_official": 0,
                "is_recomputed": 1,
                "source_note": comps_meta.get(comp, {}).get("source_note"),
                "provenance_json": _provenance(source_base, FORMULA_VERSION, [obs.get("source_group") or obs.get("source_id")], weight),
            }
            comp_rows.append(component)
            country_components.append(component)
        if country_components:
            country_components.sort(key=lambda x: x["priority_score"], reverse=True)
            top = country_components[0]
            strong = max(country_components, key=lambda x: x["normalized_score"])
            diag_id = f"HTEI:{iso3}:{release_year}:{top['component_code']}"
            diag_rows.append({
                "diagnostic_id": diag_id,
                "iso3": iso3,
                "index_code": "HTEI",
                "component_code": top["component_code"],
                "year": release_year,
                "gap_to_frontier": top["gap_to_frontier"],
                "gap_to_peer_group": top["gap_to_peer_group"],
                "weighted_gap": top["weighted_gap"],
                "rank_leverage": top["rank_leverage"],
                "actionability": top["actionability"],
                "data_quality": s["data_quality"],
                "priority_score": top["priority_score"],
                "weakest_component": top["component_code"],
                "highest_leverage_component": strong["component_code"],
                "explanation_ru": "Приоритет выбран на основе разрыва до фронтира, веса компонента, управляемости и влияния на место страны в Индексе занятости в высокотехнологичных отраслях.",
                "explanation_en": "The priority is selected using frontier gap, component weight, actionability and expected rank leverage in the High-Tech Employment Index.",
                "source_value_id": top["value_id"],
            })
            rec_rows.append({
                "iso3": iso3,
                "index_code": "HTEI",
                "component_code": top["component_code"],
                "year": release_year,
                "priority_score": top["priority_score"],
                "title_ru": f"Усилить компонент HTEI: {comps_meta.get(top['component_code'],{}).get('name_ru', top['component_code'])}",
                "title_en": f"Strengthen HTEI component: {comps_meta.get(top['component_code'],{}).get('name_en', top['component_code'])}",
                "text_ru": "Рекомендация связана с пунктом 2.4 исходного ТЗ: практические рекомендации по формированию трудовых ресурсов в высокотехнологичных отраслях Российской Федерации. Мера должна быть привязана к источнику данных, бенчмарку top-10 и фактическому году наблюдения компонента.",
                "text_en": "The recommendation is linked to the original ToR task on practical measures for building high-technology workforce capacity. The policy measure must reference the source, top-10 benchmark and actual component data year.",
                "horizon": "2026-2030",
                "policy_area": "HTEI",
            })

    def insert_many(table: str, rows: list[dict[str, Any]]):
        if not rows:
            return
        cols = list(rows[0].keys())
        sql = f"INSERT OR REPLACE INTO {table} ({','.join(cols)}) VALUES ({','.join(['?']*len(cols))})"
        conn.executemany(sql, [[r.get(c) for c in cols] for r in rows])

    insert_many("index_scores", score_rows)
    insert_many("rankings", ranking_rows)
    insert_many("component_values", comp_rows)
    insert_many("diagnostics", diag_rows)
    # recommendations.id is autoincrement; can't use insert_many with no id conflict.
    if rec_rows:
        cols = list(rec_rows[0].keys())
        sql = f"INSERT INTO recommendations ({','.join(cols)}) VALUES ({','.join(['?']*len(cols))})"
        conn.executemany(sql, [[r.get(c) for c in cols] for r in rec_rows])
    conn.execute(
        "UPDATE transformation_runs SET rows_loaded=?, completed_at=? WHERE transformation_run_id=?",
        (len(score_rows) + len(comp_rows), retrieved_at, RUN_ID),
    )
    # rank deltas for HTEI release year only
    prev_ranks = {r["iso3"]: r["rank"] for r in _rows(conn, "SELECT iso3, rank FROM index_scores WHERE index_code='HTEI' AND year=?", (release_year-1,))}
    prev5_ranks = {r["iso3"]: r["rank"] for r in _rows(conn, "SELECT iso3, rank FROM index_scores WHERE index_code='HTEI' AND year=?", (release_year-5,))}
    for s in score_rows:
        iso3 = s["iso3"]
        delta1 = (prev_ranks[iso3] - s["rank"]) if iso3 in prev_ranks else None
        delta5 = (prev5_ranks[iso3] - s["rank"]) if iso3 in prev5_ranks else None
        conn.execute("UPDATE index_scores SET rank_delta_1y=?, rank_delta_5y=? WHERE value_id=?", (delta1, delta5, s["value_id"]))
    return {"status": "ok", "release_year": release_year, "htei_scores": len(score_rows), "component_rows": len(comp_rows), "countries_total": _row(conn, "SELECT COUNT(*) AS n FROM countries")["n"]}
