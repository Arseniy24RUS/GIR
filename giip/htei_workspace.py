from __future__ import annotations

import csv
import io
import json
import math
import statistics
from collections import defaultdict
from typing import Any, Iterable

from .db import row, rows

RELEASE_YEAR = 2026
MODE_ORDER = ("direct_core", "common_support", "proxy_extended", "asof_diagnostic")
RANKED_MODES = {"direct_core", "common_support", "proxy_extended"}

MODE_META: dict[str, dict[str, Any]] = {
    "direct_core": {
        "name_ru": "Строгий слой прямых данных",
        "name_en": "Strict direct-data layer",
        "short_ru": "Прямые данные",
        "short_en": "Direct data",
        "description_ru": "Самый строгий международный срез: обе трудовые компоненты основаны на прямой high-tech/HRST или национальной статистике. Используется для проверки устойчивости, но имеет ограниченный охват.",
        "description_en": "The strictest international slice: both labour components use direct high-tech/HRST or national statistics. It is used for robustness checks but has limited coverage.",
        "ranking": True,
        "comparison_question_ru": "Сохраняется ли результат без отраслевых и профессиональных proxy?",
        "comparison_question_en": "Does the result persist without sector and occupation proxies?",
    },
    "common_support": {
        "name_ru": "Основной международный рейтинг",
        "name_en": "Primary international ranking",
        "short_ru": "Основной рейтинг",
        "short_en": "Primary ranking",
        "description_ru": "Один фиксированный четырёхкомпонентный набор для всех стран. Это главный режим для наиболее строгого межстранового сравнения в общей выборке.",
        "description_en": "One fixed four-component set for every country. This is the primary mode for the strictest comparison across a common international sample.",
        "ranking": True,
        "comparison_question_ru": "Как страна выглядит в фиксированной общей компонентной структуре?",
        "comparison_question_en": "How does the country perform under a fixed common component structure?",
    },
    "proxy_extended": {
        "name_ru": "Расширенный международный рейтинг",
        "name_en": "Extended international ranking",
        "short_ru": "Расширенный рейтинг",
        "short_en": "Extended ranking",
        "description_ru": "Максимально полный утверждённый профиль при достаточном покрытии. Косвенные показатели явно маркированы; качество и свежесть публикуются отдельно от substantive score.",
        "description_en": "The fullest approved profile with sufficient coverage. Indirect measures are explicitly labelled; quality and freshness are reported separately from the substantive score.",
        "ranking": True,
        "comparison_question_ru": "Что показывает максимально полный доказательный профиль?",
        "comparison_question_en": "What does the fullest available evidence profile show?",
    },
    "asof_diagnostic": {
        "name_ru": "Диагностический профиль последних данных",
        "name_en": "Latest-data diagnostic profile",
        "short_ru": "Диагностика ASOF",
        "short_en": "ASOF diagnostic",
        "description_ru": "Использует последние доступные официальные наблюдения разных фактических лет. Предназначен для диагностики покрытия и не получает международного места.",
        "description_en": "Uses the latest available official observations from different source years. It is designed for coverage diagnostics and receives no international rank.",
        "ranking": False,
        "comparison_question_ru": "Какие данные доступны сейчас, даже если годы компонентов различаются?",
        "comparison_question_en": "What evidence is currently available even when component years differ?",
    },
}

