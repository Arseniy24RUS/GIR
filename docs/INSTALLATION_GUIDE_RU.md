# Инструкция установки

## Требования

- Python 3.11+
- Node.js 20+ для Playwright
- 4 ГБ RAM
- 5 ГБ свободного места для полного data/evidence контура

## Локальная установка

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.lock
python -m giip.cli validate
python -m giip.cli runserver --host 127.0.0.1 --port 8000
```

Открыть `http://127.0.0.1:8000/`.

## Проверка поставки

```bash
python scripts/verify_patch_files.py
python -m pytest -q
python scripts/validate_final_release_candidate.py
```

Финальный статус достигается только после официальных онлайн-загрузок и свежего Playwright-прогона.
