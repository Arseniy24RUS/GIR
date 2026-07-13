from __future__ import annotations

import json
import sqlite3
from collections import defaultdict
from statistics import mean
from typing import Any

from .db import row, rows

INDEX_ORDER = ["HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET", "HTEI"]

PEER_GROUPS: list[dict[str, Any]] = [
    {
        "code": "RUSSIA_CORE",
        "label_ru": "Технологические сопоставления",
        "label_en": "Technology peers",
        "description_ru": "Крупные технологические экономики и страны с сопоставимыми задачами развития человеческого капитала.",
        "description_en": "Major technology economies and countries facing comparable human-capital development challenges.",
        "iso3": ["RUS", "CHN", "IND", "DEU", "KOR", "SGP", "USA"],
    },
    {
        "code": "BRICS",
        "label_ru": "БРИКС",
        "label_en": "BRICS",
        "description_ru": "Сравнение с основными странами объединения БРИКС, для которых доступны сопоставимые международные данные.",
        "description_en": "Comparison with the principal BRICS members for which comparable international data are available.",
        "iso3": ["BRA", "RUS", "IND", "CHN", "ZAF"],
    },
    {
        "code": "G20",
        "label_ru": "G20",
        "label_en": "G20",
        "description_ru": "Крупнейшие развитые и развивающиеся экономики мира.",
        "description_en": "The world's major advanced and emerging economies.",
        "iso3": [
            "ARG", "AUS", "BRA", "CAN", "CHN", "FRA", "DEU", "IND", "IDN", "ITA",
            "JPN", "KOR", "MEX", "RUS", "SAU", "ZAF", "TUR", "GBR", "USA",
        ],
    },
    {
        "code": "OECD",
        "label_ru": "ОЭСР",
        "label_en": "OECD",
        "description_ru": "Экономики ОЭСР как ориентир институционального и технологического развития.",
        "description_en": "OECD economies as a benchmark for institutional and technological development.",
        "iso3": [
            "AUS", "AUT", "BEL", "CAN", "CHL", "COL", "CRI", "CZE", "DNK", "EST",
            "FIN", "FRA", "DEU", "GRC", "HUN", "ISL", "IRL", "ISR", "ITA", "JPN",
            "KOR", "LVA", "LTU", "LUX", "MEX", "NLD", "NZL", "NOR", "POL", "PRT",
            "SVK", "SVN", "ESP", "SWE", "CHE", "TUR", "GBR", "USA",
        ],
    },
]

INDEX_BADGES = {
    "HDI": ("ИЧР", "HDI"),
    "HCI_PLUS": ("HCI+", "HCI+"),
    "GTCI": ("GTCI", "GTCI"),
    "GII": ("GII", "GII"),
    "IDI": ("IDI", "IDI"),
    "QS_ET": ("QS E&T", "QS E&T"),
    "HTEI": ("HTEI", "HTEI"),
}

SCALES = {
    "HCI_PLUS": {"min": 0, "max": 325, "label_ru": "официальная шкала 0–325", "label_en": "official 0–325 scale"},
    "HDI": {"min": 0, "max": 100, "label_ru": "публичная шкала 0–100", "label_en": "public 0–100 scale"},
}

HTEI_MODE_LABELS = {
    "direct_core": ("Строгий слой прямых данных", "Strict direct-data layer"),
    "common_support": ("Основной международный рейтинг", "Main international ranking"),
    "proxy_extended": ("Расширенный международный рейтинг", "Extended international ranking"),
    "asof_diagnostic": ("Диагностический профиль последних данных", "Latest-data diagnostic profile"),
}

HTEI_PUBLIC_COMPONENTS = {
    "HT_EMPLOYMENT_SHARE": ("Занятость в высокотехнологичных и наукоёмких секторах", "Employment in high-technology and knowledge-intensive sectors"),
    "HIGH_TECH_OCCUPATIONS": ("Технологические профессии", "Technology occupations"),
    "RND_PERSONNEL": ("Кадровое ядро исследований и разработок", "Research and development workforce"),
    "STEM_PIPELINE": ("Образовательный поток STEM", "STEM education pipeline"),
    "TECH_OUTPUTS": ("Технологические результаты экономики", "Technology outputs"),
    "CORPORATE_STRATEGY_AND_DEMAND": ("Корпоративное участие в НИОКР", "Corporate participation in R&D"),
}