COMPONENT_META: dict[str, dict[str, str]] = {
    "HT_EMPLOYMENT_SHARE": {
        "name_ru": "Занятость в высокотехнологичных секторах",
        "name_en": "High-technology sector employment",
        "short_ru": "Отраслевая занятость",
        "short_en": "Sector employment",
        "meaning_ru": "Доля занятых в информационно-коммуникационных, профессионально-научных и технических видах деятельности либо в прямой high-tech/KIS статистике.",
        "meaning_en": "Employment share in information, communication, professional/scientific and technical activities or direct high-tech/KIS statistics.",
    },
    "HIGH_TECH_OCCUPATIONS": {
        "name_ru": "Технологические профессии",
        "name_en": "Technology-intensive occupations",
        "short_ru": "Профессиональная структура",
        "short_en": "Occupation structure",
        "meaning_ru": "Международно сопоставимая профессиональная интенсивность на основе специалистов и техников ISCO-08 2–3; широкий proxy, а не исчерпывающий перечень high-tech профессий.",
        "meaning_en": "Internationally comparable occupation intensity based on ISCO-08 professionals and technicians (groups 2–3); a broad proxy rather than an exhaustive high-tech occupation list.",
    },
    "RND_PERSONNEL": {
        "name_ru": "Кадровое ядро исследований и разработок",
        "name_en": "Research and development workforce",
        "short_ru": "Кадры НИОКР",
        "short_en": "R&D workforce",
        "meaning_ru": "Исследователи и технический персонал исследований и разработок в расчёте на миллион жителей.",
        "meaning_en": "Researchers and technical R&D personnel per million people.",
    },
    "STEM_PIPELINE": {
        "name_ru": "Образовательный поток STEM",
        "name_en": "STEM education pipeline",
        "short_ru": "Выпуск STEM",
        "short_en": "STEM graduates",
        "meaning_ru": "Доля выпускников третичного образования по естественным наукам, технологиям, инженерии и математике.",
        "meaning_en": "Share of tertiary graduates in science, technology, engineering and mathematics.",
    },
    "TECH_OUTPUTS": {
        "name_ru": "Технологические результаты экономики",
        "name_en": "Technology outputs of the economy",
        "short_ru": "Технологические результаты",
        "short_en": "Technology outputs",
        "meaning_ru": "Составная оценка технологических результатов на основе патентов, высокотехнологичного экспорта и ИКТ-услуг после раздельной нормализации исходных показателей.",
        "meaning_en": "Composite technology-output score based on patents, high-technology exports and ICT services after separate normalisation of source indicators.",
    },
    "CORPORATE_STRATEGY_AND_DEMAND": {
        "name_ru": "Корпоративное участие в НИОКР",
        "name_en": "Corporate participation in R&D",
        "short_ru": "Корпоративные НИОКР",
        "short_en": "Business R&D",
        "meaning_ru": "Доля предпринимательского сектора в совокупных расходах на исследования и разработки; proxy корпоративной технологической активности, а не показатель вакансий.",
        "meaning_en": "Business-sector share of gross domestic expenditure on R&D; a proxy for corporate technology activity, not a vacancy-demand indicator.",
    },
}

UNIT_META: dict[str, dict[str, str]] = {
    "percent_of_total_employment": {"ru": "% общей занятости", "en": "% of total employment"},
    "percent_of_tertiary_graduates": {"ru": "% выпускников третичного образования", "en": "% of tertiary graduates"},
    "rd_personnel_per_million_population": {"ru": "человек на 1 млн жителей", "en": "people per million population"},
    "rd_personnel_fte_per_million_population": {"ru": "ЭПЗ на 1 млн жителей", "en": "FTE per million population"},
    "business_rd_percent_of_gerd": {"ru": "% совокупных расходов на НИОКР", "en": "% of gross domestic R&D expenditure"},
    "equal_weight_mean_of_individually_minmax_normalized_indicators_0_100": {"ru": "составной score 0–100", "en": "composite score 0–100"},
}

SOURCE_PUBLIC_NAMES: dict[str, dict[str, str]] = {
    "EUROSTAT_HTEC": {"ru": "Eurostat: high-tech, HRST и НИОКР", "en": "Eurostat: high-tech, HRST and R&D"},
    "ILOSTAT_HTEI": {"ru": "Международная организация труда · ILOSTAT", "en": "International Labour Organization · ILOSTAT"},
    "OECD_HTEI": {"ru": "ОЭСР · Data Explorer", "en": "OECD · Data Explorer"},
    "UIS_HTEI": {"ru": "Институт статистики ЮНЕСКО", "en": "UNESCO Institute for Statistics"},
    "WORLD_BANK_HTEI": {"ru": "Всемирный банк · World Development Indicators", "en": "World Bank · World Development Indicators"},
}


def _quantile(values: list[float], q: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    position = (len(ordered) - 1) * q
    lo = math.floor(position)
    hi = math.ceil(position)
    if lo == hi:
        return float(ordered[lo])
    return float(ordered[lo] * (hi - position) + ordered[hi] * (position - lo))


def _mean(values: Iterable[float]) -> float | None:
    clean = [float(value) for value in values if value is not None]
    return statistics.mean(clean) if clean else None


def _pearson(xs: list[float], ys: list[float]) -> float | None:
    if len(xs) < 2 or len(xs) != len(ys):
        return None
    mean_x = statistics.mean(xs)
    mean_y = statistics.mean(ys)
    numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys))
    denominator = math.sqrt(sum((x - mean_x) ** 2 for x in xs) * sum((y - mean_y) ** 2 for y in ys))
    return numerator / denominator if denominator else None


def _rank_values(values: list[float]) -> list[float]:
    indexed = sorted(enumerate(values), key=lambda pair: pair[1])
    ranks = [0.0] * len(values)
    i = 0
    while i < len(indexed):
        j = i + 1
        while j < len(indexed) and indexed[j][1] == indexed[i][1]:
            j += 1
        average_rank = (i + 1 + j) / 2
        for index, _ in indexed[i:j]:
            ranks[index] = average_rank
        i = j
    return ranks


