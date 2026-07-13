from __future__ import annotations

import json
import mimetypes
from functools import lru_cache
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import HTMLResponse, FileResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles

from .acceptance import acceptance_payload
from .comparison_workspace import comparison_workspace_payload, comparison_workspace_csv
from .config import DB_PATH, STATIC_DIR, DEFAULT_YEAR
from .db import connect, rows, row
from .production_data import build_if_missing
from .release_readiness import release_readiness_payload
from .country_workspace import country_workspace_payload
from .htei_workspace import htei_workspace_payload, htei_workspace_csv, htei_v6_provenance
from .training_policy import policy_center_payload, policy_items_csv, training_ranking_csv, training_workspace_payload
from .methodology_wiki import methodology_summary_payload
from .index_workspace import (
    STANDARD_INDEX_CODES, index_workspace_csv, platform_context_payload,
    standard_index_workspace_payload,
)

mimetypes.add_type('image/webp', '.webp')

app = FastAPI(
    title='GIR — Global Index Ranker',
    description='Educational analytical platform for international indices, human capital, technological talent and high-tech employment.',
    version='1.0.0-rc6',
)
# Large analytical JSON and GeoJSON responses are common in the research workspace.
# Compression is applied at the application boundary so every route, including
# mounted static evidence assets, benefits without changing scientific payloads.
app.add_middleware(GZipMiddleware, minimum_size=1024, compresslevel=6)

@app.middleware("http")
async def release_security_and_cache_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; "
        "script-src 'self'; connect-src 'self' https:; font-src 'self' data:; frame-src 'self' blob:; "
        "object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
    )
    response.headers.setdefault("Vary", "Accept-Encoding")
    path = request.url.path
    if path.startswith("/static/"):
        response.headers.setdefault("Cache-Control", "public, max-age=86400")
    elif path.startswith("/api/"):
        response.headers.setdefault("Cache-Control", "private, max-age=60")
    return response
app.mount('/static', StaticFiles(directory=str(STATIC_DIR)), name='static')

INDEX_ORDER = ["HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET", "HTEI"]


def _table_exists(conn, name: str) -> bool:
    return bool(row(conn, "SELECT 1 AS ok FROM sqlite_master WHERE type='table' AND name=?", (name,)))


def current_index_rows(conn) -> list[dict[str, Any]]:
    """Return the seven current platform modules in the product order.

    Historical HCI remains in ``indices`` for the longitudinal HCI/HCI+ chart, but
    HCI+ is the current module.  Before online HCI+ ingestion its metadata lives in
    ``index_definitions`` and must still be exposed to the UI without inventing scores.
    """
    metadata: dict[str, dict[str, Any]] = {}
    if _table_exists(conn, "index_definitions"):
        for item in rows(conn, "SELECT * FROM index_definitions"):
            metadata[item["code"]] = item
    for item in rows(conn, "SELECT * FROM indices"):
        metadata[item["code"]] = item
    # Prefer the registered pending/current HCI+ definition over historical HCI.
    return [metadata[code] for code in INDEX_ORDER if code in metadata]


def current_index_codes(conn) -> list[str]:
    return [item["code"] for item in current_index_rows(conn)]
BRICS = {"BRA", "RUS", "IND", "CHN", "ZAF"}
G20 = {
    "ARG", "AUS", "BRA", "CAN", "CHN", "FRA", "DEU", "IND", "IDN", "ITA",
    "JPN", "KOR", "MEX", "RUS", "SAU", "ZAF", "TUR", "GBR", "USA",
}
OECD = {
    "AUS", "AUT", "BEL", "CAN", "CHL", "COL", "CRI", "CZE", "DNK", "EST",
    "FIN", "FRA", "DEU", "GRC", "HUN", "ISL", "IRL", "ISR", "ITA", "JPN",
    "KOR", "LVA", "LTU", "LUX", "MEX", "NLD", "NZL", "NOR", "POL", "PRT",
    "SVK", "SVN", "ESP", "SWE", "CHE", "TUR", "GBR", "USA",
}
RUSSIA_CORE = {"RUS", "CHN", "IND", "DEU", "KOR", "SGP", "USA"}
TECH_BENCHMARKS = {"USA", "CHN", "DEU", "KOR", "SGP", "JPN", "FIN", "SWE", "GBR"}
BENCHMARK_OPTIONS = [
    {"code": "RUSSIA_CORE", "label_ru": "Россия core", "label_en": "Russia core", "iso3": sorted(RUSSIA_CORE)},
    {"code": "BRICS", "label_ru": "БРИКС", "label_en": "BRICS", "iso3": sorted(BRICS)},
    {"code": "OECD", "label_ru": "ОЭСР", "label_en": "OECD", "iso3": sorted(OECD)},
    {"code": "G20", "label_ru": "G20", "label_en": "G20", "iso3": sorted(G20)},
    {"code": "TOP10", "label_ru": "top-10", "label_en": "top-10", "iso3": []},
    {"code": "CUSTOM", "label_ru": "custom", "label_en": "custom", "iso3": []},
]

POLICY_TEMPLATES: dict[tuple[str, str], dict[str, str]] = {
    ("HTEI", "HT_EMPLOYMENT_SHARE"): {
        "measure": "Запустить отраслевой контур мониторинга высокотехнологичной занятости: единая таксономия ОКВЭД/ОКЗ, квартальная сверка с работодателями и региональные планы набора в ICT, R&D и высокотехнологичное производство.",
        "measure_en": "Launch a sector workforce observatory for high-technology employment: a unified activity/occupation taxonomy, quarterly employer validation and regional hiring plans for ICT, R&D and high-technology manufacturing.",
        "actor": "Минобрнауки России; Минпромторг; Минцифры; Росстат; регионы; отраслевые работодатели",
        "actor_en": "Ministry of Science and Higher Education; Ministry of Industry and Trade; Ministry of Digital Development; Rosstat; regions; sector employers",
        "horizon": "2026-2028",
        "expected_effect": "Рост измеримого предложения рабочих мест в высокотехнологичных секторах и более точная связка программ подготовки с фактическим спросом работодателей.",
        "expected_effect_en": "Higher measured high-technology employment capacity and a tighter link between training programmes and observed employer demand.",
        "risk": "Риск несопоставимости ведомственных классификаций; нужен единый справочник и публичная методика пересчёта.",
        "risk_en": "Classification mismatch across agencies; a shared taxonomy and public transformation method are required.",
    },
    ("HTEI", "HIGH_TECH_OCCUPATIONS"): {
        "measure": "Собрать портфель инженерных и цифровых профессий для приоритетных отраслей: профили компетенций, целевые контрольные цифры приёма, короткие программы переподготовки и независимая оценка навыков.",
        "measure_en": "Build a portfolio of engineering and digital occupations for priority sectors: skill profiles, targeted admissions, short reskilling programmes and independent skill assessment.",
        "actor": "Минобрнауки России; Минтруд; отраслевые советы по квалификациям; университеты; технологические компании",
        "actor_en": "Ministry of Science and Higher Education; Ministry of Labour; sector qualification councils; universities; technology companies",
        "horizon": "2026-2029",
        "expected_effect": "Снижение дефицита прикладных high-tech профессий и ускорение перехода выпускников в технологические роли.",
        "expected_effect_en": "Lower shortage of applied high-tech occupations and faster transition of graduates into technology roles.",
        "risk": "Компании могут не раскрывать спрос на навыки; участие работодателей нужно закрепить через софинансирование и отраслевые соглашения.",
        "risk_en": "Companies may under-report skill demand; employer participation should be tied to co-funding and sector agreements.",
    },
    ("HTEI", "RND_PERSONNEL"): {
        "measure": "Расширить industrial PhD и лаборатории при компаниях: долгосрочные места для молодых исследователей, совместные KPI публикаций, патентов и внедрений, отдельный трек возвращения исследователей из бизнеса в университеты.",
        "measure_en": "Scale industrial PhD tracks and company-linked laboratories: long-term positions for young researchers, joint KPIs for publications, patents and deployment, and a return track from industry to universities.",
        "actor": "Минобрнауки России; РНФ; университеты; корпорации с R&D-центрами",
        "actor_en": "Ministry of Science and Higher Education; Russian Science Foundation; universities; corporations with R&D centres",
        "horizon": "2026-2030",
        "expected_effect": "Увеличение кадрового ядра исследований и разработок без разрыва между академической подготовкой и корпоративными задачами.",
        "expected_effect_en": "A larger R&D personnel base without a gap between academic training and corporate technology agendas.",
        "risk": "Риск формальных партнёрств без реальных R&D-задач; требуется проверка портфеля проектов и доли корпоративного финансирования.",
        "risk_en": "Formal partnerships may lack real R&D tasks; project portfolios and corporate funding shares need verification.",
    },
    ("HTEI", "STEM_PIPELINE"): {
        "measure": "Сфокусировать STEM pipeline на завершении программ и качестве инженерной подготовки: ранняя профориентация, мостовые курсы по математике и программированию, наставничество индустрии и мониторинг трудоустройства выпускников.",
        "measure_en": "Focus the STEM pipeline on completion and engineering quality: early guidance, bridge courses in mathematics and programming, industry mentoring and graduate employment tracking.",
        "actor": "Минобрнауки России; Рособрнадзор; университеты; школы-партнёры; индустриальные наставники",
        "actor_en": "Ministry of Science and Higher Education; education quality agencies; universities; partner schools; industry mentors",
        "horizon": "2026-2028",
        "expected_effect": "Более устойчивый поток STEM-выпускников с навыками, пригодными для высокотехнологичной занятости.",
        "expected_effect_en": "A more reliable flow of STEM graduates with skills usable in high-technology employment.",
        "risk": "Масштабирование может снизить качество; нужны outcome-метрики завершения, трудоустройства и независимой оценки навыков.",
        "risk_en": "Scaling can dilute quality; completion, employment and independent skill outcomes must be tracked.",
    },
    ("HTEI", "CORPORATE_STRATEGY_AND_DEMAND"): {
        "measure": "Ввести проверяемый корпоративный слой спроса на кадры: добровольный реестр официальных отчётов компаний, единый формат раскрытия технологических кадровых планов и пилотная сверка с образовательным заказом.",
        "measure_en": "Introduce an auditable corporate demand layer: a voluntary register of official company reports, a common disclosure format for technology workforce plans and a pilot link to education procurement.",
        "actor": "Минэкономразвития; Минпромторг; Минцифры; крупнейшие технологические работодатели; биржевые и отраслевые ассоциации",
        "actor_en": "Ministry of Economic Development; Ministry of Industry and Trade; Ministry of Digital Development; major technology employers; market and sector associations",
        "horizon": "2026-2027",
        "expected_effect": "Корпоративная отчётность станет проверяемым evidence-layer и постепенно сможет перейти в числовой компонент при достаточном покрытии.",
        "expected_effect_en": "Corporate reporting becomes an auditable evidence layer and can later move into numeric scoring when coverage is sufficient.",
        "risk": "Неполное раскрытие компаниями может создать смещение; numeric scoring нельзя включать до достаточного покрытия и checksum-проверки отчётов.",
        "risk_en": "Incomplete company disclosure can bias the metric; numeric scoring must wait for sufficient coverage and checksum-verified reports.",
    },
    ("HTEI", "TECH_OUTPUTS"): {
        "measure": "Связать кадровую политику с технологическими результатами: целевые консорциумы университетов и компаний по патентам, ICT services, high-tech exports и внедрению R&D, с ежегодным публичным разбором узких мест.",
        "measure_en": "Link workforce policy to technology outputs: targeted university-company consortia for patents, ICT services, high-tech exports and R&D deployment, with an annual public bottleneck review.",
        "actor": "Минобрнауки России; Минпромторг; Минцифры; институты развития; экспортные и патентные ведомства",
        "actor_en": "Ministry of Science and Higher Education; Ministry of Industry and Trade; Ministry of Digital Development; development institutions; export and patent agencies",
        "horizon": "2026-2030",
        "expected_effect": "Кадровые меры будут оцениваться не только по выпуску специалистов, но и по технологическому выпуску экономики.",
        "expected_effect_en": "Workforce measures are assessed not only by graduate supply but by technology output in the economy.",
        "risk": "Технологические результаты реагируют с лагом; оценка должна разделять краткосрочные workforce indicators и долгосрочные output indicators.",
        "risk_en": "Technology outputs respond with a lag; evaluation should separate short-term workforce indicators from long-term output indicators.",
    },
}


def get_conn():
    if not DB_PATH.exists():
        build_if_missing(DB_PATH)
    return connect(DB_PATH)


def db_cache_token() -> int:
    if not DB_PATH.exists():
        build_if_missing(DB_PATH)
    return DB_PATH.stat().st_mtime_ns


def value_provenance(value: dict[str, Any] | None, source: dict[str, Any] | None = None) -> dict[str, Any] | None:
    if not value:
        return None
    source = source or {}
    extra: dict[str, Any] = {}
    try:
        extra = json.loads(value.get('provenance_json') or '{}')
    except Exception:
        extra = {}
    return {
        'value_id': value.get('value_id'),
        'source_id': value.get('source_id'),
        'source_name': source.get('source_name') or source.get('title'),
        'source_owner': source.get('owner'),
        'source_url': value.get('source_url') or source.get('source_url') or source.get('url'),
        'license_or_terms': source.get('license_or_terms') or source.get('license_note'),
        'retrieved_at': value.get('retrieved_at'),
        'release_year': value.get('release_year'),
        'raw_snapshot_path': value.get('raw_snapshot_path'),
        'raw_snapshot_sha256': value.get('raw_snapshot_sha256'),
        'transform_id': value.get('transform_id'),
        'transformation_run_id': value.get('transformation_run_id'),
        'formula_version': value.get('formula_version'),
        'quality_flag': value.get('quality_flag'),
        'is_official': bool(value.get('is_official')),
        'is_recomputed': bool(value.get('is_recomputed')),
        'source_group': extra.get('source_group'),
        'source_priority': extra.get('source_priority'),
        'selection_rule': value.get('selection_rule') or extra.get('selection_rule'),
        'dimensions_json': extra.get('dimensions_json'),
        'source_group_coverage': extra.get('source_group_coverage'),
        'available_weight': extra.get('available_weight') or value.get('available_weight'),
        'source_data_year': value.get('source_data_year') or value.get('year'),
        'indicator_code': value.get('indicator_code'),
        'unit': value.get('unit'),
        'raw_value': value.get('raw_value'),
        'normalized_score': value.get('normalized_score') if value.get('normalized_score') is not None else value.get('score'),
        'proxy_status': value.get('proxy_status'),
        'interpretation_ru': value.get('interpretation_ru'),
        'interpretation_en': value.get('interpretation_en'),
        'mode': value.get('mode'),
        'confidence_score': value.get('confidence_score'),
        'base_weight': value.get('base_weight'),
        'effective_weight': value.get('effective_weight'),
        'weighted_contribution': value.get('weighted_contribution'),
    }



def available_years(conn) -> list[int]:
    years = [int(r['year']) for r in rows(conn, 'SELECT DISTINCT year FROM index_scores ORDER BY year')]
    return years or [DEFAULT_YEAR]


def default_year(conn) -> int:
    return max(available_years(conn))


def requested_or_default(conn, year: int | None) -> int:
    return int(year if year is not None else default_year(conn))


def min_ranking_count(code: str) -> int:
    return 40 if code.upper() == 'HTEI' else 1


def effective_index_year(conn, code: str, requested_year: int, iso3: str | None = None) -> int | None:
    code = code.upper()
    min_count = min_ranking_count(code)
    params: list[Any] = [code, requested_year]
    iso_sql = ''
    if iso3:
        iso_sql = ' AND iso3=?'
        params.append(iso3.upper())
    candidates = rows(conn, f'SELECT DISTINCT year FROM index_scores WHERE index_code=? AND year<=?{iso_sql} ORDER BY year DESC', tuple(params))
    if not candidates:
        params = [code]
        iso_sql = ''
        if iso3:
            iso_sql = ' AND iso3=?'
            params.append(iso3.upper())
        candidates = rows(conn, f'SELECT DISTINCT year FROM index_scores WHERE index_code=?{iso_sql} ORDER BY year DESC', tuple(params))
    for candidate in candidates:
        year = int(candidate['year'])
        count = row(conn, 'SELECT COUNT(*) AS n FROM index_scores WHERE index_code=? AND year=?', (code, year))['n']
        if count >= min_count:
            return year
    return int(candidates[0]['year']) if candidates else None


def strict_htei_year(conn, requested_year: int) -> int | None:
    candidates = rows(
        conn,
        """SELECT year, COUNT(*) AS n FROM index_scores
           WHERE index_code='HTEI' AND formula_version='htei-v3-multisource' AND year<=?
           GROUP BY year ORDER BY year DESC""",
        (requested_year,),
    )
    min_count = min_ranking_count("HTEI")
    for candidate in candidates:
        if int(candidate["n"] or 0) >= min_count:
            return int(candidate["year"])
    return int(candidates[0]["year"]) if candidates else None


def score_row_for(conn, code: str, requested_year: int, iso3: str | None = None) -> dict[str, Any] | None:
    value_year = effective_index_year(conn, code, requested_year, iso3)
    if value_year is None:
        return None
    if iso3:
        return row(conn, '''SELECT s.*, sr.source_name, sr.license_or_terms
            FROM index_scores s JOIN source_registry sr ON sr.source_id=s.source_id
            WHERE s.index_code=? AND s.iso3=? AND s.year=?''', (code.upper(), iso3.upper(), value_year))
    return row(conn, 'SELECT ? AS year', (value_year,))


def freshness_label(value_year: int | None, requested_year: int) -> str:
    if value_year is None:
        return "missing"
    lag = max(0, int(requested_year) - int(value_year))
    if lag == 0:
        return "current"
    if lag <= 2:
        return "recent"
    return "stale"


