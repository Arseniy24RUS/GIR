# CODEX HANDOFF: Global Index Intelligence Platform

Актуально на: **2026-07-12**  
Текущая линия сборки: **GIIP final release v6 / `1.0.0-rc6`**  
Публичное название: **GIR — Глобальный рейтинг индексов**  
Технический namespace: `giip` (сохранён для обратной совместимости).

## Краткий статус

Платформа доведена до состояния финального релиз-кандидата на реальных данных. Четыре результата исходного ТЗ МГИМО закрыты числовыми данными: `2.1→3.1.2`, `2.2→3.2.1`, `2.3→3.3.1`, `2.4→3.4.1`.

Последний полный gate-прогон, зафиксированный в `logs/release_gate_v6_attempt3.stdout.log`, завершился сообщением `GIIP customer_final_release gate passed.`. Финальный Playwright v6 manifest сформирован 2026-07-11 и содержит **536/536 passed**, без failed, skipped и flaky, по всем восьми обязательным проектам: desktop RU/EN light/dark, mobile RU/EN и tablet RU/EN.

При этом `outputs/release_readiness.json` и `docs/RELEASE_STATUS.md` были сформированы раньше Playwright manifest и всё ещё содержат устаревший P0 `PLAYWRIGHT_EVIDENCE_INVALID` с причиной `final_v6_playwright_manifest.json is missing`. Сам manifest уже существует в `audit_evidence/playwright/final_v6_playwright_manifest.json`, поэтому перед формальной передачей необходимо заново сформировать readiness/status-артефакты и убедиться, что они согласованы с последним gate-прогоном. Вручную присваивать `customer_final_release` запрещено.

## Что реализовано

- Двуязычный интерфейс RU/EN с автоматическим выбором локали и ручным переключателем.
- Светлая и тёмная темы с автоматическим выбором и ручным переключателем.
- Адаптивные desktop, tablet и mobile представления.
- Семь актуальных индексных модулей и отдельный исторический контекст HCI.
- Страновые профили, рейтинги, компоненты, временные ряды, карты, диагностика и рекомендации.
- Полный provenance для публикуемых значений: источник, URL, версия/год, время получения, raw snapshot или воспроизводимый derived export, SHA-256, transformation ID и quality flag.
- HCI+ 2026 как текущий модуль человеческого капитала; исторический HCI 2010–2020 отделён методологическим разрывом.
- HTEI v6 в режимах `direct_core`, `common_support`, `proxy_extended`, `asof_diagnostic`.
- Модель конкурентоспособности национальных систем подготовки кадров и восемь практических рекомендаций для России.
- Воспроизводимая поставка, строгие валидаторы, API-контракты, accessibility и visual-regression QA.

## Подтверждённые объёмы данных

По последнему `outputs/release_readiness.json`:

| Показатель | Значение |
| --- | ---: |
| Страны | 225 |
| Актуальные индексы | 7 |
| Индексы с историческим HCI | 8 |
| Индексные оценки | 10 076 |
| Значения компонентов | 36 945 |
| Наблюдения источников | 18 569 |
| Raw snapshots | 275 |
| HTEI Common Support | 89 стран |
| HTEI Direct Core | 34 страны |
| HTEI ASOF-профили | 203 |
| Оценки training model | 508 |
| QS institution rankings | 2 185 |
| Национальная статистика | 94 строки / 4 страны |
| Корпоративная отчётность | 26 строк / 8 компаний / 5 стран |
| Policy brief items | 8 |

## Научные и продуктовые инварианты

- `HCI_PLUS` является текущим модулем; исторический `HCI` используется только как отдельный контекст.
- Нельзя строить непрерывный официальный ряд через разрыв методологий HCI и HCI+.
- `common_support` — основной сопоставимый рейтинг HTEI с одной сигнатурой компонентов.
- `asof_diagnostic` не получает ранг.
- Confidence, coverage и freshness показываются отдельно и не изменяют содержательный score или ранг.
- Веса HTEI закреплены утверждённым отчётом НИР и не требуют повторного согласования.
- В production запрещены synthetic, seed, demo, generated, mock и placeholder country data.
- Любое отображаемое число должно иметь проверяемое происхождение.
- Статус `customer_final_release` может появиться только после прохождения строгих автоматических gate-проверок.