def _spearman(xs: list[float], ys: list[float]) -> float | None:
    if len(xs) < 2 or len(xs) != len(ys):
        return None
    return _pearson(_rank_values(xs), _rank_values(ys))


def _mode_catalog(conn, iso3: str) -> list[dict[str, Any]]:
    summaries = {
        item["mode"]: item
        for item in rows(
            conn,
            """SELECT mode,COUNT(*) AS countries,SUM(eligible_for_ranking) AS ranked,
                      MIN(available_components) AS min_components,MAX(available_components) AS max_components,
                      AVG(confidence_score) AS mean_confidence,AVG(average_lag) AS mean_lag,
                      COUNT(DISTINCT component_signature) AS component_signatures
               FROM htei_v6_profiles WHERE release_year=? GROUP BY mode""",
            (RELEASE_YEAR,),
        )
    }
    available = {
        item["mode"]: item
        for item in rows(
            conn,
            "SELECT mode,profile_id,available_components,available_weight,eligible_for_ranking FROM htei_v6_profiles WHERE release_year=? AND iso3=?",
            (RELEASE_YEAR, iso3),
        )
    }
    result: list[dict[str, Any]] = []
    for code in MODE_ORDER:
        summary = summaries.get(code, {})
        profile = available.get(code)
        meta = MODE_META[code]
        if profile:
            reason_ru = "Профиль страны соответствует требованиям этого методического режима."
            reason_en = "The country profile meets the requirements of this methodological mode."
        elif code == "direct_core":
            reason_ru = "Для страны отсутствует полный строгий набор прямых трудовых компонентов."
            reason_en = "The country lacks the complete strict set of direct labour components."
        elif code == "common_support":
            reason_ru = "Страна не входит в фиксированную четырёхкомпонентную вселенную основного рейтинга."
            reason_en = "The country is outside the fixed four-component universe of the primary ranking."
        elif code == "proxy_extended":
            reason_ru = "Недостаточно утверждённых компонентов или веса покрытия для расширенного рейтинга."
            reason_en = "There are not enough approved components or coverage weight for the extended ranking."
        else:
            reason_ru = "Недостаточно официальных наблюдений для диагностического профиля."
            reason_en = "There are not enough official observations for a diagnostic profile."
        result.append(
            {
                "code": code,
                **meta,
                "countries": int(summary.get("countries") or 0),
                "ranked": int(summary.get("ranked") or 0),
                "min_components": int(summary.get("min_components") or 0),
                "max_components": int(summary.get("max_components") or 0),
                "mean_confidence": summary.get("mean_confidence"),
                "mean_lag": summary.get("mean_lag"),
                "component_signatures": int(summary.get("component_signatures") or 0),
                "available_for_country": bool(profile),
                "country_profile_id": profile.get("profile_id") if profile else None,
                "country_available_components": profile.get("available_components") if profile else None,
                "country_available_weight": profile.get("available_weight") if profile else None,
                "reason_ru": reason_ru,
                "reason_en": reason_en,
            }
        )
    return result


def _effective_mode(mode_catalog: list[dict[str, Any]], requested_mode: str) -> tuple[str, dict[str, Any] | None]:
    aliases = {
        "asof": "asof_diagnostic",
        "diagnostic": "asof_diagnostic",
        "comparable_core": "common_support",
        "comparable_extended": "proxy_extended",
        "core": "common_support",
        "extended": "proxy_extended",
    }
    requested = aliases.get((requested_mode or "").lower(), (requested_mode or "common_support").lower())
    by_code = {item["code"]: item for item in mode_catalog}
    if requested not in by_code:
        requested = "common_support"
    if by_code[requested]["available_for_country"]:
        return requested, None
    for candidate in ("proxy_extended", "common_support", "direct_core", "asof_diagnostic"):
        if by_code[candidate]["available_for_country"]:
            return candidate, {
                "requested_mode": requested,
                "effective_mode": candidate,
                "reason_ru": by_code[requested]["reason_ru"],
                "reason_en": by_code[requested]["reason_en"],
            }
    return requested, {
        "requested_mode": requested,
        "effective_mode": requested,
        "reason_ru": "Для выбранной страны HTEI не рассчитан ни в одном режиме.",
        "reason_en": "HTEI is unavailable for the selected country in every mode.",
    }


def _country(conn, iso3: str) -> dict[str, Any] | None:
    return row(conn, "SELECT iso3,iso2,name_ru,name_en,flag,region,income_group FROM countries WHERE iso3=?", (iso3,))