def year_lag(value_year: int | None, requested_year: int) -> int | None:
    if value_year is None:
        return None
    return max(0, int(requested_year) - int(value_year))


def freshness_reference_year(value: dict[str, Any] | None, fallback_year: int | None = None) -> int | None:
    if value and value.get("source_data_year") is not None:
        return int(value["source_data_year"])
    return int(fallback_year) if fallback_year is not None else None


MATRIX_METRICS = {"rank", "score", "rank_delta_1y", "rank_delta_5y", "data_quality"}


def default_sort_dir(metric: str) -> str:
    return "asc" if metric == "rank" else "desc"


def matrix_sort_value(item: dict[str, Any], sort_index: str, sort_metric: str) -> float | None:
    cell = (item.get("indices") or {}).get(sort_index)
    if not cell:
        return None
    value = cell.get(sort_metric)
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def group_iso3(conn, group: str | None, year: int, metric_index: str = "HTEI") -> set[str] | None:
    if not group or group.lower() == "all":
        return None
    code = group.upper()
    if code == "BRICS":
        return set(BRICS)
    if code == "OECD":
        return set(OECD)
    if code == "G20":
        return set(G20)
    if code in {"RUSSIA_CORE", "RUSSIA-CORE"}:
        return set(RUSSIA_CORE)
    if code in {"TECH_BENCHMARKS", "TECH"}:
        return set(TECH_BENCHMARKS)
    if code in {"TOP10", "TOP-10"}:
        ranking = asof_ranking(conn, metric_index, year) if metric_index.upper() == "HTEI" else index_payload(conn, metric_index, year)["ranking"]
        return {r["iso3"] for r in ranking[:10]}
    return None


def component_coverage(conn, index_code: str, iso3: str, year: int) -> dict[str, Any]:
    comps = rows(conn, "SELECT component_code, weight FROM components WHERE index_code=? ORDER BY weight DESC", (index_code,))
    vals = {
        r["component_code"]: r
        for r in rows(
            conn,
            "SELECT component_code, source_id, source_data_year, quality_flag FROM component_values WHERE index_code=? AND iso3=? AND year=?",
            (index_code, iso3, year),
        )
    }
    available_weight = sum(c["weight"] for c in comps if c["component_code"] in vals)
    return {
        "available_components": len(vals),
        "required_components": len(comps),
        "available_weight": available_weight,
        "components": [
            {
                "component_code": c["component_code"],
                "weight": c["weight"],
                "available": c["component_code"] in vals,
                "source_id": vals.get(c["component_code"], {}).get("source_id"),
                "source_data_year": vals.get(c["component_code"], {}).get("source_data_year"),
                "quality_flag": vals.get(c["component_code"], {}).get("quality_flag"),
            }
            for c in comps
        ],
    }


def asof_ranking(conn, code: str, year: int) -> list[dict[str, Any]]:
    out = []
    countries = rows(conn, "SELECT iso3, iso2, name_ru, name_en, region, flag, income_group FROM countries")
    for country in countries:
        score = score_row_for(conn, code, year, country["iso3"])
        if not score:
            continue
        out.append({
            **country,
            **score,
            "value_year": score["year"],
            "year_lag": year_lag(freshness_reference_year(score, score["year"]), year),
            "freshness": freshness_label(freshness_reference_year(score, score["year"]), year),
            "stale": freshness_label(freshness_reference_year(score, score["year"]), year) == "stale",
            "component_coverage": component_coverage(conn, code, country["iso3"], score["year"]) if code.upper() == "HTEI" else None,
        })
    out.sort(key=lambda item: (item["score"], item["data_quality"]), reverse=True)
    for rank, item in enumerate(out, start=1):
        item["asof_rank"] = rank
        item["rank"] = rank
    return out


def htei_source_contribution(conn, iso3: str, year: int) -> list[dict[str, Any]]:
    return rows(
        conn,
        """SELECT cv.component_code, cv.source_id, sr.source_name, sr.source_role, cv.source_data_year,
                  cv.normalized_score, cv.weighted_contribution, cv.raw_snapshot_path, cv.raw_snapshot_sha256,
                  cv.value_id
           FROM component_values cv
           JOIN source_registry sr ON sr.source_id=cv.source_id
           WHERE cv.index_code='HTEI' AND cv.iso3=? AND cv.year=?
           ORDER BY cv.component_code, cv.source_id""",
        (iso3.upper(), year),
    )


def htei_mode_payload(conn, year: int, iso3: str = "RUS", mode: str = "asof") -> dict[str, Any]:
    mode = (mode or "asof").lower()
    iso3 = iso3.upper()
    if mode == "strict":
        strict_year = strict_htei_year(conn, year) or year
        ranking = rows(
            conn,
            """SELECT s.*, c.name_ru, c.name_en, c.iso2, c.region, c.flag, c.income_group, sr.source_name
               FROM index_scores s
               JOIN countries c ON c.iso3=s.iso3
               JOIN source_registry sr ON sr.source_id=s.source_id
               WHERE s.index_code='HTEI' AND s.year=? AND s.formula_version='htei-v3-multisource'
               ORDER BY s.rank ASC""",
            (strict_year,),
        )
        selected = {r["iso3"] for r in ranking}
        all_countries = rows(conn, "SELECT iso3, name_ru, name_en, region FROM countries ORDER BY name_en")
        excluded = []
        for c in all_countries:
            if c["iso3"] in selected:
                continue
            obs = row(conn, "SELECT COUNT(DISTINCT component_code) AS c FROM source_observations WHERE index_code='HTEI' AND iso3=? AND year=?", (c["iso3"], strict_year))
            excluded.append({**c, "reason": "insufficient_component_coverage", "observed_components": obs["c"] if obs else 0})
        coverage_table = [
            {
                "iso3": r["iso3"],
                "name_ru": r["name_ru"],
                "name_en": r["name_en"],
                "rank": r["rank"],
                "score": r["score"],
                "source_data_year": r.get("source_data_year"),
                "component_coverage": component_coverage(conn, "HTEI", r["iso3"], strict_year),
                "freshness": freshness_label(freshness_reference_year(r, strict_year), year),
            }
            for r in ranking
        ]
        value_year = strict_year
    else:
        ranking = asof_ranking(conn, "HTEI", year)
        coverage_table = [
            {
                "iso3": r["iso3"],
                "name_ru": r["name_ru"],
                "name_en": r["name_en"],
                "rank": r["rank"],
                "score": r["score"],
                "value_year": r["value_year"],
                "source_data_year": r.get("source_data_year"),
                "data_quality": r.get("data_quality"),
                "freshness": r["freshness"],
                "component_coverage": r["component_coverage"],
            }
            for r in ranking
        ]
        excluded = []
        value_year = effective_index_year(conn, "HTEI", year, iso3)
    base = index_explainer_payload(conn, "HTEI", value_year or year, iso3)
    country_score = score_row_for(conn, "HTEI", year if mode != "strict" else value_year, iso3)
    country_year = country_score["year"] if country_score else value_year
    source_data_year = freshness_reference_year(country_score, country_year)
    source_contribution = htei_source_contribution(conn, iso3, country_year) if country_year else []
    return {
        **base,
        "mode": "strict" if mode == "strict" else "asof",
        "ranking_mode": "HTEI_STRICT_LATEST" if mode == "strict" else "HTEI_ASOF",
        "formula_version_for_mode": "htei-v3-multisource" if mode == "strict" else "htei-v3-multisource-asof-2026",
        "requested_year": year,
        "value_year": value_year,
        "source_data_year": source_data_year,
        "year_lag": year_lag(source_data_year, year),
        "freshness": freshness_label(source_data_year, year),
        "stale": freshness_label(source_data_year, year) == "stale",
        "source_group_coverage": sorted({item["source_role"] or item["source_id"] for item in source_contribution}),
        "ranking": ranking,
        "coverage_table": coverage_table,
        "excluded_countries": excluded,
        "source_contribution": source_contribution,
        "optional_components": [
            {
                "component_code": "VACANCY_DEMAND",
                "status_ru": "не включено в расчёт из-за отсутствия юридически устойчивого источника",
                "status_en": "not included in scoring because no legally stable source is available",
                "included_in_score": False,
            }
        ],
    }


