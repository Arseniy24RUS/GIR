# Научно-методический аудит GIIP final-release-v6

Сформировано: `2026-07-11T14:40:36+00:00`.

## Статус HTEI

HTEI является авторским формативным составным показателем проекта. Весовая схема считается закреплённой утверждённым отчётом по НИР. Дополнительное повторное утверждение весов и обязательный новый раунд двух внешних рецензий не являются release blockers; валидаторы проверяют вычислительную воспроизводимость, согласованность формул, missingness и внутреннюю устойчивость.

## Режимы публикации

| Режим | Профили | Eligible | С рангом | Среднее доверие | Среднее компонентов | Средний лаг | Годы | Конфигурации |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| asof_diagnostic | 203 | 0 | 0 | 0.713 | 4.36 | 3.75 | 2011–2026 | 25 |
| common_support | 89 | 89 | 89 | 0.747 | 4.0 | 1.81 | 2021–2026 | 1 |
| direct_core | 34 | 34 | 34 | 0.755 | 4.0 | 1.53 | 2022–2025 | 1 |
| proxy_extended | 105 | 105 | 105 | 0.837 | 5.07 | 2.16 | 2018–2026 | 7 |

## Покрытие компонентов

| Компонент | Наблюдения | Страны | Годы | Группы источников |
| --- | --- | --- | --- | --- |
| CORPORATE_STRATEGY_AND_DEMAND | 89 | 47 | 2017–2025 | OECD |
| HIGH_TECH_OCCUPATIONS | 407 | 183 | 2011–2026 | ILOSTAT,EUROSTAT |
| HT_EMPLOYMENT_SHARE | 408 | 181 | 2011–2026 | ILOSTAT,EUROSTAT |
| RND_PERSONNEL | 208 | 132 | 2012–2024 | WORLD_BANK,EUROSTAT,OECD |
| STEM_PIPELINE | 377 | 150 | 2011–2025 | UNESCO_UIS |
| TECH_OUTPUTS | 420 | 192 | 2012–2025 | WORLD_BANK |

## Конфигурации компонентов и missingness

| Режим | Подпись компонентов | Страны | Средний score | Средний ранг |
| --- | --- | --- | --- | --- |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+RND_PERSONNEL+STEM_PIPELINE+TECH_OUTPUTS | 61 | 27.328 | 0 |
| asof_diagnostic | CORPORATE_STRATEGY_AND_DEMAND+HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+RND_PERSONNEL+STEM_PIPELINE+TECH_OUTPUTS | 39 | 55.925 | 0 |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+TECH_OUTPUTS | 23 | 22.141 | 0 |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+STEM_PIPELINE+TECH_OUTPUTS | 22 | 26.614 | 0 |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+RND_PERSONNEL+TECH_OUTPUTS | 13 | 11.003 | 0 |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE | 6 | 48.351 | 0 |
| asof_diagnostic | STEM_PIPELINE+TECH_OUTPUTS | 5 | 30.394 | 0 |
| asof_diagnostic | RND_PERSONNEL+STEM_PIPELINE+TECH_OUTPUTS | 3 | 23.696 | 0 |
| asof_diagnostic | HT_EMPLOYMENT_SHARE+TECH_OUTPUTS | 3 | 11.234 | 0 |
| asof_diagnostic | HT_EMPLOYMENT_SHARE+STEM_PIPELINE+TECH_OUTPUTS | 3 | 49.212 | 0 |
| asof_diagnostic | HT_EMPLOYMENT_SHARE+RND_PERSONNEL+STEM_PIPELINE+TECH_OUTPUTS | 3 | 28.623 | 0 |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+STEM_PIPELINE+TECH_OUTPUTS | 3 | 41.773 | 0 |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+RND_PERSONNEL+TECH_OUTPUTS | 3 | 35.038 | 0 |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+TECH_OUTPUTS | 2 | 29.64 | 0 |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+RND_PERSONNEL+STEM_PIPELINE+TECH_OUTPUTS | 2 | 27.269 | 0 |
| asof_diagnostic | CORPORATE_STRATEGY_AND_DEMAND+HIGH_TECH_OCCUPATIONS+RND_PERSONNEL+STEM_PIPELINE+TECH_OUTPUTS | 2 | 45.361 | 0 |
| asof_diagnostic | CORPORATE_STRATEGY_AND_DEMAND+HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+STEM_PIPELINE+TECH_OUTPUTS | 2 | 77.531 | 0 |
| asof_diagnostic | HT_EMPLOYMENT_SHARE+RND_PERSONNEL+STEM_PIPELINE | 1 | 93.669 | 0 |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+RND_PERSONNEL+STEM_PIPELINE | 1 | 38.495 | 0 |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+STEM_PIPELINE | 1 | 31.005 | 0 |
| asof_diagnostic | HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+RND_PERSONNEL+STEM_PIPELINE | 1 | 8.15 | 0 |
| asof_diagnostic | CORPORATE_STRATEGY_AND_DEMAND+RND_PERSONNEL+TECH_OUTPUTS | 1 | 64.875 | 0 |
| asof_diagnostic | CORPORATE_STRATEGY_AND_DEMAND+HT_EMPLOYMENT_SHARE+RND_PERSONNEL+STEM_PIPELINE+TECH_OUTPUTS | 1 | 58.032 | 0 |
| asof_diagnostic | CORPORATE_STRATEGY_AND_DEMAND+HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+RND_PERSONNEL+TECH_OUTPUTS | 1 | 54.499 | 0 |
| asof_diagnostic | CORPORATE_STRATEGY_AND_DEMAND+HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE | 1 | 69.234 | 0 |
| common_support | HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+STEM_PIPELINE+TECH_OUTPUTS | 89 | 45.243 | 45.0 |
| direct_core | HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+STEM_PIPELINE+TECH_OUTPUTS | 34 | 56.763 | 17.5 |
| proxy_extended | CORPORATE_STRATEGY_AND_DEMAND+HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+RND_PERSONNEL+STEM_PIPELINE+TECH_OUTPUTS | 36 | 57.007 | 25.361 |
| proxy_extended | HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+RND_PERSONNEL+STEM_PIPELINE+TECH_OUTPUTS | 34 | 33.319 | 64.0 |
| proxy_extended | HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+STEM_PIPELINE+TECH_OUTPUTS | 25 | 23.051 | 82.76 |
| proxy_extended | HT_EMPLOYMENT_SHARE+RND_PERSONNEL+STEM_PIPELINE+TECH_OUTPUTS | 4 | 35.094 | 58.0 |
| proxy_extended | CORPORATE_STRATEGY_AND_DEMAND+HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+STEM_PIPELINE+TECH_OUTPUTS | 4 | 66.616 | 19.25 |
| proxy_extended | CORPORATE_STRATEGY_AND_DEMAND+HIGH_TECH_OCCUPATIONS+RND_PERSONNEL+STEM_PIPELINE+TECH_OUTPUTS | 1 | 28.271 | 72.0 |
| proxy_extended | CORPORATE_STRATEGY_AND_DEMAND+HIGH_TECH_OCCUPATIONS+HT_EMPLOYMENT_SHARE+RND_PERSONNEL+TECH_OUTPUTS | 1 | 54.499 | 26.0 |

