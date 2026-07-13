from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from .db import row, rows

STATUS_LABELS = {
    "closed_numeric": {"ru": "закрыто числовыми данными", "en": "closed with numeric data"},
    "closed_evidence": {"ru": "закрыто доказательным слоем", "en": "closed with evidence layer"},
    "partial": {"ru": "частично выполнено", "en": "partially completed"},
    "blocked": {"ru": "не выполнено", "en": "blocked"},
}

# Only the four actual task/result pairs from the original MGIMO terms of reference.
TZ_ITEMS: list[dict[str, Any]] = [
    {
        "id": "2.1",
        "result_id": "3.1.2",
        "requirement_ru": "Создание интегрированной базы данных по трудовым ресурсам в высокотехнологичных отраслях на основе агрегации данных международных организаций (МОТ, ОЭСР, Всемирный банк), национальных статистических служб, корпоративной отчетности и специализированных рейтингов (Global Talent Competitiveness Index, Human Capital Index и др.).",
        "requirement_en": "Create an integrated database on labour resources in high-technology industries by aggregating data from international organizations, national statistical offices, corporate reporting and specialized ratings.",
        "expected_ru": "Создана интегрированная база данных по трудовым ресурсам в высокотехнологичных отраслях на основе агрегации данных международных организаций (МОТ, ОЭСР, Всемирный банк), национальных статистических служб, корпоративной отчетности и специализированных рейтингов (Global Talent Competitiveness Index, Human Capital Index и др.).",
        "expected_en": "An integrated database on labour resources in high-technology industries has been created.",
        "db_tables": ["countries", "source_registry", "raw_snapshots", "source_observations", "component_values", "index_scores", "national_statistics_metrics", "corporate_metrics"],
        "ui_screens": ["Профиль страны", "Методология и источники", "ТЗ МГИМО / Приёмка"],
    },
    {
        "id": "2.2",
        "result_id": "3.2.1",
        "requirement_ru": "Формирование системы индикаторов для мониторинга развития технологических кадров, включая Индекс занятости в высокотехнологичных отраслях (High-tech employment index).",
        "requirement_en": "Build an indicator system for monitoring technological workforce development, including the High-Tech Employment Index.",
        "expected_ru": "Сформирована система индикаторов для мониторинга развития технологических кадров, включая Индекс занятости в высокотехнологичных отраслях (High-tech employment index).",
        "expected_en": "An indicator system for monitoring technological workforce development, including the High-Tech Employment Index, has been created.",
        "db_tables": ["index_definitions", "components", "index_formulas", "source_observations", "htei_v6_profiles", "htei_v6_component_values", "methodology_audit_runs"],
        "ui_screens": ["Индекс занятости в высокотехнологичных отраслях", "Методология и источники", "ТЗ МГИМО / Приёмка"],
    },
    {
        "id": "2.3",
        "result_id": "3.3.1",
        "requirement_ru": "Разработка модели оценки конкурентоспособности национальных систем подготовки кадров для высокотехнологичных отраслей на основе анализа институциональной среды, образовательной инфраструктуры, корпоративных стратегий и международного сотрудничества.",
        "requirement_en": "Develop a model for assessing the competitiveness of national training systems for high-technology industries based on institutional environment, educational infrastructure, corporate strategies and international cooperation.",
        "expected_ru": "Разработана модель оценки конкурентоспособности национальных систем подготовки кадров для высокотехнологичных отраслей на основе анализа институциональной среды, образовательной инфраструктуры, корпоративных стратегий и международного сотрудничества.",
        "expected_en": "A competitiveness model for national training systems for high-technology industries has been developed.",
        "db_tables": ["training_model_scores", "training_model_components", "methodology_audit_runs"],
        "ui_screens": ["Модель подготовки кадров", "Профиль страны", "ТЗ МГИМО / Приёмка"],
    },
    {
        "id": "2.4",
        "result_id": "3.4.1",
        "requirement_ru": "Подготовка практических рекомендаций по формированию трудовых ресурсов в высокотехнологичных отраслях Российской Федерации.",
        "requirement_en": "Prepare practical recommendations for developing workforce capacity in high-technology industries of the Russian Federation.",
        "expected_ru": "Подготовлены практические рекомендации по формированию трудовых ресурсов в высокотехнологичных отраслях Российской Федерации.",
        "expected_en": "Practical recommendations for developing workforce capacity in high-technology industries of the Russian Federation have been prepared.",
        "db_tables": ["policy_brief_items", "diagnostics", "htei_v6_component_values", "training_model_components"],
        "ui_screens": ["Профиль страны", "Практические рекомендации для России", "ТЗ МГИМО / Приёмка"],
    },
]

PRODUCT_REQUIREMENTS = [
    {"id": "DATA-01", "title_ru": "Провенанс, raw snapshots и SHA-256", "title_en": "Provenance, raw snapshots and SHA-256"},
    {"id": "UX-01", "title_ru": "RU/EN, светлая/тёмная темы и адаптивная вёрстка", "title_en": "RU/EN, light/dark themes and responsive layout"},
    {"id": "QA-01", "title_ru": "Python, API, Playwright и визуальная регрессия", "title_en": "Python, API, Playwright and visual regression"},
    {"id": "REL-01", "title_ru": "Воспроизводимая поставка и release evidence", "title_en": "Reproducible delivery and release evidence"},
]


