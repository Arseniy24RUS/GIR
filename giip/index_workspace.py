from __future__ import annotations

import csv
import io
import math
import statistics
from typing import Any, Iterable

from .db import row, rows

STANDARD_INDEX_CODES = ("HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET")
INDEX_ORDER = (*STANDARD_INDEX_CODES, "HTEI")

SCALE_META: dict[str, dict[str, Any]] = {
    "HDI": {
        "max": 100.0,
        "label_ru": "0–100 (официальный HDI × 100)",
        "label_en": "0–100 (official HDI × 100)",
        "status_ru": "Официальный индекс UNDP",
        "status_en": "Official UNDP index",
    },
    "HCI_PLUS": {
        "max": 325.0,
        "label_ru": "0–325, официальная шкала HCI+ 2026",
        "label_en": "0–325, official HCI+ 2026 scale",
        "status_ru": "Официальная актуальная редакция Всемирного банка",
        "status_en": "Official current World Bank edition",
    },
    "GTCI": {
        "max": 100.0,
        "label_ru": "0–100",
        "label_en": "0–100",
        "status_ru": "Официальный итоговый score Portulans Institute",
        "status_en": "Official Portulans Institute score",
    },
    "GII": {
        "max": 100.0,
        "label_ru": "0–100",
        "label_en": "0–100",
        "status_ru": "Официальный итоговый score WIPO",
        "status_en": "Official WIPO score",
    },
    "IDI": {
        "max": 100.0,
        "label_ru": "0–100",
        "label_en": "0–100",
        "status_ru": "Официальный итоговый score ITU",
        "status_en": "Official ITU score",
    },
    "QS_ET": {
        "max": 100.0,
        "label_ru": "0–100, авторская страновая агрегация",
        "label_en": "0–100, platform country aggregation",
        "status_ru": "Производная страновая оценка из официальных строк QS",
        "status_en": "Derived country score from official QS rows",
    },
}

COUNTRY_KEYS = ("iso3", "iso2", "name_ru", "name_en", "region", "income_group", "flag")
RANKING_KEYS = (
    "value_id", "iso3", "name_ru", "name_en", "iso2", "region", "income_group", "flag",
    "score", "rank", "percentile", "year", "source_data_year", "release_year", "data_quality",
    "rank_delta_1y", "rank_delta_5y", "source_id", "source_name", "source_url", "quality_flag",
    "is_official", "is_recomputed",
)
PROVENANCE_KEYS = (
    "value_id", "source_id", "source_name", "source_owner", "source_url", "license_or_terms",
    "retrieved_at", "release_year", "raw_snapshot_path", "raw_snapshot_sha256", "transform_id",
    "transformation_run_id", "formula_version", "quality_flag", "is_official", "is_recomputed",
    "source_data_year", "indicator_code", "unit", "raw_value", "normalized_score",
)
COMPONENT_KEYS = (
    "value_id", "component_code", "name_ru", "name_en", "raw_value", "unit", "normalized_score",
    "weighted_contribution", "weight", "source_data_year", "source_id", "source_url", "quality_flag",
    "formula_version", "is_official", "is_recomputed",
)


def _pick(item: dict[str, Any] | None, keys: Iterable[str]) -> dict[str, Any]:
    source = item or {}
    return {key: source.get(key) for key in keys if key in source}


def _finite(value: Any) -> float | None:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def _country_from_score(score: dict[str, Any] | None, ranking: list[dict[str, Any]], iso3: str) -> dict[str, Any]:
    row = next((item for item in ranking if item.get("iso3") == iso3), None) or score or {"iso3": iso3}
    return _pick(row, COUNTRY_KEYS)


def _distribution(values: list[float], scale_max: float, bin_count: int = 10) -> list[dict[str, Any]]:
    if not values:
        return []
    upper = max(scale_max, max(values))
    lower = 0.0 if min(values) >= 0 else min(values)
    step = (upper - lower) / bin_count or 1.0
    bins = [{"from": lower + step * i, "to": lower + step * (i + 1), "count": 0} for i in range(bin_count)]
    for value in values:
        index = min(bin_count - 1, max(0, int((value - lower) / step)))
        bins[index]["count"] += 1
    return bins


def _summary(values: list[float], ranking: list[dict[str, Any]]) -> dict[str, Any]:
    if not values:
        return {"country_count": 0}
    sorted_values = sorted(values, reverse=True)
    top_n = max(1, math.ceil(len(sorted_values) * 0.1))
    data_years = [_finite(item.get("source_data_year")) for item in ranking]
    data_years = [int(item) for item in data_years if item is not None]
    return {
        "country_count": len(values),
        "mean": statistics.fmean(values),
        "median": statistics.median(values),
        "minimum": min(values),
        "maximum": max(values),
        "top10_threshold": sorted_values[top_n - 1],
        "data_year_min": min(data_years) if data_years else None,
        "data_year_max": max(data_years) if data_years else None,
    }