def _source_registry(conn) -> dict[str, dict[str, Any]]:
    return {
        item["source_id"]: item
        for item in rows(
            conn,
            "SELECT source_id,source_name,owner,source_url,url,retrieved_at,release_year,latest_snapshot_id,license_or_terms FROM source_registry",
        )
    }


def _component_benchmark(conn, mode: str, component_code: str, iso3: str) -> dict[str, Any]:
    data = rows(
        conn,
        """SELECT v.iso3,v.normalized_score,c.name_ru,c.name_en
           FROM htei_v6_component_values v JOIN countries c ON c.iso3=v.iso3
           WHERE v.release_year=? AND v.mode=? AND v.component_code=?
           ORDER BY v.normalized_score DESC,c.name_en""",
        (RELEASE_YEAR, mode, component_code),
    )
    values = [float(item["normalized_score"]) for item in data]
    selected_score = next((float(item["normalized_score"]) for item in data if item["iso3"] == iso3), None)
    # Use a competition rank so equal normalised scores receive the same place;
    # alphabetical ordering must never decide a country's analytical position.
    position = 1 + sum(value > selected_score for value in values) if selected_score is not None else None
    top_n = max(1, min(10, len(values)))
    return {
        "rank": position,
        "universe_count": len(values),
        "percentile": (1 - (position - 1) / len(values)) * 100 if position and values else None,
        "median": statistics.median(values) if values else None,
        "upper_quartile": _quantile(values, 0.75),
        "top10_mean": statistics.mean(values[:top_n]) if values else None,
        "minimum": min(values) if values else None,
        "maximum": max(values) if values else None,
        "top_countries": data[:5],
    }


