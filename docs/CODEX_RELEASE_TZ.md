# Техническое задание для Codex App: релизная версия платформы международных индексов МГИМО

## 1. Назначение документа

Настоящее ТЗ предназначено для автономной разработки через Codex App и задаёт полный набор требований к релизной версии платформы международных индексов человеческого капитала, технологической конкурентоспособности и занятости в высокотехнологичных отраслях. Документ должен использоваться как главный источник требований для главного агента Codex и всех субагентов.

## 2. Исходная рамка проекта

Платформа должна одновременно закрыть исходное ТЗ МГИМО—ФНИСЦ РАН и существенно расширить его. Исходное ТЗ требует: интегрированную базу данных по трудовым ресурсам в высокотехнологичных отраслях на основе международных организаций, национальных служб, корпоративной отчётности и рейтингов; систему индикаторов, включая High-tech employment index; модель конкурентоспособности подготовки кадров; практические рекомендации для России. Релизная платформа реализует это как один из модулей более широкой системы международных индексов.

## 3. Концепция продукта

Рабочее название: `Global Index Intelligence Platform / Платформа международных индексов человеческого капитала и технологической конкурентоспособности`.

Платформа должна быть не просто витриной рейтингов, а информационно-образовательной аналитической системой для лиц, принимающих решения. Она должна объяснять, из чего складывается каждый индекс, где страна находится в мире, как менялось её место, какие компоненты тянут её вниз, какие показатели являются наиболее управляемыми, и какие действия могут улучшить позицию.

## 4. Индексные модули

В релиз входят следующие индексные модули:

1. `HDI / ИЧР — Индекс человеческого развития`.
2. `HCI / Индекс человеческого капитала`.
3. `GTCI / Индекс глобальной конкурентоспособности талантов`.
4. `GII / Глобальный инновационный индекс`.
5. `IDI / Индекс развития ИКТ`.
6. `QS E&T / QS: инженерия и технологии` — страновая агрегация университетского рейтинга QS Engineering & Technology.
7. `HTEI / Индекс занятости в высокотехнологичных отраслях` — авторский модуль, закрывающий исходное ТЗ.

HTCI как отдельный индекс исключается. Если в коде остались упоминания HTCI, Codex должен удалить или мигрировать их в HTEI/методический слой.

## 5. Главная страница: профиль страны

Первая вкладка платформы — `Профиль страны / Country Command Center`. Пользователь выбирает страну и год. Страница показывает:

- флаг, карту/географический контур, название страны;
- сводную таблицу по всем индексам;
- score, rank, percentile, trend, change vs previous available year;
- компоненты каждого индекса;
- формулы индекса;
- источники данных;
- weakest component и highest-leverage component;
- radar chart по индексам;
- line chart динамики места/score;
- компонентные bar/stacked charts;
- краткие объяснения “что это значит” и “как улучшить”.

## 6. Вкладки отдельных индексов

Каждая индексная вкладка должна содержать:

- описание индекса и назначение;
- официальный источник и методологию;
- формулу или метод расчёта;
- дерево компонентов: index → pillar → subpillar → indicator;
- веса и нормализацию;
- карту мира;
- ranking table;
- country comparison;
- dynamics chart;
- component decomposition;
- source provenance cards;
- explanation panel;
- “policy lever” / “управленческий рычаг”.

## 7. Требования к данным

### 7.1. Абсолютный запрет на нереальные данные

В релизе запрещены:

- seed country scores;
- synthetic/generated values;
- manual placeholders;
- fake rankings;
- invented components;
- mock source names;
- demo numbers;
- hard-coded country ranks, не подтверждённые источником.

Разрешены только:

- официальные API;
- официальные downloadable datasets;
- официальные PDF/Excel/CSV с воспроизводимой загрузкой;
- юридически допустимый web ingestion официальных страниц;
- ручной импорт официально скачанного файла, если API недоступен, с обязательным checksum, source URL, retrieved_at, version и raw snapshot.

### 7.2. Source provenance

Каждая величина должна иметь:

- `source_id`;
- `source_name`;
- `source_url`;
- `license_or_terms`;
- `retrieved_at`;
- `release_year`;
- `raw_snapshot_path`;
- `raw_snapshot_sha256`;
- `transform_id`;
- `formula_version`;
- `quality_flag`;
- `is_official` или `is_recomputed`.

### 7.3. Raw snapshots

Все исходные файлы/API-ответы сохраняются в `data/raw/<source_id>/<release>/<timestamp>/`. Их нельзя перезаписывать. Новая загрузка создаёт новый snapshot.

## 8. Источники и стратегия коннекторов

### 8.1. HDI / ИЧР

Источник: UNDP Human Development Reports / Data Center. Codex должен реализовать ingestion официальных таблиц и загрузку компонентов: life expectancy, expected years of schooling, mean years of schooling, GNI per capita, HDI score, rank.

### 8.2. HCI / Индекс человеческого капитала

Источник: World Bank Human Capital Project / World Bank API / official datasets. Требуются score, year, components where available, explanatory fields, and data provenance.

### 8.3. GTCI

Источник: INSEAD / Portulans official reports and data. Если нет стабильного public API, реализовать официально-документированный file ingestion. Запрещено парсить неофициальные копии, если есть официальный источник.

### 8.4. GII

Источник: WIPO Global Innovation Index official data/report files. Нужны score, rank, pillars and component data where available.

### 8.5. IDI

Источник: ITU ICT Development Index official data. Нужны score, rank, components, connectivity indicators and official dataset metadata.

### 8.6. QS Engineering & Technology

