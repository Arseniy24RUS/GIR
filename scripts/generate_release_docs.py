#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from giip.api import app
from giip.config import DB_PATH
from giip.db import connect, row, rows
from giip.release_readiness import release_readiness_payload
from giip.scientific_release import methodology_registry_payload, policy_brief_payload, scientific_audit_payload


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, default=str) + "\n", encoding="utf-8")


def table(headers: list[str], body: list[list[Any]]) -> str:
    out = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    out += ["| " + " | ".join(str(value).replace("|", "\\|") for value in line) + " |" for line in body]
    return "\n".join(out)


def q(conn, sql: str, params: tuple[Any, ...] = ()) -> dict[str, Any]:
    return row(conn, sql, params) or {}


def table_exists(conn, name: str) -> bool:
    return bool(q(conn, "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name=?", (name,)).get("n"))


def source_matrix(conn) -> str:
    inventory = [
        ["Страны / территории", q(conn, "SELECT COUNT(*) AS n FROM countries")["n"]],
        ["Актуальные индексные модули", 7],
        ["Индексные модули с историческим HCI", q(conn, "SELECT COUNT(*) AS n FROM indices")["n"]],
        ["Официальные / импортированные итоговые значения", q(conn, "SELECT COUNT(*) AS n FROM index_scores")["n"]],
        ["Компонентные значения", q(conn, "SELECT COUNT(*) AS n FROM component_values")["n"]],
        ["HTEI v6 profiles", q(conn, "SELECT COUNT(*) AS n FROM htei_v6_profiles")["n"]],
        ["HTEI v6 component rows", q(conn, "SELECT COUNT(*) AS n FROM htei_v6_component_values")["n"]],
        ["HCI+ 2026 official country scores", q(conn, "SELECT COUNT(*) AS n FROM hci_plus_country_scores")["n"]],
        ["Source observations", q(conn, "SELECT COUNT(*) AS n FROM source_observations")["n"]],
        ["Raw snapshots", q(conn, "SELECT COUNT(*) AS n FROM raw_snapshots")["n"]],
        ["Reproducibility artifacts", q(conn, "SELECT COUNT(*) AS n FROM reproducibility_artifacts")["n"]],
        ["QS institution rows", q(conn, "SELECT COUNT(*) AS n FROM qs_institution_rankings")["n"]],
        ["Training-model scores", q(conn, "SELECT COUNT(*) AS n FROM training_model_scores")["n"]],
        ["National-statistics numeric rows", q(conn, "SELECT COUNT(*) AS n FROM national_statistics_metrics")["n"]],
        ["Corporate numeric rows", q(conn, "SELECT COUNT(*) AS n FROM corporate_metrics")["n"]],
    ]
    index_rows: list[list[Any]] = []
    current_codes = ("HDI", "HCI_PLUS", "GTCI", "GII", "IDI", "QS_ET", "HTEI")
    for code in current_codes:
        item = q(conn, "SELECT code,name_ru,name_en FROM indices WHERE code=?", (code,))
        if not item:
            name_ru = "HCI+ 2026 (ожидает официальной загрузки)" if code == "HCI_PLUS" else code
            index_rows.append([code, name_ru, "pending", "—", 0])
            continue
        if code == "HTEI":
            years = q(conn, "SELECT MIN(oldest_source_year) mn,MAX(newest_source_year) mx,COUNT(DISTINCT iso3) c FROM htei_v6_profiles WHERE mode='asof_diagnostic'")
            sources = [record["source_id"] for record in rows(conn, "SELECT DISTINCT source_id FROM htei_v6_component_values ORDER BY source_id")]
        else:
            years = q(conn, "SELECT MIN(year) mn,MAX(year) mx,COUNT(DISTINCT iso3) c FROM index_scores WHERE index_code=?", (code,))
            sources = [record["source_id"] for record in rows(conn, "SELECT DISTINCT source_id FROM index_scores WHERE index_code=? ORDER BY source_id", (code,))]
        index_rows.append([code, item["name_ru"], ", ".join(sources), f"{years.get('mn')}–{years.get('mx')}", years.get("c")])

    mode_rows = [
        [record["mode"], record["profiles"], record["ranked"], f"{float(record['confidence'] or 0):.3f}", record["oldest"], record["newest"], record["signatures"]]
        for record in rows(conn, """
            SELECT mode,COUNT(*) profiles,SUM(CASE WHEN rank IS NOT NULL THEN 1 ELSE 0 END) ranked,
                   AVG(confidence_score) confidence,MIN(oldest_source_year) oldest,MAX(newest_source_year) newest,
                   COUNT(DISTINCT component_signature) signatures
              FROM htei_v6_profiles GROUP BY mode ORDER BY mode
        """)
    ]
    source_rows = [
        [record["source_id"], record["source_group"], record["components"], record["countries"], f"{record['min_year']}–{record['max_year']}"]
        for record in rows(conn, """
            SELECT source_id,source_group,COUNT(*) components,COUNT(DISTINCT iso3) countries,
                   MIN(source_data_year) min_year,MAX(source_data_year) max_year
              FROM htei_v6_component_values GROUP BY source_id,source_group ORDER BY source_group,source_id
        """)
    ]
    national = q(conn, "SELECT COUNT(*) rows_count,COUNT(DISTINCT iso3) countries,COUNT(DISTINCT official_host) hosts FROM national_statistics_metrics")
    corporate = q(conn, "SELECT COUNT(*) rows_count,COUNT(DISTINCT company_id) companies,COUNT(DISTINCT iso3) countries FROM corporate_metrics")
    reproducibility = q(conn, "SELECT COUNT(DISTINCT snapshot_id) covered,COUNT(*) artifacts FROM reproducibility_artifacts")
    return "\n\n".join([
        "# Матрица источников и данных",
        f"Сформировано: `{now()}`.",
        "База: `data/global_index_platform.sqlite`.",
        "## Инвентаризация", table(["Слой", "Фактическое состояние"], inventory),
        "## Актуальные индексные модули", table(["Код", "Название", "Источники", "Фактические годы", "Страны"], index_rows),
        "## HTEI v6: режимы публикации", table(["Режим", "Профили", "С рангом", "Среднее доверие", "Мин. год", "Макс. год", "Конфигурации"], mode_rows),
        "## HTEI v6: фактические источники", table(["Источник", "Группа", "Компонентные строки", "Страны", "Годы"], source_rows),
        "## Национальная статистика и корпоративная отчётность", table(
            ["Слой", "Строки", "Страны / компании", "Официальные службы / страны"],
            [["Национальная статистика", national.get("rows_count", 0), national.get("countries", 0), national.get("hosts", 0)],
             ["Корпоративная отчётность", corporate.get("rows_count", 0), corporate.get("companies", 0), corporate.get("countries", 0)]],
        ),
        "## Воспроизводимость", f"Зарегистрировано воспроизводимых артефактов: `{reproducibility.get('artifacts', 0)}` для `{reproducibility.get('covered', 0)}` снимков.",
        "## Интерпретация", "Национальная статистика и корпоративная отчётность считаются закрытыми числовыми слоями только при фактическом наличии строк. Evidence-register не выдаётся за числовую интеграцию.",
        "## Provenance", "Каждое значение должно иметь URL, время получения, raw snapshot или проверяемый derived export + download recipe, SHA-256, transform ID, версию формулы и статус официального/авторского значения.",
    ]) + "\n"