def _count(conn: sqlite3.Connection, sql: str, params: tuple[Any, ...] = ()) -> int:
    value = row(conn, sql, params)
    return int(value["n"]) if value and value.get("n") is not None else 0


def _statuses(conn: sqlite3.Connection) -> dict[str, tuple[str, str, str]]:
    national_rows = _count(conn, "SELECT COUNT(*) AS n FROM national_statistics_metrics")
    national_countries = _count(conn, "SELECT COUNT(DISTINCT iso3) AS n FROM national_statistics_metrics")
    corporate_rows = _count(conn, "SELECT COUNT(*) AS n FROM corporate_metrics")
    corporate_companies = _count(conn, "SELECT COUNT(DISTINCT company_id) AS n FROM corporate_metrics")
    corporate_countries = _count(conn, "SELECT COUNT(DISTINCT iso3) AS n FROM corporate_metrics")
    international_numeric = _count(conn, "SELECT COUNT(*) AS n FROM source_observations WHERE index_code='HTEI'")
    if national_rows >= 20 and national_countries >= 4 and corporate_rows >= 20 and corporate_companies >= 5 and corporate_countries >= 3:
        status_21 = "closed_numeric"
    elif international_numeric > 0:
        status_21 = "partial"
    else:
        status_21 = "blocked"
    lim_21_ru = (
        f"Международный числовой слой интегрирован. Национальная статистика: {national_rows} строк / {national_countries} стран; "
        f"корпоративная отчётность: {corporate_rows} строк / {corporate_companies} компаний / {corporate_countries} стран. "
        "Пункт считается полностью закрытым только после числовой интеграции обоих слоёв."
    )
    lim_21_en = (
        f"International numeric data are integrated. National statistics: {national_rows} rows / {national_countries} countries; "
        f"corporate reporting: {corporate_rows} rows / {corporate_companies} companies / {corporate_countries} countries. "
        "The item is fully closed only after both numeric layers are integrated."
    )

    has_v6 = bool(_count(conn, "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='htei_v6_profiles'"))
    if has_v6:
        core_profiles = _count(conn, "SELECT COUNT(*) AS n FROM htei_v6_profiles WHERE release_year=2026 AND mode='common_support' AND eligible_for_ranking=1")
        direct_profiles = _count(conn, "SELECT COUNT(*) AS n FROM htei_v6_profiles WHERE release_year=2026 AND mode='direct_core' AND eligible_for_ranking=1")
        asof_profiles = _count(conn, "SELECT COUNT(*) AS n FROM htei_v6_profiles WHERE release_year=2026 AND mode='asof_diagnostic' AND rank IS NULL")
    else:
        core_profiles = _count(conn, "SELECT COUNT(*) AS n FROM htei_v5_profiles WHERE release_year=2026 AND mode='comparable_core' AND eligible_for_ranking=1")
        direct_profiles = 0
        asof_profiles = _count(conn, "SELECT COUNT(*) AS n FROM htei_v5_profiles WHERE release_year=2026 AND mode='asof_diagnostic' AND rank IS NULL")
    audit_pass = _count(conn, "SELECT COUNT(*) AS n FROM methodology_audit_runs WHERE model_code='HTEI_V5' AND sensitivity_passed=1")
    status_22 = "closed_numeric" if core_profiles >= 75 and asof_profiles >= 200 and audit_pass else "partial" if core_profiles else "blocked"
    lim_22_ru = f"Единое сопоставимое пространство HTEI: {core_profiles} стран; прямой слой: {direct_profiles}; диагностические ASOF-профили без ранга: {asof_profiles}; внутренний статистический аудит: {'пройден' if audit_pass else 'не пройден'}."
    lim_22_en = f"HTEI common-support universe: {core_profiles} countries; direct-data tier: {direct_profiles}; unranked ASOF diagnostic profiles: {asof_profiles}; internal statistical audit: {'passed' if audit_pass else 'not passed'}."

    training_scores = _count(conn, "SELECT COUNT(*) AS n FROM training_model_scores")
    training_audit = _count(conn, "SELECT COUNT(*) AS n FROM methodology_audit_runs WHERE model_code='TRAINING_MODEL_V2' AND sensitivity_passed=1")
    status_23 = "closed_numeric" if training_scores > 0 and training_audit else "partial" if training_scores else "blocked"
    lim_23_ru = f"Оценок модели: {training_scores}; анализ чувствительности: {'пройден' if training_audit else 'не завершён'}. Весовая схема и методическая конструкция закреплены утверждённым отчётом по НИР."
    lim_23_en = f"Model scores: {training_scores}; sensitivity audit: {'passed' if training_audit else 'not completed'}. The weighting scheme and methodological construction are fixed by the approved research report."

    policy_items = _count(conn, "SELECT COUNT(*) AS n FROM policy_brief_items WHERE iso3='RUS' AND editorial_status LIKE 'release_%'")
    status_24 = "closed_numeric" if policy_items >= 6 else "partial" if policy_items else "blocked"
    lim_24_ru = f"Содержательно отредактированных рекомендаций для России: {policy_items}; каждая мера связана с показателем, источником, актором, горизонтом, KPI, риском и мониторингом."
    lim_24_en = f"Editorially prepared recommendations for Russia: {policy_items}; each measure is linked to an indicator, source, actor, horizon, KPI, risk and monitoring."
    return {
        "2.1": (status_21, lim_21_ru, lim_21_en),
        "2.2": (status_22, lim_22_ru, lim_22_en),
        "2.3": (status_23, lim_23_ru, lim_23_en),
        "2.4": (status_24, lim_24_ru, lim_24_en),
    }