def _hci_plus_components(combined: dict[str, Any] | None) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    combined = combined or {}
    current = combined.get("hci_plus") or {}
    components = []
    specs = [
        ("HEALTH", "Здоровье", "Health", "health_score"),
        ("EDUCATION", "Образование", "Education", "education_score"),
        ("EMPLOYMENT", "Занятость", "Employment", "employment_score"),
    ]
    for code, ru, en, key in specs:
        value = _finite(current.get(key))
        if value is None:
            continue
        components.append({
            "value_id": f"HCI_PLUS:{current.get('iso3') or combined.get('iso3')}:{current.get('year') or 2026}:{code}",
            "component_code": code,
            "name_ru": ru,
            "name_en": en,
            "raw_value": value,
            "unit": "official HCI+ pillar points",
            "normalized_score": value,
            "weighted_contribution": value,
            "weight": None,
            "source_data_year": current.get("year"),
            "source_id": current.get("source_id"),
            "source_url": current.get("source_url"),
            "quality_flag": current.get("quality_flag"),
            "is_official": True,
            "is_recomputed": False,
        })
    published_sum = sum(item["raw_value"] for item in components)
    score = _finite(current.get("score"))
    reconciliation = {
        "published_component_sum": published_sum,
        "official_total": score,
        "rounding_difference": None if score is None else score - published_sum,
        "note_ru": "Опубликованные блоки округлены до целых; официальный итоговый score имеет приоритет.",
        "note_en": "Published pillars are rounded to integers; the official total score is authoritative.",
    }
    return components, reconciliation


def _trend(full: dict[str, Any], code: str, iso3: str) -> tuple[list[dict[str, Any]], dict[str, Any] | None]:
    if code == "HCI_PLUS":
        combined = full.get("human_capital_combined") or {}
        values = []
        for item in combined.get("display_series") or []:
            values.append({
                "year": item.get("year"),
                "source_data_year": item.get("source_data_year"),
                "score": item.get("score"),
                "display_score": item.get("display_score_325"),
                "rank": item.get("rank"),
                "edition": item.get("edition"),
                "comparable_to_current": bool(item.get("comparable_to_hci_plus")),
                "marker": item.get("marker"),
                "line_style": item.get("line_style"),
            })
        return values, {
            "break": True,
            "warning_ru": combined.get("warning_ru"),
            "warning_en": combined.get("warning_en"),
        }
    values = [
        {"year": item.get("year"), "score": item.get("score"), "rank": item.get("rank")}
        for item in full.get("series") or [] if item.get("iso3") == iso3
    ]
    return values, None