def status_doc(readiness: dict[str, Any], acceptance: dict[str, Any]) -> str:
    blockers = readiness.get("blockers", [])
    warnings = readiness.get("warnings", [])
    return "\n\n".join([
        "# Статус релизной готовности",
        f"Сформировано: `{now()}`.",
        f"Уровень: `{readiness.get('readiness_level')}`.",
        f"Готов к окончательной передаче: `{readiness.get('release_ready')}`.",
        "## Исходное ТЗ",
        f"Полностью закрыто: `{acceptance.get('summary', {}).get('items_closed', 0)}/{acceptance.get('summary', {}).get('items_total', 4)}`.",
        table(["ТЗ", "Результат", "Статус", "Ограничение"], [[item["id"], item["result_id"], item["status"], item.get("limitations", "")] for item in acceptance.get("items", [])]),
        "## Блокеры", table(["Код", "Критичность", "Описание", "Evidence"], [[item["code"], item["severity"], item["title_ru"], json.dumps(item.get("evidence"), ensure_ascii=False, default=str)] for item in blockers]) if blockers else "Блокеров нет.",
        "## Предупреждения", table(["Код", "Описание", "Evidence"], [[item["code"], item["title_ru"], json.dumps(item.get("evidence"), ensure_ascii=False, default=str)] for item in warnings]) if warnings else "Предупреждений нет.",
        "## Зафиксированное методическое решение", readiness.get("accepted_methodological_decisions_ru", ""),
        "## Правило", "Статус `customer_final_release` присваивается только автоматически после выполнения всех строгих gate’ов; запрещено менять его вручную.",
    ]) + "\n"