## Полнота профилей

| Режим | Доступно компонентов | Страны |
| --- | --- | --- |
| asof_diagnostic | 2 | 16 |
| asof_diagnostic | 3 | 40 |
| asof_diagnostic | 4 | 41 |
| asof_diagnostic | 5 | 67 |
| asof_diagnostic | 6 | 39 |
| common_support | 4 | 89 |
| direct_core | 4 | 34 |
| proxy_extended | 4 | 29 |
| proxy_extended | 5 | 40 |
| proxy_extended | 6 | 36 |

## Чувствительность HTEI

| Показатель | Значение |
| --- | --- |
| Страны baseline | 89 |
| Прогоны | 206 |
| Mean Spearman | 0.996860610027404 |
| Min Spearman | 0.9347293156281921 |
| Mean absolute rank change | 1.1300316352132649 |
| Max rank change | 33 |
| Passed | 1 |

## Чувствительность модели подготовки кадров

| Показатель | Значение |
| --- | --- |
| Страны | 117 |
| Прогоны | 200 |
| Mean Spearman | 0.9987472837896567 |
| Min Spearman | 0.9969953093857243 |
| Mean absolute rank change | 1.1256410256410256 |
| Max rank change | 13 |
| Passed | 1 |

## HCI+ 2026

Загружено официальных страновых значений: `158`; диапазон score: `80.0–284.0`. До онлайн-загрузки слой остаётся pending и блокирует окончательный release gate.

## Обязательные ограничения интерпретации

- ASOF diagnostic не является синхронным международным рейтингом и не получает место.
- Common Support использует фиксированный набор компонентов и является основным международно сопоставимым рейтингом.
- Direct Core отделяет наиболее строгий слой прямых high-tech/HRST и национальных данных.
- Proxy Extended предназначен для расширенного policy benchmarking и раскрывает использование широких прокси.
- Confidence не умножается на содержательный score.
- Фактические годы, source group, proxy status и интервалы неопределённости показываются пользователю.
- HCI 2010–2020 и HCI+ 2026 являются разными официальными редакциями и не образуют непрерывного официального временного ряда.
