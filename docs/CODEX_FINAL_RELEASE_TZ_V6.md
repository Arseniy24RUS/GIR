# Императивное ТЗ Codex: GIIP 1.0.0 customer final release

## Результат задачи

Получить полностью проверенный customer package платформы GIR, в котором:

- семь актуальных индексных модулей работают на реальных данных;
- HCI+ 2026 является основным модулем человеческого капитала;
- исторический HCI показан до HCI+ с явным методологическим разрывом;
- HTEI v6 публикуется в режимах Direct Core, Common Support, Proxy Extended и ASOF Diagnostic;
- выполнены четыре результата исходного ТЗ МГИМО—ФНИСЦ РАН;
- отсутствуют placeholders/synthetic/generated country data;
- приложены воспроизводимость, документация и Playwright evidence;
- строгий gate возвращает `customer_final_release`.

## P0-01. Официальный HCI+ 2026

Выполнить `scripts/fetch_hci_plus_2026.py`. Минимум 150 стран. Для каждой страны обязательны официальный PDF, URL, SHA-256, total score и три pillar scores. Не использовать surrogate data.

Acceptance:

```sql
SELECT COUNT(*) FROM hci_plus_country_scores WHERE year=2026;
-- >= 150
```

## P0-02. Числовой слой национальной статистики

Подключить минимум четыре независимые официальные национальные статистические службы, четыре страны и 20 числовых строк.

Acceptance:

```sql
SELECT COUNT(*), COUNT(DISTINCT iso3), COUNT(DISTINCT official_host)
FROM national_statistics_metrics;
-- rows >=20, countries >=4, hosts >=4
```

## P0-03. Числовой слой корпоративной отчётности

Загрузить официальный SEC EDGAR Company Facts: минимум 20 facts, 5 компаний, 3 страны.

Acceptance:

```sql
SELECT COUNT(*), COUNT(DISTINCT company_id), COUNT(DISTINCT iso3)
FROM corporate_metrics;
```

## P0-04. Воспроизводимость

Каждый `raw_snapshots.snapshot_id` должен иметь:

- проверенный raw file; либо
- verified derived export + download recipe;
- корректные SHA-256;
- source URL и transformation provenance.

`validate_source_provenance.py --strict` обязан пройти.

## P0-05. HTEI v6

Обязательные invariants:

```text
Direct Core >=25;
Common Support >=75;
Common Support uses exactly one component signature;
Proxy Extended >= Common Support;
ASOF >=200;
ASOF ranks = 0;
substantive score = sum of weighted contributions;
confidence does not alter score/rank.
```

Весовая схема не пересматривается: она закреплена утверждённым отчётом по НИР.

## P0-06. Практические рекомендации

Все восемь рекомендаций для России должны быть содержательно заполнены на русском и английском. Английские поля не содержат кириллицу. Структура: проблема, показатель, источник, бенчмарк, мера, актор, горизонт, KPI, эффект, риск, ресурсы, мониторинг, связь с ТЗ.

## P0-07. ТЗ МГИМО / Приёмка

Ровно четыре пары:

```text
2.1 → 3.1.2
2.2 → 3.2.1
2.3 → 3.3.1
2.4 → 3.4.1
```

Пункт 2.1 закрывается только после реальной числовой интеграции national statistics и corporate reporting.

## P0-08. Playwright v6

Все восемь проектов, 0 failed, 0 skipped, 0 flaky. Сформировать:

```text
audit_evidence/playwright/playwright-report-v6.zip
audit_evidence/playwright/visual-baseline-snapshots-v6.zip
audit_evidence/playwright/final_v6_playwright_manifest.json
audit_evidence/outputs/playwright-summary.json
```

## P0-09. Documentation

Обновить и включить:

```text
USER_GUIDE_RU
ADMIN_GUIDE_RU
INSTALLATION_GUIDE_RU
DATA_DICTIONARY_RU
UPDATE_AND_BACKUP_REGULATION_RU
ACCEPTANCE_DOSSIER_RU
HTEI_METHODOLOGY_V6
HCI_PLUS_2026_METHOD_NOTE
DATA_DISTRIBUTION_POLICY
source_matrix
RELEASE_STATUS
RELEASE_EVIDENCE
```

## P0-10. Final gate and package

Выполнить:

```bash
bash scripts/release_gate.sh
python scripts/build_external_audit_package.py
```

Не завершать задачу до отсутствия blockers. Если официальный endpoint изменился, Codex должен исследовать источник, адаптировать connector, добавить regression test и повторить загрузку; сдача с placeholder запрещена.