def evidence_doc(smoke: dict[str, Any], readiness: dict[str, Any], acceptance: dict[str, Any], audit: dict[str, Any]) -> str:
    return "\n\n".join([
        "# Доказательства релизной сборки",
        f"Сформировано: `{now()}`.",
        table(["Проверка", "Значение"], [
            ["Health", smoke["health"]["status"]],
            ["Countries", smoke["health"]["countries"]],
            ["Current indices", smoke["health"]["indices"]],
            ["HTEI Direct Core", smoke["htei_direct"].get("total")],
            ["HTEI Common Support", smoke["htei_common"].get("total")],
            ["HTEI Proxy Extended", smoke["htei_proxy"].get("total")],
            ["HTEI ASOF available", smoke["htei_asof"].get("available")],
            ["HCI+ loaded", bool((smoke["human_capital"] or {}).get("hci_plus"))],
            ["ToR items", acceptance.get("summary", {}).get("items_total")],
            ["Release ready", readiness.get("release_ready")],
        ]),
        "## Методический аудит", table(["Модель", "Страны", "Прогоны", "Mean Spearman", "Min Spearman", "Mean rank change", "Passed"], [
            [key, (value or {}).get("countries"), (value or {}).get("run_count"), (value or {}).get("mean_spearman"), (value or {}).get("min_spearman"), (value or {}).get("mean_absolute_rank_change"), (value or {}).get("sensitivity_passed")]
            for key, value in audit.items() if isinstance(value, dict) and key in {"htei", "training_model"}
        ]),
        "## Обязательные команды", "```bash\npython -m giip.cli validate\npython -m pytest -q\npython scripts/validate_no_generated_data.py --strict\npython scripts/validate_i18n_labels.py --strict\npython scripts/validate_source_provenance.py --strict\npython scripts/validate_index_formulas.py --strict\npython scripts/validate_release_readiness.py --strict\ncd playwright && npx playwright test\n```",
        "## Playwright evidence", "В audit package должны входить `playwright-report-v6.zip`, `visual-baseline-snapshots-v6.zip`, JSON summary, command log и `final_v6_playwright_manifest.json`.",
    ]) + "\n"


def main() -> None:
    with TestClient(app) as client:
        smoke = {
            "built_at": now(),
            "health": client.get("/api/health").json(),
            "country": client.get("/api/country/RUS?year=2026").json(),
            "command_center": client.get("/api/country/RUS/command-center?year=2026").json(),
            "htei_direct": client.get("/api/htei/v6/ranking?mode=direct_core&limit=1").json(),
            "htei_common": client.get("/api/htei/v6/ranking?mode=common_support&limit=1").json(),
            "htei_proxy": client.get("/api/htei/v6/ranking?mode=proxy_extended&limit=1").json(),
            "htei_asof": client.get("/api/htei/v6/profile/RUS?mode=asof_diagnostic").json(),
            "human_capital": client.get("/api/human-capital/combined/RUS").json(),
            "policy": client.get("/api/policy-brief/RUS").json(),
        }
        acceptance = client.get("/api/acceptance/tz?lang=ru").json()
        quality = client.get("/api/data-quality?year=2026").json()

    with connect(DB_PATH) as conn:
        readiness = release_readiness_payload(conn)
        registry = methodology_registry_payload(conn)
        audit = scientific_audit_payload(conn)
        policy = policy_brief_payload(conn, "RUS")
        matrix = source_matrix(conn)
        licenses = [dict(record) for record in conn.execute("""
            SELECT lr.*,sr.source_name,sr.owner,sr.source_role,sr.latest_snapshot_id
              FROM license_registry lr JOIN source_registry sr ON sr.source_id=lr.source_id
             ORDER BY lr.source_id
        """).fetchall()]
        operations = [dict(record) for record in conn.execute("SELECT * FROM operational_runs ORDER BY started_at DESC LIMIT 200").fetchall()]

    docs = ROOT / "docs"
    outputs = ROOT / "outputs"
    method = ROOT / "data" / "methodology"
    docs.mkdir(exist_ok=True)
    outputs.mkdir(exist_ok=True)
    method.mkdir(parents=True, exist_ok=True)
    (docs / "source_matrix.md").write_text(matrix, encoding="utf-8")
    (docs / "RELEASE_STATUS.md").write_text(status_doc(readiness, acceptance), encoding="utf-8")
    (docs / "RELEASE_EVIDENCE.md").write_text(evidence_doc(smoke, readiness, acceptance, audit), encoding="utf-8")
    payloads = [
        (outputs / "smoke_test.json", smoke),
        (outputs / "release_readiness.json", readiness),
        (outputs / "data_quality.json", quality),
        (outputs / "tz_acceptance_matrix.json", acceptance),
        (outputs / "scientific_audit.json", audit),
        (outputs / "operations_status.json", {"runs": operations}),
        (method / "index_methodology_registry.json", registry),
        (method / "russia_policy_brief_2026.json", policy),
        (method / "license_registry_v6.json", licenses),
    ]
    for path, payload in payloads:
        write_json(path, payload)
    print(json.dumps({"status": "ok", "release_ready": readiness.get("release_ready"), "readiness_level": readiness.get("readiness_level"), "outputs": str(outputs)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
