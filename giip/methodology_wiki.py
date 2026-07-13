from __future__ import annotations

import mimetypes
from collections import Counter
from pathlib import Path
from typing import Any

from .db import row, rows

INDEX_ORDER = ["HDI", "HCI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET", "HTEI"]

PUBLIC_CLASSIFICATION = {
    "HDI": ("official", "официальный индекс", "official index"),
    "HCI": ("historical", "официальная историческая редакция", "official historical edition"),
    "HCI_PLUS": ("official", "официальный индекс", "official index"),
    "GTCI": ("official", "официальный индекс", "official index"),
    "GII": ("official", "официальный индекс", "official index"),
    "IDI": ("official", "официальный индекс", "official index"),
    "QS_ET": ("derived", "авторская страновая агрегация", "project country aggregation"),
    "HTEI": ("project", "авторский индекс проекта", "project composite index"),
}


def _table_exists(conn, name: str) -> bool:
    return bool(row(conn, "SELECT 1 AS ok FROM sqlite_master WHERE type='table' AND name=?", (name,)))


def _count(conn, table: str, where: str = "", params: tuple[Any, ...] = ()) -> int:
    if not _table_exists(conn, table):
        return 0
    suffix = f" WHERE {where}" if where else ""
    return int(row(conn, f'SELECT COUNT(*) AS n FROM "{table}"{suffix}', params)["n"] or 0)


def _extension(path: str | None, content_type: str | None = None) -> str:
    suffix = Path(path or "").suffix.lower().lstrip(".")
    if suffix:
        if suffix in {"htm", "html"}:
            return "html"
        if suffix in {"xls", "xlsx"}:
            return "xlsx"
        return suffix
    guessed = mimetypes.guess_extension(content_type or "") or ""
    return guessed.lstrip(".") or "other"


def _archive_formats(conn) -> list[dict[str, Any]]:
    if not _table_exists(conn, "raw_snapshots"):
        return []
    counter: Counter[str] = Counter()
    bytes_by_type: Counter[str] = Counter()
    for item in rows(conn, "SELECT raw_snapshot_path,content_type,bytes_count FROM raw_snapshots"):
        kind = _extension(item.get("raw_snapshot_path"), item.get("content_type"))
        counter[kind] += 1
        bytes_by_type[kind] += int(item.get("bytes_count") or 0)
    return [
        {"format": kind, "count": counter[kind], "bytes": bytes_by_type[kind]}
        for kind in sorted(counter, key=lambda key: (-bytes_by_type[key], key))
    ]


def _index_registry(conn) -> list[dict[str, Any]]:
    if not _table_exists(conn, "indices"):
        return []
    index_rows = {item["code"]: item for item in rows(conn, "SELECT * FROM indices")}
    method_rows = {
        item["index_code"]: item
        for item in rows(conn, "SELECT * FROM index_methodology_registry")
    } if _table_exists(conn, "index_methodology_registry") else {}
    formula_rows: dict[str, list[dict[str, Any]]] = {}
    if _table_exists(conn, "index_formulas"):
        for item in rows(conn, "SELECT * FROM index_formulas ORDER BY index_code,formula_version"):
            formula_rows.setdefault(item["index_code"], []).append(item)

    result: list[dict[str, Any]] = []
    for code in INDEX_ORDER:
        index = index_rows.get(code)
        if not index:
            continue
        method = method_rows.get(code, {})
        classification, classification_ru, classification_en = PUBLIC_CLASSIFICATION.get(
            code, ("official", "официальный индекс", "official index")
        )
        latest_formula = (formula_rows.get(code) or [None])[-1]
        result.append(
            {
                "code": code,
                "short_name_ru": index.get("short_name_ru") or index.get("short_name") or code,
                "short_name_en": index.get("short_name_en") or index.get("short_name") or code,
                "name_ru": index.get("name_ru") or index.get("name") or code,
                "name_en": index.get("name_en") or index.get("name") or code,
                "authority": index.get("authority"),
                "source_url": method.get("source_url") or index.get("url"),
                "classification": classification,
                "classification_ru": classification_ru,
                "classification_en": classification_en,
                "methodology_version": method.get("methodology_version") or (latest_formula or {}).get("formula_version"),
                "formula_version": (latest_formula or {}).get("formula_version"),
                "label_ru": method.get("label_ru"),
                "label_en": method.get("label_en"),
                "warning_ru": method.get("warning_ru"),
                "warning_en": method.get("warning_en"),
                "component_status": method.get("component_status"),
                "formula_status": method.get("formula_status"),
            }
        )
    return result