Источник: QS official subject rankings. Это не страновой индекс, поэтому модуль должен быть явно обозначен как `derived_country_aggregation`. Codex должен реализовать либо официально разрешённый ingestion, либо ручной импорт официального QS export with checksum. Нельзя выдумывать университеты, позиции или country aggregation. Страновая агрегация должна быть прозрачной: например, сумма weighted score университетов страны, число университетов в top N, медианная позиция, best university rank.

### 8.7. HTEI

Источники: ILOSTAT, OECD SDMX, World Bank, Eurostat, UNESCO UIS, national statistics and, where legally available, vacancy/public employment sources. HTEI должен быть полностью воспроизводимым из компонентов.

## 9. Формулы и методология

Каждый индекс должен иметь карточку формулы. Если официальный индекс не раскрывает полностью формулу или weights, платформа должна честно показывать официально доступную методологию и обозначать недоступные части. Нельзя показывать реконструкцию как официальный расчёт.

Для HTEI требуется полный воспроизводимый расчёт:

`HTEI = Σ normalized_component_i × weight_i × quality_adjustment_i`

Рекомендуемые блоки HTEI:

- high-tech employment share;
- STEM/high-tech occupations;
- R&D personnel;
- STEM education pipeline;
- high-tech exports or outputs;
- legally available high-tech vacancies/demand pressure.

Weights должны быть версионированы. В UI должна быть страница methodology with weight set, normalization, imputation and sensitivity notes.

## 10. Диагностика и рекомендации

Для каждой страны и индекса рассчитать:

- `gap_to_frontier`;
- `gap_to_peer_group`;
- `weighted_gap`;
- `rank_leverage`;
- `actionability`;
- `priority_score`;
- `weakest_component`;
- `highest_leverage_component`.

Формула диагностического приоритета:

`priority_score = gap_to_frontier × rank_leverage × actionability × data_quality`

UI должен объяснять: “почему этот компонент выбран как приоритетный”.

## 11. Backend/API требования

Backend должен предоставлять:

- `/api/health`;
- `/api/i18n/catalog?lang=ru|en`;
- `/api/countries`;
- `/api/country/{iso3}/profile?year=`;
- `/api/indices`;
- `/api/index/{index_id}/ranking?year=`;
- `/api/index/{index_id}/components?iso3=&year=`;
- `/api/index/{index_id}/formula`;
- `/api/provenance/value/{value_id}`;
- `/api/source-registry`;
- `/api/diagnostics/{iso3}?year=`;
- `/api/refresh/{source_id}` only for admin/CLI mode;
- `/api/export/country/{iso3}/brief?lang=ru|en`.

## 12. Database schema requirements

Minimum production schema:

- `countries`;
- `index_definitions`;
- `index_aliases`;
- `index_formulas`;
- `index_components`;
- `component_values`;
- `index_scores`;
- `rankings`;
- `source_registry`;
- `raw_snapshots`;
- `transformation_runs`;
- `diagnostics`;
- `recommendations`;
- `quality_flags`;
- `ui_translations`.

## 13. Frontend requirements

The frontend must preserve premium design quality:

- dark and light themes;
- automatic theme detection through `prefers-color-scheme`;
- manual theme switch;
- RU/EN language modes;
- automatic locale detection;
- flags for countries;
- world map;
- animated but restrained transitions;
- scorecards;
- country profile dashboard;
- formula viewer;
- component tree viewer;
- source/provenance drawer;
- trend lines;
- radar chart;
- stacked decomposition;
- ranking table;
- gap-to-frontier charts;
- mobile version.

## 14. RU/EN localization

Russian primary labels:

- HDI → ИЧР / Индекс человеческого развития;
- HCI → Индекс человеческого капитала;
- GTCI → Индекс глобальной конкурентоспособности талантов;
- GII → Глобальный инновационный индекс;
- IDI → Индекс развития ИКТ;
- QS E&T → QS: инженерия и технологии;
- HTEI → Индекс занятости в высокотехнологичных отраслях.

In RU mode, English acronyms may appear only as secondary aliases in tooltips or small metadata. Main nav, titles, charts, tables and explanations must be in Russian.

## 15. PlaywrightQA requirements

Playwright must test:

- desktop dark RU;
- desktop light RU;
- desktop dark EN;
- desktop light EN;
- tablet RU/EN;
- mobile RU/EN;
- navigation across all index tabs;
- country selection;
- map rendering;
- flag rendering;
- formula panels;
- source provenance drawer;
- no placeholder text;
- no English primary labels in RU mode;
- no Russian labels in EN mode;
- visual screenshots;
- accessibility basics;
- API data contracts;
- offline failure mode for unavailable API;
- refresh logs and raw snapshot creation.

## 16. Acceptance criteria

Release is accepted only if:

1. Every index has real data ingestion or official-file ingestion path.
2. Every displayed score has provenance.
3. Every component chart links to source data.
4. HTEI is recomputed from real components.
5. No generated country data appears in production DB.
6. RU and EN interfaces pass localization tests.
7. Light and dark themes pass visual tests.
8. Mobile layout passes Playwright tests.
9. Formula pages are present for all indices.
10. `docs/RELEASE_EVIDENCE.md` contains logs, screenshots, source table, data limitations, and passed test outputs.

## 17. Codex autonomy requirement

Codex must not stop merely because a data source is inconvenient. It must do one of the following:

- implement API connector;
- implement official download connector;
- implement legal browser/file ingestion;
- document precise manual official-file import workflow;
- add tests and provenance for that workflow.

Only legal and reproducible pathways are allowed. Missing source access is a blocker, not a reason to synthesize data.
