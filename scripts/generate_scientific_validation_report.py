#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from giip.db import connect, row, rows
from giip.scientific_release import scientific_audit_payload


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def table(headers, body):
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join("---" for _ in headers) + " |"]
    lines += ["| " + " | ".join(str(value).replace("|", "\\|") for value in line) + " |" for line in body]
    return "\n".join(lines)


def main() -> None:
    with connect() as conn:
        modes = rows(conn, """
            SELECT mode,COUNT(*) profiles,SUM(eligible_for_ranking) eligible,
                   SUM(CASE WHEN rank IS NOT NULL THEN 1 ELSE 0 END) ranked,
                   AVG(confidence_score) confidence,AVG(available_components) components,
                   AVG(average_lag) lag,MIN(oldest_source_year) oldest,MAX(newest_source_year) newest,
                   COUNT(DISTINCT component_signature) signatures
              FROM htei_v6_profiles GROUP BY mode ORDER BY mode
        """)
        component_coverage = rows(conn, """
            SELECT component_code,COUNT(*) observations,COUNT(DISTINCT iso3) countries,
                   MIN(source_data_year) min_year,MAX(source_data_year) max_year,
                   GROUP_CONCAT(DISTINCT source_group) source_groups
              FROM htei_v6_component_values GROUP BY component_code ORDER BY component_code
        """)
        signature_distribution = rows(conn, """
            SELECT mode,component_signature,COUNT(*) countries,AVG(substantive_score) mean_score,AVG(rank) mean_rank
              FROM htei_v6_profiles GROUP BY mode,component_signature ORDER BY mode,countries DESC
        """)
        profile_dist = rows(conn, """
            SELECT mode,available_components,COUNT(*) countries
              FROM htei_v6_profiles GROUP BY mode,available_components ORDER BY mode,available_components
        """)
        audit = scientific_audit_payload(conn)
        htei = audit.get("htei") or {}
        training = audit.get("training_model") or {}
        hci_plus = row(conn, "SELECT COUNT(*) n,MIN(score) min_score,MAX(score) max_score FROM hci_plus_country_scores") or {}

    report = [
        "# Научно-методический аудит GIIP final-release-v6",
        f"Сформировано: `{now()}`.",
        "## Статус HTEI",
        "HTEI является авторским формативным составным показателем проекта. Весовая схема считается закреплённой утверждённым отчётом по НИР. Дополнительное повторное утверждение весов и обязательный новый раунд двух внешних рецензий не являются release blockers; валидаторы проверяют вычислительную воспроизводимость, согласованность формул, missingness и внутреннюю устойчивость.",
        "## Режимы публикации",
        table(
            ["Режим", "Профили", "Eligible", "С рангом", "Среднее доверие", "Среднее компонентов", "Средний лаг", "Годы", "Конфигурации"],
            [[record["mode"], record["profiles"], record["eligible"], record["ranked"], round(record["confidence"] or 0, 3), round(record["components"] or 0, 2), round(record["lag"] or 0, 2), f"{record['oldest']}–{record['newest']}", record["signatures"]] for record in modes],
        ),
        "## Покрытие компонентов",
        table(
            ["Компонент", "Наблюдения", "Страны", "Годы", "Группы источников"],
            [[record["component_code"], record["observations"], record["countries"], f"{record['min_year']}–{record['max_year']}", record["source_groups"]] for record in component_coverage],
        ),
        "## Конфигурации компонентов и missingness",
        table(
            ["Режим", "Подпись компонентов", "Страны", "Средний score", "Средний ранг"],
            [[record["mode"], record["component_signature"], record["countries"], round(record["mean_score"] or 0, 3), round(record["mean_rank"] or 0, 3)] for record in signature_distribution],
        ),
        "## Полнота профилей",
        table(["Режим", "Доступно компонентов", "Страны"], [[record["mode"], record["available_components"], record["countries"]] for record in profile_dist]),
        "## Чувствительность HTEI",
        table(["Показатель", "Значение"], [
            ["Страны baseline", htei.get("countries")], ["Прогоны", htei.get("run_count")],
            ["Mean Spearman", htei.get("mean_spearman")], ["Min Spearman", htei.get("min_spearman")],
            ["Mean absolute rank change", htei.get("mean_absolute_rank_change")], ["Max rank change", htei.get("max_rank_change")],
            ["Passed", htei.get("sensitivity_passed")],
        ]),
        "## Чувствительность модели подготовки кадров",
        table(["Показатель", "Значение"], [
            ["Страны", training.get("countries")], ["Прогоны", training.get("run_count")],
            ["Mean Spearman", training.get("mean_spearman")], ["Min Spearman", training.get("min_spearman")],
            ["Mean absolute rank change", training.get("mean_absolute_rank_change")], ["Max rank change", training.get("max_rank_change")],
            ["Passed", training.get("sensitivity_passed")],
        ]),
        "## HCI+ 2026",
        f"Загружено официальных страновых значений: `{hci_plus.get('n', 0)}`; диапазон score: `{hci_plus.get('min_score')}–{hci_plus.get('max_score')}`. До онлайн-загрузки слой остаётся pending и блокирует окончательный release gate.",
        "## Обязательные ограничения интерпретации",
        "- ASOF diagnostic не является синхронным международным рейтингом и не получает место.\n- Common Support использует фиксированный набор компонентов и является основным международно сопоставимым рейтингом.\n- Direct Core отделяет наиболее строгий слой прямых high-tech/HRST и национальных данных.\n- Proxy Extended предназначен для расширенного policy benchmarking и раскрывает использование широких прокси.\n- Confidence не умножается на содержательный score.\n- Фактические годы, source group, proxy status и интервалы неопределённости показываются пользователю.\n- HCI 2010–2020 и HCI+ 2026 являются разными официальными редакциями и не образуют непрерывного официального временного ряда.",
    ]
    target = ROOT / "docs" / "HTEI_VALIDATION_REPORT_2026.md"
    target.write_text("\n\n".join(report) + "\n", encoding="utf-8")
    print(json.dumps({"status": "ok", "path": target.relative_to(ROOT).as_posix(), "modes": len(modes)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
