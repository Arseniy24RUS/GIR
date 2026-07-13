# Руководство администратора

## Запуск

```bash
python -m giip.cli validate
python -m giip.cli runserver --host 0.0.0.0 --port 8000
```

Docker:

```bash
docker compose up --build -d
```

## Обновление данных

```bash
python scripts/fetch_hci_plus_2026.py
python scripts/fetch_national_statistics_metrics.py --config configs/national_statistics_sources.release.json
SEC_USER_AGENT='MGIMO GIIP contact@example.org' python scripts/fetch_sec_corporate_metrics.py
python scripts/run_scheduled_refresh.py
```

После загрузки:

```bash
python scripts/apply_final_release_v6.py --rebuild
python scripts/generate_release_docs.py
```

## Контроль

```bash
python -m pytest -q
python scripts/validate_no_generated_data.py --strict
python scripts/validate_i18n_labels.py --strict
python scripts/validate_source_provenance.py --strict
python scripts/validate_index_formulas.py --strict
python scripts/validate_release_readiness.py --strict
```

## Playwright

```bash
cd playwright
npm ci
npx playwright install
npx playwright test
cd ..
python scripts/record_playwright_v6_evidence.py
```

## Резервное копирование

Используйте `scripts/backup_restore.py` перед каждой миграцией и официальным обновлением. Не перезаписывайте raw snapshots: новая редакция источника регистрируется как новый snapshot.
