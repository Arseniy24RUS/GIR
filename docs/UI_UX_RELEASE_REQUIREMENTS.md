# UI/UX release requirements

## Принцип

Сохранить премиальную GIR-визуальную систему: RU/EN, light/dark, карты, флаги, анимации и аналитическую насыщенность. Интерфейс должен быть удобным decision-intelligence продуктом, а не длинной академической таблицей.

## Обязательные страницы

1. Country Command Center.
2. Cross-index Matrix.
3. Семь индексных модулей.
4. HTEI scientific v5 с тремя режимами.
5. Модель оценки конкурентоспособности национальных систем подготовки кадров.
6. Практические рекомендации для России.
7. Методология и источники.
8. Качество данных и provenance.
9. «ТЗ МГИМО / Приёмка» с четырьмя точными результатами.
10. Release readiness и governance.

## HTEI UI

- `Comparable Core`: основной сопоставимый рейтинг;
- `Comparable Extended`: отдельно маркированное расширенное пространство;
- `ASOF Diagnostic`: без rank/percentile/medal, с заметным предупреждением;
- показывать substantive score, confidence, coverage, freshness, source years, proxy status и uncertainty отдельно;
- таблицы более 50 строк — pagination/virtualization, sticky header, поиск и фильтры.

## Themes and language

- Auto follows browser/device settings;
- manual RU/EN and Light/Dark override is persistent;
- RU uses Russian primary index names and exact ToR wording;
- no font below 12 px on mobile;
- long navigation collapses or scrolls without truncating meaning.

## Accessibility and evidence

- WCAG A/AA critical issues = 0;
- keyboard-accessible maps/charts and tabular alternative;
- every numeric visualization exposes actual year, unit, source, URL, checksum, transform and value status;
- full Playwright matrix: four desktop theme/language combinations, two tablet, two mobile;
- visual baselines updated only after human review of diffs.
