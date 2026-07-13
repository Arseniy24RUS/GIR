from __future__ import annotations

import hashlib
import json
import re
import sqlite3
from pathlib import Path
from typing import Any

from .acceptance import acceptance_payload
from .db import row, rows
from .scientific_release import RELEASE_YEAR

PROJECT_ROOT = Path(__file__).resolve().parents[1]
HCI_PLUS_YEAR = 2026
RELEASE_VERSION = "GIIP-final-release-v6"


def _table_exists(conn: sqlite3.Connection, name: str) -> bool:
    result = row(conn, "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name=?", (name,))
    return bool(result and result["n"])


def _count(conn: sqlite3.Connection, sql: str, params: tuple[Any, ...] = ()) -> int:
    result = row(conn, sql, params)
    return int(result["n"]) if result and result.get("n") is not None else 0


def _block(blockers: list[dict[str, Any]], code: str, title_ru: str, title_en: str, evidence: Any, severity: str = "P0") -> None:
    blockers.append({"code": code, "severity": severity, "title_ru": title_ru, "title_en": title_en, "evidence": evidence})


def _warn(warnings: list[dict[str, Any]], code: str, title_ru: str, title_en: str, evidence: Any) -> None:
    warnings.append({"code": code, "severity": "P1", "title_ru": title_ru, "title_en": title_en, "evidence": evidence})


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _normalise_path(value: str | Path) -> Path:
    return PROJECT_ROOT / str(value).replace("\\", "/")


def _playwright_evidence_errors() -> list[str]:
    manifest_path = PROJECT_ROOT / "audit_evidence" / "playwright" / "final_v6_playwright_manifest.json"
    errors: list[str] = []
    if not manifest_path.exists():
        return ["final_v6_playwright_manifest.json is missing"]
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        stats = manifest.get("test_stats") or {}
        if int(stats.get("total") or 0) < 200 or any(int(stats.get(k) or 0) for k in ("failed", "skipped", "flaky")):
            errors.append(f"invalid test statistics: {stats}")
        required_projects = {
            "desktop-ru-dark", "desktop-ru-light", "desktop-en-dark", "desktop-en-light",
            "mobile-ru", "mobile-en", "tablet-ru", "tablet-en",
        }
        if not required_projects.issubset(set(stats.get("projects") or [])):
            errors.append("required Playwright projects are incomplete")
        for rel, expected in (manifest.get("file_hashes") or {}).items():
            path = _normalise_path(rel)
            if not path.exists():
                errors.append(f"hash target missing: {str(rel).replace(chr(92), '/')}")
            elif _sha256(path) != expected:
                errors.append(f"hash mismatch: {str(rel).replace(chr(92), '/')}")
        for path_key, sha_key in (("report_zip", "report_zip_sha256"), ("visual_baselines_zip", "visual_baselines_zip_sha256")):
            rel = manifest.get(path_key)
            if not rel:
                errors.append(f"{path_key} is missing")
                continue
            path = _normalise_path(rel)
            if not path.exists():
                errors.append(f"evidence archive missing: {str(rel).replace(chr(92), '/')}")
            elif _sha256(path) != manifest.get(sha_key):
                errors.append(f"evidence checksum mismatch: {str(rel).replace(chr(92), '/')}")
    except Exception as exc:  # pragma: no cover - defensive parsing
        errors.append(f"evidence manifest is invalid: {exc}")
    return errors


def _reproducibility_errors(conn: sqlite3.Connection) -> tuple[list[str], dict[str, int]]:
    errors: list[str] = []
    stats = {"snapshots": 0, "covered": 0, "raw": 0, "derived": 0, "recipes": 0}
    if not _table_exists(conn, "reproducibility_artifacts"):
        return ["reproducibility_artifacts table is missing"], stats
    snapshots = rows(conn, "SELECT snapshot_id,raw_snapshot_path,raw_snapshot_sha256 FROM raw_snapshots ORDER BY snapshot_id")
    stats["snapshots"] = len(snapshots)
    for snap in snapshots:
        artifacts = rows(conn, "SELECT * FROM reproducibility_artifacts WHERE snapshot_id=? ORDER BY artifact_type", (snap["snapshot_id"],))
        valid_types: set[str] = set()
        for artifact in artifacts:
            path = _normalise_path(artifact["artifact_path"])
            if not path.exists():
                errors.append(f"artifact missing: {artifact['artifact_path']}")
                continue
            if _sha256(path) != artifact["artifact_sha256"]:
                errors.append(f"artifact checksum mismatch: {artifact['artifact_path']}")
                continue
            valid_types.add(artifact["artifact_type"])
        raw_path = _normalise_path(snap["raw_snapshot_path"])
        raw_valid = raw_path.exists() and _sha256(raw_path) == snap["raw_snapshot_sha256"]
        if raw_valid:
            valid_types.add("raw_included")
        if not ("raw_included" in valid_types or {"derived_export", "download_recipe"}.issubset(valid_types)):
            errors.append(f"snapshot has neither verified raw file nor derived export plus download recipe: {snap['snapshot_id']}")
        else:
            stats["covered"] += 1
        for key, artifact_type in (("raw", "raw_included"), ("derived", "derived_export"), ("recipes", "download_recipe")):
            if artifact_type in valid_types:
                stats[key] += 1
    return errors, stats