def standard_index_workspace_payload(full: dict[str, Any], iso3: str, requested_year: int) -> dict[str, Any]:
    index = full.get("index") or {}
    code = str(index.get("code") or "").upper()
    if code not in STANDARD_INDEX_CODES:
        raise KeyError(code)
    ranking = [_pick(item, RANKING_KEYS) for item in full.get("ranking") or []]
    score = (full.get("country_diagnostics") or {}).get("score") or next((item for item in ranking if item.get("iso3") == iso3), None)
    diagnostics = full.get("country_diagnostics") or {}
    if code == "HCI_PLUS":
        components, reconciliation = _hci_plus_components(full.get("human_capital_combined"))
    else:
        components = [_pick(item, COMPONENT_KEYS) for item in diagnostics.get("components") or []]
        reconciliation = None
    trend, methodology_break = _trend(full, code, iso3)
    numeric_scores = [value for value in (_finite(item.get("score")) for item in ranking) if value is not None]
    scale = SCALE_META[code]
    source_row = score or {}
    provenance = _pick(source_row.get("provenance") or source_row, PROVENANCE_KEYS)
    formula = full.get("formula") or {}
    methodology = full.get("methodology") or {}
    weakest = min(components, key=lambda item: _finite(item.get("normalized_score")) if _finite(item.get("normalized_score")) is not None else math.inf, default=None)
    strongest = max(components, key=lambda item: _finite(item.get("normalized_score")) if _finite(item.get("normalized_score")) is not None else -math.inf, default=None)
    return {
        "schema_version": "gir-index-workspace-v1",
        "requested_year": requested_year,
        "country": _country_from_score(score, ranking, iso3),
        "index": {
            "code": code,
            "name_ru": index.get("name_ru") or index.get("name"),
            "name_en": index.get("name_en") or index.get("name"),
            "short_name_ru": index.get("short_name_ru") or index.get("short_name") or code,
            "short_name_en": index.get("short_name_en") or index.get("short_name") or code,
            "authority": index.get("authority"),
            "url": index.get("url"),
            "description_ru": index.get("description_ru"),
            "description_en": index.get("description_en"),
            "official_or_derived": index.get("official_or_derived"),
            "scale": scale,
            "methodology": _pick(methodology, ("score_status", "component_status", "formula_status", "methodology_version", "label_ru", "label_en", "warning_ru", "warning_en", "source_url", "updated_at")),
        },
        "score": _pick(score, RANKING_KEYS + ("retrieved_at", "raw_snapshot_path", "raw_snapshot_sha256", "formula_version", "transformation_run_id", "transform_id")),
        "summary": _summary(numeric_scores, ranking),
        "ranking": ranking,
        "distribution": _distribution(numeric_scores, float(scale["max"])),
        "components": components,
        "component_insight": {
            "weakest": weakest,
            "strongest": strongest,
            "reconciliation": reconciliation,
        },
        "trend": trend,
        "methodology_break": methodology_break,
        "formula": _pick(formula, ("formula_version", "formula_text_ru", "formula_text_en", "method_notes_ru", "method_notes_en", "weights_json", "normalization_ru", "normalization_en", "official_formula_available", "source_url")),
        "source": {
            "source_id": source_row.get("source_id"),
            "source_name": source_row.get("source_name"),
            "source_url": source_row.get("source_url"),
            "retrieved_at": source_row.get("retrieved_at"),
            "release_year": source_row.get("release_year"),
            "raw_snapshot_path": source_row.get("raw_snapshot_path"),
            "raw_snapshot_sha256": source_row.get("raw_snapshot_sha256"),
            "quality_flag": source_row.get("quality_flag"),
        },
        "provenance": provenance,
        "institutions": [
            _pick(item, (
                "year", "title", "city", "country", "iso3", "overall_score", "rank_display", "rank",
                "source_id", "source_url", "retrieved_at", "raw_snapshot_path",
                "raw_snapshot_sha256", "quality_flag",
            ))
            for item in (full.get("qs_institutions") or [])
        ] if code == "QS_ET" else [],
        "qs_summary": ({
            **_pick(full.get("summary") or {}, (
                "top100_count", "top250_count", "top500_count", "best_rank",
                "median_rank", "mean_rank", "country_score", "value_year",
            )),
            "institution_count": len(full.get("qs_institutions") or []),
        } if code == "QS_ET" else None),
    }


def index_workspace_csv(payload: dict[str, Any], lang: str = "ru") -> str:
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(["iso3", "country", "score", "rank", "percentile", "value_year", "source_data_year", "source_id", "quality_flag"])
    name_key = "name_ru" if lang == "ru" else "name_en"
    for item in payload.get("ranking") or []:
        writer.writerow([
            item.get("iso3"), item.get(name_key) or item.get("iso3"), item.get("score"), item.get("rank"),
            item.get("percentile"), item.get("year"), item.get("source_data_year"), item.get("source_id"), item.get("quality_flag"),
        ])
    return "\ufeff" + output.getvalue()


def platform_context_payload(conn, indices: list[dict[str, Any]], default_year: int) -> dict[str, Any]:
    countries = rows(conn, """SELECT iso3,iso2,name_ru,name_en,region,income_group,flag
        FROM countries ORDER BY COALESCE(name_en,name_ru,iso3)""")
    year_rows = rows(conn, "SELECT DISTINCT year FROM index_scores ORDER BY year")
    years = [int(item["year"]) for item in year_rows if item.get("year") is not None]
    index_items = []
    for item in indices:
        code = item.get("code")
        meta = SCALE_META.get(code, {"max": 100.0, "label_ru": "0–100", "label_en": "0–100", "status_ru": "", "status_en": ""})
        index_items.append({
            "code": code,
            "name_ru": item.get("name_ru") or item.get("name"),
            "name_en": item.get("name_en") or item.get("name"),
            "short_name_ru": item.get("short_name_ru") or item.get("short_name") or code,
            "short_name_en": item.get("short_name_en") or item.get("short_name") or code,
            "authority": item.get("authority"),
            "official_or_derived": item.get("official_or_derived"),
            "scale": meta,
        })
    counts = {
        "countries": len(countries),
        "scores": int((row(conn, "SELECT COUNT(*) AS n FROM index_scores") or {}).get("n") or 0),
        "components": int((row(conn, "SELECT COUNT(*) AS n FROM component_values") or {}).get("n") or 0),
        "raw_snapshots": int((row(conn, "SELECT COUNT(*) AS n FROM raw_snapshots") or {}).get("n") or 0),
    }
    return {
        "schema_version": "gir-platform-context-v1",
        "default_year": default_year,
        "years": years,
        "countries": countries,
        "regions": sorted({item.get("region") for item in countries if item.get("region")}),
        "income_groups": sorted({item.get("income_group") for item in countries if item.get("income_group")}),
        "indices": index_items,
        "facts": counts,
    }