def methodology_summary_payload(conn) -> dict[str, Any]:
    tables = rows(
        conn,
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    snapshots = rows(conn, "SELECT bytes_count,release_year FROM raw_snapshots") if _table_exists(conn, "raw_snapshots") else []
    release_years = [int(item["release_year"]) for item in snapshots if item.get("release_year") is not None]
    audit_rows = rows(
        conn,
        """SELECT audit_id,model_code,release_year,methodology_version,run_count,countries,
                  mean_spearman,min_spearman,mean_absolute_rank_change,max_rank_change,
                  sensitivity_passed,created_at
           FROM methodology_audit_runs ORDER BY release_year DESC,model_code""",
    ) if _table_exists(conn, "methodology_audit_runs") else []
    source_count = _count(conn, "source_registry")
    index_registry = _index_registry(conn)

    return {
        "schema_version": "gir-methodology-summary-v1",
        "document_edition": "2026-07-12",
        "release_label": "GIR customer final 2026",
        "scale": {
            "countries": _count(conn, "countries"),
            "database_tables": len(tables),
            "index_modules": len(index_registry),
            "source_registry": source_count,
            "index_scores": _count(conn, "index_scores"),
            "component_values": _count(conn, "component_values"),
            "source_observations": _count(conn, "source_observations"),
            "raw_snapshots": len(snapshots),
            "raw_archive_bytes": sum(int(item.get("bytes_count") or 0) for item in snapshots),
            "reproducibility_artifacts": _count(conn, "reproducibility_artifacts"),
            "formula_records": _count(conn, "index_formulas"),
            "methodology_registry_records": _count(conn, "index_methodology_registry"),
            "audit_runs": _count(conn, "methodology_audit_runs"),
            "training_model_scores": _count(conn, "training_model_scores"),
            "htei_v6_profiles": _count(conn, "htei_v6_profiles"),
            "data_year_min": min(release_years) if release_years else None,
            "data_year_max": max(release_years) if release_years else None,
        },
        "archive_formats": _archive_formats(conn),
        "index_registry": index_registry,
        "audits": audit_rows,
        "principles": [
            {
                "code": "official_vs_derived",
                "title_ru": "Официальное и рассчитанное разделены",
                "title_en": "Official and derived values are separated",
                "text_ru": "Интерфейс различает официальный индекс, официальный компонент, диагностику GIR и авторскую модель.",
                "text_en": "The interface distinguishes an official index, official component, GIR diagnostic and project model.",
            },
            {
                "code": "provenance",
                "title_ru": "Каждое значение имеет происхождение",
                "title_en": "Every value has provenance",
                "text_ru": "Отображаемая оценка связана с источником, snapshot, SHA-256, трансформацией и версией формулы.",
                "text_en": "A displayed value is linked to its source, snapshot, SHA-256, transformation and formula version.",
            },
            {
                "code": "quality_separate",
                "title_ru": "Качество не подменяет результат",
                "title_en": "Quality does not replace the result",
                "text_ru": "Покрытие, свежесть и доверие описывают надёжность интерпретации и не являются скрытым штрафом к score.",
                "text_en": "Coverage, freshness and confidence describe interpretive reliability and are not hidden score penalties.",
            },
            {
                "code": "limitations",
                "title_ru": "Границы вывода публикуются вместе с методом",
                "title_en": "Interpretation limits are published with the method",
                "text_ru": "Ранги, proxy, временные лаги и методологические разрывы сопровождаются явными ограничениями.",
                "text_en": "Ranks, proxies, time lags and methodology breaks are accompanied by explicit limitations.",
            },
        ],
    }
