# Словарь данных

## Основные таблицы

| Таблица | Назначение |
|---|---|
| `countries` | страны, ISO3/ISO2, флаг, регион, группа дохода |
| `source_registry` | владельцы, URL, режим доступа и статус автоматизации |
| `raw_snapshots` | неизменяемые снимки, SHA-256 и дата получения |
| `transformation_runs` | версия преобразования и число загруженных строк |
| `index_scores` | официальные/производные оценки индексов |
| `component_values` | компоненты, нормированные значения, вклад и provenance |
| `htei_v6_profiles` | профили HTEI v6 по четырём режимам |
| `htei_v6_component_values` | компоненты HTEI v6 и правила выбора |
| `hci_plus_country_scores` | официальный HCI+ 2026 и три направления |
| `training_model_scores` | итог модели подготовки кадров |
| `training_model_components` | четыре блока модели по ТЗ |
| `national_statistics_metrics` | числовые ряды национальных статслужб |
| `corporate_metrics` | числовые показатели корпоративной отчётности |
| `policy_brief_items` | структурированные рекомендации для России |
| `reproducibility_artifacts` | raw/derived/recipe доказательства воспроизводимости |
| `operational_runs` | журнал автоматических обновлений |

## Ключевые поля HTEI

- `substantive_score` — содержательный балл;
- `confidence_score` — отдельная оценка доверия;
- `mode` — direct/common/proxy/asof;
- `component_signature` — одинаковый набор компонентов для Common Support;
- `source_data_year` — фактический год;
- `proxy_status` — прямой показатель или прокси;
- `eligible_for_ranking` — право на место в рейтинге.
