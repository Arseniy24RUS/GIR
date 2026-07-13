# GIR — Глобальный рейтинг индексов / Global Index Ranker

GIR — двуязычная аналитическая платформа МГИМО для международного сопоставления человеческого капитала, талантов, инноваций, цифрового развития, инженерно-технологического образования и занятости в высокотехнологичных отраслях.

Публичное название: **GIR — Глобальный рейтинг индексов**. Технический namespace `giip` сохранён для обратной совместимости.

## Индексные модули

1. ИЧР / Human Development Index;
2. HCI+ 2026 как основной актуальный модуль человеческого капитала;
3. исторический HCI 2010–2020 — только ретроспективная серия перед HCI+;
4. Индекс глобальной конкурентоспособности талантов;
5. Глобальный инновационный индекс;
6. Индекс развития ИКТ;
7. QS: инженерия и технологии — прозрачная авторская агрегация университетского рейтинга по странам;
8. Индекс занятости в высокотехнологичных отраслях — авторский индекс, требуемый исходным ТЗ.

В интерфейсе семь актуальных вкладок: исторический HCI не является отдельной основной вкладкой.

## HTEI v6

HTEI публикуется в четырёх режимах:

- `Direct Core` — наиболее строгий слой прямых high-tech/HRST и национальных данных;
- `Common Support` — основной международно сопоставимый рейтинг на одном фиксированном наборе компонентов;
- `Proxy Extended` — расширенное пространство для policy benchmarking с явной маркировкой прокси;
- `ASOF Diagnostic` — широкий диагностический профиль без места в рейтинге.

Качество данных, полнота, свежесть и интервалы неопределённости показываются отдельно и не изменяют содержательный score.

## Быстрый запуск

### Windows

```text
open_platform.cmd
```

### Linux/macOS

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.lock
python -m giip.cli validate
python -m giip.cli runserver --host 127.0.0.1 --port 8000
```

Открыть `http://127.0.0.1:8000/`.

## GitHub Pages

Статическая публикация на реальных данных доступна по адресу:

https://arseniy24rus.github.io/GIR/

GitHub Pages показывает зафиксированный срез России за 2026 год, международное сравнение, индексные пространства, методологию и Data Lab metadata. Полная динамическая аналитика, SQLite и все разрешённые исходные данные находятся в этом репозитории и запускаются через FastAPI локально.

Крупные файлы данных хранятся через Git LFS. Для полной локальной копии после клонирования выполните:

```bash
git lfs pull
```

Порядок воспроизведения Pages-артефакта описан в `docs/GITHUB_PAGES.md`.

## Проверка текущей сборки

```bash
python -m pytest -q
python scripts/validate_no_generated_data.py --strict
python scripts/validate_i18n_labels.py --strict
python scripts/validate_source_provenance.py --strict
python scripts/validate_index_formulas.py --strict
python scripts/validate_final_release_candidate.py
```

Полный финальный gate после официальных онлайн-загрузок и PlaywrightQA:

```bash
bash scripts/release_gate.sh
```

## Политика данных

В релизе запрещены synthetic, seed, demo, generated и placeholder country data. Каждое опубликованное значение должно иметь официальный URL, фактический год, raw snapshot либо воспроизводимый derived export + download recipe, SHA-256, transformation ID и методический статус.

## Статус версии

Офлайн-патч устанавливает `1.0.0-rc6`. Статус `1.0.0 / customer_final_release` разрешён только после:

- официальной загрузки HCI+ 2026 минимум для 150 стран;
- числовой интеграции минимум четырёх национальных статистических служб;
- числовой интеграции корпоративной отчётности;
- свежего полного Playwright v6-прогона;
- отсутствия blockers в `python scripts/validate_release_readiness.py --strict`.

## Документация

- `docs/USER_GUIDE_RU.md`;
- `docs/ADMIN_GUIDE_RU.md`;
- `docs/INSTALLATION_GUIDE_RU.md`;
- `docs/DATA_DICTIONARY_RU.md`;
- `docs/HTEI_METHODOLOGY_V6.md`;
- `docs/HCI_PLUS_2026_METHOD_NOTE.md`;
- `docs/ACCEPTANCE_DOSSIER_RU.md`;
- `docs/CODEX_PATCH_INTEGRATION_V6.md`;
- `docs/CODEX_FINAL_RELEASE_TZ_V6.md`.