def qs_summary_payload(conn, iso3: str, year: int) -> dict[str, Any]:
    iso3 = iso3.upper()
    value_year = effective_index_year(conn, "QS_ET", year, iso3) or year
    institutions = rows(conn, "SELECT * FROM qs_institution_rankings WHERE iso3=? AND year=? ORDER BY COALESCE(rank, 99999), title", (iso3, value_year))
    ranks = [int(i["rank"]) for i in institutions if i.get("rank") is not None]
    score = score_row_for(conn, "QS_ET", year, iso3)
    total_points = sum((i.get("overall_score") or 0) for i in institutions) or 1
    contributions = [
        {
            "title": i["title"],
            "rank": i.get("rank"),
            "rank_display": i.get("rank_display"),
            "overall_score": i.get("overall_score"),
            "contribution_weight": ((i.get("overall_score") or 0) / total_points),
        }
        for i in institutions
    ]
    return {
        "top100_count": sum(1 for r in ranks if r <= 100),
        "top250_count": sum(1 for r in ranks if r <= 250),
        "top500_count": sum(1 for r in ranks if r <= 500),
        "best_rank": min(ranks) if ranks else None,
        "median_rank": sorted(ranks)[len(ranks) // 2] if ranks else None,
        "mean_rank": sum(ranks) / len(ranks) if ranks else None,
        "country_score": score["score"] if score else None,
        "value_year": value_year,
        "institution_contributions": contributions,
    }


def country_payload(conn, iso3: str, year: int) -> dict[str, Any]:
    country = row(conn, 'SELECT * FROM countries WHERE iso3=?', (iso3.upper(),))
    if not country:
        raise HTTPException(404, f'Unknown country {iso3}')
    index_rows = current_index_rows(conn)
    cards=[]
    for r in index_rows:
        score = score_row_for(conn, r['code'], year, iso3.upper())
        card = dict(r)
        if score:
            card.update(score)
        value_year = score.get('year') if score else None
        weak = row(conn, '''SELECT cv.*, c.name_ru, c.name_en, c.weight, sr.source_name, sr.license_or_terms
            FROM component_values cv JOIN components c ON c.index_code=cv.index_code AND c.component_code=cv.component_code
            JOIN source_registry sr ON sr.source_id=cv.source_id
            WHERE cv.iso3=? AND cv.index_code=? AND cv.year=?
            ORDER BY cv.priority_score DESC LIMIT 1''', (iso3.upper(), r['code'], value_year)) if value_year is not None else None
        strong = row(conn, '''SELECT cv.*, c.name_ru, c.name_en, c.weight, sr.source_name, sr.license_or_terms
            FROM component_values cv JOIN components c ON c.index_code=cv.index_code AND c.component_code=cv.component_code
            JOIN source_registry sr ON sr.source_id=cv.source_id
            WHERE cv.iso3=? AND cv.index_code=? AND cv.year=?
            ORDER BY cv.normalized_score DESC LIMIT 1''', (iso3.upper(), r['code'], value_year)) if value_year is not None else None
        trend = rows(conn, 'SELECT year, score, rank FROM index_scores WHERE iso3=? AND index_code=? ORDER BY year', (iso3.upper(), r['code']))
        card['index_code'] = card['code']
        card['available'] = card.get('score') is not None
        card['requested_year'] = year
        card['value_year'] = value_year
        freshness_year = freshness_reference_year(score, value_year)
        card['year_lag'] = year_lag(freshness_year, year)
        card['freshness'] = freshness_label(freshness_year, year)
        card['stale'] = card['freshness'] == 'stale'
        if r['code'].upper() == 'HTEI':
            card['ranking_mode'] = 'HTEI_ASOF'
            card['component_coverage'] = component_coverage(conn, 'HTEI', iso3.upper(), value_year) if value_year is not None else None
        card['provenance'] = value_provenance(card, card) if card['available'] else None
        card['weak_component'] = weak
        card['strong_component'] = strong
        card['trend'] = trend
        cards.append(card)
    recs = rows(conn, '''SELECT r.*, c.name_ru AS component_name_ru, c.name_en AS component_name_en
        FROM recommendations r JOIN components c ON c.index_code=r.index_code AND c.component_code=r.component_code
        WHERE r.iso3=? AND r.year<=? ORDER BY r.year DESC, r.priority_score DESC LIMIT 9''', (iso3.upper(), year))
    return {'country': country, 'requested_year': year, 'year': year, 'indices': cards, 'recommendations': recs}


def index_payload(conn, code: str, year: int, country: str = 'RUS') -> dict[str, Any]:
    idx = row(conn, 'SELECT * FROM indices WHERE code=?', (code.upper(),))
    if not idx:
        raise HTTPException(404, f'Unknown index {code}')
    value_year = effective_index_year(conn, code.upper(), year)
    ranking = rows(conn, '''SELECT s.*, c.name_ru, c.name_en, c.iso2, c.region, c.flag, c.income_group, sr.source_name
        FROM index_scores s JOIN countries c ON c.iso3=s.iso3
        JOIN source_registry sr ON sr.source_id=s.source_id
        WHERE s.index_code=? AND s.year=? ORDER BY s.rank ASC''', (code.upper(), value_year)) if value_year is not None else []
    components = rows(conn, 'SELECT * FROM components WHERE index_code=? ORDER BY weight DESC', (code.upper(),))
    formula = row(conn, 'SELECT * FROM index_formulas WHERE index_code=? ORDER BY formula_version DESC LIMIT 1', (code.upper(),))
    if ranking:
        try:
            diag = diagnostics_payload(conn, country, code, year)
        except HTTPException as exc:
            if exc.status_code != 404:
                raise
            # A country may legitimately be absent from one external index (for example QS).
            # The global ranking/methodology page must still render, while the country panel
            # explicitly reports that no country score is available.
            diag = {
                'score': None,
                'components': [],
                'priority_component': None,
                'requested_year': year,
                'value_year': None,
                'available': False,
                'reason': 'No score for country/index/year',
            }
    else:
        diag = {'score': None, 'components': [], 'priority_component': None, 'requested_year': year, 'value_year': None, 'available': False}
    series = rows(conn, 'SELECT iso3, year, score, rank FROM index_scores WHERE index_code=? ORDER BY iso3, year', (code.upper(),))
    return {'index': idx, 'requested_year': year, 'year': year, 'value_year': value_year, 'ranking': ranking, 'components': components, 'formula': formula, 'country_diagnostics': diag, 'series': series}


def diagnostics_payload(conn, iso3: str, code: str, year: int) -> dict[str, Any]:
    iso3 = iso3.upper(); code = code.upper()
    value_year = effective_index_year(conn, code, year, iso3)
    if value_year is None:
        raise HTTPException(404, 'No score for country/index/year')
    score = row(conn, '''SELECT s.*, c.name_ru, c.name_en, c.flag, sr.source_name, sr.license_or_terms
        FROM index_scores s JOIN countries c ON c.iso3=s.iso3
        JOIN source_registry sr ON sr.source_id=s.source_id
        WHERE s.iso3=? AND s.index_code=? AND s.year=?''', (iso3, code, value_year))
    if not score:
        raise HTTPException(404, 'No score for country/index/year')
    comps = rows(conn, '''SELECT cv.*, c.name_ru, c.name_en, c.weight, c.source_note, sr.source_name, sr.license_or_terms
        FROM component_values cv JOIN components c ON c.index_code=cv.index_code AND c.component_code=cv.component_code
        JOIN source_registry sr ON sr.source_id=cv.source_id
        WHERE cv.iso3=? AND cv.index_code=? AND cv.year=?
        ORDER BY cv.priority_score DESC''', (iso3, code, value_year))
    top10_avg = {}
    for comp in comps:
        vals = rows(conn, '''SELECT cv.normalized_score FROM component_values cv JOIN index_scores s ON s.iso3=cv.iso3 AND s.index_code=cv.index_code AND s.year=cv.year
            WHERE cv.index_code=? AND cv.component_code=? AND cv.year=? AND s.rank<=10''', (code, comp['component_code'], value_year))
        top10_avg[comp['component_code']] = sum(v['normalized_score'] for v in vals)/len(vals) if vals else None
    for comp in comps:
        comp['top10_avg'] = top10_avg.get(comp['component_code'])
        comp['priority_score'] = comp.get('priority_score') or comp['gap_to_frontier'] * comp['rank_leverage'] * comp['actionability']
        comp['provenance'] = value_provenance(comp, comp)
    score['provenance'] = value_provenance(score, score)
    score['requested_year'] = year
    score['value_year'] = value_year
    return {'score': score, 'components': comps, 'priority_component': comps[0] if comps else None, 'requested_year': year, 'value_year': value_year}




def latest_component_rows(conn, iso3: str, year: int) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for idx in current_index_rows(conn):
        value_year = effective_index_year(conn, idx['code'], year, iso3.upper())
        if value_year is None:
            continue
        sql = """SELECT cv.*, c.name_ru, c.name_en, c.weight, c.source_note, i.name_ru AS index_name_ru, i.name_en AS index_name_en, i.short_name_ru, i.short_name_en, sr.source_name
            FROM component_values cv
            JOIN components c ON c.index_code=cv.index_code AND c.component_code=cv.component_code
            JOIN indices i ON i.code=cv.index_code
            JOIN source_registry sr ON sr.source_id=cv.source_id
            WHERE cv.iso3=? AND cv.index_code=? AND cv.year=?
            ORDER BY cv.priority_score DESC"""
        out.extend(rows(conn, sql, (iso3.upper(), idx['code'], value_year)))
    return sorted(out, key=lambda item: item['priority_score'], reverse=True)


def country_command_center_payload(conn, iso3: str, year: int) -> dict[str, Any]:
    base = country_payload(conn, iso3, year)
    cards = [card for card in base['indices'] if card.get('available')]
    all_components = latest_component_rows(conn, iso3, year)
    risk_indices = []
    for card in cards:
        # Diagnostic ASOF profiles deliberately have no international rank.
        # They must remain visible in the country profile but cannot enter rank-risk calculations.
        if card.get('rank') is None:
            continue
        country_count = row(conn, 'SELECT COUNT(*) AS n FROM index_scores WHERE index_code=? AND year=?', (card['index_code'], card['value_year']))['n'] or 1
        pressure = (card['rank'] / country_count) * 100
        risk_indices.append({
            'index_code': card['index_code'],
            'rank': card['rank'],
            'score': card['score'],
            'value_year': card['value_year'],
            'data_quality': card.get('data_quality'),
            'risk_score': pressure,
            'weak_component': card.get('weak_component'),
            'trend': card.get('trend', []),
        })
    risk_indices.sort(key=lambda item: item['risk_score'], reverse=True)
    quick_levers = [c for c in all_components if c.get('actionability', 0) >= 0.65][:6]
    long_levers = sorted(all_components, key=lambda item: (item.get('weighted_gap') or 0), reverse=True)[:6]
    weakest_components = sorted(all_components, key=lambda item: (item.get('normalized_score') or 0))[:3]
    policy_recommendations = structured_policy_recommendations(conn, iso3, year)[:3]
    htei_components = [c for c in all_components if c['index_code'] == 'HTEI']
    tz_summary = {
        'ru': [
            'Создание интегрированной базы данных по трудовым ресурсам в высокотехнологичных отраслях',
            'Формирование системы индикаторов для мониторинга развития технологических кадров',
            'Индекс занятости в высокотехнологичных отраслях (High-tech employment index)',
            'Разработка модели оценки конкурентоспособности национальных систем подготовки кадров для высокотехнологичных отраслей',
            'Подготовка практических рекомендаций по формированию трудовых ресурсов в высокотехнологичных отраслях Российской Федерации',
        ],
        'en': [
            'Integrated database on labour resources in high-technology industries',
            'System of indicators for monitoring technological workforce development',
            'High-Tech Employment Index',
            'Model for assessing competitiveness of national training systems for high-technology industries',
            'Practical recommendations on forming high-technology workforce capacity',
        ],
    }
    return {
        'country': base['country'],
        'requested_year': year,
        'indices': cards,
        'risk_indices': risk_indices[:3],
        'weakest_components': weakest_components,
        'quick_levers': quick_levers[:3],
        'long_term_levers': long_levers[:3],
        'long_levers': long_levers[:3],
        'policy_recommendations': policy_recommendations,
        'htei_components': htei_components,
        'tz_summary': tz_summary,
        'recommendations': base['recommendations'],
        'benchmark_options': BENCHMARK_OPTIONS,
        'selected_benchmark': 'RUSSIA_CORE',
    }


def structured_policy_recommendations(conn, iso3: str, year: int) -> list[dict[str, Any]]:
    iso3 = iso3.upper()
    recs = rows(conn, '''SELECT r.*, c.name_ru AS component_name_ru, c.name_en AS component_name_en
        FROM recommendations r
        JOIN components c ON c.index_code=r.index_code AND c.component_code=r.component_code
        WHERE r.iso3=? AND r.year<=?
        ORDER BY r.priority_score DESC LIMIT 80''', (iso3, year))
    out = []
    seen_components: set[tuple[str, str]] = set()
    for rec in recs:
        rec_key = (rec["index_code"], rec["component_code"])
        if rec_key in seen_components:
            continue
        seen_components.add(rec_key)
        template = POLICY_TEMPLATES.get((rec["index_code"], rec["component_code"]))
        value_year = effective_index_year(conn, rec["index_code"], year, iso3)
        comp = row(conn, '''SELECT cv.*, sr.source_name
            FROM component_values cv JOIN source_registry sr ON sr.source_id=cv.source_id
            WHERE cv.iso3=? AND cv.index_code=? AND cv.component_code=? AND cv.year=?''',
            (iso3, rec["index_code"], rec["component_code"], value_year)) if value_year else None
        out.append({
            "problem": rec["title_ru"],
            "problem_en": rec["title_en"],
            "indicator": rec["component_name_ru"],
            "indicator_en": rec["component_name_en"],
            "source": comp["source_name"] if comp else rec["index_code"],
            "benchmark": "Россия core / top-10 frontier",
            "measure": template["measure"] if template else rec["text_ru"],
            "measure_en": template["measure_en"] if template else rec["text_en"],
            "actor": template["actor"] if template else "Минобрнауки России; отраслевые ведомства; университеты; технологические компании",
            "actor_en": template["actor_en"] if template else "Ministry of Science and Higher Education; sector ministries; universities; technology companies",
            "horizon": template["horizon"] if template else rec["horizon"],
            "expected_effect": template["expected_effect"] if template else "Снижение gap_to_frontier и улучшение позиции в соответствующем индексе",
            "expected_effect_en": template["expected_effect_en"] if template else "Reduced gap_to_frontier and improved position in the corresponding index",
            "risk": template["risk"] if template else "Недостаточная межведомственная координация и задержка обновления исходных данных",
            "risk_en": template["risk_en"] if template else "Insufficient cross-agency coordination and delayed source-data refresh",
            "relation_to_tz": "Пункт 2.4 исходного ТЗ: практические рекомендации по формированию трудовых ресурсов",
            "evidence_value_id": comp["value_id"] if comp else None,
            "priority_score": rec["priority_score"] + (25 if template and iso3 == "RUS" else 0),
            "index_code": rec["index_code"],
            "component_code": rec["component_code"],
            "template_id": f"{rec['index_code']}.{rec['component_code']}" if template else None,
        })
    out.sort(key=lambda item: item["priority_score"], reverse=True)
    return out


def cross_index_matrix_payload(
    conn,
    year: int,
    region: str | None = None,
    income_group: str | None = None,
    q: str | None = None,
    group: str | None = None,
    metric: str = "rank",
    top_n: int | None = None,
    sort_index: str | None = "HTEI",
    sort_metric: str | None = None,
    sort_dir: str | None = None,
) -> dict[str, Any]:
    metric = metric if metric in MATRIX_METRICS else "rank"
    sort_metric = sort_metric if sort_metric in MATRIX_METRICS else metric
    sort_index = (sort_index or "HTEI").upper()
    sort_dir = (sort_dir or default_sort_dir(sort_metric)).lower()
    if sort_dir not in {"asc", "desc"}:
        sort_dir = default_sort_dir(sort_metric)
    countries = rows(conn, 'SELECT * FROM countries ORDER BY name_en')
    allowed_iso3 = group_iso3(conn, group, year)
    if allowed_iso3 is not None:
        countries = [c for c in countries if c["iso3"] in allowed_iso3]
    if region and region != 'all':
        region_lc = region.strip().lower()
        countries = [c for c in countries if c['region'].lower() == region_lc]
    if income_group and income_group != 'all':
        income_lc = income_group.strip().lower()
        countries = [c for c in countries if c.get('income_group') and c['income_group'].lower() == income_lc]
    if q:
        query = q.strip().lower()
        countries = [c for c in countries if query in c['iso3'].lower() or query in c['name_en'].lower() or query in c['name_ru'].lower()]
    index_rows = current_index_rows(conn)
    out = []
    for ctry in countries:
        item = dict(ctry)
        item['indices'] = {}
        for idx in index_rows:
            sc = score_row_for(conn, idx['code'], year, ctry['iso3'])
            if sc:
                cell_year = sc['year']
                freshness_year = freshness_reference_year(sc, cell_year)
                item['indices'][idx['code']] = {
                    'rank': sc['rank'], 'score': sc['score'], 'value_year': cell_year, 'source_data_year': sc.get('source_data_year'),
                    'rank_delta_1y': sc.get('rank_delta_1y'), 'rank_delta_5y': sc.get('rank_delta_5y'),
                    'data_quality': sc.get('data_quality'), 'value_id': sc.get('value_id'),
                    'freshness': freshness_label(freshness_year, year),
                    'year_lag': year_lag(freshness_year, year),
                    'stale': freshness_label(freshness_year, year) == 'stale',
                    'ranking_mode': 'HTEI_ASOF' if idx['code'].upper() == 'HTEI' else 'ASOF',
                    'metric_value': sc.get(metric) if metric in {'rank', 'score', 'rank_delta_1y', 'rank_delta_5y', 'data_quality'} else sc['rank'],
                }
            else:
                item['indices'][idx['code']] = None
        out.append(item)
    direction = 1 if sort_dir == "asc" else -1
    out.sort(key=lambda item: (
        matrix_sort_value(item, sort_index, sort_metric) is None,
        direction * (matrix_sort_value(item, sort_index, sort_metric) or 0.0),
        item.get('name_en') or item.get('iso3'),
    ))
    if top_n:
        out = out[: max(0, int(top_n))]
    return {
        'requested_year': year,
        'indices': index_rows,
        'countries': out,
        'group': group or 'all',
        'metric': metric,
        'sort_index': sort_index,
        'sort_metric': sort_metric,
        'sort_dir': sort_dir,
        'topN': top_n,
        'income_group': income_group or 'all',
        'benchmark_options': BENCHMARK_OPTIONS,
    }


def index_explainer_payload(conn, code: str, year: int, iso3: str = 'RUS') -> dict[str, Any]:
    payload = index_payload(conn, code, year, iso3)
    comp_tree = []
    for comp in payload['components']:
        if payload['value_year'] is None:
            vals = []
        else:
            vals = rows(conn, """SELECT cv.*, c.name_ru, c.name_en, co.name_ru AS country_name_ru, co.name_en AS country_name_en, co.flag
                FROM component_values cv
                JOIN components c ON c.index_code=cv.index_code AND c.component_code=cv.component_code
                JOIN countries co ON co.iso3=cv.iso3
                WHERE cv.index_code=? AND cv.component_code=? AND cv.year=?
                ORDER BY cv.normalized_score DESC LIMIT 10""", (code.upper(), comp['component_code'], payload['value_year']))
        comp_tree.append({**comp, 'top_countries': vals})
    payload['component_tree'] = comp_tree
    payload['rank_series_for_country'] = rows(conn, 'SELECT year, score, rank FROM index_scores WHERE index_code=? AND iso3=? ORDER BY year', (code.upper(), iso3.upper()))
    if code.upper() == 'QS_ET':
        qs_payload = qs_country_payload(conn, iso3, year)
        payload['qs_institutions'] = qs_payload['institutions']
        payload['summary'] = qs_summary_payload(conn, iso3, year)
    return payload


def qs_country_payload(conn, iso3: str, year: int) -> dict[str, Any]:
    value_year = effective_index_year(conn, 'QS_ET', year, iso3.upper()) or year
    institutions = rows(conn, """SELECT * FROM qs_institution_rankings WHERE iso3=? AND year=? ORDER BY COALESCE(rank, 99999), title""", (iso3.upper(), value_year))
    score = score_row_for(conn, 'QS_ET', year, iso3.upper())
    return {'iso3': iso3.upper(), 'requested_year': year, 'value_year': value_year, 'score': score, 'institutions': institutions}


def effective_training_year(conn, requested_year: int, iso3: str | None = None) -> int | None:
    params: list[Any] = [requested_year]
    iso_sql = ''
    if iso3:
        iso_sql = ' AND iso3=?'
        params.append(iso3.upper())
    candidates = rows(conn, f'SELECT DISTINCT year FROM training_model_scores WHERE year<=?{iso_sql} ORDER BY year DESC', tuple(params))
    if not candidates:
        params = []
        iso_sql = ''
        if iso3:
            iso_sql = ' WHERE iso3=?'
            params.append(iso3.upper())
        candidates = rows(conn, f'SELECT DISTINCT year FROM training_model_scores{iso_sql} ORDER BY year DESC', tuple(params))
    return int(candidates[0]['year']) if candidates else None


def training_competitiveness_payload(conn, iso3: str, year: int) -> dict[str, Any]:
    iso3 = iso3.upper()
    country = row(conn, 'SELECT * FROM countries WHERE iso3=?', (iso3,))
    if not country:
        raise HTTPException(404, f'Unknown country {iso3}')
    value_year = effective_training_year(conn, year, iso3)
    score = row(conn, '''SELECT t.*, c.name_ru, c.name_en, c.iso2, c.flag, c.region
        FROM training_model_scores t JOIN countries c ON c.iso3=t.iso3
        WHERE t.iso3=? AND t.year=?''', (iso3, value_year)) if value_year else None
    components = rows(conn, '''SELECT * FROM training_model_components
        WHERE iso3=? AND year=? ORDER BY block_code, weighted_contribution DESC''', (iso3, value_year)) if value_year else []
    ranking = rows(conn, '''SELECT t.*, c.name_ru, c.name_en, c.iso2, c.flag, c.region
        FROM training_model_scores t JOIN countries c ON c.iso3=t.iso3
        WHERE t.year=? ORDER BY t.rank ASC''', (value_year,)) if value_year else []
    blocks = []
    for block_code in ["institutional_environment", "educational_infrastructure", "corporate_strategies", "international_cooperation"]:
        block_components = [c for c in components if c['block_code'] == block_code]
        if not block_components:
            continue
        total_weight = sum(c['weight'] for c in block_components) or 1
        block_score = sum(c['weighted_contribution'] for c in block_components) / total_weight
        first = block_components[0]
        blocks.append({
            'code': block_code,
            'name_ru': first['block_name_ru'],
            'name_en': first['block_name_en'],
            'score': block_score,
            'weight': total_weight,
            'components': block_components,
        })
    source_group_coverage = []
    if score:
        try:
            source_group_coverage = json.loads(score.get('source_group_coverage') or '[]')
        except Exception:
            source_group_coverage = []
    diag = diagnostics_payload(conn, iso3, 'HTEI', year)
    return {
        'title_ru': 'Модель оценки конкурентоспособности национальных систем подготовки кадров для высокотехнологичных отраслей',
        'title_en': 'Model for assessing competitiveness of national training systems for high-technology industries',
        'country': country,
        'requested_year': year,
        'value_year': value_year,
        'score': score,
        'ranking': ranking,
        'source_group_coverage': source_group_coverage,
        'formula_version': 'training-system-competitiveness-v1',
        'tz_exact_ru': {
            'database': 'Создание интегрированной базы данных по трудовым ресурсам в высокотехнологичных отраслях на основе агрегации данных международных организаций (МОТ, ОЭСР, Всемирный банк), национальных статистических служб, корпоративной отчетности и специализированных рейтингов',
            'indicators': 'Формирование системы индикаторов для мониторинга развития технологических кадров, включая Индекс занятости в высокотехнологичных отраслях (High-tech employment index)',
            'model': 'Разработка модели оценки конкурентоспособности национальных систем подготовки кадров для высокотехнологичных отраслей на основе анализа институциональной среды, образовательной инфраструктуры, корпоративных стратегий и международного сотрудничества',
            'recommendations': 'Подготовка практических рекомендаций по формированию трудовых ресурсов в высокотехнологичных отраслях Российской Федерации',
        },
        'blocks': blocks,
        'htei_diagnostics': diag,
    }


def htei_model_payload(conn, iso3: str, year: int) -> dict[str, Any]:
    return training_competitiveness_payload(conn, iso3, year)


def data_quality_payload(conn, year: int) -> dict[str, Any]:
    index_rows = current_index_rows(conn)
    out = []
    for idx in index_rows:
        yrs = rows(conn, 'SELECT DISTINCT year FROM index_scores WHERE index_code=? ORDER BY year', (idx['code'],))
        scores = row(conn, 'SELECT COUNT(*) AS n, AVG(data_quality) AS q FROM index_scores WHERE index_code=?', (idx['code'],))
        comps = row(conn, 'SELECT COUNT(*) AS n FROM component_values WHERE index_code=?', (idx['code'],))
        out.append({**idx, 'years': [y['year'] for y in yrs], 'score_rows': scores['n'], 'component_rows': comps['n'], 'avg_data_quality': scores['q']})
    source_role_counts = rows(conn, 'SELECT source_role, COUNT(*) AS source_count FROM source_registry GROUP BY source_role ORDER BY source_role')
    numeric_value_rows = row(conn, '''SELECT COUNT(*) AS n
        FROM (
            SELECT s.source_id FROM index_scores s JOIN source_registry sr ON sr.source_id=s.source_id WHERE sr.source_role='numeric_source'
            UNION ALL
            SELECT cv.source_id FROM component_values cv JOIN source_registry sr ON sr.source_id=cv.source_id WHERE sr.source_role='numeric_source'
        )''')["n"]
    qualitative_evidence_rows = row(conn, '''SELECT COUNT(*) AS n FROM raw_snapshots rs
        JOIN source_registry sr ON sr.source_id=rs.source_id
        WHERE sr.source_role='qualitative_evidence' ''')["n"]
    audit_register_rows = row(conn, '''SELECT COUNT(*) AS n FROM raw_snapshots rs
        JOIN source_registry sr ON sr.source_id=rs.source_id
        WHERE sr.source_role='audit_register' ''')["n"]
    return {
        'requested_year': year,
        'indices': out,
        'sources': rows(conn, 'SELECT * FROM source_registry ORDER BY source_id'),
        'source_role_counts': source_role_counts,
        'numeric_rows': numeric_value_rows,
        'qualitative_evidence_rows': qualitative_evidence_rows,
        'audit_register_rows': audit_register_rows,
        'source_role_warning_ru': 'Корпоративная отчётность используется как evidence layer, а не как числовой компонент индекса, если числового слоя нет.',
        'source_role_warning_en': 'Corporate reporting is used as an evidence layer, not as a numeric index component, when no numeric layer is available.',
    }


def landing_summary_payload(conn, iso3: str = "RUS") -> dict[str, Any]:
    """Return the compact evidence snapshot used by the public landing page.

    The contract is deliberately small and contains only already-published facts.
    It must not duplicate the multi-megabyte analytical payload required by the
    country, matrix and index workspaces.
    """
    iso3 = iso3.upper()
    country = row(
        conn,
        "SELECT iso3,iso2,name_ru,name_en,region,income_group,flag FROM countries WHERE iso3=?",
        (iso3,),
    )
    if not country:
        raise HTTPException(404, f"Unknown country {iso3}")

    year_bounds = row(conn, "SELECT MIN(year) AS year_min,MAX(year) AS year_max FROM index_scores") or {}
    index_scores = int((row(conn, "SELECT COUNT(*) AS n FROM index_scores") or {"n": 0})["n"])
    component_values = int((row(conn, "SELECT COUNT(*) AS n FROM component_values") or {"n": 0})["n"])
    source_observations = int((row(conn, "SELECT COUNT(*) AS n FROM source_observations") or {"n": 0})["n"])
    raw_snapshots = int((row(conn, "SELECT COUNT(*) AS n FROM raw_snapshots") or {"n": 0})["n"])
    pdf_snapshots = int((row(
        conn,
        "SELECT COUNT(*) AS n FROM raw_snapshots WHERE LOWER(content_type) LIKE 'application/pdf%'",
    ) or {"n": 0})["n"])
    latest_snapshot = row(conn, "SELECT MAX(retrieved_at) AS retrieved_at FROM raw_snapshots") or {}

    scale = {
        "countries": int((row(conn, "SELECT COUNT(*) AS n FROM countries") or {"n": 0})["n"]),
        "scored_countries": int((row(conn, "SELECT COUNT(DISTINCT iso3) AS n FROM index_scores") or {"n": 0})["n"]),
        "current_indices": len(current_index_codes(conn)),
        "year_min": int(year_bounds.get("year_min") or DEFAULT_YEAR),
        "year_max": int(year_bounds.get("year_max") or DEFAULT_YEAR),
        "index_scores": index_scores,
        "component_values": component_values,
        "source_observations": source_observations,
        "analytical_records": index_scores + component_values + source_observations,
        "raw_snapshots": raw_snapshots,
        "pdf_snapshots": pdf_snapshots,
        "registered_sources": int((row(conn, "SELECT COUNT(*) AS n FROM source_registry") or {"n": 0})["n"]),
        "database_tables": int((row(
            conn,
            "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        ) or {"n": 0})["n"]),
        "policy_actions": int((row(
            conn,
            "SELECT COUNT(*) AS n FROM policy_brief_items WHERE iso3=?",
            (iso3,),
        ) or {"n": 0})["n"]) if _table_exists(conn, "policy_brief_items") else 0,
    }

    htei_payload: dict[str, Any] = {"available": False}
    if _table_exists(conn, "htei_v6_profiles"):
        profile = None
        for mode in ("direct_core", "common_support", "proxy_extended", "asof_diagnostic"):
            profile = row(
                conn,
                """SELECT * FROM htei_v6_profiles
                   WHERE iso3=? AND release_year=? AND mode=?""",
                (iso3, SCIENTIFIC_RELEASE_YEAR, mode),
            )
            if profile:
                break
        if profile:
            components = rows(
                conn,
                """SELECT component_code,name_ru,name_en,raw_value,unit,normalized_score,
                          effective_weight,weighted_contribution,source_id,source_data_year,
                          data_lag,proxy_status,value_id
                   FROM htei_v6_component_values
                   WHERE profile_id=? ORDER BY effective_weight DESC,component_code""",
                (profile["profile_id"],),
            )
            ranked_total = 0
            if profile.get("rank") is not None:
                ranked_total = int((row(
                    conn,
                    """SELECT COUNT(*) AS n FROM htei_v6_profiles
                       WHERE release_year=? AND mode=? AND eligible_for_ranking=1""",
                    (profile["release_year"], profile["mode"]),
                ) or {"n": 0})["n"])
            htei_payload = {
                "available": True,
                "profile_id": profile["profile_id"],
                "release_year": profile["release_year"],
                "mode": profile["mode"],
                "score": profile["substantive_score"],
                "rank": profile.get("rank"),
                "rank_total": ranked_total,
                "percentile": profile.get("percentile"),
                "confidence": profile.get("confidence_score"),
                "available_components": profile.get("available_components"),
                "available_weight": profile.get("available_weight"),
                "oldest_source_year": profile.get("oldest_source_year"),
                "newest_source_year": profile.get("newest_source_year"),
                "average_lag": profile.get("average_lag"),
                "score_low": profile.get("score_low"),
                "score_high": profile.get("score_high"),
                "rank_low": profile.get("rank_low"),
                "rank_high": profile.get("rank_high"),
                "coverage_class": profile.get("coverage_class"),
                "freshness_class": profile.get("freshness_class"),
                "components": components,
                "strongest_component": max(components, key=lambda item: float(item.get("normalized_score") or 0)) if components else None,
                "weakest_component": min(components, key=lambda item: float(item.get("normalized_score") or 0)) if components else None,
            }

    training_payload: dict[str, Any] = {"available": False}
    if _table_exists(conn, "training_model_scores"):
        training = row(
            conn,
            """SELECT * FROM training_model_scores
               WHERE iso3=? ORDER BY year DESC LIMIT 1""",
            (iso3,),
        )
        if training:
            ranking_total = int((row(
                conn,
                "SELECT COUNT(*) AS n FROM training_model_scores WHERE year=? AND rank IS NOT NULL",
                (training["year"],),
            ) or {"n": 0})["n"])
            blocks = []
            if _table_exists(conn, "training_model_components"):
                blocks = rows(
                    conn,
                    """SELECT block_code,block_name_ru,block_name_en,
                              SUM(weighted_contribution)/NULLIF(SUM(weight),0) AS score,
                              SUM(weight) AS weight
                       FROM training_model_components
                       WHERE iso3=? AND year=?
                       GROUP BY block_code,block_name_ru,block_name_en
                       ORDER BY score DESC""",
                    (iso3, training["year"]),
                )
            training_payload = {
                "available": True,
                "year": training["year"],
                "score": training["score"],
                "rank": training["rank"],
                "rank_total": ranking_total,
                "percentile": training.get("percentile"),
                "data_quality": training.get("data_quality"),
                "blocks": blocks,
                "strongest_block": blocks[0] if blocks else None,
                "weakest_block": blocks[-1] if blocks else None,
            }

    policy_items = []
    if _table_exists(conn, "policy_brief_items"):
        policy_items = rows(
            conn,
            """SELECT priority,title_ru,title_en,problem_ru,problem_en,measure_ru,measure_en,horizon
               FROM policy_brief_items WHERE iso3=? ORDER BY priority LIMIT 3""",
            (iso3,),
        )

    return {
        "release": {
            "year": SCIENTIFIC_RELEASE_YEAR,
            "latest_snapshot_retrieved_at": latest_snapshot.get("retrieved_at"),
        },
        "scale": scale,
        "country": country,
        "htei": htei_payload,
        "training_model": training_payload,
        "policy": {"count": scale["policy_actions"], "priorities": policy_items},
    }


@lru_cache(maxsize=256)
def cached_app_data(country: str, requested_year: int, db_token: int) -> dict[str, Any]:
    with connect(DB_PATH) as conn:
        index_payloads = {
            code: index_explainer_payload(conn, code, requested_year, country)
            for code in current_index_codes(conn)
        }
        return {
            'requested_year': requested_year,
            'years': available_years(conn),
            'default_year': default_year(conn),
            'countries': rows(conn, 'SELECT * FROM countries ORDER BY name_en'),
            'regions': sorted({r['region'] for r in rows(conn, 'SELECT DISTINCT region FROM countries')}),
            'income_groups': sorted({r['income_group'] for r in rows(conn, 'SELECT DISTINCT income_group FROM countries') if r['income_group']}),
            'indices': current_index_rows(conn),
            'sources': rows(conn, 'SELECT * FROM source_registry ORDER BY source_code'),
            'country': country_payload(conn, country, requested_year),
            'human_capital_combined': human_capital_combined_payload(conn, country),
            'command_center': country_command_center_payload(conn, country, requested_year),
            'cross_matrix': cross_index_matrix_payload(conn, requested_year),
            'data_quality': data_quality_payload(conn, requested_year),
            'htei_model': htei_model_payload(conn, country, requested_year),
            'training_competitiveness': training_competitiveness_payload(conn, country, requested_year),
            'release_readiness': release_readiness_payload(conn),
            'acceptance': acceptance_payload(conn, 'ru'),
            'methodology_registry': methodology_registry_payload(conn) if 'methodology_registry_payload' in globals() else [],
            'scientific_audit': scientific_audit_payload(conn) if 'scientific_audit_payload' in globals() else {},
            'policy_brief': policy_brief_payload(conn, country) if 'policy_brief_payload' in globals() else {},
            'index_payloads': index_payloads,
        }

@app.get('/', response_class=HTMLResponse)
def home():
    html = (STATIC_DIR / 'index.html').read_text(encoding='utf-8')
    return HTMLResponse(html)


@app.get('/personal-data-consent', include_in_schema=False)
def personal_data_consent():
    return FileResponse(
        STATIC_DIR / 'personal-data-consent.html',
        media_type='text/html; charset=utf-8',
    )


@app.get('/api/health')
def health():
    with get_conn() as conn:
        current_codes = current_index_codes(conn)
        indices_current = len(current_codes)
        historical_hci = 1 if row(conn, "SELECT 1 AS ok FROM indices WHERE code='HCI'") and 'HCI' not in current_codes else 0
        indices_total = indices_current + historical_hci
        return {
            'status': 'ok',
            'countries': row(conn, 'SELECT COUNT(*) AS n FROM countries')['n'],
            'indices': indices_current,
            'indices_current': indices_current,
            'indices_total_including_historical_editions': indices_total,
            'scores': row(conn, 'SELECT COUNT(*) AS n FROM index_scores')['n'],
            'components': row(conn, 'SELECT COUNT(*) AS n FROM component_values')['n'],
            'raw_snapshots': row(conn, 'SELECT COUNT(*) AS n FROM raw_snapshots')['n'],
            'years': available_years(conn),
            'default_year': default_year(conn),
        }


@app.get('/api/landing-summary')
def landing_summary(country: str = Query('RUS', min_length=3, max_length=3)):
    with get_conn() as conn:
        return landing_summary_payload(conn, country.upper())


@app.get('/api/app-data')
def app_data(year: int | None = None, country: str = 'RUS'):
    country = country.upper()
    token = db_cache_token()
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
    return cached_app_data(country, requested_year, token)


@app.get('/api/i18n/catalog')
def i18n_catalog(lang: str = Query('ru', pattern='^(ru|en)$')):
    with get_conn() as conn:
        translations = {r['key']: r['value'] for r in rows(conn, 'SELECT key, value FROM ui_translations WHERE lang=?', (lang,))}
        labels = {
            r['code']: (r['short_name_ru'] if lang == 'ru' else r['short_name_en'])
            for r in current_index_rows(conn)
        }
        return {'lang': lang, 'translations': translations, 'index_labels': labels}


@app.get('/api/countries')
def countries():
    with get_conn() as conn:
        return rows(conn, 'SELECT * FROM countries ORDER BY name_en')


@app.get('/api/indices')
def indices():
    with get_conn() as conn:
        return current_index_rows(conn)


@app.get('/api/country/{iso3}')
def country(iso3: str, year: int | None = None):
    with get_conn() as conn:
        return country_payload(conn, iso3, requested_or_default(conn, year))


@app.get('/api/country/{iso3}/profile')
def country_profile(iso3: str, year: int | None = None):
    with get_conn() as conn:
        return country_payload(conn, iso3, requested_or_default(conn, year))


@app.get('/api/index/{code}')
def index(code: str, year: int | None = None, country: str = 'RUS'):
    with get_conn() as conn:
        return index_payload(conn, code, requested_or_default(conn, year), country)


@app.get('/api/index/{code}/ranking')
def index_ranking(code: str, year: int | None = None):
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        payload = index_payload(conn, code, requested_year)
        return {'index': payload['index'], 'requested_year': requested_year, 'year': requested_year, 'value_year': payload['value_year'], 'ranking': payload['ranking']}


@app.get('/api/index/{code}/components')
def index_components(code: str, iso3: str | None = None, year: int | None = None):
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        if iso3:
            value_year = effective_index_year(conn, code.upper(), requested_year, iso3.upper())
            if value_year is None:
                return []
            return rows(conn, '''SELECT cv.*, c.name_ru, c.name_en, c.weight, sr.source_name
                FROM component_values cv
                JOIN components c ON c.index_code=cv.index_code AND c.component_code=cv.component_code
                JOIN source_registry sr ON sr.source_id=cv.source_id
                WHERE cv.index_code=? AND cv.iso3=? AND cv.year=?
                ORDER BY cv.priority_score DESC''', (code.upper(), iso3.upper(), value_year))
        return rows(conn, 'SELECT * FROM components WHERE index_code=? ORDER BY weight DESC', (code.upper(),))


@app.get('/api/index/{code}/formula')
def index_formula(code: str):
    with get_conn() as conn:
        formula = row(conn, 'SELECT * FROM index_formulas WHERE index_code=? ORDER BY formula_version DESC LIMIT 1', (code.upper(),))
        if not formula:
            raise HTTPException(404, f'No formula for index {code}')
        return formula


@app.get('/api/diagnostics/{iso3}/{code}')
def diagnostics(iso3: str, code: str, year: int | None = None):
    with get_conn() as conn:
        return diagnostics_payload(conn, iso3, code, requested_or_default(conn, year))


@app.get('/api/diagnostics/{iso3}')
def diagnostics_all(iso3: str, year: int | None = None):
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        out = []
        for idx in current_index_rows(conn):
            value_year = effective_index_year(conn, idx['code'], requested_year, iso3.upper())
            if value_year is None:
                continue
            out.extend(rows(conn, '''SELECT d.*, c.name_ru AS component_name_ru, c.name_en AS component_name_en
                FROM diagnostics d LEFT JOIN components c ON c.index_code=d.index_code AND c.component_code=d.component_code
                WHERE d.iso3=? AND d.index_code=? AND d.year=?''', (iso3.upper(), idx['code'], value_year)))
        return sorted(out, key=lambda item: item['priority_score'], reverse=True)


@app.get('/api/sources')
def sources():
    with get_conn() as conn:
        return rows(conn, 'SELECT * FROM source_registry ORDER BY source_code')


@app.get('/api/source-registry')
def source_registry():
    with get_conn() as conn:
        return rows(conn, 'SELECT * FROM source_registry ORDER BY source_id')



@app.get('/api/country/{iso3}/command-center')
def command_center(iso3: str, year: int | None = None, lang: str = Query('ru', pattern='^(ru|en)$')):
    with get_conn() as conn:
        return country_command_center_payload(conn, iso3, requested_or_default(conn, year))


@app.get('/api/country/{iso3}/workspace')
def country_workspace(iso3: str, year: int | None = None):
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        try:
            return country_workspace_payload(conn, iso3, requested_year)
        except KeyError as exc:
            raise HTTPException(404, str(exc)) from exc


@app.get('/api/comparison/workspace')
def comparison_workspace(
    year: int | None = None,
    group: str = 'G20',
    region: str | None = None,
    income_group: str | None = None,
    q: str | None = None,
    selected: str | None = None,
    scatter_x: str = 'HTEI',
    scatter_y: str = 'GII',
    trend_index: str = 'HTEI',
    htei_mode: str = Query('proxy_extended', pattern='^(proxy_extended|common_support|direct_core)$'),
):
    with get_conn() as conn:
        return comparison_workspace_payload(
            conn,
            requested_or_default(conn, year),
            group=group,
            region=region,
            income_group=income_group,
            q=q,
            selected=selected,
            scatter_x=scatter_x,
            scatter_y=scatter_y,
            trend_index=trend_index,
            htei_mode=htei_mode,
        )


@app.get('/api/comparison/workspace.csv', response_class=PlainTextResponse)
def comparison_workspace_export(
    year: int | None = None,
    group: str = 'G20',
    region: str | None = None,
    income_group: str | None = None,
    q: str | None = None,
    selected: str | None = None,
    scatter_x: str = 'HTEI',
    scatter_y: str = 'GII',
    trend_index: str = 'HTEI',
    htei_mode: str = Query('proxy_extended', pattern='^(proxy_extended|common_support|direct_core)$'),
    lang: str = Query('ru', pattern='^(ru|en)$'),
):
    with get_conn() as conn:
        payload = comparison_workspace_payload(
            conn,
            requested_or_default(conn, year),
            group=group,
            region=region,
            income_group=income_group,
            q=q,
            selected=selected,
            scatter_x=scatter_x,
            scatter_y=scatter_y,
            trend_index=trend_index,
            htei_mode=htei_mode,
        )
    filename = f"gir-country-comparison-{payload['requested_year']}.csv"
    return PlainTextResponse(
        comparison_workspace_csv(payload, lang),
        media_type='text/csv; charset=utf-8',
        headers={'Content-Disposition': f'attachment; filename="{filename}"'},
    )



@app.get('/api/cross-matrix')
def cross_matrix(
    year: int | None = None,
    region: str | None = None,
    income_group: str | None = None,
    q: str | None = None,
    group: str | None = None,
    metric: str = Query('rank', pattern='^(rank|score|rank_delta_1y|rank_delta_5y|data_quality)$'),
    topN: int | None = None,
    sort_index: str = 'HTEI',
    sort_metric: str | None = Query(None, pattern='^(rank|score|rank_delta_1y|rank_delta_5y|data_quality)$'),
    sort_dir: str | None = Query(None, pattern='^(asc|desc)$'),
    lang: str = Query('ru', pattern='^(ru|en)$'),
):
    with get_conn() as conn:
        return cross_index_matrix_payload(
            conn,
            requested_or_default(conn, year),
            region=region,
            income_group=income_group,
            q=q,
            group=group,
            metric=metric,
            top_n=topN,
            sort_index=sort_index,
            sort_metric=sort_metric,
            sort_dir=sort_dir,
        )


@app.get('/api/cross-matrix.csv', response_class=PlainTextResponse)
def cross_matrix_csv(
    year: int | None = None,
    region: str | None = None,
    income_group: str | None = None,
    q: str | None = None,
    group: str | None = None,
    metric: str = Query('rank', pattern='^(rank|score|rank_delta_1y|rank_delta_5y|data_quality)$'),
    topN: int | None = None,
    sort_index: str = 'HTEI',
    sort_metric: str | None = Query(None, pattern='^(rank|score|rank_delta_1y|rank_delta_5y|data_quality)$'),
    sort_dir: str | None = Query(None, pattern='^(asc|desc)$'),
):
    with get_conn() as conn:
        payload = cross_index_matrix_payload(
            conn,
            requested_or_default(conn, year),
            region=region,
            income_group=income_group,
            q=q,
            group=group,
            metric=metric,
            top_n=topN,
            sort_index=sort_index,
            sort_metric=sort_metric,
            sort_dir=sort_dir,
        )
    codes = INDEX_ORDER
    lines = [','.join(['iso3', 'country_en', 'country_ru', *codes])]
    for c in payload['countries']:
        cells = [c['iso3'], c['name_en'].replace(',', ' '), c['name_ru'].replace(',', ' ')]
        for code in codes:
            v = c['indices'].get(code)
            cells.append('' if not v or v.get('metric_value') is None else str(v.get('metric_value')))
        lines.append(','.join(cells))
    return '\n'.join(lines)


@app.get('/api/index/{code}/explainer')
def index_explainer(
    code: str,
    year: int | None = None,
    country: str = 'RUS',
    iso3: str | None = None,
    mode: str = 'asof',
    lang: str = Query('ru', pattern='^(ru|en)$'),
):
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        selected_country = (iso3 or country or 'RUS').upper()
        if code.upper() == 'HTEI':
            return htei_mode_payload(conn, requested_year, selected_country, mode)
        return index_explainer_payload(conn, code, requested_year, selected_country)


@app.get('/api/qs/{iso3}')
def qs_country(iso3: str, year: int | None = None, lang: str = Query('ru', pattern='^(ru|en)$')):
    with get_conn() as conn:
        payload = qs_country_payload(conn, iso3, requested_or_default(conn, year))
        payload['summary'] = qs_summary_payload(conn, iso3, requested_or_default(conn, year))
        return payload


@app.get('/api/htei/model')
def htei_model(iso3: str = 'RUS', year: int | None = None):
    with get_conn() as conn:
        return htei_model_payload(conn, iso3, requested_or_default(conn, year))


@app.get('/api/training-competitiveness')
def training_competitiveness(country: str = 'RUS', year: int | None = None):
    with get_conn() as conn:
        return training_competitiveness_payload(conn, country, requested_or_default(conn, year))


@app.get('/api/training-competitiveness/ranking')
def training_competitiveness_ranking(year: int | None = None):
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        value_year = effective_training_year(conn, requested_year)
        ranking = rows(conn, '''SELECT t.*, c.name_ru, c.name_en, c.iso2, c.flag, c.region
            FROM training_model_scores t JOIN countries c ON c.iso3=t.iso3
            WHERE t.year=? ORDER BY t.rank ASC''', (value_year,)) if value_year else []
        return {'requested_year': requested_year, 'value_year': value_year, 'ranking': ranking, 'formula_version': 'training-system-competitiveness-v1'}


@app.get('/api/data-quality')
def data_quality(year: int | None = None):
    with get_conn() as conn:
        return data_quality_payload(conn, requested_or_default(conn, year))


@app.get('/api/acceptance/tz')
def acceptance_tz(lang: str = Query('ru', pattern='^(ru|en)$')):
    with get_conn() as conn:
        return acceptance_payload(conn, lang)


@app.get('/api/release/readiness')
def release_readiness():
    with get_conn() as conn:
        return release_readiness_payload(conn)


@app.get('/api/htei/workspace')
def htei_workspace(
    iso3: str = Query('RUS', min_length=3, max_length=3),
    year: int | None = None,
    mode: str = Query('common_support'),
):
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        try:
            return htei_workspace_payload(conn, iso3.upper(), requested_year, mode)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get('/api/htei/workspace.csv', response_class=PlainTextResponse)
def htei_workspace_export(mode: str = Query('common_support', pattern='^(direct_core|common_support|proxy_extended)$')):
    with get_conn() as conn:
        try:
            content = htei_workspace_csv(conn, mode)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
    return PlainTextResponse(
        content,
        media_type='text/csv; charset=utf-8',
        headers={'Content-Disposition': f'attachment; filename="htei-{mode}-{SCIENTIFIC_RELEASE_YEAR}.csv"'},
    )


@app.get('/api/training/workspace')
def training_workspace(country: str = 'RUS', year: int | None = None):
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        try:
            return training_workspace_payload(conn, country, requested_year)
        except KeyError as exc:
            raise HTTPException(404, f'Unknown country {country.upper()}') from exc


@app.get('/api/training/workspace/export.csv')
def training_workspace_export(
    country: str = 'RUS',
    year: int | None = None,
    lang: str = Query('ru', pattern='^(ru|en)$'),
):
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        try:
            payload = training_workspace_payload(conn, country, requested_year)
        except KeyError as exc:
            raise HTTPException(404, f'Unknown country {country.upper()}') from exc
    content = '﻿' + training_ranking_csv(payload, lang)
    filename = f'training-system-{country.upper()}-{payload.get("value_year") or requested_year}.csv'
    return Response(
        content=content,
        media_type='text/csv; charset=utf-8',
        headers={'Content-Disposition': f'attachment; filename="{filename}"'},
    )


@app.get('/api/policy/russia/workspace')
def policy_russia_workspace(year: int | None = None):
    with get_conn() as conn:
        return policy_center_payload(conn, requested_or_default(conn, year))


@app.get('/api/policy/russia/export.csv')
def policy_russia_export(
    year: int | None = None,
    lang: str = Query('ru', pattern='^(ru|en)$'),
):
    with get_conn() as conn:
        payload = policy_center_payload(conn, requested_or_default(conn, year))
    content = '﻿' + policy_items_csv(payload, lang)
    filename = f'russia-technology-workforce-policy-{payload["summary"]["start_year"]}-{payload["summary"]["end_year"]}.csv'
    return Response(
        content=content,
        media_type='text/csv; charset=utf-8',
        headers={'Content-Disposition': f'attachment; filename="{filename}"'},
    )


@app.get('/api/provenance/value/{value_id:path}')
def provenance_value(value_id: str):
    with get_conn() as conn:
        value = row(conn, """SELECT s.*, sr.source_name, sr.owner, sr.license_or_terms
            FROM index_scores s JOIN source_registry sr ON sr.source_id=s.source_id WHERE s.value_id=?""", (value_id,))
        if not value:
            value = row(conn, """SELECT cv.*, sr.source_name, sr.owner, sr.license_or_terms
                FROM component_values cv JOIN source_registry sr ON sr.source_id=cv.source_id WHERE cv.value_id=?""", (value_id,))
        if not value:
            training_score = row(conn, "SELECT * FROM training_model_scores WHERE value_id=?", (value_id,))
            if training_score:
                component_rows = rows(conn, """SELECT tm.value_id,tm.source_value_id,tm.source_id,tm.source_data_year,
                    cv.retrieved_at,cv.raw_snapshot_path,cv.raw_snapshot_sha256
                    FROM training_model_components tm
                    LEFT JOIN component_values cv ON cv.value_id=tm.source_value_id
                    WHERE tm.model_value_id=? ORDER BY tm.block_code,tm.component_ref""", (value_id,))
                source_groups = json.loads(training_score.get('source_group_coverage') or '[]')
                snapshots = sorted({item.get('raw_snapshot_path') for item in component_rows if item.get('raw_snapshot_path')})
                retrieved = max((item.get('retrieved_at') or '' for item in component_rows), default='') or None
                return {
                    'value_id': training_score['value_id'],
                    'source_id': 'TRAINING_SYSTEM_MODEL',
                    'source_name': 'Four-block training-system competitiveness model',
                    'source_owner': 'MGIMO / FNISC RAS project team',
                    'source_url': 'local:docs/TRAINING_MODEL_METHODOLOGY_V2.md',
                    'retrieved_at': retrieved,
                    'release_year': training_score['year'],
                    'source_data_year': training_score['year'],
                    'raw_snapshot_path': '; '.join(snapshots),
                    'raw_snapshot_sha256': None,
                    'transform_id': 'build_training_system_competitiveness_v2',
                    'transformation_run_id': f"training-system:{training_score['year']}",
                    'formula_version': training_score['formula_version'],
                    'quality_flag': training_score['quality_flag'],
                    'is_official': False,
                    'is_recomputed': True,
                    'source_group_coverage': source_groups,
                    'component_value_ids': [item['value_id'] for item in component_rows],
                    'available_block_weight': training_score['available_block_weight'],
                    'data_quality': training_score['data_quality'],
                }
        if not value:
            value = row(conn, """SELECT tm.*, sr.source_name, sr.owner, sr.license_or_terms, cv.source_url,
                    cv.retrieved_at, cv.release_year, cv.raw_snapshot_path, cv.raw_snapshot_sha256,
                    cv.transform_id, cv.transformation_run_id, cv.formula_version
                FROM training_model_components tm
                LEFT JOIN component_values cv ON cv.value_id=tm.source_value_id
                LEFT JOIN source_registry sr ON sr.source_id=tm.source_id
                WHERE tm.value_id=?""", (value_id,))
        if not value and _table_exists(conn, 'htei_v6_profiles'):
            v6_provenance = htei_v6_provenance(conn, value_id)
            if v6_provenance:
                return v6_provenance
        if not value:
            profile_v6 = row(conn, "SELECT * FROM htei_v6_profiles WHERE profile_id=?", (value_id,)) if _table_exists(conn, "htei_v6_profiles") else None
            if profile_v6:
                components = rows(
                    conn,
                    """SELECT value_id,source_id,source_group,retrieved_at,raw_snapshot_path,raw_snapshot_sha256
                       FROM htei_v6_component_values WHERE profile_id=? ORDER BY component_code""",
                    (value_id,),
                )
                source_ids = sorted({item.get('source_id') for item in components if item.get('source_id')})
                source_groups = sorted({item.get('source_group') for item in components if item.get('source_group')})
                snapshots = sorted({item.get('raw_snapshot_path') for item in components if item.get('raw_snapshot_path')})
                retrieved_at = max((item.get('retrieved_at') or '' for item in components), default='') or None
                try:
                    provenance = json.loads(profile_v6.get('provenance_json') or '{}')
                except Exception:
                    provenance = {}
                return {
                    'value_id': profile_v6['profile_id'],
                    'source_id': 'HTEI_FINAL_V6',
                    'source_name': 'HTEI final comparison methodology v6',
                    'source_owner': 'MGIMO / FNISC RAS project team',
                    'source_url': 'local:docs/HTEI_METHODOLOGY_V6.md',
                    'license_or_terms': 'Project research methodology and registered source snapshots',
                    'retrieved_at': retrieved_at,
                    'release_year': profile_v6['release_year'],
                    'source_data_year': profile_v6.get('newest_source_year'),
                    'raw_snapshot_path': '; '.join(snapshots),
                    'raw_snapshot_sha256': None,
                    'transform_id': 'build_htei_final_v6',
                    'transformation_run_id': f"htei-v6:{profile_v6['mode']}:{profile_v6['release_year']}",
                    'formula_version': profile_v6.get('formula_version'),
                    'quality_flag': profile_v6.get('coverage_class'),
                    'is_official': False,
                    'is_recomputed': True,
                    'source_group': ', '.join(source_groups),
                    'source_group_coverage': source_groups,
                    'source_ids': source_ids,
                    'available_weight': profile_v6.get('available_weight'),
                    'mode': profile_v6.get('mode'),
                    'confidence_score': profile_v6.get('confidence_score'),
                    'oldest_source_year': profile_v6.get('oldest_source_year'),
                    'newest_source_year': profile_v6.get('newest_source_year'),
                    'component_value_ids': [item['value_id'] for item in components],
                    'provenance': provenance,
                }
            if _table_exists(conn, "htei_v6_component_values"):
                value = row(
                    conn,
                    """SELECT cv.*, p.formula_version, p.confidence_score,
                              sr.source_name, sr.owner, sr.license_or_terms
                       FROM htei_v6_component_values cv
                       LEFT JOIN htei_v6_profiles p ON p.profile_id=cv.profile_id
                       LEFT JOIN source_registry sr ON sr.source_id=cv.source_id
                       WHERE cv.value_id=?""",
                    (value_id,),
                )
        if not value:
            profile = row(conn, "SELECT * FROM htei_v5_profiles WHERE profile_id=?", (value_id,))
            if profile:
                prov = json.loads(profile.get('provenance_json') or '{}')
                snap = row(conn, "SELECT * FROM raw_snapshots WHERE snapshot_id=?", (prov.get('snapshot_id'),)) if prov.get('snapshot_id') else None
                return {
                    'value_id': profile['profile_id'], 'source_id': 'HTEI_SCIENTIFIC_V5',
                    'source_name': 'HTEI scientific methodology v5',
                    'source_owner': 'MGIMO / FNISC RAS project team',
                    'source_url': 'local:docs/HTEI_METHODOLOGY_V5.md',
                    'retrieved_at': (snap or {}).get('retrieved_at'), 'release_year': profile['release_year'],
                    'raw_snapshot_path': (snap or {}).get('raw_snapshot_path') or 'data/raw/HTEI_SCIENTIFIC_V5/2026/htei_scientific_v5_manifest.json',
                    'raw_snapshot_sha256': (snap or {}).get('raw_snapshot_sha256'), 'transform_id': 'build_htei_scientific_v5',
                    'transformation_run_id': 'htei-v5-scientific:2026',
                    'formula_version': profile['formula_version'], 'quality_flag': profile['coverage_class'],
                    'is_official': False, 'is_recomputed': True, 'mode': profile['mode'],
                    'confidence_score': profile['confidence_score'], 'provenance': prov,
                }
            value = row(conn, """SELECT c.*,sr.source_name,sr.owner,sr.license_or_terms
                FROM htei_v5_component_values c JOIN source_registry sr ON sr.source_id=c.source_id
                WHERE c.value_id=?""", (value_id,))
        if not value:
            raise HTTPException(404, f'Unknown value_id {value_id}')
        return value_provenance(value, value)



@app.post('/api/refresh/{source_code}')
def refresh(source_code: str):
    if source_code.upper() == 'QS_ET':
        return {
            'status': 'implemented_official_web_endpoint',
            'source_id': 'QS_ET',
            'message': 'QS Engineering & Technology is refreshed by the production data builder through archived TopUniversities public endpoint snapshots.',
        }
    return {
        'status': 'cli_only',
        'source_id': source_code.upper(),
        'message': 'Refresh is performed by the production data builder so raw snapshots are archived before database replacement.',
    }


@app.get('/api/export/country/{iso3}/brief')
def country_brief(
    iso3: str,
    lang: str = Query('ru', pattern='^(ru|en)$'),
    year: int | None = None,
    format: str = Query('json', pattern='^(json|txt)$'),
):
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        payload = country_payload(conn, iso3, requested_year)
        workspace = country_workspace_payload(conn, iso3, requested_year)
        policy = workspace.get('policies') or structured_policy_recommendations(conn, iso3, requested_year)
    if format == 'json':
        return {
            'country': payload['country'],
            'requested_year': requested_year,
            'lang': lang,
            'indices': payload['indices'],
            'policy_brief': policy,
            'formula_version': 'policy-brief-v2-structured',
        }
    country_name = payload['country']['name_ru'] if lang == 'ru' else payload['country']['name_en']
    lines = [f"{country_name} / {requested_year}", "", "Policy brief / Управленческая справка"]
    for item in payload['indices']:
        label = item['short_name_ru'] if lang == 'ru' else item['short_name_en']
        if item['available']:
            lines.append(f"{label}: year {item['value_year']}, rank {item['rank']}, score {round(item['score'], 2)}, source {item['source_name']}")
        else:
            lines.append(f"{label}: not available")
    lines.append("")
    lines.append("Recommendations")
    for i, rec in enumerate(policy, start=1):
        def localised(base: str) -> str:
            return str(rec.get(f"{base}_{lang}") or rec.get(base) or rec.get(f"{base}_ru") or rec.get(f"{base}_en") or "")
        title = localised('title') or localised('problem')
        lines.extend([
            f"{i}. {title}",
            f"problem: {localised('problem')}",
            f"indicator: {localised('indicator')}",
            f"source: {rec.get('source') or rec.get('source_id') or ''}",
            f"benchmark: {localised('benchmark')}",
            f"measure: {localised('measure')}",
            f"actor: {localised('actor')}",
            f"horizon: {rec.get('horizon') or ''}",
            f"target_kpi: {localised('target_kpi')}",
            f"expected_effect: {localised('expected_effect')}",
            f"risk: {localised('risk')}",
            f"resources: {localised('resources')}",
            f"monitoring: {localised('monitoring')}",
            f"relation_to_tz: {rec.get('relation_to_tz') or ''}",
            f"evidence_value_id: {rec.get('evidence_value_id') or ''}",
            "",
        ])
    return PlainTextResponse('\n'.join(lines))



@app.get('/world.geojson')
def world_geojson():
    lite = STATIC_DIR / 'world_countries_lite.geojson'
    source = lite if lite.exists() else STATIC_DIR / 'world_countries.geojson'
    return FileResponse(
        source,
        media_type='application/geo+json',
        headers={
            'Cache-Control': 'public, max-age=86400',
            'X-GIR-Geometry': 'simplified-dashboard-derivative' if source == lite else 'source-geometry',
        },
    )

# ---------------------------------------------------------------------------
# Scientific-release v5 integration. The functions below intentionally
# override selected legacy helpers while preserving the current visual design
# and all existing public routes.
# ---------------------------------------------------------------------------
from .scientific_release import (
    RELEASE_YEAR as SCIENTIFIC_RELEASE_YEAR,
    FORMULA_VERSION as HTEI_V5_FORMULA_VERSION,
    apply_scientific_release,
    htei_profile_payload as scientific_htei_profile,
    htei_ranking_payload as scientific_htei_ranking,
    methodology_registry_payload,
    policy_brief_payload,
    scientific_audit_payload,
    COMPONENT_META as HTEI_V5_COMPONENT_META,
    HTEI_WEIGHTS,
)

_legacy_get_conn_v4 = get_conn
_legacy_country_payload_v4 = country_payload
_legacy_index_payload_v4 = index_payload
_legacy_index_explainer_payload_v4 = index_explainer_payload
_legacy_command_center_payload_v4 = country_command_center_payload
_legacy_data_quality_payload_v4 = data_quality_payload


def get_conn():  # type: ignore[override]
    conn = _legacy_get_conn_v4()
    try:
        scientific_count = row(conn, "SELECT COUNT(*) AS n FROM htei_v5_profiles WHERE release_year=?", (SCIENTIFIC_RELEASE_YEAR,))
    except Exception:
        scientific_count = None
    if not scientific_count or int(scientific_count.get("n") or 0) == 0:
        apply_scientific_release(conn, SCIENTIFIC_RELEASE_YEAR)
        cached_app_data.cache_clear()
    return conn


def _htei_v5_component_to_legacy(component: dict[str, Any]) -> dict[str, Any]:
    gap = max(0.0, 100.0 - float(component["normalized_score"]))
    actionability = {
        "HT_EMPLOYMENT_SHARE": 0.75,
        "HIGH_TECH_OCCUPATIONS": 0.80,
        "RND_PERSONNEL": 0.65,
        "STEM_PIPELINE": 0.85,
        "TECH_OUTPUTS": 0.55,
        "CORPORATE_STRATEGY_AND_DEMAND": 0.70,
    }.get(component["component_code"], 0.60)
    leverage = 1.0 + gap / 100.0
    return {
        **component,
        "year": component["release_year"],
        "weight": component["base_weight"],
        "source_note": component["interpretation_ru"],
        "gap_to_frontier": gap,
        "gap_to_peer_group": gap,
        "weighted_gap": gap * float(component["base_weight"]),
        "rank_leverage": leverage,
        "actionability": actionability,
        "priority_score": gap * float(component["effective_weight"]) * leverage * actionability,
        "is_official": 0,
        "is_recomputed": 1,
        "formula_version": HTEI_V5_FORMULA_VERSION,
    }


def _htei_v5_score_to_legacy(profile: dict[str, Any]) -> dict[str, Any]:
    return {
        "value_id": profile["profile_id"],
        "index_code": "HTEI",
        "iso3": profile["iso3"],
        "year": profile["release_year"],
        "source_data_year": profile["newest_source_year"],
        "score": profile["substantive_score"],
        "rank": profile.get("rank"),
        "percentile": profile.get("percentile"),
        "rank_delta_1y": None,
        "rank_delta_5y": None,
        "data_quality": profile["confidence_score"],
        "source_type": "project_composite_scientific_v5",
        "source_id": "HTEI_SCIENTIFIC_V5",
        "source_name": "HTEI scientific methodology v5",
        "source_url": "local:docs/HTEI_METHODOLOGY_V5.md",
        "retrieved_at": None,
        "release_year": profile["release_year"],
        "raw_snapshot_path": "data/raw/HTEI_SCIENTIFIC_V5/2026/htei_scientific_v5_manifest.json",
        "raw_snapshot_sha256": None,
        "transform_id": "build_htei_scientific_v5",
        "formula_version": profile["formula_version"],
        "quality_flag": profile["coverage_class"],
        "is_official": 0,
        "is_recomputed": 1,
        "ranking_mode": profile["mode"],
        "confidence_score": profile["confidence_score"],
        "coverage_class": profile["coverage_class"],
        "freshness_class": profile["freshness_class"],
        "score_low": profile.get("score_low"),
        "score_high": profile.get("score_high"),
        "rank_low": profile.get("rank_low"),
        "rank_high": profile.get("rank_high"),
        "available_components": profile["available_components"],
        "available_weight": profile["available_weight"],
        "source_group_count": profile["source_group_count"],
        "oldest_source_year": profile["oldest_source_year"],
        "newest_source_year": profile["newest_source_year"],
        "average_lag": profile["average_lag"],
    }


def htei_mode_payload(conn, year: int, iso3: str = "RUS", mode: str = "comparable_core") -> dict[str, Any]:  # type: ignore[override]
    requested_mode = (mode or "comparable_core").lower()
    aliases = {
        "strict": "comparable_core",
        "core": "comparable_core",
        "asof": "comparable_core",  # legacy app-data call now resolves to the primary scientific ranking
        "extended": "comparable_extended",
        "diagnostic": "asof_diagnostic",
    }
    scientific_mode = aliases.get(requested_mode, requested_mode)
    if scientific_mode not in {"comparable_core", "comparable_extended", "asof_diagnostic"}:
        scientific_mode = "comparable_core"
    country_data = scientific_htei_profile(conn, iso3, SCIENTIFIC_RELEASE_YEAR, scientific_mode)
    effective_mode = (country_data.get("profile") or {}).get("mode", scientific_mode)
    if scientific_mode == "asof_diagnostic":
        ranking_rows = rows(
            conn,
            """SELECT p.*,c.name_ru,c.name_en,c.iso2,c.flag,c.region,c.income_group
               FROM htei_v5_profiles p JOIN countries c ON c.iso3=p.iso3
               WHERE p.release_year=? AND p.mode='asof_diagnostic'
               ORDER BY p.substantive_score DESC,c.name_en""",
            (SCIENTIFIC_RELEASE_YEAR,),
        )
    else:
        ranking_rows = scientific_htei_ranking(conn, SCIENTIFIC_RELEASE_YEAR, scientific_mode, limit=250)["ranking"]
    ranking = []
    for r in ranking_rows:
        score = _htei_v5_score_to_legacy(r)
        ranking.append({**r, **score, "value_year": SCIENTIFIC_RELEASE_YEAR, "asof_rank": r.get("rank")})
    profile = country_data.get("profile")
    scientific_components = [_htei_v5_component_to_legacy(c) for c in country_data.get("components", [])]
    score = _htei_v5_score_to_legacy(profile) if profile else None
    if score:
        score["provenance"] = {
            "value_id": score["value_id"],
            "source_id": "HTEI_SCIENTIFIC_V5",
            "source_name": "HTEI scientific methodology v5",
            "source_url": "local:docs/HTEI_METHODOLOGY_V5.md",
            "formula_version": HTEI_V5_FORMULA_VERSION,
            "quality_flag": score["quality_flag"],
            "is_official": False,
            "is_recomputed": True,
        }
    index_meta = row(conn, "SELECT * FROM indices WHERE code='HTEI'")
    method_status = row(conn, "SELECT * FROM index_methodology_registry WHERE index_code='HTEI'")
    if index_meta and method_status:
        index_meta = {**index_meta, **method_status}
    components_meta = []
    for code, meta in HTEI_V5_COMPONENT_META.items():
        components_meta.append({
            "index_code": "HTEI",
            "component_code": code,
            "name_ru": meta["name_ru"],
            "name_en": meta["name_en"],
            "weight": HTEI_WEIGHTS.get(code, 0),
            "source_note": meta["interpretation_ru"],
            "proxy_status": meta["proxy_status"],
        })
    formula = row(conn, "SELECT * FROM index_formulas WHERE index_code='HTEI' AND formula_version=?", (HTEI_V5_FORMULA_VERSION,))
    component_tree = []
    for meta in components_meta:
        top = rows(
            conn,
            """SELECT c.*,co.name_ru AS country_name_ru,co.name_en AS country_name_en,co.flag
               FROM htei_v5_component_values c JOIN htei_v5_profiles p ON p.profile_id=c.profile_id
               JOIN countries co ON co.iso3=c.iso3
               WHERE c.release_year=? AND c.mode='comparable_core' AND c.component_code=?
               ORDER BY c.normalized_score DESC LIMIT 10""",
            (SCIENTIFIC_RELEASE_YEAR, meta["component_code"]),
        )
        component_tree.append({**meta, "top_countries": top})
    historical_series = rows(conn, "SELECT iso3,year,score,rank FROM index_scores WHERE index_code='HTEI' ORDER BY iso3,year")
    if profile and profile.get("rank") is not None:
        historical_series.append({"iso3": iso3.upper(), "year": SCIENTIFIC_RELEASE_YEAR, "score": profile["substantive_score"], "rank": profile["rank"]})
    source_contribution = [
        {
            "component_code": c["component_code"],
            "source_id": c["source_id"],
            "source_name": c.get("source_id"),
            "source_role": "numeric_source",
            "source_data_year": c["source_data_year"],
            "normalized_score": c["normalized_score"],
            "weighted_contribution": c["weighted_contribution"],
            "value_id": c["value_id"],
            "proxy_status": c["proxy_status"],
        }
        for c in country_data.get("components", [])
    ]
    return {
        "index": index_meta,
        "requested_year": year,
        "year": year,
        "value_year": SCIENTIFIC_RELEASE_YEAR,
        "source_data_year": profile.get("newest_source_year") if profile else None,
        "year_lag": 0,
        "freshness": profile.get("freshness_class") if profile else "missing",
        "stale": bool(profile and profile.get("freshness_class") == "stale"),
        "mode": effective_mode,
        "requested_mode": scientific_mode,
        "ranking_mode": effective_mode.upper(),
        "formula_version_for_mode": HTEI_V5_FORMULA_VERSION,
        "ranking": ranking,
        "coverage_table": ranking,
        "excluded_countries": [],
        "components": components_meta,
        "formula": formula,
        "country_diagnostics": {"score": score, "components": scientific_components, "priority_component": scientific_components[0] if scientific_components else None, "requested_year": year, "value_year": SCIENTIFIC_RELEASE_YEAR},
        "series": historical_series,
        "rank_series_for_country": [s for s in historical_series if s.get("iso3") == iso3.upper()],
        "component_tree": component_tree,
        "source_contribution": source_contribution,
        "source_group_coverage": sorted({c["source_group"] for c in country_data.get("components", [])}),
        "scientific_profile": country_data,
        "scientific_audit": country_data.get("audit"),
        "methodology": method_status,
        "mode_options": ["comparable_core", "comparable_extended", "asof_diagnostic"],
        "optional_components": [
            {
                "component_code": "VACANCY_DEMAND",
                "status_ru": "показывается только как отдельный исследовательский слой после подключения юридически устойчивого сопоставимого источника; в score HTEI v5 не включается",
                "status_en": "shown only as a separate research layer after a legally stable comparable source is connected; excluded from HTEI v5 scoring",
                "included_in_score": False,
            }
        ],
    }


def index_payload(conn, code: str, year: int, country: str = "RUS") -> dict[str, Any]:  # type: ignore[override]
    if code.upper() == "HTEI":
        return htei_mode_payload(conn, year, country, "comparable_core")
    payload = _legacy_index_payload_v4(conn, code, year, country)
    methodology = row(conn, "SELECT * FROM index_methodology_registry WHERE index_code=?", (code.upper(),))
    if methodology:
        payload["methodology"] = methodology
        payload["index"] = {**payload["index"], **methodology}
    return payload


def index_explainer_payload(conn, code: str, year: int, iso3: str = "RUS") -> dict[str, Any]:  # type: ignore[override]
    if code.upper() == "HTEI":
        return htei_mode_payload(conn, year, iso3, "comparable_core")
    payload = _legacy_index_explainer_payload_v4(conn, code, year, iso3)
    methodology = row(conn, "SELECT * FROM index_methodology_registry WHERE index_code=?", (code.upper(),))
    if methodology:
        payload["methodology"] = methodology
        payload["index"] = {**payload["index"], **methodology}
    return payload


def country_payload(conn, iso3: str, year: int) -> dict[str, Any]:  # type: ignore[override]
    payload = _legacy_country_payload_v4(conn, iso3, year)
    scientific = scientific_htei_profile(conn, iso3, SCIENTIFIC_RELEASE_YEAR, "comparable_core")
    profile = scientific.get("profile")
    components = scientific.get("components", [])
    for card in payload["indices"]:
        methodology = row(conn, "SELECT * FROM index_methodology_registry WHERE index_code=?", (card["index_code"],))
        if methodology:
            card.update(methodology)
        if card["index_code"] != "HTEI" or not profile:
            continue
        legacy_score = _htei_v5_score_to_legacy(profile)
        card.update(legacy_score)
        card["available"] = True
        card["requested_year"] = year
        card["value_year"] = SCIENTIFIC_RELEASE_YEAR
        card["freshness"] = profile["freshness_class"]
        card["stale"] = profile["freshness_class"] == "stale"
        card["ranking_mode"] = profile["mode"]
        card["scientific_profile"] = profile
        converted = [_htei_v5_component_to_legacy(c) for c in components]
        card["weak_component"] = min(converted, key=lambda c: c["normalized_score"]) if converted else None
        card["strong_component"] = max(converted, key=lambda c: c["normalized_score"]) if converted else None
        card["trend"] = rows(conn, "SELECT year,score,rank FROM index_scores WHERE index_code='HTEI' AND iso3=? ORDER BY year", (iso3.upper(),))
        if profile.get("rank") is not None:
            card["trend"].append({"year": SCIENTIFIC_RELEASE_YEAR, "score": profile["substantive_score"], "rank": profile["rank"]})
        card["component_coverage"] = {
            "available_components": profile["available_components"],
            "required_components": len(HTEI_V5_COMPONENT_META),
            "available_weight": profile["available_weight"],
            "coverage_class": profile["coverage_class"],
            "freshness_class": profile["freshness_class"],
        }
    if iso3.upper() == "RUS":
        payload["policy_brief_v5"] = policy_brief_payload(conn, "RUS")
    return payload


def country_command_center_payload(conn, iso3: str, year: int) -> dict[str, Any]:  # type: ignore[override]
    base = _legacy_command_center_payload_v4(conn, iso3, year)
    # Legacy risk logic cannot use a missing ASOF rank; recompute robustly.
    risks = []
    for card in country_payload(conn, iso3, year)["indices"]:
        if not card.get("available") or card.get("rank") is None:
            continue
        if card["index_code"] == "HTEI":
            denominator = row(conn, "SELECT COUNT(*) AS n FROM htei_v5_profiles WHERE release_year=? AND mode=? AND eligible_for_ranking=1", (SCIENTIFIC_RELEASE_YEAR, card.get("ranking_mode") or "comparable_core"))["n"] or 1
        else:
            denominator = row(conn, "SELECT COUNT(*) AS n FROM index_scores WHERE index_code=? AND year=?", (card["index_code"], card["value_year"]))["n"] or 1
        risks.append({
            "index_code": card["index_code"], "rank": card["rank"], "score": card["score"], "value_year": card["value_year"],
            "data_quality": card.get("data_quality"), "risk_score": card["rank"] / denominator * 100.0,
            "weak_component": card.get("weak_component"), "trend": card.get("trend", []),
        })
    risks.sort(key=lambda x: x["risk_score"], reverse=True)
    base["risk_indices"] = risks[:3]
    if iso3.upper() == "RUS":
        policy = policy_brief_payload(conn, "RUS")["items"]
        base["policy_recommendations"] = policy[:3]
        base["policy_brief_v5"] = policy
    base["htei_scientific_profile"] = scientific_htei_profile(conn, iso3, SCIENTIFIC_RELEASE_YEAR, "comparable_core")
    base["tz_summary"] = {
        "ru": [
            "2.1 / 3.1.2 — Создание интегрированной базы данных по трудовым ресурсам в высокотехнологичных отраслях на основе агрегации данных международных организаций (МОТ, ОЭСР, Всемирный банк), национальных статистических служб, корпоративной отчетности и специализированных рейтингов (Global Talent Competitiveness Index, Human Capital Index и др.).",
            "2.2 / 3.2.1 — Формирование системы индикаторов для мониторинга развития технологических кадров, включая Индекс занятости в высокотехнологичных отраслях (High-tech employment index).",
            "2.3 / 3.3.1 — Разработка модели оценки конкурентоспособности национальных систем подготовки кадров для высокотехнологичных отраслей на основе анализа институциональной среды, образовательной инфраструктуры, корпоративных стратегий и международного сотрудничества.",
            "2.4 / 3.4.1 — Подготовка практических рекомендаций по формированию трудовых ресурсов в высокотехнологичных отраслях Российской Федерации.",
        ],
        "en": [
            "2.1 / 3.1.2 — integrated database on labour resources in high-technology industries",
            "2.2 / 3.2.1 — indicator system including the High-Tech Employment Index",
            "2.3 / 3.3.1 — model for assessing national training-system competitiveness",
            "2.4 / 3.4.1 — practical recommendations for high-technology workforce development in the Russian Federation",
        ],
    }
    return base


def data_quality_payload(conn, year: int) -> dict[str, Any]:  # type: ignore[override]
    payload = _legacy_data_quality_payload_v4(conn, year)
    payload["methodology_registry"] = methodology_registry_payload(conn)
    payload["scientific_audit"] = scientific_audit_payload(conn)
    payload["htei_v5_coverage"] = rows(conn, """SELECT mode,COUNT(*) AS profiles,AVG(confidence_score) AS avg_confidence,
        MIN(oldest_source_year) AS oldest,MAX(newest_source_year) AS newest
        FROM htei_v5_profiles WHERE release_year=? GROUP BY mode ORDER BY mode""", (SCIENTIFIC_RELEASE_YEAR,))
    return payload


@app.get('/api/methodology/summary')
def methodology_summary():
    with get_conn() as conn:
        return methodology_summary_payload(conn)


@app.get('/api/methodology/registry')
def methodology_registry():
    with get_conn() as conn:
        return methodology_registry_payload(conn)


@app.get('/api/htei/v5/profile/{iso3}')
def htei_v5_profile(iso3: str, mode: str = Query('comparable_core', pattern='^(comparable_core|comparable_extended|asof_diagnostic)$')):
    with get_conn() as conn:
        return scientific_htei_profile(conn, iso3, SCIENTIFIC_RELEASE_YEAR, mode)


@app.get('/api/htei/v5/ranking')
def htei_v5_ranking(
    mode: str = Query('comparable_core', pattern='^(comparable_core|comparable_extended)$'),
    limit: int = Query(50, ge=1, le=250),
    offset: int = Query(0, ge=0),
    q: str | None = None,
    region: str | None = None,
    income_group: str | None = None,
    sort: str = Query('rank', pattern='^(rank|score|confidence|freshness|country)$'),
    direction: str = Query('asc', pattern='^(asc|desc)$'),
):
    with get_conn() as conn:
        return scientific_htei_ranking(conn, SCIENTIFIC_RELEASE_YEAR, mode, limit, offset, q, region, income_group, sort, direction)


@app.get('/api/htei/v5/audit')
def htei_v5_audit():
    with get_conn() as conn:
        return scientific_audit_payload(conn)


@app.get('/api/policy/russia')
def russia_policy_brief():
    with get_conn() as conn:
        return policy_brief_payload(conn, 'RUS')


@app.get('/api/legal/licenses')
def legal_source_registry():
    with get_conn() as conn:
        return rows(conn, """SELECT lr.*,sr.source_name,sr.owner,sr.source_role,sr.latest_snapshot_id
            FROM license_registry lr JOIN source_registry sr ON sr.source_id=lr.source_id ORDER BY lr.source_id""")


@app.get('/api/operations/status')
def operations_status():
    with get_conn() as conn:
        return {
            'runs': rows(conn, "SELECT * FROM operational_runs ORDER BY started_at DESC LIMIT 100"),
            'latest_snapshots': rows(conn, """SELECT source_id,MAX(retrieved_at) AS retrieved_at,MAX(release_year) AS release_year
                FROM raw_snapshots GROUP BY source_id ORDER BY source_id"""),
        }

# Stable scientific-release aliases used by Codex integration and external clients.
@app.get('/api/htei/v5')
def htei_v5_root(
    iso3: str = Query('RUS', min_length=3, max_length=3),
    mode: str = Query('comparable_core', pattern='^(comparable_core|comparable_extended|asof_diagnostic)$'),
):
    with get_conn() as conn:
        return scientific_htei_profile(conn, iso3, SCIENTIFIC_RELEASE_YEAR, mode)


@app.get('/api/htei/v5/validation')
def htei_v5_validation():
    with get_conn() as conn:
        return scientific_audit_payload(conn)


@app.get('/api/index-methodology')
def index_methodology_alias():
    with get_conn() as conn:
        return methodology_registry_payload(conn)


@app.get('/api/index-methodology/{code}')
def index_methodology_by_code(code: str):
    with get_conn() as conn:
        item = row(conn, 'SELECT * FROM index_methodology_registry WHERE index_code=?', (code.upper(),))
        if not item:
            raise HTTPException(status_code=404, detail='Index methodology not found')
        return item


@app.get('/api/policy-brief/{iso3}')
def policy_brief_alias(iso3: str):
    with get_conn() as conn:
        payload = policy_brief_payload(conn, iso3.upper())
        if not payload.get('items'):
            raise HTTPException(status_code=404, detail='Policy brief not found')
        return payload


@app.get('/api/governance/licenses')
def governance_licenses_alias():
    return legal_source_registry()


@app.get('/api/governance/external-reviews')
def governance_external_reviews():
    with get_conn() as conn:
        return rows(conn, 'SELECT * FROM external_method_reviews ORDER BY review_date DESC, review_id')


# ---------------------------------------------------------------------------
# Final release v6 contracts: HCI+ as the primary human-capital edition and
# HTEI common-support/direct tiers. Historical HCI remains available only in
# the combined continuity chart and historical API metadata.
# ---------------------------------------------------------------------------

def _table_exists_final(conn, name: str) -> bool:
    return bool(row(conn, "SELECT 1 AS ok FROM sqlite_master WHERE type='table' AND name=?", (name,)))


def htei_v6_profile_payload(conn, iso3: str, mode: str = "common_support") -> dict[str, Any]:
    iso3 = iso3.upper()
    allowed = {"direct_core", "common_support", "proxy_extended", "asof_diagnostic"}
    if mode not in allowed:
        raise HTTPException(status_code=422, detail="Unknown HTEI v6 mode")
    if not _table_exists_final(conn, "htei_v6_profiles"):
        raise HTTPException(status_code=503, detail="HTEI v6 migration has not been applied")
    profile = row(conn, """SELECT p.*,c.name_ru,c.name_en,c.iso2,c.flag,c.region,c.income_group
        FROM htei_v6_profiles p JOIN countries c ON c.iso3=p.iso3
        WHERE p.iso3=? AND p.release_year=? AND p.mode=?""", (iso3, SCIENTIFIC_RELEASE_YEAR, mode))
    if not profile:
        return {"available": False, "iso3": iso3, "mode": mode, "release_year": SCIENTIFIC_RELEASE_YEAR,
                "reason_ru": "Профиль не отвечает требованиям выбранного методического уровня.",
                "reason_en": "The profile does not meet the selected methodological-tier requirements."}
    components = rows(conn, """SELECT * FROM htei_v6_component_values
        WHERE profile_id=? ORDER BY effective_weight DESC,component_code""", (profile["profile_id"],))
    payload = {
        "available": True,
        "profile": profile,
        "components": components,
        "mode": mode,
        "ranking_is_synchronous": mode != "asof_diagnostic",
        "index_status": "project_composite_index",
        "value_type_ru": "авторский составной показатель проекта",
        "value_type_en": "project composite index",
        "quality_is_separate_from_score": True,
        "methodology_version": "GIIP-final-release-v6",
        "formula": row(conn, "SELECT * FROM index_formulas WHERE index_code='HTEI' ORDER BY formula_version DESC LIMIT 1"),
        "missingness_audit": rows(conn, "SELECT * FROM htei_v6_missingness_audit WHERE release_year=? AND mode=?", (SCIENTIFIC_RELEASE_YEAR, mode)),
    }
    return payload


def htei_v6_ranking_payload(conn, mode: str, limit: int = 50, offset: int = 0, q: str | None = None,
                            region: str | None = None, income_group: str | None = None,
                            sort: str = "rank", direction: str = "asc") -> dict[str, Any]:
    if mode not in {"direct_core", "common_support", "proxy_extended"}:
        raise HTTPException(status_code=422, detail="ASOF diagnostic profiles are not ranked")
    clauses = ["p.release_year=?", "p.mode=?", "p.eligible_for_ranking=1"]
    params: list[Any] = [SCIENTIFIC_RELEASE_YEAR, mode]
    if q:
        clauses.append("(LOWER(c.name_ru) LIKE ? OR LOWER(c.name_en) LIKE ? OR LOWER(c.iso3) LIKE ?)")
        token = f"%{q.lower()}%"; params.extend([token, token, token])
    if region and region.lower() != "all": clauses.append("c.region=?"); params.append(region)
    if income_group and income_group.lower() != "all": clauses.append("c.income_group=?"); params.append(income_group)
    order_map = {"rank":"p.rank", "score":"p.substantive_score", "confidence":"p.confidence_score",
                 "freshness":"p.average_lag", "country":"c.name_en"}
    order = order_map.get(sort, "p.rank")
    direction_sql = "DESC" if direction.lower() == "desc" else "ASC"
    where = " AND ".join(clauses)
    total = row(conn, f"SELECT COUNT(*) AS n FROM htei_v6_profiles p JOIN countries c ON c.iso3=p.iso3 WHERE {where}", tuple(params))["n"]
    ranking = rows(conn, f"""SELECT p.*,c.name_ru,c.name_en,c.iso2,c.flag,c.region,c.income_group
        FROM htei_v6_profiles p JOIN countries c ON c.iso3=p.iso3 WHERE {where}
        ORDER BY {order} {direction_sql},c.name_en LIMIT ? OFFSET ?""", tuple(params + [limit, offset]))
    return {"mode": mode, "release_year": SCIENTIFIC_RELEASE_YEAR, "total": total, "limit": limit,
            "offset": offset, "has_more": offset + len(ranking) < total, "ranking": ranking}


def human_capital_combined_payload(conn, iso3: str) -> dict[str, Any]:
    iso3 = iso3.upper()
    historical = rows(conn, """SELECT year,source_data_year,score,rank,data_quality,source_url
        FROM index_scores WHERE index_code='HCI' AND iso3=? ORDER BY year""", (iso3,))
    combined: list[dict[str, Any]] = []
    for item in historical:
        # Existing HCI scores are displayed on a 0-100 scale; multiplying by 3.25
        # gives a common visual range only. It is explicitly not an official HCI+ conversion.
        combined.append({**item, "edition":"HCI", "display_score_325": round(float(item["score"])*3.25, 4),
                         "marker":"circle", "line_style":"dashed", "colour":"#2947A0",
                         "comparable_to_hci_plus": False})
    current = None
    if _table_exists_final(conn, "hci_plus_country_scores"):
        current = row(conn, "SELECT * FROM hci_plus_country_scores WHERE iso3=? AND year=2026", (iso3,))
    if current:
        combined.append({"year":2026, "source_data_year":2026, "score":current["score"], "rank":current["rank"],
                         "display_score_325":current["score"], "edition":"HCI_PLUS_2026", "marker":"diamond",
                         "line_style":"none", "colour":"#539D96", "comparable_to_hci_plus": True,
                         "health_score":current["health_score"], "education_score":current["education_score"],
                         "employment_score":current["employment_score"], "source_url":current["source_url"]})
    return {
        "iso3": iso3, "historical_hci": historical, "hci_plus": current, "display_series": combined,
        "primary_edition": "HCI+ 2026",
        "methodology_break": True,
        "methodological_break_year": 2026,
        "warning_ru": "HCI 2010–2020 и HCI+ 2026 являются разными официальными редакциями. Приведение HCI к общей визуальной шкале 0–325 не является официальным пересчётом: оно используется только для демонстрации ретроспективной динамики; HCI отмечен пунктиром и круглыми маркерами, HCI+ показан зелёным ромбом.",
        "warning_en": "HCI 2010–2020 and HCI+ 2026 are different official editions. Historical HCI is mapped to the common 0–325 visual range only for continuity and uses a dashed line with circle markers; HCI+ uses a green diamond.",
    }


# Keep references to v5 overrides, then expose the v6 final behavior.
_index_payload_scientific_v5 = index_payload
_index_explainer_scientific_v5 = index_explainer_payload
_country_payload_scientific_v5 = country_payload
_command_center_scientific_v5 = country_command_center_payload


def index_payload(conn, code: str, year: int, country: str = "RUS") -> dict[str, Any]:  # type: ignore[override]
    code = code.upper()
    if code == "HTEI" and _table_exists_final(conn, "htei_v6_profiles"):
        profile = htei_v6_profile_payload(conn, country, "common_support")
        ranking = htei_v6_ranking_payload(conn, "common_support", 250, 0)["ranking"]
        idx = row(conn, "SELECT * FROM indices WHERE code='HTEI'")
        return {"index": idx, "requested_year": year, "year": year, "value_year": SCIENTIFIC_RELEASE_YEAR,
                "ranking": ranking, "components": rows(conn,"SELECT * FROM components WHERE index_code='HTEI' ORDER BY weight DESC"),
                "formula": row(conn,"SELECT * FROM index_formulas WHERE index_code='HTEI' ORDER BY formula_version DESC LIMIT 1"),
                "country_diagnostics": profile, "series": rows(conn,"SELECT iso3,year,score,rank FROM index_scores WHERE index_code='HTEI' ORDER BY iso3,year"),
                "htei_v6": True, "ranking_mode": "common_support"}
    payload = _index_payload_scientific_v5(conn, code, year, country)
    if code == "HCI_PLUS":
        payload["human_capital_combined"] = human_capital_combined_payload(conn, country)
    return payload


def index_explainer_payload(conn, code: str, year: int, iso3: str = "RUS") -> dict[str, Any]:  # type: ignore[override]
    code = code.upper()
    payload = index_payload(conn, code, year, iso3)
    if code == "HCI_PLUS":
        payload["human_capital_combined"] = human_capital_combined_payload(conn, iso3)
    return payload


def country_payload(conn, iso3: str, year: int) -> dict[str, Any]:  # type: ignore[override]
    payload = _country_payload_scientific_v5(conn, iso3, year)
    # Historical HCI is retained for the combined graph, not as a second primary card.
    if any(card.get("index_code") == "HCI_PLUS" for card in payload.get("indices", [])):
        payload["indices"] = [card for card in payload["indices"] if card.get("index_code") != "HCI"]
    payload["human_capital_combined"] = human_capital_combined_payload(conn, iso3)
    if _table_exists_final(conn, "htei_v6_profiles"):
        selected = None
        for mode in ("direct_core", "common_support", "proxy_extended", "asof_diagnostic"):
            candidate = htei_v6_profile_payload(conn, iso3, mode)
            if candidate.get("available"):
                selected = candidate; break
        payload["htei_v6_profile"] = selected
        if selected:
            for card in payload.get("indices", []):
                if card.get("index_code") == "HTEI":
                    p = selected["profile"]
                    card.update({"score":p["substantive_score"], "rank":p["rank"], "percentile":p["percentile"],
                                 "data_quality":p["confidence_score"], "value_year":p["release_year"], "ranking_mode":p["mode"],
                                 "scientific_profile":p, "available":True})
    return payload


def country_command_center_payload(conn, iso3: str, year: int) -> dict[str, Any]:  # type: ignore[override]
    base = _command_center_scientific_v5(conn, iso3, year)
    final_country = country_payload(conn, iso3, year)
    base["country_profile"] = final_country
    base["human_capital_combined"] = final_country.get("human_capital_combined")
    base["htei_v6_profile"] = final_country.get("htei_v6_profile")
    return base


@app.get('/api/htei/v6')
def htei_v6_root(iso3: str = Query('RUS', min_length=3, max_length=3),
                 mode: str = Query('common_support', pattern='^(direct_core|common_support|proxy_extended|asof_diagnostic)$')):
    with get_conn() as conn:
        return htei_v6_profile_payload(conn, iso3, mode)


@app.get('/api/htei/v6/profile/{iso3}')
def htei_v6_profile_endpoint(iso3: str,
                 mode: str = Query('common_support', pattern='^(direct_core|common_support|proxy_extended|asof_diagnostic)$')):
    with get_conn() as conn:
        return htei_v6_profile_payload(conn, iso3, mode)


@app.get('/api/htei/v6/ranking')
def htei_v6_ranking_endpoint(
    mode: str = Query('common_support', pattern='^(direct_core|common_support|proxy_extended)$'),
    limit: int = Query(50, ge=1, le=250), offset: int = Query(0, ge=0), q: str | None = None,
    region: str | None = None, income_group: str | None = None,
    sort: str = Query('rank', pattern='^(rank|score|confidence|freshness|country)$'),
    direction: str = Query('asc', pattern='^(asc|desc)$')):
    with get_conn() as conn:
        return htei_v6_ranking_payload(conn, mode, limit, offset, q, region, income_group, sort, direction)


@app.get('/api/human-capital/combined/{iso3}')
def human_capital_combined_endpoint(iso3: str):
    with get_conn() as conn:
        return human_capital_combined_payload(conn, iso3)

# ---------------------------------------------------------------------------
# Final v6 payload compatibility layer for the current GIR frontend.
# ---------------------------------------------------------------------------

def _htei_v6_component_to_legacy(component: dict[str, Any]) -> dict[str, Any]:
    gap = max(0.0, 100.0 - float(component["normalized_score"]))
    actionability = {
        "HT_EMPLOYMENT_SHARE": 0.75,
        "HIGH_TECH_OCCUPATIONS": 0.80,
        "RND_PERSONNEL": 0.65,
        "STEM_PIPELINE": 0.85,
        "TECH_OUTPUTS": 0.55,
        "CORPORATE_STRATEGY_AND_DEMAND": 0.70,
    }.get(component["component_code"], 0.60)
    leverage = 1.0 + gap / 100.0
    return {
        **component,
        "year": component["release_year"],
        "weight": component["base_weight"],
        "source_note": component["interpretation_ru"],
        "gap_to_frontier": gap,
        "gap_to_peer_group": gap,
        "weighted_gap": gap * float(component["base_weight"]),
        "rank_leverage": leverage,
        "actionability": actionability,
        "priority_score": gap * float(component["effective_weight"]) * leverage * actionability,
        "is_official": 0,
        "is_recomputed": 1,
        "formula_version": component.get("formula_version") or "htei-v6",
    }


def _htei_v6_score_to_legacy(profile: dict[str, Any]) -> dict[str, Any]:
    return {
        "value_id": profile["profile_id"],
        "index_code": "HTEI",
        "iso3": profile["iso3"],
        "year": profile["release_year"],
        "source_data_year": profile["newest_source_year"],
        "score": profile["substantive_score"],
        "rank": profile.get("rank"),
        "percentile": profile.get("percentile"),
        "rank_delta_1y": None,
        "rank_delta_5y": None,
        "data_quality": profile["confidence_score"],
        "source_type": "project_composite_final_v6",
        "source_id": "HTEI_FINAL_V6",
        "source_name": "HTEI final comparison methodology v6",
        "source_url": "local:docs/HTEI_METHODOLOGY_V6.md",
        "retrieved_at": None,
        "release_year": profile["release_year"],
        "raw_snapshot_path": "data/raw/HTEI_FINAL_V6/2026/htei_final_v6_manifest.json",
        "raw_snapshot_sha256": None,
        "transform_id": "build_htei_v6",
        "formula_version": profile["formula_version"],
        "quality_flag": profile["coverage_class"],
        "is_official": 0,
        "is_recomputed": 1,
        "ranking_mode": profile["mode"],
        "confidence_score": profile["confidence_score"],
        "coverage_class": profile["coverage_class"],
        "freshness_class": profile["freshness_class"],
        "score_low": profile.get("score_low"),
        "score_high": profile.get("score_high"),
        "rank_low": profile.get("rank_low"),
        "rank_high": profile.get("rank_high"),
        "available_components": profile["available_components"],
        "available_weight": profile["available_weight"],
        "source_group_count": profile["source_group_count"],
        "oldest_source_year": profile["oldest_source_year"],
        "newest_source_year": profile["newest_source_year"],
        "average_lag": profile["average_lag"],
        "direct_data_tier": profile.get("direct_data_tier"),
        "component_signature": profile.get("component_signature"),
    }


def htei_v6_explainer_payload(conn, year: int, iso3: str = "RUS", mode: str = "common_support") -> dict[str, Any]:
    requested_mode = (mode or "common_support").lower()
    aliases = {
        "comparable_core": "common_support", "comparable_extended": "proxy_extended",
        "core": "common_support", "extended": "proxy_extended", "diagnostic": "asof_diagnostic",
    }
    requested_mode = aliases.get(requested_mode, requested_mode)
    allowed = ("direct_core", "common_support", "proxy_extended", "asof_diagnostic")
    if requested_mode not in allowed:
        requested_mode = "common_support"
    country_data = htei_v6_profile_payload(conn, iso3, requested_mode)
    fallback_mode = None
    if not country_data.get("available"):
        for candidate in ("common_support", "proxy_extended", "asof_diagnostic"):
            if candidate == requested_mode:
                continue
            test = htei_v6_profile_payload(conn, iso3, candidate)
            if test.get("available"):
                country_data = test
                fallback_mode = candidate
                break
    effective_mode = country_data.get("mode") or requested_mode
    if effective_mode == "asof_diagnostic":
        ranking_rows = rows(conn, """SELECT p.*,c.name_ru,c.name_en,c.iso2,c.flag,c.region,c.income_group
            FROM htei_v6_profiles p JOIN countries c ON c.iso3=p.iso3
            WHERE p.release_year=? AND p.mode='asof_diagnostic'
            ORDER BY p.substantive_score DESC,c.name_en""", (SCIENTIFIC_RELEASE_YEAR,))
    else:
        ranking_rows = htei_v6_ranking_payload(conn, effective_mode, 250, 0)["ranking"]
    ranking = [{**item, **_htei_v6_score_to_legacy(item), "value_year": SCIENTIFIC_RELEASE_YEAR} for item in ranking_rows]
    profile = country_data.get("profile")
    converted_components = [_htei_v6_component_to_legacy(item) for item in country_data.get("components", [])]
    score = _htei_v6_score_to_legacy(profile) if profile else None
    if score:
        score["provenance"] = {
            "value_id": score["value_id"], "source_id": "HTEI_FINAL_V6",
            "source_name": "HTEI final comparison methodology v6",
            "source_url": "local:docs/HTEI_METHODOLOGY_V6.md",
            "formula_version": score["formula_version"], "quality_flag": score["quality_flag"],
            "is_official": False, "is_recomputed": True,
        }
    index_meta = row(conn, "SELECT * FROM indices WHERE code='HTEI'")
    method_status = row(conn, "SELECT * FROM index_methodology_registry WHERE index_code='HTEI'")
    if index_meta and method_status:
        index_meta = {**index_meta, **method_status}
    components_meta = rows(conn, "SELECT * FROM components WHERE index_code='HTEI' ORDER BY weight DESC")
    formula = row(conn, "SELECT * FROM index_formulas WHERE index_code='HTEI' AND formula_version='htei-v6-common-support-2026'") or row(conn, "SELECT * FROM index_formulas WHERE index_code='HTEI' ORDER BY formula_version DESC LIMIT 1")
    tree = []
    for meta in components_meta:
        top = rows(conn, """SELECT v.*,c.name_ru AS country_name_ru,c.name_en AS country_name_en,c.flag
            FROM htei_v6_component_values v JOIN countries c ON c.iso3=v.iso3
            WHERE v.release_year=? AND v.mode=? AND v.component_code=?
            ORDER BY v.normalized_score DESC LIMIT 10""", (SCIENTIFIC_RELEASE_YEAR, effective_mode, meta["component_code"]))
        tree.append({**meta, "top_countries": top})
    mode_ru = {
        "direct_core": "Прямой слой: обе трудовые компоненты получены из прямой high-tech/HRST либо национальной статистики.",
        "common_support": "Основной сопоставимый рейтинг: один фиксированный набор четырёх компонентов для всех стран.",
        "proxy_extended": "Расширенное proxy-пространство: утверждённые компоненты при достаточном покрытии, с явной маркировкой прокси.",
        "asof_diagnostic": "Диагностический ASOF-профиль использует последние доступные официальные наблюдения и не получает место.",
    }
    mode_en = {
        "direct_core": "Direct-data tier: both labour components use direct high-tech/HRST or national-statistics series.",
        "common_support": "Primary comparable ranking: one fixed four-component set for every country.",
        "proxy_extended": "Extended proxy universe: approved components with sufficient coverage and explicit proxy labels.",
        "asof_diagnostic": "The ASOF diagnostic uses latest available official observations and receives no rank.",
    }
    scientific_profile = {
        **country_data,
        "fallback_mode": fallback_mode,
        "mode_explanation_ru": mode_ru.get(effective_mode, ""),
        "mode_explanation_en": mode_en.get(effective_mode, ""),
    }
    audit = row(conn, "SELECT * FROM methodology_audit_runs WHERE model_code='HTEI_V6' AND release_year=?", (SCIENTIFIC_RELEASE_YEAR,))
    if not audit:
        audit = row(conn, "SELECT * FROM methodology_audit_runs WHERE model_code='HTEI_V5' AND release_year=?", (SCIENTIFIC_RELEASE_YEAR,))
    return {
        "index": index_meta, "requested_year": year, "year": year, "value_year": SCIENTIFIC_RELEASE_YEAR,
        "mode": effective_mode, "ranking_mode": effective_mode.upper(), "ranking": ranking,
        "coverage_table": ranking, "excluded_countries": [], "components": components_meta, "formula": formula,
        "country_diagnostics": {"score": score, "components": converted_components,
            "priority_component": converted_components[0] if converted_components else None,
            "requested_year": year, "value_year": SCIENTIFIC_RELEASE_YEAR},
        "series": rows(conn, "SELECT iso3,year,score,rank FROM index_scores WHERE index_code='HTEI' ORDER BY iso3,year"),
        "component_tree": tree, "source_contribution": country_data.get("components", []),
        "source_group_coverage": sorted({item["source_group"] for item in country_data.get("components", [])}),
        "scientific_profile": scientific_profile, "scientific_audit": audit, "methodology": method_status,
        "mode_options": list(allowed), "htei_v6": True,
        "optional_components": [{"component_code": "VACANCY_DEMAND", "included_in_score": False,
            "status_ru": "публикуется только как отдельный исследовательский слой после подключения юридически устойчивого международно сопоставимого источника",
            "status_en": "published only as a separate research layer after a legally stable internationally comparable source is connected"}],
    }


# Replace the preliminary v6 overrides above with frontend-compatible final contracts.
def index_payload(conn, code: str, year: int, country: str = "RUS") -> dict[str, Any]:  # type: ignore[override]
    code = code.upper()
    if code == "HTEI" and _table_exists_final(conn, "htei_v6_profiles"):
        return htei_v6_explainer_payload(conn, year, country, "common_support")
    if code == "HCI_PLUS" and not row(conn, "SELECT code FROM indices WHERE code='HCI_PLUS'"):
        return {
            "index": {"code": "HCI_PLUS", "name_ru": "Индекс человеческого капитала плюс (HCI+)",
                      "short_name_ru": "HCI+", "name_en": "Human Capital Index Plus", "short_name_en": "HCI+",
                      "description_ru": "Актуальная редакция Всемирного банка 2026 года ожидает загрузки официальных страновых briefs.",
                      "description_en": "The current 2026 World Bank edition awaits ingestion of official country briefs.",
                      "authority": "World Bank", "is_tz_index": 0, "score_status": "official_hci_plus_2026_pending"},
            "requested_year": year, "year": year, "value_year": None, "ranking": [], "components": [], "formula": None,
            "country_diagnostics": {"score": None, "components": [], "available": False}, "series": [],
            "human_capital_combined": human_capital_combined_payload(conn, country),
        }
    payload = _index_payload_scientific_v5(conn, code, year, country)
    if code == "HCI_PLUS":
        payload["human_capital_combined"] = human_capital_combined_payload(conn, country)
    return payload


def index_explainer_payload(conn, code: str, year: int, iso3: str = "RUS") -> dict[str, Any]:  # type: ignore[override]
    code = code.upper()
    if code == "HTEI" and _table_exists_final(conn, "htei_v6_profiles"):
        return htei_v6_explainer_payload(conn, year, iso3, "common_support")
    payload = index_payload(conn, code, year, iso3)
    if code == "HCI_PLUS":
        payload["human_capital_combined"] = human_capital_combined_payload(conn, iso3)
    if code == "QS_ET":
        qs_payload = qs_country_payload(conn, iso3, year)
        payload["qs_institutions"] = qs_payload.get("institutions") or []
        payload["summary"] = qs_summary_payload(conn, iso3, year)
    return payload


def _hci_plus_country_card(conn, iso3: str, year: int) -> dict[str, Any]:
    meta = next((item for item in current_index_rows(conn) if item["code"] == "HCI_PLUS"), None)
    if not meta:
        return {"index_code": "HCI_PLUS", "code": "HCI_PLUS", "available": False}
    card = dict(meta)
    score = score_row_for(conn, "HCI_PLUS", year, iso3.upper())
    if score:
        card.update(score)
    value_year = score.get("year") if score else None
    components = rows(conn, """SELECT cv.*,c.name_ru,c.name_en,c.weight,c.source_note,sr.source_name,sr.license_or_terms
        FROM component_values cv JOIN components c ON c.index_code=cv.index_code AND c.component_code=cv.component_code
        JOIN source_registry sr ON sr.source_id=cv.source_id
        WHERE cv.iso3=? AND cv.index_code='HCI_PLUS' AND cv.year=? ORDER BY cv.normalized_score""",
        (iso3.upper(), value_year)) if value_year is not None else []
    methodology = row(conn, "SELECT * FROM index_methodology_registry WHERE index_code='HCI_PLUS'")
    if methodology:
        card.update(methodology)
    card.update({
        "index_code": "HCI_PLUS", "available": score is not None, "requested_year": year,
        "value_year": value_year, "trend": rows(conn, "SELECT year,score,rank FROM index_scores WHERE iso3=? AND index_code='HCI_PLUS' ORDER BY year", (iso3.upper(),)),
        "weak_component": min(components, key=lambda item: item.get("normalized_score") or 0) if components else None,
        "strong_component": max(components, key=lambda item: item.get("normalized_score") or 0) if components else None,
        "components": components,
        "pending_official_ingestion": score is None,
        "availability_reason_ru": None if score else "Официальные страновые briefs HCI+ 2026 ещё не загружены; исторический HCI доступен только на совмещённом графике.",
        "availability_reason_en": None if score else "Official HCI+ 2026 country briefs have not yet been ingested; historical HCI remains available only in the combined chart.",
    })
    if score:
        freshness_year = freshness_reference_year(score, value_year)
        card["year_lag"] = year_lag(freshness_year, year)
        card["freshness"] = freshness_label(freshness_year, year)
        card["stale"] = card["freshness"] == "stale"
        card["provenance"] = value_provenance(card, card)
    else:
        card.update({"score": None, "rank": None, "data_quality": None, "year_lag": None, "freshness": "pending", "stale": False, "provenance": None})
    return card


def country_payload(conn, iso3: str, year: int) -> dict[str, Any]:  # type: ignore[override]
    payload = _country_payload_scientific_v5(conn, iso3, year)
    # HCI is retained only as a historical series; HCI+ is the current country card.
    payload["indices"] = [card for card in payload.get("indices", []) if card.get("index_code") not in {"HCI", "HCI_PLUS"}]
    payload["indices"].append(_hci_plus_country_card(conn, iso3, year))
    order = {code: pos for pos, code in enumerate(INDEX_ORDER)}
    payload["indices"].sort(key=lambda card: order.get(card.get("index_code"), 999))
    payload["human_capital_combined"] = human_capital_combined_payload(conn, iso3)
    if _table_exists_final(conn, "htei_v6_profiles"):
        selected = None
        for mode in ("direct_core", "common_support", "proxy_extended", "asof_diagnostic"):
            candidate = htei_v6_profile_payload(conn, iso3, mode)
            if candidate.get("available"):
                selected = candidate
                break
        payload["htei_v6_profile"] = selected
        if selected:
            converted = [_htei_v6_component_to_legacy(c) for c in selected.get("components", [])]
            score = _htei_v6_score_to_legacy(selected["profile"])
            for card in payload.get("indices", []):
                if card.get("index_code") != "HTEI":
                    continue
                card.update(score)
                card.update({"available": True, "requested_year": year, "value_year": SCIENTIFIC_RELEASE_YEAR,
                             "scientific_profile": selected["profile"], "component_coverage": {
                                 "available_components": selected["profile"]["available_components"],
                                 "required_components": 6, "available_weight": selected["profile"]["available_weight"],
                                 "coverage_class": selected["profile"]["coverage_class"],
                                 "freshness_class": selected["profile"]["freshness_class"]}})
                card["weak_component"] = min(converted, key=lambda c: c["normalized_score"]) if converted else None
                card["strong_component"] = max(converted, key=lambda c: c["normalized_score"]) if converted else None
    return payload


def country_command_center_payload(conn, iso3: str, year: int) -> dict[str, Any]:  # type: ignore[override]
    base = _command_center_scientific_v5(conn, iso3, year)
    final_country = country_payload(conn, iso3, year)
    base["country_profile"] = final_country
    base["human_capital_combined"] = final_country.get("human_capital_combined")
    base["htei_v6_profile"] = final_country.get("htei_v6_profile")
    return base

# Generic explainer route resolves this final v6 implementation at request time.
def htei_mode_payload(conn, year: int, iso3: str = "RUS", mode: str = "common_support") -> dict[str, Any]:  # type: ignore[override]
    return htei_v6_explainer_payload(conn, year, iso3, mode)

# Data catalog and explorer routes are isolated in their own router.
from .data_lab import router as _data_lab_router
app.include_router(_data_lab_router)


@app.get('/api/platform-context')
def platform_context():
    with get_conn() as conn:
        return platform_context_payload(conn, current_index_rows(conn), requested_or_default(conn, None))


@app.get('/api/index/{code}/workspace')
def standard_index_workspace(
    code: str,
    year: int | None = None,
    country: str = 'RUS',
    iso3: str | None = None,
):
    code = code.upper()
    if code not in STANDARD_INDEX_CODES:
        raise HTTPException(404, f'No standard index workspace for {code}')
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        selected_country = (iso3 or country or 'RUS').upper()
        try:
            full = index_explainer_payload(conn, code, requested_year, selected_country)
            return standard_index_workspace_payload(full, selected_country, requested_year)
        except KeyError as exc:
            raise HTTPException(404, str(exc)) from exc


@app.get('/api/index/{code}/workspace.csv', response_class=PlainTextResponse)
def standard_index_workspace_export(
    code: str,
    year: int | None = None,
    country: str = 'RUS',
    iso3: str | None = None,
    lang: str = Query('ru', pattern='^(ru|en)$'),
):
    code = code.upper()
    if code not in STANDARD_INDEX_CODES:
        raise HTTPException(404, f'No standard index workspace for {code}')
    with get_conn() as conn:
        requested_year = requested_or_default(conn, year)
        selected_country = (iso3 or country or 'RUS').upper()
        full = index_explainer_payload(conn, code, requested_year, selected_country)
        payload = standard_index_workspace_payload(full, selected_country, requested_year)
    filename = f'gir-{code.lower()}-{payload["requested_year"]}.csv'
    return PlainTextResponse(
        index_workspace_csv(payload, lang),
        media_type='text/csv; charset=utf-8',
        headers={'Content-Disposition': f'attachment; filename="{filename}"'},
    )