def release_readiness_payload(conn: sqlite3.Connection) -> dict[str, Any]:
    blockers: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []

    required_tables = [
        "index_methodology_registry", "htei_v6_profiles", "htei_v6_component_values",
        "htei_v6_missingness_audit", "hci_plus_country_scores", "reproducibility_artifacts",
        "methodology_audit_runs", "policy_brief_items", "national_statistics_metrics",
        "corporate_metrics", "license_registry", "operational_runs",
    ]
    missing_tables = [name for name in required_tables if not _table_exists(conn, name)]
    if missing_tables:
        _block(blockers, "FINAL_SCHEMA_MISSING", "Не применена финальная миграция v6", "Final v6 schema has not been applied", missing_tables)

    acceptance = acceptance_payload(conn, "ru") if not missing_tables else {"items": [], "summary": {}}
    incomplete = [item for item in acceptance.get("items", []) if item.get("status") != "closed_numeric"]
    if incomplete:
        _block(
            blockers,
            "ORIGINAL_TOR_RESULTS_NOT_FULLY_CLOSED",
            "Не все четыре результата исходного ТЗ закрыты числовыми данными",
            "Not all four original ToR results are closed with numeric evidence",
            [{"id": item["id"], "result_id": item["result_id"], "status": item["status"], "limitations": item["limitations"]} for item in incomplete],
        )

    if not missing_tables:
        mode_stats = {
            mode: row(conn, """SELECT COUNT(*) AS n,AVG(confidence_score) AS quality,
                       MIN(oldest_source_year) AS oldest,MAX(newest_source_year) AS newest,
                       COUNT(DISTINCT component_signature) AS signatures
                       FROM htei_v6_profiles WHERE release_year=? AND mode=?""", (RELEASE_YEAR, mode)) or {}
            for mode in ("direct_core", "common_support", "proxy_extended", "asof_diagnostic")
        }
        if int(mode_stats["direct_core"].get("n") or 0) < 25:
            _block(blockers, "HTEI_DIRECT_CORE_TOO_SMALL", "Прямой слой HTEI содержит менее 25 стран", "HTEI direct-data tier contains fewer than 25 countries", mode_stats["direct_core"])
        if int(mode_stats["common_support"].get("n") or 0) < 75:
            _block(blockers, "HTEI_COMMON_SUPPORT_TOO_SMALL", "Сопоставимое пространство HTEI содержит менее 75 стран", "HTEI common-support universe contains fewer than 75 countries", mode_stats["common_support"])
        if int(mode_stats["common_support"].get("signatures") or 0) != 1:
            _block(blockers, "HTEI_COMMON_SUPPORT_NOT_COMMON", "Сопоставимый HTEI использует неодинаковый состав компонентов", "Comparable HTEI does not use one common component set", mode_stats["common_support"])
        if int(mode_stats["asof_diagnostic"].get("n") or 0) < 200:
            _block(blockers, "HTEI_ASOF_COVERAGE_BELOW_200", "Диагностический HTEI охватывает менее 200 стран и территорий", "HTEI diagnostic coverage is below 200 countries and territories", mode_stats["asof_diagnostic"])
        ranked_asof = _count(conn, "SELECT COUNT(*) AS n FROM htei_v6_profiles WHERE release_year=? AND mode='asof_diagnostic' AND rank IS NOT NULL", (RELEASE_YEAR,))
        if ranked_asof:
            _block(blockers, "HTEI_ASOF_HAS_RANKS", "ASOF-профили ошибочно получили места", "ASOF profiles incorrectly received ranks", {"ranked": ranked_asof})
        reconciliation = _count(conn, """SELECT COUNT(*) AS n FROM (
            SELECT p.profile_id,p.substantive_score,SUM(c.weighted_contribution) AS component_sum
            FROM htei_v6_profiles p JOIN htei_v6_component_values c ON c.profile_id=p.profile_id
            WHERE p.release_year=? GROUP BY p.profile_id
            HAVING ABS(p.substantive_score-component_sum)>0.0001)""", (RELEASE_YEAR,))
        if reconciliation:
            _block(blockers, "HTEI_SCORE_RECONCILIATION_FAILED", "Оценка HTEI не сходится с суммой вкладов", "HTEI score does not reconcile with component contributions", {"profiles": reconciliation})
        wrong_quality = _count(conn, """SELECT COUNT(*) AS n FROM htei_v6_profiles
            WHERE release_year=? AND (substantive_score<0 OR substantive_score>100 OR confidence_score<0 OR confidence_score>1)""", (RELEASE_YEAR,))
        if wrong_quality:
            _block(blockers, "HTEI_SCORE_OR_CONFIDENCE_OUT_OF_RANGE", "Оценка либо доверие HTEI вне допустимого диапазона", "HTEI score or confidence is outside the permitted range", {"profiles": wrong_quality})
        missingness_groups = _count(conn, "SELECT COUNT(*) AS n FROM htei_v6_missingness_audit WHERE release_year=?", (RELEASE_YEAR,))
        if missingness_groups < 4:
            _block(blockers, "HTEI_MISSINGNESS_AUDIT_MISSING", "Не выполнен аудит паттернов пропусков HTEI", "HTEI missingness-pattern audit is missing", {"rows": missingness_groups})
        audit = row(conn, "SELECT * FROM methodology_audit_runs WHERE model_code='HTEI_V6' AND release_year=?", (RELEASE_YEAR,))
        if not audit:
            audit = row(conn, "SELECT * FROM methodology_audit_runs WHERE model_code='HTEI_V5' AND release_year=?", (RELEASE_YEAR,))
        if not audit or not int(audit.get("sensitivity_passed") or 0) or int(audit.get("run_count") or 0) < 200:
            _block(blockers, "HTEI_SENSITIVITY_NOT_PASSED", "HTEI не прошёл внутренний анализ чувствительности", "HTEI internal sensitivity audit has not passed", audit)
        training_audit = row(conn, "SELECT * FROM methodology_audit_runs WHERE model_code='TRAINING_MODEL_V2' ORDER BY release_year DESC LIMIT 1")
        if not training_audit or not int(training_audit.get("sensitivity_passed") or 0):
            _block(blockers, "TRAINING_MODEL_SENSITIVITY_NOT_PASSED", "Модель подготовки кадров не прошла анализ чувствительности", "Training-system model sensitivity audit has not passed", training_audit)

        hci_plus = row(conn, "SELECT COUNT(*) AS n,MIN(score) AS min_score,MAX(score) AS max_score FROM hci_plus_country_scores WHERE year=?", (HCI_PLUS_YEAR,)) or {}
        if int(hci_plus.get("n") or 0) < 150:
            _block(blockers, "HCI_PLUS_2026_INCOMPLETE", "Не загружена актуальная официальная редакция HCI+ 2026 минимум для 150 стран", "Current official HCI+ 2026 edition is not loaded for at least 150 countries", hci_plus)
        historical_hci = _count(conn, "SELECT COUNT(*) AS n FROM index_scores WHERE index_code='HCI' AND year<=2020")
        if historical_hci < 100:
            _block(blockers, "HISTORICAL_HCI_MISSING", "Историческая редакция HCI не сохранена для ретроспективного графика", "Historical HCI edition is not retained for the retrospective chart", {"rows": historical_hci})
        methodology_count = _count(conn, "SELECT COUNT(*) AS n FROM index_methodology_registry WHERE index_code IN ('HDI','HCI','HCI_PLUS','GTCI','GII','IDI','QS_ET','HTEI')")
        if methodology_count < 8:
            _block(blockers, "INDEX_METHODOLOGY_REGISTRY_INCOMPLETE", "Не заполнен методологический статус всех текущих и исторических модулей", "Methodology status is incomplete for current and historical modules", {"rows": methodology_count})

        policy_count = _count(conn, "SELECT COUNT(*) AS n FROM policy_brief_items WHERE iso3='RUS' AND editorial_status='release_bilingual_reviewed'")
        cyrillic_en = _count(conn, """SELECT COUNT(*) AS n FROM policy_brief_items WHERE iso3='RUS' AND (
            title_en GLOB '*[А-Яа-яЁё]*' OR problem_en GLOB '*[А-Яа-яЁё]*' OR measure_en GLOB '*[А-Яа-яЁё]*' OR
            actor_en GLOB '*[А-Яа-яЁё]*' OR target_kpi_en GLOB '*[А-Яа-яЁё]*' OR expected_effect_en GLOB '*[А-Яа-яЁё]*' OR
            risk_en GLOB '*[А-Яа-яЁё]*' OR resources_en GLOB '*[А-Яа-яЁё]*' OR monitoring_en GLOB '*[А-Яа-яЁё]*')""")
        if policy_count < 8 or cyrillic_en:
            _block(blockers, "RUSSIA_POLICY_BRIEF_BILINGUAL_INCOMPLETE", "Практические рекомендации для России не готовы в обеих языковых версиях", "Russia policy brief is not complete in both languages", {"reviewed_items": policy_count, "english_rows_with_cyrillic": cyrillic_en})

        national = row(conn, "SELECT COUNT(*) AS rows_count,COUNT(DISTINCT iso3) AS countries,COUNT(DISTINCT official_host) AS hosts FROM national_statistics_metrics") or {}
        corporate = row(conn, "SELECT COUNT(*) AS rows_count,COUNT(DISTINCT company_id) AS companies,COUNT(DISTINCT iso3) AS countries FROM corporate_metrics") or {}
        if int(national.get("rows_count") or 0) < 20 or int(national.get("countries") or 0) < 4 or int(national.get("hosts") or 0) < 4:
            _block(blockers, "NATIONAL_STATISTICS_NUMERIC_LAYER_INCOMPLETE", "Не интегрирован числовой слой четырёх национальных статистических служб", "Numeric layer from four national statistical offices is incomplete", national)
        if int(corporate.get("rows_count") or 0) < 20 or int(corporate.get("companies") or 0) < 5 or int(corporate.get("countries") or 0) < 3:
            _block(blockers, "CORPORATE_REPORTING_NUMERIC_LAYER_INCOMPLETE", "Не интегрирован репрезентативный числовой слой корпоративной отчётности", "Representative numeric corporate-reporting layer is incomplete", corporate)

        license_rows = rows(conn, "SELECT source_id,terms_url,storage_allowed,transformation_allowed,release_archive_decision,review_status FROM license_registry")
        registry_sources = _count(conn, "SELECT COUNT(*) AS n FROM source_registry")
        invalid_license = [r for r in license_rows if not r.get("terms_url") or int(r.get("storage_allowed") or 0) != 1 or int(r.get("transformation_allowed") or 0) != 1 or r.get("release_archive_decision") not in ("include", "exclude_raw_keep_derived") or r.get("review_status") not in ("project_policy_approved", "approved")]
        if len(license_rows) < registry_sources or invalid_license:
            _block(blockers, "SOURCE_DISTRIBUTION_POLICY_INCOMPLETE", "Не завершена консервативная политика поставки данных по всем источникам", "Conservative data-delivery policy is incomplete for all sources", {"sources": registry_sources, "registry_rows": len(license_rows), "invalid": invalid_license[:10]})

        reproducibility_errors, reproducibility_stats = _reproducibility_errors(conn)
        if reproducibility_errors:
            _block(blockers, "REPRODUCIBILITY_PACKAGE_INCOMPLETE", "Поставка не воспроизводит все зарегистрированные исходные снимки", "Delivery does not reproduce all registered source snapshots", {"stats": reproducibility_stats, "errors": reproducibility_errors[:25], "error_count": len(reproducibility_errors)})

        evidence_errors = _playwright_evidence_errors()
        if evidence_errors:
            _block(blockers, "PLAYWRIGHT_EVIDENCE_INVALID", "Playwright-доказательства не соответствуют текущей версии", "Playwright evidence is not bound to the current release", evidence_errors)

        required_docs = [
            "docs/USER_GUIDE_RU.md", "docs/ADMIN_GUIDE_RU.md", "docs/INSTALLATION_GUIDE_RU.md",
            "docs/DATA_DICTIONARY_RU.md", "docs/UPDATE_AND_BACKUP_REGULATION_RU.md",
            "docs/ACCEPTANCE_DOSSIER_RU.md", "docs/HCI_PLUS_2026_METHOD_NOTE.md",
            "docs/DATA_DISTRIBUTION_POLICY.md", "docs/HTEI_METHODOLOGY_V6.md",
        ]
        missing_docs = [path for path in required_docs if not (PROJECT_ROOT / path).exists()]
        if missing_docs:
            _block(blockers, "CUSTOMER_DOCUMENTATION_INCOMPLETE", "Не сформирован полный комплект документации для заказчика", "Customer-facing documentation package is incomplete", missing_docs)

        required_success_jobs = ("HCI_PLUS_REFRESH", "NATIONAL_STATISTICS_REFRESH", "CORPORATE_REPORTS_REFRESH")
        missing_jobs = [job for job in required_success_jobs if not _count(conn, "SELECT COUNT(*) AS n FROM operational_runs WHERE job_code=? AND status='success'", (job,))]
        if missing_jobs:
            _block(blockers, "OPERATIONAL_REFRESH_EVIDENCE_MISSING", "Нет успешных эксплуатационных запусков обязательных обновлений", "Successful operational refresh evidence is missing", missing_jobs)

        if not (PROJECT_ROOT / "requirements.lock").exists():
            _block(blockers, "DEPENDENCY_LOCK_MISSING", "Отсутствует requirements.lock", "Pinned requirements.lock is missing", None)
        docker_text = (PROJECT_ROOT / "Dockerfile").read_text(encoding="utf-8", errors="ignore") if (PROJECT_ROOT / "Dockerfile").exists() else ""
        if "USER giip" not in docker_text or "HEALTHCHECK" not in docker_text:
            _block(blockers, "DOCKER_HARDENING_INCOMPLETE", "Docker-контур не содержит non-root user и healthcheck", "Docker setup lacks non-root user and healthcheck", None)
        if not (PROJECT_ROOT / "scripts" / "backup_restore.py").exists():
            _block(blockers, "BACKUP_RESTORE_MISSING", "Отсутствует сценарий backup/restore", "Backup/restore procedure is missing", None)

        stale_asof = _count(conn, "SELECT COUNT(*) AS n FROM htei_v6_profiles WHERE release_year=? AND mode='asof_diagnostic' AND freshness_class='stale'", (RELEASE_YEAR,))
        if stale_asof:
            _warn(warnings, "HTEI_ASOF_STALE_PROFILES", "Часть ASOF-профилей основана на устаревших компонентах", "Some ASOF profiles rely on stale components", {"profiles": stale_asof})

    readiness_level = "customer_final_release" if not blockers else "final_release_candidate"
    return {
        "release_ready": not blockers,
        "readiness_level": readiness_level,
        "version": RELEASE_VERSION,
        "blockers": blockers,
        "warnings": warnings,
        "acceptance": acceptance,
        "facts": {
            "countries": _count(conn, "SELECT COUNT(*) AS n FROM countries"),
            "indices_current": 7,
            "indices_including_historical_hci": 8,
            "scores": _count(conn, "SELECT COUNT(*) AS n FROM index_scores"),
            "components": _count(conn, "SELECT COUNT(*) AS n FROM component_values"),
            "raw_snapshots": _count(conn, "SELECT COUNT(*) AS n FROM raw_snapshots"),
            "htei_v6_profiles": _count(conn, "SELECT COUNT(*) AS n FROM htei_v6_profiles") if _table_exists(conn, "htei_v6_profiles") else 0,
        },
        "accepted_methodological_decisions_ru": "Весовая схема HTEI и отсутствие дополнительного обязательного внешнего рецензирования принимаются как решения утверждённого отчёта по НИР; release gate проверяет воспроизводимость, корректность расчёта и внутреннюю устойчивость, но не требует повторного утверждения весов либо двух новых рецензий.",
        "accepted_methodological_decisions_en": "The HTEI weighting scheme and the absence of an additional mandatory external-review round are treated as decisions of the approved research report; the release gate verifies reproducibility, calculation integrity and internal robustness but does not require renewed weight approval or two new reviews.",
    }
