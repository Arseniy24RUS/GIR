from __future__ import annotations

import csv
import hashlib
import json
import math
import sqlite3
import statistics
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from .db import SCIENTIFIC_SCHEMA

RELEASE_YEAR = 2026
FORMULA_VERSION = "htei-v5-scientific-2026"
METHODOLOGY_VERSION = "GIIP-scientific-release-v5"
SENSITIVITY_SEED = 20260710


class _DeterministicUniform:
    """Small deterministic generator for reproducible methodology stress tests.

    It is deliberately independent of country data and uses SHA-256 to map a
    seed/counter pair to a stable value in [0, 1). This avoids any accidental
    dependence on process-global pseudo-random state.
    """

    def __init__(self, seed: int) -> None:
        self.seed = int(seed)
        self.counter = 0

    def uniform(self, lower: float, upper: float) -> float:
        payload = f"{self.seed}:{self.counter}".encode("utf-8")
        self.counter += 1
        integer = int.from_bytes(hashlib.sha256(payload).digest()[:8], "big")
        fraction = integer / float(1 << 64)
        return lower + (upper - lower) * fraction
PROJECT_ROOT = Path(__file__).resolve().parents[1]
MANIFEST_RELATIVE = "data/raw/HTEI_SCIENTIFIC_V5/2026/htei_scientific_v5_manifest.json"

HTEI_WEIGHTS: dict[str, float] = {
    "HT_EMPLOYMENT_SHARE": 0.22,
    "HIGH_TECH_OCCUPATIONS": 0.18,
    "RND_PERSONNEL": 0.18,
    "STEM_PIPELINE": 0.16,
    "TECH_OUTPUTS": 0.14,
    "CORPORATE_STRATEGY_AND_DEMAND": 0.12,
}

# Strict comparable ranking. A separate extended comparable mode is offered for
# policy analysis, while ASOF profiles never receive a rank.
CORE_MAX_LAG = 5
ASOF_MAX_LAG = 15
EXTENDED_MAX_LAG: dict[str, int] = {
    "HT_EMPLOYMENT_SHARE": 5,
    "HIGH_TECH_OCCUPATIONS": 5,
    "RND_PERSONNEL": 6,
    "STEM_PIPELINE": 8,
    "TECH_OUTPUTS": 5,
    "CORPORATE_STRATEGY_AND_DEMAND": 7,
}
CORE_MIN_COMPONENTS = 4
CORE_MIN_WEIGHT = 0.70
CORE_MIN_SOURCE_GROUPS = 3
ASOF_MIN_COMPONENTS = 2
ASOF_MIN_WEIGHT = 0.30
MANDATORY_LABOUR_COMPONENTS = {"HT_EMPLOYMENT_SHARE", "HIGH_TECH_OCCUPATIONS"}

COMPONENT_META: dict[str, dict[str, str]] = {
    "HT_EMPLOYMENT_SHARE": {
        "name_ru": "Занятость в информационно-коммуникационных и профессионально-научно-технических видах деятельности / high-tech и KIS там, где доступна прямая статистика",
        "name_en": "Employment in information, communication and professional/scientific/technical activities / direct high-tech and KIS statistics where available",
        "proxy_status": "mixed_direct_and_sector_proxy",
        "interpretation_ru": "Для Eurostat используется секторный high-tech/KIS подход; для глобального покрытия — прозрачно маркированный отраслевой proxy. Показатель не интерпретируется как полностью идентичная статистика во всех странах.",
        "interpretation_en": "Eurostat uses the sectoral high-tech/KIS approach; global coverage uses a transparently labelled sector proxy. The measure is not treated as perfectly identical across all countries.",
    },
    "HIGH_TECH_OCCUPATIONS": {
        "name_ru": "Доля специалистов высшего и среднего профессионально-технического уровня (ISCO-08 2–3, широкий профессиональный proxy)",
        "name_en": "Share of professionals and technicians (ISCO-08 groups 2–3, broad occupational proxy)",
        "proxy_status": "broad_occupation_proxy_not_exclusively_high_tech",
        "interpretation_ru": "ISCO-08 major groups 2–3 включают широкий круг специалистов и техников и не являются исключительно перечнем high-tech профессий. Показатель используется как международно сопоставимый proxy профессиональной интенсивности.",
        "interpretation_en": "ISCO-08 major groups 2–3 include a broad range of professionals and technicians and are not exclusively high-tech occupations. The measure is used as an internationally comparable proxy for occupational intensity.",
    },
    "RND_PERSONNEL": {
        "name_ru": "Персонал исследований и разработок",
        "name_en": "Research and development personnel",
        "proxy_status": "direct_or_harmonised_official_indicator",
        "interpretation_ru": "Используется официальный показатель численности исследователей и/или техников НИОКР на миллион населения либо сопоставимая гармонизированная мера.",
        "interpretation_en": "Uses official researchers and/or R&D technicians per million population or a comparable harmonised measure.",
    },
    "STEM_PIPELINE": {
        "name_ru": "Образовательный поток STEM",
        "name_en": "STEM education pipeline",
        "proxy_status": "official_education_indicator",
        "interpretation_ru": "Доля выпускников третичного образования по естественным наукам, математике, ИКТ, инженерным и смежным направлениям; фактический состав раскрывается в provenance.",
        "interpretation_en": "Share of tertiary graduates in natural sciences, mathematics, ICT, engineering and related fields; the actual field composition is disclosed in provenance.",
    },
    "TECH_OUTPUTS": {
        "name_ru": "Технологические результаты экономики",
        "name_en": "Technology outputs of the economy",
        "proxy_status": "transparent_composite_proxy",
        "interpretation_ru": "Композит официальных показателей high-tech exports, ICT services exports и/или патентной активности. Для каждой страны интерфейс раскрывает фактически использованные исходные показатели.",
        "interpretation_en": "Composite of official high-tech exports, ICT services exports and/or patent activity indicators. The interface discloses the actual inputs used for each country.",
    },
    "CORPORATE_STRATEGY_AND_DEMAND": {
        "name_ru": "Корпоративное участие в НИОКР (proxy корпоративной технологической активности; не показатель вакансий)",
        "name_en": "Business participation in R&D (proxy for corporate technology activity; not a vacancy measure)",
        "proxy_status": "corporate_rd_proxy_not_labour_demand",
        "interpretation_ru": "Доля бизнес-сектора в расходах на НИОКР используется как proxy корпоративной технологической активности. Она не измеряет напрямую вакансии, дефицит навыков или кадровые стратегии.",
        "interpretation_en": "The business-sector share of R&D expenditure is used as a proxy for corporate technology activity. It does not directly measure vacancies, skill shortages or workforce strategy.",
    },
}

SOURCE_GROUP_MAP = {
    "ILOSTAT_HTEI": "ILOSTAT",
    "OECD_HTEI": "OECD",
    "EUROSTAT_HTEC": "EUROSTAT",
    "UIS_HTEI": "UNESCO_UIS",
    "WORLD_BANK_HTEI": "WORLD_BANK",
    "NATIONAL_STATS_HTEI": "NATIONAL_STATS",
}
METHOD_TIER = {
    "NATIONAL_STATS": 1,
    "EUROSTAT": 2,
    "OECD": 3,
    "ILOSTAT": 4,
    "UNESCO_UIS": 5,
    "WORLD_BANK": 6,
}