def _component_payloads(conn, profile: dict[str, Any], sources: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    raw_components = rows(
        conn,
        "SELECT * FROM htei_v6_component_values WHERE profile_id=? ORDER BY effective_weight DESC,component_code",
        (profile["profile_id"],),
    )
    result: list[dict[str, Any]] = []
    for component in raw_components:
        public = COMPONENT_META.get(component["component_code"], {})
        benchmark = _component_benchmark(conn, profile["mode"], component["component_code"], profile["iso3"])
        source = sources.get(component.get("source_id"), {})
        normalized = float(component["normalized_score"])
        median = benchmark.get("median")
        top10 = benchmark.get("top10_mean")
        unit = component.get("unit") or ""
        unit_meta = UNIT_META.get(unit, {"ru": unit, "en": unit})
        proxy_status = component.get("proxy_status") or ""
        status_key = proxy_status.lower()
        if "mixed" in status_key:
            proxy_kind = "mixed"
        elif "proxy" in status_key:
            proxy_kind = "proxy"
        elif "direct" in status_key or status_key.startswith("official_") or "official_indicator" in status_key or "official_observation" in status_key:
            proxy_kind = "direct"
        else:
            proxy_kind = "proxy"
        result.append(
            {
                "value_id": component["value_id"],
                "component_code": component["component_code"],
                "name_ru": public.get("name_ru") or component.get("name_ru"),
                "name_en": public.get("name_en") or component.get("name_en"),
                "short_ru": public.get("short_ru") or public.get("name_ru") or component.get("name_ru"),
                "short_en": public.get("short_en") or public.get("name_en") or component.get("name_en"),
                "meaning_ru": public.get("meaning_ru") or component.get("interpretation_ru"),
                "meaning_en": public.get("meaning_en") or component.get("interpretation_en"),
                "raw_value": component.get("raw_value"),
                "unit": unit,
                "unit_ru": unit_meta["ru"],
                "unit_en": unit_meta["en"],
                "normalized_score": normalized,
                "base_weight": component.get("base_weight"),
                "effective_weight": component.get("effective_weight"),
                "weighted_contribution": component.get("weighted_contribution"),
                "source_id": component.get("source_id"),
                "source_name": SOURCE_PUBLIC_NAMES.get(component.get("source_id"), {}).get("ru") or source.get("source_name"),
                "source_name_ru": SOURCE_PUBLIC_NAMES.get(component.get("source_id"), {}).get("ru") or source.get("source_name"),
                "source_name_en": SOURCE_PUBLIC_NAMES.get(component.get("source_id"), {}).get("en") or source.get("source_name"),
                "source_owner": source.get("owner"),
                "source_url": component.get("source_url") or source.get("source_url") or source.get("url"),
                "source_group": component.get("source_group"),
                "source_data_year": component.get("source_data_year"),
                "data_lag": component.get("data_lag"),
                "indicator_code": component.get("indicator_code"),
                "proxy_status": proxy_status,
                "proxy_kind": proxy_kind,
                "interpretation_ru": component.get("interpretation_ru"),
                "interpretation_en": component.get("interpretation_en"),
                "selection_rule": component.get("selection_rule"),
                "quality_flag": component.get("quality_flag"),
                "raw_snapshot_path": component.get("raw_snapshot_path"),
                "raw_snapshot_sha256": component.get("raw_snapshot_sha256"),
                "retrieved_at": component.get("retrieved_at") or source.get("retrieved_at"),
                "benchmark": benchmark,
                "gap_to_median": normalized - median if median is not None else None,
                "gap_to_top10": normalized - top10 if top10 is not None else None,
            }
        )
    return result


def _ranking(conn, mode: str) -> list[dict[str, Any]]:
    clauses = ["p.release_year=?", "p.mode=?"]
    params: list[Any] = [RELEASE_YEAR, mode]
    if mode in RANKED_MODES:
        clauses.append("p.eligible_for_ranking=1")
        order_sql = "p.rank,c.name_en"
    else:
        order_sql = "p.substantive_score DESC,c.name_en"
    return rows(
        conn,
        f"""SELECT p.profile_id AS value_id,p.iso3,p.substantive_score AS score,p.rank,p.percentile,
                   p.confidence_score,p.coverage_class,p.freshness_class,p.available_components,p.available_weight,
                   p.oldest_source_year,p.newest_source_year,p.average_lag,p.score_low,p.score_high,p.rank_low,p.rank_high,
                   c.name_ru,c.name_en,c.iso2,c.flag,c.region,c.income_group
            FROM htei_v6_profiles p JOIN countries c ON c.iso3=p.iso3
            WHERE {' AND '.join(clauses)} ORDER BY {order_sql}""",
        tuple(params),
    )


def _comparison(conn, left_mode: str, right_mode: str) -> dict[str, Any]:
    matched = rows(
        conn,
        """SELECT l.iso3,l.substantive_score AS left_score,l.rank AS left_rank,
                  r.substantive_score AS right_score,r.rank AS right_rank,
                  c.name_ru,c.name_en,c.region
           FROM htei_v6_profiles l
           JOIN htei_v6_profiles r ON r.iso3=l.iso3 AND r.release_year=l.release_year
           JOIN countries c ON c.iso3=l.iso3
           WHERE l.release_year=? AND l.mode=? AND r.mode=?
             AND l.eligible_for_ranking=1 AND r.eligible_for_ranking=1
           ORDER BY c.name_en""",
        (RELEASE_YEAR, left_mode, right_mode),
    )
    xs = [float(item["left_score"]) for item in matched]
    ys = [float(item["right_score"]) for item in matched]
    left_ranks = [float(item["left_rank"]) for item in matched]
    right_ranks = [float(item["right_rank"]) for item in matched]
    score_differences = [abs(x - y) for x, y in zip(xs, ys)]
    rank_differences = [abs(x - y) for x, y in zip(left_ranks, right_ranks)]
    return {
        "left_mode": left_mode,
        "right_mode": right_mode,
        "n": len(matched),
        "score_pearson": _pearson(xs, ys),
        "score_spearman": _spearman(xs, ys),
        "rank_spearman": _spearman(left_ranks, right_ranks),
        "mean_absolute_score_difference": _mean(score_differences),
        "max_absolute_score_difference": max(score_differences) if score_differences else None,
        "mean_absolute_rank_difference": _mean(rank_differences),
        "max_absolute_rank_difference": max(rank_differences) if rank_differences else None,
        "points": matched,
    }


def _formula(conn, profile: dict[str, Any], components: list[dict[str, Any]]) -> dict[str, Any]:
    record = row(
        conn,
        "SELECT * FROM index_formulas WHERE index_code='HTEI' AND formula_version=?",
        (profile["formula_version"],),
    )
    if not record:
        record = row(conn, "SELECT * FROM index_formulas WHERE index_code='HTEI' ORDER BY formula_version DESC LIMIT 1") or {}
    weights = {item["component_code"]: item["effective_weight"] for item in components}
    terms_ru = [f"{float(item['effective_weight']):.2f} × {item['short_ru']}" for item in components]
    terms_en = [f"{float(item['effective_weight']):.2f} × {item['short_en']}" for item in components]
    return {
        "formula_version": profile["formula_version"],
        "formula_text_ru": record.get("formula_text_ru"),
        "formula_text_en": record.get("formula_text_en"),
        "normalization_ru": record.get("normalization_ru"),
        "normalization_en": record.get("normalization_en"),
        "method_notes_ru": record.get("method_notes_ru"),
        "method_notes_en": record.get("method_notes_en"),
        "weights": weights,
        "expression_ru": " + ".join(terms_ru),
        "expression_en": " + ".join(terms_en),
        "quality_is_separate_from_score": True,
    }


def _audit(conn) -> dict[str, Any] | None:
    item = row(
        conn,
        "SELECT * FROM methodology_audit_runs WHERE model_code='HTEI_V6' AND release_year=?",
        (RELEASE_YEAR,),
    )
    if not item:
        return None
    results = json.loads(item.get("results_json") or "{}")
    return {
        "audit_id": item.get("audit_id"),
        "model_code": item.get("model_code"),
        "release_year": item.get("release_year"),
        "methodology_version": item.get("methodology_version"),
        "run_count": item.get("run_count"),
        "countries": item.get("countries"),
        "mean_spearman": item.get("mean_spearman"),
        "min_spearman": item.get("min_spearman"),
        "mean_absolute_rank_change": item.get("mean_absolute_rank_change"),
        "max_rank_change": item.get("max_rank_change"),
        "sensitivity_passed": item.get("sensitivity_passed"),
        "weight_perturbation_runs": results.get("weight_perturbation_runs"),
        "created_at": item.get("created_at"),
    }


def _policies(conn, iso3: str, components: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if iso3 != "RUS":
        return []
    component_by_v5_suffix = {item["component_code"]: item for item in components}
    result = rows(
        conn,
        """SELECT item_id,priority,title_ru,title_en,problem_ru,problem_en,indicator_ru,indicator_en,
                  current_value,unit,source_data_year,source_id,benchmark_ru,benchmark_en,measure_ru,measure_en,
                  actor_ru,actor_en,horizon,target_kpi_ru,target_kpi_en,expected_effect_ru,expected_effect_en,
                  risk_ru,risk_en,evidence_value_id
           FROM policy_brief_items WHERE iso3='RUS' AND item_id LIKE 'RUS-HTEI-%' ORDER BY priority""",
    )
    for item in result:
        component_code = (item.get("evidence_value_id") or "").split(":")[-1]
        component = component_by_v5_suffix.get(component_code)
        item["component_code"] = component_code if component else None
        item["component_value_id_v6"] = component.get("value_id") if component else None
        unit_meta = UNIT_META.get(item.get("unit") or "", {"ru": item.get("unit") or "", "en": item.get("unit") or ""})
        item["unit_ru"] = unit_meta["ru"]
        item["unit_en"] = unit_meta["en"]
    return result


def htei_workspace_payload(conn, iso3: str, requested_year: int, requested_mode: str = "common_support") -> dict[str, Any]:
    iso3 = iso3.upper()
    country = _country(conn, iso3)
    if not country:
        raise KeyError(f"Unknown country {iso3}")
    mode_catalog = _mode_catalog(conn, iso3)
    effective_mode, fallback = _effective_mode(mode_catalog, requested_mode)
    profile = row(
        conn,
        """SELECT * FROM htei_v6_profiles
           WHERE release_year=? AND iso3=? AND mode=?""",
        (RELEASE_YEAR, iso3, effective_mode),
    )
    if not profile:
        return {
            "schema_version": "htei-workspace-v1",
            "requested_year": requested_year,
            "release_year": RELEASE_YEAR,
            "requested_mode": requested_mode,
            "effective_mode": effective_mode,
            "fallback": fallback,
            "country": country,
            "mode_catalog": mode_catalog,
            "available": False,
            "reason_ru": "Для страны отсутствует профиль HTEI.",
            "reason_en": "No HTEI profile is available for the country.",
        }
    sources = _source_registry(conn)
    components = _component_payloads(conn, profile, sources)
    contribution_sum = sum(float(item.get("weighted_contribution") or 0) for item in components)
    weakest = min(components, key=lambda item: float(item["gap_to_top10"] or 0)) if components else None
    strongest = max(components, key=lambda item: float(item["normalized_score"] or 0)) if components else None
    ranking = _ranking(conn, effective_mode)
    ranking_mode = effective_mode in RANKED_MODES
    audit = _audit(conn)
    unique_sources: list[dict[str, Any]] = []
    for source_id in sorted({item.get("source_id") for item in components if item.get("source_id")}):
        source = sources.get(source_id, {})
        used = [item for item in components if item.get("source_id") == source_id]
        unique_sources.append(
            {
                "source_id": source_id,
                "name_ru": SOURCE_PUBLIC_NAMES.get(source_id, {}).get("ru") or source.get("source_name"),
                "name_en": SOURCE_PUBLIC_NAMES.get(source_id, {}).get("en") or source.get("source_name"),
                "owner": source.get("owner"),
                "source_url": source.get("source_url") or source.get("url"),
                "retrieved_at": max((item.get("retrieved_at") or "" for item in used), default="") or source.get("retrieved_at"),
                "component_count": len(used),
                "oldest_source_year": min((item["source_data_year"] for item in used if item.get("source_data_year") is not None), default=None),
                "newest_source_year": max((item["source_data_year"] for item in used if item.get("source_data_year") is not None), default=None),
            }
        )
    comparison_pairs = [
        ("direct_core", "proxy_extended"),
        ("common_support", "proxy_extended"),
    ]
    comparisons = [_comparison(conn, left, right) for left, right in comparison_pairs]
    distribution_scores = [float(item["score"]) for item in ranking]
    profile_payload = {
        "value_id": profile["profile_id"],
        "iso3": profile["iso3"],
        "mode": profile["mode"],
        "score": profile["substantive_score"],
        "rank": profile.get("rank"),
        "percentile": profile.get("percentile"),
        "confidence_score": profile["confidence_score"],
        "coverage_class": profile["coverage_class"],
        "freshness_class": profile["freshness_class"],
        "available_components": profile["available_components"],
        "available_weight": profile["available_weight"],
        "source_group_count": profile["source_group_count"],
        "oldest_source_year": profile["oldest_source_year"],
        "newest_source_year": profile["newest_source_year"],
        "average_lag": profile["average_lag"],
        "score_low": profile.get("score_low"),
        "score_high": profile.get("score_high"),
        "rank_low": profile.get("rank_low"),
        "rank_high": profile.get("rank_high"),
        "eligible_for_ranking": profile["eligible_for_ranking"],
        "direct_data_tier": profile["direct_data_tier"],
        "component_signature": profile["component_signature"],
        "formula_version": profile["formula_version"],
        "methodology_status": profile["methodology_status"],
    }
    return {
        "schema_version": "htei-workspace-v1",
        "available": True,
        "requested_year": requested_year,
        "release_year": RELEASE_YEAR,
        "requested_mode": requested_mode,
        "effective_mode": effective_mode,
        "fallback": fallback,
        "country": country,
        "mode_catalog": mode_catalog,
        "profile": profile_payload,
        "components": components,
        "ranking": ranking,
        "ranking_is_synchronous": ranking_mode,
        "ranking_total": len(ranking),
        "summary": {
            "contribution_sum": contribution_sum,
            "score_reconciliation_error": abs(contribution_sum - float(profile["substantive_score"])),
            "strongest_component": strongest,
            "priority_gap_component": weakest,
            "stale_component_count": sum(1 for item in components if (item.get("data_lag") or 0) > 3),
            "direct_component_count": sum(1 for item in components if item.get("proxy_kind") == "direct"),
            "proxy_component_count": sum(1 for item in components if item.get("proxy_kind") == "proxy"),
            "mixed_component_count": sum(1 for item in components if item.get("proxy_kind") == "mixed"),
        },
        "distribution": {
            "minimum": min(distribution_scores) if distribution_scores else None,
            "q25": _quantile(distribution_scores, 0.25),
            "median": _quantile(distribution_scores, 0.5),
            "q75": _quantile(distribution_scores, 0.75),
            "maximum": max(distribution_scores) if distribution_scores else None,
            "mean": _mean(distribution_scores),
        },
        "comparisons": comparisons,
        "sources": unique_sources,
        "formula": _formula(conn, profile, components),
        "audit": audit,
        "policies": _policies(conn, iso3, components),
        "methodology": {
            "status_ru": "Финальная методология сравнения HTEI v6",
            "status_en": "HTEI v6 final comparison methodology",
            "quality_is_separate_from_score": True,
            "docs_path": "docs/HTEI_METHODOLOGY_V6.md",
            "manifest_path": "data/raw/HTEI_FINAL_V6/2026/htei_final_v6_manifest.json",
        },
    }


def htei_workspace_csv(conn, mode: str) -> str:
    if mode not in RANKED_MODES:
        raise ValueError("ASOF diagnostic profiles are not ranked")
    ranking = _ranking(conn, mode)
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "rank",
            "iso3",
            "country_ru",
            "country_en",
            "score",
            "percentile",
            "confidence_score",
            "coverage_class",
            "freshness_class",
            "available_components",
            "available_weight",
            "oldest_source_year",
            "newest_source_year",
            "average_lag",
            "value_id",
        ]
    )
    for item in ranking:
        writer.writerow(
            [
                item.get("rank"),
                item.get("iso3"),
                item.get("name_ru"),
                item.get("name_en"),
                item.get("score"),
                item.get("percentile"),
                item.get("confidence_score"),
                item.get("coverage_class"),
                item.get("freshness_class"),
                item.get("available_components"),
                item.get("available_weight"),
                item.get("oldest_source_year"),
                item.get("newest_source_year"),
                item.get("average_lag"),
                item.get("value_id"),
            ]
        )
    return buffer.getvalue()