HCI_PLUS_COMPONENTS = {
    "EDUCATION": ("Образование", "Education"),
    "EMPLOYMENT": ("Занятость", "Employment"),
    "HEALTH": ("Здоровье", "Health"),
}

UNIT_LABELS = {
    "percent_of_total_employment": ("% общей занятости", "% of total employment"),
    "percent": ("%", "%"),
    "points": ("пунктов", "points"),
    "years": ("лет", "years"),
    "per_million_population": ("на 1 млн жителей", "per million population"),
    "per_1000000_population": ("на 1 млн жителей", "per million population"),
    "rd_personnel_per_million_population": ("персонала НИОКР на 1 млн жителей", "R&D personnel per million population"),
    "percent_of_tertiary_graduates": ("% выпускников высшего образования", "% of tertiary graduates"),
    "equal_weight_mean_of_individually_minmax_normalized_indicators_0_100": ("сводная шкала 0–100", "composite 0–100 scale"),
    "business_rd_percent_of_gerd": ("% внутренних затрат на НИОКР", "% of gross domestic expenditure on R&D"),
    "index_points": ("пунктов индекса", "index points"),
}

POLICY_EN_OVERRIDES: dict[str, dict[str, str]] = {
    "RUS-HTEI-05": {
        "title_en": "Link workforce policy to measurable technology outcomes",
        "problem_en": "Growth in the number of trained specialists does not always translate into patents, exports of technology goods and services, or deployed research and development.",
        "indicator_en": "Technology outputs of the economy",
        "benchmark_en": "Comparable HTEI top-10 average: 35.22",
        "measure_en": "Fund university–company consortia against measurable outcomes: patents, ICT service exports, high-technology exports, licensing and deployed R&D.",
        "actor_en": "Ministry of Science and Higher Education; Ministry of Industry and Trade; Ministry of Digital Development; Rospatent; development institutions; export centres",
        "target_kpi_en": "Improve every disclosed technology-output indicator, with separate commercialisation and export KPIs.",
        "expected_effect_en": "Convert workforce and research capacity into measurable technology output in the economy.",
        "risk_en": "Outcomes respond with a long lag and are affected by external conditions; short- and long-term KPIs should be separated.",
        "resources_en": "Consortium grants, technology-transfer infrastructure, export support and patent support.",
        "monitoring_en": "Annual review of high-technology exports, ICT services, patents and deployed R&D.",
    },
    "RUS-HTEI-06": {
        "title_en": "Build a quantitative corporate layer for technology workforce demand",
        "problem_en": "Business participation in R&D is only a proxy for corporate activity and does not reveal hiring plans, skill shortages or workforce strategies.",
        "indicator_en": "Corporate participation in R&D (a proxy for corporate technology activity, not a vacancy indicator)",
        "benchmark_en": "Comparable HTEI top-10 average: 74.61",
        "measure_en": "Introduce a voluntary and subsequently standardised disclosure format covering R&D personnel, technology hiring, training and skills plans, linked to official reporting and industry surveys.",
        "actor_en": "Ministry of Economic Development; Ministry of Industry and Trade; Ministry of Digital Development; Bank of Russia; exchanges; major employers",
        "target_kpi_en": "Include at least 50 major technology employers in an auditable register and cover at least 70% of employment in the selected industries.",
        "expected_effect_en": "Replace an indirect proxy with direct measurement of corporate strategies and demand for technology workers.",
        "risk_en": "Selective disclosure and sample bias; numerical scoring should be used only when coverage is sufficient.",
        "resources_en": "A common digital format, legal review and a secure environment for aggregated data exchange.",
        "monitoring_en": "Annual reporting on company coverage, R&D headcount, vacancies and hiring, training and disclosed workforce plans.",
    },
    "RUS-SYSTEM-07": {
        "title_en": "Strengthen international cooperation in technology workforce education",
        "problem_en": "International cooperation, academic mobility and joint technology programmes do not yet fully translate into durable workforce and research links.",
        "indicator_en": "Training-system competitiveness model — international cooperation block",
        "benchmark_en": "Comparable technology leaders and peer-group countries",
        "measure_en": "Develop joint engineering programmes, network laboratories and mutual recognition of modules with technologically strong universities in partner countries.",
        "actor_en": "Ministry of Science and Higher Education; universities; Russian Science Foundation; international consortia",
        "target_kpi_en": "Increase joint programmes, laboratories, publications and graduate employment in international projects.",
        "expected_effect_en": "Improve the international-cooperation block of the training-system competitiveness model.",
        "risk_en": "Geopolitical constraints and unbalanced mobility; partner diversification is required.",
        "resources_en": "Consortium agreements, joint funding and digital academic mobility.",
        "monitoring_en": "Annual review of joint programmes, mobility balance, co-publications and joint R&D projects.",
    },
    "RUS-QS-08": {
        "title_en": "Increase the international visibility of engineering and technology programmes",
        "problem_en": "Limited representation of Russian universities in the upper tiers of QS Engineering & Technology constrains the international visibility of the country’s education and research base.",
        "indicator_en": "QS Engineering & Technology country profile",
        "benchmark_en": "Comparable technology leaders and peer-group countries",
        "measure_en": "Prepare targeted plans for research impact, international collaboration, employer reputation and data disclosure for universities with the potential to enter the top 250 and top 100.",
        "actor_en": "Ministry of Science and Higher Education; universities; industry partners",
        "target_kpi_en": "Increase the number of Russian universities in the top 500, top 250 and top 100 without compromising academic integrity or data quality.",
        "expected_effect_en": "Greater international recognition and more partners for engineering and technology programmes.",
        "risk_en": "Metric management may displace real quality; plans must be grounded in research performance and education outcomes.",
        "resources_en": "Support for research, international projects, bibliometric infrastructure and employer engagement.",
        "monitoring_en": "Annual review of top-100/top-250/top-500 counts, median rank, research citations and international collaboration.",
    },
}