INDEX_METHODOLOGY = {
    "HDI": {
        "score_status": "official_score",
        "component_status": "platform_diagnostic_decomposition",
        "formula_status": "official_formula_not_recomputed_by_platform",
        "label_ru": "Официальное значение ИЧР; компонентная панель — аналитическая диагностика платформы",
        "label_en": "Official HDI score; component panel is a platform diagnostic decomposition",
        "warning_ru": "Официальный ИЧР UNDP рассчитывается как геометрическое среднее индексов здоровья, образования и дохода с фиксированными целевыми границами и логарифмическим преобразованием дохода. Min-max компоненты платформы не являются официальным пересчётом ИЧР.",
        "warning_en": "The official UNDP HDI is the geometric mean of health, education and income indices using fixed goalposts and a logarithmic income transformation. Platform min-max components are not an official HDI recomputation.",
        "source_url": "https://hdr.undp.org/data-center/human-development-index",
    },
    "HCI": {
        "score_status": "official_historical_score_2020",
        "component_status": "official_indicators_with_platform_diagnostics",
        "formula_status": "historical_edition_not_recomputed",
        "label_ru": "Официальная историческая редакция Индекса человеческого капитала 2020",
        "label_en": "Official historical 2020 Human Capital Index edition",
        "warning_ru": "Модуль отражает историческую редакцию HCI 2020. До загрузки официального HCI+ 2026 он не должен называться актуальным индексом человеческого капитала 2026 года.",
        "warning_en": "This module represents the historical 2020 HCI edition. Until official HCI+ 2026 data are loaded, it must not be presented as the current 2026 human capital index.",
        "source_url": "https://www.worldbank.org/en/publication/human-capital",
    },
    "GTCI": {
        "score_status": "official_score",
        "component_status": "official_pillar_ranks_with_platform_transformation",
        "formula_status": "official_methodology_not_recomputed",
        "label_ru": "Официальный итоговый score GTCI и официальные ранги направлений; преобразованная шкала — диагностика платформы",
        "label_en": "Official GTCI score and official pillar ranks; transformed scale is platform diagnostics",
        "warning_ru": "Платформа не выдаёт преобразованные ранги направлений за официальный компонентный score GTCI.",
        "warning_en": "The platform does not present transformed pillar ranks as official GTCI component scores.",
        "source_url": "https://www.insead.edu/global-talent-competitiveness-index",
    },
    "GII": {
        "score_status": "official_score",
        "component_status": "official_pillar_scores",
        "formula_status": "official_methodology_not_recomputed",
        "label_ru": "Официальный score и официальные pillar scores Глобального инновационного индекса",
        "label_en": "Official Global Innovation Index score and official pillar scores",
        "warning_ru": "Платформа не пересчитывает официальный GII и не интерпретирует равные веса визуальных блоков как официальную формулу WIPO.",
        "warning_en": "The platform does not recompute the official GII and does not treat equal visual-block weights as the official WIPO formula.",
        "source_url": "https://www.wipo.int/global_innovation_index/en/",
    },
    "IDI": {
        "score_status": "official_score",
        "component_status": "official_pillar_scores",
        "formula_status": "official_methodology",
        "label_ru": "Официальный Индекс развития ИКТ ITU",
        "label_en": "Official ITU ICT Development Index",
        "warning_ru": "Фактический год и редакция IDI показываются рядом со значением.",
        "warning_en": "The actual IDI year and edition are displayed next to the value.",
        "source_url": "https://www.itu.int/itu-d/reports/statistics/idi2025/",
    },
    "QS_ET": {
        "score_status": "derived_country_aggregation",
        "component_status": "official_university_rows_with_platform_aggregation",
        "formula_status": "platform_formula",
        "label_ru": "Авторская страновая агрегация официального университетского рейтинга QS Engineering & Technology",
        "label_en": "Platform country aggregation of official QS Engineering & Technology university ranking rows",
        "warning_ru": "QS не публикует официальный страновой рейтинг Engineering & Technology. Страновой score является воспроизводимой авторской агрегацией платформы.",
        "warning_en": "QS does not publish an official Engineering & Technology country ranking. The country score is a reproducible platform aggregation.",
        "source_url": "https://www.topuniversities.com/university-subject-rankings/engineering-technology",
    },
    "HTEI": {
        "score_status": "project_composite_index",
        "component_status": "official_inputs_with_explicit_proxies",
        "formula_status": "platform_formula_scientific_v5",
        "label_ru": "Авторский Индекс занятости в высокотехнологичных отраслях, предусмотренный исходным ТЗ МГИМО",
        "label_en": "Project High-Tech Employment Index required by the original MGIMO terms of reference",
        "warning_ru": "Основной рейтинг строится только для сопоставимого ядра стран. Широкий ASOF-профиль является диагностическим и не получает места в синхронном международном рейтинге.",
        "warning_en": "The primary ranking is limited to the comparable country core. The broad ASOF profile is diagnostic and receives no rank in the synchronous international ranking.",
        "source_url": "local:docs/HTEI_METHODOLOGY_V5.md",
    },
}


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _rows(conn: sqlite3.Connection, sql: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    return [dict(r) for r in conn.execute(sql, params).fetchall()]


def _row(conn: sqlite3.Connection, sql: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
    r = conn.execute(sql, params).fetchone()
    return dict(r) if r else None


def _json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True)


def _quantile(values: list[float], q: float) -> float:
    if not values:
        return 0.0
    vals = sorted(float(v) for v in values)
    if len(vals) == 1:
        return vals[0]
    pos = (len(vals) - 1) * q
    lo = int(math.floor(pos))
    hi = int(math.ceil(pos))
    if lo == hi:
        return vals[lo]
    return vals[lo] + (vals[hi] - vals[lo]) * (pos - lo)


def _winsor_minmax(value: float, values: list[float]) -> float:
    low = _quantile(values, 0.025)
    high = _quantile(values, 0.975)
    if high <= low:
        return 50.0
    clipped = min(high, max(low, value))
    return max(0.0, min(100.0, (clipped - low) / (high - low) * 100.0))


def _percentile_score(value: float, values: list[float]) -> float:
    if len(values) <= 1:
        return 50.0
    less = sum(1 for v in values if v < value)
    equal = sum(1 for v in values if v == value)
    return (less + 0.5 * equal) / len(values) * 100.0


def _robust_z_score(value: float, values: list[float]) -> float:
    if len(values) <= 2:
        return 50.0
    med = statistics.median(values)
    deviations = [abs(v - med) for v in values]
    mad = statistics.median(deviations)
    if mad <= 1e-12:
        return 50.0
    z = (value - med) / (1.4826 * mad)
    return 100.0 / (1.0 + math.exp(-max(-8.0, min(8.0, z))))


def _source_group(observation: dict[str, Any]) -> str:
    source_id = str(observation.get("source_id") or "")
    if source_id in SOURCE_GROUP_MAP:
        return SOURCE_GROUP_MAP[source_id]
    group = str(observation.get("source_group") or source_id or "UNKNOWN")
    if group == "WORLD_BANK_UIS":
        return "UNESCO_UIS" if source_id.startswith("UIS") else "WORLD_BANK"
    return group


def _method_tier(observation: dict[str, Any]) -> int:
    return METHOD_TIER.get(_source_group(observation), 9)


def _selected_observations(conn: sqlite3.Connection, release_year: int) -> dict[str, dict[str, dict[str, Any]]]:
    observations = _rows(
        conn,
        """SELECT so.*, sr.source_name, sr.owner, sr.source_role
           FROM source_observations so JOIN source_registry sr ON sr.source_id=so.source_id
           WHERE so.index_code='HTEI' AND so.selected=1 AND so.year<=?
           ORDER BY so.iso3, so.component_code, so.year DESC""",
        (release_year,),
    )
    grouped: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for obs in observations:
        if obs["component_code"] in HTEI_WEIGHTS:
            grouped[(obs["iso3"], obs["component_code"])].append(obs)
    selected: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    for (iso3, component), candidates in grouped.items():
        newest_year = max(int(c["source_data_year"] or c["year"]) for c in candidates)
        # Prevent an older preferred source from displacing a materially fresher official observation.
        near_freshest = [
            c for c in candidates
            if int(c["source_data_year"] or c["year"]) >= newest_year - 3
        ]
        near_freshest.sort(
            key=lambda c: (
                _method_tier(c),
                -int(c["source_data_year"] or c["year"]),
                int(c.get("source_priority") or 99),
                str(c.get("source_id") or ""),
            )
        )
        chosen = dict(near_freshest[0])
        chosen["normalized_source_group"] = _source_group(chosen)
        chosen["selection_rule_v5"] = (
            "filter_to_observations_within_3_years_of_freshest; then methodological_tier; "
            "then actual_year_desc; then source_priority"
        )
        selected[iso3][component] = chosen
    return selected


def _component_age_allowed(component: str, lag: int, mode: str) -> bool:
    if mode == "comparable_core":
        return lag <= CORE_MAX_LAG
    if mode == "comparable_extended":
        return lag <= EXTENDED_MAX_LAG[component]
    return lag <= ASOF_MAX_LAG


def _mode_eligibility(components: dict[str, dict[str, Any]], release_year: int, mode: str) -> tuple[list[str], list[str]]:
    usable = [
        code for code, obs in components.items()
        if _component_age_allowed(code, release_year - int(obs.get("source_data_year") or obs["year"]), mode)
    ]
    available_weight = sum(HTEI_WEIGHTS[c] for c in usable)
    groups = {_source_group(components[c]) for c in usable}
    reasons: list[str] = []
    if mode == "asof_diagnostic":
        if len(usable) < ASOF_MIN_COMPONENTS:
            reasons.append("fewer_than_2_components")
        if available_weight < ASOF_MIN_WEIGHT:
            reasons.append("available_weight_below_0_30")
        return usable, reasons
    if len(usable) < CORE_MIN_COMPONENTS:
        reasons.append("fewer_than_4_components")
    if available_weight < CORE_MIN_WEIGHT:
        reasons.append("available_weight_below_0_70")
    if len(groups) < CORE_MIN_SOURCE_GROUPS:
        reasons.append("fewer_than_3_independent_source_groups")
    if not (MANDATORY_LABOUR_COMPONENTS & set(usable)):
        reasons.append("missing_mandatory_labour_component")
    return usable, reasons


def _confidence(usable: list[str], components: dict[str, dict[str, Any]], release_year: int) -> tuple[float, str, str, float]:
    available_weight = sum(HTEI_WEIGHTS[c] for c in usable)
    lags = [release_year - int(components[c].get("source_data_year") or components[c]["year"]) for c in usable]
    avg_lag = statistics.mean(lags) if lags else float(release_year)
    freshness = max(0.0, 1.0 - min(avg_lag, 15.0) / 15.0)
    groups = {_source_group(components[c]) for c in usable}
    diversity = min(1.0, len(groups) / 4.0)
    score = max(0.0, min(1.0, 0.50 * available_weight + 0.30 * freshness + 0.20 * diversity))
    coverage_class = "A" if available_weight >= 0.90 and len(usable) >= 5 else "B" if available_weight >= 0.70 and len(usable) >= 4 else "C" if available_weight >= 0.50 else "D"
    freshness_class = "current" if avg_lag <= 2 else "recent" if avg_lag <= 5 else "stale"
    return round(score, 6), coverage_class, freshness_class, avg_lag


def _ensure_methodology_source(conn: sqlite3.Connection, release_year: int) -> tuple[str, str]:
    manifest = {
        "methodology_version": METHODOLOGY_VERSION,
        "formula_version": FORMULA_VERSION,
        "release_year": release_year,
        "modes": {
            "comparable_core": {
                "minimum_components": CORE_MIN_COMPONENTS,
                "minimum_weight": CORE_MIN_WEIGHT,
                "minimum_source_groups": CORE_MIN_SOURCE_GROUPS,
                "maximum_component_lag": CORE_MAX_LAG,
                "mandatory_components_any_of": sorted(MANDATORY_LABOUR_COMPONENTS),
            },
            "comparable_extended": {
                "minimum_components": CORE_MIN_COMPONENTS,
                "minimum_weight": CORE_MIN_WEIGHT,
                "minimum_source_groups": CORE_MIN_SOURCE_GROUPS,
                "component_specific_max_lag": EXTENDED_MAX_LAG,
                "mandatory_components_any_of": sorted(MANDATORY_LABOUR_COMPONENTS),
            },
            "asof_diagnostic": {
                "minimum_components": ASOF_MIN_COMPONENTS,
                "minimum_weight": ASOF_MIN_WEIGHT,
                "maximum_component_lag": ASOF_MAX_LAG,
                "rank": None,
            },
        },
        "normalization": "2.5/97.5 percentile winsorized min-max; alternatives tested in sensitivity audit",
        "quality_treatment": "confidence is reported separately and never multiplies substantive score",
        "selection_rule": "freshness window first, then methodological tier, actual year and source priority",
        "components": {k: {"weight": HTEI_WEIGHTS[k], **COMPONENT_META[k]} for k in HTEI_WEIGHTS},
    }
    payload = json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True).encode("utf-8")
    sha = hashlib.sha256(payload).hexdigest()
    path = PROJECT_ROOT / MANIFEST_RELATIVE
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)
    retrieved = _now()
    source_id = "HTEI_SCIENTIFIC_V5"
    snapshot_id = f"{source_id}:{release_year}:{sha[:16]}"
    conn.execute(
        """INSERT INTO source_registry(
             source_id,source_code,source_name,title,owner,url,source_url,access_mode,update_frequency,
             license_or_terms,license_note,automation_status,source_role,retrieved_at,release_year,
             latest_snapshot_id,is_official,free_access)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
           ON CONFLICT(source_id) DO UPDATE SET
             source_code=excluded.source_code,
             source_name=excluded.source_name,
             title=excluded.title,
             owner=excluded.owner,
             url=excluded.url,
             source_url=excluded.source_url,
             access_mode=excluded.access_mode,
             update_frequency=excluded.update_frequency,
             license_or_terms=excluded.license_or_terms,
             license_note=excluded.license_note,
             automation_status=excluded.automation_status,
             source_role=excluded.source_role,
             retrieved_at=COALESCE(source_registry.retrieved_at,excluded.retrieved_at),
             release_year=excluded.release_year,
             latest_snapshot_id=excluded.latest_snapshot_id,
             is_official=excluded.is_official,
             free_access=excluded.free_access""",
        (
            source_id, source_id, "HTEI scientific methodology v5", "HTEI scientific methodology v5",
            "MGIMO / FNISC RAS project team", "local:docs/HTEI_METHODOLOGY_V5.md",
            "local:docs/HTEI_METHODOLOGY_V5.md", "local reproducible transform", "on every official-source refresh",
            "Project methodology; underlying official sources retain their own terms", "No third-party raw data embedded in this manifest",
            "implemented_reproducible_scientific_transform", "computed_methodology", retrieved, release_year,
            snapshot_id, 0, 1,
        ),
    )
    conn.execute(
        """INSERT OR REPLACE INTO raw_snapshots(snapshot_id,source_id,release_year,retrieved_at,source_url,
             raw_snapshot_path,raw_snapshot_sha256,content_type,bytes_count,is_official,license_or_terms)
           VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        (snapshot_id, source_id, release_year, retrieved, "local:docs/HTEI_METHODOLOGY_V5.md", MANIFEST_RELATIVE, sha, "application/json", len(payload), 0, "Project methodology"),
    )
    run_id = f"htei-v5-scientific:{release_year}"
    conn.execute(
        """INSERT OR REPLACE INTO transformation_runs(transformation_run_id,transform_id,source_id,snapshot_id,
             started_at,completed_at,code_version,rows_loaded,notes) VALUES(?,?,?,?,?,?,?,?,?)""",
        (run_id, "build_htei_scientific_v5", source_id, snapshot_id, retrieved, retrieved, METHODOLOGY_VERSION, 0, "Scientific release calculation; quality is separate from substantive score"),
    )
    return snapshot_id, run_id


def _ensure_methodology_snapshot_reproducibility(conn: sqlite3.Connection, snapshot_id: str) -> None:
    """Keep descendant release packages reproducible after rebuilding the v5 staging layer."""
    exists = conn.execute(
        "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='reproducibility_artifacts'"
    ).fetchone()[0]
    if not exists:
        return
    snap = _row(conn, "SELECT * FROM raw_snapshots WHERE snapshot_id=?", (snapshot_id,))
    if not snap:
        return
    path = PROJECT_ROOT / str(snap["raw_snapshot_path"]).replace("\\", "/")
    if not path.exists():
        return
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != snap["raw_snapshot_sha256"]:
        raise RuntimeError(f"Methodology manifest checksum mismatch for {snapshot_id}")
    conn.execute(
        """INSERT OR REPLACE INTO reproducibility_artifacts(
            artifact_id,snapshot_id,artifact_type,artifact_path,artifact_sha256,rows_exported,
            source_url,expected_raw_sha256,distribution_decision,metadata_json,created_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        (
            f"raw:{snapshot_id}", snapshot_id, "raw_included",
            str(path.relative_to(PROJECT_ROOT)).replace("\\", "/"), digest, 0,
            snap["source_url"], snap["raw_snapshot_sha256"], "include",
            _json({"content_type": snap.get("content_type"), "bytes_count": snap.get("bytes_count"),
                   "reason": "project methodology manifest"}), _now(),
        ),
    )


def _insert_methodology_registry(conn: sqlite3.Connection) -> None:
    now = _now()
    for index_code, meta in INDEX_METHODOLOGY.items():
        existing = _row(conn, "SELECT * FROM index_methodology_registry WHERE index_code=?", (index_code,))
        # A deterministic refresh of the v5 staging layer must never downgrade a
        # later release methodology already present in the delivery database.
        if existing and index_code == "HTEI" and (
            str(existing.get("formula_status") or "") == "approved_research_weights_v6"
            or "final-release-v6" in str(existing.get("methodology_version") or "")
        ):
            continue
        conn.execute(
            """INSERT OR REPLACE INTO index_methodology_registry(
                 index_code,score_status,component_status,formula_status,methodology_version,label_ru,label_en,
                 warning_ru,warning_en,source_url,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
            (
                index_code, meta["score_status"], meta["component_status"], meta["formula_status"],
                METHODOLOGY_VERSION, meta["label_ru"], meta["label_en"], meta["warning_ru"], meta["warning_en"],
                meta["source_url"], now,
            ),
        )



def _update_index_formulas_and_components(conn: sqlite3.Connection) -> None:
    for code, meta in COMPONENT_META.items():
        conn.execute(
            "UPDATE components SET name_ru=?,name_en=?,source_note=? WHERE index_code='HTEI' AND component_code=?",
            (meta["name_ru"], meta["name_en"], meta["interpretation_ru"], code),
        )
        conn.execute(
            "UPDATE index_components SET name_ru=?,name_en=?,source_note=? WHERE index_code='HTEI' AND component_code=?",
            (meta["name_ru"], meta["name_en"], meta["interpretation_ru"], code),
        )
    source_ids = {r[0] for r in conn.execute("SELECT source_id FROM source_registry").fetchall()}
    formulas = [
        (
            "HTEI", FORMULA_VERSION,
            "HTEI = сумма нормированных компонентных оценок, умноженных на эффективные веса, перенормированные по доступным компонентам. Коэффициент качества публикуется отдельно и не изменяет содержательную оценку. Места присваиваются только сопоставимому ядру стран.",
            "HTEI is the sum of normalized component scores multiplied by effective weights renormalized over available components. Data quality is reported separately and never changes the substantive score. Ranks are assigned only to the comparable country core.",
            "Три режима: comparable core, policy-comparable extended и ASOF diagnostic. Основная нормировка — winsorized min-max по 2,5/97,5 процентилям; устойчивость проверяется альтернативными нормировками, вариациями весов и leave-one-component-out.",
            "Three modes: comparable core, policy-comparable extended and ASOF diagnostic. Primary normalization is 2.5/97.5-percentile winsorized min-max; robustness is tested using alternative normalizations, weight perturbations and leave-one-component-out.",
            _json(HTEI_WEIGHTS),
            "Winsorized min-max 0–100; качество, свежесть и полнота показываются отдельно.",
            "Winsorized min-max 0–100; quality, freshness and completeness are displayed separately.",
            1, "HTEI_SCIENTIFIC_V5",
        ),
        (
            "HDI", "hdi-official-method-note-v2",
            "Официальный ИЧР UNDP является геометрическим средним индексов здоровья, образования и дохода: HDI=(I_health×I_education×I_income)^(1/3).",
            "The official UNDP HDI is the geometric mean of the health, education and income indices: HDI=(I_health×I_education×I_income)^(1/3).",
            "Платформа импортирует официальный score. Компонентные min-max панели используются только для диагностики и не являются официальным пересчётом.",
            "The platform imports the official score. Component min-max panels are diagnostic only and are not an official recomputation.",
            _json({"health": "geometric mean input", "education": "geometric mean input", "income": "geometric mean input with logarithmic transformation"}),
            "Официальные целевые границы UNDP; логарифмическое преобразование дохода.",
            "Official UNDP goalposts; logarithmic income transformation.",
            1, "UNDP_HDR",
        ),
        (
            "HCI", "hci-historical-2020-official-score",
            "Официальное значение исторической редакции HCI 2020 импортируется без авторского пересчёта.",
            "The official historical 2020 HCI score is imported without a platform recomputation.",
            "Компоненты служат для информационно-образовательной диагностики. До загрузки HCI+ 2026 модуль маркируется как исторический.",
            "Components support educational diagnostics. Until HCI+ 2026 is loaded, the module is labelled historical.",
            "{}",
            "Официальная методика Всемирного банка; платформа не применяет равные веса для официального score.",
            "Official World Bank methodology; the platform does not apply equal weights to the official score.",
            0, "WORLD_BANK_HCI",
        ),
        (
            "GII", "gii-official-score-and-pillars",
            "Официальный итоговый score и pillar scores импортируются из базы WIPO; платформа не пересчитывает официальный GII.",
            "The official total score and pillar scores are imported from WIPO; the platform does not recompute the official GII.",
            "Визуальные веса блоков не следует интерпретировать как официальную формулу WIPO.",
            "Visual block weights must not be interpreted as the official WIPO formula.",
            "{}",
            "Официальные score WIPO; аналитические gap/diagnostic calculations выполняются поверх них.",
            "Official WIPO scores; platform gap and diagnostic calculations are layered on top.",
            0, "WIPO_GII",
        ),
    ]
    for f in formulas:
        if f[-1] in source_ids:
            conn.execute(
                """INSERT OR REPLACE INTO index_formulas(index_code,formula_version,formula_text_ru,formula_text_en,method_notes_ru,method_notes_en,weights_json,normalization_ru,normalization_en,official_formula_available,source_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
                f,
            )

def _build_profiles(conn: sqlite3.Connection, release_year: int, run_id: str, snapshot_id: str) -> dict[str, Any]:
    selected = _selected_observations(conn, release_year)
    values_by_component: dict[str, list[float]] = defaultdict(list)
    for components in selected.values():
        for code, obs in components.items():
            lag = release_year - int(obs.get("source_data_year") or obs["year"])
            if lag <= ASOF_MAX_LAG:
                values_by_component[code].append(float(obs["raw_value"]))
    normalized: dict[str, dict[str, float]] = defaultdict(dict)
    percentile_norm: dict[str, dict[str, float]] = defaultdict(dict)
    robust_norm: dict[str, dict[str, float]] = defaultdict(dict)
    for iso3, components in selected.items():
        for code, obs in components.items():
            lag = release_year - int(obs.get("source_data_year") or obs["year"])
            if lag > ASOF_MAX_LAG:
                continue
            raw = float(obs["raw_value"])
            universe = values_by_component[code]
            normalized[iso3][code] = _winsor_minmax(raw, universe)
            percentile_norm[iso3][code] = _percentile_score(raw, universe)
            robust_norm[iso3][code] = _robust_z_score(raw, universe)

    conn.execute("DELETE FROM htei_v5_component_values WHERE release_year=?", (release_year,))
    conn.execute("DELETE FROM htei_v5_profiles WHERE release_year=?", (release_year,))
    now = _now()
    profiles_by_mode: dict[str, list[dict[str, Any]]] = defaultdict(list)
    component_rows: list[dict[str, Any]] = []
    for iso3, components in selected.items():
        for mode in ("comparable_core", "comparable_extended", "asof_diagnostic"):
            usable, reasons = _mode_eligibility(components, release_year, mode)
            eligible = not reasons
            if mode == "asof_diagnostic" and not eligible:
                continue
            if mode != "asof_diagnostic" and not eligible:
                continue
            available_weight = sum(HTEI_WEIGHTS[c] for c in usable)
            effective_weights = {c: HTEI_WEIGHTS[c] / available_weight for c in usable}
            score = sum(normalized[iso3][c] * effective_weights[c] for c in usable)
            confidence, coverage_class, freshness_class, avg_lag = _confidence(usable, components, release_year)
            years = [int(components[c].get("source_data_year") or components[c]["year"]) for c in usable]
            groups = sorted({_source_group(components[c]) for c in usable})
            profile_id = f"HTEI-V5:{mode}:{iso3}:{release_year}"
            provenance = {
                "formula_version": FORMULA_VERSION,
                "mode": mode,
                "underlying_sources": sorted({components[c]["source_id"] for c in usable}),
                "source_groups": groups,
                "available_weight": available_weight,
                "selection_rule": components[usable[0]]["selection_rule_v5"] if usable else None,
                "quality_not_applied_to_score": True,
                "snapshot_id": snapshot_id,
                "transformation_run_id": run_id,
            }
            profile = {
                "profile_id": profile_id,
                "iso3": iso3,
                "release_year": release_year,
                "requested_year": release_year,
                "mode": mode,
                "substantive_score": round(score, 6),
                "rank": None,
                "percentile": None,
                "confidence_score": confidence,
                "coverage_class": coverage_class,
                "freshness_class": freshness_class,
                "available_components": len(usable),
                "available_weight": round(available_weight, 6),
                "source_group_count": len(groups),
                "oldest_source_year": min(years),
                "newest_source_year": max(years),
                "average_lag": round(avg_lag, 6),
                "score_low": None,
                "score_high": None,
                "rank_low": None,
                "rank_high": None,
                "eligible_for_ranking": 0 if mode == "asof_diagnostic" else 1,
                "eligibility_reasons_json": _json(reasons),
                "formula_version": FORMULA_VERSION,
                "methodology_status": "validated_internal_sensitivity; external_review_required",
                "provenance_json": _json(provenance),
            }
            profiles_by_mode[mode].append(profile)
            for code in usable:
                obs = components[code]
                meta = COMPONENT_META[code]
                lag = release_year - int(obs.get("source_data_year") or obs["year"])
                value_id = f"{profile_id}:{code}"
                component_prov = {
                    "source_id": obs["source_id"],
                    "source_group": _source_group(obs),
                    "source_priority": obs.get("source_priority"),
                    "methodological_tier": _method_tier(obs),
                    "source_data_year": int(obs.get("source_data_year") or obs["year"]),
                    "indicator_code": obs.get("indicator_code"),
                    "dimensions_json": obs.get("dimensions_json"),
                    "raw_snapshot_path": obs.get("raw_snapshot_path"),
                    "raw_snapshot_sha256": obs.get("raw_snapshot_sha256"),
                    "selection_rule": obs["selection_rule_v5"],
                    "proxy_status": meta["proxy_status"],
                    "normalization": "winsorized_minmax_p2_5_p97_5",
                    "alternative_percentile_score": round(percentile_norm[iso3][code], 6),
                    "alternative_robust_z_score": round(robust_norm[iso3][code], 6),
                }
                component_rows.append({
                    "value_id": value_id,
                    "profile_id": profile_id,
                    "iso3": iso3,
                    "release_year": release_year,
                    "mode": mode,
                    "component_code": code,
                    "name_ru": meta["name_ru"],
                    "name_en": meta["name_en"],
                    "raw_value": float(obs["raw_value"]),
                    "unit": str(obs.get("unit") or "official source unit"),
                    "normalized_score": round(normalized[iso3][code], 6),
                    "base_weight": HTEI_WEIGHTS[code],
                    "effective_weight": round(effective_weights[code], 8),
                    "weighted_contribution": round(normalized[iso3][code] * effective_weights[code], 6),
                    "source_id": obs["source_id"],
                    "source_group": _source_group(obs),
                    "source_data_year": int(obs.get("source_data_year") or obs["year"]),
                    "data_lag": lag,
                    "indicator_code": str(obs.get("indicator_code") or ""),
                    "proxy_status": meta["proxy_status"],
                    "interpretation_ru": meta["interpretation_ru"],
                    "interpretation_en": meta["interpretation_en"],
                    "selection_rule": obs["selection_rule_v5"],
                    "source_url": obs["source_url"],
                    "retrieved_at": obs["retrieved_at"],
                    "raw_snapshot_path": obs["raw_snapshot_path"],
                    "raw_snapshot_sha256": obs["raw_snapshot_sha256"],
                    "quality_flag": str(obs.get("quality_flag") or "official_observation"),
                    "provenance_json": _json(component_prov),
                })

    # Ranking is only assigned to comparable modes.
    for mode in ("comparable_core", "comparable_extended"):
        ranked = sorted(profiles_by_mode[mode], key=lambda p: (-p["substantive_score"], -p["confidence_score"], p["iso3"]))
        n = len(ranked)
        for rank, profile in enumerate(ranked, start=1):
            profile["rank"] = rank
            profile["percentile"] = round((n - rank) / max(1, n - 1) * 100.0, 6) if n > 1 else 100.0

    profile_rows = [p for mode in profiles_by_mode.values() for p in mode]
    if profile_rows:
        cols = list(profile_rows[0])
        conn.executemany(
            f"INSERT OR REPLACE INTO htei_v5_profiles({','.join(cols)}) VALUES({','.join(['?']*len(cols))})",
            [[p[c] for c in cols] for p in profile_rows],
        )
    if component_rows:
        cols = list(component_rows[0])
        conn.executemany(
            f"INSERT OR REPLACE INTO htei_v5_component_values({','.join(cols)}) VALUES({','.join(['?']*len(cols))})",
            [[p[c] for c in cols] for p in component_rows],
        )
    conn.execute("UPDATE transformation_runs SET completed_at=?, rows_loaded=? WHERE transformation_run_id=?", (now, len(profile_rows) + len(component_rows), run_id))
    return {
        "selected": selected,
        "normalized": normalized,
        "percentile_norm": percentile_norm,
        "robust_norm": robust_norm,
        "profiles_by_mode": profiles_by_mode,
        "profile_rows": profile_rows,
        "component_rows": component_rows,
    }


def _rank_map(scores: dict[str, float]) -> dict[str, int]:
    return {iso3: rank for rank, (iso3, _) in enumerate(sorted(scores.items(), key=lambda item: (-item[1], item[0])), start=1)}


def _spearman(rank_a: dict[str, int], rank_b: dict[str, int]) -> float:
    common = sorted(set(rank_a) & set(rank_b))
    n = len(common)
    if n < 2:
        return 1.0
    d2 = sum((rank_a[c] - rank_b[c]) ** 2 for c in common)
    return 1.0 - 6.0 * d2 / (n * (n * n - 1))


def _run_htei_sensitivity(conn: sqlite3.Connection, build: dict[str, Any], release_year: int) -> dict[str, Any]:
    profiles = {p["iso3"]: p for p in build["profiles_by_mode"]["comparable_core"]}
    if len(profiles) < 2:
        summary = {"reason": "insufficient_comparable_core", "countries": len(profiles), "runs": 0}
        conn.execute("DELETE FROM methodology_audit_runs WHERE model_code='HTEI_V5' AND release_year=?", (release_year,))
        conn.execute(
            """INSERT INTO methodology_audit_runs(audit_id,model_code,release_year,methodology_version,run_count,countries,
                 mean_spearman,min_spearman,mean_absolute_rank_change,max_rank_change,sensitivity_passed,results_json,created_at)
               VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (f"HTEI-V5:{release_year}", "HTEI_V5", release_year, FORMULA_VERSION, 0, len(profiles), None, None, None, None, 0, _json(summary), _now()),
        )
        return summary
    components_by_profile: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    for row in _rows(conn, "SELECT * FROM htei_v5_component_values WHERE release_year=? AND mode='comparable_core'", (release_year,)):
        components_by_profile[row["iso3"]][row["component_code"]] = row
    baseline_scores = {iso: p["substantive_score"] for iso, p in profiles.items()}
    baseline_ranks = _rank_map(baseline_scores)
    score_samples: dict[str, list[float]] = defaultdict(list)
    rank_samples: dict[str, list[int]] = defaultdict(list)
    run_stats: list[dict[str, Any]] = []
    rng = _DeterministicUniform(SENSITIVITY_SEED)

    def calculate(run_weights: dict[str, float], norm_key: str = "normalized_score", drop_component: str | None = None) -> tuple[dict[str, float], dict[str, int]]:
        scores: dict[str, float] = {}
        for iso3, comps in components_by_profile.items():
            usable = [c for c in comps if c != drop_component]
            denominator = sum(run_weights[c] for c in usable)
            if denominator <= 0:
                continue
            vals = []
            for c in usable:
                component = comps[c]
                if norm_key == "percentile":
                    prov = json.loads(component["provenance_json"])
                    norm = float(prov.get("alternative_percentile_score", component["normalized_score"]))
                elif norm_key == "robust_z":
                    prov = json.loads(component["provenance_json"])
                    norm = float(prov.get("alternative_robust_z_score", component["normalized_score"]))
                else:
                    norm = float(component["normalized_score"])
                vals.append(norm * run_weights[c] / denominator)
            scores[iso3] = sum(vals)
        return scores, _rank_map(scores)

    for run in range(200):
        raw_weights = {c: w * math.exp(rng.uniform(-0.20, 0.20)) for c, w in HTEI_WEIGHTS.items()}
        total = sum(raw_weights.values())
        run_weights = {c: w / total for c, w in raw_weights.items()}
        scores, ranks = calculate(run_weights)
        rho = _spearman(baseline_ranks, ranks)
        changes = [abs(baseline_ranks[c] - ranks[c]) for c in baseline_ranks if c in ranks]
        run_stats.append({"type": "weight_perturbation", "run": run + 1, "spearman": rho, "mean_abs_rank_change": statistics.mean(changes), "max_rank_change": max(changes)})
        for c in scores:
            score_samples[c].append(scores[c])
            rank_samples[c].append(ranks[c])

    for norm_key in ("percentile", "robust_z"):
        scores, ranks = calculate(HTEI_WEIGHTS, norm_key=norm_key)
        changes = [abs(baseline_ranks[c] - ranks[c]) for c in baseline_ranks if c in ranks]
        run_stats.append({"type": f"alternative_normalization_{norm_key}", "spearman": _spearman(baseline_ranks, ranks), "mean_abs_rank_change": statistics.mean(changes), "max_rank_change": max(changes)})
    for component in HTEI_WEIGHTS:
        scores, ranks = calculate(HTEI_WEIGHTS, drop_component=component)
        changes = [abs(baseline_ranks[c] - ranks[c]) for c in baseline_ranks if c in ranks]
        run_stats.append({"type": "leave_one_component_out", "component": component, "spearman": _spearman(baseline_ranks, ranks), "mean_abs_rank_change": statistics.mean(changes), "max_rank_change": max(changes)})

    for iso3, samples in score_samples.items():
        ranks = rank_samples[iso3]
        conn.execute(
            """UPDATE htei_v5_profiles SET score_low=?,score_high=?,rank_low=?,rank_high=?
               WHERE iso3=? AND release_year=? AND mode='comparable_core'""",
            (_quantile(samples, 0.025), _quantile(samples, 0.975), int(_quantile([float(r) for r in ranks], 0.025)), int(math.ceil(_quantile([float(r) for r in ranks], 0.975))), iso3, release_year),
        )
    # Publish uncertainty intervals for the policy-comparable extended mode as well.
    extended_components: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    for ext_row in _rows(conn, "SELECT * FROM htei_v5_component_values WHERE release_year=? AND mode='comparable_extended'", (release_year,)):
        extended_components[ext_row["iso3"]][ext_row["component_code"]] = ext_row
    if len(extended_components) >= 2:
        ext_score_samples: dict[str, list[float]] = defaultdict(list)
        ext_rank_samples: dict[str, list[int]] = defaultdict(list)
        ext_rng = _DeterministicUniform(SENSITIVITY_SEED + 17)
        for _ in range(200):
            raw_weights = {c: w * math.exp(ext_rng.uniform(-0.20, 0.20)) for c, w in HTEI_WEIGHTS.items()}
            total = sum(raw_weights.values())
            run_weights = {c: w / total for c, w in raw_weights.items()}
            ext_scores: dict[str, float] = {}
            for iso3, comps in extended_components.items():
                available = list(comps)
                denominator = sum(run_weights[c] for c in available)
                if denominator <= 0:
                    continue
                ext_scores[iso3] = sum(float(comps[c]["normalized_score"]) * run_weights[c] / denominator for c in available)
            ext_ranks = _rank_map(ext_scores)
            for iso3, value in ext_scores.items():
                ext_score_samples[iso3].append(value)
                ext_rank_samples[iso3].append(ext_ranks[iso3])
        for iso3, samples in ext_score_samples.items():
            rank_values = ext_rank_samples[iso3]
            conn.execute(
                """UPDATE htei_v5_profiles SET score_low=?,score_high=?,rank_low=?,rank_high=?
                   WHERE iso3=? AND release_year=? AND mode='comparable_extended'""",
                (_quantile(samples, 0.025), _quantile(samples, 0.975), int(_quantile([float(r) for r in rank_values], 0.025)), int(math.ceil(_quantile([float(r) for r in rank_values], 0.975))), iso3, release_year),
            )

    spearman_values = [float(r["spearman"]) for r in run_stats]
    mean_changes = [float(r["mean_abs_rank_change"]) for r in run_stats]
    max_changes = [int(r["max_rank_change"]) for r in run_stats]
    summary = {
        "baseline_countries": len(profiles),
        "weight_perturbation_runs": 200,
        "additional_runs": len(run_stats) - 200,
        "mean_spearman": statistics.mean(spearman_values),
        "min_spearman": min(spearman_values),
        "mean_absolute_rank_change": statistics.mean(mean_changes),
        "max_rank_change": max(max_changes),
        "pass_thresholds": {"min_spearman": 0.85, "mean_absolute_rank_change": 5.0},
        "runs": run_stats,
    }
    passed = summary["min_spearman"] >= 0.85 and summary["mean_absolute_rank_change"] <= 5.0
    conn.execute("DELETE FROM methodology_audit_runs WHERE model_code='HTEI_V5' AND release_year=?", (release_year,))
    conn.execute(
        """INSERT INTO methodology_audit_runs(audit_id,model_code,release_year,methodology_version,run_count,countries,
             mean_spearman,min_spearman,mean_absolute_rank_change,max_rank_change,sensitivity_passed,results_json,created_at)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            f"HTEI-V5:{release_year}", "HTEI_V5", release_year, FORMULA_VERSION, len(run_stats), len(profiles),
            summary["mean_spearman"], summary["min_spearman"], summary["mean_absolute_rank_change"], summary["max_rank_change"], int(passed), _json(summary), _now(),
        ),
    )
    return summary


def _run_training_model_sensitivity(conn: sqlite3.Connection) -> dict[str, Any]:
    latest = _row(conn, "SELECT MAX(year) AS y FROM training_model_scores")
    if not latest or latest["y"] is None:
        return {"status": "missing"}
    year = int(latest["y"])
    component_rows = _rows(conn, "SELECT * FROM training_model_components WHERE year=?", (year,))
    blocks_by_country: dict[str, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))
    for r in component_rows:
        blocks_by_country[r["iso3"]][r["block_code"]].append(float(r["normalized_score"]))
    block_scores = {iso: {b: statistics.mean(vals) for b, vals in blocks.items()} for iso, blocks in blocks_by_country.items()}
    required_blocks = {"institutional_environment", "educational_infrastructure", "corporate_strategies", "international_cooperation"}
    block_scores = {iso: vals for iso, vals in block_scores.items() if required_blocks <= set(vals)}
    baseline_scores = {iso: statistics.mean(vals.values()) for iso, vals in block_scores.items()}
    baseline_ranks = _rank_map(baseline_scores)
    rng = _DeterministicUniform(SENSITIVITY_SEED + 1)
    stats: list[dict[str, Any]] = []
    for run in range(200):
        raw = {b: math.exp(rng.uniform(-0.20, 0.20)) for b in required_blocks}
        total = sum(raw.values())
        weights = {b: raw[b] / total for b in raw}
        scores = {iso: sum(vals[b] * weights[b] for b in required_blocks) for iso, vals in block_scores.items()}
        ranks = _rank_map(scores)
        changes = [abs(baseline_ranks[c] - ranks[c]) for c in baseline_ranks]
        stats.append({"spearman": _spearman(baseline_ranks, ranks), "mean_abs_rank_change": statistics.mean(changes), "max_rank_change": max(changes)})
    summary = {
        "year": year,
        "countries": len(block_scores),
        "runs": 200,
        "mean_spearman": statistics.mean(s["spearman"] for s in stats),
        "min_spearman": min(s["spearman"] for s in stats),
        "mean_absolute_rank_change": statistics.mean(s["mean_abs_rank_change"] for s in stats),
        "max_rank_change": max(s["max_rank_change"] for s in stats),
    }
    passed = summary["min_spearman"] >= 0.85 and summary["mean_absolute_rank_change"] <= 5.0
    conn.execute("DELETE FROM methodology_audit_runs WHERE model_code='TRAINING_MODEL_V2' AND release_year=?", (year,))
    conn.execute(
        """INSERT INTO methodology_audit_runs(audit_id,model_code,release_year,methodology_version,run_count,countries,
             mean_spearman,min_spearman,mean_absolute_rank_change,max_rank_change,sensitivity_passed,results_json,created_at)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (f"TRAINING-MODEL-V2:{year}", "TRAINING_MODEL_V2", year, "training-system-competitiveness-v2", 200, len(block_scores), summary["mean_spearman"], summary["min_spearman"], summary["mean_absolute_rank_change"], summary["max_rank_change"], int(passed), _json(summary), _now()),
    )
    return summary


def _top10_benchmark(conn: sqlite3.Connection, component_code: str, release_year: int) -> float | None:
    values = _rows(
        conn,
        """SELECT c.raw_value FROM htei_v5_component_values c JOIN htei_v5_profiles p ON p.profile_id=c.profile_id
           WHERE c.release_year=? AND c.mode='comparable_core' AND c.component_code=? AND p.rank<=10""",
        (release_year, component_code),
    )
    nums = [float(v["raw_value"]) for v in values]
    return statistics.mean(nums) if nums else None


def _rus_component(conn: sqlite3.Connection, component_code: str, release_year: int) -> dict[str, Any] | None:
    return _row(
        conn,
        """SELECT * FROM htei_v5_component_values WHERE iso3='RUS' AND release_year=? AND mode='asof_diagnostic' AND component_code=?""",
        (release_year, component_code),
    )


def _populate_policy_brief(conn: sqlite3.Connection, release_year: int) -> int:
    # Preserve bilingual release editing when deterministic scientific layers are rebuilt.
    # The v5 builder is a data/methodology refresh and must not downgrade reviewed English copy.
    reviewed_en = {
        int(r["priority"]): dict(r)
        for r in _rows(
            conn,
            """SELECT * FROM policy_brief_items
               WHERE iso3='RUS' AND editorial_status='release_bilingual_reviewed'""",
        )
    }
    conn.execute("DELETE FROM policy_brief_items WHERE iso3='RUS'")
    now = _now()
    definitions = [
        (
            "RUS-HTEI-01", "HT_EMPLOYMENT_SHARE", "Расширить измеряемую занятость в высокотехнологичных секторах",
            "Фрагментарность отраслевого учёта и недостаточная связка статистики занятости с приоритетными технологическими секторами.",
            "Создать межведомственный контур мониторинга по ОКВЭД/ОКЗ с квартальной сверкой Росстата, отраслевых ведомств и крупнейших работодателей; утвердить российский crosswalk с Eurostat high-tech/KIS.",
            "Росстат; Минпромторг; Минцифры; Минобрнауки России; регионы", "2026–2028",
            "Ежегодно увеличивать долю занятых в согласованном перечне high-tech/KIS и довести полноту отраслевого мониторинга до всех субъектов РФ.",
            "Более точная оценка кадрового спроса и ускорение роста занятости в секторах с высокой интенсивностью знаний.",
            "Несогласованность классификаторов и двойной учёт; требуется единый открытый crosswalk и регламент пересчёта.",
            "Федеральный проектный офис, интеграция ведомственных данных и регулярное обследование работодателей.",
            "Квартальный мониторинг Росстата; ежегодный публичный отчёт по HTEI и регионам.",
        ),
        (
            "RUS-HTEI-02", "HIGH_TECH_OCCUPATIONS", "Сформировать доказательный перечень технологических профессий",
            "Широкая группа ISCO/ОКЗ специалистов и техников не позволяет выделить собственно high-tech occupations и приоритетные дефициты навыков.",
            "Утвердить crosswalk технологических профессий на основе ISCO, ESCO/O*NET и ОКЗ; ежегодно обновлять перечень с участием советов по профессиональным квалификациям и технологических компаний.",
            "Минтруд России; Минобрнауки России; СПК; университеты; работодатели", "2026–2027",
            "Покрыть единым классификатором не менее 90% вакансий и программ подготовки по приоритетным технологическим направлениям.",
            "Сопоставимость образовательного заказа, структуры занятости и фактического кадрового спроса.",
            "Быстрое устаревание профессий; классификатор должен хранить версии и связи с навыками.",
            "Экспертные рабочие группы, data engineering и открытая машиночитаемая таксономия.",
            "Полугодовая публикация версии crosswalk; доля сопоставленных вакансий, программ и занятых.",
        ),
        (
            "RUS-HTEI-03", "RND_PERSONNEL", "Увеличить кадровое ядро исследований и разработок",
            "Недостаточная численность исследователей и техников НИОКР относительно технологических лидеров и старение части кадрового состава.",
            "Расширить industrial PhD, совместные лаборатории университетов и компаний, долгосрочные позиции молодых исследователей и треки мобильности между академией и индустрией.",
            "Минобрнауки России; РНФ; университеты; государственные и частные R&D-центры", "2026–2030",
            "Увеличить численность R&D personnel на миллион населения и долю исследователей до 39 лет; обеспечить измеримый рост корпоративного софинансирования.",
            "Укрепление кадровой базы НИОКР и сокращение разрыва между подготовкой исследователей и внедрением технологий.",
            "Формальные партнёрства без реальных задач; необходим аудит проектного портфеля и совместных результатов.",
            "Грантовое и корпоративное софинансирование, инфраструктура совместных лабораторий и программы мобильности.",
            "Ежегодно: R&D personnel, возрастная структура, industrial PhD, совместные патенты и внедрения.",
        ),
        (
            "RUS-HTEI-04", "STEM_PIPELINE", "Обновить и укрепить образовательный поток STEM",
            "Последнее международно сопоставимое значение STEM pipeline для России существенно отстаёт от релизной даты, а количественный выпуск не гарантирует соответствие навыков отраслевому спросу.",
            "Обновить официальную статистику полей образования, ввести outcome-мониторинг завершения и трудоустройства, усилить математику, программирование и инженерное проектирование в переходных курсах.",
            "Минобрнауки России; Рособрнадзор; Росстат; университеты; школы; индустриальные партнёры", "2026–2029",
            "Ежегодная публикация STEM pipeline с лагом не более двух лет; рост завершения программ и трудоустройства по профилю.",
            "Устойчивый приток выпускников с применимыми технологическими компетенциями.",
            "Масштабирование без контроля качества; нужны независимые оценки навыков и данные о траекториях выпускников.",
            "Обновление статистического контура, bridge courses, наставничество и цифровой мониторинг выпускников.",
            "Ежегодно: выпуск, завершение, трудоустройство, оценка навыков и региональная мобильность.",
        ),
        (
            "RUS-HTEI-05", "TECH_OUTPUTS", "Связать кадровую политику с технологическими результатами",
            "Рост числа подготовленных кадров не всегда преобразуется в патенты, экспорт технологических товаров и услуг и внедрение разработок.",
            "Финансировать университетско-корпоративные консорциумы по измеримым результатам: патенты, ICT services exports, high-tech exports, лицензирование и внедрение R&D.",
            "Минобрнауки России; Минпромторг; Минцифры; Роспатент; институты развития; экспортные центры", "2026–2030",
            "Рост технологических результатов по каждому раскрытому исходному показателю; отдельные KPI коммерциализации и экспорта.",
            "Перевод кадрового и научного потенциала в измеримый технологический выпуск экономики.",
            "Большой временной лаг и влияние внешней конъюнктуры; следует разделять кратко- и долгосрочные KPI.",
            "Консорциумные гранты, инфраструктура трансфера технологий, экспортная и патентная поддержка.",
            "Ежегодный разбор high-tech exports, ICT services, patents и внедрённых разработок.",
        ),
        (
            "RUS-HTEI-06", "CORPORATE_STRATEGY_AND_DEMAND", "Создать числовой корпоративный слой технологического кадрового спроса",
            "Доля бизнеса в НИОКР является лишь proxy корпоративной активности и не раскрывает планы найма, дефицит навыков и кадровые стратегии.",
            "Ввести добровольный, затем стандартизированный формат раскрытия R&D personnel, технологического найма, обучения и планов компетенций; связать его с официальной отчётностью и отраслевыми обследованиями.",
            "Минэкономразвития; Минпромторг; Минцифры; Банк России; биржи; крупнейшие работодатели", "2026–2028",
            "Не менее 50 крупнейших технологических работодателей в проверяемом реестре; покрытие не менее 70% занятости выбранных отраслей.",
            "Переход от косвенного proxy к прямому измерению корпоративных стратегий и спроса на технологические кадры.",
            "Селективное раскрытие и смещение выборки; numeric scoring допускается только при достаточном покрытии.",
            "Единый цифровой формат, юридическая экспертиза и защищённый контур передачи агрегированных данных.",
            "Ежегодно: охват компаний, R&D headcount, вакансии/найм, обучение и disclosed workforce plans.",
        ),
        (
            "RUS-SYSTEM-07", "TRAINING_MODEL", "Укрепить международную кооперацию системы подготовки кадров",
            "Международная кооперация, академическая мобильность и совместные технологические программы не в полной мере конвертируются в устойчивые кадровые и исследовательские связи.",
            "Развивать совместные инженерные программы, сетевые лаборатории и взаимное признание модулей с технологически сильными университетами дружественных стран.",
            "Минобрнауки России; университеты; РНФ; международные консорциумы", "2026–2030",
            "Рост числа совместных программ, лабораторий, публикаций и трудоустройства выпускников в международных проектах.",
            "Улучшение блока международного сотрудничества модели конкурентоспособности подготовки кадров.",
            "Геополитические ограничения и несбалансированная мобильность; нужна диверсификация партнёров.",
            "Консорциумные соглашения, совместное финансирование, цифровая академическая мобильность.",
            "Ежегодно: совместные программы, mobility balance, co-publications, joint R&D projects.",
        ),
        (
            "RUS-QS-08", "QS_ET", "Повысить международную видимость инженерно-технологических университетских программ",
            "Представленность российских университетов в верхних диапазонах QS Engineering & Technology ограничивает международную видимость кадровой и исследовательской базы.",
            "Сформировать адресные планы по research impact, international collaboration, employer reputation и раскрытию данных для университетов с потенциалом входа в top-250 и top-100.",
            "Минобрнауки России; университеты; индустриальные партнёры", "2026–2030",
            "Увеличить число российских университетов в top-500, top-250 и top-100 без ухудшения академической добросовестности и качества данных.",
            "Рост международной узнаваемости и притока партнёров в инженерно-технологические программы.",
            "Риск подмены качества управлением метриками; планы должны опираться на реальные исследования и образовательные результаты.",
            "Поддержка исследований, международных проектов, библиометрической инфраструктуры и employer engagement.",
            "Ежегодно: top-100/top-250/top-500, median rank, research citations, international collaboration.",
        ),
    ]
    rows_to_insert: list[dict[str, Any]] = []
    for priority, definition in enumerate(definitions, start=1):
        item_id, component_code, title, problem, measure, actor, horizon, target, effect, risk, resources, monitoring = definition
        comp = _rus_component(conn, component_code, release_year) if component_code in HTEI_WEIGHTS else None
        benchmark = _top10_benchmark(conn, component_code, release_year) if component_code in HTEI_WEIGHTS else None
        indicator_name = COMPONENT_META.get(component_code, {}).get("name_ru", component_code)
        indicator_name_en = COMPONENT_META.get(component_code, {}).get("name_en", component_code)
        item_payload = {
            "item_id": item_id,
            "iso3": "RUS",
            "priority": priority,
            "title_ru": title,
            "title_en": title,
            "problem_ru": problem,
            "problem_en": problem,
            "indicator_ru": indicator_name,
            "indicator_en": indicator_name_en,
            "current_value": comp.get("raw_value") if comp else None,
            "unit": comp.get("unit") if comp else None,
            "source_data_year": comp.get("source_data_year") if comp else None,
            "source_id": comp.get("source_id") if comp else ("QS_ET" if component_code == "QS_ET" else None),
            "benchmark_ru": f"Среднее top-10 сопоставимого HTEI: {benchmark:.2f}" if benchmark is not None else "Сопоставимые технологические лидеры и страны peer group",
            "benchmark_en": f"Comparable HTEI top-10 average: {benchmark:.2f}" if benchmark is not None else "Comparable technology leaders and peer-group countries",
            "measure_ru": measure,
            "measure_en": measure,
            "actor_ru": actor,
            "actor_en": actor,
            "horizon": horizon,
            "target_kpi_ru": target,
            "target_kpi_en": target,
            "expected_effect_ru": effect,
            "expected_effect_en": effect,
            "risk_ru": risk,
            "risk_en": risk,
            "resources_ru": resources,
            "resources_en": resources,
            "monitoring_ru": monitoring,
            "monitoring_en": monitoring,
            "relation_to_tz": "2.4 / 3.4.1 — практические рекомендации по формированию трудовых ресурсов в высокотехнологичных отраслях Российской Федерации",
            "evidence_value_id": comp.get("value_id") if comp else None,
            "editorial_status": "release_editorial_v1",
            "updated_at": now,
        }
        preserved = reviewed_en.get(priority)
        if preserved:
            for field in (
                "title_en", "problem_en", "measure_en", "actor_en",
                "target_kpi_en", "expected_effect_en", "risk_en",
                "resources_en", "monitoring_en",
            ):
                if preserved.get(field):
                    item_payload[field] = preserved[field]
            item_payload["editorial_status"] = "release_bilingual_reviewed"
        rows_to_insert.append(item_payload)
    if rows_to_insert:
        cols = list(rows_to_insert[0])
        conn.executemany(
            f"INSERT OR REPLACE INTO policy_brief_items({','.join(cols)}) VALUES({','.join(['?']*len(cols))})",
            [[r[c] for c in cols] for r in rows_to_insert],
        )
    return len(rows_to_insert)


def _populate_license_registry(conn: sqlite3.Connection) -> None:
    for src in _rows(conn, "SELECT source_id,license_or_terms,license_note,url,source_url FROM source_registry"):
        terms = str(src.get("license_or_terms") or src.get("license_note") or src.get("source_url") or src.get("url") or "")
        conn.execute(
            """INSERT OR IGNORE INTO license_registry(source_id,terms_url,attribution_required,release_archive_decision,review_status,notes)
               VALUES(?,?,?,?,?,?)""",
            (src["source_id"], terms, "See official terms and source-specific attribution", "pending", "pending_legal_review", "Legal reviewer must confirm storage, transformation and redistribution rights."),
        )




def _mark_legacy_htei_staging(conn: sqlite3.Connection) -> None:
    """Keep v3 observation staging for provenance, but never present it as the current index methodology."""
    conn.execute(
        """UPDATE source_registry
           SET source_name='Legacy HTEI observation-staging manifest (superseded by scientific v5)',
               title='Legacy HTEI observation-staging manifest (superseded by scientific v5)',
               source_role='legacy_computation_evidence',
               url='local:methodology/htei-observation-staging-v3',
               source_url='local:methodology/htei-observation-staging-v3'
           WHERE source_id='HTEI_MULTI_SOURCE'"""
    )

def apply_scientific_release(conn: sqlite3.Connection, release_year: int = RELEASE_YEAR) -> dict[str, Any]:
    conn.executescript(SCIENTIFIC_SCHEMA)
    _mark_legacy_htei_staging(conn)
    snapshot_id, run_id = _ensure_methodology_source(conn, release_year)
    _ensure_methodology_snapshot_reproducibility(conn, snapshot_id)
    _insert_methodology_registry(conn)
    _update_index_formulas_and_components(conn)
    build = _build_profiles(conn, release_year, run_id, snapshot_id)
    htei_audit = _run_htei_sensitivity(conn, build, release_year)
    training_audit = _run_training_model_sensitivity(conn)
    policy_count = _populate_policy_brief(conn, release_year)
    _populate_license_registry(conn)
    conn.commit()
    return {
        "status": "ok",
        "release_year": release_year,
        "methodology_version": METHODOLOGY_VERSION,
        "formula_version": FORMULA_VERSION,
        "profiles": {mode: len(rows) for mode, rows in build["profiles_by_mode"].items()},
        "component_rows": len(build["component_rows"]),
        "htei_audit": {k: v for k, v in htei_audit.items() if k != "runs"},
        "training_audit": training_audit,
        "policy_brief_items": policy_count,
    }


def htei_profile_payload(conn: sqlite3.Connection, iso3: str, release_year: int = RELEASE_YEAR, mode: str = "comparable_core") -> dict[str, Any]:
    iso3 = iso3.upper()
    if mode not in {"comparable_core", "comparable_extended", "asof_diagnostic"}:
        mode = "comparable_core"
    profile = _row(
        conn,
        """SELECT p.*,c.name_ru,c.name_en,c.iso2,c.flag,c.region,c.income_group
           FROM htei_v5_profiles p JOIN countries c ON c.iso3=p.iso3
           WHERE p.iso3=? AND p.release_year=? AND p.mode=?""",
        (iso3, release_year, mode),
    )
    fallback_mode = None
    if not profile and mode == "comparable_core":
        fallback_mode = "comparable_extended"
        profile = _row(
            conn,
            """SELECT p.*,c.name_ru,c.name_en,c.iso2,c.flag,c.region,c.income_group
               FROM htei_v5_profiles p JOIN countries c ON c.iso3=p.iso3
               WHERE p.iso3=? AND p.release_year=? AND p.mode=?""",
            (iso3, release_year, fallback_mode),
        )
    if not profile and mode != "asof_diagnostic":
        fallback_mode = "asof_diagnostic"
        profile = _row(
            conn,
            """SELECT p.*,c.name_ru,c.name_en,c.iso2,c.flag,c.region,c.income_group
               FROM htei_v5_profiles p JOIN countries c ON c.iso3=p.iso3
               WHERE p.iso3=? AND p.release_year=? AND p.mode=?""",
            (iso3, release_year, fallback_mode),
        )
    if not profile:
        return {"available": False, "iso3": iso3, "requested_mode": mode}
    components = _rows(conn, "SELECT * FROM htei_v5_component_values WHERE profile_id=? ORDER BY effective_weight DESC", (profile["profile_id"],))
    for component in components:
        provenance = json.loads(component.get("provenance_json") or "{}")
        component["methodological_tier"] = provenance.get("methodological_tier")
    audit = _row(conn, "SELECT * FROM methodology_audit_runs WHERE model_code='HTEI_V5' AND release_year=?", (release_year,))
    methodology = _row(conn, "SELECT * FROM index_methodology_registry WHERE index_code='HTEI'")
    return {
        "available": True,
        "requested_mode": mode,
        "fallback_mode": fallback_mode,
        "profile": profile,
        "components": components,
        "audit": audit,
        "methodology": methodology,
        "mode_explanation_ru": {
            "comparable_core": "Сопоставимое ядро: строгий международный рейтинг при единых требованиях к полноте, свежести и разнообразию источников.",
            "comparable_extended": "Расширенное сопоставимое ядро: компонентно-специфичные допустимые лаги публикации; используется для policy benchmarking с явной маркировкой.",
            "asof_diagnostic": "Широкий ASOF-профиль: последние доступные официальные наблюдения; место в синхронном международном рейтинге не присваивается.",
        }.get(profile["mode"]),
        "mode_explanation_en": {
            "comparable_core": "Comparable core: strict international ranking under common completeness, freshness and source-diversity rules.",
            "comparable_extended": "Extended comparable core: component-specific publication lags for policy benchmarking, explicitly labelled.",
            "asof_diagnostic": "Broad ASOF profile: latest available official observations; no rank in a synchronous international ranking.",
        }.get(profile["mode"]),
    }


def htei_ranking_payload(
    conn: sqlite3.Connection,
    release_year: int = RELEASE_YEAR,
    mode: str = "comparable_core",
    limit: int = 50,
    offset: int = 0,
    q: str | None = None,
    region: str | None = None,
    income_group: str | None = None,
    sort: str = "rank",
    direction: str = "asc",
) -> dict[str, Any]:
    if mode not in {"comparable_core", "comparable_extended"}:
        mode = "comparable_core"
    clauses = ["p.release_year=?", "p.mode=?", "p.eligible_for_ranking=1"]
    params: list[Any] = [release_year, mode]
    if q:
        clauses.append("(LOWER(c.name_ru) LIKE ? OR LOWER(c.name_en) LIKE ? OR LOWER(c.iso3) LIKE ?)")
        needle = f"%{q.strip().lower()}%"
        params.extend([needle, needle, needle])
    if region and region.lower() != "all":
        clauses.append("LOWER(c.region)=?")
        params.append(region.lower())
    if income_group and income_group.lower() != "all":
        clauses.append("LOWER(c.income_group)=?")
        params.append(income_group.lower())
    allowed_sort = {
        "rank": "p.rank",
        "score": "p.substantive_score",
        "confidence": "p.confidence_score",
        "freshness": "p.average_lag",
        "country": "c.name_en",
    }
    order_col = allowed_sort.get(sort, "p.rank")
    order_dir = "DESC" if direction.lower() == "desc" else "ASC"
    where = " AND ".join(clauses)
    total = _row(conn, f"SELECT COUNT(*) AS n FROM htei_v5_profiles p JOIN countries c ON c.iso3=p.iso3 WHERE {where}", tuple(params))["n"]
    ranking = _rows(
        conn,
        f"""SELECT p.*,c.name_ru,c.name_en,c.iso2,c.flag,c.region,c.income_group
            FROM htei_v5_profiles p JOIN countries c ON c.iso3=p.iso3
            WHERE {where} ORDER BY {order_col} {order_dir},c.name_en ASC LIMIT ? OFFSET ?""",
        tuple(params + [max(1, min(250, int(limit))), max(0, int(offset))]),
    )
    return {
        "release_year": release_year,
        "mode": mode,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": offset + len(ranking) < total,
        "ranking": ranking,
        "methodology": _row(conn, "SELECT * FROM index_methodology_registry WHERE index_code='HTEI'"),
    }


def methodology_registry_payload(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    return _rows(conn, "SELECT * FROM index_methodology_registry ORDER BY CASE index_code WHEN 'HDI' THEN 1 WHEN 'HCI' THEN 2 WHEN 'GTCI' THEN 3 WHEN 'GII' THEN 4 WHEN 'IDI' THEN 5 WHEN 'QS_ET' THEN 6 WHEN 'HTEI' THEN 7 ELSE 99 END")


def policy_brief_payload(conn: sqlite3.Connection, iso3: str = "RUS") -> dict[str, Any]:
    items = _rows(conn, "SELECT * FROM policy_brief_items WHERE iso3=? ORDER BY priority", (iso3.upper(),))
    return {
        "iso3": iso3.upper(),
        "title_ru": "Практические рекомендации по формированию трудовых ресурсов в высокотехнологичных отраслях Российской Федерации",
        "title_en": "Practical recommendations for developing workforce capacity in high-technology industries of the Russian Federation",
        "items": items,
        "methodology_version": METHODOLOGY_VERSION,
    }


def scientific_audit_payload(conn: sqlite3.Connection) -> dict[str, Any]:
    return {
        "htei": (
            _row(conn, "SELECT * FROM methodology_audit_runs WHERE model_code='HTEI_V6' ORDER BY release_year DESC LIMIT 1")
            or _row(conn, "SELECT * FROM methodology_audit_runs WHERE model_code='HTEI_V5' ORDER BY release_year DESC LIMIT 1")
        ),
        "training_model": _row(conn, "SELECT * FROM methodology_audit_runs WHERE model_code='TRAINING_MODEL_V2' ORDER BY release_year DESC LIMIT 1"),
        "external_reviews": _rows(conn, "SELECT * FROM external_method_reviews ORDER BY review_date DESC"),
        "license_summary": _rows(conn, "SELECT review_status,release_archive_decision,COUNT(*) AS sources FROM license_registry GROUP BY review_status,release_archive_decision"),
    }