def htei_v6_provenance(conn, value_id: str) -> dict[str, Any] | None:
    profile = row(conn, "SELECT * FROM htei_v6_profiles WHERE profile_id=?", (value_id,))
    if profile:
        snapshot = row(conn, "SELECT * FROM raw_snapshots WHERE snapshot_id='HTEI_FINAL_V6:2026'") or {}
        component_rows = rows(
            conn,
            "SELECT value_id,source_id,source_group,source_data_year,raw_snapshot_path,raw_snapshot_sha256 FROM htei_v6_component_values WHERE profile_id=? ORDER BY component_code",
            (value_id,),
        )
        return {
            "value_id": profile["profile_id"],
            "source_id": "HTEI_FINAL_V6",
            "source_name": "HTEI final comparison methodology v6",
            "source_owner": "MGIMO University / FCTAS RAS project team",
            "source_url": snapshot.get("source_url") or "local:docs/HTEI_METHODOLOGY_V6.md",
            "retrieved_at": snapshot.get("retrieved_at"),
            "release_year": profile["release_year"],
            "source_data_year": profile["newest_source_year"],
            "raw_snapshot_path": snapshot.get("raw_snapshot_path"),
            "raw_snapshot_sha256": snapshot.get("raw_snapshot_sha256"),
            "transform_id": "build_htei_final_v6",
            "transformation_run_id": f"htei-v6:{profile['mode']}:{profile['release_year']}",
            "formula_version": profile["formula_version"],
            "quality_flag": profile["coverage_class"],
            "is_official": False,
            "is_recomputed": True,
            "mode": profile["mode"],
            "confidence_score": profile["confidence_score"],
            "available_components": profile["available_components"],
            "available_weight": profile["available_weight"],
            "oldest_source_year": profile["oldest_source_year"],
            "newest_source_year": profile["newest_source_year"],
            "component_value_ids": [item["value_id"] for item in component_rows],
            "source_group_coverage": sorted({item["source_group"] for item in component_rows if item.get("source_group")}),
            "underlying_sources": sorted({item["source_id"] for item in component_rows if item.get("source_id")}),
            "provenance": json.loads(profile.get("provenance_json") or "{}"),
        }
    component = row(
        conn,
        """SELECT v.*,s.source_name,s.owner,s.source_url AS registry_source_url,s.url AS registry_url,
                  s.license_or_terms,s.retrieved_at AS registry_retrieved_at
           FROM htei_v6_component_values v
           LEFT JOIN source_registry s ON s.source_id=v.source_id
           WHERE v.value_id=?""",
        (value_id,),
    )
    if not component:
        return None
    return {
        "value_id": component["value_id"],
        "profile_id": component["profile_id"],
        "source_id": component["source_id"],
        "source_name": component.get("source_name") or component["source_id"],
        "source_owner": component.get("owner"),
        "source_url": component.get("source_url") or component.get("registry_source_url") or component.get("registry_url"),
        "retrieved_at": component.get("retrieved_at") or component.get("registry_retrieved_at"),
        "release_year": component["release_year"],
        "source_data_year": component["source_data_year"],
        "raw_snapshot_path": component.get("raw_snapshot_path"),
        "raw_snapshot_sha256": component.get("raw_snapshot_sha256"),
        "transform_id": "build_htei_final_v6",
        "transformation_run_id": f"htei-v6:{component['mode']}:{component['release_year']}",
        "formula_version": row(conn, "SELECT formula_version FROM htei_v6_profiles WHERE profile_id=?", (component["profile_id"],)).get("formula_version"),
        "quality_flag": component.get("quality_flag"),
        "is_official": False,
        "is_recomputed": True,
        "mode": component["mode"],
        "component_code": component["component_code"],
        "indicator_code": component.get("indicator_code"),
        "raw_value": component.get("raw_value"),
        "unit": component.get("unit"),
        "normalized_score": component.get("normalized_score"),
        "base_weight": component.get("base_weight"),
        "effective_weight": component.get("effective_weight"),
        "weighted_contribution": component.get("weighted_contribution"),
        "proxy_status": component.get("proxy_status"),
        "selection_rule": component.get("selection_rule"),
        "interpretation_ru": component.get("interpretation_ru"),
        "interpretation_en": component.get("interpretation_en"),
        "license_or_terms": component.get("license_or_terms"),
        "provenance": json.loads(component.get("provenance_json") or "{}"),
    }