## Известные ограничения и риски

- Readiness/status-документы отстают от финального Playwright evidence и должны быть перегенерированы перед передачей.
- В readiness-артефакте отмечено предупреждение `HTEI_ASOF_STALE_PROFILES`: 46 диагностических ASOF-профилей используют устаревшие компоненты. Эти профили не ранжируются.
- В stderr последнего gate-прогона присутствуют Windows `ConnectionResetError [WinError 10054]` при завершении соединений тестового web-сервера. Итоговый gate при этом завершился успешно; при следующем прогоне стоит проверить, что сообщения остаются только шумом teardown и не скрывают продуктовый дефект.
- Корневой внешний audit ZIP и связанные receipt/SHA-256 датированы 2026-07-11 11:10 и могут не включать более поздние final-v6 evidence и изменения от 2026-07-12. Перед отправкой аудитору архив следует пересобрать по `EXTERNAL_AUDIT_MANIFEST.json`.

## Быстрый запуск

Windows:

```text
open_platform.cmd
```

Linux/macOS:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.lock
python -m giip.cli validate
python -m giip.cli runserver --host 127.0.0.1 --port 8000
```

Интерфейс: `http://127.0.0.1:8000/`.

Контейнерный запуск:

```bash
docker compose up --build
```

## Проверки и release gate

Базовые строгие проверки:

```bash
python -m giip.cli validate
python -m pytest -q
python scripts/validate_no_generated_data.py --strict
python scripts/validate_i18n_labels.py --strict
python scripts/validate_source_provenance.py --strict
python scripts/validate_index_formulas.py --strict
python scripts/validate_release_readiness.py --strict
```

Playwright:

```bash
cd playwright
npm ci
npx playwright test
```

Полный gate:

```bash
bash scripts/release_gate.sh
```

После свежего полного Playwright-прогона evidence фиксируется скриптом:

```bash
python scripts/record_playwright_v6_evidence.py
```

## Ключевые точки входа

- `README.md` — обзор продукта, модули и запуск.
- `AGENTS.md` — обязательные правила release mission и критерии приёмки.
- `giip/` — backend, API, вычисления, readiness и статические frontend-ресурсы.
- `data/global_index_platform.sqlite` — основная база текущей сборки.
- `scripts/release_gate.sh` — полный release gate.
- `scripts/validate_release_readiness.py` — строгая проверка готовности.
- `playwright/` — end-to-end, accessibility, API-contract и visual QA.
- `audit_evidence/playwright/final_v6_playwright_manifest.json` — привязанный к сборке manifest финального QA.
- `audit_evidence/outputs/playwright-summary.json` — итог 536/536 тестов.
- `outputs/release_readiness.json` — машинный readiness-отчёт; сейчас требует обновления.
- `docs/RELEASE_STATUS.md` и `docs/RELEASE_EVIDENCE.md` — человекочитаемые отчёты; сейчас требуют синхронизации с финальным manifest.
- `docs/HTEI_METHODOLOGY_V6.md` — методология HTEI v6.
- `docs/HCI_PLUS_2026_METHOD_NOTE.md` — методологическая записка HCI+.
- `docs/ACCEPTANCE_DOSSIER_RU.md` — приёмочное досье.
- `EXTERNAL_AUDIT_MANIFEST.json` — правила комплектации внешнего audit-архива.

## Рекомендуемая следующая последовательность

1. Перегенерировать readiness/status/evidence после уже записанного final-v6 Playwright manifest.
2. Выполнить строгий `validate_release_readiness.py --strict` и полный `scripts/release_gate.sh` на окончательном состоянии файлов.
3. Убедиться, что новые отчёты больше не содержат `PLAYWRIGHT_EVIDENCE_INVALID`.
4. Пересобрать внешний audit ZIP по `EXTERNAL_AUDIT_MANIFEST.json`, затем обновить receipt и SHA-256.
5. Передать аудитору ZIP вместе с checksum и этим handoff-файлом.
