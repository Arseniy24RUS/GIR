# Доказательства релизной сборки

Сформировано: `2026-07-11T14:40:55+00:00`.

| Проверка | Значение |
| --- | --- |
| Health | ok |
| Countries | 225 |
| Current indices | 7 |
| HTEI Direct Core | 34 |
| HTEI Common Support | 89 |
| HTEI Proxy Extended | 105 |
| HTEI ASOF available | True |
| HCI+ loaded | True |
| ToR items | 4 |
| Release ready | False |

## Методический аудит

| Модель | Страны | Прогоны | Mean Spearman | Min Spearman | Mean rank change | Passed |
| --- | --- | --- | --- | --- | --- | --- |
| htei | 89 | 206 | 0.996860610027404 | 0.9347293156281921 | 1.1300316352132649 | 1 |
| training_model | 117 | 200 | 0.9987472837896567 | 0.9969953093857243 | 1.1256410256410256 | 1 |

## Обязательные команды

```bash
python -m giip.cli validate
python -m pytest -q
python scripts/validate_no_generated_data.py --strict
python scripts/validate_i18n_labels.py --strict
python scripts/validate_source_provenance.py --strict
python scripts/validate_index_formulas.py --strict
python scripts/validate_release_readiness.py --strict
cd playwright && npx playwright test
```

## Playwright evidence

В audit package должны входить `playwright-report-v6.zip`, `visual-baseline-snapshots-v6.zip`, JSON summary, command log и `final_v6_playwright_manifest.json`.