def _table_exists(conn: sqlite3.Connection, name: str) -> bool:
    return bool(row(conn, "SELECT 1 AS ok FROM sqlite_master WHERE type='table' AND name=?", (name,)))


def _json(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    try:
        return json.loads(value or "{}")
    except (TypeError, json.JSONDecodeError):
        return {}


def _scale(code: str) -> dict[str, Any]:
    return dict(SCALES.get(code, {"min": 0, "max": 100, "label_ru": "шкала 0–100", "label_en": "0–100 scale"}))


def _freshness(actual_year: int | None, requested_year: int, average_lag: float | None = None) -> dict[str, Any]:
    lag = average_lag if average_lag is not None else (requested_year - actual_year if actual_year else None)
    if lag is None:
        status, ru, en = "unknown", "год не указан", "year unavailable"
    elif lag <= 1:
        status, ru, en = "current", "актуальные данные", "current data"
    elif lag <= 3:
        status, ru, en = "recent", "умеренный временной лаг", "moderate time lag"
    else:
        status, ru, en = "stale", "требуется актуализация", "refresh recommended"
    return {"status": status, "label_ru": ru, "label_en": en, "lag": lag}


def _effective_score(conn: sqlite3.Connection, iso3: str, code: str, requested_year: int) -> dict[str, Any] | None:
    return row(
        conn,
        """SELECT s.*, i.name_ru, i.name_en, i.short_name_ru, i.short_name_en,
                  i.authority, i.description_ru, i.description_en, i.official_or_derived,
                  sr.source_name, sr.owner AS source_owner, sr.license_or_terms
           FROM index_scores s
           JOIN index_definitions i ON i.code=s.index_code
           LEFT JOIN source_registry sr ON sr.source_id=s.source_id
           WHERE s.iso3=? AND s.index_code=? AND s.year<=?
           ORDER BY s.year DESC LIMIT 1""",
        (iso3, code, requested_year),
    )


def _htei_profile(conn: sqlite3.Connection, iso3: str, requested_year: int) -> dict[str, Any] | None:
    if not _table_exists(conn, "htei_v6_profiles"):
        return None
    for mode in ("proxy_extended", "common_support", "direct_core", "asof_diagnostic"):
        profile = row(
            conn,
            """SELECT * FROM htei_v6_profiles
               WHERE iso3=? AND release_year<=? AND mode=?
               ORDER BY release_year DESC LIMIT 1""",
            (iso3, requested_year, mode),
        )
        if profile:
            return profile
    return None


def _universe(conn: sqlite3.Connection, code: str, year: int, mode: str | None = None) -> int:
    if code == "HTEI" and mode:
        return int(row(conn, "SELECT COUNT(*) AS n FROM htei_v6_profiles WHERE release_year=? AND mode=?", (year, mode))["n"] or 0)
    return int(row(conn, "SELECT COUNT(*) AS n FROM index_scores WHERE index_code=? AND year=?", (code, year))["n"] or 0)


def _trend(conn: sqlite3.Connection, iso3: str, code: str, score: dict[str, Any] | None) -> list[dict[str, Any]]:
    if not score or code == "HTEI":
        return []
    return rows(
        conn,
        """SELECT year,source_data_year,score,rank,percentile,rank_delta_1y,formula_version
           FROM index_scores WHERE iso3=? AND index_code=? AND formula_version=?
           ORDER BY year""",
        (iso3, code, score.get("formula_version")),
    )[-12:]


def _component_name(code: str, component_code: str, ru: str | None, en: str | None) -> tuple[str, str]:
    if code == "HTEI" and component_code in HTEI_PUBLIC_COMPONENTS:
        return HTEI_PUBLIC_COMPONENTS[component_code]
    if code == "HCI_PLUS" and component_code in HCI_PLUS_COMPONENTS:
        return HCI_PLUS_COMPONENTS[component_code]
    return ru or component_code, en or component_code


def _unit(unit: str | None) -> dict[str, str]:
    ru, en = UNIT_LABELS.get(unit or "", (unit or "", unit or ""))
    return {"code": unit or "", "label_ru": ru, "label_en": en}


def _generic_components(conn: sqlite3.Connection, iso3: str, code: str, value_year: int) -> list[dict[str, Any]]:
    result = rows(
        conn,
        """SELECT cv.*, c.name_ru, c.name_en, c.weight, sr.source_name, sr.owner AS source_owner
           FROM component_values cv
           LEFT JOIN components c ON c.index_code=cv.index_code AND c.component_code=cv.component_code
           LEFT JOIN source_registry sr ON sr.source_id=cv.source_id
           WHERE cv.iso3=? AND cv.index_code=? AND cv.year=?
           ORDER BY COALESCE(c.weight,0) DESC, cv.normalized_score DESC""",
        (iso3, code, value_year),
    )
    for item in result:
        public_ru, public_en = _component_name(code, item["component_code"], item.get("name_ru"), item.get("name_en"))
        item.update({
            "public_name_ru": public_ru,
            "public_name_en": public_en,
            "unit_public": _unit(item.get("unit")),
            "weight": item.get("weight") if item.get("weight") is not None else 0,
        })
    return result


def _htei_components(conn: sqlite3.Connection, profile: dict[str, Any]) -> list[dict[str, Any]]:
    result = rows(
        conn,
        """SELECT cv.*, sr.source_name, sr.owner AS source_owner
           FROM htei_v6_component_values cv
           LEFT JOIN source_registry sr ON sr.source_id=cv.source_id
           WHERE cv.profile_id=? ORDER BY cv.effective_weight DESC, cv.component_code""",
        (profile["profile_id"],),
    )
    for item in result:
        public_ru, public_en = _component_name("HTEI", item["component_code"], item.get("name_ru"), item.get("name_en"))
        item.update({
            "index_code": "HTEI",
            "public_name_ru": public_ru,
            "public_name_en": public_en,
            "weight": item.get("effective_weight") or item.get("base_weight") or 0,
            "unit_public": _unit(item.get("unit")),
            "actionability": {
                "HT_EMPLOYMENT_SHARE": 0.80,
                "HIGH_TECH_OCCUPATIONS": 0.78,
                "RND_PERSONNEL": 0.72,
                "STEM_PIPELINE": 0.70,
                "TECH_OUTPUTS": 0.52,
                "CORPORATE_STRATEGY_AND_DEMAND": 0.65,
            }.get(item["component_code"], 0.60),
        })
    return result


def _peer_members(conn: sqlite3.Connection, codes: list[str]) -> list[dict[str, Any]]:
    placeholders = ",".join("?" for _ in codes)
    if not placeholders:
        return []
    countries = {item["iso3"]: item for item in rows(conn, f"SELECT * FROM countries WHERE iso3 IN ({placeholders})", tuple(codes))}
    return [countries[code] for code in codes if code in countries]


def _score_peer_stats(
    conn: sqlite3.Connection,
    card: dict[str, Any],
    group_codes: list[str],
    selected_iso3: str,
) -> dict[str, Any]:
    members = [code for code in group_codes if code != selected_iso3]
    if not members or not card.get("available"):
        return {"country_count": 0, "score_mean": None, "percentile_mean": None, "gap": None}
    placeholders = ",".join("?" for _ in members)
    if card["index_code"] == "HTEI":
        values = rows(
            conn,
            f"""SELECT iso3,substantive_score AS score,percentile FROM htei_v6_profiles
                WHERE release_year=? AND mode=? AND iso3 IN ({placeholders})""",
            (card["value_year"], card.get("mode"), *members),
        )
    else:
        values = rows(
            conn,
            f"""SELECT iso3,score,percentile FROM index_scores
                WHERE index_code=? AND year=? AND iso3 IN ({placeholders})""",
            (card["index_code"], card["value_year"], *members),
        )
    scores = [float(item["score"]) for item in values if item.get("score") is not None]
    percentiles = [float(item["percentile"]) for item in values if item.get("percentile") is not None]
    peer_percentile = mean(percentiles) if percentiles else None
    return {
        "country_count": len(values),
        "score_mean": mean(scores) if scores else None,
        "percentile_mean": peer_percentile,
        "gap": (float(card["percentile"]) - peer_percentile) if card.get("percentile") is not None and peer_percentile is not None else None,
    }


def _component_peer_stats(
    conn: sqlite3.Connection,
    component: dict[str, Any],
    card: dict[str, Any],
    group_codes: list[str],
    selected_iso3: str,
) -> dict[str, Any]:
    members = [code for code in group_codes if code != selected_iso3]
    if not members:
        return {"country_count": 0, "mean": None, "gap": None}
    placeholders = ",".join("?" for _ in members)
    if card["index_code"] == "HTEI":
        values = rows(
            conn,
            f"""SELECT cv.normalized_score
                FROM htei_v6_component_values cv
                WHERE cv.release_year=? AND cv.mode=? AND cv.component_code=?
                  AND cv.iso3 IN ({placeholders})""",
            (card["value_year"], card.get("mode"), component["component_code"], *members),
        )
    else:
        values = rows(
            conn,
            f"""SELECT normalized_score FROM component_values
                WHERE index_code=? AND component_code=? AND year=?
                  AND iso3 IN ({placeholders})""",
            (card["index_code"], component["component_code"], card["value_year"], *members),
        )
    numbers = [float(item["normalized_score"]) for item in values if item.get("normalized_score") is not None]
    peer_mean = mean(numbers) if numbers else None
    country_value = component.get("normalized_score")
    return {
        "country_count": len(numbers),
        "mean": peer_mean,
        "gap": (float(country_value) - peer_mean) if country_value is not None and peer_mean is not None else None,
    }


def _index_card(conn: sqlite3.Connection, iso3: str, code: str, requested_year: int) -> dict[str, Any]:
    metadata = row(conn, "SELECT * FROM index_definitions WHERE code=?", (code,)) or row(conn, "SELECT * FROM indices WHERE code=?", (code,)) or {"code": code}
    badge_ru, badge_en = INDEX_BADGES[code]
    base: dict[str, Any] = {
        "index_code": code,
        "name_ru": metadata.get("name_ru") or code,
        "name_en": metadata.get("name_en") or code,
        "badge_ru": badge_ru,
        "badge_en": badge_en,
        "authority": metadata.get("authority"),
        "description_ru": metadata.get("description_ru"),
        "description_en": metadata.get("description_en"),
        "scale": _scale(code),
        "available": False,
        "components": [],
        "peer_benchmarks": {},
    }
    if code == "HTEI":
        profile = _htei_profile(conn, iso3, requested_year)
        if not profile:
            return base
        mode_ru, mode_en = HTEI_MODE_LABELS.get(profile["mode"], (profile["mode"], profile["mode"]))
        components = _htei_components(conn, profile)
        base.update({
            "available": True,
            "value_id": profile["profile_id"],
            "score": profile["substantive_score"],
            "rank": profile["rank"],
            "percentile": profile["percentile"],
            "universe": _universe(conn, code, profile["release_year"], profile["mode"]),
            "value_year": profile["release_year"],
            "source_data_year": profile["newest_source_year"],
            "source_year_min": profile["oldest_source_year"],
            "source_year_max": profile["newest_source_year"],
            "average_lag": profile["average_lag"],
            "data_quality": profile["confidence_score"],
            "score_low": profile["score_low"],
            "score_high": profile["score_high"],
            "rank_low": profile["rank_low"],
            "rank_high": profile["rank_high"],
            "available_components": profile["available_components"],
            "available_weight": profile["available_weight"],
            "mode": profile["mode"],
            "mode_ru": mode_ru,
            "mode_en": mode_en,
            "formula_version": profile["formula_version"],
            "quality_flag": profile["coverage_class"],
            "is_official": False,
            "is_recomputed": True,
            "value_type_ru": "авторский расчётный индекс",
            "value_type_en": "project-derived index",
            "source_id": "HTEI_FINAL_V6",
            "source_name": "HTEI final comparison methodology v6",
            "source_owner": "МГИМО / ФНИСЦ РАН",
            "freshness": _freshness(profile["newest_source_year"], requested_year, profile["average_lag"]),
            "trend": [],
            "components": components,
        })
    else:
        score = _effective_score(conn, iso3, code, requested_year)
        if not score:
            return base
        components = _generic_components(conn, iso3, code, score["year"])
        official = bool(score.get("is_official"))
        derived = bool(score.get("is_recomputed")) or metadata.get("official_or_derived") != "official_index"
        base.update({
            **score,
            "available": True,
            "universe": _universe(conn, code, score["year"]),
            "value_year": score["year"],
            "source_year_min": score.get("source_data_year") or score["year"],
            "source_year_max": score.get("source_data_year") or score["year"],
            "value_type_ru": "официальная оценка" if official and not derived else "расчётная оценка на официальных данных",
            "value_type_en": "official score" if official and not derived else "derived score from official data",
            "freshness": _freshness(score.get("source_data_year") or score["year"], requested_year),
            "trend": _trend(conn, iso3, code, score),
            "components": components,
        })
    available_components = base.get("components") or []
    base["weak_component"] = min(available_components, key=lambda item: float(item.get("normalized_score") or 0)) if available_components else None
    base["strong_component"] = max(available_components, key=lambda item: float(item.get("normalized_score") or 0)) if available_components else None
    return base


def _enrich_benchmarks(conn: sqlite3.Connection, iso3: str, cards: list[dict[str, Any]]) -> list[dict[str, Any]]:
    groups: list[dict[str, Any]] = []
    for definition in PEER_GROUPS:
        countries = _peer_members(conn, definition["iso3"])
        group = {
            "code": definition["code"],
            "label_ru": definition["label_ru"],
            "label_en": definition["label_en"],
            "description_ru": definition["description_ru"],
            "description_en": definition["description_en"],
            "countries": countries,
            "country_count": len(countries),
            "index_stats": {},
        }
        for card in cards:
            stats = _score_peer_stats(conn, card, definition["iso3"], iso3)
            group["index_stats"][card["index_code"]] = stats
            card["peer_benchmarks"][definition["code"]] = stats
            for component in card.get("components", []):
                component.setdefault("benchmarks", {})[definition["code"]] = _component_peer_stats(conn, component, card, definition["iso3"], iso3)
        groups.append(group)
    return groups


def _source_summary(cards: list[dict[str, Any]]) -> dict[str, Any]:
    available = [card for card in cards if card.get("available")]
    source_ids = {card.get("source_id") for card in available if card.get("source_id")}
    years = [int(year) for card in available for year in (card.get("source_year_min"), card.get("source_year_max")) if year]
    freshness_counts: dict[str, int] = defaultdict(int)
    for card in available:
        freshness_counts[card.get("freshness", {}).get("status", "unknown")] += 1
    return {
        "available_indices": len(available),
        "source_count": len(source_ids),
        "source_year_min": min(years) if years else None,
        "source_year_max": max(years) if years else None,
        "freshness_counts": dict(freshness_counts),
    }


def _policy_items(conn: sqlite3.Connection, iso3: str) -> list[dict[str, Any]]:
    if iso3 != "RUS" or not _table_exists(conn, "policy_brief_items"):
        return []
    items = rows(
        conn,
        """SELECT * FROM policy_brief_items
           WHERE iso3=? ORDER BY priority,item_id""",
        (iso3,),
    )
    # The source database contains four English records shifted against their
    # Russian counterparts.  Correct the public presentation layer without
    # mutating the delivered evidence database.
    for item in items:
        item.update(POLICY_EN_OVERRIDES.get(item.get("item_id"), {}))
    return items


def country_workspace_payload(conn: sqlite3.Connection, iso3: str, requested_year: int) -> dict[str, Any]:
    iso3 = iso3.upper()
    country = row(conn, "SELECT * FROM countries WHERE iso3=?", (iso3,))
    if not country:
        raise KeyError(f"Unknown country {iso3}")
    cards = [_index_card(conn, iso3, code, requested_year) for code in INDEX_ORDER]
    groups = _enrich_benchmarks(conn, iso3, cards)
    available = [card for card in cards if card.get("available") and card.get("percentile") is not None]
    strongest = max(available, key=lambda item: float(item["percentile"])) if available else None
    weakest = min(available, key=lambda item: float(item["percentile"])) if available else None
    momentum_candidates = [card for card in cards if card.get("rank_delta_1y") is not None]
    momentum = max(momentum_candidates, key=lambda item: float(item["rank_delta_1y"])) if momentum_candidates else None
    risk_indices = sorted(available, key=lambda item: float(item["percentile"]))[:3]
    policies = _policy_items(conn, iso3)
    evidence = _source_summary(cards)
    evidence["direct_policy_evidence_count"] = sum(bool(item.get("evidence_value_id")) for item in policies)
    return {
        "schema_version": "country-workspace-v2",
        "country": country,
        "requested_year": requested_year,
        "indices": cards,
        "benchmark_groups": groups,
        "default_benchmark": "RUSSIA_CORE",
        "insights": {
            "strongest_index": strongest,
            "weakest_index": weakest,
            "best_momentum": momentum,
            "risk_indices": risk_indices,
        },
        "policies": policies,
        "evidence": evidence,
        "export": {
            "json_ru": f"/api/export/country/{iso3}/brief?year={requested_year}&lang=ru&format=json",
            "json_en": f"/api/export/country/{iso3}/brief?year={requested_year}&lang=en&format=json",
            "txt_ru": f"/api/export/country/{iso3}/brief?year={requested_year}&lang=ru&format=txt",
            "txt_en": f"/api/export/country/{iso3}/brief?year={requested_year}&lang=en&format=txt",
        },
    }