def acceptance_payload(conn: sqlite3.Connection, lang: str = "ru") -> dict[str, Any]:
    statuses = _statuses(conn)
    facts = {
        "countries": _count(conn, "SELECT COUNT(*) AS n FROM countries"),
        "indices": _count(conn, "SELECT COUNT(*) AS n FROM indices"),
        "index_scores": _count(conn, "SELECT COUNT(*) AS n FROM index_scores"),
        "component_values": _count(conn, "SELECT COUNT(*) AS n FROM component_values"),
        "source_observations": _count(conn, "SELECT COUNT(*) AS n FROM source_observations"),
        "raw_snapshots": _count(conn, "SELECT COUNT(*) AS n FROM raw_snapshots"),
        "htei_common_support": _count(conn, "SELECT COUNT(*) AS n FROM htei_v6_profiles WHERE mode='common_support' AND eligible_for_ranking=1"),
        "htei_direct_core": _count(conn, "SELECT COUNT(*) AS n FROM htei_v6_profiles WHERE mode='direct_core' AND eligible_for_ranking=1"),
        "htei_asof_profiles": _count(conn, "SELECT COUNT(*) AS n FROM htei_v6_profiles WHERE mode='asof_diagnostic' AND rank IS NULL"),
        "training_model_scores": _count(conn, "SELECT COUNT(*) AS n FROM training_model_scores"),
        "qs_institution_rankings": _count(conn, "SELECT COUNT(*) AS n FROM qs_institution_rankings"),
        "policy_brief_items": _count(conn, "SELECT COUNT(*) AS n FROM policy_brief_items WHERE iso3='RUS'"),
    }
    items = []
    for item in TZ_ITEMS:
        status, lim_ru, lim_en = statuses[item["id"]]
        selected = dict(item)
        selected["status"] = status
        selected["requirement"] = item["requirement_ru"] if lang == "ru" else item["requirement_en"]
        selected["expected_result"] = item["expected_ru"] if lang == "ru" else item["expected_en"]
        selected["limitations"] = lim_ru if lang == "ru" else lim_en
        selected["status_label"] = STATUS_LABELS[status][lang]
        items.append(selected)
    counts = {s: sum(1 for i in items if i["status"] == s) for s in STATUS_LABELS}
    fully_closed = counts["partial"] == 0 and counts["blocked"] == 0
    root = Path(__file__).resolve().parents[1]
    fresh_playwright = (root / "audit_evidence" / "playwright" / "final_v6_playwright_manifest.json").exists()
    product_status = {
        "DATA-01": "implemented_and_tested",
        "UX-01": "implemented_pending_fresh_visual_evidence" if not fresh_playwright else "implemented_and_tested",
        "QA-01": "implemented_pending_fresh_playwright_evidence" if not fresh_playwright else "implemented_and_tested",
        "REL-01": "release_candidate_with_external_blockers",
    }
    product = []
    for requirement in PRODUCT_REQUIREMENTS:
        title = requirement["title_ru"] if lang == "ru" else requirement["title_en"]
        product.append({**requirement, "title": title, "status": product_status[requirement["id"]]})
    return {
        "lang": lang,
        "title_ru": "ТЗ МГИМО / Приёмка",
        "title_en": "MGIMO ToR / Acceptance",
        "summary": {
            "status": "all_four_tor_results_closed" if fully_closed else "tor_results_require_completion",
            "status_label_ru": "все четыре результата исходного ТЗ закрыты" if fully_closed else "не все четыре результата исходного ТЗ закрыты полностью",
            "status_label_en": "all four original ToR results are closed" if fully_closed else "not all four original ToR results are fully closed",
            "items_total": 4,
            "items_closed": sum(1 for i in items if i["status"] == "closed_numeric"),
            "status_counts": counts,
            "facts": facts,
        },
        "items": items,
        "product_requirements": product,
        "numbering_rule_ru": "В приёмочной матрице используются только четыре реальные пары исходного ТЗ: 2.1→3.1.2, 2.2→3.2.1, 2.3→3.3.1, 2.4→3.4.1. Дополнительные продуктовые требования имеют собственные идентификаторы DATA/UX/QA/REL.",
        "numbering_rule_en": "The acceptance matrix contains only the four actual ToR pairs: 2.1→3.1.2, 2.2→3.2.1, 2.3→3.3.1 and 2.4→3.4.1. Additional product requirements use DATA/UX/QA/REL identifiers.",
    }
